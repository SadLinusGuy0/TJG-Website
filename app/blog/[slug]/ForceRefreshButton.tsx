"use client";

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
      aria-label="Force refresh from WordPress"
      title="Force refresh from WordPress"
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
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            animation: loading ? "spin 0.8s linear infinite" : undefined,
          }}
        >
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 4.75C8.27208 4.75 5.25 7.77208 5.25 11.5C5.25 12.4797 5.46089 13.409 5.83987 14.2468C6.05823 14.7222 5.84603 15.2815 5.37065 15.4998C4.89527 15.7182 4.33596 15.506 4.1176 15.0306C3.62048 13.9542 3.375 12.7568 3.375 11.5C3.375 6.73451 7.23451 2.875 12 2.875C14.2584 2.875 16.3152 3.73425 17.8664 5.15604L19.0027 3.97944C19.3539 3.61918 19.9381 3.89684 19.9381 4.40027V8.43973C19.9381 8.75279 19.6909 9 19.3778 9H15.3383C14.8349 9 14.5573 8.41579 14.9174 8.0648L16.2186 6.8147C15.0275 5.67093 13.5977 4.75 12 4.75ZM18.6301 8.50017C18.1548 8.71853 17.5954 8.50633 17.3771 8.03095C17.1587 7.55557 16.9466 7.34335 16.9466 7.34335L18.6301 8.50017ZM4.06189 15C4.06189 14.6869 4.30909 14.4397 4.62215 14.4397H8.66161C9.165 14.4397 9.44264 15.0239 9.08254 15.375L7.7814 16.6251C8.97254 17.7689 10.4023 18.6897 12 18.6897C15.7279 18.6897 18.75 15.6676 18.75 11.9397C18.75 10.9601 18.5391 10.0308 18.1601 9.19295C17.9418 8.71757 18.154 8.15826 18.6293 7.9399C19.1047 7.72154 19.664 7.93374 19.8824 8.40912C20.3795 9.48554 20.625 10.683 20.625 11.9397C20.625 16.7052 16.7655 20.5647 12 20.5647C9.74164 20.5647 7.6848 19.7054 6.13364 18.2837L4.99729 19.4603C4.64612 19.8205 4.06189 19.5429 4.06189 19.0394V15Z"
            fill="var(--primary)"
          />
        </svg>
      </div>
    </button>
  );
}
