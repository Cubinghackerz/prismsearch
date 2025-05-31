
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

export type ChatModel = 'mistral' | 'groq' | 'gemini' | 'azure-gpt4-nano' | 'azure-o4-mini' | 'groq-qwen-qwq' | 'groq-llama4-scout' | 'mistral-medium-3';

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
  'azure-gpt4-nano': number | null;
  'azure-o4-mini': number | null;
  'groq-qwen-qwq': number | null;
  'groq-llama4-scout': number | null;
  'mistral-medium-3': number | null;
}

interface ChatContextType {
  chatId: string | null;
  messages: ChatMessage[];
  modelUsage: ModelUsage;
  selectedModel: ChatModel;
  deepResearchMode: boolean;
  isLoading: boolean;
  isTyping: boolean;
  sendMessage: (content: string, parentMessageId?: string) => Promise<void>;
  startNewChat: () => void;
  selectModel: (model: ChatModel) => void;
  setDeepResearchMode: (enabled: boolean) => void;
  loadChatById: (chatId: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const DAILY_LIMITS = {
  mistral: null, // Unlimited
  groq: null, // Unlimited
  gemini: null, // Unlimited
  'azure-gpt4-nano': null, // Unlimited
  'azure-o4-mini': null, // Unlimited
  'groq-qwen-qwq': null, // Unlimited
  'groq-llama4-scout': null, // Unlimited
  'mistral-medium-3': null, // Unlimited
};

const USAGE_KEY = 'prism_search_ai_usage';
const LAST_USAGE_DATE_KEY = 'prism_search_last_usage_date';

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [deepResearchMode, setDeepResearchMode] = useState(false);
  // Set mistral as default model and ensure Azure models aren't used
  const [selectedModel, setSelectedModel] = useState<ChatModel>('mistral');
  const [modelUsage, setModelUsage] = useState<ModelUsage>({
    mistral: DAILY_LIMITS.mistral,
    groq: DAILY_LIMITS.groq,
    gemini: DAILY_LIMITS.gemini,
    'azure-gpt4-nano': DAILY_LIMITS['azure-gpt4-nano'],
    'azure-o4-mini': DAILY_LIMITS['azure-o4-mini'],
    'groq-qwen-qwq': DAILY_LIMITS['groq-qwen-qwq'],
    'groq-llama4-scout': DAILY_LIMITS['groq-llama4-scout'],
    'mistral-medium-3': DAILY_LIMITS['mistral-medium-3'],
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
          'azure-gpt4-nano': DAILY_LIMITS['azure-gpt4-nano'],
          'azure-o4-mini': DAILY_LIMITS['azure-o4-mini'],
          'groq-qwen-qwq': DAILY_LIMITS['groq-qwen-qwq'],
          'groq-llama4-scout': DAILY_LIMITS['groq-llama4-scout'],
          'mistral-medium-3': DAILY_LIMITS['mistral-medium-3'],
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

  // Start a new chat automatically if none exists
  useEffect(() => {
    if (!chatId) {
      startNewChat();
    }
  }, []);
  
  // Load a specific chat by ID (simplified since no persistence)
  const loadChatById = async (id: string) => {
    toast({
      title: "Chat Loading",
      description: "Since messages are temporary, starting a new chat instead.",
      duration: 2000,
    });
    startNewChat();
  };
  
  // Start a new chat
  const startNewChat = () => {
    const newChatId = uuidv4();
    setChatId(newChatId);
    setMessages([]);
    setDeepResearchMode(false); // Reset deep research mode for new chats
    toast({
      title: "New Chat Started",
      description: "You've started a new conversation. Messages are temporary.",
      duration: 2000,
    });
  };
  
  // Select a model
  const selectModel = (model: ChatModel) => {
    setSelectedModel(model);
    // Reset deep research mode when switching models
    if (model !== 'gemini') {
      setDeepResearchMode(false);
    }
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
      'azure-gpt4-nano': "GPT-4.1 Nano (Azure)",
      'azure-o4-mini': "O4 Mini (Azure)",
      'groq-qwen-qwq': "Qwen-QwQ (Groq)",
      'groq-llama4-scout': "Llama 4 Scout (Groq)",
      'mistral-medium-3': "Mistral Large (24.11)",
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

  // Delete a chat (simplified since no persistence)
  const deleteChat = async (id: string): Promise<void> => {
    startNewChat();
    toast({
      title: "Chat Cleared",
      description: "Started a new temporary chat.",
      duration: 2000,
    });
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

    try {
      let aiResponse: string;

      // Automatically append deep research instruction when deep research mode is enabled
      let queryToSend = content;
      if (selectedModel === 'gemini' && deepResearchMode) {
        queryToSend = content + " Conduct Deep Research for at least 30 seconds.";
      }

      // Use the edge function for all models, including deep research mode
      const { data, error } = await supabase.functions.invoke('ai-search-assistant', {
        body: { 
          query: queryToSend,
          chatId: currentChatId,
          chatHistory: messages,
          model: selectedModel,
          deepResearch: selectedModel === 'gemini' && deepResearchMode
        }
      });

      if (error) {
        console.error("Supabase function error:", error);
        handleChatError("Sorry, I encountered an error while trying to respond. Please try again.");
        return;
      }
      
      aiResponse = data.response;
      
      // Add AI response to messages
      if (aiResponse) {
        const aiMessage: ChatMessage = {
          id: uuidv4(),
          content: aiResponse,
          isUser: false,
          timestamp: new Date(),
          parentMessageId: userMessage.id, // This makes it a direct reply to the user's message
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        // Show success toast for deep research
        if (selectedModel === 'gemini' && deepResearchMode) {
          toast({
            title: "Deep Research Complete",
            description: "Comprehensive research report generated successfully.",
            duration: 3000,
          });
        }
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
      deepResearchMode,
      isLoading,
      isTyping,
      sendMessage,
      startNewChat,
      selectModel,
      setDeepResearchMode,
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
