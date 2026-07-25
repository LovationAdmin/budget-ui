// src/lib/pages/budget-tabs/OverviewTab.tsx
// ============================================================================
// 🎯 OverviewTab — At-a-glance dashboard for the budget
// ============================================================================
// Renders the BudgetHeader (title + year selector) and the StatsSection
// (charts + KPI cards). Lightweight; loads instantly.
// ============================================================================

import { useBudget } from '@/contexts/BudgetContext';
import BudgetHeader from '@/components/budget/BudgetHeader';
import StatsSection from '@/components/budget/StatsSection';
import { Card } from '@/components/ui/card';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Receipt, Target, Sparkles } from 'lucide-react';

export default function OverviewTab() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    budgetTitle,
    setBudgetTitle,
    currentYear,
    handleYearChange,
    people,
    charges,
    projects,
    yearlyData,
    oneTimeIncomes,
    budgetCurrency,
  } = useBudget();

  const empty = people.length === 0 && charges.length === 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <BudgetHeader
        budgetTitle={budgetTitle}
        onTitleChange={setBudgetTitle}
        currentYear={currentYear}
        onYearChange={handleYearChange}
      />

      {empty ? (
        <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-secondary/5 border-dashed">
          <h3 className="font-display text-xl font-semibold mb-2">
            Bienvenue dans ton budget !
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Pour commencer, ajoute les membres du foyer et leurs revenus.
            Tu pourras ensuite saisir tes charges et créer des projets d'épargne.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              onClick={() => navigate(`/budget/${id}/complete/members`)}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Ajouter un membre
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/budget/${id}/complete/charges`)}
              className="gap-2"
            >
              <Receipt className="h-4 w-4" />
              Saisir une charge
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/budget/${id}/complete/projects`)}
              className="gap-2"
            >
              <Target className="h-4 w-4" />
              Créer un projet
            </Button>
          </div>
          <div className="mt-4 pt-4 border-t border-border/50">
            <Button
              variant="ghost"
              onClick={() => navigate(`/budget/${id}/complete/ai`)}
              className="gap-2 text-primary hover:text-primary"
            >
              <Sparkles className="h-4 w-4" />
              Ou laisser l'IA proposer une répartition
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <Card className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm">Recalculer avec l'IA</p>
                <p className="text-xs text-muted-foreground">
                  Laissez l'IA proposer une répartition mensuelle juste et soutenable à partir de votre situation.
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate(`/budget/${id}/complete/ai`)}
              className="gap-2 shrink-0 w-full sm:w-auto"
            >
              <Sparkles className="h-4 w-4" />
              Recalculer avec l'IA
            </Button>
          </Card>

          <StatsSection
            people={people}
            charges={charges}
            projects={projects}
            yearlyData={yearlyData}
            oneTimeIncomes={oneTimeIncomes}
            currentYear={currentYear}
            currency={budgetCurrency}
          />
        </>
      )}
    </div>
  );
}
