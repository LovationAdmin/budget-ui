// src/hooks/useBudgetList.ts
// ============================================================================
// The signed-in user's budgets (GET /budgets), shared by the screens that need
// to know them without showing them, e.g. the menus, which offer « Ma vue
// perso » only when it is useful (src/lib/budget/overview.ts). Fetched at most
// once per page load; the screens that load the list anyway (dashboard,
// overview) publish it here, so it is never fetched twice and stays current
// after a budget is created or deleted.
// ============================================================================

import { useEffect, useSyncExternalStore } from 'react';
import { budgetAPI } from '@/services/api';

export interface BudgetSummary {
  id: string;
  name: string;
  created_at?: string;
  is_owner: boolean;
  location?: string;
  currency?: string;
  /** `person_id`: the person of the household the account is (src/lib/budget/overview.ts). */
  members: Array<{ user_id?: string; user: { id?: string; name: string; avatar?: string } | null; person_id?: string | null }>;
}

let state: { userId: string; list: BudgetSummary[] } | null = null;
let loadingFor: string | null = null;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** Shares a freshly loaded list (the dashboard and the overview load it anyway). */
export function publishBudgetList(userId: string, list: BudgetSummary[]) {
  state = { userId, list };
  listeners.forEach((l) => l());
}

function load(userId: string) {
  if (loadingFor === userId) return;
  loadingFor = userId;
  budgetAPI
    .list()
    .then((res) => {
      if (loadingFor === userId) publishBudgetList(userId, Array.isArray(res.data) ? res.data : []);
    })
    .catch(() => undefined)
    .finally(() => {
      if (loadingFor === userId) loadingFor = null;
    });
}

/** The user's budgets, `null` until known (or when the list could not be loaded). */
export function useBudgetList(userId: string | undefined): BudgetSummary[] | null {
  const snapshot = useSyncExternalStore(subscribe, () => state);
  useEffect(() => {
    if (userId && state?.userId !== userId) load(userId);
  }, [userId]);
  return userId && snapshot?.userId === userId ? snapshot.list : null;
}
