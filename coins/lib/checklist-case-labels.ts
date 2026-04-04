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
  reign: {
    short: 'Reign by Shackpack',
    long: '10 coins — 1× pre-1933 gold, 9 graded silver. See checklist for this date.',
  },
  prominence: {
    short: 'Prominence by Shackpack',
    long: '10 coins — 1× pre-1933 gold, 9 graded silver. See checklist for this date.',
  },
  apex: {
    short: 'Apex by Shackpack',
    long: '10 coins — 5× gold, 5 graded silver. See checklist for this date.',
  },
  base: {
    short: 'ShackPack',
    long: '10 coins — 1× gold, 9 graded silver. See checklist for this date.',
  },
  deluxe: {
    short: 'ShackPack Deluxe',
    long: '10 coins — 2× gold, 8 graded silver. See checklist for this date.',
  },
  xtreme: {
    short: 'ShackPack Xtreme',
    long: '10 coins — 1× gold, 9 graded silver. See checklist for this date.',
  },
  unleashed: {
    short: 'ShackPack Unleashed',
    long: '10 coins — 2× gold, 8 graded silver. See checklist for this date.',
  },
  resurgence: {
    short: 'ShackPack Resurgence',
    long: '10 coins — 1× gold, 9 graded silver. See checklist for this date.',
  },
  transcendent: {
    short: 'ShackPack Transcendent',
    long: '10 coins — 1× gold, 9 graded silver. See checklist for this date.',
  },
  'transcendent-transformed': {
    short: 'ShackPack Transcendent Transformed',
    long: '10 coins — 2× gold, 8 graded silver. See checklist for this date.',
  },
  ignite: {
    short: 'ShackPack Ignite',
    long: '10 coins — 1× platinum, 9 graded silver. See checklist for this date.',
  },
  eclipse: {
    short: 'ShackPack Eclipse',
    long: '10 coins — 1× platinum, 9 graded silver. See checklist for this date.',
  },
  radiant: {
    short: 'ShackPack Radiant',
    long: '10 coins — 1× platinum, 9 graded silver. See checklist for this date.',
  },
  'shackpack-expo': {
    short: 'ShackPack Expo',
    long: 'Custom event series — contact ShackPack first. Each series has its own published checklist.',
  },
  'shackpack-ascension': {
    short: 'Ascension by Shackpack',
    long: '10 coins — 2× pre-1933 gold, 8 graded silver. See checklist for this date.',
  },
  'shackpack-flex': {
    short: 'ShackPack Flex',
    long: 'Fully custom configuration — contact ShackPack first. Each series has its own published checklist.',
  },
  'shackpack-pinnacle': {
    short: 'Pinnacle by Shackpack',
    long: '10 coins — 2× pre-1933 gold, 8 graded silver. See checklist for this date.',
  },
  'shackpack-summit': {
    short: 'Summit by Shackpack',
    long: '10 coins — 1× pre-1933 gold, 9 graded silver. See checklist for this date.',
  },
  'coinwave-platinum-drill': {
    short: 'Coinwave Platinum Drill',
    long: '20 coins — 1× platinum, 2× Silver Eagles, 17 graded. See checklist for this date.',
  },
  'coinwave-gold-pan': {
    short: 'Coinwave Gold Pan',
    long: '20 coins — 1× gold, 2× Silver Eagles, 17 graded. See checklist for this date.',
  },
  'coinwave-the-mine': {
    short: 'Coinwave The Mine',
    long: '20 coins — 1× gold, 1× platinum, 1× Silver Eagle, 17 graded. See checklist for this date.',
  },
  'coinwave-gold-mine': {
    short: 'Coinwave Gold Mine',
    long: '20 coins — 1× gold, 2× Silver Eagles, 17 graded. See checklist for this date.',
  },
  currencyclash: {
    short: 'Currency Clash by Shackpack',
    long: 'Custom currency/coin mix — contact ShackPack first. Each series has its own published checklist.',
  },
  mystery: {
    short: 'ShackPack Mystery',
    long: 'Custom configuration — contact ShackPack first.',
  },
  custom: { short: 'ShackPack Custom', long: 'Custom configuration — contact ShackPack first.' },
  aura: {
    short: 'Aura by Shackpack',
    long: '10 coins — 1× pre-1933 gold, 9 graded silver. See checklist for this date.',
  },
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
  return `${short}. See checklist for this date.`;
}
