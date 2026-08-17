export type DiscordActivityKind =
  | "spotify"
  | "playing"
  | "streaming"
  | "listening"
  | "watching"
  | "competing"
  | "active"
  | "offline";

export interface DiscordPresence {
  active: boolean;
  kind: DiscordActivityKind;
  label: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  href: string | null;
}

interface LanyardActivity {
  application_id?: string;
  assets?: { large_image?: string };
  details?: string;
  name?: string;
  state?: string;
  type?: number;
  url?: string;
}

interface LanyardData {
  activities?: LanyardActivity[];
  discord_status?: string;
  spotify?: {
    album_art_url?: string;
    artist?: string;
    song?: string;
    track_id?: string;
  } | null;
}

export const INACTIVE_DISCORD_PRESENCE: DiscordPresence = {
  active: false,
  kind: "offline",
  label: "Right now",
  title: "Not active right now",
  subtitle: "Probably writing, designing, or asleep.",
  imageUrl: null,
  href: null,
};

const ACTIVITY_LABELS: Record<number, { label: string; kind: DiscordActivityKind }> = {
  0: { label: "Playing", kind: "playing" },
  1: { label: "Streaming", kind: "streaming" },
  2: { label: "Listening to", kind: "listening" },
  3: { label: "Watching", kind: "watching" },
  5: { label: "Competing in", kind: "competing" },
};

const ALLOWED_IMAGE_HOSTS = new Set([
  "cdn.discordapp.com",
  "media.discordapp.net",
  "i.scdn.co",
]);

function safeUrl(value: string | undefined, allowedHosts?: Set<string>): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    if (allowedHosts && !allowedHosts.has(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function activityArtwork(activity: LanyardActivity): string | null {
  const image = activity.assets?.large_image;
  if (!image) return null;

  if (image.startsWith("spotify:")) {
    return safeUrl(`https://i.scdn.co/image/${image.slice("spotify:".length)}`, ALLOWED_IMAGE_HOSTS);
  }

  if (image.startsWith("mp:external/")) {
    return safeUrl(`https://media.discordapp.net/external/${image.slice("mp:external/".length)}`, ALLOWED_IMAGE_HOSTS);
  }

  if (activity.application_id && /^[a-zA-Z0-9_]+$/.test(image)) {
    return safeUrl(
      `https://cdn.discordapp.com/app-assets/${activity.application_id}/${image}.png`,
      ALLOWED_IMAGE_HOSTS,
    );
  }

  return safeUrl(image, ALLOWED_IMAGE_HOSTS);
}

export function normalizeDiscordPresence(data: LanyardData): DiscordPresence {
  if (data.spotify?.song) {
    const href = data.spotify.track_id
      ? safeUrl(`https://open.spotify.com/track/${data.spotify.track_id}`)
      : null;

    return {
      active: true,
      kind: "spotify",
      label: "Listening to",
      title: data.spotify.song,
      subtitle: data.spotify.artist || null,
      imageUrl: safeUrl(data.spotify.album_art_url, ALLOWED_IMAGE_HOSTS),
      href,
    };
  }

  const activity = data.activities?.find(
    (item) => item.type !== 4 && item.name && item.name !== "Spotify",
  );

  if (!activity?.name || data.discord_status === "offline") {
    return INACTIVE_DISCORD_PRESENCE;
  }

  const descriptor = ACTIVITY_LABELS[activity.type ?? -1] ?? {
    label: "Active on Discord",
    kind: "active" as const,
  };

  return {
    active: true,
    kind: descriptor.kind,
    label: descriptor.label,
    title: activity.name,
    subtitle: activity.details || activity.state || null,
    imageUrl: activityArtwork(activity),
    href: activity.type === 1 ? safeUrl(activity.url) : null,
  };
}

export async function getDiscordPresence(): Promise<DiscordPresence> {
  const userId = process.env.DISCORD_USER_ID || "1096693785137795162";

  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return INACTIVE_DISCORD_PRESENCE;

    const payload = (await response.json()) as { success?: boolean; data?: LanyardData };
    if (!payload.success || !payload.data) return INACTIVE_DISCORD_PRESENCE;
    return normalizeDiscordPresence(payload.data);
  } catch {
    return INACTIVE_DISCORD_PRESENCE;
  }
}
