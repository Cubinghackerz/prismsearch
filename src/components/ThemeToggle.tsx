import React from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
const ThemeToggle = () => {
  const {
    theme,
    toggleTheme
  } = useTheme();
  return (
    <Button variant="ghost" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
};
export default ThemeToggle;

