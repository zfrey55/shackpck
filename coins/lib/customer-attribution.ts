/**
 * Customer attribution for checklist cases.
 *
 * Attribution keys on the inventory API's `customerName` and nothing else —
 * no caseType override, no historical backstop. ShackHQ writes that field from
 * a controlled dropdown, so the canonical roster below is the closed set of
 * customers that get a bucket, a nav entry and a page.
 *
 * Pre-dropdown data used a handful of other spellings. CUSTOMER_NAME_ALIASES
 * folds those into their canonical name, and resolution runs at the START of
 * both customerBucket() and nameToSlug() so old and new records group together.
 *
 * Anything that resolves to neither a canonical name nor an alias routes to the
 * ShackPack bucket — a safe default for stray/garbage values that deliberately
 * does NOT mint a tab for an unrecognized name.
 *
 * This is a DIFFERENT axis from BrandId in lib/brands.ts. Brands answer "whose
 * product line is this?"; customers answer "who was this case built for?".
 * CUSTOMER_PACKS below is the bridge between the two.
 */

import type { BrandId } from '@/lib/brands';

export type CustomerBucket = 'shackpack' | 'bullion-bureau' | 'other';

/** Minimum shape needed to attribute a case: its type and its stamped customer. */
export type AttributableCase = {
  caseType?: string | null;
  customerName?: string | null;
};

/** House / generic. Untagged cases fold in here too. */
export const CANONICAL_HOUSE = 'The Coin Shack';

/** Featured customer — internal, but gets its own bucket. */
export const CANONICAL_BULLION_BUREAU = 'Bullion Bureau';

/** The canonical roster for the 'other' bucket. */
export const CANONICAL_OTHER_CUSTOMERS = [
  'Bald Bunny',
  'Blue Collar Bullion',
  'Cobra Coin',
  'CoinWave LLC',
  'Crazy Deals 123 LLC',
  'Fortune Forge',
  'Golden Emu',
  'Juice Box Bullion',
  'Lincoln Reserve',
  'Numismatic Mu',
] as const;

/**
 * Pre-dropdown API spellings -> canonical ShackHQ buyer name.
 *
 * Matching is punctuation- and case-insensitive (see normalizeKey), so
 * 'CoinWave, LLC' would already fold into 'CoinWave LLC' on normalization
 * alone; it is listed explicitly because it is the only variant actually
 * present in live data (24 cases, most recently 2026-07-31) and the mapping
 * should be visible rather than implicit.
 */
export const CUSTOMER_NAME_ALIASES: Record<string, string> = {
  'Juicebox Bullion': 'Juice Box Bullion',
  'Numismatic MU': 'Numismatic Mu',
  Coinwave: 'CoinWave LLC',
  'CoinWave, LLC': 'CoinWave LLC',
  // ShackHQ's canonical for the Silver Egg product carries the article; ours
  // does not. Normalization strips punctuation and case but never a leading
  // "The" — and must not, since 'The Coin Shack' genuinely needs it.
  'The Golden Emu': 'Golden Emu',
  'Crazy Deals': 'Crazy Deals 123 LLC',
};

/** Additional raw spellings that mean the house bucket. */
const HOUSE_ALIASES = ['Coin Shack'];

/** Lowercase, collapse every non-alphanumeric run to one space, trim. */
function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const CANONICAL_BY_KEY = new Map<string, string>();
for (const name of [
  CANONICAL_HOUSE,
  CANONICAL_BULLION_BUREAU,
  ...CANONICAL_OTHER_CUSTOMERS,
]) {
  CANONICAL_BY_KEY.set(normalizeKey(name), name);
}
for (const [alias, canonical] of Object.entries(CUSTOMER_NAME_ALIASES)) {
  CANONICAL_BY_KEY.set(normalizeKey(alias), canonical);
}
for (const alias of HOUSE_ALIASES) {
  CANONICAL_BY_KEY.set(normalizeKey(alias), CANONICAL_HOUSE);
}

/**
 * Resolve a raw `customerName` to its canonical roster name.
 *
 * Returns null for untagged (null/empty) AND for unrecognized values — both
 * route to the ShackPack bucket, and neither mints a tab.
 */
export function resolveCustomerName(
  customerName: string | null | undefined
): string | null {
  const key = normalizeKey(customerName ?? '');
  if (key === '') return null;
  return CANONICAL_BY_KEY.get(key) ?? null;
}

/** Section headings for the two named buckets. 'other' is listed by name. */
export const CUSTOMER_BUCKET_LABELS: Record<
  Exclude<CustomerBucket, 'other'>,
  string
> = {
  shackpack: 'ShackPack',
  'bullion-bureau': CANONICAL_BULLION_BUREAU,
};

/**
 * Resolve a case to its canonical customer.
 *
 * Keys purely on `customerName` (via the alias map). A branded-caseType override
 * used to sit in front of this, to recover cases stamped 'The Coin Shack' or
 * left untagged. ShackHQ's 2026-08-05 backfill fixed attribution at the source,
 * and a comparison across the last 5 available dates (236 cases) found the
 * override and plain customerName resolving identically on every one — so it was
 * removed rather than left as an inert second code path.
 *
 * Accepts a bare name for callers that only have one (roster listings).
 */
export function resolveCaseCustomer(
  input: AttributableCase | string | null | undefined
): string | null {
  if (input == null || typeof input === 'string') {
    return resolveCustomerName(input);
  }
  return resolveCustomerName(input.customerName);
}

/** Map a case (or a bare customerName) to its attribution bucket. */
export function customerBucket(
  input: AttributableCase | string | null | undefined
): CustomerBucket {
  const canonical = resolveCaseCustomer(input);
  // Untagged or unrecognized -> house. No tab is created for a stray value.
  if (canonical === null) return 'shackpack';
  if (canonical === CANONICAL_BULLION_BUREAU) return 'bullion-bureau';
  if (canonical === CANONICAL_HOUSE) return 'shackpack';
  return 'other';
}

/** URL slug for the whole house bucket. Not derived from any one raw name. */
export const SHACKPACK_SLUG = 'shackpack';

/** Lowercase, collapse every non-alphanumeric run to a single hyphen, trim. */
function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * URL slug for a case's customer, resolved through aliases first so every
 * spelling of one customer shares a single URL:
 * 'Coinwave' and 'CoinWave, LLC' both -> 'coinwave-llc'.
 */
export function nameToSlug(customerName: string | null | undefined): string {
  const canonical = resolveCustomerName(customerName);
  if (canonical === null || canonical === CANONICAL_HOUSE) return SHACKPACK_SLUG;
  return slugify(canonical);
}

/**
 * URL slug for a whole case, using the hybrid resolution — so a branded case
 * lands on its real customer even when stamped 'The Coin Shack' or untagged.
 */
export function caseToSlug(
  input: AttributableCase | string | null | undefined
): string {
  const canonical = resolveCaseCustomer(input);
  if (canonical === null || canonical === CANONICAL_HOUSE) return SHACKPACK_SLUG;
  return slugify(canonical);
}

const CANONICAL_BY_SLUG = new Map<string, string>(
  [CANONICAL_BULLION_BUREAU, ...CANONICAL_OTHER_CUSTOMERS].map((name) => [
    slugify(name),
    name,
  ])
);

/** Canonical display name for a slug, or null if the slug is unknown. */
export function canonicalNameForSlug(slug: string): string | null {
  const target = slugify(slug);
  if (target === SHACKPACK_SLUG) return CUSTOMER_BUCKET_LABELS.shackpack;
  return CANONICAL_BY_SLUG.get(target) ?? null;
}

/**
 * Build a predicate matching every case belonging to `slug`.
 *
 * The ShackPack slug matches by BUCKET, so untagged, house-spelled and
 * unrecognized cases are all included.
 */
export function slugToMatcher(
  slug: string
): (input: AttributableCase | string | null | undefined) => boolean {
  const target = slugify(slug);
  if (target === SHACKPACK_SLUG) {
    return (input) => customerBucket(input) === 'shackpack';
  }
  return (input) => caseToSlug(input) === target;
}

/** Display label for a slug before case data loads. */
export function customerLabelFromSlug(slug: string): string {
  const canonical = canonicalNameForSlug(slug);
  if (canonical) return canonical;
  return slugify(slug)
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * Which customers have their own branded pack designs.
 *
 * PACKS TAB ONLY — the checklist nav ignores this entirely. Every canonical
 * customer appears in the checklist regardless; a checklist-only customer
 * simply has no pack tile.
 *
 * Absent from this map = checklist-only. Today that is Crazy Deals 123 LLC and
 * Numismatic Mu.
 */
export type CustomerPacksConfig = {
  hasPacks: true;
  /** Brand in lib/brands.ts supplying this customer's pack tiles, if any. */
  brandId?: BrandId;
};

export const CUSTOMER_PACKS: Record<string, CustomerPacksConfig> = {
  // House brand: the largest pack catalog on the site.
  [SHACKPACK_SLUG]: { hasPacks: true, brandId: 'shackpack' },
  // Flagged ahead of its tiles landing, so no brandId yet.
  'bullion-bureau': { hasPacks: true },
  'bald-bunny': { hasPacks: true, brandId: 'bald-bunny' },
  'blue-collar-bullion': { hasPacks: true, brandId: 'blue-collar-bullion' },
  'cobra-coin': { hasPacks: true, brandId: 'cobra-coin' },
  'coinwave-llc': { hasPacks: true, brandId: 'coinwave' },
  'fortune-forge': { hasPacks: true, brandId: 'fortune-forge' },
  'golden-emu': { hasPacks: true, brandId: 'golden-emu' },
  'juice-box-bullion': { hasPacks: true, brandId: 'juicebox-bullion' },
  'lincoln-reserve': { hasPacks: true, brandId: 'lincoln-reserve' },
};

/** True when this customer has branded pack designs. Packs tab only. */
export function customerHasPacks(
  customerNameOrSlug: string | null | undefined
): boolean {
  const slug = nameToSlug(customerNameOrSlug);
  if (CUSTOMER_PACKS[slug]?.hasPacks) return true;
  // Accept an already-slugified value too.
  return Boolean(CUSTOMER_PACKS[slugify(customerNameOrSlug ?? '')]?.hasPacks);
}

/** True when this brand's tiles belong to a customer flagged hasPacks. */
export function brandHasPacks(brandId: BrandId): boolean {
  return Object.values(CUSTOMER_PACKS).some(
    (config) => config.brandId === brandId && config.hasPacks
  );
}

/** Customer slug that owns a brand's packs, for cross-linking packs -> checklist. */
export function customerSlugForBrand(brandId: BrandId): string | null {
  const found = Object.entries(CUSTOMER_PACKS).find(
    ([, config]) => config.brandId === brandId
  );
  return found ? found[0] : null;
}
