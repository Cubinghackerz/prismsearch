import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Minimize2, Maximize2, HelpCircle, Search, Shield, User, Sparkles } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'search' | 'vault' | 'account' | 'general';
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const PrismAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    content: "Hi! I'm your Prism Assistant. I can help you with frequently asked questions about Prism's features. Choose from the topics below or browse our FAQs.",
    isUser: false,
    timestamp: new Date()
  }]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I search more effectively?',
      answer: 'Use specific keywords, try different search engines, and use quotation marks for exact phrases. You can also use filters to narrow down results by date, type, or source.',
      category: 'search'
    },
    {
      id: '2',
      question: 'What search engines are available?',
      answer: 'Prism supports multiple search engines including Google, Bing, DuckDuckGo, and specialized academic sources. You can switch between them in the search interface.',
      category: 'search'
    },
    {
      id: '3',
      question: 'How secure is Prism Vault?',
      answer: 'Prism Vault uses military-grade AES-256 encryption to protect your passwords. All data is encrypted locally before being stored, and we never have access to your master password.',
      category: 'vault'
    },
    {
      id: '4',
      question: 'How do I generate strong passwords?',
      answer: 'Use the built-in password generator in Prism Vault. It creates cryptographically secure passwords with customizable length and character sets, and includes strength analysis.',
      category: 'vault'
    },
    {
      id: '5',
      question: 'How do I create a Prism account?',
      answer: 'Click the sign-up button on any page and follow the prompts. You can sign up with email or use social login options. A strong password is required for security.',
      category: 'account'
    },
    {
      id: '6',
      question: 'How do I reset my password?',
      answer: 'On the login page, click "Forgot Password" and enter your email address. You\'ll receive a reset link via email. Follow the instructions to create a new secure password.',
      category: 'account'
    },
    {
      id: '7',
      question: 'How do I change my account settings?',
      answer: 'Once logged in, access your account settings through the user menu. You can update your profile, change passwords, manage subscriptions, and adjust privacy settings.',
      category: 'account'
    },
    {
      id: '8',
      question: 'What are the daily query limits?',
      answer: 'Free accounts have 30 daily queries, while registered users get 100 queries per day. Queries reset daily at midnight. Premium plans offer unlimited queries.',
      category: 'account'
    },
    {
      id: '9',
      question: 'Can I sync my data across devices?',
      answer: 'Yes! Your bookmarks, passwords, and preferences sync securely across all your devices when you\'re signed in to your Prism account.',
      category: 'general'
    },
    {
      id: '10',
      question: 'Is Prism free to use?',
      answer: 'Prism offers both free and premium plans. The free plan includes basic search and limited vault storage. Premium plans offer unlimited storage, advanced features, and priority support.',
      category: 'general'
    }
  ];

  const categories = [
    { id: 'search', name: 'Search Features', icon: Search, color: 'text-prism-primary' },
    { id: 'vault', name: 'Prism Vault', icon: Shield, color: 'text-prism-accent' },
    { id: 'account', name: 'Account & Settings', icon: User, color: 'text-blue-500' },
    { id: 'general', name: 'General', icon: HelpCircle, color: 'text-prism-text' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const categoryFaqs = faqs.filter(faq => faq.category === categoryId);
    const categoryName = categories.find(cat => cat.id === categoryId)?.name;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: `Here are the most common questions about ${categoryName}:\n\n${categoryFaqs.map(faq => `• ${faq.question}`).join('\n')}`,
      isUser: false,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const handleFAQClick = (faq: FAQ) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: faq.question,
      isUser: true,
      timestamp: new Date()
    };

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: faq.answer,
      isUser: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, botMessage]);
  };

  const resetChat = () => {
    setMessages([{
      id: '1',
      content: "Hi! I'm your Prism Assistant. I can help you with frequently asked questions about Prism's features. Choose from the topics below or browse our FAQs.",
      isUser: false,
      timestamp: new Date()
    }]);
    setSelectedCategory(null);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          onClick={() => setIsOpen(true)} 
          className="w-14 h-14 rounded-full bg-prism-surface hover:bg-prism-surface/80 text-white shadow-2xl hover:shadow-prism-primary/25 transition-all duration-300 group p-0"
        >
          <img 
            src="/lovable-uploads/3baec192-88ed-42ea-80e5-61f5cfa40481.png" 
            alt="Prism Logo" 
            className="w-6 h-6 group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-prism-accent rounded-full animate-pulse">
            <Sparkles className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-96 shadow-2xl border-prism-border/50 bg-prism-surface/95 backdrop-blur-md transition-all duration-300 ${isMinimized ? 'h-16' : 'h-[500px]'}`}>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2 px-4 py-3 border-b border-prism-border/30">
          <div className="flex items-center space-x-2 flex-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center">
              <img 
                src="/lovable-uploads/3baec192-88ed-42ea-80e5-61f5cfa40481.png" 
                alt="Prism Logo" 
                className="w-5 h-5"
              />
            </div>
            <CardTitle className="text-sm font-semibold text-prism-text">Prism Assistant</CardTitle>
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
                {messages.map(message => (
                  <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      message.isUser 
                        ? 'bg-gradient-to-r from-prism-primary to-prism-accent text-white' 
                        : 'bg-prism-surface border border-prism-border/30 text-prism-text'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.isUser ? 'text-white/70' : 'text-prism-text-muted'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            <div className="p-4 border-t border-prism-border/30">
              {!selectedCategory ? (
                <div className="space-y-3">
                  <p className="text-sm text-prism-text-muted mb-3">Choose a topic:</p>
                  {categories.map(category => {
                    const IconComponent = category.icon;
                    return (
                      <Button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        variant="outline"
                        className="w-full justify-start border-prism-border/30 hover:bg-prism-surface/50"
                      >
                        <IconComponent className={`w-4 h-4 mr-2 ${category.color}`} />
                        {category.name}
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-prism-text-muted mb-2">Select a question:</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {faqs.filter(faq => faq.category === selectedCategory).map(faq => (
                      <Button
                        key={faq.id}
                        onClick={() => handleFAQClick(faq)}
                        variant="ghost"
                        className="w-full text-left justify-start text-xs p-2 h-auto hover:bg-prism-surface/50"
                      >
                        {faq.question}
                      </Button>
                    ))}
                  </div>
                  <Button
                    onClick={resetChat}
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                  >
                    Back to Topics
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default PrismAssistant;
