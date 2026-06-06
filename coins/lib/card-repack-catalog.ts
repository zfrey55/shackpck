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
 *
 * Tile-level card counts:
 *   - Multi-sport products (Nova, Inception) are sealed 10-card series, so
 *     "10 cards per series" is published on the tile and on the checklist.
 *   - TCG products (Fusion, Select) do not publish a per-tile count because
 *     their finalized series sizes differ; see the published checklist for
 *     the per-series contents.
 */
export const CARD_REPACK_CATALOG: RepackCatalogItem[] = [
  {
    id: 'shackpack-fusion',
    name: 'ShackPack Fusion',
    description: d(
      'Graded trading cards spanning Pokémon, Magic the Gathering, Yu-Gi-Oh!, One Piece, Dragon Ball Super, Disney Lorcana, and other major TCG and pop-culture titles. All cards graded PSA, BGS, or SGC. No raw cards.'
    ),
    image: '/images/packs/shackpack-fusion.png',
    coinCount: '',
    category: 'TCG · Multi-Show Series',
  },
  {
    id: 'shackpack-nova',
    name: 'ShackPack Nova',
    description: d(
      'Graded sports cards spanning Football, Basketball, and Baseball — vintage rookies through modern Panini Prizm, Topps Chrome, and Bowman Chrome. All cards graded PSA, BGS, or SGC. No raw cards.'
    ),
    image: '/images/packs/shackpack-nova.png',
    coinCount: '10 cards per series',
    category: 'Multi-Sport · Multi-Show Series',
  },
  {
    id: 'shackpack-select',
    name: 'ShackPack Select',
    description: d(
      'Graded TCG cards intended to be sold and opened within a single show. "Single Show Series" is clearly designated on the front of the sealed product. All cards graded PSA, BGS, or SGC. No raw cards.'
    ),
    image: '/images/packs/shackpack-select.png',
    coinCount: '',
    category: 'TCG · Single Show Series',
  },
  {
    id: 'shackpack-inception',
    name: 'ShackPack Inception',
    description: d(
      'Graded multi-sport cards intended to be sold and opened within a single show. "Single Show Series" is clearly designated on the front of the sealed product. All cards graded PSA, BGS, or SGC. No raw cards.'
    ),
    image: '/images/packs/shackpack-inception.png',
    coinCount: '10 cards per series',
    category: 'Multi-Sport · Single Show Series',
  },
];
