#!/usr/bin/env node
// Renders assets/card.html to a 1080×1350 PNG.
// Usage: node .claude/skills/social-content/scripts/render-card.mjs <out.png> title="…" [kicker="…"] [stat="…"] [statLabel="…"]
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const [out, ...pairs] = process.argv.slice(2);
if (!out || !pairs.some((p) => p.startsWith('title='))) {
  console.error('Usage: render-card.mjs <out.png> title="…" [kicker="…"] [stat="…"] [statLabel="…"]');
  process.exit(2);
}

// Playwright is installed globally in Claude Code containers (Chromium in
// PLAYWRIGHT_BROWSERS_PATH), not in the project.
const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require('playwright');
} catch {
  playwright = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
}

const card = pathToFileURL(path.join(path.dirname(fileURLToPath(import.meta.url)), '../assets/card.html'));
card.search = new URLSearchParams(pairs.map((p) => {
  const i = p.indexOf('=');
  return [p.slice(0, i), p.slice(i + 1)];
})).toString();

// Sandbox off: the container runs as root.
const browser = await playwright.chromium.launch({ chromiumSandbox: false });
try {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  await page.goto(card.href);
  await page.waitForSelector('body[data-ready]', { timeout: 15000 });
  await page.screenshot({ path: path.resolve(out), type: 'png' });
  console.log(path.resolve(out));
} finally {
  await browser.close();
}
