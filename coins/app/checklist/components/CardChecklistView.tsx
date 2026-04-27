'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import {
  CARD_CHECKLIST_SERIES,
  type CardChecklistRow,
  type CardSeriesDefinition,
} from '@/lib/card-checklist-data';
import { GradePill } from './GradePill';

function MetaItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-slate-200">{value}</div>
    </div>
  );
}

function TcgRow({ row }: { row: CardChecklistRow }) {
  return (
    <div className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-start gap-3 border-b border-slate-700/80 py-3 text-sm sm:grid-cols-[40px_minmax(0,1fr)_110px_auto] sm:items-center">
      <div className="font-bold text-gold">{row.position}.</div>
      <div className="min-w-0 text-slate-200">
        <span className="text-slate-300">{row.year}</span>
        <span className="text-slate-500"> · </span>
        <span>{row.setName}</span>
        <span className="text-slate-500"> · </span>
        <span className="font-medium">{row.cardName}</span>
        <span className="text-slate-500"> · </span>
        <span className="text-slate-300">{row.variation}</span>
      </div>
      <div className="hidden text-xs text-slate-400 sm:block">
        <span className="rounded bg-slate-800 px-2 py-0.5">{row.language ?? '—'}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">Qty 1</span>
        <GradePill grader={row.grader} grade={row.grade} />
      </div>
    </div>
  );
}

function SportRow({ row }: { row: CardChecklistRow }) {
  return (
    <div className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-start gap-3 border-b border-slate-700/80 py-3 text-sm sm:grid-cols-[40px_110px_minmax(0,1fr)_auto] sm:items-center">
      <div className="font-bold text-gold">{row.position}.</div>
      <div className="hidden text-xs text-slate-300 sm:block">
        <span className="rounded bg-slate-800 px-2 py-0.5">{row.sport ?? 'Sport'}</span>
      </div>
      <div className="min-w-0 text-slate-200">
        <span className="text-slate-300">{row.year}</span>
        <span className="text-slate-500"> · </span>
        <span>{row.setName}</span>
        <span className="text-slate-500"> · </span>
        <span className="font-medium">{row.cardName}</span>
        <span className="text-slate-500"> · </span>
        <span className="text-slate-300">{row.variation}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">Qty 1</span>
        <GradePill grader={row.grader} grade={row.grade} />
      </div>
    </div>
  );
}

function SeriesHeader({ series }: { series: CardSeriesDefinition }) {
  return (
    <div className="mb-6 overflow-hidden rounded-lg border border-slate-700 bg-slate-900/60">
      <div className="grid grid-cols-1 gap-0 md:grid-cols-[260px_minmax(0,1fr)]">
        <div className="relative aspect-[3/4] w-full bg-slate-950 md:aspect-auto md:min-h-[260px]">
          <Image
            src={series.imageSrc}
            alt={series.imageAlt}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 260px"
            priority={false}
          />
        </div>
        <div className="p-5">
          <div className="mb-1 text-xs uppercase tracking-wider text-slate-400">
            {series.category} · {series.layout === 'overview' ? 'Single Show' : 'Multi-Show'}
          </div>
          <h2 className="text-xl font-bold text-gold">{series.productTitle}</h2>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
            <MetaItem label="Brand / Manufacturer" value={series.brand} />
            <MetaItem label="Title of Product" value={series.productTitle} />
            <MetaItem label="Series Name" value={series.seriesName} />
            <MetaItem label="Condition" value={series.condition} />
            <MetaItem label="Quantity per Item" value={series.quantityPerItem} />
            <MetaItem label="Finalization Date" value={series.finalizationDate} />
          </div>
        </div>
      </div>
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

  const isTcg = active.category === 'TCG';

  return (
    <div className="space-y-6">
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

      <SeriesHeader series={active} />

      <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-6 shadow-lg">
        <p className="mb-5 rounded-md border border-slate-700 bg-slate-950/60 p-3 text-sm leading-relaxed text-slate-300">
          {active.finalizationStatement}
        </p>

        {active.layout === 'overview' && active.overviewParagraphs && (
          <div className="mb-6 space-y-3 text-sm text-slate-300">
            {active.overviewParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p className="font-semibold text-slate-200">Example cards (illustrative format):</p>
          </div>
        )}

        {/* Column header */}
        <div className="mb-1 hidden border-b border-slate-700 pb-2 text-xs uppercase tracking-wider text-slate-500 sm:block">
          {isTcg ? (
            <div className="grid grid-cols-[40px_minmax(0,1fr)_110px_auto] gap-3">
              <span>#</span>
              <span>Year · Set · Card Name · Variation</span>
              <span>Language</span>
              <span className="text-right">Qty / Grade</span>
            </div>
          ) : (
            <div className="grid grid-cols-[40px_110px_minmax(0,1fr)_auto] gap-3">
              <span>#</span>
              <span>Sport</span>
              <span>Year · Set · Player · Variation</span>
              <span className="text-right">Qty / Grade</span>
            </div>
          )}
        </div>

        <div className="max-h-[min(70vh,640px)] overflow-y-auto pr-1">
          {active.rows.map((row) =>
            isTcg ? (
              <TcgRow key={`${active.id}-${row.position}`} row={row} />
            ) : (
              <SportRow key={`${active.id}-${row.position}`} row={row} />
            )
          )}
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Grade pills: PSA (blue), BGS (orange), SGC (green). Quantity is 1 for each individual item.
          {isTcg ? ' Language is shown for TCG entries.' : ' Sport is shown for multi-sport entries.'}
        </p>
      </div>
    </div>
  );
}
