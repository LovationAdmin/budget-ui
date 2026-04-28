// src/lib/pages/budget-tabs/ProjectsTab.tsx
// ============================================================================
// 🎯 ProjectsTab — Saving goals
// ============================================================================

import { useBudget } from '@/contexts/BudgetContext';
import ProjectsSection from '@/components/budget/ProjectsSection';

export default function ProjectsTab() {
  const {
    projects,
    handleProjectsChange,
    yearlyData,
    currentYear,
    projectCarryOvers,
    budgetCurrency,
  } = useBudget();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <ProjectsSection
        projects={projects}
        onProjectsChange={handleProjectsChange}
        yearlyData={yearlyData}
        currentYear={currentYear}
        projectCarryOvers={projectCarryOvers}
        currency={budgetCurrency}
      />
    </div>
  );
}
