# TJG-Website

Josh Skinner's ("That Josh Guy") personal portfolio, blog, and shop — built with Next.js (App Router) in Samsung's One UI design language, using the [One UI Design Kit](https://www.figma.com/community/file/1456035621603784201/one-ui-design-kit) and `@thatjoshguy/oneui-icons`. Hosted on Vercel.

## Blog content sources

The blog is dual-sourced behind the `blog-content-source` feature flag:

- **Sanity CMS** (default) — schemas in `sanity/`, client in `lib/sanity.ts`
- **WordPress.com** (fallback) — REST client in `lib/wordpress.ts`, site selected by the `wordpress-source-url` flag

The abstraction layer in `lib/blog.ts` normalizes both into one `BlogPost` shape. See `docs/VERCEL_FLAGS_SETUP.md` for flag setup, including how to serve the College site variant from this same codebase via configuration.

## Getting Started

```bash
npm install
npm run dev        # standard dev server
npx vercel dev     # use instead for Vercel Toolbar flag overrides
npm run build      # next build --webpack
npm test           # jest
npm run audit:blog # validate migrated Sanity blog data
```

Open [http://localhost:3000](http://localhost:3000). Environment variables (Sanity, WordPress, flags) are documented in the docs below.

## Documentation

- [Vercel Flags setup](docs/VERCEL_FLAGS_SETUP.md) — all feature flags, dashboard setup, College-site config
- [CSS class naming](docs/CSS_CLASSES.md) — layout, list, and panel class names (Figma legacy renames)
- TJG Site Docs (Notion wiki) — architecture, pages reference, integrations, quirks
