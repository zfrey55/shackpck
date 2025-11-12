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
  totalTypes: number;
  totalCoins: number;
  checklist: CoinItem[];
}

const CASE_DESCRIPTIONS = [
  {
    name: "ShackPack",
    description: "Contains one 1/10 oz gold coin and 9 varied silver coins"
  },
  {
    name: "ShackPack Deluxe",
    description: "Contains two 1/10 oz gold coins and 8 varied silver coins"
  },
  {
    name: "ShackPack Xtreme",
    description: "Contains one 1/4 oz gold coin and 9 varied silver coins"
  },
  {
    name: "ShackPack Unleashed",
    description: "Contains two 1/4 oz gold coins and 8 varied silver coins"
  },
  {
    name: "ShackPack Resurgence",
    description: "Contains one 1/2 oz gold coin and 9 varied silver coins"
  },
  {
    name: "ShackPack Transcendent",
    description: "Contains one 1 oz gold coin and 9 varied silver coins"
  },
  {
    name: "ShackPack Ignite",
    description: "Contains one 1/4 oz platinum coin and 9 varied silver coins"
  }
];

export default function ChecklistPage() {
  const [data, setData] = useState<ChecklistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchChecklist = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        'https://us-central1-coin-inventory-8b79d.cloudfunctions.net/getChecklist?orgId=coin-shack&filter=shackpack'
      );
      if (!response.ok) {
        throw new Error('Failed to fetch checklist data');
      }
      const jsonData = await response.json();
      setData(jsonData);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklist();
    // Auto-refresh every 24 hours
    const interval = setInterval(fetchChecklist, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <main className="container py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gold">ShackPack Series Checklist</h1>
          <div className="mt-4 space-y-2">
            <p className="text-lg text-slate-300">
              {data?.lastUpdated ? `Last Updated: ${formatDate(data.lastUpdated)}` : 'Loading...'}
            </p>
            <p className="text-base text-slate-400 italic">
              Possible contents - not all items guaranteed in every pack
            </p>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={fetchChecklist}
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

        {/* Case Descriptions */}
        <div className="mb-10 rounded-lg border border-slate-700 bg-slate-900/40 p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gold">ShackPack Case Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CASE_DESCRIPTIONS.map((caseType) => (
              <div
                key={caseType.name}
                className="border border-slate-700/50 bg-slate-800/30 rounded-lg p-4"
              >
                <h3 className="font-semibold text-lg mb-2">{caseType.name}</h3>
                <p className="text-sm text-slate-300">{caseType.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 rounded-lg border border-red-500/30 bg-red-900/20 p-6 text-center">
            <p className="text-red-400">Error loading checklist: {error}</p>
            <button
              onClick={fetchChecklist}
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
            <p className="mt-4 text-slate-400">Loading checklist data...</p>
          </div>
        )}

        {/* Checklist Grid */}
        {data && data.checklist && data.checklist.length > 0 && (
          <div className="space-y-4 mb-10">
            {data.checklist.map((coin, index) => (
              <div
                key={index}
                className="rounded-lg border border-slate-700 bg-slate-900/40 p-6 shadow-lg hover:border-gold/30 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gold mb-3">{coin.name}</h3>
                    
                    <div className="space-y-2 text-slate-300">
                      <div className="flex items-start gap-2">
                        <span className="text-slate-500">├─</span>
                        <div>
                          <span className="font-medium">Years:</span>{' '}
                          <span className="text-slate-400">{formatYears(coin.years)}</span>
                        </div>
                      </div>
                      
                      {coin.gradingCompanies && coin.gradingCompanies.length > 0 && (
                        <div className="flex items-start gap-2">
                          <span className="text-slate-500">├─</span>
                          <div>
                            <span className="font-medium">Grading:</span>{' '}
                            <span className="text-slate-400">
                              {coin.gradingCompanies.join(', ')}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {coin.gradesAvailable && coin.gradesAvailable.length > 0 && (
                        <div className="flex items-start gap-2">
                          <span className="text-slate-500">├─</span>
                          <div>
                            <span className="font-medium">Grades:</span>{' '}
                            <span className="text-slate-400">
                              {coin.gradesAvailable.join(', ')}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-2">
                        <span className="text-slate-500">└─</span>
                        <div>
                          <span className="font-medium">Status:</span>{' '}
                          {coin.available ? (
                            <span className="inline-flex items-center gap-1 text-green-400">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Available
                            </span>
                          ) : (
                            <span className="text-slate-500">Currently Unavailable</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {data && (!data.checklist || data.checklist.length === 0) && (
          <div className="text-center py-20 rounded-lg border border-slate-700 bg-slate-900/40">
            <p className="text-slate-400">No coins available in the checklist at this time.</p>
          </div>
        )}

        {/* Footer Information */}
        <div className="mt-10 space-y-4">
          <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-6">
            <h2 className="text-xl font-semibold mb-3">Important Information</h2>
            <div className="space-y-3 text-slate-300 text-sm">
              <p>
                <strong>This checklist shows coins that MAY appear in ShackPack cases.</strong> Specific contents vary by case.
              </p>
              <p className="text-slate-400">
                Checklist updated automatically from live inventory
              </p>
              <p className="text-slate-400">
                No purchase necessary to view checklist
              </p>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500">
            Page refreshed: {lastRefresh.toLocaleTimeString()} • Auto-refresh every 24 hours
          </div>
        </div>
      </div>
    </main>
  );
}
