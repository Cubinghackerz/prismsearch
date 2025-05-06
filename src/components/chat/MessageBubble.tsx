
import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import { ChatMessage } from '@/context/ChatContext';
import MessageActions from './MessageActions';

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isBot = message.sender === 'bot';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isBot ? '' : 'justify-end'}`}
    >
      {isBot && (
        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-blue-400" />
        </div>
      )}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
        className={`relative group max-w-[80%] md:max-w-[75%] lg:max-w-[65%] rounded-lg p-4 
          ${isBot 
            ? 'bg-blue-800/40 text-blue-100 rounded-tl-none' 
            : 'bg-purple-500/30 text-purple-50 rounded-tr-none ml-auto'
          }`}
      >
        <div className="text-sm mb-1">
          {isBot ? (
            <div className="flex items-center text-blue-300">
              <span className="mr-1">Assistant</span>
              {message.model && (
                <span className="text-xs bg-blue-700/40 px-2 py-0.5 rounded-full ml-2">
                  {message.model}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-end text-purple-300">
              <span>You</span>
            </div>
          )}
        </div>
        <div className="whitespace-pre-wrap">{message.text}</div>
        
        <div className={`absolute ${isBot ? '-right-1' : '-left-1'} top-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
          <MessageActions isBot={isBot} message={message} />
        </div>
      </motion.div>
      {!isBot && (
        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-purple-400" />
        </div>
      )}
    </motion.div>
  );
};

export default MessageBubble;
