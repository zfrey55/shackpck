"use client";

import { useEffect, useMemo, useState } from "react";
import type { AvailableDatesResponse } from "./types";
import { fetchDailyChecklist } from "./api";
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
 * `datesByCaseType` is date -> caseType -> case count. Counts ONLY — full case
 * objects are deliberately not retained. The sweep below reads every case on
 * every date, and holding those (hundreds of dates x dozens of cases x 20 coins
 * each) would be a large client-side blob for data the nav never reads.
 */
export type CustomerIndexEntry = {
  slug: string;
  /** Display name as the API spells it; the house bucket uses a fixed label. */
  name: string;
  bucket: CustomerBucket;
  datesByCaseType: Map<string, Map<string, number>>;
  totalCases: number;
};

export type CustomerIndex = Map<string, CustomerIndexEntry>;

// Prefer the canonical roster name so aliased spellings ('Coinwave',
// 'CoinWave, LLC') label their shared group identically, rather than showing
// whichever raw spelling the sweep happened to see first.
function displayNameFor(slug: string, rawName: string | null | undefined) {
  if (slug === SHACKPACK_SLUG) return CUSTOMER_BUCKET_LABELS.shackpack;
  return canonicalNameForSlug(slug) ?? ((rawName ?? '').trim() || slug);
}

/**
 * Sweep every available date once and build both the per-caseType counts the
 * series selector needs and the customer index the nav needs.
 *
 * This is the same sweep the checklist page has always run — same dates, same
 * batch size, same requests. It simply retains a few metadata fields from
 * responses it was already fetching and discarding, so the customer nav costs
 * no additional network traffic.
 */
export function useCustomerIndex(availableDates: AvailableDatesResponse | null) {
  const [casesByTypeByDate, setCasesByTypeByDate] = useState<
    Record<string, Record<string, number>>
  >({});
  const [customerIndex, setCustomerIndex] = useState<CustomerIndex>(new Map());

  useEffect(() => {
    if (!availableDates || availableDates.dates.length === 0) return;

    let cancelled = false;
    const casesByTypeMap: Record<string, Record<string, number>> = {};
    const index: CustomerIndex = new Map();

    const sweep = async () => {
      const BATCH_SIZE = 10; // Process 10 dates at a time
      const dates = availableDates.dates;

      for (let i = 0; i < dates.length; i += BATCH_SIZE) {
        const batch = dates.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(async (dateInfo) => {
            try {
              const day = await fetchDailyChecklist(dateInfo.displayDate);
              casesByTypeMap[dateInfo.displayDate] = day.casesByType;

              for (const caseData of day.cases) {
                // Hybrid resolution: a branded caseType identifies its
                // customer even when the case is stamped house/untagged.
                const slug = caseToSlug(caseData);
                let entry = index.get(slug);
                if (!entry) {
                  entry = {
                    slug,
                    name: displayNameFor(slug, caseData.customerName),
                    bucket: customerBucket(caseData),
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
                perDate.set(
                  caseData.caseType,
                  (perDate.get(caseData.caseType) ?? 0) + 1
                );
                entry.totalCases += 1;
              }
            } catch (err) {
              console.error(
                `Failed to fetch checklist for ${dateInfo.displayDate}:`,
                err
              );
              // If fetch fails, use empty object (no series for that date)
              casesByTypeMap[dateInfo.displayDate] = {};
            }
          })
        );

        if (cancelled) return;

        // Update state incrementally so UI can show progress. New container
        // identities each batch so downstream memos recompute.
        setCasesByTypeByDate({ ...casesByTypeMap });
        setCustomerIndex(new Map(index));
      }
    };

    sweep();
    return () => {
      cancelled = true;
    };
  }, [availableDates]);

  const hasLoadedData = Object.keys(casesByTypeByDate).length > 0;

  /** Newest checklist date — "the day" the nav is scoped to. */
  const latestDate = availableDates?.dates?.[0]?.displayDate ?? null;

  /**
   * Outside customers for the "Other" expansion, alphabetical.
   *
   * The full fixed roster is ALWAYS present, so an active customer shows even
   * with no case on the selected date (and lands on its own empty state rather
   * than vanishing). Real swept data is then overlaid on top, so counts and
   * date coverage come from the hybrid resolution — a branded case stamped
   * 'The Coin Shack' now surfaces under its real customer here.
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
