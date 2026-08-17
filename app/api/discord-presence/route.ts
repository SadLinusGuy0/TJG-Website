import { getDiscordPresence } from "../../../lib/discord-presence";

export const dynamic = "force-dynamic";

export async function GET() {
  const presence = await getDiscordPresence();
  return Response.json(presence, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
