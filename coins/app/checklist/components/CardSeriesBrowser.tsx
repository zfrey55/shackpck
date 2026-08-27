'use client';

import { useEffect, useMemo, useState } from 'react';
import type { BrandId } from '@/lib/brands';
import {
  EXAMPLE_DATE_LABEL,
  EXAMPLE_SERIES_TYPE,
  countSeriesForType,
  getDatesForSeriesType,
  getSeriesFor,
  getSeriesTypesForBrand,
} from '@/lib/card-checklist-model';
import { useCardApiSeries } from '../useCardApiSeries';
import { CARD_REPACK_CHECKLIST_DISCLAIMER } from '@/lib/card-repack-catalog';
import { CardSeriesChecklistCard } from './CardSeriesChecklistCard';

const groupButtonClasses = `
  relative p-6 rounded-lg border-2 font-semibold transition-all text-left
  bg-slate-800/50 text-slate-300 border-slate-600 hover:border-gold hover:text-gold
`;

function formatDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function shortDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * The example disclaimer. Rendered ONLY for undated content.
 *
 * It used to sit above the whole Cards tab, which meant it also covered the
 * frozen archive's exact, dated, real checklists — telling customers that a
 * real published series "will be different from the examples shown". Scoping
 * it to seriesDate === null is the fix. The string itself is the shared
 * constant, never a second copy.
 */
function ExampleDisclaimer() {
  return (
    <div className="mb-5 rounded-md border border-amber-600/60 bg-amber-900/20 p-3 text-sm leading-relaxed text-amber-100">
      <strong>EXAMPLE CHECKLIST — NOT A FINALIZED SERIES.</strong>{' '}
      {CARD_REPACK_CHECKLIST_DISCLAIMER}
    </div>
  );
}

/**
 * Subtitle text for a group button: "13 series", "1 series", "3 examples".
 *
 * "series" is INVARIANT — singular and plural are the same word — so it is
 * never suffixed, at any count. The old shared `count === 1 ? '' : 's'` tail
 * pluralized both nouns and rendered "2 seriess". "example" does inflect, so
 * it keeps its plural.
 */
export function groupCountLabel(count: number, isExample: boolean): string {
  if (!isExample) return `${count} series`;
  return `${count} ${count === 1 ? 'example' : 'examples'}`;
}

/** Date row for one series type. Undated content shows a "Sample" button. */
function DateButtons({
  dates,
  selected,
  onSelect,
}: {
  dates: (string | null)[];
  selected: string | null;
  onSelect: (date: string | null) => void;
}) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {dates.map((date, index) => {
        const active = date === selected;
        return (
          <button
            key={date ?? 'sample'}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(date)}
            className={`relative rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-colors ${
              active
                ? 'border-gold bg-gold text-black'
                : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:border-gold hover:text-gold'
            }`}
          >
            {date === null ? EXAMPLE_DATE_LABEL : shortDate(date)}
            {date !== null && index === 0 && !active && (
              <span className="absolute -right-2 -top-2 rounded-full bg-green-500 px-2 py-0.5 text-xs text-white">
                Latest
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Series-type-first card browser: series type -> dates -> checklists.
 *
 * Mirrors the coin flow on the checklist page (case type -> dates -> series)
 * rather than the old date-first grouping. Groups and dates are derived from
 * the data present for the selected brand, never hardcoded.
 */
export default function CardSeriesBrowser({ brandId }: { brandId: BrandId }) {
  // Static archive + examples, with live API series merged on top. Never empty:
  // an API failure leaves exactly the static list.
  const { series, loadCardsFor, loadingDates, loadingCards, error } = useCardApiSeries();

  const seriesTypes = useMemo(
    () => getSeriesTypesForBrand(series, brandId),
    [series, brandId]
  );
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Reset the drill-down whenever the brand changes, so switching tabs never
  // leaves a series type selected that the new brand does not have.
  useEffect(() => {
    setSelectedType(null);
    setSelectedDate(null);
  }, [brandId]);

  const dates = useMemo(
    () => (selectedType ? getDatesForSeriesType(series, brandId, selectedType) : []),
    [series, brandId, selectedType]
  );

  // Keep the selected date valid for the current type; default to the newest.
  useEffect(() => {
    if (!selectedType || dates.length === 0) return;
    setSelectedDate((prev) =>
      dates.some((d) => d === prev) ? prev : dates[0]
    );
  }, [selectedType, dates]);

  const visibleSeries = useMemo(
    () => (selectedType ? getSeriesFor(series, brandId, selectedType, selectedDate) : []),
    [series, brandId, selectedType, selectedDate]
  );

  // Cards are fetched only for what is actually on screen. No-op for static
  // series and for anything already loaded or dropped.
  useEffect(() => {
    if (visibleSeries.length > 0) void loadCardsFor(visibleSeries.map((s) => s.id));
  }, [visibleSeries, loadCardsFor]);

  if (seriesTypes.length === 0) {
    if (loadingDates) {
      return (
        <p className="py-12 text-center text-slate-400">Loading card checklists...</p>
      );
    }
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900/40 py-12 text-center">
        <div className="mb-4 text-6xl">🃏</div>
        <h2 className="mb-2 text-2xl font-bold text-slate-200">
          Card checklists coming soon
        </h2>
        <p className="text-slate-400">
          No published card series are available for this brand yet.
        </p>
      </div>
    );
  }

  if (selectedType === null) {
    return (
      <div>
        <h2 className="mb-4 text-center text-xl font-semibold text-slate-200">
          Select a Series
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {seriesTypes.map((type) => {
            const count = countSeriesForType(series, brandId, type);
            const isExample = type === EXAMPLE_SERIES_TYPE;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={groupButtonClasses}
              >
                <div className="mb-2 text-lg font-bold">{type}</div>
                <div className="text-sm opacity-75">
                  {groupCountLabel(count, isExample)}
                </div>
                {isExample && (
                  <span className="absolute -right-2 -top-2 rounded-full bg-amber-600 px-2 py-0.5 text-xs text-white">
                    {EXAMPLE_DATE_LABEL}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const isExampleGroup = selectedType === EXAMPLE_SERIES_TYPE;

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setSelectedType(null);
          setSelectedDate(null);
        }}
        className="mb-6 flex items-center gap-2 text-gold transition-colors hover:text-gold/80"
      >
        ← Back to Series Selection
      </button>

      <h2 className="mb-4 text-2xl font-bold text-gold">{selectedType}</h2>

      <DateButtons dates={dates} selected={selectedDate} onSelect={setSelectedDate} />

      {/*
        A live-API failure is reported ABOVE the content, never in place of it:
        the static archive and examples below are already rendered.
      */}
      {error && (
        <div className="mb-5 rounded-md border border-slate-600 bg-slate-800/50 p-3 text-sm text-slate-300">
          Live series are temporarily unavailable. Published checklists below are
          unaffected.
        </div>
      )}

      {loadingCards && (
        <p className="mb-4 text-sm text-slate-400">Loading checklist...</p>
      )}

      {/* Undated content only. Real dated series never carry this. */}
      {isExampleGroup && <ExampleDisclaimer />}

      {selectedDate !== null && (
        <p className="mb-4 text-slate-300">{formatDisplayDate(selectedDate)}</p>
      )}

      <div className="space-y-6">
        {visibleSeries.length > 0 ? (
          visibleSeries.map((series) => (
            <CardSeriesChecklistCard key={series.id} series={series} />
          ))
        ) : (
          <p className="text-slate-400">No checklists found for this selection.</p>
        )}
      </div>
    </div>
  );
}
