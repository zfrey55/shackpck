# 04 — Data Sources

## 1. ShackHQ Coin-Inventory Cloud Functions (primary external read/write)

- **Base URL:** `https://us-central1-coin-inventory-8b79d.cloudfunctions.net` (Firebase/GCP Cloud Functions). Org id: **`coin-shack`**.
- **Connection:** plain `fetch` (REST), no auth header observed (org id passed as query/body). Configurable via `COIN_INVENTORY_API_BASE_URL`, but **only some files read the env var** (others hardcode the URL — see `11`).
- **Clients:**
  - `lib/coin-inventory-api.ts` (reads): `getFeaturedSeries`, `getSeries?active=true`, `getSeriesSales`. `getSeries`/`getSeriesSales` are marked TODO ("once it's created") — may not be live yet.
  - `lib/inventory-api-push.ts` (writes): `recordPackSale` (push sale, 3× retry + exp. backoff), `syncUser` (push user for CRM, non-blocking).
  - `app/checklist/api.ts` (reads): daily checklist + available dates (hardcodes base URL).
- **What the site does with it:**
  - Featured series → home page + `/series` + checklist "Featured Series" section.
  - Daily checklist (case type + display date → coins) → `/checklist`.
  - On order success → push `recordPackSale`; on user create → `syncUser`.
- Endpoints named in the audit brief (`getInventoryStats`, `getFeaturedCoins`, `getMetalsPrices`) were **not found** in this repo — TBD - Griff to clarify if used elsewhere.

## 2. PostgreSQL via Prisma (primary internal store)

- `prisma/schema.prisma`, `provider = postgresql`, `url = env("DATABASE_URL")`. Client in `lib/db.ts`.
- **Models:** `User` (incl. shadow/guest users, roles, loyalty, Stripe customer id), `Address`, `Series` (local mirror of inventory series incl. `coinInventorySeriesId`, `caseType`, `displayDate`, `topHits` JSON), `SeriesPurchase` (per-user pack-limit tracking), `Order`, `OrderItem`, `Build`, `BuildLine`. Enums: `UserRole`, `PaymentStatus`, `LabelStatus`, `BuildStatus`.
- `/api/series*` use an **inventory-first, DB-fallback** pattern.

## 3. Stripe (payments)

- `lib/` + `@stripe/*`. Used by `/api/checkout/create-intent`, `/api/orders`, `/api/webhooks/stripe`, `/checkout`.
- Env: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`.

## 4. SendGrid (email)

- `lib/email.ts` (+ `@sendgrid/mail`). Welcome, order confirmation, admin notifications, contact inquiries, build-submission emails.
- Env: `SENDGRID_API_KEY`, `FROM_EMAIL`, `FROM_NAME`, `ADMIN_EMAIL`. `/api/contact` returns 503 if any are missing.

## 5. FedEx (shipping labels)

- `lib/fedex.ts`. Label generation (PDF / ZPLII) on successful order; non-blocking.
- Env: `FEDEX_KEY`, `FEDEX_PASSWORD`, `FEDEX_ACCOUNT_NUMBER`, `FEDEX_METER_NUMBER`, `FEDEX_ENVIRONMENT`, `FEDEX_SHIPPER_*`.

## 6. Netlify Blobs (file storage)

- `@netlify/blobs`. Stores/serves ShackPack Builder artwork (`/api/build/[id]/artwork`, `/api/build/artwork/[...key]`).
- Env (auto-injected on Netlify): `NETLIFY_BLOBS_SITE_ID`, `NETLIFY_BLOBS_TOKEN`.

## 7. NextAuth (sessions)

- `lib/auth.ts`, credentials provider, JWT strategy, bcrypt. `ADMIN_EMAILS` auto-promotes to ADMIN.

## Supabase status

- **Configured-as-host at most, not connected as an SDK.** No `@supabase/supabase-js`, no Supabase Auth/Storage/Realtime. The DB is reached purely through Prisma + `DATABASE_URL`, which **may** point at Supabase Postgres (helper scripts `get-supabase-connection.js`, `update-db-connection.js` suggest this). Confirm host — TBD - Griff to clarify.

## Static/in-repo data

- Pack catalogs and labels are **hardcoded** in `lib/repack-catalog.ts`, `lib/card-repack-catalog.ts`, `lib/brands.ts`, `lib/card-checklist-data.ts`, `lib/checklist-case-labels.ts` (see `07`, `12`).
