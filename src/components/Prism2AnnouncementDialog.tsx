
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle, Zap, Brain, Atom, Calculator, BarChart3, Code } from 'lucide-react';

const Prism2AnnouncementDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already seen the announcement
    const hasSeenAnnouncement = localStorage.getItem('prism-2.0-announcement-seen');
    
    if (!hasSeenAnnouncement) {
      // Show dialog after a short delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Mark as seen so it doesn't show again
    localStorage.setItem('prism-2.0-announcement-seen', 'true');
  };

  const improvements = [
    { icon: <CheckCircle className="h-4 w-4" />, text: "Major bug fixes" },
    { icon: <Brain className="h-4 w-4" />, text: "Enhanced AI thinking time" },
    { icon: <Atom className="h-4 w-4" />, text: "Reworked physics helper" },
    { icon: <Calculator className="h-4 w-4" />, text: "Enhanced math assistant" },
    { icon: <Atom className="h-4 w-4" />, text: "Improved chemistry lab" },
    { icon: <BarChart3 className="h-4 w-4" />, text: "Advanced graphing tool" },
    { icon: <Code className="h-4 w-4" />, text: "Upgraded code generator" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-card via-card to-card/90 border border-primary/20 backdrop-blur-sm">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse-slow">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-xs font-bold animate-bounce">
                  NEW
                </Badge>
              </div>
            </div>
          </div>
          
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Prism 2.0 has shipped! 🚀
          </DialogTitle>
          
          <DialogDescription className="text-center text-base text-muted-foreground">
            We've been working hard to bring you the best experience. Here's what's new:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-6">
          {improvements.map((improvement, index) => (
            <div 
              key={index} 
              className="flex items-center space-x-3 p-2 rounded-lg bg-secondary/30 border border-border/30 hover:bg-secondary/50 transition-colors"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-primary animate-fade-in">
                {improvement.icon}
              </div>
              <span className="text-sm font-medium text-foreground animate-fade-in">
                {improvement.text}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-center space-y-2">
          <Button 
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
          >
            <Zap className="mr-2 h-4 w-4" />
            Explore Prism 2.0
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Prism2AnnouncementDialog;
