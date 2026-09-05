'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import useKeyboardHints from './useKeyboardHints';
import { createPortal } from 'react-dom';

export default function ShortcutPopover({ title, content, placement = 'top', children }: {
  title: string;
  content: ReactNode;
  placement?: 'top' | 'right';
  children: (descriptionId: string | undefined) => ReactNode;
}) {
  const showHints = useKeyboardHints();
  const id = useId();
  const anchor = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ left: number; top: number; arrow: number } | null>(null);
  const cancelClose = () => { if (timer.current) clearTimeout(timer.current); };
  const show = () => { cancelClose(); if (showHints) setOpen(true); };
  const close = () => { cancelClose(); timer.current = setTimeout(() => setOpen(false), 120); };

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useLayoutEffect(() => {
    if (!open || !showHints) return;
    const update = () => {
      const trigger = anchor.current?.firstElementChild;
      if (!trigger || !panel.current) return;
      const rect = trigger.getBoundingClientRect();
      const box = panel.current.getBoundingClientRect();
      const left = Math.max(12, Math.min(window.innerWidth - box.width - 12,
        placement === 'right' ? rect.right + 12 : rect.left + rect.width / 2 - box.width / 2));
      const top = Math.max(12, Math.min(window.innerHeight - box.height - 12,
        placement === 'right' ? rect.top + rect.height / 2 - box.height / 2 : rect.top - box.height - 12));
      setPosition({ left, top, arrow: placement === 'right'
        ? Math.max(16, Math.min(box.height - 16, rect.top + rect.height / 2 - top))
        : Math.max(16, Math.min(box.width - 16, rect.left + rect.width / 2 - left)) });
    };
    const dismiss = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    window.addEventListener('keydown', dismiss);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('keydown', dismiss);
    };
  }, [open, placement, showHints]);

  return <div ref={anchor} className="shortcut-popover-anchor"
    onMouseEnter={show} onMouseLeave={close} onFocus={show} onBlur={close}
    onClickCapture={() => setOpen(false)}>
    {children(open && showHints ? id : undefined)}
    {open && showHints && createPortal(<div ref={panel} id={id} role="tooltip"
      className={`shortcut-popover shortcut-popover--${placement}`}
      style={{ left: position?.left ?? 0, top: position?.top ?? 0, visibility: position ? 'visible' : 'hidden' }}
      onMouseEnter={show} onMouseLeave={close}>
      <strong className="shortcut-popover-title">{title}</strong>
      <div className="shortcut-popover-content">{content}</div>
      <span className="shortcut-popover-arrow" aria-hidden="true"
        style={placement === 'right' ? { top: position?.arrow } : { left: position?.arrow }} />
    </div>, document.body)}
  </div>;
}
