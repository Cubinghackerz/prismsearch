
import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

const TypingIndicator: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-3"
    >
      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-blue-400" />
      </div>
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
        className="max-w-[80%] md:max-w-[75%] lg:max-w-[65%] rounded-lg p-4 bg-blue-800/40 text-blue-100 rounded-tl-none"
      >
        <div className="flex items-center gap-2">
          <span className="text-blue-300">Thinking</span>
          <div className="loader-triangle"></div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TypingIndicator;
