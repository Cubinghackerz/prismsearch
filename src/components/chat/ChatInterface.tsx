import React, { useState, useEffect, useRef } from 'react';
import { useChat, ChatModel } from '@/context/ChatContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ModelSelector from './ModelSelector';
import RecentChats from './RecentChats';
import { QueryLimitDisplay } from './QueryLimitDisplay';
import { MessageSquare, Settings, Trash2, Archive, Plus, ToggleLeft, ToggleRight, Users, Info, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import '../search/searchStyles.css';

interface SavedChat {
  id: string;
  title: string;
  messages: any[];
  timestamp: Date;
  model: ChatModel;
}

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
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [currentChatTitle, setCurrentChatTitle] = useState<string>('');
  const [isTemporaryMode, setIsTemporaryMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Load saved chats from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('prism_saved_chats');
      if (stored) {
        const chats = JSON.parse(stored).map((chat: any) => ({
          ...chat,
          timestamp: new Date(chat.timestamp)
        }));
        setSavedChats(chats);
      }
    } catch (error) {
      console.error('Error loading saved chats:', error);
    }
  }, []);

  // Auto-save current chat when messages change (if not in temporary mode)
  useEffect(() => {
    if (chatId && messages.length > 0 && !isTemporaryMode) {
      saveCurrentChat();
    }
  }, [messages, chatId, isTemporaryMode]);

  // Generate chat title from first user message
  const generateChatTitle = (chatMessages: any[]): string => {
    const firstUserMessage = chatMessages.find(m => m.isUser);
    if (firstUserMessage) {
      const title = firstUserMessage.content.substring(0, 50);
      return title.length < firstUserMessage.content.length ? title + '...' : title;
    }
    return 'New Chat';
  };

  const saveCurrentChat = () => {
    if (!chatId || messages.length === 0) return;

    const title = generateChatTitle(messages);
    const chatToSave: SavedChat = {
      id: chatId,
      title,
      messages,
      timestamp: new Date(),
      model: selectedModel
    };

    try {
      const updatedChats = savedChats.filter(chat => chat.id !== chatId);
      updatedChats.unshift(chatToSave);
      
      // Keep only the last 50 chats
      const trimmedChats = updatedChats.slice(0, 50);
      
      setSavedChats(trimmedChats);
      localStorage.setItem('prism_saved_chats', JSON.stringify(trimmedChats));
      setCurrentChatTitle(title);
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  };

  const loadSavedChat = (savedChat: SavedChat) => {
    // Start a new chat and manually set the messages
    startNewChat();
    
    // Note: This is a simplified implementation. In a real app, you'd want to 
    // properly restore the chat state in the context
    setCurrentChatTitle(savedChat.title);
    selectModel(savedChat.model);
    
    toast({
      title: "Chat Loaded",
      description: `Loaded "${savedChat.title}"`,
    });
  };

  const deleteSavedChat = (chatIdToDelete: string) => {
    const updatedChats = savedChats.filter(chat => chat.id !== chatIdToDelete);
    setSavedChats(updatedChats);
    localStorage.setItem('prism_saved_chats', JSON.stringify(updatedChats));
    
    toast({
      title: "Chat Deleted",
      description: "The chat has been removed from your saved chats.",
    });
  };

  const clearAllChats = () => {
    if (confirm('Are you sure you want to delete all saved chats? This action cannot be undone.')) {
      setSavedChats([]);
      localStorage.removeItem('prism_saved_chats');
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
    await sendMessage(content, parentMessageId || undefined);
  };

  const handleReplyClick = (messageId: string) => {
    setReplyingTo(messageId);
  };

  const handleNewChat = () => {
    startNewChat();
    setCurrentChatTitle('');
    setReplyingTo(null);
    setShowSidebar(false);
  };

  // When there are no messages and no active chat, show the welcome screen
  const showWelcomeScreen = !chatId || (messages.length === 0 && !isTyping);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Collapsible Left Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-card/95 backdrop-blur-md border-r border-border/30 z-30 shadow-xl"
          >
            <div className="p-6 space-y-6 h-full overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Chat Settings</h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowSidebar(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Model Selector */}
              <ModelSelector
                selectedModel={selectedModel}
                onModelChange={selectModel}
                onNewChat={handleNewChat}
              />

              {/* Temporary Mode Toggle */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Chat Mode</h3>
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors text-foreground border border-border/30">
                  <div className="flex items-center gap-3">
                    {isTemporaryMode ? (
                      <ToggleLeft className="h-5 w-5 text-amber-400" />
                    ) : (
                      <ToggleRight className="h-5 w-5 text-primary" />
                    )}
                    <span className="font-medium">
                      {isTemporaryMode ? 'Temporary Mode' : 'Save Chats'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTemporaryMode}
                    className="h-8 px-3"
                  >
                    Toggle
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isTemporaryMode ? 'Chats will not be saved to device memory' : 'Chats are automatically saved'}
                </p>
              </div>

              {/* Saved Chats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Saved Chats</h3>
                  {savedChats.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearAllChats}
                      className="text-xs h-7 px-2"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {savedChats.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No saved chats yet
                    </div>
                  ) : (
                    savedChats.slice(0, 10).map((chat) => (
                      <div
                        key={chat.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors group"
                      >
                        <button
                          onClick={() => loadSavedChat(chat)}
                          className="flex-1 text-left text-sm text-foreground hover:text-primary transition-colors truncate"
                        >
                          {chat.title}
                        </button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSavedChat(chat.id)}
                          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar overlay for mobile */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-20"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Compact Left Panel */}
      <div className="w-12 bg-card/30 border-r border-border/20 flex flex-col items-center py-4 space-y-3 z-10">
        {/* New Chat Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNewChat}
          className="h-8 w-8 rounded-lg hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors"
          title="New Chat"
        >
          <Plus className="h-4 w-4" />
        </Button>

        {/* Chat History Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSidebar(true)}
          className="h-8 w-8 rounded-lg hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors"
          title="Chat Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>

        {/* Temporary Mode Indicator */}
        <div className="flex flex-col items-center mt-auto space-y-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTemporaryMode}
            className={`h-8 w-8 rounded-lg transition-colors ${
              isTemporaryMode 
                ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' 
                : 'hover:bg-primary/20 text-muted-foreground hover:text-primary'
            }`}
            title={isTemporaryMode ? "Temporary Mode: ON" : "Permanent Mode: ON"}
          >
            {isTemporaryMode ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
          </Button>
          <span className="text-xs text-muted-foreground transform -rotate-90 whitespace-nowrap">
            {isTemporaryMode ? 'TEMP' : 'SAVE'}
          </span>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Query Limit Display */}
        <QueryLimitDisplay />

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
                    Prism {selectedModel === 'gemini' ? '2.5' : selectedModel.includes('4') ? '4' : '3.1'} 
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
            <div className="flex-1 min-h-0">
              <MessageList 
                messages={messages} 
                typingIndicator={isTyping} 
                onReply={handleReplyClick} 
              />
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-6 border-t border-border/20 bg-card/20 backdrop-blur-sm">
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