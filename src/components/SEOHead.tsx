// src/components/SEOHead.tsx
// Composant pour gérer les meta tags SEO de manière déclarative
// Utilisation: <SEOHead title="..." description="..." />

import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noindex?: boolean;
  jsonLd?: object;
  children?: React.ReactNode;
}

const BASE_URL = 'https://budgetfamille.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

export default function SEOHead({
  title,
  description,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  noindex = false,
  jsonLd,
}: SEOHeadProps) {
  useEffect(() => {
    // Mettre à jour le titre
    const fullTitle = title.includes('Budget Famille') ? title : `${title} - Budget Famille`;
    document.title = fullTitle;
    
    const canonicalUrl = canonical || `${BASE_URL}${window.location.pathname === '/' ? '' : window.location.pathname}`;
    
    // Helper pour mettre à jour une meta tag
    const updateMeta = (selector: string, content: string) => {
      const element = document.querySelector(selector) as HTMLMetaElement;
      if (element) {
        element.content = content;
      }
    };
    
    const updateLink = (selector: string, href: string) => {
      const element = document.querySelector(selector) as HTMLLinkElement;
      if (element) {
        element.href = href;
      }
    };
    
    // Mettre à jour toutes les meta tags
    updateMeta('meta[name="description"]', description);
    updateLink('link[rel="canonical"]', canonicalUrl);
    
    // Open Graph
    updateMeta('meta[property="og:type"]', ogType);
    updateMeta('meta[property="og:url"]', canonicalUrl);
    updateMeta('meta[property="og:title"]', fullTitle);
    updateMeta('meta[property="og:description"]', description);
    updateMeta('meta[property="og:image"]', ogImage);
    
    // Twitter
    updateMeta('meta[name="twitter:url"]', canonicalUrl);
    updateMeta('meta[name="twitter:title"]', fullTitle);
    updateMeta('meta[name="twitter:description"]', description);
    updateMeta('meta[name="twitter:image"]', ogImage);
    
    // Robots
    const robotsContent = noindex 
      ? 'noindex, nofollow' 
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    updateMeta('meta[name="robots"]', robotsContent);
    
    // JSON-LD Schema
    if (jsonLd) {
      const existingScript = document.querySelector('script[data-seo-jsonld]');
      if (existingScript) {
        existingScript.remove();
      }
      
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-jsonld', 'true');
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
      
      return () => {
        script.remove();
      };
    }
  }, [title, description, canonical, ogImage, ogType, noindex, jsonLd]);
  
  return null; // Ce composant ne rend rien visuellement
}

// Composant pour les articles de blog avec Schema.org Article
interface BlogSEOProps {
  title: string;
  description: string;
  slug: string;
  publishedDate?: string;
  modifiedDate?: string;
  author?: string;
  image?: string;
}

export function BlogArticleSEO({
  title,
  description,
  slug,
  publishedDate,
  modifiedDate,
  author = 'Budget Famille',
  image,
}: BlogSEOProps) {
  const canonical = `${BASE_URL}/blog/${slug}`;
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': title,
    'description': description,
    'url': canonical,
    'datePublished': publishedDate,
    'dateModified': modifiedDate || publishedDate,
    'author': {
      '@type': 'Organization',
      'name': author,
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Budget Famille',
      'logo': {
        '@type': 'ImageObject',
        'url': `${BASE_URL}/logo.png`,
      },
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': canonical,
    },
  };
  
  return (
    <SEOHead
      title={title}
      description={description}
      canonical={canonical}
      ogType="article"
      ogImage={image}
      jsonLd={jsonLd}
    />
  );
}

// Export des schemas JSON-LD réutilisables
export const schemas = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Budget Famille',
    'url': BASE_URL,
    'logo': `${BASE_URL}/logo.png`,
    'sameAs': [
      // Ajouter les liens vers les réseaux sociaux si disponibles
    ],
  },
  
  webApplication: {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'Budget Famille',
    'url': BASE_URL,
    'description': 'Application gratuite de gestion de budget familial',
    'applicationCategory': 'FinanceApplication',
    'operatingSystem': 'Web, iOS, Android',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'EUR',
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.8',
      'ratingCount': '150',
    },
  },
  
  faqPage: (faqs: Array<{ question: string; answer: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer,
      },
    })),
  }),
  
  breadcrumb: (items: Array<{ name: string; url: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url,
    })),
  }),
};