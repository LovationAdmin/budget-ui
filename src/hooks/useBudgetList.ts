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
  members: Array<{ user_id?: string; user: { id?: string; name: string; avatar?: string } | null }>;
}

let state: { userId: string; list: BudgetSummary[] } | null = null;
let inflight: { userId: string; promise: Promise<BudgetSummary[]> } | null = null;
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

/**
 * Loads the list from the server and shares it. A call made while a request
 * is already on its way joins it: the menus (mounted first) and the dashboard
 * or overview opening at the same moment make a single GET /budgets.
 */
export function fetchBudgetList(userId: string): Promise<BudgetSummary[]> {
  if (inflight?.userId === userId) return inflight.promise;
  const promise = budgetAPI
    .list()
    .then((res) => {
      const list: BudgetSummary[] = Array.isArray(res.data) ? res.data : [];
      publishBudgetList(userId, list);
      return list;
    })
    .finally(() => {
      if (inflight?.promise === promise) inflight = null;
    });
  inflight = { userId, promise };
  return promise;
}

function load(userId: string) {
  fetchBudgetList(userId).catch(() => undefined);
}

/** The user's budgets, `null` until known (or when the list could not be loaded). */
export function useBudgetList(userId: string | undefined): BudgetSummary[] | null {
  const snapshot = useSyncExternalStore(subscribe, () => state);
  useEffect(() => {
    if (userId && state?.userId !== userId) load(userId);
  }, [userId]);
  return userId && snapshot?.userId === userId ? snapshot.list : null;
}
