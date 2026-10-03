// src/lib/pages/budget-tabs/YearTab.tsx
// ============================================================================
// « Année » — the twelve months side by side: what came in, the charges, the
// savings, what was left, what was paid with savings and the general savings
// balance. The forecast of the year is net of those expenses. Every month
// opens the « Mois » screen. The year lives in the URL (?y=2026).
// ============================================================================

import { Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useBudget } from '@/contexts/BudgetContext';
import { monthSpent, yearSummary, type MonthTotals } from '@/lib/budget/engine';
import { makeYM, MONTH_NAMES, MONTHS_SHORT, MONTHS_LETTER, yearOf } from '@/lib/budget/months';
import { moneySigned } from '@/lib/budget/format';
import { Pill } from '@/components/budget/shared/primitives';
import { monthStatus } from '@/components/budget/month/MonthHeader';

const SERIES = [
  { key: 'charges', label: 'Charges', swatch: 'bg-orange-500' },
  { key: 'savings', label: 'Épargne', swatch: 'bg-indigo-500' },
  { key: 'reste', label: 'Reste', swatch: 'bg-emerald-500' },
] as const;

/** Hover / focus details of one month (values in text ink, identity on the swatch). */
function MonthTooltip({ title, t, spent, fmt, align }: { title: string; t: MonthTotals; spent: number; fmt: (n: number) => string; align: 'left' | 'center' | 'right' }) {
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
      {spent > 0 && (
        <span className="mt-1 flex items-center justify-between gap-2 border-t border-border/60 pt-1 text-xs tabular-nums text-muted-foreground">
          <span>Dépensé avec l’épargne</span>
          <span className="font-semibold text-foreground">−{fmt(spent)}</span>
        </span>
      )}
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
    return { ym, name, i, t: month.totals, spent: monthSpent(month), closed: month.closed, general: engine.generalBalance(ym) };
  });
  const sum = yearSummary(engine, year);
  const hasFuture = year >= thisYear;
  const maxIn = Math.max(1, ...rows.map((r) => Math.max(r.t.entrees, r.t.charges + r.t.savings + Math.max(0, r.t.reste))));
  const H = 160;

  const kpis = [
    { label: 'Entrées', value: fmt(sum.entrees), swatch: 'bg-emerald-700' },
    { label: 'Charges', value: fmt(sum.charges), swatch: 'bg-orange-500' },
    { label: 'Épargne', value: fmt(sum.savings), swatch: 'bg-indigo-500' },
    { label: 'Dépensé avec l’épargne', value: sum.spent ? `−${fmt(sum.spent)}` : fmt(0), swatch: 'bg-rose-500' },
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
            <span className="font-display text-xl sm:text-2xl font-extrabold tabular-nums text-foreground">{k.value}</span>
          </div>
        ))}
      </div>

      <section aria-labelledby="year-net-title" className={cn('grid gap-4 rounded-2xl border p-5 shadow-soft sm:grid-cols-[1fr_auto] sm:items-end sm:p-6', sum.net < 0 ? 'border-red-200 bg-red-50/70' : 'border-emerald-200 bg-emerald-50/70')}>
        <div className="min-w-0">
          <h2 id="year-net-title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{hasFuture ? `Bilan prévisionnel ${year}` : `Bilan ${year}`}</h2>
          <p className={cn('mt-1 font-display text-3xl sm:text-4xl font-extrabold tabular-nums', sum.net < 0 ? 'text-red-700' : 'text-emerald-700')}>{moneySigned(sum.net, currencySymbol)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {sum.net >= 0
              ? `mis de côté sur l’année, une fois payées les dépenses faites avec l’épargne.`
              : `sur l’épargne à la fin de l’année : les dépenses dépassent ce qui est mis de côté.`}
            {hasFuture && ' Les mois à venir sont comptés tels que prévus.'}
          </p>
          <p className="mt-2 text-sm tabular-nums text-foreground">
            Épargne {fmt(sum.savings)} <span className="text-muted-foreground">+</span> reste cumulé {moneySigned(sum.reste, currencySymbol)} <span className="text-muted-foreground">−</span> dépensé {fmt(sum.spent)}
          </p>
          {sum.deletedSpent > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              Non compté : {fmt(sum.deletedSpent)} payés avec une cagnotte supprimée depuis (son solde n’est plus compté non plus).
            </p>
          )}
        </div>
        {sum.endBalance !== sum.net && (
        <div className="rounded-xl bg-card/80 px-4 py-3 sm:text-right">
          <p className="text-xs font-bold text-muted-foreground">Épargne disponible fin décembre</p>
          <p className={cn('font-display text-xl font-extrabold tabular-nums', sum.endBalance < 0 ? 'text-red-700' : 'text-foreground')}>{fmt(sum.endBalance)}</p>
          <p className="text-xs tabular-nums text-muted-foreground">cagnottes {fmt(sum.endPots)} · épargne générale {fmt(sum.endGeneral)}</p>
        </div>
        )}
      </section>

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
                aria-label={`Ouvrir ${r.name.toLowerCase()} ${year} : entrées ${fmt(r.t.entrees)}, charges ${fmt(r.t.charges)}, épargne ${fmt(r.t.savings)}, reste ${fmt(r.t.reste)}${r.spent ? `, dépensé avec l’épargne ${fmt(r.spent)}` : ''}`}
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
                <MonthTooltip title={`${r.name} ${year}`} t={r.t} spent={r.spent} fmt={fmt} align={r.i < 2 ? 'left' : r.i > 9 ? 'right' : 'center'} />
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
              <th scope="col" className="px-3 py-2 text-right font-bold">Dépensé</th>
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
                  <td className="px-3 py-2 text-right text-muted-foreground">{r.spent ? `−${fmt(r.spent)}` : '—'}</td>
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
                  {r.spent > 0 && <> · dépensé {fmt(r.spent)}</>}
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
