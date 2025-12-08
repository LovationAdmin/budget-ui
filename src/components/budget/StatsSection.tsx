import { StatCard } from "./StatCard";
import { Wallet, TrendingDown, TrendingUp, PiggyBank } from "lucide-react";
import type { Person, Charge, Project, YearlyData, OneTimeIncomes } from '@/utils/importConverter';

interface StatsSectionProps {
  people: Person[];
  charges: Charge[];
  projects: Project[];
  yearlyData: YearlyData;
  oneTimeIncomes: OneTimeIncomes;
}

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export default function StatsSection({
  people,
  charges,
  projects,
  yearlyData,
  oneTimeIncomes,
}: StatsSectionProps) {
  // Calculate total monthly income from salaries
  const monthlySalaryIncome = people.reduce((sum, person) => sum + person.salary, 0);

  // Calculate total one-time incomes for the year
  const yearlyOneTimeIncome = Object.values(oneTimeIncomes).reduce((sum, amount) => sum + (amount || 0), 0);

  // Calculate total yearly income (salaries * 12 + one-time)
  const yearlyIncome = (monthlySalaryIncome * 12) + yearlyOneTimeIncome;

  // Calculate total monthly charges
  const monthlyCharges = charges.reduce((sum, charge) => sum + charge.amount, 0);

  // Calculate total yearly charges
  const yearlyCharges = monthlyCharges * 12;

  // Calculate total savings allocated to projects
  let totalProjectSavings = 0;
  MONTHS.forEach(month => {
    const monthData = yearlyData[month] || {};
    projects.forEach(project => {
      totalProjectSavings += monthData[project.id] || 0;
    });
  });

  // Calculate monthly balance (after charges, before projects)
  const monthlyBalance = monthlySalaryIncome - monthlyCharges;

  // Calculate yearly balance
  const yearlyBalance = yearlyIncome - yearlyCharges - totalProjectSavings;

  // Calculate savings rate
  const savingsRate = yearlyIncome > 0 ? (totalProjectSavings / yearlyIncome) * 100 : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6 animate-fade-in">
      <StatCard
        title="Revenus annuels"
        value={`${yearlyIncome.toLocaleString('fr-FR')} €`}
        subtitle={`${monthlySalaryIncome.toLocaleString('fr-FR')} €/mois`}
        icon={Wallet}
        trend={yearlyOneTimeIncome > 0 ? {
          value: ((yearlyOneTimeIncome / yearlyIncome) * 100),
          isPositive: true
        } : undefined}
        variant="default"
        className="animate-slide-up stagger-1"
      />

      <StatCard
        title="Charges annuelles"
        value={`${yearlyCharges.toLocaleString('fr-FR')} €`}
        subtitle={`${monthlyCharges.toLocaleString('fr-FR')} €/mois`}
        icon={TrendingDown}
        variant="danger"
        className="animate-slide-up stagger-2"
      />

      <StatCard
        title="Solde disponible"
        value={`${yearlyBalance.toLocaleString('fr-FR')} €`}
        subtitle={`${monthlyBalance.toLocaleString('fr-FR')} €/mois`}
        icon={TrendingUp}
        trend={{
          value: savingsRate,
          isPositive: savingsRate > 20
        }}
        variant={yearlyBalance >= 0 ? "success" : "danger"}
        className="animate-slide-up stagger-3"
      />

      <StatCard
        title="Épargne projets"
        value={`${totalProjectSavings.toLocaleString('fr-FR')} €`}
        subtitle={`${savingsRate.toFixed(1)}% des revenus`}
        icon={PiggyBank}
        variant="accent"
        className="animate-slide-up stagger-4"
      />
    </div>
  );
}
