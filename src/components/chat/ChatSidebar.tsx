
import { useState, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { Folder, FolderOpen, MessageSquareX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface SavedChat {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
}

const ChatSidebar = () => {
  const { chatId, messages, startNewChat, loadChat, deleteChat, selectedModel } = useChat();
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  
  // Load saved chats from localStorage
  useEffect(() => {
    const loadSavedChats = () => {
      try {
        const savedChatsData = localStorage.getItem('prism_saved_chats');
        if (savedChatsData) {
          const parsedChats = JSON.parse(savedChatsData);
          // Convert string timestamps back to Date objects
          const chatsWithDates = parsedChats.map((chat: any) => ({
            ...chat,
            timestamp: new Date(chat.timestamp)
          }));
          setSavedChats(chatsWithDates);
        }
      } catch (error) {
        console.error('Failed to load saved chats:', error);
      }
    };
    
    loadSavedChats();
  }, []);
  
  // Effect to save current chat when messages change
  useEffect(() => {
    if (chatId && messages.length > 1) {
      const userMessage = messages.find(msg => msg.isUser)?.content || '';
      const aiResponse = messages.find(msg => !msg.isUser)?.content || '';
      
      // Create a title from the first user message (max 30 chars)
      const chatTitle = userMessage.length > 30 
        ? `${userMessage.substring(0, 30)}...` 
        : userMessage || 'New Chat';
      
      // Create or update the saved chat
      const updatedChat: SavedChat = {
        id: chatId,
        title: chatTitle,
        timestamp: new Date(),
        preview: aiResponse.substring(0, 60) + (aiResponse.length > 60 ? '...' : '')
      };
      
      // Update localStorage
      const existingChatsData = localStorage.getItem('prism_saved_chats');
      let existingChats: SavedChat[] = [];
      
      if (existingChatsData) {
        try {
          existingChats = JSON.parse(existingChatsData);
        } catch (error) {
          console.error('Error parsing saved chats:', error);
        }
      }
      
      // Check if this chat already exists in the saved chats
      const chatIndex = existingChats.findIndex(chat => chat.id === chatId);
      
      if (chatIndex >= 0) {
        // Update existing chat
        existingChats[chatIndex] = updatedChat;
      } else {
        // Add new chat
        existingChats.push(updatedChat);
      }
      
      // Save to localStorage and update state
      localStorage.setItem('prism_saved_chats', JSON.stringify(existingChats));
      setSavedChats(existingChats);
    }
  }, [chatId, messages]);

  const handleSelectChat = (id: string) => {
    loadChat(id);
  };

  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    // Remove from context
    deleteChat(id);
    
    // Remove from saved chats
    const updatedChats = savedChats.filter(chat => chat.id !== id);
    setSavedChats(updatedChats);
    
    // Update localStorage
    localStorage.setItem('prism_saved_chats', JSON.stringify(updatedChats));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4">
        <Button 
          variant="default" 
          className="w-full bg-blue-600 hover:bg-blue-700 shadow-md"
          onClick={startNewChat}
        >
          New Chat
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-2">
        <h3 className="text-blue-200 font-medium text-sm mb-2 px-2">Recent Chats</h3>
        
        {savedChats.length === 0 ? (
          <div className="text-center p-4 text-blue-300/60 text-sm">
            No saved chats yet
          </div>
        ) : (
          <motion.ul 
            className="space-y-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.05 }}
          >
            {savedChats
              .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
              .map(chat => (
                <motion.li 
                  key={chat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group"
                >
                  <div 
                    onClick={() => handleSelectChat(chat.id)}
                    className={`
                      flex items-start gap-2 p-2 rounded-md cursor-pointer hover:bg-blue-600/20 
                      ${chatId === chat.id ? 'bg-blue-600/30 ring-1 ring-blue-500/50' : ''}
                    `}
                  >
                    {chatId === chat.id ? (
                      <FolderOpen className="w-4 h-4 text-blue-400 mt-1 shrink-0" />
                    ) : (
                      <Folder className="w-4 h-4 text-blue-300 mt-1 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm text-blue-200 truncate">
                          {chat.title}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 p-0 text-blue-400 opacity-0 group-hover:opacity-100 hover:opacity-100 hover:bg-blue-700/30"
                          onClick={(e) => handleDeleteChat(e, chat.id)}
                        >
                          <MessageSquareX className="h-3.5 w-3.5" />
                          <span className="sr-only">Delete chat</span>
                        </Button>
                      </div>
                      <p className="text-xs text-blue-300/70 truncate">{chat.preview}</p>
                    </div>
                  </div>
                </motion.li>
              ))
            }
          </motion.ul>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
