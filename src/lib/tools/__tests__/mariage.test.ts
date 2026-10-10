// src/lib/tools/__tests__/mariage.test.ts
// Wedding budget calculator (run with `npm test`). The worked example is the
// one published on /budget-mariage (fictitious amounts): if it changes, update
// the page and its SEO summary too.

import {
  EXAMPLE, MAX_GUESTS, MIN_GUESTS, addMonths, clampGuests, computeMariage, exampleResult, formatMonthValue,
  monthsBefore, parseMonth, savingPlan, withFewerGuests,
} from '../mariage';

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

// 10 October 2026, local time.
const OCT_2026 = new Date(2026, 9, 10);

test('total: fixed postes plus per-guest postes × guests', () => {
  const r = computeMariage(50, { lieu: 3000, traiteur: 70, boissons: 15.5, photo: 1200 });
  eq(r.guests, 50);
  eq(r.perGuestTotal, 4275); // (70 + 15.5) × 50
  eq(r.fixedTotal, 4200);
  eq(r.total, 8475);
  eq(r.ratePerGuest, 85.5);
  near(r.perGuestShare, 4275 / 8475, 'per-guest share');
});

test('per-guest postes scale with the guest list, fixed ones do not', () => {
  const a = computeMariage(80, { lieu: 5000, traiteur: 90, boissons: 25 });
  const b = computeMariage(120, { lieu: 5000, traiteur: 90, boissons: 25 });
  eq(b.total - a.total, 40 * 115);
  eq(a.fixedTotal, b.fixedTotal);
  eq(b.perGuestTotal, 120 * 115);
});

test('cost per guest excludes the honeymoon', () => {
  const r = computeMariage(100, { lieu: 4000, traiteur: 80, voyage: 3000 });
  eq(r.total, 15000);
  eq(r.voyage, 3000);
  eq(r.costPerGuest, 120); // (15 000 − 3 000) / 100
  eq(computeMariage(3, { lieu: 100 }).costPerGuest, 33.33);
});

test('guests are clamped, negative and empty amounts ignored', () => {
  eq(clampGuests(0), MIN_GUESTS);
  eq(clampGuests(NaN), MIN_GUESTS);
  eq(clampGuests(1000), MAX_GUESTS);
  eq(clampGuests(42.7), 42);
  const r = computeMariage(10, { lieu: -500, traiteur: NaN, tenues: 800 });
  eq(r.total, 800);
  eq(r.perGuestShare, 0);
  eq(computeMariage(10, {}).perGuestShare, null);
  eq(computeMariage(10, {}).lines, []);
});

test('breakdown: non-zero postes, largest first, ties keep the form order', () => {
  const r = computeMariage(100, { lieu: 4000, traiteur: 80, boissons: 20, tenues: 2000, papeterie: 300 });
  eq(r.lines.map((l) => l.key), ['traiteur', 'lieu', 'boissons', 'tenues', 'papeterie']);
  eq(r.lines[0].amount, 8000);
  eq(r.lines[0].rate, 80);
  eq(r.lines[0].perGuest, true);
  eq(r.lines[1].rate, undefined);
  near(r.lines[0].share, 8000 / 16300, 'share');
});

test('20 fewer guests: saving on the per-guest postes, never below the minimum', () => {
  const r = computeMariage(100, { lieu: 4000, traiteur: 80, boissons: 20 });
  eq(withFewerGuests(r), { fewer: 20, guests: 80, saving: 2000, total: 12000 }); // 14 000 − 20 × 100
  const small = computeMariage(12, { traiteur: 50 });
  eq(withFewerGuests(small).fewer, 10);
  eq(withFewerGuests(small).saving, 500);
  eq(withFewerGuests(computeMariage(2, { traiteur: 50 })).fewer, 0);
});

test('months parsing and counting', () => {
  eq(parseMonth('2027-06'), { year: 2027, month: 6 });
  eq(parseMonth('06/2027'), { year: 2027, month: 6 });
  eq(parseMonth('6-2027'), { year: 2027, month: 6 });
  eq(parseMonth('2027-13'), null);
  eq(parseMonth(''), null);
  eq(parseMonth('juin'), null);
  eq(formatMonthValue({ year: 2027, month: 6 }), '2027-06');
  eq(addMonths({ year: 2026, month: 10 }, 18), { year: 2028, month: 4 });
  eq(addMonths({ year: 2027, month: 1 }, -1), { year: 2026, month: 12 });
  // October 2026 → wedding in June 2027: October … May = 8 deposits.
  eq(monthsBefore({ year: 2027, month: 6 }, { year: 2026, month: 10 }), 8);
  eq(monthsBefore({ year: 2026, month: 11 }, { year: 2026, month: 10 }), 1);
});

test('monthly saving: (total − already saved) ÷ months, rounded up to the euro', () => {
  const p = savingPlan(20000, 2000, '2027-06', OCT_2026);
  eq(p.status, 'ok');
  eq(p.months, 8);
  eq(p.remaining, 18000);
  eq(p.monthly, 2250);
  eq(p.from, { year: 2026, month: 10 });
  eq(p.to, { year: 2027, month: 5 });
  eq(savingPlan(1000, 0, '2027-01', OCT_2026).monthly, 334); // 333.33 → 334
  eq(savingPlan(500, 0, '2026-11', OCT_2026).monthly, 500); // a single deposit, this month
});

test('monthly saving edge cases: this month, past, no date, already covered', () => {
  eq(savingPlan(20000, 0, '2026-10', OCT_2026), { status: 'this-month', remaining: 20000, months: 0, monthly: null });
  eq(savingPlan(20000, 0, '2026-03', OCT_2026).status, 'past');
  eq(savingPlan(20000, 0, '', OCT_2026).status, 'no-date');
  eq(savingPlan(20000, 0, '2027-13', OCT_2026).status, 'no-date');
  const covered = savingPlan(15000, 18000, '2027-06', OCT_2026);
  eq(covered.status, 'covered');
  eq(covered.remaining, 0);
  eq(covered.monthly, 0);
  eq(savingPlan(15000, -50, '2027-06', OCT_2026).remaining, 15000);
});

test('published example (fictitious): 100 guests', () => {
  eq(EXAMPLE.guests, 100);
  const e = exampleResult();
  eq(e.total, 22000);
  eq(e.perGuestTotal, 10000);
  eq(e.fixedTotal, 12000);
  eq(e.costPerGuest, 220);
  eq(e.ratePerGuest, 100);
  near(e.perGuestShare, 0.4545, 'per-guest share');
  eq(e.fewerGuests, { fewer: 20, guests: 80, saving: 2000, total: 20000 });
  eq(e.remaining, 18000);
  eq(e.months, 18);
  eq(e.monthly, 1000);
  eq(e.lines.map((l) => l.key), ['traiteur', 'lieu', 'boissons', 'tenues', 'photo', 'autres', 'musique', 'deco', 'alliances', 'papeterie']);
  // The button sets the wedding EXAMPLE.monthsAhead months ahead: same monthly amount as the article.
  const wedding = formatMonthValue(addMonths({ year: 2026, month: 10 }, EXAMPLE.monthsAhead));
  eq(savingPlan(e.total, EXAMPLE.saved, wedding, OCT_2026).monthly, 1000);
});
