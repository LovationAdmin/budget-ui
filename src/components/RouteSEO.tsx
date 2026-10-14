// src/components/RouteSEO.tsx
// Keeps title, description, canonical and robots in step with the route on
// client-side navigation. Blog articles set their own (BlogArticle);
// signed-in pages are never indexed. An English page also makes English the
// visitor's language (src/i18n/preference.ts).

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { localeOf } from '@/i18n/locales';
import { setUiLocale } from '@/i18n/preference';
import { applyHead } from '@/seo/head';
import { pageSEO } from '@/seo/site';

export function RouteSEO() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (localeOf(pathname) !== 'fr') setUiLocale(localeOf(pathname));
    if (/^\/blog\/[^/]+/.test(pathname)) return;
    const page = pageSEO(pathname);
    if (page) {
      applyHead({ title: page.title, description: page.description, canonical: page.canonical ?? page.path, noindex: page.noindex });
    } else {
      applyHead({
        title: 'Budget Famille',
        description: 'Votre budget familial.',
        canonical: pathname,
        noindex: true,
      });
    }
  }, [pathname]);
  return null;
}
