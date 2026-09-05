"use client";

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

type LightboxItem = { src: string; alt: string; caption: string };

export default function LightboxClient() {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const [items, setItems] = useState<LightboxItem[]>([]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const scope = document.getElementById('main-content');
    if (!scope) return;
    const images = () => Array.from(scope.querySelectorAll<HTMLImageElement>('.body-text img'))
      .filter(img => !img.closest('.ko-compare, button, a'));
    const previous = new Map<HTMLImageElement, { role: string | null; tab: string | null; label: string | null; alt: string | null }>();
    const prepare = () => {
      for (const img of images()) {
        if (previous.has(img)) continue;
        previous.set(img, { role: img.getAttribute('role'), tab: img.getAttribute('tabindex'), label: img.getAttribute('aria-label'), alt: img.getAttribute('alt') });
        img.setAttribute('role', 'button'); img.tabIndex = 0;
        img.setAttribute('aria-label', `Expand image${img.alt ? `: ${img.alt}` : ''}`);
        // A functional image needs action text: empty alt implies a presentational role.
        if (!img.alt) img.alt = 'Expand image';
      }
    };
    prepare();
    const observer = new MutationObserver(prepare);
    observer.observe(scope, { childList: true, subtree: true });
    const activate = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && !['Enter', ' '].includes(event.key)) return;
      if (!(event.target instanceof HTMLImageElement)) return;
      const candidates = images(); const selected = candidates.indexOf(event.target);
      if (selected < 0) return;
      event.preventDefault(); trigger.current = event.target;
      setItems(candidates.map(img => ({
        src: img.getAttribute('data-full') || img.currentSrc || img.src,
        alt: previous.get(img)?.alt || '',
        caption: img.closest('figure')?.querySelector('figcaption')?.textContent?.trim() || previous.get(img)?.alt || '',
      })));
      setIndex(selected); setOpen(true);
    };
    scope.addEventListener('click', activate); scope.addEventListener('keydown', activate);
    return () => {
      observer.disconnect(); scope.removeEventListener('click', activate); scope.removeEventListener('keydown', activate);
      for (const [img, attrs] of previous) for (const [key, value] of [['role', attrs.role], ['tabindex', attrs.tab], ['aria-label', attrs.label], ['alt', attrs.alt]]) {
        if (value === null) img.removeAttribute(key!); else img.setAttribute(key!, value!);
      }
    };
  }, [pathname]);

  useEffect(() => {
    if (!open || !dialog.current) return;
    const modal = dialog.current;
    const previousOverflow = document.documentElement.style.overflow;
    modal.showModal(); document.documentElement.style.overflow = 'hidden';
    return () => {
      modal.close(); document.documentElement.style.overflow = previousOverflow;
      if (trigger.current?.isConnected) trigger.current.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => { setOpen(false); }, [pathname]);
  const close = () => setOpen(false);
  const move = (direction: number) => setIndex(current => (current + direction + items.length) % items.length);
  const item = items[index];
  return (
    <dialog ref={dialog} className="lightbox-overlay open" aria-label="Image viewer" onCancel={event => { event.preventDefault(); close(); }}
      onClick={event => { if (event.target === event.currentTarget || (event.target as HTMLElement).classList.contains('lightbox-stage')) close(); }}
      onKeyDown={event => {
        if (event.key === 'Tab') {
          const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
          const first = buttons[0], last = buttons[buttons.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
        if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); } if (event.key === 'ArrowRight') { event.preventDefault(); move(1); } }}>
      <div className="lightbox-content">
        <button className="lightbox-close left" aria-label="Close image viewer" onClick={close} autoFocus>×</button>
        {items.length > 1 && <button className="lightbox-arrow lightbox-prev" aria-label="Previous image" onClick={() => move(-1)}>‹</button>}
        <div className="lightbox-stage">
          {/* Original URLs preserve the user's full-resolution media. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {item && <img className="lightbox-img current" src={item.src} alt={item.alt} />}
        </div>
        {items.length > 1 && <button className="lightbox-arrow lightbox-next" aria-label="Next image" onClick={() => move(1)}>›</button>}
        <div className="lightbox-caption-wrap" aria-live="polite"><div className="lightbox-caption">{item?.caption} {items.length > 1 && `(${index + 1} of ${items.length})`}</div></div>
      </div>
    </dialog>
  );
}
