
import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ChatMessage, getCommandLabel } from '@/context/ChatContext';
import TypingIndicator from '@/components/chat/TypingIndicator';
import ChatMessageSkeleton from '@/components/skeletons/ChatMessageSkeleton';
import MathRenderer from '@/components/math-assistant/MathRenderer';
import { Paperclip, Download, Image, FileText, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CodeGenerationBubble from './CodeGenerationBubble';
import CodePlanBubble from './CodePlanBubble';
import FinanceCommandBubble from './FinanceCommandBubble';
import TableCommandRenderer from './TableCommandRenderer';

interface MessageListProps {
  messages: ChatMessage[];
  onReply: (id: string) => void;
  typingIndicator: boolean;
}

const FileAttachment: React.FC<{ file: any }> = ({ file }) => {
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.includes('text') || type.includes('document')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg border border-border/30 max-w-xs">
      {getFileIcon(file.type)}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{file.name}</div>
        <div className="text-xs text-muted-foreground">{formatFileSize(file.size)}</div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDownload}
        className="h-6 w-6 p-0"
      >
        <Download className="h-3 w-3" />
      </Button>
    </div>
  );
};
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
            {message.command && (
              <div
                className={`mb-3 flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-wide ${
                  message.isUser ? 'text-white/80' : 'text-muted-foreground'
                }`}
              >
                <span
                  className={`px-2 py-0.5 rounded-full border ${
                    message.isUser
                      ? 'border-white/50 text-white'
                      : 'border-border/60 text-foreground'
                  }`}
                >
                  {getCommandLabel(message.command)}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full border bg-amber-500/10 ${
                    message.isUser
                      ? 'border-white/60 text-white'
                      : 'border-amber-500/40 text-amber-400'
                  }`}
                >
                  Beta
                </span>
              </div>
            )}
            {/* Show attachments for user messages */}
            {message.isUser && message.attachments && message.attachments.length > 0 && (
              <div className="mb-3 space-y-2">
                <div className="flex items-center gap-1 text-white/70 text-xs">
                  <Paperclip className="h-3 w-3" />
                  <span>Attachments:</span>
                </div>
                {message.attachments.map((file: any) => (
                  <FileAttachment key={file.id} file={file} />
                ))}
              </div>
            )}

            {message.isUser ? (
              <div className="whitespace-pre-wrap pr-12">{message.content}</div>
            ) : message.type === 'code' && message.codeResult ? (
              <div className="pr-6">
                <CodeGenerationBubble
                  result={message.codeResult}
                  prompt={message.codePrompt || message.content}
                  usedModel={message.usedModel}
                  rawResponse={message.rawResponse}
                />
              </div>
            ) : message.type === 'code-plan' && message.codePlan ? (
              <div className="pr-6">
                <CodePlanBubble messageId={message.id} planState={message.codePlan} />
              </div>
            ) : message.command === 'finance' && message.financeData ? (
              <div className="pr-6">
                <FinanceCommandBubble summary={message.content} result={message.financeData} />
              </div>
            ) : message.command === 'table' ? (
              <div className="pr-6">
                <TableCommandRenderer content={message.content} />
              </div>
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
