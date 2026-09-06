# Environments and site editions

One Next.js app and one Vercel project (`website`, team `tjg-website`) serve
both editions. Edition selects content; environment selects release behaviour.
The Notion **Environments & site editions** page mirrors this guide.

| Environment | Branch | Normal edition | College edition |
| --- | --- | --- | --- |
| Production | `main` | `thatjoshguy.me` | `college.thatjoshguy.me` |
| Preview | `beta` | `beta.thatjoshguy.me` | `college.beta.thatjoshguy.me` |
| Development | local checkout | `localhost:3000` or `normal.localhost:3000` | `college.localhost:3000` or `SITE_EDITION=college` |

The domain table is the rollout target. See the deployment record below for
what has actually been verified. Both production domains must share one
production deployment; both beta domains must track the `beta` branch preview.
Vercel's standard Production/Preview environments are sufficient.

## Configuration contract

`lib/siteEdition.ts` owns resolution:

- `SiteEdition`: `normal | college`. Exact known hostnames take precedence over
  `SITE_EDITION`. Generated Vercel URLs and plain localhost use that fallback,
  defaulting to `normal`. Old `main` and `beta` values remain accepted as normal
  content for compatibility; new configuration should use `normal`.
- `SiteEnvironment`: `development | preview | production`. `VERCEL_ENV` takes
  precedence. Local `next dev` uses development; without Vercel configuration,
  known beta/generated Vercel hosts use preview and `NODE_ENV` is the fallback.
- `origin`: the current known domain, generated Vercel URL, or local origin
  (including its port). Root metadata resolves relative image URLs against it.
- `canonicalOrigin`: the edition's production domain, including on previews.
  Route canonicals, Open Graph page URLs and production sitemaps use this.
- `indexable`: only production requests on the known public domains qualify.
  Beta, generated Vercel URLs, development and unknown hosts emit noindex and
  empty sitemaps; their robots.txt disallows crawling.

Navigation uses relative paths so browsing beta stays on beta. No host-specific
builds or duplicate route/component trees are needed. The HTML root exposes
`data-site-edition` and `data-site-environment` for diagnostics. Favicons and the
home environment badge follow environment, independent of edition.

The `ff-blog-content-edition` cookie is a browser-local content preview. It
changes blog content only; it never changes site identity, canonical origins or
public sitemap selection. It is a developer convenience, not access control.

## Content and service boundaries

All four hosts read the same **published**, public Sanity dataset
(`v4byl546` / `production`). College-tagged posts appear on college; other posts
appear on normal. Lists, search, direct post requests and sitemaps must apply
that same rule. This is a content classification rule, not private content.

A beta code deployment does not isolate CMS edits: publishing a post or changing
its tags affects both production and beta. UI work can use published data;
content migrations or incompatible schema experiments need a separate test
dataset before touching production. Dataset creation is not required by this
rollout. Public reads need no token; use a dedicated read token for private data.

`FLAGS` is already scoped separately to Production, Preview and Development.
Keep beta defaults representative of production except for intentional tests.
Edge Config is shared (projects/featured stories), and Gumroad product reads
use the same shop. Do not use beta to test changes to shared service content.

CMS webhooks should invalidate both the production deployment and the stable
beta deployment. Each deployment has its own cache. One host per deployment is
sufficient because the readers use the shared `blog` cache tag; expiry remains
the fallback if a webhook cannot reach a protected preview.

## Local verification

```sh
npm run dev
SITE_EDITION=college npm run dev
npx vercel dev  # for Vercel Toolbar flag overrides
```

Use `normal.localhost` and `college.localhost` to compare both editions on one
server. Generated Vercel URLs have one configured default; the stable beta
domains are the reference URLs for testing the two identities.

Run quality checks before release, including the hostname matrix in
`__tests__/site-edition.test.ts`, `__tests__/site-metadata.test.ts` and
`tests/browser/site-environments.spec.ts`. Browser checks cover metadata,
robots/sitemaps and real published post visibility when a Sanity project is set.

## Release and rollback

1. Work on short feature branches; merge tested changes into `beta`.
2. Check both beta domains at the same commit, including normal and college
   direct posts, metadata, home badge, favicon and navigation.
3. Merge the verified beta code into `main` and build for **Production**. Do not
   simply alias a Preview build into production: its environment configuration
   and indexing rules still belong to Preview.
4. Check both production editions. Bring any production hotfixes back to beta
   immediately. Production-only workflows must not be lost during merges.
5. For the initial migration, move the college domain off the old `college`
   branch only after the shared production replacement is ready. Preserve the
   old deployment ID and branch history for rollback; disable future college
   branch deployments once the cutover is verified.

For rollback, restore the last known-good production deployment. If reversing
the initial college cutover, also restore its old branch/domain assignment.
Avoid rolling code back across incompatible CMS schema changes.

## Deployment record — 6 September 2026

Implementation and checks are in progress. Domain cutover has not yet occurred.
Previous production: `dpl_DgTgVn11scHt16qy1sG6EXpZsfNb` (`aec31c4`).
The college domain is currently assigned to the `college` branch; normal beta
tracks `beta`. College beta is provisioned and verified, tracking `beta`; its first deployment
of the refactored code is pending. Vercel is configured for Node.js 24.
Previous college: `dpl_2BPSGCfueQKBFciX95UiaCpZvhko` (`48a13b5`).
