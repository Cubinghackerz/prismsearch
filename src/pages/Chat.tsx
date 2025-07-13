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
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-gradient-to-b from-prism-bg to-prism-surface relative overflow-hidden flex flex-col`}>
      <ScrollToTop />
      
      <div className="relative z-10 h-full flex flex-col flex-1">
        {!isFullscreen && <Navigation />}
        
        <div className={`${isFullscreen ? 'flex-1' : 'container mx-auto px-6 flex-1'}`}>
          <div className={`text-center ${isFullscreen ? 'p-4' : 'mb-8'}`}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <img 
                src="/lovable-uploads/3baec192-88ed-42ea-80e5-61f5cfa40481.png" 
                alt="Prism Chat Logo" 
                className="h-8 w-8"
              />
              <motion.h1 
                className="text-2xl font-bold bg-clip-text text-transparent 
                  bg-gradient-to-r from-prism-primary-light via-prism-primary to-prism-accent 
                  animate-gradient-text"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%']
                }} 
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
              >
                Prism Chat
              </motion.h1>
            </div>
            
            <div className="flex justify-center gap-2 mb-6">
              <Button 
                variant="ghost" 
                onClick={() => setIsBookmarksOpen(true)}
                className="text-prism-text bg-prism-primary/20 hover:bg-prism-primary/30 relative"
                size="sm"
              >
                <BookmarkPlus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Bookmarks</span>
                {bookmarksCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-prism-primary rounded-full text-xs flex items-center justify-center text-white">
                    {bookmarksCount}
                  </span>
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-prism-text bg-prism-primary/20 hover:bg-prism-primary/30"
                size="sm"
              >
                {isFullscreen ? <Minimize className="mr-2 h-4 w-4" /> : <Maximize className="mr-2 h-4 w-4" />}
                <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
              </Button>
            </div>
          </div>

          <main className={`${isFullscreen ? 'h-full flex flex-col flex-1' : 'max-w-[98vw] pt-3 pb-6 flex-1'}`}>
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
