import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import { Message, generateTextWithAzureOpenAI } from '@/services/azureOpenAiService';

export type ChatModel = 'mistral' | 'groq' | 'gemini' | 'azure-gpt4-nano' | 'azure-o4-mini' | 'groq-qwen-qwq' | 'groq-llama4-scout' | 'mistral-medium-3' | 'o4-mini';

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
  'o4-mini': number | null;
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
  getTempChats: () => { id: string; created_at: string; preview: string; }[];
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
  'o4-mini': null, // Unlimited
};

const USAGE_KEY = 'prism_search_ai_usage';
const LAST_USAGE_DATE_KEY = 'prism_search_last_usage_date';

// In-memory storage for temporary chats
interface TempChat {
  id: string;
  messages: ChatMessage[];
  model: ChatModel;
  createdAt: Date;
}

let tempChats: TempChat[] = [];

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  // Set mistral as default model
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
    'o4-mini': DAILY_LIMITS['o4-mini'],
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
          'o4-mini': DAILY_LIMITS['o4-mini'],
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

  // Initialize with a new chat
  useEffect(() => {
    if (!chatId) {
      startNewChat();
    }
  }, []);
  
  // Load a specific chat by ID from memory
  const loadChatById = async (id: string) => {
    try {
      const chat = tempChats.find(c => c.id === id);
      
      if (!chat) {
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
      setMessages(chat.messages);
      setSelectedModel(chat.model);
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
    
    // Create new temp chat
    const newChat: TempChat = {
      id: newChatId,
      messages: [],
      model: selectedModel,
      createdAt: new Date()
    };
    tempChats.unshift(newChat);
    
    // Keep only last 20 chats to prevent memory issues
    if (tempChats.length > 20) {
      tempChats = tempChats.slice(0, 20);
    }
    
    toast({
      title: "New Chat Started",
      description: "You've started a new conversation.",
      duration: 2000,
    });
  };
  
  // Select a model
  const selectModel = (model: ChatModel) => {
    setSelectedModel(model);
    
    // Update current chat's model
    if (chatId) {
      const chat = tempChats.find(c => c.id === chatId);
      if (chat) {
        chat.model = model;
      }
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
      'o4-mini': "O4 Mini",
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
    
    const newMessages = [...messages, errorResponse];
    setMessages(newMessages);
    
    // Update temp chat
    if (chatId) {
      const chat = tempChats.find(c => c.id === chatId);
      if (chat) {
        chat.messages = newMessages;
      }
    }
    
    toast({
      variant: "destructive",
      title: "Chat Error",
      description: "There was a problem connecting to the AI model. Please try again.",
      duration: 3000,
    });
  };

  // Delete a chat from memory
  const deleteChat = async (id: string): Promise<void> => {
    try {
      // Remove from temp chats
      tempChats = tempChats.filter(chat => chat.id !== id);

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
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);
    setIsTyping(true);

    // Update temp chat
    if (currentChatId) {
      let chat = tempChats.find(c => c.id === currentChatId);
      if (!chat) {
        chat = {
          id: currentChatId,
          messages: newMessages,
          model: selectedModel,
          createdAt: new Date()
        };
        tempChats.unshift(chat);
      } else {
        chat.messages = newMessages;
      }
    }

    try {
      let aiResponse: string;

      // Handle the new o4-mini model using Azure OpenAI
      if (selectedModel === 'o4-mini') {
        // Format messages for Azure OpenAI
        const azureMessages: Message[] = [
          { role: 'system', content: 'You are Prism, a helpful AI assistant. You provide clear, concise and accurate answers.' }
        ];
        
        // Add chat history
        if (messages && messages.length > 0) {
          const recentHistory = messages.slice(-10);
          for (const msg of recentHistory) {
            if (msg.content && msg.content.trim()) {
              const role = msg.isUser ? 'user' : 'assistant';
              azureMessages.push({
                role: role as 'user' | 'assistant',
                content: msg.content
              });
            }
          }
        }
        
        // Add the current query
        azureMessages.push({
          role: 'user',
          content: content
        });
        
        aiResponse = await generateTextWithAzureOpenAI(azureMessages, 'o4-mini');
      } else {
        // Use existing AI function for all other models
        const response = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            query: content,
            chatId: currentChatId,
            chatHistory: messages,
            model: selectedModel
          })
        });

        if (!response.ok) {
          throw new Error('Failed to get AI response');
        }
        
        const data = await response.json();
        aiResponse = data.response;
      }
      
      // Add AI response to messages
      if (aiResponse) {
        const aiMessage: ChatMessage = {
          id: uuidv4(),
          content: aiResponse,
          isUser: false,
          timestamp: new Date(),
          parentMessageId: userMessage.id, // This makes it a direct reply to the user's message
        };
        
        const finalMessages = [...newMessages, aiMessage];
        setMessages(finalMessages);
        
        // Update temp chat with AI response
        if (currentChatId) {
          const chat = tempChats.find(c => c.id === currentChatId);
          if (chat) {
            chat.messages = finalMessages;
          }
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

  // Get temp chats for recent chats component
  const getTempChats = () => {
    return tempChats.map(chat => ({
      id: chat.id,
      created_at: chat.createdAt.toISOString(),
      preview: chat.messages.length > 0 
        ? chat.messages[0].content.substring(0, 50) + (chat.messages[0].content.length > 50 ? '...' : '')
        : 'New Chat'
    }));
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
      getTempChats
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
