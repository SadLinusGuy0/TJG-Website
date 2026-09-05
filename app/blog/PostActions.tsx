"use client";

import { More, Selected, Copy } from "@thatjoshguy/oneui-icons";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ForceRefreshButton from "./[slug]/ForceRefreshButton";

import { useReadingPreferences, useFmpCombinedView } from "./useReadingPreferences";
import { FMP_SLUG } from "../../lib/fmpSections";
import { useTheme } from "../components/ThemeProvider";
import { usePathname, useRouter } from "next/navigation";

export default function PostActions({ slug }: { slug: string }) {
  const { preferences, setPreferences, ready } = useReadingPreferences();
  const { combined, setCombined } = useFmpCombinedView();
  const { fmpSeparatedViewAvailable } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const showingCombined = pathname === `/blog/${slug}` && combined;
  const [open, setOpen] = useState(false);
  const [present, setPresent] = useState(false);
  const [notice, setNotice] = useState("");
  const [position, setPosition] = useState({ top: 80, right: 20 });
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (open || !present) return;
    // Fallback if the exit animation is interrupted or disabled by the browser.
    const timeout = window.setTimeout(() => setPresent(false), 220);
    return () => window.clearTimeout(timeout);
  }, [open, present]);

  useEffect(() => {
    return () => {
      document.body.classList.remove("post-reading-active", "post-reading-compact", "post-reading-focus", "post-reading-hide-search");
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.body.classList.add("post-reading-active");
    document.body.classList.toggle("post-reading-compact", preferences.compact);
    const desktop = window.matchMedia('(min-width: 700px)');
    const updateFocus = () => document.body.classList.toggle("post-reading-focus", preferences.focus && desktop.matches);
    updateFocus();
    desktop.addEventListener('change', updateFocus);
    document.body.classList.toggle("post-reading-hide-search", !preferences.search);
    window.dispatchEvent(new Event("resize"));
    return () => desktop.removeEventListener('change', updateFocus);
  }, [preferences, ready]);

  useEffect(() => {
    if (!open) return;
    const reposition = () => {
      const rect = trigger.current?.getBoundingClientRect();
      if (rect) setPosition({ top: rect.bottom + 10, right: Math.max(12, window.innerWidth - rect.right) });
    };
    reposition();
    menu.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const outside = (event: PointerEvent) => {
      if (!menu.current?.contains(event.target as Node) && !trigger.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition);
    };
  }, [open]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setNotice("Link copied");
    } catch { setNotice("Couldn’t copy the link. Copy the address from your browser."); }
  };

  return (
    <div className="top-app-bar-action-group" role="group" aria-label="Post actions">
      <ForceRefreshButton slug={slug} />
      <button ref={trigger} type="button" className="top-app-bar-icon" aria-label="More post options" title="More post options" aria-haspopup="menu" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => { setNotice(""); setPresent(true); setOpen(!open); }}>
        <More color="var(--primary)" />
      </button>
      {present && createPortal(
        <div ref={menu} id={id} className="post-options-menu" data-state={open ? "open" : "closed"} inert={!open} aria-hidden={!open} onAnimationEnd={event => {
          if (event.target === event.currentTarget && !open) setPresent(false);
        }} role="menu" aria-label="Post options" style={position} onKeyDown={event => {
          const items = Array.from(menu.current?.querySelectorAll<HTMLButtonElement>("button") || []).filter(item => item.getClientRects().length > 0);
          const index = items.indexOf(document.activeElement as HTMLButtonElement);
          if (event.key === "Escape") { event.preventDefault(); setOpen(false); trigger.current?.focus(); }
          if (event.key === "Tab") setOpen(false);
          if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
            event.preventDefault();
            const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
            items[next]?.focus();
          }
        }}>
          <div className="post-options-label" role="presentation">Reading layout</div>
          <div role="group" aria-label="Reading layout">
            <button role="menuitemradio" aria-checked={!preferences.compact} onClick={() => setPreferences(p => ({ ...p, compact: false }))}>Comfortable <span aria-hidden="true">{!preferences.compact && <Selected size={20} color="var(--primary)" />}</span></button>
            <button role="menuitemradio" aria-checked={preferences.compact} onClick={() => setPreferences(p => ({ ...p, compact: true }))}>Compact <span aria-hidden="true">{preferences.compact && <Selected size={20} color="var(--primary)" />}</span></button>
          </div>
          <div className="post-options-separator" role="separator" />
          <button className="desktop-focus-option" role="menuitemcheckbox" aria-checked={preferences.focus} onClick={() => setPreferences(p => ({ ...p, focus: !p.focus }))}>Focus mode <span className="post-options-switch" aria-hidden="true" data-on={preferences.focus} /></button>
          <button role="menuitemcheckbox" aria-checked={preferences.search} onClick={() => setPreferences(p => ({ ...p, search: !p.search }))}>Show search bar <span className="post-options-switch" aria-hidden="true" data-on={preferences.search} /></button>
          <div className="post-options-separator" role="separator" />
          {slug === FMP_SLUG && fmpSeparatedViewAvailable && (
            <>
              <button role="menuitemcheckbox" aria-checked={showingCombined} onClick={() => {
                setCombined(!showingCombined);
                if (pathname !== `/blog/${slug}`) router.push(`/blog/${slug}`);
              }}>Combined view <span className="post-options-switch" aria-hidden="true" data-on={showingCombined} /></button>
              <div className="post-options-separator" role="separator" />
            </>
          )}
          <button role="menuitem" onClick={copyLink}><span className="post-options-action-label"><Copy size={20} color="var(--primary)" aria-hidden="true" />Copy link</span></button>
          <div role="status" className="post-options-status">{notice}</div>
        </div>, document.body,
      )}
    </div>
  );
}
