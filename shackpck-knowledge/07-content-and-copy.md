# 07 — Content & Copy

## Where content lives

**All content is hardcoded in code — there is no CMS.**

- **Marketing copy / page text:** inline JSX in each `app/**/page.tsx` (e.g. home hero, "Why Choose Shackpack?", policy text, contact intro).
- **Pack/product catalog data:** TypeScript data modules in `lib/`:
  - `lib/repack-catalog.ts` — coin repack tiles (id, name, description, image, coinCount, category, **brand**).
  - `lib/card-repack-catalog.ts` — card products (Fusion, Nova, Select, Inception).
  - `lib/brands.ts` — customer brands (ShackPack, Coinwave, Fortune Forge, Bald Bunny, Lincoln Reserve): name, tagline, logo, caseType prefixes.
  - `lib/card-checklist-data.ts` — **example** card checklists (illustrative, not live).
  - `lib/checklist-case-labels.ts` — case-type → display-name/label mapping + normalization.
  - `lib/series-display.ts` — series name formatting.
- **Compliance copy:** standardized disclaimers live as constants (`REPACK_CHECKLIST_DISCLAIMER`, `CARD_REPACK_CHECKLIST_DISCLAIMER`, the checklist "contents vary by series" tagline) — reused across tiles so no tile makes specific-contents claims.
- **Live inventory content:** series + daily checklist coin data is **not** in the repo — it is fetched at runtime from ShackHQ Cloud Functions (see `04`).
- **Images:** static under `public/images/packs/` (4×6 pack art, brand-prefixed filenames), plus `public/shackpack-favicon.png`, `public/coin-icon.svg`. Hero image is a remote Unsplash URL in `app/page.tsx`.

## How copy is updated

- **Code edit + redeploy** for all static copy, catalog entries, brand metadata, disclaimers, and images. No dashboard/non-dev path.
- **Live series/checklist data** is updated in the **ShackHQ inventory app** (the source), then surfaces automatically on shackpck.com via the Cloud Functions — no shackpck.com deploy needed for those.

## Localization

- **None.** Single locale (`<html lang="en">`). All copy is US-English; pricing in USD; FedEx/US addresses. No i18n framework.

## Practical guidance for editors

- New pack → add an entry to `repack-catalog.ts` (with `brand`) + drop art in `public/images/packs/`.
- New customer brand → add to `BRANDS` in `lib/brands.ts` (+ optional logo in `public/images/brands/`).
- Reword a disclaimer → edit the shared constant once; it propagates.
- See `12-business-context.md` for the catalog/brand model.
