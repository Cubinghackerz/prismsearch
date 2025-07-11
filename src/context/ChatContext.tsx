
import React, {
  createContext,
  useState,
  useContext,
  useCallback
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

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
  const [selectedModel, setSelectedModel] = useState<ChatModel>('mistral');
  const [chatId, setChatId] = useState<string | null>(null);

  const sendMessage = async (content: string, parentMessageId?: string) => {
    if (!chatId) {
      console.warn('No chatId available. Starting a new chat.');
      startNewChat();
      return;
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

    try {
      const { data, error } = await supabase.functions.invoke('ai-search-assistant', {
        body: {
          query: content,
          chatId: chatId,
          chatHistory: messages,
          model: selectedModel
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      const responseText = data.response || 'No response received';

      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        content: responseText,
        formattedContent: responseText.replace(/\* /g, '• '),
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

    try {
      const { data, error } = await supabase.functions.invoke('ai-search-assistant', {
        body: {
          query: topic,
          chatId: chatId,
          chatHistory: messages,
          model: selectedModel,
          deepResearch: true
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      const responseText = data.response || 'No response received';

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        content: responseText,
        formattedContent: responseText,
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
