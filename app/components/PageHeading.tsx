"use client";
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Back } from '@thatjoshguy/oneui-icons';

const SCROLL_RANGE = 530; // px of scroll over which the crossfade happens
const PULL_EXPAND_DISTANCE = 130;
const COLLAPSED_HERO_HEIGHT = 112;
const EXPANDED_HERO_HEIGHT = 200;
const COLLAPSED_HERO_PADDING_TOP = 54;
const EXPANDED_HERO_PADDING_TOP = 90;

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
  /** Start with the sticky bar visible and reveal the expanded hero on a pull-down gesture. */
  defaultCollapsed?: boolean;
}

export default function PageHeading({
  title,
  leadingAction,
  trailingAction,
  onBack,
  barTrailingAction,
  defaultCollapsed = false,
}: PageHeadingProps) {
  const [progress, setProgress] = useState(defaultCollapsed ? 1 : 0);
  const [mounted, setMounted] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [pullExpanded, setPullExpanded] = useState(false);
  const touchStartY = useRef(0);
  const pullProgressRef = useRef(0);
  const isPullingRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    function onScroll() {
      const scrollProgress = Math.min(1, Math.max(0, window.scrollY / SCROLL_RANGE));
      setProgress(defaultCollapsed && !pullExpanded ? 1 : scrollProgress);

      if (defaultCollapsed && window.scrollY > 8 && pullExpanded) {
        setPullExpanded(false);
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [defaultCollapsed, pullExpanded]);

  useEffect(() => {
    if (!defaultCollapsed) {
      return;
    }

    function onTouchStart(event: TouchEvent) {
      if (window.scrollY > 0) {
        return;
      }

      touchStartY.current = event.touches[0]?.clientY ?? 0;
      pullProgressRef.current = 0;
      isPullingRef.current = true;
    }

    function onTouchMove(event: TouchEvent) {
      if (!isPullingRef.current || window.scrollY > 0) {
        return;
      }

      const currentY = event.touches[0]?.clientY ?? touchStartY.current;
      const deltaY = Math.max(0, currentY - touchStartY.current);

      if (deltaY <= 0) {
        return;
      }

      event.preventDefault();
      const nextPullProgress = Math.min(1, deltaY / PULL_EXPAND_DISTANCE);
      pullProgressRef.current = nextPullProgress;
      setPullProgress(nextPullProgress);
      setProgress(1 - nextPullProgress);
    }

    function onTouchEnd() {
      if (!isPullingRef.current) {
        return;
      }

      const shouldExpand = pullProgressRef.current >= 0.55;
      setPullExpanded(shouldExpand);
      setPullProgress(0);
      setProgress(shouldExpand ? 0 : 1);
      pullProgressRef.current = 0;
      isPullingRef.current = false;
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [defaultCollapsed]);

  // Hero title fades out over the first 70%.
  const heroOpacity = Math.max(0, 1 - progress / 0.7);

  // Sticky bar content fades in from 40% → 80%.
  const barOpacity = Math.min(1, Math.max(0, (progress - 0.4) / 0.4));

  // Floating hero actions fade out over the first 50%.
  const actionsOpacity = Math.max(0, 1 - progress / 0.5);
  const heroActionsHidden = actionsOpacity < 0.1;
  const barHidden = barOpacity < 0.1;
  const expandProgress = 1 - progress;
  const heroStyle: CSSProperties | undefined = defaultCollapsed
    ? {
        minHeight: COLLAPSED_HERO_HEIGHT + (EXPANDED_HERO_HEIGHT - COLLAPSED_HERO_HEIGHT) * expandProgress,
        paddingTop: COLLAPSED_HERO_PADDING_TOP + (EXPANDED_HERO_PADDING_TOP - COLLAPSED_HERO_PADDING_TOP) * expandProgress,
        transition: pullProgress > 0 ? 'none' : 'min-height 0.26s cubic-bezier(0.2, 0.9, 0.3, 1), padding-top 0.26s cubic-bezier(0.2, 0.9, 0.3, 1)',
      }
    : undefined;

  return (
    <>
      {/* ── Expanded hero ──────────────────────────────────────────────
          In document flow — takes real space so content sits below it. */}
      <div className="page-heading-hero" style={heroStyle}>
        {(leadingAction || trailingAction) && (
          <div
            className="page-heading-hero-actions"
            aria-hidden={heroActionsHidden}
            inert={heroActionsHidden ? true : undefined}
            style={{
              opacity: actionsOpacity,
              pointerEvents: heroActionsHidden ? 'none' : undefined,
            }}
          >
            <div>{leadingAction}</div>
            <div>{trailingAction}</div>
          </div>
        )}

        <h1
          className="page-heading-hero-title"
          style={{ opacity: heroOpacity }}
        >
          {title}
        </h1>
      </div>

      {/* ── Collapsed fixed bar ────────────────────────────────────────
          Portalled to document.body so ancestor transforms (e.g. fadeInUp
          on .main-content) don't break position: fixed. */}
      {mounted && createPortal(
        <div
          className="top-app-bar"
          aria-hidden={barHidden}
          inert={barHidden ? true : undefined}
          style={{
            opacity: barOpacity,
            pointerEvents: barHidden ? 'none' : 'auto',
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
              <div className="title" aria-hidden="true">{title}</div>
            </div>
            {barTrailingAction}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
