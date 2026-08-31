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
  countSeriesForType,
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

console.log('\n--- GROUPED DAYS: parentSeriesId is inert while it is null ---\n');

/**
 * Today's live shape: the field is PRESENT and NULL on every series. Before
 * this change the field did not exist at all, so present-and-null must be
 * indistinguishable from absent. That equality IS the inertness proof.
 */
const LIVE_SHAPE: ApiSeriesLike[] = [
  complete({ seriesId: 'gauntlet-live_20260827_b84851a8', seriesType: 'Gauntlet Live', seriesDate: '2026-08-27', submittedAt: '2026-08-27T21:33:30.030Z', parentSeriesId: null }),
  complete({ seriesId: 'select-8-27_20260827_ac9cd0e9', seriesType: 'Select', seriesDate: '2026-08-27', submittedAt: '2026-08-27T21:34:56.755Z', parentSeriesId: null }),
  complete({ seriesId: 'fucion-8-27_20260827_63d6086e', seriesType: 'Fusion', seriesDate: '2026-08-27', submittedAt: '2026-08-27T21:35:19.704Z', parentSeriesId: null }),
  complete({ seriesId: 'nova-8-27_20260827_7dfb33f4', seriesType: 'Nova', seriesDate: '2026-08-27', submittedAt: '2026-08-27T21:35:43.929Z', parentSeriesId: null }),
];
/** The same four with the field removed entirely - the pre-change payload. */
const PRE_CHANGE_SHAPE: ApiSeriesLike[] = LIVE_SHAPE.map((s) => {
  const { parentSeriesId, ...rest } = s;
  return rest;
});

check(
  'INERTNESS: all-null parentSeriesId adapts identically to the field being absent',
  adaptApiSeriesList(LIVE_SHAPE),
  adaptApiSeriesList(PRE_CHANGE_SHAPE)
);
check(
  'INERTNESS: all four stay top-level, numbered exactly as before',
  byId(adaptApiSeriesList(LIVE_SHAPE)),
  [
    'fucion-8-27_20260827_63d6086e:Fusion Series 1',
    'gauntlet-live_20260827_b84851a8:Gauntlet Live Series 1',
    'nova-8-27_20260827_7dfb33f4:Nova Series 1',
    'select-8-27_20260827_ac9cd0e9:Select Series 1',
  ]
);
check(
  'INERTNESS: no series acquires a cabinet',
  adaptApiSeriesList(LIVE_SHAPE).every((s) => s.cabinets.length === 0),
  true
);
check(
  'INERTNESS: the static base is flat too - every archive series and example',
  STATIC_CARD_SERIES.every((s) => s.cabinets.length === 0),
  true
);

console.log('\n--- GROUPED DAYS: umbrella / cabinet assembly ---\n');

/** Compact tree view: top-level titles, each with its cabinet seriesTypes. */
const tree = (list: { id: string; seriesName: string; cabinets: { id: string }[] }[]) =>
  list
    .map((s) => `${s.id}:${s.seriesName}[${s.cabinets.map((c) => c.id).join(',')}]`)
    .sort();

const GROUP_DAY: ApiSeriesLike[] = [
  complete({ seriesId: 'umb', seriesType: 'Gauntlet Live', submittedAt: '2026-09-01T09:00:00.000Z' }),
  complete({ seriesId: 'cabA', seriesType: 'Nova', submittedAt: '2026-09-01T09:30:00.000Z', parentSeriesId: 'umb' }),
  complete({ seriesId: 'cabB', seriesType: 'Abyss', submittedAt: '2026-09-01T09:45:00.000Z', parentSeriesId: 'umb' }),
];
const grouped = adaptApiSeriesList(GROUP_DAY);

check('umbrella + 2 cabinets -> exactly ONE top-level entry', grouped.length, 1);
check('the umbrella is the survivor, and it is numbered', tree(grouped), ['umb:Gauntlet Live Series 1[cabA,cabB]']);
check('the umbrella carries 2 cabinets', grouped[0].cabinets.length, 2);
check(
  'cabinets are ABSENT from the top level',
  grouped.map((s) => s.id).filter((id) => id === 'cabA' || id === 'cabB'),
  []
);
check(
  'a cabinet is never itself a parent - two levels, always',
  grouped[0].cabinets.every((c) => c.cabinets.length === 0),
  true
);
check(
  'cabinets keep their own seriesType, which is the section heading',
  grouped[0].cabinets.map((c) => c.seriesType),
  ['Nova', 'Abyss']
);
check(
  'cabinets are NOT numbered - seriesName stays the bare title base',
  grouped[0].cabinets.map((c) => c.seriesName),
  ['Nova', 'Abyss']
);

console.log('\n--- GROUPED DAYS: cabinets consume no sequence numbers ---\n');

check(
  'grouped day + a flat series, same date and type -> umbrella 1, flat 2',
  byId(
    adaptApiSeriesList([
      ...GROUP_DAY,
      complete({ seriesId: 'flat', seriesType: 'Gauntlet Live', submittedAt: '2026-09-01T12:00:00.000Z' }),
    ])
  ),
  ['flat:Gauntlet Live Series 2', 'umb:Gauntlet Live Series 1']
);
check(
  'the two cabinets did NOT take Series 2 and 3 from the flat series',
  adaptApiSeriesList([
    ...GROUP_DAY,
    complete({ seriesId: 'flat', seriesType: 'Gauntlet Live', submittedAt: '2026-09-01T12:00:00.000Z' }),
  ]).find((s) => s.id === 'flat')?.seriesName,
  'Gauntlet Live Series 2'
);

console.log('\n--- GROUPED DAYS: cabinet ordering ---\n');

check(
  'cabinets sort by submittedAt ascending, whatever the input order',
  adaptApiSeriesList([
    complete({ seriesId: 'u', seriesType: 'Gauntlet Live', submittedAt: '2026-09-01T09:00:00.000Z' }),
    complete({ seriesId: 'late', seriesType: 'Nova', submittedAt: '2026-09-01T18:00:00.000Z', parentSeriesId: 'u' }),
    complete({ seriesId: 'early', seriesType: 'Abyss', submittedAt: '2026-09-01T10:00:00.000Z', parentSeriesId: 'u' }),
    complete({ seriesId: 'mid', seriesType: 'Select', submittedAt: '2026-09-01T14:00:00.000Z', parentSeriesId: 'u' }),
  ])[0].cabinets.map((c) => c.id),
  ['early', 'mid', 'late']
);
check(
  'identical submittedAt -> deterministic tiebreak on seriesId ascending',
  adaptApiSeriesList([
    complete({ seriesId: 'u', seriesType: 'Gauntlet Live', submittedAt: '2026-09-01T09:00:00.000Z' }),
    complete({ seriesId: 'zzz', seriesType: 'Nova', submittedAt: '2026-09-01T12:00:00.000Z', parentSeriesId: 'u' }),
    complete({ seriesId: 'aaa', seriesType: 'Abyss', submittedAt: '2026-09-01T12:00:00.000Z', parentSeriesId: 'u' }),
  ])[0].cabinets.map((c) => c.id),
  ['aaa', 'zzz']
);

console.log('\n--- GROUPED DAYS: orphans (contract says impossible; handled anyway) ---\n');

check(
  'parentSeriesId names a MISSING id -> renders flat, top-level, numbered',
  tree(
    adaptApiSeriesList([
      complete({ seriesId: 'lonely', seriesType: 'Gauntlet Live', parentSeriesId: 'no-such-series' }),
    ])
  ),
  ['lonely:Gauntlet Live Series 1[]']
);
check(
  'CROSS-DATE parent reference -> orphan; groups never join across dates',
  tree(
    adaptApiSeriesList([
      complete({ seriesId: 'p', seriesType: 'Gauntlet Live', seriesDate: '2026-09-01' }),
      complete({ seriesId: 'c', seriesType: 'Nova', seriesDate: '2026-09-02', parentSeriesId: 'p' }),
    ])
  ),
  ['c:Nova Series 1[]', 'p:Gauntlet Live Series 1[]']
);
check(
  'THREE LEVELS a<-b<-c -> b is a cabinet of a, c is an orphan, no recursion',
  tree(
    adaptApiSeriesList([
      complete({ seriesId: 'a', seriesType: 'Gauntlet Live', submittedAt: '2026-09-01T09:00:00.000Z' }),
      complete({ seriesId: 'b', seriesType: 'Nova', submittedAt: '2026-09-01T10:00:00.000Z', parentSeriesId: 'a' }),
      complete({ seriesId: 'c', seriesType: 'Gauntlet Live', submittedAt: '2026-09-01T11:00:00.000Z', parentSeriesId: 'b' }),
    ])
  ),
  ['a:Gauntlet Live Series 1[b]', 'c:Gauntlet Live Series 2[]']
);
check(
  'a SELF-REFERENCING parentSeriesId -> orphan, and terminates',
  tree(
    adaptApiSeriesList([
      complete({ seriesId: 'self', seriesType: 'Gauntlet Live', parentSeriesId: 'self' }),
    ])
  ),
  ['self:Gauntlet Live Series 1[]']
);
check(
  'a two-series CYCLE -> both orphans, and terminates',
  tree(
    adaptApiSeriesList([
      complete({ seriesId: 'x', seriesType: 'Gauntlet Live', submittedAt: '2026-09-01T09:00:00.000Z', parentSeriesId: 'y' }),
      complete({ seriesId: 'y', seriesType: 'Gauntlet Live', submittedAt: '2026-09-01T10:00:00.000Z', parentSeriesId: 'x' }),
    ])
  ),
  ['x:Gauntlet Live Series 1[]', 'y:Gauntlet Live Series 2[]']
);
check(
  'GATED-OUT umbrella -> its cabinets become orphans and render flat, not lost',
  tree(
    adaptApiSeriesList([
      complete({ seriesId: 'gone', seriesType: undefined, submittedAt: '2026-09-01T09:00:00.000Z' }),
      complete({ seriesId: 'c1', seriesType: 'Gauntlet Live', submittedAt: '2026-09-01T10:00:00.000Z', parentSeriesId: 'gone' }),
      complete({ seriesId: 'c2', seriesType: 'Gauntlet Live', submittedAt: '2026-09-01T11:00:00.000Z', parentSeriesId: 'gone' }),
    ])
  ),
  ['c1:Gauntlet Live Series 1[]', 'c2:Gauntlet Live Series 2[]']
);

console.log('\n--- GROUPED DAYS: nav and counts see the umbrella only ---\n');

const groupedMerged = mergeCardSeries(STATIC_CARD_SERIES, adaptApiSeriesList(GROUP_DAY));

check(
  'a grouped day adds NO new group button - Nova and Abyss cabinets are invisible to the nav',
  getSeriesTypesForBrand(groupedMerged, 'shackpack'),
  getSeriesTypesForBrand(STATIC_CARD_SERIES, 'shackpack')
);
check(
  'countSeriesForType counts the umbrella only, never its cabinets',
  countSeriesForType(groupedMerged, 'shackpack', 'Gauntlet'),
  countSeriesForType(STATIC_CARD_SERIES, 'shackpack', 'Gauntlet') + 1
);
check(
  'the cabinets add nothing to the counts of THEIR own seriesTypes either',
  ['Nova', 'Abyss'].map((t) => countSeriesForType(groupedMerged, 'shackpack', t)),
  ['Nova', 'Abyss'].map((t) => countSeriesForType(STATIC_CARD_SERIES, 'shackpack', t))
);
check(
  'the date lists exactly one series, the umbrella, with its cabinets nested',
  tree(getSeriesFor(groupedMerged, 'shackpack', 'Gauntlet', '2026-09-01')),
  ['umb:Gauntlet Live Series 1[cabA,cabB]']
);
check(
  'merge: a grouped day adds ONE row to the merged list, not three',
  groupedMerged.length,
  STATIC_CARD_SERIES.length + 1
);

if (failures > 0) {
  console.log(`\n${failures} check(s) FAILED\n`);
  process.exit(1);
}

console.log('\nAll card API adapter checks passed.\n');
