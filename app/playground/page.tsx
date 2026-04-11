"use client";

import { useState, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navigation from "../components/Navigation";
import AnimatedText from "../components/AnimatedText";
import { LoadingDots } from "../components/LoadingAnim";
import Toast from "../components/Toast";
import ProgressiveBlur from "../components/ProgressiveBlur";
import NativeSlideshow from "../blog/NativeSlideshow";
import { useTheme, ACCENT_COLORS, ACCENT_DARK_BACKGROUNDS, ACCENT_LIGHT_BACKGROUNDS, ACCENT_DARK_CONTAINER_BACKGROUNDS, ACCENT_LIGHT_CONTAINER_BACKGROUNDS, type AccentColor } from "../components/ThemeProvider";

/* ------------------------------------------------------------------ */
/*  Section wrapper – keeps each demo visually grouped                */
/* ------------------------------------------------------------------ */
function Section({ title, description, bare, children }: { title: string; description?: string; bare?: boolean; children: React.ReactNode }) {
  return (
    <>
      <div className="container1">
        <div className="title" style={{ fontSize: 'var(--subheading-size)' }}>{title}</div>
        {description && (
          <div style={{ color: 'var(--secondary)', fontSize: 'var(--body-size)', fontFamily: 'One UI Sans' }}>
            {description}
          </div>
        )}
      </div>
      {bare ? children : (
        <div className="container" style={{ padding: 'var(--padding-xll)', gap: 16 }}>
          {children}
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Toggle row – reusable for all toggle demos                        */
/* ------------------------------------------------------------------ */
function ToggleRow({ id, label, description, checked, onChange, badge }: {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  badge?: string;
}) {
  return (
    <label htmlFor={id} className="list3" style={{ cursor: "pointer" }}>
      <div className="test-toggle-group">
        <div className="body-text" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {badge && <span className="beta-chip">{badge}</span>}
          {label}
        </div>
        {description && (
          <div className="information-wrapper">
            <div className="information">{description}</div>
          </div>
        )}
      </div>
      <div className="toggle-switch">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} id={id} />
        <span className="toggle-slider"></span>
      </div>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/*  Chips demo (standalone, no router dependency)                      */
/* ------------------------------------------------------------------ */
function DemoChips() {
  const [selected, setSelected] = useState<string | null>(null);
  const chips = ["All", "Design", "Development", "Photography", "Music", "Tutorials"];

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        flexWrap: "nowrap",
        overflowX: "auto",
        overflowY: "hidden",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        width: "100%",
        padding: "4px 0",
      }}
    >
      {chips.map((chip) => {
        const isSelected = selected === chip || (chip === "All" && selected === null);
        return (
          <button
            key={chip}
            onClick={() => setSelected(chip === "All" ? null : chip)}
            style={{
              flex: "0 0 auto",
              borderRadius: "var(--br-2lg)",
              padding: "8px 16px",
              border: isSelected
                ? "2px solid var(--accent)"
                : "1px solid color-mix(in srgb, var(--secondary) 40%, transparent)",
              backgroundColor: isSelected
                ? "var(--accent)"
                : "color-mix(in srgb, var(--container-background) 50%, transparent)",
              color: isSelected ? "#fff" : "var(--secondary)",
              fontSize: 16,
              fontFamily: "One UI Sans",
              fontWeight: 500,
              lineHeight: "20px",
              whiteSpace: "nowrap",
              cursor: "pointer",
              transition: "background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease",
            }}
          >
            {chip}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton loading demo                                              */
/* ------------------------------------------------------------------ */
function DemoSkeleton() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", width: "100%" }}>
      <div className="skeleton-box" style={{ width: 48, height: 48, borderRadius: "50%", flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="skeleton-box" style={{ width: "70%", height: 14 }} />
        <div className="skeleton-box" style={{ width: "45%", height: 14 }} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Button showcase                                                    */
/* ------------------------------------------------------------------ */
function DemoButtons() {
  const [pressedIdx, setPressedIdx] = useState<number | null>(null);

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {/* Primary / accent button */}
      <button
        onMouseDown={() => setPressedIdx(0)}
        onMouseUp={() => setPressedIdx(null)}
        onMouseLeave={() => setPressedIdx(null)}
        style={{
          padding: "10px 24px",
          borderRadius: "var(--br-9xl)",
          border: "none",
          backgroundColor: "var(--accent)",
          color: "#fff",
          fontSize: "var(--body-size)",
          fontFamily: "One UI Sans",
          fontWeight: 600,
          cursor: "pointer",
          transform: pressedIdx === 0 ? "scale(0.96)" : "scale(1)",
          transition: "transform 0.15s ease",
        }}
      >
        Primary
      </button>

      {/* Secondary / outlined button */}
      <button
        onMouseDown={() => setPressedIdx(1)}
        onMouseUp={() => setPressedIdx(null)}
        onMouseLeave={() => setPressedIdx(null)}
        style={{
          padding: "10px 24px",
          borderRadius: "var(--br-9xl)",
          border: "1px solid color-mix(in srgb, var(--secondary) 40%, transparent)",
          backgroundColor: "transparent",
          color: "var(--primary)",
          fontSize: "var(--body-size)",
          fontFamily: "One UI Sans",
          fontWeight: 500,
          cursor: "pointer",
          transform: pressedIdx === 1 ? "scale(0.96)" : "scale(1)",
          transition: "transform 0.15s ease",
        }}
      >
        Secondary
      </button>

      {/* Disabled button */}
      <button
        disabled
        style={{
          padding: "10px 24px",
          borderRadius: "var(--br-9xl)",
          border: "none",
          backgroundColor: "var(--container-background)",
          color: "var(--secondary)",
          fontSize: "var(--body-size)",
          fontFamily: "One UI Sans",
          fontWeight: 500,
          cursor: "not-allowed",
          opacity: 0.5,
        }}
      >
        Disabled
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Radio group demo                                                   */
/* ------------------------------------------------------------------ */
function DemoRadioGroup() {
  const [value, setValue] = useState("option1");
  const options = [
    { value: "option1", label: "Option A" },
    { value: "option2", label: "Option B" },
    { value: "option3", label: "Option C" },
  ];

  return (
    <div style={{ display: "flex", gap: 16 }}>
      {options.map((opt) => (
        <div
          key={opt.value}
          onClick={() => setValue(opt.value)}
          role="radio"
          aria-checked={value === opt.value}
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setValue(opt.value)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            fontFamily: "One UI Sans",
            fontSize: "var(--body-size)",
            color: "var(--primary)",
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              border: value === opt.value ? "2px solid var(--accent)" : "2px solid var(--secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "border-color 0.2s ease",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: value === opt.value ? "var(--accent)" : "transparent",
                transition: "background-color 0.2s ease",
              }}
            />
          </div>
          {opt.label}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Search input demo                                                  */
/* ------------------------------------------------------------------ */
function DemoSearchInput() {
  const [query, setQuery] = useState("");

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "12px 40px 12px 16px",
          borderRadius: "var(--br-9xl)",
          border: "1px solid color-mix(in srgb, var(--secondary) 30%, transparent)",
          backgroundColor: "var(--background)",
          color: "var(--primary)",
          fontSize: "var(--body-size)",
          fontFamily: "One UI Sans",
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.2s ease",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
        onBlur={(e) => (e.target.style.borderColor = "color-mix(in srgb, var(--secondary) 30%, transparent)")}
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            background: "color-mix(in srgb, var(--secondary) 30%, transparent)",
            border: "none",
            borderRadius: "50%",
            width: 20,
            height: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: 0,
            color: "var(--primary)",
            fontSize: 12,
            lineHeight: 1,
          }}
          aria-label="Clear search"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 1L9 9M9 1L1 9" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Progress bar demo                                                  */
/* ------------------------------------------------------------------ */
function DemoProgressBar() {
  const [progress, setProgress] = useState(65);

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          width: "100%",
          height: 8,
          borderRadius: 999,
          backgroundColor: "color-mix(in srgb, var(--secondary) 20%, transparent)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            borderRadius: 999,
            backgroundColor: "var(--accent)",
            transition: "width 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => setProgress((p) => Math.max(0, p - 15))}
          style={{
            padding: "6px 14px",
            borderRadius: "var(--br-sm)",
            border: "1px solid color-mix(in srgb, var(--secondary) 30%, transparent)",
            backgroundColor: "transparent",
            color: "var(--primary)",
            fontSize: 13,
            fontFamily: "One UI Sans",
            cursor: "pointer",
          }}
        >
          - 15%
        </button>
        <button
          onClick={() => setProgress((p) => Math.min(100, p + 15))}
          style={{
            padding: "6px 14px",
            borderRadius: "var(--br-sm)",
            border: "1px solid color-mix(in srgb, var(--secondary) 30%, transparent)",
            backgroundColor: "transparent",
            color: "var(--primary)",
            fontSize: 13,
            fontFamily: "One UI Sans",
            cursor: "pointer",
          }}
        >
          + 15%
        </button>
        <span style={{ color: "var(--secondary)", fontSize: 13, fontFamily: "One UI Sans", alignSelf: "center", marginLeft: "auto" }}>
          {progress}%
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Container / card showcase                                          */
/* ------------------------------------------------------------------ */
function DemoCards() {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", width: "100%" }}>
      {["Design", "Develop", "Ship"].map((label, i) => (
        <div
          key={label}
          style={{
            flex: "1 1 100px",
            minWidth: 100,
            padding: "20px 16px",
            borderRadius: "var(--br-lg)",
            backgroundColor: "var(--background)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            transition: "transform 0.2s ease",
            cursor: "default",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--br-sm)",
              backgroundColor: "var(--accent)",
              opacity: 0.15 + i * 0.15,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
          <span style={{ fontFamily: "One UI Sans", fontWeight: 600, fontSize: "var(--body-size)", color: "var(--primary)" }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Volume icon for slider demos                                       */
/* ------------------------------------------------------------------ */
function VolumeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M3 9.5V14.5H6.5L11.5 19V5L6.5 9.5H3Z" fill="var(--accent)" />
      <path d="M15.5 8.5C16.7 10.2 16.7 13.8 15.5 15.5" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
      <path d="M18.5 6C20.5 9 20.5 15 18.5 18" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Slider                                                             */
/* ------------------------------------------------------------------ */
function SliderInput({ value, onChange, min = 0, max = 100 }: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const getValueFromX = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return min;
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(min + ratio * (max - min));
  }, [min, max]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    onChange(getValueFromX(e.clientX));
  }, [onChange, getValueFromX]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (e.buttons === 0) return;
    onChange(getValueFromX(e.clientX));
  }, [onChange, getValueFromX]);

  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="slider-container">
      <VolumeIcon />
      <div
        ref={trackRef}
        className="slider-track"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        <div className="slider-fill" style={{ width: `${percent}%` }} />
        <div className="slider-thumb" style={{ left: `${percent}%` }} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Segmented slider                                                   */
/* ------------------------------------------------------------------ */
function SegmentedSliderInput({ value, onChange, stops }: {
  value: number;
  onChange: (v: number) => void;
  stops: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const max = stops - 1;

  const getStopFromX = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(ratio * max);
  }, [max]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    onChange(getStopFromX(e.clientX));
  }, [onChange, getStopFromX]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (e.buttons === 0) return;
    onChange(getStopFromX(e.clientX));
  }, [onChange, getStopFromX]);

  const percent = (value / max) * 100;

  return (
    <div className="slider-container">
      <VolumeIcon />
      <div
        ref={trackRef}
        className="slider-track"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        {Array.from({ length: stops }, (_, i) => (
          <div key={i} className="slider-stop" style={{ left: `${(i / max) * 100}%` }} />
        ))}
        <div className="slider-thumb slider-thumb--segmented" style={{ left: `${percent}%` }} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Slider demos                                                       */
/* ------------------------------------------------------------------ */
function DemoSliders() {
  const [slider1, setSlider1] = useState(75);
  const [slider2, setSlider2] = useState(40);
  const [seg1, setSeg1] = useState(1);
  const [seg2, setSeg2] = useState(3);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontFamily: "One UI Sans", fontWeight: 600, fontSize: "var(--body-size)", color: "var(--primary)" }}>
          Standard
        </div>
        <SliderInput value={slider1} onChange={setSlider1} />
        <SliderInput value={slider2} onChange={setSlider2} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontFamily: "One UI Sans", fontWeight: 600, fontSize: "var(--body-size)", color: "var(--primary)" }}>
          Segmented
        </div>
        <SegmentedSliderInput value={seg1} onChange={setSeg1} stops={5} />
        <SegmentedSliderInput value={seg2} onChange={setSeg2} stops={5} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dialog                                                             */
/* ------------------------------------------------------------------ */
function Dialog({ title, text, cancelLabel = "Cancel", confirmLabel = "Apply", onCancel, onConfirm }: {
  title: string;
  text: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-body">
          <div className="dialog-title">{title}</div>
          <div className="dialog-text">{text}</div>
        </div>
        <div className="dialog-actions">
          <button className="dialog-btn" onClick={onCancel}>{cancelLabel}</button>
          <button className="dialog-btn dialog-btn--primary" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Typography showcase                                                */
/* ------------------------------------------------------------------ */
function DemoTypography() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
      <span style={{ fontFamily: "One UI Sans", fontWeight: 700, fontSize: "var(--title-size)", color: "var(--primary)" }}>
        Title (40px / 700)
      </span>
      <span style={{ fontFamily: "One UI Sans", fontWeight: 600, fontSize: "var(--subtitle-size)", color: "var(--primary)" }}>
        Subtitle (20px / 600)
      </span>
      <span style={{ fontFamily: "One UI Sans", fontWeight: 500, fontSize: "var(--subheading-size)", color: "var(--primary)" }}>
        Subheading (18px / 500)
      </span>
      <span style={{ fontFamily: "One UI Sans", fontWeight: 400, fontSize: "var(--body-size)", color: "var(--primary)" }}>
        Body text (14px / 400) &mdash; The quick brown fox jumps over the lazy dog.
      </span>
      <span style={{ fontFamily: "One UI Sans", fontWeight: 400, fontSize: "var(--font-size-2xs)", color: "var(--secondary)" }}>
        Caption (11px / 400) &mdash; Secondary information and metadata
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Badge / chip variants                                              */
/* ------------------------------------------------------------------ */
function DemoBadges() {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      <span className="beta-chip">Beta</span>
      <span
        style={{
          padding: "4px 12px",
          borderRadius: 999,
          backgroundColor: "var(--accent)",
          color: "#fff",
          fontSize: 12,
          fontFamily: "One UI Sans",
          fontWeight: 600,
        }}
      >
        New
      </span>
      <span
        style={{
          padding: "4px 12px",
          borderRadius: 999,
          backgroundColor: "color-mix(in srgb, var(--accent) 15%, transparent)",
          color: "var(--accent)",
          fontSize: 12,
          fontFamily: "One UI Sans",
          fontWeight: 600,
        }}
      >
        Info
      </span>
      <span
        style={{
          padding: "4px 12px",
          borderRadius: 999,
          backgroundColor: "color-mix(in srgb, #34C759 15%, transparent)",
          color: "#34C759",
          fontSize: 12,
          fontFamily: "One UI Sans",
          fontWeight: 600,
        }}
      >
        Success
      </span>
      <span
        style={{
          padding: "4px 12px",
          borderRadius: 999,
          backgroundColor: "color-mix(in srgb, #FF3B30 15%, transparent)",
          color: "#FF3B30",
          fontSize: 12,
          fontFamily: "One UI Sans",
          fontWeight: 600,
        }}
      >
        Error
      </span>
      <span
        style={{
          padding: "4px 12px",
          borderRadius: 999,
          backgroundColor: "color-mix(in srgb, #FF9500 15%, transparent)",
          color: "#FF9500",
          fontSize: 12,
          fontFamily: "One UI Sans",
          fontWeight: 600,
        }}
      >
        Warning
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  List items demo                                                    */
/* ------------------------------------------------------------------ */
function DemoListItems() {
  const [wifiOn, setWifiOn] = useState(true);
  const [btOn, setBtOn] = useState(true);
  const [nfcOn, setNfcOn] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
      {/* Toggle group with subtext and vertical separators */}
      <div className="list-group">
        <label htmlFor="demo-wifi" className="list3" style={{ cursor: "pointer" }}>
          <div className="test-toggle-group">
            <div className="body-text">Wi-Fi</div>
            <div className="information-wrapper">
              <div className="information">SammyGuru</div>
            </div>
          </div>
          <div className="list-item-separator" />
          <div className="toggle-switch">
            <input type="checkbox" checked={wifiOn} onChange={(e) => setWifiOn(e.target.checked)} id="demo-wifi" />
            <span className="toggle-slider"></span>
          </div>
        </label>
        <label htmlFor="demo-bt" className="list3" style={{ cursor: "pointer" }}>
          <div className="test-toggle-group">
            <div className="body-text">Bluetooth</div>
            <div className="information-wrapper">
              <div className="information">That Josh Guy</div>
            </div>
          </div>
          <div className="list-item-separator" />
          <div className="toggle-switch">
            <input type="checkbox" checked={btOn} onChange={(e) => setBtOn(e.target.checked)} id="demo-bt" />
            <span className="toggle-slider"></span>
          </div>
        </label>
        <label htmlFor="demo-nfc" className="list3" style={{ cursor: "pointer" }}>
          <div className="test-toggle-group">
            <div className="body-text">NFC &amp; contactless payments</div>
          </div>
          <div className="toggle-switch">
            <input type="checkbox" checked={nfcOn} onChange={(e) => setNfcOn(e.target.checked)} id="demo-nfc" />
            <span className="toggle-slider"></span>
          </div>
        </label>
      </div>

      {/* Navigation group with chevrons */}
      <div className="list-group">
        {["Account settings", "Notifications", "Privacy", "Help & Support"].map((item) => (
          <div key={item} className="list3" style={{ cursor: "pointer" }}>
            <div className="test-toggle-group">
              <div className="body-text">{item}</div>
            </div>
            <div className="list-item-separator" />
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M1 1L7 7L1 13" stroke="var(--secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Colour Palette Previewer                                           */
/* ------------------------------------------------------------------ */
function DemoColourPalette() {
  const { theme, accentColor } = useTheme();

  const resolvedTheme: 'light' | 'dark' =
    theme === 'auto'
      ? typeof document !== 'undefined'
        ? ((document.documentElement.dataset.theme as 'light' | 'dark') ?? 'dark')
        : 'dark'
      : theme;

  const accentNames = Object.keys(ACCENT_COLORS) as AccentColor[];

  const coreVars = [
    { name: '--background', label: 'Background' },
    { name: '--container-background', label: 'Container' },
    { name: '--primary', label: 'Primary' },
    { name: '--secondary', label: 'Secondary' },
    { name: '--accent', label: 'Accent' },
    { name: '--selected', label: 'Selected' },
  ];

  const stateVars = [
    { name: '--container-background-hover', label: 'Hover' },
    { name: '--container-background-active', label: 'Active' },
  ];

  const skeletonVars = [
    { name: '--skeleton-base', label: 'Base' },
    { name: '--skeleton-highlight', label: 'Highlight' },
  ];

  const groupLabel: React.CSSProperties = {
    fontFamily: 'One UI Sans',
    fontWeight: 600,
    fontSize: 'var(--body-size)',
    color: 'var(--secondary)',
    marginBottom: 10,
  };

  const swatchGrid: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
    gap: 12,
  };

  function CssVarSwatch({ name, label }: { name: string; label: string }) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div
          style={{
            height: 52,
            borderRadius: 'var(--br-sm)',
            backgroundColor: `var(${name})`,
            border: '1px solid color-mix(in srgb, var(--secondary) 20%, transparent)',
          }}
        />
        <span style={{ fontFamily: 'One UI Sans', fontSize: 11, fontWeight: 500, color: 'var(--primary)', lineHeight: 1.3 }}>
          {label}
        </span>
        <span style={{ fontFamily: '"Courier New", monospace', fontSize: 10, color: 'var(--secondary)', lineHeight: 1.3 }}>
          {name}
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      {/* Core theme colours */}
      <div>
        <div style={groupLabel}>Theme</div>
        <div style={swatchGrid}>
          {coreVars.map(({ name, label }) => (
            <CssVarSwatch key={name} name={name} label={label} />
          ))}
        </div>
      </div>

      {/* Accent palette */}
      <div>
        <div style={groupLabel}>Accent Palette</div>
        <div style={swatchGrid}>
          {accentNames.map(name => {
            const isActive = name === accentColor;
            return (
              <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div
                  style={{
                    height: 52,
                    borderRadius: 'var(--br-sm)',
                    backgroundColor: ACCENT_COLORS[name],
                    border: isActive ? '2px solid var(--primary)' : '1px solid transparent',
                    position: 'relative',
                    boxSizing: 'border-box',
                  }}
                >
                  {isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 5,
                        right: 5,
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3L3 5L7 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
                <span
                  style={{
                    fontFamily: 'One UI Sans',
                    fontSize: 11,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--primary)' : 'var(--secondary)',
                    lineHeight: 1.3,
                    textTransform: 'capitalize',
                  }}
                >
                  {name}
                </span>
                <span style={{ fontFamily: '"Courier New", monospace', fontSize: 10, color: 'var(--secondary)', lineHeight: 1.3 }}>
                  {ACCENT_COLORS[name]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Accent-specific background palette */}
      <div>
        <div style={groupLabel}>
          Accent Backgrounds&nbsp;
          <span style={{ fontWeight: 400, textTransform: 'capitalize' }}>({resolvedTheme})</span>
        </div>
        <div style={swatchGrid}>
          {accentNames.map(name => {
            const bg = resolvedTheme === 'dark' ? ACCENT_DARK_BACKGROUNDS[name] : ACCENT_LIGHT_BACKGROUNDS[name];
            const containerBg = resolvedTheme === 'dark' ? ACCENT_DARK_CONTAINER_BACKGROUNDS[name] : ACCENT_LIGHT_CONTAINER_BACKGROUNDS[name];
            const isActive = name === accentColor;
            return (
              <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div
                  style={{
                    height: 52,
                    borderRadius: 'var(--br-sm)',
                    overflow: 'hidden',
                    border: isActive
                      ? '2px solid var(--accent)'
                      : '1px solid color-mix(in srgb, var(--secondary) 20%, transparent)',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ flex: 1, backgroundColor: bg }} />
                  <div style={{ height: 18, backgroundColor: containerBg }} />
                </div>
                <span
                  style={{
                    fontFamily: 'One UI Sans',
                    fontSize: 11,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--primary)' : 'var(--secondary)',
                    lineHeight: 1.3,
                    textTransform: 'capitalize',
                  }}
                >
                  {name}
                </span>
                <span style={{ fontFamily: '"Courier New", monospace', fontSize: 10, color: 'var(--secondary)', lineHeight: 1.3 }}>
                  {bg}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive states */}
      <div>
        <div style={groupLabel}>Interactive States</div>
        <div style={swatchGrid}>
          {stateVars.map(({ name, label }) => (
            <CssVarSwatch key={name} name={name} label={label} />
          ))}
        </div>
      </div>

      {/* Skeleton colours */}
      <div>
        <div style={groupLabel}>Skeleton</div>
        <div style={swatchGrid}>
          {skeletonVars.map(({ name, label }) => (
            <CssVarSwatch key={name} name={name} label={label} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main playground content                                            */
/* ------------------------------------------------------------------ */
function PlaygroundContent() {
  const [toggleA, setToggleA] = useState(true);
  const [toggleB, setToggleB] = useState(false);
  const [toggleC, setToggleC] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/settings";

  const fireToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
  }, []);

  const demoSlides = [
    { src: "https://picsum.photos/seed/playground1/800/500", alt: "Demo slide 1", caption: "First slide caption" },
    { src: "https://picsum.photos/seed/playground2/800/500", alt: "Demo slide 2", caption: "Second slide caption" },
    { src: "https://picsum.photos/seed/playground3/800/500", alt: "Demo slide 3", caption: "Third slide caption" },
  ];

  return (
    <>
      {/* Top app bar */}
      <div className="top-app-bar">
        <div className="top-app-bar-container back-only">
          <Link href={from} className="top-app-bar-icon" aria-label="Back">
            <svg width="10" height="20" viewBox="0 0 10 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.56416 2.15216C9.85916 1.86116 9.86316 1.38616 9.57216 1.09116C9.28116 0.797162 8.80616 0.794162 8.51116 1.08516L0.733159 8.75516C0.397159 9.08616 0.212158 9.52916 0.212158 10.0012C0.212158 10.4722 0.397159 10.9162 0.733159 11.2472L8.51116 18.9162C8.65716 19.0592 8.84716 19.1312 9.03816 19.1312C9.23116 19.1312 9.42516 19.0562 9.57216 18.9082C9.86316 18.6132 9.85916 18.1382 9.56416 17.8472L1.78716 10.1782C1.72116 10.1152 1.71216 10.0402 1.71216 10.0012C1.71216 9.96216 1.72116 9.88616 1.78716 9.82316L9.56416 2.15216Z"
                fill="var(--primary)"
              />
            </svg>
          </Link>
          <div className="title-container">
            <div className="title">Component Playground</div>
          </div>
        </div>
      </div>

      <div className="main-content" style={{ animation: "fadeInUp 0.4s cubic-bezier(0.2, 0.9, 0.3, 1) forwards", opacity: 0 }}>
        {/* ---- Colour Palette ---- */}
        <Section title="Colour Palette" description="All colour variables for the current theme and accent">
          <DemoColourPalette />
        </Section>

        {/* ---- Typography ---- */}
        <Section title="Typography" description="Font scale used across the site">
          <DemoTypography />
        </Section>

        {/* ---- Animated Text ---- */}
        <Section title="Animated Text" description="Hover or drag across the text to see font weight react to your cursor">
          <AnimatedText
            text="Interactive weight"
            style={{ fontSize: "var(--title-size)", letterSpacing: "-0.5px" }}
          />
          <div style={{ marginTop: 8 }}>
            <AnimatedText
              text="Inverse mode"
              inverse
              style={{ fontSize: "var(--subtitle-size)", letterSpacing: "-0.3px" }}
            />
          </div>
        </Section>

        {/* ---- Toggle Switches ---- */}
        <Section title="Toggle Switches" description="Standard on/off controls" bare>
          <div className="list-group">
            <ToggleRow id="demo-toggle-a" label="Notifications" description="Receive push notifications" checked={toggleA} onChange={setToggleA} />
            <ToggleRow id="demo-toggle-b" label="Dark mode sync" description="Follow system appearance" checked={toggleB} onChange={setToggleB} />
            <ToggleRow id="demo-toggle-c" label="Experimental" description="Enable beta features" checked={toggleC} onChange={setToggleC} badge="Beta" />
          </div>
        </Section>

        {/* ---- Buttons ---- */}
        <Section title="Buttons" description="Primary, secondary, and disabled states">
          <DemoButtons />
        </Section>

        {/* ---- Badges ---- */}
        <Section title="Badges" description="Status indicators and labels">
          <DemoBadges />
        </Section>

        {/* ---- Chips ---- */}
        <Section title="Chips" description="Scrollable filter chips with selection state">
          <DemoChips />
        </Section>

        {/* ---- Radio Group ---- */}
        <Section title="Radio Group" description="Single-selection radio buttons">
          <DemoRadioGroup />
        </Section>

        {/* ---- Search Input ---- */}
        <Section title="Search Input" description="Text input with clear button">
          <DemoSearchInput />
        </Section>

        {/* ---- Progress Bar ---- */}
        <Section title="Progress Bar" description="Animated progress indicator">
          <DemoProgressBar />
        </Section>

        {/* ---- Sliders ---- */}
        <Section title="Sliders" description="Standard and segmented range inputs">
          <DemoSliders />
        </Section>

        {/* ---- Cards ---- */}
        <Section title="Cards" description="Hoverable card containers">
          <DemoCards />
        </Section>

        {/* ---- List Items ---- */}
        <Section title="List Items" description="Grouped rows with toggles, subtext, and navigation" bare>
          <DemoListItems />
        </Section>

        {/* ---- Toast Notification ---- */}
        <Section title="Toast Notification" description="Tap the button to show a toast">
          <button
            onClick={() => fireToast("This is a demo toast notification")}
            style={{
              padding: "10px 24px",
              borderRadius: "var(--br-9xl)",
              border: "none",
              backgroundColor: "var(--accent)",
              color: "#fff",
              fontSize: "var(--body-size)",
              fontFamily: "One UI Sans",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Show Toast
          </button>
        </Section>

        {/* ---- Dialog ---- */}
        <Section title="Dialog" description="Confirmation prompt with cancel and apply actions">
          <button
            onClick={() => setShowDialog(true)}
            style={{
              padding: "10px 24px",
              borderRadius: "var(--br-9xl)",
              border: "none",
              backgroundColor: "var(--accent)",
              color: "#fff",
              fontSize: "var(--body-size)",
              fontFamily: "One UI Sans",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Show Dialog
          </button>
        </Section>

        {/* ---- Loading Animation ---- */}
        <Section title="Loading Dots" description="Animated loading spinner in different sizes">
          <div style={{ display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <LoadingDots size={32} dotSize={7} />
              <div style={{ color: "var(--secondary)", fontSize: 12, fontFamily: "One UI Sans", marginTop: 8 }}>Small</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <LoadingDots />
              <div style={{ color: "var(--secondary)", fontSize: 12, fontFamily: "One UI Sans", marginTop: 8 }}>Default</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <LoadingDots size={80} dotSize={16} />
              <div style={{ color: "var(--secondary)", fontSize: 12, fontFamily: "One UI Sans", marginTop: 8 }}>Large</div>
            </div>
          </div>
        </Section>

        {/* ---- Skeleton Loading ---- */}
        <Section title="Skeleton Loading" description="Shimmer placeholders for loading content">
          <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
            <DemoSkeleton />
            <DemoSkeleton />
            <DemoSkeleton />
          </div>
        </Section>

        {/* ---- Slideshow ---- */}
        <Section title="Slideshow" description="Drag or use arrows to navigate between slides">
          <div style={{ width: "100%" }}>
            <NativeSlideshow slides={demoSlides} />
          </div>
        </Section>

        {/* ---- Progressive Blur ---- */}
        <Section title="Progressive Blur" description="The blur overlays at the top and bottom of the viewport (visible when blur effects are enabled in settings)">
          <div style={{ color: "var(--secondary)", fontSize: "var(--body-size)", fontFamily: "One UI Sans" }}>
            The progressive blur is rendered at the page level. Scroll up to see the top blur overlay in action.
          </div>
        </Section>

        {/* Bottom spacing */}
        <div style={{ height: 60 }} />
      </div>

      {/* Toast */}
      {showToast && <Toast message={toastMsg} onClose={() => setShowToast(false)} />}

      {showDialog && (
        <Dialog
          title="This is a title"
          text="This is placeholder text for the dialog."
          onCancel={() => setShowDialog(false)}
          onConfirm={() => {
            setShowDialog(false);
            fireToast("Action confirmed");
          }}
        />
      )}

      {/* Progressive blur overlays */}
      <ProgressiveBlur position="top" />
      <ProgressiveBlur position="bottom" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Page export                                                        */
/* ------------------------------------------------------------------ */
export default function Playground() {
  return (
    <div className="index settings-page">
      <div className="containers">
        <Navigation hideMobile={true} />
        <Suspense
          fallback={
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
              <LoadingDots />
            </div>
          }
        >
          <PlaygroundContent />
        </Suspense>
      </div>
    </div>
  );
}
