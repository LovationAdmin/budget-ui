// src/i18n/__tests__/i18n.test.ts
// Languages of the public site (run with `npm test`): translated pages point
// to each other and exist in the sitemap, English and Chinese amounts read and
// print their way, and the English example says what its page publishes.

import { APP_LOCALES, LOCALES, TRANSLATIONS, alternatesOf, appLocale, hreflangsOf, localeOf, localizedPath, type Locale } from '../locales';
import { EXAMPLE_EN, EXAMPLE_EN_HIGH_RENT } from '../en/budgetPerso';
import { colocExampleEn } from '../en/colocation';
import { MARIAGE_EN } from '../en/mariage';
import { RAV_EXAMPLE_EN } from '../en/resteAVivre';
import { RAV_EXAMPLE_FR } from '../fr/resteAVivre';
import { EN_TOOLS } from '../en/tools';
import { ZH_TOOLS } from '../zh/tools';
import { FORMAT_FR, formatEn, formatFr, formatZh, CURRENCIES_BY_LOCALE, currencyOf } from '../format';
import { scaleAmounts } from '@/lib/tools/scaleAmounts';
import { moneyIntl, parseAmountEn } from '@/lib/budget/format';
import { computeBudgetPerso } from '@/lib/tools/budgetPerso';
import { computeColocation } from '@/lib/tools/colocation';
import { exampleResult } from '@/lib/tools/mariage';
import { computeResteAVivre } from '@/lib/tools/resteAVivre';
import { EXAMPLE as WEDDING_EXAMPLE } from '@/lib/tools/mariage';
import { BUDGET_503020_PAGE_ZH } from '@/seo/zh/budget-503020';
import { RENT_SPLIT_PAGE_ZH } from '@/seo/zh/rent-split';
import { WEDDING_PAGE_ZH } from '@/seo/zh/wedding';
import { LEFTOVER_INCOME_PAGE_ZH } from '@/seo/zh/leftover-income';
import { PAGES } from '@/seo/site';
import { BLOG_PAIRS } from '@/data/blog-pairs';
import { blogArticles } from '@/data/blog-articles';
import { blogArticlesEn } from '@/data/blog-articles-en';

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

test('every translated page: in its language, indexable, in the sitemap (pages and articles)', () => {
  const indexed = new Set([
    ...PAGES.filter((p) => !p.noindex && !p.canonical).map((p) => p.path),
    ...blogArticles.map((a) => `/blog/${a.slug}`),
    ...blogArticlesEn.map((a) => `/en/blog/${a.slug}`),
  ]);
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
  eq(hreflangsOf('/blog/gerer-budget-familial-senegal-dakar'), [], 'untranslated page');
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
  eq([f.money(33.33), f.moneyExact(33.33), f.pct(0.55), f.symbol], ['£33', '£33.33', '55%', '£']);
});

test('English example published on the page and in its prerendered summary', () => {
  const r = computeBudgetPerso(EXAMPLE_EN.incomes, EXAMPLE_EN.needs);
  eq([r.revenus, r.besoins, r.status, r.envies, r.epargne, r.enviesParJour], [4000, 2200, 'trimmed', 1000, 800, 33.33]);
  const high = computeBudgetPerso(EXAMPLE_EN_HIGH_RENT.incomes, EXAMPLE_EN_HIGH_RENT.needs);
  eq([high.besoins, Math.round((high.besoinsShare ?? 0) * 100), high.status, high.envies, high.epargne], [2600, 65, 'shared', 700, 700]);
});

test('every English page: in the site, linked to its French version', () => {
  const paths = new Set(PAGES.map((p) => p.path));
  for (const tool of EN_TOOLS) {
    eq(paths.has(tool.path), true, tool.path);
    eq(localeOf(tool.path), 'en', tool.path);
    eq(typeof alternatesOf(tool.path)?.fr, 'string', `${tool.path} has a French version`);
  }
});

test('French amounts keep a non-breaking space before %', () => {
  eq(FORMAT_FR.pct(0.334), '33\u00a0%');
});

test('English rent split example: same split in square feet or meters, as published', () => {
  const total = (unit: 'sq ft' | 'm²', method: 'egal' | 'chambre' | 'revenus') =>
    computeColocation({ ...colocExampleEn(unit), method }).shares.map((x) => Math.round(x.total * 100) / 100);
  eq(total('sq ft', 'chambre'), total('m²', 'chambre'));
  eq(total('sq ft', 'egal'), [1010, 1010, 1010]);
  eq(total('sq ft', 'chambre'), [897.5, 998.75, 1133.75]);
  eq(colocExampleEn('sq ft').roommates.map((m) => m.room), [100, 130, 170]);
});

test('English wedding page: months in English, published example figures', () => {
  eq(MARIAGE_EN.monthLabel({ year: 2027, month: 6 }), 'June 2027');
  eq(MARIAGE_EN.plan({ months: 8, from: 'October 2026', to: 'May 2027', remaining: '$18,000', total: '$22,000', saved: '$4,000' }),
    'From October 2026 to May 2027, 8 deposits, to gather $18,000 ($22,000 − $4,000 already saved).');
  const ex = exampleResult();
  eq([ex.total, ex.costPerGuest, ex.fewerGuests.saving, ex.monthly], [22000, 220, 2000, 1000]);
});

test('leftover income examples: what their pages publish', () => {
  const en = computeResteAVivre(RAV_EXAMPLE_EN.household, RAV_EXAMPLE_EN.incomes, RAV_EXAMPLE_EN.charges);
  eq([en.revenus, en.charges, en.reste, en.parPersonne, Math.round(en.parJour)], [6000, 3700, 2300, 575, 77]);
  const page = PAGES.find((p) => p.path === '/en/leftover-income-calculator');
  eq(page?.sections?.some((sec) => sec.text.includes('2,300 a month, or 575 per person and about 77 a day')), true, 'site.ts example');
  const fr = computeResteAVivre(RAV_EXAMPLE_FR.household, RAV_EXAMPLE_FR.incomes, RAV_EXAMPLE_FR.charges);
  eq([fr.reste, fr.parPersonne], [1790, 447.5], 'French example unchanged');
});

test('English calculators: each one listed, translated and indexable', () => {
  const indexed = new Set(PAGES.filter((p) => !p.noindex).map((p) => p.path));
  for (const tool of EN_TOOLS) {
    eq(localeOf(tool.path), 'en', tool.path);
    eq(!!alternatesOf(tool.path)?.fr, true, `${tool.path} has a French version`);
    eq(indexed.has(tool.path), true, tool.path);
  }
});

test('English blog: every article adapts a French one, both paired in BLOG_PAIRS', () => {
  const fr = new Set(blogArticles.map((a) => a.slug));
  const en = new Set(blogArticlesEn.map((a) => a.slug));
  eq(BLOG_PAIRS.length, blogArticlesEn.length, 'one pair per English article');
  for (const a of blogArticlesEn) {
    const pair = BLOG_PAIRS.find((p) => p.en === a.slug);
    eq(pair?.fr, a.translationOf, a.slug);
    eq(fr.has(a.translationOf ?? ''), true, `${a.slug} → ${a.translationOf} exists in French`);
    for (const r of a.related ?? []) eq(en.has(r), true, `${a.slug} related ${r}`);
    eq(alternatesOf(`/en/blog/${a.slug}`)?.fr, `/blog/${a.translationOf}`, a.slug);
  }
});

test('local currencies: Indian grouping, CFA francs without cents, French symbols after', () => {
  const nb = (x: string) => x.replace(/[\u00a0\u202f]/g, ' ');
  eq(formatEn('INR').money(1234567), '₹12,34,567');
  eq(formatEn('NGN').money(600000), '₦600,000');
  eq(formatEn('XOF').moneyExact(1234.56), '1,235 FCFA');
  eq(nb(formatFr('XOF').moneyExact(300000.4)), '300 000 FCFA');
  eq(nb(formatFr('MAD').money(10000)), '10 000 DH');
  eq(nb(formatFr('EUR').moneyExact(16.67)), nb(FORMAT_FR.moneyExact(16.67)));
  for (const l of ['fr', 'en'] as const) for (const c of CURRENCIES_BY_LOCALE[l]) eq(!!currencyOf(c), true, c);
});

test('examples in other currencies: scaled and rounded, counts and sizes unchanged', () => {
  eq(formatEn('USD').example(1350), 1350, 'scale 1 keeps the reference example');
  eq(formatEn('INR').example(4000), 60000);
  eq(formatFr('XOF').example(1350), 203000);
  const coloc = scaleAmounts({ rent: 1350, roommates: [{ name: 'A', room: 12, income: 2000 }] }, formatFr('XOF').example, ['room']);
  eq(coloc, { rent: 203000, roommates: [{ name: 'A', room: 12, income: 300000 }] });
});

test('Chinese amounts: symbol first whatever its length, comma for thousands', () => {
  const f = formatZh('CNY');
  eq([f.money(12000), f.moneyExact(16.5), f.money(-1200.4), f.pct(0.55), f.symbol], ['¥12,000', '¥16.50', '−¥1,200', '55%', '¥']);
  eq(formatZh('HKD').money(9800), 'HK$9,800');
  eq(formatZh('USD').money(1180), 'US$1,180', 'never a bare $ between dollars');
  eq(f.parse('1,250.50'), 1250.5);
  for (const c of CURRENCIES_BY_LOCALE.zh) eq([!!currencyOf(c).labelZh, !!currencyOf(c).symbolZh], [true, true], c);
  eq(formatZh('CNY').example(4000), 12000);
  eq(formatZh('TWD').example(1300), 26000);
});

test('Chinese pages: each one in the site and the sitemap, paired with French and English', () => {
  const pages = new Map(PAGES.map((p) => [p.path, p]));
  for (const path of [LOCALES.zh.home, ...ZH_TOOLS.map((t) => t.path)]) {
    eq(localeOf(path), 'zh', path);
    eq(!!pages.get(path) && !pages.get(path)?.noindex, true, path);
    const alts = alternatesOf(path);
    eq([!!alts?.fr, !!alts?.en], [true, true], path);
    eq(hreflangsOf(path).some((h) => h.hreflang === 'zh-Hans' && h.path === path), true, path);
  }
});

test('the app is in French and English: Chinese readers get English, links fall back to it', () => {
  eq(APP_LOCALES.includes('zh'), false);
  eq(appLocale('zh'), 'en');
  eq(localizedPath('/budget-personnel', 'zh'), '/zh/50-30-20-budget-calculator');
  eq(localizedPath('/help', 'zh'), '/en/help');
  eq(localizedPath('/help', 'fr'), '/help');
  eq(localizedPath('/signup', 'zh'), '/signup');
});

test('Chinese examples: the yuan figures their prerendered summaries publish', () => {
  const f = formatZh('CNY');
  const says = (page: { sections?: Array<{ text: string }> }, ...figures: string[]) =>
    figures.forEach((x) => eq(page.sections?.some((sec) => sec.text.includes(x)), true, x));
  const perso = scaleAmounts(EXAMPLE_EN, f.example);
  const r = computeBudgetPerso(perso.incomes, perso.needs);
  says(BUDGET_503020_PAGE_ZH, f.money(r.revenus), f.money(r.envies), f.money(r.epargne));
  const coloc = scaleAmounts(colocExampleEn('m²'), f.example, ['room']);
  const equal = computeColocation({ ...coloc, method: 'egal' }).shares[0].total;
  const byRoom = computeColocation({ ...coloc, method: 'chambre' }).shares.map((x) => f.moneyExact(x.total));
  says(RENT_SPLIT_PAGE_ZH, f.moneyExact(coloc.rent), f.moneyExact(equal), ...byRoom);
  const wedding = exampleResult(scaleAmounts(WEDDING_EXAMPLE, f.example, ['guests', 'monthsAhead']));
  says(WEDDING_PAGE_ZH, f.money(wedding.total), f.money(wedding.costPerGuest), f.money(wedding.fewerGuests.saving), f.money(wedding.monthly));
  const rav = scaleAmounts(RAV_EXAMPLE_EN, f.example, ['household']);
  const left = computeResteAVivre(rav.household, rav.incomes, rav.charges);
  says(LEFTOVER_INCOME_PAGE_ZH, f.money(left.revenus), f.money(left.charges), f.money(left.reste), f.money(left.parPersonne));
});
