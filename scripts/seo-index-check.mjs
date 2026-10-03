#!/usr/bin/env node
// scripts/seo-index-check.mjs
// ============================================================================
// Google index check for every URL of the live sitemap, through the Search
// Console URL Inspection API: index verdict, coverage state, canonical chosen
// by Google, last crawl. Prints a Markdown report (or JSON) and the pages to
// submit by hand with « Demander l'indexation » — no API can do that.
//
// Credentials: a service account added as a user of the Search Console
// property, read from GSC_SERVICE_ACCOUNT_JSON (the key itself) or
// GSC_SERVICE_ACCOUNT_FILE (a path to it). The key is never printed.
//
//   node scripts/seo-index-check.mjs                    Markdown report
//   node scripts/seo-index-check.mjs --json             machine-readable
//   node scripts/seo-index-check.mjs --submit-sitemap   (re)submit the sitemap first
//   node scripts/seo-index-check.mjs --url https://budgetfamille.com/blog/x   extra URL (repeatable)
//
// Quota: 2 000 inspections a day and 600 a minute per property.
// ============================================================================
import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const options = (name) => args.flatMap((a, i) => (a === name && args[i + 1] ? [args[i + 1]] : []));

const PROPERTY = option('--site', process.env.GSC_SITE ?? 'sc-domain:budgetfamille.com');
const SITEMAP = option('--sitemap', 'https://www.budgetfamille.com/sitemap.xml');
const API = 'https://searchconsole.googleapis.com';

function fail(message) {
  console.error(`seo-index-check: ${message}`);
  process.exit(1);
}

function serviceAccount() {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON
    || (process.env.GSC_SERVICE_ACCOUNT_FILE && readFileSync(process.env.GSC_SERVICE_ACCOUNT_FILE, 'utf8'));
  if (!raw) fail('set GSC_SERVICE_ACCOUNT_JSON (or GSC_SERVICE_ACCOUNT_FILE)');
  try {
    const sa = JSON.parse(raw);
    if (!sa.client_email || !sa.private_key) throw new Error('missing fields');
    return sa;
  } catch {
    // Never echo the content: it is a private key.
    return fail('the service account key is not valid JSON with client_email and private_key');
  }
}

const b64url = (v) => Buffer.from(typeof v === 'string' ? v : JSON.stringify(v)).toString('base64url');

async function accessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64url({ alg: 'RS256', typ: 'JWT' })}.${b64url({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters',
    aud: sa.token_uri ?? 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })}`;
  const signature = createSign('RSA-SHA256').update(unsigned).sign(sa.private_key).toString('base64url');
  const res = await fetch(sa.token_uri ?? 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${signature}` }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.access_token) fail(`token refused (${res.status} ${body.error ?? ''})`);
  return body.access_token;
}

async function api(token, method, path, body) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    if ((res.status === 429 || res.status >= 500) && attempt < 3) {
      await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt));
      continue;
    }
    const text = await res.text();
    if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${text.slice(0, 300)}`);
    return text ? JSON.parse(text) : {};
  }
}

async function sitemapEntries() {
  const res = await fetch(SITEMAP, { headers: { 'Cache-Control': 'no-cache' } });
  if (!res.ok) fail(`sitemap ${SITEMAP}: HTTP ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, block]) => ({
    url: block.match(/<loc>\s*([^<\s]+)\s*<\/loc>/)?.[1],
    priority: Number(block.match(/<priority>([\d.]+)<\/priority>/)?.[1] ?? 0.5),
    lastmod: block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? null,
  })).filter((e) => e.url);
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  }));
  return out;
}

const decodeEntities = (s) => String(s ?? '').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const sameUrl = (a, b) => !!a && !!b && a.replace(/\/$/, '') === b.replace(/\/$/, '');

/** What to do about a URL, from most to least urgent. */
function triage(r) {
  if (r.error) return { level: 0, action: 'Erreur API, relancer' };
  // Extra URLs (--url: old hosts, redirected pages) are only followed.
  if (r.extra) return { level: 9, action: `Suivi (hors sitemap) : ${r.verdict === 'PASS' ? 'encore indexée' : 'non indexée'}` };
  if (r.verdict === 'PASS') {
    if (r.googleCanonical && !sameUrl(r.googleCanonical, r.url)) return { level: 2, action: 'Indexée, mais Google retient une autre canonique' };
    // Crawled before the canonical was fixed: a fresh crawl removes the conflicting signal.
    if (r.userCanonical && !sameUrl(r.userCanonical, r.url)) return { level: 4, action: "Indexée, lue avec une ancienne canonique : demander l'indexation" };
    return { level: 9, action: '—' };
  }
  if (r.robotsTxtState === 'DISALLOWED') return { level: 1, action: 'Bloquée par robots.txt : corriger' };
  // Never-crawled URLs report INDEXING_STATE_UNSPECIFIED: only real blocks count.
  if (/^BLOCKED_/.test(r.indexingState ?? '')) return { level: 1, action: 'noindex détecté : corriger' };
  if (r.pageFetchState && !['SUCCESSFUL', 'PAGE_FETCH_STATE_UNSPECIFIED'].includes(r.pageFetchState)) {
    return { level: 1, action: `Récupération ${r.pageFetchState} : corriger puis demander l'indexation` };
  }
  if (r.googleCanonical && !sameUrl(r.googleCanonical, r.url)) return { level: 2, action: "Google retient une autre canonique : demander l'indexation" };
  return { level: 3, action: "Demander l'indexation" };
}

async function inspect(token, entry) {
  try {
    const { inspectionResult: res = {} } = await api(token, 'POST', '/v1/urlInspection/index:inspect', {
      inspectionUrl: entry.url, siteUrl: PROPERTY, languageCode: 'fr-FR',
    });
    const s = res.indexStatusResult ?? {};
    const r = {
      ...entry,
      verdict: s.verdict ?? 'VERDICT_UNSPECIFIED',
      coverageState: decodeEntities(s.coverageState),
      indexingState: s.indexingState ?? null,
      robotsTxtState: s.robotsTxtState ?? null,
      pageFetchState: s.pageFetchState ?? null,
      lastCrawlTime: s.lastCrawlTime ?? null,
      crawledAs: s.crawledAs ?? null,
      googleCanonical: s.googleCanonical ?? null,
      userCanonical: s.userCanonical ?? null,
      sitemaps: s.sitemap ?? [],
      referringUrls: s.referringUrls ?? [],
      richResults: res.richResultsResult?.detectedItems?.map((d) => decodeEntities(d.richResultType)) ?? [],
      link: res.inspectionResultLink ?? null,
    };
    return { ...r, ...triage(r) };
  } catch (err) {
    const r = { ...entry, error: String(err.message ?? err) };
    return { ...r, ...triage(r) };
  }
}

const day = (iso) => (iso ? new Date(iso).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'jamais');
const short = (u) => (u ? u.replace(/^https:\/\/www\.budgetfamille\.com/, '').replace(/^https?:\/\//, '') || '/' : '—');
const cell = (s) => String(s ?? '').replace(/\|/g, '\\|');

function markdown(results, sitemaps) {
  // Counts cover the sitemap only; extra --url entries are listed but not counted.
  const own = results.filter((r) => !r.extra);
  const indexed = own.filter((r) => r.verdict === 'PASS').length;
  const lines = [
    `# Indexation Google — ${PROPERTY}`,
    '',
    `${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })} · ${indexed}/${own.length} URL du sitemap indexées · sitemap ${SITEMAP}`,
    '',
    '## Sitemaps',
    '',
    ...sitemaps.map((s) => `- ${s.path} — soumis ${day(s.lastSubmitted)}, lu ${day(s.lastDownloaded)}${s.isPending ? ' (en attente)' : ''}, ${(s.contents ?? []).map((c) => `${c.submitted} soumises / ${c.indexed ?? '?'} indexées`).join(', ')}, ${s.errors} erreur(s), ${s.warnings} avertissement(s)`),
    '',
    '## URL',
    '',
    '| Page | Prio. | Verdict | État | Canonique Google | Dernier passage | Action |',
    '|---|---|---|---|---|---|---|',
    ...results.map((r) => `| ${cell(short(r.url))} | ${r.priority} | ${r.error ? 'ERREUR' : r.verdict} | ${cell(r.error ?? r.coverageState)} | ${cell(r.googleCanonical ? (sameUrl(r.googleCanonical, r.url) ? '= déclarée' : short(r.googleCanonical)) : '—')} | ${day(r.lastCrawlTime)}${r.crawledAs ? ` (${r.crawledAs === 'MOBILE' ? 'mobile' : 'desktop'})` : ''} | ${cell(r.action)} |`),
  ];
  const todo = results.filter((r) => r.level < 9).sort((a, b) => a.level - b.level || b.priority - a.priority);
  lines.push('', "## À faire dans Search Console (« Inspection de l'URL » › « Demander l'indexation »)", '');
  if (!todo.length) lines.push('Rien : toutes les URL sont indexées avec la bonne canonique.');
  todo.forEach((r, i) => lines.push(`${i + 1}. ${r.url} — ${r.action}${r.coverageState ? ` (${r.coverageState})` : ''}`));
  lines.push('', "Quota manuel : une dizaine de demandes par jour ; commencer par le haut de la liste.");
  return lines.join('\n');
}

const sa = serviceAccount();
const token = await accessToken(sa);
const encodedProperty = encodeURIComponent(PROPERTY);

if (flag('--submit-sitemap')) {
  await api(token, 'PUT', `/webmasters/v3/sites/${encodedProperty}/sitemaps/${encodeURIComponent(SITEMAP)}`);
}

const entries = await sitemapEntries();
for (const url of options('--url')) entries.push({ url, priority: 0, lastmod: null, extra: true });
const [results, { sitemap = [] }] = await Promise.all([
  mapLimit(entries, 4, (e) => inspect(token, e)),
  api(token, 'GET', `/webmasters/v3/sites/${encodedProperty}/sitemaps`),
]);

if (flag('--json')) {
  console.log(JSON.stringify({ property: PROPERTY, sitemap: SITEMAP, checkedAt: new Date().toISOString(), sitemaps: sitemap, results }, null, 2));
} else {
  console.log(markdown(results, sitemap));
}
