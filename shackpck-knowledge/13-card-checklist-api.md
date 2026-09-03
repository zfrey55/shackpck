# Card Checklist API Integration — Handover

**Repo:** `~/Desktop/Cursor Projects/shackpck` · **Branch:** `main` · **HEAD:** `6a5482b`
**Written:** 2026-08-27 · **Last updated:** 2026-08-31 · **Status:** done and live in production

Written for someone picking this up cold with no memory of the decisions. Where
something looks odd, the reason is given — most of the odd-looking parts are
deliberate and were arrived at by finding the bug first.

---

## 1. What this does now

A ShackPack staffer submits a card series in ShackHQ. It appears on
`shackpck.com/checklist` under **Cards → ShackPack → Gauntlet** on the next page
load. **No commit. No deploy. No action on the website side at all.**

This was verified end to end on 2026-08-27: ShackHQ submitted a second real
series through their production UI, and it appeared on the public site with the
last website commit being from the previous day.

Before this work the Cards tab was served entirely from hand-maintained files in
the repo, so publishing a checklist meant an engineer editing TypeScript and
deploying.

### How the freshness guarantee actually holds

Four things have to be true, and all four are:

1. Both ShackHQ endpoints send `Cache-Control: no-store`.
2. Both site-side fetchers pass `cache: 'no-store'` explicitly.
3. `/checklist` is a static shell — all card data loads client-side on mount, so
   nothing is baked in at build time.
4. No route segment config (`revalidate`, `dynamic`, `fetchCache`) exists on the
   checklist route, and neither `next.config.js` nor `netlify.toml` caches these
   responses.

Break any one and renames or new series go stale silently.

---

## 2. The pieces and where they live

| Piece | File | Job |
|---|---|---|
| Client fetchers | `coins/app/checklist/api.ts` | `fetchCardChecklistDates()`, `fetchCardChecklistSeries(seriesId)` |
| Read model | `coins/lib/card-checklist-model.ts` | The `CardSeries` shape, the three static sources, and the selectors — brands, series-type groups, dates, counts |
| API adapter | `coins/lib/card-api-adapter.ts` | The gate, `seriesType` normalization, umbrella/cabinet tree assembly, per-date numbering |
| Formatter | `coins/lib/clean-entry-name.ts` | Turns raw Sortly text into display casing |
| Loading hook | `coins/app/checklist/useCardApiSeries.ts` | Fetches, gates, merges, handles 404s |
| Render | `coins/app/checklist/components/CardSeriesBrowser.tsx` | Series-type → dates → checklist |
| Checklist card | `coins/app/checklist/components/CardSeriesChecklistCard.tsx` | One series: header, card list, and cabinet sections on a grouped day |

**The model/adapter split.** These were one 501-line file until `6a5482b`. They
are split purely to stay under the size limit — not to introduce a layer. Two
things keep it from becoming one:

- **The adapter re-exports through the model.** `card-checklist-model.ts` ends
  with `export { … } from './card-api-adapter'`, so the model remains the SINGLE
  import for every caller. Nothing in the app imports the adapter directly, and
  no import site changed when the split landed.
- **The adapter's only model import is type-only** (`import type { CardEntry,
  CardSeries }`), which erases at compile time. So although the model imports
  the adapter at runtime and the adapter names the model in source, there is
  **no runtime cycle** — the edge only goes model → adapter.

### Data flow

```
getCardChecklistDates          all series, grouping fields, NO cards
   -> adaptApiSeriesList()     gate + normalize + number
   -> mergeCardSeries()        API series merged ON TOP of STATIC_CARD_SERIES
   -> nav renders (groups, date buttons)

user picks a group + date
   -> getCardChecklistSeries   cards for just those series
   -> cleanEntryName() per entry at render time
```

**Two-phase on purpose.** The dates call carries the grouping fields but no
cards, which is everything the nav needs — so first paint is one request no
matter how many series exist. Cards load only for what is actually on screen.

**Degrades to static, structurally.** The hook initialises to
`STATIC_CARD_SERIES` and merges API content on top. An API outage leaves the
Cards tab fully populated with the archive and examples, plus a muted banner
saying live series are temporarily unavailable. This is not a conditional branch
that could be missed — it is the shape of the code.

### The three content sources

1. **`lib/card-series-checklist.ts`** — FROZEN ARCHIVE. 19 entries. Real, dated,
   exact published series. Never edit.
2. **`lib/card-example-checklists.ts`** — undated marketing EXAMPLES
   (`seriesDate: null`). Editable. ShackPack Fusion/Nova/Select and two Vault
   Room Breaks.
3. **The live API** — adapts into the same shape.

---

## 3. Invariants — break these and something breaks

### 3.1 `seriesId` is identity. `seriesName` does not exist on the wire.

Live contract: `seriesId, seriesDate, totalCards, seriesType, customerName,
submittedAt`. There is no `seriesName`.

The title is built from `seriesType` plus a per-date number. **Never parse a
display string to decide grouping, routing or state.** ShackHQ can rename a
product line at any time; `seriesId` never changes.

### 3.2 Missing `seriesType` or unroutable `customerName` = excluded. No fallback.

`adaptApiSeries` returns `null` — no guessing a type from other fields, no
"Uncategorized" bucket, no defaulting the brand to ShackPack.

**Why:** showing a series under the wrong brand is worse than not showing it.
This is also what let the adapter ship weeks before ShackHQ sent the fields: the
gate was closed, zero series rendered, and it opened by itself when the fields
arrived. Nothing was deployed to turn it on.

### 3.3 `"Gauntlet Live"` → `"Gauntlet"` by EXACT match only.

`SERIES_TYPE_ALIASES` has exactly one entry. Matching is on the whole value,
case-insensitive, after whitespace collapse. **Never a suffix rule, never a
pattern.**

**Why the alias exists:** the archive files 13 series under `Gauntlet`; ShackHQ
calls the same product line `Gauntlet Live`. Without the alias the nav shows two
buttons for one product line — one frozen, one growing.

**Why exact-only:** a suffix rule stripping `" Live"` would silently rewrite a
genuinely new product line. `"Gauntlet Live Extra"`, `"Live"` and `"Olivia"` are
all fixture-pinned to pass through untouched.

**Two different values come out of `seriesType` and must not be collapsed:**

```
GROUP heading = normalizeSeriesType(raw) -> "Gauntlet"
TITLE base    = the RAW seriesType       -> "Gauntlet Live"
```

So a series files under the existing **Gauntlet** button while its own title
reads **"Gauntlet Live Series 1"**. Normalizing the title too would rename the
product in the customer's face; grouping on the raw value would split one line
across two buttons. This is the least obvious thing in the file and someone will
try to simplify it.

### 3.4 Numbering sorts by `submittedAt` ascending, `seriesId` tiebreak. Never array order.

**Why:** a series number becomes public the moment it renders. Customers
screenshot and link to "Gauntlet Live Series 2". The API makes no promise about
array order, so numbering by array position could silently renumber an
already-published series on the next fetch. `submittedAt` is immutable per
series, so the number assigned today is the number forever.

Numbering is scoped per `(brandId, normalized seriesType, seriesDate)`. Two
series on different dates are each "Series 1" — correct, not a collision.

**Known sharp edge:** deleting an early series renumbers every later one on that
date. A shared link to "Series 2" silently becomes "Series 1". Nothing prevents
this today. Worth a decision if deletions become common.

### 3.5 Card `position` IS displayed. Coin `position` is NEVER displayed.

These two fields share a name and mean contradictory things, deliberately,
because the upstream systems differ.

- **Cards:** `position` is the value rank, 1..N, most valuable first. Sort on it
  and show it.
- **Coins:** `position` is a slot/scan number with no value meaning. `CaseCard`
  numbers by render index instead.

**Why this note exists:** each side has already been fixed once. The coin bug
(displaying slot numbers, producing `1,2,10,9,4,…`) was the first commit of this
session. "Harmonizing" them reintroduces one bug or the other. The contradiction
is documented in `app/checklist/types.ts` at `CardChecklistCard`.

### 3.6 `cleanEntryName` is FORMATTING ONLY. It must never correct spelling.

It changes casing and inserts one space between a grading company and its grade
(`psa10` → `PSA 10`). Token count is otherwise preserved exactly.

It **cannot** fix typos and must not try. `"cheome"` stays `Cheome`. A
misspelled player name stays misspelled, just re-cased.

**Why:** silently correcting a name makes the public checklist disagree with the
inventory record behind it. Spelling is a Sortly-source concern.

Rules apply in order, first match wins:

```
(a) EXACT_CASE dictionary hit
(b) '#'-prefixed card number -> uppercased whole   ("#bp17" -> "#BP17")
(c) dotted initials -> uppercased whole            ("c.j."  -> "C.J.")
(d) contains a digit -> left completely alone      (1/1, /99, 9.5, 2023-24)
(e) already has an internal capital -> left alone  (source cased it deliberately)
(f) Mc-prefixed surname
(g) hyphen / apostrophe name, capitalized per segment
(h) ordinary word, small words lowercased when not first
```

`EXACT_CASE` is the extension point. It is a **list of exact-cased tokens**, not
a from→to map, so a dictionary edit can only ever restate a token's own
spelling — it structurally cannot smuggle in a word substitution.

The function is idempotent: `f(f(x)) === f(x)`. Rule (e) is what guarantees it.

### 3.7 `cache: 'no-store'` on all four fetchers.

Next 14.2 defaults **server-side** `fetch` to `force-cache`. These calls run in
the browser today, where the default is network-first — but if any ever moves to
a server component without `no-store`, a rename would never appear at all.
(Next 15 flipped this default; we are on 14.2.33.) The endpoints also send no
`ETag` or `Expires`, so the guarantee is stated in our code rather than
inherited from anyone's default.

### 3.8 The archive is frozen. The examples are editable.

`card-series-checklist.ts` is a historical record of what was actually in
produced series. Editing it to make a nicer-looking example falsifies the
record. `card-example-checklists.ts` is marketing content and is meant to be
edited.

Consequence: **only `seriesDate === null` content carries the example
disclaimer.** The disclaimer once sat above the whole Cards tab, so it also
covered the archive's exact, dated checklists — telling customers a genuinely
published series "will be different from the examples shown". That was the bug.

### 3.9 Cabinets are lifted onto their umbrella and REMOVED from the top-level list.

A **grouped stream day** is one umbrella series carrying the full card list,
plus N *cabinets* each carrying a slice of it. The link is `parentSeriesId` on
both endpoints: `null` means flat-or-umbrella, a string names the umbrella.
There is no umbrella flag — an umbrella is DERIVED as any series whose id
another series names as its parent **on the same date**.

`assembleGroups` in the adapter runs **after the gate and before the
numbering**, and returns only top-level series with each umbrella's children
nested on `cabinets`.

**Removing cabinets from the returned array is the whole design.** The nav, the
date buttons, the group counts and the sequence numbering all read the
top-level list, so excluding cabinets there makes every one of them correct
**with no cabinet filtering anywhere else in the codebase**. In particular
"cabinets consume no sequence numbers" is true for free: numbering never sees
one, so there is no cabinet check in the numbering code at all.

Contract, agreed with ShackHQ: exactly two levels, a cabinet is never a parent;
parent and children always share `seriesDate` and `customerName`; deletes are
atomic at the group. Cabinets create no product-line nav entries. Section
headings come from the cabinet's `seriesType` — there is no richer label, so
inventing one would be inventing data.

**Orphan rules.** The contract says none of these can happen. They are handled
anyway, and all three resolve the same way — the series **stays top-level and
renders flat**, getting its own nav entry and sequence number. Losing a
checklist entirely is worse than showing one standalone. A series is an orphan
when its parent link:

1. **names an id not in the adapted set** — never sent, or gated out. A
   gated-out umbrella therefore leaves its cabinets rendering flat rather than
   vanishing with it.
2. **names a series on a different `seriesDate`** — groups never join across
   dates.
3. **names a series that is itself linked upward** — that is three levels,
   which the contract forbids. The DEEPER series is the orphan and nothing
   recurses. Self-references and reference cycles fall out of this same rule,
   so no input can loop; the traversal is a single non-recursive pass over a
   flat map.

**Currently inert.** `parentSeriesId` is live on both endpoints and **`null` on
every series today**, so nothing above executes until ShackHQ's first grouped
upload lands. `6a5482b` was verified byte-identical on all 42 render-visible
surfaces against the previous commit using the live payload. The existing
2026-08-27 four-series day predates the field and stays four flat checklists
permanently.

**404 policy** lives in the hook, not the render layer, because it is a policy
about the tree: an umbrella that 404s drops its whole group, cabinets included;
a single cabinet that 404s drops its section and leaves the umbrella and its
siblings standing. Neither throws nor logs. Selecting a grouped day fetches the
umbrella AND every cabinet, since all of them render at once — `loadCardsFor`
expands umbrella ids itself, so callers pass only what they selected.

---

## 4. The three fixture scripts

No test framework, by design — these are pure functions with no I/O, so plain
assertion scripts run via `npx tsx` with no dependency to install.

| Script | Checks | Guards |
|---|---|---|
| `scripts/test-clean-entry-name.ts` | 21 fixtures / 42 | Formatting rules + idempotence + typo passthrough |
| `scripts/test-series-numbering.ts` | 10 fixtures / 30 | Per-date numbering, order preservation, no leaked state |
| `scripts/test-card-api-adapter.ts` | 66 | The gate, brand routing, alias, `submittedAt` ordering, merge, outage, grouped days |

Run all three plus `npx tsc --noEmit` before any change to the model, the
formatter or the adapter. Notable guards worth not deleting:

- **typo passthrough** — `"cheome"` must survive. Pins invariant 3.6.
- **`"Olivia"` → `"Olivia"`** — proves the alias does no substring matching.
- **reverse `submittedAt` order** — same input in either order numbers
  identically. Pins invariant 3.4.
- **all series gated out** — merge equals the static list exactly. Pins the
  outage path.
- **`Sign.` is not dotted initials** — ordinary abbreviations keep normal casing.
- **all-null `parentSeriesId` adapts identically to the field being absent** —
  the inertness proof for 3.9, pinned as a deep equality rather than a
  hand-checked snapshot.
- **three-level chain, self-reference and two-series cycle** — each must
  terminate and leave the deeper series flat. Pins the orphan rules.

---

## 5. Known open items — NOT part of this work

Recorded so they are not mistaken for regressions.

1. **Pack image weight.** Pack PNGs are large and uncommitted in the working
   tree. Untouched here.
2. **Shareable-button rework.** The "Open shareable customer page" link on the
   checklist nav was not revisited.
3. **Stale comment, `card-series-checklist.ts:3`.** References
   `card-checklist-data.ts`, deleted in `d27dc67`. Left alone deliberately — that
   file is off-limits, and editing it unprompted for a comment is not warranted.
4. **`shackpck-knowledge/` is out of date** in four files
   (`04-data-sources.md`, `05-components.md`, `07-content-and-copy.md`,
   `12-business-context.md`) — they reference deleted files. That directory is
   deliberately uncommitted.
5. **Card brand tabs derive from static content only.** `CARD_BRANDS` in
   `app/checklist/nav-params.ts` is built from `STATIC_CARD_SERIES` so the tab
   row renders with no fetch. An API series lands under an existing brand tab
   automatically, but a brand whose ONLY content is API-side would get no tab.
   Not a live gap — both card brands (ShackPack, Vault Room Breaks) have static
   content. Fix is to lift the list onto the hook.

---

## 6. What lives on the ShackHQ side

**Entry-name spelling is a Sortly-source concern the site cannot fix.**
`cleanEntryName` is formatting only (3.6). A misspelled name on the site is a
misspelled name in inventory.

This is not hypothetical. The 2026-08-26 series had `Caitlyn Clark`,
`Jackson Dart` and `Derrick Jetter` corrected before publication. The 2026-08-27
series **reintroduced two of them** — `Caitlyn Clark` at positions 4 and 10, and
`Jackson Dart` at position 9 — while spelling `Jaxson Dart` correctly at
positions 5 and 133 in the same series.

That pattern says the earlier corrections were applied to that series' records
rather than to the underlying Sortly inventory, so every future submission will
keep reintroducing them. **A submit-time typo warner is queued on the ShackHQ
side.** Until it lands, expect recurring misspellings and fix them at source.

---

## 7. Verification at close-out

```
HEAD 6a5482b, synced with origin/main
no modified source files (24 images + shackpck-knowledge/ + .claude/ uncommitted, as always)

tsc --noEmit                          EXIT 0
test-clean-entry-name   PASS 42  FAIL 0
test-series-numbering   PASS 30  FAIL 0
test-card-api-adapter   PASS 66  FAIL 0
npm run build                         EXIT 0

LIVE:
  getCardChecklistDates -> 4 series, GATE 4 of 4 admitted
  parentSeriesId present on both endpoints, null on all 4 -> grouping path inert
  ShackPack groups: ["Fusion","Gauntlet","Nova","Select","Limitless","Abyss","Example Checklists"]
    no separate "Gauntlet Live" heading
  Dates under Gauntlet: 2026-08-27 (newest), 08-07, 08-04, 08-03, 07-28, 07-27, 07-24, 07-23
  2026-08-27 -> four FLAT series, one under each of four groups:
      Fusion   | fucion-8-27_20260827_63d6086e   :: Fusion Series 1
      Gauntlet | gauntlet-live_20260827_b84851a8 :: Gauntlet Live Series 1
      Nova     | nova-8-27_20260827_7dfb33f4     :: Nova Series 1
      Select   | select-8-27_20260827_ac9cd0e9   :: Select Series 1

INERTNESS (6a5482b vs 19a5eb5, same live payload):
  all 42 render-visible surfaces byte-identical, matching md5
```

Each of the four is "Series 1" because each is alone in its own group on that
date. Correct, not a collision. The four sort ahead of Limitless and Abyss and
among themselves alphabetically because they SHARE the newest date (2026-08-27),
so `getSeriesTypesForBrand`'s date comparison ties and falls through to its
name tiebreak.

---

## 8. The 16 commits, oldest first

```
18ab8d2  fix(checklist): number coins by render index instead of API slot position
fcfbaaf  feat(cards): add cleanEntryName formatter for card checklist entries
2d49734  feat(cards): add ShackHQ card checklist API client and types
dc7d8b9  feat(cards): add Vault Room Breaks brand and card example checklists
048eaf2  fix(cards): uppercase card numbers, lowercase small words, scope home card grid to ShackPack
260964c  feat(checklist): coins/cards top-level nav and series-first card render
6aec4a4  fix(packs): surface Vault Room Breaks packs and correct card checklist disclaimer
fb52986  feat(packs): coins/cards top-level nav on /repacks
4b33244  feat(cards): add Gauntlet Game 6 checklist (temporary, pending API)
61d06a3  feat(cards): retitle Gauntlet Game 6 and add per-date series numbering helper
d27dc67  feat(cards): restore ShackPack example checklists in unified model, remove dead renderer
5ff96ec  feat(cards): stage card checklist API adapter behind field-presence gate
9e7607e  feat(cards): alias API seriesType "Gauntlet Live" to archive group "Gauntlet"
12fb87d  feat(cards): cut over to live card checklist API, remove temporary static entry
19a5eb5  fix(cards): correct series pluralization on checklist group buttons
6a5482b  feat(cards): render grouped stream days as umbrella with cabinet sections
```

`4b33244` and `61d06a3` added a temporary hand-entered Gauntlet Game 6 checklist
so that series was visible while the API lacked its grouping fields. `12fb87d`
deleted it at cutover — leaving it would have shown the same series twice under
one date, since the static and API ids differ and cannot be deduped.
