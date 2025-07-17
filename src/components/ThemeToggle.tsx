
import React from 'react';
import { Button } from '@/components/ui/button';
import { Moon } from 'lucide-react';

const ThemeToggle = () => {
  // Always dark mode - no toggle functionality needed
  return (
    <Button variant="ghost" size="sm" className="w-9 px-0">
      <Moon className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Dark mode</span>
    </Button>
  );
};

export default ThemeToggle;
