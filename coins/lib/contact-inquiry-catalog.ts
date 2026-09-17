/**
 * Catalog-derived data for the contact form. SERVER-SIDE: the /contact page
 * passes the result to the client form as props, and the API route and email
 * use it to validate and name products.
 *
 * Products are the PURCHASABLE catalog entries per line, derived from the
 * catalogs through lineForCategory — never a hardcoded list.
 */

import type { ProductLine } from '@/lib/product-lines';
import { packsForLine } from '@/lib/product-lines';
import { isPurchasableBrand } from '@/lib/purchasable-brands';
import {
  CUSTOM_PRODUCT,
  INQUIRY_LINES,
  RECOMMEND_PRODUCT,
  SPECIAL_PRODUCT_LABELS,
  type ProductsByLine,
} from '@/lib/contact-inquiry';

export function purchasableProductsByLine(): ProductsByLine {
  const out = {} as ProductsByLine;
  for (const line of INQUIRY_LINES) {
    out[line] = packsForLine(line)
      .filter((p) => isPurchasableBrand(p.brand))
      .map((p) => ({ id: p.id, name: p.name }));
  }
  return out;
}

/**
 * The product values a line accepts: its catalog ids plus "recommend", or only
 * "custom" when the line has no purchasable products.
 */
export function allowedProductValues(line: ProductLine, byLine: ProductsByLine): Set<string> {
  const ids = byLine[line].map((p) => p.id);
  return new Set(ids.length > 0 ? [...ids, RECOMMEND_PRODUCT] : [CUSTOM_PRODUCT]);
}

/** Which line a purchasable catalog id belongs to, or null. */
export function lineForProductId(id: string, byLine: ProductsByLine): ProductLine | null {
  return INQUIRY_LINES.find((line) => byLine[line].some((p) => p.id === id)) ?? null;
}

/** Display name for a product value: catalog name, special label, or the raw value. */
export function productDisplayName(value: string, byLine: ProductsByLine): string {
  if (SPECIAL_PRODUCT_LABELS[value]) return SPECIAL_PRODUCT_LABELS[value];
  for (const line of INQUIRY_LINES) {
    const found = byLine[line].find((p) => p.id === value);
    if (found) return found.name;
  }
  return value;
}
