// src/lib/tools/__tests__/resteAVivre.test.ts
// Reste à vivre calculator (run with `npm test`). The worked example is the
// one published on /calcul-reste-a-vivre: if it changes, update the page too.

import { computeResteAVivre, consumptionUnits, persons, rsaFloor } from '../resteAVivre';

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

test('INSEE consumption units', () => {
  eq(consumptionUnits({ adults: 1, kidsUnder14: 0, teens14plus: 0 }), 1);
  eq(consumptionUnits({ adults: 2, kidsUnder14: 0, teens14plus: 0 }), 1.5);
  eq(consumptionUnits({ adults: 2, kidsUnder14: 2, teens14plus: 0 }), 2.1);
  eq(consumptionUnits({ adults: 1, kidsUnder14: 1, teens14plus: 1 }), 1.8);
  // At least one adult, even if the form says 0.
  eq(consumptionUnits({ adults: 0, kidsUnder14: 0, teens14plus: 0 }), 1);
  eq(persons({ adults: 0, kidsUnder14: 2, teens14plus: 0 }), 3);
});

test('RSA floor follows the official table (1 April 2026)', () => {
  eq(rsaFloor(1), 651.69);
  eq(rsaFloor(2), 977.54);
  eq(rsaFloor(3), 1173.05);
  eq(rsaFloor(4), 1368.55);
  eq(rsaFloor(5), 1629.23);
  eq(rsaFloor(6), 1889.91);
  eq(rsaFloor(0), 651.69);
});

test('published example: couple, two children under 14', () => {
  const r = computeResteAVivre(
    { adults: 2, kidsUnder14: 2, teens14plus: 0 },
    { salaires: 3800 },
    { loyer: 1100, credits: 230, energie: 160, assurances: 150, telecom: 70, transport: 120, enfants: 180 },
  );
  eq(r.revenus, 3800);
  eq(r.charges, 2010);
  eq(r.reste, 1790);
  eq(r.parPersonne, 447.5);
  eq(r.parJour, 59.67);
  eq(r.units, 2.1);
  eq(r.parUnite, 852.38);
  near(r.chargesShare, 0.5289, 'charges share');
  near(r.debtRatio, 0.0605, 'debt ratio');
  eq(r.floor, 1368.55);
});

test('negative and empty amounts are ignored, deficit is kept', () => {
  const r = computeResteAVivre({ adults: 1, kidsUnder14: 0, teens14plus: 0 }, { salaires: 1200, aides: -50 }, { loyer: 900, energie: NaN, autres: 400 });
  eq(r.revenus, 1200);
  eq(r.charges, 1300);
  eq(r.reste, -100);
  eq(r.debtRatio, null);
});

test('no income: no ratios', () => {
  const r = computeResteAVivre({ adults: 2, kidsUnder14: 0, teens14plus: 0 }, {}, { loyer: 700 });
  eq(r.chargesShare, null);
  eq(r.debtRatio, null);
  eq(r.reste, -700);
});

test('mortgage and other loans count in the borrowing ratio, rent does not', () => {
  const r = computeResteAVivre({ adults: 2, kidsUnder14: 0, teens14plus: 0 }, { salaires: 4000 }, { creditImmo: 1200, credits: 200, loyer: 0, energie: 150 });
  near(r.debtRatio, 0.35, 'debt ratio');
  eq(r.credits, 1400);
});
