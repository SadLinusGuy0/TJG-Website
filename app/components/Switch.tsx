'use client';

import { useRef, useCallback } from 'react';

const KNOB_TRAVEL = 14;
const TOGGLE_THRESHOLD = 7;
const DRAG_DEADZONE = 2;

interface SwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
  /** Render as <label htmlFor={id}> instead of <div>. Use when there is no parent <label>. */
  asLabel?: boolean;
}

export default function Switch({ id, checked, onChange, disabled, style, className, asLabel }: SwitchProps) {
  const containerRef = useRef<HTMLElement>(null);
  const startXRef = useRef(0);
  const knobStartPosRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isActiveRef = useRef(false);
  const rafIdRef = useRef(0);
  const latestXRef = useRef(0);
  const didSwipeRef = useRef(false);
  const checkedRef = useRef(checked);
  checkedRef.current = checked;

  const updateKnobPosition = useCallback(() => {
    rafIdRef.current = 0;
    const diffX = latestXRef.current - startXRef.current;
    const knobX = Math.max(0, Math.min(KNOB_TRAVEL, knobStartPosRef.current + diffX));
    containerRef.current?.style.setProperty('--knob-x', knobX + 'px');
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    containerRef.current?.setPointerCapture(e.pointerId);

    startXRef.current = e.clientX;
    knobStartPosRef.current = checkedRef.current ? KNOB_TRAVEL : 0;
    isActiveRef.current = true;
    isDraggingRef.current = false;
    didSwipeRef.current = false;
    latestXRef.current = e.clientX;

    containerRef.current?.classList.add('is-active');
  }, [disabled]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isActiveRef.current) return;

    latestXRef.current = e.clientX;
    const diffX = e.clientX - startXRef.current;

    if (!isDraggingRef.current && Math.abs(diffX) > DRAG_DEADZONE) {
      isDraggingRef.current = true;
      didSwipeRef.current = true;
      containerRef.current?.classList.add('is-dragging');
    }

    if (isDraggingRef.current && !rafIdRef.current) {
      rafIdRef.current = requestAnimationFrame(updateKnobPosition);
    }
  }, [updateKnobPosition]);

  const handlePointerUp = useCallback(() => {
    if (!isActiveRef.current) return;
    isActiveRef.current = false;

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = 0;
    }

    containerRef.current?.classList.remove('is-active', 'is-dragging');
    containerRef.current?.style.removeProperty('--knob-x');

    if (isDraggingRef.current) {
      const finalKnobX = Math.max(
        0,
        Math.min(KNOB_TRAVEL, knobStartPosRef.current + (latestXRef.current - startXRef.current))
      );

      if (!checkedRef.current && finalKnobX >= TOGGLE_THRESHOLD) {
        onChange(true);
      } else if (checkedRef.current && finalKnobX <= TOGGLE_THRESHOLD) {
        onChange(false);
      }
    }

    isDraggingRef.current = false;
  }, [onChange]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (didSwipeRef.current) {
      e.preventDefault();
      e.stopPropagation();
      didSwipeRef.current = false;
    }
  }, []);

  const Tag = asLabel ? 'label' : 'div';
  const tagProps = asLabel ? { htmlFor: id } : {};

  return (
    <Tag
      {...tagProps}
      ref={containerRef as React.Ref<HTMLElement & HTMLDivElement & HTMLLabelElement>}
      className={`switch${className ? ' ' + className : ''}`}
      style={style}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className="slider" />
    </Tag>
  );
}
