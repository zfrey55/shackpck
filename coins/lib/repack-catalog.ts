/**
 * Single source of truth for marketing repack cards (home + /repacks).
 * Image paths must match files under public/images/packs/.
 *
 * Compliance note: every coin repack description deliberately defers to the
 * per-series published checklist. We do not claim specific contents (number
 * or breakdown of coins) on these tiles, because contents may vary by
 * series. Visit the linked checklist for the exact contents of any
 * specific dated series.
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

/**
 * Uniform description used on every coin repack tile. Per the policy above,
 * tile copy never makes specific contents claims — it always points to the
 * checklist for that specific series.
 */
export const REPACK_CHECKLIST_DISCLAIMER =
  'Contents vary by series — see checklist for more details.';

/** Convenience alias used throughout this file to keep entries terse. */
const D = REPACK_CHECKLIST_DISCLAIMER;

export const REPACK_CATALOG: RepackCatalogItem[] = [
  {
    id: 'reign',
    name: 'Reign by Shackpack',
    description: D,
    image: '/images/packs/shackpack-reign.png',
    coinCount: '10 coins',
    category: 'Pre-33 Gold & Silver | Graded',
  },
  {
    id: 'prominence',
    name: 'Prominence by Shackpack',
    description: D,
    image: '/images/packs/shackpack-prominence.png',
    coinCount: '10 coins',
    category: 'Pre-33 Gold & Silver | Graded',
  },
  {
    id: 'apex',
    name: 'Apex by Shackpack',
    description: D,
    image: '/images/packs/shackpack-apex.png',
    coinCount: '10 coins',
    category: 'Pre-33 5x Gold & Silver | Graded',
  },
  {
    id: 'shackpack',
    name: 'ShackPack',
    description: D,
    image: '/images/packs/Shackpack-starter.png',
    coinCount: '10 coins',
    category: 'Gold & Silver | Graded',
  },
  {
    id: 'shackpack-deluxe',
    name: 'ShackPack Deluxe',
    description: D,
    image: '/images/packs/shackpack-deluxe.png',
    coinCount: '10 coins',
    category: '2x Gold & Silver | Graded',
  },
  {
    id: 'shackpack-xtreme',
    name: 'ShackPack Xtreme',
    description: D,
    image: '/images/packs/shackpack-xtreme.png',
    coinCount: '10 coins',
    category: 'Gold & Silver | Graded',
  },
  {
    id: 'shackpack-unleashed',
    name: 'ShackPack Unleashed',
    description: D,
    image: '/images/packs/shackpack-unleashed.png',
    coinCount: '10 coins',
    category: '2x Gold & Silver | Graded',
  },
  {
    id: 'shackpack-resurgence',
    name: 'ShackPack Resurgence',
    description: D,
    image: '/images/packs/shackpack-resurgence.png',
    coinCount: '10 coins',
    category: 'Gold & Silver | Graded',
  },
  {
    id: 'shackpack-transcendent',
    name: 'ShackPack Transcendent',
    description: D,
    image: '/images/packs/shackpack-transcendent.png',
    coinCount: '10 coins',
    category: 'Gold & Silver | Graded',
  },
  {
    id: 'shackpack-transcendent-transformed',
    name: 'ShackPack Transcendent Transformed',
    description: D,
    image: '/images/packs/shackpack-transcscendenttransformed.png',
    coinCount: '10 coins',
    category: '2x Gold & Silver | Graded',
  },
  {
    id: 'aura',
    name: 'Aura by Shackpack',
    description: D,
    image: '/images/packs/shackpack-aura.png',
    coinCount: '10 coins',
    category: 'Pre-33 Gold & Silver | Graded',
  },
  {
    id: 'shackpack-pinnacle',
    name: 'Pinnacle by Shackpack',
    description: D,
    image: '/images/packs/shackpack-pinnacle.jpeg',
    coinCount: '10 coins',
    category: 'Pre-33 2x Gold & Silver | Graded',
  },
  {
    id: 'shackpack-ascension',
    name: 'Ascension by Shackpack',
    description: D,
    image: '/images/packs/shackpack-ascension.png',
    coinCount: '10 coins',
    category: 'Pre-33 2x Gold & Silver | Graded',
  },
  {
    id: 'shackpack-summit',
    name: 'Summit by Shackpack',
    description: D,
    image: '/images/packs/shackpack-summit.png',
    coinCount: '10 coins',
    category: 'Pre-33 Gold & Silver | Graded',
  },
  {
    id: 'shackpack-ignite',
    name: 'ShackPack Ignite',
    description: D,
    image: '/images/packs/shackpack-ignite.PNG',
    coinCount: '10 coins',
    category: 'Platinum & Silver | Graded',
  },
  {
    id: 'shackpack-radiant',
    name: 'ShackPack Radiant',
    description: D,
    image: '/images/packs/shackpack-radiant.PNG',
    coinCount: '10 coins',
    category: 'Platinum & Silver | Graded',
  },
  {
    id: 'shackpack-eclipse',
    name: 'ShackPack Eclipse',
    description: D,
    image: '/images/packs/shackpack-eclipse.PNG',
    coinCount: '10 coins',
    category: 'Platinum & Silver | Graded',
  },

  // ----- Coinwave family -----
  {
    id: 'coinwave-gold-mine',
    name: 'Coinwave Gold Mine',
    description: D,
    image: '/images/packs/shackpack-goldmine.png',
    coinCount: '20 coins',
    category: 'Gold & Silver | Graded',
  },
  {
    id: 'coinwave-the-mine',
    name: 'Coinwave The Mine',
    description: D,
    image: '/images/packs/shackpack-themine.png',
    coinCount: '20 coins',
    category: 'Gold, Platinum & Silver | Graded',
  },
  {
    id: 'coinwave-platinum-drill',
    name: 'Coinwave Platinum Drill',
    description: D,
    image: '/images/packs/shackpack-platinumdrill.png',
    coinCount: '20 coins',
    category: 'Platinum & Silver | Graded',
  },
  {
    id: 'coinwave-gold-pan',
    name: 'Coinwave Gold Pan',
    description: D,
    image: '/images/packs/shackpack-goldpan.png',
    coinCount: '20 coins',
    category: 'Gold & Silver | Graded',
  },
  {
    id: 'coinwave-barrel',
    name: 'Coinwave Barrel',
    description: D,
    image: '/images/packs/shackpack-barrel.png',
    coinCount: '20 coins',
    category: 'Gold & Silver | Graded',
  },
  {
    id: 'coinwave-big-kahunas',
    name: 'Coinwave Big Kahunas',
    description: D,
    image: '/images/packs/shackpack-big-kahuna.png',
    coinCount: '20 coins',
    category: 'Gold & Silver | Graded',
  },
  {
    id: 'coinwave-splash',
    name: 'Coinwave Splash',
    description: D,
    image: '/images/packs/shackpack-splash.png',
    coinCount: '20 coins',
    category: 'Silver | Graded',
  },
  {
    id: 'coinwave-tsunami',
    name: 'Coinwave Tsunami',
    description: D,
    image: '/images/packs/shackpack-tsunami.png',
    coinCount: '20 coins',
    category: 'Gold & Silver | Graded',
  },
  {
    id: 'coinwave-megalodon',
    name: 'Coinwave Megalodon',
    description: D,
    image: '/images/packs/shackpack-megalodon.png',
    coinCount: '20 coins',
    category: 'Gold & Silver | Graded',
  },
  {
    id: 'coinwave-platinum-marlin',
    name: 'Coinwave Platinum Marlin',
    description: D,
    image: '/images/packs/shackpack-platinum-marlin.png',
    coinCount: '20 coins',
    category: 'Platinum & Silver | Graded',
  },
  {
    id: 'coinwave-golden-tuna',
    name: 'Coinwave Golden Tuna',
    description: D,
    image: '/images/packs/shackpack-golden-tuna.png',
    coinCount: '20 coins',
    category: 'Gold & Silver | Graded',
  },

  // ----- Custom series -----
  {
    id: 'shackpack-flex',
    name: 'ShackPack Flex',
    description: D,
    image: '/images/packs/shackpack-flex.png',
    coinCount: 'Custom',
    category: 'Custom Series',
  },
  {
    id: 'shackpack-expo',
    name: 'ShackPack Expo',
    description: D,
    image: '/images/packs/shackpack-expo.png',
    coinCount: 'Custom',
    category: 'Custom Series',
  },
  {
    id: 'currencyclash',
    name: 'Currency Clash by Shackpack',
    description: D,
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
