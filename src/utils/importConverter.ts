// Define Types
export interface Person {
  id: string;
  name: string;
  salary: number;
  // NEW: Date limits for people (e.g. start/end of contract)
  startDate?: string; // Format: "YYYY-MM-DD"
  endDate?: string;   // Format: "YYYY-MM-DD"
}

export interface Charge {
  id: string;
  label: string;
  amount: number;
  // Date limits for charges
  startDate?: string; 
  endDate?: string;   
}

export interface Project {
  id: string;
  label: string;
  // NEW: Target amount for the project goal
  targetAmount?: number;
}

export interface YearlyData {
  [month: string]: { [projectId: string]: number };
}

export interface OneTimeIncomes {
  [month: string]: number;
}

export interface MonthComments {
  [month: string]: string;
}

export interface ProjectComments {
  [month: string]: { [projectId: string]: string };
}

export interface LockedMonths {
  [month: string]: boolean;
}

// Input Data Type
export interface RawBudgetData {
  budgetTitle?: string;
  currentYear?: number;
  people?: Person[];
  charges?: Charge[];
  projects?: Project[];
  yearlyData?: YearlyData | Record<string, { months?: unknown; expenses?: unknown; expenseComments?: unknown; monthComments?: unknown }>;
  yearlyExpenses?: YearlyData; 
  oneTimeIncomes?: OneTimeIncomes | Record<string, any[]>;
  monthComments?: MonthComments;
  projectComments?: ProjectComments;
  lockedMonths?: LockedMonths;
  lastUpdated?: string;
  updatedBy?: string;
  version?: string;
  exportDate?: string;
  date?: string;
}

// Output Data Type
export interface ConvertedBudgetData {
  budgetTitle: string;
  currentYear: number;
  people: Person[];
  charges: Charge[];
  projects: Project[];
  yearlyData: YearlyData;     // Allocations
  yearlyExpenses: YearlyData; // Expenses
  oneTimeIncomes: OneTimeIncomes;
  monthComments: MonthComments;
  projectComments: ProjectComments;
  lockedMonths: LockedMonths;
  lastUpdated?: string;
  updatedBy?: string;
  version?: string;
  exportDate?: string;
  date?: string;
}

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export function convertOldFormatToNew(oldData: RawBudgetData): ConvertedBudgetData {
  // Default structure
  const newData: ConvertedBudgetData = {
    budgetTitle: oldData.budgetTitle || '',
    currentYear: oldData.currentYear || new Date().getFullYear(),
    people: oldData.people || [],
    charges: oldData.charges || [],
    projects: oldData.projects || [],
    yearlyData: oldData.yearlyData as YearlyData || {},     
    yearlyExpenses: oldData.yearlyExpenses as YearlyData || {}, 
    oneTimeIncomes: oldData.oneTimeIncomes as OneTimeIncomes || {},
    monthComments: oldData.monthComments || {},
    projectComments: oldData.projectComments || {},
    lockedMonths: oldData.lockedMonths || {},
    lastUpdated: new Date().toISOString(),
    updatedBy: oldData.updatedBy
  };

  // If it's already the new format with explicit expenses, return
  if (oldData.yearlyExpenses && !Object.keys(oldData.yearlyData || {}).some(key => key.match(/^\d{4}$/))) {
    return { ...newData, ...oldData } as ConvertedBudgetData;
  }

  // Detect Legacy Format (Nested under Year key)
  const firstYearKey = Object.keys(oldData.yearlyData || {})[0];
  if (firstYearKey && (oldData.yearlyData as any)[firstYearKey]?.months) {
    const oldYearData = (oldData.yearlyData as any)[firstYearKey];
    newData.currentYear = parseInt(firstYearKey);

    MONTHS.forEach((month, idx) => {
      // Allocations
      if (oldYearData.months && oldYearData.months[idx]) {
        newData.yearlyData[month] = { ...oldYearData.months[idx] };
      }
      // Expenses (New mapping)
      if (oldYearData.expenses && oldYearData.expenses[idx]) {
        newData.yearlyExpenses[month] = { ...oldYearData.expenses[idx] };
      }
      // Comments
      if (oldYearData.monthComments && oldYearData.monthComments[idx]) {
        newData.monthComments[month] = oldYearData.monthComments[idx];
      }
      if (oldYearData.expenseComments && oldYearData.expenseComments[idx]) {
        newData.projectComments[month] = { ...oldYearData.expenseComments[idx] };
      }
      // Incomes
      if (oldData.oneTimeIncomes && (oldData.oneTimeIncomes as any)[firstYearKey]) {
        const incomeObj = (oldData.oneTimeIncomes as any)[firstYearKey][idx];
        if (incomeObj && incomeObj.amount) {
          newData.oneTimeIncomes[month] = Number(incomeObj.amount);
        }
      }
    });
  }

  return newData;
}

export function convertNewFormatToOld(newData: ConvertedBudgetData): RawBudgetData {
  const year = newData.currentYear || new Date().getFullYear();
  
  const oldData: any = {
    budgetTitle: newData.budgetTitle,
    currentYear: year,
    people: newData.people,
    charges: newData.charges,
    projects: newData.projects,
    yearlyData: {
      [year]: {
        months: [], // Allocations
        expenses: [], // Expenses
        monthComments: [],
        expenseComments: [],
        deletedMonths: []
      }
    },
    oneTimeIncomes: {
      [year]: []
    },
    date: new Date().toISOString()
  };

  MONTHS.forEach(month => {
    const allocationData = newData.yearlyData[month] || {};
    const expenseData = newData.yearlyExpenses[month] || {};

    oldData.yearlyData[year].months.push(allocationData);
    oldData.yearlyData[year].expenses.push(expenseData);
    
    oldData.yearlyData[year].monthComments.push(newData.monthComments?.[month] || '');
    oldData.yearlyData[year].expenseComments.push(newData.projectComments?.[month] || {});
    
    oldData.oneTimeIncomes[year].push({
      amount: newData.oneTimeIncomes?.[month] || 0,
      description: ''
    });
  });

  return oldData;
}