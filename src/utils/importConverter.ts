// Define Types
export interface Person {
  id: string;
  name: string;
  salary: number;
  startDate?: string;
  endDate?: string;
}

export interface Charge {
  id: string;
  label: string;
  amount: number;
  startDate?: string;
  endDate?: string;
  category?: string;
}

export interface Project {
  id: string;
  label: string;
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
  yearlyData: YearlyData;
  yearlyExpenses: YearlyData;
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

// ============================================
// NOUVEAU: Map pour gérer les problèmes d'encodage des noms de mois
// ============================================
const MONTH_NAME_VARIANTS: Record<string, string> = {
  // Standard
  'Janvier': 'Janvier', 'janvier': 'Janvier',
  'Février': 'Février', 'février': 'Février', 'Fevrier': 'Février',
  'Mars': 'Mars', 'mars': 'Mars',
  'Avril': 'Avril', 'avril': 'Avril',
  'Mai': 'Mai', 'mai': 'Mai',
  'Juin': 'Juin', 'juin': 'Juin',
  'Juillet': 'Juillet', 'juillet': 'Juillet',
  'Août': 'Août', 'août': 'Août', 'Aout': 'Août',
  'Septembre': 'Septembre', 'septembre': 'Septembre',
  'Octobre': 'Octobre', 'octobre': 'Octobre',
  'Novembre': 'Novembre', 'novembre': 'Novembre',
  'Décembre': 'Décembre', 'décembre': 'Décembre', 'Decembre': 'Décembre',
  // Encodage UTF-8 mal interprété (mojibake)
  'FÃ©vrier': 'Février',
  'AoÃ»t': 'Août',
  'DÃ©cembre': 'Décembre',
};

/**
 * Normalise un nom de mois (gère les variantes d'encodage)
 */
function normalizeMonthName(monthKey: string): string | null {
  return MONTH_NAME_VARIANTS[monthKey] || null;
}

/**
 * Vérifie si une clé est un nom de mois (avec variantes)
 */
function isMonthName(key: string): boolean {
  return normalizeMonthName(key) !== null;
}

/**
 * Vérifie si les données sont dans l'ancien format (clés = noms de mois)
 */
function isLegacyMonthNameFormat(yearlyData: unknown): boolean {
  if (!yearlyData || typeof yearlyData !== 'object') return false;
  const keys = Object.keys(yearlyData);
  if (keys.length === 0) return false;
  
  // Si au moins une clé est un nom de mois, c'est l'ancien format
  return keys.some(key => isMonthName(key));
}

/**
 * Vérifie si les données sont dans le nouveau format (clés = années)
 */
function isNewYearBasedFormat(yearlyData: unknown): boolean {
  if (!yearlyData || typeof yearlyData !== 'object') return false;
  const keys = Object.keys(yearlyData);
  if (keys.length === 0) return false;
  
  // Vérifie si les clés sont des années (4 chiffres) avec structure .months
  return keys.some(key => {
    if (!/^\d{4}$/.test(key)) return false;
    const yearData = (yearlyData as any)[key];
    return yearData && Array.isArray(yearData.months);
  });
}

export function convertOldFormatToNew(oldData: RawBudgetData): ConvertedBudgetData {
  // Default structure
  const newData: ConvertedBudgetData = {
    budgetTitle: oldData.budgetTitle || '',
    currentYear: oldData.currentYear || new Date().getFullYear(),
    people: oldData.people || [],
    charges: oldData.charges || [],
    projects: oldData.projects || [],
    yearlyData: {},
    yearlyExpenses: {},
    oneTimeIncomes: {},
    monthComments: {},
    projectComments: {},
    lockedMonths: oldData.lockedMonths || {},
    lastUpdated: new Date().toISOString(),
    updatedBy: oldData.updatedBy
  };

  const rawYearlyData = oldData.yearlyData || {};
  const rawYearlyExpenses = oldData.yearlyExpenses || {};
  const rawMonthComments = oldData.monthComments || {};
  const rawProjectComments = oldData.projectComments || {};
  const rawOneTimeIncomes = oldData.oneTimeIncomes || {};

  // ============================================
  // CAS 1: Ancien format avec noms de mois comme clés (v2.2 et avant)
  // yearlyData: { "Janvier": {...}, "Février": {...}, ... }
  // ============================================
  if (isLegacyMonthNameFormat(rawYearlyData)) {
    console.log('[importConverter] Detected LEGACY month-name format, converting...');
    
    // Convertir yearlyData (allocations)
    for (const [key, value] of Object.entries(rawYearlyData)) {
      const normalizedMonth = normalizeMonthName(key);
      if (normalizedMonth && value && typeof value === 'object' && !Array.isArray(value)) {
        // Vérifier que ce n'est pas une structure year-based accidentellement mélangée
        if (!(value as any).months) {
          newData.yearlyData[normalizedMonth] = { ...(value as Record<string, number>) };
        }
      }
    }
    
    // Convertir yearlyExpenses (dépenses réelles)
    if (isLegacyMonthNameFormat(rawYearlyExpenses)) {
      for (const [key, value] of Object.entries(rawYearlyExpenses)) {
        const normalizedMonth = normalizeMonthName(key);
        if (normalizedMonth && value && typeof value === 'object') {
          newData.yearlyExpenses[normalizedMonth] = { ...(value as Record<string, number>) };
        }
      }
    }
    
    // Convertir monthComments
    if (rawMonthComments && typeof rawMonthComments === 'object') {
      for (const [key, value] of Object.entries(rawMonthComments)) {
        const normalizedMonth = normalizeMonthName(key);
        if (normalizedMonth && typeof value === 'string') {
          newData.monthComments[normalizedMonth] = value;
        }
      }
    }
    
    // Convertir projectComments
    if (rawProjectComments && typeof rawProjectComments === 'object') {
      for (const [key, value] of Object.entries(rawProjectComments)) {
        const normalizedMonth = normalizeMonthName(key);
        if (normalizedMonth && value && typeof value === 'object') {
          newData.projectComments[normalizedMonth] = { ...(value as Record<string, string>) };
        }
      }
    }
    
    // Convertir oneTimeIncomes (ancien format: { "Janvier": 500, ... })
    if (rawOneTimeIncomes && typeof rawOneTimeIncomes === 'object') {
      for (const [key, value] of Object.entries(rawOneTimeIncomes)) {
        const normalizedMonth = normalizeMonthName(key);
        if (normalizedMonth && typeof value === 'number') {
          newData.oneTimeIncomes[normalizedMonth] = value;
        }
      }
    }
    
    return newData;
  }

  // ============================================
  // CAS 2: Nouveau format avec années comme clés (v2.3+)
  // yearlyData: { "2024": { months: [...], expenses: [...], ... } }
  // ============================================
  if (isNewYearBasedFormat(rawYearlyData)) {
    console.log('[importConverter] Detected NEW year-based format, extracting current year...');
    
    const targetYear = newData.currentYear;
    const yearKey = String(targetYear);
    const yearData = (rawYearlyData as any)[yearKey];
    
    if (yearData) {
      MONTHS.forEach((month, idx) => {
        // Allocations
        if (yearData.months && yearData.months[idx]) {
          newData.yearlyData[month] = { ...yearData.months[idx] };
        }
        // Expenses
        if (yearData.expenses && yearData.expenses[idx]) {
          newData.yearlyExpenses[month] = { ...yearData.expenses[idx] };
        }
        // Month Comments
        if (yearData.monthComments && yearData.monthComments[idx]) {
          newData.monthComments[month] = yearData.monthComments[idx];
        }
        // Project/Expense Comments
        if (yearData.expenseComments && yearData.expenseComments[idx]) {
          newData.projectComments[month] = { ...yearData.expenseComments[idx] };
        }
      });
      
      // OneTimeIncomes (format: { "2024": [{ amount, description }, ...] })
      if (rawOneTimeIncomes && (rawOneTimeIncomes as any)[yearKey]) {
        const yearIncomes = (rawOneTimeIncomes as any)[yearKey];
        if (Array.isArray(yearIncomes)) {
          MONTHS.forEach((month, idx) => {
            const incomeObj = yearIncomes[idx];
            if (incomeObj && incomeObj.amount) {
              newData.oneTimeIncomes[month] = Number(incomeObj.amount);
            }
          });
        }
      }
    } else {
      console.warn(`[importConverter] No data found for year ${yearKey}`);
    }
    
    return newData;
  }

  // ============================================
  // CAS 3: Format déjà correct (frontend format)
  // yearlyData: { "Janvier": {...}, ... } avec yearlyExpenses séparé
  // ============================================
  console.log('[importConverter] Data appears to be already in correct format');
  
  // Copier directement si déjà au bon format
  if (rawYearlyData && typeof rawYearlyData === 'object') {
    newData.yearlyData = { ...(rawYearlyData as YearlyData) };
  }
  if (rawYearlyExpenses && typeof rawYearlyExpenses === 'object') {
    newData.yearlyExpenses = { ...(rawYearlyExpenses as YearlyData) };
  }
  if (rawMonthComments) {
    newData.monthComments = { ...rawMonthComments };
  }
  if (rawProjectComments) {
    newData.projectComments = { ...rawProjectComments };
  }
  if (rawOneTimeIncomes && typeof rawOneTimeIncomes === 'object') {
    newData.oneTimeIncomes = { ...(rawOneTimeIncomes as OneTimeIncomes) };
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
        months: [],
        expenses: [],
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

// ============================================
// BONUS: Fonction pour migrer les données en DB directement
// Utile si tu veux faire une migration one-shot côté backend
// ============================================
export function migrateRawDataToNewFormat(rawData: RawBudgetData): RawBudgetData {
  const targetYear = rawData.currentYear || new Date().getFullYear();
  
  // Si déjà au nouveau format, retourner tel quel
  if (isNewYearBasedFormat(rawData.yearlyData)) {
    return rawData;
  }
  
  // Si pas en format legacy, retourner tel quel
  if (!isLegacyMonthNameFormat(rawData.yearlyData)) {
    return rawData;
  }
  
  console.log('[migrateRawDataToNewFormat] Migrating legacy data to new format...');
  
  // Convertir d'abord au format frontend
  const frontendFormat = convertOldFormatToNew(rawData);
  
  // Puis reconvertir au format DB (nouveau)
  const migratedData = convertNewFormatToOld(frontendFormat);
  
  // Conserver les métadonnées originales
  return {
    ...migratedData,
    version: '2.3-migrated',
    lastUpdated: new Date().toISOString(),
    updatedBy: rawData.updatedBy
  };
}