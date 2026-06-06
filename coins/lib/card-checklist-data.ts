/**
 * Static EXAMPLE card checklists for the four ShackPack card product lines.
 *
 * IMPORTANT: These are illustrative examples, NOT finalized series. The
 * specific cards shown will not be the actual cards in any produced product.
 * They illustrate format, sport mix, era mix, and condition mix only.
 *
 * Product structure (all Multi-Sport):
 *   - fusion     — Multi-Sport Multi-Show example
 *   - nova       — Multi-Sport Single-Show example
 *   - select     — Multi-Sport Single-Show example
 *   - inception  — Multi-Sport Single-Show example
 *
 * Each example shows 10 cards. Three of the four (Fusion, Nova, Select)
 * include 2 raw / ungraded cards alongside 8 graded to illustrate that
 * products may contain a mix. Inception's example is fully graded.
 */

export type Sport = 'Football' | 'Basketball' | 'Baseball';

export type Grader = 'PSA' | 'BGS' | 'SGC';

export type CardChecklistRow = {
  position: number;
  year: string;
  setName: string;
  cardName: string;
  variation: string;
  sport: Sport;
  /** Display string in the Condition column. e.g. "PSA 10", "Raw — Near Mint". */
  condition: string;
  /** When true, condition is a graded result; otherwise treated as raw. */
  isGraded: boolean;
  /** Only meaningful when isGraded=true; drives pill color. */
  grader?: Grader;
  /** Only meaningful when isGraded=true; numeric grade string. */
  grade?: string;
};

export type CardProductId = 'fusion' | 'select' | 'nova' | 'inception';

export type ShowType = 'multi-show' | 'single-show';

export type CardProductLine = {
  id: CardProductId;
  productName: string;
  brand: string;
  productTitle: string;
  showType: ShowType;
  quantityPerItem: number;
  imageSrc: string;
  imageAlt: string;
  tagline: string;
};

export type CardSeriesDefinition = {
  id: string;
  productId: CardProductId;
  productTitle: string;
  /** Display label for the series, e.g. "ShackPack Fusion — EXAMPLE Checklist". */
  displayLabel: string;
  /** Intro paragraphs shown above the table; describe the example framing. */
  overviewParagraphs: string[];
  rows: CardChecklistRow[];
};

const BRAND = 'ShackPack — G&J Packaging LLLP';

export const CARD_PRODUCT_LINES: Record<CardProductId, CardProductLine> = {
  fusion: {
    id: 'fusion',
    productName: 'ShackPack Fusion',
    brand: BRAND,
    productTitle: 'ShackPack Fusion',
    showType: 'multi-show',
    quantityPerItem: 1,
    imageSrc: '/images/packs/shackpack-fusion.png',
    imageAlt: 'ShackPack Fusion sealed pack',
    tagline: 'Multi-sport cards — Football, Basketball, Baseball. Multi-show release.',
  },
  nova: {
    id: 'nova',
    productName: 'ShackPack Nova',
    brand: BRAND,
    productTitle: 'ShackPack Nova',
    showType: 'single-show',
    quantityPerItem: 1,
    imageSrc: '/images/packs/shackpack-nova.png',
    imageAlt: 'ShackPack Nova sealed pack',
    tagline: 'Multi-sport cards — Football, Basketball, Baseball — sold and opened within a single show.',
  },
  select: {
    id: 'select',
    productName: 'ShackPack Select',
    brand: BRAND,
    productTitle: 'ShackPack Select',
    showType: 'single-show',
    quantityPerItem: 1,
    imageSrc: '/images/packs/shackpack-select.png',
    imageAlt: 'ShackPack Select sealed pack',
    tagline: 'Multi-sport cards — Football, Basketball, Baseball — sold and opened within a single show.',
  },
  inception: {
    id: 'inception',
    productName: 'ShackPack Inception',
    brand: BRAND,
    productTitle: 'ShackPack Inception',
    showType: 'single-show',
    quantityPerItem: 1,
    imageSrc: '/images/packs/shackpack-inception.png',
    imageAlt: 'ShackPack Inception sealed pack',
    tagline: 'Multi-sport graded cards — Football, Basketball, Baseball — sold and opened within a single show.',
  },
};

export const CARD_PRODUCT_ORDER: CardProductId[] = ['fusion', 'nova', 'select', 'inception'];

// ---------------------------------------------------------------------------
// Row builders
// ---------------------------------------------------------------------------

function gradedRow(
  position: number,
  sport: Sport,
  year: string,
  setName: string,
  cardName: string,
  variation: string,
  grader: Grader,
  grade: string
): CardChecklistRow {
  return {
    position,
    year,
    setName,
    cardName,
    variation,
    sport,
    isGraded: true,
    grader,
    grade,
    condition: `${grader} ${grade}`,
  };
}

function rawRow(
  position: number,
  sport: Sport,
  year: string,
  setName: string,
  cardName: string,
  variation: string,
  condition = 'Raw — Near Mint'
): CardChecklistRow {
  return {
    position,
    year,
    setName,
    cardName,
    variation,
    sport,
    isGraded: false,
    condition,
  };
}

// ---------------------------------------------------------------------------
// Example rows — 10 per product. Fusion, Nova, Select have 8 graded + 2 raw.
// Inception is fully graded (10/10).
// ---------------------------------------------------------------------------

const fusionRows: CardChecklistRow[] = [
  gradedRow(1, 'Football', '2017', 'Panini Prizm', 'Patrick Mahomes', 'Silver Prizm Rookie', 'PSA', '10'),
  gradedRow(2, 'Basketball', '2003', 'Topps Chrome', 'LeBron James', 'Refractor Rookie', 'BGS', '9.5'),
  gradedRow(3, 'Baseball', '2011', 'Topps Update', 'Mike Trout', 'Rookie', 'PSA', '10'),
  gradedRow(4, 'Football', '1986', 'Topps', 'Jerry Rice', 'Rookie', 'PSA', '9'),
  gradedRow(5, 'Basketball', '1996', 'Topps Chrome', 'Kobe Bryant', 'Refractor Rookie', 'PSA', '10'),
  gradedRow(6, 'Baseball', '2018', 'Topps Chrome', 'Shohei Ohtani', 'Refractor Rookie', 'PSA', '10'),
  gradedRow(7, 'Football', '2020', 'Panini Prizm', 'Joe Burrow', 'Silver Prizm Rookie', 'PSA', '10'),
  gradedRow(8, 'Basketball', '2018', 'Panini Prizm', 'Luka Don\u010di\u0107', 'Silver Prizm Rookie', 'BGS', '9.5'),
  rawRow(9, 'Football', '2023', 'Panini Prizm', 'C.J. Stroud', 'Silver Prizm Rookie'),
  rawRow(10, 'Baseball', '2022', 'Bowman Chrome', 'Bobby Witt Jr.', 'Refractor Rookie'),
];

const novaRows: CardChecklistRow[] = [
  gradedRow(1, 'Football', '2000', 'Playoff Contenders', 'Tom Brady', 'Rookie Ticket Auto', 'BGS', '9.5'),
  gradedRow(2, 'Basketball', '1986', 'Fleer', 'Michael Jordan', 'Rookie', 'PSA', '9'),
  gradedRow(3, 'Baseball', '1989', 'Upper Deck', 'Ken Griffey Jr.', 'Rookie', 'PSA', '10'),
  gradedRow(4, 'Football', '1989', 'Score', 'Barry Sanders', 'Rookie', 'PSA', '10'),
  gradedRow(5, 'Basketball', '2009', 'Panini National Treasures', 'Stephen Curry', 'RPA', 'BGS', '9.5'),
  gradedRow(6, 'Baseball', '1993', 'SP Foil', 'Derek Jeter', 'Rookie', 'PSA', '9'),
  gradedRow(7, 'Football', '2018', 'Panini Prizm', 'Josh Allen', 'Silver Prizm Rookie', 'PSA', '10'),
  gradedRow(8, 'Basketball', '2023', 'Panini Prizm', 'Victor Wembanyama', 'Silver Prizm Rookie', 'PSA', '10'),
  rawRow(9, 'Baseball', '2018', 'Bowman Chrome', 'Ronald Acu\u00f1a Jr.', 'Refractor Rookie Auto'),
  rawRow(10, 'Football', '2017', 'Panini Prizm', 'Christian McCaffrey', 'Silver Prizm Rookie', 'Raw — Excellent'),
];

const selectRows: CardChecklistRow[] = [
  gradedRow(1, 'Basketball', '2003', 'Topps Chrome', 'Dwyane Wade', 'Refractor Rookie', 'BGS', '9'),
  gradedRow(2, 'Football', '2018', 'Donruss Optic', 'Lamar Jackson', 'Holo Rookie', 'PSA', '10'),
  gradedRow(3, 'Baseball', '2017', 'Topps Chrome Update', 'Aaron Judge', 'Refractor Rookie', 'PSA', '10'),
  gradedRow(4, 'Basketball', '2013', 'Panini Prizm', 'Giannis Antetokounmpo', 'Silver Prizm Rookie', 'PSA', '10'),
  gradedRow(5, 'Football', '2024', 'Panini Prizm', 'Caleb Williams', 'Silver Prizm Rookie', 'BGS', '9.5'),
  gradedRow(6, 'Baseball', '2019', 'Topps Chrome', 'Juan Soto', 'Refractor Rookie', 'PSA', '10'),
  gradedRow(7, 'Basketball', '2014', 'Panini Prizm', 'Joel Embiid', 'Silver Prizm Rookie', 'PSA', '9'),
  gradedRow(8, 'Football', '2013', 'Panini Prizm', 'Travis Kelce', 'Silver Prizm Rookie', 'PSA', '10'),
  rawRow(9, 'Basketball', '2019', 'Panini Prizm', 'Ja Morant', 'Silver Prizm Rookie', 'Raw — Mint'),
  rawRow(10, 'Baseball', '2014', 'Topps Chrome Update', 'Mookie Betts', 'Refractor Rookie'),
];

const inceptionRows: CardChecklistRow[] = [
  gradedRow(1, 'Basketball', '1996', 'Topps Chrome', 'Allen Iverson', 'Refractor Rookie', 'PSA', '9'),
  gradedRow(2, 'Football', '1986', 'Topps', 'Reggie White', 'Rookie', 'PSA', '9'),
  gradedRow(3, 'Baseball', '1952', 'Topps', 'Mickey Mantle', 'Base', 'PSA', '7'),
  gradedRow(4, 'Basketball', '2007', 'Topps Chrome', 'Kevin Durant', 'Refractor Rookie', 'PSA', '10'),
  gradedRow(5, 'Football', '1984', 'Topps', 'John Elway', 'Rookie', 'BGS', '9'),
  gradedRow(6, 'Baseball', '1951', 'Bowman', 'Willie Mays', 'Rookie', 'PSA', '7'),
  gradedRow(7, 'Basketball', '2017', 'Panini Prizm', 'Jayson Tatum', 'Silver Prizm Rookie', 'PSA', '10'),
  gradedRow(8, 'Football', '2024', 'Panini Mosaic', 'Marvin Harrison Jr.', 'Silver Mosaic Rookie', 'PSA', '10'),
  gradedRow(9, 'Baseball', '2018', 'Topps Chrome', 'Shohei Ohtani', 'Refractor Rookie', 'BGS', '9.5'),
  gradedRow(10, 'Basketball', '2015', 'Panini Prizm', 'Devin Booker', 'Silver Prizm Rookie', 'PSA', '10'),
];

function exampleOverview(
  productName: string,
  isMultiShow: boolean,
  includesRaw: boolean
): string[] {
  const showTypeText = isMultiShow ? 'multi-show release' : 'single-show product';
  return [
    `The checklist below is an EXAMPLE only — it illustrates the kind of cards that may appear in a ${productName} ${showTypeText}. It is NOT a finalized series, and the actual cards in any produced product will be different.`,
    `Each ${productName} contains 10 multi-sport cards spanning Football, Basketball, and Baseball, across vintage and modern eras.${includesRaw ? ' Products may include a mix of professionally graded cards (PSA, BGS, or SGC) and raw / ungraded cards — the example below shows 8 graded and 2 raw to illustrate that mix.' : ' The example below shows 10 professionally graded cards (PSA, BGS, or SGC).'}`,
    `Manufacturer: G&J Packaging LLLP. Quantity is 1 of each individual item.${isMultiShow ? '' : ' "Single Show Series" is clearly and visibly designated on the front of the sealed product.'}`,
  ];
}

export const CARD_CHECKLIST_SERIES: CardSeriesDefinition[] = [
  {
    id: 'fusion-example',
    productId: 'fusion',
    productTitle: 'ShackPack Fusion',
    displayLabel: 'ShackPack Fusion — EXAMPLE Checklist',
    overviewParagraphs: exampleOverview('ShackPack Fusion', true, true),
    rows: fusionRows,
  },
  {
    id: 'nova-example',
    productId: 'nova',
    productTitle: 'ShackPack Nova',
    displayLabel: 'ShackPack Nova — EXAMPLE Checklist',
    overviewParagraphs: exampleOverview('ShackPack Nova', false, true),
    rows: novaRows,
  },
  {
    id: 'select-example',
    productId: 'select',
    productTitle: 'ShackPack Select',
    displayLabel: 'ShackPack Select — EXAMPLE Checklist',
    overviewParagraphs: exampleOverview('ShackPack Select', false, true),
    rows: selectRows,
  },
  {
    id: 'inception-example',
    productId: 'inception',
    productTitle: 'ShackPack Inception',
    displayLabel: 'ShackPack Inception — EXAMPLE Checklist',
    overviewParagraphs: exampleOverview('ShackPack Inception', false, false),
    rows: inceptionRows,
  },
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
