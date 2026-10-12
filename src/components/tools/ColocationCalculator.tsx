// src/components/tools/ColocationCalculator.tsx
// ============================================================================
// The interactive rent and bills split (roommates, bills, method, live
// shares, sticky summary), shared by /budget-colocation and
// /en/rent-split-calculator. Every word comes from a language file
// (src/i18n/<lang>/colocation.tsx), every amount goes through `format`, and
// the split itself is src/lib/tools/colocation.ts. Nothing is sent: the
// values stay in localStorage.
// ============================================================================

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Info, RotateCcw, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MoneyInput, Panel, Segmented, SignupCard, Stepper, Tile } from '@/components/tools/ToolKit';
import type { ToolFormat } from '@/i18n/format';
import { COMMON_SHARE, computeColocation, type ColocFallback, type ColocInput, type SplitMethod } from '@/lib/tools/colocation';

export const BILL_KEYS = ['energie', 'internet', 'assurance', 'courses', 'autres'] as const;
export type BillKey = (typeof BILL_KEYS)[number];

const MAX = 6;

interface FieldCopy {
  label: string;
  hint?: string;
}

/** The words of the calculator: one object per language (src/i18n/<lang>/colocation.tsx). */
export interface ColocCopy {
  calculatorLabel: string;
  householdTitle: string;
  seeExample: string;
  roommates: string;
  roommatesLess: string;
  roommatesMore: string;
  /** Default name of the i-th roommate (0-based). */
  mateName: (i: number) => string;
  nameLabel: string;
  roomLabel: string;
  incomeLabel: string;
  billsTitle: string;
  rent: FieldCopy;
  bills: Record<BillKey, FieldCopy>;
  billsNote: string;
  methodTitle: string;
  methodLegend: string;
  methods: Record<SplitMethod, { label: string; hint: string }>;
  methodHelp: (method: SplitMethod, commonShare: string) => string;
  /** After amount fields: "€" + "/mois". */
  perMonth: string;
  resultTitle: string;
  emptyResult: string;
  shareDetail: (rent: string, bills: string, ratio: string) => string;
  fallback: Record<ColocFallback, string>;
  tiles: { rent: string; bills: string; total: string };
  potTip: string;
  signup: { title: string; text: string; cta?: string };
  reset: string;
  share: { button: string; copied: string; url: string; title: string; text: string };
  sticky: { total: (amount: string) => string; details: string };
}

interface Mate { name: string; room: string; income: string }
interface Saved { mates: Mate[]; method: SplitMethod; values: Record<string, string> }

function load(storageKey: string): Saved | null {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

const positive = (parse: ToolFormat['parse'], raw: string | undefined) => {
  const n = parse(raw ?? '');
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export function ColocationCalculator({ t, format: f, storageKey, example, areaUnit, beforeHousehold }: {
  t: ColocCopy;
  format: ToolFormat;
  /** localStorage key of the visitor's values, one per page. */
  storageKey: string;
  /** Filled by « see the example » (bills in BILL_KEYS order). */
  example: ColocInput;
  /** Unit shown after a bedroom's size: "m²", "sq ft". Only the proportions count. */
  areaUnit: string;
  /** Shown at the top of step 1 (the currency choice, in English). */
  beforeHousehold?: ReactNode;
}) {
  const mate = (i: number): Mate => ({ name: t.mateName(i), room: '', income: '' });
  const saved = useMemo(() => load(storageKey), [storageKey]);
  const [mates, setMates] = useState<Mate[]>(saved?.mates?.length ? saved.mates : [mate(0), mate(1)]);
  const [method, setMethod] = useState<SplitMethod>(saved?.method ?? 'egal');
  const [values, setValues] = useState<Record<string, string>>(saved?.values ?? {});
  const [resultsVisible, setResultsVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ mates, method, values }));
    } catch {
      // Private mode or blocked storage: the calculator still works.
    }
  }, [storageKey, mates, method, values]);

  useEffect(() => {
    const el = headlineRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setResultsVisible(entry.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const { parse } = f;
  const r = useMemo(() => computeColocation({
    rent: positive(parse, values.loyer),
    bills: BILL_KEYS.map((k) => positive(parse, values[k])),
    method,
    roommates: mates.map((m, i) => ({ name: m.name.trim() || t.mateName(i), room: positive(parse, m.room), income: positive(parse, m.income) })),
  }), [mates, method, values, parse, t]);

  const set = (key: string) => (v: string) => setValues((prev) => ({ ...prev, [key]: v }));
  const setMate = (i: number, patch: Partial<Mate>) => setMates((ms) => ms.map((m, j) => (j === i ? { ...m, ...patch } : m)));
  const setCount = (n: number) => setMates((ms) => (n > ms.length ? [...ms, ...Array.from({ length: n - ms.length }, (_, k) => mate(ms.length + k))] : ms.slice(0, n)));
  const hasData = r.total > 0;
  const maxShare = Math.max(0, ...r.shares.map((s) => s.total));
  const perMonth = `${f.symbol}${t.perMonth}`;

  const fillExample = () => {
    setMethod(example.method);
    setMates(example.roommates.map((m) => ({ name: m.name, room: String(m.room), income: String(m.income) })));
    setValues({
      loyer: String(example.rent),
      ...Object.fromEntries(example.bills.flatMap((b, i) => (b > 0 && BILL_KEYS[i] ? [[BILL_KEYS[i], String(b)]] : []))),
    });
  };
  const reset = () => {
    setMates([mate(0), mate(1)]);
    setMethod('egal');
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

  const methods = (['egal', 'chambre', 'revenus'] as const).map((value) => ({ value, ...t.methods[value] }));

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
              <Stepper label={t.roommates} value={mates.length} min={2} max={MAX} onChange={setCount} removeLabel={t.roommatesLess} addLabel={t.roommatesMore} />
              {mates.map((m, i) => (
                <div key={i} className={`grid items-end gap-3 py-3 ${method === 'chambre' ? (areaUnit.length > 2 ? 'grid-cols-[1fr_9rem]' : 'grid-cols-[1fr_7rem]') : method === 'revenus' ? 'grid-cols-[1fr_9.5rem] sm:grid-cols-[1fr_12rem]' : ''}`}>
                  <div className="pb-2">
                    <label htmlFor={`mate-${i}`} className="block text-sm font-medium text-foreground">{t.nameLabel}</label>
                    <input
                      id={`mate-${i}`}
                      type="text"
                      autoComplete="off"
                      maxLength={24}
                      value={m.name}
                      onChange={(e) => setMate(i, { name: e.target.value })}
                      className="mt-1.5 h-12 w-full rounded-xl border border-input bg-background px-4 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                    />
                  </div>
                  {method === 'chambre' && (
                    <div>
                      <MoneyInput id={`room-${i}`} label={<span className="text-sm">{t.roomLabel}</span>} suffix={areaUnit} value={m.room} onChange={(v) => setMate(i, { room: v })} />
                    </div>
                  )}
                  {method === 'revenus' && (
                    <div>
                      <MoneyInput id={`income-${i}`} label={<span className="text-sm">{t.incomeLabel}</span>} suffix={perMonth} value={m.income} onChange={(v) => setMate(i, { income: v })} />
                    </div>
                  )}
                </div>
              ))}
            </Panel>

            <Panel title={t.billsTitle} step={2}>
              <MoneyInput id="loyer" label={t.rent.label} hint={t.rent.hint} suffix={perMonth} value={values.loyer ?? ''} onChange={set('loyer')} />
              {BILL_KEYS.map((k) => (
                <MoneyInput key={k} id={`bill-${k}`} label={t.bills[k].label} hint={t.bills[k].hint} suffix={perMonth} value={values[k] ?? ''} onChange={set(k)} />
              ))}
              <p className="pt-3 text-sm text-muted-foreground">{t.billsNote}</p>
            </Panel>

            <Panel title={t.methodTitle} step={3}>
              <Segmented label={t.methodLegend} value={method} options={methods} onChange={setMethod} />
              <p className="flex items-start gap-2 pt-3 text-sm text-muted-foreground"><Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> {t.methodHelp(method, f.pct(COMMON_SHARE))}</p>
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
                          <span className="font-display text-2xl font-bold tabular-nums text-foreground">{f.moneyExact(s.total)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{t.shareDetail(f.moneyExact(s.rent), f.moneyExact(s.bills), f.pct(s.ratio))}</p>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${maxShare > 0 ? (s.total / maxShare) * 100 : 0}%` }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                  {r.fallback && <p className="mt-4 rounded-xl bg-warning/10 p-3 text-sm text-foreground">{t.fallback[r.fallback]}</p>}
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <Tile label={t.tiles.rent} value={f.moneyExact(r.rent)} />
                    <Tile label={t.tiles.bills} value={f.moneyExact(r.bills)} />
                    <Tile label={t.tiles.total} value={f.moneyExact(r.total)} />
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
              <p className="text-xs text-muted-foreground">{t.sticky.total(f.moneyExact(r.total))}</p>
              <p className="truncate text-sm font-semibold tabular-nums text-foreground">
                {r.shares.map((s) => `${s.name} ${f.moneyExact(s.total)}`).join(' · ')}
              </p>
            </div>
            <Button type="button" onClick={() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="min-h-[44px] shrink-0">{t.sticky.details}</Button>
          </div>
        </div>
      )}
    </>
  );
}
