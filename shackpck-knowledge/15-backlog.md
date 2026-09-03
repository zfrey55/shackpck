# Backlog Audit — 2026-08-31

**HEAD:** `84db9d9` · **Branch:** `main`, synced · Read-only audit; nothing was fixed.

Verdicts are **DONE** (already resolved), **OPEN** (not started), **PARTIAL**
(some sites resolved, others not). Every line is evidence from the tree at this
commit, not recollection.

> **Note on numbering:** this file is keyed to the audit questions as asked. It
> is ready to be re-keyed to the numbered backlog list when that is supplied —
> the verdicts and evidence carry over unchanged.

---

## 1. Test / debug routes and pages — **DONE** `3703b52`

All twelve directories deleted, plus all nine `coins/scripts/*.ps1`.
33 files, 2,776 deletions. Verified absent from the production build.

| Deleted | |
|---|---|
| `coins/app/api/test-email` | could send mail to an arbitrary address |
| `coins/app/api/test-sendgrid` | |
| `coins/app/api/test-fedex` | |
| `coins/app/api/test-inventory` | |
| `coins/app/api/debug-inventory` | |
| `coins/app/api/simple-test` | |
| `coins/app/api/basic-test` | |
| `coins/app/api/print-zpl` | |
| `coins/app/api/print-zpl-direct` | |
| `coins/app/test` | public debug dashboard |
| `coins/app/print-zpl` | |
| `coins/app/checklist-backup` | 9-file stale fork |
| `coins/scripts/*.ps1` | 9 files |

Docs updated for inbound references: `coins/FEDEX_PRODUCTION_SETUP.md`,
`coins/TROUBLESHOOTING.md`, `coins/TESTING_GUIDE.md`,
`coins/docs/IMPLEMENTATION_PLAN.md`. `netlify.toml` needed nothing — it
declares no redirects. `NavBar.tsx` / `Footer.tsx` linked to none of it.

**Note:** three of the nine `.ps1` files were not Zebra printer scripts —
`setup-stripe-production.ps1`, `setup-test-env.ps1`,
`upload-env-to-netlify.ps1`. They went with the glob as instructed. Restore any
with `git checkout 3703b52^ -- coins/scripts/<name>.ps1`.

**Orphaned by this deletion — not removed, separate commit:** none. The two
unreferenced lib exports below were already unreferenced before it.

## 2. Inquiry / lead persistence — **OPEN**

`coins/prisma/schema.prisma` declares `User`, `Address`, `Series`,
`SeriesPurchase`, `Order`, `OrderItem`, `Build`, `BuildLine` and four enums.
**No `Inquiry`, `Lead`, `Contact`, `Message` or `Submission` model.**

`coins/app/api/contact/route.ts` (102 lines) **does not touch the database.**
It imports exactly `next/server`, `zod` and `sendContactInquiryEmail` — no
`prisma` import anywhere in the file. The handler validates, calls
`sendContactInquiryEmail`, returns `{ ok: true }`. **A SendGrid failure loses
the submission entirely**; there is no record of it.

## 3. Honeypot / rate limit — **OPEN**

Neither exists in either file.

- `coins/app/api/contact/route.ts` — no rate limiter, no IP handling, no
  honeypot field, no captcha/turnstile. The only match for `limit` is `.max()`
  length caps in the zod schema.
- `coins/components/ContactForm.tsx` (255 lines) — no hidden/decoy field, no
  submit throttle, no captcha.

The endpoint is an unauthenticated POST that sends mail on every valid body.

## 4. Hardcoded inventory host and org id — **REDUCED** by `3703b52`

Three of the six host sites and three of the seven org-id sites lived in
deleted files. What remains:

**Host** — one site still hardcodes it with no env fallback:

| File | Uses `COIN_INVENTORY_API_BASE_URL`? |
|---|---|
| `coins/lib/coin-inventory-api.ts:4` | yes, env ?? literal |
| `coins/lib/inventory-api-push.ts:4` | yes, env ?? literal |
| `coins/app/checklist/api.ts:8` | **no — hardcoded** |

`coins/app/checklist/api.ts` is the live checklist client, so the production
Coins and Cards tabs both still hit a hardcoded host.

**Org id** — `'coin-shack'` at three sites, still with **no env var anywhere**:
`coins/app/checklist/api.ts:17`, `coins/lib/coin-inventory-api.ts:7`,
`coins/lib/inventory-api-push.ts:7`.

## 5. Pack images — **DONE** (no broken references)

- `coins/public/images/packs/shackpack-summit.png` — **exists**, 416,525 bytes.
- `coins/public/images/packs/shackpack-inception.png` — **absent**, and
  **referenced by nothing**. No catalog entry names it. ("Inception" appears
  only as card text inside `lib/card-series-checklist.ts`.)

Every image path in both catalogs was statted: **74 paths (62 coin + 12 card),
74 distinct files, 0 missing.** Referenced files total 174.6 MB on disk.

The previously-broken `shackpack-pinnacle.jpeg` reference was fixed in
`1418d91`; nothing is broken now.

## 6. "Contact for Price" → pack id — **OPEN**

`coins/components/RepackCard.tsx:80` — the link is a bare `href="/contact"`.
No pack id, no query string, no state.

`coins/components/ContactForm.tsx` — **does not read the URL at all**: no
`useSearchParams`, no `useRouter`, no prefill of any kind. A buyer clicking
from a pack tile lands on a blank form and must re-identify the pack by hand.

**Subject `<option>` values** (`ContactForm.tsx:191-196`), and the zod enum at
`app/api/contact/route.ts:13` matches them exactly:

`""` (Select a subject) · `general` · `order` · `coin-info` · `shipping` · `other`

**`CASE_TYPE_DISPLAY_NAMES`** (`ContactForm.tsx:4-31`) — **26 entries**, rendered
as the "Case Types Interested In" checkbox grid:

`reign` · `prominence` · `apex` · `base` · `deluxe` · `xtreme` · `unleashed` ·
`resurgence` · `transcendent` · `transcendent-transformed` ·
`transcendenttransformed` · `ignite` · `eclipse` · `radiant` · `shackpack-expo` ·
`shackpack-ascension` · `shackpack-flex` · `shackpack-pinnacle` ·
`shackpack-summit` · `coinwave-platinum-drill` · `coinwave-gold-pan` ·
`coinwave-the-mine` · `coinwave-gold-mine` · `currencyclash` · `custom` · `aura`

This list is **hand-maintained and already stale**: it is ShackPack + four
Coinwave entries only. It carries none of the 62 coin catalog entries added
since — nothing for Bullion Bureau, Let It Ride, Black Mountain, Cobra Coin,
Bald Bunny, Lincoln Reserve, Blue Collar Bullion, Golden Emu, Juicebox, One
Nasty Coin — and no card products at all. It duplicates data the catalogs
already own and is not derived from them.

## 7. SEO surface — **OPEN**

| Artifact | State |
|---|---|
| `coins/app/robots.ts` / `.txt` | **absent** |
| `coins/app/sitemap.ts` / `.xml` | **absent** |
| `coins/public/robots.txt` / `sitemap.xml` | **absent** |
| `openGraph` in `app/layout.tsx` | **absent** (0 matches) |
| `twitter` in `app/layout.tsx` | **absent** (0 matches) |
| `generateMetadata` anywhere in `app/**` | **absent** (0 files) |

Static `export const metadata` exists in 4 files: `app/layout.tsx`,
`app/admin/builds/page.tsx`, `app/build/page.tsx`, `app/my-builds/page.tsx`.
Root layout has `title`, `description`, `metadataBase` and `icons` only — so no
link preview card on any social platform, and no per-page titles for
`/repacks`, `/checklist`, `/series`, `/shop`, `/contact` or `/policy`.

## 8. Analytics — **OPEN**

`coins/app/layout.tsx` contains no `gtag`, GA, GTM, Plausible, PostHog,
Segment, Clarity, Hotjar, `next/script` or `<Script>` reference. No analytics
of any kind is loaded.

## 9. Checklist URL state — **DONE**; shareable button — **DONE** (route remains)

`coins/app/checklist/ChecklistClient.tsx` writes URL state on every tab
interaction through `syncUrl` (`:132`), which calls
`router.replace('/checklist?…')` at `:157`. Callers: line change `:173`, card
brand `:178`, customer `:188`. `?customer=`, `?line=` and `?cardBrand=` all
round-trip.

The **"Open shareable customer page" button is gone** (removed in `7d5547d`);
`app/checklist/components/CustomerNav.tsx:43-44` documents why — the address bar
is the shareable link.

**Still present:** the `coins/app/checklist/customer/[slug]/` route it used to
point at. It is unlinked from the UI but publicly routable, kept deliberately so
previously-shared URLs still resolve. Worth a decision, not a bug.

## 10. `scripts/import-card-series.mjs` — **OPEN** (absent)

Not present. There are **no `.mjs` files in `coins/scripts/` at all**. Card
series are added by hand-editing `lib/card-series-checklist.ts`; the 120-row
Legend Series 1 entry in `7457483` was generated ad hoc, not by a committed
importer.

## 11. Files ≥ 500 lines — **eight, not six**

| Lines | File |
|--:|---|
| 1988 | `coins/lib/card-series-checklist.ts` |
| 936 | `coins/app/checkout/page.tsx` |
| 740 | `coins/scripts/test-card-api-adapter.ts` |
| 670 | `coins/lib/email.ts` |
| 618 | `coins/lib/repack-catalog.ts` |
| 570 | `coins/app/api/orders/route.ts` |
| 533 | `coins/components/builder/BuilderShell.tsx` |
| 524 | `coins/app/admin/builds/AdminBuildsClient.tsx` |

Next below the line: `lib/builder/catalog.ts` 483, `app/checklist/ChecklistClient.tsx` 472.

`card-series-checklist.ts` and `repack-catalog.ts` are data files that grow by
append and are arguably exempt; the other six are code.

## 12. `shackpck-knowledge/` in `.gitignore` — **OPEN**

**Not ignored.** Root `.gitignore` has no entry for it (0 matches), and neither
does `coins/.gitignore`. It survives as untracked only because nobody has run
`git add -A` — which is exactly why every commit in this repo stages explicit
paths. `.claude/` is in the same position (0 matches).

One `git add -A` commits both directories.

## 13. Tracked PNGs

`git ls-files | grep -c '\.png$'` → **72** (case-sensitive; misses 3 `.PNG`).

| Extension | Files | Bytes | MB |
|---|--:|--:|--:|
| `.png` | 72 | 171,223,938 | 171.2 |
| `.PNG` | 3 | 5,331,685 | 5.3 |
| **Total** | **75** | **176,555,623** | **176.6** |

Location: 74 in `coins/public/images/packs/`, 1 in `coins/public/`. Also tracked:
1 `.svg`. No `.jpg`/`.jpeg`/`.webp` remain.

`next/image` optimization is enabled (`1418d91`), so delivered bytes are far
below this — but all 176.6 MB is paid on every clone, CI checkout and build.

---

# Whatnot compliance audit

**Date:** 2026-09-01 · **HEAD at audit:** `3a129c8` · Read-only; nothing fixed.

> **RESOLVED 2026-09-01** in `b60529f` (checklist copy) and `e23f642` (series
> headings). Flags 2a, 2b, 3, 5 and 6a are closed — each is marked inline
> below. Flags 1a, 1b, 4 and the "Guaranteed" half of 6a remain **OPEN**.

Surfaces audited: `/checklist` (coin line, Sports Cards, Pokemon Cards, all card
brands), `/checklist/customer/[slug]`, `/repacks`, `/series`, `/series/[slug]`,
`/` (home), and the catalog + checklist data in `coins/lib/`.

---

## 1. Value mentions — **PASS with two FLAGs**

**No value language renders anywhere.** Grepped `value`, `worth`, `comp`,
`floor`, `ceiling`, `average`, `book` across every checklist component, entry
renderer, `topHits` render and all catalog/example data. Every hit is a code
identifier, a source comment, or card text:

- `CaseCard.tsx:48,50` — comments explaining value ORDER, not rendered.
- `ProductLineNav.tsx:47`, `series/[slug]/page.tsx:243` — `value=` JSX props.
- `card-series-checklist.ts:948` — `'2025 topps comp auto /10 mix cd Corbin Carroll'`, "comp" is part of a set name.
- `CardSeriesChecklistCard.tsx:214` — "one sample pack's worth of cards", a source comment.

**Value-rank sort order with no displayed values is intact.** `CaseCard.tsx:48-52`
renders the API's value-ordered array as-is and displays the render index, never
`position`. Card `position` is displayed but is a rank number, not a value.

**`TopHit.cost` exists in the type and is NEVER rendered.**
`FeaturedSeriesSection.tsx:18` declares `cost?: number`; grepping `.cost` across
`app/` and `components/` returns zero reads. All three topHits renders show only
position, year, coinType (+ grade/gradingCompany on `/series/[slug]`):
`series/page.tsx:210-219`, `FeaturedSeriesSection.tsx:239-246`,
`series/[slug]/page.tsx:209-219`.

### FLAG 1a — coin `coinType` carries dollar denominations on the checklist

`CaseCard.tsx:66` renders `{coin.coinType}` raw. Live data for 2026-08-28:
**820 of 1,509 coin rows (54%) contain a `$`** — `MORGAN $1` (144),
`Peace $1` (128), `Silver Eagle $1` (125), `GOLD EAGLE $5` (76),
`CANADA BISON G$10` (20), `TOMAHAWK P$25` (12), and others.

These are **face-value denominations, part of the coin's name**, not market
values — and rule 4 requires the name/type be shown. But a strict reading of
"no dollar figures on any checklist surface" catches them. **Needs a ruling**:
if denominations must go, the fix is upstream in ShackHQ's `coinType` values,
not in the renderer.

### FLAG 1b — pack price renders on `/series`, `/series/[slug]`, home

`series/page.tsx:191`, `SeriesCard.tsx:52` (`${price} per pack`),
`FeaturedSeriesSection.tsx:222`, plus
`series/[slug]/page.tsx:276` (`Free shipping for account holders • $4.99 for guests`).

This is the **purchase price (MSRP)**, which the rule permits — but it is worth
confirming these pages count as "checklist surfaces", since `/series/[slug]`
renders a full checklist directly beneath the price. **Not live today**: both
`getFeaturedSeries` and `getSeries` return `{"series":[]}`, so no price and no
topHits currently render anywhere.

### Builder budget tiers — noted separately, likely out of scope

`lib/builder/catalog.ts:50,56,62,68,74` — `'$35–$60'`, `'$60–$85'`,
`'$85–$125'`, `'$125–$200'`, `'$200+'`. Also `:277` `'Small Dollar ($1)'`.
These render on `/build`, a custom-build quote-request flow, not a checklist.

---

## 2. Single-show example checklist elements — ~~PARTIAL~~ **RESOLVED `b60529f`**

> **2a and 2b closed.** Every card brand now has a banner stating its own pack
> structure ("Each pack contains 10 cards" / "Each set contains 10 packs, 1 card
> per pack" / "Each pack contains 8 cards"), and `BrandCardContext` in
> `CardChecklistPanel.tsx` renders a product-type paragraph for all three
> brands, not ShackPack alone. The table below is the pre-fix state.

Per-page, as actually rendered:

| Example | (a) total items | (b) product type | (c) example cards |
|---|---|---|---|
| ShackPack Fusion | "10 cards" — the sample size, not a series total | **page-level block** ✅ | 10 rows ✅ |
| ShackPack Nova | "10 cards" | **page-level block** ✅ | 10 rows ✅ |
| ShackPack Select | "10 cards" | **page-level block** ✅ | 10 rows ✅ |
| VRB Series 1 | "10 cards" | only implied in banner copy | 10 rows ✅ |
| VRB Series 2-5 | "10 cards" | only implied in banner copy | 10 rows ✅ |
| Komodo Purity | **"Example checklist. 8 cards per pack."** ✅ | **not stated** | 8 rows ✅ |
| Komodo Legend | "8 cards" | **not stated** | 8 rows ✅ |

**(a) FLAG.** Only Purity states pack size explicitly. The other six show a bare
`"N cards"` subtitle (`CardSeriesChecklistCard.tsx:151-155`) that is the length
of the sample list — ambiguous between "cards in this example", "cards per pack"
and "items in the series". **No example states the total number of items in a
produced series.**

**(b) PARTIAL.** Product type is stated only by `ShackPackCardContext`
(`CardChecklistPanel.tsx:52-63`), gated at `:79` to `brandId === 'shackpack'`:
"ShackPack produces sealed multi-sport card products covering Football,
Basketball, and Baseball." **Vault Room Breaks and Komodo Rips have no
equivalent block.** VRB's banner incidentally says "single show products" and
"multi-sport cards"; Komodo states nothing.

**(c) PASS** for all seven.

---

## 3. Finalized statement — ~~FLAG~~ **RESOLVED `b60529f`**

> **Closed by removal, not by extension.** Purity's `finalizedOn` was dropped,
> so the statement now renders on **zero** surfaces rather than on one example.
> An example is not a closed production run, so the honest fix was to stop
> claiming it was. Notice distribution is now `[7, 0, 19]` — every example
> illustrative, nothing finalized. See the caveat below the table.

Exact wording (`lib/repack-catalog.ts:56-61`), rendered at
`CardSeriesChecklistCard.tsx:189-193`:

> As of {date}, this series has been finalized. The number of packs and the number of items in the series will not change.

Rendered as e.g. *"As of August 31, 2026, this series has been finalized…"*

**Exactly ONE surface renders it: Komodo Rips / Purity** — and Purity is an
undated EXAMPLE, not a produced series.

| Surface | Finalized statement |
|---|---|
| Komodo Purity (example) | ✅ present |
| Komodo Legend (example) | ❌ none — illustrative banner instead |
| ShackPack Fusion / Nova / Select | ❌ none |
| VRB Series 1 / 2-5 | ❌ none |
| **Live card API series** (4 real dated series, 2026-08-27) | ❌ **none** |
| **Coin daily checklists** (all dates, 151 cases on 2026-08-28) | ❌ **none** |
| Frozen archive card series (19 dated) | ❌ none — `finalizedOn` count is 0 |

**The statement appears on an example and on no real series.** That is the
inverse of what the rule wants. `exampleNoticeFor` supports `finalizedOn` on
dated series (checked before `seriesDate`), and the archive type carries the
field — the plumbing exists and is unused. The coin path has no such field at
all.

---

## 4. Required fields on full checklists — **PASS (coins) / FLAG (cards)**

### Coins — structured, mostly complete

Live `getDailyChecklist` returns per coin: `position, coinType, year, grade,
gradingCompany, weight`. `CaseCard.tsx:64-73` renders coinType, then
`year • grade • gradingCompany`, then weight when present.

Sample: `{"position":1,"coinType":"GOLD EAGLE $5","year":"2026","grade":"MS69","gradingCompany":"NGC","weight":"1/10 oz"}`

Gaps on 2026-08-28 (1,509 rows): **weight null on 1,230 rows**, of which
**136 are bullion-type** (Silver Eagle, Gold Eagle, Buffalo, Bison) — e.g.
`{"coinType":"Silver Eagle $1","year":"2002","grade":"MS69","gradingCompany":"NGC","weight":null}`.
Rule says "weight if bullion", so those 136 are **FLAG**. Also `grade` empty on
41 rows (all Morgans with a gradingCompany but no grade), `gradingCompany` on 4,
`year` on 1. All upstream data gaps, not render bugs.

### Cards — **FLAG: no structured fields at all**

Live `getCardChecklistSeries` returns only `{position, entryName}` — a single
free-text string. Sampled 150 rows from `gauntlet-live_20260827_b84851a8`:

- `'2024 panini prizm black color blast duals bgs 9.5 Kyrie Irving & Anthony Davis'`
- `'2025 Prizm Jaxson Dart blue yellow green'`
- `'2026 panini signature series Derik Queen /25'`

Year present on **149/150**. A grader (PSA/BGS/SGC/CGC) named on **12/150 (8%)**.
Variation appears inconsistently inside the free text. **No `$` in any row.**

The 8% grade rate is not necessarily non-compliance — raw cards have no grade —
but **the format cannot distinguish "raw" from "grade omitted"**, so compliance
is unverifiable from the data. Year/name/variation/grade are not separable
fields on the card side, unlike coins.

---

## 5. Manufacturer name — ~~FLAG~~ **RESOLVED `b60529f`**

> **Closed on every surface.** Card pages carry it in the per-brand context
> block; the two coin surfaces (`/checklist` coin line and
> `/checklist/customer/[slug]`) render the shared `MANUFACTURER_LINE` constant
> from `lib/repack-catalog.ts`. Wording is now "Shackpack (G & J Packaging
> LLLP)", naming Shackpack first. The table below is the pre-fix state.

Named in **exactly one place in the codebase**:
`CardChecklistPanel.tsx:59` — "Manufacturer: G&J Packaging LLLP, identified on
the front of every product." — inside `ShackPackCardContext`, gated at `:79` to
`brandId === 'shackpack'`.

| Surface | Manufacturer identified |
|---|---|
| `/checklist` Sports Cards → ShackPack | ✅ |
| `/checklist` Sports Cards → **Vault Room Breaks** | ❌ |
| `/checklist` Pokemon Cards → **Komodo Rips** | ❌ |
| `/checklist` coin line — **all customers** (ShackPack, Bullion Bureau, Coinwave, and every "Other") | ❌ |
| `/checklist/customer/[slug]` — every customer page | ❌ (renders `CaseCard` only) |
| `/repacks`, `/series`, `/series/[slug]`, home | ❌ |

No "Shackpack" manufacturer attribution appears on any coin checklist.

---

## 6. Prize / gambling language — **PASS with one FLAG**

Zero hits for **prize, golden ticket, chance to hit, jackpot, odds, lottery,
raffle, sweepstake, winner, win**.

"chase" — 7 hits, **all player surnames** in card data
(`card-series-checklist.ts:295,482,614,1545,1551,1829,1830` — Ja'Marr Chase,
Chase Brown). Not chase-card framing. PASS.

### FLAG 6a — "Top Hits" headings ~~and "Guaranteed"~~ — **PARTLY RESOLVED `e23f642`**

> **"Top Hits" closed.** Both headings are now "Highlighted Coins", matching
> `FeaturedSeriesSection`. The two "Guaranteed" strings are **still OPEN** —
> untouched, and listed below for a decision.

- `series/[slug]/page.tsx:207` and `series/page.tsx:208` — `<h3>Top Hits</h3>` /
  `<h4>Top Hits</h4>`. `FeaturedSeriesSection.tsx:238` already uses the softer
  "Highlighted coins". Hobby-standard, but "hit" is outcome framing; the two
  `/series` headings are inconsistent with the third.
- `app/page.tsx:170` "Quality Guaranteed" and
  `RepacksClient.tsx:178` "Authenticity Guaranteed" — assurances about
  authenticity/condition, not about what a buyer receives. Low risk, listed for
  the reviewer.

Note: the client-supplied Whatnot copy itself uses "cards you may hit"
(`CardSeriesChecklistCard.tsx:69`), so "hit" appears acceptable to the platform.

---

## 7. Verbiage inventory — every public disclaimer string

| # | String (verbatim) | Defined | Renders |
|---|---|---|---|
| 1 | `Contents vary by series — see checklist for more details.` | `lib/repack-catalog.ts:39` | **All 74 pack tiles** — every coin + card tile on `/repacks` and home. The single description for every entry in both catalogs. |
| 2 | `As of {date}, this series has been finalized. The number of packs and the number of items in the series will not change.` | `lib/repack-catalog.ts:56-61` | `CardSeriesChecklistCard.tsx:189-193` — **Komodo Purity only** |
| 3 | `EXAMPLE CHECKLIST — NOT A FINALIZED SERIES.` (bold prefix) | `CardSeriesChecklistCard.tsx:83` | Prepended to #4; **suppressed** for any brand in `EXAMPLE_CAVEAT_BY_BRAND` |
| 4 | `The cards below illustrate what a series in this line can look like. No pack was built from this list, and a produced series will contain different cards.` | `CardSeriesChecklistCard.tsx:46-49` | ShackPack Fusion / Nova / Select, Komodo Legend — **with** prefix #3 |
| 5 | `Please note: The example checklist for the single show products above is for illustrative purposes only. It reflects the types of multi-sport cards you may hit within each single show brand, not the exact cards included in any specific product. Card values are subjective in nature and may fluctuate significantly. This is not financial advice.` | `CardSeriesChecklistCard.tsx:66-72` | **Vault Room Breaks only**, both examples — **without** prefix #3 |
| 6 | `Example checklist. {N} cards per pack.` | `CardSeriesChecklistCard.tsx:176-178` | Finalized undated examples — **Purity only** |
| 7 | `{N} packs of {M} cards. {T} cards total.` / `{T} cards total.` | `CardSeriesChecklistCard.tsx:179-181` | Finalized DATED series — **nothing renders this today** |
| 8 | `⚠️ Important: All series and the coins contained within them may vary by date. Please refer to the checklist for the most up-to-date information on each series. For card series, use the Sports Cards or Pokemon Cards tabs.` | `ChecklistClient.tsx:360-361` | **Every coin-line checklist page** |
| 9 | `About ShackPack Card Products. ShackPack produces sealed multi-sport card products covering Football, Basketball, and Baseball.` + `Manufacturer: G&J Packaging LLLP, identified on the front of every product. Products may include a mix of professionally graded cards (PSA, BGS, or SGC) and raw / ungraded cards. Single-show products are clearly designated as "Single Show Series" on the front of the sealed packaging.` | `CardChecklistPanel.tsx:52-63` | **ShackPack card line only** |
| 10 | `Coins and bullion, sports cards and Pokemon cards — every series backed by a published checklist. Contents vary by series.` | `app/page.tsx:38` | Home hero |
| 11 | `Browse repacks by brand — every series is backed by a published checklist.` | `RepacksClient.tsx:91` | `/repacks` |

**Three different disclaimers can describe the same product** depending on
surface (#1 on the tile, #4 or #5 on its example checklist, #8 above a coin
checklist). Worth reviewing as one set.

---

## Summary

| Rule | Verdict |
|---|---|
| 1. Value mentions | **PASS** — no value language, no cost rendered. FLAG: `$` denominations in 54% of coin rows; pack price on `/series`. |
| 2. Example elements | **PARTIAL** — (c) everywhere; (a) only Purity; (b) only ShackPack. |
| 3. Finalized statement | **FLAG** — on one example, on zero real series. |
| 4. Required fields | **PASS** coins (136 bullion rows missing weight, 41 missing grade) / **FLAG** cards (free-text, no structured fields). |
| 5. Manufacturer | **FLAG** — ShackPack card line only; absent from every other brand and all coin checklists. |
| 6. Prize language | **PASS** — "Top Hits" ×2 **RESOLVED** `e23f642`; "Guaranteed" ×2 still OPEN. |
| 7. Verbiage | 11 distinct strings inventoried above; see the post-fix inventory below. |

---

## Post-fix state — 2026-09-01

### Closed

| Flag | Commit | What changed |
|---|---|---|
| 2a total items | `b60529f` | Each brand's banner states its own structure. |
| 2b product type | `b60529f` | `BrandCardContext` renders for all three card brands. |
| 3 finalized statement | `b60529f` | Purity's `finalizedOn` removed; statement renders nowhere. |
| 5 manufacturer | `b60529f` | Per-brand context block + shared `MANUFACTURER_LINE` on both coin surfaces. |
| 6a "Top Hits" | `e23f642` | Both headings → "Highlighted Coins". |

### Still open

- **1a** — `$` denominations in 54% of live coin rows (`MORGAN $1`, `GOLD EAGLE $5`). Needs a ruling; the fix is upstream in ShackHQ's `coinType`, not in the renderer.
- **1b** — pack price on `/series`, `/series/[slug]`, home. MSRP, likely permitted. Not live (both series endpoints return `[]`).
- **4** — card entries are free-text `entryName`; grade named on 12/150 rows and the format cannot distinguish raw from omitted. Coin side: 136 bullion rows missing weight, 41 missing grade — all upstream data gaps.
- **6a (part)** — "Quality Guaranteed" (`app/page.tsx:170`), "Authenticity Guaranteed" (`RepacksClient.tsx:178`).

### TWO NEW ISSUES CREATED BY THE FIX

1. **`/policy` now contradicts the site.** `app/policy/page.tsx:39` states:
   *"All checklists include a statement that as of a specified date, the series
   has been finalized and the number of products and individual items will not
   be changed."* After `b60529f` **no checklist carries that statement**. Either
   the policy line comes out, or real dated series start setting `finalizedOn`.
   This is a public compliance commitment, so it should not sit unresolved.

2. **The finalized path is now entirely dead code.** `seriesFinalizedStatement`
   (`lib/repack-catalog.ts:56`), its single call site
   (`CardSeriesChecklistCard.tsx:234`), the `'finalized'` branch of
   `exampleNoticeFor`, and the `packSize` structure line all render nowhere.
   Retained deliberately as the mechanism a real dated series would use — see
   `14-tcg-product-type.md` §7 — but nothing exercises it, so it will rot
   silently. The fixture `'NOTHING on the site is finalized'` pins the current
   state and will fail the moment a series sets `finalizedOn`, which is the
   intended tripwire.

### Post-fix verbiage inventory (replaces rows 2–6 above)

| String | Renders |
|---|---|
| `Please note: The example checklist for the single show products above is for illustrative purposes only. It reflects the types of multi-sport cards you may hit within each single show brand, not the exact cards included in any specific product. **Each pack contains 10 cards.** Card values are subjective in nature and may fluctuate significantly. This is not financial advice.` | ShackPack Fusion / Nova / Select |
| same, but `**Each set contains 10 packs, 1 card per pack.**` | VRB Series 1 / 2-5 |
| same, but `types of **Pokemon** cards` and `**Each pack contains 8 cards.**` | Komodo Purity / Legend |
| `EXAMPLE CHECKLIST — NOT A FINALIZED SERIES.` + default caveat | **nowhere** — every brand has an override; retained for a future brand |
| `As of {date}, this series has been finalized…` | **nowhere** |
| `Example checklist. {N} cards per pack.` / `{N} packs of {M} cards…` | **nowhere** |
| `About {Brand}. …` + `Manufacturer: Shackpack (G & J Packaging LLLP), identified on the front of every product. Products may include a mix of professionally graded cards (PSA, BGS, or SGC) and raw / ungraded cards. Single-show products are clearly designated as "Single Show Series" on the front of the sealed packaging.` | All three card brands |
| `Manufacturer: Shackpack (G & J Packaging LLLP), identified on every product.` | `/checklist` coin line + `/checklist/customer/[slug]` |
| `Contents vary by series — see checklist for more details.` | All 74 pack tiles (unchanged) |
| `⚠️ Important: All series and the coins contained within them may vary by date…` | Coin checklist (unchanged) |

---

## Follow-up shipped — 2026-09-01/02

| Commit | Change |
|---|---|
| `02b4f88` | **Grouped series render as sections only.** ShackHQ's first grouped submission (2026-09-01, `gauntlet-game-8_20260901_9c0b84df` + 4 cabinets) rendered 300 rows: the umbrella's full 150 listed whole, then the same 150 again split across Blitz/Fusion/Nova/Select. `CardSeriesChecklistCard` now renders the header and the cabinet sections and **not** the umbrella's own list — 150 rows. The "slice of the full checklist above" note went with it. Flat series unchanged (verified: all 26 render exactly `cards.length` rows). |
| `ba66075` | **ShackPack Fusion / Nova / Select examples removed** — owner ruling that they did not represent the products as actually run. VRB (×2) and Komodo (Purity, Legend) stay, being based on real cases. ShackPack's "Example Checklists" nav group disappears entirely rather than rendering empty. Notice distribution `[7, 0, 19]` / 26 → **`[4, 0, 19]` / 23**. |
| `6f6e5ed` | **Pack structure copy corrected.** Every pack across every product holds exactly one item. `komodo-rips` "Each pack contains 8 cards." → "Each series contains 8 packs, 1 card per pack."; `shackpack` "Each pack contains 10 cards." → "Every pack contains a single card." `vault-room-breaks` was already correct. A comment on `EXAMPLE_CAVEAT_BY_BRAND` now records the one-item rule so the wrong form does not come back. |

### Multi-item-per-pack copy still in the tree — REPORTED, NOT FIXED

Owner decides; these may legitimately describe a **case** rather than a pack.

- **`coinCount` — no values exist.** `lib/repack-catalog.ts:22` and
  `components/RepackCard.tsx:11` keep the optional field, but **zero catalog
  entries set it** (all removed in `04b52d6`). The "20 coins" / "10 cards" tile
  text is already gone; nothing renders. Nothing to decide unless the field is
  reused.
- **`CardSeriesChecklistCard.tsx:247`** —
  `` `Example checklist. ${cards.length} cards per pack.` `` — states N cards
  per pack, **wrong under the one-item rule**. Renders nowhere today (no series
  is finalized) but is latent. Left alone because it is outside
  `EXAMPLE_CAVEAT_BY_BRAND`.
- **`CardSeriesChecklistCard.tsx:249`** —
  `` `${n / packSize} packs of ${packSize} cards. …` `` — same latent issue, and
  also renders nowhere.
- **`CaseCard.tsx:44`** — `Contents ({totalCoins} coins):`, on **every coin
  checklist case**. This is a case's contents, which is the strongest candidate
  for "case, not pack".
- **`FeaturedSeriesPanel.tsx:53`** — `Contents ({checklist.length} coins):`,
  featured-series panel.
- **`CardSeriesChecklistCard.tsx:179, 225`** — the header/section
  `{n} card{s}` counts, on every card checklist and cabinet section.
- **Builder (`/build`, likely out of scope)** —
  `CompareDrawer.tsx:108` `{packCount} packs · {totalCoins} coins listed`.

