// src/seo/prerender.tsx
// ============================================================================
// Build-time page generation (run by scripts/prerender.mjs, never shipped to
// the browser). For each public page: its head (title, description,
// canonical, robots, Open Graph, JSON-LD) and readable static content, so
// search engines, social networks and AI crawlers see the page without
// running JavaScript. React replaces the content as soon as the app loads.
// ============================================================================

import { renderToStaticMarkup } from 'react-dom/server';
import { blogArticles } from '@/data/blog-articles';
import { articlesByDate, relatedArticles } from '@/data/blog-related';
import { HOME_FAQ, RAV_FAQ, TEMPLATE_FAQ } from './faq';
import {
  ORGANIZATION_LD, PAGES, SITE_NAME, SOFTWARE_LD, absolute, breadcrumbLD, faqLD, type PageSEO,
} from './site';

export interface BuiltPage {
  path: string;
  title: string;
  description: string;
  canonical: string;
  noindex: boolean;
  type: 'website' | 'article';
  jsonLd: object[];
  body: string;
  sitemap?: { priority: number; changefreq: string; lastmod?: string };
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 px-4 py-4">
        <nav aria-label="Navigation principale" className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <a href="/" className="font-display text-lg font-bold text-foreground">{SITE_NAME}</a>
          <a href="/features" className="text-muted-foreground">Fonctionnalités</a>
          <a href="/tableau-budget-familial-gratuit" className="text-muted-foreground">Tableau gratuit</a>
          <a href="/calcul-reste-a-vivre" className="text-muted-foreground">Reste à vivre</a>
          <a href="/blog" className="text-muted-foreground">Conseils</a>
          <a href="/help" className="text-muted-foreground">Aide</a>
          <a href="/signup" className="font-semibold text-primary">Créer mon budget gratuit</a>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12">{children}</main>
    </div>
  );
}

function StaticPage({ page, extra }: { page: PageSEO; extra?: React.ReactNode }) {
  return (
    <Shell>
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

function FaqBlock({ items }: { items: Array<{ q: string; a: string }> }) {
  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl font-bold text-foreground">Questions fréquentes</h2>
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
    } else if (page.path === '/tableau-budget-familial-gratuit') {
      jsonLd.push(faqLD(TEMPLATE_FAQ), breadcrumbLD([{ name: 'Accueil', path: '/' }, { name: 'Tableau de budget familial gratuit', path: page.path }]));
      extra = <FaqBlock items={TEMPLATE_FAQ} />;
    } else if (page.path === '/calcul-reste-a-vivre') {
      jsonLd.push(
        {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Simulateur de reste à vivre',
          url: absolute(page.path),
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web',
          inLanguage: 'fr',
          isAccessibleForFree: true,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
          publisher: ORGANIZATION_LD,
        },
        faqLD(RAV_FAQ),
        breadcrumbLD([{ name: 'Accueil', path: '/' }, { name: 'Calcul du reste à vivre', path: page.path }]),
      );
      extra = <FaqBlock items={RAV_FAQ} />;
    } else if (page.path === '/blog') {
      extra = <BlogIndex />;
    }
    out.push({
      path: page.path,
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
        <Shell>
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
