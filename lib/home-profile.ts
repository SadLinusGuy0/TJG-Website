import { createClient } from "@vercel/edge-config";

export type ProfileFactIcon = "phone" | "game" | "f1";

export interface ProfileFact {
  label: string;
  value: string;
  icon: ProfileFactIcon;
}

export const DEFAULT_PROFILE_FACTS: ProfileFact[] = [
  { label: "Current phone", value: "Galaxy Z Fold8", icon: "phone" },
  { label: "Favourite video game", value: "Persona 3 Reload", icon: "game" },
  { label: "Favourite Formula 1 driver", value: "Lewis Hamilton", icon: "f1" },
];

function isProfileFact(value: unknown): value is ProfileFact {
  if (!value || typeof value !== "object") return false;

  const fact = value as Partial<ProfileFact>;
  return (
    typeof fact.label === "string" &&
    typeof fact.value === "string" &&
    (fact.icon === "phone" || fact.icon === "game" || fact.icon === "f1")
  );
}

export async function getHomeProfileFacts(): Promise<ProfileFact[]> {
  const connectionString = process.env.EDGE_CONFIG;
  if (!connectionString) return DEFAULT_PROFILE_FACTS;

  try {
    const value = await createClient(connectionString).get("home-profile-facts");
    if (!Array.isArray(value)) return DEFAULT_PROFILE_FACTS;

    const facts = (value as unknown[]).filter(isProfileFact);
    return facts.length === 3 ? facts : DEFAULT_PROFILE_FACTS;
  } catch {
    return DEFAULT_PROFILE_FACTS;
  }
}
