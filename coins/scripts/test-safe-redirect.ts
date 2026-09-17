// Fixture tests for safeRedirectPath in lib/safe-redirect.
// Run with: npx tsx scripts/test-safe-redirect.ts
//
// No test framework on purpose — same shape as scripts/test-clean-entry-name.ts.

import { DEFAULT_REDIRECT_PATH, safeRedirectPath } from '../lib/safe-redirect';

const ORIGIN = 'https://shackpck.com';
const FALLBACK = DEFAULT_REDIRECT_PATH;
const BS = String.fromCharCode(92); // backslash
const TAB = String.fromCharCode(9);
const LF = String.fromCharCode(10);

const fixtures: { input: unknown; expected: string; note: string }[] = [
  { input: '/account', expected: '/account', note: 'plain same-origin path' },
  { input: '/admin?x=1', expected: '/admin?x=1', note: 'path with query kept' },
  { input: '/admin/builds?id=abc#top', expected: '/admin/builds?id=abc#top', note: 'query and hash kept' },
  { input: '/', expected: '/', note: 'root (sign-out callback)' },
  { input: '//evil.example', expected: FALLBACK, note: 'protocol-relative' },
  { input: 'https://evil.example', expected: FALLBACK, note: 'absolute external' },
  { input: 'https://evil.example/account', expected: FALLBACK, note: 'absolute external with a path' },
  { input: `/${BS}evil.example`, expected: FALLBACK, note: 'backslash (a browser reads it as //)' },
  { input: `${BS}${BS}evil.example`, expected: FALLBACK, note: 'double backslash' },
  { input: 'javascript:alert(1)', expected: FALLBACK, note: 'javascript: scheme' },
  { input: 'JavaScript:alert(1)', expected: FALLBACK, note: 'scheme, mixed case' },
  { input: 'data:text/html,hi', expected: FALLBACK, note: 'data: scheme' },
  { input: '%2F%2Fevil.example', expected: FALLBACK, note: 'encoded //, no leading slash' },
  { input: '/%2F%2Fevil.example', expected: '/%2F%2Fevil.example', note: 'encoded slashes inside a path stay a same-origin path' },
  { input: `/${TAB}/evil.example`, expected: FALLBACK, note: 'tab (browsers strip it, leaving //evil)' },
  { input: `/${LF}/evil.example`, expected: FALLBACK, note: 'newline' },
  { input: ' /account', expected: FALLBACK, note: 'leading space' },
  { input: 'https://shackpck.com/admin?x=1', expected: '/admin?x=1', note: 'same-origin absolute reduces to its path' },
  { input: 'https://shackpck.com//evil.example', expected: FALLBACK, note: 'same-origin absolute whose path is //' },
  { input: 'http://shackpck.com/admin', expected: FALLBACK, note: 'same host, different scheme' },
  { input: 'https://shackpck.com.evil.example/', expected: FALLBACK, note: 'origin-prefix lookalike host' },
  { input: 'https://shackpck.com@evil.example/', expected: FALLBACK, note: 'userinfo trick' },
  { input: 'https://localhost:3123.evil.example/', expected: FALLBACK, note: 'unparseable port (used to 500)' },
  { input: 'account', expected: FALLBACK, note: 'relative without leading slash' },
  { input: '', expected: FALLBACK, note: 'empty' },
  { input: undefined, expected: FALLBACK, note: 'undefined' },
  { input: null, expected: FALLBACK, note: 'null' },
  { input: 42, expected: FALLBACK, note: 'non-string' },
];

let failures = 0;
for (const f of fixtures) {
  let got: string;
  try {
    got = safeRedirectPath(f.input, ORIGIN);
  } catch (err) {
    got = `THREW: ${(err as Error).message}`;
  }
  const ok = got === f.expected;
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${JSON.stringify(f.input)} -> ${JSON.stringify(got)}  (${f.note})${ok ? '' : `  expected ${JSON.stringify(f.expected)}`}`);
}

// A custom fallback is honored, and a bad origin never throws.
const custom = safeRedirectPath('//evil.example', ORIGIN, '/');
if (custom !== '/') { failures++; console.log(`FAIL  custom fallback -> ${JSON.stringify(custom)}`); }
const badOrigin = safeRedirectPath('/account', 'not a url');
if (badOrigin !== FALLBACK) { failures++; console.log(`FAIL  bad origin -> ${JSON.stringify(badOrigin)}`); }

if (failures > 0) {
  console.log(`\n${failures} fixture(s) FAILED`);
  process.exit(1);
}
console.log(`\nAll ${fixtures.length + 2} fixtures passed, none threw.`);
