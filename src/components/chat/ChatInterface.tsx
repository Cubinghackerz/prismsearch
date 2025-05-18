
import { useState } from 'react';
import { useChat, ChatModel } from '@/context/ChatContext';
import { useToast } from '@/hooks/use-toast';
import ModelSelector from './ModelSelector';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import RecentChats from './RecentChats';
import '../search/searchStyles.css';

const ChatInterface = () => {
  const {
    messages,
    sendMessage,
    isLoading,
    isTyping,
    startNewChat,
    selectModel,
    selectedModel,
    chatId
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
    <div className="flex flex-col h-full bg-orange-950/20 backdrop-blur-md rounded-xl border border-orange-500/30 shadow-lg">
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar with recent chats */}
        <div className="w-64 p-2 border-r border-orange-500/20 bg-orange-900/5 hidden md:block overflow-y-auto">
          <RecentChats />
          
          <div className="mt-3">
            <ModelSelector 
              selectedModel={selectedModel}
              onModelChange={handleModelChange}
              onNewChat={startNewChat}
            />
          </div>
        </div>
        
        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile-only model selector */}
          <div className="md:hidden border-b border-orange-500/20 bg-orange-900/5">
            <ModelSelector 
              selectedModel={selectedModel}
              onModelChange={handleModelChange}
              onNewChat={startNewChat}
            />
          </div>

          {chatId ? (
            <>
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
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-5">
              <div className="text-center max-w-md mx-auto p-6 rounded-lg bg-orange-950/20 border border-orange-500/20">
                <h3 className="text-xl font-semibold text-orange-100 mb-3">Welcome to Prism Chat</h3>
                <p className="text-orange-200 mb-4">
                  Choose a recent chat from the sidebar or start a new conversation to begin.
                </p>
                <button 
                  onClick={startNewChat}
                  className="px-4 py-2 bg-orange-600/60 hover:bg-orange-600/80 text-white rounded-md transition-colors"
                >
                  Start New Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
