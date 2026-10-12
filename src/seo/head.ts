// src/seo/head.ts
// Applies a page's search metadata to the live document (client-side
// navigation). The prerendered HTML already carries the same values. The
// language and its alternates follow from the canonical path (src/i18n).

import { LOCALES, alternatesOf, hreflangsOf, localeOf, type Locale } from '@/i18n/locales';
import { DEFAULT_IMAGE, SITE_NAME, absolute } from './site';

export interface HeadMeta {
  title: string;
  description: string;
  canonical: string;
  noindex?: boolean;
  image?: string;
  type?: 'website' | 'article';
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

export function applyHead(m: HeadMeta) {
  // Long titles keep their words rather than the brand (results cut at ~60).
  const title = m.title.includes(SITE_NAME) || m.title.length > 50 ? m.title : `${m.title} – ${SITE_NAME}`;
  document.title = title;
  const url = absolute(m.canonical);
  setMeta('name', 'description', m.description);
  setMeta('name', 'robots', m.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large');
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', m.description);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:type', m.type ?? 'website');
  setMeta('property', 'og:image', m.image ?? DEFAULT_IMAGE);
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', m.description);
  setMeta('name', 'twitter:image', m.image ?? DEFAULT_IMAGE);
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = url;
  const locale = localeOf(m.canonical);
  document.documentElement.lang = locale;
  setMeta('property', 'og:locale', LOCALES[locale].og);
  document.head.querySelectorAll('link[rel="alternate"][hreflang], meta[property="og:locale:alternate"]').forEach((el) => el.remove());
  for (const alt of hreflangsOf(m.canonical)) {
    const el = document.createElement('link');
    el.rel = 'alternate';
    el.hreflang = alt.hreflang;
    el.href = absolute(alt.path);
    document.head.appendChild(el);
  }
  for (const l of Object.keys(alternatesOf(m.canonical) ?? {}) as Locale[]) {
    if (l === locale) continue;
    const el = document.createElement('meta');
    el.setAttribute('property', 'og:locale:alternate');
    el.content = LOCALES[l].og;
    document.head.appendChild(el);
  }
}
