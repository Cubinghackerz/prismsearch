import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Message, generateTextWithAzureOpenAI } from '@/services/azureOpenAiService';

export type ChatModel = 'mistral' | 'groq' | 'gemini' | 'azure-o4-mini' | 'groq-qwen-qwq' | 'groq-llama4-scout';

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
  gemini: number | null;
  'azure-o4-mini': number | null;
  'groq-qwen-qwq': number | null;
  'groq-llama4-scout': number | null;
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
  loadChatById: (chatId: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const DAILY_LIMITS = {
  mistral: null, // Unlimited
  groq: null, // Unlimited
  gemini: null, // Unlimited
  'azure-o4-mini': null, // Unlimited
  'groq-qwen-qwq': null, // Unlimited
  'groq-llama4-scout': null, // Unlimited
};

const USAGE_KEY = 'prism_search_ai_usage';
const LAST_USAGE_DATE_KEY = 'prism_search_last_usage_date';

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  // Set mistral as default model and ensure Azure models aren't used
  const [selectedModel, setSelectedModel] = useState<ChatModel>('mistral');
  const [modelUsage, setModelUsage] = useState<ModelUsage>({
    mistral: DAILY_LIMITS.mistral,
    groq: DAILY_LIMITS.groq,
    gemini: DAILY_LIMITS.gemini,
    'azure-o4-mini': DAILY_LIMITS['azure-o4-mini'],
    'groq-qwen-qwq': DAILY_LIMITS['groq-qwen-qwq'],
    'groq-llama4-scout': DAILY_LIMITS['groq-llama4-scout'],
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
          'azure-o4-mini': DAILY_LIMITS['azure-o4-mini'],
          'groq-qwen-qwq': DAILY_LIMITS['groq-qwen-qwq'],
          'groq-llama4-scout': DAILY_LIMITS['groq-llama4-scout'],
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

  // Load most recent chat if no chat is active
  useEffect(() => {
    const loadMostRecentChat = async () => {
      if (chatId) return; // Skip if we already have a chat loaded
      
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('chat_id, created_at')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error loading most recent chat:', error);
          return;
        }

        if (data && data.length > 0) {
          await loadChatById(data[0].chat_id);
        } else {
          // No chats found, start a new one
          startNewChat();
        }
      } catch (error) {
        console.error('Failed to load most recent chat:', error);
      }
    };

    loadMostRecentChat();
  }, []);

  // Load chat messages from Supabase when chatId changes
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
        } else {
          // No messages found for this chat ID, might be a deleted chat
          console.log('No messages found for this chat ID:', currentChatId);
          setMessages([]);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    if (chatId) {
      loadMessages(chatId);
    }
  }, [chatId]);
  
  // Load a specific chat by ID
  const loadChatById = async (id: string) => {
    try {
      // First check if this chat exists and has messages
      const { data: chatExists, error: checkError } = await supabase
        .from('chat_messages')
        .select('id')
        .eq('chat_id', id)
        .limit(1);

      if (checkError) {
        console.error('Error checking chat existence:', checkError);
        toast({
          variant: "destructive",
          title: "Failed to load chat",
          description: "There was an error checking if this chat exists.",
          duration: 3000,
        });
        return;
      }

      if (!chatExists || chatExists.length === 0) {
        // Chat doesn't exist, probably deleted
        toast({
          variant: "destructive",
          title: "Chat not found",
          description: "This chat may have been deleted or doesn't exist.",
          duration: 3000,
        });
        startNewChat();
        return;
      }

      setChatId(id);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading chat:', error);
        toast({
          variant: "destructive",
          title: "Failed to load chat",
          description: "There was an error loading the chat history.",
          duration: 3000,
        });
        return;
      }

      if (data) {
        const loadedMessages: ChatMessage[] = data.map(msg => ({
          id: msg.id,
          content: msg.content,
          isUser: msg.is_user,
          timestamp: new Date(msg.created_at),
          parentMessageId: msg.parent_message_id || undefined,
        }));
        
        setMessages(loadedMessages);
        
        // Update the selected model to match the one used in this chat
        // But if it's an Azure model, use mistral instead since Azure is temporarily disabled
        if (data.length > 0 && data[0].model) {
          const chatModel = data[0].model as ChatModel;
          if (chatModel === 'azure-gpt4-nano' || chatModel === 'azure-o4-mini') {
            setSelectedModel('mistral');
            toast({
              title: "Azure models temporarily disabled",
              description: "This chat was using an Azure model which is currently disabled. Using Mistral instead.",
              duration: 5000,
            });
          } else {
            setSelectedModel(chatModel);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
      toast({
        variant: "destructive",
        title: "Failed to load chat",
        description: "There was an error loading the chat history.",
        duration: 3000,
      });
    }
  };
  
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
      'azure-o4-mini': "O4 Mini (Azure)",
      'groq-qwen-qwq': "Qwen-QwQ (Groq)",
      'groq-llama4-scout': "Llama 4 Scout (Groq)",
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

  // Delete a chat and its messages
  const deleteChat = async (id: string): Promise<void> => {
    try {
      // Delete all messages for this chat from Supabase
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('chat_id', id);
        
      if (error) {
        console.error('Error deleting chat messages:', error);
        toast({
          variant: "destructive",
          title: "Failed to delete chat",
          description: "There was an error deleting the chat history.",
          duration: 3000,
        });
        return;
      }

      // If we're deleting the currently active chat, start a new chat
      if (chatId === id) {
        startNewChat();
      }

      toast({
        title: "Chat Deleted",
        description: "The chat history has been deleted.",
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to delete chat:', error);
      toast({
        variant: "destructive",
        title: "Failed to delete chat",
        description: "There was an error deleting the chat history.",
        duration: 3000,
      });
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
      let aiResponse: string;

      // Handle Azure OpenAI models
      if (selectedModel === 'azure-o4-mini') {
        const messages: Message[] = [
          { role: 'system', content: 'You are a helpful search assistant for PrismSearch.' },
          ...messages.map(msg => ({
            role: msg.isUser ? 'user' as const : 'assistant' as const,
            content: msg.content
          })),
          { role: 'user', content }
        ];

        aiResponse = await generateTextWithAzureOpenAI(messages, 'o4-mini');
      } else {
        // Use existing AI function for other models
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
        
        aiResponse = data.response;
      }
      
      // Add AI response to messages
      if (aiResponse) {
        const aiMessage: ChatMessage = {
          id: uuidv4(),
          content: aiResponse,
          isUser: false,
          timestamp: new Date(),
          parentMessageId: userMessage.id,
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
      loadChatById,
      deleteChat,
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
