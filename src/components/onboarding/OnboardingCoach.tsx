// src/components/onboarding/OnboardingCoach.tsx
// ============================================================================
// 🎯 OnboardingCoach — Non-blocking progress checklist
// ============================================================================
// Fixes P0 #4: replaces the 8-step modal tutorial with a Linear/Slack-style
// checklist that:
//  - Doesn't block the UI
//  - Reflects REAL progress (computed from data, not from "I clicked Next")
//  - Auto-collapses when 100% complete
//  - Persists dismissal in user profile (not just localStorage)
//
// The hook `useOnboardingProgress` derives steps from actual budget data.
// ============================================================================

import { useState, useMemo, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  ChevronUp,
  ChevronDown,
  Sparkles,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface OnboardingStep {
  id: string;
  label: string;
  description?: string;
  completed: boolean;
  /** Optional CTA: scroll to section / open modal / etc. */
  onAction?: () => void;
  actionLabel?: string;
}

interface OnboardingCoachProps {
  steps: OnboardingStep[];
  onDismiss?: () => void;
  /** Initial collapsed state (defaults to expanded) */
  defaultCollapsed?: boolean;
  className?: string;
  storageKey?: string;
}

export function OnboardingCoach({
  steps,
  onDismiss,
  defaultCollapsed = false,
  className,
  storageKey = 'budget-coach-collapsed',
}: OnboardingCoachProps) {
  // Persisted collapse state
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return defaultCollapsed;
    const stored = localStorage.getItem(storageKey);
    return stored === '1' ? true : defaultCollapsed;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(storageKey, collapsed ? '1' : '0');
  }, [collapsed, storageKey]);

  const completedCount = useMemo(
    () => steps.filter((s) => s.completed).length,
    [steps]
  );
  const total = steps.length;
  const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const isComplete = completedCount === total && total > 0;

  // Auto-collapse on completion
  useEffect(() => {
    if (isComplete && !collapsed) {
      const t = setTimeout(() => setCollapsed(true), 3000);
      return () => clearTimeout(t);
    }
  }, [isComplete, collapsed]);

  if (total === 0) return null;

  return (
    <aside
      className={cn(
        'fixed bottom-4 left-4 z-30 w-[min(360px,calc(100vw-2rem))]',
        'rounded-2xl border border-border/60 bg-card/95 shadow-floating backdrop-blur-md',
        'transition-all duration-300',
        collapsed && 'w-auto',
        className
      )}
      aria-label="Guide de configuration"
    >
      {/* Header — always visible */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center gap-3 rounded-2xl p-3 text-left hover:bg-accent/40 transition-colors min-h-[48px]"
        aria-expanded={!collapsed}
      >
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-soft',
            isComplete
              ? 'bg-success text-success-foreground'
              : 'bg-gradient-to-br from-primary to-[hsl(35_90%_65%)] text-primary-foreground'
          )}
        >
          {isComplete ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-sm">
              {isComplete ? 'Tout est prêt !' : 'Configurer mon budget'}
            </span>
            {!collapsed && (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
            {collapsed && (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          {!isComplete && (
            <div className="mt-1 flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-[hsl(35_90%_65%)] transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {completedCount}/{total}
              </span>
            </div>
          )}
        </div>

        {onDismiss && !collapsed && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onDismiss();
              }
            }}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Masquer le guide"
          >
            <X className="h-3.5 w-3.5" />
          </span>
        )}
      </button>

      {/* Steps */}
      {!collapsed && !isComplete && (
        <ol className="space-y-1 px-2 pb-3 max-h-[60vh] overflow-y-auto">
          {steps.map((step, idx) => (
            <li key={step.id}>
              <button
                onClick={step.onAction}
                disabled={!step.onAction}
                className={cn(
                  'group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-all min-h-[48px]',
                  step.completed
                    ? 'opacity-60 cursor-default'
                    : 'hover:bg-accent/60'
                )}
              >
                <span className="mt-0.5 shrink-0">
                  {step.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </span>
                <span className="flex-1 min-w-0">
                  <span
                    className={cn(
                      'block text-sm',
                      step.completed
                        ? 'text-muted-foreground line-through'
                        : 'text-foreground font-medium'
                    )}
                  >
                    {idx + 1}. {step.label}
                  </span>
                  {step.description && !step.completed && (
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      {step.description}
                    </span>
                  )}
                </span>
                {step.actionLabel && !step.completed && (
                  <span className="text-xs font-medium text-primary group-hover:underline shrink-0">
                    {step.actionLabel} →
                  </span>
                )}
              </button>
            </li>
          ))}
        </ol>
      )}

      {!collapsed && isComplete && (
        <div className="px-4 pb-4 pt-1">
          <p className="text-xs text-muted-foreground">
            Bravo ! Tu peux fermer ce guide.
          </p>
          {onDismiss && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDismiss}
              className="mt-2 w-full"
            >
              Fermer
            </Button>
          )}
        </div>
      )}
    </aside>
  );
}

// ============================================================================
// 🎯 Hook: derive onboarding progress from actual budget data
// ============================================================================
interface BudgetData {
  peopleCount: number;
  chargesCount: number;
  projectsCount: number;
  hasFilledMonthlyData: boolean;
  hasRunSuggestions: boolean;
}

export function useOnboardingProgress(
  data: BudgetData,
  actions: {
    scrollToPeople?: () => void;
    scrollToCharges?: () => void;
    scrollToProjects?: () => void;
    scrollToCalendar?: () => void;
    scrollToSuggestions?: () => void;
  }
): OnboardingStep[] {
  return useMemo(
    () => [
      {
        id: 'add-member',
        label: 'Ajoute un membre du foyer',
        description: 'Pour calculer tes revenus mensuels',
        completed: data.peopleCount > 0,
        onAction: actions.scrollToPeople,
        actionLabel: 'Ouvrir',
      },
      {
        id: 'add-charge',
        label: 'Ajoute ta première charge',
        description: 'Loyer, abonnements, factures…',
        completed: data.chargesCount > 0,
        onAction: actions.scrollToCharges,
        actionLabel: 'Ouvrir',
      },
      {
        id: 'add-project',
        label: 'Crée un projet d’épargne',
        description: 'Vacances, achat, fonds de sécurité',
        completed: data.projectsCount > 0,
        onAction: actions.scrollToProjects,
        actionLabel: 'Ouvrir',
      },
      {
        id: 'fill-month',
        label: 'Remplis le mois en cours',
        description: 'Alloue tes revenus aux projets',
        completed: data.hasFilledMonthlyData,
        onAction: actions.scrollToCalendar,
        actionLabel: 'Ouvrir',
      },
      {
        id: 'run-ai',
        label: 'Lance l’analyse IA',
        description: 'Trouve des économies sur tes charges',
        completed: data.hasRunSuggestions,
        onAction: actions.scrollToSuggestions,
        actionLabel: 'Lancer',
      },
    ],
    [data, actions]
  );
}
