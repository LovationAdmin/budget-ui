// src/components/budget/shared/hooks.ts
// Small hooks shared by the budget screens.

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useBudget } from '@/contexts/BudgetContext';
import { useAuth } from '@/contexts/AuthContext';
import { addMonths } from '@/lib/budget/months';
import type { YM } from '@/lib/budget/types';
import { PRIVATE_CHARGE_LABEL } from '@/lib/budget/types';

/** First month that is still open (not closed), from `from` (default: today) on. */
export function useFirstOpenMonth(from?: YM): YM {
  const { engine, today } = useBudget();
  let ym = from ?? today;
  for (let i = 0; i < 36 && engine.isClosed(ym); i++) ym = addMonths(ym, 1);
  return ym;
}

/** Scrolls to the element whose id matches the URL hash (e.g. #repartition). */
export function useHashScroll(hash: string) {
  const location = useLocation();
  useEffect(() => {
    if (location.hash !== `#${hash}`) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }), 150);
    return () => clearTimeout(t);
  }, [location.hash, hash]);
}

/**
 * Private personal charges: only their creator sees the label and category;
 * everyone sees the amount (it shows in the member's pocket money).
 */
export function useChargePrivacy() {
  const { user } = useAuth();
  const { privateCharges } = useBudget();
  type Item = { id: string; label: string; category?: string; private?: boolean; createdBy?: string };
  const canSee = (c: { private?: boolean; createdBy?: string }) => !c.private || (!!user?.id && c.createdBy === user.id);
  // The real name of a private charge only exists server-side, for its creator.
  const label = (c: Item) => (!c.private ? c.label : canSee(c) ? privateCharges[c.id]?.label ?? c.label : PRIVATE_CHARGE_LABEL);
  const category = (c: Item) => (!c.private ? c.category : canSee(c) ? privateCharges[c.id]?.category ?? c.category : undefined);
  return { canSee, label, category };
}
