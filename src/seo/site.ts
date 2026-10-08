// src/seo/site.ts
// ============================================================================
// One source of truth for the search metadata of public pages: used in the
// browser by <RouteSEO /> (title/description/canonical on navigation) and at
// build time by scripts/prerender.mjs, which writes one HTML file per page
// with its own head, structured data and readable content.
// ============================================================================

/** Canonical host: the bare domain redirects here. */
export const SITE = 'https://www.budgetfamille.com';
export const SITE_NAME = 'Budget Famille';
export const DEFAULT_IMAGE = `${SITE}/og-image.png`;

export interface PageSEO {
  path: string;
  title: string;
  description: string;
  /** Canonical path when several URLs show the same page. */
  canonical?: string;
  noindex?: boolean;
  /** Prerendered body: a heading, a short text and the useful links. */
  h1?: string;
  intro?: string;
  links?: Array<{ href: string; label: string }>;
  /** Extra prerendered sections (substance for crawlers without JS). */
  sections?: Array<{ h2: string; text: string }>;
  priority?: number;
  changefreq?: 'weekly' | 'monthly' | 'yearly';
}

const CTA = { href: '/signup', label: 'Créer mon budget gratuit' };

export const PAGES: PageSEO[] = [
  {
    path: '/',
    title: 'Application de budget familial gratuite – Budget Famille',
    description: 'Application et logiciel de budget familial gratuits : pot commun du couple, argent de poche, charges et épargne. Sans connexion bancaire obligatoire.',
    h1: 'L’application de budget familial gratuite, pensée pour le couple et la famille',
    intro: 'Pot commun, argent de poche de chacun, charges et épargne : tout le mois en un coup d’œil. Sans connexion bancaire obligatoire, sans publicité, à plusieurs en temps réel.',
    links: [CTA, { href: '/tableau-budget-familial-gratuit', label: 'Tableau de budget familial gratuit (Excel et PDF)' }, { href: '/calcul-reste-a-vivre', label: 'Calcul du reste à vivre' }, { href: '/blog/5-etapes-gerer-budget-familial-2025', label: 'Établir un budget familial' }, { href: '/blog/budget-famille-4-personnes-exemple', label: 'Exemple de budget pour une famille de 4' }, { href: '/features', label: 'Toutes les fonctionnalités' }, { href: '/blog', label: 'Conseils budget' }],
    priority: 1,
    changefreq: 'weekly',
  },
  {
    path: '/tableau-budget-familial-gratuit',
    title: 'Tableau budget familial gratuit : Excel et PDF à imprimer',
    description: 'Tableau de budget familial gratuit : Excel avec calculs automatiques (compatible Google Sheets) ou PDF à imprimer. Budget du mois, épargne, compte commun.',
    h1: 'Tableau de budget familial gratuit',
    intro: 'Un modèle simple pour suivre le budget mensuel du foyer : revenus, dépenses, épargne, et la répartition du compte commun dans un couple. En Excel, les calculs sont déjà faits ; en PDF, il s’imprime et se remplit au stylo.',
    links: [
      { href: '/telechargements/tableau-budget-familial-budgetfamille.xlsx', label: 'Tableau Excel (.xlsx)' },
      { href: '/telechargements/tableau-budget-familial-a-imprimer.pdf', label: 'PDF à imprimer (A4, 3 pages)' },
      { href: '/blog/5-etapes-gerer-budget-familial-2025', label: 'Établir un budget familial en 5 étapes' },
      { href: '/blog/budget-famille-4-personnes-exemple', label: 'Exemple de budget pour une famille de 4' },
      CTA,
    ],
    priority: 0.9,
    changefreq: 'monthly',
  },
  {
    path: '/calcul-reste-a-vivre',
    title: 'Calcul du reste à vivre : simulateur gratuit par personne',
    description: 'Calculez votre reste à vivre en 1 minute : revenus moins charges fixes, par personne, par jour et par unité de consommation. Gratuit, sans inscription.',
    h1: 'Calcul du reste à vivre',
    intro: 'Vos revenus moins vos charges fixes : voyez ce qu’il reste à votre foyer chaque mois, par personne et par jour. Gratuit, sans inscription, rien n’est envoyé.',
    links: [
      CTA,
      { href: '/tableau-budget-familial-gratuit', label: 'Tableau de budget familial gratuit' },
      { href: '/blog/budget-famille-4-personnes-exemple', label: 'Exemple de budget pour une famille de 4' },
      { href: '/outils-ia', label: 'Réduire ses factures' },
    ],
    sections: [
      { h2: 'Comment calculer son reste à vivre ?', text: 'Reste à vivre = revenus nets du mois − charges fixes du mois. Revenus : salaires nets versés (après l’impôt prélevé à la source), allocations et aides, retraite, pension reçue, loyers perçus. Charges fixes : loyer ou crédit immobilier, autres crédits, énergie, eau, assurances, mutuelle, internet, mobile, abonnements, transport, garde, cantine, impôts non prélevés à la source. Les courses, l’habillement et les loisirs ne sont pas des charges fixes : c’est ce que le reste à vivre finance.' },
      { h2: 'Exemple de calcul', text: 'Dans notre exemple, un couple avec deux enfants de 6 et 10 ans perçoit 3 800 € nets par mois. Loyer 1 100 €, crédit auto 230 €, énergie 160 €, assurances 150 €, internet et mobile 70 €, transport 120 €, garde et cantine 180 € : 2 010 € de charges fixes. Reste à vivre : 1 790 € par mois, soit 447,50 € par personne et environ 60 € par jour.' },
      { h2: 'Par personne ou par unité de consommation ?', text: 'Pour comparer des foyers de tailles différentes, l’Insee divise le revenu par les unités de consommation : 1 pour le premier adulte, 0,5 pour chaque autre personne de 14 ans ou plus, 0,3 par enfant de moins de 14 ans.' },
      { h2: 'Quel est le reste à vivre minimum ?', text: 'En cas de surendettement, la part des ressources laissée au foyer pour ses dépenses courantes, logement compris, ne peut pas être inférieure au montant forfaitaire du RSA (article L731-2 du Code de la consommation) : 651,69 € pour une personne, 977,54 € pour deux, 1 173,05 € pour trois, 1 368,55 € pour quatre au 1er avril 2026, puis 260,68 € par personne en plus. Pour un nouveau crédit immobilier, le taux d’endettement ne doit en principe pas dépasser 35 %, assurance comprise (norme du Haut Conseil de stabilité financière).' },
    ],
    priority: 0.9,
    changefreq: 'monthly',
  },
  {
    path: '/features',
    title: 'Fonctionnalités : pot commun, Budget IA – Budget Famille',
    description: 'Vue du mois, répartition du pot commun, argent de poche, charges perso privées, objectifs d’épargne datés, Budget IA et mode sombre : tout ce que fait Budget Famille.',
    h1: 'Les fonctionnalités de Budget Famille',
    intro: 'Tout ce qu’il faut pour gérer le budget d’un foyer à plusieurs : le mois en un coup d’œil, une répartition juste, des dépenses perso confidentielles et une épargne qui avance.',
    links: [CTA],
    sections: [
      { h2: 'Le mois en un coup d’œil', text: 'Chaque mois affiche ce qui entre dans le pot commun, les charges, l’épargne et le reste. Les charges se répètent toutes seules : chaque mois, certains mois (cantine), chaque année (taxe foncière) ou une seule fois. Un mois terminé est clôturé et figé : modifier un montant n’abîme jamais le passé.' },
      { h2: 'Pot commun et argent de poche', text: 'Pour chaque membre du foyer : son salaire, ce qu’il verse au pot commun et l’argent de poche qui lui reste. L’assistant « Répartir le pot commun » calcule une contribution juste à 50/50, au prorata des salaires ou pour garder le même argent de poche, sur le mois réel.' },
      { h2: 'Charges perso, publiques ou privées', text: 'Un impôt, un envoi d’argent à la famille, un crédit personnel se déduisent de l’argent de poche de son titulaire, jamais du pot commun. En privé, le nom de la charge est chiffré sur nos serveurs et visible par son seul créateur ; le montant reste juste pour le foyer.' },
      { h2: 'Épargne par objectif', text: 'Créez une cagnotte avec un objectif et une date : le montant mensuel est calculé et l’application vérifie qu’il tient dans votre budget, en regardant le mois le plus serré. Les dépenses payées avec l’épargne sont suivies, et le bilan de l’année en tient compte.' },
      { h2: 'Budget IA', text: 'Décrivez votre foyer et vos objectifs : l’IA propose une répartition, des pistes d’économies et un plan pour tenir vos objectifs dans les temps. Rien ne change tant que vous ne validez pas.' },
      { h2: 'À plusieurs, sur tous les écrans', text: 'Invitez votre conjoint : chacun voit les mêmes chiffres en temps réel. L’application fonctionne sur téléphone et ordinateur, en mode clair ou sombre, et chaque modification peut être annulée.' },
    ],
    priority: 0.8,
    changefreq: 'monthly',
  },
  {
    path: '/blog',
    title: 'Conseils budget familial et couple – Le blog Budget Famille',
    description: 'Guides pratiques pour gérer le budget de la famille et du couple : compte commun, argent de poche, épargne par objectif, économies sur les abonnements.',
    h1: 'Conseils budget pour la famille et le couple',
    priority: 0.8,
    changefreq: 'weekly',
  },
  {
    path: '/help',
    title: 'Aide et questions fréquentes – Budget Famille',
    description: 'Comment créer votre budget, ajouter votre foyer, répartir le pot commun, gérer les charges perso et l’épargne : toutes les réponses.',
    h1: 'Centre d’aide',
    links: [CTA],
    sections: [
      { h2: 'Créer son budget', text: 'Créez un compte gratuit, confirmez votre adresse e-mail puis créez votre budget : un nom et votre pays suffisent. Ajoutez ensuite les membres du foyer avec leur salaire net, puis vos charges.' },
      { h2: 'Répartir le pot commun', text: 'Dans l’onglet Foyer, l’assistant « Répartir le pot commun » propose ce que chacun verse : à parts égales, au prorata des salaires ou pour garder le même argent de poche. Rien ne change tant que vous n’appliquez pas.' },
      { h2: 'Charges du foyer et charges perso', text: 'À la création d’une charge, « Qui la paie ? » distingue le pot commun d’un membre. Une charge perso se déduit de l’argent de poche de son titulaire ; elle peut être privée.' },
      { h2: 'Épargne et objectifs', text: 'Une cagnotte peut recevoir un montant chaque mois ou un montant libre. Avec un objectif et une date, le montant mensuel est calculé et sa faisabilité vérifiée.' },
      { h2: 'Mois clôturés', text: 'À la fin d’un mois, ses montants sont figés : changer une charge ou un salaire ensuite ne modifie que l’avenir. Vous pouvez rouvrir un mois si besoin.' },
    ],
    priority: 0.6,
    changefreq: 'monthly',
  },
  {
    path: '/outils-ia',
    title: 'Outils IA gratuits pour réduire vos factures – Budget Famille',
    description: 'Estimez en 30 secondes ce que vous pourriez économiser sur l’énergie, internet, le mobile ou l’assurance, sans créer de compte.',
    h1: 'Outils IA pour réduire vos factures',
    links: [CTA],
    sections: [
      { h2: 'Énergie, internet, mobile, assurance', text: 'Choisissez une dépense, indiquez votre montant actuel et la taille du foyer : l’outil estime en 30 secondes ce que vous pourriez économiser et propose des alternatives, sans créer de compte.' },
      { h2: 'Dans votre budget', text: 'Une fois votre budget créé, l’analyse se fait charge par charge et les économies possibles s’affichent à côté de chaque dépense.' },
    ],
    priority: 0.6,
    changefreq: 'monthly',
  },
  { path: '/smart-tools', canonical: '/outils-ia', title: 'Outils IA gratuits pour réduire vos factures – Budget Famille', description: 'Estimez en 30 secondes ce que vous pourriez économiser sur l’énergie, internet, le mobile ou l’assurance, sans créer de compte.' },
  {
    path: '/premium',
    title: 'Premium : synchronisation bancaire automatique – Budget Famille',
    description: 'L’option Premium à 2 € par mois synchronise automatiquement vos comptes bancaires pour comparer budget prévu et dépenses réelles.',
    h1: 'Budget Famille Premium',
    sections: [
      { h2: 'Ce qui reste gratuit', text: 'Le budget, le foyer, les charges, l’épargne, le Budget IA et le partage en famille restent gratuits.' },
      { h2: 'Ce qu’ajoute Premium', text: 'La synchronisation bancaire automatique compare chaque mois le budget prévu aux dépenses réelles de vos comptes, pour 2 € par mois.' },
    ],
    priority: 0.5,
    changefreq: 'monthly',
  },
  {
    path: '/about',
    title: 'À propos – Budget Famille',
    description: 'Budget Famille est une application française indépendante pour gérer le budget du foyer à plusieurs, simplement et en confidentialité.',
    h1: 'À propos de Budget Famille',
    sections: [
      { h2: 'Pourquoi Budget Famille', text: 'Gérer l’argent d’un foyer à plusieurs, c’est concilier un pot commun, l’argent de chacun et des projets d’épargne. Les tableurs le font mal et les applications bancaires ne connaissent pas le foyer : Budget Famille est né pour ça.' },
      { h2: 'Nos engagements', text: 'Une application simple, gratuite pour l’essentiel, sans publicité. Des données hébergées en Europe, chiffrées, jamais revendues, et la confidentialité au centre : les dépenses perso peuvent rester privées.' },
    ],
    priority: 0.4,
    changefreq: 'yearly',
  },
  { path: '/signup', title: 'Créer un compte gratuit – Budget Famille', description: 'Créez votre budget familial gratuit en 1 minute : sans carte bancaire, sans connexion à votre banque.', priority: 0.7, changefreq: 'yearly', h1: 'Créez votre budget gratuit' },
  { path: '/privacy', title: 'Politique de confidentialité – Budget Famille', description: 'Comment Budget Famille protège vos données : hébergement en Europe, chiffrement, aucune revente.', priority: 0.3, changefreq: 'yearly' },
  { path: '/terms', title: 'Conditions d’utilisation – Budget Famille', description: 'Les conditions générales d’utilisation de Budget Famille.', priority: 0.2, changefreq: 'yearly' },
  { path: '/login', title: 'Connexion – Budget Famille', description: 'Connectez-vous à votre budget familial.', noindex: true },
  { path: '/forgot-password', title: 'Mot de passe oublié – Budget Famille', description: 'Réinitialisez votre mot de passe Budget Famille.', noindex: true },
];

const BY_PATH = new Map(PAGES.map((p) => [p.path, p]));

export function pageSEO(pathname: string): PageSEO | undefined {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return BY_PATH.get(path);
}

export const absolute = (path: string) => (path.startsWith('http') ? path : `${SITE}${path === '/' ? '/' : path}`);

/** Organization + WebSite, published on every page. */
export const ORGANIZATION_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: `${SITE}/`,
  logo: `${SITE}/icon-512.png`,
};

export const SOFTWARE_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web, iOS, Android (navigateur)',
  url: `${SITE}/`,
  description: 'Application gratuite de budget familial et de couple : pot commun, argent de poche, charges, épargne et Budget IA.',
  inLanguage: 'fr',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};

export function faqLD(items: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

export function breadcrumbLD(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absolute(it.path) })),
  };
}
