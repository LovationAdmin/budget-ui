// src/components/tools/MariageCalculator.tsx
// ============================================================================
// The interactive wedding budget (guests, date, savings, quotes, live total,
// saving plan, breakdown, sticky summary), shared by /budget-mariage and
// /en/wedding-budget-calculator. The state lives in useMariageCalculator so
// the page can fill the example from its hero and its article; every word
// comes from a language file (src/i18n/<lang>/mariage.tsx), every amount goes
// through `format`, and the sums are src/lib/tools/mariage.ts. Nothing is
// sent: the values stay in localStorage.
// ============================================================================

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, Info, RotateCcw, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MoneyInput, Panel, SignupCard, Stepper, Tile } from '@/components/tools/ToolKit';
import type { ToolFormat } from '@/i18n/format';
import { useCalculatorUsed } from '@/lib/analytics';
import {
  DEFAULT_GUESTS, EXAMPLE as DEFAULT_EXAMPLE, MAX_GUESTS, MIN_GUESTS, POSTE_FIELDS, addMonths, clampGuests, computeMariage,
  formatMonthValue, parseMonth, savingPlan, toYearMonth, withFewerGuests,
  type Amounts, type MariageExample, type PosteField, type PosteKey, type YearMonth,
} from '@/lib/tools/mariage';

interface FieldCopy {
  label: string;
  hint?: string;
}

/** The words of the calculator: one object per language (src/i18n/<lang>/mariage.tsx). */
export interface MariageCopy {
  posts: Record<PosteKey, FieldCopy>;
  /** "100 invités", "1 guest". */
  guests: (n: number) => string;
  /** "juin 2027", "June 2027". */
  monthLabel: (ym: YearMonth) => string;
  calculatorLabel: string;
  weddingTitle: string;
  guestsLabel: string;
  guestsHint: string;
  guestsLess: string;
  guestsMore: string;
  minus10: string;
  plus10: string;
  dateLabel: string;
  dateHint: string;
  datePlaceholder: string;
  savedLabel: string;
  savedHint: string;
  postsTitle: string;
  postsIntro: string;
  exampleNote: string;
  exampleExplain: string;
  exampleBadge: string;
  confirmReplace: string;
  morePosts: string;
  /** After a per-guest amount: "€" + "/invité". */
  perGuestUnit: string;
  perGuestHint: (rate: string, guests: string, total: string) => string;
  resultTitle: string;
  emptyResult: string;
  forGuests: (guests: string, honeymoon: boolean) => string;
  tiles: { perGuest: string; perGuestNote: (honeymoon: boolean) => string; guestLinked: string; guestLinkedNote: (share: string | null) => string };
  fixedPart: (amount: string, share: string | null) => ReactNode;
  savingTitle: string;
  perMonth: string;
  plan: (p: { months: number; from: string; to: string; remaining: string; total: string; saved: string | null }) => string;
  covered: string;
  thisMonth: (remaining: string | null) => string;
  past: string;
  noDateAction: string;
  noDateRest: string;
  /** Where two pieces of text meet: end of sentence and space after it (". " by default; "。" and none in Chinese). */
  joints?: { stop: string; space: string };
  fillExampleShort: string;
  breakdownTitle: string;
  perGuestRate: (rate: string) => string;
  /** « Et avec 20 invités de moins ? » */
  fewerTitle: (fewer: number) => string;
  fewerText: (p: { saving: string; total: string; before: string; guests: string }) => ReactNode;
  fewerNoRate: string;
  signup: { title: string; text: (year: number) => string; cta?: string };
  reset: string;
  share: { button: string; copied: string; url: string; title: string; text: string };
  sticky: { label: (example: boolean) => string; details: string };
}

interface Saved {
  guests: number;
  /** Wedding month, "2027-06" (or what a browser without a month picker let the visitor type). */
  date: string;
  /** Already saved, as typed. */
  saved: string;
  /** Postes as typed, by PosteKey. */
  values: Record<string, string>;
  /** The fictitious example was filled in (its values are labelled while they remain). */
  example: boolean;
}

function load(storageKey: string): Saved | null {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const s = JSON.parse(raw) as Partial<Saved>;
    return {
      guests: clampGuests(Number(s.guests ?? DEFAULT_GUESTS)),
      date: typeof s.date === 'string' ? s.date : '',
      saved: typeof s.saved === 'string' ? s.saved : '',
      values: s.values && typeof s.values === 'object' ? s.values : {},
      example: s.example === true,
    };
  } catch {
    return null;
  }
}

const positive = (parse: ToolFormat['parse'], raw: string | undefined) => {
  const n = parse(raw ?? '');
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/** State and actions of the calculator, for the component and for the page around it. */
const JOINTS = { stop: '.', space: ' ' };

export function useMariageCalculator({ t, format: f, storageKey, example: EXAMPLE = DEFAULT_EXAMPLE }: {
  t: MariageCopy;
  format: ToolFormat;
  storageKey: string;
  /** The fictitious example in the visitor's currency (default: the reference one). */
  example?: MariageExample;
}) {
  /** The example as the form shows it. */
  const EXAMPLE_VALUES: Record<string, string> = useMemo(
    () => Object.fromEntries(Object.entries(EXAMPLE.amounts).map(([k, v]) => [k, String(v)])),
    [EXAMPLE],
  );
  const saved = useMemo(() => load(storageKey), [storageKey]);
  const today = useMemo(() => new Date(), []);
  const thisMonth = toYearMonth(today);
  const amount = (raw: string | undefined) => positive(f.parse, raw);
  const [guests, setGuests] = useState<number>(saved?.guests ?? DEFAULT_GUESTS);
  const [date, setDate] = useState(saved?.date ?? '');
  const [already, setAlready] = useState(saved?.saved ?? '');
  const [values, setValues] = useState<Record<string, string>>(saved?.values ?? {});
  const [example, setExample] = useState(saved?.example ?? false);
  const [moreOpen, setMoreOpen] = useState(() => POSTE_FIELDS.some((p) => !p.main && positive(f.parse, saved?.values?.[p.key]) > 0));
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ guests, date, saved: already, values, example } satisfies Saved));
    } catch {
      // Private mode or blocked storage: the calculator still works.
    }
  }, [storageKey, guests, date, already, values, example]);

  const { parse } = f;
  const r = useMemo(
    () => computeMariage(guests, Object.fromEntries(POSTE_FIELDS.map((p) => [p.key, positive(parse, values[p.key])])) as Amounts),
    [guests, values, parse],
  );
  const plan = useMemo(() => savingPlan(r.total, positive(parse, already), date, today), [r.total, already, date, today, parse]);

  const hasTotal = r.total > 0;
  useCalculatorUsed('wedding', hasTotal, r);
  const isExampleValue = (key: string) => example && EXAMPLE_VALUES[key] !== undefined && values[key] === EXAMPLE_VALUES[key];
  const alreadyIsExample = example && already === String(EXAMPLE.saved);
  const exampleLeft = POSTE_FIELDS.some((p) => isExampleValue(p.key)) || alreadyIsExample;
  const wholeExample = example && POSTE_FIELDS.every((p) => (values[p.key] ?? '') === (EXAMPLE_VALUES[p.key] ?? ''));

  // Once every example amount has been replaced, the « fictitious example » labels go for good.
  useEffect(() => {
    if (example && !exampleLeft) setExample(false);
  }, [example, exampleLeft]);

  /** Returns false when the visitor keeps their own amounts. */
  const fillExample = (): boolean => {
    if (hasTotal && !wholeExample && !window.confirm(t.confirmReplace)) return false;
    setGuests(EXAMPLE.guests);
    setValues({ ...EXAMPLE_VALUES });
    setAlready(String(EXAMPLE.saved));
    setDate(formatMonthValue(addMonths(thisMonth, EXAMPLE.monthsAhead)));
    setExample(true);
    setMoreOpen(true);
    return true;
  };

  const reset = () => {
    setGuests(DEFAULT_GUESTS);
    setDate('');
    setAlready('');
    setValues({});
    setExample(false);
    setMoreOpen(false);
  };

  const scrollToResults = () => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return {
    today, thisMonth, guests, setGuests, date, setDate, already, setAlready, values, setValues, moreOpen, setMoreOpen,
    r, plan, fewer: withFewerGuests(r), hasTotal, amount, isExampleValue, alreadyIsExample, exampleLeft,
    /** Year of the wedding (next year until a date is given), for « Mariage 2027 ». */
    projectYear: parseMonth(date)?.year ?? thisMonth.year + 1,
    fillExample, reset, scrollToResults, resultsRef,
  };
}

export type MariageCalc = ReturnType<typeof useMariageCalculator>;

function ExampleBadge({ label }: { label: string }) {
  return (
    <span className="ml-2 inline-block rounded-full bg-warning/15 px-2 py-0.5 align-middle text-xs font-semibold text-foreground">
      {label}
    </span>
  );
}

export function MariageCalculator({ calc, t, format: f, beforeWedding }: {
  calc: MariageCalc;
  t: MariageCopy;
  format: ToolFormat;
  /** Shown at the top of step 1 (the currency choice, in English). */
  beforeWedding?: ReactNode;
}) {
  const {
    thisMonth, guests, setGuests, date, setDate, already, setAlready, values, setValues, moreOpen, setMoreOpen,
    r, plan, fewer, hasTotal, amount, isExampleValue, alreadyIsExample, exampleLeft, projectYear, fillExample, reset,
    scrollToResults, resultsRef,
  } = calc;
  const [resultsVisible, setResultsVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const headlineRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const maxLine = r.lines[0]?.amount ?? 0;

  useEffect(() => {
    const el = headlineRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setResultsVisible(entry.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const set = (key: string) => (v: string) => setValues((prev) => ({ ...prev, [key]: v }));

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: t.share.title, text: t.share.text, url: t.share.url });
        return;
      }
      await navigator.clipboard.writeText(t.share.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Share sheet dismissed.
    }
  };

  const posteHint = (p: PosteField): string | undefined => {
    const rate = amount(values[p.key]);
    if (p.perGuest && rate > 0) return t.perGuestHint(f.moneyExact(rate), t.guests(r.guests), f.money(rate * r.guests));
    return t.posts[p.key].hint;
  };

  return (
    <>
      <section className="px-4 pb-16 sm:px-6 lg:px-8" aria-label={t.calculatorLabel}>
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_400px] lg:items-start">
          <div className="space-y-6">
            <Panel title={t.weddingTitle} step={1}>
              {beforeWedding}
              <div>
                <Stepper
                  label={t.guestsLabel}
                  hint={t.guestsHint}
                  value={guests}
                  min={MIN_GUESTS}
                  max={MAX_GUESTS}
                  onChange={(v) => setGuests(clampGuests(v))}
                  removeLabel={t.guestsLess}
                  addLabel={t.guestsMore}
                />
                <div className="flex justify-end gap-2 pb-2">
                  <button
                    type="button"
                    onClick={() => setGuests((g) => clampGuests(g - 10))}
                    disabled={guests <= MIN_GUESTS}
                    aria-label={t.minus10}
                    className="min-h-[44px] min-w-[44px] rounded-xl border border-border bg-background px-3 text-sm font-semibold tabular-nums text-foreground transition hover:bg-muted disabled:opacity-40"
                  >
                    −10
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuests((g) => clampGuests(g + 10))}
                    disabled={guests >= MAX_GUESTS}
                    aria-label={t.plus10}
                    className="min-h-[44px] min-w-[44px] rounded-xl border border-border bg-background px-3 text-sm font-semibold tabular-nums text-foreground transition hover:bg-muted disabled:opacity-40"
                  >
                    +10
                  </button>
                </div>
              </div>
              <div className="py-2">
                <label htmlFor="mariage-date" className="block font-medium text-foreground">{t.dateLabel}</label>
                <p id="mariage-date-hint" className="text-sm text-muted-foreground">{t.dateHint}</p>
                <input
                  ref={dateRef}
                  id="mariage-date"
                  type="month"
                  min={formatMonthValue(thisMonth)}
                  placeholder={t.datePlaceholder}
                  value={date}
                  aria-describedby="mariage-date-hint"
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1.5 block h-12 w-full rounded-xl border border-input bg-background px-4 text-lg text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                />
              </div>
              <MoneyInput
                id="mariage-epargne"
                label={<>{t.savedLabel}{alreadyIsExample && <ExampleBadge label={t.exampleBadge} />}</>}
                hint={t.savedHint}
                value={already}
                onChange={setAlready}
                suffix={f.symbol}
              />
            </Panel>

            <Panel title={t.postsTitle} step={2}>
              <p className="py-2 text-sm text-muted-foreground">{t.postsIntro}</p>
              {exampleLeft && (
                <p className="flex items-start gap-2 py-3 text-sm text-foreground">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                  <span>
                    <strong>{t.exampleNote}{(t.joints ?? JOINTS).stop}</strong>{(t.joints ?? JOINTS).space}{t.exampleExplain}
                  </span>
                </p>
              )}
              {POSTE_FIELDS.filter((p) => p.main || moreOpen).map((p) => (
                <MoneyInput
                  key={p.key}
                  id={`poste-${p.key}`}
                  label={<>{t.posts[p.key].label}{isExampleValue(p.key) && <ExampleBadge label={t.exampleBadge} />}</>}
                  hint={posteHint(p)}
                  value={values[p.key] ?? ''}
                  onChange={set(p.key)}
                  suffix={p.perGuest ? `${f.symbol}${t.perGuestUnit}` : f.symbol}
                />
              ))}
              {!moreOpen && (
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => setMoreOpen(true)}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl px-2 text-left font-semibold text-primary hover:underline"
                  >
                    <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" /> {t.morePosts}
                  </button>
                </div>
              )}
            </Panel>
          </div>

          <div ref={resultsRef} id="resultat" className="scroll-mt-24">
            <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
              <div aria-live="polite">
                <div ref={headlineRef}>
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t.resultTitle}</p>
                  {hasTotal ? (
                    <p className="mt-2 font-display text-5xl font-bold tabular-nums text-foreground">{f.money(r.total)}</p>
                  ) : (
                    <p className="mt-3 text-muted-foreground">{t.emptyResult}</p>
                  )}
                </div>

                {hasTotal && (
                  <>
                    <p className="mt-1 text-sm text-muted-foreground">{t.forGuests(t.guests(r.guests), r.voyage > 0)}</p>
                    {exampleLeft && (
                      <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-foreground">
                        <Info className="h-3.5 w-3.5" aria-hidden="true" /> {t.exampleNote}
                      </p>
                    )}

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <Tile label={t.tiles.perGuest} value={f.money(r.costPerGuest)} note={t.tiles.perGuestNote(r.voyage > 0)} />
                      <Tile
                        label={t.tiles.guestLinked}
                        value={f.money(r.perGuestTotal)}
                        note={t.tiles.guestLinkedNote(r.perGuestShare !== null ? f.pct(r.perGuestShare) : null)}
                      />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t.fixedPart(f.money(r.fixedTotal), r.perGuestShare !== null ? f.pct(1 - r.perGuestShare) : null)}
                    </p>

                    <div className="mt-5 rounded-xl border border-border/70 p-4">
                      <p className="text-sm font-semibold text-foreground">{t.savingTitle}</p>
                      {plan.status === 'ok' && plan.from && plan.to && (
                        <>
                          <p className="mt-1 font-display text-3xl font-bold tabular-nums text-foreground">
                            {f.money(plan.monthly ?? 0)}<span className="ml-1 text-base font-semibold text-muted-foreground">{t.perMonth}</span>
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {t.plan({
                              months: plan.months,
                              from: t.monthLabel(plan.from),
                              to: t.monthLabel(plan.to),
                              remaining: f.money(plan.remaining),
                              total: f.money(r.total),
                              saved: amount(already) > 0 ? f.money(amount(already)) : null,
                            })}
                          </p>
                        </>
                      )}
                      {plan.status === 'covered' && (
                        <p className="mt-1 flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                          {t.covered}
                        </p>
                      )}
                      {plan.status === 'this-month' && (
                        <p className="mt-1 flex items-start gap-2 text-sm text-muted-foreground">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                          {t.thisMonth(plan.remaining > 0 ? f.money(plan.remaining) : null)}
                        </p>
                      )}
                      {plan.status === 'past' && (
                        <p className="mt-1 flex items-start gap-2 text-sm text-muted-foreground">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                          {t.past}
                        </p>
                      )}
                      {plan.status === 'no-date' && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          <button type="button" onClick={() => dateRef.current?.focus()} className="font-medium text-primary hover:underline">
                            {t.noDateAction}
                          </button>{(t.joints ?? JOINTS).space}
                          {t.noDateRest}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {!hasTotal && (
                <Button type="button" variant="outline" className="mt-4 min-h-[44px] w-full" onClick={fillExample}>
                  <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" /> {t.fillExampleShort}
                </Button>
              )}

              {r.lines.length > 0 && (
                <div className="mt-5">
                  <h3 className="text-sm font-semibold text-foreground">{t.breakdownTitle}</h3>
                  <ul className="mt-3 space-y-3">
                    {r.lines.map((l) => (
                      <li key={l.key}>
                        <div className="flex items-baseline justify-between gap-3 text-sm">
                          <span className="text-foreground">
                            {t.posts[l.key].label}
                            {l.perGuest && l.rate !== undefined && (
                              <span className="text-muted-foreground">{t.perGuestRate(f.moneyExact(l.rate))}</span>
                            )}
                          </span>
                          <span className="shrink-0 tabular-nums text-muted-foreground">
                            <strong className="font-semibold text-foreground">{f.money(l.amount)}</strong> · {f.pct(l.share)}
                          </span>
                        </div>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${maxLine > 0 ? (l.amount / maxLine) * 100 : 0}%` }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {hasTotal && fewer.fewer > 0 && (
                <div className="mt-5 rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">{t.fewerTitle(fewer.fewer)}</p>
                  {r.ratePerGuest > 0 ? (
                    <p className="mt-1">
                      {t.fewerText({ saving: f.money(fewer.saving), total: f.money(fewer.total), before: f.money(r.total), guests: t.guests(fewer.guests) })}
                    </p>
                  ) : (
                    <p className="mt-1">{t.fewerNoRate}</p>
                  )}
                </div>
              )}

              <SignupCard title={t.signup.title} text={t.signup.text(projectYear)} cta={t.signup.cta} />

              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" variant="ghost" className="min-h-[44px]" onClick={reset}>
                  <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" /> {t.reset}
                </Button>
                <Button type="button" variant="ghost" className="min-h-[44px]" onClick={share}>
                  <Share2 className="mr-2 h-4 w-4" aria-hidden="true" /> {copied ? t.share.copied : t.share.button}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The results card scrolls away while filling the form: this bar keeps the figure in sight. */}
      {hasTotal && !resultsVisible && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-md items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">{t.sticky.label(exampleLeft)}</p>
              <p className="text-xl font-bold tabular-nums text-foreground">
                {f.money(r.total)}
                {plan.status === 'ok' && (
                  <span className="text-sm font-medium text-muted-foreground"> · {f.money(plan.monthly ?? 0)}{t.perMonth}</span>
                )}
              </p>
            </div>
            <Button type="button" onClick={scrollToResults} className="min-h-[44px]">{t.sticky.details}</Button>
          </div>
        </div>
      )}
    </>
  );
}
