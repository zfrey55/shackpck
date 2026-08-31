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
 * The wording now MATCHES the coin-side REPACK_CHECKLIST_DISCLAIMER verbatim.
 * The two used to differ because the card tiles carried their own contents
 * claims (a per-series card count and a show-format badge) that the coin tiles
 * did not; with those removed, no tile on either side claims contents, so
 * there is nothing left for the two strings to say differently.
 *
 * The value is duplicated rather than imported ON PURPOSE for now — see the
 * note on the constant below. Example-only content still carries its own
 * caveat at the point of render, in the checklist's CardSeriesBrowser.
 *
 * NOTE: this constant is now character-identical to REPACK_CHECKLIST_DISCLAIMER
 * in lib/repack-catalog.ts. That makes one of the two redundant. Consolidating
 * is deliberately NOT done here — it would change an exported symbol used by
 * app/checklist/components/CardSeriesBrowser.tsx, which is unrelated to
 * removing contents claims from tiles. Worth its own commit.
 */
export const CARD_REPACK_CHECKLIST_DISCLAIMER =
  'Contents vary by series — see checklist for more details.';

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
 * Products span Football, Basketball and Baseball and may include a mix of
 * professionally graded and raw cards. Per-series contents — including how
 * many cards a series holds — are stated only by the published checklist,
 * never by a tile.
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
    category: 'Sports Cards',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-nova',
    name: 'ShackPack Nova',
    description: d(
      'Multi-sport cards spanning Football, Basketball, and Baseball — sold and opened within a single show. May include a mix of graded (PSA, BGS, SGC) and raw cards.'
    ),
    image: '/images/packs/shackpack-nova.png',
    category: 'Sports Cards',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-select',
    name: 'ShackPack Select',
    description: d(
      'Multi-sport cards spanning Football, Basketball, and Baseball — sold and opened within a single show. May include a mix of graded (PSA, BGS, SGC) and raw cards.'
    ),
    image: '/images/packs/shackpack-select.png',
    category: 'Sports Cards',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-abyss',
    name: 'ShackPack Abyss',
    description: d(
      'Multi-sport cards spanning Football, Basketball, and Baseball — vintage rookies through modern releases. May include a mix of graded (PSA, BGS, SGC) and raw cards.'
    ),
    image: '/images/packs/shackpack-abyss.png',
    category: 'Sports Cards',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-equinox',
    name: 'ShackPack Equinox',
    description: d(
      'Multi-sport cards spanning Football, Basketball, and Baseball — vintage rookies through modern releases. May include a mix of graded (PSA, BGS, SGC) and raw cards.'
    ),
    image: '/images/packs/shackpack-equinox.png',
    category: 'Sports Cards',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-limitless',
    name: 'ShackPack Limitless',
    description: d(
      'Multi-sport cards spanning Football, Basketball, and Baseball — vintage rookies through modern releases. May include a mix of graded (PSA, BGS, SGC) and raw cards.'
    ),
    image: '/images/packs/shackpack-limitless.png',
    category: 'Sports Cards',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-blitz',
    name: 'ShackPack Blitz',
    description: d(
      'Multi-sport cards spanning Football, Basketball, and Baseball — vintage rookies through modern releases. May include a mix of graded (PSA, BGS, SGC) and raw cards.'
    ),
    image: '/images/packs/shackpack-blitz.png',
    category: 'Sports Cards',
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
    category: 'Sports Cards',
    brand: 'vault-room-breaks',
  },
  {
    id: 'vaultroombreaks-heist',
    name: 'Vault Room Breaks Heist',
    description: d(
      'Curated multi-sport sports card break — graded slabs from PSA, BGS, and SGC.'
    ),
    image: '/images/packs/vaultroombreaks-heist.png',
    category: 'Sports Cards',
    brand: 'vault-room-breaks',
  },
  {
    id: 'vaultroombreaks-seize',
    name: 'Vault Room Breaks Seize',
    description: d(
      'Curated multi-sport sports card break — graded slabs from PSA, BGS, and SGC.'
    ),
    image: '/images/packs/vaultroombreaks-seize.png',
    category: 'Sports Cards',
    brand: 'vault-room-breaks',
  },
];
