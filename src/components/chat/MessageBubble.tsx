
import React from 'react';
import { Bot, User } from 'lucide-react';
import { ChatMessage } from '@/context/ChatContext';
import { motion } from 'framer-motion';

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.isUser;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-8 h-8 rounded-full ${isUser ? 'bg-blue-600' : 'bg-blue-500/20'} flex items-center justify-center shrink-0`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-blue-400" />
        )}
      </div>
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
        className={`max-w-[80%] md:max-w-[75%] lg:max-w-[65%] rounded-lg p-4 ${
          isUser 
            ? 'bg-blue-600 text-white rounded-tr-none ml-auto' 
            : 'bg-blue-800/40 text-blue-100 rounded-tl-none'
        }`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
      </motion.div>
    </motion.div>
  );
};

export default MessageBubble;
