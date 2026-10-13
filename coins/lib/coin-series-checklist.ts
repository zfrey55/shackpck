import type { BrandId } from '@/lib/brands';
import { nameToSlug } from '@/lib/customer-attribution';
import type {
  AvailableDatesResponse,
  CaseData,
  CoinData,
  DailyChecklistResponse,
} from '@/app/checklist/types';

/**
 * REAL, finalized coin series that do NOT come from ShackHQ — the exact
 * published contents of a produced series.
 *
 * FROZEN ARCHIVE, same rules as lib/card-series-checklist.ts: an entry records
 * what was actually sealed, exactly as published. It is never edited to look
 * better after the fact. Append only; newest entries go at the top.
 *
 * Each entry renders EXACTLY like a live ShackHQ case. toCaseData expands the
 * qty table into a CaseData, and withArchiveDates / withArchiveCases fold it
 * into the two API responses, so the customer index, case type tiles, date
 * buttons and CaseCard all treat it as one more live case.
 *
 * If ShackHQ ever ingests one of these series, DELETE the entry here, or the
 * case renders twice.
 */

export type CoinSeriesPiece = {
  /** Exact coinType string, as a live case would carry it. */
  displayName: string;
  /** Weight in grams; rendered as "1 g" / "10 g" like live cases. */
  grams: number;
  qty: number;
};

export type CoinSeriesChecklist = {
  id: string;
  /** Raw customerName, exactly as ShackHQ would send it. The tab slug is derived. */
  customerName: string;
  brandId: BrandId;
  /** Publish date in ISO form (YYYY-MM-DD); becomes displayDate. */
  date: string;
  caseType: string;
  caseTypeName: string;
  seriesNumber: number;
  /** Per-series defaults stamped on every coin, as ShackHQ does. */
  year: string;
  grade: string;
  gradingCompany: string;
  /** Qty table, the source of truth. Expanded per coin in table order. */
  pieces: CoinSeriesPiece[];
};

export function customerSlugFor(series: CoinSeriesChecklist): string {
  return nameToSlug(series.customerName);
}

/** This customer's archived series, newest date first. Stable within a date. */
export function coinSeriesForCustomer(slug: string): CoinSeriesChecklist[] {
  return COIN_SERIES_CHECKLISTS.filter((s) => customerSlugFor(s) === slug).sort(
    (a, b) => b.date.localeCompare(a.date)
  );
}

/** Expand the qty table into a live-shaped case, positions 1..N in table order. */
export function toCaseData(series: CoinSeriesChecklist): CaseData {
  const coins: CoinData[] = series.pieces
    .flatMap((piece) => Array.from({ length: piece.qty }, () => piece))
    .map((piece, i) => ({
      position: i + 1,
      coinType: piece.displayName,
      year: series.year,
      grade: series.grade,
      gradingCompany: series.gradingCompany,
      weight: `${piece.grams} g`,
    }));

  return {
    caseId: series.id,
    displayName: `${series.caseTypeName} - Series ${series.seriesNumber}`,
    caseType: series.caseType,
    caseTypeName: series.caseTypeName,
    seriesNumber: series.seriesNumber,
    customerName: series.customerName,
    createdDate: series.date,
    displayDate: series.date,
    status: 'published',
    totalCoins: coins.length,
    coins,
  };
}

/** getAvailableDates with each archive series added as a caseBreakdown row. */
export function withArchiveDates(res: AvailableDatesResponse): AvailableDatesResponse {
  const dates = res.dates.map((d) => ({
    ...d,
    caseTypes: [...d.caseTypes],
    caseBreakdown: [...(d.caseBreakdown ?? [])],
  }));
  for (const s of COIN_SERIES_CHECKLISTS) {
    let day = dates.find((d) => d.displayDate === s.date);
    if (!day) {
      day = { displayDate: s.date, totalCases: 0, caseTypes: [], caseBreakdown: [] };
      dates.push(day);
    }
    day.caseBreakdown.push({
      customerName: s.customerName,
      caseType: s.caseType,
      count: 1,
      seriesNumbers: [s.seriesNumber],
    });
    day.totalCases += 1;
    if (!day.caseTypes.includes(s.caseType)) day.caseTypes.push(s.caseType);
  }
  dates.sort((a, b) => b.displayDate.localeCompare(a.displayDate));
  return { ...res, dates, totalDates: dates.length };
}

/** getDailyChecklist with that date's archive cases appended. */
export function withArchiveCases(res: DailyChecklistResponse): DailyChecklistResponse {
  const present = new Set(res.cases.map((c) => c.caseId));
  const extra = COIN_SERIES_CHECKLISTS.filter(
    (s) => s.date === res.displayDate && !present.has(s.id)
  ).map(toCaseData);
  if (extra.length === 0) return res;

  const casesByType = { ...res.casesByType };
  for (const c of extra) casesByType[c.caseType] = (casesByType[c.caseType] ?? 0) + 1;
  return {
    ...res,
    cases: [...res.cases, ...extra],
    totalCases: res.totalCases + extra.length,
    casesByType,
  };
}

export const COIN_SERIES_CHECKLISTS: CoinSeriesChecklist[] = [
  {
    id: 'lincolnreserve-legends-never-die-002-2026-10-13',
    customerName: 'Lincoln Reserve',
    brandId: 'lincoln-reserve',
    date: '2026-10-13',
    caseType: 'legends never die',
    caseTypeName: 'Legends Never Die',
    seriesNumber: 2,
    year: '2026',
    grade: 'GEM BU',
    gradingCompany: 'ICG',
    pieces: [
      { displayName: 'GOLDEN BIGFOOT 1G GOLD', grams: 1, qty: 3 },
      { displayName: 'Bigfoot vs. Yeti 1-OF-1 ART 10G SILVER', grams: 10, qty: 1 },
      { displayName: 'Wrath of the Kraken 1-OF-1 ART 10G SILVER', grams: 10, qty: 1 },
      { displayName: "Medusa's Gaze 1-OF-1 ART 10G SILVER", grams: 10, qty: 1 },
      { displayName: "Dragon's Hoard 1-OF-1 ART 10G SILVER", grams: 10, qty: 1 },
      { displayName: 'Blood Moon 1-OF-1 ART 10G SILVER', grams: 10, qty: 1 },
      { displayName: 'Beneath the Loch 1-OF-1 ART 10G SILVER', grams: 10, qty: 1 },
      { displayName: 'High Stakes 1-OF-1 ART 10G SILVER', grams: 10, qty: 1 },
      { displayName: 'Mothman 1-OF-1 ART 1G SILVER', grams: 1, qty: 1 },
      { displayName: 'Phoenix Rising 1-OF-1 ART 1G SILVER', grams: 1, qty: 1 },
      { displayName: 'Gates of Hades 1-OF-1 ART 1G SILVER', grams: 1, qty: 1 },
      { displayName: 'Chupacabra 1-OF-1 ART 1G SILVER', grams: 1, qty: 1 },
      { displayName: "Siren's Song 1-OF-1 ART 1G SILVER", grams: 1, qty: 1 },
      { displayName: 'Into the Wild 1G SILVER', grams: 1, qty: 10 },
      { displayName: 'Whiteout 1G SILVER', grams: 1, qty: 10 },
      { displayName: 'From the Depths 1G SILVER', grams: 1, qty: 10 },
      { displayName: 'The Loch 1G SILVER', grams: 1, qty: 10 },
      { displayName: 'Full Moon 1G SILVER', grams: 1, qty: 10 },
      { displayName: 'Dragonfire 1G SILVER', grams: 1, qty: 10 },
      { displayName: 'Stone Cold 1G SILVER', grams: 1, qty: 10 },
      { displayName: 'LEGEND LOOT 1G SILVER', grams: 1, qty: 65 },
    ],
  },
];
