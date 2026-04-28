// src/lib/pages/budget-tabs/ChargesTab.tsx
// ============================================================================
// 🎯 ChargesTab — Charges + AI Suggestions
// ============================================================================
// Charges are tightly coupled with the AI savings analysis (the "Outils IA"
// reads them) → keep them on the same tab for cognitive proximity.
// ============================================================================

import { useParams } from 'react-router-dom';
import { useBudget } from '@/contexts/BudgetContext';
import ChargesSection from '@/components/budget/ChargesSection';
import EnhancedSuggestions from '@/components/budget/EnhancedSuggestions';

export default function ChargesTab() {
  const { id } = useParams<{ id: string }>();
  const {
    charges,
    handleChargesChange,
    handleOpenMapper,
    mappedTotalsByChargeId,
    budgetLocation,
    budgetCurrency,
    householdSize,
  } = useBudget();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <ChargesSection
        charges={charges}
        onChargesChange={handleChargesChange}
        onLinkTransaction={handleOpenMapper}
        mappedTotals={mappedTotalsByChargeId}
        budgetLocation={budgetLocation}
        budgetCurrency={budgetCurrency}
      />

      {charges.length > 0 && (
        <EnhancedSuggestions
          budgetId={id!}
          charges={charges}
          householdSize={householdSize}
          location={budgetLocation}
          currency={budgetCurrency}
        />
      )}
    </div>
  );
}
