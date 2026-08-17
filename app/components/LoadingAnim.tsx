"use client";

type LoadingDotsProps = {
  size?: number;
  className?: string;
  centered?: boolean;
};

export function LoadingDots({
  size = 56,
  className,
  centered = false,
}: LoadingDotsProps) {
  return (
    <div
      className={[
        "loading-anim",
        centered && "loading-anim-centered",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ width: size, height: size }}
      aria-label="Loading"
      role="status"
    >
      <span className="loading-anim-spinner" aria-hidden="true" />
    </div>
  );
}
