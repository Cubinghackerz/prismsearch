
import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Link2 } from 'lucide-react';
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

  // Group messages by thread
  const messageThreads = messages.reduce((acc: Record<string, { parent: ChatMessage, children: ChatMessage[] }>, message) => {
    if (!message.parentMessageId) {
      // This is a top-level message
      if (!acc[message.id]) {
        acc[message.id] = { parent: message, children: [] };
      } else {
        acc[message.id].parent = message;
      }
    } else {
      // This is a reply to another message
      if (!acc[message.parentMessageId]) {
        acc[message.parentMessageId] = { 
          parent: messages.find(m => m.id === message.parentMessageId) as ChatMessage, 
          children: [message] 
        };
      } else {
        acc[message.parentMessageId].children.push(message);
      }
    }
    return acc;
  }, {});

  // Flatten the threads for rendering
  const orderedMessages = Object.values(messageThreads).flatMap(({ parent, children }) => {
    return [parent, ...children.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())];
  });

  // Find if a message is part of a thread
  const isThreadMessage = (message: ChatMessage) => message.parentMessageId !== undefined;
  
  // Find if a message has replies
  const hasReplies = (message: ChatMessage) => messageThreads[message.id]?.children.length > 0;

  // Get thread depth (for visualization)
  const getThreadDepth = (message: ChatMessage): number => {
    if (!message.parentMessageId) return 0;
    
    const parent = messages.find(m => m.id === message.parentMessageId);
    if (!parent) return 1;
    
    return 1 + getThreadDepth(parent);
  };
  
  const renderThreadIndicator = (message: ChatMessage) => {
    if (!message.parentMessageId) return null;
    
    const threadDepth = getThreadDepth(message);
    const parentMessage = messages.find(m => m.id === message.parentMessageId);
    if (!parentMessage) return null;
    
    return (
      <div 
        className="ml-11 mb-1 mt-1 flex items-center text-xs text-orange-300/50"
        style={{ marginLeft: `${2.75 + threadDepth * 0.5}rem` }}
      >
        <div className="h-5 border-l-2 border-orange-500/30 mr-2"></div>
        <Link2 className="h-3 w-3 mr-1 text-orange-400/40" />
        <span>In reply to: "{parentMessage.content.substring(0, 30)}..."</span>
      </div>
    );
  };
  
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 md:p-6 bg-gradient-to-b from-orange-950/10 to-orange-900/5">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-orange-300/60">
          <p>Send a message to start chatting</p>
        </div>
      ) : messages.map((message, index) => (
        <div key={message.id}>
          {renderThreadIndicator(message)}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`
              flex gap-3 ${message.isUser ? 'justify-end' : ''} group
              ${isThreadMessage(message) ? 'ml-6' : ''}
            `}
            style={{ 
              marginLeft: isThreadMessage(message) ? `${getThreadDepth(message) * 1}rem` : undefined 
            }}
          >
            {!message.isUser && (
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-orange-400" />
              </div>
            )}
            
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`
                max-w-[80%] md:max-w-[75%] lg:max-w-[65%] rounded-lg p-3 relative 
                ${message.isUser
                  ? 'bg-orange-600/20 text-orange-100 rounded-tr-none shadow-md shadow-orange-900/10'
                  : 'bg-orange-800/30 text-orange-100 rounded-tl-none shadow-md shadow-orange-900/10'
                }
                ${hasReplies(message) ? 'border-l-2 border-orange-500/30' : ''}
              `}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {message.content}
                </div>
                
                <div className="ml-2 mt-1">
                  <MessageActions message={message.content} onReply={() => onReplyClick(message.id)} />
                </div>
              </div>
              
              {/* Message timestamp */}
              <div className="text-xs text-orange-300/50 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </motion.div>
            
            {message.isUser && (
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-orange-400" />
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
