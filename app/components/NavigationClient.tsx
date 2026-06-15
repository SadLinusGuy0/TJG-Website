"use client";
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, createContext, useContext, useLayoutEffect, useMemo, useRef } from 'react';
import type { CSSProperties, MouseEvent, ReactNode, Ref } from 'react';
import { useBlogEnabled } from './BlogFlagProvider';
import { useCursorFollow } from './useCursorFollow';
import { HomeIcon, ShopIcon, BlogIcon, ContactIcon } from './NavIcons';
import { Drawer, Settings } from '@thatjoshguy/oneui-icons';

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

function DesktopNavButton({ href, isSelected, children }: { href: string; isSelected: boolean; children: ReactNode; }) {
  const { collapsed } = useNavCollapse();
  const { ref, style, handlers } = useCursorFollow<HTMLAnchorElement>();

  return (
    <Link
      ref={ref}
      href={href}
      className={isSelected ? 'nav-icon-container-selected' : 'nav-icon-container'}
      {...handlers}
    >
      <div style={{
        ...style,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: collapsed ? '0' : '12px',
        width: collapsed ? 'auto' : '100%'
      }}>
        {children}
      </div>
    </Link>
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
  
  // Use Vercel Flags value from context (layout), fall back to static config
  const defaultEnabled = serverBlogEnabled ?? true;
  
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    }
    return false;
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

  useEffect(() => {
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

    if (typeof document !== 'undefined') {
      if (collapsed) {
        document.body.classList.add('nav-collapsed');
      } else {
        document.body.classList.remove('nav-collapsed');
      }
    }
  }, [collapsed, hideDesktop]);

  useEffect(() => {
    return () => {
      if (mobileNavigationFrameRef.current !== null) {
        cancelAnimationFrame(mobileNavigationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setOptimisticMobileNavIndex(null);
  }, [pathname]);

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
    hideDesktop && (
      pathname?.startsWith('/settings') ||
      pathname === '/playground' ||
      pathname?.startsWith('/playground/') ||
      pathname?.startsWith('/work/') ||
      pathname?.startsWith('/blog/')
    )
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

  return (
    <NavCollapseContext.Provider value={{ collapsed, setCollapsed }}>
      {!hideDesktop && (
        <nav className={`tab-container desktop-nav${collapsed ? ' collapsed' : ''}`}
          style={{
            width: collapsed ? 72 : '32%',
            minWidth: collapsed ? 72 : 200,
            maxWidth: collapsed ? 72 : 360,
            transition: 'width 0.2s cubic-bezier(0.4,0,0.2,1)'
          }}>
          <div className="icon-container">
            <div
              className={`sidebar-toggle nav-icon-container ${collapsed ? 'sidebar-toggle-collapsed' : 'sidebar-toggle-expanded'}`}
              tabIndex={0}
              role="button"
              aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
              onClick={() => setCollapsed((c) => !c)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setCollapsed(c => !c); }}
            >
              <Drawer size={24} color="var(--primary)" />
            </div>
            
            <DesktopNavButton href="/" isSelected={pathname === '/'}>
              <HomeIcon selected={pathname === '/'} />
              <div className={pathname === '/' ? 'nav-label-selected' : 'nav-label'}>Home</div>
            </DesktopNavButton>
            <DesktopNavButton href="/shop" isSelected={pathname === '/shop'}>
              <ShopIcon selected={pathname === '/shop'} />
              <div className={pathname === '/shop' ? 'nav-label-selected' : 'nav-label'}>Shop</div>
            </DesktopNavButton>
            {showBlog && (
              <DesktopNavButton href="/blog" isSelected={pathname === '/blog' || pathname?.startsWith('/blog/')}>
                <BlogIcon selected={pathname === '/blog' || pathname?.startsWith('/blog/')} />
                <div className={pathname === '/blog' ? 'nav-label-selected' : 'nav-label'}>Blog</div>
              </DesktopNavButton>
            )}
            <DesktopNavButton href="/contact" isSelected={pathname === '/contact'}>
              <ContactIcon selected={pathname === '/contact'} />
              <div className={pathname === '/contact' ? 'nav-label-selected' : 'nav-label'}>Contact</div>
            </DesktopNavButton>
          </div>
          <div className="nav-footer">
            <DesktopNavButton href="/settings" isSelected={pathname === '/settings' || pathname?.startsWith('/settings/')}>
              <Settings size={24} color="var(--primary)" />
              <div className={pathname === '/settings' || pathname?.startsWith('/settings/') ? 'nav-label-selected' : 'nav-label'} style={{ color: 'var(--primary)' }}>Settings</div>
            </DesktopNavButton>
          </div>
        </nav>
      )}

      {!shouldHideMobileNav && (
        <nav className="mobile-nav-bar">
          <div
            ref={mobileNavRailRef}
            className="mobile-nav-tabs"
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
