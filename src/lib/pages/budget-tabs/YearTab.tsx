// src/lib/pages/budget-tabs/YearTab.tsx
// ============================================================================
// « Année » — the twelve months side by side: what came in, the charges, the
// savings, what was left and the general savings balance. Every month opens
// the « Mois » screen. The year lives in the URL (?y=2026).
// ============================================================================

import { Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useBudget } from '@/contexts/BudgetContext';
import type { MonthTotals } from '@/lib/budget/engine';
import { makeYM, MONTH_NAMES, MONTHS_SHORT, MONTHS_LETTER, yearOf } from '@/lib/budget/months';
import { moneySigned, roundCents } from '@/lib/budget/format';
import { Pill } from '@/components/budget/shared/primitives';
import { monthStatus } from '@/components/budget/month/MonthHeader';

const SERIES = [
  { key: 'charges', label: 'Charges', swatch: 'bg-orange-500' },
  { key: 'savings', label: 'Épargne', swatch: 'bg-indigo-500' },
  { key: 'reste', label: 'Reste', swatch: 'bg-emerald-500' },
] as const;

/** Hover / focus details of one month (values in text ink, identity on the swatch). */
function MonthTooltip({ title, t, fmt, align }: { title: string; t: MonthTotals; fmt: (n: number) => string; align: 'left' | 'center' | 'right' }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute bottom-full z-20 mb-2 hidden w-48 rounded-xl border border-border/70 bg-popover p-3 text-left shadow-elevated group-hover:block group-focus-visible:block',
        align === 'left' && 'left-0',
        align === 'center' && 'left-1/2 -translate-x-1/2',
        align === 'right' && 'right-0',
      )}
    >
      <span className="mb-1.5 block text-xs font-bold text-foreground">{title}</span>
      <span className="flex items-center justify-between gap-2 text-xs tabular-nums text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-emerald-700" />Entrées</span>
        <span className="font-semibold text-foreground">{fmt(t.entrees)}</span>
      </span>
      {SERIES.map((s) => (
        <span key={s.key} className="mt-1 flex items-center justify-between gap-2 text-xs tabular-nums text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className={cn('h-2 w-2 rounded-sm', s.key === 'reste' && t.reste < 0 ? 'bg-red-600' : s.swatch)} />{s.label}</span>
          <span className={cn('font-semibold', s.key === 'reste' && t.reste < 0 ? 'text-red-700' : 'text-foreground')}>{fmt(t[s.key])}</span>
        </span>
      ))}
    </span>
  );
}

export default function YearTab() {
  const { engine, today, fmt, budgetId, currencySymbol } = useBudget();
  const [params, setParams] = useSearchParams();
  const thisYear = yearOf(today);
  const minYear = Math.min(yearOf(engine.firstMonth), thisYear);
  const maxYear = thisYear + 5;
  const requested = Number(params.get('y'));
  const year = Number.isInteger(requested) && requested >= minYear && requested <= maxYear ? requested : thisYear;
  const setYear = (y: number) =>
    setParams((p) => {
      const copy = new URLSearchParams(p);
      if (y === thisYear) copy.delete('y');
      else copy.set('y', String(y));
      return copy;
    });
  const monthUrl = (ym: string) => `/budget/${budgetId}/complete/month?m=${ym}`;

  const rows = MONTH_NAMES.map((name, i) => {
    const ym = makeYM(year, i);
    const month = engine.month(ym);
    return { ym, name, i, t: month.totals, closed: month.closed, general: engine.generalBalance(ym) };
  });
  const tot = rows.reduce(
    (acc, r) => ({
      entrees: acc.entrees + r.t.entrees,
      charges: acc.charges + r.t.charges,
      savings: acc.savings + r.t.savings,
      reste: acc.reste + r.t.reste,
    }),
    { entrees: 0, charges: 0, savings: 0, reste: 0 },
  );
  const maxIn = Math.max(1, ...rows.map((r) => Math.max(r.t.entrees, r.t.charges + r.t.savings + Math.max(0, r.t.reste))));
  const H = 160;

  const kpis = [
    { label: 'Entrées', value: fmt(roundCents(tot.entrees)), swatch: 'bg-emerald-700', negative: false },
    { label: 'Charges', value: fmt(roundCents(tot.charges)), swatch: 'bg-orange-500', negative: false },
    { label: 'Épargne', value: fmt(roundCents(tot.savings)), swatch: 'bg-indigo-500', negative: false },
    { label: 'Reste cumulé', value: moneySigned(roundCents(tot.reste), currencySymbol), swatch: tot.reste < 0 ? 'bg-red-600' : 'bg-emerald-500', negative: tot.reste < 0 },
  ];

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-200">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-11 w-11" aria-label="Année précédente" disabled={year <= minYear} onClick={() => setYear(year - 1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="min-w-[150px] text-center font-display text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums">Année {year}</h1>
          <Button variant="outline" size="icon" className="h-11 w-11" aria-label="Année suivante" disabled={year >= maxYear} onClick={() => setYear(year + 1)}>
            <ChevronRight className="h-5 w-5" />
          </Button>
          {year !== thisYear && (
            <Button variant="ghost" className="min-h-[44px]" onClick={() => setYear(thisYear)}>
              {thisYear}
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">Vue d’ensemble. Touchez un mois pour l’ouvrir.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="flex flex-col gap-0.5 rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
            <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
              <span aria-hidden="true" className={cn('h-2.5 w-2.5 rounded-sm', k.swatch)} />
              {k.label}
            </span>
            <span className={cn('font-display text-xl sm:text-2xl font-extrabold tabular-nums', k.negative ? 'text-red-700' : 'text-foreground')}>{k.value}</span>
          </div>
        ))}
      </div>

      <section aria-label="Répartition mois par mois" className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft sm:p-5">
        <div className="grid grid-cols-12 items-end gap-0.5 sm:gap-1.5" style={{ height: H + 30 }}>
          {rows.map((r) => {
            // Bottom → top; the top segment carries the 4px rounded data-end.
            const segments = [
              { h: Math.round((r.t.charges / maxIn) * H), cls: 'bg-orange-500' },
              { h: Math.round((r.t.savings / maxIn) * H), cls: 'bg-indigo-500' },
              r.t.reste < 0 ? { h: 4, cls: 'bg-red-600' } : { h: Math.round((r.t.reste / maxIn) * H), cls: 'bg-emerald-500' },
            ].filter((s) => s.h > 0);
            const isToday = r.ym === today;
            return (
              <Link
                key={r.ym}
                to={monthUrl(r.ym)}
                aria-label={`Ouvrir ${r.name.toLowerCase()} ${year} : entrées ${fmt(r.t.entrees)}, charges ${fmt(r.t.charges)}, épargne ${fmt(r.t.savings)}, reste ${fmt(r.t.reste)}`}
                className={cn(
                  'group relative flex h-full min-w-0 flex-col items-center justify-end gap-1 rounded-lg pb-0.5 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isToday && 'bg-sky-50/70',
                )}
              >
                <span className="flex w-3/5 max-w-[24px] flex-col-reverse gap-[2px]">
                  {segments.map((s, k) => (
                    <span key={s.cls} className={cn('block', s.cls, k === segments.length - 1 && 'rounded-t-[4px]')} style={{ height: s.h }} />
                  ))}
                </span>
                <span className={cn('text-[11px] font-semibold', isToday ? 'text-primary' : 'text-muted-foreground')}>
                  <span className="sm:hidden">{MONTHS_LETTER[r.i]}</span>
                  <span className="hidden sm:inline">{MONTHS_SHORT[r.i]}</span>
                </span>
                <MonthTooltip title={`${r.name} ${year}`} t={r.t} fmt={fmt} align={r.i < 2 ? 'left' : r.i > 9 ? 'right' : 'center'} />
              </Link>
            );
          })}
        </div>
        <div aria-hidden="true" className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
          {SERIES.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1.5"><span className={cn('h-2.5 w-2.5 rounded-sm', s.swatch)} />{s.label}</span>
          ))}
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-red-600" />Déficit</span>
        </div>
      </section>

      {/* Desktop: table */}
      <section aria-label={`Détail de ${year}`} className="hidden overflow-x-auto rounded-2xl border border-border/70 bg-card p-2 shadow-soft md:block">
        <table className="w-full text-sm tabular-nums">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th scope="col" className="px-3 py-2 font-bold">Mois</th>
              <th scope="col" className="px-3 py-2 text-right font-bold">Entrées</th>
              <th scope="col" className="px-3 py-2 text-right font-bold">Charges</th>
              <th scope="col" className="px-3 py-2 text-right font-bold">Épargne</th>
              <th scope="col" className="px-3 py-2 text-right font-bold">Reste</th>
              <th scope="col" className="px-3 py-2 text-right font-bold">Épargne générale</th>
              <th scope="col" className="px-3 py-2 font-bold">État</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const st = monthStatus(r.closed, r.ym, today);
              return (
                <tr key={r.ym} className={cn('border-t border-border/60', r.ym === today && 'bg-sky-50/60')}>
                  <td className="px-3 py-2">
                    <Link to={monthUrl(r.ym)} className="inline-flex min-h-[36px] items-center rounded font-bold hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {r.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-right">{fmt(r.t.entrees)}</td>
                  <td className="px-3 py-2 text-right">{fmt(r.t.charges)}</td>
                  <td className="px-3 py-2 text-right">{fmt(r.t.savings)}</td>
                  <td className={cn('px-3 py-2 text-right font-bold', r.t.reste < 0 ? 'text-red-700' : 'text-emerald-700')}>{moneySigned(r.t.reste, currencySymbol)}</td>
                  <td className={cn('px-3 py-2 text-right', r.general < 0 && 'text-red-700')}>{fmt(r.general)}</td>
                  <td className="px-3 py-2">
                    <Pill tone={st.tone}>
                      {r.closed && <Lock className="h-3 w-3" aria-hidden="true" />}
                      {st.label}
                    </Pill>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Phone: list */}
      <section aria-label={`Détail de ${year}`} className="flex flex-col gap-0.5 rounded-2xl border border-border/70 bg-card p-1.5 shadow-soft md:hidden">
        {rows.map((r) => {
          const st = monthStatus(r.closed, r.ym, today);
          return (
            <Link
              key={r.ym}
              to={monthUrl(r.ym)}
              className={cn('flex min-h-[60px] w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', r.ym === today && 'bg-sky-50/60')}
            >
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-bold">{r.name}</span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  Entrées {fmt(r.t.entrees)} · charges {fmt(r.t.charges)}
                </span>
              </span>
              <span className="flex flex-col items-end gap-1">
                <span className={cn('font-extrabold tabular-nums', r.t.reste < 0 ? 'text-red-700' : 'text-emerald-700')}>{moneySigned(r.t.reste, currencySymbol)}</span>
                <Pill tone={st.tone} className="h-5 text-[11px]">{st.label}</Pill>
              </span>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
