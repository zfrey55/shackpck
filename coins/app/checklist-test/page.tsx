"use client";

import { useState, useEffect, useMemo } from "react";
import type { DailyChecklistResponse, AvailableDatesResponse, CaseTypeInfo } from "./types";
import { fetchDailyChecklist, fetchAvailableDates } from "./api";
import {
  CaseCard,
  CaseTypeSelector,
  DateButtonsForCaseType,
  EmptyState,
  LoadingState,
  ErrorState
} from "./components";

const CASE_DESCRIPTIONS: Record<string, string> = {
  'reign': 'Reign by Shackpack (1× 1/10 oz gold + 9 varied silver)',
  'prominence': 'Prominence by Shackpack (1× 1/4 oz platinum + 9 varied silver)',
  'apex': 'Apex by Shackpack (1× 1/4 oz gold + 9 varied silver)',
  'base': 'ShackPack Base (1× 1/10 oz gold + 9 varied silver)',
  'deluxe': 'ShackPack Deluxe (2× 1/10 oz gold + 8 varied silver)',
  'xtreme': 'ShackPack Xtreme (1× 1/4 oz gold + 9 varied silver)',
  'unleashed': 'ShackPack Unleashed (2× 1/4 oz gold + 8 varied silver)',
  'resurgence': 'ShackPack Resurgence (1× 1/2 oz gold + 9 varied silver)',
  'transcendent': 'ShackPack Transcendent (1× 1 oz gold + 9 varied silver)',
  'ignite': 'ShackPack Ignite (1× 1/4 oz platinum + 9 varied silver)',
  'eclipse': 'ShackPack Eclipse (1× 1 oz platinum + 9 varied silver)',
  'radiant': 'ShackPack Radiant (1× 1/2 oz platinum + 9 varied silver)',
  'currencyclash': 'Currency Clash by Shackpack',
  'mystery': 'ShackPack Mystery (custom configuration)'
};

const CASE_TYPE_DISPLAY_NAMES: Record<string, string> = {
  'reign': 'Reign by Shackpack',
  'prominence': 'Prominence by Shackpack',
  'apex': 'Apex by Shackpack',
  'base': 'ShackPack Base',
  'deluxe': 'ShackPack Deluxe',
  'xtreme': 'ShackPack Xtreme',
  'unleashed': 'ShackPack Unleashed',
  'resurgence': 'ShackPack Resurgence',
  'transcendent': 'ShackPack Transcendent',
  'ignite': 'ShackPack Ignite',
  'eclipse': 'ShackPack Eclipse',
  'radiant': 'ShackPack Radiant',
  'currencyclash': 'Currency Clash by Shackpack',
  'mystery': 'ShackPack Mystery'
};

export default function ChecklistTestPage() {
  const [availableDates, setAvailableDates] = useState<AvailableDatesResponse | null>(null);
  const [checklist, setChecklist] = useState<DailyChecklistResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCaseType, setSelectedCaseType] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Load available dates on mount to get all case types
  useEffect(() => {
    loadAvailableDates();
  }, []);

  // Auto-select most recent date when case type is selected
  useEffect(() => {
    if (selectedCaseType && availableDates) {
      const datesForType = availableDates.dates
        .filter(date => date.caseTypes.includes(selectedCaseType))
        .sort((a, b) => b.displayDate.localeCompare(a.displayDate)); // Most recent first
      
      if (datesForType.length > 0) {
        setSelectedDate(datesForType[0].displayDate);
      } else {
        setSelectedDate(null);
        setChecklist(null);
      }
    }
  }, [selectedCaseType, availableDates]);

  // Load checklist when both case type and date are selected
  useEffect(() => {
    if (selectedCaseType && selectedDate) {
      loadChecklist(selectedDate, selectedCaseType);
    }
  }, [selectedCaseType, selectedDate]);

  const loadAvailableDates = async () => {
    setLoading(true);
    setError(null);
    try {
      const dates = await fetchAvailableDates(365); // Get up to 1 year of dates
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
      
      // Filter cases to only show the selected case type (in case API doesn't filter properly)
      const filteredCases = data.cases.filter(c => c.caseType === caseType);
      
      setChecklist({
        ...data,
        cases: filteredCases,
        totalCases: filteredCases.length
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load checklist");
      setChecklist(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCaseTypeSelect = (caseType: string) => {
    setSelectedCaseType(caseType);
    setSelectedDate(null);
    setChecklist(null);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  // Compute case types from available dates
  const caseTypes = useMemo<CaseTypeInfo[]>(() => {
    if (!availableDates) return [];

    // Collect all unique case types and their stats
    const caseTypeMap = new Map<string, { dates: Set<string>, totalCases: number }>();

    availableDates.dates.forEach(dateInfo => {
      dateInfo.caseTypes.forEach(caseType => {
        if (!caseTypeMap.has(caseType)) {
          caseTypeMap.set(caseType, { dates: new Set(), totalCases: 0 });
        }
        const info = caseTypeMap.get(caseType)!;
        info.dates.add(dateInfo.displayDate);
        info.totalCases += dateInfo.totalCases; // This is approximate, actual count per type would need API
      });
    });

    // Convert to array and sort by display name
    return Array.from(caseTypeMap.entries())
      .map(([caseType, info]) => ({
        caseType,
        displayName: CASE_TYPE_DISPLAY_NAMES[caseType] || caseType,
        totalDates: info.dates.size,
        totalCases: info.totalCases // This is approximate
      }))
      .sort((a, b) => {
        // Sort by display name alphabetically
        return a.displayName.localeCompare(b.displayName);
      });
  }, [availableDates]);

  // Get dates for selected case type
  const datesForCaseType = useMemo(() => {
    if (!availableDates || !selectedCaseType) return [];
    
    return availableDates.dates
      .filter(date => date.caseTypes.includes(selectedCaseType))
      .sort((a, b) => b.displayDate.localeCompare(a.displayDate)) // Most recent first
      .map(date => ({
        displayDate: date.displayDate,
        totalCases: date.totalCases // This is total for all types, not just selected
      }));
  }, [availableDates, selectedCaseType]);

  // Get filtered cases for selected case type
  const filteredCases = useMemo(() => {
    if (!checklist || !selectedCaseType) return [];
    return checklist.cases.filter(c => c.caseType === selectedCaseType);
  }, [checklist, selectedCaseType]);

  if (loading && !availableDates) {
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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gold">
            📅 ShackPack Checklist (Test)
          </h1>
          <p className="text-lg text-slate-400">
            Select a series to view available dates
          </p>
        </div>

        {/* Case Type Selector */}
        {!selectedCaseType && (
          <CaseTypeSelector
            caseTypes={caseTypes}
            selectedCaseType={selectedCaseType}
            onCaseTypeSelect={handleCaseTypeSelect}
            caseDescriptions={CASE_DESCRIPTIONS}
          />
        )}

        {/* Date Selector for Selected Case Type */}
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
              onDateSelect={handleDateSelect}
              caseTypeName={selectedCaseType ? (CASE_TYPE_DISPLAY_NAMES[selectedCaseType] || selectedCaseType) : 'Unknown'}
            />
          </>
        )}

        {/* Loading State for Checklist */}
        {loading && selectedDate && <LoadingState />}

        {/* Error State for Checklist */}
        {error && checklist === null && selectedDate && (
          <ErrorState error={error} onRetry={() => selectedCaseType && selectedDate && loadChecklist(selectedDate, selectedCaseType)} />
        )}

        {/* Cases or Empty State */}
        {!loading && checklist && selectedDate && (
          <>
            {filteredCases.length > 0 ? (
              <>
                <div className="mb-4 text-center">
                  <p className="text-lg text-slate-300">
                    {(() => {
                      const [year, month, day] = checklist.displayDate.split('-').map(Number);
                      const localDate = new Date(year, month - 1, day);
                      return localDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      });
                    })()}
                  </p>
                  <p className="text-slate-400">
                    <span className="font-semibold text-gold">{filteredCases.length}</span> case{filteredCases.length !== 1 ? 's' : ''} available
                  </p>
                </div>
                <div className="space-y-6 mb-12">
                  {filteredCases.map((caseData) => (
                    <CaseCard
                      key={caseData.caseId}
                      caseData={caseData}
                      caseDescriptions={CASE_DESCRIPTIONS}
                    />
                  ))}
                </div>
              </>
            ) : (
              <EmptyState 
                date={selectedDate} 
                caseTypeName={selectedCaseType ? (CASE_TYPE_DISPLAY_NAMES[selectedCaseType] || selectedCaseType) : 'Unknown'}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}

