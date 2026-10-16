// src/i18n/preference.ts
// The language the visitor reads the site in, remembered on this device. It
// becomes English on any English page (/en/…), follows the language switch and
// the language saved in the visitor's account; before any of that, the
// browser's language (English or French), French otherwise. Public pages
// always show the language of their URL; this preference is for what has no
// language in its URL (sign-up, the app) and for analytics.

import { DEFAULT_LOCALE, LOCALES, preferredLocale, type Locale } from './locales';

const KEY = 'bf:locale';

export function uiLocale(): Locale {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved && saved in LOCALES) return saved as Locale;
  } catch {
    // Blocked storage: the browser's language.
  }
  return preferredLocale() ?? DEFAULT_LOCALE;
}

export function setUiLocale(locale: Locale) {
  try {
    localStorage.setItem(KEY, locale);
  } catch {
    // Private mode: the preference lasts for the visit.
  }
}

/** Whether the visitor chose a language on this device (an English page, the language switch, their account). */
export function hasSavedPreference(): boolean {
  try {
    const saved = localStorage.getItem(KEY);
    return !!saved && saved in LOCALES;
  } catch {
    return false;
  }
}
