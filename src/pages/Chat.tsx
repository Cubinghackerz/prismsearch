import ChatInterface from '../components/chat/ChatInterface';
import { ChatProvider } from '../context/ChatContext';

const Chat = () => {
  return (
    <div className="fixed inset-0 bg-background text-foreground overflow-hidden">
      {/* Full Screen Chat Interface */}
      <main className="h-full w-full">
        <ChatProvider>
          <ChatInterface />
        </ChatProvider>
      </main>
    </div>
  );
};

export default Chat;