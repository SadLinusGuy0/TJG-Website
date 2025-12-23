'use client';
import React, { useEffect, useState } from 'react';
import { useTheme } from './ThemeProvider';

interface ProgressiveBlurProps {
  position?: 'top' | 'bottom';
}

export default function ProgressiveBlur({ position = 'top' }: ProgressiveBlurProps) {
  const { blurEnabled, hydrated } = useTheme();
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth > 900 : true
  );

  useEffect(() => {
    if (position !== 'bottom') return;
    function handleResize() {
      setIsDesktop(window.innerWidth > 900);
    }
    window.addEventListener('resize', handleResize);
    // Set initial value on hydration
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [position]);

  if (!hydrated) return null;
  if (!blurEnabled) return null;

  // Only show bottom blur on desktop
  if (position === 'bottom' && !isDesktop) {
    return null;
  }

  // Default styles
  const style: React.CSSProperties = position === 'top'
    ? { top: 0, left: 0, width: '100vw', height: '160px', bottom: 'auto', maskImage: 'linear-gradient(to bottom, black 0%, transparent 70%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 70%)', zIndex: 9, backdropFilter: 'blur(120px)', WebkitBackdropFilter: 'blur(120px)' }
    : { bottom: 0, left: 0, width: '100vw', height: '160px', top: 'auto', maskImage: 'linear-gradient(to top, black 0%, transparent 70%)', WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 70%)', zIndex: 9, backdropFilter: 'blur(120px)', WebkitBackdropFilter: 'blur(120px)' };

  return (
    <div
      className="progressive-blur-overlay"
      aria-hidden="true"
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        ...style,
      }}
    />
  );
} 