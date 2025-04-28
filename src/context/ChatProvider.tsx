
import { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { ChatContextType, ChatMessage, ChatModel } from './types';
import { useModelUsage } from './useModelUsage';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ChatModel>('gemini');
  const { modelUsage, updateUsage } = useModelUsage();

  const startNewChat = () => {
    const newChatId = uuidv4();
    setChatId(newChatId);
    setMessages([]);
  };
  
  const selectModel = (model: ChatModel) => {
    setSelectedModel(model);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    if (
      (selectedModel === 'claude' && modelUsage.claude <= 0) || 
      (selectedModel === 'gpt' && modelUsage.gpt <= 0)
    ) {
      return;
    }
    
    const userMessage: ChatMessage = {
      id: uuidv4(),
      content,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      if (!chatId) {
        startNewChat();
      }
      
      const { data, error } = await supabase.functions.invoke('ai-search-assistant', {
        body: { 
          query: content,
          chatId: chatId || uuidv4(),
          chatHistory: messages,
          model: selectedModel
        }
      });

      if (error) throw error;
      
      if (data && data.response) {
        const aiMessage: ChatMessage = {
          id: uuidv4(),
          content: data.response,
          isUser: false,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        if (data.usageRemaining !== undefined) {
          updateUsage(selectedModel, data.usageRemaining);
        }
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        content: "Sorry, I encountered an error while trying to respond. Please try again or select a different AI model.",
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
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
