import type { CardSeries } from '@/lib/card-checklist-model';
import { cleanEntryName } from '@/lib/clean-entry-name';

/**
 * One card series and its checklist.
 *
 * Cards render sorted by `position` ascending — most valuable first — and the
 * position IS the visible number. This is the deliberate opposite of the coin
 * side, where position is a meaningless slot number and CaseCard numbers by
 * render index instead. Do not harmonize the two.
 *
 * Every entryName goes through cleanEntryName so the archive and the examples
 * are formatted by one code path, and so live API entries (a later commit)
 * arrive formatted the same way.
 */
export function CardSeriesChecklistCard({ series }: { series: CardSeries }) {
  const cards = [...series.cards].sort((a, b) => a.position - b.position);

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-6 shadow-lg">
      <div className="mb-4 border-b border-slate-700 pb-3">
        <h3 className="text-2xl font-bold text-gold">{series.seriesName}</h3>
        <p className="mt-1 text-sm text-slate-300">
          {series.subtitle ? <span>{series.subtitle} · </span> : null}
          <span className="text-slate-400">
            {cards.length} card{cards.length === 1 ? '' : 's'}
          </span>
        </p>
      </div>

      <ol className="space-y-1.5 text-sm text-slate-300">
        {cards.map((card) => (
          <li
            key={`${series.id}-${card.position}`}
            className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-baseline gap-2 border-b border-slate-800/70 py-1.5"
          >
            <span className="text-right font-semibold text-slate-500">
              {card.position}.
            </span>
            <span>{cleanEntryName(card.entryName)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
