/**
 * The live ShackHQ card API adapter: wire shape -> the unified read model.
 *
 * Split out of lib/card-checklist-model so both files stay small. The model
 * owns the CardSeries shape, the static sources and the selectors; this file
 * owns everything that turns an API payload into CardSeries values — the
 * gate, seriesType normalization, GROUP (umbrella/cabinet) tree assembly and
 * per-date series numbering.
 *
 * Every name here is re-exported from lib/card-checklist-model, which stays
 * the single import for callers. Nothing should import this file directly.
 *
 * The only import from the model is type-only, so there is no runtime cycle.
 */

import { brandIdForCustomerName } from '@/lib/customer-attribution';
import type { CardEntry, CardSeries } from '@/lib/card-checklist-model';

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
  /**
   * GROUP LINK. `null` or absent means FLAT or UMBRELLA; a string means this
   * series is a CABINET and names its umbrella's seriesId.
   *
   * Every series on the live contract sends `null` today, so every path that
   * reads this is inert until ShackHQ's first grouped upload lands.
   */
  parentSeriesId?: string | null;
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
    // Filled by adaptApiSeriesList, which is the only place a tree is built.
    cabinets: [],
  };
}

// ---------------------------------------------------------------------------
// GROUP (umbrella / cabinet) tree assembly
// ---------------------------------------------------------------------------

/** One gated-in series plus the raw input it came from. */
type AdaptedPair = { input: ApiSeriesLike; series: CardSeries };

/**
 * The canonical in-group order: submittedAt ascending, seriesId ascending as
 * the deterministic tiebreak. Used for cabinets within an umbrella and for
 * series within a numbering group, so both orders come from one definition.
 */
function bySubmittedAt(a: AdaptedPair, b: AdaptedPair): number {
  const byTime = (a.input.submittedAt ?? '').localeCompare(b.input.submittedAt ?? '');
  if (byTime !== 0) return byTime;
  return a.input.seriesId.localeCompare(b.input.seriesId);
}

/**
 * This series' parent link, or null when there is none.
 *
 * Absent, null and blank all mean the same thing — FLAT or UMBRELLA. Every
 * series on the live contract sends null today, so every branch below that
 * depends on a non-null link is unreachable until ShackHQ's first grouped
 * upload lands.
 */
function parentLinkOf(input: ApiSeriesLike): string | null {
  const raw = (input.parentSeriesId ?? '').trim();
  return raw === '' ? null : raw;
}

/**
 * Lift cabinets into their umbrella and return ONLY the top-level series.
 *
 * THE KEY MOVE. Cabinets are removed from the returned array entirely, so the
 * nav, the date buttons, the group counts and the numbering — all of which
 * read the top-level list — are correct with no cabinet-filtering anywhere
 * else in the codebase.
 *
 * An umbrella is not flagged on the wire. It is DERIVED: any series whose id
 * another series names as its parentSeriesId ON THE SAME DATE. So this
 * function identifies umbrellas simply by which series receive a cabinet.
 *
 * ORPHAN RULES. The contract says none of these happen, and they are handled
 * anyway, always the same way: the series stays TOP-LEVEL and renders flat,
 * getting its own nav entry and sequence number. Losing a checklist entirely
 * is worse than showing one standalone. A series is an orphan when its parent
 * link:
 *
 *   1. names an id not in the adapted set — never sent, or gated out. A
 *      gated-out umbrella therefore leaves its cabinets rendering flat rather
 *      than disappearing with it.
 *   2. names a series on a DIFFERENT seriesDate. Groups never join across
 *      dates, so a cross-date reference is not a group.
 *   3. names a series that is ITSELF linked upward. That is three levels,
 *      which the contract forbids; the deeper series is the orphan and
 *      NOTHING RECURSES. A self-reference (a series naming its own id) and a
 *      reference cycle both land here too, so neither can loop.
 *
 * The traversal is a single non-recursive pass over a flat map, so no input —
 * cyclic, self-referential or arbitrarily deep — can produce unbounded work.
 */
function assembleGroups(adapted: AdaptedPair[]): AdaptedPair[] {
  const byId = new Map<string, AdaptedPair>();
  for (const pair of adapted) byId.set(pair.input.seriesId, pair);

  const cabinetsByUmbrella = new Map<string, AdaptedPair[]>();
  const attached = new Set<AdaptedPair>();

  for (const pair of adapted) {
    const parentId = parentLinkOf(pair.input);
    if (parentId === null) continue; // flat, or an umbrella in its own right

    const parent = byId.get(parentId);
    if (parent === undefined) continue; // orphan rule 1
    if (parent.series.seriesDate !== pair.series.seriesDate) continue; // rule 2
    if (parentLinkOf(parent.input) !== null) continue; // rule 3

    const bucket = cabinetsByUmbrella.get(parentId);
    if (bucket) bucket.push(pair);
    else cabinetsByUmbrella.set(parentId, [pair]);
    attached.add(pair);
  }

  for (const [umbrellaId, cabinets] of Array.from(cabinetsByUmbrella.entries())) {
    cabinets.sort(bySubmittedAt);
    // Non-null: the id came from byId, so the umbrella is in the set.
    byId.get(umbrellaId)!.series.cabinets = cabinets.map((c) => c.series);
  }

  return adapted.filter((pair) => !attached.has(pair));
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
    .filter((pair): pair is AdaptedPair => pair.series !== null);

  // Tree assembly runs AFTER the gate and BEFORE the numbering. Because it
  // returns only top-level series, the numbering below never sees a cabinet —
  // which is exactly what makes "cabinets consume no sequence numbers" true
  // for free, with no cabinet check in the numbering code at all.
  const topLevel = assembleGroups(adapted);

  const byGroup = new Map<string, AdaptedPair[]>();
  for (const pair of topLevel) {
    const key = groupKey(pair.series);
    const bucket = byGroup.get(key);
    if (bucket) bucket.push(pair);
    else byGroup.set(key, [pair]);
  }

  const out: CardSeries[] = [];
  for (const key of Array.from(byGroup.keys()).sort()) {
    const bucket = byGroup.get(key)!;
    bucket.sort(bySubmittedAt);

    // seriesName on each adapted series is the raw seriesType (title base).
    const titles = numberSeriesForDate(bucket.map((pair) => pair.series.seriesName));
    bucket.forEach((pair, i) => out.push({ ...pair.series, seriesName: titles[i] }));
  }

  return out;
}
