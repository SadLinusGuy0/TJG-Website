"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

export default function LightboxClient(): JSX.Element | null {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null);
  const [isSliding, setIsSliding] = useState(false);
  const [caption, setCaption] = useState<string>("");

  const sources = useMemo(() => {
    return images.map((img) => img.getAttribute("data-full") || img.getAttribute("src") || "");
  }, [images]);

  const captions = useMemo(() => {
    return images.map((img) => {
      // Try closest figure>figcaption if present
      const figure = img.closest('figure');
      const figcap = figure?.querySelector('figcaption');
      return figcap?.textContent?.trim() || img.getAttribute('alt') || '';
    });
  }, [images]);

  const openAt = useCallback((idx: number) => {
    if (!sources.length) return;
    const len = sources.length;
    const next = ((idx % len) + len) % len;
    setCurrentIndex(next);
    setCaption(captions[next] || "");
    setIsOpening(true);
    setIsOpen(true);
    // Two rafs to ensure the DOM paints before toggling classes
    requestAnimationFrame(() => requestAnimationFrame(() => setIsOpening(false)));
    if (typeof document !== "undefined") {
      document.documentElement.style.overflow = "hidden";
    }
  }, [sources.length]);

  const close = useCallback(() => {
    // Play closing transition before unmounting
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      if (typeof document !== "undefined") {
        document.documentElement.style.overflow = "";
      }
    }, 200);
  }, []);

  const doSlide = useCallback((dir: 'next' | 'prev', targetIndex: number) => {
    if (!sources.length) return;
    setDirection(dir);
    setIsSliding(true);
    // Allow CSS to detect sliding-active, then switch image after a tick
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setCurrentIndex(((targetIndex % sources.length) + sources.length) % sources.length);
        setCaption(captions[((targetIndex % sources.length) + sources.length) % sources.length] || "");
        // End sliding after transition duration
        setTimeout(() => setIsSliding(false), 260);
      });
    });
  }, [sources.length, captions]);

  const prev = useCallback(() => doSlide('prev', currentIndex - 1), [currentIndex, doSlide]);
  const next = useCallback(() => doSlide('next', currentIndex + 1), [currentIndex, doSlide]);

  useEffect(() => {
    // Collect images inside post content
    const container = document.querySelector<HTMLElement>(".body-text");
    if (!container) return;
    const imgs = Array.from(container.querySelectorAll<HTMLImageElement>("img"));
    if (!imgs.length) return;

    setImages(imgs);

    const handlers: Array<() => void> = [];
    imgs.forEach((img, idx) => {
      img.style.cursor = "zoom-in";
      const onClick = (e: MouseEvent) => {
        e.preventDefault();
        openAt(idx);
      };
      img.addEventListener("click", onClick);
      handlers.push(() => img.removeEventListener("click", onClick));
    });

    return () => {
      handlers.forEach((off) => off());
    };
  }, [openAt]);

  // Enhance Gutenberg/Jetpack galleries marked as slideshow
  useEffect(() => {
    const container = document.querySelector<HTMLElement>(".body-text");
    if (!container) return;
    const galleries = Array.from(container.querySelectorAll<HTMLElement>(".wp-block-gallery.is-slideshow, .wp-block-gallery.is-style-slideshow, .wp-block-jetpack-slideshow"));
    const cleanups: Array<() => void> = [];
    galleries.forEach((gal) => {
      // If already enhanced, skip
      if (gal.querySelector('.slideshow-track') || gal.querySelector('.wp-block-jetpack-slideshow_container')) return;
      let figures: HTMLElement[] = Array.from(gal.querySelectorAll('figure')) as HTMLElement[];
      let track: HTMLElement | null = gal.querySelector('.wp-block-jetpack-slideshow_container') as HTMLElement | null;
      if (!track) {
        track = document.createElement('div');
        track.className = 'slideshow-track';
        figures.forEach(fig => track!.appendChild(fig));
        gal.appendChild(track);
      } else {
        figures = Array.from(track.querySelectorAll('figure')) as HTMLElement[];
      }

      // Arrows
      const prev = document.createElement('button');
      prev.className = 'slideshow-arrow slideshow-prev';
      prev.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 6L9 12L15 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      const next = document.createElement('button');
      next.className = 'slideshow-arrow slideshow-next';
      next.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 6L15 12L9 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      gal.appendChild(prev); gal.appendChild(next);

      // Dots
      const dotsWrap = document.createElement('div');
      dotsWrap.className = 'slideshow-dots';
      const dots = figures.map((_f, i) => {
        const d = document.createElement('div');
        d.className = 'slideshow-dot' + (i === 0 ? ' active' : '');
        dotsWrap.appendChild(d);
        return d;
      });
      gal.appendChild(dotsWrap);

      const scrollToIndex = (i: number) => {
        const width = gal.clientWidth;
        track!.scrollTo({ left: i * width, behavior: 'smooth' });
        dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
      };

      let index = 0;
      const onPrev = () => { index = Math.max(0, index - 1); scrollToIndex(index); };
      const onNext = () => { index = Math.min(figures.length - 1, index + 1); scrollToIndex(index); };
      prev.addEventListener('click', onPrev);
      next.addEventListener('click', onNext);
      dots.forEach((d, i) => d.addEventListener('click', () => { index = i; scrollToIndex(index); }));

      const onResize = () => scrollToIndex(index);
      window.addEventListener('resize', onResize);
      cleanups.push(() => {
        prev.removeEventListener('click', onPrev);
        next.removeEventListener('click', onNext);
        dots.forEach((d, i) => d.replaceWith(d.cloneNode(false)));
        window.removeEventListener('resize', onResize);
      });
    });
    return () => { cleanups.forEach(fn => fn()); };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, prev, next, close]);

  if (!isOpen) return null;

  const src = sources[currentIndex] || "";

  return (
    <div className={`lightbox-overlay ${isOpening ? 'opening' : isClosing ? 'closing' : 'open'} ${direction ? `slide-${direction}` : ''} ${isSliding ? 'sliding-active' : ''}`} aria-hidden={false} onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="lightbox-content" role="dialog" aria-modal="true">
        <button className="lightbox-close left" aria-label="Close" onClick={close}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.4 6.4L17.6 17.6M17.6 6.4L6.4 17.6" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <button className="lightbox-arrow lightbox-prev" aria-label="Previous image" onClick={prev}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 6L9 12L15 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="lightbox-stage">
          <img className={`lightbox-img ${isSliding ? 'incoming' : 'current'}`} style={{ ['--incomingStart' as any]: direction === 'next' ? '8%' : direction === 'prev' ? '-8%' : '0' }} alt="Expanded image" src={src} />
        </div>
        <button className="lightbox-arrow lightbox-next" aria-label="Next image" onClick={next}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 6L15 12L9 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        {caption ? (
          <div className="lightbox-caption-wrap" aria-live="polite">
            <div className="lightbox-caption-gradient"></div>
            <div className="lightbox-caption">{caption}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}


