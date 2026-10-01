// src/components/budget/shared/hooks.ts
// Small hooks shared by the budget screens.

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useBudget } from '@/contexts/BudgetContext';
import { addMonths } from '@/lib/budget/months';
import type { YM } from '@/lib/budget/types';

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
    const t = setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    return () => clearTimeout(t);
  }, [location.hash, hash]);
}
