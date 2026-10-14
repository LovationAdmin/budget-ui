// scripts/templates/make-template-en.mjs
// Prints the English printable template (budget-template-en.html) to
// public/telechargements/budget-template-printable.pdf with Chromium, using
// the site's fonts from node_modules. Needs Playwright (not a dependency of
// the site): NODE_PATH=<dir with playwright> node scripts/templates/make-template-en.mjs
// CHROMIUM=<path> picks the browser binary when Playwright has none installed.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const fonts = (pkg) => pathToFileURL(join(root, 'node_modules/@fontsource', pkg, 'files')).href;
const html = readFileSync(join(root, 'scripts/templates/budget-template-en.html'), 'utf8')
  .replace(/FONTS\/(dm-sans-[^']+)/g, (_, f) => `${fonts('dm-sans')}/${f}`)
  .replace(/FONTS\/(plus-jakarta-sans-[^']+)/g, (_, f) => `${fonts('plus-jakarta-sans')}/${f}`);

const tmp = mkdtempSync(join(tmpdir(), 'template-en-'));
const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
try {
  const file = join(tmp, 'template.html');
  writeFileSync(file, html);
  const page = await browser.newPage();
  await page.goto(pathToFileURL(file).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const out = join(root, 'public/telechargements/budget-template-printable.pdf');
  await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
  console.log(`wrote ${out}`);
} finally {
  await browser.close();
  rmSync(tmp, { recursive: true, force: true });
}
