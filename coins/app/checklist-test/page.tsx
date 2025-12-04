"use client";

import { useState, useEffect } from "react";
import type { DailyChecklistResponse, AvailableDatesResponse } from "./types";
import { fetchDailyChecklist, fetchAvailableDates } from "./api";
import {
  CaseCard,
  DateButtons,
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
  const [availableDates, setAvailableDates] = useState<AvailableDatesResponse | null>(null);
  const [checklist, setChecklist] = useState<DailyChecklistResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Load available dates on mount
  useEffect(() => {
    loadAvailableDates();
  }, []);

  // Load checklist when selected date changes
  useEffect(() => {
    if (selectedDate) {
      loadChecklist(selectedDate);
    }
  }, [selectedDate]);

  const loadAvailableDates = async () => {
    setLoading(true);
    setError(null);
    try {
      const dates = await fetchAvailableDates(365); // Get up to 1 year of dates
      setAvailableDates(dates);
      
      // Auto-select most recent date (first in list, already sorted by API)
      if (dates.dates.length > 0) {
        setSelectedDate(dates.dates[0].displayDate);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load available dates");
      setLoading(false);
    }
  };

  const loadChecklist = async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDailyChecklist(date);
      setChecklist(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load checklist");
      setChecklist(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  if (loading && !checklist) {
    return (
      <main className="container py-10">
        <div className="max-w-6xl mx-auto">
          <LoadingState />
        </div>
      </main>
    );
  }

  if (error && !availableDates) {
    return (
      <main className="container py-10">
        <div className="max-w-6xl mx-auto">
          <ErrorState error={error} onRetry={loadAvailableDates} />
        </div>
      </main>
    );
  }

  if (!availableDates || availableDates.dates.length === 0) {
    return (
      <main className="container py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-6">
            <div className="inline-block px-4 py-2 rounded-lg bg-blue-900/40 border border-blue-500/30">
              <span className="text-blue-300 font-semibold">🧪 TEST VERSION</span>
              <span className="text-blue-400 text-sm ml-2">- Daily Checklist API</span>
            </div>
          </div>
          <div className="text-center py-12 bg-slate-900/40 rounded-lg border border-slate-700">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold mb-4 text-slate-200">No Checklists Available Yet</h2>
            <p className="text-slate-400">Create your first case to get started!</p>
            <p className="text-sm text-slate-500 mt-2">Cases created today will appear on tomorrow's checklist.</p>
          </div>
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
                {checklist.totalCases !== 1 ? 's' : ''} Available
              </p>
            </>
          )}
        </div>

        {/* Date Buttons */}
        <DateButtons
          dates={availableDates.dates}
          selectedDate={selectedDate || ''}
          onDateSelect={handleDateSelect}
        />

        {/* Loading State for Checklist */}
        {loading && <LoadingState />}

        {/* Error State for Checklist */}
        {error && checklist === null && (
          <ErrorState error={error} onRetry={() => selectedDate && loadChecklist(selectedDate)} />
        )}

        {/* Cases or Empty State */}
        {!loading && checklist && (
          <>
            {checklist.totalCases > 0 ? (
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
              <EmptyState date={selectedDate || ''} />
            )}
          </>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-slate-400 space-y-2">
          <p>✅ Checklist updated automatically from live inventory (real-time)</p>
          <p>📦 Cases created today appear on tomorrow's checklist</p>
          <p className="text-xs text-slate-500">
            Checklists retained for 1 year • No purchase necessary to view
          </p>
        </div>
      </div>
    </main>
  );
}

