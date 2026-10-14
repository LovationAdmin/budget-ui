// src/i18n/locales.ts
// ============================================================================
// Languages of the public site. French is the main site, at the root; every
// other language lives under its own prefix (/en/…), one URL per language, so
// search engines index each version on its own. A page exists in another
// language only once it is listed in TRANSLATIONS: both versions then point to
// each other (hreflang, in the prerendered head, the live head and the
// sitemap) and the language switch links them.
// ============================================================================

export type Locale = 'fr' | 'en';

export const DEFAULT_LOCALE: Locale = 'fr';

export const LOCALES: Record<Locale, {
  /** Open Graph locale. */
  og: string;
  /** Link to this language, written in this language. */
  switchLabel: string;
  /** Entry page of the language (logo link). */
  home: string;
}> = {
  fr: { og: 'fr_FR', switchLabel: 'Lire en français', home: '/' },
  en: { og: 'en_US', switchLabel: 'Read in English', home: '/en' },
};

const ALL = Object.keys(LOCALES) as Locale[];

/** One entry per translated page: its path in each language. */
export const TRANSLATIONS: ReadonlyArray<Partial<Record<Locale, string>>> = [
  { fr: '/', en: '/en' },
  { fr: '/features', en: '/en/features' },
  { fr: '/tableau-budget-familial-gratuit', en: '/en/free-budget-template' },
  { fr: '/calcul-reste-a-vivre', en: '/en/leftover-income-calculator' },
  { fr: '/budget-personnel', en: '/en/50-30-20-budget-calculator' },
  { fr: '/budget-colocation', en: '/en/rent-split-calculator' },
  { fr: '/budget-mariage', en: '/en/wedding-budget-calculator' },
  { fr: '/outils-ia', en: '/en/ai-tools' },
  { fr: '/premium', en: '/en/premium' },
  { fr: '/help', en: '/en/help' },
  { fr: '/about', en: '/en/about' },
  { fr: '/privacy', en: '/en/privacy' },
  { fr: '/terms', en: '/en/terms' },
];

const normalize = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') || '/' : path);

export function localeOf(path: string): Locale {
  const p = normalize(path);
  return ALL.find((l) => l !== DEFAULT_LOCALE && (p === `/${l}` || p.startsWith(`/${l}/`))) ?? DEFAULT_LOCALE;
}

const BY_PATH = new Map(TRANSLATIONS.flatMap((t) => ALL.flatMap((l) => (t[l] ? [[t[l] as string, t] as const] : []))));

/** The versions of a page, its own included; undefined when it exists in one language only. */
export function alternatesOf(path: string): Partial<Record<Locale, string>> | undefined {
  return BY_PATH.get(normalize(path));
}

/** The same page in another language when it exists, else the page itself (links that follow the screen's language). */
export function localizedPath(path: string, locale: Locale): string {
  return alternatesOf(path)?.[locale] ?? path;
}

/**
 * hreflang entries of a page (empty when it has no translation). x-default,
 * for readers of any other language, is the English version when there is
 * one: it reaches more of them than the French.
 */
export function hreflangsOf(path: string): Array<{ hreflang: string; path: string }> {
  const alts = alternatesOf(path);
  if (!alts) return [];
  const list = ALL.filter((l) => alts[l]).map((l) => ({ hreflang: l, path: alts[l] as string }));
  return [...list, { hreflang: 'x-default', path: (alts.en ?? alts[DEFAULT_LOCALE]) as string }];
}

/** The language the browser asks for first among ours (null if none, or outside a browser). */
export function preferredLocale(): Locale | null {
  if (typeof navigator === 'undefined') return null;
  for (const tag of navigator.languages ?? [navigator.language]) {
    const l = tag?.slice(0, 2).toLowerCase();
    if (ALL.includes(l as Locale)) return l as Locale;
  }
  return null;
}
