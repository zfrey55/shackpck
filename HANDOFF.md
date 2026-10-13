# HANDOFF

**Goal:** Publish non-ShackHQ coin series (Lincoln Reserve "Legends Never Die"
002) on the coin checklist via a frozen static archive. The SEO phase 2 plan
remains the next larger body of work (see git history of this file,
`df252eb` and earlier, for its full item list).

## Done

**Coin series archive, 2026-10-13.** Commits `8f59613` (archive) and `e003a9b`
(follow-up).

- `coins/lib/coin-series-checklist.ts`: frozen, append-only archive. Packs are
  derived (`sum(qty) / packSize`), never stored. `unitLabel` (singular, e.g.
  'bag') drives the structure line and the finalized statement.
- `seriesFinalizedStatement(date, unit = 'pack')` in `lib/repack-catalog.ts`.
  The default keeps card output byte-identical.
- First entry: Lincoln Reserve Legends Never Die Series 002, 21 rows,
  150 pieces / 150 bags.
- The archive card renders on `/checklist` (coin line, above
  CaseTypeSelector, and also in the error and no-dates early returns) and on
  `/checklist/customer/[slug]` (above the date buttons).
- When the customer has archive entries:
  - the "coming soon" box is suppressed
  - the "No Checklists" box is suppressed
  - the customer page's empty-state box is suppressed
- The amber "may vary by date" paragraph renders only when the customer has
  live case types. `MANUFACTURER_LINE` is page-level only, not in the card.
- Nav needed no change. The roster seeds every `CANONICAL_OTHER_CUSTOMERS`
  tab with zero cases, and the fixture asserts archive slugs are on the
  roster.
- `test-card-api-adapter.ts` expectations updated and verified against the
  data: 6 Komodo examples, notice split [8,0,30].
- Verified: tsc 0, lint 0, all 8 fixture scripts exit 0, and the
  clean-checkout build passes.

## Next

1. Copy decision for Griff: the card says "150 sealed bags" while
   ShackPack's other copy says "packs" (intentional per unitLabel; confirm).
2. Resume SEO phase 2.

## Watch

- The error and no-dates branches of `ChecklistClient.tsx` render the archive
  without `MANUFACTURER_LINE`, because the amber block exists only in the
  main return. These states are rare.
- The "may vary" gate is `caseTypes.length > 0`. A customer with BOTH live
  cases and archive entries would get the banner above a finalized card.
  There is no such customer today.
- No card archive entry has `finalizedOn`, so the "finalized" notice count is
  0. That includes Komodo Fusion 1 and Utopia Singles 1-10.
- `ChecklistClient.tsx` is 494 lines. Past 500, extract the early-return
  bodies into `components/ChecklistShellStates.tsx`.
- Fixture scripts are not wired into `package.json`. Run each with
  `npx tsx scripts/test-*.ts`.

## Files

- `coins/lib/coin-series-checklist.ts`
- `coins/app/checklist/components/CoinSeriesChecklistCard.tsx`
- `coins/app/checklist/components/StaticCoinSeriesPanel.tsx`
- `coins/app/checklist/ChecklistClient.tsx`
- `coins/app/checklist/customer/[slug]/page.tsx`
- `coins/lib/repack-catalog.ts`: `seriesFinalizedStatement`, `MANUFACTURER_LINE`
- `coins/lib/customer-attribution.ts`: `CANONICAL_OTHER_CUSTOMERS`, `CUSTOMER_PACKS`
- `coins/scripts/test-coin-series-checklist.ts`
- `coins/scripts/test-card-api-adapter.ts`
