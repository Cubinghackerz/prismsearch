
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  model?: string;
}

interface ChatContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  sendMessage: (text: string) => void;
  startNewChat: () => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  setInitialPrompt: (prompt: string) => void;
}

const ChatContext = createContext<ChatContextType>({
  messages: [],
  isLoading: false,
  isTyping: false,
  sendMessage: () => {},
  startNewChat: () => {},
  selectedModel: '',
  setSelectedModel: () => {},
  setInitialPrompt: () => {},
});

export const useChat = () => useContext(ChatContext);

// Available models
export const availableModels = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Fast and efficient model from Google with strong language capabilities' },
  { id: 'mistral-medium', name: 'Mistral Medium', description: 'High-quality model optimized for contextual understanding' },
  { id: 'llama-3', name: 'Llama 3', description: 'Open-source large language model from Meta' },
];

interface ChatProviderProps {
  children: ReactNode;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState(availableModels[0].id);
  const { toast } = useToast();
  
  // Call AI search assistant function
  const callAIAssistant = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      setIsTyping(true);
      
      const existingChatHistory = messages.map(msg => ({
        isUser: msg.sender === 'user',
        content: msg.text
      }));
      
      const { data, error } = await supabase.functions.invoke('ai-search-assistant', {
        body: {
          query,
          model: selectedModel,
          chatHistory: existingChatHistory,
          chatId: 'chat-' + Date.now()
        }
      });
      
      setIsLoading(false);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Simulate a short typing delay for natural feel
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          {
            id: generateId(),
            text: data.response || "Sorry, I couldn't generate a response. Please try again.",
            sender: 'bot',
            timestamp: new Date(),
            model: selectedModel
          }
        ]);
      }, 800);
      
    } catch (error) {
      console.error('Error calling AI assistant:', error);
      setIsLoading(false);
      setIsTyping(false);
      
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to get response: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      
      // Add error message to chat
      setMessages(prev => [
        ...prev,
        {
          id: generateId(),
          text: "I'm sorry, I encountered an error. Please try again or select a different model.",
          sender: 'bot',
          timestamp: new Date(),
          model: selectedModel
        }
      ]);
    }
  }, [messages, selectedModel, toast]);
  
  // Send a message
  const sendMessage = useCallback((text: string) => {
    const newUserMessage: ChatMessage = {
      id: generateId(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    callAIAssistant(text);
  }, [callAIAssistant]);
  
  // Set initial prompt
  const setInitialPrompt = useCallback((prompt: string) => {
    if (prompt && messages.length === 0) {
      sendMessage(prompt);
    }
  }, [messages.length, sendMessage]);
  
  // Start a new chat
  const startNewChat = useCallback(() => {
    setMessages([]);
  }, []);
  
  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading,
        isTyping,
        sendMessage,
        startNewChat,
        selectedModel,
        setSelectedModel,
        setInitialPrompt
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
