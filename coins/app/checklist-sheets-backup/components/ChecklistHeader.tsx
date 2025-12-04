import { memo } from "react";
import type { ChecklistResponse, CaseType, SeriesData } from "../types";
import { CASE_TYPE_META } from "../constants";
import { formatDisplayDateRange, formatDateTime } from "../utils";

interface ChecklistHeaderProps {
  selectedCase: CaseType;
  selectedSeries: SeriesData;
  data: ChecklistResponse | null;
  loading: boolean;
  onRefresh: () => void;
}

export const ChecklistHeader = memo(function ChecklistHeader({
  selectedCase,
  selectedSeries,
  data,
  loading,
  onRefresh
}: ChecklistHeaderProps) {
  return (
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
            onClick={onRefresh}
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
  );
});

