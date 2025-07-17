
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void; // Keep for compatibility but does nothing
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
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    // Always set to dark theme
    setTheme('dark');
  }, []);

  useEffect(() => {
    // Apply dark theme to document
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add('dark');
    
    // Save to localStorage
    localStorage.setItem('prism-theme', 'dark');
  }, [theme]);

  const toggleTheme = () => {
    // No-op function for compatibility
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
