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
 * Per-brand product context, rendered above every card checklist.
 *
 * This block used to exist for ShackPack alone, which left Vault Room Breaks
 * and Komodo Rips with no product-type statement and — more importantly — no
 * manufacturer identification anywhere on their pages. Whatnot requires both,
 * so the block is now per-brand and every card brand has an entry.
 *
 * A brand with no entry renders NOTHING rather than a generic block: an empty
 * or guessed product description is worse than none, and the absence is
 * visible the moment a new brand's page is opened.
 *
 * The "these are all EXAMPLES" paragraph that used to live here was REMOVED —
 * it rendered above every card checklist including real dated series. The
 * example caveat now lives in CardSeriesChecklistCard and shows per series.
 */
const BRAND_CONTEXT: Partial<Record<BrandId, { heading: string; body: string }>> = {
  shackpack: {
    heading: 'About ShackPack Card Products.',
    body: 'ShackPack produces sealed multi-sport card products covering Football, Basketball, and Baseball.',
  },
  'vault-room-breaks': {
    heading: 'About Vault Room Breaks.',
    body: 'Vault Room Breaks are sealed single show multi-sport card sets.',
  },
  'komodo-rips': {
    heading: 'About Komodo Rips.',
    body: 'Komodo Rips are sealed single show Pokemon card products.',
  },
};

/**
 * Second paragraph, identical for every brand.
 *
 * Graders are PSA / BGS / SGC across all three: the Komodo Pokemon entries use
 * PSA exclusively (16 of 16), so there is no CGC product to name.
 */
const MANUFACTURER_PARAGRAPH =
  'Manufacturer: Shackpack (G & J Packaging LLLP), identified on the front of ' +
  'every product. Products may include a mix of professionally graded cards ' +
  '(PSA, BGS, or SGC) and raw / ungraded cards. Single-show products are ' +
  'clearly designated as "Single Show Series" on the front of the sealed ' +
  'packaging.';

function BrandCardContext({ brandId }: { brandId: BrandId }) {
  const context = BRAND_CONTEXT[brandId];
  if (!context) return null;

  return (
    <div className="space-y-3 rounded-lg border border-slate-700 bg-slate-900/40 p-4 text-sm leading-relaxed text-slate-300">
      <p className="text-slate-200">
        <strong className="text-gold">{context.heading}</strong> {context.body}
      </p>
      <p>{MANUFACTURER_PARAGRAPH}</p>
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
      <BrandCardContext brandId={brandId} />
      <CardSeriesBrowser brandId={brandId} />
    </>
  );
}

/** Page heading for a card line. */
export function cardLineHeading(line: ProductLine, brandId: BrandId | null): string {
  if (brandId === null) return `${lineLabel(line)} Checklists`;
  return `${getBrand(brandId).name} ${lineLabel(line)} Checklists`;
}
