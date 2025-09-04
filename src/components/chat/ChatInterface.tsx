
import { useState } from 'react';
import { useChat, ChatModel } from '@/context/ChatContext';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import ModelSelector from './ModelSelector';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import RecentChats from './RecentChats';
import { QueryLimitDisplay } from './QueryLimitDisplay';
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
    <div className="flex flex-col h-[calc(100vh-16rem)] max-w-7xl mx-auto">
      <div className="flex flex-1 overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-lg">
        {/* Left sidebar with recent chats - desktop */}
        <AnimatePresence>
          <motion.div 
            className="w-72 border-r border-border/50 bg-card/20 backdrop-blur-sm hidden lg:block overflow-y-auto" 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.3 }}
          >
            <div className="p-4 space-y-4">
              <RecentChats />
              
              <div className="border-t border-border/30 pt-4">
                <ModelSelector 
                  selectedModel={selectedModel} 
                  onModelChange={handleModelChange} 
                  onNewChat={startNewChat} 
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background/50 backdrop-blur-sm">
          {/* Query limit display */}
          <div className="border-b border-border/30">
            <QueryLimitDisplay />
          </div>
          
          {/* Mobile-only sidebar toggle and model selector */}
          <div className="lg:hidden border-b border-border/30 bg-card/20 backdrop-blur-sm">
            <div className="p-4">
              <ModelSelector 
                selectedModel={selectedModel} 
                onModelChange={handleModelChange} 
                onNewChat={startNewChat} 
              />
              <button 
                className="w-full mt-3 px-4 py-2 flex items-center justify-center text-sm rounded-lg bg-secondary/50 text-muted-foreground hover:bg-secondary/70 transition-colors border border-border/30" 
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
                  className="px-4 pb-4 overflow-hidden border-t border-border/30" 
                  transition={{ duration: 0.3 }}
                >
                  <RecentChats />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {chatId ? (
            <>
              <MessageList messages={messages} typingIndicator={isTyping} onReply={handleReplyClick} />
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
              className="flex-1 flex items-center justify-center p-8" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5 }}
            >
              <div className="text-center max-w-lg mx-auto">
                <div className="p-6 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/50 shadow-lg">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    <img 
                      src="/lovable-uploads/3baec192-88ed-42ea-80e5-61f5cfa40481.png" 
                      alt="Prism Chat Logo" 
                      className="h-8 w-8 brightness-0 invert"
                    />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Welcome to Prism Chat</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">Choose your AI model and start a conversation to experience the power of advanced artificial intelligence.</p>
                  <Button
                    onClick={startNewChat}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                  >
                    Start New Chat
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
