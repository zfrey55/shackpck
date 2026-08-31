import { REPACK_CHECKLIST_DISCLAIMER, type RepackCatalogItem } from '@/lib/repack-catalog';

/**
 * Card pack tiles.
 *
 * TILE COPY IS THE SHARED DISCLAIMER AND NOTHING ELSE, exactly as the coin
 * catalog does it. Every entry's description is `D` — no per-pack body.
 *
 * These tiles used to wrap a descriptive body around the disclaimer through a
 * `d()` helper: sports covered, set names, grading companies, graded-vs-raw
 * mix. Every one of those was a contents claim, which is the thing tile copy
 * is not allowed to make. The bodies are gone and `d()` with them.
 *
 * There is no card-specific disclaimer constant any more either. The card and
 * coin strings had already converged on identical text once the tiles stopped
 * carrying counts and format badges, so this file now imports the coin-side
 * REPACK_CHECKLIST_DISCLAIMER rather than defining a second copy of it.
 *
 * The EXAMPLE-checklist caveat is a different string for a different job and
 * lives with its render, in app/checklist/components/CardSeriesBrowser.tsx.
 * It is a warning about one checklist being illustrative — not tile copy —
 * and reusing the tile disclaimer for it produced "see checklist for more
 * details" addressed to someone already reading the checklist.
 */

/** Convenience alias used throughout this file to keep entries terse. */
const D = REPACK_CHECKLIST_DISCLAIMER;

/**
 * Multi-sport card repacks. Product lines:
 *   Fusion     — Multi-Sport, Multi-Show
 *   Nova       — Multi-Sport, Single-Show
 *   Select     — Multi-Sport, Single-Show
 *   Abyss      — Multi-Sport, Multi-Show
 *   Equinox    — Multi-Sport, Multi-Show
 *   Limitless  — Multi-Sport, Multi-Show
 *   Blitz      — Multi-Sport, Multi-Show
 *
 * Those line characteristics are recorded HERE, in a comment, deliberately —
 * they describe the product line for whoever maintains this file. They are
 * not rendered, because a tile states no contents. Per-series contents are
 * stated only by the published checklist.
 *
 * Abyss/Equinox/Limitless/Blitz are tiles only for now — no example checklist
 * on the /checklist Cards tab yet.
 */
export const CARD_REPACK_CATALOG: RepackCatalogItem[] = [
  {
    id: 'shackpack-fusion',
    name: 'ShackPack Fusion',
    description: D,
    image: '/images/packs/shackpack-fusion.png',
    category: 'Sports Cards',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-nova',
    name: 'ShackPack Nova',
    description: D,
    image: '/images/packs/shackpack-nova.png',
    category: 'Sports Cards',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-select',
    name: 'ShackPack Select',
    description: D,
    image: '/images/packs/shackpack-select.png',
    category: 'Sports Cards',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-abyss',
    name: 'ShackPack Abyss',
    description: D,
    image: '/images/packs/shackpack-abyss.png',
    category: 'Sports Cards',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-equinox',
    name: 'ShackPack Equinox',
    description: D,
    image: '/images/packs/shackpack-equinox.png',
    category: 'Sports Cards',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-limitless',
    name: 'ShackPack Limitless',
    description: D,
    image: '/images/packs/shackpack-limitless.png',
    category: 'Sports Cards',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-blitz',
    name: 'ShackPack Blitz',
    description: D,
    image: '/images/packs/shackpack-blitz.png',
    category: 'Sports Cards',
    brand: 'shackpack',
  },

  // ----- Vault Room Breaks -----
  // Card products, per the pack art ("Premium Sports Card Breaks", graded
  // slabs). Same bare disclaimer as every other tile — the slab and grading
  // detail on the artwork is deliberately NOT restated as copy.
  {
    id: 'vaultroombreaks-breach',
    name: 'Vault Room Breaks Breach',
    description: D,
    image: '/images/packs/vaultroombreaks-breach.png',
    category: 'Sports Cards',
    brand: 'vault-room-breaks',
  },
  {
    id: 'vaultroombreaks-heist',
    name: 'Vault Room Breaks Heist',
    description: D,
    image: '/images/packs/vaultroombreaks-heist.png',
    category: 'Sports Cards',
    brand: 'vault-room-breaks',
  },
  {
    id: 'vaultroombreaks-seize',
    name: 'Vault Room Breaks Seize',
    description: D,
    image: '/images/packs/vaultroombreaks-seize.png',
    category: 'Sports Cards',
    brand: 'vault-room-breaks',
  },
];
