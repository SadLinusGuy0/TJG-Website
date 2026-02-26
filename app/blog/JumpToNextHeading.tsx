'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface HeadingInfo {
  id: string;
  text: string;
}

export default function JumpToNextHeading() {
  const [headings, setHeadings] = useState<HeadingInfo[]>([]);
  const [nextHeading, setNextHeading] = useState<HeadingInfo | null>(null);
  const [isBackToTop, setIsBackToTop] = useState(false);
  const [visible, setVisible] = useState(false);
  const [rightOffset, setRightOffset] = useState(24);
  const rafRef = useRef(0);

  const measureRight = useCallback(() => {
    const mc = document.querySelector('.main-content');
    if (!mc) return;
    const rect = mc.getBoundingClientRect();
    setRightOffset(Math.max(8, window.innerWidth - rect.right));
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const bodyText = document.querySelector('.body-text');
      if (!bodyText) return;

      const h1Elements = bodyText.querySelectorAll('h1');
      const extracted: HeadingInfo[] = [];

      h1Elements.forEach((el, index) => {
        const text = el.textContent?.trim() || '';
        if (!text) return;

        let id = el.id;
        if (!id) {
          const slug = text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
          id = slug || `heading-${index}`;
          el.id = id;
        }

        extracted.push({ id, text });
      });

      setHeadings(extracted);
      if (extracted.length > 0) {
        setVisible(true);
        measureRight();
      }
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [measureRight]);

  useEffect(() => {
    const onResize = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measureRight);
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [measureRight]);

  const updateNextHeading = useCallback(() => {
    if (headings.length === 0) return;

    const scrollPos = window.scrollY + 120;
    let found: HeadingInfo | null = null;

    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el && el.offsetTop > scrollPos) {
        found = h;
        break;
      }
    }

    if (found) {
      setNextHeading(found);
      setIsBackToTop(false);
    } else {
      setNextHeading(null);
      setIsBackToTop(true);
    }
  }, [headings]);

  useEffect(() => {
    if (headings.length === 0) return;

    updateNextHeading();
    window.addEventListener('scroll', updateNextHeading, { passive: true });
    return () => window.removeEventListener('scroll', updateNextHeading);
  }, [headings, updateNextHeading]);

  const handleClick = () => {
    if (isBackToTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (nextHeading) {
      const el = document.getElementById(nextHeading.id);
      if (el) {
        const top = el.offsetTop - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  };

  if (headings.length === 0 || !visible) return null;

  const label = isBackToTop
    ? 'Back to top'
    : `Jump to ${nextHeading?.text || ''}`;

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .jump-heading-btn {
            position: fixed;
            bottom: 24px;
            z-index: 100;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 18px;
            background: color-mix(in srgb, var(--container-background) 60%, transparent 40%);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid color-mix(in srgb, var(--primary) 10%, transparent 80%);
            border-radius: var(--br-sm);
            color: var(--primary);
            font-family: 'One UI Sans', sans-serif;
            font-size: 0.9rem;
            cursor: pointer;
            max-width: min(320px, calc(100vw - 48px));
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            animation: jumpBtnIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            transition: background 0.2s ease, backdrop-filter 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
          }

          .jump-heading-btn:hover {
            background: color-mix(in srgb, var(--container-background) 75%, transparent 25%);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border-color: color-mix(in srgb, var(--primary) 30%, transparent 70%);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .jump-heading-btn:active {
            transform: scale(0.97);
          }

          .jump-heading-btn svg {
            flex-shrink: 0;
            width: 16px;
            height: 16px;
          }

          .jump-heading-label {
            overflow: hidden;
            text-overflow: ellipsis;
            font-weight: 700;
          }

          @keyframes jumpBtnIn {
            from {
              opacity: 0;
              transform: translateY(12px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `
      }} />
      <button
        className="jump-heading-btn"
        style={{ right: `${rightOffset}px` }}
        onClick={handleClick}
        aria-label={label}
      >
        {isBackToTop ? (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5L5 12M12 5L19 12M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 19L5 12M12 19L19 12M12 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        <span className="jump-heading-label">{label}</span>
      </button>
    </>
  );
}
