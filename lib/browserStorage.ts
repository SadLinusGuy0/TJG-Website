/** Preferences are optional: denied storage must never prevent rendering. */
function storage(kind: 'localStorage' | 'sessionStorage') {
  const fallback = new Map<string, string | null>();
  return {
    getItem(key: string): string | null {
      if (typeof window === 'undefined') return null;
      if (fallback.has(key)) return fallback.get(key) ?? null;
      try { return window[kind].getItem(key); } catch { return null; }
    },
    setItem(key: string, value: string) {
      if (typeof window === 'undefined') return;
      try { window[kind].setItem(key, value); fallback.delete(key); }
      catch { fallback.set(key, value); }
    },
    removeItem(key: string) {
      if (typeof window === 'undefined') return;
      try { window[kind].removeItem(key); fallback.delete(key); }
      catch { fallback.set(key, null); }
    },
  };
}
export const localPreferences = storage('localStorage');
export const sessionPreferences = storage('sessionStorage');
