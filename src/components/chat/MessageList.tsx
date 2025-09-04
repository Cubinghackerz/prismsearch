
import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ChatMessage } from '@/context/ChatContext';
import TypingIndicator from '@/components/chat/TypingIndicator';
import ChatMessageSkeleton from '@/components/skeletons/ChatMessageSkeleton';
import ReactMarkdown from 'react-markdown';
import MathRenderer from '@/components/math-assistant/MathRenderer';

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

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
      {messages.length === 0 && !typingIndicator && (
        <div className="text-center py-12">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 flex items-center justify-center">
            <img 
              src="/lovable-uploads/3baec192-88ed-42ea-80e5-61f5cfa40481.png" 
              alt="Prism Chat Logo" 
              className="h-6 w-6 opacity-60"
            />
          </div>
          <p className="text-muted-foreground">Start a conversation by typing a message below.</p>
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
            max-w-[85%] lg:max-w-[75%] p-4 rounded-2xl shadow-sm
            ${message.isUser 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white message user' 
              : 'bg-card/50 backdrop-blur-sm text-foreground border border-border/50 message bot'
            } relative
          `}>
            {message.isUser ? (
              <div className="whitespace-pre-wrap pr-12">{message.content}</div>
            ) : (
              <div className="prose prose-neutral dark:prose-invert max-w-none pr-12">
                <MathRenderer 
                  content={message.content}
                  className="text-foreground leading-relaxed"
                />
              </div>
            )}
            
            <div className="absolute bottom-2 right-3">
              <span className={`text-xs opacity-50 ${message.isUser ? 'text-white/70' : 'text-muted-foreground'}`}>
                {format(message.timestamp, 'HH:mm')}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
      
      {typingIndicator && <ChatMessageSkeleton isUser={false} count={1} />}
    </div>
  );
};

export default MessageList;
