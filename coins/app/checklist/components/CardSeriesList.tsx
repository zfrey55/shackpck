import {
  CARD_SERIES_CHECKLISTS,
  type CardSeriesChecklist,
} from "@/lib/card-series-checklist";

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

export default function CardSeriesList() {
  if (CARD_SERIES_CHECKLISTS.length === 0) return null;

  return (
    <div className="space-y-6">
      {CARD_SERIES_CHECKLISTS.map((series) => (
        <SeriesSection key={series.id} series={series} />
      ))}
    </div>
  );
}
