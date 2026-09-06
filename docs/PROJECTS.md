# Editing the Projects carousel

Open the `featured-stories` Edge Config store in the `tjg-website` Vercel team,
then edit the **`projects`** key. The store name is historical; it contains both
Popular Stories and Projects. Save the JSON and reload the homepage after
propagation (normally a few seconds). No commit, redeploy or webhook is needed.
The same list serves main, college and both beta mirrors. Array order is display
order; `enabled: false` hides a card without deleting it, and `[]` hides all cards.

Example entry:

```json
{
  "title": "My new project",
  "description": "A short description of what it does.",
  "thumbnail": "https://your-image-host.example/project.png",
  "icon": "https://your-image-host.example/icon.png",
  "bodyUrl": "https://example.com/project",
  "actionUrl": "https://example.com/project/download",
  "tone": "dark",
  "action": "link",
  "actionIcon": "download"
}
```

`title` and `thumbnail` are required. A link card also needs `actionUrl`,
`bodyUrl`, or legacy `url` (in that priority). Description defaults to empty;
legacy `tag` is accepted as its fallback. `icon` and `bodyUrl` are optional.
`tone` is `light` or `dark` (default). `action` is `link` (default) or
`copy-current-url`, which needs no destination. `actionIcon` is `download`,
`open` (default for links) or `link` (default for copy). New entries need no ID.

Images accept existing `/images/...` paths or public HTTPS URLs. Local images
remain optimized. External project images load directly so adding an image host
doesn't require changing Next's image allowlist; upload appropriately sized,
compressed images (approximately 852×604 for cards and 80×80 for icons).
Adding a *new local file* still requires a code deployment; use hosted images
for a workflow entirely in Edge Config. Keep connection tokens private.

`lib/projects.ts` reads the key server-side with `cache: 'no-store'`. Changes
appear on subsequent page requests after Edge Config propagation, not by live
updates to already-open tabs. The local four-card list is only an offline/outage
fallback when the connection or entire configuration is unavailable. Invalid or
disabled entries are skipped; valid entries aren't merged with local defaults.

On 6 September 2026 the four redesigned cards (Twidget, Blur widget demo, One UI
Design Kit, This website) were copied into Edge Config. The older WhatsApp You,
YouTube Music Redesign and Better Twitter concepts remain there, disabled.
