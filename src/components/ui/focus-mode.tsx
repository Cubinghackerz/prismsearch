
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Focus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FocusModeProps {
  children: React.ReactNode;
  toolName: string;
}

const FocusMode: React.FC<FocusModeProps> = ({ children, toolName }) => {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showFocusHint, setShowFocusHint] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'F') {
        event.preventDefault();
        setIsFocusMode(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isFocusMode) {
      document.body.classList.add('focus-mode');
      setShowFocusHint(true);
      const timer = setTimeout(() => setShowFocusHint(false), 3000);
      return () => clearTimeout(timer);
    } else {
      document.body.classList.remove('focus-mode');
    }
  }, [isFocusMode]);

  return (
    <div className={cn(
      "relative transition-all duration-300",
      isFocusMode && "focus-mode-container"
    )}>
      {/* Focus Mode Toggle */}
      <div className={cn(
        "fixed top-4 right-4 z-50 flex items-center space-x-2 transition-opacity",
        isFocusMode ? "opacity-20 hover:opacity-100" : "opacity-100"
      )}>
        <Button
          variant={isFocusMode ? "default" : "outline"}
          size="sm"
          onClick={() => setIsFocusMode(!isFocusMode)}
          className="flex items-center space-x-2"
        >
          {isFocusMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span className="hidden sm:inline">
            {isFocusMode ? 'Exit Focus' : 'Focus Mode'}
          </span>
        </Button>
      </div>

      {/* Focus Mode Hint */}
      {showFocusHint && (
        <div className="fixed top-16 right-4 z-50 animate-fade-in">
          <Badge variant="secondary" className="flex items-center space-x-2 px-3 py-2">
            <Focus className="h-3 w-3" />
            <span>Focus Mode Active - Press Ctrl+Shift+F to toggle</span>
          </Badge>
        </div>
      )}

      {/* Tool Badge */}
      {isFocusMode && (
        <div className="fixed top-4 left-4 z-50 opacity-20 hover:opacity-100 transition-opacity">
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
            {toolName}
          </Badge>
        </div>
      )}

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300",
        isFocusMode && "focus-mode-content"
      )}>
        {children}
      </div>

      {/* Focus Mode Overlay Styles */}
      <style jsx global>{`
        .focus-mode {
          overflow: hidden;
        }
        
        .focus-mode-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 40;
          background: hsl(var(--background));
        }
        
        .focus-mode-content {
          height: 100vh;
          overflow-y: auto;
          padding: 1rem;
        }
        
        .focus-mode nav,
        .focus-mode footer,
        .focus-mode .sidebar {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default FocusMode;
