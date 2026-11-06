// src/lib/tools/__tests__/couple.test.ts
// Couple budget split (run with `npm test`). The worked example is the one
// published on /budget-couple: if it changes, update the page too.

import { splitContributions } from '@/lib/budget/engine';
import { COUPLE_EXAMPLE, COUPLE_METHODS, compareMethods, computeCouple, contributions } from '../couple';

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

test('published example: 2 000 € of shared charges for 2 700 € + 1 800 €', () => {
  const all = compareMethods(COUPLE_EXAMPLE);
  near(all.egal.shared, 2000, 'shared');
  near(all.egal.left, 2500, 'left together');
  // 50/50
  near(all.egal.shares[0].contribution, 1000, 'egal Camille');
  near(all.egal.shares[1].keeps, 800, 'egal Mehdi keeps');
  near(all.egal.shares[0].keeps, 1700, 'egal Camille keeps');
  // prorata: 60 % / 40 %
  near(all.prorata.shares[0].contribution, 1200, 'prorata Camille');
  near(all.prorata.shares[1].contribution, 800, 'prorata Mehdi');
  near(all.prorata.shares[0].keeps, 1500, 'prorata Camille keeps');
  near(all.prorata.shares[1].keeps, 1000, 'prorata Mehdi keeps');
  near(all.prorata.shares[0].effort, 2000 / 4500, 'same effort');
  near(all.prorata.shares[1].effort, 2000 / 4500, 'same effort');
  // same spending money: 1 250 € each
  near(all.reste.shares[0].contribution, 1450, 'reste Camille');
  near(all.reste.shares[1].contribution, 550, 'reste Mehdi');
  near(all.reste.shares[0].keeps, 1250, 'reste Camille keeps');
  near(all.reste.shares[1].keeps, 1250, 'reste Mehdi keeps');
});

test('contributions always add up to the shared charges', () => {
  for (const method of COUPLE_METHODS) {
    const r = computeCouple({ ...COUPLE_EXAMPLE, method });
    near(r.shares[0].contribution + r.shares[1].contribution, r.shared, method);
    near(r.shares[0].ratio + r.shares[1].ratio, 1, `${method} ratios`);
  }
});

test('same three methods as the Foyer assistant of the app', () => {
  const incomes: [number, number] = [2700, 1800];
  const pairs = [['egal', 'equal'], ['prorata', 'prorata'], ['reste', 'reste']] as const;
  for (const [tool, app] of pairs) {
    const ours = contributions(tool, incomes, 2000).values.map(Math.round);
    eq(ours, splitContributions(app, incomes, 2000), tool);
  }
});

test('same spending money: a partner below it pays nothing', () => {
  const r = computeCouple({ partners: [{ name: 'A', income: 3000 }, { name: 'B', income: 300 }], charges: [2000], method: 'reste' });
  near(r.shares[0].contribution, 2000, 'A pays all');
  near(r.shares[1].contribution, 0, 'B pays nothing');
  near(r.shares[1].keeps, 300, 'B keeps their income');
  eq(splitContributions('reste', [3000, 300], 2000), [2000, 0], 'app agrees');
});

test('prorata and same spending money need both incomes', () => {
  const one = { partners: [{ name: 'A', income: 2000 }, { name: 'B', income: 0 }] as COUPLE_PARTNERS, charges: [1000] };
  for (const method of ['prorata', 'reste'] as const) {
    const r = computeCouple({ ...one, method });
    eq(r.applied, 'egal', method);
    eq(r.fallback, 'incomes', method);
    near(r.shares[1].contribution, 500, `${method} half`);
  }
  eq(computeCouple({ ...one, method: 'egal' }).fallback, null, 'egal needs no income');
});

test('charges above both incomes: the shortfall shows', () => {
  const r = computeCouple({ partners: [{ name: 'A', income: 900 }, { name: 'B', income: 600 }], charges: [1800], method: 'prorata' });
  near(r.shortfall, 300, 'shortfall');
  near(r.left, -300, 'left');
  near(r.shares[0].keeps, -180, 'A short');
});

test('empty or invalid amounts count as zero', () => {
  const r = computeCouple({ partners: [{ name: 'A', income: Number.NaN }, { name: 'B', income: -4 }], charges: [-5, 40, Number.NaN], method: 'egal' });
  near(r.shared, 40, 'shared');
  near(r.shares[0].contribution, 20, 'each');
  eq(r.shares[0].effort, null, 'no effort without income');
});

type COUPLE_PARTNERS = typeof COUPLE_EXAMPLE.partners;
