// src/seo/faq-couple.ts
// FAQ of /budget-couple — shown on the page and published as FAQPage
// structured data by the prerender. Each question is one people type in a
// search engine, and each answer starts with the answer itself, in a couple
// of sentences: that is what « Autres questions posées » quotes. Amounts are
// the fictitious example of the page (src/lib/tools/couple.ts), legal points
// are sourced on the page.

import type { FaqItem } from './faq';

export const COUPLE_FAQ: FaqItem[] = [
  {
    q: 'Comment partager les dépenses quand on ne gagne pas pareil ?',
    a: 'Au prorata des revenus : chacun paie la même part de son salaire, donc celui qui gagne plus verse plus. Si l’un gagne 60 % des revenus du couple, il paie 60 % des charges communes. Le 50/50 pèse plus lourd sur celui qui gagne le moins ; pour aller plus loin, vous pouvez viser le même argent de poche pour chacun.',
  },
  {
    q: 'Comment calculer le prorata des salaires dans un couple ?',
    a: 'Part de chacun = charges communes × son salaire ÷ la somme des deux salaires. Avec 2 700 € et 1 800 € nets, le premier gagne 60 % des revenus du couple : sur 2 000 € de charges communes, il verse 1 200 € et l’autre 800 €. Chacun consacre ainsi 44 % de son revenu au foyer.',
  },
  {
    q: 'Que mettre dans les charges communes du couple ?',
    a: 'Tout ce qui sert au foyer : logement, énergie et eau, courses, assurances, internet, enfants, voiture commune, et l’épargne commune (vacances, apport). Ce que chacun dépense pour lui seul, comme son téléphone, ses sorties ou un crédit perso, reste en dehors et sort de son argent de poche.',
  },
  {
    q: 'Combien d’argent de poche garder chacun ?',
    a: 'Ce qui reste une fois sa part versée au compte commun. À 50/50, l’écart entre vous peut être grand ; au prorata, il suit vos salaires ; avec la méthode « même argent de poche », il est identique. Dans notre exemple fictif : 1 500 € et 1 000 € au prorata, 1 250 € chacun à argent de poche égal.',
  },
  {
    q: 'Quel budget prévoir pour un couple par mois ?',
    a: 'Il n’existe pas de montant type : tout dépend du logement et de la ville. Partez de vos charges réelles. Dans notre exemple fictif, un couple qui gagne 4 500 € nets consacre 2 000 € par mois aux charges communes, épargne commune comprise, et garde 2 500 € à eux deux.',
  },
  {
    q: 'Que dit la loi sur le partage des dépenses dans un couple ?',
    a: 'Les époux contribuent aux charges du mariage à proportion de leurs facultés respectives, sauf si leur contrat de mariage en dispose autrement (Code civil, article 214). Pour les partenaires de Pacs, l’aide matérielle est aussi proportionnelle à leurs facultés, sauf accord contraire (article 515-4). En concubinage, aucune règle : c’est à vous de vous mettre d’accord.',
  },
  {
    q: 'Faut-il un compte commun quand on n’est pas marié ?',
    a: 'Ce n’est pas obligatoire, mais c’est le plus simple pour payer le loyer, les courses et les factures. Beaucoup de couples gardent chacun leur compte et ouvrent un compte joint pour les seules dépenses communes, alimenté chaque mois par la part de chacun.',
  },
  {
    q: 'Quelle application pour gérer un budget de couple ?',
    a: 'Budget Famille est gratuit et fait pour le budget à deux : chacun indique son salaire, l’application calcule ce que chacun verse au compte commun (50/50, au prorata ou même argent de poche) et l’argent de poche qui reste. Les dépenses perso peuvent rester privées, sans connexion bancaire.',
  },
];
