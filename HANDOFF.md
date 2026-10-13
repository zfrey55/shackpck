# HANDOFF

**Goal:** Publish non-ShackHQ coin series (Lincoln Reserve "Legends Never Die"
Series 2) so they render exactly like live ShackHQ cases. The SEO phase 2 plan
remains the next larger body of work (see git history of this file,
`df252eb` and earlier, for its full item list).

## Done

**Coin series archive, 2026-10-13.**

| Commit | What it did |
|---|---|
| `8f59613` | Archive |
| `e003a9b` | Follow-up |
| `5186d6b` | Rendered through CaseCard |

- `coins/lib/coin-series-checklist.ts` holds the frozen qty table, plus:
  - `toCaseData`, which expands the qty table into a live-shaped `CaseData`
  - `withArchiveDates` and `withArchiveCases`, which fold archive series into
    the getAvailableDates and getDailyChecklist responses
- Both `/checklist` and `/checklist/customer/[slug]` wrap their two fetches,
  so the archive shows up in every part of the page that live cases do:
  - the customer index and its tab
  - the case type tile "Legends Never Die"
  - the date button for 2026-10-13
  - a CaseCard titled "Legends Never Die Series #2"
- `StaticCoinSeriesPanel` (CaseCards) renders only in ChecklistClient's
  error branch.
- `CoinSeriesChecklistCard` is deleted. `seriesFinalizedStatement` is back to
  its original one-argument form. The amber "may vary" banner is
  unconditional again.
- `checklist-case-labels`: `'legends-never-die'` → "Legends Never Die" + the
  generic LONG line. `'high seas'` has no entry and gets the same result
  through the title-case fallback.
- Verified:
  - tsc 0, lint 0
  - all 8 fixture scripts exit 0; `test-coin-series-checklist.ts` 25/25
  - clean-checkout build passes
- Production deploy of `25502d1` confirmed live: shared chunk
  `145-91b5c683e6cc5213.js` is served with the new strings. `5186d6b` is NOT
  pushed.

## Next

1. Push `5186d6b`, confirm the deploy (see the memory note on shared chunks),
   then check both Lincoln Reserve pages in a browser.
2. Confirm with Griff that LND pieces really are ICG GEM BU. The first brief
   called them "ungraded art pieces", but every row now reads
   `2026 • GEM BU • ICG`.
3. Resume SEO phase 2.

## Watch

- **Delete an archive entry if ShackHQ ever ingests that series,** or the case
  renders twice: the `caseId` skip only covers re-wrapping the same response.
- An archive entry on a date with NO live cases depends on getDailyChecklist
  returning `success:true` for that date. A throw lands on ErrorState with no
  archive. 2026-10-13 is a live date, so LND is fine.
- `hasLoadedData` (`dates.length > 0`) is now true whenever the archive is
  non-empty. While any archive entry exists, the "No Checklists Available Yet"
  branch in ChecklistClient is unreachable.
- The customer page's error branch shows no archive. ChecklistClient's does.
- getDailyChecklist ignores its `caseType` param; the client filters.
- Lincoln Reserve has many live cases (Gold Rush, Mini Gold Rush, High Seas).
- `ChecklistClient.tsx` is 478 lines.

## Files

- `coins/lib/coin-series-checklist.ts`
- `coins/app/checklist/components/StaticCoinSeriesPanel.tsx`
- `coins/app/checklist/components/CaseCard.tsx`
- `coins/app/checklist/ChecklistClient.tsx`
- `coins/app/checklist/customer/[slug]/page.tsx`
- `coins/app/checklist/useCustomerIndex.ts`
- `coins/lib/checklist-case-labels.ts`
- `coins/lib/customer-attribution.ts`
- `coins/scripts/test-coin-series-checklist.ts`
