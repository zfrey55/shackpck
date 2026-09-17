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
- **Checklist attribution is by `customerName`, not caseType.** `lib/customer-attribution.ts` resolves each case's ShackHQ `customerName` (through `CUSTOMER_NAME_ALIASES`) against a closed roster: `Bullion Bureau` gets its own tab, names on `CANONICAL_OTHER_CUSTOMERS` get a tab under **Other**, and anything else (including untagged and unrecognized names) falls into **ShackPack**. A new customer's cases therefore show under ShackPack until their exact ShackHQ name is added to the roster. `caseTypePrefixes` / `brandForCaseType()` in `lib/brands.ts` still exist but nothing outside that file calls them; the caseType override was removed after ShackHQ's 2026-08-05 attribution backfill and must not come back.
- `CUSTOMER_PACKS` bridges customer to brand: it is keyed by the customer slug (slugified canonical name, e.g. `Let It Ride Retailers LLC` -> `let-it-ride-retailers-llc`) and names the `brandId` whose tiles that customer owns. The brand's "View checklists" link defaults to `/checklist?customer=<slug>`, so the key must be the real slug or the link lands on an empty page.

## Customer types

- **Retail buyers:** purchase dated Series via cart/Stripe; accounts earn loyalty points.
- **Wholesale / resellers / custom orders:** "Contact for Price" repacks + Builder submissions → admin email follow-up.
- Which is the strategic priority — TBD - Griff to clarify.

## Business rules encoded in code

- **Pack limit:** max **5 packs per user per series** (`SeriesPurchase` enforcement; `/api/cart/validate`).
- **Shipping:** **free for account holders**, **$4.99 for guest** checkout (README).
- **Guest checkout** creates **shadow users** to still track limits/CRM.
- **Loyalty:** `LOYALTY_POINTS_PER_DOLLAR` (default 1/$), accrued on orders.
- **Admin access:** only `User.role = ADMIN` in the database, re-read on every admin request and page load (`lib/require-admin.ts`). There is no env-var override; `ADMIN_EMAILS` was removed 2026-09-17.
- **Compliance:** repack tiles never claim specific contents — copy always defers to the published checklist (shared disclaimer constants). Manufacturer noted as **G&J Packaging LLLP** on card products.

## Connection to operational systems

- **ShackHQ ERP** — source of truth for inventory/series/checklists (read) and destination for sales (`recordPackSale`) and user/CRM (`syncUser`) writes.
- **Stripe** (payments), **FedEx** (fulfillment labels), **SendGrid** (customer + admin email).
- **n8n inquiry pipeline / Gmail / external CRM:** not in this repo — assumed ShackHQ-side. TBD - Griff to clarify. See `06`/`09`.

## Customer brands added under Other — 2026-09-16 (`78d9f77`, `948948e`)

Three customers had live cases in ShackHQ that were all landing on the ShackPack checklist tab, because their `customerName` was not on the roster. Each now has a roster entry, a `CUSTOMER_PACKS` entry and a brand with tiles:

| ShackHQ `customerName` | Slug | Brand (`lib/brands.ts`) | Tiles | Checklist caseTypes (exact) |
|---|---|---|---|---|
| Let It Ride Retailers LLC | `let-it-ride-retailers-llc` | `let-it-ride`, "Let It Ride Retailers" | 2: Job Town, Fully Involved | `job town`, `fully involved` |
| Black Mountain Coins & Stamps | `black-mountain-coins-stamps` | `black-mountain`, "Black Mountain Coins & Stamps" | **1**: Black Mountain Coins & Stamps (`blackmountain-starter.png`) | `black mountain coins & stamps #1`, `#2`, `#3` |
| Blessed Coins | `blessed-coins` | `blessed`, "Blessed" | **1**: Blessed Bag Genesis (`blessedbag-genesis.jpg`) | `blessed bag genesis`, `blessed bag genesis #2` |

**One tile, several checklists.** Black Mountain and Blessed each have a single pack tile that covers multiple checklist caseTypes; the art carries no number. On `/checklist` those caseTypes stay separate, each with its own label, dates and series. Tiles are marketing (`lib/repack-catalog.ts`) and checklists come from live data, and nothing requires the two to line up one to one, so do not add a tile per numbered caseType unless distinct art exists.

Labels live in `CANONICAL_LABELS` (`lib/checklist-case-labels.ts`) under the normalized key, which keeps `&` and `#`: `black-mountain-coins-&-stamps-#1`, `blessed-bag-genesis-#2`. Let It Ride's labels carry the brand ("Let It Ride Job Town") because its caseTypes do not.

Case counts at the time (all 305 available dates): Let It Ride 4, Black Mountain 10, Blessed 25.

**Six ShackPack cases added in the same change:** Relic, Opal, Cipher, Pulse, Fury and Phantom, as standard ShackPack tiles (`shackpack-{name}.png`, Contact for Price, shared disclaimer) labelled "ShackPack {Name}". `TO_CANONICAL` maps both `shackpack-{name}` and the bare name to the same label. Only `relic` existed in ShackHQ at the time (1 case, The Coin Shack); the other five labels are inert until ShackHQ creates those caseTypes, and they will route to ShackPack via the house bucket.
