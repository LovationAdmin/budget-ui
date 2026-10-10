// src/lib/tools/__tests__/budgetPerso.test.ts
// Budget perso / 50-30-20 calculator (run with `npm test`). The worked
// examples are the ones published on /budget-personnel: if they change,
// update the page too.

import {
  EXAMPLE, EXAMPLE_HIGH_RENT, FULL_SAVINGS_MAX_NEEDS_SHARE, computeBudgetPerso, split503020, splitRemainder,
} from '../budgetPerso';

type Fn = () => void;
const tests: Array<{ name: string; fn: Fn }> = [];
const test = (name: string, fn: Fn) => tests.push({ name, fn });
class Fail extends Error {}
function eq(actual: unknown, expected: unknown, msg = '') {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Fail(`${msg}\n    got      ${a}\n    expected ${e}`);
}
function near(actual: number | null, expected: number, msg = '') {
  if (actual === null || Math.abs(actual - expected) > 0.0051) throw new Fail(`${msg}: got ${actual}, expected ${expected}`);
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

test('50/30/20 split of the income', () => {
  eq(split503020(2000), { besoins: 1000, envies: 600, epargne: 400 });
  eq(split503020(1733.5), { besoins: 866.75, envies: 520.05, epargne: 346.7 });
  eq(split503020(-100), { besoins: 0, envies: 0, epargne: 0 });
});

test('essentials share and totals, negative or empty amounts ignored', () => {
  const r = computeBudgetPerso({ salaire: 1800, autres: 200 }, { logement: 700, courses: 300, energie: NaN, sante: -20 });
  eq(r.revenus, 2000);
  eq(r.besoins, 1000);
  near(r.besoinsShare, 0.5, 'needs share');
  eq(computeBudgetPerso({}, { logement: 500 }).besoinsShare, null);
});

test('needs under 50 %: the rule as is, plus a free margin', () => {
  const s = splitRemainder(2500, 1000);
  eq(s, { status: 'within', reste: 1500, envies: 750, epargne: 500, marge: 250 });
  // Exactly 50 %: no margin, still the rule.
  eq(splitRemainder(2000, 1000), { status: 'within', reste: 1000, envies: 600, epargne: 400, marge: 0 });
});

test('needs between 50 and 60 %: wants shrink first, savings stay at 20 %', () => {
  eq(FULL_SAVINGS_MAX_NEEDS_SHARE, 0.6);
  eq(splitRemainder(2000, 1100), { status: 'trimmed', reste: 900, envies: 500, epargne: 400, marge: 0 });
  // At 60 % wants and savings meet: 400 / 400.
  eq(splitRemainder(2000, 1200), { status: 'trimmed', reste: 800, envies: 400, epargne: 400, marge: 0 });
});

test('needs above 60 %: what remains is split half and half', () => {
  eq(splitRemainder(2000, 1500), { status: 'shared', reste: 500, envies: 250, epargne: 250, marge: 0 });
  eq(splitRemainder(1500, 1499), { status: 'shared', reste: 1, envies: 0.5, epargne: 0.5, marge: 0 });
  // Continuous at the threshold: just above 60 % savings barely move.
  const s = splitRemainder(2000, 1201);
  eq(s.status, 'shared');
  eq(s.epargne, 399.5);
});

test('deficit and empty income: no split', () => {
  eq(splitRemainder(1200, 1350), { status: 'deficit', reste: -150, envies: 0, epargne: 0, marge: 0 });
  eq(splitRemainder(0, 300), { status: 'empty', reste: -300, envies: 0, epargne: 0, marge: 0 });
  const r = computeBudgetPerso({ salaire: 1200 }, { logement: 900, courses: 450 });
  eq(r.status, 'deficit');
  eq(r.enviesParJour, 0);
  eq(r.epargneShare, 0);
});

test('wants per day over 30 days', () => {
  eq(computeBudgetPerso({ salaire: 2000 }, { logement: 1000 }).enviesParJour, 20);
  eq(computeBudgetPerso({ salaire: 2000 }, { logement: 1100 }).enviesParJour, 16.67);
});

test('current savings compared with the suggestion', () => {
  const r = computeBudgetPerso({ salaire: 2000 }, { logement: 900 }, 150);
  eq(r.epargne, 400);
  eq(r.epargneActuelle, 150);
  near(r.epargneActuelleShare, 0.075, 'current savings share');
  eq(r.ecartEpargne, 250);
  eq(computeBudgetPerso({ salaire: 2000 }, { logement: 900 }, 500).ecartEpargne, -100);
  eq(computeBudgetPerso({ salaire: 2000 }, { logement: 900 }, NaN).epargneActuelle, 0);
});

test('published example: single person, 2 000 € net', () => {
  const r = computeBudgetPerso(EXAMPLE.incomes, EXAMPLE.needs);
  eq(r.revenus, 2000);
  eq(r.regle, { besoins: 1000, envies: 600, epargne: 400 });
  eq(r.besoins, 1120);
  near(r.besoinsShare, 0.56, 'needs share');
  eq(r.status, 'trimmed');
  eq(r.reste, 880);
  eq(r.envies, 480);
  eq(r.epargne, 400);
  eq(r.enviesParJour, 16);
});

test('published example with a higher rent (820 €)', () => {
  const r = computeBudgetPerso(EXAMPLE_HIGH_RENT.incomes, EXAMPLE_HIGH_RENT.needs);
  eq(r.besoins, 1260);
  near(r.besoinsShare, 0.63, 'needs share');
  eq(r.status, 'shared');
  eq(r.reste, 740);
  eq(r.envies, 370);
  eq(r.epargne, 370);
  eq(r.enviesParJour, 12.33);
});
