"use client";
import { localPreferences } from '../../../lib/browserStorage';

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { LoadingDots } from "../../components/LoadingAnim";
import TopAppBar from "../../components/TopAppBar";
import Switch from "../../components/Switch";

const FLAG_COOKIE_PREFIX = 'ff-';
const FLAG_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

type BooleanFlag = { key: string; name: string; description: string; type?: 'boolean' };
type StringFlag = {
  key: string;
  name: string;
  description: string;
  type: 'string';
  defaultValue: string;
  options?: Array<{ value: string; label: string }>;
};
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
    key: 'projects-enabled',
    name: 'Projects',
    description: 'Show the Edge Config-driven Projects section on the home page',
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
    key: 'fmp-separated-view-enabled',
    name: 'FMP view toggle',
    description: 'Show the FMP separated/combined view toggle in the post overflow menu',
  },
  {
    key: 'blog-content-edition',
    name: 'Blog content',
    description: 'Preview normal or college posts on this browser. Auto follows the site hostname.',
    type: 'string',
    defaultValue: 'auto',
    options: [
      { value: 'auto', label: 'Auto (site default)' },
      { value: 'normal', label: 'Normal' },
      { value: 'college', label: 'College' },
    ],
  },
  {
    key: 'blog-content-source',
    name: 'Blog content source',
    description: 'Choose the CMS used by the blog. Sanity is primary; WordPress is fallback only.',
    type: 'string',
    defaultValue: 'sanity',
    options: [
      { value: 'sanity', label: 'Sanity' },
      { value: 'wordpress', label: 'WordPress fallback' },
    ],
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
      localPreferences.removeItem('college-blogs-enabled');
      window.dispatchEvent(new Event('college-blogs-disabled'));
    }
  } else {
    const value = state === 'on' ? 'true' : 'false';
    document.cookie = `${cookieName}=${value}; path=/; max-age=${FLAG_COOKIE_MAX_AGE}`;
    if (key === 'blog-enabled') {
      if (state === 'on') {
        localPreferences.setItem('college-blogs-enabled', 'true');
        window.dispatchEvent(new Event('college-blogs-enabled'));
      } else {
        localPreferences.removeItem('college-blogs-enabled');
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
  labelledBy,
  label,
  state,
  onSelect,
}: {
  flagKey: string;
  labelledBy: string;
  label: string;
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
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onSelect('cloud');
        }}
        aria-label={`Revert ${label} to cloud value`}
        aria-hidden={!isOverriding}
        disabled={!isOverriding}
        className="feature-flag-reset-button"
        style={{
          opacity: isOverriding ? 1 : 0,
          pointerEvents: isOverriding ? 'auto' : 'none',
          transition: 'opacity 0.15s ease-out',
          width: '32px',
          height: '32px',
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

      <Switch
        id={`flag-toggle-${flagKey}`}
        checked={isOn}
        onChange={() => handleToggleChange()}
        ariaLabelledBy={labelledBy}
        asLabel
        style={{ opacity: state === 'cloud' ? 0.4 : 1, transition: 'opacity 0.15s ease-out', cursor: 'pointer' }}
      />
    </div>
  );
}

function StringOverrideControl({
  flagKey,
  labelledBy,
  label,
  value,
  defaultValue,
  options,
  onChange,
  onClear,
}: {
  flagKey: string;
  labelledBy: string;
  label: string;
  value: string | null;
  defaultValue: string;
  options?: Array<{ value: string; label: string }>;
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, width: '100%' }}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onClear();
          setInputValue('');
        }}
        aria-label={`Revert ${label} to cloud value`}
        aria-hidden={!isOverriding}
        disabled={!isOverriding}
        className="feature-flag-reset-button"
        style={{
          opacity: isOverriding ? 1 : 0,
          pointerEvents: isOverriding ? 'auto' : 'none',
          transition: 'opacity 0.15s ease-out',
          width: '32px',
          height: '32px',
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

      {options ? (
        <select
          id={`flag-string-${flagKey}`}
          className="feature-flag-control"
          aria-labelledby={labelledBy}
          value={value ?? defaultValue}
          onChange={(e) => onChange(e.target.value)}
          style={{
            fontFamily: "'One UI Sans', sans-serif",
            fontSize: '0.85rem',
            padding: '6px 10px',
            borderRadius: 'var(--br-sm)',
            border: '1px solid rgba(120,120,128,0.2)',
            background: isOverriding ? 'var(--container-background)' : 'transparent',
            color: 'var(--primary)',
            opacity: 1,
            width: '100%',
            minWidth: 0,
          }}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      ) : (
        <input
          ref={inputRef}
          id={`flag-string-${flagKey}`}
          className="feature-flag-control"
          aria-labelledby={labelledBy}
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
            opacity: 1,
            transition: 'border-color 0.15s ease-out',
            width: '100%',
            minWidth: 0,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--accent)';
          }}
          onBlurCapture={(e) => {
            e.target.style.borderColor = 'rgba(120,120,128,0.2)';
          }}
        />
      )}
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
      <div className="main-content" style={{ animation: 'fadeInUp 0.4s cubic-bezier(0.2, 0.9, 0.3, 1) forwards', opacity: 0 }}>
        <TopAppBar
          title="Feature Flags"
          backHref={from}
        />
        <div style={{ padding: 'var(--padding-xll)' }}>
          <div className="information-wrapper">
            <div className="information">
              Override Vercel feature flags locally. Changes take effect on the next page load. Overrides are stored as cookies and do not affect other users.
            </div>
          </div>
        </div>

        <div className="list-group">
          {FLAGS.map(flag => {
            const labelId = `flag-label-${flag.key}`;
            if (flag.type === 'string') {
              const value = mounted ? (stringOverrides[flag.key] ?? null) : null;
              return (
                <div key={flag.key} className="list" style={{ cursor: 'default', flexDirection: 'column', alignItems: 'stretch', gap: '10px' }}>
                  <div className="list-item-content">
                    <div className="body-text" id={labelId}>{flag.name}</div>
                    <div className="information-wrapper">
                      <div className="information">{flag.description}</div>
                    </div>
                  </div>
                  {mounted && (
                    <StringOverrideControl
                      flagKey={flag.key}
                      labelledBy={labelId}
                      label={flag.name}
                      value={value}
                      defaultValue={flag.defaultValue}
                      options={flag.options}
                      onChange={(v) => handleStringChange(flag.key, v)}
                      onClear={() => handleStringClear(flag.key)}
                    />
                  )}
                </div>
              );
            }

            const state = mounted ? (booleanOverrides[flag.key] ?? 'cloud') : 'cloud';
            return (
              <div key={flag.key} className="list" style={{ cursor: 'default' }}>
                <div className="list-item-content" style={{ flex: 1 }}>
                  <div className="body-text" id={labelId}>{flag.name}</div>
                  <div className="information-wrapper">
                    <div className="information">{flag.description}</div>
                  </div>
                </div>
                {mounted && (
                  <OverrideControl
                    flagKey={flag.key}
                    labelledBy={labelId}
                    label={flag.name}
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
            <div className="section-header" />
            <div className="list-group">
              <button
                className="list"
                onClick={handleResetAll}
                style={{ cursor: 'pointer' }}
              >
                <div className="list-item-content">
                  <div className="body-text" style={{ color: '#FF3B30' }}>Reset all overrides</div>
                  <div className="information-wrapper">
                    <div className="information">Restore all flags to their cloud values</div>
                  </div>
                </div>
              </button>
            </div>
          </>
        )}

        <div className="section-header" />
      </div>
    </>
  );
}

export default function FeatureFlagsPage() {
  return (
    <div className="page settings-page">
      <div className="page-body">
        <Suspense fallback={
          <div className="page-loading-spinner">
            <LoadingDots />
          </div>
        }>
          <FeatureFlagsContent />
        </Suspense>
      </div>
    </div>
  );
}
