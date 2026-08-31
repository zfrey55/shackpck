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
  /**
   * Product-line badge on the tile. Deliberately NOT a contents claim —
   * it names the line ('Coins', 'Sports Cards'), never what is inside.
   */
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

/**
 * Statement shown under a FINALIZED example checklist.
 *
 * Sits beside the disclaimer above because it is the same kind of statement —
 * standing copy about a checklist, defined once and never inlined. It is the
 * one thing on the site that narrows the disclaimer: "contents vary by series"
 * remains true across series, while this says THIS series is closed.
 *
 * Rendered only for an example that carries `finalizedOn` (see
 * lib/card-example-checklists), so an example without a finalization date
 * shows nothing rather than an empty or guessed claim.
 *
 * @param date Human-readable finalization date, already formatted.
 */
export function seriesFinalizedStatement(date: string): string {
  return (
    `As of ${date}, this series has been finalized. The number of packs and ` +
    'the number of items in the series will not change.'
  );
}

/** Convenience alias used throughout this file to keep entries terse. */
const D = REPACK_CHECKLIST_DISCLAIMER;

export const REPACK_CATALOG: RepackCatalogItem[] = [
  // ----- ShackPack -----
  {
    id: 'reign',
    name: 'Reign by Shackpack',
    description: D,
    image: '/images/packs/shackpack-reign.png',
    category: 'Coins',
    brand: 'shackpack',
  },
  {
    id: 'prominence',
    name: 'Prominence by Shackpack',
    description: D,
    image: '/images/packs/shackpack-prominence.png',
    category: 'Coins',
    brand: 'shackpack',
  },
  {
    id: 'apex',
    name: 'Apex by Shackpack',
    description: D,
    image: '/images/packs/shackpack-apex.png',
    category: 'Coins',
    brand: 'shackpack',
  },
  {
    id: 'shackpack',
    name: 'ShackPack',
    description: D,
    image: '/images/packs/Shackpack-starter.png',
    category: 'Coins',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-deluxe',
    name: 'ShackPack Deluxe',
    description: D,
    image: '/images/packs/shackpack-deluxe.png',
    category: 'Coins',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-xtreme',
    name: 'ShackPack Xtreme',
    description: D,
    image: '/images/packs/shackpack-xtreme.png',
    category: 'Coins',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-unleashed',
    name: 'ShackPack Unleashed',
    description: D,
    image: '/images/packs/shackpack-unleashed.png',
    category: 'Coins',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-resurgence',
    name: 'ShackPack Resurgence',
    description: D,
    image: '/images/packs/shackpack-resurgence.png',
    category: 'Coins',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-transcendent',
    name: 'ShackPack Transcendent',
    description: D,
    image: '/images/packs/shackpack-transcendent.png',
    category: 'Coins',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-transcendent-transformed',
    name: 'ShackPack Transcendent Transformed',
    description: D,
    image: '/images/packs/shackpack-transcscendenttransformed.png',
    category: 'Coins',
    brand: 'shackpack',
  },
  {
    id: 'aura',
    name: 'Aura by Shackpack',
    description: D,
    image: '/images/packs/shackpack-aura.png',
    category: 'Coins',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-pinnacle',
    name: 'Pinnacle by Shackpack',
    description: D,
    image: '/images/packs/shackpack-pinnacle.png',
    category: 'Coins',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-ascension',
    name: 'Ascension by Shackpack',
    description: D,
    image: '/images/packs/shackpack-ascension.png',
    category: 'Coins',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-summit',
    name: 'Summit by Shackpack',
    description: D,
    image: '/images/packs/shackpack-summit.png',
    category: 'Coins',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-ignite',
    name: 'ShackPack Ignite',
    description: D,
    image: '/images/packs/shackpack-ignite.PNG',
    category: 'Coins',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-radiant',
    name: 'ShackPack Radiant',
    description: D,
    image: '/images/packs/shackpack-radiant.PNG',
    category: 'Coins',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-eclipse',
    name: 'ShackPack Eclipse',
    description: D,
    image: '/images/packs/shackpack-eclipse.PNG',
    category: 'Coins',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-flex',
    name: 'ShackPack Flex',
    description: D,
    image: '/images/packs/shackpack-flex.png',
    category: 'Coins',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-expo',
    name: 'ShackPack Expo',
    description: D,
    image: '/images/packs/shackpack-expo.png',
    category: 'Coins',
    brand: 'shackpack',
  },
  {
    id: 'currencyclash',
    name: 'Currency Clash by Shackpack',
    description: D,
    image: '/images/packs/shackpack-currencyclash.png',
    category: 'Coins',
    brand: 'shackpack',
  },
  {
    id: 'shackpack-67',
    name: 'ShackPack 67',
    description: D,
    image: '/images/packs/shackpack-67.png',
    category: 'Coins',
    brand: 'shackpack',
  },

  // ----- Coinwave -----
  {
    id: 'coinwave-gold-mine',
    name: 'Coinwave Gold Mine',
    description: D,
    image: '/images/packs/coinwave-goldmine.png',
    category: 'Coins',
    brand: 'coinwave',
  },
  {
    id: 'coinwave-the-mine',
    name: 'Coinwave The Mine',
    description: D,
    image: '/images/packs/coinwave-themine.png',
    category: 'Coins',
    brand: 'coinwave',
  },
  {
    id: 'coinwave-platinum-drill',
    name: 'Coinwave Platinum Drill',
    description: D,
    image: '/images/packs/coinwave-platinumdrill.png',
    category: 'Coins',
    brand: 'coinwave',
  },
  {
    id: 'coinwave-gold-pan',
    name: 'Coinwave Gold Pan',
    description: D,
    image: '/images/packs/coinwave-goldpan.png',
    category: 'Coins',
    brand: 'coinwave',
  },
  {
    id: 'coinwave-barrel',
    name: 'Coinwave Barrel',
    description: D,
    image: '/images/packs/coinwave-barrel.png',
    category: 'Coins',
    brand: 'coinwave',
  },
  {
    id: 'coinwave-big-kahunas',
    name: 'Coinwave Big Kahunas',
    description: D,
    image: '/images/packs/coinwave-big-kahuna.png',
    category: 'Coins',
    brand: 'coinwave',
  },
  {
    id: 'coinwave-splash',
    name: 'Coinwave Splash',
    description: D,
    image: '/images/packs/coinwave-splash.png',
    category: 'Coins',
    brand: 'coinwave',
  },
  {
    id: 'coinwave-tsunami',
    name: 'Coinwave Tsunami',
    description: D,
    image: '/images/packs/coinwave-tsunami.png',
    category: 'Coins',
    brand: 'coinwave',
  },
  {
    id: 'coinwave-megalodon',
    name: 'Coinwave Megalodon',
    description: D,
    image: '/images/packs/coinwave-megalodon.png',
    category: 'Coins',
    brand: 'coinwave',
  },
  {
    id: 'coinwave-platinum-marlin',
    name: 'Coinwave Platinum Marlin',
    description: D,
    image: '/images/packs/coinwave-platinum-marlin.png',
    category: 'Coins',
    brand: 'coinwave',
  },
  {
    id: 'coinwave-golden-tuna',
    name: 'Coinwave Golden Tuna',
    description: D,
    image: '/images/packs/coinwave-golden-tuna.png',
    category: 'Coins',
    brand: 'coinwave',
  },
  {
    id: 'coinwave-orca',
    name: 'Coinwave Orca',
    description: D,
    image: '/images/packs/coinwave-orca.png',
    category: 'Coins',
    brand: 'coinwave',
  },
  {
    id: 'coinwave-kraken',
    name: 'Coinwave Kraken',
    description: D,
    image: '/images/packs/coinwave-kraken.png',
    category: 'Coins',
    brand: 'coinwave',
  },
  {
    id: 'coinwave-silver-hook',
    name: 'Coinwave Silver Hook',
    description: D,
    image: '/images/packs/coinwave-silverhook.png',
    category: 'Coins',
    brand: 'coinwave',
  },

  // ----- Fortune Forge -----
  {
    id: 'fortuneforge-goldquest',
    name: 'Fortune Forge Gold Quest',
    description: D,
    image: '/images/packs/fortuneforge-goldquest.png',
    category: 'Coins',
    brand: 'fortune-forge',
  },
  {
    id: 'fortuneforge-platinumpursuit',
    name: 'Fortune Forge Platinum Pursuit',
    description: D,
    image: '/images/packs/fortuneforge-platinumpursuit.png',
    category: 'Coins',
    brand: 'fortune-forge',
  },
  {
    id: 'fortuneforge-goldconquest',
    name: 'Fortune Forge Gold Conquest',
    description: D,
    image: '/images/packs/fortuneforge-goldconquest.png',
    category: 'Coins',
    brand: 'fortune-forge',
  },

  // ----- Bald Bunny -----
  {
    id: 'baldbunny-blacklabel',
    name: 'Bald Bunny Black Label',
    description: D,
    image: '/images/packs/baldbunny-blacklabel.png',
    category: 'Coins',
    brand: 'bald-bunny',
  },
  {
    id: 'baldbunny-pinkdiamond',
    name: 'Bald Bunny Pink Diamond',
    description: D,
    image: '/images/packs/baldbunny-pinkdiamond.png',
    category: 'Coins',
    brand: 'bald-bunny',
  },

  // ----- Lincoln Reserve -----
  {
    id: 'lincolnreserve-bangerbags',
    name: 'Lincoln Reserve Banger Bags',
    description: D,
    image: '/images/packs/lincolnreserve-bangerbags.png',
    category: 'Coins',
    brand: 'lincoln-reserve',
  },

  // ----- Blue Collar Bullion -----
  {
    id: 'bluecollarbullion-goldengirl',
    name: 'Blue Collar Bullion Golden Girl',
    description: D,
    image: '/images/packs/bluecollarbullion-goldengirl.png',
    category: 'Coins',
    brand: 'blue-collar-bullion',
  },

  // ----- Cobra Coin -----
  {
    id: 'cobracoin-shadow',
    name: 'Cobra Coin Shadow',
    description: D,
    image: '/images/packs/cobracoin-shadow.png',
    category: 'Coins',
    brand: 'cobra-coin',
  },
  {
    id: 'cobracoin-venom',
    name: 'Cobra Coin Venom',
    description: D,
    image: '/images/packs/cobracoin-venom.png',
    category: 'Coins',
    brand: 'cobra-coin',
  },
  {
    id: 'cobracoin-strike',
    name: 'Cobra Coin Strike',
    description: D,
    image: '/images/packs/cobracoin-strike.png',
    category: 'Coins',
    brand: 'cobra-coin',
  },

  // ----- Golden Emu -----
  {
    id: 'goldenemu-silveregg',
    name: 'Golden Emu Silver Egg',
    description: D,
    image: '/images/packs/goldenemu-silveregg.png',
    category: 'Coins',
    brand: 'golden-emu',
  },
  {
    id: 'goldenemu-nesteggtreasurepack',
    name: 'Golden Emu Nest Egg Treasure Pack',
    description: D,
    image: '/images/packs/goldenemu-nesteggtreasurepack.png',
    category: 'Coins',
    brand: 'golden-emu',
  },

  // ----- Juicebox Bullion -----
  {
    id: 'juicebox-singlesqueeze',
    name: 'Juicebox Bullion Single Squeeze',
    description: D,
    image: '/images/packs/juicebox-singlesqueeze.png',
    category: 'Coins',
    brand: 'juicebox-bullion',
  },
  {
    id: 'juicebox-doublesqueeze',
    name: 'Juicebox Bullion Double Squeeze',
    description: D,
    image: '/images/packs/juicebox-doublesqueeze.png',
    category: 'Coins',
    brand: 'juicebox-bullion',
  },
  {
    id: 'juicebox-fullsqueeze',
    name: 'Juicebox Bullion Full Squeeze',
    description: D,
    image: '/images/packs/juicebox-fullsqueeze.png',
    category: 'Coins',
    brand: 'juicebox-bullion',
  },

  // ----- One Nasty Coin -----
  {
    id: 'onenastycoin-mysterypack',
    name: 'One Nasty Coin Mystery Pack',
    description: D,
    image: '/images/packs/onenastycoin-mysterypack.png',
    category: 'Coins',
    brand: 'one-nasty-coin',
  },

  // ----- Bullion Bureau -----
  {
    id: 'bullionbureau-classified',
    name: 'Bullion Bureau Classified',
    description: D,
    image: '/images/packs/bullionbureau-classified.png',
    category: 'Coins',
    brand: 'bullion-bureau',
  },
  {
    id: 'bullionbureau-directorsvault',
    name: 'Bullion Bureau Director\'s Vault',
    description: D,
    image: '/images/packs/bullionbureau-directorsvault.png',
    category: 'Coins',
    brand: 'bullion-bureau',
  },
  {
    id: 'bullionbureau-executivereserve',
    name: 'Bullion Bureau Executive Reserve',
    description: D,
    image: '/images/packs/bullionbureau-executivereserve.png',
    category: 'Coins',
    brand: 'bullion-bureau',
  },
  {
    id: 'bullionbureau-goldmarshal',
    name: 'Bullion Bureau Gold Marshal',
    description: D,
    image: '/images/packs/bullionbureau-goldmarshal.png',
    category: 'Coins',
    brand: 'bullion-bureau',
  },
  {
    id: 'bullionbureau-noblebureau',
    name: 'Bullion Bureau Noble Bureau',
    description: D,
    image: '/images/packs/bullionbureau-noblebureau.png',
    category: 'Coins',
    brand: 'bullion-bureau',
  },
  {
    id: 'bullionbureau-platinumcommand',
    name: 'Bullion Bureau Platinum Command',
    description: D,
    image: '/images/packs/bullionbureau-platinumcommand.png',
    category: 'Coins',
    brand: 'bullion-bureau',
  },
  {
    id: 'bullionbureau-silversheriff',
    name: 'Bullion Bureau Silver Sheriff',
    description: D,
    image: '/images/packs/bullionbureau-silversheriff.png',
    category: 'Coins',
    brand: 'bullion-bureau',
  },
  {
    id: 'bullionbureau-treasuryreserve',
    name: 'Bullion Bureau Treasury Reserve',
    description: D,
    image: '/images/packs/bullionbureau-treasuryreserve.png',
    category: 'Coins',
    brand: 'bullion-bureau',
  },

  // ----- Let It Ride -----
  {
    id: 'letitride-fullyinvolved',
    name: 'Let It Ride Fully Involved',
    description: D,
    image: '/images/packs/letitride-fullyinvolved.png',
    category: 'Coins',
    brand: 'let-it-ride',
  },
  {
    id: 'letitride-jobtown',
    name: 'Let It Ride Job Town',
    description: D,
    image: '/images/packs/letitride-jobtown.png',
    category: 'Coins',
    brand: 'let-it-ride',
  },

  // ----- Black Mountain Coins & Stamps -----
  // Tile name uses the short brand name; the full wordmark already
  // appears in the brand header above the grid.
  {
    id: 'blackmountain-starter',
    name: 'Black Mountain Starter',
    description: D,
    image: '/images/packs/blackmountain-starter.png',
    category: 'Coins',
    brand: 'black-mountain',
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
