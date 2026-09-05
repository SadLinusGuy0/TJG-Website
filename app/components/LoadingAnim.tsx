"use client";

import { useEffect, useId, useRef } from "react";
import { CYCLE, clusterScale, dotAlpha, dots, seg } from "./oneui-spinner";

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
  const gradientId = useId();
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const rotor = svg.querySelector<SVGGElement>("[data-rotor]")!;
    const scaler = svg.querySelector<SVGGElement>("[data-scaler]")!;
    const holders = svg.querySelectorAll<SVGGElement>("[data-dot]");
    const circles = svg.querySelectorAll("circle");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameId = 0;
    let startedAt = 0;

    function draw(t: number) {
      rotor.setAttribute("transform", `rotate(${720 * t / CYCLE})`);
      scaler.setAttribute("transform", `scale(${clusterScale(t)})`);
      dots.forEach((dot, i) => {
        const value = seg(t, dot);
        const x = dot.ax === "x" ? value : 91.75;
        const y = dot.ax === "y" ? value : 91.75;
        holders[i].setAttribute("transform", `translate(${x} ${y})`);
        circles[i].setAttribute("fill-opacity", String(dotAlpha(t, dot)));
      });
    }

    function frame(now: number) {
      draw((now - startedAt) % CYCLE);
      frameId = requestAnimationFrame(frame);
    }

    function restart() {
      cancelAnimationFrame(frameId);
      draw(0);
      if (reducedMotion.matches || document.hidden) return;
      startedAt = performance.now();
      frameId = requestAnimationFrame(frame);
    }

    restart();
    reducedMotion.addEventListener("change", restart);
    document.addEventListener("visibilitychange", restart);
    return () => {
      cancelAnimationFrame(frameId);
      reducedMotion.removeEventListener("change", restart);
      document.removeEventListener("visibilitychange", restart);
    };
  }, []);

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
      <svg ref={svgRef} className="loading-anim-spinner" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
        <defs>
          {dots.map((dot, i) => (
            <linearGradient key={i} id={`${gradientId}-${i}`} gradientUnits="userSpaceOnUse"
              x1={dot.grad.x1} y1={dot.grad.y1} x2={dot.grad.x2} y2={dot.grad.y2}>
              {dot.grad.stops.map(([offset, color, opacity]) => (
                <stop key={offset} offset={offset} stopColor={color} stopOpacity={opacity} />
              ))}
            </linearGradient>
          ))}
        </defs>
        <g transform="translate(48 48) scale(0.4)">
          <g data-rotor="" transform="rotate(0)">
            <g data-scaler="" transform="scale(1)">
              <g transform="translate(-120 -120)">
                {dots.map((dot, i) => (
                  <g key={i} data-dot="" transform={`translate(${dot.ax === "x" ? seg(0, dot) : 91.75} ${dot.ax === "y" ? seg(0, dot) : 91.75})`}>
                    <g transform="translate(28.25 28.25) scale(0.95)">
                      <circle r={28} fill={`url(#${gradientId}-${i})`} />
                    </g>
                  </g>
                ))}
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
