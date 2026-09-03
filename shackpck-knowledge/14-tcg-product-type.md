# TCG / Pokemon Cards Product Type — Handover

**Repo:** `~/Desktop/Cursor Projects/shackpck` · **Branch:** `main`
**Written:** 2026-08-31 · **Status:** live, static examples only

---

## 1. The product-line union

There are three product lines. The union lives in **`coins/lib/product-lines.ts`**
and is the ONLY place the Coins/Cards distinction is modelled — do not add a
parallel concept beside it.

```ts
export type ProductLine = 'coins' | 'sports' | 'pokemon';
```

| id | label | `?line=` |
|---|---|---|
| `coins` | Coins and Bullion | omitted (default) |
| `sports` | Sports Cards | `?line=sports` |
| `pokemon` | **Pokemon Cards** | `?line=pokemon` |

**The third line's id is `pokemon`, not `tcg`.** The TCG work was specced
against `tcg`; the id had already shipped as `pokemon` with live URLs, and
renaming it would have meant carrying a second permanent back-compat alias for
no user-visible gain. "TCG" and "Pokemon Cards" refer to the same line.

`parseProductLine` carries one legacy alias: **`?line=cards` → `sports`**. It is
read forever and never written. Anything unrecognized falls back to `coins`.

Tier 1 renders through `components/ProductLineTabs.tsx` on both `/repacks` and
`/checklist`. There is no `CoinsCardsToggle` and no `ProductTypeToggle` — the
two-way toggle was deleted when the third line landed.

## 2. How a brand lands on a line

There is no `cardType` field. The line is derived from each catalog entry's
existing **`category`** string, through one small table in `product-lines.ts`:

```
'Coins'         -> coins
'Sports Cards'  -> sports
'Trading Cards' -> pokemon
```

`cardLineForBrand(brandId)` then answers which line a brand's CHECKLIST content
belongs to: a brand with Trading Cards tiles and no Sports Cards tiles is a
Pokemon brand; everything else defaults to sports. Adding a `cardType` field
would duplicate `category` and create two sources of truth for one fact.

## 3. Where Komodo Rips data lives

| Thing | File |
|---|---|
| Brand entry | `lib/brands.ts` — id `komodo-rips`, `hasCards: true` |
| caseType prefixes | `['komodo', 'komodo-rips', 'bcb']` |
| Pack tiles | `lib/card-repack-catalog.ts` — ids `komodo-purity`, `komodo-legend`, `category: 'Trading Cards'` |
| Example checklists | `lib/card-example-checklists.ts` — `brandId: 'komodo-rips'` |
| Packs tab wiring | `app/repacks/repacks-nav.ts` (derived, nothing to edit) |
| Checklist tab wiring | `app/checklist/nav-params.ts` (derived, nothing to edit) |

**Both nav tiers are derived.** Komodo Rips appears on the Pokemon Cards tab of
`/repacks` because it has Trading Cards tiles, and on `/checklist` because it
has example checklists. Neither list is written down anywhere.

`bcb` is in the caseType prefixes alongside the komodo ones so a future live
series from ShackHQ routes whichever prefix they stamp. Neither prefix matches
any caseType in the inventory today (checked across all 289 available dates),
so both are inert.

## 4. The `bcb-` image filename history

The Komodo art was delivered as `BCB-Legend.png` / `BCB-Purity.png`, renamed to
lowercase `komodo-legend.png` / `komodo-purity.png` before it was committed, and
the catalog points at the komodo names. **Do not rename them again.** Any spec
or note referring to `/images/packs/bcb-*.png` predates that rename.

**Aspect note:** these two are **1086 x 1448 (3:4)**. Every other pack image is
1024 x 1536 (exactly 2:3), which is what the `aspect-[2/3]` tile frame expects.
`object-cover` therefore trims roughly 5.5% off each side of the Komodo tiles.
Acceptable, but re-export at 2:3 if the crop ever matters.

## 5. TCG checklists are STATIC EXAMPLES

The Pokemon line is served entirely from `lib/card-example-checklists.ts`
(editable marketing content) — no API involvement, and **nothing in the frozen
archive**. Purity and Legend are illustrative samples of the line.

There WAS one real dated series, `Legend Series 1`, in the archive from
2026-08-31 to 2026-09-01. It has been removed and the example now represents
the line — see *Legend Series 1: published and reversed* below for what that
episode left behind in the types.

Two fields were added to `CardExampleChecklist` for this line, both optional and
both off by default:

- **`finalizedOn?: string`** — ISO date. When present the render shows
  `Example checklist. N cards per pack.` above the list (N derived from
  `cards.length`, never stored, so it cannot drift) and
  `seriesFinalizedStatement(date)` below it. An example without it shows
  neither, so nothing is implied to be closed by omission.
- **`verbatimEntries?: true`** — skip `cleanEntryName`. TCG names carry a
  lowercase `ex` suffix ("Mega Lucario ex") that the formatter title-cases to
  "Ex", and an uppercase "EX" appears in the same list, so the `EXACT_CASE`
  dictionary cannot fix both — one token, one canonical casing. Verified: 4 of
  the 8 Purity names change under `cleanEntryName`. These are the ONLY entries
  stored pre-formatted; everything else is raw Sortly text.

`seriesFinalizedStatement(date)` lives in `lib/repack-catalog.ts` beside
`REPACK_CHECKLIST_DISCLAIMER`.

### The banner / finalized-statement invariant

An example shows **exactly one** of two notices — never both, never neither:

| notice | what it says | when |
|---|---|---|
| `illustrative` | amber banner, "EXAMPLE CHECKLIST — NOT A FINALIZED SERIES … no pack was built from this list" | example WITHOUT `finalizedOn` |
| `finalized` | "As of {date}, this series has been finalized …" | example WITH `finalizedOn` |
| `none` | neither | dated series — frozen archive or live API |

They are contradictory copy, so showing both on one series tells a customer two
opposite things about the same checklist. That is exactly what happened: the
banner was a GROUP-level slot in `CardSeriesBrowser`, rendered once above every
card in the examples group, while the finalized statement was per-card — so the
Komodo cards got both.

The fix was to move the banner **down to per-card**, into
`CardSeriesChecklistCard` beside the finalized statement, and decide between
them in one pure function:

```ts
// lib/card-checklist-model.ts
exampleNoticeFor(series): 'illustrative' | 'finalized' | 'none'
```

`finalizedOn` is checked first, so a finalized series always states it. The
component switches on the return value, which makes "both" unrepresentable
rather than merely avoided — and handles a group holding both kinds of example
with no extra code path. No brand has such a group today; nothing prevents one.

Cost of the move: a brand with several illustrative examples now shows the
banner once per card (ShackPack 3, Vault Room Breaks 2) rather than once above
the group. That repetition is the price of the guarantee.

Fixtures in `scripts/test-card-api-adapter.ts` pin both directions plus the
invariant itself (every example gets exactly one; no example gets both).

### Legend Series 1: published and reversed

> **STATUS: REVERSED 2026-09-01.** `Legend Series 1` is no longer in the
> archive. Kept here because the episode is why several optional fields exist
> and why the archive is no longer ShackPack-only — none of that was undone.

`Komodo Rips — Legend Series 1` (2026-08-31, 120 cards) was the **first real TCG
series** and the **first non-ShackPack entry in the frozen archive**, appended to
`lib/card-series-checklist.ts` in `7457483`; no existing entry was touched. It
came down again the next day in `3a129c8`.

Four things it changed, **all of which survive the reversal**:

- **The archive is no longer ShackPack-only.** `CardSeriesChecklist` gained an
  optional `brandId`. The adapter reads `series.brandId ?? ARCHIVE_BRAND_ID`, so
  all 19 pre-existing entries omit it and still resolve to ShackPack. The old
  comment saying the archive "must not be edited to add" a brand field held
  until Komodo Rips produced a series; it has been updated rather than worked
  around.
- **`finalizedOn`, `verbatimEntries`, `packSize`** were added to the archive type
  with the same semantics they already had on `CardExampleChecklist`, and are
  carried through `fromArchive`.
- **Position is SHEET ORDER, not value rank.** The archive's `position` contract
  says value rank, most valuable first. This series has no ranking — the number
  is a list index. Do not sort or re-rank it. A comment on the entry says so.
- **Entries are verbatim PSA label text**, `| PSA n | Cert <digits>`, and must
  match the slabs. `verbatimEntries: true` keeps `cleanEntryName` off them.

**`packSize` drives the structure line** above the list. Every number in it is
derived, never stored:

| series | line shown |
|---|---|
| undated example (`Purity`) | `Example checklist. 8 cards per pack.` |
| dated, no `packSize` (`Legend Series 1`) | `120 cards total.` |
| dated + `packSize` (none today) | `N packs of M cards. T cards total.` |

**Komodo series do not state pack structure.** "N packs of M" is a claim about
how a run is broken up for sale, and it is deliberately left off — `packSize` is
simply omitted from the entry, so the line falls back to the total alone. The
field and its render branch are kept and still work: a future series that wants
to state structure sets `packSize` and gets the fuller line with no code change.

When `packSize` IS set, `cards.length % packSize === 0` is asserted **in the
fixtures, not at render** — a render is the wrong place to throw.

**The `Legend` example lost its `finalizedOn`** and reverted to illustrative when
the real series landed, so the sample and the produced series never both present
as the closed one. `Purity` keeps its `finalizedOn`; it has no archive series.
Notice distribution is now **6 illustrative / 2 finalized / 19 none** across 27
static series.

Note that `exampleNoticeFor` returns `'finalized'` for a DATED series too — it
checks `finalizedOn` before `seriesDate`. The "dated series states neither
notice" rule now reads "unless it is finalized".

**No certificate numbers are stored.** The example shape has no field for one,
and a PSA cert identifies one specific physical card — exactly the claim an
example must not make. See `07-content-and-copy.md`.

## 6. What does NOT exist

Recorded so a future reader does not go looking:

- `lib/card-checklist-data.ts` — deleted in `d27dc67`. The live equivalent is
  `lib/card-example-checklists.ts`.
- `CARD_REPACK_CHECKLIST_DISCLAIMER` — removed in `9fe45ac`; there is one
  disclaimer, `REPACK_CHECKLIST_DISCLAIMER`, and it is line-agnostic, so no
  TCG-specific variant was needed.
- An `Inception` pack. It appears only as card text inside the frozen archive.
- A `cardType` field. See section 2.
- `Legend Series 1`, or any dated series in the archive for a non-ShackPack
  brand. It existed for one day and was removed in `3a129c8` — see section 7.
- `public/images/brands/`. No brand sets a `logo`; `BrandHeader` renders a text
  wordmark for all of them.

---

## 7. Reversal — DONE 2026-09-01

Legend was briefly published **twice over**: the real dated series in the
archive, and an illustrative example of the same name. The example was pulled
first (`84db9d9`) so only one Legend rendered; then the series came down and the
example went back. Executed in the two commits the plan called for:

| # | Commit | What it did |
|---|---|---|
| 1 | `c51104d` | `git revert 84db9d9` — restored the Legend entry in `lib/card-example-checklists.ts` and its fixtures. Distribution `[5, 2, 19]` / 26 → `[6, 2, 19]` / 27. No conflicts: `84db9d9` and the intervening `675d42e` / `048c57a` touched disjoint files. |
| 2 | `3a129c8` | Removed the `komodo-legend-series-1` entry from `lib/card-series-checklist.ts` (147 deletions, **zero additions** — no surviving entry edited, 20 → 19 entries) plus its 75-line fixture block and the now-subjectless `'a dated series WITH finalizedOn'` check. Distribution → `[6, 1, 19]` / 26. |

Between the two commits both Legends were live — the state this note existed to
avoid. Neither was pushed until both had landed, so it never reached the remote.

**Step 2 was the documented exception to an append-only file.** The archive is a
frozen record of what was produced, and every other change to it has been an
append. The deletion got its own commit, with the reason in the message, so it
is legible in `git log` rather than buried.

**What the reversal did NOT undo**, and should not be re-litigated by someone
reading this cold:

- `CardSeriesChecklist.brandId?` and the `series.brandId ?? ARCHIVE_BRAND_ID`
  fallback in the adapter. The archive is no longer ShackPack-only by type, even
  though every entry in it is ShackPack again today.
- `finalizedOn?`, `verbatimEntries?` and `packSize?` on the archive type, and
  their pass-through in `fromArchive`.
- `exampleNoticeFor` checking `finalizedOn` before `seriesDate`, so a dated
  series can still be `finalized`. No series exercises that path right now; the
  `'…states neither notice, UNLESS it is finalized'` guard is what keeps it
  honest if one returns.

**To publish a real TCG series again:** append to the archive with `brandId`,
`finalizedOn` and `verbatimEntries` set, and decide separately whether to state
`packSize` (Legend Series 1 ended up not stating it — see the table above).
Then remove or re-scope the Legend example so the line does not carry a sample
and a produced series of the same name at once.
