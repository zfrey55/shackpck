/**
 * Single source of truth for marketing repack cards (home + /repacks).
 * Image paths must match files under public/images/packs/.
 *
 * Every pack is assigned to a customer `brand` (see lib/brands.ts). The Packs
 * and Checklist pages group packs by brand into per-customer tabs.
 *
 * Compliance note: every coin repack description deliberately defers to the
 * per-series published checklist. We do not claim specific contents (number
 * or breakdown of coins) on these tiles, because contents may vary by
 * series. Visit the linked checklist for the exact contents of any
 * specific dated series.
 */

import type { BrandId } from '@/lib/brands';

export type RepackCatalogItem = {
  id: string;
  name: string;
  description: string;
  image: string;
  coinCount?: string;
  /** Badge / pill next to coin count (metal tier + graded). */
  category: string;
  /** Owning customer brand. */
  brand: BrandId;
  /** When true, render the branded placeholder instead of `image`. */
  usePlaceholder?: boolean;
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
  // ----- ShackPack -----
  {
    id: 'reign',
    name: 'Reign by Shackpack',
    description: D,
    image: '/images/packs/shackpack-reign.png',
    coinCount: '10 coins',
    category: 'Pre-33 Gold & Silver | Graded',
    brand: 'shackpack',
  },
  {
    id: 'prominence',
    name: 'Prominence by Shackpack',
    description: D,
    image: '/images/packs/shackpack-prominence.png',
    coinCount: '10 coins',
    category: 'Pre-33 Gold & Silver | Graded',
    brand: 'shackpack',
  },
  {
    id: 'apex',
    name: 'Apex by Shackpack',
    description: D,
    image: '/images/packs/shackpack-apex.png',
    coinCount: '10 coins',
    category: 'Pre-33 5x Gold & Silver | Graded',
    brand: 'shackpack',
  },
  {
    id: 'shackpack',
    name: 'ShackPack',
    description: D,
    image: '/images/packs/Shackpack-starter.png',
    coinCount: '10 coins',
    category: 'Gold & Silver | Graded',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-deluxe',
    name: 'ShackPack Deluxe',
    description: D,
    image: '/images/packs/shackpack-deluxe.png',
    coinCount: '10 coins',
    category: '2x Gold & Silver | Graded',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-xtreme',
    name: 'ShackPack Xtreme',
    description: D,
    image: '/images/packs/shackpack-xtreme.png',
    coinCount: '10 coins',
    category: 'Gold & Silver | Graded',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-unleashed',
    name: 'ShackPack Unleashed',
    description: D,
    image: '/images/packs/shackpack-unleashed.png',
    coinCount: '10 coins',
    category: '2x Gold & Silver | Graded',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-resurgence',
    name: 'ShackPack Resurgence',
    description: D,
    image: '/images/packs/shackpack-resurgence.png',
    coinCount: '10 coins',
    category: 'Gold & Silver | Graded',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-transcendent',
    name: 'ShackPack Transcendent',
    description: D,
    image: '/images/packs/shackpack-transcendent.png',
    coinCount: '10 coins',
    category: 'Gold & Silver | Graded',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-transcendent-transformed',
    name: 'ShackPack Transcendent Transformed',
    description: D,
    image: '/images/packs/shackpack-transcscendenttransformed.png',
    coinCount: '10 coins',
    category: '2x Gold & Silver | Graded',
    brand: 'shackpack',
  },
  {
    id: 'aura',
    name: 'Aura by Shackpack',
    description: D,
    image: '/images/packs/shackpack-aura.png',
    coinCount: '10 coins',
    category: 'Pre-33 Gold & Silver | Graded',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-pinnacle',
    name: 'Pinnacle by Shackpack',
    description: D,
    image: '/images/packs/shackpack-pinnacle.jpeg',
    coinCount: '10 coins',
    category: 'Pre-33 2x Gold & Silver | Graded',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-ascension',
    name: 'Ascension by Shackpack',
    description: D,
    image: '/images/packs/shackpack-ascension.png',
    coinCount: '10 coins',
    category: 'Pre-33 2x Gold & Silver | Graded',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-summit',
    name: 'Summit by Shackpack',
    description: D,
    image: '/images/packs/shackpack-summit.png',
    coinCount: '10 coins',
    category: 'Pre-33 Gold & Silver | Graded',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-ignite',
    name: 'ShackPack Ignite',
    description: D,
    image: '/images/packs/shackpack-ignite.PNG',
    coinCount: '10 coins',
    category: 'Platinum & Silver | Graded',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-radiant',
    name: 'ShackPack Radiant',
    description: D,
    image: '/images/packs/shackpack-radiant.PNG',
    coinCount: '10 coins',
    category: 'Platinum & Silver | Graded',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-eclipse',
    name: 'ShackPack Eclipse',
    description: D,
    image: '/images/packs/shackpack-eclipse.PNG',
    coinCount: '10 coins',
    category: 'Platinum & Silver | Graded',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-flex',
    name: 'ShackPack Flex',
    description: D,
    image: '/images/packs/shackpack-flex.png',
    coinCount: 'Custom',
    category: 'Custom Series',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-expo',
    name: 'ShackPack Expo',
    description: D,
    image: '/images/packs/shackpack-expo.png',
    coinCount: 'Custom',
    category: 'Custom Series',
    brand: 'shackpack',
  },
  {
    id: 'currencyclash',
    name: 'Currency Clash by Shackpack',
    description: D,
    image: '/images/packs/shackpack-currencyclash.png',
    coinCount: 'Custom',
    category: 'Custom Series',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-67',
    name: 'ShackPack 67',
    description: D,
    image: '/images/packs/shackpack-67.png',
    category: 'Graded',
    brand: 'shackpack',
  },

  // ----- Coinwave -----
  {
    id: 'coinwave-gold-mine',
    name: 'Coinwave Gold Mine',
    description: D,
    image: '/images/packs/coinwave-goldmine.png',
    coinCount: '20 coins',
    category: 'Gold & Silver | Graded',
    brand: 'coinwave',
  },
  {
    id: 'coinwave-the-mine',
    name: 'Coinwave The Mine',
    description: D,
    image: '/images/packs/coinwave-themine.png',
    coinCount: '20 coins',
    category: 'Gold, Platinum & Silver | Graded',
    brand: 'coinwave',
  },
  {
    id: 'coinwave-platinum-drill',
    name: 'Coinwave Platinum Drill',
    description: D,
    image: '/images/packs/coinwave-platinumdrill.png',
    coinCount: '20 coins',
    category: 'Platinum & Silver | Graded',
    brand: 'coinwave',
  },
  {
    id: 'coinwave-gold-pan',
    name: 'Coinwave Gold Pan',
    description: D,
    image: '/images/packs/coinwave-goldpan.png',
    coinCount: '20 coins',
    category: 'Gold & Silver | Graded',
    brand: 'coinwave',
  },
  {
    id: 'coinwave-barrel',
    name: 'Coinwave Barrel',
    description: D,
    image: '/images/packs/coinwave-barrel.png',
    coinCount: '20 coins',
    category: 'Gold & Silver | Graded',
    brand: 'coinwave',
  },
  {
    id: 'coinwave-big-kahunas',
    name: 'Coinwave Big Kahunas',
    description: D,
    image: '/images/packs/coinwave-big-kahuna.png',
    coinCount: '20 coins',
    category: 'Gold & Silver | Graded',
    brand: 'coinwave',
  },
  {
    id: 'coinwave-splash',
    name: 'Coinwave Splash',
    description: D,
    image: '/images/packs/coinwave-splash.png',
    coinCount: '20 coins',
    category: 'Silver | Graded',
    brand: 'coinwave',
  },
  {
    id: 'coinwave-tsunami',
    name: 'Coinwave Tsunami',
    description: D,
    image: '/images/packs/coinwave-tsunami.png',
    coinCount: '20 coins',
    category: 'Gold & Silver | Graded',
    brand: 'coinwave',
  },
  {
    id: 'coinwave-megalodon',
    name: 'Coinwave Megalodon',
    description: D,
    image: '/images/packs/coinwave-megalodon.png',
    coinCount: '20 coins',
    category: 'Gold & Silver | Graded',
    brand: 'coinwave',
  },
  {
    id: 'coinwave-platinum-marlin',
    name: 'Coinwave Platinum Marlin',
    description: D,
    image: '/images/packs/coinwave-platinum-marlin.png',
    coinCount: '20 coins',
    category: 'Platinum & Silver | Graded',
    brand: 'coinwave',
  },
  {
    id: 'coinwave-golden-tuna',
    name: 'Coinwave Golden Tuna',
    description: D,
    image: '/images/packs/coinwave-golden-tuna.png',
    coinCount: '20 coins',
    category: 'Gold & Silver | Graded',
    brand: 'coinwave',
  },
  {
    id: 'coinwave-orca',
    name: 'Coinwave Orca',
    description: D,
    image: '/images/packs/coinwave-orca.png',
    category: 'Graded',
    brand: 'coinwave',
  },
  {
    id: 'coinwave-kraken',
    name: 'Coinwave Kraken',
    description: D,
    image: '/images/packs/coinwave-kraken.png',
    category: 'Graded',
    brand: 'coinwave',
  },

  // ----- Fortune Forge -----
  {
    id: 'fortuneforge-goldquest',
    name: 'Fortune Forge Gold Quest',
    description: D,
    image: '/images/packs/fortuneforge-goldquest.png',
    category: 'Gold & Silver | Graded',
    brand: 'fortune-forge',
  },
  {
    id: 'fortuneforge-platinumpursuit',
    name: 'Fortune Forge Platinum Pursuit',
    description: D,
    image: '/images/packs/fortuneforge-platinumpursuit.png',
    category: 'Platinum & Silver | Graded',
    brand: 'fortune-forge',
  },

  // ----- Bald Bunny -----
  {
    id: 'baldbunny-blacklabel',
    name: 'Bald Bunny Black Label',
    description: D,
    image: '/images/packs/baldbunny-blacklabel.png',
    category: 'Graded',
    brand: 'bald-bunny',
  },
  {
    id: 'baldbunny-pinkdiamond',
    name: 'Bald Bunny Pink Diamond',
    description: D,
    image: '/images/packs/baldbunny-pinkdiamond.png',
    category: 'Graded',
    brand: 'bald-bunny',
  },

  // ----- Lincoln Reserve -----
  {
    id: 'lincolnreserve-bangerbags',
    name: 'Lincoln Reserve Banger Bags',
    description: D,
    image: '/images/packs/lincolnreserve-bangerbags.png',
    category: 'Graded',
    brand: 'lincoln-reserve',
  },

  // ----- Blue Collar Bullion -----
  {
    id: 'bluecollarbullion-goldengirl',
    name: 'Blue Collar Bullion Golden Girl',
    description: D,
    image: '/images/packs/bluecollarbullion-goldengirl.png',
    category: 'Graded',
    brand: 'blue-collar-bullion',
  },

  // ----- Cobra Coin -----
  {
    id: 'cobracoin-shadow',
    name: 'Cobra Coin Shadow',
    description: D,
    image: '/images/packs/cobracoin-shadow.png',
    category: 'Graded',
    brand: 'cobra-coin',
  },
  {
    id: 'cobracoin-venom',
    name: 'Cobra Coin Venom',
    description: D,
    image: '/images/packs/cobracoin-venom.png',
    category: 'Graded',
    brand: 'cobra-coin',
  },
  {
    id: 'cobracoin-strike',
    name: 'Cobra Coin Strike',
    description: D,
    image: '/images/packs/cobracoin-strike.png',
    category: 'Graded',
    brand: 'cobra-coin',
  },

  // ----- Golden Emu -----
  {
    id: 'goldenemu-silveregg',
    name: 'Golden Emu Silver Egg',
    description: D,
    image: '/images/packs/goldenemu-silveregg.png',
    category: 'Graded',
    brand: 'golden-emu',
  },

  // ----- Juicebox Bullion -----
  {
    id: 'juicebox-singlesqueeze',
    name: 'Juicebox Bullion Single Squeeze',
    description: D,
    image: '/images/packs/juicebox-singlesqueeze.png',
    category: 'Graded',
    brand: 'juicebox-bullion',
  },
  {
    id: 'juicebox-doublesqueeze',
    name: 'Juicebox Bullion Double Squeeze',
    description: D,
    image: '/images/packs/juicebox-doublesqueeze.png',
    category: 'Graded',
    brand: 'juicebox-bullion',
  },
  {
    id: 'juicebox-fullsqueeze',
    name: 'Juicebox Bullion Full Squeeze',
    description: D,
    image: '/images/packs/juicebox-fullsqueeze.png',
    category: 'Graded',
    brand: 'juicebox-bullion',
  },

  // ----- One Nasty Coin -----
  {
    id: 'onenastycoin-mysterypack',
    name: 'One Nasty Coin Mystery Pack',
    description: D,
    image: '/images/packs/onenastycoin-mysterypack.png',
    category: 'Graded',
    brand: 'one-nasty-coin',
  },
];

/** All coin packs belonging to a brand, in catalog order. */
export function getCoinPacksForBrand(brand: BrandId): RepackCatalogItem[] {
  return REPACK_CATALOG.filter((p) => p.brand === brand);
}

/**
 * Packs shown in the home page "Featured Packs" section only.
 * `/repacks` always lists {@link REPACK_CATALOG} in full (grouped by brand).
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
