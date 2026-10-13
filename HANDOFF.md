# HANDOFF

**Goal:** Publish non-ShackHQ coin series (Lincoln Reserve "Legends Never Die"
002) on the coin checklist via a frozen static archive. The SEO phase 2 plan
remains the next larger body of work (see git history of this file,
`df252eb` and earlier, for its full item list).

## Done

**Coin series archive, 2026-10-13.**

- `coins/lib/coin-series-checklist.ts`: frozen, append-only archive. Packs are
  derived (`sum(qty) / packSize`), never stored.
- First entry: Lincoln Reserve Legends Never Die Series 002, 21 rows,
  150 pieces / 150 packs.
- `CoinSeriesChecklistCard` + `StaticCoinSeriesPanel` render on `/checklist`
  (coin line, above CaseTypeSelector) and on `/checklist/customer/[slug]`
  (above the date buttons, since the archive is date-independent).
- "Coming soon" / "No checklists for X" empty states are suppressed when the
  customer has archive entries.
- No nav change was needed. `useCustomerIndex.otherCustomers` already seeds
  every `CANONICAL_OTHER_CUSTOMERS` name with zero cases. The fixture asserts
  each archive `customerSlug` is a roster slug, which guarantees its tab.
- Verified: tsc 0, lint 0, `scripts/test-coin-series-checklist.ts` 16/16, and
  the clean-checkout build.

## Next

1. Copy decisions for Griff (below, under Watch), then any wording fixes.
2. Fix the stale counts in `coins/scripts/test-card-api-adapter.ts`. It
   expects 5 Komodo examples (now 6) and notice split [7,0,19] (now
   [8,0,30]). These failures predate the coin archive and were left alone.
3. Resume SEO phase 2.

## Watch

- **Copy tensions, unresolved:**
  - The card says "150 sealed bags" while `seriesFinalizedStatement` says
    "packs" just below it.
  - The coin-line amber banner says contents "may vary by date" directly
    above a finalized, exact card.
  - `MANUFACTURER_LINE` appears twice: once on the page, once in the card.
- `packSize` is stored on coin entries per spec. The card side deliberately
  stopped reading `packSize` (`CardSeriesChecklistCard.tsx`, "ONE ITEM PER
  PACK").
- Known gap: on `/checklist`, the archive does not render in the zero-dates
  or error early returns. A comment marks it in `ChecklistClient.tsx`. The
  customer page has no such early return.
- Fixture scripts are not wired into `package.json`. Run each with
  `npx tsx scripts/test-*.ts`.

## Files

- `coins/lib/coin-series-checklist.ts`
- `coins/app/checklist/components/CoinSeriesChecklistCard.tsx`
- `coins/app/checklist/components/StaticCoinSeriesPanel.tsx`
- `coins/app/checklist/ChecklistClient.tsx`
- `coins/app/checklist/customer/[slug]/page.tsx`
- `coins/app/checklist/useCustomerIndex.ts`: roster seeding of `otherCustomers`
- `coins/lib/customer-attribution.ts`: `CANONICAL_OTHER_CUSTOMERS`, `CUSTOMER_PACKS`
- `coins/scripts/test-coin-series-checklist.ts`
- `coins/scripts/test-card-api-adapter.ts`: the stale counts
