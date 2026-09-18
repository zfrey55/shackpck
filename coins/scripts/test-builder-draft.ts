// Fixture tests for lib/builder/draft-state: dirty comparison, stash key
// scoping and stash round-trip / rejection.
// Run with: npx tsx scripts/test-builder-draft.ts

import {
  MAX_STASH_CHARS,
  STASH_VERSION,
  draftSnapshot,
  isDirty,
  parseStash,
  serializeStash,
  stashKey,
} from '../lib/builder/draft-state';
import { emptyDraft, type BuildDraft } from '../lib/builder/types';

let failures = 0;
let count = 0;
function check(name: string, got: unknown, expected: unknown) {
  count++;
  const ok = JSON.stringify(got) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `\n      got      ${JSON.stringify(got)}\n      expected ${JSON.stringify(expected)}`}`);
}

const base = (): BuildDraft => ({
  ...emptyDraft(20),
  name: 'Test build',
  lines: [
    { order: 0, coinType: 'morgan-dollar', quantity: 2, grader: 'ANY', tier: 'SELECT', notes: null },
    { order: 1, coinType: 'peace-dollar', quantity: 1, grader: 'PCGS', tier: 'SELECT', notes: ' keep ' },
  ],
});

console.log('--- stash keys ---');
check('unsaved build scope', stashKey(null), `shackpack:builder:draft:${STASH_VERSION}:new`);
check('empty string is the unsaved scope', stashKey('   '), `shackpack:builder:draft:${STASH_VERSION}:new`);
check('per-build scope', stashKey('abc123'), `shackpack:builder:draft:${STASH_VERSION}:abc123`);
check('scopes differ', stashKey('abc123') === stashKey(null), false);
check('two builds differ', stashKey('a') === stashKey('b'), false);

console.log('\n--- dirty comparison ---');
const snap = draftSnapshot(base(), 'notes');
check('identical draft is clean', isDirty(base(), 'notes', snap), false);
check('no snapshot yet -> never dirty', isDirty(base(), 'notes', null), false);
check('whitespace-only name change is clean', isDirty({ ...base(), name: '  Test build  ' }, 'notes', snap), false);
check('whitespace-only notes change is clean', isDirty(base(), '  notes ', snap), false);
check('renaming is dirty', isDirty({ ...base(), name: 'Renamed' }, 'notes', snap), true);
check('pack count is dirty', isDirty({ ...base(), packCount: 30 }, 'notes', snap), true);
check('tier is dirty', isDirty({ ...base(), tier: 'PREMIUM' }, 'notes', snap), true);
check('quantity is dirty', isDirty({ ...base(), lines: base().lines.map((l, i) => (i === 0 ? { ...l, quantity: 3 } : l)) }, 'notes', snap), true);
check('grader is dirty', isDirty({ ...base(), lines: base().lines.map((l, i) => (i === 0 ? { ...l, grader: 'NGC' as const } : l)) }, 'notes', snap), true);
check('reordering lines is dirty', isDirty({ ...base(), lines: [...base().lines].reverse() }, 'notes', snap), true);
check('removing a line is dirty', isDirty({ ...base(), lines: base().lines.slice(0, 1) }, 'notes', snap), true);
check('notes text is dirty', isDirty(base(), 'different', snap), true);
check('artwork is dirty', isDirty({ ...base(), artworkUrl: 'https://x/y.png', artworkKey: 'k' }, 'notes', snap), true);
check('a re-render with new line objects is clean', isDirty({ ...base(), lines: base().lines.map((l) => ({ ...l })) }, 'notes', snap), false);

console.log('\n--- stash round-trip ---');
const payload = { draft: base(), notes: 'hello', phone: '555', artworkPending: true };
const raw = serializeStash(payload)!;
const back = parseStash(raw)!;
check('round-trip keeps name, packCount, tier, notes, phone',
  [back.draft.name, back.draft.packCount, back.draft.tier, back.notes, back.phone], ['Test build', 20, 'SELECT', 'hello', '555']);
check('round-trip keeps every line', back.draft.lines.map((l) => [l.coinType, l.quantity, l.grader]), [['morgan-dollar', 2, 'ANY'], ['peace-dollar', 1, 'PCGS']]);
check('round-trip is dirty-equivalent to the original', draftSnapshot(back.draft, back.notes) === draftSnapshot(payload.draft, payload.notes), true);
check('round-trip keeps the artwork-pending flag', back.artworkPending, true);
check('the flag defaults to false when absent', parseStash(JSON.stringify({ version: STASH_VERSION, draft: base(), notes: '', phone: '' }))?.artworkPending, false);
check('a non-boolean flag is treated as false', parseStash(JSON.stringify({ version: STASH_VERSION, draft: base(), artworkPending: 'yes' }))?.artworkPending, false);
check('the stash never carries image bytes',
  /data:image|base64/.test(serializeStash({ draft: { ...base(), artworkUrl: 'https://cdn.example/a.png' }, notes: '', phone: '', artworkPending: true }) ?? ''), false);
check('line order is renumbered from position', back.draft.lines.map((l) => l.order), [0, 1]);
check('an oversized stash is not written', serializeStash({ draft: { ...base(), name: 'x'.repeat(MAX_STASH_CHARS) }, notes: '', phone: '', artworkPending: false }), null);

console.log('\n--- stash rejection ---');
for (const [label, value] of [
  ['null', null],
  ['empty', ''],
  ['not JSON', '{oops'],
  ['a JSON array', '[]'],
  ['a JSON string', '"hi"'],
  ['no version', JSON.stringify({ draft: base() })],
  ['old version v1', JSON.stringify({ version: 'v1', draft: base() })],
  ['the previous version v2, whose payload shape differs', JSON.stringify({ version: 'v2', draft: base(), notes: '', phone: '' })],
  ['no draft', JSON.stringify({ version: STASH_VERSION })],
  ['draft is not an object', JSON.stringify({ version: STASH_VERSION, draft: 7 })],
  ['missing name', JSON.stringify({ version: STASH_VERSION, draft: { ...base(), name: undefined } })],
  ['packCount not an integer', JSON.stringify({ version: STASH_VERSION, draft: { ...base(), packCount: 20.5 } })],
  ['packCount out of range', JSON.stringify({ version: STASH_VERSION, draft: { ...base(), packCount: 100000 } })],
  ['unknown tier', JSON.stringify({ version: STASH_VERSION, draft: { ...base(), tier: 'PLATINUM' } })],
  ['unknown status', JSON.stringify({ version: STASH_VERSION, draft: { ...base(), status: 'WEIRD' } })],
  ['lines not an array', JSON.stringify({ version: STASH_VERSION, draft: { ...base(), lines: 'x' } })],
  ['a line is not an object', JSON.stringify({ version: STASH_VERSION, draft: { ...base(), lines: [1] } })],
  ['line missing coinType', JSON.stringify({ version: STASH_VERSION, draft: { ...base(), lines: [{ quantity: 1, grader: 'ANY' }] } })],
  ['line quantity zero', JSON.stringify({ version: STASH_VERSION, draft: { ...base(), lines: [{ coinType: 'morgan-dollar', quantity: 0, grader: 'ANY' }] } })],
  ['line quantity too big', JSON.stringify({ version: STASH_VERSION, draft: { ...base(), lines: [{ coinType: 'morgan-dollar', quantity: 501, grader: 'ANY' }] } })],
  ['unknown grader', JSON.stringify({ version: STASH_VERSION, draft: { ...base(), lines: [{ coinType: 'morgan-dollar', quantity: 1, grader: 'HACK' }] } })],
] as [string, string | null][]) {
  check(`rejects ${label}`, parseStash(value), null);
}

if (failures > 0) {
  console.log(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log(`\nAll ${count} builder draft checks passed.`);
