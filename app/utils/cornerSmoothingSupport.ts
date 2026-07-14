export function supportsLisseSmoothCorners(): boolean {
  return typeof window !== 'undefined'
    && 'ResizeObserver' in window
    && typeof CSS !== 'undefined'
    && typeof CSS.supports === 'function'
    && CSS.supports('clip-path', 'path("M 0 0 L 1 0 L 1 1 Z")');
}
