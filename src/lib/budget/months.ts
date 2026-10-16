// src/lib/budget/months.ts
// Calendar-month helpers. Budgets work at month precision: a `YM` string
// (`YYYY-MM`) is the only unit the engine reasons about.

import { defineMessages, pick, screenLocale } from '@/i18n/current';
import type { YM } from './types';

/**
 * French month names as stored in budgets (keys of per-month maps, see
 * codec.ts): data, never translated. On screen, use the functions below,
 * which follow the screen's language.
 */
export const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const NAMES = defineMessages({
  fr: {
    long: MONTH_NAMES,
    short: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
    letter: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  },
  en: {
    long: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    letter: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  },
});

/** "Septembre", "September": month names in the screen's language, January first. */
export const monthNames = (): string[] => pick(NAMES).long;
/** "septembre" in French, "September" in English (English month names keep their capital). */
export const monthNamesLower = (): string[] => (screenLocale() === 'fr' ? NAMES.fr.long.map((m) => m.toLowerCase()) : NAMES.en.long);
/** "sept.", "Sep" */
export const monthNamesShort = (): string[] => pick(NAMES).short;
/** "S" */
export const monthLetters = (): string[] => pick(NAMES).letter;

const YM_RE = /^(\d{4})-(\d{2})$/;

export function isYM(s: unknown): s is YM {
  return typeof s === 'string' && YM_RE.test(s);
}

export function ymIndex(ym: YM): number {
  return Number(ym.slice(0, 4)) * 12 + Number(ym.slice(5, 7)) - 1;
}

export function ymFromIndex(i: number): YM {
  const y = Math.floor(i / 12);
  const m = i - y * 12 + 1;
  return `${y}-${m < 10 ? '0' : ''}${m}`;
}

export function makeYM(year: number, monthIndex0: number): YM {
  return ymFromIndex(year * 12 + monthIndex0);
}

export const addMonths = (ym: YM, n: number): YM => ymFromIndex(ymIndex(ym) + n);
export const compareYM = (a: YM, b: YM): number => ymIndex(a) - ymIndex(b);
export const monthOf = (ym: YM): number => Number(ym.slice(5, 7)); // 1..12
export const yearOf = (ym: YM): number => Number(ym.slice(0, 4));
export const monthIndex0 = (ym: YM): number => monthOf(ym) - 1;
export const monthsBetween = (a: YM, b: YM): number => ymIndex(b) - ymIndex(a) + 1;
export const minYM = (a: YM, b: YM): YM => (compareYM(a, b) <= 0 ? a : b);
export const maxYM = (a: YM, b: YM): YM => (compareYM(a, b) >= 0 ? a : b);

export function currentYM(now: Date = new Date()): YM {
  return makeYM(now.getFullYear(), now.getMonth());
}

/**
 * Month of a stored date. Date-only strings (`YYYY-MM-DD`) are calendar dates
 * and map directly; full ISO timestamps are read in local time, the way the
 * previous version of the app compared them.
 */
export function toYM(date: string | undefined | null): YM | undefined {
  if (!date || typeof date !== 'string') return undefined;
  const s = date.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s) || YM_RE.test(s)) return s.slice(0, 7);
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return undefined;
  return makeYM(d.getFullYear(), d.getMonth());
}

/** First day of a month as a stored start date (`YYYY-MM-01`). */
export function startDateOf(ym: YM): string {
  return `${ym}-01`;
}

/** Last day of a month as a stored end date (`YYYY-MM-DD`). */
export function endDateOf(ym: YM): string {
  const y = yearOf(ym);
  const m = monthOf(ym);
  const last = new Date(y, m, 0).getDate();
  return `${ym}-${last < 10 ? '0' : ''}${last}`;
}

/** "septembre 2026", "September 2026" */
export const formatMonthLong = (ym: YM): string => `${monthNamesLower()[monthIndex0(ym)]} ${yearOf(ym)}`;
/** "Septembre 2026", "September 2026" */
export const formatMonthTitle = (ym: YM): string => `${monthNames()[monthIndex0(ym)]} ${yearOf(ym)}`;
/** "sept. 2026", "Sep 2026" */
export const formatMonthShort = (ym: YM): string => `${monthNamesShort()[monthIndex0(ym)]} ${yearOf(ym)}`;
/** "septembre", "September" */
export const monthNameLower = (ym: YM): string => monthNamesLower()[monthIndex0(ym)];

/** French elision before a month label: "de septembre 2026" / "d’octobre 2026". French sentences only. */
export function deMonth(label: string): string {
  return /^[aeiouyàâäéèêëîïôöûüh]/i.test(label) ? `d’${label}` : `de ${label}`;
}

/** "a, b et c" / "a, b and c", in the screen's language. */
export function joinFr(parts: string[]): string {
  if (parts.length <= 1) return parts.join('');
  return `${parts.slice(0, -1).join(', ')} ${screenLocale() === 'fr' ? 'et' : 'and'} ${parts[parts.length - 1]}`;
}

/** Normalises month-name keys, including legacy mojibake variants. */
const MONTH_NAME_VARIANTS: Record<string, number> = (() => {
  const map: Record<string, number> = {};
  MONTH_NAMES.forEach((name, i) => {
    map[name] = i;
    map[name.toLowerCase()] = i;
    const ascii = name.normalize('NFD').replace(/[̀-ͯ]/g, '');
    map[ascii] = i;
    map[ascii.toLowerCase()] = i;
  });
  map['FÃ©vrier'] = 1;
  map['AoÃ»t'] = 7;
  map['DÃ©cembre'] = 11;
  return map;
})();

export function monthIndexFromName(name: string): number | undefined {
  const i = MONTH_NAME_VARIANTS[name];
  return typeof i === 'number' ? i : undefined;
}
