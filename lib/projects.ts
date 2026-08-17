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

// Current Home carousel cards. This stays local while the new visual treatment
// is refined; `icon`, `bodyUrl`, and `actionUrl` are intentionally optional.
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

export async function getProjects(): Promise<Project[]> {
  return DEFAULT_PROJECTS;
}
