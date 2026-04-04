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
  /** Badge / pill next to coin count (metal tier + graded). */
  category: string;
};

/** Appended to every static pack description site-wide (compliance). */
export const REPACK_CHECKLIST_DISCLAIMER =
  'Contents vary by series and are subject to change — see checklist for details.';

const d = (body: string) => `${body.trim()} ${REPACK_CHECKLIST_DISCLAIMER}`;

export const REPACK_CATALOG: RepackCatalogItem[] = [
  {
    id: 'reign',
    name: 'Reign by Shackpack',
    description: d(
      '10 coins per pack — 1× pre-1933 gold coin and 9 graded silver coins. All coins are graded.'
    ),
    image: '/images/packs/shackpack-reign.png',
    coinCount: '10 coins',
    category: 'Pre-33 Gold & Silver | Graded',
  },
  {
    id: 'prominence',
    name: 'Prominence by Shackpack',
    description: d(
      '10 coins per pack — 1× pre-1933 gold coin and 9 graded silver coins. All coins are graded.'
    ),
    image: '/images/packs/shackpack-prominence.png',
    coinCount: '10 coins',
    category: 'Pre-33 Gold & Silver | Graded',
  },
  {
    id: 'apex',
    name: 'Apex by Shackpack',
    description: d(
      '10 coins per pack — 5× gold coins and 5 graded silver coins. All coins are graded.'
    ),
    image: '/images/packs/shackpack-apex.png',
    coinCount: '10 coins',
    category: 'Pre-33 5x Gold & Silver | Graded',
  },
  {
    id: 'shackpack',
    name: 'ShackPack',
    description: d(
      '10 coins per pack — 1× gold coin and 9 graded silver coins. All coins are graded.'
    ),
    image: '/images/packs/Shackpack-starter.png',
    coinCount: '10 coins',
    category: 'Gold & Silver | Graded',
  },
  {
    id: 'shackpack-deluxe',
    name: 'ShackPack Deluxe',
    description: d(
      '10 coins per pack — 2× gold coins and 8 graded silver coins. All coins are graded.'
    ),
    image: '/images/packs/shackpack-deluxe.png',
    coinCount: '10 coins',
    category: '2x Gold & Silver | Graded',
  },
  {
    id: 'shackpack-xtreme',
    name: 'ShackPack Xtreme',
    description: d(
      '10 coins per pack — 1× gold coin and 9 graded silver coins. All coins are graded.'
    ),
    image: '/images/packs/shackpack-xtreme.png',
    coinCount: '10 coins',
    category: 'Gold & Silver | Graded',
  },
  {
    id: 'shackpack-unleashed',
    name: 'ShackPack Unleashed',
    description: d(
      '10 coins per pack — 2× gold coins and 8 graded silver coins. All coins are graded.'
    ),
    image: '/images/packs/shackpack-unleashed.png',
    coinCount: '10 coins',
    category: '2x Gold & Silver | Graded',
  },
  {
    id: 'shackpack-resurgence',
    name: 'ShackPack Resurgence',
    description: d(
      '10 coins per pack — 1× gold coin and 9 graded silver coins. All coins are graded.'
    ),
    image: '/images/packs/shackpack-resurgence.png',
    coinCount: '10 coins',
    category: 'Gold & Silver | Graded',
  },
  {
    id: 'shackpack-transcendent',
    name: 'ShackPack Transcendent',
    description: d(
      '10 coins per pack — 1× gold coin and 9 graded silver coins. All coins are graded.'
    ),
    image: '/images/packs/shackpack-transcendent.png',
    coinCount: '10 coins',
    category: 'Gold & Silver | Graded',
  },
  {
    id: 'shackpack-transcendent-transformed',
    name: 'ShackPack Transcendent Transformed',
    description: d(
      '10 coins per pack — 2× gold coins and 8 graded silver coins. All coins are graded.'
    ),
    image: '/images/packs/shackpack-transcscendenttransformed.png',
    coinCount: '10 coins',
    category: '2x Gold & Silver | Graded',
  },
  {
    id: 'aura',
    name: 'Aura by Shackpack',
    description: d(
      '10 coins per pack — 1× pre-1933 gold coin and 9 graded silver coins. All coins are graded.'
    ),
    image: '/images/packs/shackpack-aura.png',
    coinCount: '10 coins',
    category: 'Pre-33 Gold & Silver | Graded',
  },
  {
    id: 'shackpack-pinnacle',
    name: 'Pinnacle by Shackpack',
    description: d(
      '10 coins per pack — 2× pre-1933 gold coins and 8 graded silver coins. All coins are graded.'
    ),
    image: '/images/packs/shackpack-pinnacle.jpeg',
    coinCount: '10 coins',
    category: 'Pre-33 2x Gold & Silver | Graded',
  },
  {
    id: 'shackpack-ascension',
    name: 'Ascension by Shackpack',
    description: d(
      '10 coins per pack — 2× pre-1933 gold coins and 8 graded silver coins. All coins are graded.'
    ),
    image: '/images/packs/shackpack-ascension.png',
    coinCount: '10 coins',
    category: 'Pre-33 2x Gold & Silver | Graded',
  },
  {
    id: 'shackpack-summit',
    name: 'Summit by Shackpack',
    description: d(
      '10 coins per pack — 1× pre-1933 gold coin and 9 graded silver coins. All coins are graded.'
    ),
    image: '/images/packs/shackpack-summit.png',
    coinCount: '10 coins',
    category: 'Pre-33 Gold & Silver | Graded',
  },
  {
    id: 'shackpack-ignite',
    name: 'ShackPack Ignite',
    description: d(
      '10 coins per pack — 1× platinum coin and 9 graded silver coins. All coins are graded.'
    ),
    image: '/images/packs/shackpack-ignite.PNG',
    coinCount: '10 coins',
    category: 'Platinum & Silver | Graded',
  },
  {
    id: 'shackpack-radiant',
    name: 'ShackPack Radiant',
    description: d(
      '10 coins per pack — 1× platinum coin and 9 graded silver coins. All coins are graded.'
    ),
    image: '/images/packs/shackpack-radiant.PNG',
    coinCount: '10 coins',
    category: 'Platinum & Silver | Graded',
  },
  {
    id: 'shackpack-eclipse',
    name: 'ShackPack Eclipse',
    description: d(
      '10 coins per pack — 1× platinum coin and 9 graded silver coins. All coins are graded.'
    ),
    image: '/images/packs/shackpack-eclipse.PNG',
    coinCount: '10 coins',
    category: 'Platinum & Silver | Graded',
  },
  {
    id: 'coinwave-gold-mine',
    name: 'Coinwave Gold Mine',
    description: d(
      '20 coins per pack — 1× gold coin, 2× Silver Eagles, and 17 graded coins. All coins are graded.'
    ),
    image: '/images/packs/shackpack-goldmine.png',
    coinCount: '20 coins',
    category: 'Gold & Silver | Graded',
  },
  {
    id: 'coinwave-the-mine',
    name: 'Coinwave The Mine',
    description: d(
      '20 coins per pack — 1× gold coin, 1× platinum coin, 1× Silver Eagle, and 17 graded coins. All coins are graded.'
    ),
    image: '/images/packs/shackpack-themine.png',
    coinCount: '20 coins',
    category: 'Gold, Platinum & Silver | Graded',
  },
  {
    id: 'coinwave-platinum-drill',
    name: 'Coinwave Platinum Drill',
    description: d(
      '20 coins per pack — 1× platinum coin, 2× Silver Eagles, and 17 graded coins. All coins are graded.'
    ),
    image: '/images/packs/shackpack-platinumdrill.png',
    coinCount: '20 coins',
    category: 'Platinum & Silver | Graded',
  },
  {
    id: 'coinwave-gold-pan',
    name: 'Coinwave Gold Pan',
    description: d(
      '20 coins per pack — 1× gold coin, 2× Silver Eagles, and 17 graded coins. All coins are graded.'
    ),
    image: '/images/packs/shackpack-goldpan.png',
    coinCount: '20 coins',
    category: 'Gold & Silver | Graded',
  },
  {
    id: 'shackpack-flex',
    name: 'ShackPack Flex',
    description: d(
      'A fully custom ShackPack configuration built to your specifications. Coin count, metal type, and grading service are customized per order. Each Flex series has its own published checklist — contact us to build your series, then see your series checklist for complete contents details.'
    ),
    image: '/images/packs/shackpack-flex.png',
    coinCount: 'Custom',
    category: 'Custom Series',
  },
  {
    id: 'shackpack-expo',
    name: 'ShackPack Expo',
    description: d(
      'A custom ShackPack series built for events and special occasions. Configuration varies by order. Each Expo series has its own published checklist — contact us to get started, then see your series checklist for complete contents details.'
    ),
    image: '/images/packs/shackpack-expo.png',
    coinCount: 'Custom',
    category: 'Custom Series',
  },
  {
    id: 'currencyclash',
    name: 'Currency Clash by Shackpack',
    description: d(
      'A custom ShackPack series featuring a curated mix of currency and coin combinations configured per order. Each Currency Clash series has its own published checklist — contact us to configure your series, then see your series checklist for complete contents details.'
    ),
    image: '/images/packs/shackpack-currencyclash.png',
    coinCount: 'Custom',
    category: 'Custom Series',
  },
];

/**
 * Packs shown in the home page "Featured Packs" section only.
 * `/repacks` always lists {@link REPACK_CATALOG} in full.
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
