
import { useState, useRef, useEffect } from 'react';
import { X, ArrowUp, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ChatMessage } from '@/context/ChatContext';
import { useDailyQueryLimit } from '@/hooks/useDailyQueryLimit';
import DeepResearchButton from './DeepResearchButton';
import { QueryLimitDisplay } from './QueryLimitDisplay';

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
  const { isLimitReached } = useDailyQueryLimit();
  
  // Create sparks with different positions and timing
  const sparks = Array.from({ length: 15 }, (_, i) => i);
  
  // Generate random position based on input bar width
  const getRandomPosition = () => {
    return Math.floor(Math.random() * 95) + 2; // between 2% and 97% of width
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || isLimitReached) return;
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

  const isInputDisabled = isLoading || isLimitReached;

  return (
    <div className="border-t border-border/30 bg-card/20 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="p-6">
        {/* Replying to message indicator */}
        {replyingTo && (
          <div className="mb-4 p-3 rounded-xl bg-secondary/50 border border-border/50 flex justify-between items-center backdrop-blur-sm">
            <div className="flex items-center text-sm text-foreground">
              <span>
                Replying to: "{getReplyingToMessage()?.content.substring(0, 50)}
                {getReplyingToMessage()?.content.length! > 50 ? '...' : ''}
                "
              </span>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => setReplyingTo(null)} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="relative flex items-end gap-3 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <Textarea 
              ref={textAreaRef}
              value={inputValue} 
              onChange={e => setInputValue(e.target.value)} 
              onKeyDown={handleKeyDown} 
              onFocus={() => setIsFocused(true)} 
              onBlur={() => setIsFocused(false)} 
              placeholder={isLimitReached ? "Daily limit reached" : "Ask anything..."}
              className={`
                resize-none bg-background/90 backdrop-blur-sm border-border/50 text-foreground
                min-h-[60px] py-4 px-4 rounded-2xl shadow-sm
                transition-all duration-300 placeholder:text-muted-foreground/60
                focus:placeholder:opacity-40 focus:shadow-lg focus:border-primary/50
                ${isLimitReached ? 'opacity-50 cursor-not-allowed' : ''}
                ${isFocused ? 'border-primary/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]' : ''}
                hover:border-primary/30 hover:shadow-md
              `} 
              disabled={isInputDisabled}
              rows={1}
            />
            
            {/* Modern glow effect */}
            {isFocused && !isLoading && !isLimitReached && (
              <motion.div
                className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 blur-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <DeepResearchButton 
              topic={inputValue}
              disabled={!inputValue.trim() || isInputDisabled}
            />
            
            <Button 
              type="submit" 
              size="icon" 
              className={`
                rounded-2xl h-[60px] w-[60px] shadow-md
                transition-all duration-300
                ${!inputValue.trim() || isInputDisabled 
                  ? 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:scale-105 active:scale-95'
                }
              `} 
              disabled={!inputValue.trim() || isInputDisabled}
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <ArrowUp className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
