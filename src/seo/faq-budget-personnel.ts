// src/seo/faq-budget-personnel.ts
// FAQ of the budget perso / 50-30-20 calculator (/budget-personnel) — shown on
// the page and published as FAQPage structured data, so both always say the
// same thing. Plain text only; the figures match src/lib/tools/budgetPerso.ts.

import type { FaqItem } from './faq';

export const PERSO_FAQ: FaqItem[] = [
  {
    q: 'Comment faire son budget personnel ?',
    a: 'Notez vos revenus nets du mois (salaire après l’impôt prélevé à la source, aides, autres revenus), puis vos dépenses essentielles : logement, énergie, internet et mobile, transport, assurances, crédits et courses. Divisez les dépenses annuelles par 12 pour les compter chaque mois. Ce qui reste se partage entre vos envies et votre épargne, en commençant de préférence par l’épargne.',
  },
  {
    q: 'Qu’est-ce que la règle 50/30/20 ?',
    a: 'C’est un repère simple pour répartir ses revenus nets : 50 % pour les besoins (logement, factures, courses, crédits), 30 % pour les envies (sorties, loisirs, shopping, vacances) et 20 % pour l’épargne. Elle a été popularisée par la sénatrice américaine Elizabeth Warren et sa fille Amelia Warren Tyagi dans le livre « All Your Worth » (2005). C’est un point de départ, pas une obligation.',
  },
  {
    q: 'Comment calculer un budget 50/30/20 ?',
    a: 'Multipliez vos revenus nets du mois par 0,5 pour les besoins, par 0,3 pour les envies et par 0,2 pour l’épargne. Par exemple, pour 2 000 € nets : 1 000 € de besoins, 600 € d’envies et 400 € d’épargne. Comparez ensuite avec vos dépenses essentielles réelles : c’est là que le calcul devient utile.',
  },
  {
    q: 'Combien épargner par mois sur son salaire ?',
    a: 'La règle 50/30/20 propose 20 % des revenus nets, mais il n’y a pas de bon montant unique : cela dépend de vos charges et de vos projets. Si 20 % n’est pas possible aujourd’hui, commencez petit avec un virement automatique en début de mois, puis augmentez-le quand vos revenus progressent. Une première étape courante est une épargne de précaution de plusieurs mois de dépenses.',
  },
  {
    q: 'Que faire si mes dépenses essentielles dépassent 50 % de mes revenus ?',
    a: 'Ce n’est pas un échec : avec un loyer élevé, c’est vite le cas. Le calculateur réduit d’abord les envies et garde 20 % pour l’épargne tant que vos besoins ne dépassent pas 60 % de vos revenus ; au-delà, il partage ce qui reste en deux moitiés égales entre envies et épargne. Pour desserrer le budget, comparez vos factures, vérifiez vos droits aux aides et, si besoin, parlez-en à un Point conseil budget, gratuit et confidentiel.',
  },
  {
    q: 'Mes chiffres sont-ils enregistrés ?',
    a: 'Non. Le calcul se fait dans votre navigateur : rien n’est envoyé ni enregistré sur nos serveurs. Vos montants restent seulement sur cet appareil pour votre prochaine visite, et le bouton « Effacer » les supprime.',
  },
];
