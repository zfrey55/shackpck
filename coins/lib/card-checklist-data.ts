/**
 * Static card checklist content (TCG / football series).
 * Replace or extend with data from shackpack_checklists.html when available.
 */

export type Grader = 'PSA' | 'BGS' | 'SGC';

export type CardChecklistRow = {
  position: number;
  year: string;
  setName: string;
  cardName: string;
  variation: string;
  grader: Grader;
  grade: string;
};

export type CardSeriesDefinition = {
  id: string;
  label: string;
  /** Shown above the table */
  finalizationStatement: string;
  /** Full grid vs overview + examples */
  layout: 'full' | 'overview';
  /** Intro paragraphs for overview layout */
  overviewParagraphs?: string[];
  rows: CardChecklistRow[];
};

const graders: Grader[] = ['PSA', 'BGS', 'SGC'];

function pickGrader(i: number): Grader {
  return graders[i % 3];
}

const tcgSets = [
  'Pokémon Base Set',
  'Pokémon Scarlet & Violet',
  'Marvel Masterpieces',
  'DC Cosmic',
  'Star Wars Chrome',
  'Dragon Ball Super',
  'Naruto Kayou',
  'SpongeBob',
  'Disney Lorcana',
];

const tcgNames = [
  'Charizard',
  'Pikachu',
  'Spider-Man',
  'Batman',
  'Luke Skywalker',
  'Goku',
  'Naruto Uzumaki',
  'SpongeBob SquarePants',
  'Mickey Mouse',
];

function buildTcgRows100(): CardChecklistRow[] {
  return Array.from({ length: 100 }, (_, i) => {
    const g = pickGrader(i);
    const grade =
      g === 'BGS' ? (i % 3 === 0 ? '9.5' : '9') : g === 'SGC' ? (i % 2 === 0 ? '10' : '9.5') : '10';
    return {
      position: i + 1,
      year: String(1999 + (i % 26)),
      setName: tcgSets[i % tcgSets.length],
      cardName: tcgNames[i % tcgNames.length],
      variation: i % 4 === 0 ? '1st Edition' : i % 4 === 1 ? 'Holo' : i % 4 === 2 ? 'Reverse Holo' : 'Full Art',
      grader: g,
      grade,
    };
  });
}

const nflSets = [
  'Panini Prizm',
  'Topps Chrome',
  'Donruss Optic',
  'Select',
  'Mosaic',
];

const nflPlayers = [
  'Vintage RC',
  'QB Prospect',
  'WR Rookie',
  'RB Rookie',
  'Defensive ROY',
];

function buildFootballRows50(): CardChecklistRow[] {
  return Array.from({ length: 50 }, (_, i) => {
    const g = pickGrader(i);
    const grade =
      g === 'BGS' ? (i % 3 === 0 ? '9.5' : '9') : g === 'SGC' ? (i % 2 === 0 ? '10' : '9') : '10';
    return {
      position: i + 1,
      year: String(1985 + (i % 40)),
      setName: nflSets[i % nflSets.length],
      cardName: nflPlayers[i % nflPlayers.length],
      variation: i % 3 === 0 ? 'Silver Prizm' : i % 3 === 1 ? 'Base' : 'Refractor',
      grader: g,
      grade,
    };
  });
}

function exampleRows(prefix: 'tcg' | 'football', count: number): CardChecklistRow[] {
  if (prefix === 'tcg') {
    return buildTcgRows100().slice(0, count);
  }
  return buildFootballRows50().slice(0, count);
}

/** Four series: T-001, F-001, SS-T-001, SS-F-001 */
export const CARD_CHECKLIST_SERIES: CardSeriesDefinition[] = [
  {
    id: 'T-001',
    label: 'TCG Series T-001 (100 cards)',
    finalizationStatement:
      'This series is finalized as of the published checklist date. Card positions, sets, and grades match sealed ShackPack TCG Multi-Show products for this series code.',
    layout: 'full',
    rows: buildTcgRows100(),
  },
  {
    id: 'F-001',
    label: 'Football Series F-001 (50 cards)',
    finalizationStatement:
      'This series is finalized as of the published checklist date. Card positions, sets, and grades match sealed ShackPack Football Multi-Show products for this series code.',
    layout: 'full',
    rows: buildFootballRows50(),
  },
  {
    id: 'SS-T-001',
    label: 'TCG Single Show SS-T-001',
    finalizationStatement:
      'Single Show products are designated for sale and opening within one show. The checklist below is an overview with representative examples; exact show-specific manifests may be published alongside each event.',
    layout: 'overview',
    overviewParagraphs: [
      '100 graded TCG cards per sealed product — Pokémon and pop-culture titles. All cards graded PSA, BGS, or SGC; no raw cards.',
      '“Single Show” is marked on the product. Intended to be sold and opened within a single show.',
    ],
    rows: exampleRows('tcg', 12),
  },
  {
    id: 'SS-F-001',
    label: 'Football Single Show SS-F-001',
    finalizationStatement:
      'Single Show products are designated for sale and opening within one show. The checklist below is an overview with representative examples; exact show-specific manifests may be published alongside each event.',
    layout: 'overview',
    overviewParagraphs: [
      '50 graded NFL cards per sealed product. All cards graded PSA, BGS, or SGC; no raw cards.',
      '“Single Show” is marked on the product. Intended to be sold and opened within a single show.',
    ],
    rows: exampleRows('football', 12),
  },
];
