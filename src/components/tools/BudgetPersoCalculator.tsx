// src/components/tools/BudgetPersoCalculator.tsx
// ============================================================================
// The interactive 50/30/20 calculator (form, live result, sticky summary),
// shared by /budget-personnel and /en/50-30-20-budget-calculator. Every word
// comes from a language file (src/i18n/<lang>/budgetPerso.tsx) and every
// amount goes through `format`: the markup and the rule (budgetPerso.ts) stay
// the same in each language. Nothing is sent: the values stay in localStorage.
// ============================================================================

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, Info, RotateCcw, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ToolFormat } from '@/i18n/format';
import { MoneyInput, Panel, SignupCard, Tile } from '@/components/tools/ToolKit';
import {
  FULL_SAVINGS_MAX_NEEDS_SHARE, INCOME_FIELDS, NEED_FIELDS, RULE, computeBudgetPerso,
  type BudgetPerso, type IncomeKey, type NeedKey,
} from '@/lib/tools/budgetPerso';

interface FieldCopy {
  label: string;
  hint?: string;
}

/** The words of the calculator: one object per language (src/i18n/<lang>/budgetPerso.tsx). */
export interface BudgetPersoCopy {
  incomes: Record<IncomeKey, FieldCopy>;
  needs: Record<NeedKey, FieldCopy>;
  /** Fictitious example filled by « see the example ». */
  example: { incomes: Partial<Record<IncomeKey, number>>; needs: Partial<Record<NeedKey, number>> };
  calculatorLabel: string;
  incomeTitle: string;
  seeExample: string;
  needsTitle: string;
  needsIntro: string;
  moreNeeds: string;
  annualNote: string;
  savingsTitle: string;
  optional: string;
  savingsLabel: string;
  savingsHint: string;
  resultTitle: string;
  perMonth: string;
  emptyResult: string;
  deficit: (gap: string) => string;
  summary: (income: string, needs: string) => string;
  needsShare: (share: string, within: boolean) => ReactNode;
  labels: { needs: string; wants: string; savings: string; margin: string };
  comparison: { rule: string; yours: string; caption: string; item: string; benchmark: string };
  deficitHelp: { title: string; intro: string; items: ReactNode[] };
  tiles: { wantsPerDay: string; ofIncome: (share: string) => string; perDayNote: string };
  within: (margin: string | null) => ReactNode;
  trimmed: (maxNeedsShare: string) => ReactNode;
  shared: (needsShare: string, savings: string) => ReactNode;
  howSplit: string;
  /** Id of the section that explains the rule, on the same page. */
  ruleAnchor: string;
  current: (saved: string, share: string) => ReactNode;
  currentOver: string;
  currentGap: (gap: string) => string;
  currentReached: string;
  signup: { title: string; text: string; cta?: string };
  reset: string;
  share: { button: string; copied: string; url: string; title: string; text: string };
  sticky: { label: string; details: string };
}

const COLORS = { besoins: 'bg-primary', envies: 'bg-sky-400', epargne: 'bg-success', marge: 'bg-success/30', deficit: 'bg-destructive' };

/** Stacked bar, decorative: the table under it carries the same figures as text. */
function StackedBar({ label, parts }: { label: string; parts: Array<{ key: string; share: number; className: string }> }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 flex h-3 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        {parts.filter((p) => p.share > 0).map((p) => (
          <div key={p.key} className={`h-full ${p.className}`} style={{ width: `${Math.min(100, p.share * 100)}%` }} />
        ))}
      </div>
    </div>
  );
}

function Comparison({ r, t, f }: { r: BudgetPerso; t: BudgetPersoCopy; f: ToolFormat }) {
  const share = (n: number) => (r.revenus > 0 ? n / r.revenus : 0);
  const deficit = r.status === 'deficit';
  const rows = [
    { key: 'besoins', label: t.labels.needs, ref: r.regle.besoins, refPct: RULE.besoins, you: r.besoins },
    { key: 'envies', label: t.labels.wants, ref: r.regle.envies, refPct: RULE.envies, you: r.envies },
    { key: 'epargne', label: t.labels.savings, ref: r.regle.epargne, refPct: RULE.epargne, you: r.epargne },
  ];
  return (
    <div className="mt-5 space-y-3">
      <StackedBar
        label={t.comparison.rule}
        parts={[
          { key: 'besoins', share: RULE.besoins, className: COLORS.besoins },
          { key: 'envies', share: RULE.envies, className: COLORS.envies },
          { key: 'epargne', share: RULE.epargne, className: COLORS.epargne },
        ]}
      />
      <StackedBar
        label={t.comparison.yours}
        parts={deficit ? [{ key: 'besoins', share: 1, className: COLORS.deficit }] : [
          { key: 'besoins', share: share(r.besoins), className: COLORS.besoins },
          { key: 'envies', share: share(r.envies), className: COLORS.envies },
          { key: 'epargne', share: share(r.epargne), className: COLORS.epargne },
          { key: 'marge', share: share(r.marge), className: COLORS.marge },
        ]}
      />
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{t.comparison.caption}</caption>
        <thead>
          <tr className="border-b border-border text-xs text-muted-foreground">
            <th scope="col" className="py-1.5 font-medium">{t.comparison.item}</th>
            <th scope="col" className="py-1.5 text-right font-medium">{t.comparison.benchmark}</th>
            <th scope="col" className="py-1.5 text-right font-medium">{t.comparison.yours}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {rows.map((row) => (
            <tr key={row.key}>
              <th scope="row" className="py-2 font-medium text-foreground">
                <span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${row.key === 'besoins' && deficit ? COLORS.deficit : COLORS[row.key as keyof typeof COLORS]}`} aria-hidden="true" />
                {row.label}
              </th>
              <td className="py-2 text-right tabular-nums">
                {f.money(row.ref)}<span className="block text-xs text-muted-foreground">{f.pct(row.refPct)}</span>
              </td>
              <td className="py-2 text-right tabular-nums font-semibold text-foreground">
                {f.money(row.you)}<span className="block text-xs font-normal text-muted-foreground">{f.pct(share(row.you))}</span>
              </td>
            </tr>
          ))}
          {r.marge > 0 && (
            <tr>
              <th scope="row" className="py-2 font-medium text-foreground">
                <span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${COLORS.marge}`} aria-hidden="true" />
                {t.labels.margin}
              </th>
              <td className="py-2 text-right text-muted-foreground">—</td>
              <td className="py-2 text-right tabular-nums font-semibold text-foreground">
                {f.money(r.marge)}<span className="block text-xs font-normal text-muted-foreground">{f.pct(share(r.marge))}</span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const SAVINGS_KEY = 'epargne';

const positive = (parse: ToolFormat['parse'], raw: string | undefined) => {
  const n = parse(raw ?? '');
  return Number.isFinite(n) && n > 0 ? n : 0;
};

function load(storageKey: string): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as { values: Record<string, string> }).values ?? null : null;
  } catch {
    return null;
  }
}

export function BudgetPersoCalculator({ t, format: f, storageKey, beforeIncomes }: {
  t: BudgetPersoCopy;
  format: ToolFormat;
  /** localStorage key of the visitor's values, one per page. */
  storageKey: string;
  /** Shown at the top of step 1 (the currency choice, in English). */
  beforeIncomes?: ReactNode;
}) {
  const saved = useMemo(() => load(storageKey), [storageKey]);
  const [values, setValues] = useState<Record<string, string>>(saved ?? {});
  const [moreOpen, setMoreOpen] = useState(() => NEED_FIELDS.some((n) => !n.main && positive(f.parse, saved?.[`need.${n.key}`]) > 0));
  const [resultsVisible, setResultsVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ values }));
    } catch {
      // Private mode or blocked storage: the calculator still works.
    }
  }, [storageKey, values]);

  useEffect(() => {
    const el = headlineRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setResultsVisible(entry.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const r = useMemo(() => computeBudgetPerso(
    Object.fromEntries(INCOME_FIELDS.map((i) => [i.key, positive(f.parse, values[`inc.${i.key}`])])),
    Object.fromEntries(NEED_FIELDS.map((n) => [n.key, positive(f.parse, values[`need.${n.key}`])])),
    positive(f.parse, values[SAVINGS_KEY]),
  ), [values, f.parse]);

  const set = (key: string) => (v: string) => setValues((prev) => ({ ...prev, [key]: v }));
  const hasIncome = r.revenus > 0;
  const deficit = r.status === 'deficit';
  const needsShare = r.besoinsShare ?? 0;

  const reset = () => {
    setValues({});
    setMoreOpen(false);
  };

  const fillExample = () => {
    setValues({
      ...Object.fromEntries(Object.entries(t.example.incomes).map(([k, v]) => [`inc.${k}`, String(v)])),
      ...Object.fromEntries(Object.entries(t.example.needs).map(([k, v]) => [`need.${k}`, String(v)])),
    });
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

  const scrollToResults = () => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <>
      <section className="px-4 pb-16 sm:px-6 lg:px-8" aria-label={t.calculatorLabel}>
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_400px] lg:items-start">
          <div className="space-y-6">
            <Panel
              title={t.incomeTitle}
              step={1}
              aside={<button type="button" onClick={fillExample} className="min-h-[44px] shrink-0 rounded-xl px-2 text-sm font-semibold text-primary hover:underline">{t.seeExample}</button>}
            >
              {beforeIncomes}
              {INCOME_FIELDS.map((i) => (
                <MoneyInput key={i.key} id={`inc-${i.key}`} label={t.incomes[i.key].label} hint={t.incomes[i.key].hint} suffix={`${f.symbol}${t.perMonth}`} value={values[`inc.${i.key}`] ?? ''} onChange={set(`inc.${i.key}`)} />
              ))}
            </Panel>

            <Panel title={t.needsTitle} step={2}>
              <p className="pb-2 text-sm text-muted-foreground">{t.needsIntro}</p>
              {NEED_FIELDS.filter((n) => n.main || moreOpen).map((n) => (
                <MoneyInput key={n.key} id={`need-${n.key}`} label={t.needs[n.key].label} hint={t.needs[n.key].hint} suffix={`${f.symbol}${t.perMonth}`} value={values[`need.${n.key}`] ?? ''} onChange={set(`need.${n.key}`)} />
              ))}
              {!moreOpen && (
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => setMoreOpen(true)}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl px-2 font-semibold text-primary hover:underline"
                  >
                    <ChevronDown className="h-4 w-4" aria-hidden="true" /> {t.moreNeeds}
                  </button>
                </div>
              )}
              <p className="pt-3 text-sm text-muted-foreground">{t.annualNote}</p>
            </Panel>

            <Panel title={t.savingsTitle} step={3} aside={<span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{t.optional}</span>}>
              <MoneyInput
                id="epargne-actuelle"
                label={t.savingsLabel}
                hint={t.savingsHint}
                suffix={`${f.symbol}${t.perMonth}`}
                value={values[SAVINGS_KEY] ?? ''}
                onChange={set(SAVINGS_KEY)}
              />
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
                    <p className="mt-1 text-sm text-muted-foreground">{t.summary(f.money(r.revenus), f.money(r.besoins))}</p>
                  )}

                  {!deficit && (
                    <p className="mt-4 flex items-start gap-2 text-sm text-foreground">
                      {r.status === 'within'
                        ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                        : <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />}
                      <span>{t.needsShare(f.pct(needsShare), r.status === 'within')}</span>
                    </p>
                  )}

                  <Comparison r={r} t={t} f={f} />

                  {deficit ? (
                    <div className="mt-5 rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
                      <p className="font-semibold text-foreground">{t.deficitHelp.title}</p>
                      <p className="mt-1">{t.deficitHelp.intro}</p>
                      <ul className="mt-2 space-y-1.5">
                        {t.deficitHelp.items.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  ) : (
                    <>
                      <div className="mt-5 grid grid-cols-3 gap-2">
                        <Tile label={t.labels.wants} value={f.money(r.envies)} note={t.tiles.ofIncome(f.pct(r.envies / r.revenus))} />
                        <Tile label={t.labels.savings} value={f.money(r.epargne)} note={t.tiles.ofIncome(f.pct(r.epargneShare ?? 0))} />
                        <Tile label={t.tiles.wantsPerDay} value={f.moneyExact(r.enviesParJour)} note={t.tiles.perDayNote} />
                      </div>
                      <div className="mt-4 rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
                        {r.status === 'within' && <p>{t.within(r.marge > 0 ? f.money(r.marge) : null)}</p>}
                        {r.status === 'trimmed' && <p>{t.trimmed(f.pct(FULL_SAVINGS_MAX_NEEDS_SHARE))}</p>}
                        {r.status === 'shared' && <p>{t.shared(f.pct(needsShare), f.money(r.epargne))}</p>}
                        <a href={`#${t.ruleAnchor}`} className="mt-2 inline-block font-medium text-primary hover:underline">{t.howSplit}</a>
                      </div>
                      {r.epargneActuelle > 0 && (
                        <p className="mt-4 text-sm text-muted-foreground">
                          {t.current(f.money(r.epargneActuelle), f.pct(r.epargneActuelleShare ?? 0))}{' '}
                          {r.epargneActuelle > r.reste
                            ? t.currentOver
                            : r.ecartEpargne > 0
                              ? t.currentGap(f.money(r.ecartEpargne))
                              : t.currentReached}
                        </p>
                      )}
                    </>
                  )}
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
            <Button type="button" onClick={scrollToResults} className="min-h-[44px]">{t.sticky.details}</Button>
          </div>
        </div>
      )}
    </>
  );
}
