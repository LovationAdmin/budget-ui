// Define Types
export interface Person {
  id: string;
  name: string;
  salary: number;
}

export interface Charge {
  id: string;
  label: string;
  amount: number;
}

export interface Project {
  id: string;
  label: string;
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

// Input Data Type (Loose type for legacy data)
export interface RawBudgetData {
  budgetTitle?: string;
  currentYear?: number;
  people?: Person[];
  charges?: Charge[];
  projects?: Project[];
  yearlyData?: YearlyData | Record<string, { months?: unknown; expenseComments?: unknown; monthComments?: unknown }>;
  oneTimeIncomes?: OneTimeIncomes | Record<string, any[]>;
  monthComments?: MonthComments;
  projectComments?: ProjectComments;
  lockedMonths?: LockedMonths;
  lastUpdated?: string;
  version?: string;
  exportDate?: string;
  date?: string;
}

// Output Data Type (Strict modern format)
export interface ConvertedBudgetData {
  budgetTitle: string;
  currentYear: number;
  people: Person[];
  charges: Charge[];
  projects: Project[];
  yearlyData: YearlyData;
  oneTimeIncomes: OneTimeIncomes;
  monthComments: MonthComments;
  projectComments: ProjectComments;
  lockedMonths: LockedMonths;
  lastUpdated?: string;
  version?: string;
  exportDate?: string;
  date?: string;
}

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

/**
 * Convert Old JSON Format (HTML version) to New React Format
 */
export function convertOldFormatToNew(oldData: RawBudgetData): ConvertedBudgetData {
  console.log('Converting format...', oldData);
  
  // Default structure
  const newData: ConvertedBudgetData = {
    budgetTitle: oldData.budgetTitle || '',
    currentYear: oldData.currentYear || new Date().getFullYear(),
    people: oldData.people || [],
    charges: oldData.charges || [],
    projects: oldData.projects || [],
    yearlyData: {},
    oneTimeIncomes: {},
    monthComments: {},
    projectComments: {},
    lockedMonths: oldData.lockedMonths || {},
    lastUpdated: new Date().toISOString()
  };

  // 1. If it's already the new format (has yearlyData as the correct object structure)
  if (oldData.yearlyData && !Object.keys(oldData.yearlyData).some(key => key.match(/^\d{4}$/))) {
    // It seems to be new format already, merge carefully
    return { ...newData, ...oldData } as ConvertedBudgetData;
  }

  // 2. Detect Legacy Format (yearlyData keyed by Year "2023", "2024")
  const firstYearKey = Object.keys(oldData.yearlyData || {})[0];
  
  if (firstYearKey && (oldData.yearlyData as any)[firstYearKey]?.months) {
    console.log('Old format detected via year key:', firstYearKey);
    const oldYearData = (oldData.yearlyData as any)[firstYearKey];

    // Setup basic fields if missing
    newData.currentYear = parseInt(firstYearKey);

    // Map Months
    MONTHS.forEach((month, idx) => {
      // Projects Data
      if (oldYearData.months && oldYearData.months[idx]) {
        newData.yearlyData[month] = { ...oldYearData.months[idx] };
      }

      // Month Comments
      if (oldYearData.monthComments && oldYearData.monthComments[idx]) {
        newData.monthComments[month] = oldYearData.monthComments[idx];
      }

      // Project Specific Comments
      if (oldYearData.expenseComments && oldYearData.expenseComments[idx]) {
        newData.projectComments[month] = { ...oldYearData.expenseComments[idx] };
      }

      // One Time Incomes (Legacy was array of objects)
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

/**
 * Convert New Format to Old (For Backward Compatibility Export)
 */
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
        months: [],
        monthComments: [],
        expenses: [],
        expenseComments: [],
        deletedMonths: []
      }
    },
    oneTimeIncomes: {
      [year]: []
    },
    date: new Date().toISOString()
  };

  // Populate Arrays based on Month Index
  MONTHS.forEach(month => {
    // 1. Project Amounts
    const monthData = newData.yearlyData[month] || {};
    oldData.yearlyData[year].months.push(monthData);
    oldData.yearlyData[year].expenses.push(monthData); // Legacy duplication
    
    // 2. Month Comments
    oldData.yearlyData[year].monthComments.push(newData.monthComments?.[month] || '');
    
    // 3. Project Comments
    oldData.yearlyData[year].expenseComments.push(newData.projectComments?.[month] || {});
    
    // 4. One Time Incomes
    oldData.oneTimeIncomes[year].push({
      amount: newData.oneTimeIncomes?.[month] || 0,
      description: ''
    });
  });

  return oldData;
}