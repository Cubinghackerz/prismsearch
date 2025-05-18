
import React, { useState } from 'react';
import { Copy, Reply, CheckCheck, ThumbsUp, ThumbsDown, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from 'framer-motion';

interface MessageActionsProps {
  message: string;
  onReply: () => void;
}

const MessageActions: React.FC<MessageActionsProps> = ({ message, onReply }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [reactions, setReactions] = useState({
    thumbsUp: 0,
    thumbsDown: 0,
    heart: 0,
  });
  const [userReaction, setUserReaction] = useState<string | null>(null);
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      
      toast({
        title: "Copied to clipboard",
        description: "Message content copied successfully",
        duration: 2000,
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Could not copy the message content",
        duration: 2000,
      });
    }
  };

  const handleReaction = (reactionType: 'thumbsUp' | 'thumbsDown' | 'heart') => {
    if (userReaction === reactionType) {
      // User is removing their reaction
      setReactions(prev => ({
        ...prev,
        [reactionType]: Math.max(0, prev[reactionType] - 1)
      }));
      setUserReaction(null);
    } else {
      // User is adding a new reaction
      if (userReaction) {
        // Remove previous reaction
        setReactions(prev => ({
          ...prev,
          [userReaction]: Math.max(0, prev[userReaction as keyof typeof prev] - 1)
        }));
      }
      
      // Add new reaction
      setReactions(prev => ({
        ...prev,
        [reactionType]: prev[reactionType] + 1
      }));
      
      setUserReaction(reactionType);
    }
  };

  return (
    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={copyToClipboard}
              className="p-1 rounded-full hover:bg-blue-500/20 transition"
              aria-label="Copy message"
            >
              {copied ? 
                <CheckCheck className="h-3 w-3 text-blue-400" /> : 
                <Copy className="h-3 w-3 text-blue-400/70" />
              }
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Copy message</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={onReply}
              className="p-1 rounded-full hover:bg-blue-500/20 transition"
              aria-label="Reply to message"
            >
              <Reply className="h-3 w-3 text-blue-400/70" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Reply</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* Reaction buttons */}
      <div className="flex items-center space-x-1 ml-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => handleReaction('thumbsUp')}
                className={`p-1 rounded-full transition ${userReaction === 'thumbsUp' ? 'bg-blue-500/30 text-blue-300' : 'hover:bg-blue-500/20 text-blue-400/70'}`}
                aria-label="Like message"
              >
                <ThumbsUp className="h-3 w-3" />
                <AnimatePresence>
                  {reactions.thumbsUp > 0 && (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="ml-1 text-xs"
                    >
                      {reactions.thumbsUp}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Like</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => handleReaction('thumbsDown')}
                className={`p-1 rounded-full transition ${userReaction === 'thumbsDown' ? 'bg-blue-500/30 text-blue-300' : 'hover:bg-blue-500/20 text-blue-400/70'}`}
                aria-label="Dislike message"
              >
                <ThumbsDown className="h-3 w-3" />
                <AnimatePresence>
                  {reactions.thumbsDown > 0 && (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="ml-1 text-xs"
                    >
                      {reactions.thumbsDown}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Dislike</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => handleReaction('heart')}
                className={`p-1 rounded-full transition ${userReaction === 'heart' ? 'bg-blue-500/30 text-blue-300' : 'hover:bg-blue-500/20 text-blue-400/70'}`}
                aria-label="Love message"
              >
                <Heart className="h-3 w-3" />
                <AnimatePresence>
                  {reactions.heart > 0 && (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="ml-1 text-xs"
                    >
                      {reactions.heart}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Love</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default MessageActions;
