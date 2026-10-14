// src/lib/budget/format.ts
// Money formatting shared by the budget screens.

import { screenLocale } from '@/i18n/current';
import type { Locale } from '@/i18n/locales';

export function currencySymbol(code?: string): string {
  switch ((code || 'EUR').toUpperCase()) {
    case 'USD':
    case 'CAD':
    case 'AUD':
      return '$';
    case 'GBP':
      return '£';
    case 'CHF':
      return 'CHF';
    case 'XOF':
    case 'XAF':
      return 'CFA';
    case 'MAD':
      return 'DH';
    default:
      return '€';
  }
}

const NBSP = ' ';
const MINUS = '−';

// Amounts are written in the language of the screen (src/i18n/current.ts):
// French by default, English on English screens.
const numberLocale = (): Locale => screenLocale();

/** Locale for Intl dates and numbers: fr-FR, or the browser's English (en-GB, en-US…) on English screens. */
export function intlLocale(): string {
  if (numberLocale() === 'fr') return 'fr-FR';
  const browser = typeof navigator !== 'undefined' ? navigator.language : '';
  return /^en(-|$)/i.test(browser) ? browser : 'en-US';
}

const formatters = new Map<string, Intl.NumberFormat>();
function nf(decimals: number): Intl.NumberFormat {
  const key = `${numberLocale()}${decimals}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat(numberLocale() === 'en' ? 'en-US' : 'fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    formatters.set(key, f);
  }
  return f;
}

/** Rounds to cents to avoid floating noise (0.1 + 0.2). */
export const roundCents = (n: number): number => Math.round((Number(n) || 0) * 100) / 100;

function decimalsFor(n: number, whole: boolean): number {
  if (whole) return 0;
  return Math.abs(roundCents(n) % 1) > 0.004 ? 2 : 0;
}

/** "−1 180 €" in French; "−$1,180" in English (a symbol of several letters stays after: "1,180 CHF"). */
function withSymbol(sign: string, abs: string, symbol: string): string {
  if (numberLocale() === 'en' && [...symbol].length === 1) return `${sign}${symbol}${abs}`;
  return `${sign}${abs}${NBSP}${symbol}`;
}

/** "1 180 €" (cents shown only when present, unless `whole`). */
export function money(n: number, symbol = '€', whole = false): string {
  const v = roundCents(n);
  const shown = Math.abs(v) < 0.005 ? 0 : v;
  return withSymbol(shown < 0 ? MINUS : '', nf(decimalsFor(v, whole)).format(Math.abs(shown)), symbol);
}

/** "+30 €" / "−240 €" / "0 €" */
export function moneySigned(n: number, symbol = '€', whole = false): string {
  const v = roundCents(n);
  if (Math.abs(v) < 0.005) return withSymbol('', '0', symbol);
  return withSymbol(v > 0 ? '+' : MINUS, nf(decimalsFor(v, whole)).format(Math.abs(v)), symbol);
}

/** Outflow display: "−2 446 €" for a positive amount. */
export function moneyOut(n: number, symbol = '€', whole = false): string {
  const v = roundCents(n);
  if (Math.abs(v) < 0.005) return withSymbol('', '0', symbol);
  return withSymbol(v > 0 ? MINUS : '+', nf(decimalsFor(v, whole)).format(Math.abs(v)), symbol);
}

export function percent(n: number): string {
  return numberLocale() === 'en' ? `${Math.round(n)}%` : `${Math.round(n)}${NBSP}%`;
}

/**
 * Parses user input: "1 250,50" or "1250.5" in French; on English screens
 * "1,250.50" too (a comma followed by groups of three digits separates
 * thousands, any other comma is a decimal point). NaN when invalid.
 */
export function parseAmount(input: string | number): number {
  if (typeof input === 'number') return input;
  let cleaned = String(input).replace(/[\s€$£]/g, '');
  if (numberLocale() === 'en' && /^[-+]?\d{1,3}(,\d{3})+(\.\d+)?$/.test(cleaned)) cleaned = cleaned.replace(/,/g, '');
  cleaned = cleaned.replace(',', '.');
  if (cleaned === '') return NaN;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

// ============================================================================
// Other languages than French: the currency symbol and separators follow the
// locale ("$1,180", "£1,180.50", "−€240").
// ============================================================================

const intlFormatters = new Map<string, Intl.NumberFormat>();

/** "$1,180" (cents shown only when present, unless `whole`). */
export function moneyIntl(n: number, locale: string, currency: string, whole = false): string {
  const v = roundCents(n);
  const decimals = decimalsFor(v, whole);
  const key = `${locale}|${currency}|${decimals}`;
  let f = intlFormatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, {
      style: 'currency', currency, currencyDisplay: 'narrowSymbol', minimumFractionDigits: decimals, maximumFractionDigits: decimals,
    });
    intlFormatters.set(key, f);
  }
  return f.format(Math.abs(v) < 0.005 ? 0 : v).replace('-', MINUS);
}

/** Parses English input, where the comma separates thousands: "1,250.50". Returns NaN when invalid. */
export function parseAmountEn(input: string | number): number {
  if (typeof input === 'number') return input;
  const cleaned = String(input).replace(/[\s,$£€]/g, '');
  if (cleaned === '') return NaN;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}
