
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

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
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable GPT-4 model, optimized for speed and instruction following' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Optimized for more natural language responses' },
  { id: 'mistral-large', name: 'Mistral Large', description: 'High-quality model optimized for contextual understanding' },
  { id: 'claude-3', name: 'Claude 3', description: 'Advanced model from Anthropic with strong reasoning capabilities' },
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
  
  // Simulate AI response
  const simulateResponse = useCallback((userMessage: string) => {
    setIsLoading(true);
    setIsTyping(true);
    
    setTimeout(() => {
      setIsLoading(false);
      
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          {
            id: generateId(),
            text: `This is a simulated response to: "${userMessage}". In a real application, this would be an actual response from the ${selectedModel} model.`,
            sender: 'bot' as const, // Fix: Explicitly type as 'bot'
            timestamp: new Date(),
            model: selectedModel
          }
        ]);
      }, 1500); // Typing indicator delay
    }, 1000); // Loading delay
  }, [selectedModel]);
  
  // Send a message
  const sendMessage = useCallback((text: string) => {
    const newUserMessage: ChatMessage = {
      id: generateId(),
      text,
      sender: 'user', // This is fine since it's a literal
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    simulateResponse(text);
  }, [simulateResponse]);
  
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
