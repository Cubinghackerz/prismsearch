
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ChatInterface from '@/components/chat/ChatInterface';
import ParticleBackground from '../components/ParticleBackground';
import Footer from '../components/Footer';
import { ChatProvider } from '@/context/ChatContext';
import { ResizablePanelGroup, ResizablePanel } from '@/components/ui/resizable';

const Chat = () => {
  return (
    <ChatProvider>
      <div className="min-h-screen flex flex-col bg-[#1A1F2C]">
        <ParticleBackground color="#9b87f5" />
        
        <header className="py-6 px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }} 
            className="text-center relative"
          >
            <Link to="/">
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="absolute left-4 top-1/2 -translate-y-1/2"
              >
                <Button variant="ghost" className="text-purple-100 bg-purple-500/20 hover:bg-purple-500/30">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </motion.div>
            </Link>
            
            <motion.h1 
              animate={{ backgroundPosition: ['0% 50%', '100% 50%'] }} 
              transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }} 
              className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-purple-500 to-purple-700 animate-gradient-text mb-2 text-4xl"
            >
              Prism Chat
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.2 }} 
              className="text-purple-200 max-w-lg mx-auto text-sm"
            >
              Chat with AI assistants powered by Gemini 2.5 Flash Preview, Mistral Medium and Llama-3-70B
            </motion.p>
          </motion.div>
        </header>
        
        <main className="flex-1 px-4 container mx-auto max-w-[90vw] md:max-w-[90vw] lg:max-w-[90vw] relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }} 
            className="mt-4"
          >
            <ResizablePanelGroup direction="horizontal" className="min-h-[70vh]">
              <ResizablePanel defaultSize={100} minSize={75}>
                <div className="h-full">
                  <ChatInterface />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </motion.div>
        </main>
        
        <footer className="mt-8">
          <Footer />
        </footer>
      </div>
    </ChatProvider>
  );
};

export default Chat;
