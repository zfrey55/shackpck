import { memo } from "react";
import type { SeriesData } from "../types";
import { formatDisplayDateRange } from "../utils";

interface SeriesTabsProps {
  seriesList: SeriesData[];
  selectedSeries: SeriesData;
  onSelectSeries: (series: SeriesData) => void;
}

export const SeriesTabs = memo(function SeriesTabs({
  seriesList,
  selectedSeries,
  onSelectSeries
}: SeriesTabsProps) {
  return (
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
              onClick={() => onSelectSeries(series)}
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
  );
});

