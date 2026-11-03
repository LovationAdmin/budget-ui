// src/components/tools/CoupleCalculator.tsx
// ============================================================================
// The interactive couple budget split (/budget-couple): both net incomes, the
// shared charges, a method, then what each partner pays into the joint
// account and keeps, live, with the three methods side by side so the choice
// is made by looking, not by reading. Every word comes from a language file
// (src/i18n/<lang>/couple.tsx), every amount goes through `format`, and the
// split itself is src/lib/tools/couple.ts. Nothing is sent: the values stay
// in localStorage.
// ============================================================================

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Info, RotateCcw, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MoneyInput, Panel, Segmented, SignupCard, Tile } from '@/components/tools/ToolKit';
import type { ToolFormat } from '@/i18n/format';
import { useCalculatorUsed } from '@/lib/analytics';
import { COUPLE_METHODS, compareMethods, type CoupleInput, type CoupleMethod } from '@/lib/tools/couple';

export const CHARGE_KEYS = ['logement', 'energie', 'courses', 'assurances', 'abonnements', 'enfants', 'epargne', 'autres'] as const;
export type ChargeKey = (typeof CHARGE_KEYS)[number];

interface FieldCopy {
  label: string;
  hint?: string;
}

/** The words of the calculator: one object per language (src/i18n/<lang>/couple.tsx). */
export interface CoupleCopy {
  calculatorLabel: string;
  incomesTitle: string;
  seeExample: string;
  /** Default name of partner i (0 or 1). */
  partnerName: (i: number) => string;
  nameLabel: (i: number) => string;
  incomeLabel: string;
  incomeHint: string;
  chargesTitle: string;
  charges: Record<ChargeKey, FieldCopy>;
  chargesNote: string;
  methodTitle: string;
  methodLegend: string;
  methods: Record<CoupleMethod, { label: string; hint: string; short: string }>;
  methodHelp: Record<CoupleMethod, string>;
  /** After amount fields: "€" + "/mois". */
  perMonth: string;
  resultTitle: string;
  emptyResult: string;
  shareDetail: (ratio: string, effort: string | null) => string;
  keeps: (amount: string) => string;
  fallback: string;
  shortfall: (amount: string) => string;
  compareTitle: string;
  compareCaption: string;
  comparePays: string;
  compareKeeps: string;
  compareChoose: (method: string) => string;
  tiles: { incomes: string; shared: string; left: string };
  potTip: string;
  signup: { title: string; text: string; cta?: string };
  reset: string;
  share: { button: string; copied: string; url: string; title: string; text: string };
  sticky: { title: string; details: string };
}

interface Saved { names: [string, string]; incomes: [string, string]; method: CoupleMethod; values: Record<string, string> }

function load(storageKey: string): Saved | null {
  try {
    const raw = localStorage.getItem(storageKey);
    const v = raw ? (JSON.parse(raw) as Partial<Saved>) : null;
    if (!v || !Array.isArray(v.names) || !Array.isArray(v.incomes) || !COUPLE_METHODS.includes(v.method as CoupleMethod)) return null;
    return { names: [String(v.names[0] ?? ''), String(v.names[1] ?? '')], incomes: [String(v.incomes[0] ?? ''), String(v.incomes[1] ?? '')], method: v.method as CoupleMethod, values: v.values ?? {} };
  } catch {
    return null;
  }
}

const positive = (parse: ToolFormat['parse'], raw: string | undefined) => {
  const n = parse(raw ?? '');
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export function CoupleCalculator({ t, format: f, storageKey, example, beforeIncomes }: {
  t: CoupleCopy;
  format: ToolFormat;
  /** localStorage key of the visitor's values, one per page. */
  storageKey: string;
  /** Filled by « see the example » (charges in CHARGE_KEYS order). */
  example: CoupleInput;
  /** Shown at the top of step 1 (the currency choice). */
  beforeIncomes?: ReactNode;
}) {
  const saved = useMemo(() => load(storageKey), [storageKey]);
  const [names, setNames] = useState<[string, string]>(saved?.names ?? [t.partnerName(0), t.partnerName(1)]);
  const [incomes, setIncomes] = useState<[string, string]>(saved?.incomes ?? ['', '']);
  const [method, setMethod] = useState<CoupleMethod>(saved?.method ?? 'prorata');
  const [values, setValues] = useState<Record<string, string>>(saved?.values ?? {});
  const [resultsVisible, setResultsVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ names, incomes, method, values }));
    } catch {
      // Private mode or blocked storage: the calculator still works.
    }
  }, [storageKey, names, incomes, method, values]);

  useEffect(() => {
    const el = headlineRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setResultsVisible(entry.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const { parse } = f;
  const all = useMemo(() => compareMethods({
    partners: [0, 1].map((i) => ({ name: names[i].trim() || t.partnerName(i), income: positive(parse, incomes[i]) })) as CoupleInput['partners'],
    charges: CHARGE_KEYS.map((k) => positive(parse, values[k])),
  }), [names, incomes, values, parse, t]);
  const r = all[method];

  const set = (key: string) => (v: string) => setValues((prev) => ({ ...prev, [key]: v }));
  const setName = (i: number, v: string) => setNames((ns) => (i === 0 ? [v, ns[1]] : [ns[0], v]));
  const setIncome = (i: number) => (v: string) => setIncomes((xs) => (i === 0 ? [v, xs[1]] : [xs[0], v]));
  const hasData = r.shared > 0;
  useCalculatorUsed('couple_split', hasData, r);
  const maxShare = Math.max(0, ...r.shares.map((s) => s.contribution));
  const perMonth = `${f.symbol}${t.perMonth}`;
  const bothIncomes = r.shares.every((s) => s.income > 0);

  const fillExample = () => {
    setMethod(example.method);
    setNames([example.partners[0].name, example.partners[1].name]);
    setIncomes([String(example.partners[0].income), String(example.partners[1].income)]);
    setValues(Object.fromEntries(example.charges.flatMap((c, i) => (c > 0 && CHARGE_KEYS[i] ? [[CHARGE_KEYS[i], String(c)]] : []))));
  };
  const reset = () => {
    setNames([t.partnerName(0), t.partnerName(1)]);
    setIncomes(['', '']);
    setMethod('prorata');
    setValues({});
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

  const methods = COUPLE_METHODS.map((value) => ({ value, label: t.methods[value].label, hint: t.methods[value].hint }));

  return (
    <>
      <section className="px-4 pb-16 sm:px-6 lg:px-8" aria-label={t.calculatorLabel}>
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_400px] lg:items-start">
          <div className="space-y-6">
            <Panel
              title={t.incomesTitle}
              step={1}
              aside={<button type="button" onClick={fillExample} className="min-h-[44px] rounded-xl px-2 text-sm font-semibold text-primary hover:underline">{t.seeExample}</button>}
            >
              {beforeIncomes}
              <div className="grid gap-x-6 sm:grid-cols-2">
                {[0, 1].map((i) => (
                  <div key={i} className="py-3">
                    <label htmlFor={`partner-${i}`} className="block text-sm font-medium text-foreground">{t.nameLabel(i)}</label>
                    <input
                      id={`partner-${i}`}
                      type="text"
                      autoComplete="off"
                      maxLength={24}
                      value={names[i]}
                      onChange={(e) => setName(i, e.target.value)}
                      className="mt-1.5 h-12 w-full rounded-xl border border-input bg-background px-4 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                    />
                    <MoneyInput id={`income-${i}`} label={<span className="text-sm">{t.incomeLabel}</span>} suffix={perMonth} value={incomes[i]} onChange={setIncome(i)} />
                  </div>
                ))}
              </div>
              <p className="pt-3 text-sm text-muted-foreground">{t.incomeHint}</p>
            </Panel>

            <Panel title={t.chargesTitle} step={2}>
              {CHARGE_KEYS.map((k) => (
                <MoneyInput key={k} id={`charge-${k}`} label={t.charges[k].label} hint={t.charges[k].hint} suffix={perMonth} value={values[k] ?? ''} onChange={set(k)} />
              ))}
              <p className="pt-3 text-sm text-muted-foreground">{t.chargesNote}</p>
            </Panel>

            <Panel title={t.methodTitle} step={3}>
              <Segmented label={t.methodLegend} value={method} options={methods} onChange={setMethod} />
              <p className="flex items-start gap-2 pt-3 text-sm text-muted-foreground"><Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> {t.methodHelp[method]}</p>
            </Panel>
          </div>

          <div ref={resultsRef} id="resultat" className="scroll-mt-24">
            <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6" aria-live="polite">
              <div ref={headlineRef}>
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t.resultTitle}</p>
                {!hasData && <p className="mt-3 text-muted-foreground">{t.emptyResult}</p>}
              </div>
              {hasData && (
                <>
                  <ul className="mt-4 space-y-4">
                    {r.shares.map((s, i) => (
                      <li key={i}>
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="truncate font-semibold text-foreground">{s.name}</span>
                          <span className="font-display text-2xl font-bold tabular-nums text-foreground">{f.moneyExact(s.contribution)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{t.shareDetail(f.pct(s.ratio), s.effort === null ? null : f.pct(s.effort))}</p>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${maxShare > 0 ? (s.contribution / maxShare) * 100 : 0}%` }} />
                        </div>
                        {s.income > 0 && (
                          <p className={`mt-1.5 text-sm font-medium tabular-nums ${s.keeps < 0 ? 'text-destructive' : 'text-foreground'}`}>{t.keeps(f.moneyExact(s.keeps))}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                  {r.fallback && <p className="mt-4 rounded-xl bg-warning/10 p-3 text-sm text-foreground">{t.fallback}</p>}
                  {r.shortfall > 0 && <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-foreground">{t.shortfall(f.moneyExact(r.shortfall))}</p>}

                  {bothIncomes && (
                    <div className="mt-5">
                      <p className="text-sm font-semibold text-foreground">{t.compareTitle}</p>
                      <table className="mt-2 w-full text-left text-sm">
                        <caption className="sr-only">{t.compareCaption}</caption>
                        <thead>
                          <tr className="text-xs text-muted-foreground">
                            <th scope="col" className="py-1 pr-2 font-medium"><span className="sr-only">{t.methodLegend}</span></th>
                            {r.shares.map((s, i) => (
                              <th key={i} scope="col" className="max-w-[7rem] truncate py-1 pl-2 text-right font-medium">{s.name}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {COUPLE_METHODS.map((m) => {
                            const active = m === method;
                            return (
                              <tr key={m} className={`border-t border-border/60 ${active ? 'bg-primary/10' : ''}`}>
                                <th scope="row" className="py-1.5 pr-2 font-normal">
                                  <button
                                    type="button"
                                    onClick={() => setMethod(m)}
                                    aria-pressed={active}
                                    aria-label={t.compareChoose(t.methods[m].label)}
                                    className={`min-h-[44px] text-left ${active ? 'font-semibold text-foreground' : 'text-primary hover:underline'}`}
                                  >
                                    {t.methods[m].short}
                                  </button>
                                </th>
                                {all[m].shares.map((s, i) => (
                                  <td key={i} className="py-1.5 pl-2 text-right tabular-nums">
                                    <span className="block whitespace-nowrap font-semibold text-foreground">{t.comparePays} {f.money(s.contribution)}</span>
                                    <span className={`block whitespace-nowrap text-xs ${s.keeps < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>{t.compareKeeps} {f.money(s.keeps)}</span>
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <Tile label={t.tiles.incomes} value={f.money(r.incomes)} />
                    <Tile label={t.tiles.shared} value={f.money(r.shared)} />
                    <Tile label={t.tiles.left} value={f.money(r.left)} />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">{t.potTip}</p>
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

      {hasData && !resultsVisible && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-md items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{t.sticky.title}</p>
              <p className="truncate text-sm font-semibold tabular-nums text-foreground">
                {r.shares.map((s) => `${s.name} ${f.moneyExact(s.contribution)}`).join(' · ')}
              </p>
            </div>
            <Button type="button" onClick={() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="min-h-[44px] shrink-0">{t.sticky.details}</Button>
          </div>
        </div>
      )}
    </>
  );
}
