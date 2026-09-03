# 01 — Stack

## Framework & language

- **Next.js 14.2.6** — App Router (`coins/app/`). Server + client components.
- **React 18.3.1 / React-DOM 18.3.1**
- **TypeScript 5.4.5**
- **Node 20** (set in `netlify.toml` and CI), **npm** (package-lock.json present)
- App lives in the **`coins/`** subdirectory (not repo root).

## Dependencies by purpose (from `coins/package.json`)

**UI / styling**
- `tailwindcss` 3.4 (+ `autoprefixer`, `postcss`)
- `@headlessui/react` 2.2 — accessible primitives (menus, dialogs)
- `@heroicons/react` 2.1 — icons
- `clsx` — class merging

**Data layer / DB**
- `@prisma/client` 5.19 + `prisma` 5.19 — ORM over PostgreSQL
- (No Supabase SDK — see Supabase note below)

**Auth**
- `next-auth` 4.24 — credentials provider, JWT sessions
- `bcryptjs` 2.4 — password hashing

**Payments**
- `stripe` 16.6 (server) + `@stripe/stripe-js` & `@stripe/react-stripe-js` 2.4 (client)

**Email**
- `@sendgrid/mail` 8.1 — transactional email

**Storage / files**
- `@netlify/blobs` 10.7 — ShackPack Builder artwork storage
- `pdf-lib` 1.17 — PDF generation (FedEx labels / ZPL handling)

**Forms / validation**
- `zod` 3.23 — request validation (e.g. `/api/contact`)

**Builder UX**
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` — drag-and-drop in the case Builder

**Dev / tooling**
- `eslint` 8 + `eslint-config-next`, `tsx` (run TS scripts), `@types/*`

## Build & dev commands (`package.json` scripts)

- `dev` → `next dev`
- `build` → `prisma generate && next build`
- `start` → `next start`
- `lint` → `next lint`
- `db:generate | db:push | db:migrate | db:studio` → Prisma workflows
- `seed` → `tsx scripts/seed-test-data.ts`
- `check-setup` → `tsx scripts/check-setup.ts`

## Hosting & deploy config

- **Netlify** + `@netlify/plugin-nextjs`. `netlify.toml`: `base = "coins"`, build `npm install && npm run build`, publish `.next`, `NODE_VERSION=20`, security headers.
- `next.config.js`: `images.unoptimized: true`, `remotePatterns` wildcard (`https://**`). See `08`/`11`.
- **CI** (`.github/workflows/ci.yml`): on push/PR to `main`, spins up Postgres 16, `npm ci` → `prisma db push` → `lint` → `build`, using placeholder env vars.

## Environment variables (names only — see `env.production.template`)

- DB: `DATABASE_URL`
- Auth: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `AUTH_TRUST_HOST`, `ADMIN_EMAILS`
- Stripe: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- SendGrid: `SENDGRID_API_KEY`, `FROM_EMAIL`, `FROM_NAME`, `ADMIN_EMAIL`
- FedEx: `FEDEX_KEY`, `FEDEX_PASSWORD`, `FEDEX_ACCOUNT_NUMBER`, `FEDEX_METER_NUMBER`, `FEDEX_ENVIRONMENT`, plus `FEDEX_SHIPPER_*`
- Inventory: `COIN_INVENTORY_API_BASE_URL` (optional; defaults hardcoded)
- Netlify Blobs: `NETLIFY_BLOBS_SITE_ID`, `NETLIFY_BLOBS_TOKEN` (auto-injected on Netlify)
- Feature flags: `NEXT_PUBLIC_ENABLE_CHECKOUT/ACCOUNTS/DIRECT_PURCHASE`
- Loyalty: `LOYALTY_POINTS_PER_DOLLAR`

## Supabase note (verify)

- **No Supabase SDK** (`@supabase/supabase-js`) is installed; no Supabase Auth/Storage/Realtime usage in code.
- Supabase appears only as: README's suggestion of a managed Postgres host, and helper scripts (`scripts/get-supabase-connection.js`, `update-db-connection.js`).
- **Likely** the production `DATABASE_URL` points at a Supabase-hosted Postgres consumed through Prisma. Whether it actually does — TBD - Griff to clarify. If so, Supabase is "DB host only," not a connected data SDK.
