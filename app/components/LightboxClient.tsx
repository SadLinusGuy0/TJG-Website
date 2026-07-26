"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

interface LightboxItem {
  src: string;
  caption: string;
}

export default function LightboxClient(): React.JSX.Element | null {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [items, setItems] = useState<LightboxItem[]>([]);
  const itemsRef = useRef<LightboxItem[]>([]);
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null);
  const [isSliding, setIsSliding] = useState(false);
  const [caption, setCaption] = useState<string>("");

  const openAt = useCallback((idx: number) => {
    const lightboxItems = itemsRef.current;
    if (!lightboxItems.length) return;
    const len = lightboxItems.length;
    const next = ((idx % len) + len) % len;
    setCurrentIndex(next);
    setCaption(lightboxItems[next]?.caption || "");
    setIsOpening(true);
    setIsOpen(true);
    // Two rafs to ensure the DOM paints before toggling classes
    requestAnimationFrame(() => requestAnimationFrame(() => setIsOpening(false)));
    if (typeof document !== "undefined") {
      document.documentElement.style.overflow = "hidden";
    }
  }, []);

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
    const lightboxItems = itemsRef.current;
    if (!lightboxItems.length) return;
    const nextIndex = ((targetIndex % lightboxItems.length) + lightboxItems.length) % lightboxItems.length;
    setDirection(dir);
    setIsSliding(true);
    // Allow CSS to detect sliding-active, then switch image after a tick
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setCurrentIndex(nextIndex);
        setCaption(lightboxItems[nextIndex]?.caption || "");
        // End sliding after transition duration
        setTimeout(() => setIsSliding(false), 260);
      });
    });
  }, []);

  const prev = useCallback(() => doSlide('prev', currentIndex - 1), [currentIndex, doSlide]);
  const next = useCallback(() => doSlide('next', currentIndex + 1), [currentIndex, doSlide]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('.lightbox-img, .lightbox-arrow, .lightbox-close, .lightbox-caption-wrap')) return;
    close();
  };

  useEffect(() => {
    const panel = document.querySelector<HTMLElement>(".body-text");
    if (!panel) return;

    let imageIndexes = new Map<HTMLImageElement, number>();

    const collectImages = () => {
      const imgs = Array.from(panel.querySelectorAll<HTMLImageElement>("img"));
      const nextIndexes = new Map<HTMLImageElement, number>();
      const nextItems = imgs.map((img, index) => {
        nextIndexes.set(img, index);
        const figure = img.closest('figure');
        const figcap = figure?.querySelector('figcaption');
        return {
          src: img.getAttribute("data-full") || img.currentSrc || img.getAttribute("src") || "",
          caption: figcap?.textContent?.trim() || img.getAttribute('alt') || '',
        };
      });

      imageIndexes = nextIndexes;
      itemsRef.current = nextItems;
      setItems(nextItems);

      imgs.forEach((img) => {
        img.style.cursor = "pointer";
      });
    };

    collectImages();

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLImageElement)) return;
      let index = imageIndexes.get(target);
      if (index === undefined) {
        collectImages();
        index = imageIndexes.get(target);
      }
      if (index === undefined) return;

      event.preventDefault();
      openAt(index);
    };

    panel.addEventListener("click", onClick);

    return () => {
      panel.removeEventListener("click", onClick);
    };
  }, [openAt]);


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

  const src = items[currentIndex]?.src || "";

  return (
    <div className={`lightbox-overlay ${isOpening ? 'opening' : isClosing ? 'closing' : 'open'} ${direction ? `slide-${direction}` : ''} ${isSliding ? 'sliding-active' : ''}`} aria-hidden={false} onClick={handleBackdropClick}>
      <div className="lightbox-content" role="dialog" aria-modal="true">
        <button className="lightbox-close left" aria-label="Close" onClick={close}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.4 6.4L17.6 17.6M17.6 6.4L6.4 17.6" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <button className="lightbox-arrow lightbox-prev" aria-label="Previous image" onClick={prev}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 6L9 12L15 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="lightbox-stage">
          {/* eslint-disable-next-line @next/next/no-img-element -- Lightbox displays arbitrary post images at their original source and size. */}
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
