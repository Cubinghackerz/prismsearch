
import { useState, useCallback, useRef } from 'react';
import { useToast } from './use-toast';
import { getAzureOpenAI } from '../lib/azure-openai';
import { checkRateLimit } from '../lib/rate-limiter';
import type { ChatMessage, ChatResponse } from '../types/azure-openai';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseAzureChatReturn {
  messages: Message[];
  loading: boolean;
  streaming: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  sendStreamingMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  testConnection: () => Promise<boolean>;
}

export function useAzureChat(apiKey: string): UseAzureChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [streaming, setStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const abortController = useRef<AbortController | null>(null);

  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addMessage = useCallback((role: 'user' | 'assistant', content: string): string => {
    const id = generateMessageId();
    const newMessage: Message = {
      id,
      role,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    return id;
  }, []);

  const updateMessage = useCallback((id: string, content: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, content } : msg
    ));
  }, []);

  const sendMessage = useCallback(async (message: string): Promise<void> => {
    if (!message.trim() || loading || streaming) return;
    if (!apiKey) {
      setError('Azure OpenAI API key is required');
      return;
    }

    // Check rate limit
    const rateLimitResult = checkRateLimit('azure-chat-user', 20, 60000);
    if (!rateLimitResult.allowed) {
      const resetTime = rateLimitResult.resetTime ? new Date(rateLimitResult.resetTime) : new Date();
      toast({
        title: "Rate limit exceeded",
        description: `Please wait until ${resetTime.toLocaleTimeString()} before sending another message.`,
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    setLoading(true);
    setError(null);
    
    // Add user message
    const userMessageId = addMessage('user', message);

    try {
      // Prepare messages for API
      const chatMessages: ChatMessage[] = [
        { role: 'system', content: 'You are a helpful search assistant for PrismSearch.' },
        ...messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      const azureService = getAzureOpenAI(apiKey);
      const response = await azureService.chat(chatMessages, {
        maxTokens: 1500,
        temperature: 0.7
      });

      // Add assistant response
      addMessage('assistant', response.response);

      toast({
        title: "Message sent",
        description: "Response received successfully!",
        duration: 2000,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Azure Chat error:', err);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }, [messages, loading, streaming, apiKey, addMessage, toast]);

  const sendStreamingMessage = useCallback(async (message: string): Promise<void> => {
    if (!message.trim() || loading || streaming) return;
    if (!apiKey) {
      setError('Azure OpenAI API key is required');
      return;
    }

    // Check rate limit
    const rateLimitResult = checkRateLimit('azure-chat-stream', 15, 60000);
    if (!rateLimitResult.allowed) {
      const resetTime = rateLimitResult.resetTime ? new Date(rateLimitResult.resetTime) : new Date();
      toast({
        title: "Rate limit exceeded",
        description: `Please wait until ${resetTime.toLocaleTimeString()} before sending another message.`,
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    setStreaming(true);
    setError(null);
    
    // Create abort controller for cancellation
    abortController.current = new AbortController();
    
    // Add user message
    const userMessageId = addMessage('user', message);
    
    // Add empty assistant message that will be updated
    const assistantMessageId = addMessage('assistant', '');

    try {
      // Prepare messages for API
      const chatMessages: ChatMessage[] = [
        { role: 'system', content: 'You are a helpful search assistant for PrismSearch.' },
        ...messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      const azureService = getAzureOpenAI(apiKey);
      let streamedContent = '';

      for await (const chunk of azureService.chatStream(chatMessages, {
        maxTokens: 1500,
        temperature: 0.7
      })) {
        if (abortController.current?.signal.aborted) {
          break;
        }
        
        streamedContent += chunk;
        updateMessage(assistantMessageId, streamedContent);
      }

      toast({
        title: "Streaming complete",
        description: "Response received successfully!",
        duration: 2000,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Azure Chat streaming error:', err);
      
      // Update the assistant message with error
      updateMessage(assistantMessageId, `Error: ${errorMessage}`);
      
      toast({
        title: "Streaming Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setStreaming(false);
      abortController.current = null;
    }
  }, [messages, loading, streaming, apiKey, addMessage, updateMessage, toast]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    
    // Cancel any ongoing streaming
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }
  }, []);

  const testConnection = useCallback(async (): Promise<boolean> => {
    if (!apiKey) {
      setError('Azure OpenAI API key is required');
      return false;
    }

    try {
      const azureService = getAzureOpenAI(apiKey);
      const success = await azureService.testConnection();
      
      if (success) {
        toast({
          title: "Connection successful",
          description: "Azure OpenAI is working correctly!",
          duration: 3000,
        });
      } else {
        toast({
          title: "Connection failed",
          description: "Unable to connect to Azure OpenAI",
          variant: "destructive",
          duration: 5000,
        });
      }
      
      return success;
    } catch (error) {
      console.error('Connection test error:', error);
      toast({
        title: "Connection error",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
        duration: 5000,
      });
      return false;
    }
  }, [apiKey, toast]);

  return {
    messages,
    loading,
    streaming,
    error,
    sendMessage,
    sendStreamingMessage,
    clearMessages,
    testConnection,
  };
}
