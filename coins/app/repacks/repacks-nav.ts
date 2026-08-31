import { BRANDS, type Brand, type BrandId } from '@/lib/brands';
import { CUSTOMER_BUCKET_LABELS } from '@/lib/customer-attribution';
import { packBrandsForLine, type ProductLine } from '@/lib/product-lines';

/**
 * TIER 2 derivation for /repacks.
 *
 * Split out of RepacksClient so that file stays small and so the bucket split
 * is testable as plain data.
 *
 * THE FEATURED BUCKETS ARE NOT LISTED HERE. They come from
 * CUSTOMER_BUCKET_LABELS in lib/customer-attribution — the same source
 * /checklist's CustomerNav uses — so the two pages promote exactly the same
 * brands to the top row and adding a third featured customer is a one-line
 * edit there, not here.
 */

/** Brand ids that get their own top-row tab, in CUSTOMER_BUCKET_LABELS order. */
const FEATURED_BRAND_IDS = Object.keys(CUSTOMER_BUCKET_LABELS) as BrandId[];

export type LineBrands = {
  /** Top row: the featured brands present on this line, then 'Other'. */
  featured: Brand[];
  /** Second row, revealed when 'Other' is selected. */
  other: Brand[];
  /** Everything on the line, featured and other alike. */
  all: Brand[];
  /** True when the line uses the Other bucket at all. */
  hasOther: boolean;
};

/**
 * Split one line's brands into the featured top row and the "Other" bucket.
 *
 * BUCKETING IS THE COIN LINE ONLY. Coins has thirteen brands and needs the
 * long tail folded away; the card lines have two and one, and hiding either
 * behind an "Other" click would be worse than listing it. So card lines return
 * every brand flat in `featured` with no bucket — which also matches how
 * /checklist renders its card tier.
 *
 * Within the coin line the split is derived entirely from which brands
 * actually have tiles, so a featured brand with nothing on the line simply
 * does not appear on it.
 */
export function brandsForLine(line: ProductLine): LineBrands {
  const all = packBrandsForLine(line);
  if (line !== 'coins') {
    return { featured: all, other: [], all, hasOther: false };
  }
  const featuredIds = FEATURED_BRAND_IDS.filter((id) => all.some((b) => b.id === id));
  const featured = featuredIds
    .map((id) => all.find((b) => b.id === id)!)
    .filter(Boolean);
  const other = all.filter((b) => !featuredIds.includes(b.id));
  return { featured, other, all, hasOther: other.length > 0 };
}

/** The bucket a brand sits in on a line: a featured id, or 'other'. */
export function bucketForBrand(line: ProductLine, brandId: BrandId): string {
  const { featured } = brandsForLine(line);
  return featured.some((b) => b.id === brandId) ? brandId : 'other';
}

/**
 * Resolve a requested brand against a line.
 *
 * Clamps to the line's first brand when the requested one has no tiles there,
 * so switching lines can never strand the grid on an empty brand. Returns null
 * only when the line has no brands at all.
 */
export function resolveBrandForLine(
  line: ProductLine,
  requested: BrandId | null | undefined
): BrandId | null {
  const { all } = brandsForLine(line);
  return all.find((b) => b.id === requested)?.id ?? all[0]?.id ?? null;
}

/** Every brand on any line, for a page-level fallback. */
export const ANY_BRAND: Brand = BRANDS[0];
