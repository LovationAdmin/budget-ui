#!/usr/bin/env node
// scripts/indexnow.mjs
// ============================================================================
// Announces new, changed or removed pages to IndexNow (Bing, and the search
// engines that share it: Yandex, Seznam, Naver… Bing's index also feeds
// Copilot and ChatGPT search). Google does not use IndexNow: it reads the
// sitemap, whose <lastmod> the prerender keeps accurate.
//
// The key is the public file public/<32 hex>.txt (IndexNow checks it at
// https://www.budgetfamille.com/<key>.txt); it is not a secret.
//
//   node scripts/indexnow.mjs                        URLs listed in `changed` of the live seo-manifest.json
//   node scripts/indexnow.mjs --expect-commit <sha>  first wait until that commit is live (CI, after a push)
//   node scripts/indexnow.mjs --all                  every URL of the live sitemap
//   node scripts/indexnow.mjs --url <url> …          given URLs only (repeatable)
//   node scripts/indexnow.mjs --dry-run              print, do not submit
// ============================================================================
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://www.budgetfamille.com';
const HOST = new URL(SITE).host;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const options = (name) => args.flatMap((a, i) => (a === name && args[i + 1] ? [args[i + 1]] : []));

function fail(message) {
  console.error(`indexnow: ${message}`);
  process.exit(1);
}

function readKey() {
  const files = readdirSync(join(root, 'public')).filter((f) => /^[0-9a-f]{32}\.txt$/.test(f));
  if (files.length !== 1) fail(`expected exactly one public/<key>.txt, found ${files.length}`);
  const key = files[0].slice(0, -4);
  if (readFileSync(join(root, 'public', files[0]), 'utf8').trim() !== key) fail(`public/${files[0]} must contain its own name`);
  return key;
}

const noCache = (url) => `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`;

async function get(url, as = 'text') {
  const res = await fetch(noCache(url), { headers: { 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return as === 'json' ? res.json() : res.text();
}

/** Waits for the live manifest of `commit` (Vercel builds and promotes after the push). */
async function liveManifest(commit) {
  const deadline = Date.now() + Number(option('--timeout') ?? 900) * 1000;
  for (;;) {
    const manifest = await get(`${SITE}/seo-manifest.json`, 'json').catch(() => null);
    if (manifest && (!commit || manifest.commit === commit)) return manifest;
    if (Date.now() > deadline) {
      // Not an error: a push may not deploy (e.g. a docs-only change Vercel skips).
      console.log(`::warning::indexnow: ${commit} is not live yet (live: ${manifest?.commit ?? 'unknown'}); nothing submitted`);
      process.exit(0);
    }
    await new Promise((r) => setTimeout(r, 20000));
  }
}

async function urlsToSubmit() {
  const given = options('--url');
  if (given.length) return given;
  if (flag('--all')) {
    const xml = await get(`${SITE}/sitemap.xml`);
    return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
  }
  const manifest = await liveManifest(option('--expect-commit'));
  return manifest.changed ?? [];
}

const key = readKey();
const keyLocation = `${SITE}/${key}.txt`;
const urlList = [...new Set(await urlsToSubmit())].filter((u) => new URL(u).host === HOST);

if (!urlList.length) {
  console.log('indexnow: no changed URL to submit');
  process.exit(0);
}
console.log(`indexnow: ${urlList.length} URL(s)\n${urlList.map((u) => `  ${u}`).join('\n')}`);
if (flag('--dry-run')) process.exit(0);

// IndexNow fetches the key file to verify ownership: make sure it is served.
const served = await get(keyLocation).catch((err) => fail(`key file not reachable: ${err.message}`));
if (served.trim() !== key) fail(`${keyLocation} does not contain the key`);

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key, keyLocation, urlList }),
  signal: AbortSignal.timeout(30000),
});
const detail = (await res.text()).slice(0, 300);
// 200 = accepted, 202 = accepted while the key is being validated.
if (res.status !== 200 && res.status !== 202) fail(`HTTP ${res.status} ${detail}`);
console.log(`indexnow: accepted (HTTP ${res.status})`);
