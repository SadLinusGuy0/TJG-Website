"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div
      className="index"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: 420,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "var(--primary)",
            fontFamily: "'One UI Sans', sans-serif",
            lineHeight: 1,
          }}
        >
          Oops
        </div>
        <p
          style={{
            color: "var(--secondary)",
            fontSize: 16,
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          Something went wrong. Try refreshing the page or head back home.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button
            onClick={reset}
            style={{
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--br-sm)",
              padding: "12px 24px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'One UI Sans', sans-serif",
            }}
          >
            Try again
          </button>
          <a
            href="/"
            style={{
              background: "var(--container-background)",
              color: "var(--primary)",
              borderRadius: "var(--br-sm)",
              padding: "12px 24px",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              fontFamily: "'One UI Sans', sans-serif",
            }}
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
