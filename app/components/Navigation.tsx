"use client";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useState, useEffect, createContext, useContext, useRef } from 'react';

// Context to share collapsed state
export const NavCollapseContext = createContext({ collapsed: false, setCollapsed: (_: boolean) => {} });

export function useNavCollapse() {
  return useContext(NavCollapseContext);
}

interface NavigationProps {
  hideMobile?: boolean;
  showBlog?: boolean;
}

// Component for mobile nav buttons with cursor-following effect
function MobileNavButton({ 
  href, 
  isSelected, 
  children 
}: { 
  href: string; 
  isSelected: boolean; 
  children: React.ReactNode;
}) {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate offset from center (normalized to -1 to 1)
    const offsetX = (e.clientX - centerX) / (rect.width / 2);
    const offsetY = (e.clientY - centerY) / (rect.height / 2);
    
    // Apply subtle movement (max 6px in any direction)
    const maxMovement = 6;
    setMousePosition({
      x: offsetX * maxMovement,
      y: offsetY * maxMovement
    });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  return (
    <Link 
      ref={buttonRef}
      href={href} 
      className={isSelected ? 'nav-icon-container-selected' : 'nav-icon-container'}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          transition: isHovering ? 'transform 0.1s ease-out' : 'transform 0.3s ease-out',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }}
      >
        {children}
      </div>
    </Link>
  );
}

export default function Navigation({ hideMobile = false, showBlog: propShowBlog = false }: NavigationProps) {
  const pathname = usePathname();
  
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    }
    return false;
  });
  const [showBlog, setShowBlog] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('college-blogs-enabled') === 'true' || propShowBlog;
    }
    return propShowBlog;
  });

  // Listen for changes to the blog flag in localStorage
  useEffect(() => {
    const checkBlogFlag = () => {
      if (typeof window !== 'undefined') {
        const enabled = localStorage.getItem('college-blogs-enabled') === 'true';
        setShowBlog(enabled || propShowBlog);
      }
    };

    // Check on mount
    checkBlogFlag();

    // Listen for storage events (in case it changes in another tab/window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'college-blogs-enabled') {
        checkBlogFlag();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom events when blog is enabled/disabled in same tab
    const handleBlogEnabled = () => {
      checkBlogFlag();
    };
    const handleBlogDisabled = () => {
      checkBlogFlag();
    };
    window.addEventListener('college-blogs-enabled', handleBlogEnabled);
    window.addEventListener('college-blogs-disabled', handleBlogDisabled);
    
    // Also check periodically as a fallback
    const interval = setInterval(checkBlogFlag, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('college-blogs-enabled', handleBlogEnabled);
      window.removeEventListener('college-blogs-disabled', handleBlogDisabled);
      clearInterval(interval);
    };
  }, [propShowBlog]);

  // When collapsed changes, persist to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', collapsed ? 'true' : 'false');
    }
  }, [collapsed]);

  // Set a class on the body when collapsed
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
      {/* Desktop Navigation */}
      <nav className={`tab-container desktop-nav${collapsed ? ' collapsed' : ''}`}
        style={{
          borderTopRightRadius: 24,
          width: collapsed ? 72 : '33%',
          minWidth: collapsed ? 72 : 260,
          maxWidth: collapsed ? 72 : 420,
          transition: 'width 0.2s cubic-bezier(0.4,0,0.2,1)'
        }}>
        <div className="icon-container">
          {/* Sidebar toggle as first nav item, not a button at the top */}
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
          
          <Link href="/" className={pathname === '/' ? 'nav-icon-container-selected' : 'nav-icon-container'}>
            <svg id="vector" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill={pathname === '/' ? "var(--primary)" : "var(--secondary)"} fillRule="evenodd" d="M 18.982 9.3544 L 12.774 4.0724 C 12.349 3.7234 11.652 3.7234 11.227 4.0724 L 5.018 9.3544 C 4.592 9.7034 4.244 10.4374 4.244 10.9874 V 17.6894 C 4.244 19.0644 5.369 20.1894 6.744 20.1894 H 8.875 V 14.2664 C 8.875 13.4414 9.55 12.7664 10.375 12.7664 H 13.375 C 14.2 12.7664 14.875 13.4414 14.875 14.2664 V 20.1894 H 17.256 C 18.631 20.1894 19.756 19.0644 19.756 17.6894 V 10.9874 C 19.756 10.4374 19.408 9.7034 18.982 9.3544" />
            </svg>
            <div className={pathname === '/' ? 'nav-label-selected' : 'nav-label'}>Home</div>
          </Link>
          <Link href="/work" className={pathname === '/work' ? 'nav-icon-container-selected' : 'nav-icon-container'}>
            <svg id="vector" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill={pathname === '/work' ? "var(--primary)" : "var(--secondary)"} fillRule="nonzero" d="M7.625,4.125C5.764,4.125 4.25,5.639 4.25,7.5C4.25,9.361 5.764,10.875 7.625,10.875C9.487,10.875 11,9.361 11,7.5C11,5.639 9.487,4.125 7.625,4.125M16.375,10.875C18.237,10.875 19.75,9.361 19.75,7.5C19.75,5.639 18.237,4.125 16.375,4.125C14.514,4.125 13,5.639 13,7.5C13,9.361 14.514,10.875 16.375,10.875M7.625,13.125C5.764,13.125 4.25,14.639 4.25,16.5C4.25,18.361 5.764,19.875 7.625,19.875C9.487,19.875 11,18.361 11,16.5C11,14.639 9.487,13.125 7.625,13.125M16.375,13.125C14.514,13.125 13,14.639 13,16.5C13,18.361 14.514,19.875 16.375,19.875C18.237,19.875 19.75,18.361 19.75,16.5C19.75,14.639 18.237,13.125 16.375,13.125" />
            </svg>
            <div className={pathname === '/work' ? 'nav-label-selected' : 'nav-label'}>Work</div>
          </Link>
          <Link href="/shop" className={pathname === '/shop' ? 'nav-icon-container-selected' : 'nav-icon-container'}>
            <svg id="vector" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill={pathname === '/shop' ? "var(--primary)" : "var(--secondary)"} fillRule="evenodd" d="M 17.5066 17.1421 C 18.4036 17.1421 19.1326 17.8701 19.1326 18.7661 C 19.1326 19.6621 18.4036 20.3921 17.5066 20.3921 C 16.6116 20.3921 15.8826 19.6621 15.8826 18.7661 C 15.8826 17.8701 16.6116 17.1421 17.5066 17.1421 Z M 10.2683 17.1421 C 11.1643 17.1421 11.8933 17.8701 11.8933 18.7661 C 11.8933 19.6621 11.1643 20.3921 10.2683 20.3921 C 9.3723 20.3921 8.6443 19.6621 8.6443 18.7661 C 8.6443 17.8701 9.3723 17.1421 10.2683 17.1421 Z M 5.1664 3.6079 C 5.9454 3.6079 6.6374 4.1299 6.8504 4.8789 L 7.5044 7.1839 L 19.8594 7.1839 C 20.8524 7.1839 21.5714 8.1309 21.3044 9.0869 L 20.1054 13.3859 C 19.8034 14.4669 18.8194 15.2139 17.6974 15.2139 L 10.0954 15.2139 C 8.9774 15.2139 7.9944 14.4719 7.6904 13.3959 L 5.9314 7.1839 L 5.9464 7.1839 L 5.4084 5.2899 C 5.3764 5.1819 5.2784 5.1079 5.1664 5.1079 L 3.3894 5.1079 C 2.9754 5.1079 2.6394 4.7719 2.6394 4.3579 C 2.6394 3.9439 2.9754 3.6079 3.3894 3.6079 L 5.1664 3.6079 Z" />
            </svg>
            <div className={pathname === '/shop' ? 'nav-label-selected' : 'nav-label'}>Shop</div>
          </Link>
          {showBlog && (
            <Link href="/blog" className={pathname === '/blog' || pathname?.startsWith('/blog/') ? 'nav-icon-container-selected' : 'nav-icon-container'}>
              <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill={pathname === '/blog' ? "var(--primary)" : "var(--secondary)"} d="M16 4C17.3807 4 18.5 5.1193 18.5 6.5V18C18.5 19.3805 17.3807 20.5 16 20.5H7.5C6.1193 20.5 5 19.3805 5 18V16.6758C5.04072 16.6826 5.08233 16.6875 5.125 16.6875H7.56738L7.64453 16.6836C8.02265 16.6451 8.31738 16.3258 8.31738 15.9375C8.31738 15.5492 8.02265 15.2299 7.64453 15.1914L7.56738 15.1875H5.125C5.08239 15.1875 5.04067 15.1914 5 15.1982V12.9883C5.04072 12.9951 5.08233 13 5.125 13H7.56738L7.64453 12.9961C8.02265 12.9576 8.31738 12.6383 8.31738 12.25C8.31738 11.8617 8.02265 11.5424 7.64453 11.5039L7.56738 11.5H5.125C5.08239 11.5 5.04067 11.5039 5 11.5107V9.30078C5.04072 9.30763 5.08233 9.3125 5.125 9.3125H7.56738L7.64453 9.30859C8.02265 9.27012 8.31738 8.95077 8.31738 8.5625C8.31738 8.17423 8.02265 7.85488 7.64453 7.81641L7.56738 7.8125H5.125C5.08239 7.8125 5.04067 7.81642 5 7.82324V6.5C5 5.1193 6.1193 4 7.5 4H16Z">
                </path>
              </svg>
              <div className={pathname === '/blog' ? 'nav-label-selected' : 'nav-label'}>Blog</div>
            </Link>
          )}
          <Link href="/contact" className={pathname === '/contact' ? 'nav-icon-container-selected' : 'nav-icon-container'}>
            <svg id="vector" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill={pathname === '/contact' ? "var(--primary)" : "var(--secondary)"} fillRule="nonzero" d="M11.999,12.9072C15.796,12.9072 18.875,15.4721 18.875,18.2372L18.875,18.2372L18.875,19.0112C18.875,19.5571 18.381,20.0002 17.772,20.0002L17.772,20.0002L6.227,20.0002C5.618,20.0002 5.125,19.5571 5.125,19.0112L5.125,19.0112L5.125,18.2372C5.125,15.4721 8.203,12.9072 11.999,12.9072ZM11.999,3.9999C14.025,3.9999 15.668,5.6418 15.668,7.6688C15.668,9.6948 14.025,11.3369 11.999,11.3369C9.974,11.3369 8.331,9.6948 8.331,7.6688C8.331,5.6418 9.974,3.9999 11.999,3.9999Z" />
            </svg>
            <div className={pathname === '/contact' ? 'nav-label-selected' : 'nav-label'}>Contact</div>
          </Link>
        </div>
      </nav>

      {/* Mobile Navigation - Only show if hideMobile is false */}
      {!hideMobile && (
        <nav className={`tab-container mobile-nav${showBlog ? ' with-blog' : ''}`}>
          <div className="icon-container">
            <MobileNavButton href="/" isSelected={pathname === '/'}>
              <svg id="vector" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill={pathname === '/' ? "var(--primary)" : "var(--secondary)"} fillRule="evenodd" d="M 18.982 9.3544 L 12.774 4.0724 C 12.349 3.7234 11.652 3.7234 11.227 4.0724 L 5.018 9.3544 C 4.592 9.7034 4.244 10.4374 4.244 10.9874 V 17.6894 C 4.244 19.0644 5.369 20.1894 6.744 20.1894 H 8.875 V 14.2664 C 8.875 13.4414 9.55 12.7664 10.375 12.7664 H 13.375 C 14.2 12.7664 14.875 13.4414 14.875 14.2664 V 20.1894 H 17.256 C 18.631 20.1894 19.756 19.0644 19.756 17.6894 V 10.9874 C 19.756 10.4374 19.408 9.7034 18.982 9.3544" />
              </svg>
              <div className={pathname === '/' ? 'nav-label-selected' : 'nav-label'}>Home</div>
            </MobileNavButton>
            <MobileNavButton href="/work" isSelected={pathname === '/work'}>
              <svg id="vector" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill={pathname === '/work' ? "var(--primary)" : "var(--secondary)"} fillRule="nonzero" d="M7.625,4.125C5.764,4.125 4.25,5.639 4.25,7.5C4.25,9.361 5.764,10.875 7.625,10.875C9.487,10.875 11,9.361 11,7.5C11,5.639 9.487,4.125 7.625,4.125M16.375,10.875C18.237,10.875 19.75,9.361 19.75,7.5C19.75,5.639 18.237,4.125 16.375,4.125C14.514,4.125 13,5.639 13,7.5C13,9.361 14.514,10.875 16.375,10.875M7.625,13.125C5.764,13.125 4.25,14.639 4.25,16.5C4.25,18.361 5.764,19.875 7.625,19.875C9.487,19.875 11,18.361 11,16.5C11,14.639 9.487,13.125 7.625,13.125M16.375,13.125C14.514,13.125 13,14.639 13,16.5C13,18.361 14.514,19.875 16.375,19.875C18.237,19.875 19.75,18.361 19.75,16.5C19.75,14.639 18.237,13.125 16.375,13.125" />
              </svg>
              <div className={pathname === '/work' ? 'nav-label-selected' : 'nav-label'}>Work</div>
            </MobileNavButton>
            <MobileNavButton href="/shop" isSelected={pathname === '/shop'}>
              <svg id="vector" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill={pathname === '/shop' ? "var(--primary)" : "var(--secondary)"} fillRule="evenodd" d="M 17.5066 17.1421 C 18.4036 17.1421 19.1326 17.8701 19.1326 18.7661 C 19.1326 19.6621 18.4036 20.3921 17.5066 20.3921 C 16.6116 20.3921 15.8826 19.6621 15.8826 18.7661 C 15.8826 17.8701 16.6116 17.1421 17.5066 17.1421 Z M 10.2683 17.1421 C 11.1643 17.1421 11.8933 17.8701 11.8933 18.7661 C 11.8933 19.6621 11.1643 20.3921 10.2683 20.3921 C 9.3723 20.3921 8.6443 19.6621 8.6443 18.7661 C 8.6443 17.8701 9.3723 17.1421 10.2683 17.1421 Z M 5.1664 3.6079 C 5.9454 3.6079 6.6374 4.1299 6.8504 4.8789 L 7.5044 7.1839 L 19.8594 7.1839 C 20.8524 7.1839 21.5714 8.1309 21.3044 9.0869 L 20.1054 13.3859 C 19.8034 14.4669 18.8194 15.2139 17.6974 15.2139 L 10.0954 15.2139 C 8.9774 15.2139 7.9944 14.4719 7.6904 13.3959 L 5.9314 7.1839 L 5.9464 7.1839 L 5.4084 5.2899 C 5.3764 5.1819 5.2784 5.1079 5.1664 5.1079 L 3.3894 5.1079 C 2.9754 5.1079 2.6394 4.7719 2.6394 4.3579 C 2.6394 3.9439 2.9754 3.6079 3.3894 3.6079 L 5.1664 3.6079 Z" />
              </svg>
              <div className={pathname === '/shop' ? 'nav-label-selected' : 'nav-label'}>Shop</div>
            </MobileNavButton>
            {showBlog && (
              <MobileNavButton href="/blog" isSelected={pathname === '/blog' || pathname?.startsWith('/blog/')}>
                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path fill={pathname === '/blog' ? "var(--primary)" : "var(--secondary)"} d="M16 4C17.3807 4 18.5 5.1193 18.5 6.5V18C18.5 19.3805 17.3807 20.5 16 20.5H7.5C6.1193 20.5 5 19.3805 5 18V16.6758C5.04072 16.6826 5.08233 16.6875 5.125 16.6875H7.56738L7.64453 16.6836C8.02265 16.6451 8.31738 16.3258 8.31738 15.9375C8.31738 15.5492 8.02265 15.2299 7.64453 15.1914L7.56738 15.1875H5.125C5.08239 15.1875 5.04067 15.1914 5 15.1982V12.9883C5.04072 12.9951 5.08233 13 5.125 13H7.56738L7.64453 12.9961C8.02265 12.9576 8.31738 12.6383 8.31738 12.25C8.31738 11.8617 8.02265 11.5424 7.64453 11.5039L7.56738 11.5H5.125C5.08239 11.5 5.04067 11.5039 5 11.5107V9.30078C5.04072 9.30763 5.08233 9.3125 5.125 9.3125H7.56738L7.64453 9.30859C8.02265 9.27012 8.31738 8.95077 8.31738 8.5625C8.31738 8.17423 8.02265 7.85488 7.64453 7.81641L7.56738 7.8125H5.125C5.08239 7.8125 5.04067 7.81642 5 7.82324V6.5C5 5.1193 6.1193 4 7.5 4H16Z">
                  </path>
                </svg>
                <div className={pathname === '/blog' || pathname?.startsWith('/blog/') ? 'nav-label-selected' : 'nav-label'}>Blog</div>
              </MobileNavButton>
            )}
            <MobileNavButton href="/contact" isSelected={pathname === '/contact'}>
              <svg id="vector" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill={pathname === '/contact' ? "var(--primary)" : "var(--secondary)"} fillRule="nonzero" d="M11.999,12.9072C15.796,12.9072 18.875,15.4721 18.875,18.2372L18.875,18.2372L18.875,19.0112C18.875,19.5571 18.381,20.0002 17.772,20.0002L17.772,20.0002L6.227,20.0002C5.618,20.0002 5.125,19.5571 5.125,19.0112L5.125,19.0112L5.125,18.2372C5.125,15.4721 8.203,12.9072 11.999,12.9072ZM11.999,3.9999C14.025,3.9999 15.668,5.6418 15.668,7.6688C15.668,9.6948 14.025,11.3369 11.999,11.3369C9.974,11.3369 8.331,9.6948 8.331,7.6688C8.331,5.6418 9.974,3.9999 11.999,3.9999Z" />
              </svg>
              <div className={pathname === '/contact' ? 'nav-label-selected' : 'nav-label'}>Contact</div>
            </MobileNavButton>
          </div>
        </nav>
      )}
    </NavCollapseContext.Provider>
  );
} 