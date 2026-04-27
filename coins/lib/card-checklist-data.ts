/**
 * Static card checklist content for the four ShackPack card product lines.
 *
 * Naming convention mirrors the coin checklists:
 *   "{ShackPack ProductName} Series #N" + a separate finalization date.
 *
 * Structure is dynamic-capable: each product line is a "case type" that can
 * have any number of finalized series (Series #1, Series #2, …). For now we
 * seed one example series per product. When the inventory system + API is
 * wired up later, this file becomes the read-side projection of that data
 * (or is replaced by an API call) without UI changes.
 *
 * Each series exposes the data Whatnot's Identified Product List audit
 * requires: Brand/Manufacturer, Title of Product, Series Name, Condition,
 * Quantity per item, distinguishing features per row (year, set, name,
 * variation, language for TCG, grade), and an explicit finalization
 * statement with a date.
 *
 * No pricing, value, floor/ceiling, or comp data appears here. MSRP is
 * intentionally omitted.
 */

export type Grader = 'PSA' | 'BGS' | 'SGC';

export type Sport = 'Football' | 'Basketball' | 'Baseball';

export type CardChecklistRow = {
  position: number;
  year: string;
  setName: string;
  /** Player name (sports) or character/card name (TCG). */
  cardName: string;
  variation: string;
  /** Required for TCG cards per Whatnot audit. Omitted for sports rows. */
  language?: string;
  /** Sport tag for multi-sport rows; omitted on TCG. */
  sport?: Sport;
  grader: Grader;
  grade: string;
};

/**
 * One product line / case type. The four products are:
 *   - fusion     (TCG, multi-show)
 *   - select     (TCG, single-show)
 *   - nova       (multi-sport, multi-show)
 *   - inception  (multi-sport, single-show)
 */
export type CardProductId = 'fusion' | 'select' | 'nova' | 'inception';

export type CardProductLine = {
  id: CardProductId;
  /** Display name as it should appear before "Series #N", e.g. "ShackPack Fusion". */
  productName: string;
  /** Brand / Manufacturer (Whatnot required). */
  brand: string;
  /** Title of Product (Whatnot required). */
  productTitle: string;
  /** Layout discriminant — drives Language vs Sport column. */
  category: 'TCG' | 'Multi-Sport';
  /** Multi-show vs single-show — drives Single Show overview block + designation copy. */
  showType: 'multi-show' | 'single-show';
  /** Condition (Whatnot required). */
  condition: string;
  /** Quantity of each individual item in any series of this product (Whatnot required). */
  quantityPerItem: number;
  /** Pack image displayed as a banner. */
  imageSrc: string;
  imageAlt: string;
  /** Short blurb shown under the product header. */
  tagline: string;
};

export type CardSeriesDefinition = {
  /** Stable id, e.g. "fusion-1". */
  id: string;
  /** Product line this series belongs to. */
  productId: CardProductId;
  /** 1-based ordinal within this product line. */
  ordinal: number;
  /** Long display date, e.g. "April 27, 2026". */
  finalizationDate: string;
  /** Title of Product (denormalized for convenience). */
  productTitle: string;
  /** Whatnot Series Name field — e.g. "Fusion Series #1". */
  seriesName: string;
  /** Convenience display label, e.g. "ShackPack Fusion Series #1". */
  displayLabel: string;
  /** Full finalization statement shown above the table. */
  finalizationStatement: string;
  /** Optional intro paragraphs (used for single-show overview content). */
  overviewParagraphs?: string[];
  /** Layout: "full" shows all rows; "overview" reads as an overview + example rows. */
  layout: 'full' | 'overview';
  rows: CardChecklistRow[];
};

const BRAND = 'ShackPack — G&J Packaging LLLP';

const CONDITION = 'Professionally graded by PSA, BGS, or SGC. No raw cards.';

const FINALIZATION_DATE = 'April 27, 2026';

const graders: Grader[] = ['PSA', 'BGS', 'SGC'];

function pickGrader(i: number): Grader {
  return graders[i % graders.length];
}

function pickGrade(g: Grader, i: number): string {
  if (g === 'BGS') return i % 3 === 0 ? '9.5' : '9';
  if (g === 'SGC') return i % 2 === 0 ? '10' : '9.5';
  return i % 4 === 0 ? '9' : '10';
}

// ---------------------------------------------------------------------------
// TCG seed data — used by Fusion (multi-show, full 100) and Select (single-show, overview)
// ---------------------------------------------------------------------------

type TcgSeed = {
  set: string;
  card: string;
  variation: string;
  language: 'English' | 'Japanese';
  yearStart: number;
};

const tcgSeeds: TcgSeed[] = [
  { set: 'Pokémon Base Set', card: 'Charizard', variation: '1st Edition Holo', language: 'English', yearStart: 1999 },
  { set: 'Pokémon Base Set', card: 'Blastoise', variation: 'Shadowless Holo', language: 'English', yearStart: 1999 },
  { set: 'Pokémon Base Set', card: 'Venusaur', variation: 'Unlimited Holo', language: 'English', yearStart: 1999 },
  { set: 'Pokémon Jungle', card: 'Pikachu', variation: 'Holo', language: 'English', yearStart: 1999 },
  { set: 'Pokémon Neo Genesis', card: 'Lugia', variation: '1st Edition Holo', language: 'English', yearStart: 2000 },
  { set: 'Pokémon Hidden Fates', card: 'Charizard GX', variation: 'Shiny Full Art', language: 'English', yearStart: 2019 },
  { set: 'Pokémon Evolving Skies', card: 'Umbreon VMAX', variation: 'Alt Art', language: 'English', yearStart: 2021 },
  { set: 'Pokémon Evolving Skies', card: 'Rayquaza VMAX', variation: 'Alt Art', language: 'English', yearStart: 2021 },
  { set: 'Pokémon Crown Zenith', card: 'Giratina VSTAR', variation: 'Gold Secret Rare', language: 'English', yearStart: 2023 },
  { set: 'Pokémon Scarlet & Violet 151', card: 'Mew ex', variation: 'Special Illustration Rare', language: 'English', yearStart: 2023 },
  { set: 'Pokémon Scarlet & Violet 151', card: 'Charizard ex', variation: 'Special Illustration Rare', language: 'English', yearStart: 2023 },
  { set: 'Pokémon Obsidian Flames', card: 'Charizard ex', variation: 'Hyper Rare Gold', language: 'English', yearStart: 2023 },
  { set: 'Pokémon Paldean Fates', card: 'Iono', variation: 'Special Illustration Rare', language: 'English', yearStart: 2024 },
  { set: 'Pokémon Twilight Masquerade', card: 'Ogerpon ex', variation: 'Special Illustration Rare', language: 'English', yearStart: 2024 },
  { set: 'Pokémon Surging Sparks', card: 'Pikachu ex', variation: 'Hyper Rare', language: 'English', yearStart: 2024 },
  { set: 'Pokémon Japanese Promo', card: 'Pikachu Illustrator', variation: 'Trophy Promo', language: 'Japanese', yearStart: 1998 },
  { set: 'Pokémon Japanese VMAX Climax', card: 'Charizard VMAX', variation: 'CSR', language: 'Japanese', yearStart: 2021 },
  { set: 'Pokémon Japanese SAR Collection', card: 'Mew ex', variation: 'Super Art Rare', language: 'Japanese', yearStart: 2023 },
  { set: 'Magic the Gathering Beta', card: 'Black Lotus', variation: 'Power Nine', language: 'English', yearStart: 1993 },
  { set: 'Magic the Gathering Alpha', card: 'Mox Sapphire', variation: 'Power Nine', language: 'English', yearStart: 1993 },
  { set: 'Yu-Gi-Oh! Legend of Blue Eyes', card: 'Blue-Eyes White Dragon', variation: '1st Edition', language: 'English', yearStart: 2002 },
  { set: 'Yu-Gi-Oh! Metal Raiders', card: 'Dark Magician', variation: 'Ultra Rare', language: 'English', yearStart: 2002 },
  { set: 'Yu-Gi-Oh! 25th Anniversary Rarity Collection', card: 'Exodia the Forbidden One', variation: 'Quarter Century Secret Rare', language: 'English', yearStart: 2023 },
  { set: 'Dragon Ball Super Card Game', card: 'Son Goku', variation: 'Special Rare', language: 'English', yearStart: 2022 },
  { set: 'Dragon Ball Super Fusion World', card: 'Vegeta', variation: 'Secret Rare', language: 'English', yearStart: 2024 },
  { set: 'One Piece Card Game OP-01', card: 'Monkey D. Luffy', variation: 'Leader Parallel', language: 'English', yearStart: 2023 },
  { set: 'One Piece Card Game OP-05', card: 'Roronoa Zoro', variation: 'Manga Art SR', language: 'English', yearStart: 2024 },
  { set: 'One Piece Card Game OP-06', card: 'Nico Robin', variation: 'Alternate Art SR', language: 'Japanese', yearStart: 2024 },
  { set: 'Disney Lorcana The First Chapter', card: 'Mickey Mouse — Brave Little Tailor', variation: 'Enchanted', language: 'English', yearStart: 2023 },
  { set: 'Disney Lorcana Rise of the Floodborn', card: 'Elsa — Spirit of Winter', variation: 'Enchanted', language: 'English', yearStart: 2023 },
  { set: 'Disney Lorcana Into the Inklands', card: 'Donald Duck — Boisterous Fowl', variation: 'Enchanted', language: 'English', yearStart: 2024 },
  { set: 'Naruto Kayou CCG', card: 'Naruto Uzumaki', variation: 'SP', language: 'English', yearStart: 2023 },
  { set: 'Naruto Kayou CCG', card: 'Sasuke Uchiha', variation: 'SP', language: 'Japanese', yearStart: 2023 },
  { set: 'Marvel Masterpieces', card: 'Spider-Man', variation: 'Holo Foil', language: 'English', yearStart: 1994 },
  { set: 'Marvel Masterpieces 2020', card: 'Iron Man', variation: 'Refractor', language: 'English', yearStart: 2020 },
  { set: 'Star Wars Topps Chrome Galaxy', card: 'Luke Skywalker', variation: 'Refractor', language: 'English', yearStart: 2021 },
  { set: 'Star Wars Topps Chrome Galaxy', card: 'Darth Vader', variation: 'Atomic Refractor', language: 'English', yearStart: 2021 },
  { set: 'DC Cosmic Cards', card: 'Batman', variation: 'Holo', language: 'English', yearStart: 1991 },
  { set: 'Garbage Pail Kids 35th Anniversary', card: 'Adam Bomb', variation: 'Gold Border', language: 'English', yearStart: 2020 },
  { set: 'Sonic the Hedgehog Card Game', card: 'Sonic', variation: 'Foil', language: 'English', yearStart: 2024 },
  { set: 'Final Fantasy TCG Opus I', card: 'Cloud Strife', variation: 'Foil Legend', language: 'English', yearStart: 2017 },
  { set: 'Cardfight!! Vanguard', card: 'Dragonic Overlord', variation: 'Special Rare', language: 'English', yearStart: 2020 },
  { set: 'Weiss Schwarz Demon Slayer', card: 'Tanjiro Kamado', variation: 'SSP', language: 'Japanese', yearStart: 2022 },
  { set: 'Weiss Schwarz Jujutsu Kaisen', card: 'Satoru Gojo', variation: 'SP', language: 'Japanese', yearStart: 2023 },
  { set: 'Pokémon Twilight Masquerade', card: 'Greninja ex', variation: 'Special Illustration Rare', language: 'English', yearStart: 2024 },
  { set: 'Pokémon Stellar Crown', card: 'Terapagos ex', variation: 'Special Illustration Rare', language: 'English', yearStart: 2024 },
  { set: 'Pokémon Shrouded Fable', card: 'Pecharunt ex', variation: 'Special Illustration Rare', language: 'English', yearStart: 2024 },
  { set: 'Pokémon Paradox Rift', card: 'Iron Valiant ex', variation: 'Hyper Rare', language: 'English', yearStart: 2023 },
  { set: 'Pokémon Temporal Forces', card: 'Iron Crown ex', variation: 'Special Illustration Rare', language: 'English', yearStart: 2024 },
  { set: 'Pokémon Paldea Evolved', card: 'Miriam', variation: 'Special Illustration Rare', language: 'English', yearStart: 2023 },
];

function buildTcgRows(count: number): CardChecklistRow[] {
  return Array.from({ length: count }, (_, i) => {
    const seed = tcgSeeds[i % tcgSeeds.length];
    const grader = pickGrader(i);
    const grade = pickGrade(grader, i);
    const yearOffset = Math.floor(i / tcgSeeds.length);
    return {
      position: i + 1,
      year: String(seed.yearStart + yearOffset),
      setName: seed.set,
      cardName: seed.card,
      variation: seed.variation,
      language: seed.language,
      grader,
      grade,
    };
  });
}

// ---------------------------------------------------------------------------
// Multi-Sport seed data — Football, Basketball, Baseball
// ---------------------------------------------------------------------------

type SportSeed = {
  sport: Sport;
  year: number;
  set: string;
  player: string;
  variation: string;
};

const sportSeeds: SportSeed[] = [
  // ---------- Football ----------
  { sport: 'Football', year: 2000, set: 'Playoff Contenders', player: 'Tom Brady', variation: 'Rookie Ticket Auto' },
  { sport: 'Football', year: 2017, set: 'Panini Prizm', player: 'Patrick Mahomes', variation: 'Silver Prizm Rookie' },
  { sport: 'Football', year: 1989, set: 'Score', player: 'Barry Sanders', variation: 'Rookie' },
  { sport: 'Football', year: 1986, set: 'Topps', player: 'Jerry Rice', variation: 'Rookie' },
  { sport: 'Football', year: 1984, set: 'Topps', player: 'John Elway', variation: 'Rookie' },
  { sport: 'Football', year: 1986, set: 'Topps', player: 'Reggie White', variation: 'Rookie' },
  { sport: 'Football', year: 1990, set: 'Score Supplemental', player: 'Emmitt Smith', variation: 'Rookie' },
  { sport: 'Football', year: 2020, set: 'Panini Prizm', player: 'Justin Jefferson', variation: 'Silver Prizm Rookie' },
  { sport: 'Football', year: 2020, set: 'Panini Prizm', player: 'Joe Burrow', variation: 'Silver Prizm Rookie' },
  { sport: 'Football', year: 2018, set: 'Donruss Optic', player: 'Lamar Jackson', variation: 'Holo Rookie' },
  { sport: 'Football', year: 2018, set: 'Panini Prizm', player: 'Josh Allen', variation: 'Silver Prizm Rookie' },
  { sport: 'Football', year: 2021, set: 'Panini Select', player: 'Ja\u2019Marr Chase', variation: 'Concourse Rookie' },
  { sport: 'Football', year: 2013, set: 'Panini Prizm', player: 'Travis Kelce', variation: 'Silver Prizm Rookie' },
  { sport: 'Football', year: 2023, set: 'Panini Prizm', player: 'C.J. Stroud', variation: 'Silver Prizm Rookie' },
  { sport: 'Football', year: 2024, set: 'Panini Prizm', player: 'Caleb Williams', variation: 'Silver Prizm Rookie' },
  { sport: 'Football', year: 2024, set: 'Panini Prizm', player: 'Jayden Daniels', variation: 'Silver Prizm Rookie' },
  { sport: 'Football', year: 2023, set: 'Donruss Optic', player: 'Bijan Robinson', variation: 'Holo Rookie' },
  { sport: 'Football', year: 2018, set: 'Panini Prizm', player: 'Saquon Barkley', variation: 'Silver Prizm Rookie' },
  { sport: 'Football', year: 2017, set: 'Panini Prizm', player: 'Christian McCaffrey', variation: 'Silver Prizm Rookie' },
  { sport: 'Football', year: 2016, set: 'Panini Prizm', player: 'Derrick Henry', variation: 'Silver Prizm Rookie' },
  { sport: 'Football', year: 2024, set: 'Panini Mosaic', player: 'Marvin Harrison Jr.', variation: 'Silver Mosaic Rookie' },
  { sport: 'Football', year: 2024, set: 'Panini Select', player: 'Malik Nabers', variation: 'Concourse Rookie' },
  { sport: 'Football', year: 2024, set: 'Panini Donruss Optic', player: 'Drake Maye', variation: 'Holo Rookie' },
  { sport: 'Football', year: 2022, set: 'Panini Prizm', player: 'Brock Purdy', variation: 'Silver Prizm Rookie' },
  { sport: 'Football', year: 2019, set: 'Panini Prizm', player: 'Kyler Murray', variation: 'Silver Prizm Rookie' },
  // ---------- Basketball ----------
  { sport: 'Basketball', year: 1986, set: 'Fleer', player: 'Michael Jordan', variation: 'Rookie' },
  { sport: 'Basketball', year: 1996, set: 'Topps Chrome', player: 'Kobe Bryant', variation: 'Refractor Rookie' },
  { sport: 'Basketball', year: 2003, set: 'Topps Chrome', player: 'LeBron James', variation: 'Refractor Rookie' },
  { sport: 'Basketball', year: 2009, set: 'Panini National Treasures', player: 'Stephen Curry', variation: 'RPA' },
  { sport: 'Basketball', year: 2007, set: 'Topps Chrome', player: 'Kevin Durant', variation: 'Refractor Rookie' },
  { sport: 'Basketball', year: 2013, set: 'Panini Prizm', player: 'Giannis Antetokounmpo', variation: 'Silver Prizm Rookie' },
  { sport: 'Basketball', year: 2018, set: 'Panini Prizm', player: 'Luka Don\u010di\u0107', variation: 'Silver Prizm Rookie' },
  { sport: 'Basketball', year: 2015, set: 'Panini Prizm', player: 'Nikola Joki\u0107', variation: 'Silver Prizm Rookie' },
  { sport: 'Basketball', year: 2014, set: 'Panini Prizm', player: 'Joel Embiid', variation: 'Silver Prizm Rookie' },
  { sport: 'Basketball', year: 2017, set: 'Panini Prizm', player: 'Jayson Tatum', variation: 'Silver Prizm Rookie' },
  { sport: 'Basketball', year: 2003, set: 'Topps Chrome', player: 'Dwyane Wade', variation: 'Refractor Rookie' },
  { sport: 'Basketball', year: 1996, set: 'Topps Chrome', player: 'Allen Iverson', variation: 'Refractor Rookie' },
  { sport: 'Basketball', year: 2019, set: 'Panini Prizm', player: 'Zion Williamson', variation: 'Silver Prizm Rookie' },
  { sport: 'Basketball', year: 2019, set: 'Panini Prizm', player: 'Ja Morant', variation: 'Silver Prizm Rookie' },
  { sport: 'Basketball', year: 2020, set: 'Panini Prizm', player: 'Anthony Edwards', variation: 'Silver Prizm Rookie' },
  { sport: 'Basketball', year: 2023, set: 'Panini Prizm', player: 'Victor Wembanyama', variation: 'Silver Prizm Rookie' },
  { sport: 'Basketball', year: 2018, set: 'Panini Prizm', player: 'Trae Young', variation: 'Silver Prizm Rookie' },
  { sport: 'Basketball', year: 2018, set: 'Panini Prizm', player: 'Jalen Brunson', variation: 'Silver Prizm Rookie' },
  { sport: 'Basketball', year: 2021, set: 'Panini Prizm', player: 'Tyrese Haliburton', variation: 'Silver Prizm Rookie' },
  { sport: 'Basketball', year: 2015, set: 'Panini Prizm', player: 'Devin Booker', variation: 'Silver Prizm Rookie' },
  // ---------- Baseball ----------
  { sport: 'Baseball', year: 1952, set: 'Topps', player: 'Mickey Mantle', variation: 'Base' },
  { sport: 'Baseball', year: 1954, set: 'Topps', player: 'Hank Aaron', variation: 'Rookie' },
  { sport: 'Baseball', year: 1951, set: 'Bowman', player: 'Willie Mays', variation: 'Rookie' },
  { sport: 'Baseball', year: 1989, set: 'Upper Deck', player: 'Ken Griffey Jr.', variation: 'Rookie' },
  { sport: 'Baseball', year: 1993, set: 'SP Foil', player: 'Derek Jeter', variation: 'Rookie' },
  { sport: 'Baseball', year: 2011, set: 'Topps Update', player: 'Mike Trout', variation: 'Rookie' },
  { sport: 'Baseball', year: 2018, set: 'Topps Chrome', player: 'Shohei Ohtani', variation: 'Refractor Rookie' },
  { sport: 'Baseball', year: 2017, set: 'Topps Chrome Update', player: 'Aaron Judge', variation: 'Refractor Rookie' },
  { sport: 'Baseball', year: 2014, set: 'Topps Chrome Update', player: 'Mookie Betts', variation: 'Refractor Rookie' },
  { sport: 'Baseball', year: 2018, set: 'Bowman Chrome', player: 'Ronald Acu\u00f1a Jr.', variation: 'Refractor Rookie Auto' },
  { sport: 'Baseball', year: 2019, set: 'Topps Chrome', player: 'Juan Soto', variation: 'Refractor Rookie' },
  { sport: 'Baseball', year: 2013, set: 'Topps Chrome', player: 'Bryce Harper', variation: 'Refractor Rookie' },
  { sport: 'Baseball', year: 2011, set: 'Topps Chrome', player: 'Freddie Freeman', variation: 'Refractor Rookie' },
  { sport: 'Baseball', year: 2019, set: 'Bowman Chrome', player: 'Vladimir Guerrero Jr.', variation: 'Refractor Rookie' },
  { sport: 'Baseball', year: 2020, set: 'Bowman Chrome', player: 'Fernando Tat\u00eds Jr.', variation: 'Refractor Rookie' },
  { sport: 'Baseball', year: 2022, set: 'Topps Chrome', player: 'Julio Rodr\u00edguez', variation: 'Refractor Rookie' },
  { sport: 'Baseball', year: 2023, set: 'Topps Chrome Update', player: 'Corbin Carroll', variation: 'Refractor Rookie' },
  { sport: 'Baseball', year: 2023, set: 'Bowman Chrome', player: 'Gunnar Henderson', variation: 'Refractor Rookie' },
  { sport: 'Baseball', year: 2022, set: 'Topps Chrome Update', player: 'Adley Rutschman', variation: 'Refractor Rookie' },
  { sport: 'Baseball', year: 2022, set: 'Bowman Chrome', player: 'Bobby Witt Jr.', variation: 'Refractor Rookie' },
];

function buildSportRows(count: number): CardChecklistRow[] {
  return Array.from({ length: count }, (_, i) => {
    const seed = sportSeeds[i % sportSeeds.length];
    const grader = pickGrader(i);
    const grade = pickGrade(grader, i);
    return {
      position: i + 1,
      year: String(seed.year),
      setName: seed.set,
      cardName: seed.player,
      variation: seed.variation,
      sport: seed.sport,
      grader,
      grade,
    };
  });
}

// ---------------------------------------------------------------------------
// Product line definitions (4 total)
// ---------------------------------------------------------------------------

export const CARD_PRODUCT_LINES: Record<CardProductId, CardProductLine> = {
  fusion: {
    id: 'fusion',
    productName: 'ShackPack Fusion',
    brand: BRAND,
    productTitle: 'ShackPack Fusion',
    category: 'TCG',
    showType: 'multi-show',
    condition: CONDITION,
    quantityPerItem: 1,
    imageSrc: '/images/packs/shackpack-fusion.png',
    imageAlt: 'ShackPack Fusion sealed pack',
    tagline: 'Trading card games — Pokémon, Magic, Yu-Gi-Oh!, One Piece, Lorcana, and more. Multi-show release.',
  },
  select: {
    id: 'select',
    productName: 'ShackPack Select',
    brand: BRAND,
    productTitle: 'ShackPack Select',
    category: 'TCG',
    showType: 'single-show',
    condition: CONDITION,
    quantityPerItem: 1,
    imageSrc: '/images/packs/shackpack-select.png',
    imageAlt: 'ShackPack Select sealed pack',
    tagline: 'Trading card games — sold and opened within a single show. "Single Show Series" designated on the front of the product.',
  },
  nova: {
    id: 'nova',
    productName: 'ShackPack Nova',
    brand: BRAND,
    productTitle: 'ShackPack Nova',
    category: 'Multi-Sport',
    showType: 'multi-show',
    condition: CONDITION,
    quantityPerItem: 1,
    imageSrc: '/images/packs/shackpack-nova.png',
    imageAlt: 'ShackPack Nova sealed pack',
    tagline: 'Multi-sport graded cards — Football, Basketball, Baseball. Multi-show release.',
  },
  inception: {
    id: 'inception',
    productName: 'ShackPack Inception',
    brand: BRAND,
    productTitle: 'ShackPack Inception',
    category: 'Multi-Sport',
    showType: 'single-show',
    condition: CONDITION,
    quantityPerItem: 1,
    imageSrc: '/images/packs/shackpack-inception.png',
    imageAlt: 'ShackPack Inception sealed pack',
    tagline: 'Multi-sport graded cards — sold and opened within a single show. "Single Show Series" designated on the front of the product.',
  },
};

export const CARD_PRODUCT_ORDER: CardProductId[] = ['fusion', 'nova', 'select', 'inception'];

// ---------------------------------------------------------------------------
// Series definitions — seeded with one example series per product line.
// To add more later, just append more entries with the next ordinal + a new date.
// ---------------------------------------------------------------------------

function buildFinalizationStatement(productTitle: string, seriesName: string, date: string): string {
  return `As of ${date}, the ${productTitle} ${seriesName} has been finalized. The number of Professionally Sealed Surprise Products in this Series, and the individual items contained in each product, will not change. Any additional products produced from additional items will constitute a new, distinct Series.`;
}

function singleShowOverview(productTitle: string): string[] {
  return [
    `${productTitle} is clearly and visibly designated as a "Single Show Series" on the front of the sealed product packaging. It is intended to be sold and opened within a single show.`,
    'The checklist below is an overview of what to expect in the series, including the total number of items, the type of product, and representative example cards that typify this product line. Show-specific manifests may be published alongside each event.',
  ];
}

function makeSeries(
  productId: CardProductId,
  ordinal: number,
  finalizationDate: string,
  rows: CardChecklistRow[],
  layout: 'full' | 'overview',
  overviewParagraphs?: string[]
): CardSeriesDefinition {
  const product = CARD_PRODUCT_LINES[productId];
  const seriesName = `${product.productName.replace(/^ShackPack\s+/, '')} Series #${ordinal}`;
  const displayLabel = `${product.productName} Series #${ordinal}`;
  return {
    id: `${productId}-${ordinal}`,
    productId,
    ordinal,
    finalizationDate,
    productTitle: product.productTitle,
    seriesName,
    displayLabel,
    finalizationStatement: buildFinalizationStatement(product.productTitle, seriesName, finalizationDate),
    overviewParagraphs,
    layout,
    rows,
  };
}

export const CARD_CHECKLIST_SERIES: CardSeriesDefinition[] = [
  makeSeries('fusion', 1, FINALIZATION_DATE, buildTcgRows(100), 'full'),
  makeSeries('nova', 1, FINALIZATION_DATE, buildSportRows(50), 'full'),
  makeSeries(
    'select',
    1,
    FINALIZATION_DATE,
    buildTcgRows(12),
    'overview',
    [
      'Each sealed product contains 100 graded TCG cards. All cards are graded by PSA, BGS, or SGC. No raw cards are included.',
      ...singleShowOverview('ShackPack Select'),
    ]
  ),
  makeSeries(
    'inception',
    1,
    FINALIZATION_DATE,
    buildSportRows(12),
    'overview',
    [
      'Each sealed product contains 50 graded sports cards spanning football, basketball, and baseball. All cards are graded by PSA, BGS, or SGC. No raw cards are included.',
      ...singleShowOverview('ShackPack Inception'),
    ]
  ),
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getCardProduct(id: CardProductId): CardProductLine {
  return CARD_PRODUCT_LINES[id];
}

export function getSeriesByProduct(productId: CardProductId): CardSeriesDefinition[] {
  return CARD_CHECKLIST_SERIES.filter((s) => s.productId === productId);
}

export function getSeriesById(id: string): CardSeriesDefinition | undefined {
  return CARD_CHECKLIST_SERIES.find((s) => s.id === id);
}
