import { useState, useEffect, useRef } from 'react';
import { useChat, ChatModel } from '@/context/ChatContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ModelSelector from './ModelSelector';
import AIThinkingAnimation from './AIThinkingAnimation';
import { MessageSquare, Settings, Home, Info, Clock, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Suspense, lazy } from 'react';

const CodingWorkspace = lazy(() => import('@/components/coding-workspace/CodingWorkspace'));

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
    savedChats,
    loadChat,
    deleteChat,
    clearAllChats,
    isTemporaryMode,
    toggleTemporaryMode
  } = useChat();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showCodingWorkspace, setShowCodingWorkspace] = useState(false);
  const [codingPrompt, setCodingPrompt] = useState('');

  // Initialize chat on mount
  useEffect(() => {
    if (!chatId) {
      startNewChat();
    }
  }, [chatId, startNewChat]);
  
  // Listen for coding workspace events
  useEffect(() => {
    const handleOpenCodingWorkspace = (event: CustomEvent) => {
      setCodingPrompt(event.detail.prompt);
      setShowCodingWorkspace(true);
    };

    window.addEventListener('openCodingWorkspace', handleOpenCodingWorkspace as EventListener);
    
    return () => {
      window.removeEventListener('openCodingWorkspace', handleOpenCodingWorkspace as EventListener);
    };
  }, []);
  
  const handleSubmitWithFiles = async (content: string, attachments: any[] = [], parentMessageId: string | null = null) => {
    if ((!content.trim() && attachments.length === 0) || isLoading) return;

    // Show thinking animation
    setCurrentQuery(content);
    setShowThinking(true);

    // Ensure we have a chat ID
    if (!chatId) {
      startNewChat();
    }
    await sendMessage(content, parentMessageId || undefined);

    // Auto-scroll to bottom after sending
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth'
      });
    }, 100);
  };

  const handleSubmit = async (content: string, parentMessageId: string | null = null) => {
    await handleSubmitWithFiles(content, [], parentMessageId);
  };
  
  // Hide thinking animation when loading is done
  useEffect(() => {
    if (!isLoading && !isTyping) {
      setShowThinking(false);
    }
  }, [isLoading, isTyping]);

  const handleReplyClick = (messageId: string) => {
    setReplyingTo(messageId);
  };

  // Auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, isTyping]);

  // When there are no messages and no active chat, show the welcome screen
  const showWelcomeScreen = !chatId || (messages.length === 0 && !isTyping);

  // Show coding workspace if requested
  if (showCodingWorkspace) {
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      }>
        <CodingWorkspace 
          initialPrompt={codingPrompt}
          onClose={() => setShowCodingWorkspace(false)}
          isFullscreen={true}
        />
      </Suspense>
    );
  }

  const handleDeleteChat = (chatIdToDelete: string) => {
    if (confirm('Are you sure you want to delete this chat?')) {
      deleteChat(chatIdToDelete);
    }
  };

  const handleClearAllChats = () => {
    if (confirm('Are you sure you want to delete all saved chats? This action cannot be undone.')) {
      clearAllChats();
    }
  };

  return <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <div className="w-16 bg-muted/20 border-r border-border/30 flex flex-col items-center py-4 space-y-4">
        {/* Home Button */}
        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="h-10 w-10 rounded-lg hover:bg-primary/20 text-muted-foreground hover:text-primary" title="Go to Home">
          <Home className="h-5 w-5" />
        </Button>

        {/* New Chat Button */}
        <Button variant="ghost" size="icon" onClick={startNewChat} className="h-10 w-10 rounded-lg hover:bg-primary/20 text-muted-foreground hover:text-primary" title="New Chat">
          <MessageSquare className="h-5 w-5" />
        </Button>

        {/* Temporary Mode Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTemporaryMode}
          className={`h-10 w-10 rounded-lg hover:bg-primary/20 transition-colors ${
            isTemporaryMode 
              ? 'bg-amber-500/20 text-amber-400' 
              : 'text-muted-foreground hover:text-primary'
          }`}
          title={isTemporaryMode ? "Temporary Mode: ON" : "Temporary Mode: OFF"}
        >
          <Clock className="h-5 w-5" />
        </Button>

        {/* Model Selector Button */}
        <Button variant="ghost" size="icon" onClick={() => setShowModelSelector(!showModelSelector)} className="h-10 w-10 rounded-lg hover:bg-primary/20 text-muted-foreground hover:text-primary" title="AI Model Selector">
          <Settings className="h-5 w-5" />
        </Button>

        {/* Status Indicator */}
        <div className="mt-auto mb-4 flex flex-col items-center">
          <div className={`w-2 h-2 rounded-full mb-2 ${
            isTemporaryMode ? 'bg-amber-400' : 'bg-green-400'
          }`} />
          <span className="text-xs text-muted-foreground transform -rotate-90 whitespace-nowrap">
            {isTemporaryMode ? 'TEMP' : 'SAVED'}
          </span>
        </div>
      </div>

      {/* Model Selector Sidebar */}
      <AnimatePresence>
        {showModelSelector && <motion.div initial={{
        width: 0,
        opacity: 0
      }} animate={{
        width: 320,
        opacity: 1
      }} exit={{
        width: 0,
        opacity: 0
      }} transition={{
        duration: 0.3,
        ease: "easeInOut"
      }} className="bg-card/50 backdrop-blur-sm border-r border-border/30 overflow-hidden">
            <div className="p-4 h-full overflow-y-auto">
              <ModelSelector selectedModel={selectedModel} onModelChange={selectModel} onNewChat={startNewChat} />
            
            {/* Temporary Mode Toggle */}
            <div className="mt-6 p-4 border border-border/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">Temporary Mode</span>
                <Button
                  variant={isTemporaryMode ? "default" : "outline"}
                  size="sm"
                  onClick={toggleTemporaryMode}
                  className="text-xs"
                >
                  {isTemporaryMode ? "ON" : "OFF"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {isTemporaryMode 
                  ? "Chats are not saved and will be lost on page refresh"
                  : "Chats are automatically saved to your device"}
              </p>
            </div>
            
            {/* Chat History */}
            {!isTemporaryMode && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-foreground">Saved Chats</h3>
                  {savedChats.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAllChats}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                
                <ScrollArea className="h-64">
                  {savedChats.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No saved chats yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {savedChats.map((chat) => (
                        <div key={chat.id} className="group flex items-center justify-between p-2 hover:bg-accent/50 rounded-md transition-colors">
                          <button
                            onClick={() => loadChat(chat.id)}
                            className="flex-1 text-left text-sm text-foreground hover:text-primary truncate"
                            title={chat.title}
                          >
                            {chat.title}
                          </button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteChat(chat.id)}
                            className="opacity-0 group-hover:opacity-100 h-6 w-6"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}
            </div>
          </motion.div>}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {showWelcomeScreen ? (/* Welcome Screen */
      <motion.div className="flex-1 flex items-center justify-center p-8" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }}>
            <div className="text-center max-w-2xl mx-auto space-y-8">
              {/* Chat Title with Model Selector */}
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div className="flex items-center space-x-2">
                  <img src="/lovable-uploads/3baec192-88ed-42ea-80e5-61f5cfa40481.png" alt="Prism Logo" className="h-6 w-6" />
                  <span className="text-lg font-semibold text-foreground">
                    Prism {selectedModel === 'gemini' ? '2.5' : '4'} 
                  </span>
                </div>
                
                <div className={`px-3 py-1 text-xs rounded-full border ${
                  isTemporaryMode 
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                    : 'bg-green-500/20 text-green-400 border-green-500/30'
                }`}>
                  {isTemporaryMode ? 'Temporary Mode' : 'Auto-Save Mode'}
                </div>
              </div>

              {/* Welcome Message */}
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-medium text-foreground">
                  What's on the agenda today?
                </h1>
                {isTemporaryMode && (
                  <p className="text-sm text-muted-foreground opacity-75">
                    Temporary mode: Chats will not be saved to your device
                  </p>
                )}
              </div>

              {/* Input Area */}
              <div className="relative max-w-2xl mx-auto">
                <MessageInput onSendMessage={handleSubmit} isLoading={isLoading} messages={messages} replyingTo={replyingTo} setReplyingTo={setReplyingTo} isWelcomeMode={true} />
            </div>
          </div>
          </motion.div>) : (/* Active Chat View */
      <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/20">
              <div className="flex items-center space-x-3">
                <img src="/lovable-uploads/3baec192-88ed-42ea-80e5-61f5cfa40481.png" alt="Prism Logo" className="h-5 w-5" />
                <span className="font-medium text-foreground">
                  Prism Chat
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              <MessageList messages={messages} typingIndicator={isTyping} onReply={handleReplyClick} />
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4">
              <MessageInput onSendMessage={handleSubmit} isLoading={isLoading} messages={messages} replyingTo={replyingTo} setReplyingTo={setReplyingTo} isWelcomeMode={false} />
            </div>
          </>)}
      </div>
      
      {/* AI Thinking Animation */}
      <AIThinkingAnimation
        isVisible={showThinking}
        onClose={() => setShowThinking(false)}
        query={currentQuery}
      />
    </div>;
};
export default ChatInterface;