/**
 * Renders the app's own colouring pages (art/colouring/*.mjs) into colouring-pages/:
 * <name>.png (black lines on white) and <name>-coloured.png (flat colours).
 * Then `npm run colouring` turns them into Paint by Numbers pictures.
 *   node art/render-colouring.mjs [names...]
 * Each scene default-exports (c) => svg string, where c(colour) gives the fill to use
 * (white for the colouring page, the real colour for the coloured version).
 */
import { readdirSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { INK } from './lib.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  ({ chromium } = require(process.env.PLAYWRIGHT_PATH ?? '/opt/npm-tools/node_modules/playwright'));
}

const only = process.argv.slice(2);
const sceneDir = join(here, 'colouring');
const outDir = join(here, '..', 'colouring-pages');
mkdirSync(outDir, { recursive: true });

const lineMode = (c) => (c === 'none' || c === INK || c === 'ink' ? (c === 'ink' ? INK : c) : '#fff');
const colourMode = (c) => (c === 'ink' ? INK : c);

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });
for (const file of readdirSync(sceneDir).filter((f) => f.endsWith('.mjs') && !f.startsWith('_'))) {
  const name = file.replace(/\.mjs$/, '');
  if (only.length && !only.includes(name)) continue;
  const draw = (await import(pathToFileURL(join(sceneDir, file)).href + `?t=${Date.now()}`)).default;
  for (const [suffix, c] of [['', lineMode], ['-coloured', colourMode]]) {
    const svg = draw(c);
    await page.setContent(`<html><body style="margin:0;background:#fff">${svg}</body></html>`);
    const box = await page.locator('svg').first().boundingBox();
    await page.screenshot({ path: join(outDir, `${name}${suffix}.png`), clip: { x: 0, y: 0, width: Math.round(box.width), height: Math.round(box.height) } });
  }
  console.log('rendered', name);
}
await browser.close();
