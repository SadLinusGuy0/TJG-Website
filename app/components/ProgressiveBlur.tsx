'use client';
import React, { useEffect, useState } from 'react';
import { useTheme } from './ThemeProvider';
import { usePathname } from 'next/navigation';

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

function buildMask(stops: number[], position: 'top' | 'bottom'): string {
  const isTop = position === 'top';
  const s = isTop ? stops.map(v => 100 - v).reverse() : stops;

  if (stops.length === 2) {
    return isTop
      ? `linear-gradient(rgba(0,0,0,1) ${s[0]}%, rgba(0,0,0,0) ${s[1]}%)`
      : `linear-gradient(rgba(0,0,0,0) ${s[0]}%, rgba(0,0,0,1) ${s[1]}%)`;
  }

  return `linear-gradient(rgba(0,0,0,0) ${s[0]}%, rgba(0,0,0,1) ${s[1]}%, rgba(0,0,0,1) ${s[2]}%, rgba(0,0,0,0) ${s[3]}%)`;
}

export default function ProgressiveBlur({ position = 'top' }: ProgressiveBlurProps) {
  const { blurEnabled, hydrated } = useTheme();
  const pathname = usePathname();
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth > 900 : true
  );
  const [topHomeOpacity, setTopHomeOpacity] = useState(1);

  const isTopHomeBlur = position === 'top' && pathname === '/';

  useEffect(() => {
    if (position !== 'bottom') return;
    function handleResize() {
      setIsDesktop(window.innerWidth > 900);
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [position]);

  useEffect(() => {
    if (!isTopHomeBlur) {
      setTopHomeOpacity(1);
      return;
    }

    const FADE_DISTANCE = 140;
    const updateOpacity = () => {
      const progress = Math.min(1, Math.max(0, window.scrollY / FADE_DISTANCE));
      setTopHomeOpacity(progress);
    };

    updateOpacity();
    window.addEventListener('scroll', updateOpacity, { passive: true });
    return () => window.removeEventListener('scroll', updateOpacity);
  }, [isTopHomeBlur]);

  if (!hydrated) return null;
  if (!blurEnabled) return null;
  if (position === 'bottom' && !isDesktop) return null;

  const isTop = position === 'top';

  return (
    <div
      className={`progressive-blur-overlay progressive-blur-overlay--${position}`}
      aria-hidden="true"
      style={{
        opacity: isTopHomeBlur ? topHomeOpacity : 1,
        transition: isTopHomeBlur ? 'opacity 180ms ease-out' : undefined,
      }}
    >
      {BLUR_LAYERS.map((layer, i) => {
        const mask = buildMask(layer.stops, position);
        return (
          <div
            key={i}
            className="progressive-blur-layer"
            style={{
              backdropFilter: `blur(${layer.blur}px)`,
              WebkitBackdropFilter: `blur(${layer.blur}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        );
      })}
      <div
        className="progressive-blur-gradient"
        style={{
          background: isTop
            ? 'linear-gradient(var(--background), transparent)'
            : 'linear-gradient(transparent, var(--background))',
        }}
      />
    </div>
  );
}
