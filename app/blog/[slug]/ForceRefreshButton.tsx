"use client";

import { Refresh } from "@thatjoshguy/oneui-icons";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function ForceRefreshButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = (e.clientX - centerX) / (rect.width / 2);
    const offsetY = (e.clientY - centerY) / (rect.height / 2);
    const maxMovement = 6;
    setMousePosition({ x: offsetX * maxMovement, y: offsetY * maxMovement });
  };

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/revalidate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      disabled={loading}
      className="top-app-bar-icon"
      aria-label="Refresh blog post"
      title="Refresh blog post"
      style={{
        border: "none",
        cursor: loading ? "wait" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: loading ? 0.5 : 1,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setMousePosition({ x: 0, y: 0 });
      }}
    >
      <div
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          transition: isHovering ? "transform 0.1s ease-out" : "transform 0.3s ease-out",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Refresh
          size={20}
          color="var(--primary)"
          style={{
            animation: loading ? "postHeroRefreshSpin 0.8s linear infinite" : undefined,
          }}
        />
      </div>
    </button>
  );
}
