"use client";
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, createContext, useContext, useLayoutEffect, useMemo, useRef } from 'react';
import type {
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  Ref,
} from 'react';
import { useBlogEnabled } from './BlogFlagProvider';
import { HomeIcon, ShopIcon, BlogIcon, ContactIcon } from './NavIcons';
import { Drawer, Settings } from '@thatjoshguy/oneui-icons';
import { SmoothCorners } from '@lisse/react';
import { useTheme } from './ThemeProvider';

// Context to share collapsed state
export const NavCollapseContext = createContext({ collapsed: false, setCollapsed: (_: boolean) => {} });

export function useNavCollapse() {
  return useContext(NavCollapseContext);
}

interface NavigationClientProps {
  hideMobile?: boolean;
  hideDesktop?: boolean;
  showBlog?: boolean;
}

const MOBILE_NAV_TRANSITION_KEY = 'mobile-nav-transition';
const MOBILE_NAV_ANIMATION_MS = 560;
const MOBILE_NAV_TRANSITION_TTL = 1500;
const SIDEBAR_WIDTH_STORAGE_KEY = 'tjg-website-sidebar-expanded-width';
const SIDEBAR_MIN_EXPANDED_WIDTH = 160;
const SIDEBAR_MAX_EXPANDED_WIDTH = 360;
const SIDEBAR_CONTENT_GUTTER = 18;

const DESKTOP_NAV_CORNERS = {
  radius: 12,
  curve: 'squircle' as const,
  smoothing: 0.6,
  preserveSmoothing: true,
};

type PendingMobileNavTransition = {
  fromHref: string;
  toHref: string;
  createdAt: number;
};

function MobileNavTab({
  href,
  isSelected,
  onClick,
  onNavigateIntent,
  tabRef,
  children
}: {
  href: string;
  isSelected: boolean;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  onNavigateIntent?: () => void;
  tabRef?: Ref<HTMLAnchorElement>;
  children: ReactNode;
}) {
  return (
    <Link
      ref={tabRef}
      href={href}
      prefetch
      className={`mobile-nav-tab${isSelected ? ' mobile-nav-tab--active' : ''}`}
      onClick={onClick}
      onFocus={onNavigateIntent}
      onMouseEnter={onNavigateIntent}
      onPointerDown={onNavigateIntent}
    >
      <div className="mobile-nav-tab-content">
        {children}
      </div>
    </Link>
  );
}

function DesktopNavButton({
  href,
  isSelected,
  indicatorManaged = false,
  onClick,
  tabRef,
  children
}: {
  href: string;
  isSelected: boolean;
  indicatorManaged?: boolean;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  tabRef?: (element: HTMLAnchorElement | null) => void;
  children: ReactNode;
}) {
  const { cornerSmoothing, cornerSmoothingAvailable, cornerSmoothingSupported, hydrated } = useTheme();
  const link = (
    <Link
      ref={tabRef}
      href={href}
      prefetch
      className={`${isSelected ? 'nav-icon-container-selected' : 'nav-icon-container'}${indicatorManaged ? ' desktop-nav-core-tab' : ''}`}
      onClick={onClick}
      data-no-smooth-corners=""
    >
      <div className="desktop-nav-content">
        {children}
      </div>
    </Link>
  );

  if (!hydrated || !cornerSmoothingAvailable || !cornerSmoothingSupported || !cornerSmoothing) {
    return link;
  }

  return (
    <SmoothCorners
      asChild
      autoEffects={false}
      corners={DESKTOP_NAV_CORNERS}
    >
      {link}
    </SmoothCorners>
  );
}

export default function NavigationClient({
  hideMobile = false,
  hideDesktop = false,
  showBlog: propShowBlog = false
}: NavigationClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const serverBlogEnabled = useBlogEnabled();
  const desktopNavRef = useRef<HTMLElement | null>(null);
  const desktopNavItemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const previousDesktopNavIndexRef = useRef<number | null>(null);
  const previousDesktopNavCountRef = useRef<number | null>(null);
  const previousDesktopIndicatorLayoutRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);
  const sidebarResizePointerIdRef = useRef<number | null>(null);
  const sidebarResizeBoundsRef = useRef({
    min: SIDEBAR_MIN_EXPANDED_WIDTH,
    max: SIDEBAR_MAX_EXPANDED_WIDTH,
  });
  const mobileNavRailRef = useRef<HTMLDivElement | null>(null);
  const mobileNavTabRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const previousMobileNavIndexRef = useRef<number | null>(null);
  const previousMobileNavCountRef = useRef<number | null>(null);
  const previousMobileIndicatorLayoutRef = useRef<{ left: number; width: number } | null>(null);
  const mobileNavigationFrameRef = useRef<number | null>(null);
  const [mobileIndicatorState, setMobileIndicatorState] = useState({
    animationKey: 0,
    direction: 1,
    hasMounted: false,
    instant: true,
  });
  const [optimisticMobileNavIndex, setOptimisticMobileNavIndex] = useState<number | null>(null);
  const [mobileIndicatorLayout, setMobileIndicatorLayout] = useState({
    left: 0,
    width: 0,
  });
  const [desktopIndicatorState, setDesktopIndicatorState] = useState({
    animationKey: 0,
    direction: 1,
    hasMounted: false,
    instant: true,
  });
  const [desktopNavIsResizing, setDesktopNavIsResizing] = useState(false);
  const [desktopNavIsDragging, setDesktopNavIsDragging] = useState(false);
  const [optimisticDesktopNavIndex, setOptimisticDesktopNavIndex] = useState<number | null>(null);
  const [desktopIndicatorLayout, setDesktopIndicatorLayout] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });
  
  // Use Vercel Flags value from context (layout), fall back to static config
  const defaultEnabled = serverBlogEnabled ?? true;
  
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    }
    return false;
  });
  const [expandedSidebarWidth, setExpandedSidebarWidth] = useState<number | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    const storedWidth = Number.parseFloat(localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY) ?? '');
    return Number.isFinite(storedWidth) ? storedWidth : null;
  });
  const [showBlog, setShowBlog] = useState(() => {
    if (typeof window !== 'undefined') {
      // Check cookie override from Feature Flags page first
      const cookieMatch = document.cookie.split('; ').find(c => c.startsWith('ff-blog-enabled='));
      if (cookieMatch) {
        return cookieMatch.split('=')[1] === 'true' || propShowBlog;
      }
      // Fall back to legacy localStorage override
      const localStorageValue = localStorage.getItem('college-blogs-enabled');
      if (localStorageValue !== null) {
        return localStorageValue === 'true' || propShowBlog;
      }
      return defaultEnabled || propShowBlog;
    }
    return defaultEnabled || propShowBlog;
  });

  useEffect(() => {
    const checkBlogFlag = () => {
      if (typeof window !== 'undefined') {
        // Check cookie override from Feature Flags page first
        const cookieMatch = document.cookie.split('; ').find(c => c.startsWith('ff-blog-enabled='));
        if (cookieMatch) {
          setShowBlog(cookieMatch.split('=')[1] === 'true' || propShowBlog);
          return;
        }
        // Fall back to legacy localStorage override
        const localStorageValue = localStorage.getItem('college-blogs-enabled');
        const enabled = localStorageValue !== null
          ? localStorageValue === 'true'
          : defaultEnabled;
        setShowBlog(enabled || propShowBlog);
      }
    };

    checkBlogFlag();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'college-blogs-enabled') {
        checkBlogFlag();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    const handleBlogEnabled = () => checkBlogFlag();
    const handleBlogDisabled = () => checkBlogFlag();
    window.addEventListener('college-blogs-enabled', handleBlogEnabled);
    window.addEventListener('college-blogs-disabled', handleBlogDisabled);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('college-blogs-enabled', handleBlogEnabled);
      window.removeEventListener('college-blogs-disabled', handleBlogDisabled);
    };
  }, [propShowBlog, defaultEnabled]);

  useLayoutEffect(() => {
    if (hideDesktop) {
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', collapsed ? 'true' : 'false');
    }
  }, [collapsed, hideDesktop]);

  useEffect(() => {
    if (hideDesktop) {
      return;
    }

    document.body.classList.toggle('nav-collapsed', collapsed);

    return () => document.body.classList.remove('nav-collapsed');
  }, [collapsed, hideDesktop]);

  useLayoutEffect(() => {
    if (hideDesktop) {
      return;
    }

    if (expandedSidebarWidth === null) {
      document.body.style.removeProperty('--sidebar-width');
      document.body.style.removeProperty('--sidebar-content-offset');
      document.body.classList.remove('sidebar-custom-width');
    } else {
      document.body.style.setProperty('--sidebar-width', `${expandedSidebarWidth}px`);
      document.body.style.setProperty(
        '--sidebar-content-offset',
        `${expandedSidebarWidth + SIDEBAR_CONTENT_GUTTER}px`,
      );
      document.body.classList.add('sidebar-custom-width');
    }

    return () => {
      document.body.style.removeProperty('--sidebar-width');
      document.body.style.removeProperty('--sidebar-content-offset');
      document.body.classList.remove('sidebar-custom-width');
    };
  }, [expandedSidebarWidth, hideDesktop]);

  useEffect(() => {
    return () => {
      if (mobileNavigationFrameRef.current !== null) {
        cancelAnimationFrame(mobileNavigationFrameRef.current);
      }
      document.body.style.removeProperty('cursor');
      document.body.style.removeProperty('user-select');
    };
  }, []);

  useEffect(() => {
    setOptimisticDesktopNavIndex(null);
    setOptimisticMobileNavIndex(null);
  }, [pathname]);

  const desktopNavItems = useMemo(() => [
    {
      href: '/',
      label: 'Home',
      matchesPath: pathname === '/',
      icon: (selected: boolean) => <HomeIcon selected={selected} />,
    },
    {
      href: '/shop',
      label: 'Shop',
      matchesPath: pathname === '/shop',
      icon: (selected: boolean) => <ShopIcon selected={selected} />,
    },
    ...(showBlog ? [{
      href: '/blog',
      label: 'Blog',
      matchesPath: pathname === '/blog' || pathname?.startsWith('/blog/'),
      icon: (selected: boolean) => <BlogIcon selected={selected} />,
    }] : []),
    {
      href: '/contact',
      label: 'Contact',
      matchesPath: pathname === '/contact',
      icon: (selected: boolean) => <ContactIcon selected={selected} />,
    },
  ], [pathname, showBlog]);
  const activeDesktopNavIndex = desktopNavItems.findIndex((item) => item.matchesPath);
  const displayedDesktopNavIndex = optimisticDesktopNavIndex ?? activeDesktopNavIndex;
  const desktopNavCount = desktopNavItems.length;
  desktopNavItemRefs.current.length = desktopNavCount;

  useEffect(() => {
    if (!hideDesktop && displayedDesktopNavIndex >= 0) {
      return;
    }

    previousDesktopNavIndexRef.current = null;
    previousDesktopNavCountRef.current = null;
    previousDesktopIndicatorLayoutRef.current = null;
    desktopNavItemRefs.current = [];
    setOptimisticDesktopNavIndex(null);
    setDesktopIndicatorState((state) => ({
      ...state,
      hasMounted: false,
      instant: true,
    }));
  }, [displayedDesktopNavIndex, hideDesktop]);

  useLayoutEffect(() => {
    if (hideDesktop || displayedDesktopNavIndex < 0) {
      return;
    }

    const measureTabAtIndex = (index: number) => {
      const nav = desktopNavRef.current;
      const activeTab = desktopNavItemRefs.current[index];

      if (!nav || !activeTab || nav.offsetWidth === 0 || activeTab.offsetWidth === 0) {
        return null;
      }

      let left = activeTab.offsetLeft;
      let top = activeTab.offsetTop;
      let offsetParent = activeTab.offsetParent as HTMLElement | null;

      while (offsetParent && offsetParent !== nav) {
        left += offsetParent.offsetLeft;
        top += offsetParent.offsetTop;
        offsetParent = offsetParent.offsetParent as HTMLElement | null;
      }

      return {
        left,
        top,
        width: activeTab.offsetWidth,
        height: activeTab.offsetHeight,
      };
    };

    const updateDesktopIndicatorLayout = () => {
      const nextLayout = measureTabAtIndex(displayedDesktopNavIndex);

      if (!nextLayout) {
        return;
      }

      setDesktopIndicatorLayout((layout) => {
        if (
          layout.left === nextLayout.left &&
          layout.top === nextLayout.top &&
          layout.width === nextLayout.width &&
          layout.height === nextLayout.height
        ) {
          return layout;
        }
        return nextLayout;
      });
      previousDesktopIndicatorLayoutRef.current = nextLayout;
    };

    const nextLayout = measureTabAtIndex(displayedDesktopNavIndex);

    if (!nextLayout) {
      return;
    }

    const previousIndex = previousDesktopNavIndexRef.current;
    const previousCount = previousDesktopNavCountRef.current;
    const previousLayout = previousDesktopIndicatorLayoutRef.current;
    const countChanged = previousCount !== null && previousCount !== desktopNavCount;
    const canAnimate = Boolean(
      previousLayout &&
      previousIndex !== null &&
      previousIndex >= 0 &&
      previousIndex !== displayedDesktopNavIndex &&
      !countChanged
    );

    setDesktopIndicatorLayout(nextLayout);

    if (canAnimate && previousIndex !== null) {
      const direction = displayedDesktopNavIndex > previousIndex ? 1 : -1;
      setDesktopIndicatorState((state) => ({
        animationKey: state.animationKey + 1,
        direction,
        hasMounted: true,
        instant: false,
      }));
    } else {
      const sameMeasuredTarget = Boolean(
        previousLayout &&
        previousIndex === displayedDesktopNavIndex &&
        previousLayout.left === nextLayout.left &&
        previousLayout.top === nextLayout.top &&
        previousLayout.width === nextLayout.width &&
        previousLayout.height === nextLayout.height
      );

      setDesktopIndicatorState((state) => ({
        ...state,
        hasMounted: true,
        instant: state.hasMounted && sameMeasuredTarget ? state.instant : true,
      }));
    }

    previousDesktopNavIndexRef.current = displayedDesktopNavIndex;
    previousDesktopNavCountRef.current = desktopNavCount;
    previousDesktopIndicatorLayoutRef.current = nextLayout;

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(updateDesktopIndicatorLayout)
      : null;

    if (resizeObserver && desktopNavRef.current) {
      resizeObserver.observe(desktopNavRef.current);
    }

    window.addEventListener('resize', updateDesktopIndicatorLayout);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateDesktopIndicatorLayout);
    };
  }, [desktopNavCount, desktopNavItems, displayedDesktopNavIndex, hideDesktop]);

  const mobileNavItems = useMemo(() => [
    {
      href: '/',
      label: 'Home',
      matchesPath: pathname === '/',
      icon: (selected: boolean) => <HomeIcon selected={selected} />,
    },
    {
      href: '/shop',
      label: 'Shop',
      matchesPath: pathname === '/shop',
      icon: (selected: boolean) => <ShopIcon selected={selected} />,
    },
    ...(showBlog ? [{
      href: '/blog',
      label: 'Blog',
      matchesPath: pathname === '/blog' || pathname?.startsWith('/blog/'),
      icon: (selected: boolean) => <BlogIcon selected={selected} />,
    }] : []),
    {
      href: '/contact',
      label: 'Contact',
      matchesPath: pathname === '/contact',
      icon: (selected: boolean) => <ContactIcon selected={selected} />,
    },
  ], [pathname, showBlog]);
  const activeMobileNavIndex = mobileNavItems.findIndex((item) => item.matchesPath);
  const displayedMobileNavIndex = optimisticMobileNavIndex ?? activeMobileNavIndex;
  const mobileNavCount = mobileNavItems.length;
  const shouldHideMobileNav = hideMobile || Boolean(
    pathname?.startsWith('/blog/') ||
    pathname?.startsWith('/settings') ||
    pathname === '/playground' ||
    pathname?.startsWith('/playground/') ||
    pathname?.startsWith('/work/')
  );
  mobileNavTabRefs.current.length = mobileNavCount;

  useEffect(() => {
    if (!shouldHideMobileNav) {
      return;
    }

    previousMobileNavIndexRef.current = null;
    previousMobileNavCountRef.current = null;
    previousMobileIndicatorLayoutRef.current = null;
    mobileNavTabRefs.current = [];
    setOptimisticMobileNavIndex(null);
    setMobileIndicatorState((state) => ({
      ...state,
      hasMounted: false,
      instant: true,
    }));
  }, [shouldHideMobileNav]);

  useEffect(() => {
    if (shouldHideMobileNav) {
      return;
    }

    mobileNavItems.forEach((item) => {
      if (item.href !== pathname) {
        router.prefetch(item.href);
      }
    });
  }, [shouldHideMobileNav, mobileNavItems, pathname, router]);

  useLayoutEffect(() => {
    if (shouldHideMobileNav || displayedMobileNavIndex < 0) {
      return;
    }

    const measureTabAtIndex = (index: number) => {
      const rail = mobileNavRailRef.current;
      const activeTab = mobileNavTabRefs.current[index];

      if (!rail || !activeTab || rail.offsetWidth === 0 || activeTab.offsetWidth === 0) {
        return null;
      }

      return {
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      };
    };

    const measureActiveTab = () => measureTabAtIndex(displayedMobileNavIndex);

    const updateMobileIndicatorLayout = () => {
      const nextLayout = measureActiveTab();

      if (!nextLayout) {
        return;
      }

      setMobileIndicatorLayout((layout) => {
        if (layout.left === nextLayout.left && layout.width === nextLayout.width) {
          return layout;
        }
        return nextLayout;
      });

      previousMobileIndicatorLayoutRef.current = nextLayout;
    };

    const nextLayout = measureActiveTab();

    if (!nextLayout) {
      return;
    }

    const previousIndex = previousMobileNavIndexRef.current;
    const previousCount = previousMobileNavCountRef.current;
    let previousLayout = previousMobileIndicatorLayoutRef.current;
    let transitionFromIndex = previousIndex;
    const countChanged = previousCount !== null && previousCount !== mobileNavCount;
    let pendingTransition: PendingMobileNavTransition | null = null;

    if (typeof window !== 'undefined') {
      try {
        const pendingValue = sessionStorage.getItem(MOBILE_NAV_TRANSITION_KEY);
        pendingTransition = pendingValue ? JSON.parse(pendingValue) as PendingMobileNavTransition : null;
      } catch {
        pendingTransition = null;
      }
    }

    const transitionToHref = displayedMobileNavIndex >= 0
      ? mobileNavItems[displayedMobileNavIndex]?.href
      : null;
    const pathMatchesDisplayedIndex = activeMobileNavIndex === displayedMobileNavIndex;
    const pendingAge = pendingTransition
      ? pendingTransition.createdAt > 1_000_000_000_000
        ? Date.now() - pendingTransition.createdAt
        : performance.now() - pendingTransition.createdAt
      : Number.POSITIVE_INFINITY;
    const pendingIsFresh = pendingAge < MOBILE_NAV_TRANSITION_TTL;
    const pendingMatchesRoute = Boolean(
      pendingTransition &&
      pendingIsFresh &&
      pathMatchesDisplayedIndex &&
      transitionToHref &&
      pendingTransition.toHref === transitionToHref
    );

    if (pendingTransition && !pendingIsFresh && typeof window !== 'undefined') {
      sessionStorage.removeItem(MOBILE_NAV_TRANSITION_KEY);
    }

    if (pendingMatchesRoute && pendingTransition) {
      const fromIndex = mobileNavItems.findIndex((item) => item.href === pendingTransition.fromHref);
      const fromLayout = fromIndex >= 0 ? measureTabAtIndex(fromIndex) : null;
      const shouldReplayRouteTransition = previousIndex !== displayedMobileNavIndex
        && pendingAge < MOBILE_NAV_ANIMATION_MS;

      if (shouldReplayRouteTransition && fromIndex >= 0 && fromLayout && fromIndex !== displayedMobileNavIndex) {
        transitionFromIndex = fromIndex;
        previousLayout = fromLayout;
      }

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(MOBILE_NAV_TRANSITION_KEY);
      }
    }

    const canAnimate = Boolean(
      previousLayout &&
      transitionFromIndex !== null &&
      transitionFromIndex >= 0 &&
      transitionFromIndex !== displayedMobileNavIndex &&
      !countChanged
    );

    if (canAnimate && previousLayout) {
      const direction = displayedMobileNavIndex > transitionFromIndex! ? 1 : -1;

      if (pendingMatchesRoute) {
        setMobileIndicatorLayout(previousLayout);
        setMobileIndicatorState((state) => ({
          ...state,
          direction,
          hasMounted: true,
          instant: true,
        }));

        mobileNavigationFrameRef.current = requestAnimationFrame(() => {
          mobileNavigationFrameRef.current = null;
          setMobileIndicatorLayout(nextLayout);
          setMobileIndicatorState((state) => ({
            animationKey: state.animationKey + 1,
            direction,
            hasMounted: true,
            instant: false,
          }));
        });
      } else {
        setMobileIndicatorLayout(nextLayout);
        setMobileIndicatorState((state) => ({
          animationKey: state.animationKey + 1,
          direction,
          hasMounted: true,
          instant: false,
        }));
      }
    } else {
      const sameMeasuredTarget = Boolean(
        previousLayout &&
        previousIndex === displayedMobileNavIndex &&
        previousLayout.left === nextLayout.left &&
        previousLayout.width === nextLayout.width
      );

      setMobileIndicatorLayout(nextLayout);
      setMobileIndicatorState((state) => ({
        ...state,
        hasMounted: true,
        instant: state.hasMounted && sameMeasuredTarget ? state.instant : true,
      }));
    }

    previousMobileNavIndexRef.current = displayedMobileNavIndex;
    previousMobileNavCountRef.current = mobileNavCount;
    previousMobileIndicatorLayoutRef.current = nextLayout;

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(updateMobileIndicatorLayout)
      : null;

    if (resizeObserver && mobileNavRailRef.current) {
      resizeObserver.observe(mobileNavRailRef.current);
    }

    window.addEventListener('resize', updateMobileIndicatorLayout);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateMobileIndicatorLayout);
    };
  }, [activeMobileNavIndex, displayedMobileNavIndex, mobileNavCount, mobileNavItems, shouldHideMobileNav]);

  const handleDesktopNavClick = (event: MouseEvent<HTMLAnchorElement>, index: number) => {
    if (
      (typeof event.button === 'number' && event.button !== 0) ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey ||
      index === displayedDesktopNavIndex
    ) {
      return;
    }

    setOptimisticDesktopNavIndex(index);
  };

  const toggleDesktopNav = () => {
    setDesktopNavIsResizing(true);
    setDesktopIndicatorState((state) => ({
      ...state,
      instant: true,
    }));
    setCollapsed((current) => !current);
  };

  const getSidebarResizeBounds = () => {
    const nav = desktopNavRef.current;
    if (!nav) {
      return sidebarResizeBoundsRef.current;
    }

    const requiredWidths = Array.from(nav.querySelectorAll<HTMLElement>('.desktop-nav-content'))
      .map((content) => {
        const label = content.querySelector<HTMLElement>('.nav-label, .nav-label-selected');
        const icon = content.querySelector<SVGElement>('svg');
        const control = content.closest<HTMLElement>('a, button, [role="button"]');
        const section = content.closest<HTMLElement>('.icon-container, .nav-footer');
        if (!label || !icon || !control || !section) {
          return 0;
        }

        const contentStyles = getComputedStyle(content);
        const controlStyles = getComputedStyle(control);
        const sectionStyles = getComputedStyle(section);
        const gap = Number.parseFloat(contentStyles.columnGap || contentStyles.gap) || 0;
        const horizontalPadding = [
          controlStyles.paddingLeft,
          controlStyles.paddingRight,
          sectionStyles.paddingLeft,
          sectionStyles.paddingRight,
        ].reduce((total, value) => total + (Number.parseFloat(value) || 0), 0);

        return icon.getBoundingClientRect().width + gap + label.scrollWidth + horizontalPadding;
      });
    const measuredMinimum = Math.ceil(Math.max(0, ...requiredWidths) + 4);
    const min = Math.min(
      SIDEBAR_MAX_EXPANDED_WIDTH,
      Math.max(SIDEBAR_MIN_EXPANDED_WIDTH, measuredMinimum),
    );
    const bounds = { min, max: Math.max(min, SIDEBAR_MAX_EXPANDED_WIDTH) };
    sidebarResizeBoundsRef.current = bounds;
    return bounds;
  };

  const resizeSidebarTo = (requestedWidth: number) => {
    const { min, max } = sidebarResizeBoundsRef.current;
    const nextWidth = Math.min(max, Math.max(min, Math.round(requestedWidth)));
    setExpandedSidebarWidth(nextWidth);
    localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(nextWidth));
  };

  const handleSidebarResizePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (collapsed || event.button !== 0) {
      return;
    }

    getSidebarResizeBounds();
    sidebarResizePointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    setDesktopNavIsResizing(true);
    setDesktopNavIsDragging(true);
    event.preventDefault();
  };

  const handleSidebarResizePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (sidebarResizePointerIdRef.current !== event.pointerId) {
      return;
    }

    const nav = desktopNavRef.current;
    if (!nav) {
      return;
    }

    resizeSidebarTo(event.clientX - nav.getBoundingClientRect().left);
  };

  const finishSidebarResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (sidebarResizePointerIdRef.current !== event.pointerId) {
      return;
    }

    sidebarResizePointerIdRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    document.body.style.removeProperty('cursor');
    document.body.style.removeProperty('user-select');
    setDesktopNavIsResizing(false);
    setDesktopNavIsDragging(false);
  };

  const handleSidebarResizeKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (collapsed || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      return;
    }

    const bounds = getSidebarResizeBounds();
    const currentWidth = expandedSidebarWidth
      ?? desktopNavRef.current?.getBoundingClientRect().width
      ?? bounds.max;
    const nextWidth = event.key === 'Home'
      ? bounds.min
      : event.key === 'End'
        ? bounds.max
        : currentWidth + (event.key === 'ArrowLeft' ? -8 : 8);

    resizeSidebarTo(nextWidth);
    event.preventDefault();
  };

  const resetSidebarWidth = () => {
    setExpandedSidebarWidth(null);
    localStorage.removeItem(SIDEBAR_WIDTH_STORAGE_KEY);
  };

  const handleMobileNavClick = (event: MouseEvent<HTMLAnchorElement>, index: number, href: string) => {
    if (
      (typeof event.button === 'number' && event.button !== 0) ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey ||
      index === displayedMobileNavIndex
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (mobileNavigationFrameRef.current !== null) {
      cancelAnimationFrame(mobileNavigationFrameRef.current);
      mobileNavigationFrameRef.current = null;
    }

    const currentItem = mobileNavItems[displayedMobileNavIndex];

    if (typeof window !== 'undefined' && currentItem) {
      sessionStorage.setItem(MOBILE_NAV_TRANSITION_KEY, JSON.stringify({
        fromHref: currentItem.href,
        toHref: href,
        createdAt: event.timeStamp,
      } satisfies PendingMobileNavTransition));
    }

    setOptimisticMobileNavIndex(index);
    router.push(href);
  };

  const handleMobileNavIntent = (index: number, href: string) => {
    if (index !== displayedMobileNavIndex) {
      router.prefetch(href);
    }
  };

  const mobileNavIndicatorStyle = {
    transform: `translateX(${mobileIndicatorLayout.left}px)`,
    width: mobileIndicatorLayout.width,
    '--mobile-nav-direction': mobileIndicatorState.direction,
  } as CSSProperties;

  const desktopNavIndicatorStyle = {
    transform: `translate3d(${desktopIndicatorLayout.left}px, ${desktopIndicatorLayout.top}px, 0)`,
    width: desktopIndicatorLayout.width,
    height: desktopIndicatorLayout.height,
    '--desktop-nav-direction': desktopIndicatorState.direction,
  } as CSSProperties;

  return (
    <NavCollapseContext.Provider value={{ collapsed, setCollapsed }}>
      {!hideDesktop && (
        <nav
          ref={desktopNavRef}
          className={`tab-container desktop-nav${collapsed ? ' collapsed' : ''}${desktopNavIsResizing ? ' desktop-nav--resizing' : ''}${desktopNavIsDragging ? ' desktop-nav--dragging' : ''}`}
          onTransitionEnd={(event) => {
            if (event.currentTarget === event.target && event.propertyName === 'width') {
              setDesktopNavIsResizing(false);
            }
          }}
          onTransitionCancel={(event) => {
            if (event.currentTarget === event.target && event.propertyName === 'width') {
              setDesktopNavIsResizing(false);
            }
          }}
        >
          <div
            className={`desktop-nav-indicator${displayedDesktopNavIndex < 0 ? ' desktop-nav-indicator--hidden' : ''}${displayedDesktopNavIndex < 0 || desktopIndicatorState.instant || !desktopIndicatorState.hasMounted ? ' desktop-nav-indicator--instant' : ' desktop-nav-indicator--animate'}`}
            data-direction={desktopIndicatorState.direction}
            style={desktopNavIndicatorStyle}
            aria-hidden="true"
          >
            <div
              key={desktopIndicatorState.animationKey}
              className={`desktop-nav-indicator-pill${!desktopIndicatorState.instant && desktopIndicatorState.animationKey > 0 ? ' desktop-nav-indicator-pill--animate' : ''}`}
            />
          </div>
          <div className="icon-container">
            <div
              className={`sidebar-toggle nav-icon-container ${collapsed ? 'sidebar-toggle-collapsed' : 'sidebar-toggle-expanded'}`}
              tabIndex={0}
              role="button"
              aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
              onClick={toggleDesktopNav}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  toggleDesktopNav();
                }
              }}
            >
              <Drawer size={24} color="var(--primary)" />
            </div>

            {desktopNavItems.map((item, index) => {
              const isSelected = index === displayedDesktopNavIndex;
              return (
                <DesktopNavButton
                  key={item.href}
                  href={item.href}
                  isSelected={isSelected}
                  indicatorManaged
                  tabRef={(element) => {
                    desktopNavItemRefs.current[index] = element;
                  }}
                  onClick={(event) => handleDesktopNavClick(event, index)}
                >
                  {item.icon(isSelected)}
                  <div className={isSelected ? 'nav-label-selected' : 'nav-label'}>{item.label}</div>
                </DesktopNavButton>
              );
            })}
          </div>
          <div className="nav-footer">
            <DesktopNavButton href="/settings" isSelected={pathname === '/settings' || pathname?.startsWith('/settings/')}>
              <Settings size={24} color="var(--primary)" />
              <div className={pathname === '/settings' || pathname?.startsWith('/settings/') ? 'nav-label-selected' : 'nav-label'} style={{ color: 'var(--primary)' }}>Settings</div>
            </DesktopNavButton>
          </div>
          {!collapsed && (
            <div
              className="desktop-nav-resize-handle"
              role="separator"
              aria-label="Resize navigation"
              aria-orientation="vertical"
              aria-valuemin={SIDEBAR_MIN_EXPANDED_WIDTH}
              aria-valuemax={SIDEBAR_MAX_EXPANDED_WIDTH}
              aria-valuenow={Math.round(expandedSidebarWidth ?? SIDEBAR_MAX_EXPANDED_WIDTH)}
              tabIndex={0}
              title="Drag to resize navigation. Double-click to reset."
              onPointerDown={handleSidebarResizePointerDown}
              onPointerMove={handleSidebarResizePointerMove}
              onPointerUp={finishSidebarResize}
              onPointerCancel={finishSidebarResize}
              onKeyDown={handleSidebarResizeKeyDown}
              onDoubleClick={resetSidebarWidth}
            />
          )}
        </nav>
      )}

      {!shouldHideMobileNav && (
        <nav className="mobile-nav-bar">
          <div
            ref={mobileNavRailRef}
            className="mobile-nav-tabs"
            data-item-count={mobileNavCount}
            style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
          >
            <div
              className={`mobile-nav-indicator${displayedMobileNavIndex < 0 ? ' mobile-nav-indicator--hidden' : ''}${mobileIndicatorState.instant || !mobileIndicatorState.hasMounted ? ' mobile-nav-indicator--instant' : ' mobile-nav-indicator--animate'}`}
              data-direction={mobileIndicatorState.direction}
              style={mobileNavIndicatorStyle}
              aria-hidden="true"
            >
              <div
                key={mobileIndicatorState.animationKey}
                className={`mobile-nav-indicator-pill${!mobileIndicatorState.instant && mobileIndicatorState.animationKey > 0 ? ' mobile-nav-indicator-pill--animate' : ''}`}
              />
            </div>
            {mobileNavItems.map((item, index) => {
              const isSelected = index === displayedMobileNavIndex;
              return (
                <MobileNavTab
                  key={item.href}
                  href={item.href}
                  isSelected={isSelected}
                  tabRef={(element) => {
                    mobileNavTabRefs.current[index] = element;
                  }}
                  onClick={(event) => handleMobileNavClick(event, index, item.href)}
                  onNavigateIntent={() => handleMobileNavIntent(index, item.href)}
                >
                  {item.icon(isSelected)}
                  <span className="mobile-nav-label">{item.label}</span>
                </MobileNavTab>
              );
            })}
          </div>
        </nav>
      )}
    </NavCollapseContext.Provider>
  );
}
