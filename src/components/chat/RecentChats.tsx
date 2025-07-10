
import { useState } from 'react';
import { useChat } from '@/context/ChatContext';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const RecentChats = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { startNewChat } = useChat();

  return (
    <div className="mb-2 border border-prism-border rounded-lg overflow-hidden bg-prism-primary/10 shadow-md">
      <div 
        className="p-3 flex items-center justify-between cursor-pointer bg-gradient-to-r from-prism-primary/20 to-prism-accent/20 hover:from-prism-primary/30 hover:to-prism-accent/30 transition-all duration-300" 
        onClick={() => setIsExpanded(prev => !prev)}
      >
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-prism-primary-light" />
          <span className="font-medium text-prism-text">Recent Chats</span>
        </div>
        {isExpanded ? (
          <ChevronUp size={18} className="text-prism-primary-light transition-transform duration-300" />
        ) : (
          <ChevronDown size={18} className="text-prism-primary-light transition-transform duration-300" />
        )}
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div className="p-4 text-center text-prism-text-muted/70">
              All chats are temporary and stored in memory only
            </div>
            
            <div className="p-2 border-t border-prism-border/30">
              <Button 
                variant="ghost" 
                onClick={() => startNewChat()} 
                className="w-full text-prism-primary hover:text-prism-text hover:bg-prism-primary/20 transition-all duration-300 bg-transparent text-xs"
              >
                Start New Chat
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecentChats;
