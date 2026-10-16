// src/components/tools/ResteAVivreCalculator.tsx
// ============================================================================
// The interactive leftover-income calculator (household, income, fixed bills,
// live result, sticky summary), shared by /calcul-reste-a-vivre and
// /en/leftover-income-calculator. Every word comes from a language file
// (src/i18n/<lang>/resteAVivre.tsx), every amount goes through `format`, and
// the arithmetic is src/lib/tools/resteAVivre.ts. Nothing is sent: the values
// stay in localStorage.
// ============================================================================

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, Info, RotateCcw, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MoneyInput, Panel, SignupCard, Stepper, Tile } from '@/components/tools/ToolKit';
import type { ToolFormat } from '@/i18n/format';
import { useCalculatorUsed } from '@/lib/analytics';
import {
  CHARGE_FIELDS, INCOME_FIELDS, computeResteAVivre, type ChargeKey, type Household, type IncomeKey,
} from '@/lib/tools/resteAVivre';

interface FieldCopy {
  label: string;
  hint?: string;
}

/** The words of the calculator: one object per language (src/i18n/<lang>/resteAVivre.tsx). */
export interface RavCopy {
  calculatorLabel: string;
  seeExample: string;
  householdTitle: string;
  adults: string;
  kidsUnder14: string;
  teens: FieldCopy;
  stepper: { remove: (label: string) => string; add: (label: string) => string };
  incomesTitle: string;
  incomes: Record<IncomeKey, FieldCopy>;
  chargesTitle: string;
  charges: Record<ChargeKey, FieldCopy>;
  moreCharges: string;
  chargesNote: string;
  /** After amount fields and the result: "€" + "/mois". */
  perMonth: string;
  resultTitle: string;
  emptyResult: string;
  deficit: (amount: string) => string;
  after: (charges: string, income: string) => string;
  deficitHelp: ReactNode;
  tiles: {
    perPerson: string;
    persons: (n: number) => string;
    perDay: string;
    perDayNote: string;
    perUnit: string;
    units: (n: number) => string;
  };
  chargesShare: { label: string; ofIncome: (pct: string) => string; aria: (pct: string) => string };
  debt: { title: (pct: string) => string; note: (ratio: number) => { text: string; tone: 'ok' | 'warn' | 'info' } };
  /** The legal floor where there is one (France). */
  floor?: (persons: number, amount: string) => ReactNode;
  signup: { title: string; text: string; cta?: string };
  reset: string;
  share: { button: string; copied: string; url: string; title: string; text: string };
  sticky: { label: string; details: string };
}

export interface RavExample {
  household: Household;
  incomes: Partial<Record<IncomeKey, number>>;
  charges: Partial<Record<ChargeKey, number>>;
}

const DEFAULT_HOUSEHOLD: Household = { adults: 2, kidsUnder14: 0, teens14plus: 0 };

interface Saved {
  household: Household;
  values: Record<string, string>;
}

function load(storageKey: string): Saved | null {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

const TONE_ICON = {
  ok: <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />,
  warn: <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />,
  info: <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />,
};

export function ResteAVivreCalculator({ t, format: f, storageKey, example, beforeHousehold }: {
  t: RavCopy;
  format: ToolFormat;
  /** localStorage key of the visitor's values, one per page. */
  storageKey: string;
  /** Filled by « see the example ». */
  example: RavExample;
  /** Shown at the top of step 1 (the currency choice, in English). */
  beforeHousehold?: ReactNode;
}) {
  const amount = (raw: string | undefined) => {
    const n = f.parse(raw ?? '');
    return Number.isFinite(n) && n > 0 ? n : 0;
  };
  const saved = useMemo(() => load(storageKey), [storageKey]);
  const [household, setHousehold] = useState<Household>(saved?.household ?? DEFAULT_HOUSEHOLD);
  const [values, setValues] = useState<Record<string, string>>(saved?.values ?? {});
  const [moreOpen, setMoreOpen] = useState(() => CHARGE_FIELDS.some((c) => !c.main && amount(saved?.values?.[`chg.${c.key}`]) > 0));
  const [resultsVisible, setResultsVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ household, values }));
    } catch {
      // Private mode or blocked storage: the calculator still works.
    }
  }, [storageKey, household, values]);

  useEffect(() => {
    const el = headlineRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setResultsVisible(entry.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const { parse } = f;
  const r = useMemo(() => {
    const read = (raw: string | undefined) => {
      const n = parse(raw ?? '');
      return Number.isFinite(n) && n > 0 ? n : 0;
    };
    return computeResteAVivre(
      household,
      Object.fromEntries(INCOME_FIELDS.map((c) => [c.key, read(values[`inc.${c.key}`])])),
      Object.fromEntries(CHARGE_FIELDS.map((c) => [c.key, read(values[`chg.${c.key}`])])),
    );
  }, [household, values, parse]);

  const set = (key: string) => (v: string) => setValues((prev) => ({ ...prev, [key]: v }));
  const hasIncome = r.revenus > 0;
  useCalculatorUsed('reste_a_vivre', hasIncome, r);
  const deficit = r.reste < 0;
  const perMonth = `${f.symbol}${t.perMonth}`;

  const fillExample = () => {
    setHousehold(example.household);
    setValues({
      ...Object.fromEntries(Object.entries(example.incomes).map(([k, v]) => [`inc.${k}`, String(v)])),
      ...Object.fromEntries(Object.entries(example.charges).map(([k, v]) => [`chg.${k}`, String(v)])),
    });
    setMoreOpen(CHARGE_FIELDS.some((c) => !c.main && (example.charges[c.key] ?? 0) > 0));
  };
  const reset = () => {
    setValues({});
    setHousehold(DEFAULT_HOUSEHOLD);
    setMoreOpen(false);
  };
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

  const stepper = (label: string) => ({ label, removeLabel: t.stepper.remove(label), addLabel: t.stepper.add(label) });
  const debt = r.debtRatio !== null ? t.debt.note(r.debtRatio) : null;

  return (
    <>
      <section className="px-4 pb-16 sm:px-6 lg:px-8" aria-label={t.calculatorLabel}>
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_400px] lg:items-start">
          <div className="space-y-6">
            <Panel
              title={t.householdTitle}
              step={1}
              aside={<button type="button" onClick={fillExample} className="min-h-[44px] rounded-xl px-2 text-sm font-semibold text-primary hover:underline">{t.seeExample}</button>}
            >
              {beforeHousehold}
              <Stepper {...stepper(t.adults)} value={household.adults} min={1} onChange={(v) => setHousehold((h) => ({ ...h, adults: v }))} />
              <Stepper {...stepper(t.kidsUnder14)} value={household.kidsUnder14} min={0} onChange={(v) => setHousehold((h) => ({ ...h, kidsUnder14: v }))} />
              <Stepper {...stepper(t.teens.label)} hint={t.teens.hint} value={household.teens14plus} min={0} onChange={(v) => setHousehold((h) => ({ ...h, teens14plus: v }))} />
            </Panel>

            <Panel title={t.incomesTitle} step={2}>
              {INCOME_FIELDS.map((c) => (
                <MoneyInput key={c.key} id={`inc-${c.key}`} label={t.incomes[c.key].label} hint={t.incomes[c.key].hint} suffix={perMonth} value={values[`inc.${c.key}`] ?? ''} onChange={set(`inc.${c.key}`)} />
              ))}
            </Panel>

            <Panel title={t.chargesTitle} step={3}>
              {CHARGE_FIELDS.filter((c) => c.main || moreOpen).map((c) => (
                <MoneyInput key={c.key} id={`chg-${c.key}`} label={t.charges[c.key].label} hint={t.charges[c.key].hint} suffix={perMonth} value={values[`chg.${c.key}`] ?? ''} onChange={set(`chg.${c.key}`)} />
              ))}
              {!moreOpen && (
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => setMoreOpen(true)}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl px-2 font-semibold text-primary hover:underline"
                  >
                    <ChevronDown className="h-4 w-4" aria-hidden="true" /> {t.moreCharges}
                  </button>
                </div>
              )}
              <p className="pt-3 text-sm text-muted-foreground">{t.chargesNote}</p>
            </Panel>
          </div>

          <div ref={resultsRef} id="resultat" className="scroll-mt-24">
            <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6" aria-live="polite">
              <div ref={headlineRef}>
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t.resultTitle}</p>
                {hasIncome ? (
                  <p className={`mt-2 font-display text-5xl font-bold tabular-nums ${deficit ? 'text-destructive' : 'text-foreground'}`}>
                    {f.money(r.reste)}<span className="ml-1 text-lg font-semibold text-muted-foreground">{t.perMonth}</span>
                  </p>
                ) : (
                  <p className="mt-3 text-muted-foreground">{t.emptyResult}</p>
                )}
              </div>
              {hasIncome && (
                <>
                  {deficit ? (
                    <p className="mt-2 flex items-start gap-2 text-sm font-medium text-destructive">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      {t.deficit(f.money(-r.reste))}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">{t.after(f.money(r.charges), f.money(r.revenus))}</p>
                  )}

                  {deficit ? (
                    <div className="mt-5 rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">{t.deficitHelp}</div>
                  ) : (
                    <div className="mt-5 grid grid-cols-3 gap-2">
                      <Tile label={t.tiles.perPerson} value={f.money(r.parPersonne)} note={t.tiles.persons(r.persons)} />
                      <Tile label={t.tiles.perDay} value={f.money(r.parJour)} note={t.tiles.perDayNote} />
                      <Tile label={t.tiles.perUnit} value={f.money(r.parUnite)} note={t.tiles.units(r.units)} />
                    </div>
                  )}

                  {r.chargesShare !== null && (
                    <div className="mt-5">
                      <div className="flex items-baseline justify-between text-sm">
                        <span className="font-medium text-foreground">{t.chargesShare.label}</span>
                        <span className="tabular-nums text-muted-foreground">{t.chargesShare.ofIncome(f.pct(r.chargesShare))}</span>
                      </div>
                      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted" role="img" aria-label={t.chargesShare.aria(f.pct(r.chargesShare))}>
                        <div className={`h-full rounded-full ${deficit ? 'bg-destructive' : 'bg-primary'}`} style={{ width: `${Math.min(100, r.chargesShare * 100)}%` }} />
                      </div>
                    </div>
                  )}

                  {r.debtRatio !== null && debt && (
                    <div className="mt-4 rounded-xl border border-border/70 p-3 text-sm">
                      <p className="font-medium text-foreground">{t.debt.title(f.pct(r.debtRatio))}</p>
                      <p className="mt-1 flex items-start gap-1.5 text-muted-foreground">
                        {TONE_ICON[debt.tone]}
                        <span>{debt.text}</span>
                      </p>
                    </div>
                  )}

                  {t.floor && <p className="mt-4 text-sm text-muted-foreground">{t.floor(r.persons, f.moneyExact(r.floor))}</p>}
                </>
              )}

              <SignupCard title={t.signup.title} text={t.signup.text} cta={t.signup.cta} />

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

      {/* The results card scrolls away while filling the form (html/body clip overflow-x, so sticky is inert): this bar keeps the figure in sight. */}
      {hasIncome && !resultsVisible && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-md items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">{t.sticky.label}</p>
              <p className={`text-xl font-bold tabular-nums ${deficit ? 'text-destructive' : 'text-foreground'}`}>{f.money(r.reste)}<span className="text-sm font-medium text-muted-foreground"> {t.perMonth}</span></p>
            </div>
            <Button type="button" onClick={() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="min-h-[44px]">{t.sticky.details}</Button>
          </div>
        </div>
      )}
    </>
  );
}
