// src/components/en/EnglishLayout.tsx
// ============================================================================
// Header and footer of the English pages (/en/…). Lighter than the French
// Navbar and Footer: they only link to what exists in English (EN_TOOLS), and
// say so when a link leads to a page in French.
// ============================================================================

import { Link } from 'react-router-dom';
import { ArrowRight, Mail, ShieldCheck } from 'lucide-react';
import { BudgetLogo } from '@/components/budget/BudgetLogo';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { EN_TOOLS } from '@/i18n/en/tools';
import { LOCALES } from '@/i18n/locales';

export function EnglishHeader() {
  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur">
      <nav aria-label="Main navigation" className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link to={LOCALES.en.home} className="flex min-h-[44px] items-center gap-2.5">
          <BudgetLogo size={32} />
          <span className="font-display text-lg font-bold text-foreground">Budget Famille</span>
        </Link>
        <LanguageSwitch />
      </nav>
    </header>
  );
}

const footerLink = 'flex min-h-[44px] items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary';

export function EnglishFooter() {
  return (
    <footer className="mt-auto border-t border-border/40 bg-background/50 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <div className="mb-3 flex items-center gap-2.5">
            <BudgetLogo size={32} />
            <span className="text-xl font-bold text-foreground">Budget Famille</span>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Budget and plan what matters, on your own or together: family, couple, roommates and projects.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Lovation</span> &copy; {new Date().getFullYear()}
          </p>
        </div>
        <div>
          <h2 className="mb-1 font-semibold text-foreground">Free calculators</h2>
          <ul>
            {EN_TOOLS.map((tool) => <li key={tool.path}><Link to={tool.path} className={footerLink}>{tool.label}</Link></li>)}
          </ul>
        </div>
        <ul>
          <li><a href="mailto:lovation.pro@gmail.com" className={footerLink}><Mail className="h-4 w-4" aria-hidden="true" />Contact</a></li>
          <li><Link to="/privacy" hrefLang="fr" className={footerLink}>Privacy policy (in French)</Link></li>
          <li><Link to="/terms" hrefLang="fr" className={footerLink}>Terms of use (in French)</Link></li>
          <li><Link to={LOCALES.fr.home} hrefLang="fr" lang="fr" className={footerLink}>Budget Famille en français</Link></li>
        </ul>
      </div>
      <p className="mx-auto mt-8 flex max-w-6xl items-center gap-2 border-t border-border/40 px-6 pt-6 text-sm text-muted-foreground">
        <ShieldCheck className="h-4 w-4 shrink-0 text-green-500" aria-hidden="true" />
        AES-256 encrypted data · GDPR compliant · Made in Europe
      </p>
    </footer>
  );
}

/** « Other free calculators »: the English pages other than the current one. */
export function EnglishToolLinks({ current }: { current: string }) {
  return (
    <section>
      <h2 className="!text-2xl">Other free calculators</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {EN_TOOLS.filter((tool) => tool.path !== current).map((tool) => (
          <li key={tool.path}>
            <Link to={tool.path} className="flex min-h-[44px] items-start justify-between gap-3 rounded-xl border border-border/70 p-4 transition hover:bg-muted">
              <span>
                <span className="block font-semibold text-foreground">{tool.label}</span>
                <span className="block text-sm">{tool.text}</span>
              </span>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
