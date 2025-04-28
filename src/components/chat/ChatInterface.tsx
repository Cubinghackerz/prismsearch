
import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Bot, User, Loader2, RefreshCw } from 'lucide-react';
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
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
      <div className="p-4 border-b border-gray-800">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-200">Select AI Model:</label>
          <RadioGroup defaultValue={selectedModel} value={selectedModel} onValueChange={handleModelChange} className="flex gap-4">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="claude" id="claude" />
              <label htmlFor="claude" className="text-gray-200">
                Claude 3 Haiku
                <span className="ml-1 text-xs text-green-400">(Unlimited for a limited time!)</span>
              </label>
            </div>
            
            <div className="flex items-center gap-2">
              <RadioGroupItem value="gpt" id="gpt" />
              <label htmlFor="gpt" className="text-gray-200">
                ChatGPT
                <span className="ml-1 text-xs text-green-400">(Unlimited for a limited time!)</span>
              </label>
            </div>
            
            <div className="flex items-center gap-2">
              <RadioGroupItem value="gemini" id="gemini" />
              <label htmlFor="gemini" className="text-gray-200">
                Gemini 1.5 Flash
                <span className="ml-1 text-xs text-gray-400">(Unlimited)</span>
              </label>
            </div>
          </RadioGroup>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={startNewChat} className="text-slate-950">
            <RefreshCw className="mr-2 h-4 w-4" /> New Chat
          </Button>
        </div>
      </div>

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

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
        <div className="relative flex items-center">
          <Textarea 
            value={inputValue} 
            onChange={e => setInputValue(e.target.value)} 
            onKeyDown={handleKeyDown} 
            placeholder="Ask anything..." 
            className="resize-none bg-zinc-800/90 border-gray-700 focus-visible:ring-purple-500 text-white pr-12 min-h-[56px] py-3 rounded-xl"
            disabled={isLoading} 
          />
          <Button 
            type="submit" 
            size="icon"
            className="absolute right-2 rounded-full bg-white hover:bg-gray-200 text-black w-10 h-10 flex items-center justify-center"
            disabled={!inputValue.trim() || isLoading}
          >
            {isLoading ? 
              <Loader2 className="h-5 w-5 animate-spin text-gray-700" /> : 
              <ArrowUp className="h-5 w-5 text-gray-700" />
            }
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
