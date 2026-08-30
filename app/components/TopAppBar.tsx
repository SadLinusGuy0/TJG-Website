"use client";

import { Back, Settings } from "@thatjoshguy/oneui-icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useOneUiPopover } from "./OneUiPopover";

const SCROLL_RANGE = 530;
const PULL_EXPAND_DISTANCE = 130;
const COLLAPSED_HERO_HEIGHT = 48;
const EXPANDED_HERO_VIEWPORT_HEIGHT = 25;
const COLLAPSED_HERO_PADDING_TOP = 0;
const EXPANDED_HERO_PADDING_TOP = 0;
const MOBILE_SETTINGS_NAV_PENDING_CLASS = "mobile-settings-nav-pending";

function beginMobileSettingsNavigation() {
  if (!window.matchMedia("(max-width: 699px)").matches) return;

  document.body.classList.add(MOBILE_SETTINGS_NAV_PENDING_CLASS);
  window.setTimeout(() => {
    if (!document.querySelector(".oneui-popover-layer")) {
      document.body.classList.remove(MOBILE_SETTINGS_NAV_PENDING_CLASS);
    }
  }, 2000);
}

interface TopAppBarProps {
  /** Omit on Home, where the page hero already provides the identity. */
  title?: string;
  /** Adds the standard leading back button. */
  backHref?: string;
  /** Use browser history for the back button instead of adding another route entry. */
  backBehavior?: "link" | "history";
  /** Controls placed at the trailing edge, such as contents and refresh. */
  actions?: ReactNode;
  /** Start collapsed and allow a pull-down gesture to reveal the large title. */
  defaultCollapsed?: boolean;
  /** Use an existing hero as the expanded heading and reveal the bar title after it scrolls away. */
  collapseTarget?: string;
  /** Hide only the collapsed bar title on mobile while retaining the expanded page heading. */
  hideBarTitleOnMobile?: boolean;
  /** Restore the mobile-only Settings entry point without adding an empty desktop action. */
  mobileSettingsHref?: string;
}

export default function TopAppBar({
  title,
  backHref,
  backBehavior = "link",
  actions,
  defaultCollapsed = false,
  collapseTarget,
  hideBarTitleOnMobile = false,
  mobileSettingsHref,
}: TopAppBarProps) {
  const router = useRouter();
  const popover = useOneUiPopover();
  const isContained = popover !== null;
  const getScrollContainer = popover?.getScrollContainer;
  const anchorRef = useRef<HTMLSpanElement>(null);
  const touchStartY = useRef(0);
  const pullProgressRef = useRef(0);
  const isPullingRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(defaultCollapsed ? 1 : 0);
  const [pullProgress, setPullProgress] = useState(0);
  const [pullExpanded, setPullExpanded] = useState(false);
  const [barLayout, setBarLayout] = useState({
    left: 20,
    right: 20,
    paddingLeft: 20,
    paddingRight: 20,
  });

  useLayoutEffect(() => {
    setMounted(true);

    if (isContained) return;

    const mainContent = anchorRef.current?.closest<HTMLElement>(".main-content");
    if (!mainContent) return;

    let frame = 0;
    const updateInsets = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = mainContent.getBoundingClientRect();
        const styles = window.getComputedStyle(mainContent);
        const paddingLeft = Number.parseFloat(styles.paddingLeft) || 0;
        const paddingRight = Number.parseFloat(styles.paddingRight) || 0;
        const overlaysPageHero = Boolean(collapseTarget && progress < 1);
        const left = rect.left + (overlaysPageHero ? paddingLeft : 0);
        const right = window.innerWidth - rect.right + (overlaysPageHero ? paddingRight : 0);

        const nextLayout = {
          left: Math.max(0, left),
          right: Math.max(0, right),
          paddingLeft: overlaysPageHero ? 10 : paddingLeft,
          paddingRight: overlaysPageHero ? 10 : paddingRight,
        };
        setBarLayout((current) => (
          Math.abs(current.left - nextLayout.left) < 0.5 &&
          Math.abs(current.right - nextLayout.right) < 0.5 &&
          Math.abs(current.paddingLeft - nextLayout.paddingLeft) < 0.5 &&
          Math.abs(current.paddingRight - nextLayout.paddingRight) < 0.5
            ? current
            : nextLayout
        ));
      });
    };

    const resizeObserver = new ResizeObserver(updateInsets);
    const bodyObserver = new MutationObserver(updateInsets);
    resizeObserver.observe(mainContent);
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ["class", "style"] });
    window.addEventListener("resize", updateInsets, { passive: true });
    updateInsets();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      bodyObserver.disconnect();
      window.removeEventListener("resize", updateInsets);
    };
  }, [collapseTarget, isContained, progress]);

  useEffect(() => {
    let frame = 0;
    const scrollContainer = getScrollContainer?.() ?? window;
    const getScrollTop = () => scrollContainer instanceof Window
      ? scrollContainer.scrollY
      : scrollContainer.scrollTop;
    const updateProgress = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (collapseTarget) {
          const target = (scrollContainer instanceof Window ? document : scrollContainer)
            .querySelector(collapseTarget);
          const containerTop = scrollContainer instanceof Window
            ? 0
            : scrollContainer.getBoundingClientRect().top;
          setProgress(target && target.getBoundingClientRect().bottom > containerTop ? 0 : 1);
          return;
        }

        const scrollTop = getScrollTop();
        const scrollRange = isContained ? 220 : SCROLL_RANGE;
        const scrollProgress = Math.min(1, Math.max(0, scrollTop / scrollRange));
        setProgress(defaultCollapsed && !pullExpanded ? 1 : scrollProgress);

        if (defaultCollapsed && scrollTop > 8 && pullExpanded) {
          setPullExpanded(false);
        }
      });
    };

    scrollContainer.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    updateProgress();

    return () => {
      cancelAnimationFrame(frame);
      scrollContainer.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [collapseTarget, defaultCollapsed, getScrollContainer, isContained, pullExpanded]);

  useEffect(() => {
    if (!defaultCollapsed || collapseTarget) return;

    const scrollContainer = getScrollContainer?.() ?? window;
    const getScrollTop = () => scrollContainer instanceof Window
      ? scrollContainer.scrollY
      : scrollContainer.scrollTop;

    function onTouchStart(event: Event) {
      if (getScrollTop() > 0) return;
      const touchEvent = event as TouchEvent;
      touchStartY.current = touchEvent.touches[0]?.clientY ?? 0;
      pullProgressRef.current = 0;
      isPullingRef.current = true;
    }

    function onTouchMove(event: Event) {
      if (!isPullingRef.current || getScrollTop() > 0) return;

      const touchEvent = event as TouchEvent;
      const currentY = touchEvent.touches[0]?.clientY ?? touchStartY.current;
      const deltaY = Math.max(0, currentY - touchStartY.current);
      if (deltaY <= 0) return;

      event.preventDefault();
      const nextPullProgress = Math.min(1, deltaY / PULL_EXPAND_DISTANCE);
      pullProgressRef.current = nextPullProgress;
      setPullProgress(nextPullProgress);
      setProgress(1 - nextPullProgress);
    }

    function onTouchEnd() {
      if (!isPullingRef.current) return;

      const shouldExpand = pullProgressRef.current >= 0.55;
      setPullExpanded(shouldExpand);
      setPullProgress(0);
      setProgress(shouldExpand ? 0 : 1);
      pullProgressRef.current = 0;
      isPullingRef.current = false;
    }

    scrollContainer.addEventListener("touchstart", onTouchStart, { passive: true });
    scrollContainer.addEventListener("touchmove", onTouchMove, { passive: false });
    scrollContainer.addEventListener("touchend", onTouchEnd);
    scrollContainer.addEventListener("touchcancel", onTouchEnd);

    return () => {
      scrollContainer.removeEventListener("touchstart", onTouchStart);
      scrollContainer.removeEventListener("touchmove", onTouchMove);
      scrollContainer.removeEventListener("touchend", onTouchEnd);
      scrollContainer.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [collapseTarget, defaultCollapsed, getScrollContainer]);

  const effectiveProgress = progress;
  const heroOpacity = Math.max(0, 1 - effectiveProgress / 0.7);
  const titleOpacity = Math.min(1, Math.max(0, (effectiveProgress - 0.4) / 0.4));
  const titleHidden = titleOpacity < 0.1;
  const expandProgress = 1 - effectiveProgress;
  const heroStyle: CSSProperties | undefined = defaultCollapsed
    ? {
        minHeight: `calc(${COLLAPSED_HERO_HEIGHT * effectiveProgress}px + ${EXPANDED_HERO_VIEWPORT_HEIGHT * expandProgress}vh)`,
        paddingTop: COLLAPSED_HERO_PADDING_TOP + (EXPANDED_HERO_PADDING_TOP - COLLAPSED_HERO_PADDING_TOP) * expandProgress,
        transition: pullProgress > 0
          ? "none"
          : "min-height 0.26s cubic-bezier(0.2, 0.9, 0.3, 1), padding-top 0.26s cubic-bezier(0.2, 0.9, 0.3, 1)",
      }
    : undefined;

  const hasBarContent = Boolean(title || backHref || actions || mobileSettingsHref);
  const hasDesktopButtons = Boolean(backHref || actions);
  const hasMobileButtons = Boolean(backHref || actions || mobileSettingsHref);
  const hasDesktopHeading = Boolean(title);
  const hasMobileHeading = Boolean(title);

  const bar = hasBarContent ? (
    <div
      className={`top-app-bar${isContained ? " top-app-bar--contained" : ""}`}
      style={{
        "--top-app-bar-left": `${barLayout.left}px`,
        "--top-app-bar-right": `${barLayout.right}px`,
        "--top-app-bar-padding-left": `${barLayout.paddingLeft}px`,
        "--top-app-bar-padding-right": `${barLayout.paddingRight}px`,
      } as CSSProperties}
    >
      <div className="top-app-bar-container">
        {backHref && (
          isContained || backBehavior === "history" ? (
            <button
              type="button"
              className="top-app-bar-icon"
              aria-label="Back"
              onClick={() => {
                if (isContained) {
                  popover?.close();
                } else {
                  router.back();
                }
              }}
            >
              <Back color="var(--primary)" />
            </button>
          ) : (
            <Link href={backHref} className="top-app-bar-icon" aria-label="Back">
              <Back color="var(--primary)" />
            </Link>
          )
        )}

        {title && (
          <div
            className={`top-app-bar-title${hideBarTitleOnMobile ? " top-app-bar-title--mobile-hidden" : ""}`}
            aria-hidden={titleHidden}
            style={{ opacity: titleOpacity }}
          >
            {title}
          </div>
        )}

        {(actions || mobileSettingsHref) && (
          <div className="top-app-bar-actions">
            {actions}
            {mobileSettingsHref && (
              <Link
                href={mobileSettingsHref}
                className="top-app-bar-icon top-app-bar-settings"
                aria-label="Settings"
                onClick={beginMobileSettingsNavigation}
              >
                <Settings size={24} color="var(--primary)" />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <span
        ref={anchorRef}
        className="top-app-bar-anchor"
        data-desktop-buttons={!isContained && hasDesktopButtons ? "" : undefined}
        data-mobile-buttons={!isContained && hasMobileButtons ? "" : undefined}
        data-desktop-heading={!isContained && hasDesktopHeading ? "" : undefined}
        data-mobile-heading={!isContained && hasMobileHeading ? "" : undefined}
        aria-hidden="true"
      />

      {isContained ? bar : null}

      {title && !collapseTarget && (
        <div className="top-app-bar-hero" style={heroStyle}>
          <h1 className="top-app-bar-hero-title" style={{ opacity: heroOpacity }}>
            {title}
          </h1>
        </div>
      )}

      {!isContained && mounted && bar ? createPortal(bar, document.body) : null}
    </>
  );
}
