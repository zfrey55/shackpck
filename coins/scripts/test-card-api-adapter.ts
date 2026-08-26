// Fixture tests for the card API adapter in lib/card-checklist-model.
// Run with: npx tsx scripts/test-card-api-adapter.ts
//
// No test framework on purpose - the adapter is pure, so a plain assertion
// script keeps it runnable without adding a dependency. Same shape as
// scripts/test-clean-entry-name.ts.
//
// Shapes here match the LIVE ShackHQ contract: seriesId, seriesDate,
// totalCards, seriesType, customerName, submittedAt. There is no seriesName.

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
import { brandIdForCustomerName } from '../lib/customer-attribution';

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

/** A complete API series in the live shape: both grouping fields present. */
function complete(over: Partial<ApiSeriesLike> = {}): ApiSeriesLike {
  return {
    seriesId: 'api-1',
    seriesDate: '2026-09-01',
    submittedAt: '2026-09-01T10:00:00.000Z',
    seriesType: 'Gauntlet',
    customerName: 'ShackPack',
    cards: [{ position: 1, entryName: '2020 topps mike trout psa 10' }],
    ...over,
  };
}

/** Order-independent view of a list: id -> title, sorted by id. */
const byId = (list: { id: string; seriesName: string }[]) =>
  list.map((s) => `${s.id}:${s.seriesName}`).sort();

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

check('MISSING seriesType -> excluded', adaptApiSeries(complete({ seriesType: undefined })), null);
check('MISSING customerName -> excluded', adaptApiSeries(complete({ customerName: undefined })), null);
check(
  'BOTH absent -> excluded',
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

console.log('\n--- brand routing (live contract sends customerName "ShackPack") ---\n');

check("brandIdForCustomerName('ShackPack') -> 'shackpack'", brandIdForCustomerName('ShackPack'), 'shackpack');
check(
  'the live customerName routes the series to the ShackPack brand',
  adaptApiSeries(complete({ customerName: 'ShackPack' }))?.brandId,
  'shackpack'
);
check(
  "the coin side's house spelling still routes the same way",
  brandIdForCustomerName('The Coin Shack'),
  'shackpack'
);
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

console.log('\n--- seriesType yields TWO values: group heading vs title base ---\n');

const gl = adaptApiSeriesList([
  complete({ seriesId: 'gl', seriesType: 'Gauntlet Live' }),
]);
check(
  'seriesType "Gauntlet Live" -> group "Gauntlet", title "Gauntlet Live Series 1"',
  gl.map((s) => ({ seriesType: s.seriesType, seriesName: s.seriesName })),
  [{ seriesType: 'Gauntlet', seriesName: 'Gauntlet Live Series 1' }]
);
check(
  'the group heading is NOT the title base - they are not collapsed',
  gl[0].seriesType !== gl[0].seriesName,
  true
);
check(
  'a non-aliased type uses one value for both group and title base',
  adaptApiSeriesList([complete({ seriesId: 'n', seriesType: 'Nova' })]).map((s) => ({
    seriesType: s.seriesType,
    seriesName: s.seriesName,
  })),
  [{ seriesType: 'Nova', seriesName: 'Nova Series 1' }]
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

console.log('\n--- numbering is by submittedAt, never array position ---\n');

check(
  'two in one group, given in REVERSE submittedAt order, still number by time',
  byId(
    adaptApiSeriesList([
      complete({ seriesId: 'later', seriesType: 'Gauntlet Live', submittedAt: '2026-09-01T18:00:00.000Z' }),
      complete({ seriesId: 'earlier', seriesType: 'Gauntlet Live', submittedAt: '2026-09-01T09:00:00.000Z' }),
    ])
  ),
  ['earlier:Gauntlet Live Series 1', 'later:Gauntlet Live Series 2']
);

check(
  'the same two in forward order produce identical numbering',
  byId(
    adaptApiSeriesList([
      complete({ seriesId: 'earlier', seriesType: 'Gauntlet Live', submittedAt: '2026-09-01T09:00:00.000Z' }),
      complete({ seriesId: 'later', seriesType: 'Gauntlet Live', submittedAt: '2026-09-01T18:00:00.000Z' }),
    ])
  ),
  ['earlier:Gauntlet Live Series 1', 'later:Gauntlet Live Series 2']
);

check(
  'identical submittedAt -> deterministic tiebreak on seriesId ascending',
  byId(
    adaptApiSeriesList([
      complete({ seriesId: 'zzz', seriesType: 'Gauntlet Live', submittedAt: '2026-09-01T12:00:00.000Z' }),
      complete({ seriesId: 'aaa', seriesType: 'Gauntlet Live', submittedAt: '2026-09-01T12:00:00.000Z' }),
    ])
  ),
  ['aaa:Gauntlet Live Series 1', 'zzz:Gauntlet Live Series 2']
);

check(
  'numbering is per group: a different type restarts at 1',
  byId(
    adaptApiSeriesList([
      complete({ seriesId: 'g1', seriesType: 'Gauntlet Live', submittedAt: '2026-09-01T09:00:00.000Z' }),
      complete({ seriesId: 'n1', seriesType: 'Nova', submittedAt: '2026-09-01T10:00:00.000Z' }),
      complete({ seriesId: 'g2', seriesType: 'Gauntlet Live', submittedAt: '2026-09-01T11:00:00.000Z' }),
    ])
  ),
  ['g1:Gauntlet Live Series 1', 'g2:Gauntlet Live Series 2', 'n1:Nova Series 1']
);

check(
  'same date and type but DIFFERENT customerName -> each is Series 1',
  byId(
    adaptApiSeriesList([
      complete({ seriesId: 'sp', seriesType: 'Gauntlet Live', customerName: 'ShackPack' }),
      complete({ seriesId: 'vrb', seriesType: 'Gauntlet Live', customerName: 'Vault Room Breaks' }),
    ])
  ),
  ['sp:Gauntlet Live Series 1', 'vrb:Gauntlet Live Series 1']
);

check(
  'numbering restarts on a different date',
  byId(
    adaptApiSeriesList([
      complete({ seriesId: 'd1', seriesType: 'Gauntlet Live', seriesDate: '2026-09-01' }),
      complete({ seriesId: 'd2', seriesType: 'Gauntlet Live', seriesDate: '2026-09-02' }),
    ])
  ),
  ['d1:Gauntlet Live Series 1', 'd2:Gauntlet Live Series 1']
);

check(
  'gated-out series are dropped, survivors still number contiguously',
  byId(
    adaptApiSeriesList([
      complete({ seriesId: 'a', seriesType: 'Gauntlet Live', submittedAt: '2026-09-01T09:00:00.000Z' }),
      complete({ seriesId: 'skip', seriesType: undefined }),
      complete({ seriesId: 'b', seriesType: 'Gauntlet Live', submittedAt: '2026-09-01T10:00:00.000Z' }),
    ])
  ),
  ['a:Gauntlet Live Series 1', 'b:Gauntlet Live Series 2']
);

console.log('\n--- merge with static ---\n');

const staticCount = STATIC_CARD_SERIES.length;
const twoSameGroup = adaptApiSeriesList([
  complete({ seriesId: 'a', seriesType: 'Gauntlet Live', submittedAt: '2026-09-01T09:00:00.000Z' }),
  complete({ seriesId: 'b', seriesType: 'Gauntlet Live', submittedAt: '2026-09-01T10:00:00.000Z' }),
]);
const merged = mergeCardSeries(STATIC_CARD_SERIES, twoSameGroup);

check('merge: static count + API count, both present', merged.length, staticCount + 2);
check(
  'merge: the API series appear',
  merged.filter((s) => s.id === 'a' || s.id === 'b').map((s) => s.id).sort(),
  ['a', 'b']
);
check(
  'merge: aliased API series adds NO new group button',
  getSeriesTypesForBrand(merged, 'shackpack'),
  getSeriesTypesForBrand(STATIC_CARD_SERIES, 'shackpack')
);
check(
  'merge: no "Gauntlet Live" heading exists',
  getSeriesTypesForBrand(merged, 'shackpack').includes('Gauntlet Live'),
  false
);
check(
  'merge: the API series are reachable under the existing Gauntlet group',
  getSeriesFor(merged, 'shackpack', 'Gauntlet', '2026-09-01').map((s) => s.id).sort(),
  ['a', 'b']
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

console.log('\n--- identity ---\n');

check(
  'seriesId is identity: it is never derived and never rewritten',
  adaptApiSeries(complete({ seriesId: 'gauntlet-live_20260826_c7353522' }))?.id,
  'gauntlet-live_20260826_c7353522'
);

if (failures > 0) {
  console.log(`\n${failures} check(s) FAILED\n`);
  process.exit(1);
}

console.log('\nAll card API adapter checks passed.\n');
