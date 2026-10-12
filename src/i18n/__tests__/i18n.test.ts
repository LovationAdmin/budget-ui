// src/i18n/__tests__/i18n.test.ts
// Languages of the public site (run with `npm test`): translated pages point
// to each other and exist in the sitemap, English amounts read and print the
// English way, and the English example says what its page publishes.

import { LOCALES, TRANSLATIONS, alternatesOf, hreflangsOf, localeOf, type Locale } from '../locales';
import { EXAMPLE_EN, EXAMPLE_EN_HIGH_RENT, formatEn } from '../en/budgetPerso';
import { moneyIntl, parseAmountEn } from '@/lib/budget/format';
import { computeBudgetPerso } from '@/lib/tools/budgetPerso';
import { PAGES } from '@/seo/site';

type Fn = () => void;
const tests: Array<{ name: string; fn: Fn }> = [];
const test = (name: string, fn: Fn) => tests.push({ name, fn });
class Fail extends Error {}
function eq(actual: unknown, expected: unknown, msg = '') {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Fail(`${msg}\n    got      ${a}\n    expected ${e}`);
}

export async function run(): Promise<number> {
  let failures = 0;
  for (const t of tests) {
    try {
      t.fn();
      console.log(`  ok   ${t.name}`);
    } catch (e) {
      failures++;
      console.log(`  FAIL ${t.name}\n    ${(e as Error).message}`);
    }
  }
  console.log(failures ? `\n${failures} failing test(s) out of ${tests.length}` : `\nAll ${tests.length} tests passed`);
  return failures;
}

test('language of a path', () => {
  eq(localeOf('/'), 'fr');
  eq(localeOf('/budget-personnel'), 'fr');
  eq(localeOf('/en'), 'en');
  eq(localeOf('/en/50-30-20-budget-calculator/'), 'en');
  eq(localeOf('/entreprise'), 'fr', 'a French path starting with "en"');
});

test('every translated page: in its language, indexable, in the sitemap', () => {
  const indexed = new Set(PAGES.filter((p) => !p.noindex && !p.canonical).map((p) => p.path));
  for (const t of TRANSLATIONS) {
    for (const [l, path] of Object.entries(t) as Array<[Locale, string]>) {
      eq(localeOf(path), l, path);
      eq(indexed.has(path), true, `${path} is an indexable page of src/seo/site.ts`);
    }
  }
});

test('hreflang: reciprocal, own version included, x-default in English', () => {
  for (const t of TRANSLATIONS) {
    const paths = Object.values(t) as string[];
    for (const path of paths) {
      eq(alternatesOf(path), t, path);
      eq(alternatesOf(`${path}/`), t, `${path}/ (trailing slash)`);
      const h = hreflangsOf(path);
      eq(h.filter((x) => x.hreflang !== 'x-default').map((x) => x.path).sort(), [...paths].sort(), path);
      eq(h.find((x) => x.hreflang === 'x-default')?.path, t.en, path);
    }
  }
  eq(hreflangsOf('/calcul-reste-a-vivre'), [], 'untranslated page');
});

test('each language home is a page of the site', () => {
  const paths = new Set(PAGES.map((p) => p.path));
  for (const l of Object.keys(LOCALES) as Locale[]) eq(paths.has(LOCALES[l].home), true, l);
});

test('English amounts: comma for thousands, symbol first', () => {
  eq(parseAmountEn('1,250.50'), 1250.5);
  eq(parseAmountEn(' $2,000 '), 2000);
  eq(parseAmountEn('12.5'), 12.5);
  eq(Number.isNaN(parseAmountEn('')), true);
  eq(moneyIntl(1180, 'en-US', 'USD', true), '$1,180');
  eq(moneyIntl(1180.5, 'en-GB', 'GBP'), '£1,180.50');
  eq(moneyIntl(-240, 'en-IE', 'EUR', true), '−€240');
  eq(moneyIntl(1180, 'en-CA', 'CAD', true), '$1,180');
  const f = formatEn('GBP');
  eq([f.money(33.33), f.moneyExact(33.33), f.pct(0.55), f.suffix], ['£33', '£33.33', '55%', '£/month']);
});

test('English example published on the page and in its prerendered summary', () => {
  const r = computeBudgetPerso(EXAMPLE_EN.incomes, EXAMPLE_EN.needs);
  eq([r.revenus, r.besoins, r.status, r.envies, r.epargne, r.enviesParJour], [4000, 2200, 'trimmed', 1000, 800, 33.33]);
  const high = computeBudgetPerso(EXAMPLE_EN_HIGH_RENT.incomes, EXAMPLE_EN_HIGH_RENT.needs);
  eq([high.besoins, Math.round((high.besoinsShare ?? 0) * 100), high.status, high.envies, high.epargne], [2600, 65, 'shared', 700, 700]);
});
