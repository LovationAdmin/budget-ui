// src/components/LanguageSwitch.tsx
// ============================================================================
// Link to the same page in the other language, written in that language
// (« Read in English » on a French page). Shown only on translated pages
// (src/i18n/locales.ts). When the browser asks for that language, the link
// stands out: a suggestion the visitor is free to follow, never an automatic
// redirect, which would hide one version from search engines.
// ============================================================================

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { LOCALES, alternatesOf, localeOf, preferredLocale, type Locale } from '@/i18n/locales';
import { usePreference } from '@/i18n/runtime';

export function LanguageSwitch({ className = '' }: { className?: string }) {
  const { pathname } = useLocation();
  const { setPreference } = usePreference();
  const [preferred, setPreferred] = useState<Locale | null>(null);
  useEffect(() => setPreferred(preferredLocale()), []);

  const alts = alternatesOf(pathname);
  if (!alts) return null;
  const current = localeOf(pathname);
  const others = (Object.keys(LOCALES) as Locale[]).filter((l) => l !== current && alts[l]);

  return (
    <>
      {others.map((l) => (
        <Link
          key={l}
          to={alts[l] as string}
          hrefLang={LOCALES[l].tag}
          lang={LOCALES[l].tag}
          onClick={() => setPreference(l)}
          className={`inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${
            l === preferred ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90' : 'text-primary hover:bg-primary/10'
          } ${className}`}
        >
          <Globe className="h-4 w-4" aria-hidden="true" />
          {LOCALES[l].switchLabel}
        </Link>
      ))}
    </>
  );
}
