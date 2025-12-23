"use client";

import { useTheme, ACCENT_COLORS, AccentColor } from '../components/ThemeProvider';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navigation from '../components/Navigation';

function SettingsContent() {
  const { theme, setTheme, accentColor, setAccentColor, blurEnabled, setBlurEnabled } = useTheme();
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/';

  useEffect(() => {
    setMounted(true);
    localStorage.setItem('progressiveBlur', blurEnabled.toString());
    document.documentElement.dataset.progressiveBlur = blurEnabled.toString();
  }, [blurEnabled]);

  return (
    <>
      <div className="top-app-bar">
        <div className="top-app-bar-container back-only">
          <Link href={from} className="top-app-bar-icon" aria-label="Back">
            <svg width="10" height="20" viewBox="0 0 10 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M9.56416 2.15216C9.85916 1.86116 9.86316 1.38616 9.57216 1.09116C9.28116 0.797162 8.80616 0.794162 8.51116 1.08516L0.733159 8.75516C0.397159 9.08616 0.212158 9.52916 0.212158 10.0012C0.212158 10.4722 0.397159 10.9162 0.733159 11.2472L8.51116 18.9162C8.65716 19.0592 8.84716 19.1312 9.03816 19.1312C9.23116 19.1312 9.42516 19.0562 9.57216 18.9082C9.86316 18.6132 9.85916 18.1382 9.56416 17.8472L1.78716 10.1782C1.72116 10.1152 1.71216 10.0402 1.71216 10.0012C1.71216 9.96216 1.72116 9.88616 1.78716 9.82316L9.56416 2.15216Z" fill="var(--primary)"/>
            </svg>
          </Link>
          <div className="title-container">
            <div className="title">Settings</div>
          </div>
        </div>
      </div>
      
      <div className="main-content" style={{ animation: 'fadeInUp 0.4s cubic-bezier(0.2, 0.9, 0.3, 1) forwards', opacity: 0 }}>
        <div className="container1">
          <div className="title">Theme</div>
        </div>
        <div className="container" style={{ padding: 'var(--padding-xll)' }}>
          <div className="theme-selection">
            {mounted && (
              <>
                <label>
                  <input
                    type="radio"
                    name="theme"
                    value="auto"
                    checked={theme === 'auto'}
                    onChange={() => setTheme('auto')}
                  />
                  Auto
                </label>
                <label>
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={theme === 'light'}
                    onChange={() => setTheme('light')}
                  />
                  Light
                </label>
                <label>
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={theme === 'dark'}
                    onChange={() => setTheme('dark')}
                  />
                  Dark
                </label>
              </>
            )}
          </div>
        </div>
        
        <div className="container1">
          <div className="title">Accent color</div>
        </div>
        <div
          className="container accent-color-scroll"
          style={{
            marginBottom: '10px',
            padding: 'var(--padding-xll)',
            overflowX: 'auto',
            overflowY: 'hidden',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none'
          }}
        >
          <style jsx>{`
            .accent-color-scroll {
              scrollbar-width: none;
            }
            .accent-color-scroll::-webkit-scrollbar {
              display: none;
              height: 0;
              width: 0;
            }
          `}</style>
          <div className="accent-color-selection">
            {mounted && (
              <>
                <label className={accentColor === 'blue' ? 'selected' : ''}>
                  <input
                    type="radio"
                    name="accentColor"
                    value="blue"
                    checked={accentColor === 'blue'}
                    onChange={() => setAccentColor('blue')}
                  />
                  <div className="accent-color-swatch" style={{ backgroundColor: ACCENT_COLORS.blue }}>
                    {accentColor === 'blue' && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 6L11.2672 16.7381C10.9192 17.0873 10.35 17.0873 10.002 16.7381L3 9.73308" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>                      
                    )}
                  </div>
                  <span>Blue</span>
                </label>
                <label className={accentColor === 'coral' ? 'selected' : ''}>
                  <input
                    type="radio"
                    name="accentColor"
                    value="coral"
                    checked={accentColor === 'coral'}
                    onChange={() => setAccentColor('coral')}
                  />
                  <div className="accent-color-swatch" style={{ backgroundColor: ACCENT_COLORS.coral }}>
                    {accentColor === 'coral' && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 6L11.2672 16.7381C10.9192 17.0873 10.35 17.0873 10.002 16.7381L3 9.73308" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg> 
                    )}
                  </div>
                  <span>Coral</span>
                </label>
                <label className={accentColor === 'mint' ? 'selected' : ''}>
                  <input
                    type="radio"
                    name="accentColor"
                    value="mint"
                    checked={accentColor === 'mint'}
                    onChange={() => setAccentColor('mint')}
                  />
                  <div className="accent-color-swatch" style={{ backgroundColor: ACCENT_COLORS.mint }}>
                    {accentColor === 'mint' && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 6L11.2672 16.7381C10.9192 17.0873 10.35 17.0873 10.002 16.7381L3 9.73308" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg> 
                    )}
                  </div>
                  <span>Mint</span>
                </label>
                <label className={accentColor === 'lilac' ? 'selected' : ''}>
                  <input
                    type="radio"
                    name="accentColor"
                    value="lilac"
                    checked={accentColor === 'lilac'}
                    onChange={() => setAccentColor('lilac')}
                  />
                  <div className="accent-color-swatch" style={{ backgroundColor: ACCENT_COLORS.lilac }}>
                    {accentColor === 'lilac' && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 6L11.2672 16.7381C10.9192 17.0873 10.35 17.0873 10.002 16.7381L3 9.73308" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg> 
                    )}
                  </div>
                  <span>Lilac</span>
                </label>
                <label className={accentColor === 'mono' ? 'selected' : ''}>
                  <input
                    type="radio"
                    name="accentColor"
                    value="mono"
                    checked={accentColor === 'mono'}
                    onChange={() => setAccentColor('mono')}
                  />
                  <div className="accent-color-swatch" style={{ backgroundColor: ACCENT_COLORS.mono }}>
                    {accentColor === 'mono' && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 6L11.2672 16.7381C10.9192 17.0873 10.35 17.0873 10.002 16.7381L3 9.73308" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg> 
                    )}
                  </div>
                  <span>Mono</span>
                </label>
              </>
            )}
          </div>
        </div>
        <label htmlFor="progressive-blur-toggle" className="list3" style={{ cursor: 'pointer' }}>
          <div className="test-toggle-group">
            <div className="body-text">Blur effects</div>
            <div className="information-wrapper">
              <div className="information">Enable or disable the blur effects on scroll</div>
            </div>
          </div>
          <div className="toggle-switch">
            <input
              type="checkbox"
              checked={blurEnabled}
              onChange={(e) => setBlurEnabled(e.target.checked)}
              id="progressive-blur-toggle"
            />
            <span className="toggle-slider"></span>
          </div>
        </label>

        <div className="container1">
        </div>

          <a href="/settings/about" className="list3" role="button" aria-label="About this site">
            <div className="test-toggle-group">
              <div className="body-text">About this site</div>
            </div>
          </a>
        </div>
    </>
  );
}

export default function Settings() {
  return (
    <div className="index settings-page">
      <div className="containers">
        <Navigation hideMobile={true} />
        <Suspense fallback={<div>Loading...</div>}>
          <SettingsContent />
        </Suspense>
      </div>
    </div>
  );
} 