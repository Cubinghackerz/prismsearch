
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAzureChat } from '@/hooks/useAzureChat';
import { Loader2, Send, TestTube, Trash2, MessageSquare, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AzureChatInterfaceProps {
  apiKey: string;
}

const AzureChatInterface: React.FC<AzureChatInterfaceProps> = ({ apiKey }) => {
  const [input, setInput] = useState<string>('');
  const [streamingMode, setStreamingMode] = useState<boolean>(true);
  const { 
    messages, 
    loading, 
    streaming, 
    error, 
    sendMessage, 
    sendStreamingMessage,
    clearMessages,
    testConnection 
  } = useAzureChat(apiKey);
  
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!input.trim() || loading || streaming) return;
    
    const messageToSend = input.trim();
    setInput('');
    
    if (streamingMode) {
      await sendStreamingMessage(messageToSend);
    } else {
      await sendMessage(messageToSend);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleTestConnection = async () => {
    await testConnection();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col backdrop-blur-md bg-orange-500/5 border-orange-500/20">
      <CardHeader className="border-b border-orange-500/20">
        <div className="flex items-center justify-between">
          <CardTitle className="text-orange-200 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Azure OpenAI Chat (O4-Mini)
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStreamingMode(!streamingMode)}
              className="border-orange-500/30 text-orange-200 hover:bg-orange-500/20"
            >
              {streamingMode ? (
                <>
                  <Zap className="h-3 w-3 mr-1" />
                  Streaming
                </>
              ) : (
                <>
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Standard
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              className="border-orange-500/30 text-orange-200 hover:bg-orange-500/20"
            >
              <TestTube className="h-3 w-3 mr-1" />
              Test
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={clearMessages}
              className="border-orange-500/30 text-orange-200 hover:bg-orange-500/20"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>
        
        {error && (
          <Alert className="mt-2 bg-red-500/10 border-red-500/30">
            <AlertDescription className="text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg shadow-sm ${
                      message.role === 'user'
                        ? 'bg-orange-600/30 text-orange-100 rounded-br-none'
                        : 'bg-orange-900/20 text-orange-200 rounded-bl-none border border-orange-500/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium opacity-70">
                        {message.role === 'user' ? 'You' : 'O4-Mini'}
                      </span>
                      <span className="text-xs opacity-50">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {(loading || streaming) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-orange-900/20 text-orange-200 p-3 rounded-lg rounded-bl-none border border-orange-500/20">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">
                      {streaming ? 'Streaming response...' : 'Thinking...'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t border-orange-500/20 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Shift + Enter for new line)"
              className="flex-1 min-h-[60px] max-h-[120px] bg-orange-950/30 border-orange-500/30 placeholder:text-orange-300/50 text-orange-100 resize-none"
              disabled={loading || streaming}
            />
            <Button
              type="submit"
              disabled={loading || streaming || !input.trim()}
              className="px-6 bg-orange-600 hover:bg-orange-700 text-white self-end"
            >
              {loading || streaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          
          <div className="flex items-center justify-between mt-2 text-xs text-orange-300/70">
            <span>
              Mode: {streamingMode ? 'Streaming' : 'Standard'} | 
              Messages: {messages.length}
            </span>
            <span>
              Press Shift + Enter for new line
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AzureChatInterface;
