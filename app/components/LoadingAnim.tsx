"use client";

import Lottie from "lottie-react";
import circleProgressData from "../../public/animations/oneui-spinner.json";

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
      <Lottie
        animationData={circleProgressData}
        loop
        autoplay
        style={{ width: size, height: size }}
      />
    </div>
  );
}
