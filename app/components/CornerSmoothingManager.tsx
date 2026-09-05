"use client";

import { useEffect, useMemo, useState } from 'react';
import { useSmoothCorners, type SmoothCornerOptions } from '@lisse/react';
import { supportsLisseSmoothCorners } from '../utils/cornerSmoothingSupport';

type SmoothTarget = {
  element: HTMLElement;
  corners: SmoothCornerOptions;
  id: number;
  signature: string;
};

const targetIds = new WeakMap<HTMLElement, number>();
const inlineRadiusSignatures = new WeakMap<HTMLElement, string>();
let nextTargetId = 1;

function inlineRadiusSignature(element: HTMLElement): string {
  return [
    element.style.borderRadius,
    element.style.borderTopLeftRadius,
    element.style.borderTopRightRadius,
    element.style.borderBottomRightRadius,
    element.style.borderBottomLeftRadius,
  ].join('|');
}

function radiusValue(value: string, referenceSize: number): number {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return 0;

  const radius = value.endsWith('%') ? (parsed / 100) * referenceSize : parsed;
  return Math.max(0, radius);
}

function radiusFrom(value: string, width: number, height: number): number {
  const [horizontal = '0', vertical = horizontal] = value.trim().split(/\s+/);

  // Lisse uses one radius per corner, while CSS can express elliptical radii.
  // Taking the smaller resolved axis keeps the curve inside the CSS corner box.
  return Math.min(
    radiusValue(horizontal, width),
    radiusValue(vertical, height),
  );
}

function getCornerOptions(element: HTMLElement): SmoothCornerOptions | null {
  const styles = window.getComputedStyle(element);
  const { width, height } = element.getBoundingClientRect();
  const topLeft = radiusFrom(styles.borderTopLeftRadius, width, height);
  const topRight = radiusFrom(styles.borderTopRightRadius, width, height);
  const bottomRight = radiusFrom(styles.borderBottomRightRadius, width, height);
  const bottomLeft = radiusFrom(styles.borderBottomLeftRadius, width, height);

  if (Math.max(topLeft, topRight, bottomRight, bottomLeft) === 0) return null;

  if (topLeft === topRight && topLeft === bottomRight && topLeft === bottomLeft) {
    return {
      radius: topLeft,
      curve: 'squircle',
      smoothing: 0.6,
      preserveSmoothing: true,
    };
  }

  const corner = (radius: number) => ({
    radius,
    curve: 'squircle' as const,
    smoothing: 0.6,
    preserveSmoothing: true,
  });

  return {
    topLeft: corner(topLeft),
    topRight: corner(topRight),
    bottomRight: corner(bottomRight),
    bottomLeft: corner(bottomLeft),
  };
}

function targetId(element: HTMLElement): number {
  const existing = targetIds.get(element);
  if (existing) return existing;

  const id = nextTargetId;
  nextTargetId += 1;
  targetIds.set(element, id);
  return id;
}

function sameTargets(previous: SmoothTarget[], next: SmoothTarget[]): boolean {
  return previous.length === next.length && previous.every((target, index) => (
    target.element === next[index].element && target.signature === next[index].signature
  ));
}

function SmoothCornerTarget({ target }: { target: SmoothTarget }) {
  const ref = useMemo(() => ({ current: target.element }), [target.element]);

  useSmoothCorners(ref, target.corners, { autoEffects: false });

  return null;
}

export function CornerSmoothingManager({ enabled }: { enabled: boolean }) {
  const [targets, setTargets] = useState<SmoothTarget[]>([]);

  useEffect(() => {
    if (!enabled || !supportsLisseSmoothCorners()) {
      setTargets([]);
      return;
    }

    let frame = 0;
    // Only components that opt in (or established rounded surfaces) are measured.
    const selector = '[data-smooth-corners], .panel, .list, .floating-search-bar, .settings-group, .nav-link, .blog-button, .profile-image';
    const known = new Map<HTMLElement, SmoothTarget>();
    const pending = new Set<HTMLElement>();
    const enqueue = (root: Element) => {
      if (root instanceof HTMLElement && root.matches(selector)) pending.add(root);
      root.querySelectorAll<HTMLElement>(selector).forEach(el => pending.add(el));
    };
    const flush = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        for (const el of known.keys()) if (!el.isConnected) known.delete(el);
        for (const element of pending) {
          if (!element.isConnected || element.closest('[data-no-smooth-corners]')) { known.delete(element); continue; }
          inlineRadiusSignatures.set(element, inlineRadiusSignature(element));
          const corners = getCornerOptions(element);
          if (corners) known.set(element, { element, corners, id: targetId(element), signature: JSON.stringify(corners) });
          else known.delete(element);
        }
        pending.clear();
        const next = [...known.values()];
        setTargets(previous => sameTargets(previous, next) ? previous : next);
      });
    };
    enqueue(document.body);
    flush();
    const observer = new MutationObserver(records => {
      let removed = false;
      for (const record of records) {
        if (record.type === 'childList') {
          record.addedNodes.forEach(node => { if (node instanceof Element) enqueue(node); });
          removed ||= record.removedNodes.length > 0;
        } else if (record.target instanceof HTMLElement && record.target.matches(selector)) {
          const element = record.target;
          const current = inlineRadiusSignature(element);
          if (record.attributeName === 'class' || inlineRadiusSignatures.get(element) !== current) pending.add(element);
        }
      }
      if (pending.size || removed) flush();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'style'], childList: true, subtree: true });
    const resize = () => { known.forEach((_, el) => pending.add(el)); flush(); };
    window.addEventListener('resize', resize, { passive: true });
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('resize', resize); };

  }, [enabled]);

  return targets.map((target) => (
    <SmoothCornerTarget key={target.id} target={target} />
  ));
}
