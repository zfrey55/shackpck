import type { BrandId } from '@/lib/brands';

/**
 * REAL, finalized coin series checklists — the exact published contents of a
 * produced series that does NOT come from ShackHQ.
 *
 * The coin line is otherwise live-only (app/checklist/api.ts). Some series
 * never enter ShackHQ — ungraded art pieces, for one, which CoinData's
 * year/grade/gradingCompany cannot describe — so they are published here.
 *
 * FROZEN ARCHIVE, same rules as lib/card-series-checklist.ts: an entry records
 * what was actually sealed, exactly as published. It is never edited to look
 * better after the fact. Append only; newest entries go at the top.
 *
 * Sealed contents only. No redemption prizes, no sample notes.
 */

export type CoinSeriesPiece = {
  name: string;
  metal: 'Gold' | 'Silver' | 'Platinum';
  /** As published, e.g. '1 gram', '10 grams'. */
  weight: string;
  qty: number;
};

export type CoinSeriesChecklist = {
  id: string;
  title: string;
  subtitle?: string;
  brandId: BrandId;
  /**
   * Customer tab this series renders under. Must equal nameToSlug of a
   * CANONICAL_OTHER_CUSTOMERS name; a fixture asserts it, which is also what
   * guarantees the tab exists in CustomerNav with zero live cases.
   */
  customerSlug: string;
  /** Publish date in ISO form (YYYY-MM-DD). */
  date: string;
  /**
   * Pieces per sealed bag. The pack COUNT is derived (totalPacks), never
   * stored, so the two numbers cannot drift. A fixture asserts the division
   * is exact.
   */
  packSize: number;
  /**
   * Singular name of the sealed unit, e.g. 'bag'. Drives the pack-structure
   * line and the finalized statement; pluralized by appending 's', so a
   * fixture asserts it is singular.
   */
  unitLabel: string;
  /** One row per distinct piece with its quantity — NOT expanded per slot. */
  pieces: CoinSeriesPiece[];
  /** ISO date this series was finalized. */
  finalizedOn: string;
};

export function totalPieces(series: CoinSeriesChecklist): number {
  return series.pieces.reduce((sum, p) => sum + p.qty, 0);
}

export function totalPacks(series: CoinSeriesChecklist): number {
  return totalPieces(series) / series.packSize;
}

/** This customer's archived series, newest date first. Stable within a date. */
export function coinSeriesForCustomer(slug: string): CoinSeriesChecklist[] {
  return COIN_SERIES_CHECKLISTS.filter((s) => s.customerSlug === slug).sort(
    (a, b) => b.date.localeCompare(a.date)
  );
}

export const COIN_SERIES_CHECKLISTS: CoinSeriesChecklist[] = [
  {
    id: 'lincolnreserve-legends-never-die-002-2026-10-13',
    title: 'Legends Never Die',
    subtitle: 'Series 002',
    brandId: 'lincoln-reserve',
    customerSlug: 'lincoln-reserve',
    date: '2026-10-13',
    finalizedOn: '2026-10-13',
    packSize: 1,
    unitLabel: 'bag',
    pieces: [
      { name: 'Golden Bigfoot', metal: 'Gold', weight: '1 gram', qty: 3 },
      { name: 'Bigfoot vs. Yeti', metal: 'Silver', weight: '10 grams', qty: 1 },
      { name: 'Wrath of the Kraken', metal: 'Silver', weight: '10 grams', qty: 1 },
      { name: "Medusa's Gaze", metal: 'Silver', weight: '10 grams', qty: 1 },
      { name: "Dragon's Hoard", metal: 'Silver', weight: '10 grams', qty: 1 },
      { name: 'Blood Moon', metal: 'Silver', weight: '10 grams', qty: 1 },
      { name: 'Beneath the Loch', metal: 'Silver', weight: '10 grams', qty: 1 },
      { name: 'High Stakes', metal: 'Silver', weight: '10 grams', qty: 1 },
      { name: 'Mothman', metal: 'Silver', weight: '1 gram', qty: 1 },
      { name: 'Phoenix Rising', metal: 'Silver', weight: '1 gram', qty: 1 },
      { name: 'Gates of Hades', metal: 'Silver', weight: '1 gram', qty: 1 },
      { name: 'Chupacabra', metal: 'Silver', weight: '1 gram', qty: 1 },
      { name: "Siren's Song", metal: 'Silver', weight: '1 gram', qty: 1 },
      { name: 'Into the Wild', metal: 'Silver', weight: '1 gram', qty: 10 },
      { name: 'Whiteout', metal: 'Silver', weight: '1 gram', qty: 10 },
      { name: 'From the Depths', metal: 'Silver', weight: '1 gram', qty: 10 },
      { name: 'The Loch', metal: 'Silver', weight: '1 gram', qty: 10 },
      { name: 'Full Moon', metal: 'Silver', weight: '1 gram', qty: 10 },
      { name: 'Dragonfire', metal: 'Silver', weight: '1 gram', qty: 10 },
      { name: 'Stone Cold', metal: 'Silver', weight: '1 gram', qty: 10 },
      { name: 'Legend Loot (numbered 01-65)', metal: 'Silver', weight: '1 gram', qty: 65 },
    ],
  },
];
