// src/lib/budget/split.ts
// ============================================================================
// Living split of the household pot. Applying a method in the Foyer assistant
// stores it as a household rule from a month on: every month from then is
// worked out with that method — its own charges and savings, its salaries —
// until another method is applied or a contribution is set by hand.
//
// The amounts are written as plain per-member contribution steps, so the
// other readers of the data (monthly recap e-mails, older app versions) read
// the same amounts without knowing about the rule. `deriveSplit` rewrites
// them after every change; closed months are never touched. A method applied
// before rules existed becomes one on its own (`adoptLegacySplit`).
// ============================================================================

import type { BudgetModel, ContributionStep, Person, YM } from './types';
import { BudgetEngine, resolvePerson, sortSteps, splitContributions, stepAt, windowOf, type SplitMethod } from './engine';
import { addMonths, compareYM, isYM, maxYM } from './months';
import { roundCents } from './format';
import { defineMessages, pick } from '@/i18n/current';

export type SplitBasis = 'month' | 'average' | 'peak';

export interface SplitSettings {
  method: SplitMethod;
  margin: number;
  basis: SplitBasis;
}

/** From `from` on, contributions follow `settings`; `null`: set by hand. */
export interface SplitRule {
  from: YM;
  settings: SplitSettings | null;
}

/** Top-level key of the shared budget data holding the settings last applied. */
export const SPLIT_KEY = 'splitSettings';
/** Top-level key holding the timeline of split rules. */
export const SPLIT_RULES_KEY = 'splitRules';
/** Months written ahead for the last rule; later months keep the last amount. */
const HORIZON_MONTHS = 24;

const METHODS: SplitMethod[] = ['prorata', 'equal', 'reste', 'all'];

const RULE_TEXT = defineMessages({
  fr: { prorata: 'au prorata', equal: 'à parts égales', reste: 'même argent de poche', all: 'tout le salaire' } as Record<SplitMethod, string>,
  en: { prorata: 'in proportion to pay', equal: 'equal shares', reste: 'same spending money', all: 'all their pay' },
});

/** "même argent de poche": the rule a contribution follows under a method. */
export const splitRuleText = (method: SplitMethod): string => pick(RULE_TEXT)[method];

/** Keeps only valid settings from stored, untrusted data. */
export function readSplitSettings(raw: unknown): Partial<SplitSettings> {
  if (!raw || typeof raw !== 'object') return {};
  const v = raw as Record<string, unknown>;
  const out: Partial<SplitSettings> = {};
  if (METHODS.includes(v.method as SplitMethod)) out.method = v.method as SplitMethod;
  if (v.margin === 0 || v.margin === 5 || v.margin === 10) out.margin = v.margin;
  if (v.basis === 'month' || v.basis === 'average' || v.basis === 'peak') out.basis = v.basis;
  return out;
}

export function sameSettings(a: SplitSettings | null, b: SplitSettings | null): boolean {
  if (!a || !b) return a === b;
  return a.method === b.method && a.margin === b.margin && a.basis === b.basis;
}

export function splitRules(model: BudgetModel): SplitRule[] {
  const raw = model.extras[SPLIT_RULES_KEY];
  if (!Array.isArray(raw)) return [];
  const out: SplitRule[] = [];
  for (const r of raw as Array<Record<string, unknown> | null>) {
    if (!r || !isYM(r.from)) continue;
    if (r.method === null) {
      out.push({ from: r.from, settings: null });
      continue;
    }
    const s = readSplitSettings(r);
    if (s.method && s.basis && s.margin !== undefined) out.push({ from: r.from, settings: s as SplitSettings });
  }
  return sortSteps(out);
}

/** The method contributions follow in `ym`, with the month it applies from; null when none. */
export function splitRuleAt(model: BudgetModel, ym: YM): SplitRule | null {
  let current: SplitRule | null = null;
  for (const r of splitRules(model)) if (compareYM(r.from, ym) <= 0) current = r;
  return current?.settings ? current : null;
}

function withRules(model: BudgetModel, rules: SplitRule[]): BudgetModel {
  const extras = { ...model.extras };
  if (rules.length) extras[SPLIT_RULES_KEY] = rules.map((r) => (r.settings ? { from: r.from, ...r.settings } : { from: r.from, method: null }));
  else delete extras[SPLIT_RULES_KEY];
  return { ...model, extras };
}

/** Rules before `from` stay; `settings` applies from `from` on (later rules are dropped). */
function setRuleFrom(model: BudgetModel, from: YM, settings: SplitSettings | null): BudgetModel {
  const kept = splitRules(model).filter((r) => compareYM(r.from, from) < 0);
  if (!sameSettings(kept[kept.length - 1]?.settings ?? null, settings)) kept.push({ from, settings });
  return withRules(model, kept);
}

/**
 * What the pot needs in `ym` for a method: that month's charges and savings,
 * the average of the 12 months from it, or the heaviest of them; plus the margin.
 */
export function splitNeed(engine: BudgetEngine, ym: YM, settings: Pick<SplitSettings, 'basis' | 'margin'>): { charges: number; savings: number; need: number } {
  let charges: number;
  let savings: number;
  if (settings.basis === 'month') {
    const m = engine.month(ym);
    charges = Math.round(m.totals.charges);
    savings = Math.round(m.totals.savings);
  } else {
    const months = Array.from({ length: 12 }, (_, i) => engine.month(addMonths(ym, i)));
    if (settings.basis === 'average') {
      charges = Math.round(months.reduce((a, m) => a + m.totals.charges, 0) / 12);
      savings = Math.round(months.reduce((a, m) => a + m.totals.savings, 0) / 12);
    } else {
      const peak = months.reduce((best, m) => (m.totals.charges + m.totals.savings > best.totals.charges + best.totals.savings ? m : best));
      charges = Math.round(peak.totals.charges);
      savings = Math.round(peak.totals.savings);
    }
  }
  return { charges, savings, need: Math.round((charges + savings) * (1 + settings.margin / 100)) };
}

const sameStep = (a: ContributionStep, b: ContributionStep) =>
  a.mode === b.mode && (a.mode === 'all' || roundCents(Number(a.value) || 0) === roundCents(Number(b.value) || 0));

function collapse(steps: ContributionStep[]): ContributionStep[] {
  const out: ContributionStep[] = [];
  for (const s of sortSteps(steps)) {
    const last = out[out.length - 1];
    if (last && sameStep(last, s)) continue;
    out.push(s);
  }
  return out;
}

/**
 * A member's steps before `ym`. Months before the first step follow that step,
 * so when none is left a seed step keeps what applied before `ym`.
 */
function stepsBefore(p: Person, steps: ContributionStep[], ym: YM): ContributionStep[] {
  const kept = steps.filter((s) => compareYM(s.from, ym) < 0);
  if (kept.length) return kept;
  const prior = steps.length ? stepAt(steps, addMonths(ym, -1))! : { from: ym, mode: 'all' as const };
  const start = windowOf(p).start;
  return [{ ...prior, from: start && compareYM(start, ym) < 0 ? start : addMonths(ym, -1) }];
}

function dropContributionOverridesFrom(p: Person, ym: YM): Person {
  if (!p.contributionOverrides) return p;
  const kept = Object.fromEntries(Object.entries(p.contributionOverrides).filter(([k]) => compareYM(k, ym) < 0));
  const next = { ...p };
  if (Object.keys(kept).length) next.contributionOverrides = kept;
  else delete next.contributionOverrides;
  return next;
}

/**
 * Applies a split method from `from` on: every later month follows it. Month-only
 * contribution exceptions from then on are dropped, they would beat the method.
 */
export function applySplitMethod(model: BudgetModel, from: YM, settings: SplitSettings, today: YM): BudgetModel {
  const next = setRuleFrom(model, from, settings);
  return deriveSplit(
    {
      ...next,
      people: next.people.map((p) => dropContributionOverridesFrom(p, from)),
      extras: { ...next.extras, [SPLIT_KEY]: settings },
    },
    today,
  );
}

/**
 * Contributions set by hand from `from` on: the method stops there and every
 * member keeps, from then on, what they pay in `from`.
 */
export function stopSplitMethod(model: BudgetModel, from: YM): BudgetModel {
  const rules = splitRules(model);
  const governed = splitRuleAt(model, from) !== null || rules.some((r) => r.settings && compareYM(r.from, from) > 0);
  if (!governed) return model;
  const people = model.people.map((p) => {
    const at = stepAt(p.contributions, from);
    if (!at) return p;
    return { ...p, contributions: collapse([...stepsBefore(p, p.contributions ?? [], from), { ...at, from }]) };
  });
  return setRuleFrom({ ...model, people }, from, null);
}

function firstOpenMonth(engine: BudgetEngine, today: YM): YM {
  let firstOpen = today;
  for (let i = 0; i < 36 && engine.isClosed(firstOpen); i++) firstOpen = addMonths(firstOpen, 1);
  return firstOpen;
}

/**
 * A method applied before methods were living only left `splitSettings` and
 * the amounts of that day: every member's contribution from the same month.
 * Those amounts become the living rule from that month on. When the members'
 * contributions no longer start together, one was set by hand since: nothing
 * is adopted, the amounts stay as they are.
 */
export function adoptLegacySplit(model: BudgetModel, today: YM): BudgetModel {
  if (model.extras[SPLIT_RULES_KEY] !== undefined) return model;
  const s = readSplitSettings(model.extras[SPLIT_KEY]);
  if (!s.method) return model;
  const settings: SplitSettings = { method: s.method, margin: s.margin ?? 0, basis: s.basis ?? 'month' };
  const firstOpen = firstOpenMonth(new BudgetEngine(model, today), today);
  // The members still there, each with the last contribution they were given.
  const last = model.people
    .filter((p) => {
      const end = windowOf(p).end;
      return !end || compareYM(end, firstOpen) >= 0;
    })
    .map((p) => sortSteps(p.contributions ?? []).pop());
  if (!last.length) return model;
  const wantedMode = settings.method === 'all' ? 'all' : 'fixed';
  if (last.some((st) => (st?.mode ?? 'all') !== wantedMode)) return model;
  const froms = new Set(last.map((st) => st?.from));
  if (froms.size !== 1) return model;
  const from = last[0]?.from;
  return withRules(model, [{ from: from && isYM(from) ? from : firstOpen, settings }]);
}

/**
 * Writes the contributions of every month a method governs, from the first
 * open month on, up to the next rule or HORIZON_MONTHS ahead for the last one.
 * Returns `model` itself when nothing changes.
 */
export function deriveSplit(input: BudgetModel, today: YM): BudgetModel {
  const model = adoptLegacySplit(input, today);
  const rules = splitRules(model);
  if (!rules.some((r) => r.settings)) return input;
  const engine = new BudgetEngine(model, today);
  const firstOpen = firstOpenMonth(engine, today);

  const steps = new Map(model.people.map((p) => [p.id, sortSteps(p.contributions ?? [])]));
  rules.forEach((rule, i) => {
    const settings = rule.settings;
    if (!settings) return;
    const next = rules[i + 1];
    const start = maxYM(rule.from, firstOpen);
    const end = next ? addMonths(next.from, -1) : addMonths(start, HORIZON_MONTHS - 1);
    const generated = new Map<string, ContributionStep[]>();
    for (let ym = start; compareYM(ym, end) <= 0; ym = addMonths(ym, 1)) {
      const members = model.people.flatMap((p) => {
        const r = resolvePerson(p, ym);
        return r ? [{ id: p.id, salary: r.salary }] : [];
      });
      const amounts = splitContributions(settings.method, members.map((m) => m.salary), splitNeed(engine, ym, settings).need);
      members.forEach((m, k) => {
        const step: ContributionStep = settings.method === 'all' ? { from: ym, mode: 'all' } : { from: ym, mode: 'fixed', value: amounts[k] };
        generated.set(m.id, [...(generated.get(m.id) ?? []), step]);
      });
    }
    for (const p of model.people) {
      const own = generated.get(p.id);
      if (!own) continue;
      const current = steps.get(p.id) ?? [];
      const before = stepsBefore(p, current, start);
      const after = next ? current.filter((s) => compareYM(s.from, end) > 0) : [];
      // Whatever applied right after the method keeps applying.
      const atNext = next && stepAt(current, next.from);
      if (atNext && !after.some((s) => s.from === next.from)) after.unshift({ ...atNext, from: next.from });
      steps.set(p.id, collapse([...before, ...own, ...after]));
    }
  });

  let changed = false;
  const people = model.people.map((p) => {
    const nextSteps = steps.get(p.id) ?? [];
    if (JSON.stringify(sortSteps(p.contributions ?? [])) === JSON.stringify(nextSteps)) return p;
    changed = true;
    return { ...p, contributions: nextSteps };
  });
  return changed ? { ...model, people } : model;
}

export interface SplitShift {
  ym: YM;
  members: Array<{ id: string; name: string; contribution: number; delta: number }>;
}

/**
 * The first month whose contributions the method moved between `prev` and
 * `next` (a charge, a saving or a pay that changed), to tell the household.
 * Null when the rules themselves changed (a method applied or stopped).
 */
export function splitShift(prev: BudgetModel, next: BudgetModel, today: YM): SplitShift | null {
  if (prev === next || !splitRules(next).some((r) => r.settings)) return null;
  if (JSON.stringify(splitRules(adoptLegacySplit(prev, today))) !== JSON.stringify(splitRules(next))) return null;
  const before = new BudgetEngine(prev, today);
  const after = new BudgetEngine(next, today);
  let ym = firstOpenMonth(after, today);
  for (let i = 0; i < HORIZON_MONTHS; i++, ym = addMonths(ym, 1)) {
    if (!splitRuleAt(next, ym)) continue;
    const was = new Map(before.month(ym).people.map((p) => [p.id, p.contribution]));
    const members = after.month(ym).people.map((p) => ({ id: p.id, name: p.name, contribution: p.contribution, delta: roundCents(p.contribution - (was.get(p.id) ?? 0)) }));
    if (members.some((m) => m.delta !== 0)) return { ym, members };
  }
  return null;
}
