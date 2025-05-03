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
  sendMessage: (content: string) => Promise<void>;
  startNewChat: () => void;
  selectModel: (model: ChatModel) => void;
  loadChat: (id: string) => void;
  deleteChat: (id: string) => void;
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
  }, []);
  
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

  // Load a saved chat
  const loadChat = (id: string) => {
    try {
      // Get all saved chats
      const savedChatsData = localStorage.getItem('prism_saved_chats');
      if (!savedChatsData) {
        toast({
          variant: "destructive", 
          title: "Error",
          description: "No saved chats found.",
          duration: 3000,
        });
        return;
      }
      
      const savedChats = JSON.parse(savedChatsData);
      const chat = savedChats.find((c: any) => c.id === id);
      
      if (!chat) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Chat not found.",
          duration: 3000,
        });
        return;
      }
      
      // Get chat messages from localStorage
      const chatMessagesData = localStorage.getItem(`prism_chat_${id}`);
      if (!chatMessagesData) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Chat messages not found.",
          duration: 3000,
        });
        return;
      }
      
      const chatMessages = JSON.parse(chatMessagesData);
      
      // Restore messages and chat ID
      setChatId(id);
      setMessages(chatMessages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })));
      
      toast({
        title: "Chat Loaded",
        description: "Previous conversation has been restored.",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error loading chat:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load chat.",
        duration: 3000,
      });
    }
  };
  
  // Delete a saved chat
  const deleteChat = (id: string) => {
    try {
      // Get all saved chats
      const savedChatsData = localStorage.getItem('prism_saved_chats');
      if (!savedChatsData) return;
      
      const savedChats = JSON.parse(savedChatsData);
      
      // Filter out the chat to delete
      const updatedChats = savedChats.filter((chat: any) => chat.id !== id);
      
      // Update localStorage
      localStorage.setItem('prism_saved_chats', JSON.stringify(updatedChats));
      
      // Remove chat messages
      localStorage.removeItem(`prism_chat_${id}`);
      
      // If current chat was deleted, start a new one
      if (chatId === id) {
        startNewChat();
      }
      
      toast({
        title: "Chat Deleted",
        description: "The conversation has been removed.",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete chat.",
        duration: 3000,
      });
    }
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

  // Send a message to the AI
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // Create a new message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      content,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Initialize chat if needed
      const currentChatId = chatId || uuidv4();
      if (!chatId) {
        setChatId(currentChatId);
      }
      
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
        };
        
        const updatedMessages = [...messages, userMessage, aiMessage];
        setMessages(updatedMessages);
        
        // Save chat to localStorage
        if (currentChatId) {
          localStorage.setItem(`prism_chat_${currentChatId}`, JSON.stringify(updatedMessages));
        }
      } else {
        handleChatError("Received an empty response from the AI. Please try again.");
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      handleChatError("Sorry, I encountered an error while trying to respond. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear messages when component unmounts to make chats temporary
  useEffect(() => {
    return () => {
      setMessages([]);
      setChatId(null);
    };
  }, []);

  return (
    <ChatContext.Provider value={{
      chatId,
      messages,
      modelUsage,
      selectedModel,
      isLoading,
      sendMessage,
      startNewChat,
      selectModel,
      loadChat,
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
