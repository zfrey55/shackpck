/**
 * The product-line tier, shared by /repacks and /checklist.
 *
 * TIER 1 of a three-tier nav: product line -> brand -> (case type | series
 * type) -> dates. Both pages read the same `?line=` param with the same
 * semantics, so a link built on one page means the same thing on the other.
 *
 * Every brand list below is DERIVED from catalog content — a brand appears on
 * a line only if it actually has entries for that line. Nothing here is a
 * hardcoded brand array, so adding a pack or a checklist is all it takes for a
 * brand to show up.
 */

import { BRANDS, type Brand, type BrandId } from '@/lib/brands';
import { REPACK_CATALOG } from '@/lib/repack-catalog';
import { CARD_REPACK_CATALOG } from '@/lib/card-repack-catalog';

export type ProductLine = 'coins' | 'sports' | 'pokemon';

export const PRODUCT_LINES: { id: ProductLine; label: string }[] = [
  { id: 'coins', label: 'Coins' },
  { id: 'sports', label: 'Sports Cards' },
  { id: 'pokemon', label: 'Pokemon Cards' },
];

/**
 * Catalog `category` -> product line.
 *
 * The category on a catalog entry is the ONLY place the line is recorded, so
 * this tiny table is the bridge. It maps values, not brands: the brand lists
 * below are still derived from which entries actually carry each category.
 *
 * 'Trading Cards' is Komodo Rips' category and maps to the Pokemon line. The
 * catalog value is deliberately left as-is rather than renamed.
 */
const LINE_FOR_CATEGORY: Record<string, ProductLine> = {
  Coins: 'coins',
  'Sports Cards': 'sports',
  'Trading Cards': 'pokemon',
};

/**
 * Parse `?line=`.
 *
 * BACK-COMPAT: the legacy value 'cards' predates the sports/pokemon split and
 * resolves to 'sports', which is what every 'cards' link ever pointed at. It
 * is read forever and never written back — the canonical value is 'sports'.
 * Anything unrecognized, absent or empty means coins.
 */
export function parseProductLine(raw: string | null | undefined): ProductLine {
  if (raw === 'cards') return 'sports';
  const found = PRODUCT_LINES.find((l) => l.id === raw);
  return found ? found.id : 'coins';
}

/**
 * The `?line=` value to write, or null to omit the param entirely.
 * Coins is the default and stays out of the URL, exactly as before.
 */
export function lineParamValue(line: ProductLine): string | null {
  return line === 'coins' ? null : line;
}

/** Apply the line to a URLSearchParams, dropping the legacy alias. */
export function writeLineParam(p: URLSearchParams, line: ProductLine): void {
  const value = lineParamValue(line);
  if (value) p.set('line', value);
  else p.delete('line');
}

/** The line a single catalog category belongs to; unknown categories are coins. */
export function lineForCategory(category: string): ProductLine {
  return LINE_FOR_CATEGORY[category] ?? 'coins';
}

/** Every catalog entry, coin and card alike. */
const ALL_PACKS = [...REPACK_CATALOG, ...CARD_REPACK_CATALOG];

/** Pack tiles on one line, derived from each entry's own category. */
export function packsForLine(line: ProductLine) {
  return ALL_PACKS.filter((p) => lineForCategory(p.category) === line);
}

/** Pack tiles on one line for one brand. */
export function packsForLineAndBrand(line: ProductLine, brandId: BrandId) {
  return packsForLine(line).filter((p) => p.brand === brandId);
}

/**
 * Brands with pack tiles on one line, in BRANDS tab order.
 *
 * Derived from the entries present, so a brand can never open on an empty
 * grid and a brand with no tiles on a line simply has no tab there.
 */
export function packBrandsForLine(line: ProductLine): Brand[] {
  const present = new Set(packsForLine(line).map((p) => p.brand));
  return BRANDS.filter((b) => present.has(b.id));
}

/**
 * Which card line a brand's CHECKLIST content belongs to.
 *
 * The card checklist model carries no category, so the line is taken from the
 * brand's pack tiles — the only place it is recorded. A brand with Pokemon
 * tiles and no sports tiles is a Pokemon brand; everything else defaults to
 * sports, so a card-checklist brand with no tiles at all still gets a home
 * rather than disappearing.
 */
export function cardLineForBrand(brandId: BrandId): ProductLine {
  const pokemon = packsForLineAndBrand('pokemon', brandId).length;
  const sports = packsForLineAndBrand('sports', brandId).length;
  return pokemon > 0 && sports === 0 ? 'pokemon' : 'sports';
}
