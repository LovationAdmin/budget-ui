// scripts/prerender.js
// Script de pre-rendering pour générer des pages HTML statiques pour le SEO
// Exécuter après le build: node scripts/prerender.js

const fs = require('fs');
const path = require('path');

// Configuration des pages publiques à pré-rendre
const PUBLIC_ROUTES = [
  { path: '/', title: 'Budget Famille - Gérez votre budget familial simplement', description: 'Application gratuite de gestion de budget familial. Suivez vos revenus, dépenses et projets. Collaborez en famille. Synchronisation bancaire disponible.' },
  { path: '/features', title: 'Fonctionnalités - Budget Famille', description: 'Découvrez toutes les fonctionnalités de Budget Famille : suivi des dépenses, projets d\'épargne, collaboration familiale, synchronisation bancaire et bien plus.' },
  { path: '/smart-tools', title: 'Outils IA - Budget Famille', description: 'Optimisez votre budget avec nos outils intelligents powered by AI. Analysez vos dépenses et trouvez des économies automatiquement.' },
  { path: '/premium', title: 'Premium - Budget Famille', description: 'Passez à Budget Famille Premium pour débloquer toutes les fonctionnalités avancées : synchronisation bancaire, analyses IA, et bien plus.' },
  { path: '/blog', title: 'Blog - Conseils Budget Familial', description: 'Articles et conseils pratiques pour mieux gérer votre budget familial, épargner et atteindre vos objectifs financiers.' },
  { path: '/help', title: 'Centre d\'aide - Budget Famille', description: 'Trouvez des réponses à vos questions sur l\'utilisation de Budget Famille. Tutoriels, FAQ et assistance.' },
  { path: '/about', title: 'À propos - Budget Famille', description: 'Découvrez l\'histoire de Budget Famille, notre mission et nos valeurs. Une application créée pour les familles, par des familles.' },
  { path: '/login', title: 'Connexion - Budget Famille', description: 'Connectez-vous à votre compte Budget Famille pour accéder à vos budgets et gérer vos finances familiales.' },
  { path: '/signup', title: 'Inscription - Budget Famille', description: 'Créez votre compte Budget Famille gratuitement et commencez à gérer votre budget familial dès aujourd\'hui.' },
  { path: '/forgot-password', title: 'Mot de passe oublié - Budget Famille', description: 'Réinitialisez votre mot de passe Budget Famille de manière sécurisée.' },
  { path: '/privacy', title: 'Politique de confidentialité - Budget Famille', description: 'Notre politique de confidentialité détaille comment nous protégeons vos données personnelles et financières.' },
  { path: '/terms', title: 'Conditions d\'utilisation - Budget Famille', description: 'Conditions générales d\'utilisation du service Budget Famille.' },
];

const BASE_URL = 'https://budgetfamille.com';

// Template HTML de base avec le contenu SEO
function generateHTML(route) {
  const canonical = `${BASE_URL}${route.path === '/' ? '' : route.path}`;
  const ogImage = `${BASE_URL}/og-image.png`;
  
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  
  <title>${route.title}</title>
  <meta name="description" content="${route.description}" />
  <meta name="keywords" content="budget familial, gestion budget, finances famille, épargne, dépenses, revenus, application budget" />
  
  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${route.title}" />
  <meta property="og:description" content="${route.description}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:locale" content="fr_FR" />
  <meta property="og:site_name" content="Budget Famille" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${canonical}" />
  <meta name="twitter:title" content="${route.title}" />
  <meta name="twitter:description" content="${route.description}" />
  <meta name="twitter:image" content="${ogImage}" />
  
  <!-- SEO -->
  <link rel="canonical" href="${canonical}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
  
  <!-- Favicons -->
  <link rel="icon" sizes="any" href="/favicon.ico" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <meta name="theme-color" content="#F97316" />
  
  <meta name="author" content="Budget Famille" />
  <meta name="copyright" content="Budget Famille © 2025" />
  <meta name="google-site-verification" content="G_DnjA1zj2i8bZWC1erQDcEmLwCczBSZGfTkVTceztU" />
  
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
  
  <style>
    html { font-size: 16px; -webkit-text-size-adjust: 100%; overflow-x: hidden; }
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 1rem; line-height: 1.5; overflow-x: hidden; max-width: 100vw; }
    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    button, a[role="button"], [role="button"] { min-height: 48px; min-width: 48px; touch-action: manipulation; }
    input, select, textarea { font-size: 16px !important; }
    img { max-width: 100%; height: auto; }
    #root { min-height: 100vh; }
  </style>
  
  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Budget Famille",
    "url": "${BASE_URL}",
    "description": "Application gratuite de gestion de budget familial",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150"
    }
  }
  </script>
  
  <!-- Google Analytics (GA4) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-85R8CTX8S3"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-85R8CTX8S3', { 'anonymize_ip': true, 'cookie_flags': 'SameSite=None;Secure' });
  </script>
</head>
<body>
  <div id="root">
    <!-- SEO Content for crawlers (will be replaced by React) -->
    <noscript>
      <h1>${route.title}</h1>
      <p>${route.description}</p>
      <p>Cette application nécessite JavaScript pour fonctionner. Veuillez activer JavaScript dans votre navigateur.</p>
      <nav>
        <a href="/">Accueil</a> |
        <a href="/features">Fonctionnalités</a> |
        <a href="/smart-tools">Outils IA</a> |
        <a href="/premium">Premium</a> |
        <a href="/blog">Blog</a> |
        <a href="/help">Aide</a> |
        <a href="/about">À propos</a> |
        <a href="/login">Connexion</a> |
        <a href="/signup">Inscription</a>
      </nav>
    </noscript>
  </div>
  
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`;
}

// Fonction principale
function main() {
  const distDir = path.join(__dirname, '..', 'dist');
  
  // Vérifier si le dossier dist existe
  if (!fs.existsSync(distDir)) {
    console.error('❌ Le dossier dist n\'existe pas. Exécutez d\'abord npm run build');
    process.exit(1);
  }
  
  // Lire le fichier index.html généré par Vite
  const indexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('❌ Le fichier dist/index.html n\'existe pas');
    process.exit(1);
  }
  
  const baseHTML = fs.readFileSync(indexPath, 'utf-8');
  
  console.log('🚀 Début du pre-rendering SEO...\n');
  
  PUBLIC_ROUTES.forEach(route => {
    // Générer le HTML avec les bonnes meta tags
    let html = baseHTML;
    
    const canonical = `${BASE_URL}${route.path === '/' ? '' : route.path}`;
    
    // Remplacer les meta tags
    html = html.replace(
      /<title>.*?<\/title>/,
      `<title>${route.title}</title>`
    );
    
    html = html.replace(
      /<meta name="description" content="[^"]*"/,
      `<meta name="description" content="${route.description}"`
    );
    
    html = html.replace(
      /<link rel="canonical" href="[^"]*"/,
      `<link rel="canonical" href="${canonical}"`
    );
    
    html = html.replace(
      /<meta property="og:url" content="[^"]*"/,
      `<meta property="og:url" content="${canonical}"`
    );
    
    html = html.replace(
      /<meta property="og:title" content="[^"]*"/,
      `<meta property="og:title" content="${route.title}"`
    );
    
    html = html.replace(
      /<meta property="og:description" content="[^"]*"/,
      `<meta property="og:description" content="${route.description}"`
    );
    
    html = html.replace(
      /<meta name="twitter:url" content="[^"]*"/,
      `<meta name="twitter:url" content="${canonical}"`
    );
    
    html = html.replace(
      /<meta name="twitter:title" content="[^"]*"/,
      `<meta name="twitter:title" content="${route.title}"`
    );
    
    html = html.replace(
      /<meta name="twitter:description" content="[^"]*"/,
      `<meta name="twitter:description" content="${route.description}"`
    );
    
    // Créer le dossier si nécessaire
    if (route.path !== '/') {
      const routeDir = path.join(distDir, route.path);
      if (!fs.existsSync(routeDir)) {
        fs.mkdirSync(routeDir, { recursive: true });
      }
      fs.writeFileSync(path.join(routeDir, 'index.html'), html);
      console.log(`✅ ${route.path}/index.html`);
    } else {
      // La page d'accueil est déjà à dist/index.html
      fs.writeFileSync(indexPath, html);
      console.log(`✅ /index.html (accueil)`);
    }
  });
  
  console.log(`\n✨ Pre-rendering terminé ! ${PUBLIC_ROUTES.length} pages générées.`);
}

main();