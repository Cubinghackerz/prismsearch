import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatInterface from '../components/chat/ChatInterface';
import { ChatProvider } from '../context/ChatContext';
import Navigation from '../components/Navigation';

const Chat = () => {
  const [showNavigation, setShowNavigation] = useState(false);
  const [mouseAtTop, setMouseAtTop] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const isAtTop = e.clientY < 60;
      setMouseAtTop(isAtTop);
      
      if (isAtTop && !showNavigation) {
        setShowNavigation(true);
      } else if (!isAtTop && showNavigation) {
        // Add a small delay before hiding to prevent flickering
        setTimeout(() => {
          if (!mouseAtTop) {
            setShowNavigation(false);
          }
        }, 500);
      }
    };

    const handleMouseLeave = () => {
      setMouseAtTop(false);
      setTimeout(() => {
        setShowNavigation(false);
      }, 300);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [showNavigation, mouseAtTop]);

  return (
    <div className="fixed inset-0 bg-background text-foreground overflow-hidden">
      {/* Hover-activated Navigation */}
      <AnimatePresence>
        {showNavigation && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-50"
            onMouseEnter={() => setShowNavigation(true)}
            onMouseLeave={() => setShowNavigation(false)}
          >
            <Navigation />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Chat Interface */}
      <main className="h-full w-full">
        <ChatProvider>
          <ChatInterface />
        </ChatProvider>
      </main>
    </div>
  );
};

export default Chat;