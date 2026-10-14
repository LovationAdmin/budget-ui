// src/lib/analytics.ts
// ============================================================================
// Google Analytics events. The tag (index.html) loads on the production site
// only, so previews and local builds send nothing. Every event carries the
// language the visitor reads the site in (ui_language, src/i18n/preference.ts).
// In GA: mark calculator_used and sign_up as key events, and register
// ui_language and calculator as event-scoped custom dimensions.
// ============================================================================

import { useEffect, useRef } from 'react';
import { uiLocale } from '@/i18n/preference';

type Params = Record<string, string | number | boolean>;

export function track(event: string, params: Params = {}) {
  try {
    (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.('event', event, { ui_language: uiLocale(), ...params });
  } catch {
    // Analytics is optional.
  }
}

/**
 * « calculator_used », once per page view: when a result shows after the
 * visitor typed something or loaded the example. A result restored from a
 * previous visit doesn't count until it changes. `result` is the calculator's
 * memoized result: a new object whenever an input changes.
 */
export function useCalculatorUsed(calculator: string, hasResult: boolean, result: unknown) {
  const initial = useRef(result);
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current || !hasResult || result === initial.current) return;
    sent.current = true;
    track('calculator_used', { calculator });
  }, [calculator, hasResult, result]);
}
