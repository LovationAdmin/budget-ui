// src/seo/faq-mariage.ts
// FAQ of the wedding budget calculator (/budget-mariage) — shown on the page and
// published as FAQPage structured data, so both always say the same thing.
// No averages or market prices: there is no official source for them.

import type { FaqItem } from './faq';

export const MARIAGE_FAQ: FaqItem[] = [
  {
    q: 'Comment calculer le budget de son mariage ?',
    a: 'Listez les postes (lieu, traiteur, boissons, tenues, photo, musique, décoration, alliances, faire-part, voyage de noces), demandez des devis, puis séparez ce qui se paie par invité (repas et boissons) de ce qui est fixe. Budget = (prix du traiteur et des boissons par invité) × nombre d’invités + postes fixes + une ligne pour les imprévus. Le calculateur de cette page fait l’addition pour vous.',
  },
  {
    q: 'Quel budget pour un mariage de 100 personnes ?',
    a: 'Il n’existe pas de montant de référence : le total dépend surtout du nombre d’invités et du prix par invité du traiteur, puis du lieu, de la région et de la saison. Avec 100 invités, chaque euro de plus par invité sur le repas ou les boissons ajoute 100 € au total. Partez de vos propres devis : multipliez le prix par invité par 100, ajoutez les postes fixes et une marge pour les imprévus.',
  },
  {
    q: 'Combien épargner par mois pour son mariage ?',
    a: 'Montant mensuel = (budget total − ce qui est déjà mis de côté) ÷ nombre de mois d’ici le mariage, en comptant le mois en cours et en s’arrêtant au mois qui précède le mariage, pour que l’argent soit prêt avant le jour J. Arrondissez à l’euro supérieur. Par exemple, 18 000 € à réunir en 18 mois font 1 000 € par mois.',
  },
  {
    q: 'Comment financer son mariage ?',
    a: 'Le plus souvent en combinant une épargne mise de côté chaque mois, sur une cagnotte dédiée, et la participation éventuelle des familles. Repérez sur vos devis les dates des acomptes et des soldes pour savoir quand l’argent doit être disponible. Les cadeaux reçus le jour même arrivent après les factures : mieux vaut ne pas compter dessus pour payer les prestataires. Avant tout emprunt, vérifiez que les remboursements tiennent dans votre budget après le mariage.',
  },
  {
    q: 'Quels postes oublie-t-on souvent dans le budget d’un mariage ?',
    a: 'Les boissons et le vin d’honneur quand ils ne sont pas inclus chez le traiteur, la location de vaisselle ou de mobilier, les heures de service supplémentaires, la papeterie, les retouches des tenues, la coiffure et le maquillage d’essai, les transports et l’hébergement, et les petits achats de dernière minute. D’où l’intérêt d’une ligne « imprévus ».',
  },
  {
    q: 'Mes chiffres sont-ils enregistrés ?',
    a: 'Non. Le calcul se fait dans votre navigateur : rien n’est envoyé ni enregistré sur nos serveurs. Vos montants restent seulement sur cet appareil pour votre prochaine visite, et le bouton « Effacer » les supprime.',
  },
];
