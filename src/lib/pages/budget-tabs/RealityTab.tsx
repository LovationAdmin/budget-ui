// src/lib/pages/budget-tabs/RealityTab.tsx
// ============================================================================
// 🎯 RealityTab — Bank-connected reality check
// ============================================================================
// Compares theoretical budget vs actual bank movements. Includes the demo-mode
// prompt for users who want to try without connecting a bank.
//
// Fixes P1 #10: clarifies "Demo Mode" is bank-only, not budget-wide.
// ============================================================================

import { useBudget } from '@/contexts/BudgetContext';
import { RealityCheck } from '@/components/budget/RealityCheck';
import { DemoModePrompt } from '@/components/budget/DemoModePrompt';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PremiumDemo } from '@/components/premium/PremiumDemo';
import { PREMIUM_ENABLED } from '@/lib/premium';
import { Link } from 'react-router-dom';
import { ArrowRight, Crown, Info } from 'lucide-react';
import { localizedPath } from '@/i18n/locales';
import { defineMessages, useLocale, useT } from '@/i18n/runtime';

const M = defineMessages({
  fr: {
    soonBadge: 'Bientôt avec Premium',
    soonIntro: 'Bientôt, vos comptes bancaires se synchroniseront pour comparer chaque mois ce que votre budget prévoit et ce que vous avez vraiment dépensé, charge par charge. En attendant, essayez la démonstration ci-dessous : les données sont fictives et votre budget n’est pas modifié.',
    learnMore: 'En savoir plus sur Premium',
    liveIntro: 'Comparez l’épargne prévue par votre budget avec l’argent réellement présent sur vos comptes.',
    demoActive: 'Mode Démo Banque actif',
    demoScope: 'Seules les données bancaires sont fictives. Tes membres, charges et projets restent tes vraies données.',
  },
  en: {
    soonBadge: 'Coming soon with Premium',
    soonIntro: 'Soon, your bank accounts will sync so you can compare, every month, what your budget planned with what you actually spent, bill by bill. Meanwhile, try the demo below: the data is fictitious and your budget isn’t changed.',
    learnMore: 'Learn more about Premium',
    liveIntro: 'Compare the savings your budget planned with the money actually in your accounts.',
    demoActive: 'Bank demo mode on',
    demoScope: 'Only the bank data is fictitious. Your members, bills and goals are still your real data.',
  },
});

/** Until Premium launches: what it will do, and the demo on fictitious data. */
function RealitySoon() {
  const t = useT(M);
  const locale = useLocale();
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Crown className="h-3.5 w-3.5" aria-hidden="true" /> {t.soonBadge}
        </span>
        <h1 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold tracking-tight">Reality Check</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {t.soonIntro}
        </p>
        <Button asChild variant="outline" className="mt-3 min-h-[44px]">
          <Link to={localizedPath('/premium', locale)}>{t.learnMore} <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
        </Button>
      </div>
      <PremiumDemo />
    </div>
  );
}

export default function RealityTab() {
  return PREMIUM_ENABLED ? <RealityLive /> : <RealitySoon />;
}

function RealityLive() {
  const t = useT(M);
  const {
    totalGlobalRealized,
    realBankBalance,
    demoBankBalance,
    hasActiveConnection,
    isDemoMode,
    enableDemoMode,
    handleOpenBankManager,
  } = useBudget();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">Reality Check</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {t.liveIntro}
        </p>
      </div>
      {/* Clear scope notice — fixes P1 #10 */}
      {isDemoMode && (
        <Card className="p-3 bg-indigo-50 border-indigo-200">
          <p className="text-sm text-indigo-900 flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
            <span>
              <strong>{t.demoActive}</strong> — {t.demoScope}
            </span>
          </p>
        </Card>
      )}

      <RealityCheck
        totalRealized={totalGlobalRealized}
        bankBalance={isDemoMode ? demoBankBalance : realBankBalance}
        isBankConnected={hasActiveConnection}
        onConnectBank={handleOpenBankManager}
        isDemoMode={isDemoMode}
      />

      {!hasActiveConnection && !isDemoMode && (
        <DemoModePrompt onEnableDemoMode={enableDemoMode} />
      )}
    </div>
  );
}
