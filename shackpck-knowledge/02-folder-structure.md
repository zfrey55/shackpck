# 02 — Folder Structure

## Repo root

```
shackpck/
├── netlify.toml            # Netlify build + headers (base = "coins")
├── .github/workflows/ci.yml# Lint + build CI (Postgres service)
├── .gitignore              # Ignores .env*, .DS_Store
└── coins/                  # ← the Next.js application (everything below is here)
```

> The actual app is in **`coins/`**. All paths below are relative to `coins/`.

## `coins/` top level

```
coins/
├── app/                    # Next.js App Router: pages + API routes
├── components/             # Shared React components (+ components/builder/)
├── lib/                    # Server/client utilities, catalogs, API clients (+ lib/builder/)
├── prisma/schema.prisma    # PostgreSQL schema (Prisma)
├── public/                 # Static assets (images/packs/, favicon, coin-icon.svg)
├── scripts/                # Admin/setup/printer/db utility scripts (ts/js/ps1/sql)
├── docs/                   # IMPLEMENTATION_PLAN.md
├── types/                  # next-auth.d.ts (session type augmentation)
├── *.md                    # Setup/troubleshooting guides (Stripe, FedEx, testing…)
├── next.config.js, tailwind.config.ts, postcss.config.js, tsconfig.json
└── env.production.template # Env var reference (placeholders only)
```

## Routing convention

- **Next.js App Router**, file-based:
  - `app/<route>/page.tsx` = a page; `app/api/<route>/route.ts` = an API endpoint.
  - **Route groups**: `app/(site)/` groups routes without affecting the URL.
  - **Dynamic segments**: `[slug]` (series, product), `[category]` (shop), `[id]` (build/address), catch-all `[...key]` (artwork), `[...nextauth]`.
- **Root layout** `app/layout.tsx` wraps every page with `Providers` (NextAuth session) → `CartProvider` → `ToastProvider` → `NavBar` / `Footer`.
- A second `app/(site)/layout.tsx` re-declares NavBar/Footer and `app/(site)/page.tsx` re-exports home — appears redundant/legacy (see `11-known-issues.md`).

## Naming conventions

- Components: `PascalCase.tsx` (e.g. `RepackCard.tsx`, `BrandTabs.tsx`).
- Client components start with `"use client"`; client sub-trees often split into `*Client.tsx` (e.g. `RepacksClient.tsx`, `MyBuildsClient.tsx`).
- lib data/catalog modules: `kebab-case.ts` (e.g. `repack-catalog.ts`, `coin-inventory-api.ts`, `checklist-case-labels.ts`).
- Path alias `@/*` → `coins/*` (tsconfig).

## Where new code goes

- **New page** → `app/<route>/page.tsx` (add to `NavBar.tsx`/`Footer.tsx` if user-facing).
- **New API endpoint** → `app/api/<route>/route.ts`.
- **New shared component** → `components/` (Builder-specific → `components/builder/`).
- **New data/catalog or external client** → `lib/`.
- **New pack/brand data** → `lib/repack-catalog.ts`, `lib/card-repack-catalog.ts`, `lib/brands.ts` (see `12-business-context.md`).
- **DB change** → edit `prisma/schema.prisma`, then `npm run db:migrate` (prod) / `db:push` (dev).
