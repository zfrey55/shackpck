// Fixture tests for the frozen coin series archive in lib/coin-series-checklist.
// Run with: npx tsx scripts/test-coin-series-checklist.ts
//
// No test framework on purpose — the archive is static data, so a plain
// assertion script keeps it runnable without adding a dependency. Same shape
// as scripts/test-series-numbering.ts.

import {
  COIN_SERIES_CHECKLISTS,
  coinSeriesForCustomer,
  totalPacks,
  totalPieces,
} from '../lib/coin-series-checklist';
import {
  CANONICAL_OTHER_CUSTOMERS,
  CUSTOMER_PACKS,
  nameToSlug,
} from '../lib/customer-attribution';

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
  check(/^\d{4}-\d{2}-\d{2}$/.test(s.date), `${s.id}: date is ISO`, `date: ${s.date}`);
  check(
    /^\d{4}-\d{2}-\d{2}$/.test(s.finalizedOn),
    `${s.id}: finalizedOn is ISO`,
    `finalizedOn: ${s.finalizedOn}`
  );
  // The roster seeds CustomerNav, so this is also what guarantees the tab
  // appears with zero live cases.
  check(
    rosterSlugs.has(s.customerSlug),
    `${s.id}: customerSlug is a canonical roster slug`,
    `customerSlug: ${s.customerSlug}`
  );
  const mapped = CUSTOMER_PACKS[s.customerSlug]?.brandId;
  check(
    mapped === s.brandId,
    `${s.id}: brandId matches CUSTOMER_PACKS for its slug`,
    `brandId: ${s.brandId}, CUSTOMER_PACKS: ${mapped}`
  );
  check(
    Number.isInteger(s.packSize) && s.packSize > 0,
    `${s.id}: packSize is a positive integer`,
    `packSize: ${s.packSize}`
  );
  check(
    s.unitLabel.trim().length > 0 && !/s$/i.test(s.unitLabel.trim()),
    `${s.id}: unitLabel is a non-empty singular (pluralized by appending 's')`,
    `unitLabel: ${JSON.stringify(s.unitLabel)}`
  );
  check(
    totalPieces(s) % s.packSize === 0,
    `${s.id}: ${totalPieces(s)} pieces divide exactly into packs of ${s.packSize}`
  );
  check(
    s.pieces.every((p) => Number.isInteger(p.qty) && p.qty > 0),
    `${s.id}: every qty is a positive integer`
  );
  const names = s.pieces.map((p) => p.name);
  check(new Set(names).size === names.length, `${s.id}: piece names are unique`);
}

console.log('\nChecking Legends Never Die Series 002\n');

const lnd = COIN_SERIES_CHECKLISTS.find(
  (s) => s.id === 'lincolnreserve-legends-never-die-002-2026-10-13'
);
check(lnd !== undefined, 'Legends Never Die 002 is present');
if (lnd) {
  check(totalPieces(lnd) === 150, 'totals 150 pieces', `got ${totalPieces(lnd)}`);
  check(totalPacks(lnd) === 150, 'totals 150 packs', `got ${totalPacks(lnd)}`);
  check(lnd.pieces.length === 21, 'has 21 piece rows', `got ${lnd.pieces.length}`);
  check(
    coinSeriesForCustomer(lnd.customerSlug).some((s) => s.id === lnd.id),
    'coinSeriesForCustomer returns it for its slug'
  );
}

console.log('\nChecking coinSeriesForCustomer ordering\n');

for (const slug of rosterSlugs) {
  const list = coinSeriesForCustomer(slug);
  const sorted = list.every((s, i) => i === 0 || list[i - 1].date >= s.date);
  if (list.length > 0) check(sorted, `${slug}: newest date first`);
}
check(coinSeriesForCustomer('no-such-customer').length === 0, 'unknown slug returns empty');

if (failures > 0) {
  console.log(`\n${failures} of ${checks} check(s) FAILED\n`);
  process.exit(1);
}

console.log(`\nAll ${checks} checks passed.\n`);
