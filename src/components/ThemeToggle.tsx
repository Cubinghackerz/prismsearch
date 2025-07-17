import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
const ThemeToggle = () => {
  const {
    theme
  } = useTheme();
  // Theme toggle is disabled as we only support dark mode now
  return null;
};
export default ThemeToggle;