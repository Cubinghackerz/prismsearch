
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

export type ChatModel = 'claude' | 'gpt' | 'gemini';

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ModelUsage {
  claude: number;
  gpt: number;
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
  claude: 10,
  gpt: 10,
  gemini: null, // Unlimited
};

const USAGE_KEY = 'prism_search_ai_usage';
const LAST_USAGE_DATE_KEY = 'prism_search_last_usage_date';

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ChatModel>('claude');
  const [modelUsage, setModelUsage] = useState<ModelUsage>({
    claude: DAILY_LIMITS.claude || 0,
    gpt: DAILY_LIMITS.gpt || 0,
    gemini: DAILY_LIMITS.gemini,
  });

  // Load and initialize usage data
  useEffect(() => {
    const loadUsageData = () => {
      const today = new Date().toDateString();
      const lastUsageDate = localStorage.getItem(LAST_USAGE_DATE_KEY);
      
      // Reset usage if it's a new day
      if (lastUsageDate !== today) {
        localStorage.setItem(LAST_USAGE_DATE_KEY, today);
        const resetUsage: ModelUsage = {
          claude: DAILY_LIMITS.claude || 0,
          gpt: DAILY_LIMITS.gpt || 0,
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
  };
  
  // Select a model
  const selectModel = (model: ChatModel) => {
    setSelectedModel(model);
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
  
  // Send a message to the AI
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // Don't allow sending if we've reached the limit for paid models
    if (
      (selectedModel === 'claude' && modelUsage.claude <= 0) || 
      (selectedModel === 'gpt' && modelUsage.gpt <= 0)
    ) {
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
      if (!chatId) {
        startNewChat();
      }
      
      const currentChatId = chatId || uuidv4();
      
      // Call the AI function
      const { data, error } = await supabase.functions.invoke('ai-search-assistant', {
        body: { 
          query: content,
          chatId: currentChatId,
          chatHistory: messages,
          model: selectedModel
        }
      });

      if (error) throw error;
      
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
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
