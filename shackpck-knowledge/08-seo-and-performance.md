# 08 — SEO & Performance

## Meta tags / Open Graph

- **Next.js Metadata API** in `app/layout.tsx`:
  - `title`: "Shackpack — Premium Coin & Card Repacks"
  - `description`: premium graded coin/card repacks with published checklists…
  - `metadataBase`: `https://shackpck.com`
  - `icons`: `/shackpack-favicon.png` (icon/shortcut/apple)
- **No explicit Open Graph or Twitter Card metadata** (no `openGraph`/`twitter` keys, no `og:image`). Social shares will fall back to defaults. **Gap.**
- **No per-page `metadata` exports** found on individual routes (e.g. `/series/[slug]`, `/repacks`) — every page inherits the single root title/description. **SEO gap** for dynamic pages.
- No structured data (JSON-LD) for products/series.

## Sitemap & robots

- **No `app/sitemap.ts`, `app/robots.ts`, `public/sitemap.xml`, or `public/robots.txt`.** Search engines get no sitemap and no crawl directives. **Gap** (MEDIUM).

## Image optimization

- `next.config.js` sets `images.unoptimized: true` → **Next.js image optimization is disabled**; images served as-is. `remotePatterns` allows any HTTPS host (`https://**`).
- Pack art is local PNG in `public/images/packs/` (4×6); `RepackCard` uses `next/image` with `fill` + `sizes` (good responsive hints) but optimization is off, so large source files ship at full weight.
- Hero image is a remote Unsplash URL (`app/page.tsx`).

## Performance concerns (from code)

- **Unoptimized images** (above) — largest likely win; consider enabling Next image optimization or pre-compressing pack art.
- **Large client bundles / pages:** `app/checkout/page.tsx` 936 lines, `app/checklist/page.tsx` 572, several builder/admin client components 500+ (see `11`). The checklist page fetches **all dates then batches a checklist call per date** (N requests) to build counts — heavy client-side work.
- **`cache: 'no-store'`** on inventory fetches (e.g. featured series) — always fresh, no CDN caching of that data.
- Many `console.log`s ship to the client in some components (see `11`).

## Analytics

- **None detected.** No Google Analytics / GA4, Plausible, Vercel Analytics, Segment, or Meta Pixel in code or layout. TBD - Griff to clarify whether analytics is injected via Netlify/GTM externally.

## Quick wins

1. Add `app/robots.ts` + `app/sitemap.ts`.
2. Add `openGraph`/`twitter` + an OG image to root metadata; add per-page `metadata` (esp. series/product/repacks).
3. Reconsider `images.unoptimized: true`; tighten `remotePatterns`.
4. Add an analytics provider if desired.
