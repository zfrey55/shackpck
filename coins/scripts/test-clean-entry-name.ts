// Fixture tests for lib/clean-entry-name.
// Run with: npx tsx scripts/test-clean-entry-name.ts
//
// No test framework on purpose — this is a pure function with no I/O, so a
// plain assertion script keeps it runnable without adding a dependency.

import { cleanEntryName } from '../lib/clean-entry-name';

interface Fixture {
  input: string;
  expected: string;
  /** Why this case exists, printed on failure. */
  note: string;
}

const FIXTURES: Fixture[] = [
  {
    input: '1983 topps carl yastrzemski psa 10',
    expected: '1983 Topps Carl Yastrzemski PSA 10',
    note: 'baseline: brand, plain name, grader already spaced',
  },
  {
    input: '2021 prizm psa10',
    expected: '2021 Prizm PSA 10',
    note: 'jammed grader splits and uppercases',
  },
  {
    input: '2022 panini mark mcgwire bgs9.5',
    expected: '2022 Panini Mark McGwire BGS 9.5',
    note: 'jammed decimal grade; Mc surname',
  },
  {
    input: '  2020   bowman   jacob degrom  ',
    expected: '2020 Bowman Jacob deGrom',
    note: 'whitespace collapse; lowercase-first dictionary name',
  },
  {
    input: '2019 optic juju smith-schuster rc',
    expected: '2019 Optic JuJu Smith-Schuster RC',
    note: 'internal-caps given name; hyphenated surname; jargon',
  },
  {
    input: "2018 select shaq o'neal 1/1",
    expected: "2018 Select Shaq O'Neal 1/1",
    note: 'apostrophe surname; 1/1 serial must survive untouched',
  },
  {
    input: '2023 donruss ronaldo fifa /99',
    expected: '2023 Donruss Ronaldo FIFA /99',
    note: 'league uppercase; /99 print run must survive untouched',
  },
  {
    input: '2017 topps ken griffey jr. #24',
    expected: '2017 Topps Ken Griffey Jr. #24',
    note: 'suffix keeps its period; #24 must survive untouched',
  },
  {
    input: '2020 topps cheome mike trout',
    expected: '2020 Topps Cheome Mike Trout',
    note: 'TYPO PASSTHROUGH: "cheome" is re-cased, never corrected to Chrome',
  },
  {
    input: '2018 panini shaq\'s game-worn gu',
    expected: "2018 Panini Shaq's Game-Worn GU",
    note: 'possessive stays lowercase-s; hyphenated non-name still cases',
  },
  {
    input: '2021 topps deGrom PSA 9',
    expected: '2021 Topps deGrom PSA 9',
    note: 'already-correct input passes through unchanged',
  },
];

let failures = 0;

console.log(`\nRunning ${FIXTURES.length} cleanEntryName fixtures\n`);

for (const { input, expected, note } of FIXTURES) {
  const actual = cleanEntryName(input);
  if (actual === expected) {
    console.log(`PASS  ${JSON.stringify(input)}`);
    console.log(`      -> ${JSON.stringify(actual)}`);
  } else {
    failures += 1;
    console.log(`FAIL  ${JSON.stringify(input)}`);
    console.log(`      expected ${JSON.stringify(expected)}`);
    console.log(`      actual   ${JSON.stringify(actual)}`);
    console.log(`      case:    ${note}`);
  }
}

console.log('\nChecking idempotence across every fixture\n');

for (const { input } of FIXTURES) {
  const once = cleanEntryName(input);
  const twice = cleanEntryName(once);
  if (once === twice) {
    console.log(`PASS  idempotent: ${JSON.stringify(once)}`);
  } else {
    failures += 1;
    console.log(`FAIL  not idempotent: ${JSON.stringify(input)}`);
    console.log(`      once  ${JSON.stringify(once)}`);
    console.log(`      twice ${JSON.stringify(twice)}`);
  }
}

if (failures > 0) {
  console.log(`\n${failures} check(s) FAILED\n`);
  process.exit(1);
}

console.log(`\nAll ${FIXTURES.length} fixtures passed, all idempotent.\n`);
