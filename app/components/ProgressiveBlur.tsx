'use client';
import React, { useEffect, useState } from 'react';
import { useTheme } from './ThemeProvider';

interface ProgressiveBlurProps {
  position?: 'top' | 'bottom';
}

const BLUR_LAYERS = [
  { blur: 1, stops: [0, 10, 30, 40] },
  { blur: 2, stops: [10, 20, 40, 50] },
  { blur: 4, stops: [15, 30, 50, 60] },
  { blur: 8, stops: [20, 40, 60, 70] },
  { blur: 16, stops: [40, 60, 80, 90] },
  { blur: 32, stops: [60, 80] },
  { blur: 64, stops: [70, 100] },
];

function getMask(stops: number[], flip: boolean): string {
  const s = flip ? stops.map(v => 100 - v).reverse() : stops;
  if (stops.length === 2) {
    return flip
      ? `linear-gradient(rgba(0,0,0,1) ${s[0]}%, rgba(0,0,0,0) ${s[1]}%)`
      : `linear-gradient(rgba(0,0,0,0) ${s[0]}%, rgba(0,0,0,1) ${s[1]}%)`;
  }
  return `linear-gradient(rgba(0,0,0,0) ${s[0]}%, rgba(0,0,0,1) ${s[1]}%, rgba(0,0,0,1) ${s[2]}%, rgba(0,0,0,0) ${s[3]}%)`;
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
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [position]);

  if (!hydrated) return null;
  if (!blurEnabled) return null;
  if (position === 'bottom' && !isDesktop) return null;

  const isTop = position === 'top';

  return (
    <div
      className="progressive-blur-overlay"
      aria-hidden="true"
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        [isTop ? 'top' : 'bottom']: 0,
        left: 0,
        width: '100vw',
        height: '160px',
        zIndex: 9,
      }}
    >
      {BLUR_LAYERS.map((layer, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            backdropFilter: `blur(${layer.blur}px)`,
            WebkitBackdropFilter: `blur(${layer.blur}px)`,
            mask: getMask(layer.stops, isTop),
            WebkitMask: getMask(layer.stops, isTop),
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isTop
            ? 'linear-gradient(var(--background), transparent)'
            : 'linear-gradient(transparent, var(--background))',
        }}
      />
    </div>
  );
}
