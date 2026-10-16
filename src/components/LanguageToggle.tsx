// src/components/LanguageToggle.tsx
// ============================================================================
// Compact language button for the navigation bars (globe and language code;
// the full name is its accessible label). On a translated public page
// it links to the other version (its own URL), or opens a short menu of the
// versions when there are several; on the screens that follow the visitor's
// preference (sign-in, the app) it switches the preference in place.
// On a page that exists in French only, there is nothing to switch to: hidden.
// ============================================================================

import { Link, useLocation } from 'react-router-dom';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LOCALES, alternatesOf, type Locale } from '@/i18n/locales';
import { defineMessages, followsPreference, useLocale, usePreference, useT } from '@/i18n/runtime';

const M = defineMessages({
  fr: { choose: 'Changer de langue' },
  en: { choose: 'Change language' },
  zh: { choose: '切换语言' },
});

export function LanguageToggle({ className }: { className?: string }) {
  const { pathname } = useLocation();
  const locale = useLocale();
  const t = useT(M);
  const { setPreference } = usePreference();
  const classes = cn(
    'flex h-10 min-w-[44px] items-center justify-center gap-1.5 rounded-xl px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
    className,
  );
  const content = (code: Locale) => (
    <>
      <Globe className="h-4 w-4" aria-hidden="true" />
      <span className="hidden text-xs font-semibold tracking-wide sm:inline">{LOCALES[code].short}</span>
    </>
  );

  if (followsPreference(pathname)) {
    const other: Locale = locale === 'fr' ? 'en' : 'fr';
    return (
      <button type="button" lang={LOCALES[other].tag} onClick={() => setPreference(other)} aria-label={LOCALES[other].switchLabel} className={classes}>
        {content(other)}
      </button>
    );
  }
  const alts = alternatesOf(pathname) ?? {};
  const others = (Object.keys(LOCALES) as Locale[]).filter((l) => l !== locale && alts[l]);
  if (others.length === 0) return null;
  if (others.length === 1) {
    const other = others[0];
    return (
      <Link to={alts[other] as string} hrefLang={LOCALES[other].tag} lang={LOCALES[other].tag} onClick={() => setPreference(other)} aria-label={LOCALES[other].switchLabel} className={classes}>
        {content(other)}
      </Link>
    );
  }
  // Several versions: the button shows the current language and lists them all.
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label={t.choose} className={classes}>
        {content(locale)}
        <ChevronDown className="h-3 w-3" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {(Object.keys(LOCALES) as Locale[]).filter((l) => alts[l]).map((l) => (
          <DropdownMenuItem key={l} asChild className="min-h-[44px] cursor-pointer">
            <Link
              to={alts[l] as string}
              hrefLang={LOCALES[l].tag}
              lang={LOCALES[l].tag}
              aria-current={l === locale ? 'page' : undefined}
              onClick={() => setPreference(l)}
              className="flex items-center justify-between gap-3"
            >
              {LOCALES[l].name}
              {l === locale && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
