"use client";

import { useState, useEffect } from "react";
import type { DailyChecklistResponse } from "./types";
import { fetchDailyChecklist } from "./api";
import {
  CaseCard,
  DateSelector,
  EmptyState,
  LoadingState,
  ErrorState
} from "./components";

const CASE_DESCRIPTIONS: Record<string, string> = {
  'base': 'ShackPack Base (1× 1/10 oz gold + 9 varied silver)',
  'deluxe': 'ShackPack Deluxe (2× 1/10 oz gold + 8 varied silver)',
  'xtreme': 'ShackPack Xtreme (1× 1/4 oz gold + 9 varied silver)',
  'unleashed': 'ShackPack Unleashed (2× 1/4 oz gold + 8 varied silver)',
  'resurgence': 'ShackPack Resurgence (1× 1/2 oz gold + 9 varied silver)',
  'transcendent': 'ShackPack Transcendent (1× 1 oz gold + 9 varied silver)',
  'ignite': 'ShackPack Ignite (1× 1/4 oz platinum + 9 varied silver)',
  'eclipse': 'ShackPack Eclipse (1× 1 oz platinum + 9 varied silver)',
  'radiant': 'ShackPack Radiant (1× 1/2 oz platinum + 9 varied silver)',
  'mystery': 'ShackPack Mystery (custom configuration)'
};

export default function DailyChecklistTestPage() {
  const [checklist, setChecklist] = useState<DailyChecklistResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    loadChecklist();
  }, [selectedDate]);

  const loadChecklist = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDailyChecklist(selectedDate);
      setChecklist(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load checklist");
      setChecklist(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="container py-10">
        <div className="max-w-6xl mx-auto">
          <LoadingState />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container py-10">
        <div className="max-w-6xl mx-auto">
          <ErrorState error={error} onRetry={loadChecklist} />
        </div>
      </main>
    );
  }

  return (
    <main className="container py-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Test Banner */}
        <div className="text-center mb-6">
          <div className="inline-block px-4 py-2 rounded-lg bg-blue-900/40 border border-blue-500/30">
            <span className="text-blue-300 font-semibold">🧪 TEST VERSION</span>
            <span className="text-blue-400 text-sm ml-2">- Daily Checklist API</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gold">
            📅 ShackPack Daily Checklist
          </h1>
          {checklist && (
            <>
              <p className="text-xl text-slate-300">
                {new Date(checklist.displayDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-lg mt-2 text-slate-400">
                <span className="font-semibold text-gold">{checklist.totalCases}</span> Case
                {checklist.totalCases !== 1 ? 's' : ''} Available{checklist.displayDate === new Date().toISOString().split('T')[0] ? ' Today' : ''}
              </p>
            </>
          )}
        </div>

        {/* Date Selector */}
        <DateSelector 
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        {/* Cases or Empty State */}
        {checklist && checklist.totalCases > 0 ? (
          <div className="space-y-6 mb-12">
            {checklist.cases.map((caseData) => (
              <CaseCard
                key={caseData.caseId}
                caseData={caseData}
                caseDescriptions={CASE_DESCRIPTIONS}
              />
            ))}
          </div>
        ) : (
          <EmptyState date={selectedDate} />
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-slate-400 space-y-2">
          <p>✅ Checklist updated automatically from live inventory</p>
          <p>📦 Cases shown may vary by availability</p>
          <p className="text-xs text-slate-500">
            Contents shown are examples from cases created for today's delivery
          </p>
        </div>
      </div>
    </main>
  );
}
