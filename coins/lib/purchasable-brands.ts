import type { BrandId } from '@/lib/brands';

/**
 * Brands whose packs we sell.
 *
 * Only ShackPack. Every other brand on the site is a customer's own line that
 * we manufacture for them, so its tiles say "Not available for purchase" and
 * point at custom branding instead — that includes Bullion Bureau, even though
 * it is a featured tab.
 */
export const PURCHASABLE_BRANDS: readonly BrandId[] = ['shackpack'];

export function isPurchasableBrand(brandId: BrandId): boolean {
  return PURCHASABLE_BRANDS.includes(brandId);
}
