
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatInterface from '../components/chat/ChatInterface';
import ParticleBackground from '../components/ParticleBackground';
import ScrollToTop from '../components/ScrollToTop';
import Footer from '../components/Footer';
import { useChat } from '@/context/ChatContext';

const Chat = () => {
  const location = useLocation();
  const { setInitialPrompt } = useChat();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const promptParam = params.get('prompt');
    if (promptParam) {
      const decodedPrompt = decodeURIComponent(promptParam);
      setInitialPrompt(decodedPrompt);

      // Clean up URL parameters after applying them
      window.history.replaceState({}, document.title, '/chat');
    }
  }, [location.search, setInitialPrompt]);
  
  return (
    <div className="min-h-screen flex flex-col bg-[#0E141B]">
      <ParticleBackground color="#4691f6" />
      <ScrollToTop />
      
      <header className="py-6 px-4 relative z-10">
        <div className="max-w-7xl mx-auto relative">
          <div className="flex justify-between items-center">
            <Link to="/" className="absolute left-0">
              <Button variant="ghost" className="text-white bg-transparent">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Search
              </Button>
            </Link>
            
            <motion.h1
              className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 animate-gradient-text mx-auto"
              animate={{ backgroundPosition: ['0% 50%', '100% 50%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
            >
              Prism Chat
            </motion.h1>
            
            <div className="w-[100px]"></div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 px-4 container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="h-[calc(100vh-200px)]"
        >
          <ChatInterface />
        </motion.div>
      </main>
      
      <footer>
        <Footer color="#4691f6" />
      </footer>
    </div>
  );
};

export default Chat;
