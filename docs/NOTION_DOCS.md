# Notion documentation wiki

Developer documentation for this site lives in the **TJG Site Docs** Notion wiki:
https://www.notion.so/37d59b88f2b18072b5fcc8f29814afff

The wiki home page is the central hub: it has a reading guide, quick facts, and a
callout recording the last commit each branch was documented at.

## Page map

| Page | Notion page ID |
| --- | --- |
| Wiki home (hub / index) | `37d59b88f2b18072b5fcc8f29814afff` |
| Site Overview & Architecture | `37d59b88f2b1813d8ea6d382c6082153` |
| Design System & Theming | `37d59b88f2b181ecb942de065ba3b77e` |
| Navigation & Core Components | `37d59b88f2b181478070f0b0fc4fd668` |
| Blog System (WordPress) | `37d59b88f2b181cc9484c331a16e5df2` |
| Feature Flags | `37d59b88f2b1810b841ec4c5770a4550` |
| Pages Reference | `37d59b88f2b181e4a729d26c2244d867` |
| Integrations, APIs & Environment Variables | `37d59b88f2b18174baa6c78fdd6b219a` |
| Quirks, Easter Eggs & Gotchas | `37d59b88f2b18108a3f6ff5ed6ca8ffe` |
| Beta Branch — Sanity Migration | `37d59b88f2b181658361ff7eb1891950` |

## Automated updates

`.github/workflows/update-docs.yml` runs Claude Code after every PR merged into
`main` or `beta` (and on manual dispatch). It diffs the repo against the last
documented commit recorded on the wiki home page, updates the stale wiki
sections via the Notion MCP server, then bumps the recorded commit.

### One-time setup

1. **Anthropic API key**: create one at https://console.anthropic.com and add it
   as the `ANTHROPIC_API_KEY` repository secret.
2. **Notion integration**: at https://www.notion.so/profile/integrations create an
   internal integration with read + update + insert content capabilities, then in
   Notion open the TJG Site Docs wiki → ••• → Connections → add the integration.
   Add its token as the `NOTION_TOKEN` repository secret.

### Manual / agent updates

Any agent (Claude Code session, etc.) making a significant change should also
update the affected wiki pages and the home-page callout. The same page map
above applies. Keep edits surgical: update stale sections in place rather than
regenerating whole pages, so manual edits made by humans survive.
