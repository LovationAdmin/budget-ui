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
  MONTH_NAMES,
  MONTHS_LETTER,
  MONTHS_SHORT,
  yearOf,
} from '@/lib/budget/months';
import { Pill, type PillTone } from '../shared/primitives';

export function monthStatus(closed: boolean, ym: YM, today: YM): { label: string; tone: PillTone } {
  if (closed) return { label: 'Clôturé', tone: 'grey' };
  const cmp = compareYM(ym, today);
  if (cmp === 0) return { label: 'En cours', tone: 'green' };
  if (cmp > 0) return { label: 'Prévisionnel', tone: 'blue' };
  return { label: 'Rouvert', tone: 'amber' };
}

function formatClosedAt(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

interface MonthHeaderProps {
  ym: YM;
  onChange: (ym: YM) => void;
}

export function MonthHeader({ ym, onChange }: MonthHeaderProps) {
  const { engine, today, openSheet, fmt } = useBudget();
  const month = engine.month(ym);
  const status = monthStatus(month.closed, ym, today);
  const year = yearOf(ym);
  const restes = MONTH_NAMES.map((_, i) => engine.month(makeYM(year, i)).totals.reste);
  const maxAbs = Math.max(1, ...restes.map((r) => Math.abs(r)));
  const closedAt = formatClosedAt(month.closedAt);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-2 sm:justify-start">
          <Button variant="outline" size="icon" className="h-11 w-11 shrink-0" aria-label="Mois précédent" onClick={() => onChange(addMonths(ym, -1))}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-center sm:min-w-[260px]">
            {formatMonthTitle(ym)}
          </h1>
          <Button variant="outline" size="icon" className="h-11 w-11 shrink-0" aria-label="Mois suivant" onClick={() => onChange(addMonths(ym, 1))}>
            <ChevronRight className="h-5 w-5" />
          </Button>
          <Pill tone={status.tone} className="hidden sm:inline-flex">{status.label}</Pill>
        </div>
        <div className="flex items-center justify-center gap-2 sm:justify-end">
          <Pill tone={status.tone} className="sm:hidden">{status.label}</Pill>
          {ym !== today && (
            <Button variant="outline" className="min-h-[44px]" onClick={() => onChange(today)}>
              Revenir à aujourd’hui
            </Button>
          )}
          <Button
            className="hidden lg:inline-flex min-h-[44px]"
            onClick={() => (month.closed ? openSheet({ kind: 'reopen', ym }) : openSheet({ kind: 'addMenu', ym }))}
          >
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        </div>
      </div>

      <div role="group" aria-label={`Mois de ${year}`} className="grid grid-cols-12 gap-0.5 sm:gap-1 rounded-2xl border border-border/70 bg-card p-1.5 shadow-soft">
        {MONTH_NAMES.map((name, i) => {
          const cell = makeYM(year, i);
          const selected = cell === ym;
          const isToday = cell === today;
          const closed = engine.isClosed(cell);
          const reste = restes[i];
          const h = Math.max(3, Math.round((Math.abs(reste) / maxAbs) * 26));
          const label = `${name} ${year}, ${closed ? 'clôturé' : isToday ? 'en cours' : compareYM(cell, today) > 0 ? 'prévisionnel' : 'rouvert'}, reste ${fmt(reste)}`;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(cell)}
              aria-label={label}
              title={label}
              aria-current={selected ? 'date' : undefined}
              className={cn(
                'flex min-h-[64px] flex-col items-center justify-end gap-1 rounded-xl border-[1.5px] pb-1 pt-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                selected ? 'border-primary bg-card shadow-sm' : isToday ? 'border-dashed border-primary/60' : 'border-transparent hover:bg-muted/60',
              )}
            >
              <span className="flex h-7 w-full items-end justify-center">
                <span
                  className={cn(
                    'block w-3/5 max-w-[22px] rounded',
                    reste < 0 ? 'bg-red-600' : selected ? 'bg-primary' : closed ? 'bg-slate-300' : 'bg-emerald-400',
                  )}
                  style={{ height: h }}
                />
              </span>
              <span className={cn('text-xs', selected ? 'font-bold text-primary' : 'font-semibold text-muted-foreground')}>
                <span className="sm:hidden">{MONTHS_LETTER[i]}</span>
                <span className="hidden sm:inline">{MONTHS_SHORT[i]}</span>
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
              <strong>Mois clôturé{closedAt ? ` le ${closedAt}` : ''}.</strong>{' '}
              {month.frozen
                ? 'Ses montants sont figés : modifier une charge ou un salaire ne le change plus.'
                : 'Il est en lecture seule.'}
            </p>
          </div>
          <Button variant="outline" className="min-h-[44px] sm:ml-auto" onClick={() => openSheet({ kind: 'reopen', ym })}>
            Rouvrir
          </Button>
        </div>
      )}
      {!month.closed && compareYM(ym, today) > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-3 sm:px-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" aria-hidden="true" />
          <p className="text-sm text-sky-950">Mois prévisionnel, rempli automatiquement à partir de vos règles. Tout reste modifiable.</p>
        </div>
      )}
    </div>
  );
}
