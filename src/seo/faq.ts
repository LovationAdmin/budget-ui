// src/seo/faq.ts
// Home page FAQ — shown on the page and published as FAQPage structured data
// by the prerender (scripts/prerender.mjs), so both always say the same thing.
// The first questions are the ones people type about a family or couple
// budget, each answered in its first sentences (what « Autres questions
// posées » quotes); the questions about Budget Famille itself come after.

export interface FaqItem {
  q: string;
  a: string;
}

export const HOME_FAQ: FaqItem[] = [
  {
    q: 'Comment faire un budget familial ?',
    a: 'Notez les revenus nets du foyer, puis les charges fixes (logement, énergie, assurances, crédits), les dépenses annuelles divisées par 12 et les dépenses variables (courses, enfants, loisirs). Mettez l’épargne de côté en début de mois : ce qui reste est votre marge pour les imprévus. Budget Famille refait ce calcul tout seul chaque mois.',
  },
  {
    q: 'Quel budget pour une famille de 4 personnes ?',
    a: 'Il dépend surtout du logement et de la ville. Dans notre exemple chiffré, en ville moyenne, un couple avec deux enfants dépense 3 450 € par mois pour 4 350 € de revenus, dont 1 100 € de loyer, 800 € de courses et 280 € pour les enfants, et épargne 400 €.',
  },
  {
    q: 'Comment gérer un budget de couple ?',
    a: 'Additionnez les charges communes du mois et choisissez ensemble comment les partager : à 50/50, au prorata des revenus ou pour garder le même argent de poche. Chacun verse sa part sur le compte commun le jour de la paie et garde le reste. Notre calculateur de budget couple compare les trois méthodes ; dans l’application, la répartition se recalcule toute seule.',
  },
  {
    q: 'Comment répartir son budget avec la règle 50/30/20 ?',
    a: 'La règle 50/30/20 est un repère : 50 % des revenus nets pour les besoins (logement, courses, transport), 30 % pour les envies et 20 % pour l’épargne. À adapter : là où le logement coûte cher, les besoins dépassent souvent la moitié des revenus.',
  },
  {
    q: 'Existe-t-il une application de budget familial gratuite ?',
    a: 'Oui. Budget Famille est une application de budget gratuite, pour la famille comme pour un couple, un budget perso ou une coloc. Elle fonctionne dans le navigateur, sur ordinateur comme sur téléphone, sans rien installer, et peut s’ajouter à l’écran d’accueil comme une application.',
  },
  {
    q: 'Budget Famille est-il vraiment gratuit ?',
    a: 'Oui. Les budgets, les membres, les charges, l’épargne et les projets, le Budget IA et le partage à plusieurs sont gratuits, sans carte bancaire. La synchronisation bancaire automatique arrivera bientôt avec l’offre Premium : en attendant, tout fonctionne sans connexion bancaire.',
  },
  {
    q: 'Budget Famille est-il réservé aux familles ?',
    a: 'Non. « Famille » au sens large : vous pouvez l’utiliser seul pour votre budget perso, en couple avec un pot commun, en famille, en colocation ou entre amis, et pour planifier un projet (voyage, mariage, travaux, voiture, apport) avec un objectif et une date. Créez autant de budgets que nécessaire, chacun avec ses membres.',
  },
  {
    q: 'Faut-il connecter son compte bancaire ?',
    a: 'Non. Budget Famille fonctionne sans connexion à votre banque : vous saisissez vos salaires et vos charges une fois, et chaque mois se remplit tout seul à partir de ces règles.',
  },
  {
    q: 'Mes dépenses personnelles sont-elles visibles par mon conjoint ?',
    a: 'Vous choisissez. Une charge perso peut être publique ou privée : en privé, son nom est chiffré sur nos serveurs et visible par vous seul ; seul son montant compte dans le budget du foyer.',
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
  { q: 'Existe-t-il une grille de budget à imprimer ?', a: 'Oui : le même tableau en PDF A4 de 3 pages, une feuille de budget à remplir au stylo : budget du mois prévu et réel, dépenses annuelles et pot commun, suivi de l’année. Gratuit, sans inscription.' },
  { q: 'Peut-on s’en servir comme tableau de budget mensuel ?', a: 'Oui : l’onglet « Budget du mois » est un budget mensuel complet : revenus, 13 postes de charges (logement, énergie, courses, enfants…), épargne, et le reste du mois. L’onglet « Année » reprend ce budget sur les 12 mois et y ajoute ce qui ne tombe qu’une fois, comme la taxe foncière.' },
  { q: 'Peut-on l’utiliser comme tableau de dépenses mensuelles ?', a: 'Oui. Dans le PDF, chaque poste a une colonne « prévu », une colonne « réel » et l’écart : notez le prévu en début de mois, le réel à la fin, et vous voyez ce qui a dérapé. Dans Excel, dupliquez l’onglet « Budget du mois » pour garder le prévu et le réel côte à côte.' },
  { q: 'Le fichier Excel fait-il les calculs tout seul ?', a: 'Oui : remplissez les cases jaunes (salaires, charges, épargne) ; les totaux, le reste du mois, la part des revenus épargnée et ce que chacun verse au pot commun se calculent tout seuls.' },
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
