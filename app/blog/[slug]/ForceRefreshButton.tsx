"use client";

import { Refresh } from "@thatjoshguy/oneui-icons";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ForceRefreshButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="top-app-bar-icon"
      aria-label="Refresh blog post"
      title="Refresh content"
      style={{
        cursor: loading ? "wait" : "pointer",
        opacity: loading ? 0.5 : 1,
      }}
    >
      <div
        style={{
          animation: loading ? "postHeroRefreshSpin 0.8s linear infinite" : undefined,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Refresh
          color="var(--primary)"
        />
      </div>
    </button>
  );
}
