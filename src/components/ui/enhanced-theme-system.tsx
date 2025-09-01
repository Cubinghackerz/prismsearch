
import React, { createContext, useContext, useState, useEffect } from 'react';

interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  ambientMode: 'static' | 'dynamic' | 'adaptive';
}

interface ThemeContextType {
  currentTheme: Theme;
  availableThemes: Theme[];
  setTheme: (themeId: string) => void;
  customizeTheme: (colors: Partial<Theme['colors']>) => void;
  ambientMode: 'static' | 'dynamic' | 'adaptive';
  setAmbientMode: (mode: 'static' | 'dynamic' | 'adaptive') => void;
}

const defaultThemes: Theme[] = [
  {
    id: 'prism-dark',
    name: 'Prism Dark',
    colors: {
      primary: '#00C2A8',
      secondary: '#9B5DE5',
      accent: '#1DD1B8',
      background: '#0D0D0D',
      surface: '#1A1A1A',
      text: '#F2F2F2',
    },
    ambientMode: 'static',
  },
  {
    id: 'ocean-depths',
    name: 'Ocean Depths',
    colors: {
      primary: '#0EA5E9',
      secondary: '#8B5CF6',
      accent: '#06B6D4',
      background: '#0C1426',
      surface: '#1E293B',
      text: '#F1F5F9',
    },
    ambientMode: 'dynamic',
  },
  {
    id: 'forest-night',
    name: 'Forest Night',
    colors: {
      primary: '#10B981',
      secondary: '#F59E0B',
      accent: '#34D399',
      background: '#0F1419',
      surface: '#1F2937',
      text: '#F9FAFB',
    },
    ambientMode: 'adaptive',
  },
];

const EnhancedThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useEnhancedTheme = () => {
  const context = useContext(EnhancedThemeContext);
  if (!context) {
    throw new Error('useEnhancedTheme must be used within EnhancedThemeProvider');
  }
  return context;
};

interface EnhancedThemeProviderProps {
  children: React.ReactNode;
}

export const EnhancedThemeProvider: React.FC<EnhancedThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultThemes[0]);
  const [availableThemes, setAvailableThemes] = useState<Theme[]>(defaultThemes);
  const [ambientMode, setAmbientMode] = useState<'static' | 'dynamic' | 'adaptive'>('static');

  const setTheme = (themeId: string) => {
    const theme = availableThemes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      setAmbientMode(theme.ambientMode);
      applyTheme(theme);
    }
  };

  const customizeTheme = (colors: Partial<Theme['colors']>) => {
    const customTheme: Theme = {
      ...currentTheme,
      id: 'custom',
      name: 'Custom Theme',
      colors: { ...currentTheme.colors, ...colors },
    };
    setCurrentTheme(customTheme);
    applyTheme(customTheme);
  };

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    
    // Convert hex to HSL for CSS custom properties
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    root.style.setProperty('--primary', hexToHsl(theme.colors.primary));
    root.style.setProperty('--secondary', hexToHsl(theme.colors.secondary));
    root.style.setProperty('--accent', hexToHsl(theme.colors.accent));
    root.style.setProperty('--background', hexToHsl(theme.colors.background));
    root.style.setProperty('--card', hexToHsl(theme.colors.surface));
  };

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  return (
    <EnhancedThemeContext.Provider value={{
      currentTheme,
      availableThemes,
      setTheme,
      customizeTheme,
      ambientMode,
      setAmbientMode,
    }}>
      {children}
    </EnhancedThemeContext.Provider>
  );
};
