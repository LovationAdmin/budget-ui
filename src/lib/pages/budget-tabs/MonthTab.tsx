// src/lib/pages/budget-tabs/MonthTab.tsx
// ============================================================================
// « Mois » — the heart of the app. One month at a time: who puts what into the
// household pot, the charges of the month, the savings, what is left, and
// what changed since last month. The month lives in the URL (?m=YYYY-MM) so
// back/forward and links work.
// ============================================================================

import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useBudget } from '@/contexts/BudgetContext';
import { addMonths, isYM } from '@/lib/budget/months';
import type { YM } from '@/lib/budget/types';
import { MonthHeader } from '@/components/budget/month/MonthHeader';
import { ChargesCard, IncomeCard, SavingsCard } from '@/components/budget/month/MonthSections';
import { ChangesCard, NoteCard, SummaryCard } from '@/components/budget/month/MonthSidebar';

export default function MonthTab() {
  const { engine, today, openSheet } = useBudget();
  const [params, setParams] = useSearchParams();
  const requested = params.get('m');
  const ym: YM = isYM(requested) ? requested : today;

  const setYm = useCallback(
    (next: YM) => {
      setParams((p) => {
        const copy = new URLSearchParams(p);
        if (next === today) copy.delete('m');
        else copy.set('m', next);
        return copy;
      });
    },
    [setParams, today],
  );

  const month = engine.month(ym);
  const prevMonth = engine.month(addMonths(ym, -1));

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-200">
      <MonthHeader ym={ym} onChange={setYm} />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="order-2 flex min-w-0 flex-col gap-5 lg:order-1">
          <IncomeCard month={month} />
          <ChargesCard month={month} prevMonth={prevMonth} />
          <SavingsCard month={month} />
          <div className="lg:hidden">
            <NoteCard month={month} idSuffix="m" />
          </div>
        </div>
        <aside className="order-1 flex min-w-0 flex-col gap-5 lg:order-2 lg:sticky lg:top-24">
          <SummaryCard month={month} />
          <ChangesCard ym={ym} />
          <div className="hidden lg:block">
            <NoteCard month={month} idSuffix="d" />
          </div>
        </aside>
      </div>

      {!month.closed && (
        <button
          type="button"
          aria-label="Ajouter au mois"
          onClick={() => openSheet({ kind: 'addMenu', ym })}
          className="lg:hidden fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-floating transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Plus className="h-7 w-7" />
        </button>
      )}
    </div>
  );
}
