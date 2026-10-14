// src/components/LanguageToggle.tsx
// ============================================================================
// Compact language button for the navigation bars. On a translated public page
// it links to the other version (its own URL); on the screens that follow the
// visitor's preference (sign-in, the app) it switches the preference in place.
// On a page that exists in French only, there is nothing to switch to: hidden.
// ============================================================================

import { Link, useLocation } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LOCALES, alternatesOf, type Locale } from '@/i18n/locales';
import { followsPreference, useLocale, usePreference } from '@/i18n/runtime';

const NAMES: Record<Locale, string> = { fr: 'Français', en: 'English' };

export function LanguageToggle({ className }: { className?: string }) {
  const { pathname } = useLocation();
  const locale = useLocale();
  const { setPreference } = usePreference();
  const other: Locale = locale === 'fr' ? 'en' : 'fr';
  const classes = cn(
    'flex h-10 min-w-[44px] items-center justify-center gap-1.5 rounded-xl px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
    className,
  );
  const content = (
    <>
      <Globe className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">{NAMES[other]}</span>
    </>
  );

  if (followsPreference(pathname)) {
    return (
      <button type="button" lang={other} onClick={() => setPreference(other)} aria-label={LOCALES[other].switchLabel} className={classes}>
        {content}
      </button>
    );
  }
  const target = alternatesOf(pathname)?.[other];
  if (!target) return null;
  return (
    <Link to={target} hrefLang={other} lang={other} onClick={() => setPreference(other)} aria-label={LOCALES[other].switchLabel} className={classes}>
      {content}
    </Link>
  );
}
