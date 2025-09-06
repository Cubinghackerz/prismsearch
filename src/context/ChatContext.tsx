
import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useDailyQueryLimit } from '@/hooks/useDailyQueryLimit';
import { useToast } from '@/hooks/use-toast';

export interface SavedChat {
  id: string;
  title: string;
  messages: ChatMessage[];
  model: ChatModel;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  content: string;
  formattedContent?: string;
  isUser: boolean;
  timestamp: Date;
  parentMessageId?: string;
  attachments?: any[];
}

export type ChatModel =
  | 'gemini'
  | 'mistral'
  | 'mistral-medium-3'
  | 'groq'
  | 'groq-qwen-qwq'
  | 'groq-llama4-scout'
  | 'groq-llama4-maverick'
  | 'groq-llama-guard'
  | 'groq-llama31-8b-instant'
  | 'groq-llama3-8b'
  | 'azure-gpt4-nano'
  | 'azure-o4-mini';

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (content: string, parentMessageId?: string) => Promise<void>;
  sendMessageWithFiles: (content: string, attachments: any[], parentMessageId?: string) => Promise<void>;
  isLoading: boolean;
  isTyping: boolean;
  startNewChat: () => void;
  selectModel: (model: ChatModel) => void;
  selectedModel: ChatModel;
  chatId: string | null;
  runDeepResearch: (topic: string) => Promise<void>;
  savedChats: SavedChat[];
  loadChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  clearAllChats: () => void;
  isTemporaryMode: boolean;
  toggleTemporaryMode: () => void;
  saveCurrentChat: () => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<ChatModel>('gemini');
  const [chatId, setChatId] = useState<string | null>(null);
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [isTemporaryMode, setIsTemporaryMode] = useState<boolean>(false);
  const { incrementQueryCount, isLimitReached } = useDailyQueryLimit();
  const { toast } = useToast();

  // Load saved chats on mount
  useEffect(() => {
    loadSavedChats();
    loadTemporaryMode();
  }, []);

  const loadSavedChats = () => {
    try {
      const stored = localStorage.getItem('prism_saved_chats');
      if (stored) {
        const parsed = JSON.parse(stored);
        const chats = parsed.map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setSavedChats(chats);
      }
    } catch (error) {
      console.error('Error loading saved chats:', error);
    }
  };

  const loadTemporaryMode = () => {
    try {
      const stored = localStorage.getItem('prism_temporary_mode');
      if (stored) {
        setIsTemporaryMode(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading temporary mode:', error);
    }
  };

  const saveChatToStorage = (chatToSave: SavedChat) => {
    try {
      const existingChats = [...savedChats];
      const existingIndex = existingChats.findIndex(chat => chat.id === chatToSave.id);
      
      if (existingIndex >= 0) {
        existingChats[existingIndex] = chatToSave;
      } else {
        existingChats.unshift(chatToSave);
      }
      
      // Keep only the 50 most recent chats
      const limitedChats = existingChats.slice(0, 50);
      
      setSavedChats(limitedChats);
      localStorage.setItem('prism_saved_chats', JSON.stringify(limitedChats));
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  };

  const generateChatTitle = (firstMessage: string): string => {
    const truncated = firstMessage.slice(0, 50);
    return truncated.length < firstMessage.length ? truncated + '...' : truncated;
  };

  const saveCurrentChat = () => {
    if (isTemporaryMode || !chatId || messages.length === 0) return;

    const firstUserMessage = messages.find(msg => msg.isUser)?.content || 'New Chat';
    const chatTitle = generateChatTitle(firstUserMessage);

    const chatToSave: SavedChat = {
      id: chatId,
      title: chatTitle,
      messages: messages,
      model: selectedModel,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    saveChatToStorage(chatToSave);
  };

  // Auto-save chat after each message (when not in temporary mode)
  useEffect(() => {
    if (!isTemporaryMode && chatId && messages.length > 0) {
      const timeoutId = setTimeout(() => {
        saveCurrentChat();
      }, 1000); // Debounce saves

      return () => clearTimeout(timeoutId);
    }
  }, [messages, isTemporaryMode, chatId]);

  const sendMessageWithFiles = async (content: string, attachments: any[] = [], parentMessageId?: string) => {
    // Check query limit before processing
    if (isLimitReached) {
      toast({
        title: "Daily limit reached",
        description: "You've reached your daily query limit. Please try again tomorrow or sign up for more queries.",
        variant: "destructive"
      });
      return;
    }

    // Increment query count
    if (!incrementQueryCount()) {
      toast({
        title: "Daily limit reached",
        description: "You've reached your daily query limit. Please try again tomorrow.",
        variant: "destructive"
      });
      return;
    }

    // Initialize chat if needed
    let currentChatId = chatId;
    if (!currentChatId) {
      currentChatId = uuidv4();
      setChatId(currentChatId);
    }

    const userMessage: ChatMessage = {
      id: uuidv4(),
      content: content,
      isUser: true,
      timestamp: new Date(),
      parentMessageId: parentMessageId,
      attachments: attachments,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);

    // Add a timeout to prevent hanging
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timed out after 30 seconds'));
      }, 30000);
    });

    try {
      const responsePromise = supabase.functions.invoke('ai-search-assistant', {
        body: {
          query: content,
          chatId: currentChatId,
          chatHistory: messages,
          model: selectedModel, // Use selected model instead of forcing Gemini
          attachments: attachments
        }
      });
      
      // Race the response against the timeout
      const { data, error } = await Promise.race([
        responsePromise,
        timeoutPromise.then(() => {
          throw new Error('Request timed out after 30 seconds');
        })
      ]);

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      const responseText = data.response || 'No response received';

      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        content: responseText,
        isUser: false,
        timestamp: new Date(),
        parentMessageId: parentMessageId,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        content: 'Sorry, there was an error processing your request. Please try again.',
        isUser: false,
        timestamp: new Date(),
        parentMessageId: parentMessageId,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const sendMessage = async (content: string, parentMessageId?: string) => {
    await sendMessageWithFiles(content, [], parentMessageId);
  };

  const startNewChat = useCallback(() => {
    const newChatId = uuidv4();
    setChatId(newChatId);
    setMessages([]);
  }, []);

  const loadChat = (loadChatId: string) => {
    const chatToLoad = savedChats.find(chat => chat.id === loadChatId);
    if (chatToLoad) {
      setChatId(chatToLoad.id);
      setMessages(chatToLoad.messages);
      setSelectedModel(chatToLoad.model);
      
      toast({
        title: "Chat loaded",
        description: `Loaded "${chatToLoad.title}"`
      });
    }
  };

  const deleteChat = (deleteChatId: string) => {
    const updatedChats = savedChats.filter(chat => chat.id !== deleteChatId);
    setSavedChats(updatedChats);
    localStorage.setItem('prism_saved_chats', JSON.stringify(updatedChats));
    
    // If we're deleting the current chat, start a new one
    if (deleteChatId === chatId) {
      startNewChat();
    }
    
    toast({
      title: "Chat deleted",
      description: "The chat has been removed from your saved chats."
    });
  };

  const clearAllChats = () => {
    setSavedChats([]);
    localStorage.removeItem('prism_saved_chats');
    startNewChat();
    
    toast({
      title: "All chats cleared",
      description: "All saved chats have been removed."
    });
  };

  const toggleTemporaryMode = () => {
    const newMode = !isTemporaryMode;
    setIsTemporaryMode(newMode);
    localStorage.setItem('prism_temporary_mode', JSON.stringify(newMode));
    
    toast({
      title: newMode ? "Temporary mode enabled" : "Temporary mode disabled",
      description: newMode 
        ? "Your chats will not be saved to device storage."
        : "Your chats will be automatically saved to device storage."
    });
  };

  const selectModel = (model: ChatModel) => {
    setSelectedModel(model);
  };

  const runDeepResearch = async (topic: string) => {
    if (isLoading) return;
    
    // Check query limit before processing
    if (isLimitReached) {
      toast({
        title: "Daily limit reached",
        description: "You've reached your daily query limit. Please try again tomorrow or sign up for more queries.",
        variant: "destructive"
      });
      return;
    }

    // Increment query count
    if (!incrementQueryCount()) {
      toast({
        title: "Daily limit reached",
        description: "You've reached your daily query limit. Please try again tomorrow.",
        variant: "destructive"
      });
      return;
    }
    
    if (!chatId) {
      startNewChat();
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: topic,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);

    // Add a timeout to prevent hanging
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timed out after 45 seconds'));
      }, 45000);
    });

    try {
      const responsePromise = supabase.functions.invoke('ai-search-assistant', {
        body: {
          query: topic,
          chatId: chatId,
          chatHistory: messages,
          model: selectedModel, // Use selected model instead of forcing Gemini
          deepResearch: true
        }
      });
      
      // Race the response against the timeout
      const { data, error } = await Promise.race([
        responsePromise,
        timeoutPromise.then(() => {
          throw new Error('Deep research request timed out after 45 seconds');
        })
      ]);

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      const responseText = data.response || 'No response received';

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        content: responseText,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error in deep research:', error);
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        content: 'Sorry, there was an error processing your deep research request. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  return (
    <ChatContext.Provider value={{
      messages,
      sendMessage,
      sendMessageWithFiles,
      isLoading,
      isTyping,
      startNewChat,
      selectModel,
      selectedModel,
      chatId,
      runDeepResearch,
      savedChats,
      loadChat,
      deleteChat,
      clearAllChats,
      isTemporaryMode,
      toggleTemporaryMode,
      saveCurrentChat
    }}>
      {children}
    </ChatContext.Provider>
  );
};
