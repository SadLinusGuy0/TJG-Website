# Codebase audit remediation — 5 September 2026

Implemented the fixes for the 22 findings in the [original audit](2026-09-05-codebase-audit.md). TableOfContents was removed as requested. Application changes are in the working tree; no application deployment or commit was made by this task. Existing concurrent keyboard/navigation work was preserved.

During metadata work I accidentally removed `import './blog.css'` from the blog layout. The user spotted the regression. The import was restored, desktop/mobile pages were visually checked, and a browser regression test now verifies the stylesheet and its key layout rules.

## Findings and implementation

| # | Area | Result |
|---|---|---|
| 1 | WordPress request destinations | Removed visitor-controlled source URLs. Exact HTTPS origins come from trusted server configuration; redirects are rejected and responses/deadlines are bounded. |
| 2 | Rich-content security | Added server-side allowlist sanitization, safe URL schemes and iframe hosts, escaped titles/excerpts, validated dynamic embeds and custom links. Added report-only CSP as a separate defence. |
| 3 | Keyboard access | Removed TableOfContents; comparisons now have a labelled native range input and Discord has a native join link. |
| 4 | Lightbox | Native named modal with explicit keyboard focus wrapping, Escape, arrow navigation, focus restoration, keyboard image activation, preserved alternative text, and teardown cleanup. |
| 5 | Contrast | Separate decoration, link and filled-control accent tokens. All five control palettes meet at least 4.5:1 against white labels. |
| 6 | Content semantics | Trusted iframes receive titles before SSR; meaningful image alts are retained. Heading levels/IDs are normalized while original visual heading sizes are preserved. |
| 7 | Listing payloads | Summary-only CMS projections, 12-item pages, bounded server search, abort/debounce handling and load-more. Full article bodies/SEO/search text are not serialized to listing clients. |
| 8 | CSS and homepage payload | Disabled repeated CSS inlining, scoped homepage CSS after extracting shared footer/shop rules, and replaced large inline publication SVGs with cacheable assets. |
| 9 | Corner smoothing | Replaced whole-document wildcard scans with a restricted surface selector and pending-target updates. An unrelated class change produced zero broad scans and zero computed-style reads. |
| 10 | Media loading | Lazy/async media attributes are emitted before hydration, video/audio use metadata preload, slides use image optimization, and Portable Text dimensions derive from asset dimensions/crop rather than a made-up 3:2 ratio. |
| 11 | Request waterfalls | Root flags resolve together; homepage flags gate optional work and the remaining independent data reads run concurrently. Recent posts query at most six summaries, ordered by publication date. |
| 12 | Storage resilience | Shared guarded storage reads/writes with in-memory fallback. Blocked storage no longer crashes settings or shared navigation. |
| 13 | Edition consistency | Direct WordPress lookups include tags; taxonomy failure rejects the read rather than silently treating college posts as ordinary posts. |
| 14 | Outage handling | CMS errors reach a visitor-facing retry boundary instead of becoming not-found/empty results. Search returns 503 on outage. Shop retains its external storefront when the catalogue is unavailable. |
| 15 | WordPress pagination | Shared bounded pagination uses total-page headers for posts and taxonomies, including migration scripts. Exact 100/200-item boundaries are covered. |
| 16 | Custom markers | All mixed/repeated button and counter markers render in order, retaining surrounding text. |
| 17 | Studio schemas | Correct `sanity` imports, an executable Studio configuration, separate tooling typecheck, schema compilation and the official schema validator. |
| 18 | Revalidation | Authenticated, bounded, validated payload contract handles create/update/delete and renames. Shared cache tags, homepage, lists, old/new slugs, sitemap and sections invalidate together. |
| 19 | Dependency security | Patched compatible dependencies and explicit overrides; removed unused `lottie-react`. Both full and production-only audit reports are clean. |
| 20 | Discovery/metadata | Distinct route titles, descriptions, canonicals and sharing URLs; parent no-index propagated to sections. Host-based main/college sitemaps and beta/settings crawl controls. |
| 21 | Regression coverage | Security, adapter, pagination, marker/Portable Text, webhook and browser tests. Added CI, separate script/schema checks and Dependabot. Hook rules are enabled generally with documented exceptions for named existing browser-state/animation components. |
| 22 | Portable Text FMP | Both combined and separated FMP views use normalized sections, preserving existing section slugs. Nested mixed lists and duplicate heading IDs are handled. |

Additional changes include persistent search labels, polite result announcements, programmatic category state, landmark placement for portalled controls, non-destructive CSS Highlight API search, document-relative heading geometry, reduced-motion scrolling, touch scrolling over decorative text, and guarded server data modules. Gumroad credentials now use an Authorization header. Sanity read and migration credentials are separated. See [.env.example](../../.env.example) and [Studio instructions](../../sanity/README.md).

The missing [`projects-enabled` cloud flag](https://vercel.com/tjg-website/website/flag/projects-enabled) was created atomically and verified as **Enabled** in development, preview and production, matching the existing application fallback. This was the only external configuration changed.

## Measurements

Local production builds in Chrome, same underlying CMS content and comparable page settings. Values are decoded bytes, not CDN wire-transfer measurements. CSS now lives in cacheable files rather than being repeated inside HTML.

| Metric | Before | After | Reduction |
|---|---:|---:|---:|
| College index HTML | 1,500,688 | 107,057 | 92.9% |
| College index gzip HTML | 251,232 | 15,845 | 93.7% |
| Home HTML | 504,916 | 147,323 | 70.8% |
| Home gzip HTML | 81,603 | 18,631 | 77.2% |
| Settings HTML | 376,702 | 51,577 | 86.3% |
| Home loaded Next.js JavaScript | 712,593 | 600,648 | 15.7% |

Settings JavaScript is roughly unchanged/slightly higher (581 KB → 585 KB); the largest gain there is removal of repeated inline CSS. These checks measure payloads and behaviour, not field Core Web Vitals or production load capacity. Further component splitting should be guided by profiling rather than a broad redesign.

## Verification

- Production build, ESLint, application TypeScript and tooling TypeScript checks pass.
- **75 unit tests in 13 suites pass.**
- **7 Playwright browser regression tests pass.**
- All three Sanity schemas compile. The official `sanity schema validate` command reports **0 errors, 0 warnings**.
- Full `npm audit` and `npm audit --omit=dev`: **0 vulnerabilities**.
- Automated WCAG A/AA and best-practice scans found **0 violations** on sampled Home, Settings, main/college blog indexes, Video Production, FMP and Shop pages after hydration.
- Desktop/mobile screenshots checked for Home, index, article, settings, shop and lightbox. The final mobile dialog measured exactly 390×844 inside a 390×844 viewport. No page errors or horizontal overflow on the sampled pages.
- Main/college/beta host headers produced the expected canonical and sharing URLs, robots policies and sitemaps. Cookie content previews did not alter public site identity.
- Corner smoothing enabled: unrelated class mutation generated **0 wildcard scans, 0 computed-style reads**.

Evidence: [page measurements and accessibility](2026-09-05-remediation-evidence.json), [host/crawl and smoothing contracts](2026-09-05-contract-evidence.json). Earlier audit evidence remains unchanged for comparison.

## Deployment considerations

- CSP remains **report-only**, as proposed in the audit. Existing Next.js inline bootstrap scripts need a nonce/hash policy and report review before enforcement. Content sanitization is already active independently.
- A private Sanity dataset needs a read-only `SANITY_READ_TOKEN`; the old write-capable `SANITY_API_TOKEN` is no longer consumed by the site. Migration scripts require `SANITY_MIGRATION_TOKEN` explicitly. Public dataset reads worked in the local verification.
- The local Gumroad token is unavailable, so the real product catalogue/Authorization-header request could not be exercised here. The fallback page and 503 API behaviour were verified. Header support follows [Gumroad's OAuth middleware](https://github.com/antiwork/gumroad/blob/main/app/controllers/api/v2/base_controller.rb).
- Update the remote CMS webhook projection to the documented [revalidation contract](revalidation-contract.md) when deploying, particularly for rename/delete events. The remote webhook itself was not edited or invoked against production.
- CI uses Node 24 LTS and can receive the public Sanity project ID through repository variables. The workflow is checked in; its hosted first run will occur after a push.
- Vercel CLI 59.1.3 completed the configuration repair. Upgrade the CLI with `npm i -g vercel@latest` (59.11.7 was advertised) before future deployment work.
