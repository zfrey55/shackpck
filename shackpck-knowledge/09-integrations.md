# 09 — Integrations

Status legend: **Active** (wired + used), **Partial** (works but has TODO/gaps), **Scaffold/Debug** (test-only or stub).

| Service | Purpose | Code location | Env vars | Status |
|---|---|---|---|---|
| **ShackHQ Coin-Inventory Cloud Functions** | Read featured/all series + daily checklists; write sales + user sync | `lib/coin-inventory-api.ts`, `lib/inventory-api-push.ts`, `app/checklist/api.ts`, `/api/series*`, `/api/sync/series`, `/api/cart/validate`, `/api/orders` | `COIN_INVENTORY_API_BASE_URL` (optional; URL hardcoded as fallback). Org id `coin-shack` hardcoded | **Active** (some endpoints `getSeries`/`getSeriesSales` marked TODO/may be unbuilt) |
| **PostgreSQL (Prisma)** | Users, orders, builds, addresses, Series mirror | `lib/db.ts`, `prisma/schema.prisma` | `DATABASE_URL` | **Active** |
| **Stripe** | PaymentIntents, checkout, webhook | `/api/checkout/create-intent`, `/api/orders`, `/api/webhooks/stripe`, `app/checkout/` | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` | **Active** |
| **SendGrid** | Transactional email (welcome, order, admin, contact, build) | `lib/email.ts`, `/api/contact`, others | `SENDGRID_API_KEY`, `FROM_EMAIL`, `FROM_NAME`, `ADMIN_EMAIL` | **Active** (Marketing API newsletter = TODO, `lib/email.ts:651`) |
| **FedEx** | Shipping label (PDF/ZPLII) on order | `lib/fedex.ts`, `/api/orders`, `/api/webhooks/stripe`, `/api/test-fedex` | `FEDEX_KEY`, `FEDEX_PASSWORD`, `FEDEX_ACCOUNT_NUMBER`, `FEDEX_METER_NUMBER`, `FEDEX_ENVIRONMENT`, `FEDEX_SHIPPER_*` | **Partial** — prod credentials gated on FedEx API validation (`env.production.template` TODO) |
| **Netlify Blobs** | Builder artwork storage/serving | `/api/build/[id]/artwork`, `/api/build/artwork/[...key]` | `NETLIFY_BLOBS_SITE_ID`, `NETLIFY_BLOBS_TOKEN` (auto on Netlify) | **Active** |
| **NextAuth** | Auth/session (credentials, JWT) | `lib/auth.ts`, `/api/auth/[...nextauth]` | `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `AUTH_TRUST_HOST`, `ADMIN_EMAILS` | **Active** |
| **Local ZPL/Zebra printing** | Print labels to a local Zebra printer | `/api/print-zpl`, `/api/print-zpl-direct`, `app/print-zpl/page.tsx`, `scripts/*.ps1` | — | **Scaffold/Debug** (Windows/PowerShell, internal use) |
| **Supabase** | (DB host only, if used) | scripts `get-supabase-connection.js`, `update-db-connection.js`; README | `DATABASE_URL` | **Not an SDK integration** — see note |

## ShackHQ push detail (`lib/inventory-api-push.ts`)
- `recordPackSale` — POST on successful order; 3× retry with exponential backoff; on final failure logs an "ADMIN ALERT" (actual alert email is a **TODO/placeholder**, line 103).
- `syncUser` — POST on user creation (incl. shadow users) for CRM; non-blocking, 3× retry.

## Supabase note
No `@supabase/supabase-js`; no Supabase Auth/Storage/Realtime. Supabase, if present, is only the **managed Postgres host** behind `DATABASE_URL`, accessed via Prisma. Confirm — TBD - Griff to clarify. See `04`.

## Debug/test endpoints (public, unauthenticated)
`/api/test-email`, `/api/test-sendgrid`, `/api/test-fedex`, `/api/test-inventory`, `/api/debug-inventory`, `/api/simple-test`, `/api/basic-test`. Flagged in `11` (test-email can send to arbitrary addresses).

## Not found in repo (brief mentioned)
- **n8n** webhooks, dedicated CRM SDK, Gmail API, metals-price feed — none in this codebase. Likely ShackHQ-side. TBD - Griff to clarify.
