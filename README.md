# TJG-Website

Josh Skinner's ("That Josh Guy") personal portfolio, blog, and shop — built with Next.js (App Router) in Samsung's One UI design language, using the [One UI Design Kit](https://www.figma.com/community/file/1456035621603784201/one-ui-design-kit) and `@thatjoshguy/oneui-icons`. Hosted on Vercel.

## Blog content sources

The blog is dual-sourced behind the `blog-content-source` feature flag:

- **Sanity CMS** (default) — schemas in `sanity/`, client in `lib/sanity.ts`
- **WordPress.com** (fallback) — REST client in `lib/wordpress.ts`, site selected by the `wordpress-source-url` flag

The abstraction layer in `lib/blog.ts` normalizes both into one `BlogPost` shape. See `docs/VERCEL_FLAGS_SETUP.md` for flags. College vs main is a hostname split, not a CMS flag — see `docs/ENVIRONMENTS.md`.

## Getting Started

### Site editions

The request hostname selects the site edition while every edition uses the same
codebase and Sanity dataset. The intended Vercel layout is two branches
(`main` / `beta`), each serving a normal host and a college host. Live domain
wiring still has college on its own git branch; details and remaining work
are in [docs/ENVIRONMENTS.md](docs/ENVIRONMENTS.md).

- `thatjoshguy.me` → `main`
- `college.thatjoshguy.me` → `college`
- `beta.thatjoshguy.me` → `beta`

Posts tagged `college` are visible only on the college edition. All other posts
are visible only on main and beta. For local development or Vercel-generated
URLs, set the server-side `SITE_EDITION` environment variable to `main`,
`college`, or `beta`; local development defaults to `beta`.

```bash
npm install
npm run dev        # standard dev server
npx vercel dev     # use instead for Vercel Toolbar flag overrides
npm run build      # next build
npm test           # jest
npm run audit:blog # validate migrated Sanity blog data
```

Open [http://localhost:3000](http://localhost:3000). Environment variables (Sanity, WordPress, flags) are documented in the docs below.

## Documentation

- [Environments and site editions](docs/ENVIRONMENTS.md) — local, beta, main, college (current vs target)
- [Vercel Flags setup](docs/VERCEL_FLAGS_SETUP.md) — all feature flags, dashboard setup
- [CSS class naming](docs/CSS_CLASSES.md) — layout, list, and panel class names (Figma legacy renames)
- TJG Site Docs (Notion wiki) — architecture, pages reference, integrations, quirks (stale as of 2026-07-05; see `docs/NOTION_DOCS.md`)
