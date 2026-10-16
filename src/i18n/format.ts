// src/i18n/format.ts
// ============================================================================
// How the free calculators write and read amounts in each language, in the
// visitor's currency (from the time zone or the browser's region, changeable).
// French: "1 180 €", "350 000 FCFA", "1 250,50" typed with a comma. English:
// "$1,180", "₹60,000", "1,250.50" typed with the comma between thousands.
// Chinese: "¥15,000", "HK$9,800", the symbol before the amount, as in English.
// ============================================================================

import { money, moneyBefore, moneyIntl, parseAmount, parseAmountEn } from '@/lib/budget/format';
import type { Locale } from './locales';

export interface ToolFormat {
  /** Whole amount: "1 180 €", "$1,180". */
  money: (n: number) => string;
  /** Cents when present: "16,67 €", "$16.67". */
  moneyExact: (n: number) => string;
  pct: (share: number) => string;
  parse: (raw: string) => number;
  /** Currency symbol, shown after amount fields ("€/mois", "$/month"). */
  symbol: string;
  /**
   * An example amount in this currency. Examples are written in euros (French
   * pages) or dollars (English pages); where amounts have another order of
   * magnitude (rupees, naira, CFA francs…) they are scaled and rounded, so
   * that a fictitious example still looks like a household's budget there.
   */
  example: (n: number) => number;
}

export type CurrencyCode =
  | 'USD' | 'GBP' | 'EUR' | 'CAD' | 'AUD' | 'INR' | 'NGN' | 'KES' | 'GHS' | 'ZAR' | 'SGD' | 'MYR' | 'PHP'
  | 'XOF' | 'XAF' | 'MAD' | 'TND' | 'DZD' | 'CHF' | 'CNY' | 'HKD' | 'TWD';

export interface Currency {
  code: CurrencyCode;
  /** Name in the currency menu of the English pages, then of the French and Chinese ones. */
  label: string;
  labelFr: string;
  labelZh?: string;
  /** Number format of the country on English pages (separators, symbol position). */
  locale: string;
  /** Symbol after amount fields on English pages ("$/month"). */
  symbol: string;
  /** Symbol after amounts on French pages ("1 180 FCFA"). */
  symbolFr: string;
  /** Symbol before amounts on Chinese pages ("¥15,000", "US$1,180"): never ambiguous between dollars. */
  symbolZh?: string;
  /** Usual unit for the size of a room where the currency is used. */
  area: 'sq ft' | 'm²';
  /** Rough order of magnitude of everyday amounts compared with dollars or euros, for the fictitious examples only. */
  scale: number;
  /** Amounts are written without cents (CFA francs). */
  whole?: boolean;
}

export const CURRENCIES: ReadonlyArray<Currency> = [
  { code: 'USD', label: 'US dollar ($)', labelFr: 'Dollar américain ($)', locale: 'en-US', symbol: '$', symbolFr: '$ US', labelZh: '美元 (US$)', symbolZh: 'US$', area: 'sq ft', scale: 1 },
  { code: 'GBP', label: 'Pound sterling (£)', labelFr: 'Livre sterling (£)', locale: 'en-GB', symbol: '£', symbolFr: '£', labelZh: '英镑 (£)', symbolZh: '£', area: 'sq ft', scale: 1 },
  { code: 'EUR', label: 'Euro (€)', labelFr: 'Euro (€)', locale: 'en-IE', symbol: '€', symbolFr: '€', labelZh: '欧元 (€)', symbolZh: '€', area: 'm²', scale: 1 },
  { code: 'CAD', label: 'Canadian dollar ($)', labelFr: 'Dollar canadien ($)', locale: 'en-CA', symbol: '$', symbolFr: '$', labelZh: '加拿大元 (C$)', symbolZh: 'C$', area: 'sq ft', scale: 1 },
  { code: 'AUD', label: 'Australian dollar ($)', labelFr: 'Dollar australien ($)', locale: 'en-AU', symbol: '$', symbolFr: '$ AU', labelZh: '澳大利亚元 (A$)', symbolZh: 'A$', area: 'm²', scale: 1 },
  { code: 'INR', label: 'Indian rupee (₹)', labelFr: 'Roupie indienne (₹)', locale: 'en-IN', symbol: '₹', symbolFr: '₹', area: 'sq ft', scale: 15 },
  { code: 'NGN', label: 'Nigerian naira (₦)', labelFr: 'Naira nigérian (₦)', locale: 'en-NG', symbol: '₦', symbolFr: '₦', area: 'm²', scale: 150 },
  { code: 'KES', label: 'Kenyan shilling (Ksh)', labelFr: 'Shilling kényan (Ksh)', locale: 'en-KE', symbol: 'Ksh', symbolFr: 'Ksh', area: 'm²', scale: 30 },
  { code: 'GHS', label: 'Ghanaian cedi (GH₵)', labelFr: 'Cedi ghanéen (GH₵)', locale: 'en-GH', symbol: 'GH₵', symbolFr: 'GH₵', area: 'm²', scale: 2 },
  { code: 'ZAR', label: 'South African rand (R)', labelFr: 'Rand sud-africain (R)', locale: 'en-GB', symbol: 'R', symbolFr: 'R', area: 'm²', scale: 6 },
  { code: 'SGD', label: 'Singapore dollar ($)', labelFr: 'Dollar de Singapour ($)', locale: 'en-SG', symbol: '$', symbolFr: '$ SG', labelZh: '新加坡元 (S$)', symbolZh: 'S$', area: 'sq ft', scale: 1.5 },
  { code: 'MYR', label: 'Malaysian ringgit (RM)', labelFr: 'Ringgit malaisien (RM)', locale: 'en-MY', symbol: 'RM', symbolFr: 'RM', labelZh: '马来西亚林吉特 (RM)', symbolZh: 'RM', area: 'sq ft', scale: 2 },
  { code: 'PHP', label: 'Philippine peso (₱)', labelFr: 'Peso philippin (₱)', locale: 'en-PH', symbol: '₱', symbolFr: '₱', area: 'm²', scale: 15 },
  { code: 'XOF', label: 'CFA franc (West Africa)', labelFr: 'Franc CFA (UEMOA)', locale: 'en-US', symbol: 'FCFA', symbolFr: 'FCFA', area: 'm²', scale: 150, whole: true },
  { code: 'XAF', label: 'CFA franc (Central Africa)', labelFr: 'Franc CFA (CEMAC)', locale: 'en-US', symbol: 'FCFA', symbolFr: 'FCFA', area: 'm²', scale: 150, whole: true },
  { code: 'MAD', label: 'Moroccan dirham (DH)', labelFr: 'Dirham marocain (DH)', locale: 'en-US', symbol: 'DH', symbolFr: 'DH', area: 'm²', scale: 5 },
  { code: 'TND', label: 'Tunisian dinar (DT)', labelFr: 'Dinar tunisien (DT)', locale: 'en-US', symbol: 'DT', symbolFr: 'DT', area: 'm²', scale: 0.75 },
  { code: 'DZD', label: 'Algerian dinar (DA)', labelFr: 'Dinar algérien (DA)', locale: 'en-US', symbol: 'DA', symbolFr: 'DA', area: 'm²', scale: 30, whole: true },
  { code: 'CHF', label: 'Swiss franc (CHF)', labelFr: 'Franc suisse (CHF)', locale: 'en-US', symbol: 'CHF', symbolFr: 'CHF', area: 'm²', scale: 2.5 },
  { code: 'CNY', label: 'Chinese yuan (¥)', labelFr: 'Yuan chinois (¥)', labelZh: '人民币 (¥)', locale: 'en-US', symbol: '¥', symbolFr: '¥', symbolZh: '¥', area: 'm²', scale: 3 },
  { code: 'HKD', label: 'Hong Kong dollar (HK$)', labelFr: 'Dollar de Hong Kong (HK$)', labelZh: '港币 (HK$)', locale: 'en-HK', symbol: 'HK$', symbolFr: 'HK$', symbolZh: 'HK$', area: 'sq ft', scale: 7 },
  { code: 'TWD', label: 'New Taiwan dollar (NT$)', labelFr: 'Nouveau dollar de Taïwan (NT$)', labelZh: '新台币 (NT$)', locale: 'en-US', symbol: 'NT$', symbolFr: 'NT$', symbolZh: 'NT$', area: 'm²', scale: 20 },
];

/** The currencies offered on the pages of each language, the default first. */
export const CURRENCIES_BY_LOCALE: Record<Locale, ReadonlyArray<CurrencyCode>> = {
  en: ['USD', 'GBP', 'EUR', 'CAD', 'AUD', 'INR', 'NGN', 'KES', 'GHS', 'ZAR', 'SGD', 'MYR', 'PHP', 'XAF', 'XOF'],
  fr: ['EUR', 'XOF', 'XAF', 'MAD', 'TND', 'DZD', 'CHF', 'CAD'],
  zh: ['CNY', 'SGD', 'MYR', 'HKD', 'TWD', 'USD', 'CAD', 'AUD', 'GBP', 'EUR'],
};

export const currencyOf = (code: CurrencyCode): Currency => CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];

const EURO_REGIONS = ['AT', 'BE', 'CY', 'DE', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PT', 'SI', 'SK',
  'RE', 'GP', 'MQ', 'GF', 'YT', 'PM', 'BL', 'MF'];

/** Country (ISO 3166) → currency. */
function currencyOfRegion(region: string): CurrencyCode | undefined {
  const r = region.toUpperCase();
  if (r === 'GB' || r === 'UK') return 'GBP';
  if (EURO_REGIONS.includes(r)) return 'EUR';
  const map: Record<string, CurrencyCode> = {
    US: 'USD', CA: 'CAD', AU: 'AUD', IN: 'INR', NG: 'NGN', KE: 'KES', GH: 'GHS', ZA: 'ZAR', SG: 'SGD', MY: 'MYR', PH: 'PHP',
    SN: 'XOF', CI: 'XOF', ML: 'XOF', BF: 'XOF', NE: 'XOF', TG: 'XOF', BJ: 'XOF', GW: 'XOF',
    CM: 'XAF', GA: 'XAF', CG: 'XAF', CF: 'XAF', TD: 'XAF', GQ: 'XAF',
    MA: 'MAD', TN: 'TND', DZ: 'DZD', CH: 'CHF', LI: 'CHF', CN: 'CNY', HK: 'HKD', TW: 'TWD',
  };
  return map[r];
}

/** Time zone → country, for the places our currencies are used (a better hint than the browser's language). */
const ZONE_REGIONS: Record<string, string> = {
  'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN', 'Africa/Lagos': 'NG', 'Africa/Nairobi': 'KE', 'Africa/Accra': 'GH',
  'Africa/Johannesburg': 'ZA', 'Asia/Singapore': 'SG', 'Asia/Kuala_Lumpur': 'MY', 'Asia/Kuching': 'MY', 'Asia/Manila': 'PH',
  'Africa/Dakar': 'SN', 'Africa/Abidjan': 'CI', 'Africa/Bamako': 'ML', 'Africa/Ouagadougou': 'BF', 'Africa/Niamey': 'NE',
  'Africa/Lome': 'TG', 'Africa/Porto-Novo': 'BJ', 'Africa/Bissau': 'GW', 'Africa/Douala': 'CM', 'Africa/Libreville': 'GA',
  'Africa/Brazzaville': 'CG', 'Africa/Bangui': 'CF', 'Africa/Ndjamena': 'TD', 'Africa/Malabo': 'GQ',
  'Africa/Casablanca': 'MA', 'Africa/El_Aaiun': 'MA', 'Africa/Tunis': 'TN', 'Africa/Algiers': 'DZ', 'Europe/Zurich': 'CH',
  'Asia/Shanghai': 'CN', 'Asia/Urumqi': 'CN', 'Asia/Chongqing': 'CN', 'Asia/Harbin': 'CN', 'Asia/Hong_Kong': 'HK',
  'Asia/Taipei': 'TW', 'Europe/London': 'GB', 'Indian/Reunion': 'RE', 'America/Martinique': 'MQ', 'America/Guadeloupe': 'GP', 'America/Cayenne': 'GF',
};

function regionOfTimeZone(): string | undefined {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
    if (ZONE_REGIONS[zone]) return ZONE_REGIONS[zone];
    if (zone.startsWith('Australia/')) return 'AU';
    if (/^America\/(Toronto|Montreal|Vancouver|Edmonton|Winnipeg|Halifax|St_Johns|Regina|Moncton|Whitehorse|Yellowknife|Iqaluit)$/.test(zone)) return 'CA';
    if (/^America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Detroit|Indiana\/.+|Boise)$/.test(zone) || zone === 'Pacific/Honolulu') return 'US';
    if (zone.startsWith('Europe/')) return undefined;
  } catch {
    // No Intl time zone: the browser's language decides.
  }
  return undefined;
}

/**
 * The visitor's currency among those of the pages of a language: from the
 * time zone first, then the region of the browser's languages ("en-GB" → GBP),
 * else the language's default (dollar in English, euro in French).
 */
export function currencyFromBrowser(locale: Locale = 'en'): CurrencyCode {
  const offered = CURRENCIES_BY_LOCALE[locale];
  const fits = (c: CurrencyCode | undefined): c is CurrencyCode => !!c && offered.includes(c);
  const fromZone = regionOfTimeZone();
  if (fromZone && fits(currencyOfRegion(fromZone))) return currencyOfRegion(fromZone) as CurrencyCode;
  if (typeof navigator !== 'undefined') {
    for (const tag of navigator.languages ?? [navigator.language]) {
      const region = tag?.split('-')[1];
      const c = region ? currencyOfRegion(region) : undefined;
      if (fits(c)) return c;
    }
  }
  return offered[0];
}

/** Example amounts in a currency: unchanged at scale 1, else scaled and rounded to a round figure. */
function exampleIn(c: Currency): (n: number) => number {
  if (c.scale === 1) return (n) => n;
  return (n) => {
    const v = n * c.scale;
    const step = v >= 100000 ? 1000 : v >= 1000 ? 100 : v >= 100 ? 10 : 1;
    return Math.round(v / step) * step;
  };
}

export function formatFr(code: CurrencyCode): ToolFormat {
  const c = currencyOf(code);
  return {
    money: (n) => money(n, c.symbolFr, true),
    moneyExact: (n) => money(n, c.symbolFr, !!c.whole),
    pct: (r) => `${Math.round(r * 100)}\u00a0%`,
    parse: parseAmount,
    symbol: c.symbolFr,
    example: exampleIn(c),
  };
}

export const FORMAT_FR: ToolFormat = formatFr('EUR');

/** "1,234,567 FCFA": CFA francs keep their usual symbol after the amount, in English too. */
const cfa = (n: number) => `${moneyIntl(n, 'en-US', 'USD', true).replace('$', '')} FCFA`;

export function formatEn(code: CurrencyCode): ToolFormat {
  const c = currencyOf(code);
  const whole = (n: number) => (c.code === 'XOF' || c.code === 'XAF' ? cfa(n) : moneyIntl(n, c.locale, c.code, true));
  return {
    money: whole,
    moneyExact: (n) => (c.whole ? whole(n) : moneyIntl(n, c.locale, c.code)),
    pct: (r) => `${Math.round(r * 100)}%`,
    parse: parseAmountEn,
    symbol: c.symbol,
    example: exampleIn(c),
  };
}

export function formatZh(code: CurrencyCode): ToolFormat {
  const c = currencyOf(code);
  const symbol = c.symbolZh ?? c.symbol;
  return {
    money: (n) => moneyBefore(n, symbol, true),
    moneyExact: (n) => moneyBefore(n, symbol, !!c.whole),
    pct: (r) => `${Math.round(r * 100)}%`,
    parse: parseAmountEn,
    symbol,
    example: exampleIn(c),
  };
}

/** The format of a currency on the pages of a language. */
export const formatOf = (code: CurrencyCode, locale: Locale): ToolFormat =>
  locale === 'en' ? formatEn(code) : locale === 'zh' ? formatZh(code) : formatFr(code);
