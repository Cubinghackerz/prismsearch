
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/context/ChatContext';

const RecentChats: React.FC = () => {
  const { startNewChat } = useChat();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="space-y-3">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors text-foreground border border-border/30"
      >
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span className="font-medium">Recent Chats</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${!isExpanded ? '-rotate-90' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden space-y-3"
          >
            <div className="text-sm text-muted-foreground text-center p-3 bg-muted/30 rounded-lg border border-border/30">
              Chats are temporary and reset on page refresh
            </div>
            
            <Button 
              onClick={startNewChat}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg"
              size="default"
            >
              <Plus className="h-4 w-4 mr-2" />
              Start New Chat
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecentChats;
