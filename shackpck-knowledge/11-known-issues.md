# 11 — Known Issues & Tech Debt

Severity: **CRITICAL / HIGH / MEDIUM / LOW**. Findings are from a static scan of `app/`, `components/`, `lib/`, `prisma/`, `scripts/`, and config (node_modules excluded).

## Secrets
- **No hardcoded secrets found.** ✅ All credentials read from `process.env`; `env.production.template` contains placeholders only; CI uses fake placeholder keys. (No CRITICAL secret items.)

## CRITICAL
- None identified.

## HIGH
- **Public, unauthenticated debug/test endpoints in production build.** `/api/test-email` can send email to **any address** (spam/abuse vector); `/api/test-sendgrid`, `/api/test-fedex`, `/api/test-inventory`, `/api/debug-inventory`, `/api/simple-test`, `/api/basic-test` expose config/behavior. Also debug pages `/test`, `/print-zpl`. **Fix:** gate behind `role=ADMIN` or strip from prod.

## MEDIUM
- **Hardcoded ShackHQ Cloud Functions URL** (bypasses `COIN_INVENTORY_API_BASE_URL`) in `app/checklist/api.ts:3`, `app/checklist-backup/api.ts:3`, `app/api/simple-test/route.ts:9`. If ShackHQ endpoints move, these break. `lib/coin-inventory-api.ts` / `lib/inventory-api-push.ts` / `app/api/debug-inventory` already use the env var correctly — make all consistent.
- **Org id `coin-shack` hardcoded** across inventory clients (not env-driven). LOW/MEDIUM if multi-tenant ever needed.
- **Large files (>500 lines)** — refactor candidates: `app/checkout/page.tsx` (936), `lib/email.ts` (670), `app/checklist/page.tsx` (572), `app/api/orders/route.ts` (570), `components/builder/BuilderShell.tsx` (533), `app/admin/builds/AdminBuildsClient.tsx` (524).
- **SEO gaps:** no `robots.ts`/`sitemap.ts`, no Open Graph/Twitter meta, no per-page metadata, no JSON-LD. See `08`.
- **`next.config.js` `remotePatterns` wildcard** (`https://**`) allows any HTTPS image host; `images.unoptimized: true` ships full-size images. See `08`.
- **Missing-art placeholders:** `shackpack-summit.png` and `shackpack-inception.png` were removed; catalog entries fall back to the branded placeholder pending re-upload (intentional, but visible gaps).

## LOW
- **Redundant `(site)` route group:** `app/(site)/layout.tsx` + `app/(site)/page.tsx` duplicate the root layout/home — likely legacy; remove or consolidate.
- **Orphan component:** `components/ChecklistUpload.tsx` is never imported.
- **Duplicate component:** `components/SeriesCard.tsx` vs a locally-redefined SeriesCard in `app/series/page.tsx`.
- **`app/checklist-backup/`** appears to be a stale backup of the checklist page/api.
- **Debug `console.log`s in client code:** notably `components/FeaturedSeriesSection.tsx` (~15 calls); 572 console statements repo-wide (most are legitimate server-side error logs in `lib/`, but client debug logs should be removed).
- **TODO/placeholders still open:**
  - `lib/inventory-api-push.ts:103` — admin-alert email not actually sent (placeholder).
  - `lib/email.ts:651` — SendGrid Marketing API (newsletter) not implemented.
  - `lib/coin-inventory-api.ts:118,141,167` — `getSeries`/`getSeriesSales`/DB-sync endpoints pending on the inventory side.
- **Accessibility:** icon-only buttons lacking `aria-label` (`CartDropdown.tsx:46,62`, `Toast.tsx:31`); generic `alt="Thumbnail"` in `ProductGallery.tsx:22`.
- **New-brand pack metadata is placeholder** (`coinCount: "See checklist"`, generic categories) for Fortune Forge / Bald Bunny / Lincoln Reserve — needs real specs (see `12`).
- **No Prettier config** — formatting unenforced.

## Suggested priority order
1. Gate/remove public test endpoints (HIGH).
2. Centralize the inventory base URL + org id behind env (MEDIUM).
3. Add SEO basics (robots/sitemap/OG) (MEDIUM).
4. Refactor 500+ line files; remove orphan/duplicate/backup files & client debug logs (LOW).
