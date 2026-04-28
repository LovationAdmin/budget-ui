// src/lib/pages/budget-tabs/MembersTab.tsx
// ============================================================================
// 🎯 MembersTab — Household members + permissions
// ============================================================================
// Combines: PeopleSection (income holders) + MemberManagementSection (access).
// Single source of "who's involved" → fixes P1 #8 (consolidated invite flow).
// ============================================================================

import { useBudget } from '@/contexts/BudgetContext';
import { useAuth } from '@/contexts/AuthContext';
import PeopleSection from '@/components/budget/PeopleSection';
import MemberManagementSection from '@/components/budget/MemberManagementSection';

export default function MembersTab() {
  const { user } = useAuth();
  const {
    budget,
    people,
    handlePeopleChange,
    budgetCurrency,
    refreshMembersOnly,
  } = useBudget();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PeopleSection
        people={people}
        onPeopleChange={handlePeopleChange}
        currency={budgetCurrency}
      />

      {budget && user && (
        <MemberManagementSection
          budget={budget}
          currentUserId={user.id}
          onMemberChange={refreshMembersOnly}
        />
      )}
    </div>
  );
}
