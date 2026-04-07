"use client";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useState, useEffect, createContext, useContext } from 'react';
import { useBlogEnabled } from './BlogFlagProvider';
import { useCursorFollow } from './useCursorFollow';
import { HomeIcon, WorkIcon, ShopIcon, BlogIcon, ContactIcon } from './NavIcons';

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
          borderTopRightRadius: 'var(--br-2lg)',
          width: collapsed ? 72 : '33%',
          minWidth: collapsed ? 72 : 260,
          maxWidth: collapsed ? 72 : 420,
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
            {collapsed ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 17.75C19.414 17.75 19.75 18.086 19.75 18.5C19.75 18.915 19.414 19.25 19 19.25H5C4.586 19.25 4.25 18.915 4.25 18.5C4.25 18.086 4.586 17.75 5 17.75H19ZM19 11.25C19.414 11.25 19.75 11.586 19.75 12C19.75 12.415 19.414 12.75 19 12.75H5C4.586 12.75 4.25 12.415 4.25 12C4.25 11.586 4.586 11.25 5 11.25H19ZM19 4.75C19.414 4.75 19.75 5.086 19.75 5.5C19.75 5.915 19.414 6.25 19 6.25H5C4.586 6.25 4.25 5.915 4.25 5.5C4.25 5.086 4.586 4.75 5 4.75H19Z" fill="var(--primary)"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 17.75C19.414 17.75 19.75 18.086 19.75 18.5C19.75 18.915 19.414 19.25 19 19.25H5C4.586 19.25 4.25 18.915 4.25 18.5C4.25 18.086 4.586 17.75 5 17.75H19ZM19 11.25C19.414 11.25 19.75 11.586 19.75 12C19.75 12.415 19.414 12.75 19 12.75H5C4.586 12.75 4.25 12.415 4.25 12C4.25 11.586 4.586 11.25 5 11.25H19ZM19 4.75C19.414 4.75 19.75 5.086 19.75 5.5C19.75 5.915 19.414 6.25 19 6.25H5C4.586 6.25 4.25 5.915 4.25 5.5C4.25 5.086 4.586 4.75 5 4.75H19Z" fill="var(--primary)"/>
              </svg>
            )}
          </div>
          
          <DesktopNavButton href="/" isSelected={pathname === '/'}>
            <HomeIcon selected={pathname === '/'} />
            <div className={pathname === '/' ? 'nav-label-selected' : 'nav-label'}>Home</div>
          </DesktopNavButton>
          <DesktopNavButton href="/work" isSelected={pathname === '/work'}>
            <WorkIcon selected={pathname === '/work'} />
            <div className={pathname === '/work' ? 'nav-label-selected' : 'nav-label'}>Work</div>
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
      </nav>

      {!hideMobile && (
        <nav className="mobile-nav-bar" style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
          <div className="mobile-nav-tabs">
            <MobileNavTab href="/" isSelected={pathname === '/'}>
              <HomeIcon selected={pathname === '/'} />
              <span className="mobile-nav-label">Home</span>
            </MobileNavTab>
            <MobileNavTab href="/work" isSelected={pathname === '/work'}>
              <WorkIcon selected={pathname === '/work'} />
              <span className="mobile-nav-label">Work</span>
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
