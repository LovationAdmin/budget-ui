// src/components/RouteSEO.tsx
// Keeps title, description, canonical and robots in step with the route on
// client-side navigation. Blog articles set their own (BlogArticle);
// signed-in pages are never indexed.

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applyHead } from '@/seo/head';
import { pageSEO } from '@/seo/site';

export function RouteSEO() {
  const { pathname } = useLocation();
  useEffect(() => {
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
