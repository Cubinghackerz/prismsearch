
import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Bot, User, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat, ChatModel } from '@/context/ChatContext';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert } from "@/components/ui/alert";

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

  return <div className="flex flex-col h-[60vh] md:h-[75vh] lg:h-[80vh] bg-black/20 backdrop-blur-md rounded-xl border border-purple-500/20 shadow-lg">
      <div className="p-4 border-b border-gray-800">
        <Alert className="mb-4 bg-yellow-500/10 border-yellow-500/50 text-yellow-300">
          <AlertTriangle className="h-4 w-4 text-white bg-transparent" />
          <p className="text-sm">
            Chat mode is experimental and may be unstable. We appreciate your patience as we improve it.
          </p>
        </Alert>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-purple-200">Select AI Model:</label>
          <RadioGroup defaultValue={selectedModel} value={selectedModel} onValueChange={handleModelChange} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative flex items-center">
              <RadioGroupItem value="claude" id="claude" className="peer sr-only" />
              <label htmlFor="claude" className={`flex flex-col w-full p-4 border rounded-lg cursor-pointer transition-all duration-200 ${selectedModel === 'claude' ? 'bg-purple-500/30 border-purple-400 ring-2 ring-purple-400/50' : 'bg-purple-900/20 border-purple-500/30 hover:bg-purple-800/20'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-purple-100">Claude 3.5 Haiku</span>
                  <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded-full">Unlimited</span>
                </div>
                <span className="mt-1 text-sm text-purple-200/70">Fast, accurate responses with deep understanding</span>
              </label>
            </div>

            <div className="relative flex items-center">
              <RadioGroupItem value="gpt" id="gpt" className="peer sr-only" />
              <label htmlFor="gpt" className={`flex flex-col w-full p-4 border rounded-lg cursor-pointer transition-all duration-200 ${selectedModel === 'gpt' ? 'bg-blue-500/30 border-blue-400 ring-2 ring-blue-400/50' : 'bg-blue-900/20 border-blue-500/30 hover:bg-blue-800/20'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-blue-100">ChatGPT</span>
                  <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded-full">Unlimited</span>
                </div>
                <span className="mt-1 text-sm text-blue-200/70">Versatile AI with broad knowledge</span>
              </label>
            </div>
          </RadioGroup>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={startNewChat} className="border-purple-500/50 bg-transparent text-slate-50">
            <RefreshCw className="mr-2 h-4 w-4" /> New Chat
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 md:p-6">
        {messages.length === 0 ? <div className="h-full flex items-center justify-center text-gray-400">
            <p>Send a message to start chatting</p>
          </div> : messages.map(message => <motion.div key={message.id} initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} className={`flex gap-3 ${message.isUser ? 'justify-end' : ''}`}>
              {!message.isUser && <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-purple-400" />
                </div>}
              <div className={`max-w-[80%] md:max-w-[75%] lg:max-w-[65%] rounded-lg p-3 ${message.isUser ? 'bg-purple-600/20 text-gray-200 rounded-tr-none' : 'bg-gray-800/40 text-gray-200 rounded-tl-none'}`}>
                {message.content}
              </div>
              {message.isUser && <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-blue-400" />
                </div>}
            </motion.div>)}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 md:p-6 border-t border-gray-800">
        <div className="relative flex items-center max-w-4xl mx-auto">
          <Textarea 
            value={inputValue} 
            onChange={e => setInputValue(e.target.value)} 
            onKeyDown={handleKeyDown} 
            placeholder="Ask anything..." 
            className="resize-none bg-zinc-800/80 border border-blue-400/30 focus-visible:ring-blue-500/50 focus-visible:border-blue-400/50 text-white pr-12 min-h-[56px] py-3 rounded-xl md:min-h-[64px] shadow-lg" 
            disabled={isLoading} 
          />
          <Button 
            type="submit" 
            size="icon" 
            className="absolute right-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 flex items-center justify-center shadow-md"
            disabled={!inputValue.trim() || isLoading}
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : <ArrowUp className="h-5 w-5 text-white" />}
          </Button>
        </div>
      </form>
    </div>;
};

export default ChatInterface;
