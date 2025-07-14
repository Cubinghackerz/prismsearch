
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, X, Send, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const AIAssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm your AI assistant. I can help you with search queries, password management, or answer questions about Prism. How can I assist you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(inputValue),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const getAIResponse = (input: string) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('search') || lowerInput.includes('find')) {
      return "I can help you search more effectively! Try using specific keywords or let me know what type of information you're looking for. You can also use our advanced search filters for better results.";
    }
    
    if (lowerInput.includes('password') || lowerInput.includes('vault')) {
      return "For password management, I recommend checking out Prism Vault. It offers military-grade encryption, AI-powered password generation, and breach detection. Would you like me to guide you through setting it up?";
    }
    
    if (lowerInput.includes('help') || lowerInput.includes('how')) {
      return "I'm here to help! I can assist with:\n• Search tips and strategies\n• Password security best practices\n• Navigating Prism features\n• General AI-powered assistance\n\nWhat specific area would you like help with?";
    }
    
    return "That's an interesting question! While I'm still learning, I can help you with search queries, password management, and general assistance. Is there something specific about Prism I can help you with?";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-prism-primary to-prism-accent hover:from-prism-primary-dark hover:to-prism-accent-dark text-white shadow-2xl hover:shadow-prism-primary/25 transition-all duration-300 group"
        >
          <Bot className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-prism-accent rounded-full animate-pulse">
            <Sparkles className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-96 shadow-2xl border-prism-border/50 bg-prism-surface/95 backdrop-blur-md transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-[500px]'
      }`}>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2 px-4 py-3 border-b border-prism-border/30">
          <div className="flex items-center space-x-2 flex-1">
            <div className="w-8 h-8 bg-gradient-to-r from-prism-primary to-prism-accent rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-sm font-semibold text-prism-text">AI Assistant</CardTitle>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-8 h-8 p-0 hover:bg-prism-surface/50"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 p-0 hover:bg-prism-surface/50"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[calc(500px-64px)]">
            <ScrollArea className="flex-1 px-4 py-2">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg text-sm ${
                        message.isUser
                          ? 'bg-gradient-to-r from-prism-primary to-prism-accent text-white'
                          : 'bg-prism-surface border border-prism-border/30 text-prism-text'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.isUser ? 'text-white/70' : 'text-prism-text-muted'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-prism-surface border border-prism-border/30 p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-prism-primary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-prism-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-prism-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            <div className="p-4 border-t border-prism-border/30">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 border-prism-border/30 bg-prism-surface/50 text-prism-text placeholder:text-prism-text-muted"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-gradient-to-r from-prism-primary to-prism-accent hover:from-prism-primary-dark hover:to-prism-accent-dark text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default AIAssistantWidget;
