"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type {
  AvailableDatesResponse,
  CaseData,
  DailyChecklistResponse,
} from "../../types";
import { fetchAvailableDates, fetchDailyChecklist } from "../../api";
import {
  CaseCard,
  DateButtonsForCaseType,
  ErrorState,
  LoadingState,
} from "../../components";
import { useCustomerIndex } from "../../useCustomerIndex";
import { sortCasesForDisplay } from "../../sorting";
import { getChecklistCaseShortLabel } from "@/lib/checklist-case-labels";
import {
  customerLabelFromSlug,
  slugToMatcher,
} from "@/lib/customer-attribution";

/**
 * Shareable per-customer checklist: /checklist/customer/[slug].
 *
 * Shows only the cases belonging to one customer, for one date, grouped by
 * series type. `seriesNumber` renders verbatim — gaps are intentional and are
 * never renumbered, so a customer holding Flex 3 and 4 sees 3 and 4.
 */
export default function CustomerChecklistPage() {
  const params = useParams();
  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug ?? '';

  const [availableDates, setAvailableDates] =
    useState<AvailableDatesResponse | null>(null);
  const [checklist, setChecklist] = useState<DailyChecklistResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { customerIndex, hasLoadedData } = useCustomerIndex(availableDates);

  const matcher = useMemo(() => slugToMatcher(slug), [slug]);
  const entry = customerIndex.get(slug) ?? null;
  const displayName = entry?.name ?? customerLabelFromSlug(slug);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        setAvailableDates(await fetchAvailableDates(1095));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load available dates"
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /** Only dates where this customer actually has cases, newest first. */
  const datesForCustomer = useMemo(() => {
    if (!entry) return [];
    return Array.from(entry.datesByCaseType.entries())
      .map(([displayDate, perType]) => ({
        displayDate,
        totalCases: Array.from(perType.values()).reduce((a, n) => a + n, 0),
      }))
      .sort((a, b) => b.displayDate.localeCompare(a.displayDate));
  }, [entry]);

  // Default to the newest date, and keep a valid selection as the sweep fills in.
  useEffect(() => {
    if (datesForCustomer.length === 0) return;
    setSelectedDate((prev) =>
      prev && datesForCustomer.some((d) => d.displayDate === prev)
        ? prev
        : datesForCustomer[0].displayDate
    );
  }, [datesForCustomer]);

  const loadChecklist = async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      setChecklist(await fetchDailyChecklist(date));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load checklist");
      setChecklist(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) loadChecklist(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  /** This customer's cases for the selected date, grouped by series type. */
  const groups = useMemo(() => {
    if (!checklist) return [];
    const mine = checklist.cases.filter((c) => matcher(c));
    const byType = new Map<string, CaseData[]>();
    for (const caseData of mine) {
      const list = byType.get(caseData.caseType);
      if (list) list.push(caseData);
      else byType.set(caseData.caseType, [caseData]);
    }
    return Array.from(byType.entries())
      .map(([caseType, cases]) => ({
        caseType,
        label: getChecklistCaseShortLabel(caseType),
        cases: sortCasesForDisplay(cases),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [checklist, matcher]);

  const totalCases = groups.reduce((sum, g) => sum + g.cases.length, 0);

  return (
    <main className="container py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gold">
            📅 {displayName} Checklists
          </h1>
          <p className="text-lg text-slate-400">
            Published series built for {displayName}
          </p>
        </div>

        <div className="mb-8 text-center">
          <Link
            href="/checklist"
            className="text-gold hover:text-gold/80 transition-colors"
          >
            ← All checklists
          </Link>
        </div>

        {error && !checklist && (
          <ErrorState
            error={error}
            onRetry={() => selectedDate && loadChecklist(selectedDate)}
          />
        )}

        {datesForCustomer.length > 0 && (
          <DateButtonsForCaseType
            dates={datesForCustomer}
            selectedDate={selectedDate || ''}
            onDateSelect={setSelectedDate}
            caseTypeName={displayName}
          />
        )}

        {loading && <LoadingState />}

        {!loading && datesForCustomer.length === 0 && hasLoadedData && (
          <div className="text-center py-12 bg-slate-900/40 rounded-lg border border-slate-700">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold mb-2 text-slate-200">
              No checklists for {displayName}
            </h2>
            <p className="text-slate-400">
              No published series are attributed to this customer yet.
            </p>
          </div>
        )}

        {!loading && checklist && selectedDate && (
          <>
            <div className="mb-4 text-center">
              <p className="text-slate-400">
                <span className="font-semibold text-gold">{totalCases}</span>{" "}
                series available
              </p>
            </div>
            <div className="space-y-10 mb-12">
              {groups.map((group) => (
                <section key={group.caseType}>
                  <h2 className="text-xl font-semibold text-slate-200 mb-4">
                    {group.label}
                  </h2>
                  <div className="space-y-6">
                    {group.cases.map((caseData, index) => (
                      <CaseCard
                        key={caseData.caseId}
                        caseData={caseData}
                        seriesOrdinal={index + 1}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
