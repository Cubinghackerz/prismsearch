import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookmarkPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatInterface from '../components/chat/ChatInterface';
import ParticleBackground from '../components/ParticleBackground';
import Footer from '../components/Footer';
import BookmarksDrawer from '../components/BookmarksDrawer';
import ScrollToTop from '../components/ScrollToTop';
import { ChatProvider } from '../context/ChatContext';

const Chat = () => {
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [bookmarksCount, setBookmarksCount] = useState<number>(() => {
    try {
      const bookmarks = JSON.parse(localStorage.getItem('prism_bookmarks') || '[]');
      return bookmarks.length;
    } catch {
      return 0;
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#1A1F2C]">
      <ParticleBackground color="#FF9E2C" />
      <ScrollToTop />
      
      <header className="py-4 px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          className="text-center relative flex justify-between items-center max-w-7xl mx-auto"
        >
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="absolute left-4 top-1/2 -translate-y-1/2"
          >
            <Link to="/">
              <Button 
                variant="ghost" 
                className="text-orange-100 bg-orange-500/20 hover:bg-orange-500/30"
                size="sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </motion.div>
          
          <div className="flex-1 flex justify-center items-center">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/aeaad4a8-0dc2-4d4b-b2b3-cb248e0843db.png" 
                alt="Prism Search Logo" 
                className="h-8 w-8"
              />
              <motion.h1 
                className="text-2xl font-bold bg-clip-text text-transparent 
                  bg-gradient-to-r from-orange-300 via-orange-500 to-orange-700 
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
            </Link>
          </div>

          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Button 
              variant="ghost" 
              onClick={() => setIsBookmarksOpen(true)}
              className="text-orange-100 bg-orange-500/20 hover:bg-orange-500/30 relative"
              size="sm"
            >
              <BookmarkPlus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Bookmarks</span>
              {bookmarksCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 rounded-full text-xs flex items-center justify-center text-white">
                  {bookmarksCount}
                </span>
              )}
            </Button>
          </div>
        </motion.div>
      </header>

      <main className="flex-1 container mx-auto max-w-[98vw] px-4 pt-6">
        <ChatProvider>
          <ChatInterface />
        </ChatProvider>
      </main>
      
      <footer>
        <Footer />
      </footer>

      <BookmarksDrawer 
        isOpen={isBookmarksOpen} 
        onClose={() => setIsBookmarksOpen(false)} 
      />
    </div>
  );
};

export default Chat;
