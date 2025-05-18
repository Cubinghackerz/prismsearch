
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

export type ChatModel = 'mistral' | 'groq' | 'gemini';

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  parentMessageId?: string; // For thread replies
}

interface ModelUsage {
  mistral: number | null;
  groq: number | null;
  gemini: number | null; // null means unlimited
}

interface ChatContextType {
  chatId: string | null;
  messages: ChatMessage[];
  modelUsage: ModelUsage;
  selectedModel: ChatModel;
  isLoading: boolean;
  isTyping: boolean;
  sendMessage: (content: string, parentMessageId?: string) => Promise<void>;
  startNewChat: () => void;
  selectModel: (model: ChatModel) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const DAILY_LIMITS = {
  mistral: null, // Unlimited
  groq: null, // Unlimited
  gemini: null, // Unlimited
};

const USAGE_KEY = 'prism_search_ai_usage';
const LAST_USAGE_DATE_KEY = 'prism_search_last_usage_date';

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ChatModel>('mistral');
  const [modelUsage, setModelUsage] = useState<ModelUsage>({
    mistral: DAILY_LIMITS.mistral,
    groq: DAILY_LIMITS.groq,
    gemini: DAILY_LIMITS.gemini,
  });
  const { toast } = useToast();

  // Load and initialize usage data
  useEffect(() => {
    const loadUsageData = () => {
      const today = new Date().toDateString();
      const lastUsageDate = localStorage.getItem(LAST_USAGE_DATE_KEY);
      
      // Reset usage if it's a new day
      if (lastUsageDate !== today) {
        localStorage.setItem(LAST_USAGE_DATE_KEY, today);
        const resetUsage: ModelUsage = {
          mistral: DAILY_LIMITS.mistral,
          groq: DAILY_LIMITS.groq,
          gemini: DAILY_LIMITS.gemini,
        };
        localStorage.setItem(USAGE_KEY, JSON.stringify(resetUsage));
        setModelUsage(resetUsage);
        return;
      }
      
      // Load existing usage data
      const savedUsage = localStorage.getItem(USAGE_KEY);
      if (savedUsage) {
        setModelUsage(JSON.parse(savedUsage));
      }
    };
    
    loadUsageData();
  }, [toast]);

  // Load chat messages from Supabase on initial load
  useEffect(() => {
    const loadMessages = async (currentChatId: string) => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('chat_id', currentChatId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error loading messages:', error);
          return;
        }

        if (data && data.length > 0) {
          const loadedMessages: ChatMessage[] = data.map(msg => ({
            id: msg.id,
            content: msg.content,
            isUser: msg.is_user,
            timestamp: new Date(msg.created_at),
            parentMessageId: msg.parent_message_id || undefined,
          }));
          
          setMessages(loadedMessages);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    if (chatId) {
      loadMessages(chatId);
    }
  }, [chatId]);
  
  // Start a new chat
  const startNewChat = () => {
    const newChatId = uuidv4();
    setChatId(newChatId);
    setMessages([]);
    toast({
      title: "New Chat Started",
      description: "You've started a new conversation.",
      duration: 2000,
    });
  };
  
  // Select a model
  const selectModel = (model: ChatModel) => {
    setSelectedModel(model);
    toast({
      title: `Model Changed: ${getModelDisplayName(model)}`,
      description: "Your messages will now be processed by this AI model.",
      duration: 2000,
    });
  };

  // Helper function to get display name for models
  const getModelDisplayName = (model: ChatModel): string => {
    const displayNames = {
      mistral: "Mistral Medium",
      groq: "Llama-3-70B (Groq)",
      gemini: "Gemini 2.5 Flash",
    };
    return displayNames[model] || model;
  };
  
  // Handle errors in the chat flow
  const handleChatError = (errorMessage: string) => {
    const errorResponse: ChatMessage = {
      id: uuidv4(),
      content: errorMessage,
      isUser: false,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, errorResponse]);
    toast({
      variant: "destructive",
      title: "Chat Error",
      description: "There was a problem connecting to the AI model. Please try again.",
      duration: 3000,
    });
  };

  // Save message to Supabase
  const saveMessageToSupabase = async (message: ChatMessage, currentChatId: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          id: message.id,
          chat_id: currentChatId,
          content: message.content,
          is_user: message.isUser,
          parent_message_id: message.parentMessageId,
          created_at: message.timestamp.toISOString(),
          model: selectedModel,
        });

      if (error) {
        console.error('Error saving message to Supabase:', error);
      }
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  };

  // Send a message to the AI
  const sendMessage = async (content: string, parentMessageId?: string) => {
    if (!content.trim()) return;
    
    // Initialize chat if needed
    const currentChatId = chatId || uuidv4();
    if (!chatId) {
      setChatId(currentChatId);
    }
    
    // Create a new message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      content,
      isUser: true,
      timestamp: new Date(),
      parentMessageId,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);

    // Save user message to Supabase
    await saveMessageToSupabase(userMessage, currentChatId);

    try {
      // Call the AI function
      const { data, error } = await supabase.functions.invoke('ai-search-assistant', {
        body: { 
          query: content,
          chatId: currentChatId,
          chatHistory: messages,
          model: selectedModel
        }
      });

      if (error) {
        console.error("Supabase function error:", error);
        handleChatError("Sorry, I encountered an error while trying to respond. Please try again.");
        return;
      }
      
      // Add AI response to messages
      if (data && data.response) {
        const aiMessage: ChatMessage = {
          id: uuidv4(),
          content: data.response,
          isUser: false,
          timestamp: new Date(),
          parentMessageId: userMessage.id, // This makes it a direct reply to the user's message
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        // Save AI message to Supabase
        await saveMessageToSupabase(aiMessage, currentChatId);
      } else {
        handleChatError("Received an empty response from the AI. Please try again.");
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      handleChatError("Sorry, I encountered an error while trying to respond. Please try again.");
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  return (
    <ChatContext.Provider value={{
      chatId,
      messages,
      modelUsage,
      selectedModel,
      isLoading,
      isTyping,
      sendMessage,
      startNewChat,
      selectModel,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
