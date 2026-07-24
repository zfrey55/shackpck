'use client';

import { useState } from 'react';
import {
  groupCardSeriesByDate,
  type CardSeriesChecklist,
} from '@/lib/card-series-checklist';
import { CardChecklistView } from './CardChecklistView';

const buttonClasses = `
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

function SeriesSection({ series }: { series: CardSeriesChecklist }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-6 shadow-lg">
      <div className="mb-4 border-b border-slate-700 pb-3">
        <h2 className="text-2xl font-bold text-gold">{series.title}</h2>
        <p className="mt-1 text-sm text-slate-300">
          {series.subtitle ? <span>{series.subtitle} · </span> : null}
          <span className="text-slate-400">{series.cards.length} cards</span>
        </p>
      </div>

      <ol className="space-y-1.5 text-sm text-slate-300">
        {series.cards.map((card, index) => (
          <li
            key={`${series.id}-${index}`}
            className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-baseline gap-2 border-b border-slate-800/70 py-1.5"
          >
            <span className="text-right font-semibold text-slate-500">
              {index + 1}.
            </span>
            <span>{card}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function CardSeriesBrowser() {
  const [selected, setSelected] = useState<'examples' | string | null>(null);
  const dateGroups = groupCardSeriesByDate();

  if (selected === null) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-slate-200 mb-4 text-center">
          Select a Checklist
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button onClick={() => setSelected('examples')} className={buttonClasses}>
            <div className="text-lg font-bold mb-2">Example Checklists</div>
            <div className="text-sm opacity-75">
              Fusion, Nova &amp; Select product examples
            </div>
          </button>
          {dateGroups.map((group, index) => (
            <button
              key={group.date}
              onClick={() => setSelected(group.date)}
              className={buttonClasses}
            >
              <div className="text-lg font-bold mb-2">{formatDisplayDate(group.date)}</div>
              <div className="text-sm opacity-75">
                {group.series.length} series checklist{group.series.length !== 1 ? 's' : ''}
              </div>
              {index === 0 && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Latest
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const backButton = (
    <button
      onClick={() => setSelected(null)}
      className="text-gold hover:text-gold/80 transition-colors flex items-center gap-2 mb-6"
    >
      ← Back to Checklist Selection
    </button>
  );

  if (selected === 'examples') {
    return (
      <div>
        {backButton}
        <CardChecklistView />
      </div>
    );
  }

  const group = dateGroups.find((g) => g.date === selected);

  return (
    <div>
      {backButton}
      <h2 className="mb-4 text-2xl font-bold text-gold">
        Series Checklists — {formatDisplayDate(selected)}
      </h2>
      <div className="space-y-6">
        {group ? (
          group.series.map((series) => (
            <SeriesSection key={series.id} series={series} />
          ))
        ) : (
          <p className="text-slate-400">No checklists found for this date.</p>
        )}
      </div>
    </div>
  );
}
