import { useState, useEffect } from 'react';
import { useChat, ChatModel } from '@/context/ChatContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { MessageSquare, Settings, Trash2, Archive, Plus, ToggleLeft, ToggleRight } from 'lucide-react';
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
    // This would require updating the ChatProvider to load a specific chat
    // For now, we'll show a toast that this feature needs implementation
    toast({
      title: "Chat Loading",
      description: "Chat loading from saved chats will be implemented soon.",
    });
  };

  const deleteSavedChat = (chatId: string) => {
    const updatedChats = savedChats.filter(chat => chat.id !== chatId);
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

  // When there are no messages and no active chat, show the welcome screen
  const showWelcomeScreen = !chatId || (messages.length === 0 && !isTyping);

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <div className="w-16 bg-muted/20 border-r border-border/30 flex flex-col items-center py-4 space-y-4">
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
                  {currentChatTitle || 'Chat'}
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

            <MessageList 
              messages={messages} 
              typingIndicator={isTyping} 
              onReply={handleReplyClick} 
            />
            
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