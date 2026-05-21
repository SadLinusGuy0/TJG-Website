'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export interface SlideData {
  src: string;
  alt: string;
  caption?: string;
}

interface NativeSlideshowProps {
  slides: SlideData[];
}

export default function NativeSlideshow({ slides }: NativeSlideshowProps) {
  const [current, setCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startTimeRef = useRef(0);

  const total = slides.length;

  const goTo = useCallback((index: number) => {
    setCurrent(Math.max(0, Math.min(total - 1, index)));
  }, [total]);

  const prev = useCallback(() => goTo(current - 1), [current, goTo]);
  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (total <= 1) return;
    setIsDragging(true);
    setDragOffset(0);
    startXRef.current = e.clientX;
    startTimeRef.current = Date.now();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [total]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - startXRef.current;
    setDragOffset(dx);
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const width = trackRef.current?.clientWidth || 1;
    const velocity = dragOffset / (Date.now() - startTimeRef.current + 1);
    const threshold = width * 0.2;
    const flicked = Math.abs(velocity) > 0.3;

    if (dragOffset < -threshold || (flicked && velocity < 0)) {
      goTo(current + 1);
    } else if (dragOffset > threshold || (flicked && velocity > 0)) {
      goTo(current - 1);
    }

    setDragOffset(0);
  }, [isDragging, dragOffset, current, goTo]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    el.addEventListener('keydown', onKeyDown);
    return () => el.removeEventListener('keydown', onKeyDown);
  }, [prev, next]);

  if (total === 0) return null;

  const transformValue = isDragging
    ? `translateX(calc(-${current * 100}% + ${dragOffset}px))`
    : `translateX(-${current * 100}%)`;

  return (
    <div
      className="native-slideshow"
      style={{
        position: 'relative',
        margin: '24px 0',
        borderRadius: 'var(--br-9xl)',
        overflow: 'hidden',
      }}
    >
      <div
        ref={trackRef}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Image slideshow"
        style={{
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : total > 1 ? 'grab' : 'default',
          outline: 'none',
          touchAction: 'pan-y pinch-zoom',
          borderRadius: 'var(--br-9xl)',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          style={{
            display: 'flex',
            transform: transformValue,
            transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
            willChange: 'transform',
          }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${i + 1} of ${total}`}
              style={{ flex: '0 0 100%', minWidth: 0 }}
            >
              <img
                src={slide.src}
                alt={slide.alt}
                draggable={false}
                className="native-slideshow__img"
                style={{
                  width: '100%',
                  maxHeight: '40vh',
                  objectFit: 'contain',
                  display: 'block',
                  borderRadius: 'var(--br-9xl)',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              />
              {slide.caption && (
                <figcaption
                  style={{
                    textAlign: 'center',
                    color: 'var(--secondary)',
                    fontSize: '0.85rem',
                    lineHeight: 1.4,
                    marginTop: 6,
                    padding: '0 10px 8px',
                  }}
                >
                  {slide.caption}
                </figcaption>
              )}
            </div>
          ))}
        </div>
      </div>

      {total > 1 && (
        <>
          <button
            aria-label="Previous slide"
            onClick={prev}
            disabled={current === 0}
            style={{
              position: 'absolute',
              top: '50%',
              left: 8,
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff',
              width: 36,
              height: 36,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 2,
              opacity: current === 0 ? 0.3 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M15 6L9 12L15 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button
            aria-label="Next slide"
            onClick={next}
            disabled={current === total - 1}
            style={{
              position: 'absolute',
              top: '50%',
              right: 8,
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff',
              width: 36,
              height: 36,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 2,
              opacity: current === total - 1 ? 0.3 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M9 6L15 12L9 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          <div
            style={{
              display: 'flex',
              gap: 6,
              justifyContent: 'center',
              padding: '10px 0 6px',
            }}
          >
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                style={{
                  width: i === current ? 20 : 8,
                  height: 8,
                  borderRadius: 999,
                  border: 'none',
                  background: i === current ? 'var(--accent)' : 'var(--secondary)',
                  opacity: i === current ? 1 : 0.35,
                  transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
