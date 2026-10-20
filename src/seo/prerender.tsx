// src/seo/prerender.tsx
// ============================================================================
// Build-time page generation (run by scripts/prerender.mjs, never shipped to
// the browser). For each public page: its head (title, description,
// canonical, robots, Open Graph, JSON-LD) and readable static content, so
// search engines, social networks and AI crawlers see the page without
// running JavaScript. React replaces the content as soon as the app loads.
// The language (lang, og:locale, hreflang) follows from the path: pages under
// /en/ are in English, under /zh/ in simplified Chinese, and
// src/i18n/locales.ts pairs translated pages.
// ============================================================================

import { renderToStaticMarkup } from 'react-dom/server';
import { blogArticles } from '@/data/blog-articles';
import { blogArticlesEn } from '@/data/blog-articles-en';
import { articlePath, articlesByDate, relatedArticles } from '@/data/blog-related';
import { LOCALES, alternatesOf, hreflangsOf, localeOf, type Locale } from '@/i18n/locales';
import { HOME_FAQ, RAV_FAQ, TEMPLATE_FAQ, type FaqItem } from './faq';
import { EN_TOOLS } from '@/i18n/en/tools';
import { ZH_TOOLS } from '@/i18n/zh/tools';
import { BUDGET_503020_FAQ_EN } from './faq-503020-en';
import { HOME_FAQ_EN } from './faq-home-en';
import { LEFTOVER_INCOME_FAQ_EN } from './faq-leftover-income-en';
import { TEMPLATE_FAQ_EN } from './faq-template-en';
import { RENT_SPLIT_FAQ_EN } from './faq-rent-split-en';
import { WEDDING_FAQ_EN } from './faq-wedding-en';
import { COLOC_FAQ } from './faq-colocation';
import { MARIAGE_FAQ } from './faq-mariage';
import { PERSO_FAQ } from './faq-budget-personnel';
import { HOME_FAQ_ZH } from './zh/faq-home';
import { BUDGET_503020_FAQ_ZH } from './zh/faq-budget-503020';
import { BUDGET_503020_TOOL_ZH } from './zh/budget-503020';
import { RENT_SPLIT_FAQ_ZH } from './zh/faq-rent-split';
import { RENT_SPLIT_TOOL_ZH } from './zh/rent-split';
import { WEDDING_FAQ_ZH } from './zh/faq-wedding';
import { WEDDING_TOOL_ZH } from './zh/wedding';
import { LEFTOVER_INCOME_FAQ_ZH } from './zh/faq-leftover-income';
import { LEFTOVER_INCOME_TOOL_ZH } from './zh/leftover-income';
import {
  ORGANIZATION_LD, PAGES, SITE_NAME, SOFTWARE_LD, SOFTWARE_LD_EN, absolute, breadcrumbLD, faqLD, type PageSEO,
} from './site';

export interface BuiltPage {
  path: string;
  locale: Locale;
  /** html lang: "fr", "en", "zh-Hans". */
  lang: string;
  /** Open Graph locale of the page, then of its other versions. */
  ogLocale: string;
  ogLocaleAlternates: string[];
  /** Versions of the page in each language (empty when it has none). */
  hreflang: Array<{ hreflang: string; href: string }>;
  title: string;
  description: string;
  canonical: string;
  noindex: boolean;
  type: 'website' | 'article';
  jsonLd: object[];
  body: string;
  sitemap?: { priority: number; changefreq: string; lastmod?: string };
}

/** Link to the page in its other language(s), written in that language. */
function LanguageLinks({ path }: { path: string }) {
  const alts = alternatesOf(path);
  const current = localeOf(path);
  if (!alts) return null;
  return (
    <>
      {(Object.keys(LOCALES) as Locale[]).filter((l) => l !== current && alts[l]).map((l) => (
        <a key={l} href={alts[l]} hrefLang={LOCALES[l].tag} lang={LOCALES[l].tag} className="font-semibold text-primary">{LOCALES[l].switchLabel}</a>
      ))}
    </>
  );
}

/** What the static page's bar and link list say, in the page's language. */
function shellOf(path: string): { home: string; label: string; cta: string; links: Array<{ href: string; label: string }> } {
  const locale = localeOf(path);
  if (locale === 'zh') {
    return { home: LOCALES.zh.home, label: '主导航', cta: '免费注册', links: ZH_TOOLS.map((tool) => ({ href: tool.path, label: tool.label })) };
  }
  if (locale === 'en') {
    return {
      home: LOCALES.en.home,
      label: 'Main navigation',
      cta: 'Sign up free',
      links: [
        { href: '/en/features', label: 'Features' },
        { href: '/en/free-budget-template', label: 'Free template' },
        ...EN_TOOLS.map((tool) => ({ href: tool.path, label: tool.label })),
        { href: '/en/blog', label: 'Blog' },
        { href: '/en/help', label: 'Help' },
      ],
    };
  }
  return {
    home: '/',
    label: 'Navigation principale',
    cta: 'Créer mon budget',
    links: [
      { href: '/features', label: 'Fonctionnalités' },
      { href: '/tableau-budget-familial-gratuit', label: 'Tableau gratuit' },
      { href: '/calcul-reste-a-vivre', label: 'Reste à vivre' },
      { href: '/budget-personnel', label: 'Budget perso' },
      { href: '/budget-colocation', label: 'Colocation' },
      { href: '/budget-mariage', label: 'Mariage' },
      { href: '/blog', label: 'Conseils' },
      { href: '/help', label: 'Aide' },
    ],
  };
}

/**
 * The page as it reads before the app loads. The bar is one row of fixed
 * height whatever the screen and the font: on a phone, a wrapping row of
 * links grew taller when the web fonts arrived and pushed the whole page down
 * (layout shift). The section links sit under the content instead.
 */
function Shell({ path, children }: { path: string; children: React.ReactNode }) {
  const { home, label, cta, links } = shellOf(path);
  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-16 items-center justify-between gap-4 overflow-hidden whitespace-nowrap border-b border-border/60 px-4">
        <a href={home} className="font-display text-lg font-bold text-foreground">{SITE_NAME}</a>
        <span className="flex items-center gap-4 text-sm">
          <span className="hidden sm:contents"><LanguageLinks path={path} /></span>
          <a href="/signup" className="font-semibold text-primary">{cta}</a>
        </span>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12">{children}</main>
      <nav aria-label={label} className="mx-auto flex max-w-3xl flex-wrap gap-x-5 gap-y-2 border-t border-border/60 px-4 py-6 text-sm">
        {links.map((link) => <a key={link.href} href={link.href} className="text-muted-foreground">{link.label}</a>)}
        <LanguageLinks path={path} />
      </nav>
    </div>
  );
}

function StaticPage({ page, extra }: { page: PageSEO; extra?: React.ReactNode }) {
  return (
    <Shell path={page.path}>
      <h1 className="font-display text-4xl font-bold text-foreground">{page.h1 ?? page.title}</h1>
      {/* A size above the app's lead paragraphs (text-lg): when the app takes over, its
          lead is not a larger element, so the page's main content (LCP) stays this one,
          painted with the HTML, instead of being counted again when the app has loaded. */}
      <p className="mt-4 text-xl leading-relaxed text-muted-foreground">{page.intro ?? page.description}</p>
      {page.links && (
        <ul className="mt-6 flex flex-wrap gap-4">
          {page.links.map((l) => (
            <li key={l.href}><a href={l.href} className="font-semibold text-primary underline">{l.label}</a></li>
          ))}
        </ul>
      )}
      {page.sections?.map((sec) => (
        <section key={sec.h2} className="mt-10">
          <h2 className="font-display text-2xl font-bold text-foreground">{sec.h2}</h2>
          <p className="mt-2 text-muted-foreground">{sec.text}</p>
        </section>
      ))}
      {extra}
    </Shell>
  );
}

const FAQ_TITLE: Record<Locale, string> = { fr: 'Questions fréquentes', en: 'Frequently asked questions', zh: '常见问题' };
const HOME_WORD: Record<Locale, string> = { fr: 'Accueil', en: 'Home', zh: '首页' };

function FaqBlock({ items, locale = 'fr' }: { items: Array<{ q: string; a: string }>; locale?: Locale }) {
  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl font-bold text-foreground">{FAQ_TITLE[locale]}</h2>
      <dl className="mt-4 space-y-4">
        {items.map((f) => (
          <div key={f.q}>
            <dt className="font-semibold text-foreground">{f.q}</dt>
            <dd className="mt-1 text-muted-foreground">{f.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function BlogIndex({ locale = 'fr' }: { locale?: Locale }) {
  return (
    <section className="mt-10">
      <ul className="space-y-6">
        {articlesByDate(locale).map((a) => (
          <li key={a.slug}>
            <h2 className="text-xl font-bold"><a href={articlePath(a)} className="text-foreground underline">{a.title}</a></h2>
            <p className="mt-1 text-muted-foreground">{a.excerpt}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Free calculators: WebApplication + FAQPage + breadcrumb structured data. */
const TOOLS: Record<string, { name: string; crumb: string; faq: FaqItem[] }> = {
  '/calcul-reste-a-vivre': { name: 'Simulateur de reste à vivre', crumb: 'Calcul du reste à vivre', faq: RAV_FAQ },
  '/budget-colocation': { name: 'Calculateur de budget colocation', crumb: 'Budget colocation', faq: COLOC_FAQ },
  '/budget-mariage': { name: 'Calculateur de budget mariage', crumb: 'Budget mariage', faq: MARIAGE_FAQ },
  '/budget-personnel': { name: 'Calculateur de budget personnel 50/30/20', crumb: 'Budget personnel', faq: PERSO_FAQ },
  '/en/50-30-20-budget-calculator': { name: '50/30/20 Budget Calculator', crumb: '50/30/20 budget calculator', faq: BUDGET_503020_FAQ_EN },
  '/en/rent-split-calculator': { name: 'Rent Split Calculator', crumb: 'Rent split calculator', faq: RENT_SPLIT_FAQ_EN },
  '/en/wedding-budget-calculator': { name: 'Wedding Budget Calculator', crumb: 'Wedding budget calculator', faq: WEDDING_FAQ_EN },
  '/en/leftover-income-calculator': { name: 'Leftover Income Calculator', crumb: 'Leftover income calculator', faq: LEFTOVER_INCOME_FAQ_EN },
  '/zh/50-30-20-budget-calculator': { ...BUDGET_503020_TOOL_ZH, faq: BUDGET_503020_FAQ_ZH },
  '/zh/rent-split-calculator': { ...RENT_SPLIT_TOOL_ZH, faq: RENT_SPLIT_FAQ_ZH },
  '/zh/wedding-budget-calculator': { ...WEDDING_TOOL_ZH, faq: WEDDING_FAQ_ZH },
  '/zh/leftover-income-calculator': { ...LEFTOVER_INCOME_TOOL_ZH, faq: LEFTOVER_INCOME_FAQ_ZH },
};

/** Language fields of a built page: its locale, Open Graph locales and hreflang versions. */
function languageOf(path: string): Pick<BuiltPage, 'locale' | 'lang' | 'ogLocale' | 'ogLocaleAlternates' | 'hreflang'> {
  const locale = localeOf(path);
  const alts = alternatesOf(path) ?? {};
  return {
    locale,
    lang: LOCALES[locale].tag,
    ogLocale: LOCALES[locale].og,
    ogLocaleAlternates: (Object.keys(alts) as Locale[]).filter((l) => l !== locale).map((l) => LOCALES[l].og),
    hreflang: hreflangsOf(path).map((h) => ({ hreflang: h.hreflang, href: absolute(h.path) })),
  };
}

export function buildPages(): BuiltPage[] {
  const out: BuiltPage[] = [];
  for (const page of PAGES) {
    const canonical = page.canonical ?? page.path;
    const jsonLd: object[] = [ORGANIZATION_LD];
    let extra: React.ReactNode = null;
    if (page.path === '/') {
      jsonLd.push(SOFTWARE_LD, faqLD(HOME_FAQ), {
        '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: absolute('/'), inLanguage: 'fr',
      });
      extra = <FaqBlock items={HOME_FAQ} />;
    } else if (page.path === '/en') {
      jsonLd.push(SOFTWARE_LD_EN, faqLD(HOME_FAQ_EN), {
        '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: absolute('/en'), inLanguage: 'en',
      });
      extra = <FaqBlock items={HOME_FAQ_EN} locale="en" />;
    } else if (page.path === '/zh') {
      jsonLd.push(faqLD(HOME_FAQ_ZH), {
        '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: absolute('/zh'), inLanguage: LOCALES.zh.tag,
      });
      extra = <FaqBlock items={HOME_FAQ_ZH} locale="zh" />;
    } else if (page.path === '/en/free-budget-template') {
      jsonLd.push(faqLD(TEMPLATE_FAQ_EN), breadcrumbLD([{ name: 'Home', path: '/en' }, { name: 'Free budget template', path: page.path }]));
      extra = <FaqBlock items={TEMPLATE_FAQ_EN} locale="en" />;
    } else if (page.path === '/tableau-budget-familial-gratuit') {
      jsonLd.push(faqLD(TEMPLATE_FAQ), breadcrumbLD([{ name: 'Accueil', path: '/' }, { name: 'Tableau de budget familial gratuit', path: page.path }]));
      extra = <FaqBlock items={TEMPLATE_FAQ} />;
    } else if (TOOLS[page.path]) {
      const tool = TOOLS[page.path];
      const locale = localeOf(page.path);
      jsonLd.push(
        {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: tool.name,
          url: absolute(page.path),
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web',
          inLanguage: LOCALES[locale].tag,
          isAccessibleForFree: true,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
          publisher: ORGANIZATION_LD,
        },
        faqLD(tool.faq),
        breadcrumbLD([{ name: HOME_WORD[locale], path: LOCALES[locale].home }, { name: tool.crumb, path: page.path }]),
      );
      extra = <FaqBlock items={tool.faq} locale={locale} />;
    } else if (page.path === '/blog') {
      extra = <BlogIndex />;
    } else if (page.path === '/en/blog') {
      extra = <BlogIndex locale="en" />;
    }
    out.push({
      path: page.path,
      ...languageOf(canonical),
      title: page.title,
      description: page.description,
      canonical,
      noindex: !!page.noindex,
      type: 'website',
      jsonLd,
      body: renderToStaticMarkup(<StaticPage page={page} extra={extra} />),
      sitemap: page.noindex || page.canonical ? undefined : { priority: page.priority ?? 0.5, changefreq: page.changefreq ?? 'monthly' },
    });
  }
  const ARTICLE_WORDS = {
    fr: { home: 'Accueil', homePath: '/', blogPath: '/blog', updated: 'mis à jour le ', related: 'À lire aussi', template: 'Tableau de budget familial gratuit (Excel et PDF)', templatePath: '/tableau-budget-familial-gratuit', cta: 'Créer mon budget familial gratuit', dateLocale: 'fr-FR' },
    en: { home: 'Home', homePath: '/en', blogPath: '/en/blog', updated: 'updated ', related: 'Keep reading', template: 'Free family budget template (Excel and PDF)', templatePath: '/en/free-budget-template', cta: 'Create my free family budget', dateLocale: 'en-US' },
  } as const;
  for (const a of [...blogArticles, ...blogArticlesEn]) {
    const path = articlePath(a);
    const locale = localeOf(path);
    const w = ARTICLE_WORDS[locale === 'fr' ? 'fr' : 'en'];
    out.push({
      path,
      ...languageOf(path),
      title: a.title,
      description: a.excerpt,
      canonical: path,
      noindex: false,
      type: 'article',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: a.title,
          description: a.excerpt,
          datePublished: a.publishedAt,
          dateModified: a.updatedAt ?? a.publishedAt,
          inLanguage: locale,
          author: { '@type': 'Organization', name: SITE_NAME },
          publisher: ORGANIZATION_LD,
          mainEntityOfPage: absolute(path),
          keywords: a.tags.join(', '),
        },
        breadcrumbLD([{ name: w.home, path: w.homePath }, { name: 'Blog', path: w.blogPath }, { name: a.title, path }]),
      ],
      body: renderToStaticMarkup(
        <Shell path={path}>
          <p className="text-sm text-muted-foreground"><a href={w.blogPath} className="underline">Blog</a> · {a.category} · {a.readTime}{a.updatedAt ? ` · ${w.updated}${new Date(a.updatedAt).toLocaleDateString(w.dateLocale, { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-foreground">{a.title}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{a.excerpt}</p>
          <article className="mt-8">{a.content}</article>
          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground">{w.related}</h2>
            <ul className="mt-4 space-y-2">
              {relatedArticles(a).map((r) => (
                <li key={r.slug}><a href={articlePath(r)} className="text-primary underline">{r.title}</a></li>
              ))}
              <li><a href={w.templatePath} className="text-primary underline">{w.template}</a></li>
            </ul>
          </section>
          <p className="mt-10"><a href="/signup" className="font-semibold text-primary underline">{w.cta}</a></p>
        </Shell>,
      ),
      sitemap: { priority: 0.7, changefreq: 'monthly', lastmod: a.updatedAt ?? a.publishedAt },
    });
  }
  return out;
}
