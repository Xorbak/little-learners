/**
 * Renders the app's own drawn pictures (art/puzzles/*.mjs) to JPGs in
 * src/pictures/puzzles/. Needs Playwright with Chromium:
 *   node art/render.mjs            (all)
 *   node art/render.mjs farm sea   (some)
 * Each scene file default-exports an SVG string (1600×900).
 */
import { readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  ({ chromium } = require(process.env.PLAYWRIGHT_PATH ?? '/opt/npm-tools/node_modules/playwright'));
}

const only = process.argv.slice(2);
const sceneDir = join(here, 'puzzles');
const outDir = join(here, '..', 'src', 'pictures', 'puzzles');
const previewDir = join(here, 'preview');
mkdirSync(outDir, { recursive: true });
mkdirSync(previewDir, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
for (const file of readdirSync(sceneDir).filter((f) => f.endsWith('.mjs'))) {
  const name = file.replace(/\.mjs$/, '');
  if (only.length && !only.includes(name)) continue;
  const svg = (await import(pathToFileURL(join(sceneDir, file)).href + `?t=${Date.now()}`)).default;
  writeFileSync(join(previewDir, `${name}.svg`), svg);
  await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
  await page.screenshot({ path: join(outDir, `${name}.jpg`), type: 'jpeg', quality: 86, clip: { x: 0, y: 0, width: 1600, height: 900 } });
  console.log('rendered', name);
}
await browser.close();
