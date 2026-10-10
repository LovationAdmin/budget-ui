// src/seo/faq-colocation.ts
// FAQ of /budget-colocation — shown on the page and published as FAQPage
// structured data by the prerender. Legal points sourced on the page.

import type { FaqItem } from './faq';

export const COLOC_FAQ: FaqItem[] = [
  {
    q: 'Comment répartir le loyer en colocation ?',
    a: 'Trois méthodes sont courantes : à parts égales, selon la taille des chambres (une partie du loyer partagée à parts égales pour les pièces communes, le reste selon la surface de chaque chambre) ou selon les revenus de chacun. L’important est de choisir ensemble, avant d’emménager, et de l’écrire.',
  },
  {
    q: 'Comment partager les factures et les courses en colocation ?',
    a: 'Énergie, internet, assurance habitation et produits du quotidien se partagent le plus souvent à parts égales. Le plus simple est un pot commun : chacun y verse sa part chaque mois, et les factures communes sont payées depuis ce pot.',
  },
  {
    q: 'Que se passe-t-il si un colocataire ne paie pas sa part ?',
    a: 'Avec un bail commun comportant une clause de solidarité, le propriétaire peut réclamer la totalité du loyer à n’importe quel colocataire. Un colocataire qui part reste solidaire jusqu’à l’arrivée d’un remplaçant, et au plus tard 6 mois après la fin de son préavis. Avec des baux individuels, chacun ne doit que son propre loyer.',
  },
  {
    q: 'Peut-on toucher l’APL en colocation ?',
    a: 'Oui. Chaque colocataire peut faire sa propre demande d’aide au logement à la CAF ; le montant dépend de sa situation, de ses ressources et de sa part de loyer.',
  },
  {
    q: 'Quel dépôt de garantie en colocation ?',
    a: 'Les mêmes règles que pour toute location : au plus 1 mois de loyer hors charges pour un logement vide, 2 mois pour un logement meublé. Avec un bail commun, il est souvent réparti entre les colocataires.',
  },
  {
    q: 'Quelle application pour gérer les dépenses d’une colocation ?',
    a: 'Budget Famille est gratuit : créez un budget « Coloc », invitez vos colocataires par e-mail et notez le loyer et les factures. Chacun voit en temps réel ce qu’il doit verser au pot commun, et ses dépenses perso restent à part.',
  },
];
