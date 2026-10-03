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
  { q: 'Fonctionne-t-il avec Google Sheets, LibreOffice ou Numbers ?', a: 'Oui. C’est un fichier .xlsx standard : il s’ouvre dans Excel, Google Sheets (Fichier › Importer), LibreOffice Calc et Numbers, formules comprises.' },
  { q: 'Comment répartir les dépenses dans un couple ?', a: 'L’onglet « Pot commun » compare les trois méthodes les plus utilisées et montre l’argent de poche qui reste à chacun. Le prorata des salaires est la plus courante quand les revenus sont différents.' },
  { q: 'Pourquoi passer du tableau à l’application ?', a: 'Le tableau demande de tout recopier chaque mois et de se l’envoyer à deux. Budget Famille part des mêmes règles, remplit chaque mois tout seul, se partage en temps réel et fonctionne sur téléphone, gratuitement.' },
];
