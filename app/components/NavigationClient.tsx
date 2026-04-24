"use client";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { useBlogEnabled } from './BlogFlagProvider';
import { useTheme } from './ThemeProvider';
import { useCursorFollow } from './useCursorFollow';
import { HomeIcon, ShopIcon, BlogIcon, ContactIcon } from './NavIcons';
import { Drawer, Settings } from '@thatjoshguy/oneui-icons';
import { getDisplacementFilter, supportsBackdropFilterUrl } from '../utils/liquidGlass';

// Context to share collapsed state
export const NavCollapseContext = createContext({ collapsed: false, setCollapsed: (_: boolean) => {} });

export function useNavCollapse() {
  return useContext(NavCollapseContext);
}

interface NavigationClientProps {
  hideMobile?: boolean;
  showBlog?: boolean;
}

function MobileNavTab({ href, isSelected, children }: { href: string; isSelected: boolean; children: React.ReactNode; }) {
  const { ref, style, handlers } = useCursorFollow<HTMLAnchorElement>();

  return (
    <Link
      ref={ref}
      href={href}
      className={`mobile-nav-tab${isSelected ? ' mobile-nav-tab--active' : ''}`}
      {...handlers}
    >
      <div style={{
        ...style,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px'
      }}>
        {children}
      </div>
    </Link>
  );
}

function DesktopNavButton({ href, isSelected, children }: { href: string; isSelected: boolean; children: React.ReactNode; }) {
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

export default function NavigationClient({ hideMobile = false, showBlog: propShowBlog = false }: NavigationClientProps) {
  const pathname = usePathname();
  const serverBlogEnabled = useBlogEnabled();
  const { liquidGlass, liquidGlassAvailable } = useTheme();
  const mobileNavRef = useRef<HTMLElement>(null);

  const updateLiquidGlassFilter = useCallback((el: HTMLElement) => {
    const isActive = liquidGlassAvailable && liquidGlass && supportsBackdropFilterUrl();
    if (!isActive) {
      el.style.backdropFilter = 'blur(24px)';
      (el.style as unknown as Record<string, unknown>)['webkitBackdropFilter'] = 'blur(24px)';
      return;
    }
    const rect = el.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);
    const radius = 20;
    const filterUrl = getDisplacementFilter({
      width,
      height,
      radius,
      depth: 20,
      strength: 60,
      chromaticAberration: 2,
    });
    const value = `blur(3px) url('${filterUrl}') blur(1px) brightness(1.1) saturate(1.3)`;
    el.style.backdropFilter = value;
    (el.style as unknown as Record<string, unknown>)['webkitBackdropFilter'] = value;
  }, [liquidGlass, liquidGlassAvailable]);

  useEffect(() => {
    const el = mobileNavRef.current;
    if (!el) return;
    updateLiquidGlassFilter(el);
    const observer = new ResizeObserver(() => updateLiquidGlassFilter(el));
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateLiquidGlassFilter]);
  
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
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', collapsed ? 'true' : 'false');
    }
  }, [collapsed]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (collapsed) {
        document.body.classList.add('nav-collapsed');
      } else {
        document.body.classList.remove('nav-collapsed');
      }
    }
  }, [collapsed]);

  return (
    <NavCollapseContext.Provider value={{ collapsed, setCollapsed }}>
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

      {!hideMobile && (
        <nav
          ref={mobileNavRef}
          className={`mobile-nav-bar${liquidGlassAvailable && liquidGlass ? ' mobile-nav-bar--liquid-glass' : ''}`}
          style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
        >
          <div className="mobile-nav-tabs">
            <MobileNavTab href="/" isSelected={pathname === '/'}>
              <HomeIcon selected={pathname === '/'} />
              <span className="mobile-nav-label">Home</span>
            </MobileNavTab>
            <MobileNavTab href="/shop" isSelected={pathname === '/shop'}>
              <ShopIcon selected={pathname === '/shop'} />
              <span className="mobile-nav-label">Shop</span>
            </MobileNavTab>
            {showBlog && (
              <MobileNavTab href="/blog" isSelected={pathname === '/blog' || pathname?.startsWith('/blog/')}>
                <BlogIcon selected={pathname === '/blog' || pathname?.startsWith('/blog/')} />
                <span className="mobile-nav-label">Blog</span>
              </MobileNavTab>
            )}
            <MobileNavTab href="/contact" isSelected={pathname === '/contact'}>
              <ContactIcon selected={pathname === '/contact'} />
              <span className="mobile-nav-label">Contact</span>
            </MobileNavTab>
          </div>
        </nav>
      )}
    </NavCollapseContext.Provider>
  );
}
