# Primary domain migration — 6 September 2026

Application commit: `a1e8650` (both `beta` and `main`).

## Domain contract

| Old host | Destination | Assignment |
| --- | --- | --- |
| `thatjoshguy.me` | `tjg.gg` | Production |
| `www.thatjoshguy.me` | `tjg.gg` | Production |
| `college.thatjoshguy.me` | `college.tjg.gg` | Production, college edition |
| `beta.thatjoshguy.me` | `beta.tjg.gg` | `beta` preview branch |
| `college.beta.thatjoshguy.me` | `college.beta.tjg.gg` | `beta` preview branch, college edition |
| `legacy.thatjoshguy.me` | `legacy.tjg.gg` | Existing legacy deployment |
| `discord.thatjoshguy.me` | `https://tjg.gg/discord` | Website host redirect |

Website domain redirects use HTTP 308 and retain the entire request path and
query string. URL fragments remain browser-side. `www.tjg.gg` also redirects
to `tjg.gg`. The Discord host is a special case: all paths use the existing
`/discord` shortlink, retaining query parameters.

Gumroad's `shop.thatjoshguy.me` and `mono.thatjoshguy.me` remain on their existing
DNS and service configuration. Email and identity verification DNS are unchanged.
This migration covers the configured website hosts, not arbitrary unregistered
subdomains or a wildcard transfer of external services.

## Application compatibility

`lib/siteEdition.ts` recognizes both old and new website hostnames, including
college and beta identities. Canonicals and sitemaps use the new production
origins. `canonicalContentHref` also normalizes migrated canonical URLs stored
in the CMS, preserving external publisher canonicals. Beta stays non-indexable.

The old domains remain attached for backwards compatibility. Keep the domain
registrations and HTTPS certificates active for as long as old links must work.

## Rollback references

Before migration:

- Production: `dpl_3r6fwuXWm8qZYm6HiC3V5mAzxPet` (`e7fd6b2`).
- Beta: `dpl_FSmfn9WMAUutSb9wZydBNXbRo4qD` (`e7fd6b2`).
- Legacy: `dpl_4h4DydCEws2MjtjWX3KQmuBvsdWS`; keep this unchanged.
- `tjg.gg` redirected to `thatjoshguy.me` using 307; other website hosts served
  their assigned deployment directly.
- Discord belonged to `discord-redirect` (`prj_jdrKMzfssqOLCgn1vGJNq3fel4g0`),
  whose deployment was in ERROR and whose public hostname returned 404.

To roll back the primary direction, first remove all old-to-new domain redirects
and restore old hosts to their original production/beta/legacy assignments. Only
then restore the former `tjg.gg` redirect. Avoid a redirect loop. Older application
builds do not recognize the new college/beta hosts, so do not roll back code while
leaving traffic routed to those hosts.
