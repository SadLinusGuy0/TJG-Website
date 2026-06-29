import { createClient } from "@vercel/edge-config";

export interface Project {
  title: string;
  thumbnail: string;
  tag: string;
  url: string;
}

// Current Home carousel cards. Used as a safety fallback when Edge Config
// has no `projects` key yet (or EDGE_CONFIG is unset). Edit live contents
// from TJG-Admin → Stories → Projects.
export const DEFAULT_PROJECTS: Project[] = [
  {
    title: "One UI Design Kit",
    thumbnail: "/images/projects/oneuialt.png",
    tag: "UI Kit",
    url: "/work/oneui-design-kit",
  },
  {
    title: "WhatsApp You",
    thumbnail: "/images/projects/whatsapp.png",
    tag: "Concept",
    url: "https://youtu.be/RCb5AaginpM",
  },
  {
    title: "YouTube Music Redesign",
    thumbnail: "/images/projects/youtube-music.png",
    tag: "Concept",
    url: "https://youtu.be/s3JQj6HCIwk",
  },
  {
    title: "Better Twitter",
    thumbnail: "/images/projects/twitter-remake.png",
    tag: "Concept",
    url: "https://youtu.be/4QKPQKkJf3k",
  },
];

function isValidProject(obj: unknown): obj is Project {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as Project).title === "string" &&
    typeof (obj as Project).thumbnail === "string" &&
    typeof (obj as Project).tag === "string" &&
    typeof (obj as Project).url === "string"
  );
}

export async function getProjects(): Promise<Project[]> {
  const connectionString = process.env.EDGE_CONFIG;
  if (!connectionString) return DEFAULT_PROJECTS;

  try {
    const client = createClient(connectionString);
    const value = await client.get("projects");

    if (Array.isArray(value)) {
      return (value as unknown[]).filter(isValidProject);
    }

    return DEFAULT_PROJECTS;
  } catch {
    return DEFAULT_PROJECTS;
  }
}
