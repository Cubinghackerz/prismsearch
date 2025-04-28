
import { useState, useRef, useEffect } from 'react';
import { SendIcon, Bot, User, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat, ChatModel } from '@/context/ChatContext';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const ChatInterface = () => {
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    startNewChat, 
    selectModel, 
    selectedModel,
    modelUsage 
  } = useChat();
  
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    
    sendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleModelChange = (value: string) => {
    selectModel(value as ChatModel);
  };

  return (
    <div className="flex flex-col h-[60vh] bg-black/20 backdrop-blur-md rounded-xl border border-purple-500/20 shadow-lg">
      {/* Model selection */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-200">Select AI Model:</label>
          <RadioGroup 
            defaultValue={selectedModel} 
            value={selectedModel}
            onValueChange={handleModelChange}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="claude" id="claude" 
                disabled={modelUsage.claude === 0} />
              <label htmlFor="claude" className={`${modelUsage.claude === 0 ? 'text-gray-500' : 'text-gray-200'}`}>
                Claude 3.5 Haiku
                {modelUsage.claude !== null && <span className="ml-1 text-xs text-gray-400">({modelUsage.claude} left)</span>}
              </label>
            </div>
            
            <div className="flex items-center gap-2">
              <RadioGroupItem value="gpt" id="gpt" 
                disabled={modelUsage.gpt === 0} />
              <label htmlFor="gpt" className={`${modelUsage.gpt === 0 ? 'text-gray-500' : 'text-gray-200'}`}>
                ChatGPT
                {modelUsage.gpt !== null && <span className="ml-1 text-xs text-gray-400">({modelUsage.gpt} left)</span>}
              </label>
            </div>
            
            <div className="flex items-center gap-2">
              <RadioGroupItem value="gemini" id="gemini" />
              <label htmlFor="gemini" className="text-gray-200">
                Gemini
                <span className="ml-1 text-xs text-gray-400">(Unlimited)</span>
              </label>
            </div>
          </RadioGroup>
        </div>
        <div className="mt-4 flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={startNewChat} 
            className="text-gray-300"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> New Chat
          </Button>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p>Send a message to start chatting</p>
          </div>
        ) : (
          messages.map(message => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${message.isUser ? 'justify-end' : ''}`}
            >
              {!message.isUser && (
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-purple-400" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-lg p-3 ${
                message.isUser 
                  ? 'bg-purple-600/20 text-gray-200 rounded-tr-none' 
                  : 'bg-gray-800/40 text-gray-200 rounded-tl-none'
              }`}>
                {message.content}
              </div>
              {message.isUser && (
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
              )}
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="resize-none bg-gray-900/50 border-gray-700 focus-visible:ring-purple-500 text-white"
            disabled={isLoading || 
              (selectedModel === 'claude' && modelUsage.claude === 0) ||
              (selectedModel === 'gpt' && modelUsage.gpt === 0)
            }
          />
          <Button 
            type="submit" 
            className="bg-purple-600 hover:bg-purple-700" 
            disabled={!inputValue.trim() || isLoading ||
              (selectedModel === 'claude' && modelUsage.claude === 0) ||
              (selectedModel === 'gpt' && modelUsage.gpt === 0)
            }
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
