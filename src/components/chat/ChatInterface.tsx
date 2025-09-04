import { useState, useEffect, useRef } from 'react';
import { useChat, ChatModel } from '@/context/ChatContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ModelSelector from './ModelSelector';
import { MessageSquare, Settings, Archive, ToggleLeft, ToggleRight, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';


const ChatInterface = () => {
  const {
    messages,
    sendMessage,
    isLoading,
    isTyping,
    startNewChat,
    selectModel,
    selectedModel,
    chatId,
    isTemporaryMode,
    setIsTemporaryMode,
    loadChat,
    getSavedChats
  } = useChat();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat on mount
  useEffect(() => {
    if (!chatId) {
      startNewChat();
    }
  }, [chatId, startNewChat]);

  const loadSavedChat = (chatToLoad: {id: string, preview: string, timestamp: number}) => {
    loadChat(chatToLoad.id);
    toast({
      title: "Chat Loaded",
      description: "Successfully loaded your saved chat.",
    });
  };

  const deleteSavedChat = (chatId: string) => {
    // Remove from localStorage
    localStorage.removeItem(`chat_${chatId}`);
    const chatIds = JSON.parse(localStorage.getItem('chatIds') || '[]');
    const updatedIds = chatIds.filter((id: string) => id !== chatId);
    localStorage.setItem('chatIds', JSON.stringify(updatedIds));
    
    toast({
      title: "Chat Deleted",
      description: "The chat has been removed from your saved chats.",
    });
  };

  const clearAllChats = () => {
    if (confirm('Are you sure you want to delete all saved chats? This action cannot be undone.')) {
      const chatIds = JSON.parse(localStorage.getItem('chatIds') || '[]');
      chatIds.forEach((id: string) => {
        localStorage.removeItem(`chat_${id}`);
      });
      localStorage.removeItem('chatIds');
      
      toast({
        title: "All Chats Deleted",
        description: "All saved chats have been cleared.",
      });
    }
  };

  const toggleTemporaryMode = () => {
    setIsTemporaryMode(!isTemporaryMode);
    if (!isTemporaryMode) {
      toast({
        title: "Temporary Mode Enabled",
        description: "Your chats will not be saved in this mode.",
      });
    } else {
      toast({
        title: "Temporary Mode Disabled",  
        description: "Your chats will now be saved automatically.",
      });
    }
  };

  const handleSubmit = async (content: string, parentMessageId: string | null = null) => {
    if (!content.trim() || isLoading) return;
    
    // Ensure we have a chat ID
    if (!chatId) {
      startNewChat();
    }
    
    await sendMessage(content, parentMessageId || undefined);
    
    // Auto-scroll to bottom after sending
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleReplyClick = (messageId: string) => {
    setReplyingTo(messageId);
  };

  // Auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // When there are no messages and no active chat, show the welcome screen
  const showWelcomeScreen = !chatId || (messages.length === 0 && !isTyping);

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <div className="w-16 bg-muted/20 border-r border-border/30 flex flex-col items-center py-4 space-y-4">
        {/* Home Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="h-10 w-10 rounded-lg hover:bg-primary/20 text-muted-foreground hover:text-primary"
          title="Go to Home"
        >
          <Home className="h-5 w-5" />
        </Button>

        {/* New Chat Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={startNewChat}
          className="h-10 w-10 rounded-lg hover:bg-primary/20 text-muted-foreground hover:text-primary"
          title="New Chat"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>

        {/* Model Selector Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowModelSelector(!showModelSelector)}
          className="h-10 w-10 rounded-lg hover:bg-primary/20 text-muted-foreground hover:text-primary"
          title="AI Model Selector"
        >
          <Settings className="h-5 w-5" />
        </Button>

        {/* Settings/Chats Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-lg hover:bg-primary/20 text-muted-foreground hover:text-primary"
          title="Chat History"
        >
          <Archive className="h-5 w-5" />
        </Button>

        {/* Temporary Mode Toggle */}
        <div className="flex flex-col items-center space-y-2 mt-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTemporaryMode}
            className={`h-10 w-10 rounded-lg transition-colors ${
              isTemporaryMode 
                ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' 
                : 'hover:bg-primary/20 text-muted-foreground hover:text-primary'
            }`}
            title={isTemporaryMode ? "Temporary Mode: ON" : "Temporary Mode: OFF"}
          >
            {isTemporaryMode ? <ToggleLeft className="h-5 w-5" /> : <ToggleRight className="h-5 w-5" />}
          </Button>
          <span className="text-xs text-muted-foreground transform -rotate-90 whitespace-nowrap">
            {isTemporaryMode ? 'TEMP' : 'SAVE'}
          </span>
        </div>
      </div>

      {/* Model Selector Sidebar */}
      <AnimatePresence>
        {showModelSelector && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-card/50 backdrop-blur-sm border-r border-border/30 overflow-hidden"
          >
            <div className="p-4 h-full overflow-y-auto">
              <ModelSelector
                selectedModel={selectedModel}
                onModelChange={selectModel}
                onNewChat={startNewChat}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {showWelcomeScreen ? (
          /* Welcome Screen */
          <motion.div 
            className="flex-1 flex items-center justify-center p-8" 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
          >
            <div className="text-center max-w-2xl mx-auto space-y-8">
              {/* Chat Title with Model Selector */}
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div className="flex items-center space-x-2">
                  <img 
                    src="/lovable-uploads/3baec192-88ed-42ea-80e5-61f5cfa40481.png" 
                    alt="Prism Logo" 
                    className="h-6 w-6"
                  />
                  <span className="text-lg font-semibold text-foreground">
                    Prism {selectedModel === 'gemini' ? '2.5' : '4'} 
                  </span>
                </div>
                
                {isTemporaryMode && (
                  <div className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full border border-amber-500/30">
                    Temporary Mode
                  </div>
                )}
              </div>

              {/* Welcome Message */}
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-medium text-foreground">
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
            </div>
          </motion.div>
        ) : (
          /* Active Chat View */
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/20">
              <div className="flex items-center space-x-3">
                <img 
                  src="/lovable-uploads/3baec192-88ed-42ea-80e5-61f5cfa40481.png" 
                  alt="Prism Logo" 
                  className="h-5 w-5"
                />
                <span className="font-medium text-foreground">
                  Prism Chat
                </span>
                {isTemporaryMode && (
                  <div className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full border border-amber-500/30">
                    Temporary
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTemporaryMode}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {isTemporaryMode ? 'Enable Saving' : 'Temporary Mode'}
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              <MessageList 
                messages={messages} 
                typingIndicator={isTyping} 
                onReply={handleReplyClick} 
              />
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4">
              <MessageInput 
                onSendMessage={handleSubmit} 
                isLoading={isLoading} 
                messages={messages} 
                replyingTo={replyingTo} 
                setReplyingTo={setReplyingTo}
                isWelcomeMode={false}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;