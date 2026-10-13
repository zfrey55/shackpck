// Fixture tests for the frozen coin series archive in lib/coin-series-checklist.
// Run with: npx tsx scripts/test-coin-series-checklist.ts
//
// No test framework on purpose — the archive is static data and the helpers
// are pure, so a plain assertion script keeps it runnable without adding a
// dependency. Same shape as scripts/test-series-numbering.ts.

import {
  COIN_SERIES_CHECKLISTS,
  coinSeriesForCustomer,
  customerSlugFor,
  toCaseData,
  withArchiveCases,
  withArchiveDates,
} from '../lib/coin-series-checklist';
import {
  CANONICAL_OTHER_CUSTOMERS,
  CUSTOMER_PACKS,
  caseToSlug,
  nameToSlug,
  slugToMatcher,
} from '../lib/customer-attribution';
import {
  getChecklistCaseLongDescription,
  getChecklistCaseShortLabel,
} from '../lib/checklist-case-labels';
import type { AvailableDatesResponse, DailyChecklistResponse } from '../app/checklist/types';

let failures = 0;
let checks = 0;

function check(ok: boolean, label: string, detail = '') {
  checks += 1;
  if (ok) {
    console.log(`PASS  ${label}`);
  } else {
    failures += 1;
    console.log(`FAIL  ${label}${detail ? `\n      ${detail}` : ''}`);
  }
}

const rosterSlugs = new Set<string>(CANONICAL_OTHER_CUSTOMERS.map((n) => nameToSlug(n)));

console.log('\nChecking archive-wide invariants\n');

const ids = COIN_SERIES_CHECKLISTS.map((s) => s.id);
check(new Set(ids).size === ids.length, 'ids are unique', `ids: ${ids.join(', ')}`);

for (const s of COIN_SERIES_CHECKLISTS) {
  const slug = customerSlugFor(s);
  check(/^\d{4}-\d{2}-\d{2}$/.test(s.date), `${s.id}: date is ISO`, `date: ${s.date}`);
  // The roster seeds CustomerNav, so this is also what guarantees the tab.
  check(rosterSlugs.has(slug), `${s.id}: customer slug is a canonical roster slug`, `slug: ${slug}`);
  const mapped = CUSTOMER_PACKS[slug]?.brandId;
  check(
    mapped === s.brandId,
    `${s.id}: brandId matches CUSTOMER_PACKS for its slug`,
    `brandId: ${s.brandId}, CUSTOMER_PACKS: ${mapped}`
  );

  const c = toCaseData(s);
  check(caseToSlug(c) === slug, `${s.id}: the case attributes to its own tab`, `caseToSlug: ${caseToSlug(c)}`);
  check(slugToMatcher(slug)(c), `${s.id}: the customer page matcher selects the case`);
  check(
    getChecklistCaseShortLabel(c.caseType) === s.caseTypeName,
    `${s.id}: case type label is "${s.caseTypeName}"`,
    `got ${getChecklistCaseShortLabel(c.caseType)}`
  );
  check(
    getChecklistCaseLongDescription(c.caseType) === getChecklistCaseLongDescription('high seas'),
    `${s.id}: long description matches the generic line live Lincoln Reserve cases use`
  );
  check(c.totalCoins === c.coins.length, `${s.id}: totalCoins equals coins.length`);
  const positions = c.coins.map((coin) => coin.position);
  check(
    positions.every((p, i) => p === i + 1),
    `${s.id}: positions run 1..${c.coins.length} in table order, unique`
  );
  check(
    c.coins.every((coin) => coin.year && coin.grade && coin.gradingCompany),
    `${s.id}: every coin has year, grade and gradingCompany`
  );
  check(
    c.coins.every((coin) => /^\d+ g$/.test(coin.weight ?? '')),
    `${s.id}: every weight matches /^\\d+ g$/`,
    `weights: ${Array.from(new Set(c.coins.map((coin) => coin.weight))).join(', ')}`
  );
}

console.log('\nChecking Legends Never Die Series 002\n');

const lnd = COIN_SERIES_CHECKLISTS.find(
  (s) => s.id === 'lincolnreserve-legends-never-die-002-2026-10-13'
);
check(lnd !== undefined, 'Legends Never Die 002 is present');
if (lnd) {
  const c = toCaseData(lnd);
  check(c.coins.length === 150, 'toCaseData yields 150 coins', `got ${c.coins.length}`);
  check(lnd.pieces.length === 21, 'has 21 piece rows', `got ${lnd.pieces.length}`);
  check(
    c.coins.slice(0, 3).every((coin) => coin.coinType === 'GOLDEN BIGFOOT 1G GOLD'),
    'the first 3 rows are the gold pieces'
  );
  check(
    c.coins.slice(3).every((coin) => /SILVER$/.test(coin.coinType)),
    'every row after the gold is silver'
  );
  check(c.seriesNumber === 2, 'renders as Series #2');
  check(
    coinSeriesForCustomer(customerSlugFor(lnd)).some((s) => s.id === lnd.id),
    'coinSeriesForCustomer returns it for its slug'
  );
}

console.log('\nChecking the API merge helpers\n');

for (const s of COIN_SERIES_CHECKLISTS) {
  const emptyDates: AvailableDatesResponse = { success: true, totalDates: 0, dates: [] };
  const merged = withArchiveDates(emptyDates);
  const day = merged.dates.find((d) => d.displayDate === s.date);
  check(
    day?.caseBreakdown.some(
      (r) => r.caseType === s.caseType && r.customerName === s.customerName && r.count === 1
    ) === true,
    `${s.id}: withArchiveDates adds its breakdown row on an empty response`
  );
  check(emptyDates.dates.length === 0, `${s.id}: withArchiveDates does not mutate its input`);

  const liveDates: AvailableDatesResponse = {
    success: true,
    totalDates: 1,
    dates: [{ displayDate: s.date, totalCases: 5, caseTypes: ['base'], caseBreakdown: [] }],
  };
  const mergedLive = withArchiveDates(liveDates);
  check(
    mergedLive.dates.length === 1 && mergedLive.dates[0].totalCases === 6,
    `${s.id}: withArchiveDates joins an existing live date rather than duplicating it`
  );

  const daily: DailyChecklistResponse = {
    success: true,
    displayDate: s.date,
    totalCases: 0,
    casesByType: {},
    cases: [],
  };
  const once = withArchiveCases(daily);
  check(
    once.cases.some((c) => c.caseId === s.id) && once.totalCases === 1,
    `${s.id}: withArchiveCases appends the case on its date`
  );
  check(
    withArchiveCases(once).cases.length === once.cases.length,
    `${s.id}: withArchiveCases skips a caseId already present`
  );
  check(
    withArchiveCases({ ...daily, displayDate: '1999-01-01' }).cases.length === 0,
    `${s.id}: withArchiveCases adds nothing on other dates`
  );
}

if (failures > 0) {
  console.log(`\n${failures} of ${checks} check(s) FAILED\n`);
  process.exit(1);
}

console.log(`\nAll ${checks} checks passed.\n`);
