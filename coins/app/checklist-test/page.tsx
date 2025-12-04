"use client";

import { useMemo, useState } from "react";
import type { SeriesData, CaseType } from "./types";
import { generateSeries } from "./series";
import { useChecklist } from "./hooks/useChecklist";
import {
  SeriesTabs,
  CaseTypeSelector,
  ChecklistHeader,
  CoinList,
  LoadingState,
  ErrorState,
  WarningBanner
} from "./components";

export default function ChecklistTestPage() {
  const seriesList = useMemo(() => generateSeries(), []);
  
  // Safety check: ensure we have at least one series with cases
  if (seriesList.length === 0 || seriesList[0].cases.length === 0) {
    return (
      <main className="container py-10">
        <div className="max-w-7xl mx-auto text-center text-slate-400">
          <p>Unable to generate series data. Please refresh the page.</p>
        </div>
      </main>
    );
  }

  const [selectedSeries, setSelectedSeries] = useState<SeriesData>(seriesList[0]);
  const [selectedCase, setSelectedCase] = useState<CaseType>(seriesList[0].cases[0]);
  
  const { data, loading, error, warning, refresh } = useChecklist(selectedCase, selectedSeries);

  const handleSeriesSelect = (series: SeriesData) => {
    setSelectedSeries(series);
    setSelectedCase(series.cases[0]);
  };

  return (
    <main className="container py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center space-y-3">
          <div className="inline-block px-4 py-2 mb-3 rounded-lg bg-blue-900/40 border border-blue-500/30">
            <span className="text-blue-300 font-semibold">🧪 TEST VERSION</span>
            <span className="text-blue-400 text-sm ml-2">- API Integration Testing</span>
          </div>
          <h1 className="text-4xl font-bold text-gold">ShackPack Series Checklist</h1>
          <p className="text-lg text-slate-300">
            Select a series and case type to review the coins that may appear in that case.
          </p>
          <p className="text-sm text-slate-400 italic">
            Possible contents only — coins are not guaranteed in any individual pack.
          </p>
        </header>

        <section className="space-y-4">
          <SeriesTabs
            seriesList={seriesList}
            selectedSeries={selectedSeries}
            onSelectSeries={handleSeriesSelect}
          />
          <CaseTypeSelector
            cases={selectedSeries.cases}
            selectedCase={selectedCase}
            onSelectCase={setSelectedCase}
          />
        </section>

        <ChecklistHeader
          selectedCase={selectedCase}
          selectedSeries={selectedSeries}
          data={data}
          loading={loading}
          onRefresh={refresh}
        />

        {warning && <WarningBanner warning={warning} />}
        {error && <ErrorState error={error} onRetry={refresh} />}
        {loading && !data && <LoadingState />}
        {data && !loading && !error && (
          <CoinList data={data} selectedCase={selectedCase} />
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

