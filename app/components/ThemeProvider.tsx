"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  experimentalUI: boolean;
  setExperimentalUI: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'auto',
  setTheme: () => {},
  experimentalUI: false,
  setExperimentalUI: () => {},
});

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) return savedTheme;
  }
  return 'auto';
};

const getInitialExperimentalUI = (): boolean => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('experimentalUI');
    return saved === 'true';
  }
  return false;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [experimentalUI, setExperimentalUIState] = useState<boolean>(getInitialExperimentalUI);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'auto') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        document.documentElement.dataset.theme = systemTheme;
      } else {
        document.documentElement.dataset.theme = savedTheme;
      }
    } else {
      // If no saved theme, use system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.dataset.theme = systemTheme;
    }

    // Listen for system theme changes if theme is auto
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if ((localStorage.getItem('theme') as Theme) === 'auto') {
        document.documentElement.dataset.theme = e.matches ? 'dark' : 'light';
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'auto') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.dataset.theme = systemTheme;
    } else {
      document.documentElement.dataset.theme = theme;
    }
  }, [theme]);

  useEffect(() => { setHydrated(true); }, []);
  if (!hydrated) return null;

  const setExperimentalUI = (enabled: boolean) => {
    setExperimentalUIState(enabled);
    document.documentElement.dataset.experimental = enabled.toString();
    localStorage.setItem('experimentalUI', enabled.toString());
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, experimentalUI, setExperimentalUI }}>
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