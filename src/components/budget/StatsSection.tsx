// src/components/budget/StatsSection.tsx
// VERSION MOBILE-OPTIMIZED (Charts plus lisibles sur petits écrans)
// ✅ CORRIGÉ : Support complet multi-devises (USD, CAD, GBP, etc.)

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
  currency?: string; // ✅ AJOUTÉ
}

const SHORT_MONTHS = [ 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc' ];
const FULL_MONTHS_KEYS = [ 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre' ];
const GENERAL_SAVINGS_ID = 'epargne';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const isChargeActive = (charge: Charge, year: number, monthIndex: number): boolean => {
    const monthStart = new Date(year, monthIndex, 1);
    const monthEnd = new Date(year, monthIndex + 1, 0);

    if (charge.startDate) {
        const start = new Date(charge.startDate);
        if (start > monthEnd) return false;
    }

    if (charge.endDate) {
        const end = new Date(charge.endDate);
        if (end < monthStart) return false;
    }

    return true;
};

const isPersonActive = (person: Person, year: number, monthIndex: number): boolean => {
    const monthStart = new Date(year, monthIndex, 1);
    const monthEnd = new Date(year, monthIndex + 1, 0);

    if (person.startDate) {
        const start = new Date(person.startDate);
        if (start > monthEnd) return false;
    }

    if (person.endDate) {
        const end = new Date(person.endDate);
        if (end < monthStart) return false;
    }

    return true;
};

// ✅ HELPER: Get correct symbol for any currency code
function getCurrencySymbol(code?: string): string {
  switch (code) {
    case 'USD': return '$';
    case 'CAD': return '$';
    case 'GBP': return '£';
    case 'CHF': return 'CHF';
    case 'EUR': return '€';
    default: return '€';
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function StatsSection({
  people,
  charges,
  projects,
  yearlyData,
  oneTimeIncomes,
  currentYear = new Date().getFullYear(),
  currency = 'EUR' // ✅ AJOUTÉ avec valeur par défaut
}: StatsSectionProps) {
  
  // ✅ Symbole de devise dynamique
  const currencySymbol = getCurrencySymbol(currency);
  
  // 1. Calculate data for every month individually
  const chartData = FULL_MONTHS_KEYS.map((monthKey, index) => {
    
    // --- A. REVENUS (Based on Person dates + OneTime) ---
    const monthlySalary = people.reduce((sum, person) => {
        return isPersonActive(person, currentYear, index) ? sum + person.salary : sum;
    }, 0);
    const monthlyOneTime = oneTimeIncomes[monthKey] || 0;
    const totalMonthIncome = monthlySalary + monthlyOneTime;

    // --- B. CHARGES (Based on Charge dates) ---
    const totalMonthCharges = charges.reduce((sum, charge) => {
        return isChargeActive(charge, currentYear, index) ? sum + charge.amount : sum;
    }, 0);

    // --- C. PROJETS (Based on yearlyData allocations) ---
    const totalMonthProjects = projects
      .filter(p => p.id !== GENERAL_SAVINGS_ID)
      .reduce((sum, project) => {
        const amount = yearlyData[monthKey]?.[project.id] || 0;
        return sum + amount;
      }, 0);

    // --- D. EPARGNE GENERALE (Calculated Residual) ---
    const available = totalMonthIncome - totalMonthCharges;
    const totalMonthGeneralSavings = available - totalMonthProjects;

    return {
      name: SHORT_MONTHS[index], // Short name for X-Axis
      fullName: monthKey,        // Key for references
      revenus: totalMonthIncome,
      charges: totalMonthCharges,
      projets: totalMonthProjects,
      general: totalMonthGeneralSavings,
      totalSaved: totalMonthProjects + totalMonthGeneralSavings // For graph stacking if needed
    };
  });

  // 2. Aggregate Totals for Cards
  const totalYearlyIncome = chartData.reduce((acc, item) => acc + item.revenus, 0);
  const totalYearlyCharges = chartData.reduce((acc, item) => acc + item.charges, 0);
  const totalProjectAllocations = chartData.reduce((acc, item) => acc + item.projets, 0);
  const totalGeneralSavings = chartData.reduce((acc, item) => acc + item.general, 0);

  // 3. Ratios
  const incomeBase = totalYearlyIncome > 0 ? totalYearlyIncome : 1;
  const isZeroIncome = totalYearlyIncome === 0;

  const chargesRate = isZeroIncome ? 0 : (totalYearlyCharges / incomeBase) * 100;
  const projectRate = isZeroIncome ? 0 : (totalProjectAllocations / incomeBase) * 100;
  const generalRate = isZeroIncome ? 0 : (totalGeneralSavings / incomeBase) * 100;

  return (
    <div className="space-y-6 mb-6 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* REVENUS */}
        <StatCard
          title="Revenus annuels"
          value={`${totalYearlyIncome.toLocaleString('fr-FR')} ${currencySymbol}`}
          subtitle="Salaires + Ponctuels"
          icon={Wallet}
          variant="default"
          className="animate-slide-up stagger-1"
        />

        {/* CHARGES */}
        <StatCard
          title="Charges annuelles"
          value={`${totalYearlyCharges.toLocaleString('fr-FR')} ${currencySymbol}`}
          subtitle={`${chargesRate.toFixed(0)}% des revenus`}
          icon={TrendingDown}
          variant="danger"
          className="animate-slide-up stagger-2"
        />

        {/* PROJETS */}
        <StatCard
          title="Total Alloué Projets"
          value={`${totalProjectAllocations.toLocaleString('fr-FR')} ${currencySymbol}`}
          subtitle={`${projectRate.toFixed(0)}% des revenus`}
          icon={PiggyBank}
          variant="accent"
          className="animate-slide-up stagger-3"
        />

        {/* EPARGNE */}
        <StatCard
          title="Total Épargne Générale"
          value={`${totalGeneralSavings.toLocaleString('fr-FR')} ${currencySymbol}`}
          subtitle={`${generalRate.toFixed(0)}% des revenus`}
          icon={Scale} 
          variant={totalGeneralSavings >= 0 ? "success" : "warning"}
          className="animate-slide-up stagger-4"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* CHART 1: FLUX (Charges vs Projects vs Savings) */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Répartition Mensuelle (Flux)</CardTitle>
          </CardHeader>
          <CardContent>
            {/* ✅ MOBILE FIX: Hauteur plus grande sur mobile pour meilleure lisibilité */}
            <div className="h-[280px] sm:h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {/* ✅ MOBILE FIX: Margin left moins agressive pour éviter débordement */}
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  {/* ✅ MOBILE FIX: Font-size légèrement augmentée (11 au lieu de 10) */}
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} 
                    dy={5} 
                  />
                  {/* ✅ MOBILE FIX: Padding ajouté au tooltip */}
                  <Tooltip 
                    cursor={{ fill: "hsl(var(--muted)/0.2)" }} 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                      fontSize: '12px',
                      padding: '8px 12px'
                    }}
                    formatter={(value: number) => [`${value.toLocaleString('fr-FR')} ${currencySymbol}`, '']}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                  <Bar dataKey="charges" name="Charges" stackId="a" fill="hsl(var(--destructive))" radius={[0, 0, 2, 2]} />
                  <Bar dataKey="projets" name="Projets" stackId="a" fill="hsl(var(--secondary))" />
                  <Bar dataKey="general" name="Épargne" stackId="a" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* CHART 2: REVENUS VS CAPACITE D'EPARGNE */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Comparatif Revenus vs Sorties</CardTitle>
          </CardHeader>
          <CardContent>
            {/* ✅ MOBILE FIX: Hauteur plus grande sur mobile */}
            <div className="h-[280px] sm:h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {/* ✅ MOBILE FIX: Margin left optimisée */}
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  {/* ✅ MOBILE FIX: Font-size augmentée */}
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} 
                    dy={5} 
                  />
                  {/* ✅ MOBILE FIX: Tooltip avec padding */}
                  <Tooltip 
                    cursor={{ fill: "hsl(var(--muted)/0.2)" }} 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                      fontSize: '12px',
                      padding: '8px 12px'
                    }}
                    formatter={(value: number) => [`${value.toLocaleString('fr-FR')} ${currencySymbol}`, '']}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                  <Bar dataKey="revenus" name="Revenus" fill="hsl(var(--success))" radius={[2, 2, 0, 0]} barSize={15} />
                  {/* We combine Projects + General Savings into one visual bar for 'Savings Capacity' */}
                  <Bar dataKey="totalSaved" name="Capacité Épargne" fill="hsl(var(--secondary))" radius={[2, 2, 0, 0]} barSize={15} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}