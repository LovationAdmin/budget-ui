// src/lib/budget/__tests__/overview.test.ts
// « Ma vue perso »: who the viewer is in each budget, and their month across
// all of them (run with `npm test`).

import { BudgetEngine } from '../engine';
import { autoCloseMonths, decodeBudget } from '../codec';
import {
  guessMe,
  linkOf,
  myMonth,
  overviewTotals,
  overviewUseful,
  resolveMe,
  takenPersons,
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

test('guess: the only matching name, accents and case aside', () => {
  const people = [person('a', 'Hélène'), person('b', 'Marc')];
  eq(guessMe(people, 'helene Dupont', 2), 'a', 'first name');
  eq(guessMe(people, 'Marc', 2), 'b');
  eq(guessMe([person('a', 'Marie D.'), person('b', 'Paul')], 'marie.dupont', 2), 'a', 'first name of an e-mail-like name');
  eq(guessMe(people, 'Zoé', 2), undefined, 'no match: ask');
  eq(guessMe([person('a', 'Marie'), person('b', 'Marie-Anne')], 'Marie', 2), 'a', '« Marie-Anne » is not « Marie »');
  eq(guessMe([person('a', 'Léa'), person('b', 'Léa B.')], 'Léa', 2), undefined, 'two matches: ask');
});

test('guess: the only person of an unshared budget', () => {
  eq(guessMe([person('a', 'Moi')], 'Sam', 1), 'a');
  eq(guessMe([person('a', 'Partner')], 'Sam', 2), undefined, 'shared budget: could be the other member');
  eq(guessMe([], 'Sam', 1), undefined);
});

test('guess: never a person linked to another member’s account', () => {
  const people = [person('a', 'Awa'), person('t', 'Tom')];
  const takenByTom = new Map([['a', 'Tom']]);
  eq(guessMe(people, 'Awa', 2, takenByTom), undefined, 'the matching name is someone else’s');
  eq(guessMe([person('a', 'Moi')], 'Sam', 1, new Map([['a', 'Lou']])), undefined, 'only person, but taken');
  eq(guessMe([person('a', 'Moi'), person('b', 'Ex')], 'Sam', 1, new Map([['b', 'Lou']])), undefined, 'one free person left is no proof');
});

test('links: the viewer’s own, the persons other accounts hold', () => {
  const members = [
    { user_id: 'u-awa', user: { id: 'u-awa', name: 'Awa' }, person_id: 'a' },
    { user_id: 'u-tom', user: { id: 'u-tom', name: 'Tom' }, person_id: 't' },
    { user_id: 'u-lou', user: { id: 'u-lou', name: 'Lou' }, person_id: '' },
    { user_id: 'u-new', user: { id: 'u-new', name: 'New' }, person_id: null },
  ];
  eq(linkOf(members, 'u-awa'), 'a');
  eq(linkOf(members, 'u-lou'), null, '« not in the household »');
  eq(linkOf(members, 'u-new'), undefined, 'not said yet');
  eq(linkOf(members, 'u-stranger'), undefined);
  eq(linkOf([{ user: { id: 'u-old' } }], 'u-old'), undefined, 'API without links');
  eq([...takenPersons(members, 'u-awa')], [['t', 'Tom']], 'own and empty links are not « taken »');
  const people = [person('a', 'A'), person('b', 'B')];
  eq(resolveMe('b', people), 'b');
  eq(resolveMe('gone', people), undefined, 'deleted person: ask again');
  eq(resolveMe(null, people), null);
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
