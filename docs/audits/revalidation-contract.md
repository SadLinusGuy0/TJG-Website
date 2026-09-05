# Blog revalidation

POST `/api/revalidate-post` accepts a maximum 16 KiB JSON body. Authenticate with the Sanity webhook signature (`SANITY_WEBHOOK_SECRET`) or the `x-revalidate-token` header (`REVALIDATE_SECRET`). Unauthenticated calls are rejected in every environment. Tokens must not be included in query strings.

Payload:

```json
{"event":"update","slug":"current-slug","oldSlug":"previous-slug"}
```

`event` is `create`, `update` (default), or `delete`. Slugs can also have Sanity's `{ "current": "slug" } shape. Supply at least one valid slug, at most 200 ASCII letters, digits, and single separating hyphens. Renames must include both slugs; deletions can use only `oldSlug`.

Configure a Sanity document webhook for post create/update/delete. A GROQ projection can emit `"event": delta::operation(), "slug": after().slug.current, "oldSlug": before().slug.current`. Null old/new slugs are accepted for creations/deletions, provided at least one valid slug is present. Category/tag edits also affect listings: trigger a payload with an affected post slug, or explicitly invoke this endpoint after taxonomy changes.

Accepted requests immediately expire the shared `blog` cache tag, invalidate the homepage, index, sitemap, both post URLs, and section pages. Both authenticated paths use the same contract. 400 means invalid JSON/payload, 401 means invalid/missing authentication, and 413 means too large. Retries are idempotent.

The remote webhook projection must be updated in the CMS before relying on rename/delete invalidation. Local unit tests exercise signature and token paths, malformed payloads, size limits, and invalidation targets; they do not prove a remote webhook has been configured.
