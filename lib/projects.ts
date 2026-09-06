import 'server-only';
import { createClient } from '@vercel/edge-config';
import { safeContentHref } from './contentUrls';

export type ProjectTone = "light" | "dark";
export type ProjectAction = "link" | "copy-current-url";
export type ProjectActionIcon = "download" | "open" | "link";

export interface Project {
  title: string;
  thumbnail: string;
  description: string;
  bodyUrl?: string;
  actionUrl?: string;
  icon?: string;
  tone: ProjectTone;
  action: ProjectAction;
  actionIcon: ProjectActionIcon;
}

// Offline/outage fallback only. The Edge Config `projects` array is authoritative,
// including its order and an intentionally empty list.
export const DEFAULT_PROJECTS: Project[] = [
  {
    title: "Twidget",
    thumbnail: "/images/home/projects/twidget-card.png",
    icon: "/images/home/projects/twidget-icon.png",
    description:
      "Twitter/X analytics app with pretty widgets and a clean One UI design.",
    bodyUrl: "https://github.com/thatjoshguy67/twidget",
    actionUrl: "https://github.com/thatjoshguy67/twidget/releases",
    tone: "light",
    action: "link",
    actionIcon: "download",
  },
  {
    title: "Blur widget demo",
    thumbnail: "/images/home/projects/blur-widget-card.png",
    icon: "/images/home/projects/blur-widget-icon.png",
    description: "POC of One UI Home’s widget blur capabilities.",
    bodyUrl: "https://github.com/thatjoshguy67/blur-widget-demo",
    actionUrl: "https://github.com/thatjoshguy67/blur-widget-demo/releases",
    tone: "dark",
    action: "link",
    actionIcon: "download",
  },
  {
    title: "One UI Design Kit",
    thumbnail: "/images/home/projects/one-ui-design-kit-card.png",
    description: "Library of One UI components, icons, assets and more.",
    bodyUrl: "https://www.figma.com/community/file/1456035621603784201/one-ui-design-kit",
    actionUrl: "https://www.figma.com/community/file/1456035621603784201/one-ui-design-kit",
    tone: "dark",
    action: "link",
    actionIcon: "open",
  },
  {
    title: "This website",
    thumbnail: "/images/home/projects/twidget-card.png",
    description: "The very thing you’re looking at right now.",
    tone: "light",
    action: "copy-current-url",
    actionIcon: "link",
  },
];

function projectFromConfig(value: unknown): Project | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  if (item.enabled === false) return null;
  if (typeof item.title !== 'string' || !item.title.trim() ||
      typeof item.thumbnail !== 'string') return null;

  const thumbnail = safeContentHref(item.thumbnail, true);
  if (!thumbnail || thumbnail.startsWith('#')) return null;
  const description = item.description ?? item.tag ?? '';
  if (typeof description !== 'string') return null;
  const tone = item.tone ?? 'dark';
  const action = item.action ?? 'link';
  const actionIcon = item.actionIcon ?? (action === 'copy-current-url' ? 'link' : 'open');
  if (tone !== 'light' && tone !== 'dark') return null;
  if (action !== 'link' && action !== 'copy-current-url') return null;
  if (actionIcon !== 'download' && actionIcon !== 'open' && actionIcon !== 'link') return null;

  const bodyValue = item.bodyUrl ?? item.url;
  const actionValue = item.actionUrl ?? bodyValue;
  const bodyUrl = typeof bodyValue === 'string' ? safeContentHref(bodyValue) : '';
  const actionUrl = typeof actionValue === 'string' ? safeContentHref(actionValue) : '';
  if (action === 'link' && !actionUrl) return null;
  const icon = typeof item.icon === 'string' ? safeContentHref(item.icon, true) : '';

  return {
    title: item.title.trim(), thumbnail, description, tone, action, actionIcon,
    ...(bodyUrl ? { bodyUrl } : {}),
    ...(actionUrl ? { actionUrl } : {}),
    ...(icon && !icon.startsWith('#') ? { icon } : {}),
  };
}

export async function getProjects(): Promise<Project[]> {
  const connectionString = process.env.EDGE_CONFIG;
  if (!connectionString) return DEFAULT_PROJECTS;

  try {
    // Do not persist this read in Next's Data Cache: edits must work without a deploy.
    const value = await createClient(connectionString, { cache: 'no-store' }).get('projects');
    if (!Array.isArray(value)) return DEFAULT_PROJECTS;
    return value.map(projectFromConfig).filter((project): project is Project => project !== null);
  } catch {
    return DEFAULT_PROJECTS;
  }
}
