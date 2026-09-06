"use client";
import { localPreferences } from '../../../lib/browserStorage';

import { useSearchParams } from "next/navigation";
import { useState, useSyncExternalStore, useCallback, useRef, Suspense } from "react";
import { LoadingDots } from "../../components/LoadingAnim";
import TopAppBar from "../../components/TopAppBar";
import Switch from "../../components/Switch";
import type { FlagDef, FlagCatalog } from '../../../lib/flagCatalog';

const FLAG_COOKIE_PREFIX = 'ff-';
const FLAG_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const CONTENT_PREVIEW: FlagDef = {
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
};

type OverrideState = 'cloud' | 'on' | 'off';

function getCookieValue(key: string, cookieString: string): string | null {
  const cookieName = FLAG_COOKIE_PREFIX + key;
  const match = cookieString.split('; ').find(c => c.startsWith(cookieName + '='));
  if (!match) return null;
  try { return decodeURIComponent(match.split('=').slice(1).join('=')); } catch { return null; }
}

function getBooleanCookieOverride(key: string, cookieString: string): OverrideState {
  const value = getCookieValue(key, cookieString);
  if (value !== 'true' && value !== 'false') return 'cloud';
  return value === 'true' ? 'on' : 'off';
}

function subscribeToOverrides(onChange: () => void) {
  window.addEventListener('flag-overrides-changed', onChange);
  window.addEventListener('focus', onChange);
  return () => {
    window.removeEventListener('flag-overrides-changed', onChange);
    window.removeEventListener('focus', onChange);
  };
}
const getCookieSnapshot = () => document.cookie;
const getServerCookieSnapshot = () => '';
const notifyOverridesChanged = () => window.dispatchEvent(new Event('flag-overrides-changed'));

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
  baseline,
  onSelect,
}: {
  flagKey: string;
  labelledBy: string;
  label: string;
  state: OverrideState;
  baseline: boolean;
  onSelect: (next: OverrideState) => void;
}) {
  const isOverriding = state !== 'cloud';
  const isOn = state === 'cloud' ? baseline : state === 'on';

  const handleToggleChange = () => {
    onSelect(isOn ? 'off' : 'on');
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
  valueType,
  onChange,
  onClear,
}: {
  flagKey: string;
  labelledBy: string;
  label: string;
  value: string | null;
  defaultValue: string;
  options?: Array<{ value: string; label: string }>;
  valueType: 'string' | 'number';
  onChange: (value: string) => void;
  onClear: () => void;
}) {
  const isOverriding = value !== null;
  const [inputValue, setInputValue] = useState(value ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  const commitValue = () => {
    const trimmed = inputValue.trim();
    if (valueType === 'number' && trimmed && !Number.isFinite(Number(trimmed))) return;
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
          type={valueType === 'number' ? 'number' : 'text'}
          step={valueType === 'number' ? 'any' : undefined}
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

function FeatureFlagsContent({ catalog }: { catalog: FlagCatalog }) {
  const flags = [...catalog.flags, CONTENT_PREVIEW];
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/settings';
  const cookieString = useSyncExternalStore(subscribeToOverrides, getCookieSnapshot, getServerCookieSnapshot);
  const booleanOverrides = Object.fromEntries(flags.filter(flag => flag.type === 'boolean')
    .map(flag => [flag.key, getBooleanCookieOverride(flag.key, cookieString)]));
  const stringOverrides = Object.fromEntries(flags.filter(flag => flag.type !== 'boolean')
    .map(flag => [flag.key, getCookieValue(flag.key, cookieString)]));

  const handleBooleanSelect = useCallback((key: string, next: OverrideState) => {
    setCookieOverride(key, next);
    notifyOverridesChanged();
  }, []);

  const handleStringChange = useCallback((key: string, value: string) => {
    setStringCookieOverride(key, value);
    notifyOverridesChanged();
  }, []);

  const handleStringClear = useCallback((key: string) => {
    setStringCookieOverride(key, null);
    notifyOverridesChanged();
  }, []);

  const handleResetAll = useCallback(() => {
    for (const flag of [...catalog.flags, CONTENT_PREVIEW]) {
      if (flag.type !== 'boolean') {
        setStringCookieOverride(flag.key, null);
      } else {
        setCookieOverride(flag.key, 'cloud');
      }
    }
    notifyOverridesChanged();
  }, [catalog]);

  const hasAnyOverride = (
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
              Override this site’s Vercel feature flags locally. Changes take effect on the next page load. Overrides are stored as cookies and do not affect other users.
            </div>
          </div>
        </div>

        <div style={{ padding: '0 var(--padding-xll)' }} role="status">
          <p className="information">{catalog.source === 'vercel'
            ? 'Values loaded from Vercel for this environment.'
            : catalog.source === 'unavailable'
              ? 'Vercel is temporarily unavailable. Showing application defaults.'
              : 'Vercel is not configured. Showing application defaults.'}</p>
        </div>
        <div className="list-group">
          {flags.map(flag => {
            const labelId = `flag-label-${flag.key}`;
            if (flag.type !== 'boolean') {
              const value = stringOverrides[flag.key] ?? null;
              return (
                <div key={flag.key} className="list" style={{ cursor: 'default', flexDirection: 'column', alignItems: 'stretch', gap: '10px' }}>
                  <div className="list-item-content">
                    <div className="body-text" id={labelId}>{flag.name}</div>
                    <div className="information-wrapper">
                      <div className="information">{flag.description}</div>
                      <div className="information">{flag.key === CONTENT_PREVIEW.key ? 'Site default' : flag.source === 'vercel' ? 'Cloud value' : 'Application default'}: {String(flag.defaultValue)}</div>
                    </div>
                  </div>
                  <StringOverrideControl
                      key={`${flag.key}:${JSON.stringify(value)}`}
                      flagKey={flag.key}
                      labelledBy={labelId}
                      label={flag.name}
                      value={value}
                      defaultValue={flag.defaultValue}
                      options={flag.options}
                      valueType={flag.type}
                      onChange={(v) => handleStringChange(flag.key, v)}
                      onClear={() => handleStringClear(flag.key)}
                  />
                </div>
              );
            }

            const state = booleanOverrides[flag.key] ?? 'cloud';
            return (
              <div key={flag.key} className="list" style={{ cursor: 'default' }}>
                <div className="list-item-content" style={{ flex: 1 }}>
                  <div className="body-text" id={labelId}>{flag.name}</div>
                  <div className="information-wrapper">
                    <div className="information">{flag.description}</div>
                      <div className="information">{flag.key === CONTENT_PREVIEW.key ? 'Site default' : flag.source === 'vercel' ? 'Cloud value' : 'Application default'}: {String(flag.defaultValue)}</div>
                  </div>
                </div>
                <OverrideControl
                    flagKey={flag.key}
                    labelledBy={labelId}
                    label={flag.name}
                    state={state}
                    baseline={flag.defaultValue}
                    onSelect={(next) => handleBooleanSelect(flag.key, next)}
                />
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

export default function FeatureFlagsClient({ catalog }: { catalog: FlagCatalog }) {
  return (
    <div className="page settings-page">
      <div className="page-body">
        <Suspense fallback={
          <div className="page-loading-spinner">
            <LoadingDots />
          </div>
        }>
          <FeatureFlagsContent catalog={catalog} />
        </Suspense>
      </div>
    </div>
  );
}
