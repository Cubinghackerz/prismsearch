
import React, {
  createContext,
  useState,
  useContext,
  useCallback
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useDailyQueryLimit } from '@/hooks/useDailyQueryLimit';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  content: string;
  formattedContent?: string;
  isUser: boolean;
  timestamp: Date;
  parentMessageId?: string;
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
  isLoading: boolean;
  isTyping: boolean;
  startNewChat: () => void;
  selectModel: (model: ChatModel) => void;
  selectedModel: ChatModel;
  chatId: string | null;
  runDeepResearch: (topic: string) => Promise<void>;
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
  const { incrementQueryCount, isLimitReached } = useDailyQueryLimit();
  const { toast } = useToast();

  const sendMessage = async (content: string, parentMessageId?: string) => {
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
          model: selectedModel // Use selected model instead of forcing Gemini
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
        formattedContent: responseText.replace(/\* /g, '• ').replace(/\n\* /g, '\n• '),
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

  const startNewChat = useCallback(() => {
    const newChatId = uuidv4();
    setChatId(newChatId);
    setMessages([]);
  }, []);

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
        formattedContent: responseText.replace(/\* /g, '• ').replace(/\n\* /g, '\n• '),
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
      isLoading,
      isTyping,
      startNewChat,
      selectModel,
      selectedModel,
      chatId,
      runDeepResearch
    }}>
      {children}
    </ChatContext.Provider>
  );
};
