/**
 * Inventory / checklist APIs may send case types as bare words ("expo"), hyphenated ids,
 * spaced phrases ("coinwave gold mine"), or typos ("conwave"). Map them to canonical labels.
 */

export function normalizeChecklistCaseTypeKey(raw: string): string {
  let s = raw.trim().toLowerCase();
  s = s.replace(/_/g, '-');
  s = s.replace(/\s+/g, '-');
  while (s.includes('--')) s = s.replace(/--/g, '-');
  if (s.startsWith('conwave')) s = `coinwave${s.slice(7)}`;
  return s;
}

/** Map normalized API variants → canonical key used in CANONICAL_LABELS */
const TO_CANONICAL: Record<string, string> = {
  ascension: 'shackpack-ascension',
  expo: 'shackpack-expo',
  flex: 'shackpack-flex',
  pinnacle: 'shackpack-pinnacle',
  summit: 'shackpack-summit',
  'coinwave-gold-mine': 'coinwave-gold-mine',
  'coinwave-goldmine': 'coinwave-gold-mine',
  'coinwave-platinum-drill': 'coinwave-platinum-drill',
  'coinwave-platinumdrill': 'coinwave-platinum-drill',
  'coinwave-gold-pan': 'coinwave-gold-pan',
  'coinwave-goldpan': 'coinwave-gold-pan',
  'coinwave-the-mine': 'coinwave-the-mine',
  'coinwave-themine': 'coinwave-the-mine',
  transcendenttransformed: 'transcendent-transformed',
};

function toCanonicalKey(normalized: string): string {
  return TO_CANONICAL[normalized] ?? normalized;
}

const CANONICAL_LABELS: Record<string, { short: string; long: string }> = {
  reign: { short: 'Reign by Shackpack', long: 'Reign by Shackpack' },
  prominence: { short: 'Prominence by Shackpack', long: 'Prominence by Shackpack' },
  apex: { short: 'Apex by Shackpack', long: 'Apex by Shackpack' },
  base: {
    short: 'ShackPack',
    long: 'ShackPack (1× 1/10 oz gold + 9 varied silver)',
  },
  deluxe: {
    short: 'ShackPack Deluxe',
    long: 'ShackPack Deluxe (2× 1/10 oz gold + 8 varied silver)',
  },
  xtreme: {
    short: 'ShackPack Xtreme',
    long: 'ShackPack Xtreme (1× 1/4 oz gold + 9 varied silver)',
  },
  unleashed: {
    short: 'ShackPack Unleashed',
    long: 'ShackPack Unleashed (2× 1/4 oz gold + 8 varied silver)',
  },
  resurgence: {
    short: 'ShackPack Resurgence',
    long: 'ShackPack Resurgence (1× 1/2 oz gold + 9 varied silver)',
  },
  transcendent: {
    short: 'ShackPack Transcendent',
    long: 'ShackPack Transcendent (1× 1 oz gold + 9 varied silver)',
  },
  'transcendent-transformed': {
    short: 'ShackPack Transcendent Transformed',
    long: 'ShackPack Transcendent Transformed (2× 1 oz gold + 8 varied silver)',
  },
  ignite: {
    short: 'ShackPack Ignite',
    long: 'ShackPack Ignite (1× 1/4 oz platinum + 9 varied silver)',
  },
  eclipse: {
    short: 'ShackPack Eclipse',
    long: 'ShackPack Eclipse (1× 1 oz platinum + 9 varied silver)',
  },
  radiant: {
    short: 'ShackPack Radiant',
    long: 'ShackPack Radiant (1× 1/2 oz platinum + 9 varied silver)',
  },
  'shackpack-expo': {
    short: 'Shackpack Expo',
    long: 'Shackpack Expo (premium line; contents may vary)',
  },
  'shackpack-ascension': {
    short: 'Shackpack Ascension',
    long: 'Shackpack Ascension (premium line; contents may vary)',
  },
  'shackpack-flex': {
    short: 'Shackpack Flex',
    long: 'Shackpack Flex (premium line; contents may vary)',
  },
  'shackpack-pinnacle': {
    short: 'Shackpack Pinnacle',
    long: 'Shackpack Pinnacle (premium line; contents may vary)',
  },
  'shackpack-summit': {
    short: 'Shackpack Summit',
    long: 'Shackpack Summit (premium line; contents may vary)',
  },
  'coinwave-platinum-drill': {
    short: 'Coinwave Platinum Drill',
    long: 'Coinwave Platinum Drill (contents may vary)',
  },
  'coinwave-gold-pan': {
    short: 'Coinwave Gold Pan',
    long: 'Coinwave Gold Pan (contents may vary)',
  },
  'coinwave-the-mine': {
    short: 'Coinwave The Mine',
    long: 'Coinwave The Mine (contents may vary)',
  },
  'coinwave-gold-mine': {
    short: 'Coinwave Gold Mine',
    long: 'Coinwave Gold Mine (contents may vary)',
  },
  currencyclash: {
    short: 'Currency Clash by Shackpack',
    long: 'Currency Clash by Shackpack',
  },
  mystery: {
    short: 'ShackPack Mystery',
    long: 'ShackPack Mystery (custom configuration)',
  },
  custom: { short: 'ShackPack Custom', long: 'ShackPack Custom' },
  aura: { short: 'Aura by Shackpack', long: 'Aura by Shackpack' },
};

function titleCaseFallback(raw: string): string {
  return raw
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function getChecklistCaseShortLabel(caseType: string): string {
  const key = toCanonicalKey(normalizeChecklistCaseTypeKey(caseType));
  const row = CANONICAL_LABELS[key];
  if (row) return row.short;
  return titleCaseFallback(caseType);
}

export function getChecklistCaseLongDescription(caseType: string): string {
  const key = toCanonicalKey(normalizeChecklistCaseTypeKey(caseType));
  const row = CANONICAL_LABELS[key];
  if (row) return row.long;
  const short = titleCaseFallback(caseType);
  return `${short} (contents may vary)`;
}
