"use client";

import { useEffect, useMemo, useState } from "react";

type CaseType = {
  id: string;
  name: string;
  description: string;
  goldContent: string;
};

type CaseTypeDisplay = {
  id: string;
  label: string;
  helper: string;
};

interface CoinItem {
  name: string;
  years: string[];
  gradingCompanies: string[];
  grades: Record<string, number>;
  gradesAvailable: string[];
  totalQuantity: number;
  maxObservedQuantity?: number;
  available?: boolean;
}

interface ChecklistResponse {
  success: boolean;
  lastUpdated: string;
  caseType?: string;
  startDate?: string;
  endDate?: string;
  isHistorical?: boolean;
  weeklyAggregation?: boolean;
  casesCount?: number;
  coinsFromCasesCount?: number;
  premiumInventoryCount?: number;
  warning?: string;
  totalTypes?: number;
  totalCoins?: number;
  snapshotCount?: number;
  checklist: CoinItem[];
}

interface SeriesData {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  cases: CaseType[];
}


const CASE_TYPE_META: Record<string, CaseTypeDisplay> = {
  base: { id: "base", label: "ShackPack", helper: "1× 1/10 oz gold + 9 varied silver coins" },
  deluxe: { id: "deluxe", label: "ShackPack Deluxe", helper: "2× 1/10 oz gold + 8 varied silver coins" },
  xtreme: { id: "xtreme", label: "ShackPack Xtreme", helper: "1× 1/4 oz gold + 9 varied silver coins" },
  unleashed: { id: "unleashed", label: "ShackPack Unleashed", helper: "2× 1/4 oz gold + 8 varied silver coins" },
  resurgence: { id: "resurgence", label: "ShackPack Resurgence", helper: "1× 1/2 oz gold + 9 varied silver coins" },
  transcendent: { id: "transcendent", label: "ShackPack Transcendent", helper: "1× 1 oz gold + 9 varied silver coins" },
  ignite: { id: "ignite", label: "ShackPack Ignite", helper: "1× 1/4 oz platinum + 9 varied silver coins" },
  eclipse: { id: "eclipse", label: "ShackPack Eclipse", helper: "1× 1 oz platinum + 9 varied silver coins" }
};

const SERIES_CONFIG = {
  weeksAhead: 4, // Number of future weeks to show
  archiveWeeks: 52, // Number of historical weeks to show
  defaultCases: [
    {
      id: "base",
      name: "ShackPack",
      description: "Contains one 1/10 oz gold coin and 9 varied silver coins",
      goldContent: "1/10 oz Gold"
    },
    {
      id: "deluxe",
      name: "ShackPack Deluxe",
      description: "Contains two 1/10 oz gold coins and 8 varied silver coins",
      goldContent: "2× 1/10 oz Gold"
    },
    {
      id: "xtreme",
      name: "ShackPack Xtreme",
      description: "Contains one 1/4 oz gold coin and 9 varied silver coins",
      goldContent: "1/4 oz Gold"
    },
    {
      id: "unleashed",
      name: "ShackPack Unleashed",
      description: "Contains two 1/4 oz gold coins and 8 varied silver coins",
      goldContent: "2× 1/4 oz Gold"
    },
    {
      id: "resurgence",
      name: "ShackPack Resurgence",
      description: "Contains one 1/2 oz gold coin and 9 varied silver coins",
      goldContent: "1/2 oz Gold"
    },
    {
      id: "transcendent",
      name: "ShackPack Transcendent",
      description: "Contains one 1 oz gold coin and 9 varied silver coins",
      goldContent: "1 oz Gold"
    },
    {
      id: "ignite",
      name: "ShackPack Ignite",
      description: "Contains one 1/4 oz platinum coin and 9 varied silver coins",
      goldContent: "1/4 oz Platinum"
    },
    {
      id: "eclipse",
      name: "ShackPack Eclipse",
      description: "Contains one 1 oz platinum coin and 9 varied silver coins",
      goldContent: "1 oz Platinum"
    }
  ] satisfies CaseType[]
};

function formatDisplayDateRange(start: string, end: string) {
  const startText = new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endText = new Date(end).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  return `${startText} – ${endText}`;
}

function getCurrentWeekMonday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  // Calculate days to subtract to get to Monday (if Sunday, subtract 6; otherwise subtract dayOfWeek - 1)
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function generateSeries(): SeriesData[] {
  const series: SeriesData[] = [];
  const { weeksAhead, archiveWeeks, defaultCases } = SERIES_CONFIG;
  
  // Get the current week's Monday (most recent series)
  const currentWeekMonday = getCurrentWeekMonday();
  
  // Generate series from current week going backwards (historical) and forwards (future)
  // Start from current week (weekOffset = 0) and go backwards for archiveWeeks
  // Then go forwards for weeksAhead
  const startWeek = -archiveWeeks; // Go back archiveWeeks from current
  const endWeek = weeksAhead; // Go forward weeksAhead from current

  for (let weekOffset = startWeek; weekOffset <= endWeek; weekOffset++) {
    const weekStart = new Date(currentWeekMonday);
    weekStart.setDate(currentWeekMonday.getDate() + weekOffset * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const monthName = weekStart.toLocaleDateString("en-US", { month: "long" });
    const monthAbbr = weekStart.toLocaleDateString("en-US", { month: "short" }).toLowerCase();
    const year = weekStart.getFullYear();
    const weekNumberInMonth = Math.floor((weekStart.getDate() - 1) / 7) + 1;

    series.push({
      id: `series-${weekNumberInMonth}-${monthAbbr}-${year}`,
      name: `Series ${weekNumberInMonth} – ${monthName} ${year}`,
      startDate: weekStart.toISOString().split("T")[0],
      endDate: weekEnd.toISOString().split("T")[0],
      description: `Week of ${formatDisplayDateRange(
        weekStart.toISOString().split("T")[0],
        weekEnd.toISOString().split("T")[0]
      )}`,
      cases: [...defaultCases]
    });
  }

  // Sort by date descending (most recent first)
  return series.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
}

async function fetchChecklist(params: { caseType: string; startDate: string; endDate: string }) {
  const url = new URL("https://us-central1-coin-inventory-8b79d.cloudfunctions.net/getChecklist");
  url.searchParams.set("orgId", "coin-shack");
  url.searchParams.set("filter", "shackpack");
  url.searchParams.set("caseType", params.caseType);
  url.searchParams.set("startDate", params.startDate);
  url.searchParams.set("endDate", params.endDate);
  // API uses weekly aggregation: coins from cases created in previous week + current premium inventory
  // Weeks are Monday→Sunday (Eastern Time), regenerated every Monday at 1:00 AM Eastern

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const json = (await response.json()) as ChecklistResponse;
  if (!json.success) {
    throw new Error("Checklist API returned success: false");
  }
  return json;
}

function formatDateTime(value?: string) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  } catch {
    return value;
  }
}

export default function ChecklistPage() {
  const seriesList = useMemo(() => generateSeries(), []);
  const [selectedSeries, setSelectedSeries] = useState<SeriesData>(seriesList[0]);
  const [selectedCase, setSelectedCase] = useState<CaseType>(seriesList[0].cases[0]);
  const [data, setData] = useState<ChecklistResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setWarning(null);
      try {
        const result = await fetchChecklist({
          caseType: selectedCase.id,
          startDate: selectedSeries.startDate,
          endDate: selectedSeries.endDate
        });
        if (cancelled) return;
        setData(result);
        if (result.warning) {
          setWarning(result.warning);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [selectedCase, selectedSeries, refreshIndex]);

  return (
    <main className="container py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-gold">ShackPack Series Checklist</h1>
          <p className="text-lg text-slate-300">
            Select a series and case type to review the coins that may appear in that case.
          </p>
          <p className="text-sm text-slate-400 italic">
            Possible contents only — coins are not guaranteed in any individual pack.
          </p>
        </header>

        <section className="space-y-4">
          <div className="border-b border-slate-700 overflow-x-auto">
            <div className="flex flex-wrap gap-2">
              {seriesList.map((series) => {
                const active = series.id === selectedSeries.id;
                const current =
                  new Date(series.startDate) <= new Date() &&
                  new Date(series.endDate) >= new Date();

                return (
                  <button
                    key={series.id}
                    onClick={() => {
                      setSelectedSeries(series);
                      setSelectedCase(series.cases[0]);
                    }}
                    className={`px-5 py-3 text-left transition ${
                      active ? "border-b-2 border-gold text-gold" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{series.name}</span>
                      {current && <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatDisplayDateRange(series.startDate, series.endDate)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-5 space-y-4">
            <h2 className="text-xl font-semibold text-slate-100">Case Types</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-4">
              {selectedSeries.cases.map((caseType) => {
                const active = caseType.id === selectedCase.id;
                const meta = CASE_TYPE_META[caseType.id];
                return (
                  <button
                    key={caseType.id}
                    onClick={() => setSelectedCase(caseType)}
                    className={`rounded-lg border p-4 text-left transition ${
                      active
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    <div className="font-semibold text-sm mb-1">{meta?.label ?? caseType.name}</div>
                    <div className="text-xs text-slate-400">
                      {meta?.helper ?? caseType.goldContent}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-700 bg-slate-900/40 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gold mb-2">
                {CASE_TYPE_META[selectedCase.id]?.label ?? selectedCase.name}
              </h3>
              <p className="text-slate-300 mb-1">
                {CASE_TYPE_META[selectedCase.id]?.helper ?? selectedCase.description}
              </p>
              {data?.startDate && data?.endDate ? (
                <p className="text-sm text-slate-400">
                  Week: {formatDisplayDateRange(data.startDate, data.endDate)}
                </p>
              ) : (
                <p className="text-sm text-slate-400">
                  Series week: {formatDisplayDateRange(selectedSeries.startDate, selectedSeries.endDate)}
                </p>
              )}
              {data?.weeklyAggregation && data.casesCount !== undefined && (
                <p className="text-xs text-slate-500 mt-1">
                  Based on {data.casesCount} case{data.casesCount !== 1 ? "s" : ""} from previous week
                  {data.premiumInventoryCount !== undefined && (
                    <span> + {data.premiumInventoryCount} premium coins in current inventory</span>
                  )}
                </p>
              )}
            </div>
            <div className="text-right text-sm text-slate-400">
              <div className="font-medium text-slate-100">Last updated</div>
              <div>{formatDateTime(data?.lastUpdated)}</div>
              <button
                onClick={() => setRefreshIndex((idx) => idx + 1)}
                disabled={loading}
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-1 text-gold transition hover:bg-gold/20 disabled:opacity-50"
              >
                <svg
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {loading ? "Refreshing…" : "Refresh"}
              </button>
            </div>
          </div>
        </section>


        {warning && (
          <div className="rounded border border-yellow-500/30 bg-yellow-900/20 p-4 text-sm text-yellow-100">
            <strong>Warning:</strong> {warning}
          </div>
        )}

        {error && (
          <div className="rounded border border-red-500/30 bg-red-900/20 p-6 text-center text-red-200">
            <p className="font-semibold">Unable to load checklist.</p>
            <p className="text-sm opacity-80">{error}</p>
            <button
              onClick={() => setRefreshIndex((idx) => idx + 1)}
              className="mt-4 inline-flex items-center rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {loading && !data && (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-slate-700 bg-slate-900/40 p-10">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gold" />
            <p className="text-sm text-slate-400">Loading ShackPack checklist…</p>
          </div>
        )}

        {data && data.checklist && data.checklist.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-200">
                Coins in {CASE_TYPE_META[selectedCase.id]?.label ?? selectedCase.name}
              </h3>
              {data.totalTypes !== undefined && (
                <div className="text-sm text-slate-400">
                  {data.totalTypes} coin {data.totalTypes === 1 ? "type" : "types"}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-5">
              <ul className="space-y-2 text-sm text-slate-200">
                {data.checklist.map((coin, index) => (
                  <li key={`${coin.name}-${index}`} className="flex items-center gap-2">
                    <span className="text-gold">•</span>
                    <span>{coin.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {data && data.checklist.length === 0 && !loading && !error && (
          <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-10 text-center text-slate-400">
            No coins were recorded for this case during the selected series week.
          </div>
        )}

        <footer className="rounded-lg border border-slate-700 bg-slate-900/40 p-6 text-sm text-slate-300 space-y-2">
          <p>
            This checklist shows coins that may appear in ShackPack cases for the selected series week.
            It includes coins from cases created the previous week plus currently available premium coins.
            Actual pack contents vary and specific coins are not guaranteed.
          </p>
          <p className="text-xs text-slate-500">
            Checklist regenerated weekly (every Monday at 1:00 AM Eastern) • No purchase necessary to view.
          </p>
        </footer>
      </div>
    </main>
  );
}

