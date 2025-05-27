
import { useState, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { format } from 'date-fns';
import { MessageSquare, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatHistory {
  id: string;
  created_at: string;
  preview: string;
}

const RecentChats = () => {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const {
    startNewChat,
    loadChatById,
    deleteChat,
    chatId,
    getTempChats
  } = useChat();

  // Load chat history from memory
  const fetchChatHistory = () => {
    if (getTempChats) {
      const tempChats = getTempChats();
      setChatHistory(tempChats);
    }
  };

  useEffect(() => {
    fetchChatHistory();
    
    // Refresh every few seconds to show new chats
    const interval = setInterval(fetchChatHistory, 2000);
    return () => clearInterval(interval);
  }, [getTempChats]);

  const handleChatSelect = async (chatId: string) => {
    await loadChatById(chatId);
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(chatId);
    try {
      await deleteChat(chatId);
      // Remove from local state immediately for better UX
      setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    } finally {
      setIsDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return 'Today, ' + format(date, 'h:mm a');
    }
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    if (isYesterday) {
      return 'Yesterday, ' + format(date, 'h:mm a');
    }
    return format(date, 'MMM d, h:mm a');
  };

  return (
    <div className="mb-2 border border-orange-500/20 rounded-lg overflow-hidden bg-orange-900/10 shadow-md">
      <div 
        className="p-3 flex items-center justify-between cursor-pointer bg-gradient-to-r from-orange-600/20 to-orange-800/20 hover:from-orange-600/30 hover:to-orange-800/30 transition-all duration-300" 
        onClick={() => setIsExpanded(prev => !prev)}
      >
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-orange-300" />
          <span className="font-medium text-orange-100">Recent Chats</span>
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
            {chatHistory.length > 0 ? (
              <div className="max-h-64 overflow-y-auto">
                {chatHistory.map(chat => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`p-3 border-t border-orange-500/10 hover:bg-orange-500/10 cursor-pointer flex justify-between items-start transition-colors ${
                      chatId === chat.id ? 'bg-orange-500/20' : ''
                    }`}
                    onClick={() => handleChatSelect(chat.id)}
                  >
                    <div className="flex-1">
                      <div className="text-sm text-orange-100 mb-1 line-clamp-1">
                        {chat.preview}
                      </div>
                      <div className="text-xs text-orange-300/60">
                        {formatDate(chat.created_at)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-orange-300/40 hover:text-orange-300/80 hover:bg-orange-500/20 transition-colors relative"
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      disabled={isDeleting === chat.id}
                    >
                      {isDeleting === chat.id ? (
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-solid border-current border-e-transparent" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </Button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-orange-300/70">
                No recent chats
              </div>
            )}
            
            <div className="p-2 border-t border-orange-500/10">
              <Button
                variant="ghost"
                onClick={() => startNewChat()}
                className="w-full text-orange-300 hover:text-orange-200 hover:bg-orange-500/20 transition-all duration-300 bg-transparent text-xs"
              >
                Start New Chat (Chats are temporary)
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecentChats;
