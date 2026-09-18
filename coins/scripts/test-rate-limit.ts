// Fixture tests for the pure parts of lib/rate-limit: client IP extraction,
// key composition and email hashing, and the in-memory store's window logic.
// Run with: npx tsx scripts/test-rate-limit.ts
//
// No network: the Upstash store is not constructed here.

import {
  RATE_LIMITS,
  clientIp,
  createMemoryStore,
  emailIdentifier,
  ipIdentifier,
  rateLimitKey,
  rateLimitPrefix,
  userIdentifier,
} from '../lib/rate-limit';

let failures = 0;
let count = 0;
function check(name: string, got: unknown, expected: unknown) {
  count++;
  const ok = JSON.stringify(got) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `\n      got      ${JSON.stringify(got)}\n      expected ${JSON.stringify(expected)}`}`);
}
const headers = (h: Record<string, string>) => new Headers(h);

console.log('--- clientIp ---');
check('Netlify header wins over a spoofed x-forwarded-for',
  clientIp(headers({ 'x-nf-client-connection-ip': '203.0.113.7', 'x-forwarded-for': '6.6.6.6' })), '203.0.113.7');
check('x-forwarded-for first entry, trimmed', clientIp(headers({ 'x-forwarded-for': ' 198.51.100.4 , 10.0.0.1' })), '198.51.100.4');
check('IPv6 from the Netlify header', clientIp(headers({ 'x-nf-client-connection-ip': '2001:db8::1' })), '2001:db8::1');
check('blank Netlify header falls through to x-forwarded-for',
  clientIp(headers({ 'x-nf-client-connection-ip': '  ', 'x-forwarded-for': '192.0.2.9' })), '192.0.2.9');
check('no headers -> unknown', clientIp(headers({})), 'unknown');
check('empty x-forwarded-for -> unknown', clientIp(headers({ 'x-forwarded-for': '' })), 'unknown');

console.log('\n--- keys ---');
check('prefix uses CONTEXT when present', rateLimitPrefix({ CONTEXT: 'deploy-preview', NODE_ENV: 'production' }), 'shackpck:deploy-preview:rl');
check('prefix falls back to NODE_ENV', rateLimitPrefix({ NODE_ENV: 'production' }), 'shackpck:production:rl');
check('prefix with neither -> unknown', rateLimitPrefix({}), 'shackpck:unknown:rl');
check('development never shares production keys',
  rateLimitKey('contact', ipIdentifier('1.2.3.4'), { NODE_ENV: 'development' }) === rateLimitKey('contact', ipIdentifier('1.2.3.4'), { NODE_ENV: 'production' }), false);
check('key composition', rateLimitKey('signin-ip', ipIdentifier('1.2.3.4'), { CONTEXT: 'production' }), 'shackpck:production:rl:signin-ip:ip:1.2.3.4');
const e1 = emailIdentifier('Owner@Example.com');
check('email identifier ignores casing and outer spaces', [emailIdentifier('  owner@example.COM '), emailIdentifier('owner@example.com')], [e1, e1]);
check('email identifier contains no address', /@|owner|example/i.test(e1), false);
check('email identifier shape', /^email:[0-9a-f]{32}$/.test(e1), true);
check('different emails -> different identifiers', emailIdentifier('a@example.com') === emailIdentifier('b@example.com'), false);

console.log('\n--- limits ---');
check('configured limits', RATE_LIMITS, {
  contact: { limit: 5, windowSec: 600 },
  register: { limit: 5, windowSec: 3600 },
  'signin-ip': { limit: 10, windowSec: 600 },
  'signin-email': { limit: 10, windowSec: 600 },
  checkout: { limit: 10, windowSec: 600 },
  'build-submit': { limit: 5, windowSec: 3600 },
});
check('user identifier shape', userIdentifier('cku123'), 'user:cku123');
check('build-submit keys are per user, not per IP',
  rateLimitKey('build-submit', userIdentifier('cku123'), { CONTEXT: 'production' }), 'shackpck:production:rl:build-submit:user:cku123');

console.log('\n--- memory store ---');
(async () => {
  let t = 1_000_000;
  const store = createMemoryStore({ now: () => t });
  const hit = async (bucket: 'contact' | 'signin-ip', id: string) => (await store.limit(bucket, id)).success;
  const first5 = [];
  for (let i = 0; i < 5; i++) first5.push(await hit('contact', 'ip:a'));
  check('contact: 5 allowed', first5, [true, true, true, true, true]);
  check('contact: 6th blocked', await hit('contact', 'ip:a'), false);
  check('contact: other IP unaffected', await hit('contact', 'ip:b'), true);
  const blocked = await store.limit('contact', 'ip:a');
  check('blocked reset is when the oldest hit leaves the window', blocked.reset - t, 600_000);
  t += 600_001;
  check('contact: allowed again after the window', await hit('contact', 'ip:a'), true);
  const ten = [];
  for (let i = 0; i < 10; i++) ten.push(await hit('signin-ip', 'ip:c'));
  check('signin-ip: 10 allowed, 11th blocked', [ten.every(Boolean), await hit('signin-ip', 'ip:c')], [true, false]);
  const failing = createMemoryStore({ failWith: new Error('boom') });
  let threw = false;
  try { await failing.limit('contact', 'ip:z'); } catch { threw = true; }
  check('failing store throws (rateLimit() turns this into fail-open)', threw, true);

  if (failures > 0) {
    console.log(`\n${failures} check(s) FAILED`);
    process.exit(1);
  }
  console.log(`\nAll ${count} rate-limit checks passed.`);
})();
