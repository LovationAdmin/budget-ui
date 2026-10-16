// src/lib/pages/budget-tabs/AIBudgetTab.tsx
// ============================================================================
// 🎯 AIBudgetTab — « Recalculer avec l'IA » sur un budget existant.
// ============================================================================

import AIBudgetProposal from '@/components/budget/ai/AIBudgetProposal';
import { defineMessages, useT } from '@/i18n/runtime';

const M = defineMessages({
  fr: {
    title: 'Budget IA',
    intro: 'Une répartition proposée par l’IA à partir de votre foyer, de vos charges et de vos objectifs. Rien ne change tant que vous ne validez pas, et les mois d’avant restent intacts.',
  },
  en: {
    title: 'AI budget',
    intro: 'A breakdown suggested by the AI from your household, your bills and your goals. Nothing changes until you apply it, and earlier months stay untouched.',
  },
});

export default function AIBudgetTab() {
  const t = useT(M);
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">{t.title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {t.intro}
        </p>
      </div>
      <AIBudgetProposal />
    </div>
  );
}
