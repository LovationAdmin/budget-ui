// src/components/budget/month/MonthHeader.tsx
// Month navigation: title with previous/next, status, the 12-month strip
// (bars = what is left each month, lock = closed) and the status banners.

import { ChevronLeft, ChevronRight, Info, Lock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useBudget } from '@/contexts/BudgetContext';
import type { YM } from '@/lib/budget/types';
import {
  addMonths,
  compareYM,
  formatMonthTitle,
  makeYM,
  monthNames,
  monthLetters,
  monthNamesShort,
  yearOf,
} from '@/lib/budget/months';
import { intlLocale } from '@/lib/budget/format';
import { defineMessages, pick, useT } from '@/i18n/runtime';
import { Pill, type PillTone } from '../shared/primitives';

const M = defineMessages({
  fr: {
    closed: 'Clôturé',
    current: 'En cours',
    forecast: 'Prévisionnel',
    reopened: 'Rouvert',
    prev: 'Mois précédent',
    next: 'Mois suivant',
    backToToday: 'Revenir à aujourd’hui',
    add: 'Ajouter',
    yearMonths: (year: number) => `Mois de ${year}`,
    cell: (name: string, year: number, status: string, reste: string) => `${name} ${year}, ${status}, reste ${reste}`,
    closedOn: (date: string) => `Mois clôturé${date ? ` le ${date}` : ''}.`,
    frozen: 'Ses montants sont figés : modifier une charge ou un salaire ne le change plus.',
    readOnly: 'Il est en lecture seule.',
    reopen: 'Rouvrir',
    forecastBanner: 'Mois prévisionnel, rempli automatiquement à partir de vos règles. Tout reste modifiable.',
  },
  en: {
    closed: 'Closed',
    current: 'Current',
    forecast: 'Forecast',
    reopened: 'Reopened',
    prev: 'Previous month',
    next: 'Next month',
    backToToday: 'Back to today',
    add: 'Add',
    yearMonths: (year: number) => `Months of ${year}`,
    cell: (name: string, year: number, status: string, reste: string) => `${name} ${year}, ${status}, ${reste} left`,
    closedOn: (date: string) => (date ? `Month closed on ${date}.` : 'Month closed.'),
    frozen: 'Its amounts are locked: changing a bill or someone’s pay no longer affects it.',
    readOnly: 'It’s read-only.',
    reopen: 'Reopen',
    forecastBanner: 'Forecast month, filled in automatically from your rules. You can still change anything.',
  },
});

export function monthStatus(closed: boolean, ym: YM, today: YM): { label: string; tone: PillTone } {
  const t = pick(M);
  if (closed) return { label: t.closed, tone: 'grey' };
  const cmp = compareYM(ym, today);
  if (cmp === 0) return { label: t.current, tone: 'green' };
  if (cmp > 0) return { label: t.forecast, tone: 'blue' };
  return { label: t.reopened, tone: 'amber' };
}

function formatClosedAt(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(intlLocale(), { day: 'numeric', month: 'long', year: 'numeric' });
}

interface MonthHeaderProps {
  ym: YM;
  onChange: (ym: YM) => void;
}

export function MonthHeader({ ym, onChange }: MonthHeaderProps) {
  const t = useT(M);
  const { engine, today, openSheet, fmt } = useBudget();
  const month = engine.month(ym);
  const status = monthStatus(month.closed, ym, today);
  const year = yearOf(ym);
  const restes = monthNames().map((_, i) => engine.month(makeYM(year, i)).totals.reste);
  const maxAbs = Math.max(1, ...restes.map((r) => Math.abs(r)));
  const closedAt = formatClosedAt(month.closedAt);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-2 sm:justify-start">
          <Button variant="outline" size="icon" className="h-11 w-11 shrink-0" aria-label={t.prev} onClick={() => onChange(addMonths(ym, -1))}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-center sm:min-w-[260px]">
            {formatMonthTitle(ym)}
          </h1>
          <Button variant="outline" size="icon" className="h-11 w-11 shrink-0" aria-label={t.next} onClick={() => onChange(addMonths(ym, 1))}>
            <ChevronRight className="h-5 w-5" />
          </Button>
          <Pill tone={status.tone} className="hidden sm:inline-flex">{status.label}</Pill>
        </div>
        <div className="flex items-center justify-center gap-2 sm:justify-end">
          <Pill tone={status.tone} className="sm:hidden">{status.label}</Pill>
          {ym !== today && (
            <Button variant="outline" className="min-h-[44px]" onClick={() => onChange(today)}>
              {t.backToToday}
            </Button>
          )}
          <Button
            className="hidden lg:inline-flex min-h-[44px]"
            onClick={() => (month.closed ? openSheet({ kind: 'reopen', ym }) : openSheet({ kind: 'addMenu', ym }))}
          >
            <Plus className="h-4 w-4" /> {t.add}
          </Button>
        </div>
      </div>

      <div role="group" aria-label={t.yearMonths(year)} className="grid grid-cols-12 gap-0.5 sm:gap-1 rounded-2xl border border-border/70 bg-card p-1.5 shadow-soft">
        {monthNames().map((name, i) => {
          const cell = makeYM(year, i);
          const selected = cell === ym;
          const isToday = cell === today;
          const closed = engine.isClosed(cell);
          const reste = restes[i];
          const h = Math.max(3, Math.round((Math.abs(reste) / maxAbs) * 26));
          const label = t.cell(name, year, (closed ? t.closed : isToday ? t.current : compareYM(cell, today) > 0 ? t.forecast : t.reopened).toLowerCase(), fmt(reste));
          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(cell)}
              aria-label={label}
              title={label}
              aria-current={selected ? 'date' : undefined}
              className={cn(
                // min-w-0: twelve cells must fit a phone (overrides the global 44px touch min-width).
                'flex min-h-[64px] min-w-0 flex-col items-center justify-end gap-1 rounded-xl border-[1.5px] pb-1 pt-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                selected ? 'border-primary bg-card shadow-sm' : isToday ? 'border-dashed border-primary/60' : 'border-transparent hover:bg-muted/60',
              )}
            >
              <span className="flex h-7 w-full items-end justify-center">
                <span
                  className={cn(
                    'block w-3/5 max-w-[22px] rounded-t-[4px]',
                    reste < 0 ? 'bg-red-600' : selected ? 'bg-primary' : closed ? 'bg-slate-300' : 'bg-emerald-400',
                  )}
                  style={{ height: h }}
                />
              </span>
              <span className={cn('text-xs', selected ? 'font-bold text-primary' : 'font-semibold text-muted-foreground')}>
                <span className="sm:hidden">{monthLetters()[i]}</span>
                <span className="hidden sm:inline">{monthNamesShort()[i]}</span>
              </span>
              <span className="flex h-3 items-center text-slate-500">{closed && <Lock className="h-2.5 w-2.5" aria-hidden="true" />}</span>
            </button>
          );
        })}
      </div>

      {month.closed && (
        <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-3 sm:flex-row sm:items-center sm:px-4">
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 h-5 w-5 shrink-0 text-stone-600" aria-hidden="true" />
            <p className="text-sm text-stone-800">
              <strong>{t.closedOn(closedAt)}</strong>{' '}
              {month.frozen
                ? t.frozen
                : t.readOnly}
            </p>
          </div>
          <Button variant="outline" className="min-h-[44px] sm:ml-auto" onClick={() => openSheet({ kind: 'reopen', ym })}>
            {t.reopen}
          </Button>
        </div>
      )}
      {!month.closed && compareYM(ym, today) > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-3 sm:px-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" aria-hidden="true" />
          <p className="text-sm text-sky-950">{t.forecastBanner}</p>
        </div>
      )}
    </div>
  );
}
