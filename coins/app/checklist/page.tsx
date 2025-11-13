"use client";

import { useEffect, useMemo, useState } from "react";

type CaseTypeOption = {
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
  warning?: string;
  totalTypes?: number;
  totalCoins?: number;
  snapshotCount?: number;
  checklist: CoinItem[];
}

interface FetchParams {
  caseType?: string;
  startDate?: string;
  endDate?: string;
}

const CASE_TYPES: CaseTypeOption[] = [
  { id: "all", label: "All Cases", helper: "Show every ShackPack-eligible coin" },
  { id: "base", label: "ShackPack", helper: "1× 1/10 oz gold + 9 silver coins" },
  { id: "deluxe", label: "Deluxe", helper: "2× 1/10 oz gold + 8 silver coins" },
  { id: "xtreme", label: "Xtreme", helper: "1× 1/4 oz gold + 9 silver coins" },
  { id: "unleashed", label: "Unleashed", helper: "2× 1/4 oz gold + 8 silver coins" },
  { id: "resurgence", label: "Resurgence", helper: "1× 1/2 oz gold + 9 silver coins" },
  { id: "transcendent", label: "Transcendent", helper: "1× 1 oz gold + 9 silver coins" },
  { id: "ignite", label: "Ignite", helper: "1× 1/4 oz platinum + 9 silver coins" }
];

const API_BASE =
  "https://us-central1-coin-inventory-8b79d.cloudfunctions.net/getChecklist";

function getPreviousMondayRange(): { startDate: string; endDate: string } {
  const today = new Date();
  const dayOfWeek = today.getUTCDay(); // Sunday = 0
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );
  monday.setUTCDate(monday.getUTCDate() - diffToMonday);

  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  const format = (date: Date) => date.toISOString().split("T")[0];

  return {
    startDate: format(monday),
    endDate: format(sunday)
  };
}

async function fetchChecklist(params: FetchParams): Promise<ChecklistResponse> {
  const url = new URL(API_BASE);
  url.searchParams.set("orgId", "coin-shack");
  url.searchParams.set("filter", "shackpack");

  if (params.caseType && params.caseType !== "all") {
    url.searchParams.set("caseType", params.caseType);
  }
  if (params.startDate && params.endDate) {
    url.searchParams.set("startDate", params.startDate);
    url.searchParams.set("endDate", params.endDate);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Checklist request failed with status ${response.status}`);
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

function formatList(items?: string[]) {
  if (!items || items.length === 0) return "—";
  return items.join(", ");
}

function formatYears(years?: string[]) {
  if (!years || years.length === 0) return "Various Years";
  return years.join(", ");
}

function formatGrades(grades?: Record<string, number>, gradesAvailable?: string[]) {
  if (grades && Object.keys(grades).length > 0) {
    return Object.entries(grades)
      .map(([grade, count]) => `${grade} (${count})`)
      .join(", ");
  }
  if (gradesAvailable && gradesAvailable.length > 0) {
    return gradesAvailable.join(", ");
  }
  return "—";
}

export default function ChecklistPage() {
  const [caseType, setCaseType] = useState<string>("all");
  const [historicalView, setHistoricalView] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>(() => getPreviousMondayRange().startDate);
  const [endDate, setEndDate] = useState<string>(() => getPreviousMondayRange().endDate);
  const [data, setData] = useState<ChecklistResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const params = useMemo(() => {
    const payload: FetchParams = {};
    payload.caseType = caseType !== "all" ? caseType : undefined;
    if (historicalView) {
      payload.startDate = startDate;
      payload.endDate = endDate;
    }
    return payload;
  }, [caseType, historicalView, startDate, endDate]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setWarning(null);
      try {
        const result = await fetchChecklist(params);
        if (cancelled) return;
        setData(result);
        if (result.warning) {
          setWarning(result.warning);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setData(null);
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
  }, [params, refreshIndex]);

  const handleRefresh = () => {
    setRefreshIndex((index) => index + 1);
  };

  const isHistorical = historicalView || data?.isHistorical;

  return (
    <main className="container py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-3 text-center">
          <h1 className="text-4xl font-bold text-gold">ShackPack Checklist</h1>
          <p className="text-lg text-slate-300">
            Explore current and historical coin availability for every ShackPack case type.
          </p>
          <p className="text-sm text-slate-400 italic">
            Possible contents only — coins are not guaranteed in any individual pack.
          </p>
        </header>

        {historicalView && (!data || data.checklist.length === 0) && (
          <div className="rounded-lg border border-yellow-500/40 bg-yellow-900/20 p-4 text-sm text-yellow-200">
            <strong>Historical data looks empty?</strong> Run the backfill endpoint:
            <code className="ml-2 rounded bg-yellow-900/40 px-2 py-1">
              curl -X POST "https://us-central1-coin-inventory-8b79d.cloudfunctions.net/backfillInventorySnapshots?orgId=coin-shack"
            </code>
          </div>
        )}

        <section className="space-y-6 rounded-lg border border-slate-700 bg-slate-900/40 p-6">
          <div>
            <h2 className="mb-4 text-xl font-semibold text-slate-100">1. Choose Case Type</h2>
            <div className="flex flex-wrap gap-3">
              {CASE_TYPES.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setCaseType(option.id)}
                  className={`min-w-[120px] rounded-lg border px-4 py-2 text-left transition ${
                    caseType === option.id
                      ? "border-gold bg-gold/15 text-gold shadow-glow"
                      : "border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-xs text-slate-400">{option.helper}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-100">2. Historical View</h2>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-gold focus:ring-gold"
                  checked={historicalView}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    setHistoricalView(enabled);
                    if (enabled) {
                      const { startDate: defaultStart, endDate: defaultEnd } = getPreviousMondayRange();
                      setStartDate(defaultStart);
                      setEndDate(defaultEnd);
                    }
                  }}
                />
                Enable historical snapshot range
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col text-sm text-slate-300">
                Start date
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={!historicalView}
                  className="mt-1 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 disabled:opacity-50"
                />
              </label>
              <label className="flex flex-col text-sm text-slate-300">
                End date
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={!historicalView}
                  className="mt-1 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 disabled:opacity-50"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-4 py-2 text-gold transition hover:bg-gold/20 disabled:opacity-50"
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
              {loading ? "Fetching..." : "Refresh"}
            </button>
          </div>
        </section>

        {warning && (
          <div className="rounded border border-yellow-500/40 bg-yellow-900/20 p-4 text-sm text-yellow-100">
            <strong>Warning:</strong> {warning}
          </div>
        )}

        {error && (
          <div className="rounded border border-red-500/40 bg-red-900/20 p-6 text-center text-red-200">
            <p className="font-semibold">Unable to load checklist.</p>
            <p className="text-sm opacity-80">{error}</p>
            <button
              onClick={handleRefresh}
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

        {data && !error && (
          <section className="space-y-6">
            <div className="grid gap-4 rounded-lg border border-slate-700 bg-slate-900/40 p-6 md:grid-cols-2">
              <div>
                <h3 className="text-sm uppercase tracking-wide text-slate-400">Overview</h3>
                <dl className="mt-2 space-y-1 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <dt>Case type:</dt>
                    <dd className="font-medium text-slate-100">
                      {
                        CASE_TYPES.find((option) => option.id === caseType)?.label ??
                        data.caseType ??
                        "All Cases"
                      }
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Historical snapshot:</dt>
                    <dd className="font-medium text-slate-100">
                      {isHistorical ? "Yes (snapshot range)" : "No (live inventory)"}
                    </dd>
                  </div>
                  {data.startDate && data.endDate && (
                    <div className="flex justify-between">
                      <dt>Snapshot range:</dt>
                      <dd className="font-medium text-slate-100">
                        {data.startDate} → {data.endDate}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt>Snapshot count:</dt>
                    <dd>{data.snapshotCount ?? "—"}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 className="text-sm uppercase tracking-wide text-slate-400">Inventory</h3>
                <dl className="mt-2 space-y-1 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <dt>Total coin types:</dt>
                    <dd className="font-medium text-slate-100">{data.totalTypes ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Total coins counted:</dt>
                    <dd className="font-medium text-slate-100">{data.totalCoins ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Last updated:</dt>
                    <dd>{formatDateTime(data.lastUpdated)}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {data.checklist.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {data.checklist.map((coin) => {
                  const quantityLabel = isHistorical ? "Historical max observed" : "Quantity";
                  const quantityValue =
                    coin.maxObservedQuantity ?? coin.totalQuantity ?? 0;

                  return (
                    <article
                      key={`${coin.name}-${formatYears(coin.years)}`}
                      className="rounded-lg border border-slate-700 bg-slate-900/50 p-5 shadow-sm transition hover:border-gold/40 hover:shadow-glow"
                    >
                      <header className="mb-4 flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gold">{coin.name}</h3>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Years: <span className="text-slate-300">{formatYears(coin.years)}</span>
                          </p>
                        </div>
                        <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
                          {quantityLabel}: {quantityValue}
                        </span>
                      </header>

                      <dl className="space-y-2 text-sm text-slate-300">
                        <div>
                          <dt className="font-medium text-slate-200">Grading Companies</dt>
                          <dd>{formatList(coin.gradingCompanies)}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-slate-200">Grades & Counts</dt>
                          <dd>{formatGrades(coin.grades, coin.gradesAvailable)}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-slate-200">Status</dt>
                          <dd>
                            <span
                              className={`inline-flex items-center gap-1 font-medium ${
                                coin.available === false
                                  ? "text-slate-400"
                                  : "text-green-400"
                              }`}
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d={
                                    coin.available === false
                                      ? "M6 18L18 6M6 6l12 12"
                                      : "M5 13l4 4L19 7"
                                  }
                                />
                              </svg>
                              {coin.available === false ? "Unavailable" : "Available"}
                            </span>
                          </dd>
                        </div>
                      </dl>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-10 text-center text-slate-400">
                No coins were recorded for the selected filters. Adjust your case type or date range.
              </div>
            )}
          </section>
        )}

        <footer className="rounded-lg border border-slate-700 bg-slate-900/40 p-6 text-sm text-slate-300">
          <p>
            <strong>Historical Series Data:</strong> Each series shows coins that were available during that
            specific week, including coins in stock, added, or sold during that period.
          </p>
          <p>
            <strong>Gold Inventory Varies:</strong> Gold availability changes weekly based on shipments and
            sales. Each snapshot reflects actual inventory for that time frame.
          </p>
          <p>
            Checklist updated automatically from live inventory • No purchase necessary to view.
          </p>
        </footer>
      </div>
    </main>
  );
}

