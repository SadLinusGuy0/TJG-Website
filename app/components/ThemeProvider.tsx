"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type Theme = 'light' | 'dark' | 'auto';
export type AccentColor = 'blue' | 'coral' | 'mint' | 'lilac' | 'mono';

export const ACCENT_COLORS: Record<AccentColor, string> = {
  blue: '#387aff',
  coral: '#ff6b6b',
  mint: '#4ecdc4',
  lilac: '#a78bfa',
  mono : '#808080',
};

// Complimentary background colors for dark theme
export const ACCENT_DARK_BACKGROUNDS: Record<AccentColor, string> = {
  blue: '#000',
  coral: '#1a0f0f',
  mint: '#0a1414',
  lilac: '#120f1a',
  mono : '#000',
};

export const ACCENT_DARK_CONTAINER_BACKGROUNDS: Record<AccentColor, string> = {
  blue: '#17171a',
  coral: '#251a1a',
  mint: '#1a2525',
  lilac: '#1f1a25',
  mono : '#17171a',
}; 

// Complimentary background colors for light theme
export const ACCENT_LIGHT_BACKGROUNDS: Record<AccentColor, string> = {
  blue: '#f1f1f3',
  coral: '#F2E5E6',
  mint: '#D0EAEA',
  lilac: '#EAE5F2',
  mono : '#f1f1f3',
};

export const ACCENT_LIGHT_CONTAINER_BACKGROUNDS: Record<AccentColor, string> = {
  blue: '#fff',
  coral: '#FFFAFA',
  mint: '#EBFFFD',
  lilac: '#FCF8FF',
  mono : '#fff',
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  blurEnabled: boolean;
  setBlurEnabled: (enabled: boolean) => void;
  cornerSmoothing: boolean;
  setCornerSmoothing: (enabled: boolean) => void;
  cornerSmoothingSupported: boolean;
  hydrated: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'auto',
  setTheme: () => {},
  accentColor: 'blue',
  setAccentColor: () => {},
  blurEnabled: true,
  setBlurEnabled: () => {},
  cornerSmoothing: false,
  setCornerSmoothing: () => {},
  cornerSmoothingSupported: false,
  hydrated: false,
});

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) return savedTheme;
  }
  return 'auto';
};

const getInitialBlurEnabled = (): boolean => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('progressiveBlur');
    return saved === null ? true : saved === 'true';
  }
  return true;
};

const getCornerSmoothingSupported = (): boolean => {
  if (typeof window !== 'undefined' && typeof CSS !== 'undefined' && CSS.supports) {
    return CSS.supports('corner-shape', 'squircle');
  }
  return false;
};

const getInitialCornerSmoothing = (): boolean => {
  const supported = getCornerSmoothingSupported();
  if (!supported) return false;
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('cornerSmoothing');
    return saved === null ? true : saved === 'true';
  }
  return true;
};

const getInitialAccentColor = (): AccentColor => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('accentColor') as AccentColor;
    if (saved && ACCENT_COLORS[saved]) return saved;
    // Migrate old color values to new ones
    const oldColorMap: Record<string, AccentColor> = {
      'red': 'coral',
      'green': 'mint',
      'orange': 'coral',
      'magenta': 'lilac'
    };
    if (saved && oldColorMap[saved]) {
      const newColor = oldColorMap[saved];
      localStorage.setItem('accentColor', newColor);
      return newColor;
    }
  }
  return 'blue';
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [accentColor, setAccentColorState] = useState<AccentColor>(getInitialAccentColor);
  const [blurEnabled, setBlurEnabledState] = useState<boolean>(getInitialBlurEnabled);
  const [cornerSmoothing, setCornerSmoothingState] = useState<boolean>(getInitialCornerSmoothing);
  const [cornerSmoothingSupported] = useState<boolean>(getCornerSmoothingSupported);
  const [hydrated, setHydrated] = useState(false);
  const pathname = usePathname();

  const applyAccentColor = (color: AccentColor) => {
    document.documentElement.style.setProperty('--accent', ACCENT_COLORS[color]);
    
    // Apply complimentary backgrounds based on current theme
    const currentTheme = document.documentElement.dataset.theme || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    if (currentTheme === 'dark') {
      document.documentElement.style.setProperty('--dark-background', ACCENT_DARK_BACKGROUNDS[color]);
      document.documentElement.style.setProperty('--dark-container-background', ACCENT_DARK_CONTAINER_BACKGROUNDS[color]);
    } else {
      document.documentElement.style.setProperty('--light-background', ACCENT_LIGHT_BACKGROUNDS[color]);
      document.documentElement.style.setProperty('--light-container-background', ACCENT_LIGHT_CONTAINER_BACKGROUNDS[color]);
    }
  };

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'auto') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        document.documentElement.dataset.theme = systemTheme;
        // Update theme-color meta tag for Safari URL bar
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
          const accentColor = (localStorage.getItem('accentColor') as AccentColor) || 'blue';
          const bgColor = systemTheme === 'dark' 
            ? ACCENT_DARK_BACKGROUNDS[accentColor] 
            : ACCENT_LIGHT_BACKGROUNDS[accentColor];
          themeColorMeta.setAttribute('content', bgColor);
        }
      } else {
        document.documentElement.dataset.theme = savedTheme;
        // Update theme-color meta tag for Safari URL bar
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
          const accentColor = (localStorage.getItem('accentColor') as AccentColor) || 'blue';
          const bgColor = savedTheme === 'dark' 
            ? ACCENT_DARK_BACKGROUNDS[accentColor] 
            : ACCENT_LIGHT_BACKGROUNDS[accentColor];
          themeColorMeta.setAttribute('content', bgColor);
        }
      }
    } else {
      // If no saved theme, use system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.dataset.theme = systemTheme;
      // Update theme-color meta tag for Safari URL bar
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', systemTheme === 'dark' ? '#000' : '#f1f1f3');
      }
    }

    // Initialize accent color
    const savedAccentColor = localStorage.getItem('accentColor') as AccentColor;
    const accentValue = savedAccentColor && ACCENT_COLORS[savedAccentColor] ? savedAccentColor : 'blue';
    applyAccentColor(accentValue);

    // Listen for system theme changes if theme is auto
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if ((localStorage.getItem('theme') as Theme) === 'auto') {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.dataset.theme = newTheme;
        // Update theme-color meta tag for Safari URL bar
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
          const accentColor = (localStorage.getItem('accentColor') as AccentColor) || 'blue';
          const bgColor = newTheme === 'dark' 
            ? ACCENT_DARK_BACKGROUNDS[accentColor] 
            : ACCENT_LIGHT_BACKGROUNDS[accentColor];
          themeColorMeta.setAttribute('content', bgColor);
        }
        // Reapply accent color backgrounds for new theme
        const accentColor = (localStorage.getItem('accentColor') as AccentColor) || 'blue';
        applyAccentColor(accentColor);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    let currentTheme: 'dark' | 'light';
    if (theme === 'auto') {
      currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.dataset.theme = currentTheme;
    } else {
      currentTheme = theme;
      document.documentElement.dataset.theme = theme;
    }
    // Update theme-color meta tag for Safari URL bar
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      const bgColor = currentTheme === 'dark' 
        ? ACCENT_DARK_BACKGROUNDS[accentColor] 
        : ACCENT_LIGHT_BACKGROUNDS[accentColor];
      themeColorMeta.setAttribute('content', bgColor);
    }
    // Reapply accent color backgrounds for new theme
    applyAccentColor(accentColor);
  }, [theme, accentColor]);

  useEffect(() => {
    localStorage.setItem('accentColor', accentColor);
    applyAccentColor(accentColor);
  }, [accentColor]);

  useEffect(() => {
    setHydrated(true);
    document.documentElement.dataset.cornerSmoothing = cornerSmoothing.toString();
  }, []);
  if (!hydrated) return null;

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
    applyAccentColor(color);
    localStorage.setItem('accentColor', color);
  };

  const setBlurEnabled = (enabled: boolean) => {
    setBlurEnabledState(enabled);
    document.documentElement.dataset.progressiveBlur = enabled.toString();
    localStorage.setItem('progressiveBlur', enabled.toString());
  };

  const setCornerSmoothing = (enabled: boolean) => {
    if (!cornerSmoothingSupported) return;
    setCornerSmoothingState(enabled);
    document.documentElement.dataset.cornerSmoothing = enabled.toString();
    localStorage.setItem('cornerSmoothing', enabled.toString());
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accentColor, setAccentColor, blurEnabled, setBlurEnabled, cornerSmoothing, setCornerSmoothing, cornerSmoothingSupported, hydrated }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 