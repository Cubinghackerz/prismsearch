
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ChatMessage } from '@/context/ChatContext';
import MessageActions from './MessageActions';
import TypingIndicator from './TypingIndicator';

interface MessageListProps {
  messages: ChatMessage[];
  onReply: (id: string) => void;
  typingIndicator: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  onReply, 
  typingIndicator 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingIndicator]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
      {messages.length === 0 && (
        <div className="text-center text-orange-300/60 py-8">
          <p>Start a conversation by typing a message below.</p>
        </div>
      )}
      
      {messages.map((message) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`
            max-w-[80%] p-4 rounded-2xl shadow-lg
            ${message.isUser 
              ? 'bg-gradient-to-r from-prism-blue-primary to-prism-purple-primary text-white message user' 
              : 'bg-prism-dark-bg-800/40 text-prism-text-light border border-prism-blue-primary/30 message bot'
            }
          `}>
            <div className={`
              prose prose-invert max-w-none
              ${message.isUser ? 'prose-p:text-white prose-headings:text-white' : 'prose-p:text-prism-text-light prose-headings:text-prism-text-muted'}
            `}>
              {message.isUser ? (
                <p className="mb-0 whitespace-pre-wrap">{message.content}</p>
              ) : (
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: message.formattedContent || message.content 
                  }} 
                />
              )}
            </div>
            
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/20 group">
              <span className="text-xs opacity-70">
                {format(message.timestamp, 'HH:mm')}
              </span>
              
              {!message.isUser && (
                <MessageActions 
                  message={message.content} 
                  onReply={() => onReply(message.id)}
                />
              )}
            </div>
          </div>
        </motion.div>
      ))}
      
      {typingIndicator && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
