
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

const TypingIndicator = () => {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-orange-400" />
      </div>
      
      <motion.div 
        className="p-3 px-4 rounded-lg rounded-tl-none bg-orange-800/30 text-orange-100 shadow-md shadow-orange-900/10 max-w-[200px]"
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-1">
          <motion.div
            className="w-2 h-2 rounded-full bg-orange-300"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatType: 'loop',
              times: [0, 0.5, 1]
            }}
          />
          <motion.div
            className="w-2 h-2 rounded-full bg-orange-300"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatType: 'loop',
              delay: 0.2,
              times: [0, 0.5, 1]
            }}
          />
          <motion.div
            className="w-2 h-2 rounded-full bg-orange-300"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatType: 'loop',
              delay: 0.4,
              times: [0, 0.5, 1]
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default TypingIndicator;
