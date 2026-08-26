/**
 * Unified read model for the Cards line of the checklist.
 *
 * Normalizes two sources into one shape so the render layer has a single code
 * path (a third, the live ShackHQ card API, adapts into the same shape in a
 * later commit):
 *
 *   1. lib/card-series-checklist.ts — the FROZEN ARCHIVE of real, dated,
 *      exact published series. Never edited, never re-ordered here.
 *   2. lib/card-example-checklists.ts — undated marketing EXAMPLES.
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

/** Every card series from every source, unified. */
export const ALL_CARD_SERIES: CardSeries[] = [...fromArchive(), ...fromExamples()];

/**
 * Brands that actually have card content, in BRANDS tab order.
 *
 * Derived from the series present — NOT from a list and NOT from the `hasCards`
 * flag, so a brand can never show an empty Cards tab.
 */
export function getCardBrands(): BrandId[] {
  const present = new Set(ALL_CARD_SERIES.map((s) => s.brandId));
  return BRANDS.filter((brand) => present.has(brand.id)).map((brand) => brand.id);
}

function seriesForBrand(brandId: BrandId): CardSeries[] {
  return ALL_CARD_SERIES.filter((s) => s.brandId === brandId);
}

/**
 * Series-type groups for one brand, derived from its content.
 *
 * Dated groups sort by most recent content first; the example group always
 * sorts last, since it is illustrative rather than a production run.
 */
export function getSeriesTypesForBrand(brandId: BrandId): string[] {
  const newestByType = new Map<string, string>();
  for (const series of seriesForBrand(brandId)) {
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
  brandId: BrandId,
  seriesType: string
): (string | null)[] {
  const dates = new Set<string | null>();
  for (const series of seriesForBrand(brandId)) {
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
  brandId: BrandId,
  seriesType: string,
  seriesDate: string | null
): CardSeries[] {
  return seriesForBrand(brandId).filter(
    (s) => s.seriesType === seriesType && s.seriesDate === seriesDate
  );
}

/** How many series a brand + type covers; drives the group button subtitle. */
export function countSeriesForType(brandId: BrandId, seriesType: string): number {
  return seriesForBrand(brandId).filter((s) => s.seriesType === seriesType).length;
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
 * NOT WIRED INTO ANY RENDER PATH. Nothing calls this yet — it exists so the
 * API adapter commit has a tested rule to call rather than inventing one
 * inline. The static archive keeps its own hand-written titles.
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
