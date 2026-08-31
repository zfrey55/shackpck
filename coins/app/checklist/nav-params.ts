import { STATIC_CARD_SERIES, getCardBrands } from '@/lib/card-checklist-model';
import type { BrandId } from '@/lib/brands';
import { cardLineForBrand, type ProductLine } from '@/lib/product-lines';

/**
 * URL contract for /checklist, and the per-line card brand lists.
 *
 *   ?customer=<slug>  unchanged - the coin-line customer. Existing shareable
 *                     links keep working exactly as before.
 *   ?line=            coins|sports|pokemon, absent means coins. The legacy
 *                     value 'cards' still resolves to sports - see
 *                     parseProductLine in lib/product-lines. Same param and
 *                     semantics as /repacks, so the two pages behave
 *                     identically.
 *   ?cardBrand=<id>   the card-line brand. A separate param on purpose:
 *                     ?customer= holds customer slugs and is not repurposed to
 *                     carry brand ids, even though 'shackpack' exists in both.
 *
 * Split out of ChecklistClient to keep that file under the size limit.
 */

/**
 * Brands with card CHECKLIST content, whatever the line.
 *
 * Derived from the STATIC base only, so the tab row is stable and needs no
 * fetch to render. Live API series merge in below this, inside
 * CardSeriesBrowser - so an API series lands under an existing brand tab
 * automatically, but a brand whose ONLY content is API-side would need this
 * list lifted onto the hook. Not a live gap: every card brand today
 * (ShackPack, Vault Room Breaks) has static content.
 */
export const CARD_CHECKLIST_BRANDS = getCardBrands(STATIC_CARD_SERIES);

/**
 * Card-checklist brands on ONE line.
 *
 * Derived, never listed: a brand shows on the Pokemon line only if it really
 * has Pokemon content. Today that returns [] for pokemon, which the page
 * renders as an explicit empty state rather than hiding the line.
 */
export function cardBrandsForLine(line: ProductLine): BrandId[] {
  if (line === 'coins') return [];
  return CARD_CHECKLIST_BRANDS.filter((id) => cardLineForBrand(id) === line);
}

/** First brand on a line, or null when the line has no checklist content. */
export function defaultCardBrandForLine(line: ProductLine): BrandId | null {
  return cardBrandsForLine(line)[0] ?? null;
}

/**
 * Resolve ?cardBrand= against the brands available on the CURRENT line, so
 * switching lines can never strand the page on a brand that has nothing there.
 * Returns null when the line itself has no content.
 */
export function parseCardBrand(
  raw: string | null | undefined,
  line: ProductLine
): BrandId | null {
  const available = cardBrandsForLine(line);
  return available.find((id) => id === raw) ?? available[0] ?? null;
}
