# 12 — Business Context

## What the site sells

Two product families, both surfaced as "repacks" (sealed surprise products with **published checklists**):

### A. Coin repacks (`lib/repack-catalog.ts`)
Graded-coin packs, now organized by **customer brand** (`lib/brands.ts`):
- **ShackPack** (default/house brand) — e.g. Reign, Prominence, Apex, Deluxe, Xtreme, Ascension, Aura, Pinnacle, Summit, Ignite/Radiant/Eclipse (platinum), Flex/Expo/Currency Clash (custom). Categories span Gold & Silver, Pre-1933, Platinum & Silver, 2x/5x, Custom.
- **Coinwave** — 20-coin packs (Gold Mine, The Mine, Platinum Drill, Gold Pan, Barrel, Big Kahunas, Splash, Tsunami, Megalodon, Platinum Marlin, Golden Tuna).
- **Fortune Forge** — Gold Quest, Platinum Pursuit.
- **Bald Bunny** — Black Label, Pink Diamond.
- **Lincoln Reserve** — Banger Bags.
> New-brand pack specs (coin counts, categories) are **placeholder** ("See checklist") — TBD - Griff to clarify real values.

### B. Card repacks (`lib/card-repack-catalog.ts`)
Multi-sport (Football/Basketball/Baseball) sealed 10-card products under ShackPack: **Fusion** (multi-show), **Nova**, **Select**, **Inception** (graded-only). Card checklists shown on-site are **EXAMPLES** (`lib/card-checklist-data.ts`), not live contents.

### C. Dated Series
Time-boxed pack "runs" (Prisma `Series`, mirrored from ShackHQ): `totalPacks`, `packsSold`, `packsRemaining`, `pricePerPack` (cents), `topHits`, `caseType`/`displayDate` for checklist linking. These are the **directly purchasable** items.

## Pricing model

- **Repack catalog tiles:** **"Contact for Price"** — no displayed price, no direct purchase (lead/wholesale path → `/contact`).
- **Dated Series:** real `pricePerPack` (cents) with **Stripe checkout** (gated by feature flags).
- **Custom builder:** `/build` lets users design a case; submission is an inquiry (no instant price). `lib/builder/` defines budget **tiers** (Starter $35–60, Select $60–85, Premium $85–125, Collector $125–200, Signature $200+) — used for guidance, not on-site charging.

## Inventory data source

- Live series + per-series **checklist** data comes from **ShackHQ Cloud Functions** (`getFeaturedSeries`, `getSeries`, daily checklist by `caseType` + `displayDate`); see `04`/`09`. `packsRemaining = totalPacks − packsSold`.
- Each customer brand maps to inventory `caseType` **prefixes** (`coinwave-*`, `fortuneforge-*`, `baldbunny-*`, `lincolnreserve-*`; everything else = ShackPack) via `brandForCaseType()` — so new dated series auto-appear under the right brand tab.

## Customer types

- **Retail buyers:** purchase dated Series via cart/Stripe; accounts earn loyalty points.
- **Wholesale / resellers / custom orders:** "Contact for Price" repacks + Builder submissions → admin email follow-up.
- Which is the strategic priority — TBD - Griff to clarify.

## Business rules encoded in code

- **Pack limit:** max **5 packs per user per series** (`SeriesPurchase` enforcement; `/api/cart/validate`).
- **Shipping:** **free for account holders**, **$4.99 for guest** checkout (README).
- **Guest checkout** creates **shadow users** to still track limits/CRM.
- **Loyalty:** `LOYALTY_POINTS_PER_DOLLAR` (default 1/$), accrued on orders.
- **Admin elevation:** emails in `ADMIN_EMAILS` auto-promoted to ADMIN on sign-in.
- **Compliance:** repack tiles never claim specific contents — copy always defers to the published checklist (shared disclaimer constants). Manufacturer noted as **G&J Packaging LLLP** on card products.

## Connection to operational systems

- **ShackHQ ERP** — source of truth for inventory/series/checklists (read) and destination for sales (`recordPackSale`) and user/CRM (`syncUser`) writes.
- **Stripe** (payments), **FedEx** (fulfillment labels), **SendGrid** (customer + admin email).
- **n8n inquiry pipeline / Gmail / external CRM:** not in this repo — assumed ShackHQ-side. TBD - Griff to clarify. See `06`/`09`.
