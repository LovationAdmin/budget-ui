// src/data/blog-related.ts
// « À lire aussi » under each article (React page and prerendered HTML):
// the article's curated `related` slugs first, then the articles sharing the
// most tags / the same category, newest first. Internal links matter for
// search engines as much as for readers.

import { blogArticles, type BlogArticleContent } from './blog-articles';

/** Articles newest first (last significant update, else publication). */
export const articlesByDate = (): BlogArticleContent[] =>
  [...blogArticles].sort((a, b) => (b.updatedAt ?? b.publishedAt).localeCompare(a.updatedAt ?? a.publishedAt));

export function relatedArticles(article: BlogArticleContent, count = 3): BlogArticleContent[] {
  const curated = (article.related ?? [])
    .map((slug) => blogArticles.find((a) => a.slug === slug))
    .filter((a): a is BlogArticleContent => !!a && a.slug !== article.slug);
  const score = (a: BlogArticleContent) =>
    a.tags.filter((t) => article.tags.includes(t)).length * 2 + (a.category === article.category ? 3 : 0);
  const rest = articlesByDate()
    .filter((a) => a.slug !== article.slug && !curated.includes(a))
    .sort((a, b) => score(b) - score(a));
  return [...curated, ...rest].slice(0, count);
}
