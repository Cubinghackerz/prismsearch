
import React, { useRef, useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, SendHorizontal, Loader2, AlertCircle } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { useToast } from '@/hooks/use-toast';
import ModelSelector from './ModelSelector';

const ChatInterface = () => {
  const {
    messages,
    sendMessage,
    isLoading,
    isTyping,
    startNewChat,
    selectedModel,
  } = useChat();
  const [messageText, setMessageText] = useState('');
  const [showModelReminder, setShowModelReminder] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [messageText]);

  // Hide model reminder when messages are sent
  useEffect(() => {
    if (messages.length > 0) {
      setShowModelReminder(false);
    }
  }, [messages.length]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (messageText.trim()) {
      sendMessage(messageText.trim());
      setMessageText('');

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'inherit';
      }
    }
  };

  // Handle text area key press (Enter to send, Ctrl+Enter for new line)
  const handleTextareaKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
      e.preventDefault(); // Prevent default to avoid adding a newline
      if (!isLoading) {
        handleSendMessage();
      }
    }
    // Allow Ctrl+Enter or Shift+Enter for new lines
  };

  return (
    <div className="flex flex-col h-full rounded-xl backdrop-blur-sm bg-white/5 border border-blue-500/20">
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
                  className="text-blue-300 hover:text-blue-200 bg-transparent"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Start New Chat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-blue-100 border-blue-500/30 bg-transparent"
              >
                Model: {selectedModel}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-blue-950/90 border border-blue-500/30">
              <ModelSelector />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {messages.length === 0 ? (
              <>
                <div className="flex items-center justify-center h-32 text-blue-300/60">
                  <p>Start a conversation by typing a message below...</p>
                </div>
                {showModelReminder && (
                  <Alert className="bg-blue-900/40 border border-blue-600/30 text-blue-200 my-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please select a model before starting your conversation for the best experience.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            ) : (
              messages.map(message => (
                <MessageBubble key={message.id} message={message} />
              ))
            )}
            
            {isTyping && (
              <TypingIndicator />
            )}
            
            <div ref={messagesEndRef} /> 
          </div>
        </ScrollArea>
      </div>
      
      <div className="p-4 border-t border-blue-500/20">
        <div className="flex items-center space-x-2">
          <Textarea 
            ref={textareaRef}
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            onKeyDown={handleTextareaKeyDown}
            placeholder="Type your message here... (Enter to send, Ctrl+Enter for new line)"
            className="resize-none flex-1 bg-transparent text-blue-100 placeholder:text-blue-300/50 border-blue-500/30 focus-visible:ring-blue-400"
            disabled={isLoading}
            rows={1}
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
