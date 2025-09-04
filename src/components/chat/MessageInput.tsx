import { useState, useRef, useEffect } from 'react';
import { X, ArrowUp, Loader2, Plus, Mic, Paperclip } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@/context/ChatContext';
import { useDailyQueryLimit } from '@/hooks/useDailyQueryLimit';

interface MessageInputProps {
  onSendMessage: (content: string, parentMessageId?: string | null) => void;
  isLoading: boolean;
  messages: ChatMessage[];
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  isWelcomeMode?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading,
  messages,
  replyingTo,
  setReplyingTo,
  isWelcomeMode = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { isLimitReached } = useDailyQueryLimit();
  
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
    <div className={`${isWelcomeMode ? '' : 'border-t border-border/30 bg-card/20 backdrop-blur-sm'}`}>
      <form onSubmit={handleSubmit} className={isWelcomeMode ? "" : "p-6"}>
        {/* Replying to message indicator */}
        {replyingTo && !isWelcomeMode && (
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
        
        <div className={`relative flex items-end gap-3 ${isWelcomeMode ? 'max-w-2xl mx-auto' : 'max-w-4xl mx-auto'}`}>
          <div className="relative flex-1">
            {/* ChatGPT-style input container */}
            <div className={`
              relative flex items-center bg-muted/30 backdrop-blur-sm rounded-3xl border border-border/30 
              transition-all duration-300 
              ${isFocused ? 'border-primary/50 shadow-lg shadow-primary/10' : 'hover:border-border/50'}
              ${isLimitReached ? 'opacity-50 cursor-not-allowed' : ''}
            `}>
              {/* Plus button on the left */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="ml-3 h-8 w-8 text-muted-foreground hover:text-foreground flex-shrink-0"
                disabled={isInputDisabled}
              >
                <Plus className="h-4 w-4" />
              </Button>

              {/* Text input */}
              <Textarea 
                ref={textAreaRef}
                value={inputValue} 
                onChange={e => setInputValue(e.target.value)} 
                onKeyDown={handleKeyDown} 
                onFocus={() => setIsFocused(true)} 
                onBlur={() => setIsFocused(false)} 
                placeholder={isLimitReached ? "Daily limit reached" : "Ask anything"}
                className={`
                  flex-1 border-0 bg-transparent resize-none text-foreground placeholder:text-muted-foreground/60
                  focus-visible:ring-0 focus-visible:ring-offset-0 min-h-0 py-4 px-4
                  ${isInputDisabled ? 'cursor-not-allowed' : ''}
                `} 
                disabled={isInputDisabled}
                rows={1}
                style={{ minHeight: '24px', maxHeight: '120px' }}
              />
              
              {/* Right side buttons */}
              <div className="flex items-center space-x-2 mr-3 flex-shrink-0">
                {/* Attachment button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  disabled={isInputDisabled}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>

                {/* Microphone button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  disabled={isInputDisabled}
                >
                  <AnimatePresence>
                    <motion.div
                      key="send-button"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button 
                        type="submit" 
                        size="icon" 
                        className={`
                          h-8 w-8 rounded-full shadow-sm
                          ${!inputValue.trim() || isInputDisabled 
                            ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50' 
                            : 'bg-foreground text-background hover:bg-foreground/90'
                          }
                        `} 
                        disabled={!inputValue.trim() || isInputDisabled}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowUp className="h-4 w-4" />
                        )}
                      </Button>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>
            
            {/* Glow effect when focused */}
            {isFocused && !isLoading && !isLimitReached && (
              <motion.div
                className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 blur-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </div>
          
          {/* Deep Research Button - only show when not in welcome mode */}
        </div>
      </form>
    </div>
  );
};

export default MessageInput;