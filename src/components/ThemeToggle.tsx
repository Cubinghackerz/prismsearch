
import React from 'react';
import { Button } from '@/components/ui/button';
import { Moon } from 'lucide-react';

const ThemeToggle = () => {
  // Always dark mode - no toggle functionality needed
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground"
      disabled
    >
      <Moon className="h-4 w-4" />
    </Button>
  );
};

export default ThemeToggle;
