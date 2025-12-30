import React from "react";

type LoadingDotsProps = {
  size?: number;      // overall spinner box (px)
  dotSize?: number;   // dot diameter (px)
  speedMs?: number;   // rotation duration
  className?: string;
  centered?: boolean; // center the spinner
};

export function LoadingDots({
  size = 56,
  dotSize = 12,
  speedMs = 900,
  className,
  centered = false,
}: LoadingDotsProps) {
  const r = Math.round(size * 0.28); // orbit radius

  return (
    <div
      className={["loading-dots", centered && "loading-dots-centered", className].filter(Boolean).join(" ")}
      style={
        {
          ["--loading-size" as any]: `${size}px`,
          ["--loading-dot-size" as any]: `${dotSize}px`,
          ["--loading-radius" as any]: `${r}px`,
          ["--loading-speed" as any]: `${speedMs}ms`,
        } as React.CSSProperties
      }
      aria-label="Loading"
      role="status"
    >
      <span className="loading-dot loading-dot-blue loading-dot-top" />
      <span className="loading-dot loading-dot-blue loading-dot-right" />
      <span className="loading-dot loading-dot-green loading-dot-bottom" />
      <span className="loading-dot loading-dot-blue loading-dot-left" />
    </div>
  );
}