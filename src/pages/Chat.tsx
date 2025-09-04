
import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookmarkPlus, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatInterface from '../components/chat/ChatInterface';
import Footer from '../components/Footer';
import BookmarksDrawer from '../components/BookmarksDrawer';
import ScrollToTop from '../components/ScrollToTop';
import { ChatProvider } from '../context/ChatContext';
import Navigation from '../components/Navigation';
import { QueryLimitDisplay } from '../components/chat/QueryLimitDisplay';

const Chat = () => {
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bookmarksCount, setBookmarksCount] = useState<number>(() => {
    try {
      const bookmarks = JSON.parse(localStorage.getItem('prism_bookmarks') || '[]');
      return bookmarks.length;
    } catch {
      return 0;
    }
  });

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-gradient-to-b from-background to-secondary/10 relative overflow-hidden flex flex-col`}>
      <ScrollToTop />
      
      <div className="relative z-10 h-full flex flex-col flex-1">
        {!isFullscreen && <Navigation />}
        
        <div className={`${isFullscreen ? 'flex-1 p-4' : 'container mx-auto px-4 flex-1 pt-20'}`}>
          {!isFullscreen && (
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
                  <img 
                    src="/lovable-uploads/3baec192-88ed-42ea-80e5-61f5cfa40481.png" 
                    alt="Prism Chat Logo" 
                    className="h-6 w-6 brightness-0 invert"
                  />
                </div>
                <motion.h1 
                  className="text-3xl font-bold bg-clip-text text-transparent 
                    bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 
                    bg-size-200 animate-gradient-text"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }} 
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  Prism Chat
                </motion.h1>
              </div>
              
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Engage with advanced AI models in a sleek, modern interface designed for productivity.
              </p>
              
              <div className="flex justify-center gap-3 mb-8">
                <Button 
                  variant="outline" 
                  onClick={() => setIsBookmarksOpen(true)}
                  className="relative border-border/50 hover:border-primary/50 backdrop-blur-sm"
                  size="sm"
                >
                  <BookmarkPlus className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Bookmarks</span>
                  {bookmarksCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-xs flex items-center justify-center text-white">
                      {bookmarksCount}
                    </span>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="border-border/50 hover:border-primary/50 backdrop-blur-sm"
                  size="sm"
                >
                  {isFullscreen ? <Minimize className="mr-2 h-4 w-4" /> : <Maximize className="mr-2 h-4 w-4" />}
                  <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
                </Button>
              </div>
            </div>
          )}

          <main className={`${isFullscreen ? 'h-full flex flex-col flex-1' : 'flex-1'}`}>
            <ChatProvider>
              <ChatInterface />
            </ChatProvider>
          </main>
        </div>
        
        {!isFullscreen && <Footer />}

        <BookmarksDrawer 
          isOpen={isBookmarksOpen} 
          onClose={() => setIsBookmarksOpen(false)} 
        />
      </div>
    </div>
  );
};

export default Chat;
