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
import { Info } from 'lucide-react';

export default function RealityTab() {
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
      {/* Clear scope notice — fixes P1 #10 */}
      {isDemoMode && (
        <Card className="p-3 bg-indigo-50 border-indigo-200">
          <p className="text-sm text-indigo-900 flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
            <span>
              <strong>Mode Démo Banque actif</strong> — Seules les données
              bancaires sont fictives. Tes membres, charges et projets restent
              tes vraies données.
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
