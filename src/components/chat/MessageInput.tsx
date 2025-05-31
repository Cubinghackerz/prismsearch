import { useState, useRef, useEffect } from 'react';
import { X, ArrowUp, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ChatMessage } from '@/context/ChatContext';
import DeepResearchButton from './DeepResearchButton';

interface MessageInputProps {
  onSendMessage: (content: string, parentMessageId?: string | null) => void;
  isLoading: boolean;
  messages: ChatMessage[];
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading,
  messages,
  replyingTo,
  setReplyingTo
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  // Create sparks with different positions and timing
  const sparks = Array.from({ length: 15 }, (_, i) => i);
  
  // Generate random position based on input bar width
  const getRandomPosition = () => {
    return Math.floor(Math.random() * 95) + 2; // between 2% and 97% of width
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    await onSendMessage(inputValue, replyingTo);
    setInputValue('');
    setReplyingTo(null);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  const getReplyingToMessage = () => {
    if (!replyingTo) return null;
    return messages.find(m => m.id === replyingTo);
  };

  return (
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
            resize-none bg-[#1A1F2C]/90 border text-orange-100 pr-24 
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
        
        {/* Fiery sparks animation */}
        {isFocused && !isLoading && (
          <>
            {sparks.map((i) => {
              const position = getRandomPosition();
              const delay = (i * 0.2) % 3; // Staggered delays that loop
              
              return (
                <motion.div
                  key={`chat-spark-${i}`}
                  className="absolute pointer-events-none fiery-spark"
                  style={{ 
                    bottom: '0px',
                    left: `${position}%`,
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
                      delay: delay,
                      ease: "easeOut"
                    }
                  }}
                >
                  <div className="spark-animation w-2 h-2 rounded-full 
                    bg-gradient-to-t from-orange-500 via-orange-300 to-yellow-200
                    shadow-[0_0_10px_rgba(255,158,44,0.7)]" 
                  />
                </motion.div>
              );
            })}
          </>
        )}
        
        <div className={`
            absolute inset-0 -z-10 transition-opacity duration-500
            bg-gradient-to-r from-orange-500/20 via-orange-400/20 to-orange-600/20
            blur-3xl rounded-full
            ${isFocused ? 'opacity-100' : 'opacity-0'}
          `} />
        
        <div className="absolute right-2 flex items-center gap-2">
          <DeepResearchButton 
            topic={inputValue}
            disabled={!inputValue.trim() || isLoading}
          />
          
          <Button 
            type="submit" 
            size="icon" 
            className={`
              rounded-full text-white 
              w-10 h-10 flex items-center justify-center shadow-md
              transition-all duration-300
              ${!inputValue.trim() || isLoading ? 'bg-gray-700/30 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 cursor-pointer shadow-lg shadow-orange-900/30 hover:shadow-orange-800/40 hover:scale-105 active:scale-95 ember-glow'}
            `} 
            disabled={!inputValue.trim() || isLoading}
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : <ArrowUp className="h-5 w-5 text-white" />}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default MessageInput;
