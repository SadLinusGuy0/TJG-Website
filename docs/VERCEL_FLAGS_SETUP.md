# Vercel Flags Setup

This project uses [Vercel Flags](https://vercel.com/docs/flags) for feature flag management. The `blog-enabled` flag controls visibility of the blog in navigation.

## Quick Setup

1. **Link your project** (if not already):
   ```bash
   npx vercel link
   ```

2. **Create the flag in Vercel Dashboard**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → **Flags**
   - Click **Create Flag**
   - Name: `blog-enabled`
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

## Current Flags

| Flag | Key | Description |
|------|-----|-------------|
| Blog | `blog-enabled` | Shows/hides the blog in navigation and controls access to blog pages |

## Behavior

- **Without FLAGS env var**: Blog is enabled by default (app works before setup)
- **With FLAGS env var**: Flag value comes from Vercel Dashboard per environment
- **Flags Explorer**: Override values locally without affecting other users

## Optional: Embedded Definitions

For resilience during service outages, add to your project env vars:
```
VERCEL_EXPERIMENTAL_EMBED_FLAG_DEFINITIONS=1
```
