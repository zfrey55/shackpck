/**
 * Inventory / checklist APIs may send case types as bare words ("expo"), hyphenated ids,
 * spaced phrases ("coinwave gold mine"), or typos ("conwave"). Map them to canonical labels.
 *
 * The "long" description for each case type intentionally defers to the
 * checklist itself — we never claim a specific composition on the case
 * header because contents vary by series. The actual coins for any specific
 * dated series are listed below the header on the checklist page.
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
  'coinwave-barrel': 'coinwave-barrel',
  'coinwave-big-kahunas': 'coinwave-big-kahunas',
  'coinwave-bigkahunas': 'coinwave-big-kahunas',
  'coinwave-big-kahuna': 'coinwave-big-kahunas',
  'coinwave-splash': 'coinwave-splash',
  'coinwave-tsunami': 'coinwave-tsunami',
  'coinwave-megalodon': 'coinwave-megalodon',
  'coinwave-platinum-marlin': 'coinwave-platinum-marlin',
  'coinwave-platinummarlin': 'coinwave-platinum-marlin',
  'coinwave-golden-tuna': 'coinwave-golden-tuna',
  'coinwave-goldentuna': 'coinwave-golden-tuna',
  transcendenttransformed: 'transcendent-transformed',
};

function toCanonicalKey(normalized: string): string {
  return TO_CANONICAL[normalized] ?? normalized;
}

/**
 * Uniform tagline shown beneath each case header on /checklist. The actual
 * series contents are listed in the coin grid below this; the tagline just
 * reminds the viewer that contents vary across different dated series.
 */
const LONG = 'Contents vary by series — see checklist for more details.';

const CANONICAL_LABELS: Record<string, { short: string; long: string }> = {
  reign: { short: 'Reign by Shackpack', long: LONG },
  prominence: { short: 'Prominence by Shackpack', long: LONG },
  apex: { short: 'Apex by Shackpack', long: LONG },
  base: { short: 'ShackPack', long: LONG },
  deluxe: { short: 'ShackPack Deluxe', long: LONG },
  xtreme: { short: 'ShackPack Xtreme', long: LONG },
  unleashed: { short: 'ShackPack Unleashed', long: LONG },
  resurgence: { short: 'ShackPack Resurgence', long: LONG },
  transcendent: { short: 'ShackPack Transcendent', long: LONG },
  'transcendent-transformed': { short: 'ShackPack Transcendent Transformed', long: LONG },
  ignite: { short: 'ShackPack Ignite', long: LONG },
  eclipse: { short: 'ShackPack Eclipse', long: LONG },
  radiant: { short: 'ShackPack Radiant', long: LONG },
  'shackpack-expo': { short: 'ShackPack Expo', long: LONG },
  'shackpack-ascension': { short: 'Ascension by Shackpack', long: LONG },
  'shackpack-flex': { short: 'ShackPack Flex', long: LONG },
  'shackpack-pinnacle': { short: 'Pinnacle by Shackpack', long: LONG },
  'shackpack-summit': { short: 'Summit by Shackpack', long: LONG },
  'coinwave-platinum-drill': { short: 'Coinwave Platinum Drill', long: LONG },
  'coinwave-gold-pan': { short: 'Coinwave Gold Pan', long: LONG },
  'coinwave-the-mine': { short: 'Coinwave The Mine', long: LONG },
  'coinwave-gold-mine': { short: 'Coinwave Gold Mine', long: LONG },
  'coinwave-barrel': { short: 'Coinwave Barrel', long: LONG },
  'coinwave-big-kahunas': { short: 'Coinwave Big Kahunas', long: LONG },
  'coinwave-splash': { short: 'Coinwave Splash', long: LONG },
  'coinwave-tsunami': { short: 'Coinwave Tsunami', long: LONG },
  'coinwave-megalodon': { short: 'Coinwave Megalodon', long: LONG },
  'coinwave-platinum-marlin': { short: 'Coinwave Platinum Marlin', long: LONG },
  'coinwave-golden-tuna': { short: 'Coinwave Golden Tuna', long: LONG },
  currencyclash: { short: 'Currency Clash by Shackpack', long: LONG },
  mystery: { short: 'ShackPack Mystery', long: LONG },
  custom: { short: 'ShackPack Custom', long: LONG },
  aura: { short: 'Aura by Shackpack', long: LONG },
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
  return LONG;
}
