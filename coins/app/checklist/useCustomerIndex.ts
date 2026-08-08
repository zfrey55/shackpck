"use client";

import { useMemo } from "react";
import type { AvailableDatesResponse } from "./types";
import {
  CUSTOMER_BUCKET_LABELS,
  SHACKPACK_SLUG,
  CANONICAL_OTHER_CUSTOMERS,
  canonicalNameForSlug,
  caseToSlug,
  customerBucket,
  nameToSlug,
  type CustomerBucket,
} from "@/lib/customer-attribution";

/**
 * One customer's coverage across the whole date range.
 *
 * `datesByCaseType` is date -> caseType -> case count. Counts ONLY — no case
 * objects are retained, and none are fetched to build this.
 */
export type CustomerIndexEntry = {
  slug: string;
  /** Canonical roster name; the house bucket uses a fixed label. */
  name: string;
  bucket: CustomerBucket;
  datesByCaseType: Map<string, Map<string, number>>;
  totalCases: number;
};

export type CustomerIndex = Map<string, CustomerIndexEntry>;

// Prefer the canonical roster name so aliased spellings ('Coinwave',
// 'CoinWave, LLC') label their shared group identically, rather than showing
// whichever raw spelling happened to be seen first.
function displayNameFor(slug: string, rawName: string | null | undefined) {
  if (slug === SHACKPACK_SLUG) return CUSTOMER_BUCKET_LABELS.shackpack;
  return canonicalNameForSlug(slug) ?? ((rawName ?? '').trim() || slug);
}

/**
 * Build the customer index from the `caseBreakdown` rows that getAvailableDates
 * already returns. Synchronous — no fetching.
 *
 * This replaces a sweep that fetched every daily checklist up front: 267 calls
 * and ~16.7 MB at roughly 5s each, purely to count cases. getAvailableDates now
 * carries per-date rows of {customerName, caseType, count, seriesNumbers},
 * which reconstruct the identical index from the one call the page already
 * makes. Full case data is still fetched on demand by loadChecklist when a
 * caseType + date is picked.
 */
export function useCustomerIndex(availableDates: AvailableDatesResponse | null) {
  const { customerIndex, casesByTypeByDate } = useMemo(() => {
    const index: CustomerIndex = new Map();
    const byTypeByDate: Record<string, Record<string, number>> = {};

    for (const dateInfo of availableDates?.dates ?? []) {
      const perTypeAll: Record<string, number> = {};

      for (const row of dateInfo.caseBreakdown ?? []) {
        // A breakdown row is structurally an AttributableCase — it carries both
        // customerName and caseType — so attribution runs on it unchanged.
        const slug = caseToSlug(row);
        let entry = index.get(slug);
        if (!entry) {
          entry = {
            slug,
            name: displayNameFor(slug, row.customerName),
            bucket: customerBucket(row),
            datesByCaseType: new Map(),
            totalCases: 0,
          };
          index.set(slug, entry);
        }

        let perDate = entry.datesByCaseType.get(dateInfo.displayDate);
        if (!perDate) {
          perDate = new Map();
          entry.datesByCaseType.set(dateInfo.displayDate, perDate);
        }

        // ACCUMULATE, never set: several rows on one date can resolve to the
        // same slug — 'The Coin Shack', null and any off-roster name all fold
        // into 'shackpack'. Overwriting here would silently drop those cases.
        perDate.set(
          row.caseType,
          (perDate.get(row.caseType) ?? 0) + row.count
        );
        entry.totalCases += row.count;
        perTypeAll[row.caseType] = (perTypeAll[row.caseType] ?? 0) + row.count;
      }

      byTypeByDate[dateInfo.displayDate] = perTypeAll;
    }

    return { customerIndex: index, casesByTypeByDate: byTypeByDate };
  }, [availableDates]);

  /** True once getAvailableDates has returned; the index is complete with it. */
  const hasLoadedData = (availableDates?.dates?.length ?? 0) > 0;

  /** Newest checklist date. */
  const latestDate = availableDates?.dates?.[0]?.displayDate ?? null;

  /**
   * Outside customers for the "Other" expansion, alphabetical.
   *
   * The full fixed roster is ALWAYS present, so an active customer shows even
   * with no case on the selected date (and lands on its own empty state rather
   * than vanishing). Real data is then overlaid on top.
   */
  const otherCustomers = useMemo(() => {
    const bySlug = new Map<string, CustomerIndexEntry>();
    for (const name of CANONICAL_OTHER_CUSTOMERS) {
      const slug = nameToSlug(name);
      bySlug.set(slug, {
        slug,
        name,
        bucket: 'other',
        datesByCaseType: new Map(),
        totalCases: 0,
      });
    }
    for (const entry of customerIndex.values()) {
      if (entry.bucket === 'other') bySlug.set(entry.slug, entry);
    }
    return Array.from(bySlug.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [customerIndex]);

  return {
    casesByTypeByDate,
    customerIndex,
    otherCustomers,
    latestDate,
    hasLoadedData,
  };
}
