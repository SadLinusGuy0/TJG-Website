"use client";

import { useEffect, useState } from "react";
import { Discord, Game, Music, Open, Spotify, Video } from "@thatjoshguy/oneui-icons";
import {
  INACTIVE_DISCORD_PRESENCE,
  type DiscordPresence,
} from "../../lib/discord-presence";

function ActivityIcon({ presence }: { presence: DiscordPresence }) {
  const props = { size: 26, color: "currentColor" };

  if (presence.kind === "spotify" || presence.kind === "listening") return <Music {...props} />;
  if (presence.kind === "watching" || presence.kind === "streaming") return <Video {...props} />;
  if (presence.kind === "playing" || presence.kind === "competing") return <Game {...props} />;
  return <Discord {...props} />;
}

function ServiceIcon({ presence }: { presence: DiscordPresence }) {
  if (presence.kind === "spotify") return <Spotify size={17} color="currentColor" />;
  return <Discord size={17} color="currentColor" />;
}

export default function DiscordActivityCard() {
  const [presence, setPresence] = useState<DiscordPresence>(INACTIVE_DISCORD_PRESENCE);

  useEffect(() => {
    let active = true;

    const refresh = async () => {
      try {
        const response = await fetch("/api/discord-presence", { cache: "no-store" });
        if (!response.ok) return;
        const nextPresence = (await response.json()) as DiscordPresence;
        if (active) setPresence(nextPresence);
      } catch {
        // Retain the last known state if a refresh is temporarily unavailable.
      }
    };

    void refresh();
    const interval = window.setInterval(refresh, 30_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const content = (
    <>
      <span
        className={`discord-activity-art${presence.imageUrl ? " has-image" : ""}`}
        style={presence.imageUrl ? { backgroundImage: `url(${presence.imageUrl})` } : undefined}
        aria-hidden="true"
      >
        {!presence.imageUrl && <ActivityIcon presence={presence} />}
      </span>
      <span className="discord-activity-copy">
        <span className="discord-activity-label">{presence.label}</span>
        <span className="discord-activity-title">{presence.title}</span>
        {presence.subtitle && (
          <span className="discord-activity-subtitle">
            {presence.active && <ServiceIcon presence={presence} />}
            {presence.subtitle}
          </span>
        )}
      </span>
      {presence.href && <Open className="discord-activity-open" size={24} color="currentColor" />}
    </>
  );

  if (presence.href) {
    return (
      <a
        className="discord-activity-card"
        href={presence.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-live="polite"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="discord-activity-card" aria-live="polite">
      {content}
    </div>
  );
}
