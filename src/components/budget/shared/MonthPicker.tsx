// src/components/budget/shared/MonthPicker.tsx
// Month-precision picker (budgets never need a day). A field button that
// unfolds a year / 12-month grid inline — works the same inside side panels
// and bottom sheets, and spells month names out (no numeric ambiguity).

import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { YM } from '@/lib/budget/types';
import { compareYM, formatMonthLong, makeYM, monthNamesLower, monthNamesShort, yearOf } from '@/lib/budget/months';
import { defineMessages, useT } from '@/i18n/runtime';

const M = defineMessages({
  fr: {
    field: (label: string, month: string) => `${label} : ${month}`,
    prevYear: 'Année précédente',
    nextYear: 'Année suivante',
  },
  en: {
    field: (label: string, month: string) => `${label}: ${month}`,
    prevYear: 'Previous year',
    nextYear: 'Next year',
  },
});

interface MonthPickerProps {
  id?: string;
  value: YM;
  onChange: (ym: YM) => void;
  min?: YM;
  max?: YM;
  /** Prefix shown in the field, e.g. "Dernier mois :" */
  prefix?: string;
  ariaLabel?: string;
}

export function MonthPicker({ id, value, onChange, min, max, prefix, ariaLabel }: MonthPickerProps) {
  const t = useT(M);
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(yearOf(value));
  const minYear = min ? yearOf(min) : yearOf(value) - 10;
  const maxYear = max ? yearOf(max) : yearOf(value) + 10;

  return (
    <div>
      <button
        id={id}
        type="button"
        aria-expanded={open}
        aria-label={ariaLabel ? t.field(ariaLabel, formatMonthLong(value)) : undefined}
        onClick={() => {
          setYear(yearOf(value));
          setOpen((o) => !o);
        }}
        className="flex h-12 w-full items-center gap-3 rounded-xl border border-input bg-background px-4 text-left text-base transition-colors hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <CalendarDays className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        <span className="flex-1">
          {prefix && <span className="text-muted-foreground">{prefix} </span>}
          {formatMonthLong(value)}
        </span>
      </button>
      {open && (
        <div className="mt-2 rounded-xl border border-border bg-card p-3 shadow-card">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label={t.prevYear}
              disabled={year <= minYear}
              onClick={() => setYear((y) => y - 1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-muted disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-display text-base font-bold tabular-nums">{year}</span>
            <button
              type="button"
              aria-label={t.nextYear}
              disabled={year >= maxYear}
              onClick={() => setYear((y) => y + 1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-muted disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {monthNamesShort().map((label, i) => {
              const ym = makeYM(year, i);
              const disabled = (min && compareYM(ym, min) < 0) || (max && compareYM(ym, max) > 0);
              const selected = ym === value;
              return (
                <button
                  key={label}
                  type="button"
                  aria-label={`${monthNamesLower()[i]} ${year}`}
                  aria-pressed={selected}
                  disabled={!!disabled}
                  onClick={() => {
                    onChange(ym);
                    setOpen(false);
                  }}
                  className={cn(
                    'min-h-[42px] rounded-lg border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-35',
                    selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:bg-muted',
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
