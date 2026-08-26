// Fixture tests for the card API adapter in lib/card-checklist-model.
// Run with: npx tsx scripts/test-card-api-adapter.ts
//
// No test framework on purpose - the adapter is pure, so a plain assertion
// script keeps it runnable without adding a dependency. Same shape as
// scripts/test-clean-entry-name.ts.

import {
  STATIC_CARD_SERIES,
  adaptApiSeries,
  adaptApiSeriesList,
  getSeriesFor,
  getSeriesTypesForBrand,
  mergeCardSeries,
  normalizeSeriesType,
  type ApiSeriesLike,
} from '../lib/card-checklist-model';

let failures = 0;

function check(name: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log(`PASS  ${name}`);
    console.log(`      -> ${a}`);
  } else {
    failures += 1;
    console.log(`FAIL  ${name}`);
    console.log(`      expected ${e}`);
    console.log(`      actual   ${a}`);
  }
}

/** A complete API series: both grouping fields present. */
function complete(over: Partial<ApiSeriesLike> = {}): ApiSeriesLike {
  return {
    seriesId: 'api-1',
    seriesName: 'Gauntlet Live',
    seriesDate: '2026-09-01',
    seriesType: 'Gauntlet',
    customerName: 'The Coin Shack',
    cards: [{ position: 1, entryName: '2020 topps mike trout psa 10' }],
    ...over,
  };
}

console.log('\n--- the gate ---\n');

const included = adaptApiSeries(complete());
check(
  'WITH both fields -> included, correct seriesType and brandId',
  included && {
    id: included.id,
    brandId: included.brandId,
    seriesType: included.seriesType,
    cards: included.cards.length,
  },
  { id: 'api-1', brandId: 'shackpack', seriesType: 'Gauntlet', cards: 1 }
);

check(
  'MISSING seriesType -> excluded (null)',
  adaptApiSeries(complete({ seriesType: undefined })),
  null
);

check(
  'MISSING customerName -> excluded (null)',
  adaptApiSeries(complete({ customerName: undefined })),
  null
);

check(
  'BOTH absent -> excluded (null)',
  adaptApiSeries(complete({ seriesType: undefined, customerName: undefined })),
  null
);

check(
  'EMPTY-STRING seriesType -> excluded, no "Uncategorized" bucket',
  adaptApiSeries(complete({ seriesType: '   ' })),
  null
);

check(
  'UNROUTABLE customerName -> excluded rather than defaulted to ShackPack',
  adaptApiSeries(complete({ customerName: 'Some Brand We Do Not Know' })),
  null
);

console.log('\n--- brand routing shares the coin attribution path ---\n');

check(
  'alias folds like a coin case: "CoinWave, LLC" -> coinwave',
  adaptApiSeries(complete({ customerName: 'CoinWave, LLC' }))?.brandId,
  'coinwave'
);

check(
  'card-only customer routes to its own brand, not the house',
  adaptApiSeries(complete({ customerName: 'Vault Room Breaks' }))?.brandId,
  'vault-room-breaks'
);

console.log('\n--- numbering, per (brand, seriesType, date) ---\n');

const twoSameGroup = adaptApiSeriesList([
  complete({ seriesId: 'a', seriesName: 'Gauntlet Live' }),
  complete({ seriesId: 'b', seriesName: 'Gauntlet Live' }),
]);
check(
  'two API series, same date + type -> Series 1 / Series 2',
  twoSameGroup.map((s) => s.seriesName),
  ['Gauntlet Live Series 1', 'Gauntlet Live Series 2']
);

const differentTypes = adaptApiSeriesList([
  complete({ seriesId: 'a', seriesName: 'Gauntlet Live' }),
  complete({ seriesId: 'b', seriesName: 'Nova', seriesType: 'Nova' }),
  complete({ seriesId: 'c', seriesName: 'Gauntlet Live' }),
]);
check(
  'numbering is per group: Nova restarts at 1',
  differentTypes.map((s) => s.seriesName),
  ['Gauntlet Live Series 1', 'Nova Series 1', 'Gauntlet Live Series 2']
);

const differentDates = adaptApiSeriesList([
  complete({ seriesId: 'a', seriesName: 'Gauntlet Live', seriesDate: '2026-09-01' }),
  complete({ seriesId: 'b', seriesName: 'Gauntlet Live', seriesDate: '2026-09-02' }),
]);
check(
  'numbering restarts on a different date',
  differentDates.map((s) => s.seriesName),
  ['Gauntlet Live Series 1', 'Gauntlet Live Series 1']
);

check(
  'gated-out series are dropped from the list, survivors still numbered',
  adaptApiSeriesList([
    complete({ seriesId: 'a', seriesName: 'Gauntlet Live' }),
    complete({ seriesId: 'skip', seriesType: undefined }),
    complete({ seriesId: 'b', seriesName: 'Gauntlet Live' }),
  ]).map((s) => `${s.id}:${s.seriesName}`),
  ['a:Gauntlet Live Series 1', 'b:Gauntlet Live Series 2']
);

console.log('\n--- seriesType normalization (exact-match alias only) ---\n');

const NORMALIZE_CASES: [string, string, string][] = [
  ['Gauntlet Live', 'Gauntlet', 'the one-off alias: ShackHQ name -> archive heading'],
  ['gauntlet live', 'Gauntlet', 'lookup is case-insensitive; alias casing wins'],
  ['  Gauntlet   Live  ', 'Gauntlet', 'whitespace collapsed before lookup'],
  ['Gauntlet', 'Gauntlet', 'the archive heading itself is unchanged'],
  ['Nova', 'Nova', 'other lines already match and pass through'],
  ['Abyss', 'Abyss', 'other lines already match and pass through'],
  ['Gauntlet Live Extra', 'Gauntlet Live Extra', 'NOT a match - exact value only, no prefix rule'],
  ['Live', 'Live', 'NOT a match - no suffix rule'],
  ['Olivia', 'Olivia', 'NOT a match - proves no substring matching'],
];

for (const [input, expected, why] of NORMALIZE_CASES) {
  check(`normalizeSeriesType ${JSON.stringify(input)} (${why})`, normalizeSeriesType(input), expected);
}

check(
  'an unknown type is never silently rewritten',
  adaptApiSeries(complete({ seriesType: 'Some Future Line' }))?.seriesType,
  'Some Future Line'
);

check(
  'normalization does not open the gate: absent seriesType still excluded',
  adaptApiSeries(complete({ seriesType: undefined })),
  null
);

console.log('\n--- end-to-end: aliased series joins the existing Gauntlet group ---\n');

const aliased = adaptApiSeriesList([
  complete({
    seriesId: 'api-gauntlet-live',
    seriesName: 'Gauntlet Live',
    seriesType: 'Gauntlet Live',
    seriesDate: '2026-09-05',
  }),
]);
check(
  'API "Gauntlet Live" adapts to seriesType "Gauntlet"',
  aliased.map((s) => s.seriesType),
  ['Gauntlet']
);

const mergedAlias = mergeCardSeries(STATIC_CARD_SERIES, aliased);
check(
  'merged group list is UNCHANGED from static - no new button',
  getSeriesTypesForBrand(mergedAlias, 'shackpack'),
  getSeriesTypesForBrand(STATIC_CARD_SERIES, 'shackpack')
);
check(
  'no "Gauntlet Live" heading exists on the merged list',
  getSeriesTypesForBrand(mergedAlias, 'shackpack').includes('Gauntlet Live'),
  false
);
check(
  'the aliased series is reachable under the existing Gauntlet group',
  getSeriesFor(mergedAlias, 'shackpack', 'Gauntlet', '2026-09-05').map((s) => s.id),
  ['api-gauntlet-live']
);

console.log('\n--- merge with static ---\n');

const staticCount = STATIC_CARD_SERIES.length;
const staticGauntlet = getSeriesFor(
  STATIC_CARD_SERIES,
  'shackpack',
  'Gauntlet',
  '2026-08-26'
).map((s) => s.seriesName);

const merged = mergeCardSeries(STATIC_CARD_SERIES, twoSameGroup);
check(
  'merge: static count + API count, both present',
  merged.length,
  staticCount + 2
);
check(
  'merge: the API series appear',
  merged.filter((s) => s.id === 'a' || s.id === 'b').map((s) => s.id),
  ['a', 'b']
);
check(
  'merge: static series are unaffected (Gauntlet 2026-08-26 unchanged)',
  getSeriesFor(merged, 'shackpack', 'Gauntlet', '2026-08-26').map((s) => s.seriesName),
  staticGauntlet
);

console.log('\n--- API outage / empty response ---\n');

check(
  'zero API series -> merge is exactly the static list',
  mergeCardSeries(STATIC_CARD_SERIES, adaptApiSeriesList([])).length,
  staticCount
);
check(
  'zero API series -> ShackPack groups unchanged',
  getSeriesTypesForBrand(mergeCardSeries(STATIC_CARD_SERIES, []), 'shackpack'),
  getSeriesTypesForBrand(STATIC_CARD_SERIES, 'shackpack')
);
check(
  'all series gated out -> merge is exactly the static list',
  mergeCardSeries(
    STATIC_CARD_SERIES,
    adaptApiSeriesList([complete({ seriesType: undefined }), complete({ customerName: undefined })])
  ).length,
  staticCount
);

console.log('\n--- seriesName is display only ---\n');

check(
  'a rename does not change identity or grouping',
  (() => {
    const before = adaptApiSeries(complete({ seriesName: 'Gauntlet Live' }));
    const after = adaptApiSeries(complete({ seriesName: 'Totally Different Name' }));
    return {
      sameId: before?.id === after?.id,
      sameType: before?.seriesType === after?.seriesType,
      sameBrand: before?.brandId === after?.brandId,
    };
  })(),
  { sameId: true, sameType: true, sameBrand: true }
);

if (failures > 0) {
  console.log(`\n${failures} check(s) FAILED\n`);
  process.exit(1);
}

console.log('\nAll card API adapter checks passed.\n');
