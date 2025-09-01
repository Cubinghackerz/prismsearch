
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Check } from 'lucide-react';

const Prism2AnnouncementDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already seen this announcement
    const hasSeenAnnouncement = localStorage.getItem('prism2-announcement-seen');
    if (!hasSeenAnnouncement) {
      // Show dialog after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('prism2-announcement-seen', 'true');
  };

  const improvements = [
    'Major bug fixes',
    'Enhanced AI thinking time',
    'Reworked physics helper',
    'Math assistant improvements',
    'Chemistry lab upgrades',
    'Enhanced graphing tool',
    'Upgraded code generator'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-md border-border/50">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <DialogTitle className="text-2xl font-bold text-foreground">
              Prism 2.0 has shipped!
            </DialogTitle>
            <Badge variant="default" className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
              <Zap className="w-3 h-3 mr-1" />
              New
            </Badge>
          </div>
          <DialogDescription className="text-muted-foreground text-lg">
            Experience the next generation of productivity tools with major improvements across all features.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-accent" />
              What's New:
            </h4>
            <div className="space-y-2">
              {improvements.map((improvement, index) => (
                <div key={index} className="flex items-center text-sm text-muted-foreground">
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                  {improvement}
                </div>
              ))}
            </div>
          </div>
          
          <Button 
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold"
            size="lg"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Explore Prism 2.0
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Prism2AnnouncementDialog;
