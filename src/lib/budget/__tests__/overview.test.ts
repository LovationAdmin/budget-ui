// src/lib/budget/__tests__/overview.test.ts
// « Ma vue perso »: who the viewer is in each budget, and their month across
// all of them (run with `npm test`).

import { BudgetEngine } from '../engine';
import { autoCloseMonths, decodeBudget } from '../codec';
import {
  identify,
  myMonth,
  nameScore,
  overviewTotals,
  overviewUseful,
  visibleCharge,
} from '../overview';
import { PRIVATE_CHARGE_LABEL, type Person } from '../types';

type Fn = () => void;
const tests: Array<{ name: string; fn: Fn }> = [];
const test = (name: string, fn: Fn) => tests.push({ name, fn });
class Fail extends Error {}
function eq(actual: unknown, expected: unknown, msg = '') {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Fail(`${msg}\n    got      ${a}\n    expected ${e}`);
}
function near(actual: number, expected: number, msg = '') {
  if (Math.abs(actual - expected) > 0.011) throw new Fail(`${msg}: got ${actual}, expected ${expected}`);
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

const person = (id: string, name: string): Person => ({ id, name, salary: 0 });

test('offered from two budgets, or one shared budget', () => {
  eq(overviewUseful([]), false);
  eq(overviewUseful([{ members: [{}] }]), false, 'alone in a single budget');
  eq(overviewUseful([{ members: [] }]), false);
  eq(overviewUseful([{ members: [{}, {}] }]), true, 'shared budget');
  eq(overviewUseful([{ members: [{}] }, { members: [{}] }]), true, 'two budgets');
});

const member = (id: string, name: string) => ({ user_id: id, user: { id, name } });

test('identity: the person who bears the account’s name, never a choice', () => {
  // Famille Dia: Libasse is Libasse, never Kristell.
  const people = [person('l', 'Libasse'), person('k', 'Kristell')];
  const members = [member('u-l', 'Libasse Dia'), member('u-k', 'Kristell Dia')];
  eq(identify(people, members, 'u-l', 'Libasse Dia'), { personId: 'l' });
  eq(identify(people, members, 'u-k', 'Kristell Dia'), { personId: 'k' });
  eq(identify(people, [member('u-l', 'Libasse Dia')], 'u-l', 'Libasse Dia'), { personId: 'l' }, 'Kristell without an account');
  eq(identify([person('a', 'hélène')], [member('u', 'Hélène Roy'), member('v', 'Marc')], 'u', 'Helene Roy'), { personId: 'a' }, 'accents and case aside');
  eq(identify([person('a', 'Marie D.'), person('b', 'Paul')], [member('u', 'marie.dupont')], 'u', 'marie.dupont'), { personId: 'a' }, 'e-mail-like account name');
});

test('identity: nobody by that name → not counted, with the reason', () => {
  const people = [person('m', 'Maman'), person('p', 'Papa')];
  eq(identify(people, [member('u', 'Awa'), member('v', 'Fatou')], 'u', 'Awa'), { personId: null, reason: 'none', names: [] });
  eq(identify([person('m', 'Marie-Anne')], [member('u', 'Marie'), member('v', 'Paul')], 'u', 'Marie'), { personId: null, reason: 'none', names: [] }, '« Marie-Anne » is not « Marie »');
  eq(identify([person('x', 'Partner')], [member('u', 'Sam'), member('v', 'Alex')], 'u', 'Sam'), { personId: null, reason: 'none', names: [] }, 'one person in a shared budget: not necessarily me');
  eq(identify([person('x', 'Moi')], [member('u', 'Sam')], 'u', 'Sam'), { personId: 'x' }, 'a household of one in an unshared budget');
  eq(identify([], [member('u', 'Sam')], 'u', 'Sam'), { personId: null, reason: 'none', names: [] });
});

test('identity: two people could be me, or someone else fits as well → no one', () => {
  eq(identify([person('a', 'Léa'), person('b', 'Léa')], [member('u', 'Léa Martin')], 'u', 'Léa Martin'), { personId: null, reason: 'ambiguous', names: ['Léa', 'Léa'] });
  // Two accounts named Léa, one person « Léa »: it is no one's.
  eq(identify([person('a', 'Léa'), person('t', 'Tom')], [member('u', 'Léa Martin'), member('v', 'Léa Dupont')], 'u', 'Léa Martin'), { personId: null, reason: 'ambiguous', names: ['Léa'] });
  // Told apart by the initial of the last name: each one gets theirs.
  const people = [person('m', 'Léa M.'), person('d', 'Léa D.')];
  const members = [member('u', 'Léa Martin'), member('v', 'Léa Dupont')];
  eq(identify(people, members, 'u', 'Léa Martin'), { personId: 'm' });
  eq(identify(people, members, 'v', 'Léa Dupont'), { personId: 'd' });
  // The full name beats the first name alone.
  eq(identify([person('a', 'Léa'), person('b', 'Léa Martin')], [member('u', 'Léa Martin')], 'u', 'Léa Martin'), { personId: 'b' });
});

test('name fit: full name, first name and initial, first name alone', () => {
  eq(nameScore('Libasse Dia', 'Libasse Dia'), 3);
  eq(nameScore('Léa D.', 'Léa Dupont'), 2);
  eq(nameScore('Léa', 'Léa Dupont'), 1);
  eq(nameScore('Libasse', 'Libasse'), 3);
  eq(nameScore('Libasse D.', 'Libasse'), 1, 'no last name on the account');
  eq(nameScore('Léa M.', 'Léa Dupont'), 0);
  eq(nameScore('Kristell', 'Libasse Dia'), 0);
  eq(nameScore('', 'Libasse'), 0);
});

// Two budgets for Awa: the household (pays 1 800 of 3 000) and a flat-share
// project (pays 200, salary declared again).
const household = decodeBudget(
  {
    budgetTitle: 'Foyer',
    people: [
      { id: 'awa', name: 'Awa', salary: 3000, contributions: [{ from: '2026-01', mode: 'fixed', value: 1800 }] },
      { id: 'tom', name: 'Tom', salary: 2000 },
    ],
    charges: [{ id: 'rent', label: 'Loyer', amount: 1500 }],
    personalCharges: [
      { id: 'phone', label: 'Forfait', amount: 20, ownerId: 'awa' },
      { id: 'tax', label: PRIVATE_CHARGE_LABEL, amount: 150, ownerId: 'awa', private: true, createdBy: 'user-awa' },
      { id: 'gym', label: 'Salle', amount: 35, ownerId: 'tom' },
    ],
  },
  '2026-10',
);
const flat = decodeBudget(
  {
    budgetTitle: 'Coloc',
    people: [
      { id: 'p1', name: 'Awa', salary: 3000, contributions: [{ from: '2026-01', mode: 'fixed', value: 200 }], startDate: '2026-09-01' },
      { id: 'p2', name: 'Inès', salary: 1800 },
    ],
  },
  '2026-10',
);

test('one budget, one month: pay, contribution, pocket money, own personal charges', () => {
  const e = new BudgetEngine(household, '2026-10');
  const m = myMonth(e, 'awa', '2026-10');
  eq(m.present, true);
  near(m.salary, 3000, 'pay');
  near(m.contribution, 1800, 'contribution');
  near(m.keep, 1200, 'pocket money');
  near(m.personalTotal, 170, 'own personal charges only');
  eq(m.personal.map((c) => c.id).sort(), ['phone', 'tax']);
});

test('not in the household that month', () => {
  const m = myMonth(new BudgetEngine(flat, '2026-10'), 'p1', '2026-08');
  eq(m.present, false);
  near(m.contribution, 0, 'nothing paid in');
});

test('closed month: frozen values, not today’s rules', () => {
  const closed = autoCloseMonths(household, '2026-11', 'now').model;
  const raised = {
    ...closed,
    people: closed.people.map((p) => (p.id === 'awa' ? { ...p, contributions: [{ from: '2026-01', mode: 'fixed' as const, value: 2000 }] } : p)),
  };
  const m = myMonth(new BudgetEngine(raised, '2026-11'), 'awa', '2026-10');
  eq(m.closed, true);
  near(m.contribution, 1800, 'October keeps its contribution');
});

test('totals: the same pay declared twice counts once', () => {
  const a = myMonth(new BudgetEngine(household, '2026-10'), 'awa', '2026-10');
  const b = myMonth(new BudgetEngine(flat, '2026-10'), 'p1', '2026-10');
  for (const mode of ['highest', 'sum'] as const) {
    const t = overviewTotals([a, b], mode);
    eq(t.incomesDiffer, false);
    near(t.income, 3000, `${mode}: pay once`);
    near(t.contributions, 2000, 'both contributions');
    near(t.personal, 170, 'personal charges');
    near(t.left, 830, 'what is left');
  }
});

test('totals: different pay, highest or sum as chosen', () => {
  const months = [
    { present: true, salary: 3000, contribution: 1800, personalTotal: 0 },
    { present: true, salary: 500, contribution: 400, personalTotal: 50 },
    { present: true, salary: 0, contribution: 100, personalTotal: 0 },
    { present: false, salary: 9999, contribution: 9999, personalTotal: 9999 },
  ];
  const highest = overviewTotals(months, 'highest');
  eq(highest.incomesDiffer, true);
  near(highest.income, 3000, 'highest');
  near(highest.contributions, 2300, 'absent budget left out');
  near(highest.left, 3000 - 2300 - 50, 'left');
  near(overviewTotals(months, 'sum').income, 3500, 'sum of the non-zero pay');
  near(overviewTotals([], 'sum').income, 0, 'no budget');
});

test('private personal charges: real name for their creator only', () => {
  const tax = { id: 'tax', label: PRIVATE_CHARGE_LABEL, category: undefined, private: true, createdBy: 'user-awa' };
  const details = { tax: { label: 'Impôt', category: 'impots' } };
  eq(visibleCharge(tax, 'user-awa', details), { label: 'Impôt', category: 'impots' });
  eq(visibleCharge(tax, 'user-tom', details), { label: PRIVATE_CHARGE_LABEL });
  eq(visibleCharge({ id: 'x', label: 'Forfait', category: 'telecom', private: false }, undefined, {}), { label: 'Forfait', category: 'telecom' });
});
