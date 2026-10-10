// src/lib/tools/mariage.ts
// ============================================================================
// « Budget mariage » (/budget-mariage): the total of a wedding from the
// couple's own quotes, split between what is paid per guest (caterer, drinks)
// and what is fixed (venue, outfits, photographer…), the cost per guest, what
// 20 fewer guests would save, and the amount to put aside each month until
// the wedding. There is no official average for a wedding: the only built-in
// amounts are the clearly fictitious EXAMPLE used by the « Remplir avec un
// exemple » button and the worked example of the article.
// Pure functions: the page and the tests share them.
// ============================================================================

export type PosteKey =
  | 'lieu' | 'traiteur' | 'boissons' | 'tenues' | 'photo' | 'musique'
  | 'deco' | 'alliances' | 'papeterie' | 'voyage' | 'autres';

export interface PosteField {
  key: PosteKey;
  label: string;
  hint?: string;
  /** Amount typed per guest, multiplied by the number of guests. */
  perGuest?: boolean;
  /** Always shown; the others sit behind « Autres postes ». */
  main?: boolean;
}

export const POSTE_FIELDS: PosteField[] = [
  { key: 'lieu', label: 'Lieu de réception', hint: 'Location de la salle ou du domaine, mobilier compris s’il est facturé à part', main: true },
  { key: 'traiteur', label: 'Traiteur', hint: 'Repas et service, prix par invité', perGuest: true, main: true },
  { key: 'boissons', label: 'Boissons', hint: 'Vin d’honneur, vins, softs, prix par invité', perGuest: true, main: true },
  { key: 'tenues', label: 'Tenues et beauté', hint: 'Robe, costume, accessoires, coiffure, maquillage', main: true },
  { key: 'photo', label: 'Photo et vidéo', main: true },
  { key: 'musique', label: 'Musique / DJ', hint: 'DJ, groupe, sonorisation', main: true },
  { key: 'deco', label: 'Décoration et fleurs', hint: 'Bouquet, centres de table, location de décor', main: true },
  { key: 'alliances', label: 'Alliances' },
  { key: 'papeterie', label: 'Faire-part et papeterie', hint: 'Save the date, faire-part, menus, plan de table' },
  { key: 'voyage', label: 'Voyage de noces', hint: 'Facultatif' },
  { key: 'autres', label: 'Imprévus et divers', hint: 'Une marge pour ce qu’on oublie : retouches, transports, achats de dernière minute', main: true },
];

export type Amounts = Partial<Record<PosteKey, number>>;

export const MIN_GUESTS = 2;
export const MAX_GUESTS = 300;
export const DEFAULT_GUESTS = 100;
/** « Et avec 20 invités de moins ? » */
export const FEWER_GUESTS = 20;

/**
 * Fictitious example: round amounts chosen to show the calculation, NOT averages
 * or market prices. Shown everywhere as « exemple fictif, à remplacer par vos devis ».
 * Traiteur and boissons are per guest. If it changes, update the tests and the page.
 */
export const EXAMPLE = {
  guests: 100,
  saved: 4000,
  /** The example wedding takes place this many months after the current month. */
  monthsAhead: 18,
  amounts: {
    lieu: 4000,
    traiteur: 80,
    boissons: 20,
    tenues: 2000,
    photo: 1500,
    musique: 1000,
    deco: 1000,
    alliances: 1000,
    papeterie: 300,
    autres: 1200,
  } as Amounts,
};

const cents = (n: number) => Math.round(n * 100) / 100;
const positive = (n: number | undefined) => (Number.isFinite(n) && (n as number) > 0 ? (n as number) : 0);

export function clampGuests(n: number): number {
  if (!Number.isFinite(n)) return MIN_GUESTS;
  return Math.min(MAX_GUESTS, Math.max(MIN_GUESTS, Math.floor(n)));
}

export interface PosteLine {
  key: PosteKey;
  label: string;
  /** Total for the wedding (per-guest rate × guests for traiteur and boissons). */
  amount: number;
  perGuest: boolean;
  /** Per-guest rate as typed (perGuest lines only). */
  rate?: number;
  /** amount / total, 0–1. */
  share: number;
}

export interface MariageResult {
  guests: number;
  total: number;
  /** Traiteur + boissons for all guests: the part that moves with the guest list. */
  perGuestTotal: number;
  fixedTotal: number;
  /** Traiteur + boissons rates: what one guest more or less changes. */
  ratePerGuest: number;
  voyage: number;
  /** (total − voyage de noces) / guests: the honeymoon has nothing to do with the guest list. */
  costPerGuest: number;
  /** perGuestTotal / total (null when the total is 0). */
  perGuestShare: number | null;
  /** Non-zero postes, largest first (ties keep the form order). */
  lines: PosteLine[];
}

export function computeMariage(guestsInput: number, amounts: Amounts): MariageResult {
  const guests = clampGuests(guestsInput);
  const raw = POSTE_FIELDS.map((f) => {
    const value = positive(amounts[f.key]);
    return { f, value, amount: cents(f.perGuest ? value * guests : value) };
  });
  const total = cents(raw.reduce((s, r) => s + r.amount, 0));
  const perGuestTotal = cents(raw.filter((r) => r.f.perGuest).reduce((s, r) => s + r.amount, 0));
  const ratePerGuest = cents(raw.filter((r) => r.f.perGuest).reduce((s, r) => s + r.value, 0));
  const voyage = raw.find((r) => r.f.key === 'voyage')?.amount ?? 0;
  const lines: PosteLine[] = raw
    .filter((r) => r.amount > 0)
    .map((r) => ({
      key: r.f.key,
      label: r.f.label,
      amount: r.amount,
      perGuest: !!r.f.perGuest,
      ...(r.f.perGuest ? { rate: r.value } : {}),
      share: total > 0 ? r.amount / total : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
  return {
    guests,
    total,
    perGuestTotal,
    fixedTotal: cents(total - perGuestTotal),
    ratePerGuest,
    voyage,
    costPerGuest: cents((total - voyage) / guests),
    perGuestShare: total > 0 ? perGuestTotal / total : null,
    lines,
  };
}

export interface FewerGuests {
  /** Guests removed (FEWER_GUESTS, or fewer so as to keep MIN_GUESTS). */
  fewer: number;
  guests: number;
  /** Saving on the per-guest postes only: a minimum, other postes may also drop. */
  saving: number;
  total: number;
}

export function withFewerGuests(r: MariageResult, fewer = FEWER_GUESTS): FewerGuests {
  const n = Math.max(0, Math.min(Math.floor(fewer), r.guests - MIN_GUESTS));
  const saving = cents(n * r.ratePerGuest);
  return { fewer: n, guests: r.guests - n, saving, total: cents(r.total - saving) };
}

// ---------------------------------------------------------------------------
// Months and monthly saving
// ---------------------------------------------------------------------------

export interface YearMonth {
  year: number;
  /** 1–12 */
  month: number;
}

/** Accepts "2027-06" (what <input type="month"> gives) and, for browsers that show a text box, "06/2027" or "6-2027". */
export function parseMonth(input: string | undefined | null): YearMonth | null {
  const s = (input ?? '').trim();
  let m = /^(\d{4})-(\d{1,2})$/.exec(s);
  let year: number;
  let month: number;
  if (m) {
    year = Number(m[1]);
    month = Number(m[2]);
  } else {
    m = /^(\d{1,2})\s*[/.-]\s*(\d{4})$/.exec(s);
    if (!m) return null;
    month = Number(m[1]);
    year = Number(m[2]);
  }
  if (month < 1 || month > 12 || year < 1900 || year > 2999) return null;
  return { year, month };
}

export const toYearMonth = (d: Date): YearMonth => ({ year: d.getFullYear(), month: d.getMonth() + 1 });

/** "2027-06": the value format of <input type="month">. */
export const formatMonthValue = (ym: YearMonth): string => `${ym.year}-${String(ym.month).padStart(2, '0')}`;

export function addMonths(ym: YearMonth, n: number): YearMonth {
  const index = ym.year * 12 + (ym.month - 1) + n;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

/** "juin 2027" */
export function monthLabel(ym: YearMonth): string {
  return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(ym.year, ym.month - 1, 1));
}

/**
 * Number of monthly deposits from the current month (included) to the wedding
 * month (excluded): the money is ready the month before the wedding. Wedding in
 * June 2027 seen in October 2026 → October 2026 … May 2027 = 8 deposits.
 * 0 when the wedding is this month, negative when it is past.
 */
export function monthsBefore(wedding: YearMonth, today: YearMonth): number {
  return (wedding.year - today.year) * 12 + (wedding.month - today.month);
}

export type SavingStatus = 'no-date' | 'past' | 'this-month' | 'covered' | 'ok';

export interface SavingPlan {
  status: SavingStatus;
  /** max(0, total − already saved). */
  remaining: number;
  /** Number of monthly deposits (0 unless status is 'ok' or 'covered'). */
  months: number;
  /** Rounded up to the euro; 0 when covered, null when it cannot be computed. */
  monthly: number | null;
  /** First and last deposit months ('ok' only). */
  from?: YearMonth;
  to?: YearMonth;
}

/**
 * Monthly saving = max(0, total − already saved) ÷ months before the wedding
 * (see monthsBefore), rounded up to the euro: better a few euros ahead than behind.
 */
export function savingPlan(total: number, saved: number, weddingMonth: string, today: Date): SavingPlan {
  const remaining = cents(Math.max(0, positive(total) - positive(saved)));
  const wedding = parseMonth(weddingMonth);
  if (!wedding) return { status: 'no-date', remaining, months: 0, monthly: null };
  const now = toYearMonth(today);
  const months = monthsBefore(wedding, now);
  if (months < 0) return { status: 'past', remaining, months: 0, monthly: null };
  if (months === 0) return { status: 'this-month', remaining, months: 0, monthly: null };
  if (remaining === 0) return { status: 'covered', remaining, months, monthly: 0 };
  return {
    status: 'ok',
    remaining,
    months,
    monthly: Math.ceil(cents(remaining / months)),
    from: now,
    to: addMonths(wedding, -1),
  };
}

/** The worked example of the article: same amounts as the button, wedding EXAMPLE.monthsAhead months away. */
export function exampleResult() {
  const r = computeMariage(EXAMPLE.guests, EXAMPLE.amounts);
  const months = EXAMPLE.monthsAhead;
  const remaining = cents(Math.max(0, r.total - EXAMPLE.saved));
  return { ...r, fewerGuests: withFewerGuests(r), saved: EXAMPLE.saved, months, remaining, monthly: Math.ceil(cents(remaining / months)) };
}
