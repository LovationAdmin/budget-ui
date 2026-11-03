// src/lib/tools/couple.ts
// ============================================================================
// Couple budget split (/budget-couple): two net incomes and the shared
// charges of the month in, what each partner pays into the joint account and
// the spending money they keep out. Pure functions, no React: the page and
// the tests use the same code.
//
// Methods, the same three as the Foyer assistant of the app
// (src/lib/budget/engine.ts, splitContributions):
// - « egal »    : 50/50, half the shared charges each;
// - « prorata » : in proportion to each net income (the same effort);
// - « reste »   : so that both keep the same spending money. When one income
//                 is below that amount, that partner pays nothing and the
//                 other pays everything.
// « prorata » and « reste » need both incomes: until both are given, the
// split falls back to 50/50 and `fallback` says so.
// ============================================================================

export type CoupleMethod = 'egal' | 'prorata' | 'reste';

export const COUPLE_METHODS: ReadonlyArray<CoupleMethod> = ['egal', 'prorata', 'reste'];

export interface Partner {
  name: string;
  /** Net monthly income (after tax withheld at source). */
  income: number;
}

export interface CoupleInput {
  partners: [Partner, Partner];
  /** Shared charges of the month, savings put aside together included. */
  charges: number[];
  method: CoupleMethod;
}

export interface CoupleShare {
  name: string;
  income: number;
  /** Paid into the joint account each month. */
  contribution: number;
  /** Income − contribution: what this partner keeps. Negative when short. */
  keeps: number;
  /** Share of the shared charges, 0..1. */
  ratio: number;
  /** Contribution ÷ income, 0..1; null without income. */
  effort: number | null;
}

export interface CoupleResult {
  incomes: number;
  /** Shared charges of the month. */
  shared: number;
  shares: [CoupleShare, CoupleShare];
  /** Method actually applied. */
  applied: CoupleMethod;
  /** Set when the chosen method needed both incomes and equal shares were used. */
  fallback: 'incomes' | null;
  /** Shared charges above both incomes together: what is missing each month. */
  shortfall: number;
  /** Incomes − shared charges: what the couple keeps together. */
  left: number;
}

const pos = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

/** What each partner pays in, before rounding. */
export function contributions(method: CoupleMethod, incomes: [number, number], shared: number): { values: [number, number]; applied: CoupleMethod; fallback: 'incomes' | null } {
  const [a, b] = incomes.map(pos) as [number, number];
  const half: [number, number] = [shared / 2, shared / 2];
  if (method === 'egal') return { values: half, applied: 'egal', fallback: null };
  if (a === 0 || b === 0) return { values: half, applied: 'egal', fallback: 'incomes' };
  if (method === 'prorata') {
    const total = a + b;
    return { values: [(shared * a) / total, (shared * b) / total], applied: 'prorata', fallback: null };
  }
  // « reste »: both keep (a + b − shared) / 2. A partner whose income is below
  // that keeps all of it and the other pays the shared charges alone.
  const keep = (a + b - shared) / 2;
  if (a - keep < 0) return { values: [0, shared], applied: 'reste', fallback: null };
  if (b - keep < 0) return { values: [shared, 0], applied: 'reste', fallback: null };
  return { values: [a - keep, b - keep], applied: 'reste', fallback: null };
}

export function computeCouple({ partners, charges, method }: CoupleInput): CoupleResult {
  const incomes = partners.map((p) => pos(p.income)) as [number, number];
  const shared = charges.reduce((s, x) => s + pos(x), 0);
  const { values, applied, fallback } = contributions(method, incomes, shared);
  const shares = partners.map((p, i) => ({
    name: p.name,
    income: incomes[i],
    contribution: values[i],
    keeps: incomes[i] - values[i],
    ratio: shared > 0 ? values[i] / shared : 0,
    effort: incomes[i] > 0 ? values[i] / incomes[i] : null,
  })) as [CoupleShare, CoupleShare];
  const total = incomes[0] + incomes[1];
  return { incomes: total, shared, shares, applied, fallback, shortfall: Math.max(0, shared - total), left: total - shared };
}

/** The three methods side by side for the same couple. */
export function compareMethods(input: Omit<CoupleInput, 'method'>): Record<CoupleMethod, CoupleResult> {
  return Object.fromEntries(COUPLE_METHODS.map((m) => [m, computeCouple({ ...input, method: m })])) as Record<CoupleMethod, CoupleResult>;
}

/**
 * The worked example published on the page (fictitious): 2 700 € and
 * 1 800 € net, 2 000 € of shared charges, joint savings included. Charges in
 * the order of the calculator's fields (src/components/tools/CoupleCalculator).
 */
export const COUPLE_EXAMPLE: CoupleInput = {
  partners: [{ name: 'Camille', income: 2700 }, { name: 'Mehdi', income: 1800 }],
  // logement, énergie, courses, assurances, abonnements, enfants, épargne, autres
  charges: [1000, 120, 500, 80, 50, 0, 200, 50],
  method: 'prorata',
};
