import type { RepackCatalogItem } from '@/lib/repack-catalog';

/**
 * Card-side disclaimer, shared by every card pack tile.
 *
 * It used to call the published checklist an EXAMPLE. That is no longer true:
 * these tiles link to the Cards line of /checklist, which serves the frozen
 * archive in lib/card-series-checklist.ts — real, dated, exact published
 * series that its own header states are NOT subject to a contents-may-vary
 * caveat. Calling those examples contradicted the data.
 *
 * The wording now defers to the published checklist without characterizing
 * what it contains, so it stays true whether the series behind it is a real
 * archived checklist or an undated example. Per the compliance policy in
 * lib/repack-catalog.ts, the tile itself still makes no specific-contents
 * claim. Example-only content carries its own caveat at the point of render,
 * in the checklist's CardSeriesBrowser.
 */
export const CARD_REPACK_CHECKLIST_DISCLAIMER =
  'See the published checklist for each series — contents vary by series.';

const d = (body: string) => `${body.trim()} ${CARD_REPACK_CHECKLIST_DISCLAIMER}`;

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
 * Every product is a sealed 10-card series spanning Football, Basketball, and
 * Baseball. Products may include a mix of professionally graded and raw cards.
 * Abyss/Equinox/Limitless/Blitz are tiles only for now — no example checklist
 * on the /checklist Cards tab yet.
 */
export const CARD_REPACK_CATALOG: RepackCatalogItem[] = [
  {
    id: 'shackpack-fusion',
    name: 'ShackPack Fusion',
    description: d(
      'Multi-sport cards spanning Football, Basketball, and Baseball — vintage rookies through modern Panini Prizm, Topps Chrome, and Bowman Chrome. May include a mix of graded (PSA, BGS, SGC) and raw cards.'
    ),
    image: '/images/packs/shackpack-fusion.png',
    coinCount: '10 cards per series',
    category: 'Multi-Sport · Multi-Show Series',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-nova',
    name: 'ShackPack Nova',
    description: d(
      'Multi-sport cards spanning Football, Basketball, and Baseball — sold and opened within a single show. May include a mix of graded (PSA, BGS, SGC) and raw cards.'
    ),
    image: '/images/packs/shackpack-nova.png',
    coinCount: '10 cards per series',
    category: 'Multi-Sport · Single Show Series',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-select',
    name: 'ShackPack Select',
    description: d(
      'Multi-sport cards spanning Football, Basketball, and Baseball — sold and opened within a single show. May include a mix of graded (PSA, BGS, SGC) and raw cards.'
    ),
    image: '/images/packs/shackpack-select.png',
    coinCount: '10 cards per series',
    category: 'Multi-Sport · Single Show Series',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-abyss',
    name: 'ShackPack Abyss',
    description: d(
      'Multi-sport cards spanning Football, Basketball, and Baseball — vintage rookies through modern releases. May include a mix of graded (PSA, BGS, SGC) and raw cards.'
    ),
    image: '/images/packs/shackpack-abyss.png',
    coinCount: '10 cards per series',
    category: 'Multi-Sport · Multi-Show Series',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-equinox',
    name: 'ShackPack Equinox',
    description: d(
      'Multi-sport cards spanning Football, Basketball, and Baseball — vintage rookies through modern releases. May include a mix of graded (PSA, BGS, SGC) and raw cards.'
    ),
    image: '/images/packs/shackpack-equinox.png',
    coinCount: '10 cards per series',
    category: 'Multi-Sport · Multi-Show Series',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-limitless',
    name: 'ShackPack Limitless',
    description: d(
      'Multi-sport cards spanning Football, Basketball, and Baseball — vintage rookies through modern releases. May include a mix of graded (PSA, BGS, SGC) and raw cards.'
    ),
    image: '/images/packs/shackpack-limitless.png',
    coinCount: '10 cards per series',
    category: 'Multi-Sport · Multi-Show Series',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-blitz',
    name: 'ShackPack Blitz',
    description: d(
      'Multi-sport cards spanning Football, Basketball, and Baseball — vintage rookies through modern releases. May include a mix of graded (PSA, BGS, SGC) and raw cards.'
    ),
    image: '/images/packs/shackpack-blitz.png',
    coinCount: '10 cards per series',
    category: 'Multi-Sport · Multi-Show Series',
    brand: 'shackpack',
  },

  // ----- Vault Room Breaks -----
  // Card products, per the pack art ("Premium Sports Card Breaks", graded
  // slabs). Same disclaimer wrapper as the ShackPack card tiles — the copy
  // never claims specific contents and defers to the published checklist.
  {
    id: 'vaultroombreaks-breach',
    name: 'Vault Room Breaks Breach',
    description: d(
      'Curated multi-sport sports card break — graded slabs from PSA, BGS, and SGC.'
    ),
    image: '/images/packs/vaultroombreaks-breach.png',
    category: 'Multi-Sport · Graded Slabs',
    brand: 'vault-room-breaks',
  },
  {
    id: 'vaultroombreaks-heist',
    name: 'Vault Room Breaks Heist',
    description: d(
      'Curated multi-sport sports card break — graded slabs from PSA, BGS, and SGC.'
    ),
    image: '/images/packs/vaultroombreaks-heist.png',
    category: 'Multi-Sport · Graded Slabs',
    brand: 'vault-room-breaks',
  },
  {
    id: 'vaultroombreaks-seize',
    name: 'Vault Room Breaks Seize',
    description: d(
      'Curated multi-sport sports card break — graded slabs from PSA, BGS, and SGC.'
    ),
    image: '/images/packs/vaultroombreaks-seize.png',
    category: 'Multi-Sport · Graded Slabs',
    brand: 'vault-room-breaks',
  },
];
