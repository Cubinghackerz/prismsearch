import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Bot, User, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat, ChatModel } from '@/context/ChatContext';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert } from "@/components/ui/alert";
import TypingIndicator from './TypingIndicator';
import MessageActions from './MessageActions';

const ChatInterface = () => {
  const {
    messages,
    sendMessage,
    isLoading,
    startNewChat,
    selectModel,
    selectedModel
  } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
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

  return <div className="flex flex-col h-full bg-blue-950/20 backdrop-blur-md rounded-xl border border-blue-500/30 shadow-lg">
      <div className="p-4 border-b border-blue-900/40">
        <Alert className="mb-4 bg-blue-500/10 border-blue-500/50 text-blue-300">
          <p className="text-sm">
            Chat mode is experimental and may be unstable. We appreciate your patience as we improve it.
          </p>
        </Alert>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-blue-300">Select AI Model:</label>
          <RadioGroup defaultValue={selectedModel} value={selectedModel} onValueChange={handleModelChange} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative flex items-center">
              <RadioGroupItem value="mistral" id="mistral" className="peer sr-only" />
              <label htmlFor="mistral" className={`flex flex-col w-full p-4 border rounded-lg cursor-pointer transition-all duration-200 ${selectedModel === 'mistral' ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-400/50' : 'bg-blue-900/20 border-blue-500/30 hover:bg-blue-800/20'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-blue-200">Mistral Medium</span>
                  <span className="px-2 py-1 text-xs bg-green-500/30 text-green-300 rounded-full">Recommended</span>
                </div>
                <div className="flex items-center mt-1">
                  <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded-full mr-2">Unlimited</span>
                  <span className="text-sm text-blue-300/70">Efficient AI assistant</span>
                </div>
              </label>
            </div>

            <div className="relative flex items-center">
              <RadioGroupItem value="groq" id="groq" className="peer sr-only" />
              <label htmlFor="groq" className={`flex flex-col w-full p-4 border rounded-lg cursor-pointer transition-all duration-200 ${selectedModel === 'groq' ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-400/50' : 'bg-blue-900/20 border-blue-500/30 hover:bg-blue-800/20'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-blue-200">Llama-3-70B</span>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">Fast</span>
                </div>
                <span className="mt-1 text-sm text-blue-300/70">High-performance model</span>
              </label>
            </div>

            <div className="relative flex items-center">
              <RadioGroupItem value="gemini" id="gemini" className="peer sr-only" />
              <label htmlFor="gemini" className={`flex flex-col w-full p-4 border rounded-lg cursor-pointer transition-all duration-200 ${selectedModel === 'gemini' ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-400/50' : 'bg-blue-900/20 border-blue-500/30 hover:bg-blue-800/20'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-blue-200">Gemini 2.5 Flash Preview</span>
                  <span className="px-2 py-1 text-xs bg-yellow-500/30 text-yellow-300 rounded-full">Fast and Accurate
                </span>
                </div>
                <span className="mt-1 text-sm text-blue-300/70">Google's latest AI model in the works</span>
              </label>
            </div>
          </RadioGroup>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={startNewChat} className="border-blue-500/50 text-blue-200 hover:border-blue-400/60 transition-all duration-300 bg-transparent">
            <RefreshCw className="mr-2 h-4 w-4" /> New Chat
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 md:p-6 bg-gradient-to-b from-blue-950/10 to-blue-900/5">
        {messages.length === 0 ? <div className="h-full flex items-center justify-center text-blue-300/60">
            <p>Send a message to start chatting</p>
          </div> : messages.map(message => <motion.div 
            key={message.id} 
            initial={{
              opacity: 0,
              y: 10
            }} 
            animate={{
              opacity: 1,
              y: 0
            }} 
            transition={{
              duration: 0.3
            }} 
            className={`group flex gap-3 ${message.isUser ? 'justify-end' : ''}`}>
            {!message.isUser && <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-blue-400" />
              </div>}
            <motion.div 
              initial={{
                scale: 0.95
              }} 
              animate={{
                scale: 1
              }} 
              transition={{
                duration: 0.2
              }} 
              className={`relative max-w-[80%] md:max-w-[75%] lg:max-w-[65%] rounded-lg p-3 ${message.isUser ? 'bg-blue-600/20 text-blue-100 rounded-tr-none shadow-md shadow-blue-900/10' : 'bg-blue-800/40 text-blue-100 rounded-tl-none shadow-md shadow-blue-900/10'}`}
            >
              {message.content}
              {!isLoading && <MessageActions 
                content={message.content}
                className="absolute top-2 right-2"
              />}
            </motion.div>
            {message.isUser && <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-blue-400" />
              </div>}
          </motion.div>)}
        
        {isLoading && (
          <motion.div 
            initial={{
              opacity: 0,
              y: 10
            }} 
            animate={{
              opacity: 1,
              y: 0
            }} 
            transition={{
              duration: 0.3
            }} 
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-blue-400" />
            </div>
            <div className="max-w-[80%] md:max-w-[75%] lg:max-w-[65%] rounded-lg p-3 bg-blue-800/40 text-blue-100 rounded-tl-none shadow-md shadow-blue-900/10">
              <TypingIndicator />
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 md:p-6 border-t border-blue-900/40 bg-blue-950/10">
        <div className="relative flex items-center max-w-4xl mx-auto">
          <Textarea 
            value={inputValue} 
            onChange={e => setInputValue(e.target.value)} 
            onKeyDown={handleKeyDown} 
            onFocus={() => setIsFocused(true)} 
            onBlur={() => setIsFocused(false)} 
            placeholder="Ask anything..." 
            className={`
              resize-none bg-[#0f172a]/90 border text-blue-100 pr-12 
              min-h-[56px] py-3 rounded-xl md:min-h-[64px] shadow-lg
              transition-all duration-300 placeholder:text-blue-300/30 
              focus:placeholder:opacity-50 focus:text-blue-50
              ${isFocused || inputValue ? 'shadow-[0_0_35px_rgba(59,130,246,0.4)] border-blue-400/50 scale-[1.02]' : 'border-blue-500/30'}
              ${isFocused ? 'shadow-[0_0_40px_rgba(59,130,246,0.4)] border-blue-300/50' : ''}
              hover:shadow-[0_0_30px_rgba(59,130,246,0.35)] hover:border-blue-400/40
              hover:scale-[1.01] hover:bg-[#0f172a]/95
            `} 
            disabled={isLoading} 
          />
          <div 
            className={`
              absolute inset-0 -z-10 transition-opacity duration-500
              bg-gradient-to-r from-blue-500/20 via-blue-400/20 to-blue-600/20
              blur-3xl rounded-full
              ${isFocused ? 'opacity-100' : 'opacity-0'}
            `} 
          />
          <Button 
            type="submit" 
            size="icon" 
            className={`
              absolute right-2 rounded-full text-white 
              w-10 h-10 flex items-center justify-center shadow-md
              transition-all duration-300
              ${!inputValue.trim() || isLoading ? 'bg-gray-700/30 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 cursor-pointer shadow-lg shadow-blue-900/30 hover:shadow-blue-800/40 hover:scale-105 active:scale-95'}
            `} 
            disabled={!inputValue.trim() || isLoading}
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : <ArrowUp className="h-5 w-5 text-white" />}
          </Button>
        </div>
      </form>
    </div>;
};

export default ChatInterface;
