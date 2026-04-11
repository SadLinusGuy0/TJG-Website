"use client";

import { useTheme, ACCENT_COLORS, ACCENT_LIGHT_BACKGROUNDS, ACCENT_LIGHT_CONTAINER_BACKGROUNDS, ACCENT_DARK_BACKGROUNDS, ACCENT_DARK_CONTAINER_BACKGROUNDS, AccentColor } from '../components/ThemeProvider';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navigation from '../components/Navigation';
import { LoadingDots } from '../components/LoadingAnim';

function ThemePreviewLight({ accent }: { accent: AccentColor }) {
  const bg = ACCENT_LIGHT_BACKGROUNDS[accent];
  const container = ACCENT_LIGHT_CONTAINER_BACKGROUNDS[accent];
  const dot = ACCENT_COLORS[accent];
  return (
    <svg viewBox="0 0 160 112" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="112" rx="16" fill={bg}/>
      <rect x="14" y="14" width="132" height="84" rx="12" fill={container}/>
      <circle cx="34" cy="42" r="7" fill={dot}/>
      <rect x="50" y="37" width="78" height="10" rx="5" fill="#CCCCD0"/>
      <circle cx="34" cy="66" r="7" fill={dot}/>
      <rect x="50" y="61" width="58" height="10" rx="5" fill="#CCCCD0"/>
    </svg>
  );
}

function ThemePreviewDark({ accent }: { accent: AccentColor }) {
  const bg = ACCENT_DARK_BACKGROUNDS[accent];
  const container = ACCENT_DARK_CONTAINER_BACKGROUNDS[accent];
  const dot = ACCENT_COLORS[accent];
  return (
    <svg viewBox="0 0 160 112" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="112" rx="16" fill={bg}/>
      <rect x="14" y="14" width="132" height="84" rx="12" fill={container}/>
      <circle cx="34" cy="42" r="7" fill={dot}/>
      <rect x="50" y="37" width="78" height="10" rx="5" fill="#3A3A3E"/>
      <circle cx="34" cy="66" r="7" fill={dot}/>
      <rect x="50" y="61" width="58" height="10" rx="5" fill="#3A3A3E"/>
    </svg>
  );
}

function ThemePreviewAuto({ accent }: { accent: AccentColor }) {
  const lightBg = ACCENT_LIGHT_BACKGROUNDS[accent];
  const lightContainer = ACCENT_LIGHT_CONTAINER_BACKGROUNDS[accent];
  const darkBg = ACCENT_DARK_BACKGROUNDS[accent];
  const darkContainer = ACCENT_DARK_CONTAINER_BACKGROUNDS[accent];
  const dot = ACCENT_COLORS[accent];
  return (
    <svg viewBox="0 0 160 112" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="autoLeft"><polygon points="0,0 100,0 60,112 0,112"/></clipPath>
        <clipPath id="autoRight"><polygon points="100,0 160,0 160,112 60,112"/></clipPath>
      </defs>
      <g clipPath="url(#autoLeft)">
        <rect width="160" height="112" rx="16" fill={lightBg}/>
        <rect x="14" y="14" width="132" height="84" rx="12" fill={lightContainer}/>
        <circle cx="34" cy="42" r="7" fill={dot}/>
        <rect x="50" y="37" width="78" height="10" rx="5" fill="#CCCCD0"/>
        <circle cx="34" cy="66" r="7" fill={dot}/>
        <rect x="50" y="61" width="58" height="10" rx="5" fill="#CCCCD0"/>
      </g>
      <g clipPath="url(#autoRight)">
        <rect width="160" height="112" rx="16" fill={darkBg}/>
        <rect x="14" y="14" width="132" height="84" rx="12" fill={darkContainer}/>
        <circle cx="34" cy="42" r="7" fill={dot}/>
        <rect x="50" y="37" width="78" height="10" rx="5" fill="#3A3A3E"/>
        <circle cx="34" cy="66" r="7" fill={dot}/>
        <rect x="50" y="61" width="58" height="10" rx="5" fill="#3A3A3E"/>
      </g>
    </svg>
  );
}

function SettingsContent() {
  const { theme, setTheme, accentColor, setAccentColor, blurEnabled, setBlurEnabled, cornerSmoothing, setCornerSmoothing, cornerSmoothingSupported, cornerSmoothingAvailable, liquidGlass, setLiquidGlass, liquidGlassAvailable } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [devOptionsEnabled, setDevOptionsEnabled] = useState(false);
  const [blogOverride, setBlogOverride] = useState(false);
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/';

  useEffect(() => {
    setMounted(true);
    localStorage.setItem('progressiveBlur', blurEnabled.toString());
    document.documentElement.dataset.progressiveBlur = blurEnabled.toString();
  }, [blurEnabled]);

  useEffect(() => {
    const checkDevOptions = () => {
      setDevOptionsEnabled(localStorage.getItem('developer-options-enabled') === 'true');
      setBlogOverride(localStorage.getItem('college-blogs-enabled') === 'true');
    };
    checkDevOptions();
    window.addEventListener('developer-options-changed', checkDevOptions);
    return () => window.removeEventListener('developer-options-changed', checkDevOptions);
  }, []);

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
          {mounted && (
            <div className="theme-cards">
              <div
                className={`theme-card${theme === 'auto' ? ' selected' : ''}`}
                onClick={() => setTheme('auto')}
                role="radio"
                aria-checked={theme === 'auto'}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setTheme('auto')}
              >
                <div className="theme-card-preview">
                  <ThemePreviewAuto accent={accentColor} />
                </div>
                <span className="theme-card-label">Auto</span>
                <div className="theme-card-radio" />
              </div>
              <div
                className={`theme-card${theme === 'light' ? ' selected' : ''}`}
                onClick={() => setTheme('light')}
                role="radio"
                aria-checked={theme === 'light'}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setTheme('light')}
              >
                <div className="theme-card-preview">
                  <ThemePreviewLight accent={accentColor} />
                </div>
                <span className="theme-card-label">Light</span>
                <div className="theme-card-radio" />
              </div>
              <div
                className={`theme-card${theme === 'dark' ? ' selected' : ''}`}
                onClick={() => setTheme('dark')}
                role="radio"
                aria-checked={theme === 'dark'}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setTheme('dark')}
              >
                <div className="theme-card-preview">
                  <ThemePreviewDark accent={accentColor} />
                </div>
                <span className="theme-card-label">Dark</span>
                <div className="theme-card-radio" />
              </div>
            </div>
          )}
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
        <div className="list-group">
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

          {cornerSmoothingAvailable && (
            <label
              htmlFor="corner-smoothing-toggle"
              className="list3"
              style={{
                cursor: cornerSmoothingSupported ? 'pointer' : 'default',
                opacity: cornerSmoothingSupported ? 1 : 0.45,
                pointerEvents: cornerSmoothingSupported ? 'auto' : 'none',
              }}
            >
              <div className="test-toggle-group">
                <div className="body-text">Corner smoothing</div>
                <div className="information-wrapper">
                  <div className="information">
                    {cornerSmoothingSupported
                      ? 'Use squircle-shaped corners for a smoother look'
                      : 'Not supported on this browser'}
                  </div>
                </div>
              </div>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={cornerSmoothing}
                  onChange={(e) => setCornerSmoothing(e.target.checked)}
                  id="corner-smoothing-toggle"
                  disabled={!cornerSmoothingSupported}
                />
                <span className="toggle-slider"></span>
              </div>
            </label>
          )}

          {liquidGlassAvailable && (
            <label htmlFor="liquid-glass-toggle" className="list3" style={{ cursor: 'pointer' }}>
              <div className="test-toggle-group">
                <div className="body-text" style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="beta-chip">Beta</span>
                  Liquid Glass
                </div>
                <div className="information-wrapper">
                  <div className="information">Apply a glass refraction effect to UI elements. May impact performance on some devices.</div>
                </div>
              </div>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={liquidGlass}
                  onChange={(e) => setLiquidGlass(e.target.checked)}
                  id="liquid-glass-toggle"
                />
                <span className="toggle-slider"></span>
              </div>
            </label>
          )}
        </div>

        {devOptionsEnabled && (
          <>
            <div className="container1">
              <div className="title">Developer options</div>
            </div>
            <div className="list-group">
              <label htmlFor="blog-override-toggle" className="list3" style={{ cursor: 'pointer' }}>
                <div className="test-toggle-group">
                  <div className="body-text">Blog page</div>
                  <div className="information-wrapper">
                    <div className="information">Override the cloud flag and show the Blog tab</div>
                  </div>
                </div>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={blogOverride}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      setBlogOverride(enabled);
                      if (enabled) {
                        localStorage.setItem('college-blogs-enabled', 'true');
                        window.dispatchEvent(new Event('college-blogs-enabled'));
                      } else {
                        localStorage.removeItem('college-blogs-enabled');
                        window.dispatchEvent(new Event('college-blogs-disabled'));
                      }
                    }}
                    id="blog-override-toggle"
                  />
                  <span className="toggle-slider"></span>
                </div>
              </label>
              <a href="/playground" className="list3" role="button" aria-label="Component Playground">
                <div className="test-toggle-group">
                  <div className="body-text">Component Playground</div>
                  <div className="information-wrapper">
                    <div className="information">Browse and test UI components</div>
                  </div>
                </div>
                <div className="list-item-separator" />
                <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                  <path d="M1 1L7 7L1 13" stroke="var(--secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </>
        )}

        <div className="container1">
        </div>

        <div className="list-group">
          <a href="/settings/about" className="list3" role="button" aria-label="About this site">
            <div className="test-toggle-group">
              <div className="body-text">About this site</div>
            </div>
            <div className="list-item-separator" />
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M1 1L7 7L1 13" stroke="var(--secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
        </div>
    </>
  );
}

export default function Settings() {
  return (
    <div className="index settings-page">
      <div className="containers">
        <Navigation hideMobile={true} />
        <Suspense fallback={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <LoadingDots />
          </div>
        }>
          <SettingsContent />
        </Suspense>
      </div>
    </div>
  );
} 