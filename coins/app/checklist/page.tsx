"use client";
import { useEffect, useState } from 'react';

interface CoinItem {
  name: string;
  years: string[];
  gradingCompanies: string[];
  grades: Record<string, number>;
  gradesAvailable: string[];
  totalQuantity: number;
  available: boolean;
}

interface ChecklistData {
  success: boolean;
  lastUpdated: string;
  caseType?: string;
  totalTypes: number;
  totalCoins: number;
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

interface CaseType {
  id: string;
  name: string;
  description: string;
  goldContent: string;
}

// ===== SERIES CONFIGURATION =====
// Series are now AUTO-GENERATED based on the start date and current date
// No manual updates needed - series automatically generate weekly!

// Configuration: Adjust these settings
const SERIES_CONFIG = {
  // First series start date (Monday) - System went live last week
  startDate: new Date('2024-11-04'),
  
  // How many weeks ahead to generate (default: 4 weeks into future)
  weeksAhead: 4,
  
  // How many weeks to keep in archive (52 weeks = 1 year)
  archiveWeeks: 52,
  
  // All case types available (you can modify which cases are in each series here)
  defaultCases: [
    {
      id: 'base',
      name: 'ShackPack',
      description: '1x 1/10 oz gold + 9 silver coins',
      goldContent: '1/10 oz Gold'
    },
    {
      id: 'deluxe',
      name: 'ShackPack Deluxe',
      description: '2x 1/10 oz gold + 8 silver coins',
      goldContent: '2x 1/10 oz Gold'
    },
    {
      id: 'xtreme',
      name: 'ShackPack Xtreme',
      description: '1x 1/4 oz gold + 9 silver coins',
      goldContent: '1/4 oz Gold'
    },
    {
      id: 'unleashed',
      name: 'ShackPack Unleashed',
      description: '2x 1/4 oz gold + 8 silver coins',
      goldContent: '2x 1/4 oz Gold'
    },
    {
      id: 'resurgence',
      name: 'ShackPack Resurgence',
      description: '1x 1/2 oz gold + 9 silver coins',
      goldContent: '1/2 oz Gold'
    },
    {
      id: 'transcendent',
      name: 'ShackPack Transcendent',
      description: '1x 1 oz gold + 9 silver coins',
      goldContent: '1 oz Gold'
    },
    {
      id: 'ignite',
      name: 'ShackPack Ignite',
      description: '1x 1/4 oz platinum + 9 silver coins',
      goldContent: '1/4 oz Platinum'
    }
  ]
};

// Auto-generate series based on configuration
function generateSeries(): SeriesData[] {
  const series: SeriesData[] = [];
  const today = new Date();
  const { startDate, weeksAhead, archiveWeeks, defaultCases } = SERIES_CONFIG;
  
  // Calculate how many weeks since the start date
  const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const weeksSinceStart = Math.floor(daysSinceStart / 7);
  
  // Generate series from (current week - archive weeks) to (current week + weeks ahead)
  const startWeek = Math.max(0, weeksSinceStart - archiveWeeks);
  const endWeek = weeksSinceStart + weeksAhead;
  
  for (let weekOffset = startWeek; weekOffset <= endWeek; weekOffset++) {
    const weekStartDate = new Date(startDate);
    weekStartDate.setDate(startDate.getDate() + (weekOffset * 7));
    
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);
    
    // Calculate series number within the month
    const monthStart = new Date(weekStartDate.getFullYear(), weekStartDate.getMonth(), 1);
    const weeksIntoMonth = Math.floor((weekStartDate.getDate() - 1) / 7) + 1;
    
    const monthName = weekStartDate.toLocaleDateString('en-US', { month: 'long' });
    const monthAbbr = weekStartDate.toLocaleDateString('en-US', { month: 'short' }).toLowerCase();
    const year = weekStartDate.getFullYear();
    
    // Format dates for display
    const startDateStr = weekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endDateStr = weekEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    series.push({
      id: `series-${weeksIntoMonth}-${monthAbbr}-${year}`,
      name: `Series ${weeksIntoMonth} - ${monthName} ${year}`,
      startDate: weekStartDate.toISOString().split('T')[0],
      endDate: weekEndDate.toISOString().split('T')[0],
      description: `Week of ${startDateStr} - ${endDateStr}`,
      cases: [...defaultCases] // Clone the default cases
    });
  }
  
  // Sort by start date descending (newest first)
  return series.sort((a, b) => {
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });
}

// Generate series automatically
const SERIES: SeriesData[] = generateSeries();

export default function ChecklistPage() {
  const [selectedSeries, setSelectedSeries] = useState<SeriesData>(SERIES[0]);
  const [selectedCase, setSelectedCase] = useState<CaseType>(SERIES[0].cases[0]);
  const [data, setData] = useState<ChecklistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChecklistForCase = async (caseId: string, seriesStartDate: string, seriesEndDate: string) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch historical inventory for the selected series date range
      // This shows what was available during THAT week, not current inventory
      const url = new URL('https://us-central1-coin-inventory-8b79d.cloudfunctions.net/getChecklist');
      url.searchParams.append('orgId', 'coin-shack');
      url.searchParams.append('filter', 'shackpack');
      url.searchParams.append('caseType', caseId);
      url.searchParams.append('startDate', seriesStartDate);
      url.searchParams.append('endDate', seriesEndDate);
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch checklist data');
      }
      const jsonData = await response.json();
      setData(jsonData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklistForCase(selectedCase.id, selectedSeries.startDate, selectedSeries.endDate);
  }, [selectedCase, selectedSeries]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateString;
    }
  };

  const formatYears = (years: string[]) => {
    if (!years || years.length === 0) return 'Various Years';
    if (years.length > 5) {
      return `${years.slice(0, 5).join(', ')}, Various`;
    }
    return years.join(', ');
  };

  const getAvailabilityStatus = (quantity: number) => {
    // Audit-compliant: Don't show exact quantities
    if (quantity === 0) return { label: 'Out of Stock', color: 'text-slate-500', available: false };
    if (quantity <= 5) return { label: 'Limited', color: 'text-yellow-400', available: true };
    return { label: 'Available', color: 'text-green-400', available: true };
  };

  const getSeriesDateRange = (series: SeriesData) => {
    const start = new Date(series.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = new Date(series.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} - ${end}`;
  };

  const isSeriesActive = (series: SeriesData) => {
    const now = new Date();
    const start = new Date(series.startDate);
    const end = new Date(series.endDate);
    return now >= start && now <= end;
  };

  return (
    <main className="container py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gold">ShackPack Series Checklist</h1>
          <p className="mt-4 text-lg text-slate-300">
            Select a series and case type to view available coins
          </p>
          <p className="text-base text-slate-400 italic mt-2">
            Possible contents - not all items guaranteed in every pack
          </p>
        </div>

        {/* Series Selector Tabs */}
        <div className="mb-8">
          <div className="border-b border-slate-700">
            <div className="flex flex-wrap gap-2">
              {SERIES.map((series) => (
                <button
                  key={series.id}
                  onClick={() => {
                    setSelectedSeries(series);
                    setSelectedCase(series.cases[0]);
                  }}
                  className={`
                    relative px-6 py-3 font-medium transition-all
                    ${selectedSeries.id === series.id
                      ? 'text-gold border-b-2 border-gold'
                      : 'text-slate-400 hover:text-slate-200'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    {series.name}
                    {isSeriesActive(series) && (
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {getSeriesDateRange(series)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Case Type Tabs */}
        <div className="mb-8">
          <div className="bg-slate-900/40 rounded-lg border border-slate-700 p-4">
            <h2 className="text-xl font-semibold mb-4 text-slate-200">
              Case Types in {selectedSeries.name}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {selectedSeries.cases.map((caseType) => (
                <button
                  key={caseType.id}
                  onClick={() => setSelectedCase(caseType)}
                  className={`
                    p-4 rounded-lg border transition-all text-left
                    ${selectedCase.id === caseType.id
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
                    }
                  `}
                >
                  <div className="font-semibold text-sm mb-1">{caseType.name.replace('ShackPack ', '')}</div>
                  <div className="text-xs opacity-75">{caseType.goldContent}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Case Info */}
        <div className="mb-6 bg-slate-900/40 rounded-lg border border-slate-700 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gold mb-2">{selectedCase.name}</h3>
              <p className="text-slate-300 mb-2">{selectedCase.description}</p>
              <p className="text-sm text-slate-400">10 coins total per case</p>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-blue-300">
                  Historical inventory for {getSeriesDateRange(selectedSeries)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">Last Updated</div>
              <div className="text-slate-300">
                {data?.lastUpdated ? formatDate(data.lastUpdated) : 'Loading...'}
              </div>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => fetchChecklistForCase(selectedCase.id, selectedSeries.startDate, selectedSeries.endDate)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 text-gold rounded-lg hover:bg-gold/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
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
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 rounded-lg border border-red-500/30 bg-red-900/20 p-6 text-center">
            <p className="text-red-400">Error loading checklist: {error}</p>
            <button
              onClick={() => fetchChecklistForCase(selectedCase.id, selectedSeries.startDate, selectedSeries.endDate)}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && !data && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
            <p className="mt-4 text-slate-400">Loading coin inventory...</p>
          </div>
        )}

        {/* Coin Inventory Table */}
        {data && data.checklist && data.checklist.length > 0 && (
          <div className="space-y-4 mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-slate-200">
                Available Coins for {selectedCase.name}
              </h3>
              <div className="text-sm text-slate-400">
                {data.totalTypes} coin types available
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-700">
              <table className="w-full">
                <thead className="bg-slate-800/50 border-b border-slate-700">
                  <tr>
                    <th className="text-left p-4 text-slate-200 font-semibold">Coin Name</th>
                    <th className="text-left p-4 text-slate-200 font-semibold">Years</th>
                    <th className="text-left p-4 text-slate-200 font-semibold">Grading</th>
                    <th className="text-left p-4 text-slate-200 font-semibold">Grades Available</th>
                    <th className="text-center p-4 text-slate-200 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-slate-900/40">
                  {data.checklist.map((coin, index) => {
                    const status = getAvailabilityStatus(coin.totalQuantity);
                    return (
                      <tr
                        key={index}
                        className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-semibold text-gold">{coin.name}</div>
                        </td>
                        <td className="p-4 text-slate-300 text-sm">
                          {formatYears(coin.years)}
                        </td>
                        <td className="p-4 text-slate-300 text-sm">
                          {coin.gradingCompanies && coin.gradingCompanies.length > 0
                            ? coin.gradingCompanies.join(', ')
                            : '—'}
                        </td>
                        <td className="p-4 text-slate-300 text-sm">
                          {coin.gradesAvailable && coin.gradesAvailable.length > 0
                            ? coin.gradesAvailable.join(', ')
                            : '—'}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center gap-1 font-semibold ${status.color}`}>
                            {status.available && (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {data.checklist.map((coin, index) => {
                const status = getAvailabilityStatus(coin.totalQuantity);
                return (
                  <div
                    key={index}
                    className="rounded-lg border border-slate-700 bg-slate-900/40 p-4"
                  >
                    <div className="mb-3">
                      <h4 className="text-lg font-semibold text-gold mb-2">{coin.name}</h4>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Years:</span>
                        <span className="text-slate-300">{formatYears(coin.years)}</span>
                      </div>
                      
                      {coin.gradingCompanies && coin.gradingCompanies.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Grading:</span>
                          <span className="text-slate-300">{coin.gradingCompanies.join(', ')}</span>
                        </div>
                      )}
                      
                      {coin.gradesAvailable && coin.gradesAvailable.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Grades:</span>
                          <span className="text-slate-300">{coin.gradesAvailable.join(', ')}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between pt-2 border-t border-slate-700/50">
                        <span className="text-slate-400">Status:</span>
                        <span className={`inline-flex items-center gap-1 font-semibold ${status.color}`}>
                          {status.available && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {data && (!data.checklist || data.checklist.length === 0) && (
          <div className="text-center py-20 rounded-lg border border-slate-700 bg-slate-900/40">
            <p className="text-slate-400">No coins currently available for this case type.</p>
          </div>
        )}

        {/* Footer Information */}
        <div className="mt-10 space-y-4">
          <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-6">
            <h2 className="text-xl font-semibold mb-3">Important Information</h2>
            <div className="space-y-3 text-slate-300 text-sm">
              <p>
                <strong>Historical Series Data:</strong> Each series shows coins that were available during that specific week. This includes coins in stock at the start, added during the week, or sold during the week.
              </p>
              <p>
                <strong>This checklist shows coins that MAY appear in ShackPack cases.</strong> Specific contents vary by case.
              </p>
              <p>
                <strong>Gold Inventory Varies:</strong> Gold coin availability changes week to week based on shipments and sales. Each series reflects the actual gold coins available during that time period.
              </p>
              <p>
                <strong>Series Archive:</strong> Each series remains available on this page for at least one year from its end date for transparency and audit purposes.
              </p>
              <p>
                <strong>Availability Status:</strong> "Available" indicates coins in stock, "Limited" indicates low inventory. Actual case contents vary.
              </p>
              <p className="text-slate-400">
                Checklist updated automatically from live inventory • No purchase necessary to view
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
