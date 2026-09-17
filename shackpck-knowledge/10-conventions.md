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

## Database schema changes (Supabase RLS)

- Prod schema changes go through `prisma db push`, with `DATABASE_URL` taken **explicitly** from `coins/.env.prod.local`. `coins/.env` points at the local Postgres, and the Prisma CLI loads it automatically.
- **After every prod `prisma db push`, run the RLS guard against prod and enable RLS on any new table:**
  `DATABASE_URL=<prod url, loaded from coins/.env.prod.local> npx tsx scripts/check-rls.ts`
  It lists every `public` table with row level security off and exits non-zero if there are any. Fix each with `ALTER TABLE "<Table>" ENABLE ROW LEVEL SECURITY;` (no policies), then rerun it until it exits 0.
- Why: Supabase grants the `anon` and `authenticated` roles full privileges on every new `public` table, so a new table is readable and writable through the Supabase Data API until RLS is on. The app connects as `postgres`, which bypasses RLS, so enabling it does not affect the site.
- The script reads `DATABASE_URL` from the environment only and never prints it. It is **not in CI**: CI runs against its own throwaway local Postgres, where RLS is off and nothing is exposed.
