# 09 — Integrations

Status legend: **Active** (wired + used), **Partial** (works but has TODO/gaps), **Scaffold/Debug** (test-only or stub).

> **Verified against the tree 2026-09-18.** Three rows changed status; the
> debug-endpoint section is closed. Changes are called out inline.

| Service | Purpose | Code location | Env vars | Status |
|---|---|---|---|---|
| **ShackHQ Coin-Inventory Cloud Functions** | Read featured/all series + daily checklists; write sales + user sync | `lib/coin-inventory-api.ts`, `lib/inventory-api-push.ts`, `app/checklist/api.ts`, `/api/series*`, `/api/sync/series`, `/api/cart/validate`, `/api/orders` | `COIN_INVENTORY_API_BASE_URL` (optional; URL hardcoded as fallback in the two `lib/` clients, and hardcoded outright in `app/checklist/api.ts:8`). Org id `coin-shack` hardcoded | **Active** (`getSeries`/`getSeriesSales` still TODO/unbuilt upstream — `lib/coin-inventory-api.ts:116,139,165`) |
| **PostgreSQL (Prisma)** | Users, orders, builds, addresses, contact inquiries, Series mirror | `lib/db.ts`, `prisma/schema.prisma`, `prisma/migrations/` | `DATABASE_URL` | **Active** — migration-tracked since 2026-09-18 (`aa3acbc`); prod changes go through `npm run db:migrate:prod`, never `db push` (see `10`) |
| **Stripe** | PaymentIntents, checkout, webhook | `/api/checkout/create-intent`, `/api/orders`, `/api/webhooks/stripe`, `app/checkout/` | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` | **Partial** *(was Active)* — checkout is off in prod (`NEXT_PUBLIC_ENABLE_CHECKOUT`), and the flow has three open blockers: guest checkout 500s for a registered email, guest orders attach to registered accounts, and the webhook never creates the order it claims to. See `15-backlog.md` §6a/6b/6c |
| **SendGrid** | Transactional email (welcome, order, admin, contact, build) | `lib/email.ts`, `/api/contact`, others | `SENDGRID_API_KEY`, `FROM_EMAIL`, `FROM_NAME`, `ADMIN_EMAIL` | **Active** (Marketing API newsletter = TODO, `lib/email.ts:548` — line corrected) |
| **FedEx** | Shipping label (PDF/ZPLII) on order | `lib/fedex.ts`, `/api/orders`, `/api/webhooks/stripe` | `FEDEX_KEY`, `FEDEX_PASSWORD`, `FEDEX_ACCOUNT_NUMBER`, `FEDEX_METER_NUMBER`, `FEDEX_ENVIRONMENT`, `FEDEX_SHIPPER_*` | **Partial** — prod credentials still gated on FedEx API validation (`env.production.template` TODO). `/api/test-fedex` is gone (`3703b52`). Note the webhook generates a label it never persists (§6c) |
| **Netlify Blobs** | Builder artwork storage/serving | `/api/build/[id]/artwork`, `/api/build/artwork/[...key]`, `lib/builder/storage.ts` | `NETLIFY_BLOBS_SITE_ID` / `NETLIFY_BLOBS_TOKEN`, falling back to `NETLIFY_SITE_ID` / `NETLIFY_AUTH_TOKEN` (auto on Netlify) | **Active** — serving is gated on the build's owner or a **DB admin role**, not on the `ADMIN_EMAIL` inbox (`c6067a0`) |
| **NextAuth** | Auth/session (credentials, JWT) | `lib/auth.ts`, `/api/auth/[...nextauth]` | `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `AUTH_TRUST_HOST`; optional `SESSION_MAX_AGE_SECONDS` / `SESSION_UPDATE_AGE_SECONDS` (testing only) | **Active** — 8-hour **idle** session for everyone (`d0709a0`), `callbackUrl` passed through `safeRedirectPath`, and admin status read only from `User.role`. `ADMIN_EMAILS` was removed (`717ad57`) |
| **Upstash Redis** | Rate limiting (`@upstash/ratelimit` sliding window) | `lib/rate-limit.ts`, `/api/contact`, `/api/auth/register`, `/api/auth/[...nextauth]` (POST wrapper), `/api/checkout/create-intent`, `/api/build/[id]/submit` | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | **Active** (free tier, us-east-1; fails open). Buckets: `contact` 5/10m, `register` 5/h, `signin-ip` and `signin-email` 10/10m, `checkout` 10/10m, `build-submit` 5/h **per user id** |
| **Local ZPL/Zebra printing** | Print labels to a local Zebra printer | — | — | **REMOVED `3703b52`** *(was Scaffold/Debug)* — `/api/print-zpl`, `/api/print-zpl-direct`, `app/print-zpl/` and every `scripts/*.ps1` are gone. Recover with `git checkout 3703b52^ -- <path>` if the Zebra workflow comes back |
| **Supabase** | Managed Postgres host for production | `prisma/` via `DATABASE_URL`; `scripts/check-rls.ts`, `scripts/db-migrate-prod.mjs` | `DATABASE_URL` | **Confirmed** — DB host only, no SDK. See note |

## ShackHQ push detail (`lib/inventory-api-push.ts`)
- `recordPackSale` — POST on successful order; 3× retry with exponential backoff; on final failure logs an "ADMIN ALERT" (actual alert email is a **TODO/placeholder**, line 105 — line corrected).
- `syncUser` — POST on user creation (incl. shadow users) for CRM; non-blocking, 3× retry.

## Series sync endpoints are gated — added 2026-09-17
`/api/sync/series` (GET and POST) and `/api/series/sync-from-inventory` both run through `authorizeSync()` (`lib/sync-auth.ts`): an admin session, or an `x-sync-secret` header compared against `SYNC_SERIES_SECRET` with `timingSafeEqual` over SHA-256 digests. `/api/series?active=false` requires an admin session (`requireAdmin()`).

## Supabase note
**Resolved** — the earlier "confirm whether Supabase is used" TBD is answered: Supabase is the **managed Postgres host** behind `DATABASE_URL`, accessed only through Prisma. There is no `@supabase/supabase-js`, and no Supabase Auth/Storage/Realtime. Row Level Security is **ON for all 10 public tables** with 0 policies, and the app connects as an owner role that bypasses RLS — the guard against a future table being exposed to `anon`/`authenticated`, not against the app itself. See `10` and `15-backlog.md` *Supabase RLS state*.

## Debug/test endpoints — **CLOSED `3703b52`**
`/api/test-email`, `/api/test-sendgrid`, `/api/test-fedex`, `/api/test-inventory`, `/api/debug-inventory`, `/api/simple-test`, `/api/basic-test` and the pages `/test`, `/print-zpl` were all removed; confirmed absent 2026-09-18. `/api/test-email` could send mail to arbitrary addresses, which was the reason.

## Not found in repo (brief mentioned)
- **n8n** webhooks, dedicated CRM SDK, Gmail API, metals-price feed — still none in this codebase (re-checked 2026-09-18). Likely ShackHQ-side. TBD - Griff to clarify.
