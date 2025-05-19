
import { useState } from 'react';
import { useChat, ChatModel } from '@/context/ChatContext';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ModelSelector from './ModelSelector';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import RecentChats from './RecentChats';
import '../search/searchStyles.css';

const ChatInterface = () => {
  const {
    messages,
    sendMessage,
    isLoading,
    isTyping,
    startNewChat,
    selectModel,
    selectedModel,
    chatId
  } = useChat();
  
  const { toast } = useToast();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  const handleSubmit = async (content: string, parentMessageId: string | null = null) => {
    if (!content.trim() || isLoading) return;
    await sendMessage(content, parentMessageId || undefined);
  };
  
  const handleModelChange = (value: string) => {
    selectModel(value as ChatModel);
  };
  
  const handleReplyClick = (messageId: string) => {
    setReplyingTo(messageId);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(prev => !prev);
  };

  return (
    <div className="flex flex-col h-full bg-orange-950/20 backdrop-blur-md rounded-xl border border-orange-500/30 shadow-lg">
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar with recent chats - desktop */}
        <AnimatePresence>
          <motion.div 
            className="w-64 p-2 border-r border-orange-500/20 bg-orange-900/5 hidden md:block overflow-y-auto"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <RecentChats />
            
            <div className="mt-3">
              <ModelSelector 
                selectedModel={selectedModel}
                onModelChange={handleModelChange}
                onNewChat={startNewChat}
              />
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile-only sidebar toggle and model selector */}
          <div className="md:hidden border-b border-orange-500/20 bg-orange-900/5">
            <ModelSelector 
              selectedModel={selectedModel}
              onModelChange={handleModelChange}
              onNewChat={startNewChat}
            />
            <div className="px-3 pb-2">
              <button 
                className="w-full px-3 py-2 flex items-center justify-center text-sm rounded-lg bg-orange-500/20 text-orange-200 hover:bg-orange-500/30 transition-colors"
                onClick={toggleMobileSidebar}
              >
                Recent Chats {mobileSidebarOpen ? '▲' : '▼'}
              </button>
            </div>
            <AnimatePresence>
              {mobileSidebarOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-2 overflow-hidden"
                  transition={{ duration: 0.3 }}
                >
                  <RecentChats />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {chatId ? (
            <>
              <MessageList 
                messages={messages}
                isTyping={isTyping}
                onReplyClick={handleReplyClick}
              />

              <MessageInput 
                onSendMessage={handleSubmit}
                isLoading={isLoading}
                messages={messages}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
              />
            </>
          ) : (
            <motion.div 
              className="flex-1 flex items-center justify-center p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center max-w-md mx-auto p-6 rounded-lg bg-orange-950/20 border border-orange-500/20 shadow-lg">
                <h3 className="text-xl font-semibold text-orange-100 mb-3">Welcome to Prism Chat</h3>
                <p className="text-orange-200 mb-4">
                  Choose a recent chat from the sidebar or start a new conversation to begin.
                </p>
                <motion.button 
                  onClick={startNewChat}
                  className="px-4 py-2 bg-orange-600/60 hover:bg-orange-600/80 text-white rounded-md transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start New Chat
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
