
import { useState } from 'react';
import { useChat } from '@/context/ChatContext';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const RecentChats = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { startNewChat } = useChat();

  return (
    <div className="mb-2 border border-orange-500/20 rounded-lg overflow-hidden bg-orange-900/10 shadow-md">
      <div 
        className="p-3 flex items-center justify-between cursor-pointer bg-gradient-to-r from-orange-600/20 to-orange-800/20 hover:from-orange-600/30 hover:to-orange-800/30 transition-all duration-300"
        onClick={() => setIsExpanded(prev => !prev)}
      >
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-orange-300" />
          <span className="font-medium text-orange-100">Temporary Chat</span>
        </div>
        {isExpanded ? (
          <ChevronUp size={18} className="text-orange-300 transition-transform duration-300" />
        ) : (
          <ChevronDown size={18} className="text-orange-300 transition-transform duration-300" />
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
            <div className="p-4 text-center text-orange-300/70">
              Messages are temporary and not saved
            </div>
            
            <div className="p-2 border-t border-orange-500/10">
              <Button
                variant="ghost"
                onClick={() => startNewChat()}
                className="w-full text-orange-300 hover:text-orange-200 hover:bg-orange-500/20 transition-all duration-300 bg-transparent text-xs"
              >
                Start New Chat (Messages are temporary)
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecentChats;
