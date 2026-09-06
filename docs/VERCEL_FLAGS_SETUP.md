# Vercel Flags Setup

This project uses [Vercel Flags](https://vercel.com/docs/flags) for feature flag management.

## Quick Setup

1. **Link your project** (if not already):
   ```bash
   npx vercel link
   ```

2. **Create the flag in Vercel Dashboard**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → **Flags**
   - Click **Create Flag**
   - Name: `blog-enabled` (or `popular-stories-enabled` for the Popular Stories section)
   - Type: **Boolean**
   - Configure per environment (Development: on, Preview/Production: as needed)

3. **Pull environment variables**:
   ```bash
   npx vercel env pull
   ```
   This adds the `FLAGS` SDK key to `.env.local`.

4. **Optional: Flags Explorer** (override flags during development):
   - Install Vercel Toolbar: `npm i vercel`
   - Run with toolbar: `npx vercel dev`
   - Create `FLAGS_SECRET` in Flags Explorer onboarding (or add manually in project env vars)
   - **Important**: `FLAGS_SECRET` is required for toolbar overrides to work. Without it, forcing a flag in the toolbar won't affect the app.

## Current Flags

All definitions live in `flags.ts`; each has a getter in `lib/get*Flag.ts` that resolves cookie override → Vercel value → default.

| Flag | Key | Type | Default | Description |
|------|-----|------|---------|-------------|
| Blog | `blog-enabled` | Boolean | on | Shows/hides the blog in navigation and controls access to blog pages |
| Popular Stories | `popular-stories-enabled` | Boolean | on | Shows/hides the Popular Stories section on the home page |
| Projects | `projects-enabled` | Boolean | on | Show the Projects section from Edge Config |
| Misc section | `misc-section-enabled` | Boolean | on | Show the Misc section on the Home page |
| Recent Blog Posts | `recent-blog-posts-enabled` | Boolean | on | Show the Recent Blog Posts carousel on the Home page |
| In-post search bar | `in-post-search-bar-enabled` | Boolean | off | Show the search bar on every blog post |
| In-post search bar (FMP) | `in-post-search-bar-fmp-enabled` | Boolean | on | Show the search bar on the FMP post only |
| Corner smoothing | `corner-smoothing-enabled` | Boolean | off | Show the corner smoothing (squircle) toggle in Settings |
| FMP view toggle | `fmp-separated-view-enabled` | Boolean | off | Show the FMP separated/combined view toggle in Settings |
| Blog content source | `blog-content-source` | String | `sanity` | Which CMS backend serves the blog: `sanity` or `wordpress` |
| WordPress source URL | `wordpress-source-url` | String | `https://tjg8.wordpress.com` | WordPress site used when the source is `wordpress` |

Removed flags — delete these from the Vercel Dashboard if they still exist there:

- `merged-work-carousel-enabled` (replaced by Projects)
- `liquid-glass-enabled` (feature removed)
- `year-slider-enabled` (YearSlider UI removed; recent posts always merge year-1/year-2)

## Editions and deployment environments

College is selected by hostname (`college.thatjoshguy.me` and
`college.beta.thatjoshguy.me`), not by a CMS flag or a separate branch.
Both editions use Sanity by default and filter posts by the `college` tag.
`SITE_EDITION=normal|college` supplies a default for localhost/generated URLs.

`blog-content-source` and `wordpress-source-url` choose the fallback CMS only.
The browser-local `ff-blog-content-edition` override previews content without
changing hostname identity or canonical URLs. Vercel flag values should be
configured separately for Production, Preview and Development.

See [Environments and site editions](ENVIRONMENTS.md) for domain mapping,
shared-data boundaries and release verification.

## Behavior

- **Without FLAGS env var**: All flags use default values (app works before setup)
- **With FLAGS env var**: Flag value comes from Vercel Dashboard per environment
- **Flags Explorer**: Override values locally without affecting other users

## Troubleshooting: Toolbar overrides not working

If forcing a flag in the Vercel Toolbar doesn't change the app:

1. **Create the flag in Vercel Dashboard** – Go to Project → Flags → Create Flag. Add `popular-stories-enabled` (Boolean). The toolbar shows flags from your code, but the flag must exist in the project for overrides to apply correctly.

2. **Set FLAGS_SECRET** – Toolbar overrides are stored in a cookie. For the SDK to read them, `FLAGS_SECRET` must be set in your project env vars. Create it in Flags Explorer onboarding or add it manually.

3. **Use `vercel dev`** – Run `npx vercel dev` (not `npm run dev`) so the toolbar can inject overrides.

4. **Hard refresh** – After changing an override, do a full refresh (Cmd+Shift+R) so the new cookie is sent with the request.

## Optional: Embedded Definitions

For resilience during service outages, add to your project env vars:
```
VERCEL_EXPERIMENTAL_EMBED_FLAG_DEFINITIONS=1
```
