import type { RepackCatalogItem } from '@/lib/repack-catalog';

/**
 * Card-side disclaimer. ShackPack card products are multi-sport sealed products
 * whose published checklists are EXAMPLES — they illustrate the format, sport
 * mix, era mix, and condition mix of the product line, but the actual cards in
 * any produced ShackPack will differ from the example.
 */
export const CARD_REPACK_CHECKLIST_DISCLAIMER =
  'See the published checklist for an example of the cards that may appear in this product. Example checklist only — actual contents will vary.';

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
];
