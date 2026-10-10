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
    title: 'Application de budget gratuite : famille, couple, perso, projets',
    description: 'Application de budget gratuite pour la famille, le couple, la coloc ou vous seul : charges, pot commun, épargne et projets datés. Sans connexion bancaire obligatoire.',
    h1: 'L’application de budget gratuite pour la famille, le couple, la coloc et vos projets',
    intro: 'Seul ou à plusieurs, budgétez le mois et planifiez ce qui compte : charges, pot commun, épargne, voyage, mariage, travaux. Sans connexion bancaire obligatoire, sans publicité, en temps réel.',
    links: [CTA, { href: '/tableau-budget-familial-gratuit', label: 'Tableau de budget familial gratuit (Excel et PDF)' }, { href: '/calcul-reste-a-vivre', label: 'Calcul du reste à vivre' }, { href: '/blog/5-etapes-gerer-budget-familial-2025', label: 'Établir un budget familial' }, { href: '/blog/budget-famille-4-personnes-exemple', label: 'Exemple de budget pour une famille de 4' }, { href: '/budget-personnel', label: 'Calculer son budget perso' }, { href: '/budget-colocation', label: 'Budget colocation' }, { href: '/budget-mariage', label: 'Budget mariage' }, { href: '/blog/budget-etudiant-guide-complet-2025', label: 'Budget étudiant' }, { href: '/blog/combien-epargner-par-mois-objectif-date', label: 'Épargner pour un projet à une date' }, { href: '/features', label: 'Toutes les fonctionnalités' }, { href: '/blog', label: 'Conseils budget' }],
    sections: [
      { h2: 'Pas seulement pour les familles', text: '« Famille » au sens large : seul pour votre budget perso, en couple avec un pot commun, en famille, en colocation ou entre amis, et pour un projet (voyage, mariage, travaux, voiture, apport) avec un objectif et une date. Créez autant de budgets que nécessaire, chacun avec ses membres et sa devise.' },
    ],
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
    path: '/budget-personnel',
    title: 'Budget perso : calculateur gratuit de la règle 50/30/20',
    description: 'Faites votre budget personnel en 2 minutes avec la règle 50/30/20 : besoins, envies, combien épargner par mois. Gratuit, sans inscription.',
    h1: 'Votre budget perso en 2 minutes',
    intro: 'Votre salaire net et vos dépenses essentielles : voyez la règle 50/30/20 appliquée à vos revenus, ce qui reste après vos besoins et combien épargner chaque mois.',
    links: [CTA, { href: '/calcul-reste-a-vivre', label: 'Calcul du reste à vivre' }, { href: '/budget-colocation', label: 'Budget colocation' }, { href: '/blog/budget-etudiant-guide-complet-2025', label: 'Budget étudiant' }, { href: '/blog/combien-epargner-par-mois-objectif-date', label: 'Combien épargner par mois' }],
    sections: [
      { h2: 'Comment faire son budget personnel en 5 étapes', text: 'Revenus nets, charges fixes, dépenses annuelles ÷ 12, dépenses variables, puis épargner d’abord, juste après la paie.' },
      { h2: 'La règle 50/30/20 expliquée', text: '50 % pour les besoins, 30 % pour les envies, 20 % pour l’épargne : une règle popularisée par Elizabeth Warren et Amelia Warren Tyagi (All Your Worth, 2005). Un repère, pas une obligation, à adapter au coût du logement.' },
      { h2: 'Un exemple de budget perso', text: 'Dans notre exemple, 2 000 € nets et 1 120 € de besoins (56 %) : 480 € pour les envies et 400 € d’épargne par mois.' },
      { h2: 'Combien épargner chaque mois ?', text: '20 % des revenus comme repère ; commencez petit, d’abord une épargne de précaution de plusieurs mois de dépenses, puis vos projets.' },
    ],
    priority: 0.8,
    changefreq: 'monthly',
  },
  {
    path: '/budget-colocation',
    title: 'Budget colocation : calculer la part de loyer de chacun',
    description: 'Calculez gratuitement la part de loyer et de factures de chaque colocataire : parts égales, selon la chambre ou selon les revenus. Et les règles à connaître.',
    h1: 'Budget colocation : qui paie quoi ?',
    intro: 'Loyer, factures, courses communes : calculez la part de chaque colocataire, à parts égales, selon la chambre ou selon les revenus. Gratuit, sans inscription, rien n’est envoyé.',
    links: [CTA, { href: '/budget-personnel', label: 'Budget personnel' }, { href: '/calcul-reste-a-vivre', label: 'Calcul du reste à vivre' }, { href: '/blog/budget-etudiant-guide-complet-2025', label: 'Budget étudiant' }],
    sections: [
      { h2: 'Comment répartir le loyer en colocation ?', text: 'Trois méthodes courantes : à parts égales ; selon la chambre (la moitié du loyer partagée à parts égales pour les pièces communes, le reste selon la surface de chaque chambre) ; selon les revenus nets de chacun. Les factures communes se partagent à parts égales.' },
      { h2: 'Exemple : 3 colocataires', text: 'Dans notre exemple, un loyer de 1 350 € charges comprises, des chambres de 9, 12 et 15 m² et 198 € de factures communes : 516 € chacun à parts égales ; 459,75 €, 516 € et 572,25 € selon la chambre.' },
      { h2: 'Factures, courses et pot commun', text: 'Chacun verse sa part sur un pot commun au début du mois ; le loyer, les factures et les courses communes partent de là. Les factures irrégulières se ramènent au mois.' },
      { h2: 'Ce que dit la loi', text: 'Bail commun ou baux individuels. Avec une clause de solidarité, un colocataire qui part reste solidaire jusqu’à l’arrivée d’un remplaçant, au plus tard 6 mois après la fin de son préavis. Dépôt de garantie : 1 mois de loyer hors charges (vide), 2 mois (meublé). Chaque colocataire peut demander une aide au logement à la CAF.' },
    ],
    priority: 0.8,
    changefreq: 'monthly',
  },
  {
    path: '/features',
    title: 'Fonctionnalités : pot commun, projets, Budget IA – Budget Famille',
    description: 'Vue du mois, pot commun, argent de poche, charges perso privées, projets et épargne datés, plusieurs budgets, Budget IA : tout ce que fait Budget Famille, seul ou à plusieurs.',
    h1: 'Les fonctionnalités de Budget Famille',
    intro: 'Tout ce qu’il faut pour budgétiser et planifier, seul ou à plusieurs (couple, famille, coloc) : le mois en un coup d’œil, une répartition juste, des dépenses perso confidentielles et des projets qui avancent.',
    links: [CTA],
    sections: [
      { h2: 'Le mois en un coup d’œil', text: 'Chaque mois affiche ce qui entre dans le pot commun, les charges, l’épargne et le reste. Les charges se répètent toutes seules : chaque mois, certains mois (cantine), chaque année (taxe foncière) ou une seule fois. Un mois terminé est clôturé et figé : modifier un montant n’abîme jamais le passé.' },
      { h2: 'Pot commun et argent de poche', text: 'Pour chaque membre du foyer : son salaire, ce qu’il verse au pot commun et l’argent de poche qui lui reste. L’assistant « Répartir le pot commun » calcule une contribution juste à 50/50, au prorata des salaires ou pour garder le même argent de poche, sur le mois réel.' },
      { h2: 'Charges perso, publiques ou privées', text: 'Un impôt, un envoi d’argent à la famille, un crédit personnel se déduisent de l’argent de poche de son titulaire, jamais du pot commun. En privé, le nom de la charge est chiffré sur nos serveurs et visible par son seul créateur ; le montant reste juste pour le foyer.' },
      { h2: 'Projets et épargne par objectif', text: 'Voyage, mariage, travaux, voiture : créez une cagnotte avec un objectif et une date : le montant mensuel est calculé et l’application vérifie qu’il tient dans votre budget, en regardant le mois le plus serré. Les dépenses payées avec l’épargne sont suivies, et le bilan de l’année en tient compte.' },
      { h2: 'Plusieurs budgets', text: 'Un budget pour le foyer, un pour la coloc, un pour un projet : chacun a son nom, ses membres, son pays et sa devise (euro, franc suisse, livre, dollar, dollar canadien, franc CFA, dirham).' },
      { h2: 'Budget IA', text: 'Décrivez votre situation (couple, famille, amis, colocataires) et vos objectifs : l’IA propose une répartition, des pistes d’économies et un plan pour tenir vos objectifs dans les temps. Rien ne change tant que vous ne validez pas.' },
      { h2: 'À plusieurs, sur tous les écrans', text: 'Invitez qui vous voulez par e-mail (conjoint, famille, colocataires) : chacun voit les mêmes chiffres en temps réel. L’application fonctionne sur téléphone et ordinateur, en mode clair ou sombre, et chaque modification peut être annulée.' },
    ],
    priority: 0.8,
    changefreq: 'monthly',
  },
  {
    path: '/blog',
    title: 'Conseils budget : famille, couple, perso – Le blog Budget Famille',
    description: 'Guides pratiques pour gérer son budget, seul ou à plusieurs : budget familial, couple et compte commun, budget étudiant, épargne pour un projet, économies.',
    h1: 'Conseils budget : famille, couple, perso et projets',
    priority: 0.8,
    changefreq: 'weekly',
  },
  {
    path: '/help',
    title: 'Aide et questions fréquentes – Budget Famille',
    description: 'Comment créer votre budget, seul ou à plusieurs, inviter des membres, répartir le pot commun, gérer les charges perso, l’épargne et vos projets : toutes les réponses.',
    h1: 'Centre d’aide',
    links: [CTA],
    sections: [
      { h2: 'Créer son budget', text: 'Créez un compte gratuit, confirmez votre adresse e-mail puis créez votre budget : un nom (« Foyer », « Coloc », « Mariage 2027 »…) et votre pays suffisent. Ajoutez ensuite les membres avec leur salaire net (ou vous seul), puis vos charges. Vous pouvez créer plusieurs budgets.' },
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
    title: 'Premium (bientôt) : synchronisation bancaire – Budget Famille',
    description: 'Bientôt : vos comptes synchronisés pour comparer budget prévu et dépenses réelles. Essayez la démonstration avec des données fictives.',
    h1: 'Budget Famille Premium',
    intro: 'Bientôt disponible : vos comptes bancaires synchronisés pour comparer, chaque mois, ce que vous aviez prévu et ce que vous avez vraiment dépensé. Prix annoncé au lancement.',
    sections: [
      { h2: 'Comment ça marchera', text: 'Vous connectez votre banque via un prestataire agréé (DSP2), sans que Budget Famille voie vos identifiants. Chaque opération se rattache à une charge de votre budget, une seule fois, puis automatiquement. Le mois affiche le prévu et le réel, charge par charge.' },
      { h2: 'Ce qui est gratuit dès aujourd’hui', text: 'Les budgets, les membres, les charges, l’épargne et les projets, le Budget IA et le partage à plusieurs sont gratuits, sans connexion bancaire.' },
    ],
    priority: 0.5,
    changefreq: 'monthly',
  },
  {
    path: '/about',
    title: 'À propos – Budget Famille',
    description: 'Budget Famille est une application française indépendante pour budgétiser et planifier, seul ou à plusieurs : famille, couple, coloc et projets.',
    h1: 'À propos de Budget Famille',
    sections: [
      { h2: 'Pourquoi Budget Famille', text: 'Gérer son argent, seul ou à plusieurs, c’est concilier les charges, l’argent de chacun et des projets. Les tableurs le font mal et les applications bancaires ne connaissent ni le pot commun ni vos projets : Budget Famille est né pour ça. « Famille » au sens large : vous seul, votre couple, vos enfants, vos colocataires.' },
      { h2: 'Nos engagements', text: 'Une application simple, gratuite pour l’essentiel, sans publicité. Des données hébergées en Europe, chiffrées, jamais revendues, et la confidentialité au centre : les dépenses perso peuvent rester privées.' },
    ],
    priority: 0.4,
    changefreq: 'yearly',
  },
  { path: '/signup', title: 'Créer un compte gratuit – Budget Famille', description: 'Créez votre budget gratuit en 1 minute, seul ou à plusieurs : sans carte bancaire, sans connexion à votre banque.', priority: 0.7, changefreq: 'yearly', h1: 'Créez votre budget gratuit' },
  { path: '/privacy', title: 'Politique de confidentialité – Budget Famille', description: 'Comment Budget Famille protège vos données : hébergement en Europe, chiffrement, aucune revente.', priority: 0.3, changefreq: 'yearly' },
  { path: '/terms', title: 'Conditions d’utilisation – Budget Famille', description: 'Les conditions générales d’utilisation de Budget Famille.', priority: 0.2, changefreq: 'yearly' },
  { path: '/login', title: 'Connexion – Budget Famille', description: 'Connectez-vous à vos budgets.', noindex: true },
  { path: '/forgot-password', title: 'Mot de passe oublié – Budget Famille', description: 'Réinitialisez votre mot de passe Budget Famille.', noindex: true },
];

const BY_PATH = new Map(PAGES.map((p) => [p.path, p]));

export function pageSEO(pathname: string): PageSEO | undefined {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return BY_PATH.get(path);
}

export const absolute = (path: string) => (path.startsWith('http') ? path : `${SITE}${path === '/' ? '/' : path}`);

export type SocialNetwork = 'facebook' | 'instagram' | 'linkedin' | 'x';

/** Official Budget Famille accounts: footer links, Help page and Organization sameAs. */
export const SOCIAL_PROFILES: ReadonlyArray<{ network: SocialNetwork; label: string; url: string }> = [
  { network: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/1459022953950331' },
  { network: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/budgetfamille_lovation/' },
  { network: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/lovation-corp-238b99442/' },
  { network: 'x', label: 'X', url: 'https://x.com/LovationLibasse' },
];

/** Organization + WebSite, published on every page. */
export const ORGANIZATION_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: `${SITE}/`,
  logo: `${SITE}/icon-512.png`,
  sameAs: SOCIAL_PROFILES.map((p) => p.url),
};

export const SOFTWARE_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web, iOS, Android (navigateur)',
  url: `${SITE}/`,
  description: 'Application de budget gratuite, seul ou à plusieurs (famille, couple, colocation) : pot commun, argent de poche, charges, épargne, projets datés et Budget IA.',
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
