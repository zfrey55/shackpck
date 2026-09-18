# Backlog Audit — 2026-08-31

**HEAD:** `84db9d9` · **Branch:** `main`, synced · Read-only audit; nothing was fixed.

Verdicts are **DONE** (already resolved), **OPEN** (not started), **PARTIAL**
(some sites resolved, others not). Every line is evidence from the tree at this
commit, not recollection.

> **Note on numbering:** this file is keyed to the audit questions as asked. It
> is ready to be re-keyed to the numbered backlog list when that is supplied —
> the verdicts and evidence carry over unchanged.

> **Correction pass — 2026-09-18.** Items 2, 3 and 12 were closed by later work
> but still read OPEN; they now carry the commit that closed them. The counts in
> 11 and 13 were re-measured, the scripts named in *Admin access §3* were wrong
> and are corrected, the `/policy` half of the finalized issue is resolved and
> dropped, and drifted code line numbers were re-verified. Sections dated
> 2026-08-31 otherwise remain evidence from `84db9d9`.

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

## 2. Inquiry / lead persistence — **DONE 2026-09-16** (`258be87`)

Was: no `Inquiry`/`Lead`/`Contact` model at all, and `/api/contact` never
touched the database — it validated, called `sendContactInquiryEmail` and
returned `{ ok: true }`, so a SendGrid failure lost the submission entirely.

Now: `prisma/schema.prisma` declares `ContactInquiry` (plus the `ContactReason`
and `CustomBrandingChoice` enums, indexed on `createdAt`), and
`/api/contact` writes the row **before** attempting email. Send failures are
recorded on the row (`emailSent`, `emailError`) instead of vanishing, which is
what made the 2026-09-17 spam-drop diagnosis possible at all.

## 3. Honeypot / rate limit — **DONE 2026-09-17**

Commits: `258be87` (honeypot, 2026-09-16), `ce57686` (autofill-safe honeypot,
keep spam-suspected rows, 2026-09-17), `fea53f3` (rate limiting, 2026-09-17).

Was: an unauthenticated POST that sent mail on every valid body — no limiter,
no IP handling, no decoy field, no captcha.

Now both exist:

- **Honeypot + timing trap** (`lib/contact-inquiry.ts`): hidden `hp_field_x`
  and a `MIN_FILL_MS` of 3 s. A tripped check no longer drops the submission —
  it **saves the row** with `emailError = spamSuspectedError(...)` and skips
  only the email. (The first cut dropped the row, which silently lost real
  inquiries; see the spam-drop entry below.)
- **Rate limiting** (`lib/rate-limit.ts`, Upstash sliding window): `contact`
  5 per 10 min per IP, applied before validation, alongside buckets for
  register, sign-in, checkout and build submit. Fails open.

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

## 6. "Contact for Price" → pack id — **DONE `258be87`, `811ba5f`** (2026-09-16)

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

**Resolved 2026-09-16.** ShackPack tiles now link to
`/contact?line=<line>&product=<catalog id>`, and the new multi-step form
(`components/contact/`) reads `?line`, `?product` and `?branding` to pre-fill,
recording the tile as `sourcePack` on the saved `ContactInquiry`. The hardcoded
`CASE_TYPE_DISPLAY_NAMES` list and the subject dropdown were deleted; products
are derived from the catalogs. Non-ShackPack tiles show "Not available for
purchase" instead of a contact link. See `06` for the flow.

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

## 11. Files ≥ 500 lines — **six** (recounted 2026-09-18)

| Lines | File | |
|--:|---|---|
| 1841 | `coins/lib/card-series-checklist.ts` | data |
| 936 | `coins/app/checkout/page.tsx` | code |
| 695 | `coins/scripts/test-card-api-adapter.ts` | fixture |
| 693 | `coins/lib/repack-catalog.ts` | data |
| 572 | `coins/app/api/orders/route.ts` | code |
| 567 | `coins/lib/email.ts` | code |

Changes since the 2026-08-31 count (eight files): `BuilderShell.tsx` dropped
533 -> 322 in the Phase 2 split and is off the list; `AdminBuildsClient.tsx`
is now below 500. `repack-catalog.ts` grew past `email.ts` as tiles were added.

The two data files grow by append and are arguably exempt, and
`test-card-api-adapter.ts` is a fixture that grows with each new series — so
the real refactor candidates are `checkout/page.tsx`, `orders/route.ts` and
`email.ts`.

## 12. `shackpck-knowledge/` in `.gitignore` — **DONE 2026-09-02** (`61d6fbf`)

The original risk was that the directory was neither ignored nor tracked, so a
single `git add -A` would have committed it by accident. It is now **tracked on
purpose**: 16 files under version control, still with no `.gitignore` entry in
either the root or `coins/`. Knowledge-doc updates ship as their own
`docs(knowledge):` commits.

`.claude/` remains untracked and unignored — the same latent accident, which is
one more reason every commit here stages explicit paths and never `git add -A`.

## 13. Tracked PNGs

Recounted 2026-09-18:

| Extension | Files | Bytes | MB |
|---|--:|--:|--:|
| `.png` | 83 | 197,241,218 | 188.1 |
| `.jpg` | 1 | 799,533 | 0.8 |
| `.svg` | 1 | 897 | 0.0 |
| **Total** | **85** | **198,041,648** | **188.9** |

Up from 75 files / 176.6 MB on 2026-08-31, as pack art was added for the new
brands and cases. All 83 PNGs and the one `.jpg` (`blessedbag-genesis.jpg`, the
Blessed tile) live in `coins/public/images/packs/`, except a single PNG in
`coins/public/`. The earlier note that no `.jpg` remained is out of date.

`next/image` optimization is enabled (`1418d91`), so delivered bytes are far
below this — but the full ~188 MB is paid on every clone, CI checkout and build,
and it grows with every new tile.

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

### ONE NEW ISSUE CREATED BY THE FIX

> The second issue — *"`/policy` now contradicts the site"*, where the policy
> page promised a finalized statement no checklist carried — is **RESOLVED**:
> `app/policy/page.tsx` no longer makes that claim, and a search of the whole
> app finds the wording only inside the dead code path below. Dropped from this
> list 2026-09-18.

1. **The finalized path is entirely dead code.** `seriesFinalizedStatement`
   (`lib/repack-catalog.ts:72`), its single call site
   (`CardSeriesChecklistCard.tsx:270`, under the `notice === 'finalized'`
   branch at `:245`), the `'finalized'` branch of `exampleNoticeFor`
   (`lib/card-checklist-model.ts:115`), and the `packSize` structure line all
   render nowhere — confirmed again 2026-09-18: **no series sets
   `finalizedOn`**.
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

---

# Backlog notes — 2026-09-16

From the customer roster change (`78d9f77`, `948948e`, `2a37956`). Counts are
from `getAvailableDates` across all 305 available dates (2025-11-06..2026-09-16).

## 1. Off-roster customers under ShackPack — **INTENTIONAL** (owner ruling)

| `customerName` | Cases | caseTypes | Dates |
|---|---|---|---|
| Gold Coin Reserve | 9 | `base` 3, `deluxe` 3, `xtreme` 3 | 2026-08-31, 2026-09-01 |
| Emerald City Pawn & Consignment | 7 | `reign` 5, `prominence` 2 | 2025-12-16 |

Neither name is on `CANONICAL_OTHER_CUSTOMERS`, so both resolve to the house
bucket and their cases show on the ShackPack checklist tab. This is deliberate:
**do not add them to the roster.** Revisit together with the planned Coin Shack
tab and wholesale bucket, which are on hold pending ShackHQ scoping.

## 2. caseTypes with no label — **DONE** (`6 7` in `a349a75`; `shack pack` variants fixed in ShackHQ)

These had no `CANONICAL_LABELS` / `TO_CANONICAL` entry in
`lib/checklist-case-labels.ts`, so `titleCaseFallback` rendered them raw:

| caseType | Renders as | Cases | Customer | State |
|---|---|---|---|---|
| `6 7` | ~~6 7~~ **ShackPack 67** | 45 (7 dates, 2026-07-22..09-01) | The Coin Shack | **DONE `a349a75`** (`'6-7'` -> `'67'`) |
| `shack pack expo` | ~~Shack Pack Expo~~ gone | 3 (2026-08-14) | Blue Collar Bullion | **DONE in ShackHQ** (now `expo`) |
| `shack pack radiant` | ~~Shack Pack Radiant~~ gone | 10 (2026-08-13..14) | Blue Collar Bullion | **DONE in ShackHQ** (now `radiant`) |

**Why the `shack pack` variants were NOT relabelled.** Blue Collar Bullion also
holds the bare `expo` (32 cases) and `radiant` (45), which already label as
"ShackPack Expo" / "ShackPack Radiant". The checklist groups by raw caseType, so
mapping the variants to the same label would put two identical "ShackPack Expo"
buttons and two identical "ShackPack Radiant" buttons on that tab, each opening
different, non-overlapping dates. Owner ruling (2026-09-16): leave them
distinguishable and fix at the source, by changing those 13 cases' caseType in
ShackHQ to `expo` / `radiant` so they merge into the existing groups. No site
change is needed after that; do not add the `TO_CANONICAL` mappings unless the
checklist also merges same-label caseTypes.

**Resolved at the source (2026-09-16).** ShackHQ changed the 13 cases' caseType
to `expo` / `radiant`. No site mappings were added: `TO_CANONICAL` has no
`shack-pack-*` entry. Re-running the routing snapshot confirmed neither
`shack pack` caseType appears anywhere, Blue Collar Bullion's `expo` rose
32 -> 35 and `radiant` 45 -> 55, the total stayed 13,345 cases, and no slug or
bucket changed. The Blue Collar Bullion tab now shows one "ShackPack Expo" and
one "ShackPack Radiant" and no "Shack Pack" buttons.

## 3. `caseTypePrefixes` / `brandForCaseType` are dead — **OPEN**

Nothing outside `lib/brands.ts` reads either (checklist attribution is by
`customerName`; see `12`). The field is still filled in on every brand, and the
brand comments still explain prefix choices as if they route. Either delete the
field and function, or mark them dead in the file so no one extends them.

## 4. ShackHQ caseTypes pending — **OPEN (ShackHQ side)**

`opal`, `cipher`, `pulse`, `fury` and `phantom` do not exist in ShackHQ yet
(`relic` does, 1 case). Site tiles and "ShackPack {Name}" labels are already in
place for all six, for both the bare and `shackpack-{name}` spellings. Nothing to
do on the site once ShackHQ creates them; they will route to ShackPack via the
house bucket.

---

# Admin access — 2026-09-16

## 1. Stale admin account demoted — **DONE** (prod DB, no code change)

`gjpacking123@gmail.com` is the company Gmail. Only its shackpck.com site login
was disabled; the mailbox itself is untouched and remains the `ADMIN_EMAIL`
notification inbox.

In one transaction (which first re-checked that the ADMIN set was exactly the two
accounts below): `role` ADMIN -> **CUSTOMER**, and `passwordHash` replaced with a
bcrypt (cost 10) hash of a random 32-byte value that was never printed or stored,
so nobody knows a password for the account. The account had no linked orders,
builds, addresses or series purchases.

| | ADMIN users |
|---|---|
| Before | `gjpacking123@gmail.com`, `zach@theshackhq.com` |
| After | `zach@theshackhq.com` |

`ADMIN_EMAILS` is confirmed unset in Netlify, so nothing re-promotes the account
on sign-in. `NEXTAUTH_SECRET` was **not** rotated: sessions are JWT (NextAuth's
default 30-day rolling `maxAge`) and a JWT issued before the change still carries
`role: ADMIN`, but every admin API route (`/api/admin/orders`,
`/api/admin/builds`, `/api/admin/builds/[id]`, `/api/admin/builds/email-digest`)
and now the artwork route re-read the role from the DB by user id, so such a
session sees at most the `/admin` page shells with every data call returning 403.

## 2. Artwork access by admin role, not inbox email — **DONE `c6067a0`**

`/api/build/artwork/[...key]` used to admit any signed-in user whose email matched
`ADMIN_EMAIL`, so the inbox address doubled as an identity regardless of DB role.
It now admits the build owner, or a signed-in user whose DB role is ADMIN (looked
up by session user id on every request); everyone else, including signed-out
requests, gets 404. The artwork link in the admin notification email therefore
works only when opened while signed in with an admin account. The `lib/auth.ts`
comment that used the company Gmail as its example `ADMIN_EMAILS` value now uses
placeholder addresses.

## 3. Embedded connection strings in two scripts — **OPEN**

*Corrected 2026-09-18 — the scripts named here were wrong.* The two that embed
**real** credentials are:

| Script | Last changed | State |
|---|---|---|
| `coins/scripts/get-supabase-connection.js` | `4e4a430` (2026-02-12) | real password, twice |
| `coins/scripts/update-db-connection.js` | `4e4a430` (2026-02-12) | real password |

`coins/scripts/setup-env.js` and `coins/scripts/verify-db-connection.js` also
contain connection strings, but with `[YOUR-PASSWORD]` placeholders only — they
are not an exposure and need no change.

**Neither embedded password matches the live production credential**, and
neither points at the production host (checked 2026-09-18 by comparison against
`coins/.env.prod.local`, without printing either value), so this is stale
credential material rather than a live leak — no rotation is needed. Still strip
the connection strings from both scripts (read `DATABASE_URL` from the
environment, or delete the scripts), so a credentialed URL is not kept in git.

---

# Supabase RLS state — 2026-09-17

Read from prod (`pg_class.relrowsecurity`, `information_schema.role_table_grants`)
when `ContactInquiry` shipped (`258be87`). The app connects as `postgres`, which
has `rolbypassrls = true`, so RLS never affects the site's own Prisma queries.

## 1. `ContactInquiry` — RLS **ON** — **DONE**

Created by `prisma db push` (the diff was create-only: the `ContactReason` and
`CustomBrandingChoice` enums, the table and its `createdAt` index), then
`ALTER TABLE "ContactInquiry" ENABLE ROW LEVEL SECURITY;` with **no policies**.
Supabase's default privileges still grant `anon` and `authenticated` every table
privilege on it, but with RLS on and no policy those roles can select, insert,
update and delete nothing. (TRUNCATE is not subject to RLS, but it is not
reachable through the Supabase Data API.) Verified through Prisma on the prod
connection: an insert and delete inside a rolled-back transaction worked, and
no existing table's columns, indexes, constraints or RLS flag changed.

## 2. Existing tables — RLS **off**, `anon` / `authenticated` fully granted — **DONE 2026-09-17** (commit `chore(db): enable RLS on all public tables, add check script`)

| Table | RLS | `anon` | `authenticated` |
|---|---|---|---|
| `Address` | off | SELECT INSERT UPDATE DELETE TRUNCATE REFERENCES TRIGGER | same |
| `Build` | off | same | same |
| `BuildLine` | off | same | same |
| `Order` | off | same | same |
| `OrderItem` | off | same | same |
| `Series` | off | same | same |
| `SeriesPurchase` | off | same | same |
| `User` | off | same | same |

If the Supabase Data API (PostgREST) exposes schema `public`, anyone with the
project's anon key (a publishable key by design) can read and write every row of
these tables, including `User` (emails, password hashes, roles) and `Order`.
Whether the Data API is enabled for `public` was **not** checked. The site does
not use the anon key (no `@supabase/supabase-js`; Prisma only), so enabling RLS
with no policies, or revoking the `anon` / `authenticated` grants, should not
affect the site, but that is a separate, explicitly approved change: nothing on
these tables was altered on 2026-09-17 when `ContactInquiry` shipped.

**Resolved 2026-09-17**, as a separately approved change. In one transaction,
`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` on all eight tables above: no
policies, no `FORCE`, grants left unchanged. Verified on prod afterwards: all 9
`public` tables have RLS on with 0 policies; columns, indexes, constraints and
enums are identical to the pre-change fingerprint apart from the eight RLS flags;
Prisma still reads (`User` 12, `Order` 2, `Series` 4, unchanged) and writes (a
`Series` insert and delete inside a rolled-back transaction). The live site passed
all 37 browser checks, and `/series`, `/auth/signin`, `/account`, `/build` and
`/api/series` returned 200 signed out. Netlify function logs could not be pulled
(Netlify CLI not logged in). New `coins/scripts/check-rls.ts` exits 0 against prod;
see `10` for the rule to run it after every prod `prisma db push`.

## 3. Exposure review — **DONE**

The owner reviewed the Supabase API Gateway logs for 2026-09-16 11:37 to
2026-09-17 10:00 UTC, the full retention window available. There were zero
`/rest/v1` requests: only Supabase infrastructure health checks and our own admin
connections. No evidence of access. Data before that window cannot be verified.
No breach notification needed; password resets not required.

---

# Auth hardening — Phase 1 — 2026-09-17

## 1. `callbackUrl` handling — **DONE**

Recon (dev, local DB): the sign-in page ignored `callbackUrl` entirely (always `/account`, so `/admin`, `/my-builds` and builder links lost their destination), and NextAuth's default `redirect` callback returned **500** on unparseable values (`%2F%2Fevil.example`, `https://localhost:3123.evil.example/`). No off-site redirect was possible. Prod ignored a spoofed `X-Forwarded-Host`.
Fix: `lib/safe-redirect.ts` is used by a `redirect` callback in `lib/auth.ts` and by the sign-in page. Same-origin paths are kept; everything else lands on `/account`; nothing returns 500. 30 fixtures in `scripts/test-safe-redirect.ts`.

## 2. Email normalization — **DONE** (prod rows: see item 5)

Recon: every write and lookup matched the email exactly, so a user stored with uppercase could only sign in by typing that exact casing. Prod had 12 users: 3 with uppercase (all with passwords), 0 with outer whitespace, 0 collisions on `lower(trim(email))`.
Fix: `lib/normalize-email.ts`, used in register, `authorize`, both guest-checkout shadow-user lookups/creates, and `pushUserToInventory`. Lookups are `findFirst` with `mode: 'insensitive'`. Register now returns 409 for any casing of an existing email.

## 3. Admin checks — **DONE**

Recon: five server copies read the database role, but `/admin` and `/admin/builds` gated on the **session token** role, which stays stale after a demotion.
Fix: `lib/require-admin.ts` replaces all five copies (`/api/admin/builds`, `/api/admin/builds/[id]`, `/api/admin/builds/email-digest`, `/api/admin/orders`, the artwork route). `/admin` is now a server page with `AdminDashboardClient`, and `/admin/builds` is gated in its server wrapper. Signed out -> `/auth/signin?callbackUrl=<path>`; non-admin (including demoted mid-session) -> `/account`. `ADMIN_EMAILS` and `isAdminEmail` were removed: the database role is the only admin source.

## 4. Series endpoints — **DONE** (4a/4b beyond the approved list; 4c is OPEN)

- `GET /api/series?active=false` now returns inactive series to admins only. Everyone else silently gets active-only, never an error.
- **4a.** `POST /api/series` (create) had **no auth at all** despite its "admin only" comment. It now requires `requireAdmin`.
- **4b.** `PATCH /api/series/[slug]` (name, price, pack counts, `isActive`) had **no auth at all**. It now requires `requireAdmin`. No caller in this repo or in `coin-inventory-system` was found for either.
- **4c. DONE 2026-09-17** (commit `fix(api): gate series sync endpoint`): `/api/sync/series` (GET and POST) and `/api/series/sync-from-inventory` (GET), both of which upserted ShackHQ series into `Series` with no auth, now go through `lib/sync-auth.ts` `authorizeSync`: an admin session (database role), or an `x-sync-secret` header matching `SYNC_SERIES_SECRET` (constant-time compare). With the secret unset, only admins get in. No caller existed before gating: nothing in this repo, the `coin-inventory-system` repo, `netlify.toml`, Netlify functions or GitHub workflows, and prod `pg_stat_statements` (reset 2026-09-10) showed no `Series` upserts. `Series` was last updated 2026-02-19.

## 5. Lowercase existing prod emails — **DONE 2026-09-17**

`scripts/lowercase-emails.ts --dry-run`, then the real run, against prod via `coins/.env.prod.local`, after the Phase 1 deploy was confirmed. Dry run: 12 users, 3 to update, 0 collisions. Real run: **3 updated**, committed in one transaction. Independent recount afterwards: **12 users, 0 not normalized, 0 collisions**. The case-insensitive lookups kept those 3 users able to sign in before and after.

## 6. BLOCKERS before enabling `NEXT_PUBLIC_ENABLE_CHECKOUT` — **OPEN**

Checkout is currently off in prod: the live `/checkout` redirects to `/contact` and no cart is shown (read-only check, 2026-09-17). The flag gates the UI only; `/api/checkout/create-intent` and `/api/orders` do not check it server-side.

- **6a. Guest checkout 500s for a registered email — blocker before enabling `NEXT_PUBLIC_ENABLE_CHECKOUT`.** `create-intent` finds the user by email and, if that user is *not* a shadow user, tries to create a second user with the same email, which fails the unique constraint and returns 500. A registered customer checking out as a guest cannot pay.
- **6b. Guest orders attach to registered accounts — blocker before enabling `NEXT_PUBLIC_ENABLE_CHECKOUT`.** `/api/orders` looks the guest's email up and, when a registered (non-shadow) account has it, attaches the order to that account with no sign-in. Anyone who knows a customer's email can place orders into that customer's history.
- **6c. The Stripe webhook never creates the order it claims to — blocker before enabling `NEXT_PUBLIC_ENABLE_CHECKOUT`.** `handleSuccessfulPayment` in `app/api/webhooks/stripe/route.ts` is commented as creating "a placeholder order", but it creates no order at all: it *looks one up* by `stripePaymentIntentId` and carries on whether or not it finds one. On `payment_intent.succeeded` it increments `user.loyaltyPoints` with **no idempotency key or guard**, so every Stripe retry credits the points again; generates a **FedEx shipping label** from the payment intent's address, then never persists the tracking number or label URL to any row — they exist only inside the emails; and when the lookup finds nothing, it emails the customer a confirmation with **`orderId` = the payment intent id and an empty item list**, and sends the admin a notification with nothing to pack. The handler also swallows every error and returns `200 {received: true}`, explicitly so Stripe will not retry — so a failure here is invisible. Fix the order lifecycle before money can flow: create the order before the payment intent, make the webhook idempotent, persist the label, and do not email on a missing order.
- Related: because the flag is UI-only, `create-intent` is reachable in prod today and can create shadow users and Stripe customers for arbitrary emails. Gate the checkout APIs server-side on the same flag when fixing 6a/6b.

---

# Rate limiting — Phase 3 — 2026-09-17 — **DONE** (`fea53f3`)

Upstash Redis (free tier, us-east-1; `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` set in Netlify for all contexts, token secret). `@upstash/ratelimit` sliding window via `lib/rate-limit.ts`.

| Endpoint | Limit | Where | Over the limit |
|---|---|---|---|
| `POST /api/contact` | 5 / 10 min / IP | first line, before validation and saving | 429 `Too many submissions, try again shortly.` (shown by the form) |
| `POST /api/auth/register` | 5 / hour / IP | first line | 429 `Too many sign-up attempts, try again later.` |
| Credentials sign-in (`/api/auth/callback/credentials`) | 10 / 10 min / IP **and** / normalized email; every attempt counts | POST wrapper in `/api/auth/[...nextauth]` (an `authorize()` throw would always be 401) | 429 `{ url: .../api/auth/error?error=RateLimited }`; the sign-in page shows `Too many attempts, try again in a few minutes.` |
| `POST /api/checkout/create-intent` | 10 / 10 min / IP | first line | 429 `Too many checkout attempts, try again shortly.` |

- **Fails open:** unset env, store error or 1 s timeout allows the request and logs `[rate-limit] ...`.
- **Client IP:** `x-nf-client-connection-ip`, then the first `x-forwarded-for` entry.
- **Email keys:** SHA-256 hashes of the normalized email, so no addresses are stored in Upstash.
- **Key prefix:** `shackpck:<CONTEXT or NODE_ENV>:rl`. Whether Netlify exposes `CONTEXT` to functions at runtime shows in the first `[rate-limit] store=upstash prefix=...` function-log line after deploy.
- **Verified on dev (in-memory fake):**
  - Limits trip at 6 / 6 / 11 / 11, a blocked contact request saves nothing, and both friendly messages render.
  - The per-email sign-in limit trips across 10 IPs and mixed casing.
  - Other IPs and an unlimited route are unaffected.
  - A throwing store fails open: submissions save and correct sign-ins work.
  - The development default is a no-op.
- **Fixture:** `scripts/test-rate-limit.ts` (23 checks).

---

# ShackPack Builder save fixes — Phase 2 — 2026-09-17 — **DONE** (`07d442c`, `742edd1`)

Recon reproduced every issue on dev against the local database before any change; the same checks (18) pass after. Details and the new file layout are in `06`.

| # | Issue found | State |
|---|---|---|
| 1 | Signing in from the builder's gate lost the whole draft, while the modal claimed it would not | **DONE** — sessionStorage stash per build scope, restored on return, cleared on save/submit; gate links fixed (`/auth/register`, `pathname + search`) |
| 2 | No dirty tracking: navigating away or reloading lost work silently | **DONE** — "Unsaved changes" indicator and a `beforeunload` confirmation |
| 3 | `?id=` that was missing, someone else's, or a server error left an editable blank builder; saving from it created a second build | **DONE** — explicit load states with recovery actions, no blank-draft fallback |
| 4 | Three fast Save clicks created three builds; two concurrent submits both emailed the team | **DONE** — in-flight refs, plus an atomic submit claim that releases on send failure |
| 5 | Save failure showed an error and kept local state | Already correct; still verified |
| 6 | A failed artwork upload orphaned a build created just to hold it; `canUpload` was hardcoded true | **DONE** — the created build is deleted on failure; real storage availability is passed from the server |
| 7 | Submit had no rate limit | **DONE** — 5/hour per **user id** (`build-submit` bucket), 429 with a friendly message |

Not changed, and still true: every builder API checks ownership (404, so existence never leaks), all write routes validate with Zod, and a SUBMITTED build cannot be edited (409).

---

# Artwork notice and session timeout — 2026-09-18 — **DONE** (`558f44d`, `d0709a0`)

- **Artwork after the sign-in gate:** the draft survived but the picked artwork did not, silently. The stash now carries an `artworkPending` flag (never image bytes), and a restore with that flag shows a notice plus an "Upload artwork again" button. Stash version v2 -> v3; a v2 stash is ignored, not half-restored.
- **8-hour idle session timeout for everyone:** `maxAge` 8h with `updateAge` 30 min, so the window is idle-based (7.5–8h in practice) and active use never signs anyone out. Pre-existing sessions keep their 30-day expiry until their next refresh, within 30 min of their next activity.
- **Expiry never loses builder work:** a 401 from save or submit stashes the draft, shows "Your session expired. Sign in to save your build," and the sign-in link carries `pathname + search` so the restore lands on the same build.
- **Audit of other signed-in writers:** My Builds and checkout already surface failures and keep their input. **Account → Add Address** silently dropped a typed address on 401 (it never checked `res.ok`) and was fixed. See `06`.
- Verified on dev: 3 artwork checks, 4 session checks (expiry signs out, expired save stashes and restores, rolling activity never signs out), and the existing 18 builder checks still pass.

---

# Prisma migrations — Phase 4 — 2026-09-18 — **DONE**

Prod schema changes were manual `prisma db push` runs with no migration history. Now they are migrations, applied by an explicit command, never by the Netlify build. Workflow in `10`.

- **`0_init` generated from the current schema** (after `ContactInquiry`) with `migrate diff --from-empty --to-schema-datamodel`: 9 tables, 6 enums, 17 indexes, 6 unique indexes, 8 foreign keys, no destructive statements (the only `DELETE` tokens are `ON DELETE CASCADE`). Matches prod's 9 tables and 6 enums exactly, and `migrate diff` from the prod datasource to the schema reported **an empty migration**, i.e. zero drift, before anything was applied.
- **Prod baselined** with `migrate resolve --applied 0_init`: `_prisma_migrations` now records `0_init` with `applied_steps_count = 0` (recorded, not executed), the 9 app tables were untouched, and `migrate status` reports "Database schema is up to date!".
- **`_prisma_migrations` needed RLS.** The guard flagged it right after baselining (it is a new public table, and Supabase grants `anon`/`authenticated` on new tables), so RLS was enabled on it: all 10 public tables are now ON with 0 policies.
- **`npm run db:migrate:prod`** (`coins/scripts/db-migrate-prod.mjs`) loads `coins/.env.prod.local`, never prints it, and refuses to run when the URL is localhost, the branch is not `main`, or the working tree is dirty. It prints `migrate status` before `migrate deploy`, and on success reminds you to run the RLS guard and then deploy. All three refusals were exercised.
- **CI** now runs `prisma migrate deploy` instead of `prisma db push` against its throwaway Postgres, so a missing or broken migration fails the PR.
- **Proved end to end on the LOCAL database only:** reset from migrations (so `0_init` genuinely built the schema from empty, `applied_steps_count = 1`), added a nullable `Build.proofColumn`, `migrate dev` generated and applied `ALTER TABLE "Build" ADD COLUMN "proofColumn" TEXT;`, the column existed and was nullable, then it was reverted and the local database reset back to `0_init` only. **No schema change was applied to prod.**
- **Order that keeps this safe:** migrate, run the RLS guard, then deploy — and every migration stays backward-compatible with the code already running (nullable or defaulted columns; drops in a later migration). `migrate deploy` only rolls forward, so a bad migration is fixed with another one.

---

# Code placeholders — 2026-09-18

A sweep for `TODO` / `FIXME` / `HACK` / `XXX` across every tracked file. The
three already recorded in `11-known-issues.md` (`inventory-api-push`,
`email.ts` newsletter, `coin-inventory-api` pending endpoints) are still open;
their line numbers had drifted and were corrected there. Two more were not in
any backlog, both in the Stripe webhook:

## 1. Loyalty points are a guessed rate — **OPEN**

`app/api/webhooks/stripe/route.ts:100` — "using 1 point per dollar as
placeholder". The rate comes from `LOYALTY_POINTS_PER_DOLLAR` with a default of
`1`, and the increment runs on every `payment_intent.succeeded` with no
idempotency, so a Stripe retry credits it twice. Nobody has ruled on what the
rate should actually be, and the loyalty balance is customer-visible.

## 2. The webhook's "placeholder order" — **OPEN** (checkout blocker **6c**)

`app/api/webhooks/stripe/route.ts:120` — the comment says the handler creates a
placeholder order; it creates nothing and only looks one up by
`stripePaymentIntentId`. Full behaviour and the fix are written up as **6c**
under *Auth hardening — Phase 1 §6, BLOCKERS before enabling
`NEXT_PUBLIC_ENABLE_CHECKOUT`*.

Also noted, not tracked as items: `env.production.template` carries four `TODO`
markers for credentials to fill in (lines 19, 29, 35, 72), which is what a
template is for.
