
import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import { ChatMessage } from '@/context/ChatContext';
import MessageActions from './MessageActions';
import TypingIndicator from './TypingIndicator';

interface MessageListProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onReplyClick: (messageId: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isTyping, onReplyClick }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, isTyping]);
  
  const renderThreadIndicator = (message: ChatMessage) => {
    if (!message.parentMessageId) return null;
    const parentMessage = messages.find(m => m.id === message.parentMessageId);
    if (!parentMessage) return null;
    return <div className="ml-11 mb-1 mt-1 flex items-center text-xs text-blue-300/50">
        <div className="h-5 border-l-2 border-blue-500/30 mr-2"></div>
        <span>In reply to: "{parentMessage.content.substring(0, 30)}..."</span>
      </div>;
  };
  
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 md:p-6 bg-gradient-to-b from-blue-950/10 to-blue-900/5">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-blue-300/60">
          <p>Send a message to start chatting</p>
        </div>
      ) : messages.map(message => (
        <div key={message.id}>
          {renderThreadIndicator(message)}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex gap-3 ${message.isUser ? 'justify-end' : ''} group`}
          >
            {!message.isUser && (
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-blue-400" />
              </div>
            )}
            
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`max-w-[80%] md:max-w-[75%] lg:max-w-[65%] rounded-lg p-3 relative ${
                message.isUser
                  ? 'bg-blue-600/20 text-blue-100 rounded-tr-none shadow-md shadow-blue-900/10'
                  : 'bg-blue-800/40 text-blue-100 rounded-tl-none shadow-md shadow-blue-900/10'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {message.content}
                </div>
                
                <div className="ml-2 mt-1">
                  <MessageActions message={message.content} onReply={() => onReplyClick(message.id)} />
                </div>
              </div>
            </motion.div>
            
            {message.isUser && (
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-blue-400" />
              </div>
            )}
          </motion.div>
        </div>
      ))}
      
      {isTyping && <TypingIndicator />}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
