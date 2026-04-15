'use client';

import { useMemo, useState } from 'react';
import {
  CARD_CHECKLIST_SERIES,
  type CardChecklistRow,
} from '@/lib/card-checklist-data';
import { GradePill } from './GradePill';

function RowLine({ row }: { row: CardChecklistRow }) {
  return (
    <div className="flex flex-col gap-2 border-b border-slate-700/80 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0 flex-1 text-slate-200">
        <span className="font-bold text-gold">{row.position}.</span>{' '}
        <span className="text-slate-300">{row.year}</span>{' '}
        <span className="text-slate-400">—</span> {row.setName}{' '}
        <span className="text-slate-400">—</span> {row.cardName}{' '}
        <span className="text-slate-400">—</span>{' '}
        <span className="text-slate-300">{row.variation}</span>
      </div>
      <GradePill grader={row.grader} grade={row.grade} />
    </div>
  );
}

export function CardChecklistView() {
  const [seriesId, setSeriesId] = useState(CARD_CHECKLIST_SERIES[0]?.id ?? 'T-001');

  const active = useMemo(
    () => CARD_CHECKLIST_SERIES.find((s) => s.id === seriesId) ?? CARD_CHECKLIST_SERIES[0],
    [seriesId]
  );

  if (!active) return null;

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-4">
        <label htmlFor="card-series-select" className="mb-2 block text-sm font-medium text-slate-400">
          Series
        </label>
        <select
          id="card-series-select"
          value={seriesId}
          onChange={(e) => setSeriesId(e.target.value)}
          className="w-full max-w-xl rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-slate-200 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        >
          {CARD_CHECKLIST_SERIES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-6 shadow-lg">
        <h2 className="mb-3 text-xl font-bold text-gold">{active.label}</h2>
        <p className="mb-6 text-sm leading-relaxed text-slate-300">{active.finalizationStatement}</p>

        {active.layout === 'overview' && active.overviewParagraphs && (
          <div className="mb-6 space-y-3 text-sm text-slate-300">
            {active.overviewParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p className="font-semibold text-slate-200">Example cards (illustrative format):</p>
          </div>
        )}

        <div className="max-h-[min(70vh,560px)] overflow-y-auto pr-1">
          {active.rows.map((row) => (
            <RowLine key={`${active.id}-${row.position}`} row={row} />
          ))}
        </div>

        {active.layout === 'full' && (
          <p className="mt-4 text-xs text-slate-500">
            Grade pills: PSA (blue), BGS (orange), SGC (green). Row format: Year — Set — Name — Variation.
          </p>
        )}
      </div>
    </div>
  );
}
