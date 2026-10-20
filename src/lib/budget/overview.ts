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
// Which person the member is in each budget is a link between their account
// and that person, kept by the API (`person_id` of the budget's members): a
// person belongs to ONE account, so nobody sees the overview of a person that
// is someone else's. The member links themselves (a guess from their name, or
// one question); only the budget's owner can undo someone else's link.
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

/** A person id, or `null` when the viewer said they are not in that budget. */
export type MeLink = string | null;

/** A budget member as the API lists it, with the person their account is. */
export interface LinkedMember {
  user_id?: string;
  user?: { id?: string; name?: string } | null;
  /** `null`/absent: not said yet; `''`: not in the household. */
  person_id?: string | null;
}

const memberUserId = (m: LinkedMember): string | undefined => m.user_id ?? m.user?.id ?? undefined;

/** The viewer's link in a budget, `undefined` when not said yet. */
export function linkOf(members: LinkedMember[], userId: string | undefined): MeLink | undefined {
  const m = userId ? members.find((x) => memberUserId(x) === userId) : undefined;
  if (!m || m.person_id === undefined || m.person_id === null) return undefined;
  return m.person_id === '' ? null : m.person_id;
}

/** Persons linked to OTHER members' accounts (person id → account name): never the viewer's. */
export function takenPersons(members: LinkedMember[], userId: string | undefined): Map<string, string> {
  const taken = new Map<string, string>();
  for (const m of members) {
    if (m.person_id && memberUserId(m) !== userId) taken.set(m.person_id, m.user?.name ?? '');
  }
  return taken;
}

const fold = (s: string): string =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
// « Marie-Anne » is a first name of its own: only spaces, dots and underscores separate.
const firstName = (s: string): string => fold(s).split(/[\s._]+/)[0] ?? '';

/**
 * The person the viewer most likely is, among those no one else has: the only
 * one whose name (or first name) matches theirs, or the only person of a
 * budget they do not share. `undefined` when it cannot be told: the page asks.
 */
export function guessMe(allPeople: Person[], userName: string | undefined, memberCount: number, taken: ReadonlyMap<string, string> = new Map()): string | undefined {
  const people = allPeople.filter((p) => !taken.has(p.id));
  const full = fold(userName ?? '');
  if (full) {
    const first = firstName(full);
    const matches = people.filter((p) => {
      const name = fold(p.name);
      return name !== '' && (name === full || firstName(name) === first);
    });
    if (matches.length === 1) return matches[0].id;
    if (matches.length > 1) return undefined;
  }
  if (allPeople.length === 1 && people.length === 1 && memberCount <= 1) return people[0].id;
  return undefined;
}

/** The viewer's person: their link while that person still exists in the household. */
export function resolveMe(link: MeLink | undefined, people: Person[]): MeLink | undefined {
  if (link === null) return null;
  return link && people.some((p) => p.id === link) ? link : undefined;
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
