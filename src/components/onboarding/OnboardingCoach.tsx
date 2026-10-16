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
import { defineMessages, useT } from '@/i18n/runtime';

const M = defineMessages({
  fr: {
    guide: 'Guide de configuration',
    ready: 'Tout est prêt !',
    setUp: 'Configurer mon budget',
    hide: 'Masquer le guide',
    done: 'Bravo ! Tu peux fermer ce guide.',
    close: 'Fermer',
    open: 'Ouvrir',
    run: 'Lancer',
    members: ['Ajoute les membres du foyer', 'Leur salaire net, pour calculer la part de chacun'],
    contributions: ['Choisis qui met quoi dans le pot commun', 'Tout le salaire, un montant fixe ou un pourcentage'],
    charges: ['Ajoute tes charges', 'Loyer, abonnements, cantine, taxe annuelle…'],
    savings: ['Crée une épargne', 'Vacances, fonds d’urgence, projets'],
    ai: ['Lance l’analyse IA', 'Trouve des économies sur tes charges'],
  },
  en: {
    guide: 'Setup guide',
    ready: 'All set!',
    setUp: 'Set up my budget',
    hide: 'Hide the guide',
    done: 'Well done! You can close this guide.',
    close: 'Close',
    open: 'Open',
    run: 'Run',
    members: ['Add the household members', 'Their take-home pay, to work out each person’s share'],
    contributions: ['Choose who puts what into the joint pot', 'All their pay, a fixed amount or a percentage'],
    charges: ['Add your bills', 'Rent, subscriptions, school lunches, yearly tax…'],
    savings: ['Create a savings pot', 'Holidays, emergency fund, goals'],
    ai: ['Run the AI analysis', 'Find savings on your bills'],
  },
});

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
  const t = useT(M);
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
        'transition-[width] duration-300',
        collapsed && 'w-auto',
        className
      )}
      aria-label={t.guide}
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
              {isComplete ? t.ready : t.setUp}
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
            aria-label={t.hide}
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
            {t.done}
          </p>
          {onDismiss && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDismiss}
              className="mt-2 w-full"
            >
              {t.close}
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
  /** At least one member has an explicit contribution rule. */
  contributionsSet: boolean;
  hasRunSuggestions: boolean;
}

export function useOnboardingProgress(
  data: BudgetData,
  actions: {
    goToMembers?: () => void;
    goToCharges?: () => void;
    goToProjects?: () => void;
    goToContributions?: () => void;
    goToSuggestions?: () => void;
  }
): OnboardingStep[] {
  const t = useT(M);
  return useMemo(
    () => [
      {
        id: 'add-member',
        label: t.members[0],
        description: t.members[1],
        completed: data.peopleCount > 0,
        onAction: actions.goToMembers,
        actionLabel: t.open,
      },
      {
        id: 'set-contributions',
        label: t.contributions[0],
        description: t.contributions[1],
        completed: data.contributionsSet,
        onAction: actions.goToContributions,
        actionLabel: t.open,
      },
      {
        id: 'add-charge',
        label: t.charges[0],
        description: t.charges[1],
        completed: data.chargesCount > 0,
        onAction: actions.goToCharges,
        actionLabel: t.open,
      },
      {
        id: 'add-project',
        label: t.savings[0],
        description: t.savings[1],
        completed: data.projectsCount > 0,
        onAction: actions.goToProjects,
        actionLabel: t.open,
      },
      {
        id: 'run-ai',
        label: t.ai[0],
        description: t.ai[1],
        completed: data.hasRunSuggestions,
        onAction: actions.goToSuggestions,
        actionLabel: t.run,
      },
    ],
    [data, actions, t]
  );
}
