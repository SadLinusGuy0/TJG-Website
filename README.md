# TJG-Website

Josh Skinner's ("That Josh Guy") personal portfolio, blog, and shop — built with Next.js (App Router) in Samsung's One UI design language, using the [One UI Design Kit](https://www.figma.com/community/file/1456035621603784201/one-ui-design-kit) and `@thatjoshguy/oneui-icons`. Hosted on Vercel.

## Blog content sources

The blog is dual-sourced behind the `blog-content-source` feature flag:

- **Sanity CMS** (default) — schemas in `sanity/`, client in `lib/sanity.ts`
- **WordPress.com** (fallback) — REST client in `lib/wordpress.ts`, site selected by trusted server configuration (`WORDPRESS_SOURCE_URL` or the cloud flag; exact HTTPS origins only)

The abstraction layer in `lib/blog.ts` normalizes both into `BlogPost` details and bounded `BlogSummary` pages. See `docs/VERCEL_FLAGS_SETUP.md` for flag setup, including how to serve the College site variant from this same codebase via configuration.

## Getting Started

### Site editions

The request hostname selects the site edition while every edition uses the same
codebase and Sanity dataset:

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

- [Vercel Flags setup](docs/VERCEL_FLAGS_SETUP.md) — all feature flags, dashboard setup, College-site config
- [CSS class naming](docs/CSS_CLASSES.md) — layout, list, and panel class names (Figma legacy renames)
- TJG Site Docs (Notion wiki) — architecture, pages reference, integrations, quirks

## Audit fixes and verification

Use Node.js 24 LTS for development and CI (`.nvmrc`). Start with [.env.example](.env.example), or pull the linked Vercel environment. Public Sanity reads need no token; a private dataset requires `SANITY_READ_TOKEN` with read-only access. The migration script uses a separate `SANITY_MIGRATION_TOKEN` and is never run by CI.

```sh
npm run lint
npm run test:lint
npm run typecheck
npm run typecheck:tooling
npm run test:schemas
npm test -- --runInBand
npm run build
npm run test:browser
npm audit
npm audit --omit=dev
```

Browser checks use Chrome locally and Playwright Chromium in CI. Run `npx playwright install chromium` if needed; the GitHub Actions workflow installs it automatically. The smoke suite exercises the app without required secrets; configure the public `NEXT_PUBLIC_SANITY_PROJECT_ID` repository variable to also render real CMS listings in CI. Rich-media fixtures use the actual production components with routing/image-service adapters and no production test routes.

See the [remediation report](docs/audits/2026-09-05-remediation.md), [webhook contract](docs/audits/revalidation-contract.md), and [Studio instructions](sanity/README.md). TableOfContents has been removed; in-post heading navigation remains available in the reading controls.

### Compiler and lint compatibility

`typecheck` uses TypeScript 7.0.2 through the `@typescript/native` npm alias (`tsc`). The build runs that check before Next.js. The `typescript` alias supplies Microsoft's `@typescript/typescript6` compatibility API for tools such as typescript-eslint; Next's own additional build check currently resolves this compatibility compiler too. This follows the [official side-by-side setup](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0); keep both aliases when updating packages.

ESLint 10 uses `@eslint/compat` to preserve the existing React, import and accessibility rules. Their ESLint peer dependencies are narrowly overridden because those releases still declare support only through ESLint 9. The TypeScript ESLint parser replaces Next's bundled Babel parser, whose scope API is incompatible with ESLint 10. `test:lint` checks that deliberate React/accessibility/import mistakes are still reported in both JavaScript and TypeScript. Remove these bridges when the upstream plugins and parser support ESLint 10 directly.
