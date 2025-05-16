import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Bot, User, Loader2, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat, ChatModel, ChatMessage } from '@/context/ChatContext';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert } from "@/components/ui/alert";
import TypingIndicator from './TypingIndicator';
import MessageActions from './MessageActions';
import { useToast } from '@/hooks/use-toast';

const ChatInterface = () => {
  const {
    messages,
    sendMessage,
    isLoading,
    isTyping,
    startNewChat,
    selectModel,
    selectedModel
  } = useChat();
  
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  // Create sparks with different positions and timing
  const sparks = Array.from({ length: 10 }, (_, i) => i);
  
  // Generate random position based on input bar width
  const getRandomPosition = (i: number) => {
    // Use pre-calculated positions for initial render
    const basePositions = [10, 22, 35, 47, 60, 72, 85, 92, 78, 65];
    return basePositions[i % basePositions.length];
  };
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, isTyping]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    await sendMessage(inputValue, replyingTo);
    setInputValue('');
    setReplyingTo(null);
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
  
  const getReplyingToMessage = () => {
    if (!replyingTo) return null;
    return messages.find(m => m.id === replyingTo);
  };
  
  const renderThreadIndicator = (message: ChatMessage) => {
    if (!message.parentMessageId) return null;
    const parentMessage = messages.find(m => m.id === message.parentMessageId);
    if (!parentMessage) return null;
    return <div className="ml-11 mb-1 mt-1 flex items-center text-xs text-blue-300/50">
        <div className="h-5 border-l-2 border-blue-500/30 mr-2"></div>
        <span>In reply to: "{parentMessage.content.substring(0, 30)}..."</span>
      </div>;
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
                  
                  <span className="text-sm text-blue-300/70">Efficient AI assistant</span>
                </div>
              </label>
            </div>

            <div className="relative flex items-center">
              <RadioGroupItem value="groq" id="groq" className="peer sr-only" />
              <label htmlFor="groq" className={`flex flex-col w-full p-4 border rounded-lg cursor-pointer transition-all duration-200 ${selectedModel === 'groq' ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-400/50' : 'bg-blue-900/20 border-blue-500/30 hover:bg-blue-800/20'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-blue-200">Llama-3-70B (Groq)</span>
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
                  <span className="px-2 py-1 text-xs bg-yellow-500/30 text-yellow-300 rounded-full">Fast and Accurate</span>
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
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-blue-300/60">
            <p>Send a message to start chatting</p>
          </div>
        ) : messages.map(message => (
          <div key={message.id}>
            {renderThreadIndicator(message)}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${message.isUser ? 'justify-end' : ''} group`}
            >
              {!message.isUser && (
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
              )}
              
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`max-w-[80%] md:max-w-[75%] lg:max-w-[65%] rounded-lg p-3 relative ${
                  message.isUser
                    ? 'bg-blue-600/20 text-blue-100 rounded-tr-none shadow-md shadow-blue-900/10'
                    : 'bg-blue-800/40 text-blue-100 rounded-tl-none shadow-md shadow-blue-900/10'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {message.content}
                  </div>
                  
                  <div className="ml-2 mt-1">
                    <MessageActions message={message.content} onReply={() => setReplyingTo(message.id)} />
                  </div>
                </div>
              </motion.div>
              
              {message.isUser && (
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
              )}
            </motion.div>
          </div>
        ))}
        
        {/* Display typing indicator when AI is generating a response */}
        {isTyping && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 md:p-6 border-t border-blue-900/40 bg-blue-950/10">
        {/* Replying to message indicator */}
        {replyingTo && (
          <div className="mb-2 p-2 rounded-lg bg-blue-900/30 border border-blue-700/30 flex justify-between items-center">
            <div className="flex items-center text-sm text-blue-300">
              <span>
                Replying to: "{getReplyingToMessage()?.content.substring(0, 50)}
                {getReplyingToMessage()?.content.length! > 50 ? '...' : ''}
                "
              </span>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => setReplyingTo(null)} className="p-1 h-6 w-6">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="relative flex items-center max-w-4xl mx-auto">
          <Textarea 
            ref={textAreaRef}
            value={inputValue} 
            onChange={e => setInputValue(e.target.value)} 
            onKeyDown={handleKeyDown} 
            onFocus={() => setIsFocused(true)} 
            onBlur={() => setIsFocused(false)} 
            placeholder="Ask anything..." 
            className={`
              resize-none bg-[#1A1F2C]/90 border text-orange-100 pr-12 
              min-h-[56px] py-3 rounded-xl md:min-h-[64px] shadow-lg
              transition-all duration-300 placeholder:text-orange-300/30 
              focus:placeholder:opacity-50 focus:text-orange-50
              ${isFocused || inputValue ? 'shadow-[0_0_35px_rgba(255,158,44,0.4)] border-orange-400/50 scale-[1.02]' : 'border-orange-500/30'}
              ${isFocused ? 'shadow-[0_0_40px_rgba(255,158,44,0.4)] border-orange-300/50' : ''}
              hover:shadow-[0_0_30px_rgba(255,158,44,0.35)] hover:border-orange-400/40
              hover:scale-[1.01] hover:bg-[#1A1F2C]/95
            `} 
            disabled={isLoading} 
          />
          
          {/* Fiery sparks animation - distributed across the textarea */}
          {isFocused && !isLoading && (
            <>
              {sparks.map((i) => (
                <motion.div
                  key={`chat-spark-${i}`}
                  className="absolute pointer-events-none fiery-spark"
                  style={{ 
                    bottom: '0px',
                    left: `${getRandomPosition(i)}%`,
                    zIndex: 5
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0.2, 1, 0.2],
                    y: [-5, -25, -45],
                    transition: {
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "loop" as const,
                      delay: i * 0.3, // Different delay for each spark
                      ease: "easeOut"
                    }
                  }}
                >
                  <div className="spark-animation w-2 h-2 rounded-full 
                    bg-gradient-to-t from-orange-500 via-orange-300 to-yellow-200
                    shadow-[0_0_10px_rgba(255,158,44,0.7)]" 
                  />
                </motion.div>
              ))}
            </>
          )}
          
          <div className={`
              absolute inset-0 -z-10 transition-opacity duration-500
              bg-gradient-to-r from-orange-500/20 via-orange-400/20 to-orange-600/20
              blur-3xl rounded-full
              ${isFocused ? 'opacity-100' : 'opacity-0'}
            `} />
          
          <Button 
            type="submit" 
            size="icon" 
            className={`
              absolute right-2 rounded-full text-white 
              w-10 h-10 flex items-center justify-center shadow-md
              transition-all duration-300
              ${!inputValue.trim() || isLoading ? 'bg-gray-700/30 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 cursor-pointer shadow-lg shadow-orange-900/30 hover:shadow-orange-800/40 hover:scale-105 active:scale-95 ember-glow'}
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
