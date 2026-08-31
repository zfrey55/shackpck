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
  | 'lincoln-reserve'
  | 'blue-collar-bullion'
  | 'cobra-coin'
  | 'golden-emu'
  | 'juicebox-bullion'
  | 'one-nasty-coin'
  | 'vault-room-breaks'
  | 'bullion-bureau'
  | 'let-it-ride'
  | 'black-mountain'
  | 'komodo-rips'
  | 'pop1-pokeshop';

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
    tagline: 'Premium certified coin & sports card repacks',
    isDefault: true,
    hasCards: true,
    caseTypePrefixes: [],
  },
  {
    id: 'coinwave',
    name: 'Coinwave',
    tagline: 'Premium certified coin repacks',
    caseTypePrefixes: ['coinwave'],
  },
  {
    id: 'fortune-forge',
    name: 'Fortune Forge',
    tagline: 'Premium certified coin repacks',
    caseTypePrefixes: ['fortuneforge', 'fortune-forge'],
  },
  {
    id: 'bald-bunny',
    name: 'Bald Bunny',
    tagline: 'Premium certified coin repacks',
    caseTypePrefixes: ['baldbunny', 'bald-bunny'],
  },
  {
    id: 'lincoln-reserve',
    name: 'Lincoln Reserve',
    tagline: 'Premium certified coin repacks',
    caseTypePrefixes: ['lincolnreserve', 'lincoln-reserve'],
  },
  {
    id: 'blue-collar-bullion',
    name: 'Blue Collar Bullion',
    tagline: 'Premium certified coin repacks',
    // 'golden-girl' is the product-named caseType (e.g. "Golden Girl") that
    // belongs to this brand even though it doesn't carry the brand name.
    caseTypePrefixes: ['bluecollarbullion', 'blue-collar-bullion', 'golden-girl', 'goldengirl'],
  },
  {
    id: 'cobra-coin',
    name: 'Cobra Coin',
    tagline: 'Premium certified coin repacks',
    caseTypePrefixes: ['cobracoin', 'cobra-coin'],
  },
  {
    id: 'golden-emu',
    name: 'Golden Emu',
    tagline: 'Premium certified coin repacks',
    // 'silver-egg...' is the product-named caseType (e.g. "Silver Egg Surprise
    // Pack") that belongs to this brand even though it doesn't carry the name.
    caseTypePrefixes: ['goldenemu', 'golden-emu', 'silver-egg', 'silveregg'],
  },
  {
    id: 'juicebox-bullion',
    name: 'Juicebox Bullion',
    tagline: 'Premium certified coin repacks',
    // The '*-squeeze' entries are product-named caseTypes (e.g. "Full Squeeze")
    // that belong to this brand even though they don't carry the brand name —
    // same pattern as 'golden-girl' / 'silver-egg' above. Hyphenated because
    // normalizeChecklistCaseTypeKey turns "full squeeze" into "full-squeeze".
    caseTypePrefixes: [
      'juicebox',
      'juiceboxbullion',
      'juicebox-bullion',
      'full-squeeze',
      'single-squeeze',
      'double-squeeze',
    ],
  },
  {
    id: 'one-nasty-coin',
    name: 'One Nasty Coin',
    tagline: 'Premium certified coin repacks',
    caseTypePrefixes: ['onenastycoin', 'one-nasty-coin'],
  },
  {
    id: 'vault-room-breaks',
    name: 'Vault Room Breaks',
    tagline: 'Premium sports card repacks',
    // The only non-ShackPack brand with card products; its prefixes are listed
    // for parity with the coin brands, but no vaultroombreaks-* coin caseType
    // exists in the inventory today.
    hasCards: true,
    caseTypePrefixes: ['vaultroombreaks', 'vault-room-breaks'],
  },
  {
    id: 'bullion-bureau',
    name: 'Bullion Bureau',
    tagline: 'Premium certified coin repacks',
    // The eight product-named caseTypes are Bullion Bureau's OWN line and
    // carry no brand name, same pattern as 'golden-girl' (Blue Collar
    // Bullion), 'silver-egg' (Golden Emu) and the '*-squeeze' entries
    // (Juicebox). Hyphenated because normalizeChecklistCaseTypeKey turns
    // "gold marshal" into "gold-marshal".
    //
    // Bullion Bureau also BUYS ShackPack product in volume — flex, aura,
    // expo, currencyclash, ignite, summit, unleashed, deluxe, pinnacle,
    // eclipse, radiant, ascension, 973 cases of it. Those caseTypes are
    // deliberately NOT listed: they are ShackPack products that Bullion
    // Bureau happens to have bought, and they must keep grouping under
    // ShackPack. Only the eight below are theirs to own.
    //
    // 'classified' is the risky one. Prefix matching is startsWith, so a
    // future product named "Classified <anything>" from ANY brand without an
    // earlier-matching prefix would be captured here. Verified against all
    // 289 available dates at the time of writing: no caseType in the
    // inventory starts with it, or with six of the other seven — only
    // 'gold marshal' (28 cases, all Bullion Bureau) matches today.
    caseTypePrefixes: [
      'bullionbureau',
      'bullion-bureau',
      'classified',
      'directors-vault',
      'executive-reserve',
      'gold-marshal',
      'noble-bureau',
      'platinum-command',
      'silver-sheriff',
      'treasury-reserve',
    ],
  },
  {
    id: 'let-it-ride',
    name: 'Let It Ride',
    tagline: 'Premium certified coin repacks',
    caseTypePrefixes: ['letitride', 'let-it-ride'],
  },
  {
    id: 'black-mountain',
    name: 'Black Mountain Coins & Stamps',
    tagline: 'Premium certified coin repacks',
    caseTypePrefixes: ['blackmountain', 'black-mountain'],
  },
  {
    id: 'komodo-rips',
    name: 'Komodo Rips',
    tagline: 'Premium trading card repacks',
    hasCards: true,
    // 'bcb' is listed alongside the komodo prefixes because the pack art
    // arrived under that prefix and ShackHQ may stamp a future live series
    // either way. Neither prefix matches any caseType in the inventory today
    // (checked across all 289 available dates), so both are inert until one
    // does.
    caseTypePrefixes: ['komodo', 'komodo-rips', 'bcb'],
  },
  {
    // COMING SOON — no artwork, so no pack tiles and no /repacks tab yet. The
    // brand is defined so the id is reserved and card series stamped with this
    // customer can route the moment tiles land.
    id: 'pop1-pokeshop',
    name: 'Pop1 Pokeshop',
    tagline: 'Premium trading card repacks',
    hasCards: true,
    caseTypePrefixes: ['pop1', 'pop1-pokeshop'],
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
