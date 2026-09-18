# 10 — Conventions

## File naming

- **Components:** `PascalCase.tsx` (`RepackCard.tsx`, `BrandTabs.tsx`, `FeaturedSeriesSection.tsx`).
- **Client sub-trees:** `*Client.tsx` (`RepacksClient.tsx`, `MyBuildsClient.tsx`, `AdminBuildsClient.tsx`).
- **lib modules / data:** `kebab-case.ts` (`repack-catalog.ts`, `coin-inventory-api.ts`, `checklist-case-labels.ts`).
- **Routes:** App Router files `page.tsx` / `route.ts` / `layout.tsx`; dynamic dirs `[slug]`, `[id]`, `[category]`, `[...key]`.
- **Path alias:** `@/*` → `coins/*` (tsconfig). Imports use `@/components/...`, `@/lib/...`.

## Component patterns

- **Server components by default;** add `"use client"` only where interactivity/hooks are needed. Pages that need `useSearchParams` wrap the client tree in `<Suspense>` (e.g. `/repacks`, `/checklist`).
- Provider stack in root layout: `SessionProvider` → `CartProvider` → `ToastProvider`.
- Tailwind utility classes inline; `clsx` for conditional classes. Shared tokens via `tailwind.config.ts` (`gold`, `charcoal`, `glow`).
- Catalog/data kept out of components in `lib/*` modules with exported types and helper functions (e.g. `getCoinPacksForBrand`, `brandForCaseType`).

## Async handling

- `async/await` throughout. External calls use `fetch`; inventory writes retry with **exponential backoff** (`inventory-api-push.ts`).
- Inventory reads often `cache: 'no-store'` for freshness.
- API routes that need Node APIs set `export const runtime = 'nodejs'` (e.g. `/api/contact`). Some routes use `dynamic = 'force-dynamic'`.

## Error handling

- API routes: `try/catch` → `NextResponse.json({ error }, { status })`. **Zod** validation returns 400; missing-config returns 503 (contact form).
- External-service failures are typically **non-blocking** (order succeeds even if FedEx label or inventory push fails; failures logged).
- Client forms keep `error`/`isSubmitting` state and show inline messages.
- UI states standardized in checklist via `LoadingState` / `ErrorState` / `EmptyState` components.

## Linting & formatting

- **ESLint** via `eslint-config-next` (`npm run lint`). No custom `.eslintrc` rules observed beyond Next defaults.
- **No Prettier config** found — formatting is by convention (2-space indent), not enforced. (Minor inconsistency risk.)
- **TypeScript** `strict` (tsconfig) — `tsc` clean is the de-facto gate.

## Git & CI conventions

- **Conventional Commits** in history: `feat(...)`, `fix(...)`, `chore(...)` with scopes (e.g. `feat(cards):`, `fix(auth/email):`).
- Default branch **`main`**; feature work on branches (e.g. `feat/brand-customer-packs`).
- **CI** (`.github/workflows/ci.yml`): every push/PR to `main` runs Postgres service → `npm ci` → `prisma db push` → `lint` → `build`. A green build requires lint + production build to pass.
- Secrets never committed (`.gitignore` blocks `.env*`); `env.production.template` holds placeholder names only.

## Auth helpers (use these; do not re-implement)

- **`lib/safe-redirect.ts` — `safeRedirectPath(value, origin, fallback = '/account')`.** Every post-auth redirect target goes through it: the NextAuth `redirect` callback in `lib/auth.ts` and the sign-in page's `callbackUrl`. It returns only a same-origin relative path. It rejects `//`, backslashes, whitespace and control characters, and other schemes; resolves the value against the origin and requires the origin unchanged; reduces a same-origin absolute URL to its path; and never throws (anything else gets the fallback). Fixtures: `scripts/test-safe-redirect.ts`.
- **`lib/normalize-email.ts` — `normalizeEmail()` (trim + lowercase) and `emailWhere()`.** Normalize every email you write (register, guest-checkout shadow users, the inventory user push). Look users up with `prisma.user.findFirst({ where: emailWhere(email) })`, which also matches case-insensitively, never `findUnique({ where: { email } })`. The `User.email` unique constraint is case-sensitive. `scripts/lowercase-emails.ts` (env `DATABASE_URL` only, `--dry-run`, stops on collisions, counts only) normalizes existing rows.
- **`lib/require-admin.ts`.** The only admin check, and it reads the **database** role by session user id:
  - API routes: `const gate = await requireAdmin(); if (!gate.ok) return gate.response;` (401 signed out, 403 not admin; `gate.user` is `{ id, email }`).
  - Server pages: `await requireAdminPage('/path')` (signed out -> `/auth/signin?callbackUrl=/path`, non-admin -> `/account`).
  - `isAdminRequest()` (soft check, e.g. `/api/series?active=false`) and `isAdminUserId(id)` (artwork route).
  - Never gate on the session token's `role`; it goes stale until the user signs in again. Admin pages gate server-side, and their client components assume the gate passed.

## Rate limiting

- **`lib/rate-limit.ts`**: `await rateLimit(bucket, identifier)` returns `{ ok: true }` or `{ ok: false, retryAfterSec }`; `tooManyRequests(body, retryAfterSec)` builds the 429 with `Retry-After`. Identifiers: `ipIdentifier(clientIp(request.headers))` (Netlify's `x-nf-client-connection-ip`, then the first `x-forwarded-for` entry) and `emailIdentifier(email)` (SHA-256 of the normalized email, so no address ever reaches Upstash).
- **It fails open, always.** Env unset, store error or 1 s timeout -> the request is allowed and a `[rate-limit]` line is logged. Never make it fail closed: it must not block a real lead.
- Limits live in `RATE_LIMITS`: contact 5/10 min/IP (runs before validation and before saving), register 5/hour/IP, credentials sign-in 10/10 min per IP **and** per email (every attempt counts, in the `[...nextauth]` POST wrapper), checkout create-intent 10/10 min/IP. Put a new limit at the very top of the handler.
- Keys: `shackpck:<CONTEXT or NODE_ENV>:rl:<bucket>:<identifier>`, so deploy previews and dev never share production counters.
- Development is a no-op unless `RATE_LIMIT_ENABLED=true`; use `RATE_LIMIT_STORE=memory` for local checks and `RATE_LIMIT_FAKE_ERROR=true` to exercise fail-open. Both switches are ignored in production.

## Fixtures run before every commit

`npx tsx scripts/test-card-api-adapter.ts`, `scripts/test-clean-entry-name.ts`, `scripts/test-series-numbering.ts`, `scripts/test-safe-redirect.ts`, `scripts/test-rate-limit.ts`, `scripts/test-builder-draft.ts`, plus `tsc --noEmit` and `npm run lint`.

## Database schema changes (migrations)

Prod is migration-tracked (`prisma/migrations`, baselined 2026-09-18). **Do not use `prisma db push` against prod any more** — it would drift from the migration history.

1. **Change `schema.prisma`, then generate the migration locally:**
   `npm run db:migrate` (`prisma migrate dev --name <what-changed>`), which writes `prisma/migrations/<timestamp>_<name>/migration.sql` and applies it to the local database.
2. **Read the generated SQL before committing it.** It is the thing that will run against production. Anything destructive (a dropped column or table, a narrowed type, a new NOT NULL without a default) should be a deliberate, separate migration — see backward compatibility below.
3. **Commit the migration with the code**, so CI applies it to its throwaway Postgres with `prisma migrate deploy`. A missing or broken migration fails the PR.
4. **Apply to production BEFORE deploying the code that needs it:** `npm run db:migrate:prod`. It reads `coins/.env.prod.local` (never printing it), refuses to run against localhost, off `main`, or with a dirty working tree, prints `migrate status` first, then runs `migrate deploy`.
5. **Run the RLS guard and enable RLS on anything new** (below), then deploy the code.

**Backward compatibility is what makes "migrate first, deploy second" safe.** Between step 4 and step 5 the *old* code is running against the *new* schema, so each migration must work for both: add columns nullable or with a default, add tables freely, and do renames as add-then-backfill-then-drop across separate deploys. There is no rollback path: `migrate deploy` only rolls forward, so a bad migration is fixed by writing another one.

**Migrations never run in the Netlify build.** Concurrent builds would race, a failure would leave the schema half-applied while the previous deploy stayed live, deploy previews share the same environment values and would migrate production, and a build log is a bad place to recover from a failed migration. The build stays `prisma generate && next build`, which needs no database.

**Baselining (done once, 2026-09-18):** prod already had the tables but no `_prisma_migrations`, so `0_init` was generated with `prisma migrate diff --from-empty --to-schema-datamodel` and recorded with `prisma migrate resolve --applied 0_init`, which writes the history row without running the SQL. Verified beforehand that prod had zero drift from the schema.
- **After every prod migration, run the RLS guard against prod and enable RLS on any new table:**
  `DATABASE_URL=<prod url, loaded from coins/.env.prod.local> npx tsx scripts/check-rls.ts`
  It lists every `public` table with row level security off and exits non-zero if there are any. Fix each with `ALTER TABLE "<Table>" ENABLE ROW LEVEL SECURITY;` (no policies), then rerun it until it exits 0.
- Why: Supabase grants the `anon` and `authenticated` roles full privileges on every new `public` table, so a new table is readable and writable through the Supabase Data API until RLS is on. The app connects as `postgres`, which bypasses RLS, so enabling it does not affect the site.
- The script reads `DATABASE_URL` from the environment only and never prints it. It is **not in CI**: CI runs against its own throwaway local Postgres, where RLS is off and nothing is exposed.
- **It stays a manual step on purpose.** RLS is a property of the production database, not of the schema: Prisma migrations do not describe it, so nothing in the migration history would recreate or verify it. It also catches tables Prisma creates for itself — baselining added `_prisma_migrations`, the guard flagged it, and RLS was enabled on it (2026-09-18).
