
import { useState } from 'react';
import { useChat, ChatModel } from '@/context/ChatContext';
import { useToast } from '@/hooks/use-toast';
import ModelSelector from './ModelSelector';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import '../search/searchStyles.css';

const ChatInterface = () => {
  const {
    messages,
    sendMessage,
    isLoading,
    isTyping,
    startNewChat,
    selectModel,
    selectedModel
  } = useChat();
  
  const { toast } = useToast();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  const handleSubmit = async (content: string, parentMessageId: string | null = null) => {
    if (!content.trim() || isLoading) return;
    await sendMessage(content, parentMessageId || undefined);
  };
  
  const handleModelChange = (value: string) => {
    selectModel(value as ChatModel);
  };
  
  const handleReplyClick = (messageId: string) => {
    setReplyingTo(messageId);
  };

  return (
    <div className="flex flex-col h-full bg-blue-950/20 backdrop-blur-md rounded-xl border border-orange-500/30 shadow-lg">
      <ModelSelector 
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
        onNewChat={startNewChat}
      />

      <MessageList 
        messages={messages}
        isTyping={isTyping}
        onReplyClick={handleReplyClick}
      />

      <MessageInput 
        onSendMessage={handleSubmit}
        isLoading={isLoading}
        messages={messages}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
      />
    </div>
  );
};

export default ChatInterface;
