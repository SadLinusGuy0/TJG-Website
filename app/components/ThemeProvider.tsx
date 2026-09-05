"use client";
import { localPreferences } from '../../lib/browserStorage';

import React, { Suspense, createContext, lazy, useContext, useEffect, useState } from 'react';
import { supportsLisseSmoothCorners } from '../utils/cornerSmoothingSupport';

const LazyCornerSmoothingManager = lazy(
  () => import('./CornerSmoothingManager').then((module) => ({
    default: module.CornerSmoothingManager,
  })),
);

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
  cornerSmoothingAvailable: boolean;
  fmpSeparatedViewAvailable: boolean;
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
  cornerSmoothingAvailable: false,
  fmpSeparatedViewAvailable: false,
  hydrated: false,
});

const getCornerSmoothingSupported = (): boolean => {
  return supportsLisseSmoothCorners();
};

const getInitialAccentColor = (): AccentColor => {
  if (typeof window !== 'undefined') {
    const saved = localPreferences.getItem('accentColor') as AccentColor;
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
      localPreferences.setItem('accentColor', newColor);
      return newColor;
    }
  }
  return 'blue';
};

function updateThemeColorMeta(resolvedTheme: 'dark' | 'light', accent: AccentColor) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    const bg = resolvedTheme === 'dark'
      ? ACCENT_DARK_BACKGROUNDS[accent]
      : ACCENT_LIGHT_BACKGROUNDS[accent];
    meta.setAttribute('content', bg);
  }
}

interface ThemeProviderProps {
  children: React.ReactNode;
  cornerSmoothingAvailable?: boolean;
  fmpSeparatedViewAvailable?: boolean;
}

export function ThemeProvider({ children, cornerSmoothingAvailable = false, fmpSeparatedViewAvailable = false }: ThemeProviderProps) {
  // Keep the server render and the first client render identical. Stored
  // preferences are applied after hydration; the head script handles the
  // pre-hydration visual theme without changing React's element tree.
  const [theme, setTheme] = useState<Theme>('auto');
  const [accentColor, setAccentColorState] = useState<AccentColor>('blue');
  const [blurEnabled, setBlurEnabledState] = useState(true);
  const [cornerSmoothing, setCornerSmoothingState] = useState(false);
  const [cornerSmoothingSupported, setCornerSmoothingSupported] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const applyAccentColor = (color: AccentColor) => {
    document.documentElement.dataset.accent = color;
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
    const storedTheme = localPreferences.getItem('theme');
    const initialTheme: Theme = storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'auto'
      ? storedTheme
      : 'auto';
    const initialAccent = getInitialAccentColor();
    const storedBlur = localPreferences.getItem('progressiveBlur');
    const initialBlur = storedBlur === null ? true : storedBlur === 'true';
    const smoothingSupported = getCornerSmoothingSupported();
    const storedSmoothing = localPreferences.getItem('cornerSmoothing');
    const initialSmoothing = cornerSmoothingAvailable
      && smoothingSupported
      && (storedSmoothing === null ? true : storedSmoothing === 'true');
    const resolvedTheme = initialTheme === 'auto'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : initialTheme;

    setTheme(initialTheme);
    setAccentColorState(initialAccent);
    setBlurEnabledState(initialBlur);
    setCornerSmoothingSupported(smoothingSupported);
    setCornerSmoothingState(initialSmoothing);

    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.dataset.progressiveBlur = initialBlur.toString();
    document.documentElement.dataset.cornerSmoothing = initialSmoothing.toString();
    applyAccentColor(initialAccent);
    updateThemeColorMeta(resolvedTheme, initialAccent);
    setHydrated(true);

    // Listen for system theme changes if theme is auto
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if ((localPreferences.getItem('theme') as Theme) === 'auto') {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.dataset.theme = newTheme;
        const ac = getInitialAccentColor();
        updateThemeColorMeta(newTheme, ac);
        // Reapply accent color backgrounds for new theme
        applyAccentColor(ac);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [cornerSmoothingAvailable]);

  useEffect(() => {
    if (!hydrated) return;

    localPreferences.setItem('theme', theme);
    let currentTheme: 'dark' | 'light';
    if (theme === 'auto') {
      currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.dataset.theme = currentTheme;
    } else {
      currentTheme = theme;
      document.documentElement.dataset.theme = theme;
    }
    updateThemeColorMeta(currentTheme, accentColor);
    // Reapply accent color backgrounds for new theme
    applyAccentColor(accentColor);
  }, [accentColor, hydrated, theme]);

  useEffect(() => {
    if (!hydrated) return;

    localPreferences.setItem('progressiveBlur', blurEnabled.toString());
    document.documentElement.dataset.progressiveBlur = blurEnabled.toString();
  }, [blurEnabled, hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    document.documentElement.dataset.cornerSmoothing = (cornerSmoothingAvailable && cornerSmoothing).toString();
  }, [cornerSmoothing, cornerSmoothingAvailable, hydrated]);

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
    applyAccentColor(color);
    localPreferences.setItem('accentColor', color);
  };

  const setBlurEnabled = (enabled: boolean) => {
    setBlurEnabledState(enabled);
    document.documentElement.dataset.progressiveBlur = enabled.toString();
    localPreferences.setItem('progressiveBlur', enabled.toString());
  };

  const setCornerSmoothing = (enabled: boolean) => {
    if (!cornerSmoothingAvailable || !cornerSmoothingSupported) return;
    setCornerSmoothingState(enabled);
    document.documentElement.dataset.cornerSmoothing = enabled.toString();
    localPreferences.setItem('cornerSmoothing', enabled.toString());
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accentColor, setAccentColor, blurEnabled, setBlurEnabled, cornerSmoothing, setCornerSmoothing, cornerSmoothingSupported, cornerSmoothingAvailable, fmpSeparatedViewAvailable, hydrated }}>
      {children}
      {hydrated && cornerSmoothingAvailable && cornerSmoothing
        ? (
          <Suspense fallback={null}>
            <LazyCornerSmoothingManager enabled />
          </Suspense>
        )
        : null}
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
