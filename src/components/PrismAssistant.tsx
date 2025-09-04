import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, MessageSquare, HelpCircle } from "lucide-react";
const PrismAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([{
    sender: 'Prism',
    text: "Hi, I'm Prism! How can I help you today? Here are some common questions:"
  }, {
    sender: 'Prism',
    text: "• What is Prism?"
  }, {
    sender: 'Prism',
    text: "• How does the AI search work?"
  }, {
    sender: 'Prism',
    text: "• Is my data secure in the Vault?"
  }]);
  const toggleOpen = () => setIsOpen(!isOpen);
  const sendMessage = () => {
    if (message.trim() !== '') {
      setChatHistory([...chatHistory, {
        sender: 'You',
        text: message
      }]);
      setMessage('');

      // Simulate Prism's response
      setTimeout(() => {
        const responses = ["That's a great question! Let me look into that for you.", "Interesting, I'll get back to you with an answer shortly.", "I'm not quite sure, but I'll find out!"];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        setChatHistory([...chatHistory, {
          sender: 'Prism',
          text: randomResponse
        }]);
      }, 500);
    }
  };
  const faqs = [{
    question: "What is Prism?",
    answer: "Prism is a comprehensive AI-powered platform that offers multiple tools including intelligent search, AI chat, password management, file conversions, compression, code generation, math assistance, and content detection services."
  }, {
    question: "How does the AI search work?",
    answer: "Our AI search combines multiple search engines and uses advanced language models to provide comprehensive, contextual answers to your queries with cited sources."
  }, {
    question: "Is my data secure in the Vault?",
    answer: "Yes! Your passwords are encrypted locally using AES-256 encryption before being stored. We use zero-knowledge architecture, meaning we cannot access your decrypted data."
  }, {
    question: "What file formats does the Converter support?",
    answer: "The File Converter supports 70+ formats across categories including images (JPG, PNG, WebP), documents (PDF, DOCX), audio (MP3, FLAC), video (MP4, AVI), archives (ZIP, 7Z), code files, and data formats."
  }, {
    question: "How does the File Compressor work?",
    answer: "Our File Compressor uses advanced algorithms to reduce file sizes while maintaining quality. It supports images, documents, audio, video, archives, and code files with customizable compression levels and smart optimization based on file type."
  }, {
    question: "What programming languages does Code support?",
    answer: "Prism Code supports web development with HTML, CSS, JavaScript, and can generate complete web applications with modern frameworks and deployment options."
  }, {
    question: "How accurate is the Math Assistant?",
    answer: "The Math Assistant uses advanced AI models trained on mathematical datasets and can handle everything from basic arithmetic to complex calculus, with step-by-step explanations and visual representations."
  }, {
    question: "What can the Detector identify?",
    answer: "The Detector can identify AI-generated content, analyze text authenticity, detect potential security threats in files, and provide detailed analysis reports."
  }, {
    question: "How do I get started?",
    answer: "Simply choose any tool from the navigation menu! Most features work without registration, though creating an account unlocks additional capabilities and saves your data."
  }, {
    question: "What are the pricing plans?",
    answer: "We offer a free tier with basic features and premium plans with advanced capabilities, higher limits, and priority support. Check our Pricing page for detailed information."
  }];
  return <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-background/95 backdrop-blur-md border border-border/50 shadow-xl p-4 rounded-lg flex flex-col gap-2">
        <div className="flex items-center space-x-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src="/lovable-uploads/3baec192-88ed-42ea-80e5-61f5cfa40481.png" alt="Prism Logo" />
            <AvatarFallback>P</AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-semibold">Prism Assistant</h3>
        </div>

        <ScrollArea className="h-48 mb-2">
          <div className="space-y-2">
            {chatHistory.map((chat, index) => <div key={index} className={`flex ${chat.sender === 'Prism' ? 'items-start' : 'items-end flex-row-reverse'}`}>
                <div className="flex-shrink-0">
                  <Avatar className="w-6 h-6">
                    {chat.sender === 'Prism' ? <>
                        <AvatarImage src="/lovable-uploads/3baec192-88ed-42ea-80e5-61f5cfa40481.png" alt="Prism Logo" />
                        <AvatarFallback>P</AvatarFallback>
                      </> : <>
                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                        <AvatarFallback>CN</AvatarFallback>
                      </>}
                  </Avatar>
                </div>
                <div className={`ml-2 mr-2 p-2 rounded-lg ${chat.sender === 'Prism' ? 'bg-secondary/20' : 'bg-primary/20 text-right'}`}>
                  <p className="text-sm">{chat.text}</p>
                </div>
              </div>)}
          </div>
        </ScrollArea>

        <div className="flex items-center space-x-2">
          <Input type="text" placeholder="Ask me anything..." value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => {
          if (e.key === 'Enter') {
            sendMessage();
          }
        }} className="flex-grow" />
          <Button onClick={sendMessage} size="sm">
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </PopoverContent>
    </Popover>;
};
export default PrismAssistant;