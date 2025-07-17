
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void; // Keep for API compatibility but won't do anything
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme] = useState<Theme>('dark');

  useEffect(() => {
    // Always apply dark theme
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add('dark');
    
    // Save to localStorage
    localStorage.setItem('prism-theme', 'dark');
  }, []);

  const toggleTheme = () => {
    // No-op since we only support dark mode
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
