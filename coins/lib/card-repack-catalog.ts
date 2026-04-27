import type { RepackCatalogItem } from '@/lib/repack-catalog';

/**
 * Card-side disclaimer. Unlike coin repacks (which use a "contents may vary"
 * clause), each ShackPack card series is finalized once published — the
 * specific products and items in a finalized series cannot change. This copy
 * is consistent with the Whatnot Identified Product List requirements for
 * Professionally Sealed Surprise Products.
 */
export const CARD_REPACK_CHECKLIST_DISCLAIMER =
  'Each series is a finalized, sealed, tamper-proof set. See the published checklist for the complete contents of this series.';

const d = (body: string) => `${body.trim()} ${CARD_REPACK_CHECKLIST_DISCLAIMER}`;

/**
 * Graded trading card repacks. Four product lines:
 *   Fusion     — TCG, multi-show
 *   Nova       — Multi-sport, multi-show
 *   Select     — TCG, single-show
 *   Inception  — Multi-sport, single-show
 */
export const CARD_REPACK_CATALOG: RepackCatalogItem[] = [
  {
    id: 'shackpack-fusion',
    name: 'ShackPack Fusion',
    description: d(
      '100 graded cards per series — Pokémon, Magic the Gathering, Yu-Gi-Oh!, One Piece, Dragon Ball Super, Disney Lorcana, and other major TCG and pop-culture titles. All cards graded PSA, BGS, or SGC. No raw cards.'
    ),
    image: '/images/packs/shackpack-fusion.png',
    coinCount: '100 cards',
    category: 'TCG · Multi-Show Series',
  },
  {
    id: 'shackpack-nova',
    name: 'ShackPack Nova',
    description: d(
      '50 graded sports cards per series spanning Football, Basketball, and Baseball — vintage rookies through modern Panini Prizm, Topps Chrome, and Bowman Chrome. All cards graded PSA, BGS, or SGC. No raw cards.'
    ),
    image: '/images/packs/shackpack-nova.png',
    coinCount: '50 cards',
    category: 'Multi-Sport · Multi-Show Series',
  },
  {
    id: 'shackpack-select',
    name: 'ShackPack Select',
    description: d(
      '100 graded TCG cards per series, intended to be sold and opened within a single show. "Single Show Series" is clearly designated on the front of the sealed product.'
    ),
    image: '/images/packs/shackpack-select.png',
    coinCount: '100 cards',
    category: 'TCG · Single Show Series',
  },
  {
    id: 'shackpack-inception',
    name: 'ShackPack Inception',
    description: d(
      '50 graded multi-sport cards per series, intended to be sold and opened within a single show. "Single Show Series" is clearly designated on the front of the sealed product.'
    ),
    image: '/images/packs/shackpack-inception.png',
    coinCount: '50 cards',
    category: 'Multi-Sport · Single Show Series',
  },
];
