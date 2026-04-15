import type { RepackCatalogItem } from '@/lib/repack-catalog';
import { REPACK_CHECKLIST_DISCLAIMER } from '@/lib/repack-catalog';

const d = (body: string) => `${body.trim()} ${REPACK_CHECKLIST_DISCLAIMER}`;

/** Graded trading card repacks (placeholders until pack art ships). */
export const CARD_REPACK_CATALOG: RepackCatalogItem[] = [
  {
    id: 'card-tcg-multi',
    name: 'ShackPack TCG',
    description: d(
      '100 graded cards per series — Pokémon TCG and non-sport / pop culture (Marvel, DC, Star Wars, DBZ, Naruto, SpongeBob, Disney/Lorcana). All cards graded PSA, BGS, or SGC. No raw cards.'
    ),
    image: '',
    coinCount: '100 cards',
    category: 'Multi-Show Series',
  },
  {
    id: 'card-football-multi',
    name: 'ShackPack Football',
    description: d(
      '50 graded NFL cards per series — vintage rookie cards through modern Panini Prizm. All cards graded PSA, BGS, or SGC. No raw cards.'
    ),
    image: '',
    coinCount: '50 cards',
    category: 'Multi-Show Series',
  },
  {
    id: 'card-tcg-single',
    name: 'ShackPack TCG Single Show',
    description: d(
      '100 graded TCG cards — Pokémon and pop culture. Intended to be sold and opened within a single show. “Single Show” marked on product.'
    ),
    image: '',
    coinCount: '100 cards',
    category: 'Single Show Series',
  },
  {
    id: 'card-football-single',
    name: 'ShackPack Football Single Show',
    description: d(
      '50 graded NFL football cards. Intended to be sold and opened within a single show. “Single Show” marked on product.'
    ),
    image: '',
    coinCount: '50 cards',
    category: 'Single Show Series',
  },
];
