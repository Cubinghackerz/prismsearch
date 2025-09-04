
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
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-background relative overflow-hidden flex flex-col`}>
      <ScrollToTop />
      
      <div className="relative z-10 h-full flex flex-col flex-1">
        {!isFullscreen && <Navigation />}
        
        <div className={`${isFullscreen ? 'flex-1 p-4' : 'container mx-auto px-4 flex-1 pt-20'}`}>
          <main className={`${isFullscreen ? 'h-full flex flex-col flex-1' : 'flex-1'}`}>
            <ChatProvider>
              <ChatInterface />
            </ChatProvider>
          </main>
        </div>
        
        {!isFullscreen && (
          <div className="px-4 mb-8">
            <div className="text-center">
              
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
          </div>
        )}
        
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
