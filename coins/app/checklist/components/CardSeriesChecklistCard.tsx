import { exampleNoticeFor, type CardEntry, type CardSeries } from '@/lib/card-checklist-model';
import type { BrandId } from '@/lib/brands';
import { cleanEntryName } from '@/lib/clean-entry-name';
import { seriesFinalizedStatement } from '@/lib/repack-catalog';

/** Finalization dates are stored ISO and shown long-form. */
function formatFinalizedOn(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

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

/**
 * The ILLUSTRATIVE notice — one of the two mutually exclusive example notices
 * (see exampleNoticeFor in lib/card-checklist-model).
 *
 * It deliberately does not tell the reader to consult the checklist: they are
 * reading it. What it must do is say the list is a sample and that a real pack
 * will hold different cards. Both halves matter — "illustrative" alone leaves
 * a buyer free to expect these exact cards.
 *
 * THIS USED TO BE A GROUP-LEVEL BANNER in CardSeriesBrowser, rendered once
 * above every card in the examples group. It moved here so that it and the
 * finalized statement are decided in one place, for one series, by one
 * function. At group level the two could both apply to a finalized example,
 * which said "no pack was built from this list" directly above "this series
 * has been finalized". It also means a group holding both kinds of example —
 * which no brand has today, but nothing prevents — is handled with no extra
 * code path.
 */
const EXAMPLE_CHECKLIST_CAVEAT =
  'The cards below illustrate what a series in this line can look like. ' +
  'No pack was built from this list, and a produced series will contain ' +
  'different cards.';

/**
 * Per-brand overrides of the caveat above.
 *
 * A brand ABSENT from this map gets EXAMPLE_CHECKLIST_CAVEAT — the default is
 * the copy, not a fallback, so adding a brand here is the only way its wording
 * differs and removing it restores the shared text. The component itself is
 * not forked: one notice, one render path, the string chosen by brand.
 *
 * Vault Room Breaks sells through Whatnot, whose policy requires the sample to
 * be named as illustrative and to carry an explicit no-financial-advice line.
 * That is a platform obligation on one customer's listings, not a change of
 * house voice, which is why it is scoped to the brand rather than applied to
 * everyone.
 */
const EXAMPLE_CAVEAT_BY_BRAND: Partial<Record<BrandId, string>> = {
  'vault-room-breaks':
    'Please note: The example checklist for the single show products above is ' +
    'for illustrative purposes only. It reflects the types of multi-sport ' +
    'cards you may hit within each single show brand, not the exact cards ' +
    'included in any specific product. Card values are subjective in nature ' +
    'and may fluctuate significantly. This is not financial advice.',
};

/**
 * THE PREFIX IS PART OF THE DEFAULT COPY, NOT THE FRAME.
 *
 * The shared caveat is a sentence fragment that needs the bold
 * "EXAMPLE CHECKLIST — NOT A FINALIZED SERIES." lead-in to read as a warning.
 * An override is supplied whole — brand-override copy is written to a
 * platform's wording and opens by naming itself ("Please note: The example
 * checklist ... is for illustrative purposes only"), so the lead-in restates
 * it and reads as boilerplate stapled on top.
 *
 * So the prefix renders for the default and is suppressed for an override.
 * One lookup decides both, which is why it is not hidden behind a helper that
 * returns only the string: the presence of an override IS the condition.
 */
function IllustrativeNotice({ brandId }: { brandId: BrandId }) {
  const override = EXAMPLE_CAVEAT_BY_BRAND[brandId];
  return (
    <div className="mb-4 rounded-md border border-amber-600/60 bg-amber-900/20 p-3 text-sm leading-relaxed text-amber-100">
      {override === undefined && (
        <>
          <strong>EXAMPLE CHECKLIST — NOT A FINALIZED SERIES.</strong>{' '}
        </>
      )}
      {override ?? EXAMPLE_CHECKLIST_CAVEAT}
    </div>
  );
}

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
function CardList({
  cards,
  idPrefix,
  verbatim = false,
}: {
  cards: CardEntry[];
  idPrefix: string;
  /** Skip cleanEntryName. Only the TCG examples set this — see CardSeries. */
  verbatim?: boolean;
}) {
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
          <span>{verbatim ? card.entryName : cleanEntryName(card.entryName)}</span>
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
function CabinetSection({
  cabinet,
  verbatim = false,
}: {
  cabinet: CardSeries;
  verbatim?: boolean;
}) {
  const cards = byPosition(cabinet.cards);

  return (
    <section className="rounded-md border border-slate-800 bg-slate-950/40 p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h4 className="text-lg font-semibold text-slate-200">{cabinet.seriesType}</h4>
        <span className="text-xs text-slate-400">
          {cards.length} card{cards.length === 1 ? '' : 's'}
        </span>
      </div>
      <CardList cards={cards} idPrefix={cabinet.id} verbatim={verbatim} />
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
  const verbatim = series.verbatimEntries === true;
  // EXACTLY ONE of the two notices, never both — see exampleNoticeFor.
  const notice = exampleNoticeFor(series);

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

      {notice === 'illustrative' && <IllustrativeNotice brandId={series.brandId} />}

      {/*
        The structure line. Every number in it is DERIVED from the list, never
        stored, so the stated counts and the rows below cannot drift apart.
        Shown only for a finalized series, where the counts are settled facts
        rather than claims.

        An UNDATED series is an example: one sample pack's worth of cards, so
        it states the pack size only. A DATED series is a real produced run:
        the whole series is listed, so it states how that total divides into
        packs. `packSize` divides `cards.length` exactly — asserted in the
        fixtures, not here, because a render is the wrong place to throw.
      */}
      {notice === 'finalized' && (
        <p className="mb-3 text-sm text-slate-400">
          {series.seriesDate === null
            ? `Example checklist. ${cards.length} cards per pack.`
            : series.packSize
              ? `${cards.length / series.packSize} packs of ${series.packSize} cards. ${cards.length} cards total.`
              : `${cards.length} cards total.`}
        </p>
      )}

      <CardList cards={cards} idPrefix={series.id} verbatim={verbatim} />

      {notice === 'finalized' && series.finalizedOn && (
        <p className="mt-4 border-t border-slate-800 pt-3 text-sm leading-relaxed text-slate-400">
          {seriesFinalizedStatement(formatFinalizedOn(series.finalizedOn))}
        </p>
      )}

      {hasCabinets && (
        <div className="mt-8 border-t border-slate-700 pt-6">
          <p className="mb-4 text-sm leading-relaxed text-slate-400">
            {CABINET_SECTIONS_NOTE}
          </p>
          <div className="space-y-4">
            {series.cabinets.map((cabinet) => (
              <CabinetSection key={cabinet.id} cabinet={cabinet} verbatim={verbatim} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
