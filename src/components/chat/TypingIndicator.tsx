
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import LoadingAnimation from '../LoadingAnimation';

const TypingIndicator = () => {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-prism-primary/20 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-prism-primary-light" />
      </div>
      
      <motion.div 
        className="p-3 px-4 rounded-lg rounded-tl-none bg-prism-surface/40 text-prism-text shadow-md shadow-prism-bg/10 max-w-[200px]"
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <LoadingAnimation color="blue" size="small" variant="prism" />
      </motion.div>
    </div>
  );
};

export default TypingIndicator;
