import { useState, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { format } from 'date-fns';
import { MessageSquare, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatHistory {
  id: string;
  created_at: string;
  preview: string;
}

const RecentChats = () => {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { startNewChat, loadChatById, deleteChat, chatId } = useChat();

  // Fetch chat history from Supabase
  const fetchChatHistory = async () => {
    setIsLoading(true);
    try {
      // Get distinct chat_ids and the most recent message as preview
      const { data, error } = await supabase
        .from('chat_messages')
        .select('chat_id, created_at, content')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching chat history:', error);
        setIsLoading(false);
        return;
      }

      // Group by chat_id and take the most recent one as preview
      const groupedChats = data.reduce((acc: Record<string, any>, item) => {
        // If this chat_id isn't in our accumulator yet or this message is newer
        if (!acc[item.chat_id] || new Date(item.created_at) > new Date(acc[item.chat_id].created_at)) {
          acc[item.chat_id] = {
            id: item.chat_id,
            created_at: item.created_at,
            preview: item.content.substring(0, 50) + (item.content.length > 50 ? '...' : '')
          };
        }
        return acc;
      }, {});

      // Convert to array and sort by date (newest first)
      const recentChats = Object.values(groupedChats)
        .sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 10); // Limit to 10 most recent chats

      setChatHistory(recentChats as ChatHistory[]);
    } catch (e) {
      console.error('Unexpected error fetching chat history:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
    
    // Set up a listener for new messages to update the history
    const channel = supabase
      .channel('chat_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chat_messages' }, 
        () => {
          fetchChatHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleChatSelect = async (chatId: string) => {
    await loadChatById(chatId);
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(chatId);
    
    try {
      // Use the deleteChat function from context
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
        {isExpanded ? 
          <ChevronUp size={18} className="text-orange-300 transition-transform duration-300" /> : 
          <ChevronDown size={18} className="text-orange-300 transition-transform duration-300" />
        }
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {isLoading ? (
              <div className="p-4 text-center text-orange-300/70">
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] mr-2"></div>
                Loading recent chats...
              </div>
            ) : chatHistory.length > 0 ? (
              <div className="max-h-64 overflow-y-auto">
                {chatHistory.map((chat) => (
                  <motion.div 
                    key={chat.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`p-3 border-t border-orange-500/10 hover:bg-orange-500/10 cursor-pointer flex justify-between items-start transition-colors ${chatId === chat.id ? 'bg-orange-500/20' : ''}`}
                    onClick={() => handleChatSelect(chat.id)}
                  >
                    <div className="flex-1">
                      <div className="text-sm text-orange-100 mb-1 line-clamp-1">{chat.preview}</div>
                      <div className="text-xs text-orange-300/60">{formatDate(chat.created_at)}</div>
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
              <div className="p-4 text-center text-orange-300/70">No recent chats</div>
            )}
            
            <div className="p-2 border-t border-orange-500/10">
              <Button 
                variant="ghost" 
                className="w-full text-orange-300 hover:text-orange-200 hover:bg-orange-500/20 transition-all duration-300 bg-transparent"
                onClick={() => startNewChat()}
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
