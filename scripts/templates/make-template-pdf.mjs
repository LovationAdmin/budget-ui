// scripts/templates/make-template-pdf.mjs
// Prints the two printable templates with Chromium, using the site's fonts:
//   budget-template-fr.html → public/telechargements/tableau-budget-familial-a-imprimer.pdf
//   budget-template-en.html → public/telechargements/budget-template-printable.pdf
// Each QR marker (an HTML comment) becomes the code in qr-signup.svg. Needs
// Playwright and the static fonts, neither a dependency of the site:
//   npm install --no-save @fontsource/dm-sans @fontsource/plus-jakarta-sans
//   NODE_PATH=<dir with playwright> node scripts/templates/make-template-pdf.mjs
// CHROMIUM=<path> picks the browser binary when Playwright has none installed.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const here = join(root, 'scripts/templates');
// Static font files for the PDF (the site itself uses the variable ones).
const fonts = (pkg) => pathToFileURL(join(root, 'node_modules/@fontsource', pkg, 'files')).href;
// The SVG alone, without the comment that says where it comes from.
const qr = readFileSync(join(here, 'qr-signup.svg'), 'utf8').replace(/<!--[\s\S]*?-->\s*/, '').trim();

const TEMPLATES = [
  ['budget-template-fr.html', 'tableau-budget-familial-a-imprimer.pdf'],
  ['budget-template-en.html', 'budget-template-printable.pdf'],
];

const tmp = mkdtempSync(join(tmpdir(), 'templates-'));
const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
try {
  for (const [source, pdf] of TEMPLATES) {
    const html = readFileSync(join(here, source), 'utf8')
      .replace(/FONTS\/(dm-sans-[^']+)/g, (_, f) => `${fonts('dm-sans')}/${f}`)
      .replace(/FONTS\/(plus-jakarta-sans-[^']+)/g, (_, f) => `${fonts('plus-jakarta-sans')}/${f}`)
      .replaceAll('<!--QR-->', qr);
    const file = join(tmp, source);
    writeFileSync(file, html);
    const page = await browser.newPage();
    await page.goto(pathToFileURL(file).href, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const out = join(root, 'public/telechargements', pdf);
    await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
    await page.close();
    console.log(`wrote ${out}`);
  }
} finally {
  await browser.close();
  rmSync(tmp, { recursive: true, force: true });
}
