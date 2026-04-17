"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import Navigation from "../../components/Navigation";
import { LoadingDots } from "../../components/LoadingAnim";

const FLAG_COOKIE_PREFIX = 'ff-';
const FLAG_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

type BooleanFlag = { key: string; name: string; description: string; type?: 'boolean' };
type StringFlag = { key: string; name: string; description: string; type: 'string'; defaultValue: string };
type FlagDef = BooleanFlag | StringFlag;

const FLAGS: FlagDef[] = [
  {
    key: 'blog-enabled',
    name: 'Blog page',
    description: 'Show the blog in navigation and allow access to blog pages',
  },
  {
    key: 'popular-stories-enabled',
    name: 'Popular Stories',
    description: 'Show the Popular Stories section on the home page',
  },
  {
    key: 'merged-work-carousel-enabled',
    name: 'Merged Work carousel',
    description: 'Show all 4 design projects on the Home carousel (merged from /work)',
  },
  {
    key: 'misc-section-enabled',
    name: 'Misc section',
    description: 'Show the Misc section on the Home page',
  },
  {
    key: 'recent-blog-posts-enabled',
    name: 'Recent Blog Posts',
    description: 'Show the Recent Blog Posts carousel on the Home page',
  },
  {
    key: 'year-slider-enabled',
    name: 'Year slider',
    description: 'Show the Year 1/Year 2 slider on the blog page',
  },
  {
    key: 'in-post-search-bar-enabled',
    name: 'In-post search bar',
    description: 'Show the search bar on every blog post',
  },
  {
    key: 'in-post-search-bar-fmp-enabled',
    name: 'In-post search bar (FMP only)',
    description: 'Show the search bar on the FMP post only',
  },
  {
    key: 'corner-smoothing-enabled',
    name: 'Corner smoothing toggle',
    description: 'Show the corner smoothing toggle in Settings',
  },
  {
    key: 'liquid-glass-enabled',
    name: 'Liquid Glass toggle',
    description: 'Show the Liquid Glass toggle in Settings',
  },
  {
    key: 'wordpress-source-url',
    name: 'WordPress source URL',
    description: 'The WordPress site URL used as the blog data source',
    type: 'string',
    defaultValue: 'https://tjg8.wordpress.com',
  },
];

type OverrideState = 'cloud' | 'on' | 'off';

function getCookieValue(key: string): string | null {
  if (typeof document === 'undefined') return null;
  const cookieName = FLAG_COOKIE_PREFIX + key;
  const match = document.cookie.split('; ').find(c => c.startsWith(cookieName + '='));
  if (!match) return null;
  return decodeURIComponent(match.split('=').slice(1).join('='));
}

function getBooleanCookieOverride(key: string): OverrideState {
  const value = getCookieValue(key);
  if (value === null) return 'cloud';
  return value === 'true' ? 'on' : 'off';
}

function getStringCookieOverride(key: string): string | null {
  return getCookieValue(key);
}

function setCookieOverride(key: string, state: OverrideState) {
  const cookieName = FLAG_COOKIE_PREFIX + key;
  if (state === 'cloud') {
    document.cookie = `${cookieName}=; path=/; max-age=0`;
    if (key === 'blog-enabled') {
      localStorage.removeItem('college-blogs-enabled');
      window.dispatchEvent(new Event('college-blogs-disabled'));
    }
  } else {
    const value = state === 'on' ? 'true' : 'false';
    document.cookie = `${cookieName}=${value}; path=/; max-age=${FLAG_COOKIE_MAX_AGE}`;
    if (key === 'blog-enabled') {
      if (state === 'on') {
        localStorage.setItem('college-blogs-enabled', 'true');
        window.dispatchEvent(new Event('college-blogs-enabled'));
      } else {
        localStorage.removeItem('college-blogs-enabled');
        window.dispatchEvent(new Event('college-blogs-disabled'));
      }
    }
  }
}

function setStringCookieOverride(key: string, value: string | null) {
  const cookieName = FLAG_COOKIE_PREFIX + key;
  if (value === null) {
    document.cookie = `${cookieName}=; path=/; max-age=0`;
  } else {
    document.cookie = `${cookieName}=${encodeURIComponent(value)}; path=/; max-age=${FLAG_COOKIE_MAX_AGE}`;
  }
}

function OverrideControl({
  flagKey,
  state,
  onSelect,
}: {
  flagKey: string;
  state: OverrideState;
  onSelect: (next: OverrideState) => void;
}) {
  const isOverriding = state !== 'cloud';
  const isOn = state === 'on';

  const handleToggleChange = () => {
    if (state === 'cloud') {
      onSelect('on');
    } else {
      onSelect(isOn ? 'off' : 'on');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onSelect('cloud');
        }}
        aria-label="Revert to cloud value"
        style={{
          opacity: isOverriding ? 1 : 0,
          pointerEvents: isOverriding ? 'auto' : 'none',
          transition: 'opacity 0.15s ease-out',
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          background: 'rgba(120,120,128,0.18)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          flexShrink: 0,
        }}
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M1 1L7 7M7 1L1 7" stroke="var(--secondary)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      <label
        htmlFor={`flag-toggle-${flagKey}`}
        className="toggle-switch"
        style={{ opacity: state === 'cloud' ? 0.4 : 1, transition: 'opacity 0.15s ease-out', cursor: 'pointer' }}
      >
        <input
          type="checkbox"
          id={`flag-toggle-${flagKey}`}
          checked={isOn}
          onChange={handleToggleChange}
        />
        <span className="toggle-slider" />
      </label>
    </div>
  );
}

function StringOverrideControl({
  flagKey,
  value,
  defaultValue,
  onChange,
  onClear,
}: {
  flagKey: string;
  value: string | null;
  defaultValue: string;
  onChange: (value: string) => void;
  onClear: () => void;
}) {
  const isOverriding = value !== null;
  const [inputValue, setInputValue] = useState(value ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value changes (e.g. reset all)
  useEffect(() => {
    setInputValue(value ?? '');
  }, [value]);

  const commitValue = () => {
    const trimmed = inputValue.trim();
    if (trimmed && trimmed !== value) {
      onChange(trimmed);
    } else if (!trimmed && isOverriding) {
      onClear();
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, minWidth: 0, flex: 1, justifyContent: 'flex-end' }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onClear();
          setInputValue('');
        }}
        aria-label="Revert to cloud value"
        style={{
          opacity: isOverriding ? 1 : 0,
          pointerEvents: isOverriding ? 'auto' : 'none',
          transition: 'opacity 0.15s ease-out',
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          background: 'rgba(120,120,128,0.18)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          flexShrink: 0,
        }}
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M1 1L7 7M7 1L1 7" stroke="var(--secondary)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      <input
        ref={inputRef}
        id={`flag-string-${flagKey}`}
        type="text"
        value={inputValue}
        placeholder={defaultValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={commitValue}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commitValue();
            inputRef.current?.blur();
          }
        }}
        style={{
          fontFamily: "'One UI Sans', sans-serif",
          fontSize: '0.85rem',
          padding: '6px 10px',
          borderRadius: 'var(--br-sm)',
          border: '1px solid rgba(120,120,128,0.2)',
          background: isOverriding ? 'var(--container-background)' : 'transparent',
          color: 'var(--primary)',
          opacity: isOverriding ? 1 : 0.5,
          outline: 'none',
          transition: 'opacity 0.15s ease-out, border-color 0.15s ease-out',
          width: '100%',
          maxWidth: '260px',
          minWidth: 0,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--accent)';
          e.target.style.opacity = '1';
        }}
        onBlurCapture={(e) => {
          e.target.style.borderColor = 'rgba(120,120,128,0.2)';
          if (!isOverriding) e.target.style.opacity = '0.5';
        }}
      />
    </div>
  );
}

function FeatureFlagsContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/settings';
  const [booleanOverrides, setBooleanOverrides] = useState<Record<string, OverrideState>>({});
  const [stringOverrides, setStringOverrides] = useState<Record<string, string | null>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initialBooleans: Record<string, OverrideState> = {};
    const initialStrings: Record<string, string | null> = {};
    for (const flag of FLAGS) {
      if (flag.type === 'string') {
        initialStrings[flag.key] = getStringCookieOverride(flag.key);
      } else {
        initialBooleans[flag.key] = getBooleanCookieOverride(flag.key);
      }
    }
    setBooleanOverrides(initialBooleans);
    setStringOverrides(initialStrings);
    setMounted(true);
  }, []);

  const handleBooleanSelect = useCallback((key: string, next: OverrideState) => {
    setCookieOverride(key, next);
    setBooleanOverrides(prev => ({ ...prev, [key]: next }));
  }, []);

  const handleStringChange = useCallback((key: string, value: string) => {
    setStringCookieOverride(key, value);
    setStringOverrides(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleStringClear = useCallback((key: string) => {
    setStringCookieOverride(key, null);
    setStringOverrides(prev => ({ ...prev, [key]: null }));
  }, []);

  const handleResetAll = useCallback(() => {
    for (const flag of FLAGS) {
      if (flag.type === 'string') {
        setStringCookieOverride(flag.key, null);
      } else {
        setCookieOverride(flag.key, 'cloud');
      }
    }
    const resetBooleans: Record<string, OverrideState> = {};
    const resetStrings: Record<string, string | null> = {};
    for (const flag of FLAGS) {
      if (flag.type === 'string') {
        resetStrings[flag.key] = null;
      } else {
        resetBooleans[flag.key] = 'cloud';
      }
    }
    setBooleanOverrides(resetBooleans);
    setStringOverrides(resetStrings);
  }, []);

  const hasAnyOverride = mounted && (
    Object.values(booleanOverrides).some(v => v !== 'cloud') ||
    Object.values(stringOverrides).some(v => v !== null)
  );

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
            <div className="title">Feature Flags</div>
          </div>
        </div>
      </div>

      <div className="main-content" style={{ animation: 'fadeInUp 0.4s cubic-bezier(0.2, 0.9, 0.3, 1) forwards', opacity: 0 }}>
        <div style={{ padding: 'var(--padding-xll)' }}>
          <div className="information-wrapper">
            <div className="information">
              Override Vercel feature flags locally. Changes take effect on the next page load. Overrides are stored as cookies and do not affect other users.
            </div>
          </div>
        </div>

        <div className="list-group">
          {FLAGS.map(flag => {
            if (flag.type === 'string') {
              const value = mounted ? (stringOverrides[flag.key] ?? null) : null;
              return (
                <div key={flag.key} className="list3" style={{ cursor: 'default', gap: '12px' }}>
                  <div className="test-toggle-group" style={{ flex: '0 1 auto', minWidth: 0 }}>
                    <div className="body-text">{flag.name}</div>
                    <div className="information-wrapper">
                      <div className="information">{flag.description}</div>
                    </div>
                  </div>
                  {mounted && (
                    <StringOverrideControl
                      flagKey={flag.key}
                      value={value}
                      defaultValue={flag.defaultValue}
                      onChange={(v) => handleStringChange(flag.key, v)}
                      onClear={() => handleStringClear(flag.key)}
                    />
                  )}
                </div>
              );
            }

            const state = mounted ? (booleanOverrides[flag.key] ?? 'cloud') : 'cloud';
            return (
              <div key={flag.key} className="list3" style={{ cursor: 'default' }}>
                <div className="test-toggle-group" style={{ flex: 1 }}>
                  <div className="body-text">{flag.name}</div>
                  <div className="information-wrapper">
                    <div className="information">{flag.description}</div>
                  </div>
                </div>
                {mounted && (
                  <OverrideControl
                    flagKey={flag.key}
                    state={state}
                    onSelect={(next) => handleBooleanSelect(flag.key, next)}
                  />
                )}
              </div>
            );
          })}
        </div>

        {hasAnyOverride && (
          <>
            <div className="container1" />
            <div className="list-group">
              <button
                className="list3"
                onClick={handleResetAll}
                style={{ cursor: 'pointer' }}
              >
                <div className="test-toggle-group">
                  <div className="body-text" style={{ color: '#FF3B30' }}>Reset all overrides</div>
                  <div className="information-wrapper">
                    <div className="information">Restore all flags to their cloud values</div>
                  </div>
                </div>
              </button>
            </div>
          </>
        )}

        <div className="container1" />
      </div>
    </>
  );
}

export default function FeatureFlagsPage() {
  return (
    <div className="index settings-page">
      <div className="containers">
        <Navigation hideMobile={true} />
        <Suspense fallback={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <LoadingDots />
          </div>
        }>
          <FeatureFlagsContent />
        </Suspense>
      </div>
    </div>
  );
}
