// src/seo/prerender.tsx
// ============================================================================
// Build-time page generation (run by scripts/prerender.mjs, never shipped to
// the browser). For each public page: its head (title, description,
// canonical, robots, Open Graph, JSON-LD) and readable static content, so
// search engines, social networks and AI crawlers see the page without
// running JavaScript. React replaces the content as soon as the app loads.
// The language (lang, og:locale, hreflang) follows from the path: pages under
// /en/ are in English, and src/i18n/locales.ts pairs translated pages.
// ============================================================================

import { renderToStaticMarkup } from 'react-dom/server';
import { blogArticles } from '@/data/blog-articles';
import { articlesByDate, relatedArticles } from '@/data/blog-related';
import { LOCALES, alternatesOf, hreflangsOf, localeOf, type Locale } from '@/i18n/locales';
import { HOME_FAQ, RAV_FAQ, TEMPLATE_FAQ, type FaqItem } from './faq';
import { EN_TOOLS } from '@/i18n/en/tools';
import { BUDGET_503020_FAQ_EN } from './faq-503020-en';
import { HOME_FAQ_EN } from './faq-home-en';
import { LEFTOVER_INCOME_FAQ_EN } from './faq-leftover-income-en';
import { TEMPLATE_FAQ_EN } from './faq-template-en';
import { RENT_SPLIT_FAQ_EN } from './faq-rent-split-en';
import { WEDDING_FAQ_EN } from './faq-wedding-en';
import { COLOC_FAQ } from './faq-colocation';
import { MARIAGE_FAQ } from './faq-mariage';
import { PERSO_FAQ } from './faq-budget-personnel';
import {
  ORGANIZATION_LD, PAGES, SITE_NAME, SOFTWARE_LD, SOFTWARE_LD_EN, absolute, breadcrumbLD, faqLD, type PageSEO,
} from './site';

export interface BuiltPage {
  path: string;
  locale: Locale;
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
        <a key={l} href={alts[l]} hrefLang={l} lang={l} className="font-semibold text-primary">{LOCALES[l].switchLabel}</a>
      ))}
    </>
  );
}

function Shell({ path, children }: { path: string; children: React.ReactNode }) {
  if (localeOf(path) === 'en') {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/60 px-4 py-4">
          <nav aria-label="Main navigation" className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <a href={LOCALES.en.home} className="font-display text-lg font-bold text-foreground">{SITE_NAME}</a>
            <a href="/en/features" className="text-muted-foreground">Features</a>
            <a href="/en/free-budget-template" className="text-muted-foreground">Free template</a>
            {EN_TOOLS.map((tool) => <a key={tool.path} href={tool.path} className="text-muted-foreground">{tool.label}</a>)}
            <a href="/en/help" className="text-muted-foreground">Help</a>
            <a href="/signup" className="font-semibold text-primary">Create my free budget</a>
            <LanguageLinks path={path} />
          </nav>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-12">{children}</main>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 px-4 py-4">
        <nav aria-label="Navigation principale" className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <a href="/" className="font-display text-lg font-bold text-foreground">{SITE_NAME}</a>
          <a href="/features" className="text-muted-foreground">Fonctionnalités</a>
          <a href="/tableau-budget-familial-gratuit" className="text-muted-foreground">Tableau gratuit</a>
          <a href="/calcul-reste-a-vivre" className="text-muted-foreground">Reste à vivre</a>
          <a href="/budget-personnel" className="text-muted-foreground">Budget perso</a>
          <a href="/budget-colocation" className="text-muted-foreground">Colocation</a>
          <a href="/budget-mariage" className="text-muted-foreground">Mariage</a>
          <a href="/blog" className="text-muted-foreground">Conseils</a>
          <a href="/help" className="text-muted-foreground">Aide</a>
          <a href="/signup" className="font-semibold text-primary">Créer mon budget gratuit</a>
          <LanguageLinks path={path} />
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12">{children}</main>
    </div>
  );
}

function StaticPage({ page, extra }: { page: PageSEO; extra?: React.ReactNode }) {
  return (
    <Shell path={page.path}>
      <h1 className="font-display text-4xl font-bold text-foreground">{page.h1 ?? page.title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{page.intro ?? page.description}</p>
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

function FaqBlock({ items, locale = 'fr' }: { items: Array<{ q: string; a: string }>; locale?: Locale }) {
  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl font-bold text-foreground">{locale === 'en' ? 'Frequently asked questions' : 'Questions fréquentes'}</h2>
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

function BlogIndex() {
  return (
    <section className="mt-10">
      <ul className="space-y-6">
        {articlesByDate().map((a) => (
          <li key={a.slug}>
            <h2 className="text-xl font-bold"><a href={`/blog/${a.slug}`} className="text-foreground underline">{a.title}</a></h2>
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
};

/** Language fields of a built page: its locale, Open Graph locales and hreflang versions. */
function languageOf(path: string): Pick<BuiltPage, 'locale' | 'ogLocale' | 'ogLocaleAlternates' | 'hreflang'> {
  const locale = localeOf(path);
  const alts = alternatesOf(path) ?? {};
  return {
    locale,
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
          inLanguage: locale,
          isAccessibleForFree: true,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
          publisher: ORGANIZATION_LD,
        },
        faqLD(tool.faq),
        breadcrumbLD([{ name: locale === 'en' ? 'Home' : 'Accueil', path: LOCALES[locale].home }, { name: tool.crumb, path: page.path }]),
      );
      extra = <FaqBlock items={tool.faq} locale={locale} />;
    } else if (page.path === '/blog') {
      extra = <BlogIndex />;
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
  for (const a of blogArticles) {
    const path = `/blog/${a.slug}`;
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
          inLanguage: 'fr',
          author: { '@type': 'Organization', name: SITE_NAME },
          publisher: ORGANIZATION_LD,
          mainEntityOfPage: absolute(path),
          keywords: a.tags.join(', '),
        },
        breadcrumbLD([{ name: 'Accueil', path: '/' }, { name: 'Blog', path: '/blog' }, { name: a.title, path }]),
      ],
      body: renderToStaticMarkup(
        <Shell path={path}>
          <p className="text-sm text-muted-foreground"><a href="/blog" className="underline">Blog</a> · {a.category} · {a.readTime}{a.updatedAt ? ` · mis à jour le ${new Date(a.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-foreground">{a.title}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{a.excerpt}</p>
          <article className="mt-8">{a.content}</article>
          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground">À lire aussi</h2>
            <ul className="mt-4 space-y-2">
              {relatedArticles(a).map((r) => (
                <li key={r.slug}><a href={`/blog/${r.slug}`} className="text-primary underline">{r.title}</a></li>
              ))}
              <li><a href="/tableau-budget-familial-gratuit" className="text-primary underline">Tableau de budget familial gratuit (Excel et PDF)</a></li>
            </ul>
          </section>
          <p className="mt-10"><a href="/signup" className="font-semibold text-primary underline">Créer mon budget familial gratuit</a></p>
        </Shell>,
      ),
      sitemap: { priority: 0.7, changefreq: 'monthly', lastmod: a.updatedAt ?? a.publishedAt },
    });
  }
  return out;
}
