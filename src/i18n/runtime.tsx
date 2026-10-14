// src/i18n/runtime.tsx
// ============================================================================
// The language of what is on screen. Public pages show the language of their
// URL (/en/… in English, the rest in French): search engines index one URL per
// language. The screens with nothing to index and no language in their URL
// (sign-in, sign-up, the app) follow the visitor's preference
// (src/i18n/preference.ts), which English pages and the language switches set.
//
// Components read their words with useT(MESSAGES), where MESSAGES holds a `fr`
// and an `en` object of the same shape (defineMessages): a missing key fails
// the build. Amounts and dates follow the same language (setNumberLocale).
// ============================================================================

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { setNumberLocale } from '@/lib/budget/format';
import { localeOf, type Locale } from './locales';
import { setUiLocale, uiLocale } from './preference';

export type Messages<T> = { fr: T; en: T };

/** The words of a component in each language; `en` must have the same keys as `fr`. */
export const defineMessages = <T,>(messages: { fr: T; en: NoInfer<T> }): Messages<T> => messages;

/** Screens whose language follows the visitor's preference rather than their URL. */
const PREFERENCE_PATHS = /^\/(login|signup|forgot-password|reset-password|verify-email|404|dashboard|profile)\/?$|^\/(budget|invitation|beta2|admin)(\/|$)/;

export const followsPreference = (pathname: string) => PREFERENCE_PATHS.test(pathname);

const PreferenceContext = createContext<{ preference: Locale; setPreference: (locale: Locale) => void }>({
  preference: 'fr',
  setPreference: () => {},
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [preference, setState] = useState<Locale>(uiLocale);
  const setPreference = useCallback((locale: Locale) => {
    setUiLocale(locale);
    setState(locale);
  }, []);
  const value = useMemo(() => ({ preference, setPreference }), [preference, setPreference]);
  return <PreferenceContext.Provider value={value}>{children}</PreferenceContext.Provider>;
}

/** The language of the current screen. */
export function useLocale(): Locale {
  const { pathname } = useLocation();
  const { preference } = useContext(PreferenceContext);
  return followsPreference(pathname) ? preference : localeOf(pathname);
}

/** The visitor's preferred language and the function that changes it (the app's language switch). */
export function usePreference() {
  return useContext(PreferenceContext);
}

/** The words of a component in the language of the current screen. */
export function useT<T>(messages: Messages<T>): T {
  return messages[useLocale()];
}

/**
 * Keeps amounts and dates in the language of the current screen. Rendered at
 * the top of the app, before the routes: everything below formats with it.
 */
export function useNumberLocale(): Locale {
  const locale = useLocale();
  setNumberLocale(locale);
  return locale;
}
