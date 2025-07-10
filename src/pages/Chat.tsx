
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
      <ParticleBackground color="#4F46E5" />
      <ScrollToTop />
      
      <header className="py-3 px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          className="text-center relative flex justify-between items-center max-w-7xl mx-auto"
        >
          <div className="flex items-center gap-3">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }}
            >
              <Link to="/">
                <Button 
                  variant="ghost" 
                  className="text-prism-text-light bg-prism-blue-primary/20 hover:bg-prism-blue-primary/30"
                  size="sm"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </motion.div>
            
            <Button 
              variant="ghost" 
              onClick={() => setIsBookmarksOpen(true)}
              className="text-prism-text-light bg-prism-blue-primary/20 hover:bg-prism-blue-primary/30 relative"
              size="sm"
            >
              <BookmarkPlus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Bookmarks</span>
              {bookmarksCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-prism-blue-primary rounded-full text-xs flex items-center justify-center text-white">
                  {bookmarksCount}
                </span>
              )}
            </Button>
          </div>
          
          <div className="flex justify-center items-center">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/aeaad4a8-0dc2-4d4b-b2b3-cb248e0843db.png" 
                alt="Prism Search Logo" 
                className="h-8 w-8"
              />
              <motion.h1 
                className="text-2xl font-bold bg-clip-text text-transparent 
                  bg-gradient-to-r from-prism-blue-light via-prism-teal-primary to-prism-purple-primary 
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

          <div className="w-[120px] flex justify-end">
            {/* Azure test button removed */}
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
