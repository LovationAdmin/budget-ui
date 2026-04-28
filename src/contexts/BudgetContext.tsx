// src/contexts/BudgetContext.tsx
// ============================================================================
// 🎯 BudgetContext — Single source of truth shared across budget tabs
// ============================================================================
// Fixes P0 #1: enables routed sub-tabs without prop drilling. The parent
// `BudgetCompleteLayout` hosts ALL state, exposes it via this context, and
// renders <Outlet /> for the active tab.
//
// Each tab consumes only what it needs via useBudget().
// ============================================================================

import { createContext, useContext, ReactNode } from 'react';
import type {
  Person,
  Charge,
  Project,
  YearlyData,
  OneTimeIncomes,
  MonthComments,
  ProjectComments,
  LockedMonths,
} from '@/utils/importConverter';
import type { SaveStatus } from '@/hooks/useSaveStatus';
import type { MappedTransaction, BridgeTransaction } from '@/components/budget/TransactionMapper';

// ============================================================================
// TYPES
// ============================================================================

export interface BudgetMember {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  role: 'owner' | 'member';
}

export interface BudgetData {
  id: string;
  name: string;
  is_owner: boolean;
  members: BudgetMember[];
  location?: string;
  currency?: string;
}

export interface BudgetContextValue {
  // ===== Core =====
  budget: BudgetData | null;
  budgetTitle: string;
  setBudgetTitle: (title: string) => void;
  budgetLocation: string;
  budgetCurrency: string;

  // ===== Year =====
  currentYear: number;
  handleYearChange: (year: number) => void;

  // ===== Data slices =====
  people: Person[];
  charges: Charge[];
  projects: Project[];
  yearlyData: YearlyData;
  yearlyExpenses: YearlyData;
  oneTimeIncomes: OneTimeIncomes;
  monthComments: MonthComments;
  projectComments: ProjectComments;
  lockedMonths: LockedMonths;
  projectCarryOvers: Record<string, number>;

  // ===== Handlers =====
  handlePeopleChange: (people: Person[]) => void;
  handleChargesChange: (charges: Charge[]) => void;
  handleProjectsChange: (projects: Project[]) => void;
  handleYearlyDataChange: (data: YearlyData) => void;
  handleYearlyExpensesChange: (data: YearlyData) => void;
  handleOneTimeIncomesChange: (data: OneTimeIncomes) => void;
  handleMonthCommentsChange: (data: MonthComments) => void;
  handleProjectCommentsChange: (data: ProjectComments) => void;
  handleLockedMonthsChange: (data: LockedMonths) => void;

  // ===== Save state =====
  saveStatus: SaveStatus;
  saveError: string | null;
  lastSavedAt: Date | null;
  performSave: (silent?: boolean) => Promise<void>;

  // ===== Reality Check / Banking =====
  totalGlobalRealized: number;
  realBankBalance: number;
  demoBankBalance: number;
  hasActiveConnection: boolean;
  isDemoMode: boolean;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  refreshBankData: () => void;

  // ===== Transaction mapping =====
  chargeMappings: MappedTransaction[];
  mappedTotalsByChargeId: Record<string, number>;
  handleOpenMapper: (charge: Charge) => void;

  // ===== Bank manager dialog =====
  handleOpenBankManager: () => void;

  // ===== Derived =====
  householdSize: number;

  // ===== Members / invitations =====
  refreshMembersOnly: () => Promise<void>;
  handleShowInviteModal: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const BudgetContext = createContext<BudgetContextValue | null>(null);

export function BudgetProvider({
  value,
  children,
}: {
  value: BudgetContextValue;
  children: ReactNode;
}) {
  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

export function useBudget(): BudgetContextValue {
  const ctx = useContext(BudgetContext);
  if (!ctx) {
    throw new Error('useBudget must be used inside <BudgetProvider>');
  }
  return ctx;
}
