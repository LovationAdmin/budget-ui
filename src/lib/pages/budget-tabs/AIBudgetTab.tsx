// src/lib/pages/budget-tabs/AIBudgetTab.tsx
// ============================================================================
// 🎯 AIBudgetTab — « Recalculer avec l'IA » sur un budget existant.
// ============================================================================

import AIBudgetProposal from '@/components/budget/ai/AIBudgetProposal';

export default function AIBudgetTab() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">Budget IA</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Une répartition proposée par l’IA à partir de votre foyer, de vos charges et de vos objectifs. Rien ne change tant que vous ne validez pas, et les mois d’avant restent intacts.
        </p>
      </div>
      <AIBudgetProposal />
    </div>
  );
}
