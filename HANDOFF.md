# HANDOFF

**Goal:** SEO for shackpck.com. Phase 1 (new files and deletions only) is
shipped; phase 2 is per-page metadata, phase 3 is server-rendered content.

**Done:**
- SEO phase 1, ten commits on main, CI green, pushed 2026-09-19:
  - `81befc7` delete placeholder /shop and /product routes (+ ProductCard,
    ProductGallery). Fake prices over Unsplash stock; orphaned; GSC reported
    every URL "unknown to Google", so a plain delete, no 410s.
  - `95f0633` remove the (site) route group (both files mapped to "/")
  - `33722d1` favicon 1254x1254/1.9 MB -> 192x192/43.3 KB
  - `f0b7cf3` app/robots.ts — Disallow /api/ only
  - `2cde71d` app/sitemap.ts — 6 static routes + isActive series via Prisma
  - `88c7be7` noindex on /checklist/customer/* via a new layout.tsx
  - `2a85c06` Open Graph, Twitter Card, canonical, og-default.png
  - `ce9039f` Organization + WebSite JSON-LD
  - `7e69f69` public/llms.txt
  - `2ee7278` docs(knowledge) for 08, 11 and 15
- Verified per item: tsc 0, lint 0 errors, fixtures green (6, then 7 once
  scripts/test-structured-data.ts landed). Clean-checkout build passes.
- Prod VERIFY: see the run report in the session; rerun the block below if in
  doubt.

**Next:** Griff submits the sitemap in Google Search Console —
https://shackpck.com/sitemap.xml. Nothing in phase 1 has any effect until that
happens. Then phase 2.

**Watch:**
- `/repacks`, `/checklist`, `/series` serve ~330 chars of HTML — nav, footer,
  "Loading…". Cause is `useSearchParams()` forcing the Suspense fallback to
  prerender, NOT data fetching; /repacks and /checklist read local catalog
  modules. This is the biggest remaining SEO win and the riskiest change.
  Phase 3, own commit.
- `openGraph` inherits as a whole object. Phase 2 must set `openGraph.title`
  per page as well as `metadata.title`, or every page emits the root og:title.
- `/repacks`, `/checklist`, `/contact`, `/policy` are ALREADY server
  components — metadata is a 3-line add. Only `/`, `/series` and
  `/series/[slug]` need a server/client split.
- `/series/<anything>` and `/checklist/customer/<anything>` return HTTP 200.
  No app/not-found.tsx, no notFound() anywhere. Unbounded soft-404 space; the
  customer half is noindexed, the real fix is phase 2.
- `/series` renders an empty list (filters isFeatured === true, nothing sets
  it). Excluded from the sitemap. Gate the nav link behind a flag in phase 2.
- Prod `Series` table is EMPTY as of 2026-09-19. The sitemap therefore emits
  static routes only today; the Prisma enumeration is live and will light up on
  its own. Proved both directions against the dev DB.
- ShackHQ `getSeries` EXISTS and returns `{"success":true,"series":[]}` — it is
  unpopulated, not missing. What is owed is data, not integration work.
- `fetchAllSeries` (lib/coin-inventory-api.ts:118) has NO cache directive and
  will inherit force-cache the moment it runs server-side. Fix before phase 2
  calls it from a server component.
- Footer social links are all `href="#"`. That is why the JSON-LD omits
  sameAs.
- scripts/test-api.js cannot run (needs a dev server and node-fetch, which is
  not installed). The real fixture set is the 7 scripts/test-*.ts files.
- scripts/generate-og-image.mjs needs Chrome (honours CHROME_PATH). Source art
  is coins/assets/shackpack-mark.png, outside public/ so it is never served.
- Visible chrome still reads "Shackpack" while metadata now reads "ShackPack"
  (NavBar.tsx:14, Footer.tsx:9,38, app/page.tsx:32,159).

**Prod VERIFY block (rerun any time):**
```
curl -sI https://shackpck.com/robots.txt
curl -s  https://shackpck.com/sitemap.xml | grep -c "<loc>"
curl -sI https://shackpck.com/shop/gold                  # expect 404
curl -s  https://shackpck.com/checklist/customer/bullion-bureau | grep robots
curl -s  https://shackpck.com/ | grep -oE 'og:image|twitter:card|ld\+json'
curl -sI https://shackpck.com/og-default.png
curl -sI https://shackpck.com/llms.txt
```

**Files:**
- `coins/lib/site-metadata.ts` — the shared title/description/URL constants
- `coins/app/layout.tsx` — root metadata, OG, Twitter, canonical, JSON-LD mount
- `coins/app/robots.ts`, `coins/app/sitemap.ts`
- `coins/app/checklist/customer/layout.tsx` — the noindex
- `coins/components/StructuredData.tsx` + `coins/scripts/test-structured-data.ts`
- `coins/scripts/generate-og-image.mjs`, `coins/assets/shackpack-mark.png`
- `coins/public/og-default.png`, `coins/public/llms.txt`
- `shackpck-knowledge/08-seo-and-performance.md` — rewritten, the reference
- `shackpck-knowledge/15-backlog.md` — phase 1 section at the end
