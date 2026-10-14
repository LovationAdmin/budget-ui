// src/i18n/preference.ts
// The language the visitor reads the site in, remembered on this device. It
// becomes English on any English page (/en/…) and follows the language switch;
// French otherwise. Public pages always show the language of their URL; this
// preference is for what has no language in its URL (sign-up, the app) and for
// analytics.

import { DEFAULT_LOCALE, LOCALES, type Locale } from './locales';

const KEY = 'bf:locale';

export function uiLocale(): Locale {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved && saved in LOCALES) return saved as Locale;
  } catch {
    // Blocked storage: French.
  }
  return DEFAULT_LOCALE;
}

export function setUiLocale(locale: Locale) {
  try {
    localStorage.setItem(KEY, locale);
  } catch {
    // Private mode: the preference lasts for the visit.
  }
}
