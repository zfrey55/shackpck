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
  /**
   * Cabinet series nested under this one, for a GROUPED stream day.
   *
   * EMPTY for flat series, for the static archive and examples, and for
   * cabinets themselves — the contract is exactly two levels, so a cabinet is
   * never a parent. A non-empty array is the single signal the render layer
   * uses to switch on group rendering; nothing else in the shape changes.
   *
   * Cabinets never appear in a top-level list. adaptApiSeriesList lifts them
   * in here and removes them from what it returns, which is what keeps nav,
   * date buttons, group counts and numbering correct with no filtering
   * anywhere else.
   */
  cabinets: CardSeries[];
  /**
   * ISO date this series was finalized. EXAMPLES ONLY, and only those that
   * are actually closed — see CardExampleChecklist.finalizedOn. Absent
   * everywhere else, including the frozen archive and every API series.
   */
  finalizedOn?: string;
  /**
   * Render entryName verbatim instead of through cleanEntryName. Set only by
   * the TCG examples, whose names are already canonical and which the
   * formatter would damage. Everything else formats at render time.
   */
  verbatimEntries?: boolean;
};

/**
 * Which of the two example notices a series carries.
 *
 * THE INVARIANT, and the reason this is a function rather than two unrelated
 * conditionals in the render layer: a series shows EXACTLY ONE of these. Never
 * both, and never neither for an example.
 *
 *   'illustrative' — the amber banner. This list is a sample; no pack was
 *                    built from it and a produced series will differ.
 *   'finalized'    — the finalized statement. This series is closed; the pack
 *                    count and item count will not change.
 *   'none'         — not an example. A dated series (the frozen archive, or a
 *                    live API series) is a real published run and states
 *                    neither.
 *
 * The two are contradictory by construction — "no pack was built from this
 * list" against "this series has been finalized" — so rendering both on one
 * series tells a customer two opposite things about the same checklist. That
 * happened: the banner was a GROUP-level slot above every example card while
 * the finalized statement was per-card, so a finalized example got both.
 * Deciding here, per series, is what makes that unrepresentable.
 *
 * `finalizedOn` is checked FIRST so a finalized series always states it, even
 * if it ever carries a date.
 */
export type ExampleNotice = 'illustrative' | 'finalized' | 'none';

export function exampleNoticeFor(series: CardSeries): ExampleNotice {
  if (series.finalizedOn) return 'finalized';
  if (series.seriesDate === null) return 'illustrative';
  return 'none';
}

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
    // The archive is flat by construction; grouping is a live-API concept.
    cabinets: [],
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
    cabinets: [],
    finalizedOn: example.finalizedOn,
    verbatimEntries: example.verbatimEntries,
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

// ---------------------------------------------------------------------------
// Live ShackHQ card API
// ---------------------------------------------------------------------------

/**
 * The API adapter lives in lib/card-api-adapter — the gate, seriesType
 * normalization, umbrella/cabinet tree assembly and per-date numbering. It is
 * re-exported here so this module stays the ONE import for the whole read
 * model and no caller has to know about the split.
 */
export {
  SERIES_TYPE_ALIASES,
  adaptApiSeries,
  adaptApiSeriesList,
  normalizeSeriesType,
  numberSeriesForDate,
} from './card-api-adapter';
export type { ApiSeriesLike } from './card-api-adapter';
