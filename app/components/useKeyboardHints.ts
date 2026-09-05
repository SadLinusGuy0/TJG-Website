'use client';

import { useSyncExternalStore } from 'react';
import { isKeyboardInput } from '../../lib/keyboard';

// Keep evidence for this page session only: browsers cannot report disconnects.
let keyboardUsed = false;
const desktopQuery = '(min-width: 700px) and (hover: hover) and (pointer: fine)';
const subscribers = new Set<() => void>();

export function suggestsHardwareKeyboard(event: KeyboardEvent): boolean {
  if (!event.isTrusted || event.isComposing || event.key === 'Unidentified' || event.key === 'Process') return false;
  // Ordinary text entry (including virtual-keyboard Enter/Backspace) isn't evidence.
  return event.metaKey || event.ctrlKey || event.altKey
    || ['Tab', 'Escape', 'Control', 'Meta', 'Alt'].includes(event.key)
    || (event.key.length === 1 && Boolean(event.code) && !isKeyboardInput(event.target));
}

function notify() { subscribers.forEach((subscriber) => subscriber()); }
function detect(event: KeyboardEvent) {
  if (!keyboardUsed && suggestsHardwareKeyboard(event)) {
    keyboardUsed = true;
    notify();
  }
}
function subscribe(callback: () => void) {
  subscribers.add(callback);
  const media = window.matchMedia(desktopQuery);
  media.addEventListener('change', callback);
  window.addEventListener('keydown', detect, true);
  return () => {
    subscribers.delete(callback);
    media.removeEventListener('change', callback);
    if (!subscribers.size) window.removeEventListener('keydown', detect, true);
  };
}

export default function useKeyboardHints() {
  return useSyncExternalStore(subscribe,
    () => keyboardUsed || window.matchMedia(desktopQuery).matches,
    () => false);
}
