"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { DailyChecklistResponse, AvailableDatesResponse, CaseTypeInfo } from "./types";
import { fetchDailyChecklist, fetchAvailableDates } from "./api";
import {
  CaseCard,
  CaseTypeSelector,
  CustomerNav,
  DateButtonsForCaseType,
  EmptyState,
  LoadingState,
  ErrorState,
  FeaturedSeriesPanel,
  ProductLineNav,
  CardChecklistPanel,
  cardLineHeading,
} from "./components";
import { useCustomerIndex } from "./useCustomerIndex";
import { sortCasesForDisplay } from "./sorting";
import { CoinInventorySeries } from "@/lib/coin-inventory-api";
import { getChecklistCaseShortLabel } from "@/lib/checklist-case-labels";
import { writeLineParam, type ProductLine } from "@/lib/product-lines";
import { type BrandId } from "@/lib/brands";
import {
  SHACKPACK_SLUG,
  customerLabelFromSlug,
  slugToMatcher,
  type CustomerBucket,
} from "@/lib/customer-attribution";
import { cardBrandsForLine, parseCardBrand } from "./nav-params";
import { parseProductLine } from "@/lib/product-lines";

export function ChecklistClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ?line= accepts coins|sports|pokemon, and the legacy 'cards' still means
  // sports. See parseProductLine in lib/product-lines.
  const [productLine, setProductLine] = useState<ProductLine>(() =>
    parseProductLine(searchParams?.get("line"))
  );
  // null when the selected line has no checklist content (Pokemon today).
  const [cardBrand, setCardBrand] = useState<BrandId | null>(() =>
    parseCardBrand(
      searchParams?.get("cardBrand"),
      parseProductLine(searchParams?.get("line"))
    )
  );

  const [customerBucketId, setCustomerBucketId] = useState<CustomerBucket>(() => {
    const fromUrl = searchParams?.get("customer");
    if (fromUrl === "bullion-bureau") return "bullion-bureau";
    if (fromUrl && fromUrl !== SHACKPACK_SLUG) return "other";
    return "shackpack";
  });
  const [customerSlug, setCustomerSlug] = useState<string | null>(
    () => searchParams?.get("customer") || SHACKPACK_SLUG
  );
  const isShackpack = customerBucketId === "shackpack";

  const [availableDates, setAvailableDates] = useState<AvailableDatesResponse | null>(null);
  const [checklist, setChecklist] = useState<DailyChecklistResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCaseType, setSelectedCaseType] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [specializedSeries, setSpecializedSeries] = useState<CoinInventorySeries[]>([]);
  const [showSpecializedSeries, setShowSpecializedSeries] = useState(false);
  const [loadingSpecialized, setLoadingSpecialized] = useState(false);

  useEffect(() => {
    loadAvailableDates();
    loadSpecializedSeries();
  }, []);

  const loadSpecializedSeries = async () => {
    setLoadingSpecialized(true);
    try {
      const response = await fetch('/api/series?featured=true');
      if (response.ok) {
        const data = await response.json();
        const featured = Array.isArray(data)
          ? data.filter((s: { isFeatured?: boolean }) => s.isFeatured === true)
          : [];
        setSpecializedSeries(featured);
      }
    } catch {
      // Featured series are supplementary; the checklist renders without them.
    } finally {
      setLoadingSpecialized(false);
    }
  };

  useEffect(() => {
    if (selectedCaseType && selectedDate) {
      loadChecklist(selectedDate, selectedCaseType);
    }
  }, [selectedCaseType, selectedDate]);

  const loadAvailableDates = async () => {
    setLoading(true);
    setError(null);
    try {
      // ~3 years, so every backfilled case is reachable.
      const dates = await fetchAvailableDates(1095);
      setAvailableDates(dates);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load available dates");
      setLoading(false);
    }
  };

  const loadChecklist = async (date: string, caseType: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDailyChecklist(date, caseType);
      const filteredCases = data.cases.filter(c => c.caseType === caseType);
      setChecklist({ ...data, cases: filteredCases, totalCases: filteredCases.length });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load checklist");
      setChecklist(null);
    } finally {
      setLoading(false);
    }
  };

  /** Write the current nav state back to the URL, preserving ?customer=. */
  const syncUrl = (next: {
    line?: ProductLine;
    customer?: string | null;
    cardBrand?: BrandId | null;
  }) => {
    const p = new URLSearchParams(searchParams?.toString());
    p.delete("brand"); // legacy param, dropped outright as before

    const line = next.line ?? productLine;
    // Writes the canonical value ('sports'), never the legacy 'cards' alias.
    writeLineParam(p, line);

    if (next.customer !== undefined) {
      if (next.customer) p.set("customer", next.customer);
      else p.delete("customer");
    }

    const brand = next.cardBrand !== undefined ? next.cardBrand : cardBrand;
    // Only pinned when it is not the line's own default, so the common case
    // keeps the short URL it has always had.
    const isDefault = brand === null || brand === cardBrandsForLine(line)[0];
    if (line !== "coins" && brand && !isDefault) p.set("cardBrand", brand);
    else p.delete("cardBrand");

    const query = p.toString();
    router.replace(query ? `/checklist?${query}` : "/checklist");
  };

  const handleCaseTypeSelect = (caseType: string) => {
    setSelectedCaseType(caseType);
    setSelectedDate(null);
    setChecklist(null);
  };

  const handleLineChange = (next: ProductLine) => {
    setProductLine(next);
    setShowSpecializedSeries(false);
    // Keep the current brand if it has content on the target line, else fall
    // to that line's first brand (null when the line has none at all).
    const resolved = parseCardBrand(cardBrand, next);
    setCardBrand(resolved);
    syncUrl({ line: next, cardBrand: resolved });
  };

  const handleCardBrandChange = (next: BrandId) => {
    setCardBrand(next);
    syncUrl({ cardBrand: next });
  };

  const handleCustomerSelect = (next: CustomerBucket, slug: string | null) => {
    setCustomerBucketId(next);
    setCustomerSlug(slug);
    setSelectedCaseType(null);
    setSelectedDate(null);
    setChecklist(null);
    setShowSpecializedSeries(false);
    syncUrl({ customer: slug });
  };

  const { customerIndex, otherCustomers, hasLoadedData } =
    useCustomerIndex(availableDates);

  const activeCustomer = customerSlug ? customerIndex.get(customerSlug) ?? null : null;
  const activeCustomerLabel = customerSlug
    ? activeCustomer?.name ?? customerLabelFromSlug(customerSlug)
    : "Other";

  const caseTypes = useMemo<CaseTypeInfo[]>(() => {
    if (!activeCustomer) return [];
    const caseTypeMap = new Map<string, { dates: Set<string>, totalCases: number }>();
    activeCustomer.datesByCaseType.forEach((perType, displayDate) => {
      perType.forEach((count, caseType) => {
        if (!caseTypeMap.has(caseType)) {
          caseTypeMap.set(caseType, { dates: new Set(), totalCases: 0 });
        }
        const info = caseTypeMap.get(caseType)!;
        info.dates.add(displayDate);
        info.totalCases += count;
      });
    });
    return Array.from(caseTypeMap.entries())
      .map(([caseType, info]) => ({
        caseType,
        displayName: getChecklistCaseShortLabel(caseType),
        totalDates: info.dates.size,
        totalCases: info.totalCases,
        isLoading: !hasLoadedData
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [activeCustomer, hasLoadedData]);

  const datesForCaseType = useMemo(() => {
    if (!activeCustomer || !selectedCaseType) return [];
    const dates: { displayDate: string; totalCases: number }[] = [];
    activeCustomer.datesByCaseType.forEach((perType, displayDate) => {
      const seriesCount = perType.get(selectedCaseType);
      if (seriesCount) dates.push({ displayDate, totalCases: seriesCount });
    });
    return dates.sort((a, b) => b.displayDate.localeCompare(a.displayDate));
  }, [activeCustomer, selectedCaseType]);

  useEffect(() => {
    if (!selectedCaseType) return;
    if (datesForCaseType.length === 0) {
      setSelectedDate(null);
      setChecklist(null);
      return;
    }
    setSelectedDate((prev) =>
      prev && datesForCaseType.some((d) => d.displayDate === prev)
        ? prev
        : datesForCaseType[0].displayDate
    );
  }, [selectedCaseType, datesForCaseType]);

  const customerMatcher = useMemo(
    () => (customerSlug ? slugToMatcher(customerSlug) : null),
    [customerSlug]
  );

  const filteredCases = useMemo(() => {
    if (!checklist || !selectedCaseType) return [];
    return checklist.cases.filter(
      (c) => c.caseType === selectedCaseType && (!customerMatcher || customerMatcher(c))
    );
  }, [checklist, selectedCaseType, customerMatcher]);

  const casesOrderedForDisplay = useMemo(
    () => sortCasesForDisplay(filteredCases),
    [filteredCases]
  );

  /**
   * TIER 1 product line, TIER 2 brand/customer. Tier 3 (case type -> dates on
   * coins, series type -> dates on cards) renders below, unchanged.
   */
  const nav = (
    <div className="space-y-4">
      <ProductLineNav
        line={productLine}
        onLineChange={handleLineChange}
        cardBrands={cardBrandsForLine(productLine)}
        activeCardBrand={cardBrand ?? ("shackpack" as BrandId)}
        onCardBrandChange={handleCardBrandChange}
      />
      {productLine === "coins" && (
        <CustomerNav
          otherCustomers={otherCustomers}
          bucket={customerBucketId}
          slug={customerSlug}
          onSelect={handleCustomerSelect}
          loading={!hasLoadedData}
        />
      )}
    </div>
  );

  if (productLine !== "coins") {
    return (
      <main className="container py-10">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold mb-2 text-gold">
              {cardLineHeading(productLine, cardBrand)}
            </h1>
            <p className="text-lg text-slate-400">
              Published series checklists
            </p>
          </div>
          {nav}
          <CardChecklistPanel line={productLine} brandId={cardBrand} />
        </div>
      </main>
    );
  }

  if (loading && !availableDates) {
    return (
      <main className="container py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-6">{nav}</div>
          <LoadingState />
        </div>
      </main>
    );
  }

  if (error && !availableDates) {
    return (
      <main className="container py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-6">{nav}</div>
          <ErrorState error={error} onRetry={loadAvailableDates} />
        </div>
      </main>
    );
  }

  if (!availableDates || availableDates.dates.length === 0) {
    return (
      <main className="container py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-6">{nav}</div>
          <div className="text-center py-12 bg-slate-900/40 rounded-lg border border-slate-700">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold mb-4 text-slate-200">No Checklists Available Yet</h2>
            <p className="text-slate-400">Create your first series to get started!</p>
            <p className="text-sm text-slate-500 mt-2">Series created today will appear on tomorrow&apos;s checklist.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gold">
            📅 {activeCustomerLabel} Checklists
          </h1>
          <p className="text-lg text-slate-400">Select a series to view available dates</p>
        </div>

        <div className="mb-8">{nav}</div>

        <div className="mb-8 p-4 bg-amber-900/20 border border-amber-700/50 rounded-lg">
          <p className="text-sm text-amber-200 text-center">
            <strong>⚠️ Important:</strong> All series and the coins contained within them may vary by date.
            Please refer to the checklist for the most up-to-date information on each series. For card series, use the Sports Cards or Pokemon Cards tabs.
          </p>
        </div>

        {isShackpack && !selectedCaseType && !showSpecializedSeries && (
          <div className="mb-8">
            <button
              onClick={() => setShowSpecializedSeries(true)}
              className="w-full p-6 bg-gradient-to-r from-gold/10 to-slate-900/40 rounded-lg border border-gold/30 hover:border-gold/50 transition-colors text-left"
            >
              <h2 className="text-2xl font-bold mb-2 text-gold">🎯 Featured Series</h2>
              <p className="text-slate-400">View checklists for active featured series</p>
            </button>
          </div>
        )}

        {isShackpack && showSpecializedSeries && !selectedCaseType && (
          <FeaturedSeriesPanel
            series={specializedSeries}
            loading={loadingSpecialized}
            onBack={() => setShowSpecializedSeries(false)}
          />
        )}

        {!selectedCaseType && !showSpecializedSeries && caseTypes.length > 0 && (
          <CaseTypeSelector
            caseTypes={caseTypes}
            selectedCaseType={selectedCaseType}
            onCaseTypeSelect={handleCaseTypeSelect}
          />
        )}

        {!selectedCaseType && !showSpecializedSeries && caseTypes.length === 0 && hasLoadedData && (
          <div className="text-center py-12 bg-slate-900/40 rounded-lg border border-slate-700">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold mb-2 text-slate-200">
              {activeCustomerLabel} checklists coming soon
            </h2>
            <p className="text-slate-400">
              No published {activeCustomerLabel} series are available yet. Check back soon.
            </p>
          </div>
        )}

        {selectedCaseType && (
          <>
            <div className="mb-6">
              <button
                onClick={() => {
                  setSelectedCaseType(null);
                  setSelectedDate(null);
                  setChecklist(null);
                }}
                className="text-gold hover:text-gold/80 transition-colors flex items-center gap-2"
              >
                ← Back to Series Selection
              </button>
            </div>

            <DateButtonsForCaseType
              dates={datesForCaseType}
              selectedDate={selectedDate || ''}
              onDateSelect={setSelectedDate}
              caseTypeName={getChecklistCaseShortLabel(selectedCaseType)}
            />
          </>
        )}

        {loading && selectedDate && <LoadingState />}

        {error && checklist === null && selectedDate && (
          <ErrorState
            error={error}
            onRetry={() => selectedCaseType && selectedDate && loadChecklist(selectedDate, selectedCaseType)}
          />
        )}

        {!loading && checklist && selectedDate && (
          <>
            {casesOrderedForDisplay.length > 0 ? (
              <>
                <div className="mb-4 text-center">
                  <p className="text-lg text-slate-300">
                    {(() => {
                      const [year, month, day] = checklist.displayDate.split('-').map(Number);
                      return new Date(year, month - 1, day).toLocaleDateString('en-US', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                      });
                    })()}
                  </p>
                  <p className="text-slate-400">
                    <span className="font-semibold text-gold">{casesOrderedForDisplay.length}</span> series available
                  </p>
                </div>
                <div className="space-y-6 mb-12">
                  {casesOrderedForDisplay.map((caseData, index) => (
                    <CaseCard key={caseData.caseId} caseData={caseData} seriesOrdinal={index + 1} />
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                date={selectedDate}
                caseTypeName={getChecklistCaseShortLabel(selectedCaseType!)}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}
