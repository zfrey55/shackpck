/**
 * Generates public/og-default.png, the 1200x630 social card.
 *
 * REQUIRES GOOGLE CHROME. This deliberately shells out to headless Chrome
 * rather than pulling in an image library: sharp is not a dependency of this
 * project and the phase that added this file was not allowed to add one.
 * Chrome is a local tool, not a package, so nothing lands in package.json.
 *
 *   node scripts/generate-og-image.mjs
 *
 * The output is committed, so this only needs re-running when the artwork or
 * the copy changes. If Chrome is not installed the script exits non-zero and
 * the committed PNG is left alone.
 *
 * Source art is assets/shackpack-mark.png (512x512), which lives outside
 * public/ so it is never served. public/shackpack-favicon.png cannot be used
 * as the source: it is 192x192, and upscaling it to the 400px the layout wants
 * is visibly soft.
 *
 * The mark is a gold coin on a black backing, not a transparent cutout, so it
 * is composited with `mix-blend-mode: screen`. Against the near-black
 * background that dissolves the black square and leaves only the gold. Without
 * it the coin reads as an obvious black box on the charcoal field.
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');

const CHROME =
  process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const WIDTH = 1200;
const HEIGHT = 630;

/** Brand colours, kept in step with tailwind.config.ts. */
const GOLD = '#eab308';
const INK = '#080d16'; // a shade under `charcoal` (#0b1220) so the coin sits in

const HEADLINE = 'ShackPack';
const RULE = 'Premium Collectibles';
const BLURB =
  'Coin, bullion and card repacks — every series backed by a published checklist.';

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${WIDTH}px;height:${HEIGHT}px}
  body{background:${INK};display:flex;align-items:center;justify-content:center;gap:64px;
    font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif}
  img{width:400px;height:400px;mix-blend-mode:screen}
  .copy{max-width:560px}
  h1{color:#f1f5f9;font-size:64px;letter-spacing:-1.5px;font-weight:700;line-height:1}
  .rule{color:${GOLD};font-size:22px;letter-spacing:5px;text-transform:uppercase;
    margin-top:20px;font-weight:600}
  p{color:#94a3b8;font-size:26px;line-height:1.45;margin-top:26px}
</style></head><body>
  <img src="mark.png" alt="">
  <div class="copy">
    <h1>${HEADLINE}</h1>
    <div class="rule">${RULE}</div>
    <p>${BLURB}</p>
  </div>
</body></html>`;

const work = mkdtempSync(join(tmpdir(), 'shackpack-og-'));

try {
  writeFileSync(join(work, 'og.html'), html);
  copyFileSync(join(ROOT, 'assets/shackpack-mark.png'), join(work, 'mark.png'));

  execFileSync(
    CHROME,
    [
      '--headless',
      '--disable-gpu',
      '--hide-scrollbars',
      `--screenshot=${join(work, 'og.png')}`,
      `--window-size=${WIDTH},${HEIGHT}`,
      join(work, 'og.html'),
    ],
    { stdio: 'ignore' }
  );

  const out = join(ROOT, 'public/og-default.png');
  copyFileSync(join(work, 'og.png'), out);
  console.log(`Wrote ${out} (${WIDTH}x${HEIGHT})`);
} catch (error) {
  console.error(
    `Failed to generate the OG image. Is Chrome installed at ${CHROME}? ` +
      'Set CHROME_PATH to override.'
  );
  console.error(error.message);
  process.exit(1);
} finally {
  rmSync(work, { recursive: true, force: true });
}
