# 08 — SEO & Performance

> **Verified against the tree 2026-09-18.** Items are marked **[still true]**,
> **[CLOSED]** with the commit that closed them, or **[corrected]**.

## Meta tags / Open Graph

- **Next.js Metadata API** in `app/layout.tsx` — **[corrected]** the copy changed:
  - `title`: "Shackpack — Premium Coin, Bullion and Card Repacks"
  - `description`: "Premium coin, bullion, sports card and Pokemon card repacks. Every series is backed by a published checklist; contents vary by series."
  - `metadataBase`: `https://shackpck.com`
  - `icons`: `/shackpack-favicon.png` (icon/shortcut/apple)
- **[still true] No Open Graph or Twitter Card metadata** anywhere (no `openGraph`/`twitter` keys, no `og:image`). Social shares fall back to defaults. **Gap.**
- **[corrected] Per-page `metadata` now exists — but only on signed-in routes.** `app/build/page.tsx`, `app/my-builds/page.tsx` and `app/admin/builds/page.tsx` export `metadata`. **No public SEO surface has one**: `/series/[slug]`, `/repacks`, `/checklist`, `/contact` and `/policy` all still inherit the single root title and description. **SEO gap** stands for exactly the pages that matter.
- **[still true] No structured data (JSON-LD)** for products or series — 0 `application/ld+json` blocks.

## Sitemap & robots

- **[still true] No `app/sitemap.ts`, `app/robots.ts`, `public/sitemap.xml`, or `public/robots.txt`.** Search engines get no sitemap and no crawl directives. **Gap** (MEDIUM).

## Image optimization

- **[CLOSED `1418d91`] `images.unoptimized: true` is gone.** Next image optimization is on: `@netlify/plugin-nextjs` v5 redirects `/_next/image` to `/.netlify/images` whenever `images.loader` is `default`, which is this site's case — the redirect was always installed and simply never hit. `remotePatterns` is now the single allow-listed host `images.unsplash.com`, not `https://**`.
- **[still true] Pack art is local PNG** in `public/images/packs/`; `RepackCard` uses `next/image` with `fill` and `sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 480px"`. With optimization on, delivered bytes are now far below source weight — but the **sources themselves keep growing**: 83 tracked PNGs, ~188 MB, paid on every clone, CI checkout and build (see `15-backlog.md` §13).
- **[still true] Hero image is a remote Unsplash URL** (`app/page.tsx:18`) — the only remote image the site renders, and the reason `remotePatterns` is not empty.

## Performance concerns (from code)

- **[CLOSED `1418d91`] Unoptimized images** — was the largest win; now taken.
- **[corrected] Large client bundles / pages.** `app/checkout/page.tsx` is still 936 lines. `app/checklist/page.tsx` is **24 lines**, not 572 — it is now a thin server page over `ChecklistClient.tsx` (474). `BuilderShell.tsx` dropped 533 → 322 (`07d442c`). See `11` for the current ≥500 list.
- **[CLOSED `f14a057`] The checklist page's N-request sweep.** It used to fetch every available date and then one daily checklist per date — 267 calls — just to build counts. The customer index is now built synchronously from the `caseBreakdown` that `getAvailableDates` already returns; full case data is fetched on demand only when a case is opened.
- **[still true] `cache: 'no-store'`** on inventory fetches (`app/checklist/api.ts:28`, `lib/coin-inventory-api.ts:61`) — always fresh, no CDN caching of that data.
- **[CLOSED `a4fcf81`] `console.log`s shipping to the client.** Zero remain in any `.tsx` under `app/` or `components/`.

## Analytics

- **[still true] None detected.** No Google Analytics / GA4, Plausible, Vercel Analytics, Segment or Meta Pixel in code or layout. TBD - Griff to clarify whether analytics is injected via Netlify/GTM externally.

## Quick wins

1. Add `app/robots.ts` + `app/sitemap.ts`.
2. Add `openGraph`/`twitter` + an OG image to root metadata, and per-page `metadata` on the **public** routes (series, repacks, checklist, contact, policy).
3. ~~Reconsider `images.unoptimized`; tighten `remotePatterns`~~ — **done** (`1418d91`). Next lever is compressing the PNG sources themselves.
4. Add an analytics provider if desired.
