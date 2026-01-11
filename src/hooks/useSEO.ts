// src/hooks/useSEO.ts
// Hook pour gérer dynamiquement les meta tags SEO côté client

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOConfig {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

// Configuration SEO par route
const SEO_CONFIG: Record<string, SEOConfig> = {
  '/': {
    title: 'Budget Famille - Gérez votre budget familial simplement',
    description: 'Application gratuite de gestion de budget familial. Suivez vos revenus, dépenses et projets. Collaborez en famille. Synchronisation bancaire disponible.',
  },
  '/features': {
    title: 'Fonctionnalités - Budget Famille',
    description: 'Découvrez toutes les fonctionnalités de Budget Famille : suivi des dépenses, projets d\'épargne, collaboration familiale, synchronisation bancaire et bien plus.',
  },
  '/smart-tools': {
    title: 'Outils IA - Budget Famille',
    description: 'Optimisez votre budget avec nos outils intelligents powered by AI. Analysez vos dépenses et trouvez des économies automatiquement.',
  },
  '/outils-ia': {
    title: 'Outils IA - Budget Famille',
    description: 'Optimisez votre budget avec nos outils intelligents powered by AI. Analysez vos dépenses et trouvez des économies automatiquement.',
    canonical: 'https://budgetfamille.com/smart-tools',
  },
  '/premium': {
    title: 'Premium - Budget Famille',
    description: 'Passez à Budget Famille Premium pour débloquer toutes les fonctionnalités avancées : synchronisation bancaire, analyses IA, et bien plus.',
  },
  '/blog': {
    title: 'Blog - Conseils Budget Familial',
    description: 'Articles et conseils pratiques pour mieux gérer votre budget familial, épargner et atteindre vos objectifs financiers.',
  },
  '/help': {
    title: 'Centre d\'aide - Budget Famille',
    description: 'Trouvez des réponses à vos questions sur l\'utilisation de Budget Famille. Tutoriels, FAQ et assistance.',
  },
  '/about': {
    title: 'À propos - Budget Famille',
    description: 'Découvrez l\'histoire de Budget Famille, notre mission et nos valeurs. Une application créée pour les familles, par des familles.',
  },
  '/login': {
    title: 'Connexion - Budget Famille',
    description: 'Connectez-vous à votre compte Budget Famille pour accéder à vos budgets et gérer vos finances familiales.',
  },
  '/signup': {
    title: 'Inscription - Budget Famille',
    description: 'Créez votre compte Budget Famille gratuitement et commencez à gérer votre budget familial dès aujourd\'hui.',
  },
  '/forgot-password': {
    title: 'Mot de passe oublié - Budget Famille',
    description: 'Réinitialisez votre mot de passe Budget Famille de manière sécurisée.',
  },
  '/privacy': {
    title: 'Politique de confidentialité - Budget Famille',
    description: 'Notre politique de confidentialité détaille comment nous protégeons vos données personnelles et financières.',
  },
  '/terms': {
    title: 'Conditions d\'utilisation - Budget Famille',
    description: 'Conditions générales d\'utilisation du service Budget Famille.',
  },
  // Pages privées - noindex
  '/dashboard': {
    title: 'Tableau de bord - Budget Famille',
    description: 'Gérez vos budgets familiaux depuis votre tableau de bord.',
    noindex: true,
  },
  '/profile': {
    title: 'Mon profil - Budget Famille',
    description: 'Gérez votre profil et vos paramètres Budget Famille.',
    noindex: true,
  },
};

const BASE_URL = 'https://budgetfamille.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

export function useSEO(customConfig?: Partial<SEOConfig>) {
  const location = useLocation();
  
  useEffect(() => {
    const path = location.pathname;
    
    // Trouver la config pour cette route (ou utiliser les valeurs par défaut)
    let config = SEO_CONFIG[path] || {
      title: 'Budget Famille',
      description: 'Application de gestion de budget familial',
    };
    
    // Fusionner avec la config custom si fournie
    if (customConfig) {
      config = { ...config, ...customConfig };
    }
    
    const canonical = config.canonical || `${BASE_URL}${path === '/' ? '' : path}`;
    const ogImage = config.ogImage || DEFAULT_OG_IMAGE;
    
    // Mettre à jour le titre
    document.title = config.title;
    
    // Helper pour mettre à jour ou créer une meta tag
    const setMeta = (selector: string, content: string, attr = 'content') => {
      let element = document.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
      
      if (!element) {
        // Créer la meta tag si elle n'existe pas
        const tag = selector.startsWith('link') ? 'link' : 'meta';
        element = document.createElement(tag) as HTMLMetaElement | HTMLLinkElement;
        
        // Extraire les attributs du sélecteur
        const matches = selector.match(/\[([^\]]+)\]/g);
        if (matches) {
          matches.forEach(match => {
            const [attrName, attrValue] = match.slice(1, -1).split('=');
            element!.setAttribute(attrName, attrValue?.replace(/"/g, '') || '');
          });
        }
        
        document.head.appendChild(element);
      }
      
      if (attr === 'href') {
        (element as HTMLLinkElement).href = content;
      } else {
        (element as HTMLMetaElement).content = content;
      }
    };
    
    // Meta description
    setMeta('meta[name="description"]', config.description);
    
    // Canonical
    setMeta('link[rel="canonical"]', canonical, 'href');
    
    // Open Graph
    setMeta('meta[property="og:url"]', canonical);
    setMeta('meta[property="og:title"]', config.title);
    setMeta('meta[property="og:description"]', config.description);
    setMeta('meta[property="og:image"]', ogImage);
    
    // Twitter
    setMeta('meta[name="twitter:url"]', canonical);
    setMeta('meta[name="twitter:title"]', config.title);
    setMeta('meta[name="twitter:description"]', config.description);
    setMeta('meta[name="twitter:image"]', ogImage);
    
    // Robots
    const robotsContent = config.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    setMeta('meta[name="robots"]', robotsContent);
    
  }, [location.pathname, customConfig]);
}

// Hook pour les articles de blog avec titre dynamique
export function useBlogSEO(article: { title: string; excerpt: string; slug: string } | null) {
  useSEO(article ? {
    title: `${article.title} - Blog Budget Famille`,
    description: article.excerpt,
    canonical: `${BASE_URL}/blog/${article.slug}`,
  } : undefined);
}