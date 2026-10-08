// src/seo/faq.ts
// Home page FAQ — shown on the page and published as FAQPage structured data
// by the prerender (scripts/prerender.mjs), so both always say the same thing.

export interface FaqItem {
  q: string;
  a: string;
}

export const HOME_FAQ: FaqItem[] = [
  {
    q: 'Budget Famille est-il vraiment gratuit ?',
    a: 'Oui. Le budget, le foyer, les charges, l’épargne, le Budget IA et le partage avec votre famille sont gratuits, sans carte bancaire. Seule la synchronisation bancaire automatique est une option Premium à 2 € par mois.',
  },
  {
    q: 'Faut-il connecter son compte bancaire ?',
    a: 'Non. Budget Famille fonctionne sans connexion à votre banque : vous saisissez vos salaires et vos charges une fois, et chaque mois se remplit tout seul à partir de ces règles.',
  },
  {
    q: 'Comment gérer un budget de couple avec un compte commun ?',
    a: 'Chacun indique son salaire, l’assistant « Répartir le pot commun » calcule ce que chacun verse (50/50, au prorata des revenus ou même argent de poche), et l’application montre l’argent de poche qui reste à chacun.',
  },
  {
    q: 'Mes dépenses personnelles sont-elles visibles par mon conjoint ?',
    a: 'Vous choisissez. Une charge perso peut être publique ou privée : en privé, son nom est chiffré sur nos serveurs et visible par vous seul ; seul son montant compte dans le budget du foyer.',
  },
  {
    q: 'Existe-t-il un logiciel de budget familial gratuit ?',
    a: 'Oui. Budget Famille est un logiciel de budget familial gratuit qui fonctionne dans le navigateur, sur ordinateur comme sur téléphone, sans rien installer. Vous pouvez aussi l’installer comme une application sur l’écran d’accueil.',
  },
  {
    q: 'Est-ce mieux qu’un tableau Excel ?',
    a: 'Le tableau Excel demande de tout recopier chaque mois. Budget Famille part de règles (loyer chaque mois, taxe foncière une fois par an, cantine certains mois), se partage en temps réel à plusieurs et fonctionne sur téléphone.',
  },
  {
    q: 'Mes données sont-elles en sécurité ?',
    a: 'Vos données sont hébergées en Europe, chiffrées, et ne sont jamais revendues ni utilisées pour de la publicité. Vous pouvez les exporter ou supprimer votre compte à tout moment.',
  },
];

/** FAQ of the free spreadsheet page (/tableau-budget-familial-gratuit). */
export const TEMPLATE_FAQ: FaqItem[] = [
  { q: 'Le tableau est-il vraiment gratuit ?', a: 'Oui, sans inscription ni adresse e-mail. Téléchargez-le, modifiez-le, partagez-le.' },
  { q: 'Existe-t-il une version PDF à imprimer ?', a: 'Oui : le même tableau en PDF A4 de 3 pages (budget du mois prévu et réel, dépenses annuelles et pot commun, suivi de l’année), à remplir au stylo. Gratuit, sans inscription.' },
  { q: 'Fonctionne-t-il avec Google Sheets, LibreOffice ou Numbers ?', a: 'Oui. C’est un fichier .xlsx standard : il s’ouvre dans Excel, Google Sheets (Fichier › Importer), LibreOffice Calc et Numbers, formules comprises.' },
  { q: 'Comment répartir les dépenses dans un couple ?', a: 'L’onglet « Pot commun » compare les trois méthodes les plus utilisées et montre l’argent de poche qui reste à chacun. Le prorata des salaires est la plus courante quand les revenus sont différents.' },
  { q: 'Pourquoi passer du tableau à l’application ?', a: 'Le tableau demande de tout recopier chaque mois et de se l’envoyer à deux. Budget Famille part des mêmes règles, remplit chaque mois tout seul, se partage en temps réel et fonctionne sur téléphone, gratuitement.' },
];

/** FAQ of the reste à vivre calculator (/calcul-reste-a-vivre). Amounts sourced on the page. */
export const RAV_FAQ: FaqItem[] = [
  {
    q: 'Comment calculer son reste à vivre ?',
    a: 'Additionnez les revenus nets du mois (salaires après l’impôt prélevé à la source, allocations, autres revenus), puis retirez les charges fixes : loyer ou crédit immobilier, autres crédits, énergie, assurances, abonnements, transport, garde des enfants et impôts non prélevés à la source. Le résultat est votre reste à vivre : ce qui reste pour les courses, l’habillement, les loisirs et l’épargne.',
  },
  {
    q: 'Quel est le reste à vivre minimum en 2026 ?',
    a: 'Il n’existe pas de minimum unique. En cas de surendettement, la loi garantit au foyer de garder au moins le montant forfaitaire du RSA pour ses dépenses courantes, logement compris (article L731-2 du Code de la consommation) : 651,69 € pour une personne seule et 977,54 € pour deux personnes au 1er avril 2026. Pour accorder un crédit, chaque banque applique ses propres critères.',
  },
  {
    q: 'Quel reste à vivre par personne ?',
    a: 'Divisez le reste à vivre par le nombre de personnes du foyer. Pour comparer des foyers de tailles différentes, l’Insee divise plutôt par les unités de consommation : 1 pour le premier adulte, 0,5 pour chaque autre personne de 14 ans ou plus et 0,3 par enfant de moins de 14 ans.',
  },
  {
    q: 'Les courses font-elles partie des charges fixes ?',
    a: 'Non. Les courses, l’habillement et les loisirs sont justement ce que le reste à vivre doit financer. Comptez comme charges fixes les dépenses qui reviennent chaque mois et qu’on ne peut pas ajuster d’un mois à l’autre.',
  },
  {
    q: 'Quelle différence entre reste à vivre et taux d’endettement ?',
    a: 'Le taux d’endettement rapporte les mensualités de crédit aux revenus : pour un nouveau crédit immobilier, il ne doit en principe pas dépasser 35 %, assurance comprise (norme du Haut Conseil de stabilité financière). Le reste à vivre est un montant en euros : deux foyers au même taux d’endettement peuvent avoir des restes à vivre très différents.',
  },
  {
    q: 'Mes chiffres sont-ils enregistrés ?',
    a: 'Non. Le calcul se fait dans votre navigateur : rien n’est envoyé ni enregistré sur nos serveurs. Vos montants restent seulement sur cet appareil pour votre prochaine visite, et le bouton « Effacer » les supprime.',
  },
];
