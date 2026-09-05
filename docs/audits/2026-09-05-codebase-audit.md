# Codebase audit — 5 September 2026

The highest priorities are an unauthenticated server-side request forgery path, unsanitized CMS HTML that executes JavaScript, keyboard accessibility failures, and oversized blog payloads. The application builds successfully and its existing checks pass, but those checks do not cover the reproduced failures below.

This report records **22 actionable findings**, followed by smaller improvements. P1 means fix first; P2 means address in the next improvement cycle. Priorities reflect impact in this application, rather than automatically adopting dependency scanner severity.

## Scope and verification

Reviewed the App Router routes and layouts, both content adapters, rich-content rendering and enhancement, shared navigation and theme state, feature flags, shop integration, webhook, styles, dependency configuration, schemas, migration script, and existing tests.

Checks performed:

- `npm test -- --runInBand`: **7 suites / 30 tests passed**.
- `npm run lint`: **passed**.
- `npm run build`: **passed**, including TypeScript. All UI routes were reported as dynamically rendered; the Gumroad API route was prerendered with one-hour revalidation.
- `npm audit --json`: **7 affected package entries: 4 high, 3 moderate**.
- `npm audit --omit=dev --json`: **3 entries: 1 high, 2 moderate**. See finding 19 for exposure and duplicate attribution.
- Production build served locally, inspected in isolated headless Chrome at 1440×1000 and 390×844. Visually inspected the mobile home page and a college post.
- axe-core checks across home, blog, contact, shop, settings, flags, college blog, a college article, and synthetic content. Also checked all five accents in light and dark themes on the article.
- Harmless local WordPress fixture used to verify server-side URL injection, HTML script execution, and edition filtering. No production content was modified and no internal production services were probed.
- Synthetic storage-denial test, lightbox focus check, and server rendering of multiple button placeholders.

**Snapshot caveat:** the shared checkout changed during the audit. A recorded intermediate HEAD was `11b495f`; it later advanced to `7c5b3ca`. Concurrent changes included post search preferences and mobile search positioning. Browser measurements describe the production build created during this audit, not a frozen final commit. Relevant source findings were checked against the observed edits; no layout finding is based on the mobile search overlap being fixed concurrently. An existing `next-env.d.ts` change and all concurrent work were preserved.

**Limits:** local measurements are not production Core Web Vitals or Lighthouse scores. There was no controlled mobile CPU/network benchmark, screen-reader session, Safari/Firefox verification, production infrastructure review, or full editorial audit of every article. The local Gumroad token was absent, so its successful authenticated response and checkout flow were not verified. Automated accessibility scans do not establish WCAG conformance. Synthetic fixture image-alt failures are deliberately excluded from real-site findings.

Evidence: [browser results](2026-09-05-browser-evidence.json), [theme and fresh security reproduction results](2026-09-05-theme-evidence.json), [enabled smoothing check](2026-09-05-smoothing-evidence.json). Temporary screenshots and the reproducible harness are in `/tmp/tjg-codebase-audit/`. The first fixture URL was cached during repeat checks; the fresh URL in the second evidence file confirms the outgoing requests independently.

## Security

### 1. P1 — Visitor-controlled cookies select arbitrary server fetch destinations

**Locations:** `lib/getWordpressSourceUrlFlag.ts:9`, `lib/getBlogContentSourceFlag.ts:3`, `lib/wordpress.ts:38`.

Both content-source and WordPress URL cookies are accepted before configured defaults, including in production. Any requester can select WordPress and provide a URL; the adapter then sends server-side GET requests to that host. There is no authentication, origin allowlist, HTTPS requirement, or redirect restriction. The hidden developer-options entry point does not protect direct requests.

**Reproduced:** cookies pointing at an isolated `127.0.0.1:3101` fixture caused the production server to request its posts, categories, and tags endpoints. A second run used a new URL prefix to avoid cached results and confirmed the same behavior. This establishes SSRF to reachable destinations; production network reachability and access to particular internal services were not tested.

**Fix:** stop accepting arbitrary content-source URLs from public cookies. Prefer a fixed server-side mapping of allowed source identifiers to exact HTTPS origins. If developer overrides remain, authenticate them and restrict them to the intended environment. Validate redirect destinations too, and bound upstream time and response size. The intentional normal/college preview cookie can remain a presentation preference; it should not be confused with authorization.

**Verify:** unauthenticated requests cannot change the destination; localhost, private-network URLs, unexpected schemes, unknown source values, and redirects outside the allowlist are rejected. [OWASP SSRF guidance](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html).

### 2. P1 — Raw CMS HTML can execute JavaScript in the site origin

**Locations:** `app/blog/BlogContent.tsx:177`, `lib/blogContentProcessing.ts:79`, `app/blog/BlogPostsWithSearch.tsx:49`, `app/blog/[slug]/page.tsx` hero titles, `app/blog/enhanceWpBlockEmbeds.ts:24`.

`processContentWithEmbeds` replaces custom markers but does not sanitize HTML. Post bodies, titles, and excerpts reach `dangerouslySetInnerHTML`. Sanity titles are plain strings but are nevertheless interpreted as HTML. Embed placeholders can also create iframes from unvalidated `data-src` values. `sanitizeBlogButtonHref` extracts URLs; despite its name, it does not enforce safe protocols.

**Reproduced:** a synthetic blog image with an `onerror` handler set a harmless document attribute in Chrome. No existing malicious CMS content was identified. A compromised CMS/editor/import source could exploit these sinks; setting one's own test cookie alone does not demonstrate compromise of other visitors.

**Fix:** render titles and plain excerpts as escaped text. Sanitize permitted rich HTML on the server with a maintained parser-based allowlist, including event attributes, URL schemes, iframe hosts, and `srcdoc`. Apply equivalent validation when dynamically creating embeds. Keep allowed custom embeds explicit. Add a CSP as defense in depth, first in report-only mode, accommodating the existing Next.js inline scripts and permitted embeds; CSP is not a substitute for sanitization.

**Verify:** script/event-handler, unsafe-link, iframe, SVG, and malformed-markup fixtures remain inert while legitimate galleries, embeds, audio, and custom buttons still work. [OWASP XSS guidance](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html), [Next.js CSP guidance](https://nextjs.org/docs/app/guides/content-security-policy).

## Accessibility

### 3. P1 — Several features are unavailable to keyboard users

**Locations:** `app/blog/TableOfContents.tsx:119`, `app/blog/enhanceImageCompare.ts:55`, `app/components/DiscordPopup.tsx:47`.

The table-of-contents trigger is a hover-only `div`; entries are clickable `div`s without keyboard semantics. Browser inspection confirmed a trigger with `tabIndex = -1` and no role. The before/after image comparison only handles pointer events. The Discord join action is attached to a non-focusable dialog wrapper; its dismiss button is reachable, but its join action has no native keyboard control.

**Fix:** use an expandable button plus real heading links for the TOC, a labelled native range input for comparisons, and a normal join link in the Discord banner. Support Escape and focus restoration for popovers. Keep functionality available without hover. [WAI keyboard guidance](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/).

**Verify:** each action works with Tab, Shift+Tab, Enter/Space, and relevant arrow keys, including at touch-sized viewports.

### 4. P1 — Lightbox does not implement modal focus behavior

**Location:** `app/components/LightboxClient.tsx:80` and `:139`.

Image opening is click-only. The dialog has `aria-modal="true"` but no accessible name, initial focus transfer, focus containment, background inertness, or focus restoration. In Chrome, the lightbox opened with focus still outside it. Escape and arrow-key handlers exist, but do not solve these issues. The expanded image also loses its original alternative text.

**Fix:** use a native modal `dialog` or a proven accessible dialog implementation; make image triggers keyboard-operable, label the dialog, retain the actual alt text, restore focus, and restore overflow state on unmount as well as normal close. [WAI modal pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

**Verify:** open by keyboard, cycle focus entirely inside, close with Escape, return to the original trigger, and navigate away while open without leaving scrolling locked.

### 5. P1 — Accent colours fail text contrast

**Locations:** `app/components/ThemeProvider.tsx:15`, `app/blog/blog.css:260`, `app/blog/blog.css:1715`.

axe found ordinary article links at **3.45:1** on the default light background. Small white text on the jump button fails with every accent in both themes:

| Accent | Measured contrast | Required for this text |
| --- | ---: | ---: |
| Blue | 3.89:1 | 4.5:1 |
| Coral | 2.77:1 | 4.5:1 |
| Mint | 1.93:1 | 4.5:1 |
| Lilac | 2.72:1 | 4.5:1 |
| Mono | 3.94:1 | 4.5:1 |

**Fix:** separate decorative accent, text-link, button-background, and on-accent text tokens. Choose accessible combinations per theme; do not assume white works on every accent. Keep inline links recognizable beyond colour alone.

**Verify:** run contrast checks for all ten theme/accent combinations, including hover, selected, and focus states.

### 6. P2 — Embedded frames and image descriptions lose useful context

**Locations:** `lib/blogContentProcessing.ts:5`, `app/blog/enhanceBlogMedia.ts:57`, `app/blog/[slug]/page.tsx` featured image, `app/components/LightboxClient.tsx:150`.

The sampled `video-production` post had **six unnamed video iframes**, confirmed by axe. Most hardcoded reusable iframe templates also lack titles. The main article hero uses the generic `alt="Featured image"` despite already fetching editorial alternative text; the lightbox uses `Expanded image`.

**Fix:** add meaningful frame titles at content normalization/template generation, preserve editorial alt text end to end, and mark genuinely decorative hero images as decorative. Check heading hierarchy during migration; axe also found two skipped-heading cases in the sampled article.

**Verify:** frame-title checks pass on migrated and native content, and images retain meaningful descriptions without duplicating nearby text unnecessarily.

## Performance and optimisation

### 7. P1 — Blog lists serialize complete articles to the browser

**Locations:** `lib/sanity.ts:98` and `:172`, `app/blog/BlogIndexContent.tsx:35`, `app/blog/BlogSearchWrapper.tsx:29`, `lib/recent-blog-posts.ts:11`.

The list query includes `legacyHtml`, `body`, SEO data, and full-text search content. The entire post objects cross the client boundary although cards need only summary fields. The index also renders every post and filters full text synchronously on each query update. Recent-post selection can fetch whole collections just to keep six summaries.

**Measured:** the college index returned **1,500,688 bytes** of HTML including streamed React data, approximately **251,232 bytes when gzip-compressed**. This is a real payload cost, although only part of it is article data; shared CSS contributes too.

**Fix:** introduce separate list and detail types/projections. Fetch card summaries with a limit and cursor; supply only the fields the client uses. Move full-text search to a bounded server query or a deliberately compact search index. Query the recent six directly where possible. Defer expensive filtering if client search remains.

**Verify:** index responses contain no article bodies, pagination and search preserve edition/category behavior, and a payload-size regression check prevents renewed growth.

### 8. P2 — Global CSS and broad client components inflate simple routes

**Locations:** `app/globals.css:1`, `next.config.js:22`, `app/components/HomeClient.tsx:1`, `app/components/NavigationClient.tsx:1`.

Home-specific CSS is imported globally. `inlineCss` embeds **107,170 characters** of shared/home/UI CSS on ordinary pages and about **156,086** on blog pages. Even Settings returned roughly **377 KB** of uncompressed HTML. Home is a 1,047-line client component with substantial static markup/SVG, and navigation has 1,109 lines.

Representative production-build observations:

| Route/view | HTML bytes | Locally gzip-compressed HTML | Loaded Next.js JS, decoded |
| --- | ---: | ---: | ---: |
| Home | 504,916 | 81,603 | 712,593 |
| Blog, normal content | 636,014 | 109,204 | 622,680 |
| Blog, college preview | 1,500,688 | 251,232 | 622,680 |
| College article | 826,593 | 121,748 | 595,552 |
| Settings | 376,702 | 64,845 | 581,053 |

These are local samples, not network transfer budgets or production latency results. JavaScript totals exclude local Vercel analytics URLs, which returned HTML because this was `next start`, not Vercel hosting. Gzip values were computed from complete response bodies, rather than inferred from production transport.

**Fix:** scope home styles to the home route and split static sections from interactive islands where it reduces serialization and hydration. Extract large static SVGs when external assets can preserve required theming. Benchmark external cacheable CSS against inlining; the current setting may help first paint in some conditions, so measure before removing it. Prioritize actual loaded chunks over total build output.

**Verify:** compare cold/repeat navigation, HTML/CSS/JS sizes, LCP, and responsiveness on throttled mobile hardware; preserve the current appearance and theme behavior.

### 9. P2 — Optional corner smoothing rescans the whole document

**Location:** `app/components/CornerSmoothingManager.tsx:111`.

When enabled, each qualifying subtree class/child mutation schedules a scan of every body element, reading computed style and geometry before managing a React target for each rounded element. Search highlights, hover classes, and content changes can trigger repeated global work.

**Reproduced:** with the feature explicitly enabled, adding an unrelated class to the home heading increased the full-body scan count from one to two. The feature was disabled in the default local baseline; this report does not attribute baseline page cost to it or claim a measured frame-time regression.

**Fix:** register explicit smoothing targets, scope observers to affected subtrees, and avoid scanning for unrelated class changes. Use CSS capabilities when suitable, with the existing fallback retained. Keep geometric reads batched.

**Verify:** unrelated DOM changes cause no full-document scan; compare long-post interaction profiles with the feature on and off.

### 10. P2 — Legacy media lazy-loading attributes are applied after parsing

**Locations:** `app/blog/enhanceBlogMedia.ts:49`, `lib/blogContentProcessing.ts:5`, `app/blog/NativeSlideshow.tsx:103`.

Legacy images and iframes only receive lazy-loading attributes in a client effect. By then the HTML parser may already have initiated requests. Several generated iframe templates omit `loading="lazy"`. Native slideshows opt out of image optimisation and assume 1200×800 geometry, as do Portable Text images.

**Fix:** normalize loading/decoding/preload attributes before server rendering, retaining eager loading for the actual hero/LCP image. Preserve real image dimensions/aspect ratios. Use responsive sources for slideshow/media content where the source supports them.

**Verify:** inspect initial response markup and a cold request waterfall before hydration; offscreen embeds should not all initialize immediately, and image loading should not shift layout. Network savings remain to be measured.

### 11. P2 — Independent server work still runs serially or unnecessarily

**Locations:** `app/layout.tsx:72`, `app/page.tsx:16`, `lib/recent-blog-posts.ts:11`.

The root awaits three independent flags and edition resolution sequentially. Home fetches featured stories and profile/config data before knowing whether corresponding content is needed, then starts recent posts after the first batch. Recent-post selection fetches taxonomy before further full-post queries.

**Fix:** resolve independent root values concurrently, gate optional expensive content by flags, and use bounded summary queries. Deduplicate repeated request-scoped configuration access where useful. Preserve hostname/cookie isolation when choosing cache keys.

**Verify:** disabled sections make no unnecessary external requests and a request trace has no avoidable serial flag waits. Do not blindly force static rendering or assume `force-dynamic` defeats every explicitly configured fetch TTL: the installed Next.js implementation distinguishes those cases.

## Reliability and correctness

### 12. P2 — Blocked browser storage crashes shared UI

**Locations:** `app/components/ThemeProvider.tsx:155`, `app/components/NavigationClient.tsx:203`, settings storage access.

Storage calls in the shared provider and navigation are unguarded, even though the early inline bootstrap scripts and some newer preference hooks use guards.

**Reproduced:** an isolated browser context where storage access throws `SecurityError` raised an uncaught error and displayed the page-load failure UI on Settings.

**Fix:** centralize guarded reads/writes with validated defaults and in-memory fallbacks. Persisted preferences must be optional for rendering and navigation.

**Verify:** denied reads, quota failures, malformed stored values, and ordinary preference persistence all leave the application usable.

### 13. P2 — WordPress single-post queries break edition filtering

**Locations:** `lib/wordpress.ts:121`, `lib/blog.ts:31` and `:139`, `lib/siteEdition.ts:58`.

List queries request tags, but single-post `_fields` omits them. Mapping therefore gives those posts an empty tag list. College-only posts can appear as normal posts on direct requests, while college requests can wrongly reject them.

**Reproduced:** the synthetic college post was absent from the main index but its direct URL returned HTTP 200 and displayed the content. This is a consistency bug, not a claim that the intentionally public college portfolio is confidential.

**Fix:** include tags in single-post fetches and make taxonomy-resolution failure explicit. Check the equivalent page fallback according to its actual taxonomy support.

**Verify:** both adapters apply the same edition rules to lists, direct posts, section pages, and featured-image lookups, including failure paths.

### 14. P2 — Upstream outages masquerade as missing or empty content

**Locations:** `app/blog/[slug]/page.tsx:30`, `app/blog/[slug]/[section]/page.tsx:22`, `app/blog/BlogIndexContent.tsx:11`, `lib/gumroad-server.ts:64`.

Post fetch failures become `null`, which is subsequently treated as not found. Index failures silently become an empty list with developer-facing CMS configuration advice. Gumroad errors and missing configuration become an empty catalogue. These states obscure outages, impede retries, and can give crawlers an incorrect not-found signal. Upstream fetches also lack application-specific deadlines.

**Fix:** distinguish not-found, genuinely empty, unavailable, and misconfigured results. Log sanitized operational context and show a visitor-facing retry state. Add bounded request timeouts and appropriate transient retry/stale-data behavior. Keep a Gumroad storefront link available even if product retrieval fails.

**Verify:** simulate 404, 429, 500, timeout, and malformed upstream JSON. An existing article must not be represented as deleted because its CMS temporarily failed.

### 15. P2 — WordPress pagination and taxonomy retrieval have boundary failures

**Locations:** `lib/wordpress.ts:91`, `:113`, `:117`; `scripts/migrate-wordpress-to-sanity.ts:67`.

Post pagination stops only when a batch has fewer than 100 records. An exact multiple of 100 leads to requesting a nonexistent next page, which WordPress can reject and turn into an overall failure. Categories use the default page size; tags stop at the first 100. Missing taxonomy can affect category labels and college filtering. The migration repeats the post pagination pattern.

**Fix:** use WordPress total-page headers, paginate taxonomies, and handle a documented end-of-pagination response without discarding prior valid data. Add a bounded page guard. [WordPress pagination documentation](https://developer.wordpress.org/rest-api/using-the-rest-api/pagination/).

**Verify:** fixtures with 0, 99, 100, 101, and 200 posts, more than ten categories, and more than 100 tags resolve correctly. These boundary cases were identified from source; they were not exercised against a production-sized WordPress dataset.

### 16. P2 — Multiple custom content markers do not all render

**Location:** `app/blog/BlogContent.tsx:183`.

Each HTML segment processes only the first word counter or first button and emits the remainder as raw HTML. A word counter also wins over buttons in the same segment. Multiple markers can therefore remain visible as template text.

**Reproduced:** server rendering two distinct button markers produced one actual `.blog-button` and left the second `{{BUTTON:...}}` marker untouched.

**Fix:** tokenize every supported marker in order, rather than splitting on only the first match. Prefer structural parsing where transformations interact with HTML nesting.

**Verify:** mixed counters, repeated buttons, galleries, and content before/after every marker render without lost text or unresolved placeholders.

### 17. P2 — Sanity schema files import helpers from the wrong package

**Locations:** `sanity/schemas/post.ts:1`, `category.ts:1`, `tag.ts:1`, `tsconfig.json` exclusions.

The files import `defineType` and `defineField` from `@sanity/client`. In the installed package both exports are `undefined`. These are Studio helpers from `sanity`. The main build does not detect this because the schema directory is excluded from TypeScript and is not imported by the site.

**Fix:** establish the intended Studio ownership. If these are executable schemas, import from the Studio package and add a small separate schema validation/typecheck setup. If they are reference-only copies for a separately maintained Studio, state that clearly and keep them synchronized rather than implying they are deployable as-is. [Sanity schema documentation](https://www.sanity.io/docs/apis-and-sdks/introduction-to-schemas).

**Verify:** the real Studio can import and validate all three schemas. This does not currently prevent the public website from building.

### 18. P2 — Revalidation endpoint needs explicit payload and invalidation contracts

**Location:** `app/api/revalidate-post/route.ts:5`.

The webhook correctly checks a Sanity signature or configured token before invalidation, but unguarded `JSON.parse` can throw on malformed authenticated payloads; `null` also fails in the manual destructuring branch. Slugs are only checked for string type. The Sanity branch invalidates a post and index, while the manual branch invalidates only the post. Neither explicitly describes handling old/new slugs, section pages, deletion events, or homepage summaries.

**Fix:** parse once with a validated discriminated schema, return consistent 400 responses, normalize/bound slug values, and document supported events. Design post/list/summary invalidation together, using cache tags where appropriate, including rename/delete behavior. Authenticate and reject oversized requests before unnecessary processing where practical.

**Verify:** signed and token-authenticated requests, invalid signature/token, malformed JSON, null, bad slug, rename, deletion, section updates, and homepage summary changes. Cache freshness effects were identified from source and need an integration test with the real CMS webhook configuration.

## Dependencies, discoverability, and maintenance

### 19. P2 — Dependency patch debt includes a security-sensitive override

**Location:** `package.json` overrides and `package-lock.json`.

The full npm audit flagged `@humanfs/node`, `brace-expansion`, `browserslist`, `js-yaml`, `nanoid`, `postcss`, and `next`. The production-only report includes `nanoid`, `postcss`, and `next`; the Next entry is inherited from PostCSS, not a separate demonstrated Next exploit. Installed versions included `nanoid@3.3.16` and `postcss@8.5.19`.

The hard PostCSS override holds a version inside the current advisory range (`<=8.5.22`). Merely updating Next does not necessarily remove that pin. These reports mostly concern build/tooling or specific library calls; no attacker-controlled path into the vulnerable PostCSS or Nano ID APIs was demonstrated in this application.

**Fix:** update the constrained packages/lockfile to audited patched releases, review the continuing need for overrides, and run the full build and checks. Do not run a blind forced major-version audit fix. Add automated patch update visibility.

**Verify:** repeat both audit modes, inspect dependency paths, and keep intentional overrides documented with a reason and removal condition. [PostCSS advisory](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp), [Nano ID advisory](https://github.com/advisories/GHSA-2v37-7h3g-55p8).

### 20. P2 — Route metadata and crawl controls are incomplete

**Locations:** `app/layout.tsx:22`, `app/blog/page.tsx`, `app/contact/page.tsx`, `app/shop/page.tsx`, `app/blog/[slug]/[section]/page.tsx`.

Browser inspection found Home, Blog, Contact, Shop, Settings, and Feature Flags all titled “That Josh Guy”, with the root homepage Open Graph URL inherited on those routes. The non-post routes lacked canonicals. Section metadata does not propagate the parent post's `seo.noIndex` or define its canonical policy. No robots or sitemap implementation was found in app/public.

**Fix:** give public routes distinct titles, descriptions, canonicals, and sharing URLs. Deliberately choose how section pages relate to combined articles. Propagate no-index decisions to sections, and define crawl policy for beta/settings/developer pages. Generate an edition-aware sitemap of intended public URLs. Do not assume browser preview cookies create a different public canonical site.

**Verify:** inspect rendered metadata on each hostname and section route, including no-index content and unknown URLs. Hosting-level robots headers were outside this audit.

### 21. P2 — Existing checks leave major behavior untested

**Locations:** `__tests__/`, `jest.config.js`, `eslint.config.mjs`, `package.json`, `tsconfig.json`.

The 30 existing tests mostly cover configuration, mapping, deduplication, and edition helpers. There are no checked-in browser tests for navigation, dialogs, keyboard interactions, rich media, storage failures, or theme contrast, and no webhook route tests were found. No repository-local GitHub Actions workflow was found; external CI configuration was not inspected. TypeScript excludes schemas and scripts. Several hook rules are disabled globally.

**Fix:** add focused regression tests for the reproduced failures, then a small browser smoke suite covering both editions, mobile navigation, search, dialogs, and all accent themes. Run lint, unit tests, typecheck/build, and appropriate dependency checks in the chosen CI. Limit lint suppressions to documented cases. Add separate script/schema checks if those directories are maintained executable code.

**Verify:** the new tests fail on the current demonstrated bugs and pass after their fixes. Avoid tests that only assert the implementation's spelling or duplicate configuration literals.

### 22. P2 — The FMP content path does not support a native Portable Text migration

**Locations:** `app/blog/[slug]/page.tsx` FMP branch, `app/blog/[slug]/FmpViewWrapper.tsx:15`, `app/blog/[slug]/[section]/page.tsx`.

The FMP slug is handled before checking `contentSource`, and receives only legacy HTML. Section extraction also operates only on HTML H1s. Changing that existing post to native Portable Text can therefore render empty content even though the generic Portable Text renderer could display it. The generic renderer additionally flattens nested list levels.

**Fix:** route FMP rendering through the normalized content representation and generate section summaries/IDs for both formats. Respect Portable Text list nesting, and make heading IDs unique. Keep already published section URLs stable during migration.

**Verify:** the same representative FMP content renders in combined and separated views in both formats, including nested lists, duplicate headings, and section deep links. This is a source-confirmed migration limitation; the actual CMS post was not changed.

## Smaller improvements

- **Search semantics:** provide explicit persistent names for both search fields, announce result counts politely, and make category selection state programmatic. Place portalled top-bar actions in suitable landmarks; axe reported them outside landmarks on several routes.
- **Long-post search and heading navigation:** `PostSearchBar` rewrites text nodes on every keystroke, while TOC/search each scan headings and use `offsetTop` as though all offsets were document-relative. Consider the CSS Custom Highlight API, a shared heading model, unique IDs, and `getBoundingClientRect().top + scrollY` or native anchor navigation. Respect reduced-motion preferences in explicit JavaScript smooth-scroll calls. Profile with long content before choosing thresholds.
- **Reduced motion and touch:** global CSS reduced-motion handling already exists. `AnimatedText` still performs pointer-driven geometry/weight work and uses `touchAction: none`; avoid suppressing normal scrolling over decorative text and skip unnecessary work for reduced-motion users.
- **Secrets and integration hygiene:** the Gumroad token stays server-side, but is placed in the request URL. Prefer an authorization header if supported by the API, to reduce URL/log exposure. Ensure the public Sanity reader uses a read-only token or none when suitable; migration write access should have a separate credential. Actual token permissions were not inspected. Add `server-only` guards to server data modules as preventative maintenance.
- **Maintainability:** split large client components by behavior, consolidate repeated feature-flag boilerplate and theme-token definitions, remove unused dependencies only after an import/bundle check, and give currently untyped sections meaningful types. Add a non-secret environment-variable example and clearly distinguish required from optional integrations.
- **Observed configuration drift:** local server logs repeatedly reported a missing cloud definition for `projects-enabled` and used its fallback. Check that the flag exists in the intended Vercel environment. This was a local configuration observation, not verification of a production outage.
- **Tooling:** the session reported Vercel CLI 59.1.3 with 59.11.7 available. Upgrade with `npm i -g vercel@latest` or `pnpm add -g vercel@latest` when next working on deployments. This audit did not require changing the CLI.

## What is already working well

- A real skip link, `lang="en"`, native navigation links, many named controls, keyboard-aware theme radios, and global CSS reduced-motion handling are present.
- Both content adapters share a normalization boundary. Sanity uses a published perspective, parameterized slug queries, and explicit fetch revalidation.
- Post metadata/body fetching already uses React request caching, and several data calls use parallel promises.
- Most featured images use `next/image` with responsive sizing; the primary font is a preloaded WOFF2 subset with `font-display: swap`.
- Rich-media enhancers are conditionally imported and have cleanup paths; slideshow keyboard navigation and audio range controls already exist.
- Gumroad access is guarded by `server-only`. The webhook authenticates configured requests. Security headers include nosniff, referrer policy, framing protection, and restricted device permissions.
- The existing build, lint, and unit checks are healthy. Improvements can be incremental rather than requiring a rewrite.

## Suggested order of work

1. **Close unsafe inputs:** fix findings 1–2, then add focused security regression fixtures. Keep development previews usable through a safe explicit design.
2. **Restore access and resilience:** fix keyboard/modal/contrast failures and guarded storage; add browser regression coverage as each fix lands.
3. **Reduce payloads:** separate summary/detail projections and bound listing/search/recent-post queries. Scope CSS and measure before broader rendering changes.
4. **Repair content contracts:** fix WordPress taxonomy/pagination, custom marker parsing, upstream error states, revalidation, and schema imports.
5. **Finish operational polish:** patch dependencies, improve metadata/crawl policy, define CI coverage, and address remaining source-confirmed migration limitations.

No application fixes, dependency updates, commits, or deployments were performed as part of this audit. Repository additions are this report and its evidence files.
