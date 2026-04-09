"use client";
import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "discordPopupDismissed";
const DISCORD_URL = "https://discord.gg/dRhJ78YH6M";
const SHOW_DELAY = 3000;

export default function DiscordPopup() {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }

    const timer = setTimeout(() => {
      setAnimating(true);
      requestAnimationFrame(() => setVisible(true));
    }, SHOW_DELAY);

    return () => clearTimeout(timer);
  }, []);

  const dismiss = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setTimeout(() => setAnimating(false), 340);
  }, []);

  const handleJoin = useCallback(() => {
    window.open(DISCORD_URL, "_blank", "noopener,noreferrer");
    dismiss();
  }, [dismiss]);

  if (!animating) return null;

  return (
    <div
      className={`discord-banner ${visible ? "discord-banner-visible" : ""}`}
      role="dialog"
      aria-label="Join the TJG Discord server"
      onClick={handleJoin}
    >
      <div className="discord-banner-icon">
        <svg width="28" height="28" viewBox="0 0 127.14 96.36" fill="currentColor">
          <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
        </svg>
      </div>

      <span className="discord-banner-text">Join the TJG Discord server</span>

      <button
        className="discord-banner-close"
        onClick={dismiss}
        aria-label="Dismiss"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M13 5L5 13M5 5l8 8"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
