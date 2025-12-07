// Type declarations for importConverter.js

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

// Type pour les données d'entrée (ancien format possible)
export interface RawBudgetData {
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

// Type pour les données converties (nouveau format)
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

export function convertOldFormatToNew(oldData: RawBudgetData): ConvertedBudgetData;
export function convertNewFormatToOld(newData: ConvertedBudgetData): RawBudgetData;
