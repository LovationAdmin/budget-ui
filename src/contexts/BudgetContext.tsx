// src/contexts/BudgetContext.tsx
// ============================================================================
// BudgetContext — single source of truth for the budget screens.
// ============================================================================
// The layout (BudgetCompleteLayout) owns the whole budget as ONE normalised
// model (all years at once) and exposes:
//   - `model` + `engine` (month values, balances, changes),
//   - `commit(updater, toast?)` to change it (autosave + optional undo),
//   - `openSheet()` to open any editing panel from any screen.
// ============================================================================

import { createContext, useContext, type ReactNode } from 'react';
import type { SaveStatus } from '@/hooks/useSaveStatus';
import type { MappedTransaction } from '@/components/budget/TransactionMapper';
import type { BudgetModel, Charge, YM, PrivateChargeDetails } from '@/lib/budget/types';
import type { BudgetEngine } from '@/lib/budget/engine';
import type { SheetState } from '@/components/budget/sheets/types';

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

export interface CommitOptions {
  /** Confirmation shown to the user (with an « Annuler » action). */
  message?: string;
  /** Save immediately instead of waiting for the autosave debounce. */
  saveNow?: boolean;
  /** Offer undo in the confirmation (default true when a message is given). */
  undoable?: boolean;
}

export interface BudgetContextValue {
  budgetId: string;
  budget: BudgetData | null;
  model: BudgetModel;
  engine: BudgetEngine;
  today: YM;

  budgetLocation: string;
  budgetCurrency: string;
  currencySymbol: string;
  /** Money formatter bound to the budget currency. */
  fmt: (n: number) => string;

  commit: (updater: (m: BudgetModel) => BudgetModel, options?: CommitOptions) => void;

  /** The current user's private charge details (by charge id), from the server. */
  privateCharges: Record<string, PrivateChargeDetails>;
  /** Saves a private charge's real name server-side (rejects on failure). */
  savePrivateCharge: (chargeId: string, details: PrivateChargeDetails) => Promise<void>;
  /** Forgets a private charge's server-side details. */
  deletePrivateCharge: (chargeId: string) => Promise<void>;
  openSheet: (sheet: SheetState) => void;
  closeSheet: () => void;
  goToMonth: (ym: YM) => void;

  // Save state
  saveStatus: SaveStatus;
  saveError: string | null;
  lastSavedAt: Date | null;
  performSave: () => Promise<void>;

  // Reality check / banking
  totalGlobalRealized: number;
  realBankBalance: number;
  demoBankBalance: number;
  hasActiveConnection: boolean;
  isDemoMode: boolean;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  refreshBankData: () => void;
  handleOpenBankManager: () => void;

  // Transaction mapping
  chargeMappings: MappedTransaction[];
  mappedTotalsByChargeId: Record<string, number>;
  handleOpenMapper: (charge: Charge) => void;

  householdSize: number;
  refreshMembersOnly: () => Promise<void>;
  handleShowInviteModal: () => void;
  markSuggestionsRun: () => void;
}

const BudgetContext = createContext<BudgetContextValue | null>(null);

export function BudgetProvider({ value, children }: { value: BudgetContextValue; children: ReactNode }) {
  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

export function useBudget(): BudgetContextValue {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudget must be used inside <BudgetProvider>');
  return ctx;
}
