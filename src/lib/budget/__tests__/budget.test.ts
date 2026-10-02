// src/lib/budget/__tests__/budget.test.ts
// Test-suite for the budget model v3 (run with `npm test`).
// It includes a faithful copy of the previous version's month formulas and
// checks, on randomly generated legacy budgets, that the new engine produces
// exactly the same numbers when no v3 feature is used (no-regression proof).

import {
  BudgetEngine,
  resolveLiveMonth,
  splitContributions,
  chargeStatus,
  describeChargeSchedule,
  customMonthsText,
  chargesEndingBetween,
} from '../engine';
import { autoCloseMonths, decodeBudget, encodeBudget } from '../codec';
import {
  applyContributionRules,
  closeMonth,
  deleteCharge,
  reopenMonth,
  setChargeAmountEverywhere,
  setChargeAmountFrom,
  setChargeMonthAmount,
  setPersonMoney,
  setSavingAmountFrom,
  setSavingMonthAmount,
  stopCharge,
  upsertCharge,
  addOneOff,
  setPotExpense,
  restartCharge,
  convertSavingToMonthly,
  stopProject,
  restartProject,
  clearPersonMonthException,
} from '../mutations';
import { makeYM, MONTH_NAMES, addMonths } from '../months';
import type { Charge } from '../types';

// ---------------------------------------------------------------------------
// Mini harness
// ---------------------------------------------------------------------------
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
function ok(cond: unknown, msg = '') {
  if (!cond) throw new Fail(msg || 'expected truthy');
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

// ---------------------------------------------------------------------------
// Legacy reference (copied from the previous MonthlyTable / BudgetComplete)
// ---------------------------------------------------------------------------
type Raw = Record<string, any>;
const legacyActive = (startDate: string | undefined, endDate: string | undefined, year: number, idx: number) => {
  const monthStart = new Date(year, idx, 1);
  const monthEnd = new Date(year, idx + 1, 0);
  if (startDate && new Date(startDate) > monthEnd) return false;
  if (endDate && new Date(endDate) < monthStart) return false;
  return true;
};
function legacyMonth(raw: Raw, year: number, idx: number) {
  const income = (raw.people ?? []).reduce((s: number, p: any) => (legacyActive(p.startDate, p.endDate, year, idx) ? s + (p.salary || 0) : s), 0);
  const charges = (raw.charges ?? []).reduce((s: number, c: any) => (legacyActive(c.startDate, c.endDate, year, idx) ? s + (c.amount || 0) : s), 0);
  const yd = raw.yearlyData?.[String(year)];
  const oneTime = Number(raw.oneTimeIncomes?.[String(year)]?.[idx]?.amount || 0);
  const available = income + oneTime - charges;
  const projAlloc = (raw.projects ?? [])
    .filter((p: any) => p.id !== 'epargne')
    .reduce((s: number, p: any) => {
      if (typeof p.monthlyAmount === 'number') return s + (legacyActive(p.startDate, p.endDate, year, idx) ? p.monthlyAmount : 0);
      return s + (yd?.months?.[idx]?.[p.id] || 0);
    }, 0);
  const genExpense = yd?.expenses?.[idx]?.epargne || 0;
  return { income, charges, oneTime, available, projAlloc, general: available - projAlloc, genExpense };
}

// Seeded PRNG
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function randomLegacyBudget(seed: number, years: number[]): Raw {
  const r = rng(seed);
  const int = (a: number, b: number) => a + Math.floor(r() * (b - a + 1));
  const pick = <T,>(arr: T[]) => arr[int(0, arr.length - 1)];
  const date = (y: number, m: number, day: number) => `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const maybeStart = () => (r() < 0.5 ? undefined : date(pick(years), int(1, 12), 1));
  const maybeEnd = () => (r() < 0.6 ? undefined : date(pick(years), int(1, 12), int(1, 27)));
  const people = Array.from({ length: int(1, 3) }, (_, i) => ({ id: `p${i}`, name: `P${i}`, salary: int(1200, 4000), startDate: maybeStart(), endDate: maybeEnd() }));
  const charges = Array.from({ length: int(2, 9) }, (_, i) => ({ id: `c${i}`, label: `C${i}`, amount: int(5, 1300), startDate: maybeStart(), endDate: maybeEnd(), category: 'OTHER' }));
  const projects = Array.from({ length: int(0, 3) }, (_, i) => {
    const recurring = r() < 0.6;
    return recurring
      ? { id: `s${i}`, label: `S${i}`, monthlyAmount: int(20, 300), startDate: maybeStart(), endDate: maybeEnd() }
      : { id: `s${i}`, label: `S${i}`, targetAmount: int(500, 5000) };
  });
  const yearlyData: Raw = {};
  const oneTimeIncomes: Raw = {};
  for (const y of years) {
    const months = Array.from({ length: 12 }, (_, idx) => {
      const m: Record<string, number> = {};
      for (const p of projects as any[]) {
        if (typeof p.monthlyAmount === 'number') m[p.id] = legacyActive(p.startDate, p.endDate, y, idx) ? p.monthlyAmount : 0;
        else if (r() < 0.5) m[p.id] = int(0, 400);
      }
      return m;
    });
    const expenses = Array.from({ length: 12 }, () => {
      const e: Record<string, number> = {};
      if (r() < 0.2) e.epargne = int(10, 500);
      for (const p of projects as any[]) if (r() < 0.1) e[p.id] = int(10, 300);
      return e;
    });
    yearlyData[String(y)] = {
      months,
      expenses,
      monthComments: Array.from({ length: 12 }, () => (r() < 0.1 ? 'note' : '')),
      expenseComments: Array.from({ length: 12 }, () => ({})),
      deletedMonths: [],
    };
    oneTimeIncomes[String(y)] = Array.from({ length: 12 }, () => ({ amount: r() < 0.2 ? int(50, 900) : 0, description: '' }));
  }
  return { budgetTitle: 'Test', currentYear: years[years.length - 1], people, charges, projects, yearlyData, oneTimeIncomes, lockedMonths: {}, date: '2026-01-01T00:00:00Z' };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test('legacy parity: random budgets give identical month totals', () => {
  for (let seed = 1; seed <= 250; seed++) {
    const years = seed % 3 === 0 ? [2025, 2026] : [2026];
    const raw = randomLegacyBudget(seed, years);
    const model = decodeBudget(raw, '2026-09');
    for (const y of years) {
      for (let idx = 0; idx < 12; idx++) {
        const ym = makeYM(y, idx);
        const live = resolveLiveMonth(model, ym);
        const legacy = legacyMonth(raw, y, idx);
        near(live.totals.salaries, legacy.income, `seed ${seed} ${ym} income`);
        near(live.totals.contributions, legacy.income, `seed ${seed} ${ym} contributions (all)`);
        near(live.totals.charges, legacy.charges, `seed ${seed} ${ym} charges`);
        near(live.totals.oneOff, legacy.oneTime, `seed ${seed} ${ym} oneTime`);
        near(live.totals.savings, legacy.projAlloc, `seed ${seed} ${ym} savings`);
        near(live.totals.reste, legacy.general, `seed ${seed} ${ym} general`);
      }
    }
  }
});

test('legacy parity: general savings running total', () => {
  for (let seed = 1; seed <= 80; seed++) {
    const years = [2025, 2026];
    const raw = randomLegacyBudget(seed, years);
    const engine = new BudgetEngine(decodeBudget(raw, '2026-09'), '2026-09');
    let total = 0;
    for (const y of years) {
      for (let idx = 0; idx < 12; idx++) {
        const l = legacyMonth(raw, y, idx);
        total += l.general - l.genExpense;
        near(engine.generalBalance(makeYM(y, idx)), total, `seed ${seed} ${y}-${idx}`);
      }
    }
  }
});

test('legacy parity: savings pot balances', () => {
  for (let seed = 1; seed <= 80; seed++) {
    const raw = randomLegacyBudget(seed, [2026]);
    const engine = new BudgetEngine(decodeBudget(raw, '2026-09'), '2026-09');
    for (const p of raw.projects) {
      let total = 0;
      for (let idx = 0; idx < 12; idx++) {
        const alloc = typeof p.monthlyAmount === 'number'
          ? (legacyActive(p.startDate, p.endDate, 2026, idx) ? p.monthlyAmount : 0)
          : raw.yearlyData['2026'].months[idx][p.id] || 0;
        total += alloc - (raw.yearlyData['2026'].expenses[idx][p.id] || 0);
        near(engine.savingBalance(p.id, makeYM(2026, idx)), total, `seed ${seed} ${p.id} ${idx}`);
      }
    }
  }
});

test('codec: round trip keeps data and unknown keys', () => {
  const raw = randomLegacyBudget(7, [2025, 2026]);
  raw.someFutureKey = { keep: true };
  raw.charges[0].customField = 'x';
  raw.yearlyData['2026'].deletedMonths = [3];
  raw.yearlyData['2026'].futureYearKey = 42;
  const model = decodeBudget(raw, '2026-09');
  const encoded = encodeBudget(model, '2026-09', '2026-09-30T10:00:00.000Z');
  eq(encoded.someFutureKey, { keep: true }, 'top-level extra');
  eq((encoded.charges as any)[0].customField, 'x', 'charge extra');
  eq((encoded.yearlyData as any)['2026'].deletedMonths, [3], 'year extra deletedMonths');
  eq((encoded.yearlyData as any)['2026'].futureYearKey, 42, 'year extra');
  eq(encoded.schemaVersion, 3);
  const again = decodeBudget(encoded, '2026-09');
  for (const ym of Object.keys(model.months)) {
    eq(resolveLiveMonth(again, ym).totals, resolveLiveMonth(model, ym).totals, `totals ${ym}`);
    eq(again.months[ym].comment, model.months[ym].comment, `comment ${ym}`);
    eq(again.months[ym].expenses, model.months[ym].expenses, `expenses ${ym}`);
  }
});

test('codec: legacy month-name format is migrated', () => {
  const raw = {
    budgetTitle: 'Ancien',
    currentYear: 2025,
    people: [{ id: 'a', name: 'A', salary: 2000 }],
    charges: [{ id: 'c', label: 'Loyer', amount: 800 }],
    projects: [{ id: 'v', label: 'Vacances', targetAmount: 1000 }],
    yearlyData: { Janvier: { v: 100 }, 'FÃ©vrier': { v: 50 } },
    yearlyExpenses: { Janvier: { v: 20 } },
    oneTimeIncomes: { Mars: 300 },
    monthComments: { Janvier: 'Bonne année' },
    lockedMonths: { Janvier: true },
  };
  const model = decodeBudget(raw, '2026-09');
  eq(model.months['2025-01'].allocations, { v: 100 });
  eq(model.months['2025-02'].allocations, { v: 50 });
  eq(model.months['2025-01'].expenses, { v: 20 });
  eq(model.months['2025-03'].oneOffs.map((o) => o.amount), [300]);
  eq(model.months['2025-01'].comment, 'Bonne année');
  eq(model.months['2025-01'].lock, true);
  const enc = encodeBudget(model, '2026-09', 'now') as any;
  eq(enc.yearlyData['2025'].months[0], { v: 100 });
  eq(enc.oneTimeIncomes['2025'][2].amount, 300);
});

test('codec: per-year locks and legacy global lock fallback', () => {
  const raw = randomLegacyBudget(3, [2026]);
  raw.lockedMonths = { Janvier: true, Octobre: true }; // Octobre is in the future → contamination
  const model = decodeBudget(raw, '2026-09');
  eq(model.months['2026-01'].lock, true);
  eq(model.months['2026-10'].lock, undefined, 'future global lock ignored');
  raw.yearlyData['2026'].lockedMonths = { Mars: false };
  const model2 = decodeBudget(raw, '2026-09');
  eq(model2.months['2026-03'].lock, false);
  eq(model2.months['2026-01'].lock, undefined, 'per-year map wins over global');
});

test('autoClose: past months get frozen, reopened months stay open', () => {
  const raw = randomLegacyBudget(11, [2026]);
  raw.yearlyData['2026'].lockedMonths = { Mars: false };
  const { model, changed } = autoCloseMonths(decodeBudget(raw, '2026-09'), '2026-09', '2026-09-30T00:00:00Z');
  ok(changed);
  for (let idx = 0; idx < 8; idx++) {
    const ym = makeYM(2026, idx);
    if (idx === 2) {
      eq(model.months[ym].lock, false);
      ok(!model.months[ym].snapshot, 'march stays open');
    } else {
      eq(model.months[ym].lock, true, ym);
      ok(model.months[ym].snapshot, `snapshot ${ym}`);
    }
  }
  eq(model.months['2026-09'].lock, undefined, 'current month open');
  const engine = new BudgetEngine(model, '2026-09');
  for (let idx = 0; idx < 12; idx++) {
    const ym = makeYM(2026, idx);
    near(engine.month(ym).totals.reste, legacyMonth(raw, 2026, idx).general, `frozen equals legacy ${ym}`);
  }
  const second = autoCloseMonths(model, '2026-09', 'later');
  ok(!second.changed, 'idempotent');
});

test('snapshot: deleting a charge keeps closed months intact', () => {
  const raw = randomLegacyBudget(21, [2026]);
  const { model } = autoCloseMonths(decodeBudget(raw, '2026-09'), '2026-09', 'now');
  const before = new BudgetEngine(model, '2026-09');
  const target = model.charges[0];
  const after = new BudgetEngine(deleteCharge(model, target.id), '2026-09');
  near(after.month('2026-02').totals.charges, before.month('2026-02').totals.charges, 'closed february unchanged');
  const sept = before.month('2026-09').charges.find((c) => c.id === target.id);
  near(after.month('2026-09').totals.charges, before.month('2026-09').totals.charges - (sept?.amount ?? 0), 'open month drops it');
  ok(after.month('2026-02').charges.some((c) => c.id === target.id && c.deleted) || !before.month('2026-02').charges.some((c) => c.id === target.id), 'flagged deleted');
});

test('charges: amount from a month keeps the past', () => {
  let model = decodeBudget({ people: [], charges: [{ id: 'l', label: 'Loyer', amount: 1150, startDate: '2024-09-01' }] }, '2026-09');
  model = setChargeAmountFrom(model, 'l', '2026-10', 1250, '2026-09');
  const e = new BudgetEngine(model, '2026-09');
  near(e.month('2026-09').totals.charges, 1150);
  near(e.month('2026-10').totals.charges, 1250);
  near(e.month('2027-05').totals.charges, 1250);
  near(e.month('2025-01').totals.charges, 1150);
  eq(model.charges[0].amount, 1150, 'legacy amount = today');
  eq(model.charges[0].amountHistory, [{ from: '2024-09', amount: 1150 }, { from: '2026-10', amount: 1250 }]);
  const enc = encodeBudget(model, '2026-11', 'now') as any;
  eq(enc.charges[0].amount, 1250, 'legacy amount follows today on save');
  model = setChargeAmountFrom(model, 'l', '2026-10', 1150, '2026-09');
  ok(!model.charges[0].amountHistory, 'collapses back to a single amount');
});

test('charges: month-only exceptions and skip', () => {
  let model = decodeBudget({ charges: [{ id: 'n', label: 'Netflix', amount: 14 }] }, '2026-09');
  model = setChargeMonthAmount(model, 'n', '2026-07', 0);
  let e = new BudgetEngine(model, '2026-09');
  ok(e.month('2026-07').charges[0].skipped);
  near(e.month('2026-07').totals.charges, 0);
  near(e.month('2026-08').totals.charges, 14);
  model = setChargeMonthAmount(model, 'n', '2026-07', 14);
  ok(!model.charges[0].overrides, 'override equal to the rule is dropped');
  model = setChargeMonthAmount(model, 'n', '2026-12', 20);
  e = new BudgetEngine(model, '2026-09');
  ok(e.month('2026-12').charges[0].adjusted);
  model = setChargeAmountEverywhere(model, 'n', 16);
  e = new BudgetEngine(model, '2026-09');
  near(e.month('2026-11').totals.charges, 16);
  near(e.month('2026-12').totals.charges, 20, 'exception survives a global correction');
});

test('charges: frequencies', () => {
  const base = decodeBudget({}, '2026-09');
  const cantine: Charge = { id: 'k', label: 'Cantine', amount: 120, frequency: 'custom', months: [1, 2, 3, 4, 5, 6, 9, 10, 11, 12], startDate: '2025-09-01' };
  const taxe: Charge = { id: 't', label: 'Taxe', amount: 960, frequency: 'yearly', startDate: '2026-10-01' };
  const assurance: Charge = { id: 'a', label: 'Assurance', amount: 540, frequency: 'yearly', smooth: true, startDate: '2025-03-01' };
  const once: Charge = { id: 'o', label: 'Fournitures', amount: 180, frequency: 'once', startDate: '2026-09-01' };
  let model = [cantine, taxe, assurance, once].reduce((m, c) => upsertCharge(m, c), base);
  const e = new BudgetEngine(model, '2026-09');
  const amount = (ym: string, id: string) => e.month(ym).charges.find((c) => c.id === id)?.amount ?? 0;
  near(amount('2026-07', 'k'), 0);
  near(amount('2026-09', 'k'), 120);
  near(amount('2026-10', 't'), 960);
  near(amount('2026-11', 't'), 0);
  near(amount('2027-10', 't'), 960);
  near(amount('2026-04', 'a'), 45);
  ok(e.month('2027-03').charges.find((c) => c.id === 'a')?.dueMonth);
  near(amount('2026-09', 'o'), 180);
  near(amount('2026-10', 'o'), 0);
  eq(customMonthsText(cantine.months), 'Tous les mois sauf juillet et août');
  eq(chargeStatus(once, '2026-09'), 'active');
  eq(chargeStatus(once, '2026-10'), 'ended');
  eq(chargeStatus(taxe, '2026-09'), 'upcoming');
  eq(describeChargeSchedule(assurance, '2026-09'), 'Chaque année en mars · lissée sur 12 mois');
  model = restartCharge(stopCharge(model, 'k', '2026-12').model, 'k', '2027-02', '2026-09');
  near(new BudgetEngine(model, '2026-09').month('2027-02').totals.charges, 120 + 45, 'restarted in February');
  near(new BudgetEngine(model, '2026-09').month('2026-10').totals.charges, 120 + 960 + 45, 'history untouched');
  eq(chargeStatus(model.charges.find((c) => c.id === 'k')!, '2027-01'), 'upcoming');
  near(new BudgetEngine(model, '2026-09').month('2027-01').totals.charges, 0 + 45 + 0, 'gap between stop and restart');
});

test('charges: stopping before the start removes it', () => {
  const model = decodeBudget({ charges: [{ id: 'p', label: 'Piano', amount: 70, startDate: '2026-10-01' }] }, '2026-09');
  const res = stopCharge(model, 'p', '2026-09');
  ok(res.removed);
  eq(res.model.charges.length, 0);
});

test('people: salary ≠ contribution, month and forward scopes', () => {
  let model = decodeBudget({ people: [{ id: 't', name: 'Thomas', salary: 3400 }, { id: 'c', name: 'Camille', salary: 2700 }] }, '2026-09');
  let e = new BudgetEngine(model, '2026-09');
  near(e.month('2026-09').totals.contributions, 6100, 'legacy: everything goes to the pot');
  model = setPersonMoney(model, 't', '2026-06', 3600, { mode: 'fixed', value: 2100 }, 'forward', '2026-09');
  model = setPersonMoney(model, 'c', '2026-06', 2700, { mode: 'percent', value: 55 }, 'forward', '2026-09');
  e = new BudgetEngine(model, '2026-09');
  near(e.month('2026-05').totals.contributions, 6100, 'before the change');
  near(e.month('2026-06').totals.salaries, 6300);
  near(e.month('2026-06').totals.contributions, 2100 + 1485);
  eq(model.people[0].salary, 3600, 'legacy salary synced to today');
  model = setPersonMoney(model, 'c', '2026-12', 3500, { mode: 'fixed', value: 1800 }, 'month', '2026-09');
  e = new BudgetEngine(model, '2026-09');
  near(e.month('2026-12').people.find((p) => p.id === 'c')!.contribution, 1800);
  near(e.month('2027-01').people.find((p) => p.id === 'c')!.contribution, 1485);
  ok(e.month('2026-12').people.find((p) => p.id === 'c')!.salaryAdjusted);
});

test('assistant: split methods and apply', () => {
  eq(splitContributions('prorata', [3600, 2700], 2800), [1600, 1200]);
  eq(splitContributions('equal', [3600, 2700], 2800), [1400, 1400]);
  eq(splitContributions('reste', [3600, 2700], 2800), [1850, 950]);
  eq(splitContributions('reste', [5000, 500], 1000), [1000, 0]);
  eq(splitContributions('all', [3600, 2700], 2800), [3600, 2700]);
  let model = decodeBudget({ people: [{ id: 't', name: 'T', salary: 3600 }, { id: 'c', name: 'C', salary: 2700 }] }, '2026-09');
  model = setPersonMoney(model, 'c', '2026-11', 2700, { mode: 'fixed', value: 999 }, 'month', '2026-09');
  model = applyContributionRules(model, '2026-10', { t: { mode: 'fixed', value: 1600 }, c: { mode: 'fixed', value: 1200 } }, '2026-09');
  const e = new BudgetEngine(model, '2026-09');
  near(e.month('2026-09').totals.contributions, 6300, 'before');
  near(e.month('2026-10').totals.contributions, 2800, 'after');
  near(e.month('2026-11').totals.contributions, 2800, 'later exception cleared');
});

test('savings: recurring amount from a month, exceptions, manual pots', () => {
  let model = decodeBudget({ projects: [{ id: 'v', label: 'Vacances', monthlyAmount: 200, startDate: '2026-01-01' }, { id: 'm', label: 'Libre' }] }, '2026-09');
  model = setSavingAmountFrom(model, 'v', '2026-10', 250, '2026-09');
  model = setSavingMonthAmount(model, 'v', '2026-12', 0);
  model = setSavingMonthAmount(model, 'm', '2026-09', 80);
  model = setPotExpense(model, 'v', '2026-07', 1400, 'Location');
  const e = new BudgetEngine(model, '2026-09');
  near(e.month('2026-09').totals.savings, 280);
  near(e.month('2026-10').totals.savings, 250);
  near(e.month('2026-12').totals.savings, 0);
  near(e.savingBalance('v', '2026-09'), 9 * 200 - 1400);
  const enc = encodeBudget(model, '2026-09', 'now') as any;
  eq(enc.yearlyData['2026'].months[9].v, 250, 'recurring allocation mirrored for older readers');
  eq(enc.yearlyData['2026'].months[11].v, 0);
  eq(enc.yearlyData['2026'].expenseComments[6].v, 'Location');
});

test('savings: free pot converted to monthly, stop and restart', () => {
  let model = decodeBudget({ projects: [{ id: 'm', label: 'Travaux' }] }, '2026-09');
  model = setSavingMonthAmount(model, 'm', '2026-09', 80);
  model = setSavingMonthAmount(model, 'm', '2026-08', 50);
  model = closeMonth(model, '2026-08', 'now');
  let e = new BudgetEngine(model, '2026-09');
  model = convertSavingToMonthly(model, 'm', '2026-10', 150, '2026-09', (ym) => e.isClosed(ym));
  e = new BudgetEngine(model, '2026-09');
  near(e.month('2026-08').totals.savings, 50, 'closed month frozen');
  near(e.month('2026-09').totals.savings, 80, 'open month keeps its planned amount');
  near(e.month('2026-10').totals.savings, 150, 'monthly from October');
  near(e.month('2027-03').totals.savings, 150);
  near(e.savingBalance('m', '2026-10'), 50 + 80 + 150);
  model = stopProject(model, 'm', '2026-11');
  e = new BudgetEngine(model, '2026-09');
  near(e.month('2026-12').totals.savings, 0, 'stopped');
  model = restartProject(model, 'm', '2027-02');
  e = new BudgetEngine(model, '2026-09');
  near(e.month('2026-12').totals.savings, 0, 'gap stays empty');
  near(e.month('2027-01').totals.savings, 0, 'gap stays empty');
  near(e.month('2027-02').totals.savings, 150, 'restarted');
  near(e.month('2026-09').totals.savings, 80, 'history untouched');
});

test('savings: converting a free pot keeps closed months reopenable', () => {
  let model = decodeBudget({ projects: [{ id: 'm', label: 'Travaux' }] }, '2026-09');
  model = setSavingMonthAmount(model, 'm', '2026-08', 100);
  model = setSavingMonthAmount(model, 'm', '2026-09', 50);
  model = closeMonth(model, '2026-08', 'now');
  let e = new BudgetEngine(model, '2026-09');
  model = convertSavingToMonthly(model, 'm', '2026-09', 80, '2026-09', (ym) => e.isClosed(ym));
  e = new BudgetEngine(model, '2026-09');
  near(e.month('2026-08').totals.savings, 100, 'closed August frozen');
  near(e.month('2026-09').totals.savings, 80, 'monthly from September');
  model = reopenMonth(model, '2026-08');
  e = new BudgetEngine(model, '2026-09');
  near(e.month('2026-08').totals.savings, 100, 'reopened August keeps its amount');
  near(e.savingBalance('m', '2026-09'), 180);
});

test('months: one-offs, close and reopen', () => {
  let model = decodeBudget({ people: [{ id: 'a', name: 'A', salary: 2000 }], charges: [{ id: 'c', label: 'C', amount: 500 }] }, '2026-09');
  model = addOneOff(model, '2026-09', { label: 'Prime', amount: 300 });
  model = addOneOff(model, '2026-09', { label: 'Remboursement', amount: 45.5 });
  model = closeMonth(model, '2026-09', 'now');
  let e = new BudgetEngine(model, '2026-09');
  ok(e.month('2026-09').frozen);
  near(e.month('2026-09').totals.reste, 2000 + 345.5 - 500);
  model = setChargeAmountEverywhere(model, 'c', 900);
  e = new BudgetEngine(model, '2026-09');
  near(e.month('2026-09').totals.charges, 500, 'closed month is frozen');
  near(e.month('2026-10').totals.charges, 900);
  model = reopenMonth(model, '2026-09');
  e = new BudgetEngine(model, '2026-09');
  near(e.month('2026-09').totals.charges, 900, 'reopened month follows the rules');
  const enc = encodeBudget(model, '2026-09', 'now') as any;
  eq(enc.oneTimeIncomes['2026'][8].amount, 345.5);
  eq(enc.oneTimeIncomes['2026'][8].items.length, 2);
  eq(enc.lockedMonths[MONTH_NAMES[8]], false);
  const dec = decodeBudget(enc, '2026-09');
  eq(dec.months['2026-09'].oneOffs.map((o) => o.label), ['Prime', 'Remboursement']);
});

test('changes: new, resume, end and increases', () => {
  const model = decodeBudget(
    {
      charges: [
        { id: 'l', label: 'Loyer', amount: 1180, amountHistory: [{ from: '2024-09', amount: 1150 }, { from: '2026-09', amount: 1180 }], startDate: '2024-09-01' },
        { id: 'k', label: 'Cantine', amount: 120, frequency: 'custom', months: [1, 2, 3, 4, 5, 6, 9, 10, 11, 12] },
        { id: 'a', label: 'Crédit auto', amount: 240, endDate: '2026-08-31' },
        { id: 'f', label: 'Fournitures', amount: 180, frequency: 'once', startDate: '2026-09-01' },
      ],
    },
    '2026-09',
  );
  const kinds = new BudgetEngine(model, '2026-09').changes('2026-09').map((c) => `${c.label}:${c.kind}`).sort();
  eq(kinds, ['Cantine:resume', 'Crédit auto:end', 'Fournitures:new', 'Loyer:up']);
});

test('months helpers', () => {
  eq(addMonths('2026-12', 1), '2027-01');
  eq(addMonths('2026-01', -1), '2025-12');
});

test('charges: this month vs 12-month average with charges ending soon', () => {
  // Real-world case: two temporary charges end within the window, so the
  // month total (old « total des charges ») sits above the 12-month average.
  const c = (id: string, label: string, amount: number, extra: Partial<Charge> = {}) => ({ id, label, amount, startDate: '2026-08-01', ...extra });
  const model = decodeBudget(
    {
      charges: [
        c('loyer', 'Loyer', 1160),
        c('massage', 'massage drainage', 480, { startDate: '2026-09-01', endDate: '2026-11-30', amountHistory: [{ from: '2026-09', amount: 470 }, { from: '2026-10', amount: 480 }] }),
        c('food', 'Nourriture', 400),
        c('car', 'remb cred voiture', 372),
        c('navigo', 'Navigo', 178),
        c('clim', 'versmnt CLIM 3x', 178, { startDate: '2026-09-01', endDate: '2026-10-31' }),
        c('sport', 'Sport', 75),
        c('elec', 'Électricité', 60, { startDate: '2026-09-01' }),
        c('mobile', 'Forfaits Mobiles', 30),
        c('internet', 'Internet', 26),
      ],
    },
    '2026-10',
  );
  const e = new BudgetEngine(model, '2026-10');
  near(e.month('2026-10').totals.charges, 2959, 'October total');
  near(e.month('2026-09').totals.charges, 2949, 'September (massage at 470)');
  const avg = (from: string) => {
    let t = 0;
    for (let i = 0; i < 12; i++) t += e.month(addMonths(from, i)).totals.charges;
    return t / 12;
  };
  near(Math.round(avg('2026-10') * 100) / 100, 2395.83, '12-month average from October');
  near(Math.round(avg('2026-11')), 2341, '12-month average from November (Foyer default)');
  near(e.month('2026-11').totals.charges, 2781, 'heaviest month from November');
  eq(chargesEndingBetween(model, '2026-10', '2027-09').map((x) => `${x.charge.label}:${x.last}`), ['versmnt CLIM 3x:2026-10', 'massage drainage:2026-11']);
  eq(chargesEndingBetween(model, '2026-11', '2027-10').map((x) => x.charge.id), ['massage']);
});

test('members: clearing a month-only exception restores the rules', () => {
  const model = decodeBudget({ people: [{ id: 'a', name: 'A', salary: 2000, salaryOverrides: { '2026-10': 2500 }, contributionOverrides: { '2026-10': 900 } }] }, '2026-10');
  near(new BudgetEngine(model, '2026-10').month('2026-10').totals.contributions, 900, 'exception');
  const cleared = clearPersonMonthException(model, 'a', '2026-10');
  near(new BudgetEngine(cleared, '2026-10').month('2026-10').totals.contributions, 2000, 'rules again');
  eq(cleared.people[0].salaryOverrides, undefined);
});

test('personal charges: out of pocket money, never out of the pot', () => {
  const raw = {
    people: [
      { id: 'a', name: 'A', salary: 3000, contributions: [{ from: '2026-01', mode: 'fixed', value: 2000 }] },
      { id: 'b', name: 'B', salary: 2000, contributions: [{ from: '2026-01', mode: 'fixed', value: 1500 }] },
    ],
    charges: [{ id: 'rent', label: 'Loyer', amount: 1200 }],
    personalCharges: [
      { id: 'tax', label: 'Impôt', amount: 20, ownerId: 'a', startDate: '2026-10-01', endDate: '2027-02-28', private: true, createdBy: 'user-a' },
      { id: 'send', label: 'Envoi famille', amount: 150, ownerId: 'b' },
    ],
  };
  const model = decodeBudget(raw, '2026-10');
  const e = new BudgetEngine(model, '2026-10');
  const oct = e.month('2026-10');
  near(oct.totals.charges, 1200, 'pot charges exclude personal');
  near(oct.totals.reste, 3500 - 1200, 'pot leftover unchanged');
  near(oct.totals.personal, 170, 'personal total');
  const a = oct.people.find((p) => p.id === 'a')!;
  near(a.keep, 1000, 'pocket money stays 1000');
  near(a.personalCharges, 20, 'of which 20 personal');
  near(a.available, 980, 'available after personal');
  near(e.month('2027-03').people.find((p) => p.id === 'a')!.personalCharges, 0, 'tax over after February');
  eq(oct.charges.map((c) => c.id), ['rent']);
  eq(oct.personal.map((c) => c.id).sort(), ['send', 'tax']);
  // Split methods ignore personal charges: same pocket money for both.
  const proposal = splitContributions('reste', [3000, 2000], 1200);
  near(3000 - proposal[0], 2000 - proposal[1], 'same pocket money despite the tax');
  // Stored apart: pot readers (recap, mobile) never see them in `charges`.
  const enc = encodeBudget(model, '2026-10', 'now') as any;
  eq(enc.charges.map((c: any) => c.id), ['rent']);
  eq(enc.personalCharges.map((c: any) => c.id).sort(), ['send', 'tax']);
  eq(enc.personalCharges.find((c: any) => c.id === 'tax').private, true);
  // Closing a month freezes personal charges with it.
  const closed = autoCloseMonths(decodeBudget(enc, '2026-11'), '2026-11', 'now').model;
  const changed = { ...closed, charges: closed.charges.map((c) => (c.id === 'tax' ? { ...c, amount: 999 } : c)) };
  near(new BudgetEngine(changed, '2026-11').month('2026-10').people.find((p) => p.id === 'a')!.personalCharges, 20, 'frozen in October');
});
