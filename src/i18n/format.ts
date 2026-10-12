// src/i18n/format.ts
// ============================================================================
// How the free calculators write and read amounts in each language. French:
// euros, "1 180 €", "1 250,50" typed with a comma. English: the visitor's
// currency (CURRENCIES, from the browser's region, changeable), "$1,180",
// "1,250.50" typed with the comma between thousands.
// ============================================================================

import { money, moneyIntl, parseAmount, parseAmountEn } from '@/lib/budget/format';

export interface ToolFormat {
  /** Whole amount: "1 180 €", "$1,180". */
  money: (n: number) => string;
  /** Cents when present: "16,67 €", "$16.67". */
  moneyExact: (n: number) => string;
  pct: (share: number) => string;
  parse: (raw: string) => number;
  /** Currency symbol, shown after amount fields ("€/mois", "$/month"). */
  symbol: string;
}

export const FORMAT_FR: ToolFormat = {
  money: (n) => money(n, '€', true),
  moneyExact: (n) => money(n),
  pct: (r) => `${Math.round(r * 100)} %`,
  parse: parseAmount,
  symbol: '€',
};

export type CurrencyCode = 'USD' | 'GBP' | 'EUR' | 'CAD' | 'AUD';

export interface Currency {
  code: CurrencyCode;
  label: string;
  /** Number format of the country (separators, symbol position). */
  locale: string;
  symbol: string;
  /** Usual unit for the size of a room where the currency is used. */
  area: 'sq ft' | 'm²';
}

export const CURRENCIES: ReadonlyArray<Currency> = [
  { code: 'USD', label: 'US dollar ($)', locale: 'en-US', symbol: '$', area: 'sq ft' },
  { code: 'GBP', label: 'Pound sterling (£)', locale: 'en-GB', symbol: '£', area: 'sq ft' },
  { code: 'EUR', label: 'Euro (€)', locale: 'en-IE', symbol: '€', area: 'm²' },
  { code: 'CAD', label: 'Canadian dollar ($)', locale: 'en-CA', symbol: '$', area: 'sq ft' },
  { code: 'AUD', label: 'Australian dollar ($)', locale: 'en-AU', symbol: '$', area: 'm²' },
];

export const currencyOf = (code: CurrencyCode): Currency => CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];

const EURO_REGIONS = ['AT', 'BE', 'CY', 'DE', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PT', 'SI', 'SK'];

/** The currency of the browser's region ("en-GB" → GBP), US dollar otherwise. */
export function currencyFromBrowser(): CurrencyCode {
  if (typeof navigator === 'undefined') return 'USD';
  for (const tag of navigator.languages ?? [navigator.language]) {
    const region = tag?.split('-')[1]?.toUpperCase();
    if (!region) continue;
    if (region === 'GB' || region === 'UK') return 'GBP';
    if (region === 'CA') return 'CAD';
    if (region === 'AU') return 'AUD';
    if (EURO_REGIONS.includes(region)) return 'EUR';
    if (region === 'US') return 'USD';
  }
  return 'USD';
}

export function formatEn(code: CurrencyCode): ToolFormat {
  const c = currencyOf(code);
  return {
    money: (n) => moneyIntl(n, c.locale, c.code, true),
    moneyExact: (n) => moneyIntl(n, c.locale, c.code),
    pct: (r) => `${Math.round(r * 100)}%`,
    parse: parseAmountEn,
    symbol: c.symbol,
  };
}
