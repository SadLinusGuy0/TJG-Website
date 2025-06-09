"use client";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useState, useEffect, createContext, useContext } from 'react';

// Context to share collapsed state
export const NavCollapseContext = createContext({ collapsed: false, setCollapsed: (_: boolean) => {} });

export function useNavCollapse() {
  return useContext(NavCollapseContext);
}

export default function Navigation() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    }
    return false;
  });

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
            className="sidebar-toggle nav-icon-container"
            tabIndex={0}
            role="button"
            aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            onClick={() => setCollapsed((c) => !c)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setCollapsed(c => !c); }}
            style={{
              cursor: 'pointer',
              paddingLeft: 20,
              paddingRight: 20,
              width: '100%',
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              borderRadius: 12,
              marginBottom: 8,
              outline: 'none',
              background: 'none',
              border: 'none',
              transition: 'background 0.2s',
            }}
          >
            {collapsed ? (
              <svg width="24" height="24" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.7, display: 'block', margin: '0px'}}>
                <path d="M5 1.053V16.089M12.5 16.5H3.5C2.119 16.5 1 15.381 1 14V3.5C1 2.119 2.119 1 3.5 1H12.5C13.881 1 15 2.119 15 3.5V14C15 15.381 13.881 16.5 12.5 16.5Z" stroke="var(--primary)" strokeWidth="1.5"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.8, display: 'block', margin: '0px'}}>
                <path fillRule="evenodd" clipRule="evenodd" d="M12.5 0.25C14.2952 0.25 15.75 1.70479 15.75 3.5V14C15.75 15.7952 14.2952 17.25 12.5 17.25H3.5C1.70479 17.25 0.25 15.7952 0.25 14V3.5C0.25 1.70479 1.70479 0.25 3.5 0.25H12.5ZM6 15.75H12.5C13.4668 15.75 14.25 14.9668 14.25 14V3.5C14.25 2.53321 13.4668 1.75 12.5 1.75H6V15.75Z" fill="var(--primary)"/>
              </svg>
            )}
          </div>
          
          <Link href="/" className={pathname === '/' ? 'nav-icon-container-selected' : 'nav-icon-container'}>
            <svg id="vector" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill={pathname === '/' ? "var(--primary)" : "var(--secondary)"} fillRule="evenodd" d="M 18.982 9.3544 L 12.774 4.0724 C 12.349 3.7234 11.652 3.7234 11.227 4.0724 L 5.018 9.3544 C 4.592 9.7034 4.244 10.4374 4.244 10.9874 V 17.6894 C 4.244 19.0644 5.369 20.1894 6.744 20.1894 H 8.875 V 14.2664 C 8.875 13.4414 9.55 12.7664 10.375 12.7664 H 13.375 C 14.2 12.7664 14.875 13.4414 14.875 14.2664 V 20.1894 H 17.256 C 18.631 20.1894 19.756 19.0644 19.756 17.6894 V 10.9874 C 19.756 10.4374 19.408 9.7034 18.982 9.3544" />
            </svg>
            {(!collapsed) && <div className={pathname === '/' ? 'nav-label-selected' : 'nav-label'}>Home</div>}
          </Link>
          <Link href="/work" className={pathname === '/work' ? 'nav-icon-container-selected' : 'nav-icon-container'}>
            <svg id="vector" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill={pathname === '/work' ? "var(--primary)" : "var(--secondary)"} fillRule="nonzero" d="M7.625,4.125C5.764,4.125 4.25,5.639 4.25,7.5C4.25,9.361 5.764,10.875 7.625,10.875C9.487,10.875 11,9.361 11,7.5C11,5.639 9.487,4.125 7.625,4.125M16.375,10.875C18.237,10.875 19.75,9.361 19.75,7.5C19.75,5.639 18.237,4.125 16.375,4.125C14.514,4.125 13,5.639 13,7.5C13,9.361 14.514,10.875 16.375,10.875M7.625,13.125C5.764,13.125 4.25,14.639 4.25,16.5C4.25,18.361 5.764,19.875 7.625,19.875C9.487,19.875 11,18.361 11,16.5C11,14.639 9.487,13.125 7.625,13.125M16.375,13.125C14.514,13.125 13,14.639 13,16.5C13,18.361 14.514,19.875 16.375,19.875C18.237,19.875 19.75,18.361 19.75,16.5C19.75,14.639 18.237,13.125 16.375,13.125" />
            </svg>
            {(!collapsed) && <div className={pathname === '/work' ? 'nav-label-selected' : 'nav-label'}>Work</div>}
          </Link>
          <Link href="/shop" className={pathname === '/shop' ? 'nav-icon-container-selected' : 'nav-icon-container'}>
            <svg id="vector" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill={pathname === '/shop' ? "var(--primary)" : "var(--secondary)"} fillRule="evenodd" d="M 17.5066 17.1421 C 18.4036 17.1421 19.1326 17.8701 19.1326 18.7661 C 19.1326 19.6621 18.4036 20.3921 17.5066 20.3921 C 16.6116 20.3921 15.8826 19.6621 15.8826 18.7661 C 15.8826 17.8701 16.6116 17.1421 17.5066 17.1421 Z M 10.2683 17.1421 C 11.1643 17.1421 11.8933 17.8701 11.8933 18.7661 C 11.8933 19.6621 11.1643 20.3921 10.2683 20.3921 C 9.3723 20.3921 8.6443 19.6621 8.6443 18.7661 C 8.6443 17.8701 9.3723 17.1421 10.2683 17.1421 Z M 5.1664 3.6079 C 5.9454 3.6079 6.6374 4.1299 6.8504 4.8789 L 7.5044 7.1839 L 19.8594 7.1839 C 20.8524 7.1839 21.5714 8.1309 21.3044 9.0869 L 20.1054 13.3859 C 19.8034 14.4669 18.8194 15.2139 17.6974 15.2139 L 10.0954 15.2139 C 8.9774 15.2139 7.9944 14.4719 7.6904 13.3959 L 5.9314 7.1839 L 5.9464 7.1839 L 5.4084 5.2899 C 5.3764 5.1819 5.2784 5.1079 5.1664 5.1079 L 3.3894 5.1079 C 2.9754 5.1079 2.6394 4.7719 2.6394 4.3579 C 2.6394 3.9439 2.9754 3.6079 3.3894 3.6079 L 5.1664 3.6079 Z" />
            </svg>
            {(!collapsed) && <div className={pathname === '/shop' ? 'nav-label-selected' : 'nav-label'}>Shop</div>}
          </Link>
          <Link href="/contact" className={pathname === '/contact' ? 'nav-icon-container-selected' : 'nav-icon-container'}>
            <svg id="vector" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill={pathname === '/contact' ? "var(--primary)" : "var(--secondary)"} fillRule="nonzero" d="M11.999,12.9072C15.796,12.9072 18.875,15.4721 18.875,18.2372L18.875,18.2372L18.875,19.0112C18.875,19.5571 18.381,20.0002 17.772,20.0002L17.772,20.0002L6.227,20.0002C5.618,20.0002 5.125,19.5571 5.125,19.0112L5.125,19.0112L5.125,18.2372C5.125,15.4721 8.203,12.9072 11.999,12.9072ZM11.999,3.9999C14.025,3.9999 15.668,5.6418 15.668,7.6688C15.668,9.6948 14.025,11.3369 11.999,11.3369C9.974,11.3369 8.331,9.6948 8.331,7.6688C8.331,5.6418 9.974,3.9999 11.999,3.9999Z" />
            </svg>
            {(!collapsed) && <div className={pathname === '/contact' ? 'nav-label-selected' : 'nav-label'}>Contact</div>}
          </Link>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="tab-container mobile-nav" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
        <div className="icon-container">
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
          <Link href="/contact" className={pathname === '/contact' ? 'nav-icon-container-selected' : 'nav-icon-container'}>
            <svg id="vector" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill={pathname === '/contact' ? "var(--primary)" : "var(--secondary)"} fillRule="nonzero" d="M11.999,12.9072C15.796,12.9072 18.875,15.4721 18.875,18.2372L18.875,18.2372L18.875,19.0112C18.875,19.5571 18.381,20.0002 17.772,20.0002L17.772,20.0002L6.227,20.0002C5.618,20.0002 5.125,19.5571 5.125,19.0112L5.125,19.0112L5.125,18.2372C5.125,15.4721 8.203,12.9072 11.999,12.9072ZM11.999,3.9999C14.025,3.9999 15.668,5.6418 15.668,7.6688C15.668,9.6948 14.025,11.3369 11.999,11.3369C9.974,11.3369 8.331,9.6948 8.331,7.6688C8.331,5.6418 9.974,3.9999 11.999,3.9999Z" />
            </svg>
            <div className={pathname === '/contact' ? 'nav-label-selected' : 'nav-label'}>Contact</div>
          </Link>
        </div>
      </nav>
    </NavCollapseContext.Provider>
  );
} 