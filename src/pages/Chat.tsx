import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ChatInterface from '@/components/chat/ChatInterface';
import ParticleBackground from '../components/ParticleBackground';
import FooterWave from '../components/FooterWave';
import { ChatProvider } from '@/context/ChatContext';
const Chat = () => {
  return <ChatProvider>
      <div className="min-h-screen flex flex-col">
        <ParticleBackground />
        
        <header className="py-6 px-4 relative z-10">
          <motion.div initial={{
          opacity: 0,
          y: -20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5
        }} className="text-center relative">
            <Link to="/">
              <motion.div initial={{
              opacity: 0,
              x: -20
            }} animate={{
              opacity: 1,
              x: 0
            }} className="absolute left-4 top-1/2 -translate-y-1/2">
                <Button variant="ghost" className="text-white bg-transparent">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </motion.div>
            </Link>
            
            <motion.h1 animate={{
            backgroundPosition: ['0% 50%', '100% 50%']
          }} transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: 'reverse'
          }} className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-gradient-text mb-2 text-4xl">
              Prism Chat
            </motion.h1>
            <motion.p initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            delay: 0.2
          }} className="text-gray-100 max-w-lg mx-auto text-sm">Chat with AI assistants powered by Claude and ChatGPT!</motion.p>
          </motion.div>
        </header>
        
        <main className="flex-1 px-4 container mx-auto max-w-[90vw] md:max-w-[700px]">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5
        }} className="mt-4">
            <ChatInterface />
          </motion.div>
        </main>
        
        <footer className="relative py-6 text-center">
          <FooterWave />
          <p className="relative z-10 text-gray-400 text-sm">
            © 2025 Prism Search. All rights reserved.
          </p>
        </footer>
      </div>
    </ChatProvider>;
};
export default Chat;