// src/components/budget/shared/MonthStepper.tsx
// Previous / next month for the screens that show one month of a catalog
// (Foyer, Charges): the month, its status, and a way back to the reference
// month once the user has moved away from it (or, when the reference month is
// the next one, from the 23rd, a way to the current month).

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBudget } from '@/contexts/BudgetContext';
import type { YM } from '@/lib/budget/types';
import { addMonths, compareYM, formatMonthTitle, monthNameLower } from '@/lib/budget/months';
import { defineMessages, useT } from '@/i18n/runtime';
import { monthStatus } from '../month/MonthHeader';
import { Pill } from './primitives';

const M = defineMessages({
  fr: {
    previousMonth: 'Mois précédent',
    nextMonth: 'Mois suivant',
    backToCurrent: 'Revenir au mois en cours',
    backTo: (month: string) => `Revenir à ${month}`,
    seeMonth: (month: string) => `Voir ${month}`,
  },
  en: {
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    backToCurrent: 'Back to the current month',
    backTo: (month: string) => `Back to ${month}`,
    seeMonth: (month: string) => `See ${month}`,
  },
});

interface MonthStepperProps {
  ym: YM;
  onChange: (ym: YM) => void;
  /** The month the back button returns to (the next month from the 23rd, see homeYM). */
  home: YM;
}

export function MonthStepper({ ym, onChange, home }: MonthStepperProps) {
  const t = useT(M);
  const { engine, today } = useBudget();
  const status = monthStatus(engine.isClosed(ym), ym, today);
  const preparing = ym === home && compareYM(home, today) > 0;
  const shortcut = ym !== home ? home : preparing ? today : undefined;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="icon" className="h-11 w-11 shrink-0" aria-label={t.previousMonth} onClick={() => onChange(addMonths(ym, -1))}>
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <span className="min-w-[150px] text-center font-display text-lg font-extrabold tabular-nums" aria-live="polite">{formatMonthTitle(ym)}</span>
      <Button variant="outline" size="icon" className="h-11 w-11 shrink-0" aria-label={t.nextMonth} onClick={() => onChange(addMonths(ym, 1))}>
        <ChevronRight className="h-5 w-5" />
      </Button>
      <Pill tone={status.tone}>{status.label}</Pill>
      {shortcut && (
        <Button variant="ghost" className="min-h-[44px]" onClick={() => onChange(shortcut)}>
          {preparing ? t.seeMonth(monthNameLower(today)) : home === today ? t.backToCurrent : t.backTo(monthNameLower(home))}
        </Button>
      )}
    </div>
  );
}
