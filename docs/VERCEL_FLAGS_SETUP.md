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

| Flag | Key | Description |
|------|-----|-------------|
| Blog | `blog-enabled` | Shows/hides the blog in navigation and controls access to blog pages |
| Popular Stories | `popular-stories-enabled` | Shows/hides the Popular Stories section on the home page |
| Featured Stories | `featured-stories` | Content for the Popular Stories section – JSON array of `{ title, thumbnail, site, url }` |

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
