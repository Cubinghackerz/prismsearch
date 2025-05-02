
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

export type ChatModel = 'gpt' | 'nano' | 'gemini';

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ModelUsage {
  gpt: number;
  nano: number | null;
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
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const DAILY_LIMITS = {
  gpt: 10,
  nano: null, // Unlimited
  gemini: null, // Unlimited
};

const USAGE_KEY = 'prism_search_ai_usage';
const LAST_USAGE_DATE_KEY = 'prism_search_last_usage_date';

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ChatModel>('nano');
  const [modelUsage, setModelUsage] = useState<ModelUsage>({
    gpt: DAILY_LIMITS.gpt || 0,
    nano: DAILY_LIMITS.nano,
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
          gpt: DAILY_LIMITS.gpt || 0,
          nano: DAILY_LIMITS.nano,
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

  // Helper function to get display name for models
  const getModelDisplayName = (model: ChatModel): string => {
    const displayNames = {
      nano: "Gemini 2.5 Flash Preview",
      gpt: "Gemini 2.5 Flash Preview",
      gemini: "Gemini",
    };
    return displayNames[model] || model;
  };

  // Update usage for a model
  const updateModelUsage = (model: ChatModel, remaining: number | null) => {
    if (remaining === null) return; // Skip for unlimited models
    
    setModelUsage(prev => {
      const updated = { ...prev, [model]: remaining };
      localStorage.setItem(USAGE_KEY, JSON.stringify(updated));
      return updated;
    });
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
    
    // Don't allow sending if we've reached the limit for paid models
    if (selectedModel === 'gpt' && modelUsage.gpt <= 0) {
      toast({
        variant: "destructive",
        title: "Usage Limit Reached",
        description: `You've reached your daily limit for ${getModelDisplayName(selectedModel)}.`,
        duration: 3000,
      });
      return;
    }
    
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
      
      // Special case for Gemini which is handled locally
      if (selectedModel === 'gemini') {
        // Simulate response for Gemini model
        const responseContent = await simulateGeminiResponse(content);
        
        const aiResponse: ChatMessage = {
          id: uuidv4(),
          content: responseContent,
          isUser: false,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, aiResponse]);
        setIsLoading(false);
        return;
      }
      
      // Call the AI function for all other models (GPT and Nano)
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
        handleChatError("Sorry, I encountered an error while trying to respond. Please try again or select a different AI model.");
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
        
        setMessages(prev => [...prev, aiMessage]);
        
        // Update usage if available
        if (data.usageRemaining !== undefined) {
          updateModelUsage(selectedModel, data.usageRemaining);
        }
      } else {
        handleChatError("Received an empty response from the AI. Please try again.");
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      handleChatError("Sorry, I encountered an error while trying to respond. Please try again or select a different AI model.");
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate Gemini response for local handling
  const simulateGeminiResponse = (query: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const response = `I'm Gemini, Google's advanced AI model. You asked about "${query}". ${
          query.toLowerCase().includes("what") || query.toLowerCase().includes("how")
            ? "That's an interesting question. Based on my training data, I can offer several perspectives on this topic."
            : "I'd be happy to discuss this further and provide more detailed information if you'd like."
        }`;
        
        resolve(response);
      }, 800 + Math.random() * 400); // Simulate network delay between 800-1200ms
    });
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
