/**
 * Single source of truth for marketing repack cards (home + /repacks).
 * Image paths must match files under public/images/packs/.
 */

export type RepackCatalogItem = {
  id: string;
  name: string;
  description: string;
  image: string;
  coinCount: string;
  category: string;
};

const STANDARD_BLURB =
  'Contents may vary by date. Please refer to the checklist for the most up-to-date information on coin contents.';

export const REPACK_CATALOG: RepackCatalogItem[] = [
  {
    id: 'reign',
    name: 'Reign by Shackpack',
    description: STANDARD_BLURB,
    image: '/images/packs/shackpack-reign.png',
    coinCount: '10 coins total',
    category: '1/10 oz Gold',
  },
  {
    id: 'prominence',
    name: 'Prominence by Shackpack',
    description: STANDARD_BLURB,
    image: '/images/packs/shackpack-prominence.png',
    coinCount: '10 coins total',
    category: '1/4 oz Platinum',
  },
  {
    id: 'apex',
    name: 'Apex by Shackpack',
    description: STANDARD_BLURB,
    image: '/images/packs/shackpack-apex.png',
    coinCount: '10 coins total',
    category: '1/4 oz Gold',
  },
  {
    id: 'shackpack',
    name: 'ShackPack',
    description:
      'Contains one 1/10 oz gold coin and 9 varied silver coins. Perfect entry into premium coin collecting.',
    image: '/images/packs/Shackpack-starter.png',
    coinCount: '10 coins total',
    category: '1/10 oz Gold',
  },
  {
    id: 'shackpack-deluxe',
    name: 'ShackPack Deluxe',
    description:
      'Contains two 1/10 oz gold coins and 8 varied silver coins. Enhanced gold content for serious collectors.',
    image: '/images/packs/shackpack-deluxe.png',
    coinCount: '10 coins total',
    category: '2× 1/10 oz Gold',
  },
  {
    id: 'shackpack-xtreme',
    name: 'ShackPack Xtreme',
    description:
      'Contains one 1/4 oz gold coin and 9 varied silver coins. Increased gold weight with premium selections.',
    image: '/images/packs/shackpack-xtreme.png',
    coinCount: '10 coins total',
    category: '1/4 oz Gold',
  },
  {
    id: 'shackpack-unleashed',
    name: 'ShackPack Unleashed',
    description:
      'Contains two 1/4 oz gold coins and 8 varied silver coins. Double the gold for maximum impact.',
    image: '/images/packs/shackpack-unleashed.png',
    coinCount: '10 coins total',
    category: '2× 1/4 oz Gold',
  },
  {
    id: 'shackpack-resurgence',
    name: 'ShackPack Resurgence',
    description:
      'Contains one 1/2 oz gold coin and 9 varied silver coins. Substantial gold content with diverse silver pieces.',
    image: '/images/packs/shackpack-resurgence.png',
    coinCount: '10 coins total',
    category: '1/2 oz Gold',
  },
  {
    id: 'shackpack-transcendent',
    name: 'ShackPack Transcendent',
    description:
      'Contains one 1 oz gold coin and 9 varied silver coins. Our ultimate pack featuring a full troy ounce of gold.',
    image: '/images/packs/shackpack-transcendent.png',
    coinCount: '10 coins total',
    category: '1 oz Gold',
  },
  {
    id: 'shackpack-transcendent-transformed',
    name: 'ShackPack Transcendent Transformed',
    description:
      'Contains two 1 oz gold coins and 8 varied silver coins. Our ultimate transformed pack featuring two full troy ounces of gold.',
    image: '/images/packs/shackpack-transcscendenttransformed.png',
    coinCount: '10 coins total',
    category: '2× 1 oz Gold',
  },
  {
    id: 'shackpack-ignite',
    name: 'ShackPack Ignite',
    description:
      'Contains one 1/4 oz platinum coin and 9 varied silver coins. Exclusive platinum edition for discerning collectors.',
    image: '/images/packs/shackpack-ignite.PNG',
    coinCount: '10 coins total',
    category: '1/4 oz Platinum',
  },
  {
    id: 'shackpack-eclipse',
    name: 'ShackPack Eclipse',
    description:
      'Contains one 1 oz platinum coin and 9 varied silver coins. Ultimate platinum pack featuring a full troy ounce of platinum.',
    image: '/images/packs/shackpack-eclipse.PNG',
    coinCount: '10 coins total',
    category: '1 oz Platinum',
  },
  {
    id: 'shackpack-radiant',
    name: 'ShackPack Radiant',
    description: 'Contains one 1/2 oz platinum coin and 9 varied silver coins.',
    image: '/images/packs/shackpack-radiant.PNG',
    coinCount: '10 coins total',
    category: '1/2 oz Platinum',
  },
  {
    id: 'shackpack-expo',
    name: 'Shackpack Expo',
    description: STANDARD_BLURB,
    image: '/images/packs/shackpack-expo.png',
    coinCount: '10 coins total',
    category: 'Premium Line',
  },
  {
    id: 'shackpack-ascension',
    name: 'Shackpack Ascension',
    description: STANDARD_BLURB,
    image: '/images/packs/shackpack-ascension.png',
    coinCount: '10 coins total',
    category: 'Premium Line',
  },
  {
    id: 'shackpack-flex',
    name: 'Shackpack Flex',
    description: STANDARD_BLURB,
    image: '/images/packs/shackpack-flex.png',
    coinCount: '10 coins total',
    category: 'Premium Line',
  },
  {
    id: 'shackpack-pinnacle',
    name: 'Shackpack Pinnacle',
    description: STANDARD_BLURB,
    image: '/images/packs/shackpack-pinnacle.jpeg',
    coinCount: '10 coins total',
    category: 'Premium Line',
  },
  {
    id: 'shackpack-summit',
    name: 'Shackpack Summit',
    description: STANDARD_BLURB,
    image: '/images/packs/shackpack-summit.png',
    coinCount: '10 coins total',
    category: 'Premium Line',
  },
  {
    id: 'coinwave-platinum-drill',
    name: 'Coinwave Platinum Drill',
    description: STANDARD_BLURB,
    image: '/images/packs/shackpack-platinumdrill.png',
    coinCount: '10 coins total',
    category: 'Coinwave',
  },
  {
    id: 'coinwave-gold-pan',
    name: 'Coinwave Gold Pan',
    description: STANDARD_BLURB,
    image: '/images/packs/shackpack-goldpan.png',
    coinCount: '10 coins total',
    category: 'Coinwave',
  },
  {
    id: 'coinwave-the-mine',
    name: 'Coinwave The Mine',
    description: STANDARD_BLURB,
    image: '/images/packs/shackpack-themine.png',
    coinCount: '10 coins total',
    category: 'Coinwave',
  },
  {
    id: 'coinwave-gold-mine',
    name: 'Coinwave Gold Mine',
    description: STANDARD_BLURB,
    image: '/images/packs/shackpack-goldmine.png',
    coinCount: '10 coins total',
    category: 'Coinwave',
  },
  {
    id: 'currencyclash',
    name: 'Currency Clash by Shackpack',
    description:
      'A dynamic series featuring variable coin combinations that change frequently.',
    image: '/images/packs/shackpack-currencyclash.png',
    coinCount: 'Variable coins',
    category: 'Variable',
  },
  {
    id: 'aura',
    name: 'Aura by Shackpack',
    description: STANDARD_BLURB,
    image: '/images/packs/shackpack-aura.png',
    coinCount: '10 coins total',
    category: 'Variable',
  },
];

/**
 * Packs shown in the home page "Featured Packs" section only.
 * `/repacks` always lists {@link REPACK_CATALOG} in full.
 * Edit this list when you decide which packs to highlight on the home page.
 */
export const HOME_FEATURED_REPACK_IDS: string[] = [
  'reign',
  'prominence',
  'apex',
  'shackpack',
  'currencyclash',
  'shackpack-flex',
  'shackpack-ascension',
  'aura',
  'shackpack-ignite',
];

export function getHomeFeaturedPacks(): RepackCatalogItem[] {
  const byId = new Map(REPACK_CATALOG.map((p) => [p.id, p]));
  return HOME_FEATURED_REPACK_IDS.map((id) => byId.get(id)).filter(
    (p): p is RepackCatalogItem => p != null
  );
}
