"use client";
import { useEffect, useRef, useState, useCallback, RefObject } from 'react';

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

/**
 * Tracks scroll progress (0 = fully expanded, 1 = fully collapsed) inside
 * a .submenu-page container, matching the CSS token values:
 *   --header-expanded (38vh) – --header-collapsed (72px) – --header-top-padding (12px)
 */
export function useDynamicHeader(scrollContainer: RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = scrollContainer.current;
    if (!el) return;

    function getScrollRange(): number {
      return window.innerHeight * 0.38 - 72 - 12; // 38vh - 72px - 12px
    }

    function onScroll() {
      setProgress(Math.min(1, Math.max(0, el!.scrollTop / getScrollRange())));
    }

    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Sync initial state
    return () => el.removeEventListener('scroll', onScroll);
  }, [scrollContainer]);

  return progress;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface DynamicHeaderProps {
  /** The title shown both in the expanded big-title and the collapsed small-title. */
  title: string;
  /** Ref to the .submenu-page scroll container. The hook attaches its listener here. */
  scrollContainer: RefObject<HTMLElement | null>;
  /** If provided, a back button is rendered. */
  onBack?: () => void;
  /** Override the back arrow image path. Defaults to the invert(1) CSS trick so it
   *  works for both light and dark mode without a separate asset. Pass your own
   *  SVG/PNG if you have one. */
  backIconSrc?: string;
}

/**
 * Renders the two-state collapsible header:
 *
 *  Expanded  → large `.big-title` centred in the hero area (opacity 1 → 0)
 *  Collapsed → small `.small-title` inside the sticky bar (opacity 0 → 1)
 *
 * Place this as the FIRST child inside a `.submenu-page` container.
 * The sibling content should live in a `.scroll-content` wrapper so the
 * padding/margin tokens from budd.css push it below the hero area.
 *
 * Example usage:
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 *
 * <div className="submenu-page main-page is-visible" ref={containerRef}>
 *   <DynamicHeader title="Settings" scrollContainer={containerRef} onBack={router.back} />
 *   <div className="scroll-content">
 *     { ...page content... }
 *   </div>
 * </div>
 * ```
 */
export default function DynamicHeader({
  title,
  scrollContainer,
  onBack,
  backIconSrc,
}: DynamicHeaderProps) {
  const progress = useDynamicHeader(scrollContainer);

  // Big title fades out across the first 70% of scroll travel.
  const bigTitleOpacity = Math.max(0, 1 - progress / 0.7);

  // Small title fades in from 40% → 80% of scroll travel.
  const smallTitleOpacity = Math.min(1, Math.max(0, (progress - 0.4) / 0.4));

  // Back button gets frosted-glass background once slightly scrolled.
  const hasBg = progress > 0.08;

  return (
    <>
      {/* ── Big title ──────────────────────────────────────────────────
          position: absolute relative to the .submenu-page (position: fixed),
          so it stays pinned at the top of the viewport while content scrolls.
          z-index: 15, below dynamic-header (z-index: 20) so the sticky bar
          always appears on top. */}
      <div
        className="big-title"
        aria-hidden={progress >= 0.8}
        style={{ opacity: bigTitleOpacity }}
      >
        {title}
      </div>

      {/* ── Sticky header bar ──────────────────────────────────────── */}
      <div className="dynamic-header">
        <div className="header-inner">

          {onBack && (
            <button
              className={`back-button${hasBg ? ' has-bg' : ''}`}
              onClick={onBack}
              aria-label="Go back"
            >
              {/* Frosted glass disc — opacity driven by CSS (.has-bg .back-button-bg) */}
              <div className="back-button-bg" />
              {backIconSrc ? (
                <img className="back-icon" src={backIconSrc} alt="" aria-hidden />
              ) : (
                /* Inline chevron so no extra asset file is needed */
                <svg
                  className="back-icon"
                  width="12"
                  height="20"
                  viewBox="0 0 12 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path
                    d="M10.5 1.5L2 10L10.5 18.5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          )}

          <div className="submenu-title-container">
            <div
              className="small-title"
              aria-hidden={progress < 0.4}
              style={{ opacity: smallTitleOpacity }}
            >
              {title}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
