"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import ProgressiveBlur from "./ProgressiveBlur";

type OneUiPopoverContextValue = {
  close: () => void;
  getScrollContainer: () => HTMLElement | null;
};

const OneUiPopoverContext = createContext<OneUiPopoverContextValue | null>(null);
const POPOVER_CLOSE_DURATION_MS = 180;
const MOBILE_SETTINGS_NAV_PENDING_CLASS = "mobile-settings-nav-pending";
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export function useOneUiPopover() {
  return useContext(OneUiPopoverContext);
}

export default function OneUiPopover({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const surfaceRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const closingRef = useRef(false);
  const [isClosing, setIsClosing] = useState(false);
  const close = useCallback(() => {
    if (closingRef.current) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isPopoverRoot = pathname === "/settings";

    // Nested settings pages return to the parent page inside the same pop-over.
    // Only the root settings route dismisses the pop-over itself.
    if (!isPopoverRoot || reduceMotion) {
      router.back();
      return;
    }

    closingRef.current = true;
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      router.back();
    }, POPOVER_CLOSE_DURATION_MS);
  }, [pathname, router]);
  const getScrollContainer = useCallback(() => surfaceRef.current, []);
  const contextValue = useMemo(
    () => ({ close, getScrollContainer }),
    [close, getScrollContainer],
  );

  useEffect(() => {
    document.body.classList.remove(MOBILE_SETTINGS_NAV_PENDING_CLASS);
    returnFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const backgroundElements = Array.from(document.querySelectorAll<HTMLElement>(
      ".site-main, .desktop-nav, .mobile-nav-bar, .progressive-blur-overlay",
    ));
    const scrollPosition = { x: window.scrollX, y: window.scrollY };
    const html = document.documentElement;
    const previousStyles = {
      htmlOverflow: html.style.overflow,
      htmlOverscrollBehavior: html.style.overscrollBehavior,
      bodyOverflow: document.body.style.overflow,
      bodyOverscrollBehavior: document.body.style.overscrollBehavior,
      bodyPosition: document.body.style.position,
      bodyTop: document.body.style.top,
      bodyLeft: document.body.style.left,
      bodyRight: document.body.style.right,
      bodyWidth: document.body.style.width,
    };

    backgroundElements.forEach((element) => {
      element.inert = true;
    });
    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPosition.y}px`;
    document.body.style.left = `-${scrollPosition.x}px`;
    document.body.style.right = "0";
    document.body.style.width = "100%";
    surfaceRef.current?.focus({ preventScroll: true });

    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
      backgroundElements.forEach((element) => {
        element.inert = false;
      });
      html.style.overflow = previousStyles.htmlOverflow;
      html.style.overscrollBehavior = previousStyles.htmlOverscrollBehavior;
      document.body.style.overflow = previousStyles.bodyOverflow;
      document.body.style.overscrollBehavior = previousStyles.bodyOverscrollBehavior;
      document.body.style.position = previousStyles.bodyPosition;
      document.body.style.top = previousStyles.bodyTop;
      document.body.style.left = previousStyles.bodyLeft;
      document.body.style.right = previousStyles.bodyRight;
      document.body.style.width = previousStyles.bodyWidth;
      document.body.classList.remove(MOBILE_SETTINGS_NAV_PENDING_CLASS);
      window.scrollTo(scrollPosition.x, scrollPosition.y);
      returnFocusRef.current?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    // The shell persists while intercepted nested routes change. Move focus to
    // the newly named dialog so screen readers announce the new page and the
    // next Tab starts from its first control.
    surfaceRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = Array.from(
      surfaceRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [],
    ).filter((element) => {
      const style = window.getComputedStyle(element);
      return !element.hidden
        && element.getAttribute("aria-hidden") !== "true"
        && !element.closest("[inert]")
        && style.display !== "none"
        && style.visibility !== "hidden"
        && element.getClientRects().length > 0;
    });

    if (focusable.length === 0) {
      event.preventDefault();
      surfaceRef.current?.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === surfaceRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <OneUiPopoverContext.Provider value={contextValue}>
      <div
        className={`oneui-popover-layer${isClosing ? " oneui-popover-layer--closing" : ""}`}
        data-state={isClosing ? "closing" : "open"}
        onMouseDown={(event) => {
          if (!isClosing && event.target === event.currentTarget) close();
        }}
      >
        <div
          ref={surfaceRef}
          className="oneui-popover-surface"
          role="dialog"
          aria-modal="true"
          aria-label={label}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
        >
          <ProgressiveBlur contained getScrollContainer={getScrollContainer} />
          {children}
        </div>
      </div>
    </OneUiPopoverContext.Provider>
  );
}
