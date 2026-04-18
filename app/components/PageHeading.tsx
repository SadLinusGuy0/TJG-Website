"use client";
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Back } from '@thatjoshguy/oneui-icons';

const SCROLL_RANGE = 120; // px of scroll over which the crossfade happens

interface PageHeadingProps {
  title: string;
  /** Left-side action in the expanded hero (e.g. a back-button Link). */
  leadingAction?: React.ReactNode;
  /** Right-side action in the expanded hero (e.g. a settings Link). */
  trailingAction?: React.ReactNode;
  /** Back button handler for the collapsed sticky bar. Renders the built-in chevron. */
  onBack?: () => void;
  /** Right-side content for the collapsed sticky bar (e.g. same settings icon). */
  barTrailingAction?: React.ReactNode;
}

export default function PageHeading({
  title,
  leadingAction,
  trailingAction,
  onBack,
  barTrailingAction,
}: PageHeadingProps) {
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    function onScroll() {
      setProgress(Math.min(1, Math.max(0, window.scrollY / SCROLL_RANGE)));
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Hero title fades out over the first 70%.
  const heroOpacity = Math.max(0, 1 - progress / 0.7);

  // Sticky bar content fades in from 40% → 80%.
  const barOpacity = Math.min(1, Math.max(0, (progress - 0.4) / 0.4));

  // Floating hero actions fade out over the first 50%.
  const actionsOpacity = Math.max(0, 1 - progress / 0.5);

  return (
    <>
      {/* ── Expanded hero ──────────────────────────────────────────────
          In document flow — takes real space so content sits below it. */}
      <div className="page-heading-hero">
        {(leadingAction || trailingAction) && (
          <div
            className="page-heading-hero-actions"
            style={{
              opacity: actionsOpacity,
              pointerEvents: actionsOpacity < 0.1 ? 'none' : undefined,
            }}
          >
            <div>{leadingAction}</div>
            <div>{trailingAction}</div>
          </div>
        )}

        <div
          className="page-heading-hero-title"
          style={{ opacity: heroOpacity }}
        >
          {title}
        </div>
      </div>

      {/* ── Collapsed fixed bar ────────────────────────────────────────
          Portalled to document.body so ancestor transforms (e.g. fadeInUp
          on .main-content) don't break position: fixed. */}
      {mounted && createPortal(
        <div
          className="top-app-bar"
          style={{
            opacity: barOpacity,
            pointerEvents: barOpacity < 0.1 ? 'none' : 'auto',
            transition: 'none',
          }}
        >
          <div className={`top-app-bar-container${barTrailingAction ? ' both-buttons' : onBack ? ' back-only' : ''}`}>
            {onBack && (
              <button
                className="top-app-bar-icon"
                onClick={onBack}
                aria-label="Go back"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', cursor: 'pointer', border: 'none' }}
              >
                <Back color="var(--primary)" />
              </button>
            )}
            <div className="title-container">
              <div className="title">{title}</div>
            </div>
            {barTrailingAction}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
