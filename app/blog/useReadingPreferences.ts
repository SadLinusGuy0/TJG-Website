"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "blog-reading-preferences-v1";
const EVENT = "blog-reading-preferences-changed";
export type ReadingPreferences = { compact: boolean; focus: boolean; search: boolean };
const defaults: ReadingPreferences = { compact: false, focus: false, search: true };

function read(): ReadingPreferences {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    return saved ? { compact: saved.compact === true, focus: saved.focus === true, search: saved.search !== false } : defaults;
  } catch { return defaults; }
}

export function useReadingPreferences() {
  const [preferences, setState] = useState(defaults);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => setState(read());
    const local = (event: Event) => setState((event as CustomEvent<ReadingPreferences>).detail);
    sync();
    setReady(true);
    window.addEventListener("storage", sync);
    window.addEventListener(EVENT, local);
    return () => { window.removeEventListener("storage", sync); window.removeEventListener(EVENT, local); };
  }, []);
  const setPreferences = useCallback((update: (current: ReadingPreferences) => ReadingPreferences) => {
    const next = update(preferences);
    setState(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* Keep the change for this visit. */ }
    window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
  }, [preferences]);
  return { preferences, setPreferences, ready };
}

const VIEW_EVENT = "fmp-view-changed";
export function useFmpCombinedView() {
  const [combined, setState] = useState(false);
  useEffect(() => {
    const sync = () => { try { setState(localStorage.getItem("fmpCombinedView") === "true"); } catch { /* Use separated view. */ } };
    const local = (event: Event) => setState((event as CustomEvent<boolean>).detail);
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(VIEW_EVENT, local);
    return () => { window.removeEventListener("storage", sync); window.removeEventListener(VIEW_EVENT, local); };
  }, []);
  const setCombined = (value: boolean) => {
    setState(value);
    try { localStorage.setItem("fmpCombinedView", String(value)); } catch { /* Keep the change for this visit. */ }
    window.dispatchEvent(new CustomEvent(VIEW_EVENT, { detail: value }));
  };
  return { combined, setCombined };
}
