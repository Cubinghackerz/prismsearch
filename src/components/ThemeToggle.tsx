
import React from 'react';
import { Button } from '@/components/ui/button';
import { Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-10 w-10"
      disabled
      title="Dark mode (always enabled)"
    >
      <Moon className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Dark mode enabled</span>
    </Button>
  );
};

export default ThemeToggle;
