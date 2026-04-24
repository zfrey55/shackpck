/**
 * ShackPack Builder — coin catalog, tiers, graders, presets.
 * All values are validated on the server; keep client + server using the same constants.
 *
 * Compliance notes:
 * - No live spot prices anywhere.
 * - Tier bands are static budget targets per slot (what the customer wants to spend),
 *   never floor/ceiling/average pack "value" claims.
 * - Excluded bullion: Saint-Gaudens, Gold Buffalo, Maple Leaf, Palladium.
 */

export const MIN_PACK_COUNT = 10;
export const MAX_PACK_COUNT = 500;

/** Preferred grading / authentication services for the Builder. */
export const GRADERS = ['NGC', 'PCGS', 'ICG', 'CAC', 'ANACS', 'ANY'] as const;
export type Grader = (typeof GRADERS)[number];

export const GRADER_LABELS: Record<Grader, string> = {
  NGC: 'NGC',
  PCGS: 'PCGS',
  ICG: 'ICG',
  CAC: 'CAC',
  ANACS: 'ANACS',
  ANY: "Any (I'm not picky)",
};

/** Per-slot budget tiers. Static bands, never tied to a live metals feed. */
export const TIERS = [
  'STARTER',
  'SELECT',
  'PREMIUM',
  'COLLECTOR',
  'SIGNATURE',
] as const;
export type Tier = (typeof TIERS)[number];

export type TierDef = {
  id: Tier;
  label: string;
  range: string;
  /** Short description shown on tier picker help. */
  hint: string;
};

export const TIER_DEFS: Record<Tier, TierDef> = {
  STARTER: {
    id: 'STARTER',
    label: 'Starter',
    range: '$35–$60',
    hint: 'Entry-level graded coin target per slot.',
  },
  SELECT: {
    id: 'SELECT',
    label: 'Select',
    range: '$60–$85',
    hint: 'Everyday graded bullion or classic silver target.',
  },
  PREMIUM: {
    id: 'PREMIUM',
    label: 'Premium',
    range: '$85–$125',
    hint: 'Higher-end classics like Morgan / Peace Dollars.',
  },
  COLLECTOR: {
    id: 'COLLECTOR',
    label: 'Collector',
    range: '$125–$200',
    hint: 'Gold / platinum bullion target.',
  },
  SIGNATURE: {
    id: 'SIGNATURE',
    label: 'Signature',
    range: '$200+',
    hint: 'Pre-1933 gold and heavier bullion target.',
  },
};

export const TIER_ORDER: Tier[] = [...TIERS];

/** Coin catalog — grouped by category. All entries are certified (graded) by design. */
export type CoinTypeId = string;

export type CoinCategory =
  | 'gold'
  | 'platinum'
  | 'silver-bullion'
  | 'classic-silver'
  | 'denominational'
  | 'other';

export const COIN_CATEGORY_LABELS: Record<CoinCategory, string> = {
  gold: 'Gold',
  platinum: 'Platinum',
  'silver-bullion': 'Silver bullion',
  'classic-silver': 'Classic U.S. silver',
  denominational: 'U.S. denominational',
  other: 'Other',
};

export const COIN_CATEGORY_ORDER: CoinCategory[] = [
  'gold',
  'platinum',
  'silver-bullion',
  'classic-silver',
  'denominational',
  'other',
];

export type CoinTypeDef = {
  id: CoinTypeId;
  label: string;
  category: CoinCategory;
  /** Suggested default tier when this coin is dropped into a new line. */
  defaultTier: Tier;
  /** Short helper shown on the catalog card. */
  hint?: string;
};

/**
 * Keep labels concise — they also render on mobile tiles.
 * IDs are stable storage keys; never change without a migration.
 */
export const COIN_CATALOG: CoinTypeDef[] = [
  // Gold
  {
    id: 'american-gold-eagle',
    label: 'American Gold Eagle',
    category: 'gold',
    defaultTier: 'COLLECTOR',
    hint: 'U.S. Mint gold bullion.',
  },
  {
    id: 'pre-1933-us-gold',
    label: 'Pre-1933 U.S. Gold',
    category: 'gold',
    defaultTier: 'SIGNATURE',
    hint: 'Classic U.S. gold, graded.',
  },
  {
    id: 'foreign-gold',
    label: 'Foreign Gold',
    category: 'gold',
    defaultTier: 'COLLECTOR',
  },
  {
    id: 'gold-bar-round',
    label: 'Gold Bar / Round — 1/10 oz or larger',
    category: 'gold',
    defaultTier: 'COLLECTOR',
  },
  {
    id: 'gold-1g',
    label: 'Gold Bar / Round — 1 gram',
    category: 'gold',
    defaultTier: 'SELECT',
  },
  {
    id: 'fractional-gold',
    label: 'Fractional Gold — smaller than 1 gram',
    category: 'gold',
    defaultTier: 'STARTER',
    hint: '1/500 oz, 1/1000 oz, or gold flake.',
  },

  // Platinum
  {
    id: 'american-platinum-eagle',
    label: 'American Platinum Eagle',
    category: 'platinum',
    defaultTier: 'COLLECTOR',
  },
  {
    id: 'platinum-bar-round',
    label: 'Platinum Bar / Round — 1/10 oz or larger',
    category: 'platinum',
    defaultTier: 'COLLECTOR',
  },
  {
    id: 'platinum-1g',
    label: 'Platinum Bar / Round — 1 gram',
    category: 'platinum',
    defaultTier: 'SELECT',
  },
  {
    id: 'fractional-platinum',
    label: 'Fractional Platinum — smaller than 1 gram',
    category: 'platinum',
    defaultTier: 'STARTER',
  },

  // Silver bullion
  {
    id: 'american-silver-eagle',
    label: 'American Silver Eagle',
    category: 'silver-bullion',
    defaultTier: 'SELECT',
  },
  {
    id: 'silver-round-bar-1oz',
    label: 'Silver Round / Bar — 1 oz',
    category: 'silver-bullion',
    defaultTier: 'SELECT',
  },
  {
    id: 'fractional-silver-1-10',
    label: 'Fractional Silver — 1/10 oz',
    category: 'silver-bullion',
    defaultTier: 'STARTER',
  },
  {
    id: 'foreign-silver',
    label: 'Foreign Silver',
    category: 'silver-bullion',
    defaultTier: 'SELECT',
  },

  // Classic U.S. silver
  {
    id: 'morgan-dollar',
    label: 'Morgan Dollar',
    category: 'classic-silver',
    defaultTier: 'PREMIUM',
  },
  {
    id: 'peace-dollar',
    label: 'Peace Dollar',
    category: 'classic-silver',
    defaultTier: 'PREMIUM',
  },
  {
    id: 'silver-half-dollar',
    label: 'Silver Half Dollar',
    category: 'classic-silver',
    defaultTier: 'SELECT',
  },
  {
    id: 'silver-quarter',
    label: 'Silver Quarter',
    category: 'classic-silver',
    defaultTier: 'SELECT',
  },

  // U.S. denominational
  {
    id: 'cent',
    label: 'Cent (1¢)',
    category: 'denominational',
    defaultTier: 'STARTER',
  },
  {
    id: 'nickel',
    label: 'Nickel (5¢)',
    category: 'denominational',
    defaultTier: 'STARTER',
  },
  {
    id: 'dime',
    label: 'Dime (10¢)',
    category: 'denominational',
    defaultTier: 'STARTER',
  },
  {
    id: 'quarter',
    label: 'Quarter (25¢)',
    category: 'denominational',
    defaultTier: 'STARTER',
  },
  {
    id: 'half-dollar',
    label: 'Half Dollar (50¢)',
    category: 'denominational',
    defaultTier: 'STARTER',
  },
  {
    id: 'small-dollar',
    label: 'Small Dollar ($1)',
    category: 'denominational',
    defaultTier: 'STARTER',
    hint: 'Eisenhower / SBA / Sacagawea / Presidential.',
  },

  // Other
  {
    id: 'us-commemorative',
    label: 'U.S. Commemorative',
    category: 'other',
    defaultTier: 'SELECT',
  },
  {
    id: 'foreign-coin',
    label: 'Foreign Coin',
    category: 'other',
    defaultTier: 'STARTER',
  },
  {
    id: 'other',
    label: 'Other — free text',
    category: 'other',
    defaultTier: 'STARTER',
    hint: 'Describe in the notes on the line.',
  },
];

export const COIN_TYPE_IDS = COIN_CATALOG.map((c) => c.id);

export function getCoinDef(id: string): CoinTypeDef | undefined {
  return COIN_CATALOG.find((c) => c.id === id);
}

export function coinsByCategory(category: CoinCategory): CoinTypeDef[] {
  return COIN_CATALOG.filter((c) => c.category === category);
}

/** Presets — mirror current published cases so customers have a familiar starting point. */
export type PresetLine = {
  coinType: CoinTypeId;
  quantity: number;
  tier: Tier;
  grader: Grader;
  notes?: string;
};

export type Preset = {
  id: string;
  name: string;
  description: string;
  packCount: number;
  lines: PresetLine[];
};

const g = (grader: Grader = 'ANY') => grader;

export const BUILDER_PRESETS: Preset[] = [
  // --- 10-pack ---
  {
    id: 'classic-gold',
    name: 'Classic Gold',
    description: 'Mirrors the ShackPack flagship — one gold anchor with Silver Eagle support.',
    packCount: 10,
    lines: [
      { coinType: 'american-gold-eagle', quantity: 1, tier: 'COLLECTOR', grader: g() },
      { coinType: 'american-silver-eagle', quantity: 9, tier: 'SELECT', grader: g() },
    ],
  },
  {
    id: 'double-gold',
    name: 'Double Gold',
    description: 'Mirrors ShackPack Deluxe — two gold anchors.',
    packCount: 10,
    lines: [
      { coinType: 'american-gold-eagle', quantity: 2, tier: 'COLLECTOR', grader: g() },
      { coinType: 'american-silver-eagle', quantity: 8, tier: 'SELECT', grader: g() },
    ],
  },
  {
    id: 'pre-33-classic',
    name: 'Pre-33 Classic',
    description: 'Reign / Aura / Prominence / Summit style — one pre-1933 gold + classics.',
    packCount: 10,
    lines: [
      { coinType: 'pre-1933-us-gold', quantity: 1, tier: 'SIGNATURE', grader: g() },
      { coinType: 'morgan-dollar', quantity: 5, tier: 'PREMIUM', grader: g() },
      { coinType: 'american-silver-eagle', quantity: 4, tier: 'SELECT', grader: g() },
    ],
  },
  {
    id: 'double-pre-33',
    name: 'Double Pre-33',
    description: 'Pinnacle / Ascension style — two pre-1933 gold anchors.',
    packCount: 10,
    lines: [
      { coinType: 'pre-1933-us-gold', quantity: 2, tier: 'SIGNATURE', grader: g() },
      { coinType: 'morgan-dollar', quantity: 4, tier: 'PREMIUM', grader: g() },
      { coinType: 'american-silver-eagle', quantity: 4, tier: 'SELECT', grader: g() },
    ],
  },
  {
    id: 'platinum-accent',
    name: 'Platinum Accent',
    description: 'Ignite / Radiant / Eclipse style — platinum anchor, silver support.',
    packCount: 10,
    lines: [
      { coinType: 'american-platinum-eagle', quantity: 1, tier: 'COLLECTOR', grader: g() },
      { coinType: 'american-silver-eagle', quantity: 9, tier: 'SELECT', grader: g() },
    ],
  },
  {
    id: 'heavy-gold',
    name: 'Heavy Gold',
    description: 'Apex style — five gold anchors, five silver.',
    packCount: 10,
    lines: [
      { coinType: 'american-gold-eagle', quantity: 5, tier: 'COLLECTOR', grader: g() },
      { coinType: 'american-silver-eagle', quantity: 5, tier: 'SELECT', grader: g() },
    ],
  },

  // --- 20-pack ---
  {
    id: 'gold-mine',
    name: 'Gold Mine',
    description: 'Coinwave Gold Mine style — 1 gold + 2 ASE + wide denominational mix.',
    packCount: 20,
    lines: [
      { coinType: 'american-gold-eagle', quantity: 1, tier: 'COLLECTOR', grader: g() },
      { coinType: 'american-silver-eagle', quantity: 2, tier: 'SELECT', grader: g() },
      { coinType: 'morgan-dollar', quantity: 4, tier: 'PREMIUM', grader: g() },
      { coinType: 'silver-half-dollar', quantity: 3, tier: 'SELECT', grader: g() },
      { coinType: 'silver-quarter', quantity: 3, tier: 'SELECT', grader: g() },
      { coinType: 'half-dollar', quantity: 3, tier: 'STARTER', grader: g() },
      { coinType: 'small-dollar', quantity: 4, tier: 'STARTER', grader: g() },
    ],
  },
  {
    id: 'tri-metal',
    name: 'Tri-Metal',
    description: 'Coinwave The Mine style — gold, platinum, and silver in one case.',
    packCount: 20,
    lines: [
      { coinType: 'american-gold-eagle', quantity: 1, tier: 'COLLECTOR', grader: g() },
      { coinType: 'american-platinum-eagle', quantity: 1, tier: 'COLLECTOR', grader: g() },
      { coinType: 'american-silver-eagle', quantity: 1, tier: 'SELECT', grader: g() },
      { coinType: 'morgan-dollar', quantity: 3, tier: 'PREMIUM', grader: g() },
      { coinType: 'silver-half-dollar', quantity: 3, tier: 'SELECT', grader: g() },
      { coinType: 'silver-quarter', quantity: 3, tier: 'SELECT', grader: g() },
      { coinType: 'half-dollar', quantity: 4, tier: 'STARTER', grader: g() },
      { coinType: 'small-dollar', quantity: 4, tier: 'STARTER', grader: g() },
    ],
  },
  {
    id: 'platinum-drill',
    name: 'Platinum Drill',
    description: 'Coinwave Platinum Drill style — platinum anchor + classic silvers.',
    packCount: 20,
    lines: [
      { coinType: 'american-platinum-eagle', quantity: 1, tier: 'COLLECTOR', grader: g() },
      { coinType: 'american-silver-eagle', quantity: 2, tier: 'SELECT', grader: g() },
      { coinType: 'morgan-dollar', quantity: 2, tier: 'PREMIUM', grader: g() },
      { coinType: 'peace-dollar', quantity: 2, tier: 'PREMIUM', grader: g() },
      { coinType: 'silver-half-dollar', quantity: 3, tier: 'SELECT', grader: g() },
      { coinType: 'silver-quarter', quantity: 3, tier: 'SELECT', grader: g() },
      { coinType: 'half-dollar', quantity: 3, tier: 'STARTER', grader: g() },
      { coinType: 'small-dollar', quantity: 4, tier: 'STARTER', grader: g() },
    ],
  },
  {
    id: 'gold-pan',
    name: 'Gold Pan',
    description: 'Coinwave Gold Pan style — balanced gold + silver with wide denominational mix.',
    packCount: 20,
    lines: [
      { coinType: 'american-gold-eagle', quantity: 1, tier: 'COLLECTOR', grader: g() },
      { coinType: 'american-silver-eagle', quantity: 2, tier: 'SELECT', grader: g() },
      { coinType: 'morgan-dollar', quantity: 3, tier: 'PREMIUM', grader: g() },
      { coinType: 'peace-dollar', quantity: 1, tier: 'PREMIUM', grader: g() },
      { coinType: 'silver-half-dollar', quantity: 3, tier: 'SELECT', grader: g() },
      { coinType: 'silver-quarter', quantity: 3, tier: 'SELECT', grader: g() },
      { coinType: 'half-dollar', quantity: 3, tier: 'STARTER', grader: g() },
      { coinType: 'small-dollar', quantity: 4, tier: 'STARTER', grader: g() },
    ],
  },

  // --- Blank starting points ---
  {
    id: 'blank-20',
    name: 'Blank 20-pack',
    description: 'Start from scratch — 20 packs, no lines yet.',
    packCount: 20,
    lines: [],
  },
  {
    id: 'blank-30',
    name: 'Blank 30-pack',
    description: 'Start from scratch — 30 packs, no lines yet.',
    packCount: 30,
    lines: [],
  },
];

export function getPreset(id: string): Preset | undefined {
  return BUILDER_PRESETS.find((p) => p.id === id);
}
