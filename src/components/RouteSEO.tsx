// src/components/RouteSEO.tsx
// Keeps title, description, canonical and robots in step with the route on
// client-side navigation. Blog articles set their own (BlogArticle);
// signed-in pages are never indexed. An English page also makes English the
// visitor's language (src/i18n/preference.ts).

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { localeOf } from '@/i18n/locales';
import { useLocale, usePreference } from '@/i18n/runtime';
import { applyHead } from '@/seo/head';
import { pageSEO } from '@/seo/site';

export function RouteSEO() {
  const { pathname } = useLocation();
  const locale = useLocale();
  const { setPreference } = usePreference();
  useEffect(() => {
    if (localeOf(pathname) !== 'fr') setPreference(localeOf(pathname));
  }, [pathname, setPreference]);
  useEffect(() => {
    if (/^(\/en)?\/blog\/[^/]+/.test(pathname)) return;
    const page = pageSEO(pathname);
    if (page) {
      applyHead({ title: page.title, description: page.description, canonical: page.canonical ?? page.path, noindex: page.noindex, locale });
    } else {
      applyHead({
        title: 'Budget Famille',
        description: locale === 'en' ? 'Your budget, on your own or together.' : 'Votre budget familial.',
        canonical: pathname,
        noindex: true,
        locale,
      });
    }
  }, [pathname, locale]);
  return null;
}
