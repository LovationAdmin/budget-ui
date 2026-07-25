// src/types/aiBudget.ts
// ============================================================================
// Contrats de la feature « Budget proposé par IA » (brief sections 3 & 4).
// Identifiants en anglais, contenu métier en français.
// ============================================================================

export type HouseholdType = 'couple' | 'family' | 'friends' | 'roommates';
export type Priority = 'safety' | 'high' | 'medium' | 'low';
export type Method = 'prorata' | 'equal' | 'equalized_reste' | 'all_common';
export type AccountStructure = 'three_accounts' | 'all_common_equal_pocket';
export type Feasibility = 'ok' | 'tight' | 'infeasible';
export type AllocationType =
  | 'common_charge'
  | 'savings_safety'
  | 'savings_projects'
  | 'vacations'
  | 'pocket_money'
  | 'personal';

// ---------------------------------------------------------------------------
// Entrée — HouseholdInput
// ---------------------------------------------------------------------------

export interface AIMember {
  id: string;
  label: string;
  netIncome: number;
  variableIncomeYearly?: number;
  personalSpendingMonthly?: number;
}

export interface AICharge {
  label: string;
  amount: number;
  category: string;
  scope: 'common' | 'personal';
  ownerId?: string;
}

export interface AIDebt {
  label: string;
  monthlyPayment: number;
  scope: 'common' | 'personal';
  ownerId?: string;
}

export interface AIObjective {
  label: string;
  targetAmount?: number;
  horizonMonths?: number;
  priority: Priority;
}

export interface HouseholdInput {
  householdType: HouseholdType;
  country?: string;
  members: AIMember[];
  charges: AICharge[];
  debts?: AIDebt[];
  objectives: AIObjective[];
  wantsPersonalSavings: boolean;
  allowInterMemberTopUp: boolean;
  preferredMethod?: Method;
  anticipatedLifeEvents?: string[];
  constraints?: string;
  freeText: string;
}

// ---------------------------------------------------------------------------
// Sortie — BudgetProposal
// ---------------------------------------------------------------------------

export interface MemberBudget {
  memberId: string;
  monthlyContribution: number;
  resteAVivre: number;
  pocketMoney: number;
  personalSavingsCapacity: number;
  feasibility: Feasibility;
}

export interface AllocationLine {
  category: string;
  label: string;
  amount: number;
  type: AllocationType;
  fundedBy: { memberId: string; amount: number }[];
  notes?: string;
}

export interface SavingsEnvelope {
  name: string;
  priority: Priority;
  targetAmount?: number;
  horizonMonths?: number;
  monthlyContribution: number;
  vehicleSuggestion?: string;
}

export interface BudgetProposal {
  methodChosen: Method;
  methodRationale: string;
  accountStructure: AccountStructure;
  accountRationale: string;
  monthlyAllocation: AllocationLine[];
  perMember: MemberBudget[];
  savingsEnvelopes: SavingsEnvelope[];
  variableIncomePolicy: string;
  separationHandling: {
    approach: 'equal_5050' | 'contribution_ledger' | 'deferred_to_marriage';
    note: string;
  };
  feasibility: {
    status: Feasibility;
    bindingMemberId?: string;
    issues: string[];
    suggestedLevers: string[];
  };
  lifeEventNotes: string[];
  vehicleSuggestions: string[];
  assumptionsMade: string[];
  openQuestions: string[];
  disclaimer: string;
  summary: string;
}

// Types d'allocation considérés comme de l'épargne récurrente (pour le mapping
// « Valider » vers l'épargne particulière et pour le simulateur).
export const SAVINGS_ALLOCATION_TYPES: AllocationType[] = [
  'savings_safety',
  'savings_projects',
  'vacations',
];
