# Environments and site editions

This is the current source of truth for how local, beta, production, and
college relate. The Notion wiki still describes an older three-branch
WordPress setup (last updated 2026-07-05). Prefer this page when they
disagree.

## Two axes, not four sites

| Axis | Values | What it means |
| --- | --- | --- |
| Environment (git / Vercel) | local, `beta` (preview), `main` (production) | Which commit is running |
| Site edition (hostname) | normal, college | Which content and metadata to show |

The target is **two long-lived branches**, each serving **both** editions:

| Branch | Vercel target | Normal host | College host |
| --- | --- | --- | --- |
| `main` | Production | `thatjoshguy.me` | `college.thatjoshguy.me` |
| `beta` | Preview (git-branch alias) | `beta.thatjoshguy.me` | not created yet (e.g. `college.beta.thatjoshguy.me`) |
| local | `next dev` / `vercel dev` | `localhost` (defaults to beta edition) | `SITE_EDITION=college` |

`college` as a git branch should go away once its domain is moved onto
production.

Hobby Vercel already has Production / Preview / Development. Custom
Environments are not required for this split: attach two domains to the
same deployment and let the host pick the edition.

## What is live today (2026-09-05)

One Vercel project: `website` (`prj_jGosOF1It8Lq2f1K15sOBkFMcL5N`) on the
Hobby team `tjg-website`. GitHub repo `thatjoshguy67/TJG-Website`.
`vercel.json` only disables deploys for `legacy`.

| Host | Serves | Edition in HTML |
| --- | --- | --- |
| `thatjoshguy.me` | Production from `main` (`aec31c4`, 2026-08-16) | `main` |
| `beta.thatjoshguy.me` | Latest `beta` preview | `beta` (same posts as main) |
| `college.thatjoshguy.me` | Frozen `college` **branch** preview from 2026-05-16 (`48a13b5`) | none (code predates editions) |
| `website-git-beta-*.vercel.app` | Same beta deploy | falls back to `main` (host is not `beta.*`) |
| `shop.thatjoshguy.me` | Gumroad, not this Next app | — |
| `tjg.gg` | Redirects to `thatjoshguy.me` | — |

`college` is 52 commits behind `main` and has no unique commits. Beta is
35 commits ahead and 6 behind `main` — still a long-lived product branch,
not only a preview channel.

Favicons follow **Vercel env**, not edition: blue production, purple
preview, green local (`VERCEL_ENV` / `NODE_ENV`).

## What the app already does

`lib/siteEdition.ts` maps hosts:

- `thatjoshguy.me` / `www.thatjoshguy.me` → `main`
- `college.thatjoshguy.me` or `college.*` → `college`
- `beta.thatjoshguy.me` or `beta.*` → `beta`

College posts are Sanity (and WordPress fallback) rows tagged `college`.
Everyone else sees non-college posts. Local fallback is `SITE_EDITION`,
else `beta` in development and `main` in production.

`beta` is still modeled as a **third edition**, not as “preview of both
sites.” Under the target table above, edition should be `normal | college`
and environment should be local / beta / production.

The `beta` branch is ahead here: cookie `ff-blog-content-edition` can
preview college content without a second host, and beta/preview is noindexed.

## Remaining work

1. In Vercel, move `college.thatjoshguy.me` off the `college` git branch
   and attach it to **Production** (same deployment as `thatjoshguy.me`).
2. Add a college-on-beta domain on the `beta` branch alias, e.g.
   `college.beta.thatjoshguy.me` (the current `startsWith('college.')`
   check would already treat that as college).
3. Disable deploys for `college` in `vercel.json` (same as `legacy`), then
   archive the branch.
4. Split edition vs environment in code; promote the beta-branch cookie
   override onto `main` if you still want a local preview without extra
   hosts.
5. Set `SITE_EDITION` (or equivalent) for `*.vercel.app` URLs if those
   need a default; generated hosts will not match `beta.*` / `college.*`.
6. Merge `beta` → `main` on a cadence so production runs the unified code.
7. Refresh the Notion wiki (see `docs/NOTION_DOCS.md`). It still lists
   college as a WordPress/git-branch variant and main as WordPress-only.

## Local development

```bash
npm install
npm run dev              # SITE_EDITION defaults to beta
SITE_EDITION=college npm run dev
SITE_EDITION=main npm run dev
npx vercel dev           # needed for Vercel Toolbar flag overrides
```

Flags and secrets: `npx vercel env pull` into `.env.local`. See
`docs/VERCEL_FLAGS_SETUP.md`. WordPress `wordpress-source-url` is a
fallback CMS switch, not how college is selected anymore.
