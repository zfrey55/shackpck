// Fixture tests for the JSON-LD emitted by components/StructuredData.
// Run with: npx tsx scripts/test-structured-data.ts
//
// No test framework on purpose — same shape as scripts/test-safe-redirect.ts.
//
// The point of this file is that the JSON-LD is a string built by hand and
// injected with dangerouslySetInnerHTML. Nothing else would notice if it
// stopped parsing, or if a Product/Offer crept in while checkout is disabled.

import { STRUCTURED_DATA_JSON } from '../components/StructuredData';

// The exact string the component injects, tested directly rather than through
// a render — this is what ships inside the <script> element.
const raw = STRUCTURED_DATA_JSON;

let failures = 0;
function check(ok: boolean, label: string, detail = '') {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok || !detail ? '' : `  (${detail})`}`);
}

// It parses. This is the assertion that matters most.
let parsed: any;
try {
  parsed = JSON.parse(raw);
  check(true, 'JSON.parse succeeds');
} catch (err) {
  check(false, 'JSON.parse succeeds', (err as Error).message);
  console.log(`\n${failures} fixture(s) FAILED`);
  process.exit(1);
}

const graph: any[] = parsed['@graph'] ?? [];
const org = graph.find((n) => n['@type'] === 'Organization');
const site = graph.find((n) => n['@type'] === 'WebSite');

check(parsed['@context'] === 'https://schema.org', '@context is schema.org');
check(!!org, 'Organization node present');
check(!!site, 'WebSite node present');
check(org?.name === 'ShackPack', 'Organization.name is ShackPack', org?.name);
check(typeof org?.url === 'string' && org.url.startsWith('https://'), 'Organization.url is absolute');
check(
  typeof org?.logo?.url === 'string' && org.logo.url.startsWith('https://'),
  'Organization.logo.url is absolute',
  org?.logo?.url
);

// schema.org wants E.164, not the display string '(561) 870-4222'.
check(
  /^\+\d[\d-]+$/.test(org?.contactPoint?.telephone ?? ''),
  'contactPoint.telephone is E.164',
  org?.contactPoint?.telephone
);

// The scope guards. These are the ones that must not regress quietly.
check(!('sameAs' in (org ?? {})), 'no sameAs (the footer socials are # placeholders)');
check(!/"@type"\s*:\s*"(Product|Offer|AggregateOffer|ItemList)"/.test(raw),
  'no Product/Offer/ItemList while checkout is disabled');
check(!('potentialAction' in (site ?? {})), 'no SearchAction (the site has no search)');

// '<' is escaped so a value can never break out of the script element.
check(!raw.includes('<'), 'no raw < in the serialized JSON');

if (failures > 0) {
  console.log(`\n${failures} fixture(s) FAILED`);
  process.exit(1);
}
console.log('\nAll structured-data fixtures passed.');
