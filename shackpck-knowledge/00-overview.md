# 00 — Overview

## What shackpck.com is

shackpck.com is the public, customer-facing website for **ShackPack** — the surprise-product manufacturing and coin-wholesale arm of The Shack (Boca Raton, FL). It is a Next.js application that showcases ShackPack's coin and trading-card "repack" products, publishes per-series **checklists** (sourced live from the inventory backend), and supports real e-commerce: cart, Stripe checkout, order/loyalty management, FedEx label generation, and a custom "ShackPack Builder" for designing bespoke cases.

This repo is **separate from ShackHQ** (the internal ERP). shackpck.com consumes ShackHQ's public Cloud Functions for inventory/checklist data and pushes sales + user records back to it. See `04-data-sources.md` and `09-integrations.md`.

## Primary audience

- **Both retail and wholesale**, by feature:
  - Retail buyers: dated **Series** packs are purchasable directly (cart → Stripe → FedEx). Pack limit max 5 per user per series.
  - Wholesale / lead-gen: brand **repack** catalog tiles say **"Contact for Price"** (no direct purchase), routing to the contact form.
- Which audience is *primary* — TBD - Griff to clarify.

## Current production status

- Appears **live/production**: root metadata sets `metadataBase: https://shackpck.com`; repo contains completed Stripe live-setup guides; CI runs lint + build on every push/PR.
- Feature flags (`NEXT_PUBLIC_ENABLE_CHECKOUT/ACCOUNTS/DIRECT_PURCHASE`) are all `true` in the env template, but actual production flag values are set in Netlify — TBD - Griff to clarify exact live state (full e-commerce vs. lead-gen-only).

## Hosting & deployment

- **Netlify** with `@netlify/plugin-nextjs` (Next.js runtime).
- Monorepo-ish layout: the Next.js app lives in the **`coins/`** subdirectory; `netlify.toml` sets `base = "coins"`, build `npm install && npm run build`, publish `.next`, Node 20.
- Security headers (HSTS, X-Frame-Options, etc.) set in `netlify.toml`.
- See `01-stack.md` and `08-seo-and-performance.md`.

## Relationship to ShackHQ

- ShackHQ = internal ERP / coin-inventory system (separate repo).
- shackpck.com **reads** from ShackHQ public Cloud Functions at `us-central1-coin-inventory-8b79d.cloudfunctions.net` (Firebase/GCP), org id `coin-shack`: featured series, all series, daily checklists.
- shackpck.com **writes** back: `recordPackSale` (sales) and `syncUser` (CRM) — see `09-integrations.md`.
- Local Postgres (via Prisma) stores users, orders, builds, addresses, and a Series mirror.

## Note on this knowledge base

Generated from a code scan on the `feat/brand-customer-packs` branch (the customer-brand feature was committed to create a clean baseline before this audit). Items that cannot be verified from code are marked **"TBD - Griff to clarify."**
