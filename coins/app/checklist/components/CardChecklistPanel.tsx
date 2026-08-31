'use client';

import { getBrand, type BrandId } from '@/lib/brands';
import { PRODUCT_LINES, type ProductLine } from '@/lib/product-lines';
import CardSeriesBrowser from './CardSeriesBrowser';

/**
 * The body of a CARD line on /checklist — sports or pokemon.
 *
 * Split out of ChecklistClient, which owns the coin line and was over the file
 * size limit once a third line was added. This renders everything below the
 * nav; the nav itself stays with the client so all three tiers are assembled
 * in one place.
 */

/** Human label for a line, from the single PRODUCT_LINES source. */
function lineLabel(line: ProductLine): string {
  return PRODUCT_LINES.find((l) => l.id === line)?.label ?? 'Cards';
}

/**
 * Shown when a card line has no checklist content at all.
 *
 * The Pokemon line is in this state today. It is deliberately still
 * SELECTABLE — a visitor who clicks it learns the category exists and is
 * coming, which is the whole point of listing it in tier 1. Hiding the line
 * would leave them with no signal either way.
 */
export function EmptyLinePanel({ line }: { line: ProductLine }) {
  const label = lineLabel(line);
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/40 py-12 text-center">
      <div className="mb-4 text-6xl">🃏</div>
      <h2 className="mb-2 text-2xl font-bold text-slate-200">
        {label} checklists coming soon
      </h2>
      <p className="text-slate-400">
        No {label.toLowerCase()} series have been published yet. Check back soon.
      </p>
    </div>
  );
}

/**
 * ShackPack product context. Scoped to the ShackPack brand because it
 * describes ShackPack's own products. The "these are all EXAMPLES" paragraph
 * that used to live here was REMOVED — it rendered above every card checklist
 * including the frozen archive's real, exact, dated series. The example caveat
 * now lives inside CardSeriesBrowser and shows only for undated content.
 */
function ShackPackCardContext() {
  return (
    <div className="space-y-3 rounded-lg border border-slate-700 bg-slate-900/40 p-4 text-sm leading-relaxed text-slate-300">
      <p className="text-slate-200">
        <strong className="text-gold">About ShackPack Card Products.</strong> ShackPack produces sealed
        multi-sport card products covering Football, Basketball, and Baseball.
      </p>
      <p>
        Manufacturer: G&amp;J Packaging LLLP, identified on the front of every product. Products may include a
        mix of professionally graded cards (PSA, BGS, or SGC) and raw / ungraded cards. Single-show products are
        clearly designated as &ldquo;Single Show Series&rdquo; on the front of the sealed packaging.
      </p>
    </div>
  );
}

export function CardChecklistPanel({
  line,
  brandId,
}: {
  line: ProductLine;
  /** null when the line has no checklist content of any kind. */
  brandId: BrandId | null;
}) {
  if (brandId === null) return <EmptyLinePanel line={line} />;

  return (
    <>
      {brandId === 'shackpack' && <ShackPackCardContext />}
      <CardSeriesBrowser brandId={brandId} />
    </>
  );
}

/** Page heading for a card line. */
export function cardLineHeading(line: ProductLine, brandId: BrandId | null): string {
  if (brandId === null) return `${lineLabel(line)} Checklists`;
  return `${getBrand(brandId).name} ${lineLabel(line)} Checklists`;
}
