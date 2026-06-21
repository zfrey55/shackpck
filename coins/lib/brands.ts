/**
 * Brand / customer model.
 *
 * Each customer (ShackPack + the white-label customers like Coinwave, Fortune
 * Forge, Bald Bunny, Lincoln Reserve) gets its own branded section on the Packs
 * and Checklist pages. Packs are assigned to a brand via the `brand` field on
 * each catalog item (see lib/repack-catalog.ts). Checklists are assigned to a
 * brand by matching the inventory `caseType` against each brand's
 * `caseTypePrefixes` (e.g. every "coinwave-*" series belongs to Coinwave).
 *
 * ShackPack is the default brand: it owns the card products and every coin
 * series that doesn't match another brand's prefixes.
 */

import { normalizeChecklistCaseTypeKey } from '@/lib/checklist-case-labels';

export type BrandId =
  | 'shackpack'
  | 'coinwave'
  | 'fortune-forge'
  | 'bald-bunny'
  | 'lincoln-reserve';

export type Brand = {
  id: BrandId;
  /** Display name / wordmark. */
  name: string;
  /** One-line tagline shown under the brand header. */
  tagline: string;
  /**
   * Optional logo image under /public/images/brands/. When omitted, the brand
   * header renders a styled text wordmark.
   */
  logo?: string;
  /** The landing tab when no brand is selected. Exactly one brand sets this. */
  isDefault?: boolean;
  /** Whether this brand has card products (enables the Coins/Cards sub-toggle). */
  hasCards?: boolean;
  /**
   * Normalized checklist caseType prefixes owned by this brand. ShackPack is the
   * catch-all and intentionally lists none — anything that doesn't match another
   * brand falls back to ShackPack.
   */
  caseTypePrefixes: string[];
};

/** Ordered list — controls tab order. ShackPack is first / default. */
export const BRANDS: Brand[] = [
  {
    id: 'shackpack',
    name: 'ShackPack',
    tagline: 'Premium graded coin & card repacks — every series backed by a published checklist.',
    isDefault: true,
    hasCards: true,
    caseTypePrefixes: [],
  },
  {
    id: 'coinwave',
    name: 'Coinwave',
    tagline: 'Graded gold, platinum & silver repacks — 20 coins per series.',
    caseTypePrefixes: ['coinwave'],
  },
  {
    id: 'fortune-forge',
    name: 'Fortune Forge',
    tagline: 'Forged for the hunt — graded gold & platinum repacks.',
    caseTypePrefixes: ['fortuneforge', 'fortune-forge'],
  },
  {
    id: 'bald-bunny',
    name: 'Bald Bunny',
    tagline: 'Bold, premium graded coin repacks.',
    caseTypePrefixes: ['baldbunny', 'bald-bunny'],
  },
  {
    id: 'lincoln-reserve',
    name: 'Lincoln Reserve',
    tagline: 'Reserve-grade graded coin repacks.',
    caseTypePrefixes: ['lincolnreserve', 'lincoln-reserve'],
  },
];

const BRANDS_BY_ID = new Map<BrandId, Brand>(BRANDS.map((b) => [b.id, b]));

export const DEFAULT_BRAND_ID: BrandId =
  BRANDS.find((b) => b.isDefault)?.id ?? 'shackpack';

export function getBrand(id: string | null | undefined): Brand {
  if (id && BRANDS_BY_ID.has(id as BrandId)) {
    return BRANDS_BY_ID.get(id as BrandId)!;
  }
  return BRANDS_BY_ID.get(DEFAULT_BRAND_ID)!;
}

/** Validate/normalize an arbitrary string into a known BrandId (default fallback). */
export function toBrandId(id: string | null | undefined): BrandId {
  return getBrand(id).id;
}

/**
 * Map an inventory checklist caseType to the brand that owns it. Non-default
 * brands match by normalized prefix; everything else belongs to ShackPack.
 */
export function brandForCaseType(caseType: string): BrandId {
  const key = normalizeChecklistCaseTypeKey(caseType);
  for (const brand of BRANDS) {
    if (brand.id === DEFAULT_BRAND_ID) continue;
    if (brand.caseTypePrefixes.some((prefix) => key.startsWith(prefix))) {
      return brand.id;
    }
  }
  return DEFAULT_BRAND_ID;
}
