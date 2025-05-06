
import React, { useRef, useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { RefreshCw, SendHorizontal, Loader2 } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { useToast } from '@/hooks/use-toast';
import ModelSelector from './ModelSelector';
import { useLocation } from 'react-router-dom';

const ChatInterface = () => {
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    isTyping, 
    startNewChat,
    selectedModel,
    selectModel
  } = useChat();
  
  const [messageText, setMessageText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const location = useLocation();
  
  // Handle URL query parameters for pre-filled prompts
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const promptParam = params.get('prompt');
    
    if (promptParam) {
      setMessageText(decodeURIComponent(promptParam));
      // Reset URL parameter after applying it
      window.history.replaceState({}, document.title, '/chat');
    }
  }, [location.search]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [messageText]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (messageText.trim()) {
      sendMessage(messageText.trim());
      setMessageText('');
    }
  };

  // Handle text area key press (Enter to send, Ctrl + Enter for new line)
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.ctrlKey) {
        // Add a new line when Ctrl+Enter is pressed
        setMessageText(prev => prev + '\n');
      } else {
        // Send message when Enter is pressed without Ctrl
        e.preventDefault();
        handleSendMessage();
      }
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl backdrop-blur-sm bg-white/5 border border-blue-500/20">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-blue-500/20">
        <h2 className="text-lg font-semibold text-blue-100">Chat</h2>
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={startNewChat}
                  className="text-blue-300 hover:text-blue-200"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Start New Chat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Model Selector */}
      <div className="px-4 py-2 border-b border-blue-500/20">
        <ModelSelector />
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} /> {/* Scroll anchor */}
          </div>
        </ScrollArea>
        {isTyping && (
          <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[#0E141B]/80 to-transparent backdrop-blur-sm">
            <TypingIndicator />
          </div>
        )}
      </div>
      
      {/* Input Area */}
      <div className="p-4 border-t border-blue-500/20">
        <div className="flex items-center space-x-2">
          <Textarea
            ref={textareaRef}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleTextareaKeyDown}
            placeholder="Type your message here... (Press Enter to send, Ctrl + Enter for new line)"
            className="resize-none flex-1 bg-transparent text-blue-100 placeholder:text-blue-300 border-blue-500/30 focus-visible:ring-blue-400"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleSendMessage}
                  disabled={isLoading || !messageText.trim()}
                  className="text-blue-300 hover:text-blue-200"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SendHorizontal className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Send Message</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
