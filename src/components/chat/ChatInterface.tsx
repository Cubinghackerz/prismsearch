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
import { Settings, Plus, MessageSquare } from 'lucide-react';
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
  const [showSidebar, setShowSidebar] = useState(false);

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

  // When there are no messages and no active chat, show the welcome screen
  const showWelcomeScreen = !chatId || (messages.length === 0 && !isTyping);

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)] max-w-4xl mx-auto">
      <div className="flex flex-1 overflow-hidden">
        {/* Collapsible Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div 
              className="w-80 bg-card/20 backdrop-blur-sm border-r border-border/50 overflow-y-auto" 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Chat Settings</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowSidebar(false)}
                    className="h-8 w-8 p-0"
                  >
                    ×
                  </Button>
                </div>
                
                <RecentChats />
                
                <div className="border-t border-border/30 pt-6">
                  <ModelSelector 
                    selectedModel={selectedModel} 
                    onModelChange={handleModelChange} 
                    onNewChat={startNewChat} 
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background/50 backdrop-blur-sm">
          {/* Top bar with controls */}
          <div className="flex items-center justify-between p-4 border-b border-border/30">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
              </Button>
              {chatId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={startNewChat}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Chat
                </Button>
              )}
            </div>
            <QueryLimitDisplay />
          </div>

          {showWelcomeScreen ? (
            /* Welcome Screen */
            <motion.div 
              className="flex-1 flex items-center justify-center p-8" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5 }}
            >
              <div className="text-center max-w-2xl mx-auto space-y-8">
                {/* Welcome Message */}
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                    What's on the agenda today?
                  </h1>
                </div>

                {/* Input Area */}
                <div className="relative max-w-2xl mx-auto">
                  <MessageInput 
                    onSendMessage={handleSubmit} 
                    isLoading={isLoading} 
                    messages={messages} 
                    replyingTo={replyingTo} 
                    setReplyingTo={setReplyingTo}
                    isWelcomeMode={true}
                  />
                </div>

                {/* Quick Start Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto mt-8">
                  <Button 
                    variant="outline" 
                    className="p-4 h-auto flex-col space-y-2 border-border/50 hover:border-primary/50"
                    onClick={() => handleSubmit("Help me solve a complex math problem")}
                  >
                    <span className="font-medium">Solve Math Problems</span>
                    <span className="text-sm text-muted-foreground">Get step-by-step solutions</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="p-4 h-auto flex-col space-y-2 border-border/50 hover:border-primary/50"
                    onClick={() => handleSubmit("Explain a scientific concept to me")}
                  >
                    <span className="font-medium">Learn Science</span>
                    <span className="text-sm text-muted-foreground">Get detailed explanations</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Active Chat View */
            <>
              <MessageList 
                messages={messages} 
                typingIndicator={isTyping} 
                onReply={handleReplyClick} 
              />
              <MessageInput 
                onSendMessage={handleSubmit} 
                isLoading={isLoading} 
                messages={messages} 
                replyingTo={replyingTo} 
                setReplyingTo={setReplyingTo}
                isWelcomeMode={false}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;