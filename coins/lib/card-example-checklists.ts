/**
 * REPRESENTATIVE EXAMPLE card checklists.
 *
 * These illustrate the caliber, sport mix and era mix of a product line. They
 * are NOT the contents of any specific pack, break or series, and nothing here
 * should ever be presented as what a customer received.
 *
 * They exist PER PRODUCT CONFIGURATION, not per series. One example describes
 * how a configuration is built; it does not correspond to a dated production
 * run, which is why `seriesDate` is typed as `null` and can never be set.
 *
 * EDITABLE MARKETING CONTENT. Changing an entry here changes a marketing
 * illustration and nothing else. This is the opposite of
 * lib/card-series-checklist.ts, which is a FROZEN HISTORICAL ARCHIVE of the
 * exact published contents of real produced series — that file must not be
 * edited to make a nicer-looking example.
 */

import type { BrandId } from '@/lib/brands';

/**
 * One card in an example checklist.
 *
 * Structurally identical to the API's card shape (see CardChecklistCard in
 * app/checklist/types.ts), so the unified model can consume the static
 * archive, these examples, and live API series through one code path.
 *
 * `position` is 1..N with the most valuable card first, matching the card API
 * contract — it is a value rank, and it is meant to be displayed.
 */
export type CardExampleCard = {
  position: number;
  entryName: string;
};

export type CardExampleChecklist = {
  /**
   * Owning customer brand (see lib/brands.ts). This is what puts an example
   * under the right brand tab on the Cards line — the nav derives its brand
   * list from the brands actually present here, so adding an example for a new
   * brand makes its tab appear with no nav code change.
   */
  brandId: BrandId;
  seriesName: string;
  /**
   * Always null. Examples are deliberately undated: an example rendered under
   * a real date reads as a claim about what was in the packs sold that day.
   *
   * Typed as the literal `null` rather than `string | null` or an optional so
   * that dating an example is a compile error, not a code review catch. The
   * render layer keys on this being null to show a "Sample" label where a date
   * button would otherwise go.
   */
  seriesDate: null;
  cards: CardExampleCard[];
};

/**
 * entryName strings are stored in RAW Sortly form — lowercase brand names,
 * inconsistent spacing, exactly as the source system would emit them.
 *
 * Do NOT hand-format these. cleanEntryName (lib/clean-entry-name.ts) does the
 * casing at render time, so the examples exercise the same formatting path as
 * live API data. Pre-formatting a string here would hide a missing EXACT_CASE
 * entry that real data would trip over.
 */
export const CARD_EXAMPLE_CHECKLISTS: CardExampleChecklist[] = [
  {
    brandId: 'vault-room-breaks',
    seriesName: 'Vault Room Breaks Series 1',
    seriesDate: null,
    cards: [
      { position: 1, entryName: '2020 panini limited jalen hurts rookie patch auto /99' },
      { position: 2, entryName: '2016 panini prizm uefa cristiano ronaldo silver prizm #97 psa 9' },
      { position: 3, entryName: '2021 prizm trevor lawrence red white blue prizm #331 psa 10' },
      { position: 4, entryName: '2025 bowman chrome bryce eldridge adios auto gold mini diamond psa 9' },
      { position: 5, entryName: '2016 bowman prospects fernando tatis jr yellow #bp17 psa 10' },
      { position: 6, entryName: '2023 panini black dead of night ja morant auto /25' },
      { position: 7, entryName: '2017 panini prizm donovan mitchell green prizm rc psa 10' },
      { position: 8, entryName: '2016 panini origins jared goff auto rc' },
      { position: 9, entryName: '2020 panini donruss optic travis kelce downtown #dt10 psa 9' },
      { position: 10, entryName: '1989 score barry sanders #257 psa 8' },
    ],
  },
  {
    brandId: 'vault-room-breaks',
    seriesName: 'Vault Room Breaks Series 2-5',
    seriesDate: null,
    cards: [
      { position: 1, entryName: '2020 panini limited justin herbert rookie patch auto spotlight gold #103 /60' },
      { position: 2, entryName: '1996 skybox z-force michael jordan #179 psa 8' },
      { position: 3, entryName: '1996 fleer metal kobe bryant #181 psa 8' },
      { position: 4, entryName: '2024 panini mosaic caleb williams silver prizm rc #289 psa 10' },
      { position: 5, entryName: '2025 panini select matthew stafford patch auto /49' },
      { position: 6, entryName: '2023 panini mosaic jahmyr gibbs nfl debut orange /199 psa 10' },
      { position: 7, entryName: '2020 panini donruss optic jordan love holo #154 psa 10' },
      { position: 8, entryName: '2023 topps pedro martinez all aces #aa5 psa 10' },
      { position: 9, entryName: '2025 mosaic cam ward silver #272 psa 10' },
      { position: 10, entryName: '2020 merlin chrome ucl cristiano ronaldo refractor #50 psa 10' },
    ],
  },
];
