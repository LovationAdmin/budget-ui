// src/data/blog-related.ts
// « À lire aussi » / « Keep reading » under each article (React page and
// prerendered HTML): the article's curated `related` slugs first, then the
// articles of the same language sharing the most tags / the same category,
// newest first. Internal links matter for search engines as much as for readers.

import type { Locale } from '@/i18n/locales';
import { blogArticles, type BlogArticleContent } from './blog-articles';
import { blogArticlesEn } from './blog-articles-en';

/** The articles of a language. */
export const articlesOf = (locale: Locale): BlogArticleContent[] => (locale === 'en' ? blogArticlesEn : blogArticles);

/** The language of an article. */
export const articleLocale = (article: BlogArticleContent): Locale => (blogArticlesEn.includes(article) ? 'en' : 'fr');

/** URL of an article: /blog/… in French, /en/blog/… in English. */
export const articlePath = (article: BlogArticleContent): string =>
  `${articleLocale(article) === 'en' ? '/en' : ''}/blog/${article.slug}`;

/** Articles newest first (last significant update, else publication). */
export const articlesByDate = (locale: Locale = 'fr'): BlogArticleContent[] =>
  [...articlesOf(locale)].sort((a, b) => (b.updatedAt ?? b.publishedAt).localeCompare(a.updatedAt ?? a.publishedAt));

export function relatedArticles(article: BlogArticleContent, count = 3): BlogArticleContent[] {
  const locale = articleLocale(article);
  const list = articlesOf(locale);
  const curated = (article.related ?? [])
    .map((slug) => list.find((a) => a.slug === slug))
    .filter((a): a is BlogArticleContent => !!a && a.slug !== article.slug);
  const score = (a: BlogArticleContent) =>
    a.tags.filter((t) => article.tags.includes(t)).length * 2 + (a.category === article.category ? 3 : 0);
  const rest = articlesByDate(locale)
    .filter((a) => a.slug !== article.slug && !curated.includes(a))
    .sort((a, b) => score(b) - score(a));
  return [...curated, ...rest].slice(0, count);
}
