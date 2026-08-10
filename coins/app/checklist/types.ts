export interface CaseData {
  caseId: string;
  caseSKU?: string;
  displayName: string;
  caseType: string;
  caseTypeName: string;
  /**
   * Series number from the inventory API. Rendered directly by CaseCard; the
   * per-date display ordinal is only a fallback when this is absent.
   */
  seriesNumber?: number;
  /**
   * Attribution fields from the getDailyChecklist payload. Typed now so the
   * data is carried through; no customer page or filtering consumes them yet.
   */
  customerName?: string | null;
  buyerCode?: string | null;
  createdDate: string;
  displayDate: string;
  status: string;
  totalCoins: number;
  coins: CoinData[];
}

export interface CoinData {
  position: number;
  coinType: string;
  year: string;
  grade: string;
  gradingCompany: string;
  weight?: string | null; // Weight field (e.g., "1 oz", "1/10 oz") or null if not available
}

export interface DailyChecklistResponse {
  success: boolean;
  displayDate: string;
  totalCases: number;
  casesByType: Record<string, number>;
  cases: CaseData[];
}

/**
 * One (customerName, caseType) pairing on a single date. `count` is how many
 * cases that pairing covers; `seriesNumbers` lists their series numbers.
 *
 * This is the whole reason the checklist no longer fetches every daily
 * checklist up front — the customer index is built from these rows.
 */
export interface CaseBreakdownRow {
  customerName: string | null;
  caseType: string;
  count: number;
  seriesNumbers: number[];
}

export interface AvailableDatesResponse {
  success: boolean;
  totalDates: number;
  dates: {
    displayDate: string;
    totalCases: number;
    caseTypes: string[];
    caseBreakdown: CaseBreakdownRow[];
  }[];
}

export interface CaseTypeInfo {
  caseType: string;
  displayName: string;
  totalDates: number;
  totalCases: number;
  isLoading?: boolean;
}

/**
 * One card series as listed by getCardChecklistDates. `seriesDate` is
 * YYYY-MM-DD in Eastern time, matching the coin side's displayDate.
 */
export interface CardChecklistSeriesSummary {
  seriesId: string;
  seriesName: string;
  seriesDate: string;
  totalCards: number;
}

export interface CardChecklistDatesResponse {
  success: boolean;
  totalSeries: number;
  series: CardChecklistSeriesSummary[];
}

/**
 * One card in a series. The payload carries these two fields and nothing
 * else — no prices, no costs, no internal identifiers.
 *
 * IMPORTANT: `position` here is the VALUE RANK, 1..N with the most valuable
 * card first. It is meant to be sorted on AND displayed as the visible number.
 *
 * This is the exact OPPOSITE of CoinData.position above, which is a slot/scan
 * number carrying no value meaning and is never displayed — the coin list is
 * numbered by render index instead. The two fields share a name and mean
 * contradictory things, deliberately, because the two upstream systems differ.
 * Do NOT "harmonize" them: making coins display position, or making cards hide
 * it, reintroduces a bug that has already been fixed once on each side.
 */
export interface CardChecklistCard {
  position: number;
  entryName: string;
}

/**
 * A single series with its cards, from getCardChecklistSeries.
 *
 * Repeats the summary fields rather than nesting a CardChecklistSeriesSummary,
 * matching the flat response shapes used by the coin endpoints above.
 */
export interface CardChecklistSeriesResponse {
  success: boolean;
  seriesId: string;
  seriesName: string;
  seriesDate: string;
  totalCards: number;
  cards: CardChecklistCard[];
}

