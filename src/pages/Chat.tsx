import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatInterface from '../components/chat/ChatInterface';
import { ChatProvider } from '../context/ChatContext';
import Navigation from '../components/Navigation';

const Chat = () => {
  const [showNavigation, setShowNavigation] = useState(false);
  const [isMouseNearTop, setIsMouseNearTop] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const isNearTop = e.clientY < 80; // Increased detection area
      setIsMouseNearTop(isNearTop);
      
      // Clear any existing timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      
      if (isNearTop && !showNavigation) {
        setShowNavigation(true);
      } else if (!isNearTop && showNavigation) {
        // Add delay before hiding to prevent flickering
        hideTimeoutRef.current = setTimeout(() => {
          if (!isMouseNearTop) {
            setShowNavigation(false);
          }
        }, 800); // Longer delay for better UX
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [showNavigation, isMouseNearTop]);

  return (
    <div className="fixed inset-0 bg-background text-foreground overflow-hidden">
      {/* Hover-activated Navigation */}
      <AnimatePresence>
        {showNavigation && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-40"
            onMouseEnter={() => {
              if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
              }
              setShowNavigation(true);
            }}
            onMouseLeave={() => {
              hideTimeoutRef.current = setTimeout(() => {
                setShowNavigation(false);
              }, 500);
            }}
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