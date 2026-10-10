// src/lib/tools/colocation.ts
// ============================================================================
// Rent and shared bills split for a flat-share (/budget-colocation). Pure
// functions, no React: the page and the tests use the same code.
//
// Methods for the rent (bills are always split equally):
// - « egal »   : equal shares;
// - « chambre »: COMMON_SHARE of the rent (kitchen, living room…) in equal
//                shares, the rest in proportion to each bedroom's area;
// - « revenus »: in proportion to each roommate's net income.
// When the data a method needs is missing (no area, no income), the rent
// falls back to equal shares and `fallback` says so.
// ============================================================================

export type SplitMethod = 'egal' | 'chambre' | 'revenus';

/** Part of the rent paid in equal shares with the « chambre » method. */
export const COMMON_SHARE = 0.5;

export interface Roommate {
  name: string;
  /** Bedroom area in m² (« chambre » method). */
  room: number;
  /** Net monthly income (« revenus » method). */
  income: number;
}

export interface ColocInput {
  rent: number;
  bills: number[];
  method: SplitMethod;
  roommates: Roommate[];
}

export interface ColocShare {
  name: string;
  rent: number;
  bills: number;
  total: number;
  /** Share of the coloc's total, 0..1. */
  ratio: number;
}

export interface ColocResult {
  rent: number;
  bills: number;
  total: number;
  shares: ColocShare[];
  /** Method actually applied to the rent. */
  applied: SplitMethod;
  /** Set when the chosen method lacked data and equal shares were used. */
  fallback: string | null;
}

const pos = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

export function rentWeights(method: SplitMethod, roommates: Roommate[]): { weights: number[]; applied: SplitMethod; fallback: string | null } {
  const n = roommates.length;
  const equal = Array.from({ length: n }, () => 1 / n);
  if (method === 'chambre') {
    const rooms = roommates.map((r) => pos(r.room));
    const sum = rooms.reduce((a, b) => a + b, 0);
    if (rooms.some((r) => r === 0) || sum === 0) {
      return { weights: equal, applied: 'egal', fallback: 'Indiquez la surface de chaque chambre : en attendant, le loyer est partagé à parts égales.' };
    }
    return { weights: rooms.map((r) => COMMON_SHARE / n + (1 - COMMON_SHARE) * (r / sum)), applied: 'chambre', fallback: null };
  }
  if (method === 'revenus') {
    const incomes = roommates.map((r) => pos(r.income));
    const sum = incomes.reduce((a, b) => a + b, 0);
    if (incomes.some((i) => i === 0) || sum === 0) {
      return { weights: equal, applied: 'egal', fallback: 'Indiquez le revenu de chaque colocataire : en attendant, le loyer est partagé à parts égales.' };
    }
    return { weights: incomes.map((i) => i / sum), applied: 'revenus', fallback: null };
  }
  return { weights: equal, applied: 'egal', fallback: null };
}

export function computeColocation({ rent, bills, method, roommates }: ColocInput): ColocResult {
  const n = Math.max(1, roommates.length);
  const r = pos(rent);
  const b = bills.reduce((s, x) => s + pos(x), 0);
  const { weights, applied, fallback } = rentWeights(method, roommates.length ? roommates : [{ name: '', room: 0, income: 0 }]);
  const total = r + b;
  const shares = weights.map((w, i) => {
    const rentShare = r * w;
    const billShare = b / n;
    const t = rentShare + billShare;
    return { name: roommates[i]?.name ?? '', rent: rentShare, bills: billShare, total: t, ratio: total > 0 ? t / total : 0 };
  });
  return { rent: r, bills: b, total, shares, applied, fallback };
}

/** The worked example published on the page (3 roommates). */
export const COLOC_EXAMPLE: ColocInput = {
  rent: 1350,
  bills: [90, 30, 18, 60],
  method: 'chambre',
  roommates: [
    { name: 'Coloc 1', room: 9, income: 1400 },
    { name: 'Coloc 2', room: 12, income: 1800 },
    { name: 'Coloc 3', room: 15, income: 2300 },
  ],
};
