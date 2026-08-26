// Fixture tests for numberSeriesForDate in lib/card-checklist-model.
// Run with: npx tsx scripts/test-series-numbering.ts
//
// No test framework on purpose — the function is pure, so a plain assertion
// script keeps it runnable without adding a dependency. Same shape as
// scripts/test-clean-entry-name.ts.

import { numberSeriesForDate } from '../lib/card-checklist-model';

interface Fixture {
  input: string[];
  expected: string[];
  /** Why this case exists, printed on failure. */
  note: string;
}

const FIXTURES: Fixture[] = [
  {
    input: ['Gauntlet Live', 'Gauntlet Live'],
    expected: ['Gauntlet Live Series 1', 'Gauntlet Live Series 2'],
    note: 'two of one base name on a date number 1 then 2',
  },
  {
    input: ['Gauntlet Live'],
    expected: ['Gauntlet Live Series 1'],
    note: 'a single series still gets Series 1',
  },
  {
    input: ['Gauntlet Live', 'Nova', 'Gauntlet Live'],
    expected: ['Gauntlet Live Series 1', 'Nova Series 1', 'Gauntlet Live Series 2'],
    note: 'counting is PER BASE NAME: Nova starts at 1, not 3',
  },
  {
    input: ['Gauntlet Live Series 2'],
    expected: ['Gauntlet Live Series 2'],
    note: 'already numbered: returned unchanged, never numbered twice',
  },
  {
    input: ['  Gauntlet   Live  '],
    expected: ['Gauntlet Live Series 1'],
    note: 'whitespace trimmed and collapsed before appending',
  },
  {
    input: [],
    expected: [],
    note: 'empty input returns empty output',
  },
  {
    input: ['Nova', 'Gauntlet Live', 'Abyss'],
    expected: ['Nova Series 1', 'Gauntlet Live Series 1', 'Abyss Series 1'],
    note: 'ORDER PRESERVED: 3 in, 3 out, same order, nothing sorted',
  },
  {
    input: ['GAUNTLET LIVE', 'gauntlet live'],
    expected: ['GAUNTLET LIVE Series 1', 'gauntlet live Series 2'],
    note: 'base names match case-insensitively; original casing is preserved',
  },
  {
    input: ['Gauntlet Live series 3'],
    expected: ['Gauntlet Live series 3'],
    note: 'the already-numbered match is case-insensitive on "series"',
  },
  {
    input: ['Gauntlet Live Series 1', 'Gauntlet Live'],
    expected: ['Gauntlet Live Series 1', 'Gauntlet Live Series 2'],
    note: 'an explicit number SEEDS the counter, so no duplicate title is minted',
  },
];

let failures = 0;

const show = (v: string[]) => JSON.stringify(v);
const same = (a: string[], b: string[]) => JSON.stringify(a) === JSON.stringify(b);

console.log(`\nRunning ${FIXTURES.length} numberSeriesForDate fixtures\n`);

for (const { input, expected, note } of FIXTURES) {
  const actual = numberSeriesForDate(input);
  if (same(actual, expected)) {
    console.log(`PASS  ${show(input)}`);
    console.log(`      -> ${show(actual)}`);
  } else {
    failures += 1;
    console.log(`FAIL  ${show(input)}`);
    console.log(`      expected ${show(expected)}`);
    console.log(`      actual   ${show(actual)}`);
    console.log(`      case:    ${note}`);
  }
}

console.log('\nChecking length and order preservation across every fixture\n');

for (const { input } of FIXTURES) {
  const actual = numberSeriesForDate(input);
  if (actual.length === input.length) {
    console.log(`PASS  ${input.length} in, ${actual.length} out`);
  } else {
    failures += 1;
    console.log(`FAIL  length changed: ${input.length} in, ${actual.length} out`);
    console.log(`      input  ${show(input)}`);
    console.log(`      actual ${show(actual)}`);
  }
}

console.log('\nChecking purity: repeated calls give identical results\n');

for (const { input } of FIXTURES) {
  const once = numberSeriesForDate(input);
  const twice = numberSeriesForDate(input);
  if (same(once, twice)) {
    console.log(`PASS  no leaked state: ${show(once)}`);
  } else {
    failures += 1;
    console.log(`FAIL  state leaked between calls: ${show(input)}`);
    console.log(`      first  ${show(once)}`);
    console.log(`      second ${show(twice)}`);
  }
}

if (failures > 0) {
  console.log(`\n${failures} check(s) FAILED\n`);
  process.exit(1);
}

console.log(`\nAll ${FIXTURES.length} fixtures passed, order preserved, no state leaked.\n`);
