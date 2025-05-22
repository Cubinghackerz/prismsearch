
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ChatInterface from '../components/chat/ChatInterface';
import ParticleBackground from '../components/ParticleBackground';
import Footer from '../components/Footer';
import BookmarksDrawer from '../components/BookmarksDrawer';
import ScrollToTop from '../components/ScrollToTop';
import { ChatProvider } from '../context/ChatContext';
import MainNavigation from '../components/MainNavigation';

const Chat = () => {
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [bookmarksCount, setBookmarksCount] = useState<number>(0);

  // Load bookmarks count from localStorage
  useEffect(() => {
    try {
      const bookmarks = JSON.parse(localStorage.getItem('prism_bookmarks') || '[]');
      setBookmarksCount(bookmarks.length);
    } catch {
      setBookmarksCount(0);
    }

    // Set up listener for storage changes
    const handleStorageChange = () => {
      try {
        const bookmarks = JSON.parse(localStorage.getItem('prism_bookmarks') || '[]');
        setBookmarksCount(bookmarks.length);
      } catch {
        setBookmarksCount(0);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#1A1F2C]">
      <ParticleBackground color="#FF9E2C" />
      <ScrollToTop />
      
      <header className="py-4 px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          className="relative flex justify-between items-center max-w-7xl mx-auto"
        >
          <div className="flex items-center">
            <MainNavigation 
              onOpenBookmarks={() => setIsBookmarksOpen(true)} 
              bookmarksCount={bookmarksCount}
              variant="full"
            />
          </div>
          
          <div className="flex justify-center items-center">
            <Link to="/" className="flex items-center gap-2" aria-label="Go to home page">
              <img 
                src="/lovable-uploads/aeaad4a8-0dc2-4d4b-b2b3-cb248e0843db.png" 
                alt="Prism Search Logo" 
                className="h-8 w-8"
                loading="eager"
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

          <div className="w-[120px]">
            {/* Empty div for flex balance */}
          </div>
        </motion.div>
      </header>

      <main className="flex-1 container mx-auto max-w-[98vw] px-4 pt-3 pb-6">
        <ChatProvider>
          <ChatInterface />
        </ChatProvider>
      </main>
      
      <footer className="mt-2">
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
