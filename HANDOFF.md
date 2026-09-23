# HANDOFF

**Goal:** SEO for shackpck.com. Phase 1 (new files and deletions only) is
shipped and live. Phase 2 is analytics, per-page metadata and crawl hygiene.
Phase 3 is server-rendered content.

## Done

**Checklist examples, 2026-09-23.**

- Utopia Singles example added for Komodo Rips (10 raw singles, `| Raw`).
  PR #2, `b4f53f0`.
- Komodo example notice derives pack count from `cards.length`, not a
  hardcoded "8 packs". PR #3, `8e28ad9`.
- Vault Room Breaks example notice derives pack count from `cards.length`,
  not a hardcoded "10 packs". PR #4, `d1974b2`. No hardcoded counts remain
  in `EXAMPLE_CAVEAT_BY_BRAND`.

**SEO phase 1 shipped 2026-09-21 — 11 commits, `81befc7..dd2f1fb`.**

- Search Console verified (DNS TXT). Bing Webmaster verified via GSC import.
- Sitemap submitted in GSC. Status was **"Couldn't fetch"** pending the first
  read — expected immediately after submission, see Watch.
- Indexing requested for `/repacks`, `/checklist` and `/`.
- Prod `Series`, `Order`, `OrderItem` and `SeriesPurchase` tables are **empty**
  (test data removed by Griff). The sitemap therefore emits static routes only
  today; its Prisma enumeration is live and lights up on its own when rows land.
- `/shop` and `/product` confirmed never indexed, so the plain 404 from
  deleting them is sufficient. No 410s needed.
- Analytics decision: **Plausible**. Snippet not yet available.

## Next

**SEO phase 2 — one commit per item.**

1. **Analytics.** Add the Plausible script to `app/layout.tsx` once Griff
   supplies the snippet. No consent banner. Verify the request fires on prod.
2. **Per-page metadata** on `/repacks`, `/checklist`, `/contact`, `/policy`.
   All four are already server components, so this is an `export const
   metadata` with title, description, **and** `openGraph.title` /
   `openGraph.description`. `openGraph` inherits as a whole object, so a
   per-page `og:title` requires setting `openGraph` per page — set both or the
   root `og:title` leaks onto every page.
3. **noindex layouts** for `/admin`, `/account`, `/my-builds`, `/checkout`,
   `/auth`. Do **NOT** add these to robots.txt — a disallowed URL is never
   fetched, so the noindex would never be seen.
4. **`notFound()`** for unknown `/series/[slug]` and
   `/checklist/customer/[slug]`. Needs server-side slug resolution. Add
   `app/not-found.tsx`.
5. **Hide the `/series` NavBar link behind a flag** until ShackHQ `getSeries`
   returns rows.
6. **Footer social links** from real URLs (Griff to supply), then add `sameAs`
   to `StructuredData.tsx`. Fix "Shackpack" → "ShackPack" in the visible chrome.
7. **IndexNow.** Ping Bing on deploy via a Netlify build hook or a small
   script. Key file goes in `public/`.
8. **Decision needed from Griff:** delete the `/checklist/customer/*` routes
   entirely (they duplicate `/checklist?customer=`) or keep them as noindex.
9. **`docs(knowledge)`** commit closing each item.

**Phase 3 — after phase 2 has been live a week.** SSR for `/repacks` and
`/checklist`. Move the `?line=` / `?customer=` tab state off `useSearchParams`
so the Suspense fallback stops prerendering. Verify visible text > 2,000 chars
on both.

## Watch

- `fetchAllSeries` in `lib/coin-inventory-api.ts` has **no cache directive**.
  Add `cache: 'no-store'` before any server-side caller exists, or it inherits
  Next 14's `force-cache` default and serves stale series.
- **GSC sitemap status:** if still "Couldn't fetch" after 48h, investigate.
- **Netlify `DATABASE_URL` scope:** if `sitemap.ts` ever logs its DB warning in
  a Netlify build, the var is scoped Functions-only and needs Builds scope.

## Files

- `coins/app/layout.tsx` — root metadata, OG/Twitter, canonical, JSON-LD mount;
  where the Plausible script goes
- `coins/lib/site-metadata.ts` — shared title/description/URL constants
- `coins/app/robots.ts`, `coins/app/sitemap.ts`
- `coins/app/checklist/customer/layout.tsx` — the noindex, and the pattern to
  copy for phase 2 item 3
- `coins/components/StructuredData.tsx` + `coins/scripts/test-structured-data.ts`
  — where `sameAs` lands
- `coins/components/{NavBar,Footer}.tsx` — the `/series` link, the `href="#"`
  socials, the "Shackpack" spelling
- `coins/lib/coin-inventory-api.ts` — `fetchAllSeries`, the missing cache
  directive
- `shackpck-knowledge/08-seo-and-performance.md` — the reference for this work
- `shackpck-knowledge/15-backlog.md` — phase 1 section at the end
