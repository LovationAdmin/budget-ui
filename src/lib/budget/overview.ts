// src/lib/budget/overview.ts
// ============================================================================
// « Ma vue perso » — one member's money across every budget they belong to.
// ============================================================================
// Each budget only knows its own pot: the member's pay as declared there, what
// they put into the pot, and their personal charges. This module reads the
// same month in every budget (through each BudgetEngine, so closed months show
// their frozen values) and adds it up for the member:
//   - their pay is counted ONCE: budgets that declare it all describe the same
//     pay. When they disagree, the member chooses: the highest, or the sum
//     (several incomes, one per budget);
//   - what they put into each pot and their personal charges add up;
//   - what is left = pay − contributions − personal charges.
// Which person the member is in each budget is never a choice: it is the
// person who bears their account's name (identify()), so the overview of a
// person is theirs alone.
// ============================================================================

import type { BudgetEngine, ResolvedPersonalCharge } from './engine';
import type { Person, PrivateChargeDetails, YM } from './types';
import { PRIVATE_CHARGE_LABEL } from './types';
import { roundCents } from './format';

// ---------------------------------------------------------------------------
// When the page is worth showing
// ---------------------------------------------------------------------------

/**
 * The overview adds nothing for someone alone in their only budget (the
 * budget already is their whole picture): it is offered from two budgets on,
 * or as soon as a budget is shared.
 */
export function overviewUseful(budgets: Array<{ members?: unknown[] | null }>): boolean {
  return budgets.length >= 2 || budgets.some((b) => (b.members?.length ?? 0) >= 2);
}

// ---------------------------------------------------------------------------
// Who the viewer is in a budget
// ---------------------------------------------------------------------------
// Never a choice: the person of the household whose name is the account's
// name (accents and case aside), so nobody can see the view of a person who is
// someone else. A name another member's account fits as well (two « Léa ») is
// no one's until the household tells them apart (« Léa M. », « Léa D. »).

/** A budget member as the API lists it. */
export interface BudgetMemberName {
  user_id?: string;
  user?: { id?: string; name?: string } | null;
}

const memberUserId = (m: BudgetMemberName): string | undefined => m.user_id ?? m.user?.id ?? undefined;

const fold = (s: string): string =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
// « Marie-Anne » is a first name of its own: only spaces, dots and underscores separate.
const words = (s: string): string[] => fold(s).split(/[\s._]+/).filter(Boolean);

/**
 * How well a person's name fits an account's name: 3 the same full name; 2
 * the first name and the initial of the last name (« Léa D. » for Léa
 * Dupont); 1 the first name alone (« Léa »); 0 someone else (« Léa M. »).
 */
export function nameScore(personName: string, accountName: string): number {
  const p = words(personName);
  const a = words(accountName);
  if (!p.length || !a.length) return 0;
  if (p.join(' ') === a.join(' ')) return 3;
  if (p[0] !== a[0]) return 0;
  if (p.length === 1 || a.length === 1) return 1;
  return a.slice(1).some((w) => w[0] === p[1][0]) ? 2 : 0;
}

export type Identity =
  | { personId: string }
  /** `none`: no person has their name; `ambiguous`: several could be them, or someone else fits as well. */
  | { personId: null; reason: 'none' | 'ambiguous'; names: string[] };

/**
 * The viewer's person in a budget: the one whose name fits their account's
 * best, provided no other member's account fits it as well. In a budget they
 * do not share, a household of one is theirs whatever its name.
 */
export function identify(people: Array<Pick<Person, 'id' | 'name'>>, members: BudgetMemberName[], userId: string | undefined, userName: string | undefined): Identity {
  const name = userName ?? members.find((m) => memberUserId(m) === userId)?.user?.name ?? '';
  const others = members.filter((m) => memberUserId(m) !== userId).map((m) => m.user?.name ?? '');
  if (people.length === 1 && others.length === 0) return { personId: people[0].id };
  const fits = people.map((p) => ({ p, score: nameScore(p.name, name) })).filter((f) => f.score > 0);
  if (fits.length === 0) return { personId: null, reason: 'none', names: [] };
  const best = Math.max(...fits.map((f) => f.score));
  const top = fits.filter((f) => f.score === best).map((f) => f.p);
  if (top.length > 1 || others.some((n) => nameScore(top[0].name, n) >= best)) {
    return { personId: null, reason: 'ambiguous', names: top.map((p) => p.name) };
  }
  return { personId: top[0].id };
}

// ---------------------------------------------------------------------------
// One budget, one month
// ---------------------------------------------------------------------------

export interface MyBudgetMonth {
  /** The viewer is part of this budget's household this month. */
  present: boolean;
  closed: boolean;
  /** Pay as this budget declares it. */
  salary: number;
  /** What they put into this budget's pot. */
  contribution: number;
  /** Pocket money as this budget sees it (pay − contribution). */
  keep: number;
  /** Their personal charges in this budget (out of `keep`). */
  personal: ResolvedPersonalCharge[];
  personalTotal: number;
}

export function myMonth(engine: BudgetEngine, personId: string, ym: YM): MyBudgetMonth {
  const m = engine.month(ym);
  const p = m.people.find((x) => x.id === personId);
  if (!p) return { present: false, closed: m.closed, salary: 0, contribution: 0, keep: 0, personal: [], personalTotal: 0 };
  return {
    present: true,
    closed: m.closed,
    salary: p.salary,
    contribution: p.contribution,
    keep: p.keep,
    personal: m.personal.filter((c) => c.ownerId === personId),
    personalTotal: p.personalCharges,
  };
}

// ---------------------------------------------------------------------------
// All budgets (of one currency)
// ---------------------------------------------------------------------------

/** How to count pay that differs between budgets. */
export type IncomeMode = 'highest' | 'sum';

export interface OverviewTotals {
  income: number;
  contributions: number;
  personal: number;
  /** What is left: income − contributions − personal charges. */
  left: number;
  /** Budgets declare different (non-zero) pay: the income depends on `IncomeMode`. */
  incomesDiffer: boolean;
}

export function overviewTotals(months: Array<Pick<MyBudgetMonth, 'present' | 'salary' | 'contribution' | 'personalTotal'>>, mode: IncomeMode): OverviewTotals {
  const present = months.filter((m) => m.present);
  const pay = present.map((m) => roundCents(m.salary)).filter((s) => s > 0);
  const incomesDiffer = new Set(pay).size > 1;
  // The same pay declared in two budgets is one pay, whatever the mode.
  const income = roundCents(incomesDiffer && mode === 'sum' ? pay.reduce((a, b) => a + b, 0) : Math.max(0, ...pay));
  const contributions = roundCents(present.reduce((s, m) => s + m.contribution, 0));
  const personal = roundCents(present.reduce((s, m) => s + m.personalTotal, 0));
  return { income, contributions, personal, left: roundCents(income - contributions - personal), incomesDiffer };
}

/** Private charge details from a budget's private items (`charge:<id>` keys). */
export function parsePrivateCharges(items: Record<string, unknown>): Record<string, PrivateChargeDetails> {
  const found: Record<string, PrivateChargeDetails> = {};
  for (const [key, value] of Object.entries(items)) {
    const v = value as Partial<PrivateChargeDetails> | null;
    if (key.startsWith('charge:') && v && typeof v.label === 'string') found[key.slice(7)] = v as PrivateChargeDetails;
  }
  return found;
}

/**
 * Name and category of a personal charge as the viewer may see them: a
 * private charge shows its real name to its creator only (kept server-side).
 */
export function visibleCharge(
  c: Pick<ResolvedPersonalCharge, 'id' | 'label' | 'category' | 'private' | 'createdBy'>,
  userId: string | undefined,
  privateCharges: Record<string, PrivateChargeDetails>,
): { label: string; category?: string } {
  if (!c.private) return { label: c.label, category: c.category };
  if (userId && c.createdBy === userId) {
    const d = privateCharges[c.id];
    return { label: d?.label ?? c.label, category: d?.category ?? c.category };
  }
  return { label: PRIVATE_CHARGE_LABEL };
}
