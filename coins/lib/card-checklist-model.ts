/**
 * Unified read model for the Cards line of the checklist.
 *
 * Normalizes three sources into one shape so the render layer has a single
 * code path:
 *
 *   1. lib/card-series-checklist.ts — the FROZEN ARCHIVE of real, dated,
 *      exact published series. Never edited, never re-ordered here.
 *   2. lib/card-example-checklists.ts — undated marketing EXAMPLES.
 *   3. the live ShackHQ card API, via adaptApiSeries below.
 *
 * The first two are synchronous and always present (STATIC_CARD_SERIES); the
 * third merges on top at runtime. Every helper takes the series list as a
 * PARAMETER rather than reading a module const, so the render can pass
 * static-only or static+API without a second code path — and so an API
 * outage degrades to exactly the static list rather than an empty tab.
 *
 * Nothing in this file is hardcoded to a brand or a series type. The brand
 * tabs, the series-type groups and the date buttons are all derived from the
 * content that exists, so adding a series or an example makes it appear.
 *
 * The dated/undated split is the load-bearing distinction: `seriesDate` is a
 * string for real series and null for examples, and ONLY null-dated content
 * carries the example disclaimer.
 */

import { BRANDS, type BrandId } from '@/lib/brands';
import { brandIdForCustomerName } from '@/lib/customer-attribution';
import { CARD_SERIES_CHECKLISTS } from '@/lib/card-series-checklist';
import { CARD_EXAMPLE_CHECKLISTS } from '@/lib/card-example-checklists';

/** One card, matching the API's { position, entryName } contract. */
export type CardEntry = {
  /**
   * Value rank, 1..N, most valuable first. For cards this IS displayed —
   * the deliberate opposite of CoinData.position, which is a slot number that
   * is never shown. See the note on CardChecklistCard in app/checklist/types.
   */
  position: number;
  /** Raw source text. Always rendered through cleanEntryName. */
  entryName: string;
};

export type CardSeries = {
  id: string;
  brandId: BrandId;
  /** Group heading: an archive seriesType, or EXAMPLE_SERIES_TYPE. */
  seriesType: string;
  /** Plain title. Never carries a date — the date comes from the button. */
  seriesName: string;
  subtitle?: string;
  /** ISO date for real series; null for undated examples. */
  seriesDate: string | null;
  cards: CardEntry[];
};

/** Group heading used for all undated example content. */
export const EXAMPLE_SERIES_TYPE = 'Example Checklists';

/** Label shown where a date button would go, for undated content. */
export const EXAMPLE_DATE_LABEL = 'Sample';

/**
 * The archive belongs to ShackPack — those are ShackPack's own produced
 * series. It carries no brand field of its own (and must not be edited to add
 * one), so ownership is asserted here, in the adapter.
 */
const ARCHIVE_BRAND_ID: BrandId = 'shackpack';

/** Strip a trailing date from an archived title: "Gauntlet Series 3 8/4/2026". */
function stripTrailingDate(title: string): string {
  return title.replace(/\s+\d{1,2}\/\d{1,2}\/\d{2,4}\s*$/, '').trim();
}

/**
 * Adapt the frozen archive. The card list is `string[]` with no explicit rank,
 * so position is its 1-based index — this preserves the archive's own order
 * exactly, which is the order it has always rendered in.
 */
function fromArchive(): CardSeries[] {
  return CARD_SERIES_CHECKLISTS.map((series) => ({
    id: series.id,
    brandId: ARCHIVE_BRAND_ID,
    seriesType: series.seriesType,
    // Titles in the archive sometimes embed their own date. The date is shown
    // by the selected button, so it is stripped from the title here rather
    // than edited out of the frozen file.
    seriesName: stripTrailingDate(series.title),
    subtitle: series.subtitle,
    seriesDate: series.date,
    cards: series.cards.map((entryName, index) => ({
      position: index + 1,
      entryName,
    })),
  }));
}

/** Adapt the undated examples. Their `position` is already the value rank. */
function fromExamples(): CardSeries[] {
  return CARD_EXAMPLE_CHECKLISTS.map((example, index) => ({
    id: `example-${example.brandId}-${index}`,
    brandId: example.brandId,
    seriesType: EXAMPLE_SERIES_TYPE,
    seriesName: example.seriesName,
    seriesDate: null,
    cards: example.cards.map((card) => ({
      position: card.position,
      entryName: card.entryName,
    })),
  }));
}

/**
 * The synchronous base list: frozen archive + undated examples.
 *
 * Always available with no network, which is what keeps the Cards tab alive
 * when the API is down. API series merge ON TOP of this, never in place of it.
 */
export const STATIC_CARD_SERIES: CardSeries[] = [...fromArchive(), ...fromExamples()];

/**
 * Brands that actually have card content, in BRANDS tab order.
 *
 * Derived from the series present — NOT from a list and NOT from the `hasCards`
 * flag, so a brand can never show an empty Cards tab.
 */
export function getCardBrands(series: CardSeries[]): BrandId[] {
  const present = new Set(series.map((s) => s.brandId));
  return BRANDS.filter((brand) => present.has(brand.id)).map((brand) => brand.id);
}

function seriesForBrand(series: CardSeries[], brandId: BrandId): CardSeries[] {
  return series.filter((s) => s.brandId === brandId);
}

/**
 * Series-type groups for one brand, derived from its content.
 *
 * Dated groups sort by most recent content first; the example group always
 * sorts last, since it is illustrative rather than a production run.
 */
export function getSeriesTypesForBrand(
  all: CardSeries[],
  brandId: BrandId
): string[] {
  const newestByType = new Map<string, string>();
  for (const series of seriesForBrand(all, brandId)) {
    if (series.seriesDate === null) {
      if (!newestByType.has(series.seriesType)) newestByType.set(series.seriesType, '');
      continue;
    }
    const current = newestByType.get(series.seriesType);
    if (current === undefined || series.seriesDate > current) {
      newestByType.set(series.seriesType, series.seriesDate);
    }
  }

  return Array.from(newestByType.entries())
    .sort(([aType, aDate], [bType, bDate]) => {
      if (aType === EXAMPLE_SERIES_TYPE) return 1;
      if (bType === EXAMPLE_SERIES_TYPE) return -1;
      if (aDate !== bDate) return bDate.localeCompare(aDate);
      return aType.localeCompare(bType);
    })
    .map(([type]) => type);
}

/**
 * Selectable dates for one brand + series type, most recent first.
 *
 * Returns [null] for undated content, which the render layer shows as a
 * "Sample" button in the date row's place.
 */
export function getDatesForSeriesType(
  all: CardSeries[],
  brandId: BrandId,
  seriesType: string
): (string | null)[] {
  const dates = new Set<string | null>();
  for (const series of seriesForBrand(all, brandId)) {
    if (series.seriesType === seriesType) dates.add(series.seriesDate);
  }
  return Array.from(dates).sort((a, b) => {
    if (a === null) return 1;
    if (b === null) return -1;
    return b.localeCompare(a);
  });
}

/**
 * Series for one brand + type + date. Several series can share a date, and
 * they stack under that date button — the same way coin series stack.
 */
export function getSeriesFor(
  all: CardSeries[],
  brandId: BrandId,
  seriesType: string,
  seriesDate: string | null
): CardSeries[] {
  return seriesForBrand(all, brandId).filter(
    (s) => s.seriesType === seriesType && s.seriesDate === seriesDate
  );
}

/** How many series a brand + type covers; drives the group button subtitle. */
export function countSeriesForType(
  all: CardSeries[],
  brandId: BrandId,
  seriesType: string
): number {
  return seriesForBrand(all, brandId).filter((s) => s.seriesType === seriesType).length;
}

/**
 * A base name that already carries its own trailing series number.
 * Captures the base and the number so an explicit number can seed the counter.
 */
const NUMBERED_SUFFIX = /^(.*?)\s+series\s+(\d+)$/i;

/** Lowercased lookup key for counting occurrences of one base name. */
function numberingKey(name: string): string {
  return name.toLowerCase();
}

/**
 * Turn the base series names sharing ONE date into their display titles.
 *
 * ShackHQ is moving the API's seriesName to a plain product name ('Gauntlet
 * Live') with no number; the site appends the number, scoped to the date.
 *
 * Called by adaptApiSeriesList below, once per (brand, seriesType, date)
 * group. The static archive keeps its own hand-written titles and is never
 * passed through here.
 *
 * Pure: takes strings, returns strings. It reads no module state and touches
 * none of the data above, so one call is one date and the count always
 * restarts at 1.
 *
 * Rules:
 *  - Counting is PER BASE NAME, so ['Gauntlet Live', 'Nova', 'Gauntlet Live']
 *    gives Gauntlet Live Series 1 / Nova Series 1 / Gauntlet Live Series 2.
 *  - Input order is preserved; nothing is sorted.
 *  - A name that already ends in 'series <digits>' (case-insensitive) is
 *    returned unchanged rather than being numbered twice.
 *  - Names are trimmed and internal whitespace collapsed before matching.
 *
 * One rule the spec left open: an already-numbered name also SEEDS the counter
 * for its base, so a mixed date like ['Gauntlet Live Series 1', 'Gauntlet
 * Live'] yields Series 1 / Series 2 rather than two titles both called
 * Series 1. Passing it through without seeding would mint a duplicate title on
 * the same date, which is the one outcome this helper exists to prevent.
 *
 * @param baseNames Base seriesNames for one date, in API order.
 * @returns Display titles, same length and same order as the input.
 */
export function numberSeriesForDate(baseNames: string[]): string[] {
  /** base name key -> highest series number used so far on this date. */
  const highestUsed = new Map<string, number>();

  return baseNames.map((raw) => {
    const name = raw.trim().replace(/\s+/g, ' ');
    if (!name) return name;

    const alreadyNumbered = NUMBERED_SUFFIX.exec(name);
    if (alreadyNumbered) {
      const key = numberingKey(alreadyNumbered[1].trim());
      const explicit = Number(alreadyNumbered[2]);
      highestUsed.set(key, Math.max(highestUsed.get(key) ?? 0, explicit));
      return name;
    }

    const key = numberingKey(name);
    const next = (highestUsed.get(key) ?? 0) + 1;
    highestUsed.set(key, next);
    return `${name} Series ${next}`;
  });
}

// ---------------------------------------------------------------------------
// Live ShackHQ card API
// ---------------------------------------------------------------------------

/**
 * The API fields this adapter reads, per the live ShackHQ contract:
 * seriesId, seriesDate, totalCards, seriesType, customerName, submittedAt.
 *
 * There is NO seriesName on the wire. The title is derived from seriesType
 * plus a per-date number - see adaptApiSeries.
 *
 * Structurally satisfied by both CardChecklistSeriesSummary (nav, no cards)
 * and CardChecklistSeriesResponse (full, with cards), so one adapter serves
 * both without importing app types into lib.
 */
export type ApiSeriesLike = {
  /** Stable identity, and the only safe key for state. */
  seriesId: string;
  seriesDate: string;
  /** ISO timestamp. Sole ordering key for series numbering - see below. */
  submittedAt: string;
  /** Grouping key. Its absence excludes the series. */
  seriesType?: string;
  /** Brand routing key. Its absence excludes the series. */
  customerName?: string;
  cards?: CardEntry[];
};

/**
 * API seriesType -> the archive's group heading, for the one product line
 * whose ShackHQ name differs from its heading here.
 *
 * THE ARCHIVE IS THE SOURCE OF GROUP NAMES. lib/card-series-checklist.ts files
 * 13 series under "Gauntlet"; ShackHQ calls that same product line "Gauntlet
 * Live". Without this map the nav would show two buttons for one product line,
 * one frozen and one growing.
 *
 * Confirmed with ShackHQ as a ONE-OFF: every other line (Nova, Fusion, Select,
 * Abyss, Limitless) arrives as its bare name and already matches its heading.
 *
 * Matching is EXACT on the whole value, case-insensitively - never a suffix
 * rule and never a pattern. "Gauntlet Live Extra" and "Live" are not matches
 * and pass through untouched, so a future product line lands under its own
 * heading with no code change and an unknown type is never silently rewritten.
 *
 * This does NOT affect the gate: a series with no seriesType at all is still
 * excluded. Normalization only renames a type that is already present.
 *
 * Adding a future alias is a one-line edit to this map.
 */
export const SERIES_TYPE_ALIASES: Record<string, string> = {
  'Gauntlet Live': 'Gauntlet',
};

/** Lowercased alias key -> archive heading, derived from SERIES_TYPE_ALIASES. */
const SERIES_TYPE_ALIAS_LOOKUP: ReadonlyMap<string, string> = new Map(
  Object.entries(SERIES_TYPE_ALIASES).map(([from, to]) => [from.toLowerCase(), to]),
);

/**
 * Clean an API seriesType and map it onto the archive's group name.
 *
 * Trims and collapses internal whitespace, then looks the whole cleaned value
 * up in SERIES_TYPE_ALIASES. Returns the alias target when it matches, or the
 * cleaned original when it does not. The alias entry supplies the casing, so
 * "gauntlet live" and "Gauntlet Live" both yield "Gauntlet".
 */
export function normalizeSeriesType(raw: string): string {
  const cleaned = raw.trim().replace(/\s+/g, ' ');
  if (!cleaned) return cleaned;
  return SERIES_TYPE_ALIAS_LOOKUP.get(cleaned.toLowerCase()) ?? cleaned;
}

/**
 * Adapt one API series into the common shape, or return null to EXCLUDE it.
 *
 * THE GATE. A series is excluded when it lacks `seriesType`, lacks
 * `customerName`, or carries a customerName that routes to no known brand.
 * There is deliberately no fallback: no guessing, no "Uncategorized" bucket,
 * no defaulting the brand to ShackPack. A series we cannot place is not shown,
 * because showing it in the wrong place is worse than not showing it.
 *
 * TWO DIFFERENT VALUES COME OUT OF seriesType. Do not collapse them:
 *
 *   GROUP heading = normalizeSeriesType(raw) -> "Gauntlet"
 *   TITLE base    = the RAW seriesType       -> "Gauntlet Live"
 *
 * So a "Gauntlet Live" series files under the archive's existing Gauntlet
 * group button, while its own title still reads "Gauntlet Live Series 1".
 * Normalizing the title too would rename the product line in the customer's
 * face; grouping on the raw value would split one line across two buttons.
 * `seriesType` on the result is the NORMALIZED value; `seriesName` here is the
 * UNNUMBERED title base, which adaptApiSeriesList replaces with the numbered
 * title.
 *
 * `seriesId` is identity and is never derived from anything.
 */
export function adaptApiSeries(input: ApiSeriesLike): CardSeries | null {
  // The gate: absent seriesType excludes the series. Normalization runs after
  // that check, and only renames a type that is already present.
  const rawSeriesType = (input.seriesType ?? '').trim().replace(/\s+/g, ' ');
  if (!rawSeriesType) return null;
  const seriesType = normalizeSeriesType(rawSeriesType);

  const customerName = (input.customerName ?? '').trim();
  if (!customerName) return null;

  const brandId = brandIdForCustomerName(customerName);
  if (brandId === null) return null;

  return {
    id: input.seriesId,
    brandId,
    seriesType,
    // Title base, not the group heading. Numbered by adaptApiSeriesList.
    seriesName: rawSeriesType,
    seriesDate: input.seriesDate,
    cards: input.cards ?? [],
  };
}

/** Group key for numbering: one (brand, normalized type, date) bucket. */
function groupKey(series: CardSeries): string {
  return `${series.brandId} ${series.seriesType} ${series.seriesDate ?? ''}`;
}

/**
 * Adapt a whole API list, dropping every gated-out series, then number each
 * (brandId, normalized seriesType, seriesDate) group.
 *
 * ORDERING IS BY submittedAt, NEVER BY ARRAY POSITION. Within a group the
 * series sort by submittedAt ascending, with seriesId ascending as a
 * deterministic tiebreak, and are numbered 1..N in that order.
 *
 * This matters because a series number becomes public the moment it renders:
 * customers screenshot and link to "Gauntlet Live Series 2". The API makes no
 * promise about array order, so numbering by array position could silently
 * renumber an already-published series on the next fetch. submittedAt is
 * immutable per series, so the number assigned today is the number forever.
 *
 * The returned array is fully sorted (by group key, then by the in-group
 * order above) so the output does not depend on input order at all.
 *
 * Numbering runs on the RAW seriesType - the title base - so titles read
 * "Gauntlet Live Series 1" while the group heading stays "Gauntlet". Static
 * archive series are NOT passed through here; they carry hand-written titles.
 */
export function adaptApiSeriesList(inputs: ApiSeriesLike[]): CardSeries[] {
  const adapted = inputs
    .map((input) => ({ input, series: adaptApiSeries(input) }))
    .filter(
      (pair): pair is { input: ApiSeriesLike; series: CardSeries } =>
        pair.series !== null
    );

  const byGroup = new Map<string, typeof adapted>();
  for (const pair of adapted) {
    const key = groupKey(pair.series);
    const bucket = byGroup.get(key);
    if (bucket) bucket.push(pair);
    else byGroup.set(key, [pair]);
  }

  const out: CardSeries[] = [];
  for (const key of Array.from(byGroup.keys()).sort()) {
    const bucket = byGroup.get(key)!;
    bucket.sort((a, b) => {
      const byTime = (a.input.submittedAt ?? '').localeCompare(b.input.submittedAt ?? '');
      if (byTime !== 0) return byTime;
      return a.input.seriesId.localeCompare(b.input.seriesId);
    });

    // seriesName on each adapted series is the raw seriesType (title base).
    const titles = numberSeriesForDate(bucket.map((pair) => pair.series.seriesName));
    bucket.forEach((pair, i) => out.push({ ...pair.series, seriesName: titles[i] }));
  }

  return out;
}

/**
 * Merge API series on top of the static base.
 *
 * Static first, so an API failure degrades to exactly the static list. A
 * matching `id` lets an API series supersede a static one; today no ids
 * overlap, since ShackHQ ids look like "gauntlet-game-6_20260826_5ce42f63"
 * and archive ids are hand-written.
 */
export function mergeCardSeries(
  staticSeries: CardSeries[],
  apiSeries: CardSeries[]
): CardSeries[] {
  const bySeriesId = new Map(staticSeries.map((s) => [s.id, s]));
  for (const s of apiSeries) bySeriesId.set(s.id, s);
  return Array.from(bySeriesId.values());
}
