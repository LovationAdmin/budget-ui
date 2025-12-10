import { StatCard } from "./StatCard";
import { Wallet, TrendingDown, PiggyBank, Scale } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Person, Charge, Project, YearlyData, OneTimeIncomes } from '@/utils/importConverter';

interface StatsSectionProps {
  people: Person[];
  charges: Charge[];
  projects: Project[];
  yearlyData: YearlyData;
  oneTimeIncomes: OneTimeIncomes;
  currentYear?: number; 
}

const MONTHS = [ 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc' ];
const FULL_MONTHS_KEYS = [ 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre' ];
const GENERAL_SAVINGS_ID = 'epargne';

const isChargeActive = (charge: Charge, year: number, monthIndex: number): boolean => {
    const monthStart = new Date(year, monthIndex, 1);
    const monthEnd = new Date(year, monthIndex + 1, 0);
    if (charge.startDate && new Date(charge.startDate) > monthEnd) return false;
    if (charge.endDate && new Date(charge.endDate) < monthStart) return false;
    return true;
};

export default function StatsSection({
  people,
  charges,
  projects,
  yearlyData,
  oneTimeIncomes,
  currentYear = new Date().getFullYear(),
}: StatsSectionProps) {
  
  const monthlySalaryIncome = people.reduce((sum, person) => sum + person.salary, 0);
  const yearlyBaseIncome = monthlySalaryIncome * 12;
  const yearlyOneTimeIncome = Object.values(oneTimeIncomes).reduce((sum, amount) => sum + (amount || 0), 0);
  const totalYearlyIncome = yearlyBaseIncome + yearlyOneTimeIncome;

  let yearlyCharges = 0;
  let totalProjectAllocations = 0;

  const chartData = FULL_MONTHS_KEYS.map((monthKey, index) => {
    const monthIncome = monthlySalaryIncome + (oneTimeIncomes[monthKey] || 0);
    
    // Updated: Charge calculation respects dates
    const currentMonthCharges = charges.reduce((sum, charge) => {
        return isChargeActive(charge, currentYear, index) ? sum + charge.amount : sum;
    }, 0);
    
    yearlyCharges += currentMonthCharges;

    const monthProjectAllocation = projects
      .filter(p => p.id !== GENERAL_SAVINGS_ID)
      .reduce((sum, project) => {
        const amount = yearlyData[monthKey]?.[project.id] || 0;
        return sum + amount;
      }, 0);

    totalProjectAllocations += monthProjectAllocation;

    const available = monthIncome - currentMonthCharges;
    const generalSavings = available - monthProjectAllocation;

    return {
      name: MONTHS[index],
      revenus: monthIncome,
      charges: currentMonthCharges,
      projets: monthProjectAllocation,
      general: generalSavings
    };
  });

  const totalGeneralSavings = totalYearlyIncome - yearlyCharges - totalProjectAllocations;

  const incomeBase = totalYearlyIncome > 0 ? totalYearlyIncome : 1;
  const isZeroIncome = totalYearlyIncome === 0;

  const chargesRate = isZeroIncome ? 0 : (yearlyCharges / incomeBase) * 100;
  const projectRate = isZeroIncome ? 0 : (totalProjectAllocations / incomeBase) * 100;
  const generalRate = isZeroIncome ? 0 : (totalGeneralSavings / incomeBase) * 100;

  return (
    <div className="space-y-6 mb-6 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Revenus annuels"
          value={`${totalYearlyIncome.toLocaleString('fr-FR')} €`}
          subtitle="Salaires + Ponctuels"
          icon={Wallet}
          variant="default"
          className="animate-slide-up stagger-1"
        />

        <StatCard
          title="Charges annuelles"
          value={`${yearlyCharges.toLocaleString('fr-FR')} €`}
          subtitle={`${chargesRate.toFixed(0)}% des revenus`}
          icon={TrendingDown}
          variant="danger"
          className="animate-slide-up stagger-2"
        />

        <StatCard
          title="Total Alloué Projets"
          value={`${totalProjectAllocations.toLocaleString('fr-FR')} €`}
          subtitle={`${projectRate.toFixed(0)}% des revenus`}
          icon={PiggyBank}
          variant="accent"
          className="animate-slide-up stagger-3"
        />

        <StatCard
          title="Total Épargne Générale"
          value={`${totalGeneralSavings.toLocaleString('fr-FR')} €`}
          subtitle={`${generalRate.toFixed(0)}% des revenus`}
          icon={Scale} 
          variant={totalGeneralSavings >= 0 ? "success" : "warning"}
          className="animate-slide-up stagger-4"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base font-medium">Répartition Mensuelle (Flux)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dy={10} />
                  <Tooltip cursor={{ fill: "hsl(var(--muted)/0.2)" }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend iconType="circle" />
                  <Bar dataKey="charges" name="Charges Fixes" stackId="a" fill="hsl(var(--destructive))" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="projets" name="Alloc. Projets" stackId="a" fill="hsl(var(--secondary))" />
                  <Bar dataKey="general" name="Épargne Générale" stackId="a" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base font-medium">Comparatif Revenus vs Sorties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dy={10} />
                  <Tooltip cursor={{ fill: "hsl(var(--muted)/0.2)" }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="revenus" name="Revenus Totaux" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="projets" name="Alloué Projets" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}