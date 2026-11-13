// src/components/Footer.tsx
// Site footer, in the language of the screen. Links go to the page in that
// language; in English, Chinese or Spanish, only the pages that exist in that
// language are listed (the legal pages are always there, in English for
// Chinese and Spanish readers).
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, HelpCircle, FileText, Sparkles, Info } from 'lucide-react';
import { BudgetLogo } from '@/components/budget/BudgetLogo';
import { SocialLinks } from '@/components/SocialLinks';
import { LOCALES, alternatesOf, localeOf, localizedPath } from '@/i18n/locales';
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
    trust: ['Données chiffrées AES-256', 'Conforme au RGPD', 'Fait en Europe 🇪🇺'],
    links: {
      '/features': 'Fonctionnalités',
      '/premium': 'Premium (bientôt)',
      '/tableau-budget-familial-gratuit': 'Tableau de budget gratuit',
      '/calcul-reste-a-vivre': 'Calcul du reste à vivre',
      '/budget-personnel': 'Budget personnel',
      '/budget-couple': 'Budget couple',
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
      '/budget-couple': 'Couple budget calculator',
      '/budget-colocation': 'Rent split calculator',
      '/budget-mariage': 'Wedding budget calculator',
      '/blog': 'Budgeting tips',
      '/about': 'About',
      '/terms': 'Terms of use',
      '/privacy': 'Privacy',
    },
    legalNote: ' (in French)',
  },
  zh: {
    tagline: '一个人或和家人、伴侣、室友一起，管理预算，规划重要的事。',
    follow: '关注我们',
    product: '免费计算器',
    support: '支持',
    company: '公司',
    helpCenter: '帮助中心（英文）',
    contact: '联系我们',
    trust: ['数据经 AES-256 加密', '符合 GDPR', '欧洲制造 🇪🇺'],
    links: {
      '/features': '功能',
      '/premium': '高级版（即将推出）',
      '/tableau-budget-familial-gratuit': '免费预算表格',
      '/calcul-reste-a-vivre': '每月结余计算器',
      '/budget-personnel': '50/30/20预算计算器',
      '/budget-couple': '情侣预算计算器',
      '/budget-colocation': '合租房租分摊计算器',
      '/budget-mariage': '婚礼预算计算器',
      '/blog': '理财建议',
      '/about': '关于我们',
      '/terms': '使用条款',
      '/privacy': '隐私政策',
    },
    legalNote: '（英文）',
  },
  es: {
    tagline: 'Presupuesta y planifica lo que importa, a solas o en compañía: familia, pareja, piso compartido, proyectos.',
    follow: 'Síguenos',
    product: 'Calculadoras gratuitas',
    support: 'Ayuda',
    company: 'Empresa',
    helpCenter: 'Centro de ayuda (en inglés)',
    contact: 'Contacto',
    trust: ['Datos cifrados con AES-256', 'Conforme al RGPD', 'Hecho en Europa 🇪🇺'],
    links: {
      '/features': 'Funciones',
      '/premium': 'Premium (próximamente)',
      '/tableau-budget-familial-gratuit': 'Plantilla de presupuesto gratuita',
      '/calcul-reste-a-vivre': 'Calculadora de dinero disponible',
      '/budget-personnel': 'Calculadora de presupuesto 50/30/20',
      '/budget-couple': 'Calculadora de presupuesto en pareja',
      '/budget-colocation': 'Calculadora para dividir el alquiler',
      '/budget-mariage': 'Calculadora de presupuesto de boda',
      '/blog': 'Consejos de presupuesto',
      '/about': 'Quiénes somos',
      '/terms': 'Condiciones de uso',
      '/privacy': 'Privacidad',
    },
    legalNote: ' (en inglés)',
  },
});

const PRODUCT = ['/features', '/premium', '/tableau-budget-familial-gratuit', '/calcul-reste-a-vivre', '/budget-personnel', '/budget-couple', '/budget-colocation', '/budget-mariage', '/blog'] as const;
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
                // Not written in this language: the version its readers get in the app.
                const fallback = localizedPath(fr, locale);
                return (
                  <li key={fr}>
                    <Link to={to ?? fallback} hrefLang={to ? undefined : LOCALES[localeOf(fallback)].tag} className={linkClass}>
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
