// src/lib/tools/__tests__/colocation.test.ts
// Flat-share split (run with `npm test`). The worked example is the one
// published on /budget-colocation: if it changes, update the page too.

import { COLOC_EXAMPLE, computeColocation, rentWeights } from '../colocation';

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

const three = COLOC_EXAMPLE.roommates;

test('equal shares', () => {
  const r = computeColocation({ ...COLOC_EXAMPLE, method: 'egal' });
  eq(r.applied, 'egal');
  r.shares.forEach((s) => { near(s.rent, 450, 'rent'); near(s.bills, 66, 'bills'); near(s.total, 516, 'total'); });
  near(r.total, 1548, 'coloc total');
});

test('by bedroom: half the rent equal, half by area (published example)', () => {
  const r = computeColocation(COLOC_EXAMPLE);
  eq(r.applied, 'chambre');
  near(r.shares[0].rent, 393.75, 'coloc 1 rent');
  near(r.shares[1].rent, 450, 'coloc 2 rent');
  near(r.shares[2].rent, 506.25, 'coloc 3 rent');
  near(r.shares[0].total, 459.75, 'coloc 1 total');
  near(r.shares[2].total, 572.25, 'coloc 3 total');
});

test('by income', () => {
  const r = computeColocation({ ...COLOC_EXAMPLE, method: 'revenus' });
  eq(r.applied, 'revenus');
  near(r.shares[0].rent, 343.64, 'coloc 1');
  near(r.shares[1].rent, 441.82, 'coloc 2');
  near(r.shares[2].rent, 564.55, 'coloc 3');
});

test('shares always add up to the coloc total', () => {
  for (const method of ['egal', 'chambre', 'revenus'] as const) {
    const r = computeColocation({ ...COLOC_EXAMPLE, method });
    near(r.shares.reduce((s, x) => s + x.total, 0), r.total, method);
    near(r.shares.reduce((s, x) => s + x.ratio, 0), 1, `${method} ratios`);
  }
});

test('missing areas or incomes fall back to equal shares', () => {
  const noRoom = rentWeights('chambre', [{ ...three[0], room: 0 }, three[1]]);
  eq(noRoom.applied, 'egal');
  eq(noRoom.fallback !== null, true);
  const noIncome = rentWeights('revenus', three.map((t) => ({ ...t, income: 0 })));
  eq(noIncome.applied, 'egal');
  eq(noIncome.weights, [1 / 3, 1 / 3, 1 / 3]);
});

test('empty or invalid amounts count as zero', () => {
  const r = computeColocation({ rent: Number.NaN, bills: [-5, 40], method: 'egal', roommates: three.slice(0, 2) });
  near(r.total, 40, 'total');
  near(r.shares[0].total, 20, 'each');
});
