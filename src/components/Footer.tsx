// src/components/Footer.tsx
// Site footer, in the language of the screen. Links go to the page in that
// language; in English, only the pages that exist in English are listed (the
// legal pages are always there).
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, HelpCircle, FileText, Sparkles, Info } from 'lucide-react';
import { BudgetLogo } from '@/components/budget/BudgetLogo';
import { SocialLinks } from '@/components/SocialLinks';
import { alternatesOf, localizedPath } from '@/i18n/locales';
import { defineMessages, useLocale, useT } from '@/i18n/runtime';

const M = defineMessages({
  fr: {
    tagline: 'Budgétisez et planifiez tout ce qui compte, seul ou à plusieurs : famille, couple, coloc, projets.',
    follow: 'Suivez-nous',
    product: 'Produit',
    support: 'Support',
    company: 'Entreprise',
    helpCenter: 'Centre d’aide',
    contact: 'Contact',
    trust: ['Données chiffrées AES-256', 'RGPD Compliant', 'Made in Europe 🇪🇺'],
    links: {
      '/features': 'Fonctionnalités',
      '/premium': 'Premium (bientôt)',
      '/tableau-budget-familial-gratuit': 'Tableau de budget gratuit',
      '/calcul-reste-a-vivre': 'Calcul du reste à vivre',
      '/budget-personnel': 'Budget personnel',
      '/budget-colocation': 'Budget colocation',
      '/budget-mariage': 'Budget mariage',
      '/blog': 'Conseils budget',
      '/about': 'À propos',
      '/terms': 'CGU',
      '/privacy': 'Confidentialité',
    },
    legalNote: '',
  },
  en: {
    tagline: 'Budget and plan what matters, on your own or together: family, couple, roommates, projects.',
    follow: 'Follow us',
    product: 'Product',
    support: 'Support',
    company: 'Company',
    helpCenter: 'Help center',
    contact: 'Contact',
    trust: ['AES-256 encrypted data', 'GDPR compliant', 'Made in Europe 🇪🇺'],
    links: {
      '/features': 'Features',
      '/premium': 'Premium (coming soon)',
      '/tableau-budget-familial-gratuit': 'Free budget template',
      '/calcul-reste-a-vivre': 'Leftover income calculator',
      '/budget-personnel': '50/30/20 budget calculator',
      '/budget-colocation': 'Rent split calculator',
      '/budget-mariage': 'Wedding budget calculator',
      '/blog': 'Budgeting tips',
      '/about': 'About',
      '/terms': 'Terms of use',
      '/privacy': 'Privacy',
    },
    legalNote: ' (in French)',
  },
});

const PRODUCT = ['/features', '/premium', '/tableau-budget-familial-gratuit', '/calcul-reste-a-vivre', '/budget-personnel', '/budget-colocation', '/budget-mariage', '/blog'] as const;
const LEGAL = ['/terms', '/privacy'] as const;
const linkClass = 'flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors';

export function Footer() {
  const t = useT(M);
  const locale = useLocale();
  /** The page in the screen's language, or null when it doesn't exist in that language. */
  const href = (fr: string) => (locale === 'fr' ? fr : alternatesOf(fr)?.[locale] ?? null);

  return (
    <footer className="mt-auto border-t border-border/40 bg-background/50 py-12 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <BudgetLogo size={32} />
              <span className="font-bold text-xl text-foreground">Budget Famille</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{t.tagline}</p>
            <p className="text-sm font-semibold text-foreground mb-2">{t.follow}</p>
            <SocialLinks className="mb-4" />
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Lovation</span> &copy; {new Date().getFullYear()}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">{t.product}</h3>
            <ul className="space-y-3">
              {PRODUCT.map((fr) => {
                const to = href(fr);
                if (!to) return null;
                return (
                  <li key={fr}>
                    <Link to={to} className={linkClass}>
                      {fr === '/features' && <Sparkles className="h-4 w-4" />}
                      {t.links[fr]}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">{t.support}</h3>
            <ul className="space-y-3">
              <li>
                <Link to={localizedPath('/help', locale)} className={linkClass}>
                  <HelpCircle className="h-4 w-4" />
                  {t.helpCenter}
                </Link>
              </li>
              <li>
                <a href="mailto:lovation.pro@gmail.com" className={linkClass}>
                  <Mail className="h-4 w-4" />
                  {t.contact}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">{t.company}</h3>
            <ul className="space-y-3">
              {href('/about') && (
                <li>
                  <Link to={href('/about') as string} className={linkClass}>
                    <Info className="h-4 w-4" />
                    {t.links['/about']}
                  </Link>
                </li>
              )}
              {LEGAL.map((fr) => {
                const to = href(fr);
                return (
                  <li key={fr}>
                    <Link to={to ?? fr} hrefLang={to ? undefined : 'fr'} className={linkClass}>
                      {fr === '/terms' ? <FileText className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                      {t.links[fr]}{to ? '' : t.legalNote}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/40">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              <span>{t.trust[0]}</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">{t.trust[1]}</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">{t.trust[2]}</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <a href="mailto:lovation.pro@gmail.com" className="hover:text-primary transition-colors">
                lovation.pro@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
