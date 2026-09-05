'use client';

import { Selected } from '@thatjoshguy/oneui-icons';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function ReadingLayoutMenu({ compact, onChange }: { compact: boolean; onChange: (compact: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const close = () => { setOpen(false); trigger.current?.focus(); };
  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const rect = trigger.current?.getBoundingClientRect();
      if (!rect) return;
      const height = menu.current?.offsetHeight || 150;
      setPosition({ left: Math.max(12, Math.min(rect.right - 240, window.innerWidth - 252)),
        top: Math.max(12, rect.bottom + height + 8 < window.innerHeight ? rect.bottom + 8 : rect.top - height - 8) });
    };
    update();
    menu.current?.querySelectorAll<HTMLButtonElement>('button')[compact ? 1 : 0]?.focus();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => { window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); };
  }, [open, compact]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!menu.current?.contains(event.target as Node) && !trigger.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  return <>
    <button ref={trigger} id="blog-reading-layout" type="button" className="reading-layout-trigger"
      aria-label={`Reading layout: ${compact ? 'Compact' : 'Comfortable'}`} aria-haspopup="menu" aria-expanded={open}
      aria-controls={open ? 'reading-layout-menu' : undefined}
      onPointerDown={event => { if (open) event.preventDefault(); }}
      onClick={() => setOpen(value => !value)}
      onKeyDown={event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setOpen(true); } }}>
      {compact ? 'Compact' : 'Comfortable'}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
    </button>
    {open && createPortal(<div ref={menu} id="reading-layout-menu" role="menu" aria-label="Reading layout"
      className="reading-layout-menu" style={position}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
      onKeyDown={event => {
        if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
        if (event.key === 'Tab') { event.preventDefault(); close(); }
        if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
          event.preventDefault();
          const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button'));
          const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : (current + 1) % 2;
          buttons[next]?.focus();
        }
      }}>
      {[false, true].map(value => <button key={String(value)} type="button" role="menuitemradio" aria-checked={compact === value}
        tabIndex={-1} onClick={() => { onChange(value); close(); }}>
        {value ? 'Compact' : 'Comfortable'}{compact === value && <Selected size={20} color="var(--accent)" />}
      </button>)}
    </div>, document.body)}
  </>;
}
