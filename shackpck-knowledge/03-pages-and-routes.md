# 03 — Pages & Routes

App Router. All pages inherit the root layout (NavBar + Footer). Gating is via feature flags (`lib/feature-flags.ts`), NextAuth session, and admin role. API routes: see `04`/`09`.

## Site map (by importance)

| Route | File | Purpose | Access |
|---|---|---|---|
| `/` | `app/page.tsx` | Home: hero, **Shop by Brand**, featured series, coin + card repacks | Public |
| `/repacks` | `app/repacks/page.tsx` → `RepacksClient.tsx` | Pack catalog with **customer-brand tabs** (`?brand=`), ShackPack Coins/Cards sub-toggle | Public |
| `/checklist` | `app/checklist/page.tsx` | Live per-brand checklists (case type → date → coin grid); Cards tab shows example card checklists | Public |
| `/series` | `app/series/page.tsx` | Active/past dated Series list | Public (reads `isDirectPurchaseEnabled()`) |
| `/series/[slug]` | `app/series/[slug]/page.tsx` | Series detail: coins, top hits, buy | Public; param `slug` |
| `/build` | `app/build/page.tsx` | ShackPack Builder (custom case designer); loads draft via `?id=` | **Gated** (builder auth) |
| `/my-builds` | `app/my-builds/page.tsx` | User's saved builds (edit/dup/archive/submit) | **Gated** |
| `/contact` | `app/contact/page.tsx` | Contact / inquiry form | Public |
| `/policy` | `app/policy/page.tsx` | Policies / legal | Public |
| `/shop` | `app/shop/page.tsx` | Category selector (Gold/Silver/Rare) | Public |
| `/shop/[category]` | `app/shop/[category]/page.tsx` | Category browse | Public; param `category` |
| `/product/[slug]` | `app/product/[slug]/page.tsx` | Product detail (SSG, sample slugs); scaffold | Public; param `slug` |
| `/checkout` | `app/checkout/page.tsx` | Stripe payment + shipping (936 lines) | **Gated** by `isCheckoutEnabled()` |
| `/checkout/success` | `app/checkout/success/page.tsx` | Order confirmation; `?payment_intent=` | Public (query-driven) |
| `/account` | `app/account/page.tsx` | Orders, addresses, loyalty | **Gated** (session; redirects to signin) |
| `/auth/signin` | `app/auth/signin/page.tsx` | Sign in (NextAuth credentials) | Gated by `isAccountsEnabled()` |
| `/auth/register` | `app/auth/register/page.tsx` | Register account | Public |
| `/admin` | `app/admin/page.tsx` | Admin dashboard | **Gated** (role=ADMIN) |
| `/admin/builds` | `app/admin/builds/page.tsx` → `AdminBuildsClient.tsx` | Builder inquiries (524 lines) | **Gated** (role=ADMIN) |

## Debug / internal (consider removing or gating in prod — see `11`)

| Route | File | Purpose |
|---|---|---|
| `/test` | `app/test/page.tsx` | Service test dashboard (SendGrid/FedEx/email) |
| `/print-zpl` | `app/print-zpl/page.tsx` | ZPL label printer UI (Zebra) |
| `/checklist-backup` | `app/checklist-backup/page.tsx` | Legacy checklist backup (appears unused) |

## Dynamic / catch-all / 404

- Dynamic params: `[slug]` (series, product), `[category]` (shop), `[id]` (build/address), catch-all `[...key]` (build artwork), `[...nextauth]` (auth).
- **No custom `not-found.tsx`** → Next.js default 404. No site-wide catch-all route.
- **No `sitemap.ts` / `robots.ts`** (see `08`).

## Route-group note

- `app/(site)/page.tsx` re-exports the home page and `app/(site)/layout.tsx` re-adds NavBar/Footer — redundant with the root layout/home. Likely legacy; flagged in `11`.
