#!/usr/bin/env node
// Google searches that already show budgetfamille.com in one country (Search
// Console, last 90 days): the queries to aim at when OpenRush has no credits.
// Without a country, the countries themselves. Free: the seo-bot service
// account of GSC_SERVICE_ACCOUNT_JSON, never printed.
// Usage: node .claude/skills/social-content/scripts/gsc-queries.mjs [country, ISO 3166 alpha-3: can, bel, che, mar…]
import { createSign } from 'node:crypto';

const country = process.argv[2]?.toLowerCase();
let sa;
try {
  sa = JSON.parse(process.env.GSC_SERVICE_ACCOUNT_JSON ?? '');
} catch {
  console.error('GSC_SERVICE_ACCOUNT_JSON missing or invalid');
  process.exit(1);
}

const b64 = (v) => Buffer.from(typeof v === 'string' ? v : JSON.stringify(v)).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
  iss: sa.client_email,
  scope: 'https://www.googleapis.com/auth/webmasters.readonly',
  aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600,
})}`;
const sig = createSign('RSA-SHA256').update(unsigned).sign(sa.private_key).toString('base64url');
const { access_token: token } = await (await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${sig}` }),
})).json();
if (!token) {
  console.error('Google refused the service account token');
  process.exit(1);
}

const GSC = 'https://www.googleapis.com/webmasters/v3';
async function call(url, body) {
  const res = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${json.error?.message ?? ''}`.trim());
  return json;
}

const site = ((await call(`${GSC}/sites`)).siteEntry ?? []).find((s) => s.siteUrl.includes('budgetfamille.com'))?.siteUrl;
if (!site) {
  console.error('No Search Console property for budgetfamille.com on this account');
  process.exit(1);
}
const day = (d) => d.toISOString().slice(0, 10);
const end = new Date(Date.now() - 3 * 864e5); // Search Console lags ~3 days
const { rows = [] } = await call(`${GSC}/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
  startDate: day(new Date(end.getTime() - 89 * 864e5)),
  endDate: day(end),
  dimensions: country ? ['query', 'page'] : ['country'],
  rowLimit: 200,
  ...(country ? { dimensionFilterGroups: [{ filters: [{ dimension: 'country', operator: 'equals', expression: country }] }] } : {}),
});

const path = (url) => url.replace(/^https:\/\/(www\.)?budgetfamille\.com/, '') || '/';
console.log(`${country ? `Queries in ${country}` : 'Countries'}, ${day(new Date(end.getTime() - 89 * 864e5))} → ${day(end)} (impressions, clicks, position)`);
for (const r of rows.sort((a, b) => b.impressions - a.impressions)) {
  const what = country ? `${r.keys[0]}  →  ${path(r.keys[1])}` : r.keys[0];
  console.log(`${String(r.impressions).padStart(5)}  ${String(r.clicks).padStart(3)}  ${r.position.toFixed(1).padStart(5)}  ${what}`);
}
