// src/lib/pages/budget-tabs/CalendarTab.tsx
// ============================================================================
// 🎯 CalendarTab — Monthly editing (the heart of the app)
// ============================================================================
// Responsive switch:
//   - Desktop (md+): the existing <MonthlyTable /> with horizontal scroll
//   - Mobile (< md): the new <MobileMonthlyView /> with collapsible cards
//
// Fixes P0 #2 — the most important UX gain.
// ============================================================================

import { useBudget } from '@/contexts/BudgetContext';
import MonthlyTable from '@/components/budget/MonthlyTable';
import MobileMonthlyView from '@/components/budget/MobileMonthlyView';

export default function CalendarTab() {
  const {
    currentYear,
    handleYearChange,
    people,
    charges,
    projects,
    yearlyData,
    yearlyExpenses,
    oneTimeIncomes,
    monthComments,
    projectComments,
    lockedMonths,
    projectCarryOvers,
    budgetCurrency,
    handleYearlyDataChange,
    handleYearlyExpensesChange,
    handleOneTimeIncomesChange,
    handleMonthCommentsChange,
    handleProjectCommentsChange,
    handleLockedMonthsChange,
  } = useBudget();

  const sharedProps = {
    currentYear,
    people,
    charges,
    projects,
    yearlyData,
    yearlyExpenses,
    oneTimeIncomes,
    monthComments,
    projectComments,
    lockedMonths,
    projectCarryOvers,
    currency: budgetCurrency,
    onYearlyDataChange: handleYearlyDataChange,
    onYearlyExpensesChange: handleYearlyExpensesChange,
    onOneTimeIncomesChange: handleOneTimeIncomesChange,
    onMonthCommentsChange: handleMonthCommentsChange,
    onProjectCommentsChange: handleProjectCommentsChange,
    onLockedMonthsChange: handleLockedMonthsChange,
  };

  return (
    <div className="animate-in fade-in duration-200">
      {/* Desktop view */}
      <div className="hidden md:block">
        <MonthlyTable {...sharedProps} onYearChange={handleYearChange} />
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        <MobileMonthlyView {...sharedProps} />
      </div>
    </div>
  );
}
