import { StatCard } from "./StatCard";
import { Wallet, TrendingDown, TrendingUp, PiggyBank } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Person, Charge, Project, YearlyData, OneTimeIncomes } from '@/utils/importConverter';

interface StatsSectionProps {
  people: Person[];
  charges: Charge[];
  projects: Project[];
  yearlyData: YearlyData;
  oneTimeIncomes: OneTimeIncomes;
}

const MONTHS = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
];

const FULL_MONTHS_KEYS = [
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
  // Calculate Totals
  const monthlySalaryIncome = people.reduce((sum, person) => sum + person.salary, 0);
  const yearlyOneTimeIncome = Object.values(oneTimeIncomes).reduce((sum, amount) => sum + (amount || 0), 0);
  const yearlyIncome = (monthlySalaryIncome * 12) + yearlyOneTimeIncome;
  const monthlyCharges = charges.reduce((sum, charge) => sum + charge.amount, 0);
  const yearlyCharges = monthlyCharges * 12;

  let totalProjectSavings = 0;
  
  // Data for Charts
  const chartData = FULL_MONTHS_KEYS.map((monthKey, index) => {
    const monthData = yearlyData[monthKey] || {};
    
    // Calculate Project Savings for this month
    const monthProjectSavings = projects.reduce((sum, project) => {
      return sum + (monthData[project.id] || 0);
    }, 0);
    totalProjectSavings += monthProjectSavings;

    // Calculate One Time Income for this month
    const monthOneTime = oneTimeIncomes[monthKey] || 0;

    return {
      name: MONTHS[index],
      revenus: monthlySalaryIncome + monthOneTime,
      depenses: monthlyCharges + monthProjectSavings, // Considering savings as money "out" of checking account
      epargne: monthProjectSavings
    };
  });

  const yearlyBalance = yearlyIncome - yearlyCharges - totalProjectSavings;
  const monthlyBalance = monthlySalaryIncome - monthlyCharges;
  const savingsRate = yearlyIncome > 0 ? (totalProjectSavings / yearlyIncome) * 100 : 0;

  return (
    <div className="space-y-6 mb-6 animate-fade-in">
      {/* 1. Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Revenus annuels"
          value={`${yearlyIncome.toLocaleString('fr-FR')} €`}
          subtitle={`${monthlySalaryIncome.toLocaleString('fr-FR')} €/mois`}
          icon={Wallet}
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

      {/* 2. Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base font-medium">Évolution Mensuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                    dy={10}
                  />
                  <Tooltip 
                    cursor={{ fill: "hsl(var(--muted)/0.2)" }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="revenus" name="Revenus" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="depenses" name="Dépenses + Épargne" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base font-medium">Épargne par Mois</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                    dy={10}
                  />
                  <Tooltip 
                    cursor={{ fill: "hsl(var(--muted)/0.2)" }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="epargne" name="Épargne Réalisée" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}