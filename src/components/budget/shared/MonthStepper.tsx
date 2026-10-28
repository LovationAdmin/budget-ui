// src/components/budget/shared/MonthStepper.tsx
// Previous / next month for the screens that show one month of a catalog
// (Foyer, Charges): the month, its status, and a way back to the reference
// month once the user has moved away from it.

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBudget } from '@/contexts/BudgetContext';
import type { YM } from '@/lib/budget/types';
import { addMonths, formatMonthTitle } from '@/lib/budget/months';
import { defineMessages, useT } from '@/i18n/runtime';
import { monthStatus } from '../month/MonthHeader';
import { Pill } from './primitives';

const M = defineMessages({
  fr: {
    previousMonth: 'Mois précédent',
    nextMonth: 'Mois suivant',
    backToCurrent: 'Revenir au mois en cours',
  },
  en: {
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    backToCurrent: 'Back to the current month',
  },
});

interface MonthStepperProps {
  ym: YM;
  onChange: (ym: YM) => void;
  /** The month « Revenir au mois en cours » goes back to. */
  home: YM;
}

export function MonthStepper({ ym, onChange, home }: MonthStepperProps) {
  const t = useT(M);
  const { engine, today } = useBudget();
  const status = monthStatus(engine.isClosed(ym), ym, today);

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
      {ym !== home && (
        <Button variant="ghost" className="min-h-[44px]" onClick={() => onChange(home)}>
          {t.backToCurrent}
        </Button>
      )}
    </div>
  );
}
