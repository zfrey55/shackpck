#!/usr/bin/env node
// Apply pending Prisma migrations to PRODUCTION.
// Run with: npm run db:migrate:prod
//
// Migrations are a deliberate, explicit step. They do NOT run in the Netlify
// build: concurrent builds would race, a failed migration would leave the schema
// half-applied while the deploy still went live, and there is no rollback path.
//
// Order that keeps this safe:
//   1. run this script (migrations go first)
//   2. run scripts/check-rls.ts against prod and enable RLS on any new table
//   3. deploy the code that needs the new schema
// Each migration must be backward-compatible with the code already deployed:
// add columns nullable or with a default, and drop things in a later migration.
//
// Refuses to run unless: coins/.env.prod.local exists and points at a remote
// database, the git branch is main, and the working tree is clean.
// The connection string is read from that file and is never printed.

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const coinsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envFile = path.join(coinsDir, '.env.prod.local');

function refuse(reason, hint) {
  console.error(`db:migrate:prod REFUSED — ${reason}`);
  if (hint) console.error(`  ${hint}`);
  process.exit(2);
}

// --- the production connection string, from that one file only ---
if (!existsSync(envFile)) refuse('coins/.env.prod.local not found', 'It must contain DATABASE_URL for production.');
const line = readFileSync(envFile, 'utf8')
  .split(/\r?\n/)
  .find((l) => /^\s*DATABASE_URL\s*=/.test(l));
if (!line) refuse('no DATABASE_URL in coins/.env.prod.local');
const url = line.replace(/^\s*DATABASE_URL\s*=\s*/, '').trim().replace(/^["']|["']$/g, '');

let host;
try {
  host = new URL(url).hostname;
} catch {
  refuse('DATABASE_URL in coins/.env.prod.local is not a valid URL');
}
if (host === 'localhost' || host === '127.0.0.1') {
  refuse('DATABASE_URL points at localhost', 'This script is for production only; use `npm run db:migrate` locally.');
}

// --- git: main, and nothing uncommitted ---
const git = (args) => execFileSync('git', args, { cwd: coinsDir, encoding: 'utf8' }).trim();
let branch;
try {
  branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
} catch {
  refuse('not a git repository');
}
if (branch !== 'main') refuse(`on branch "${branch}", not main`, 'Migrations are applied from main only.');
const dirty = git(['status', '--porcelain']);
if (dirty) {
  refuse(
    `the working tree has ${dirty.split('\n').length} uncommitted change(s)`,
    'Commit or stash first, so what is applied matches what is committed.'
  );
}

// --- run prisma, scrubbing anything that could echo the connection string ---
const u = new URL(url);
const secrets = [url, u.host, u.hostname, u.password, decodeURIComponent(u.password), decodeURIComponent(u.username)].filter(
  (s) => s && s.length >= 4
);
const scrub = (s) => secrets.reduce((acc, x) => acc.split(x).join('<redacted>'), s ?? '');

function prisma(args) {
  const r = spawnSync('npx', ['prisma', ...args], {
    cwd: coinsDir,
    encoding: 'utf8',
    env: { ...process.env, DATABASE_URL: url, PRISMA_HIDE_UPDATE_MESSAGE: '1' },
  });
  process.stdout.write(scrub(r.stdout));
  process.stderr.write(scrub(r.stderr));
  return r.status ?? 1;
}

console.log(`db:migrate:prod — branch ${branch}, clean tree, remote database.\n`);
console.log('--- migrate status (before) ---');
prisma(['migrate', 'status']); // non-zero simply means "migrations pending"

console.log('\n--- migrate deploy ---');
const code = prisma(['migrate', 'deploy']);

if (code === 0) {
  console.log('\nNext: run the RLS guard against prod, then deploy the code.');
  console.log('  DATABASE_URL=<prod, from coins/.env.prod.local> npx tsx scripts/check-rls.ts');
} else {
  console.error('\nmigrate deploy failed. The schema may be partially applied: check `migrate status` before retrying.');
}
process.exit(code);
