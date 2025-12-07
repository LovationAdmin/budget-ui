// Type declarations for importConverter.js

interface Person {
  id: string;
  name: string;
  salary: number;
}

interface Charge {
  id: string;
  label: string;
  amount: number;
}

interface Project {
  id: string;
  label: string;
}

interface YearlyData {
  [month: string]: { [projectId: string]: number };
}

interface OneTimeIncomes {
  [month: string]: number;
}

interface MonthComments {
  [month: string]: string;
}

interface ProjectComments {
  [month: string]: { [projectId: string]: string };
}

interface LockedMonths {
  [month: string]: boolean;
}

interface BudgetDataFormat {
  budgetTitle?: string;
  currentYear?: number;
  people?: Person[];
  charges?: Charge[];
  projects?: Project[];
  yearlyData?: YearlyData | Record<string, { months?: unknown }>;
  oneTimeIncomes?: OneTimeIncomes | Record<string, unknown>;
  monthComments?: MonthComments;
  projectComments?: ProjectComments;
  lockedMonths?: LockedMonths;
  lastUpdated?: string;
  version?: string;
  exportDate?: string;
  date?: string;
}

export function convertOldFormatToNew(oldData: BudgetDataFormat): BudgetDataFormat;
export function convertNewFormatToOld(newData: BudgetDataFormat): BudgetDataFormat;
