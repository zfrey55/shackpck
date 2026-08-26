import { STATIC_CARD_SERIES, getCardBrands } from '@/lib/card-checklist-model';
import type { BrandId } from '@/lib/brands';
import type { ProductLine } from '@/components/CoinsCardsToggle';

/**
 * URL contract for /checklist, and the Cards-line brand list.
 *
 *   ?customer=<slug>  unchanged - the coin-line customer. Existing shareable
 *                     links keep working exactly as before.
 *   ?line=coins|cards absent means coins. Same param and semantics as
 *                     /repacks, so the two pages behave identically.
 *   ?cardBrand=<id>   the Cards-line brand. A separate param on purpose:
 *                     ?customer= holds customer slugs and is not repurposed to
 *                     carry brand ids, even though 'shackpack' exists in both.
 *
 * Split out of ChecklistClient to keep that file under the size limit.
 */

/**
 * Brands with card content, for the Cards-line tab row.
 *
 * Derived from the STATIC base only, so the tab row is stable and needs no
 * fetch to render. Live API series merge in below this, inside
 * CardSeriesBrowser - so an API series lands under an existing brand tab
 * automatically, but a brand whose ONLY content is API-side would need this
 * list lifted onto the hook. Not a live gap: every card brand today
 * (ShackPack, Vault Room Breaks) has static content.
 */
export const CARD_BRANDS = getCardBrands(STATIC_CARD_SERIES);

export const DEFAULT_CARD_BRAND: BrandId = CARD_BRANDS[0] ?? 'shackpack';

export function parseLine(raw: string | null | undefined): ProductLine {
  return raw === 'cards' ? 'cards' : 'coins';
}

export function parseCardBrand(raw: string | null | undefined): BrandId {
  const found = CARD_BRANDS.find((id) => id === raw);
  return found ?? DEFAULT_CARD_BRAND;
}
