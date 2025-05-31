import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  content: string;
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
  loadChatById: (id: string) => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
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

  // Load chat history from Supabase on chatId change
  useEffect(() => {
    if (chatId) {
      loadChatById(chatId);
    } else {
      setMessages([]); // Clear messages if no chatId
    }
  }, [chatId]);

  const sendMessage = async (content: string, parentMessageId?: string) => {
    if (!chatId) {
      console.warn('No chatId available. Starting a new chat.');
      await startNewChat();
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

      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        content: data.response || 'No response received',
        isUser: false,
        timestamp: new Date(),
        parentMessageId: parentMessageId,
      };

      setMessages(prev => [...prev, assistantMessage]);
      await saveMessageToDatabase(userMessage, chatId);
      await saveMessageToDatabase(assistantMessage, chatId);
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

  const saveMessageToDatabase = async (message: ChatMessage, chatId: string) => {
    const { error } = await supabase
      .from('chat_messages')
      .insert([
        {
          chat_id: chatId,
          content: message.content,
          is_user: message.isUser,
          timestamp: message.timestamp.toISOString(),
          parent_message_id: message.parentMessageId || null,
        },
      ]);

    if (error) {
      console.error('Error saving message to database:', error);
    }
  };

  const startNewChat = useCallback(async () => {
    const newChatId = uuidv4();
    setChatId(newChatId);
    setMessages([]);
  }, []);

  const loadChatById = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', id)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error loading chat history:', error);
        return;
      }

      const loadedMessages = data.map(msg => ({
        id: msg.id,
        content: msg.content,
        isUser: msg.is_user,
        timestamp: new Date(msg.timestamp),
        parentMessageId: msg.parent_message_id || undefined,
      }));

      setMessages(loadedMessages);
      setChatId(id);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChat = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('chat_id', id);

      if (error) {
        console.error('Error deleting chat:', error);
        return;
      }

      setMessages([]);
      setChatId(null);
    } finally {
      setIsLoading(false);
    }
  };

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

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        content: data.response || 'No response received',
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
      loadChatById,
      deleteChat,
      runDeepResearch
    }}>
      {children}
    </ChatContext.Provider>
  );
};
