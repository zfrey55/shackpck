# 11 — Known Issues & Tech Debt

Severity: **CRITICAL / HIGH / MEDIUM / LOW**. Findings are from a static scan of `app/`, `components/`, `lib/`, `prisma/`, `scripts/`, and config (node_modules excluded).

> **Verified against the tree 2026-09-18.** This file predated the auth,
> rate-limiting, builder and migration work, and much of it was closed by that
> work. Every line below is now marked **[still true]**, **[CLOSED]** with the
> commit that closed it, or **[corrected]** where the original claim was wrong.
> Closed items are kept rather than deleted so the file reads as a record.

## Secrets
- **[corrected] Two scripts embed a real Postgres connection string.** The earlier "no hardcoded secrets found" was wrong: `scripts/get-supabase-connection.js` and `scripts/update-db-connection.js` each contain a credentialed URL (last changed `4e4a430`, 2026-02-12). Neither password matches the live production credential and neither points at the production host (checked 2026-09-18 against `coins/.env.prod.local` without printing either), so it is **stale credential material, not a live leak** — no rotation needed, but strip it from git. `scripts/setup-env.js` and `scripts/verify-db-connection.js` hold `[YOUR-PASSWORD]` placeholders only. Application code is clean: all credentials read from `process.env`, `env.production.template` has placeholders only, CI uses fake keys. See `15-backlog.md` *Admin access §3*.

## CRITICAL
- None identified.

## HIGH
- **[CLOSED `3703b52`] Public, unauthenticated debug/test endpoints.** `/api/test-email` (could send mail to any address), `/api/test-sendgrid`, `/api/test-fedex`, `/api/test-inventory`, `/api/debug-inventory`, `/api/simple-test`, `/api/basic-test`, and the pages `/test` and `/print-zpl` were all removed. Confirmed absent 2026-09-18.

## MEDIUM
- **[still true, corrected refs] Hardcoded ShackHQ Cloud Functions URL** (bypasses `COIN_INVENTORY_API_BASE_URL`) in `app/checklist/api.ts:8`. The other two sites named here are gone: `app/checklist-backup/` and `app/api/simple-test/` no longer exist. `lib/coin-inventory-api.ts:5` and `lib/inventory-api-push.ts:7` read the env var with the URL only as a **fallback**, which is the pattern to copy. The `checklist/api.ts` literal is deliberate for now — moving it needs a `NEXT_PUBLIC_` variable plus a Netlify config change (see `15-backlog.md` §4).
- **[still true] Org id `coin-shack` hardcoded** across inventory clients (`app/checklist/api.ts:17`, `lib/coin-inventory-api.ts:7`, `lib/inventory-api-push.ts:9`), not env-driven. LOW/MEDIUM if multi-tenant is ever needed.
- **[corrected] Large files (>500 lines)** — recounted 2026-09-18: `lib/card-series-checklist.ts` (1841, data), `app/checkout/page.tsx` (936), `scripts/test-card-api-adapter.ts` (695, fixture), `lib/repack-catalog.ts` (693, data), `app/api/orders/route.ts` (572), `lib/email.ts` (567). `components/builder/BuilderShell.tsx` is now 322 (`07d442c`), `app/admin/builds/AdminBuildsClient.tsx` is under 500, and `app/checklist/page.tsx` is **24 lines**, not 572 — the work moved into `ChecklistClient.tsx` (474). Real refactor candidates: `checkout/page.tsx`, `orders/route.ts`, `email.ts`.
- **[CLOSED, SEO phase 1] SEO gaps.** `robots.ts` (`f0b7cf3`), `sitemap.ts` (`2cde71d`), Open Graph/Twitter/canonical (`2a85c06`), Organization+WebSite JSON-LD (`ce9039f`), `llms.txt` (`7e69f69`). **[still true]** Per-page `metadata` still exists only on `/build`, `/my-builds` and `/admin/builds` — no public SEO surface has one; that is phase 2. The larger open gap is that `/repacks`, `/checklist` and `/series` serve ~330 characters of HTML (nav, footer, "Loading…"), so a crawler gets no content from them at all. See `08`.
- **[CLOSED `1418d91`] `next.config.js` image settings.** `images.unoptimized: true` is gone (optimization works on this deploy via `@netlify/plugin-nextjs` v5), and `remotePatterns` is now a single allow-listed host, `images.unsplash.com`, instead of `https://**`.
- **[corrected] Missing-art placeholders.** `shackpack-summit.png` exists again and its catalog entry points at it. `shackpack-inception` is no longer in the catalog at all. **No catalog entry uses `usePlaceholder: true` today** (0 occurrences), so there are no visible art gaps.

## LOW
- **[CLOSED `95f0633`] Redundant `(site)` route group.** `app/(site)/layout.tsx` + `app/(site)/page.tsx` are deleted. Worth recording why it mattered: `(site)/page.tsx` was `export { default } from '../page'`, so **both files mapped to `/`** in `app-path-routes-manifest.json`. Next 14 accepted the collision with no error and no warning and resolved it in favour of `app/page.tsx` (confirmed on prod: one `<nav>`, not two). It was a silent duplicate, not just dead weight.
- **[CLOSED `a4fcf81`] Orphan component `components/ChecklistUpload.tsx`** — deleted.
- **[still true, found 2026-09-19] Footer social links are `#` placeholders.** All three — `components/Footer.tsx:32-34`, labelled X, Instagram and Facebook — are `<Link href="#">`. They render as clickable and go nowhere. This is why the `Organization` JSON-LD added in `ce9039f` omits `sameAs`: there are no profile URLs to assert. Supply the real URLs, or drop the block.
- **[still true, found 2026-09-19] `scripts/test-api.js` is dead.** It is not a fixture test despite the `test-` prefix: it hits `localhost:3000` and `require`s `node-fetch`, which is **not installed**, so it cannot run at all. The real fixture set is the seven `scripts/test-*.ts` files. Delete it or rewrite it against the built-in `fetch`.
- **[corrected] `components/SeriesCard.tsx` is now an orphan, not a duplicate.** Nothing imports it; `app/series/page.tsx` defines its own local `SeriesCard` (line 154). Delete the component or make the page use it.
- **[CLOSED `3703b52`] `app/checklist-backup/`** — removed, along with the `scripts/*.ps1` Zebra scripts.
- **[CLOSED `a4fcf81`] Debug `console.log`s in client code.** **Zero** `console.log` calls remain in any `.tsx` under `app/` or `components/` (`FeaturedSeriesSection.tsx` is down to a single `console.error`). Repo-wide console statements are **311**, not 572, and are now overwhelmingly server-side error logging in `lib/` and API routes.
- **TODO/placeholders still open:**
  - `lib/inventory-api-push.ts:105` — admin-alert email not actually sent (placeholder).
  - `lib/email.ts:548` — SendGrid Marketing API (newsletter) not implemented.
  - `lib/coin-inventory-api.ts:116,139,165` — `getSeries`/`getSeriesSales`/DB-sync endpoints pending on the inventory side.
  - `app/api/webhooks/stripe/route.ts:100,120` — loyalty points hardcoded at 1/dollar, and a comment promising "a placeholder order" that is never created. See `15-backlog.md` §6c — both are checkout blockers.

  *(Line numbers re-verified 2026-09-18.)*
- **[still true] Accessibility:** icon-only buttons lacking `aria-label` (`CartDropdown.tsx:46,62`, `Toast.tsx:31`); generic `alt="Thumbnail"` in `ProductGallery.tsx:22`. No `aria-label` appears in either file.
- **[corrected] New-brand pack metadata.** The `coinCount: "See checklist"` placeholder is gone — **0 occurrences** in `lib/repack-catalog.ts`. Fortune Forge / Bald Bunny / Lincoln Reserve entries now carry the shared checklist disclaimer and a brand, with per-pack specs deliberately left to the checklist (see `12`).
- **[still true] No Prettier config** — formatting unenforced.

## Suggested priority order
1. ~~Gate/remove public test endpoints~~ — **done** (`3703b52`).
2. Strip the two embedded connection strings from `scripts/` (Secrets, above).
3. Centralize the inventory base URL + org id behind env (MEDIUM).
4. Add SEO basics (robots/sitemap/OG) (MEDIUM).
5. Refactor the remaining 500+ line code files; delete the orphan `SeriesCard.tsx` and the `(site)` route group (LOW).
