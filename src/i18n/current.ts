// src/i18n/current.ts
// ============================================================================
// The language of the current screen, for code outside React components:
// labels worked out by the budget engine, month names, toasts sent from hooks,
// messages of the API client. App sets it before the routes render
// (useScreenLocale in src/i18n/runtime.tsx), so it is always the language
// useT gives the components on screen. No React here: the engine and its
// tests import it.
// ============================================================================

import { DEFAULT_LOCALE, type Locale } from './locales';

/** French and English always; other languages (Chinese) where written, English otherwise. */
export type Messages<T> = { fr: T; en: T; zh?: T };

/** The words of a component or module in each language; `en` (and `zh`, when given) must have the same keys as `fr`. */
export const defineMessages = <T,>(messages: { fr: T; en: NoInfer<T>; zh?: NoInfer<T> }): Messages<T> => messages;

/** The words in a language, English when they aren't written in it. */
export const wordsIn = <T,>(messages: Messages<T>, locale: Locale): T => messages[locale] ?? messages.en;

let current: Locale = DEFAULT_LOCALE;

export function setScreenLocale(locale: Locale) {
  current = locale;
}

export function screenLocale(): Locale {
  return current;
}

/** The words in the language of the current screen, outside a component (inside one, use useT). */
export function pick<T>(messages: Messages<T>): T {
  return wordsIn(messages, current);
}
