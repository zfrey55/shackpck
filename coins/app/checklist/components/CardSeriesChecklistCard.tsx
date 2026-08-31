import type { CardEntry, CardSeries } from '@/lib/card-checklist-model';
import { cleanEntryName } from '@/lib/clean-entry-name';

/**
 * The copy above the cabinet sections on a grouped day.
 *
 * A grouped day shows the umbrella's FULL card list first, then each cabinet's
 * slice of that same list underneath. Without a word of explanation a buyer
 * scrolling past the same card twice reads it as two cards, or as a mistake.
 * This says, in one line, that the repeat is the point.
 */
const CABINET_SECTIONS_NOTE =
  'Each section below is a slice of the full checklist above. A card that ' +
  'appears in both places is the same card listed twice — not an extra one.';

/** Cards sorted by value rank, most valuable first. */
function byPosition(cards: CardEntry[]): CardEntry[] {
  return [...cards].sort((a, b) => a.position - b.position);
}

/**
 * The numbered card list. One code path for the umbrella's full list and for
 * every cabinet slice, so the two can never drift in formatting.
 *
 * `position` IS the visible number. This is the deliberate opposite of the
 * coin side, where position is a meaningless slot number and CaseCard numbers
 * by render index instead. Do not harmonize the two.
 *
 * Every entryName goes through cleanEntryName so the archive, the examples and
 * the live API are all formatted by one code path.
 */
function CardList({ cards, idPrefix }: { cards: CardEntry[]; idPrefix: string }) {
  return (
    <ol className="space-y-1.5 text-sm text-slate-300">
      {cards.map((card) => (
        <li
          key={`${idPrefix}-${card.position}`}
          className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-baseline gap-2 border-b border-slate-800/70 py-1.5"
        >
          <span className="text-right font-semibold text-slate-500">
            {card.position}.
          </span>
          <span>{cleanEntryName(card.entryName)}</span>
        </li>
      ))}
    </ol>
  );
}

/**
 * One cabinet, rendered as a section beneath the umbrella's full list.
 *
 * The heading is the cabinet's `seriesType` and nothing else - the contract
 * carries no richer cabinet label, so inventing one here would be inventing
 * data. Cabinets are never numbered: they consume no sequence number, so
 * `seriesName` is not shown.
 */
function CabinetSection({ cabinet }: { cabinet: CardSeries }) {
  const cards = byPosition(cabinet.cards);

  return (
    <section className="rounded-md border border-slate-800 bg-slate-950/40 p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h4 className="text-lg font-semibold text-slate-200">{cabinet.seriesType}</h4>
        <span className="text-xs text-slate-400">
          {cards.length} card{cards.length === 1 ? '' : 's'}
        </span>
      </div>
      <CardList cards={cards} idPrefix={cabinet.id} />
    </section>
  );
}

/**
 * One card series and its checklist.
 *
 * FLAT SERIES - `cabinets` empty, which is every static archive series, every
 * example and every live series until ShackHQ's first grouped upload - render
 * exactly as they always have: header, then the numbered card list. Nothing
 * below the list is emitted at all.
 *
 * GROUPED DAYS - `cabinets` non-empty - render the umbrella's full list first,
 * unchanged, then a note, then one section per cabinet. Cabinets arrive from
 * the adapter already ordered by submittedAt.
 */
export function CardSeriesChecklistCard({ series }: { series: CardSeries }) {
  const cards = byPosition(series.cards);
  const hasCabinets = series.cabinets.length > 0;

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

      <CardList cards={cards} idPrefix={series.id} />

      {hasCabinets && (
        <div className="mt-8 border-t border-slate-700 pt-6">
          <p className="mb-4 text-sm leading-relaxed text-slate-400">
            {CABINET_SECTIONS_NOTE}
          </p>
          <div className="space-y-4">
            {series.cabinets.map((cabinet) => (
              <CabinetSection key={cabinet.id} cabinet={cabinet} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
