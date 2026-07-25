// src/lib/pages/budget-tabs/AIBudgetTab.tsx
// ============================================================================
// 🎯 AIBudgetTab — « Recalculer avec l'IA » sur un budget existant.
// ============================================================================

import AIBudgetProposal from '@/components/budget/ai/AIBudgetProposal';

export default function AIBudgetTab() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <AIBudgetProposal />
    </div>
  );
}
