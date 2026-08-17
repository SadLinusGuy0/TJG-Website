'use client';
import { useEffect, useState } from 'react';

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
  const [topOpacity, setTopOpacity] = useState(0);

  const isTopBlur = position === 'top';

  useEffect(() => {
    if (!isTopBlur) return;

    const FADE_DISTANCE = 4;
    const updateOpacity = () => {
      const progress = Math.min(1, Math.max(0, window.scrollY / FADE_DISTANCE));
      setTopOpacity(progress);
    };

    updateOpacity();
    window.addEventListener('scroll', updateOpacity, { passive: true });
    return () => window.removeEventListener('scroll', updateOpacity);
  }, [isTopBlur]);

  const isTop = position === 'top';

  return (
    <div
      className={`progressive-blur-overlay progressive-blur-overlay--${position}`}
      aria-hidden="true"
      style={{
        opacity: isTopBlur ? topOpacity : 1,
        transition: isTopBlur ? 'opacity 180ms ease-out' : undefined,
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
