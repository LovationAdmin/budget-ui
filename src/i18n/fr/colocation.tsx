// src/i18n/fr/colocation.tsx
// Words of the rent and bills split in French (/budget-colocation). Same keys
// as every other language (ColocCopy): a missing one fails the build.

import type { ColocCopy } from '@/components/tools/ColocationCalculator';

export const COLOCATION_FR: ColocCopy = {
  calculatorLabel: 'Calculateur',
  householdTitle: 'La colocation',
  seeExample: 'Voir l’exemple',
  roommates: 'Colocataires',
  roommatesLess: 'Retirer : Colocataires',
  roommatesMore: 'Ajouter : Colocataires',
  mateName: (i) => `Coloc ${i + 1}`,
  nameLabel: 'Prénom ou surnom',
  roomLabel: 'Chambre',
  incomeLabel: 'Revenu net',
  billsTitle: 'Loyer et factures du mois',
  rent: { label: 'Loyer, charges comprises', hint: 'Le loyer total de la coloc' },
  bills: {
    energie: { label: 'Énergie (électricité, gaz)', hint: 'Le total de la coloc, par mois' },
    internet: { label: 'Internet' },
    assurance: { label: 'Assurance habitation', hint: 'Si elle est commune à la coloc' },
    courses: { label: 'Courses et produits communs', hint: 'Ménage, papier, huile, sel…' },
    autres: { label: 'Autres dépenses communes', hint: 'Abonnement, eau si non comprise…' },
  },
  billsNote: 'Une facture payée tous les deux mois ou à l’année ? Ramenez-la au mois (÷ 2, ÷ 12). Les factures sont partagées à parts égales.',
  methodTitle: 'Répartition du loyer',
  methodLegend: 'Méthode',
  methods: {
    egal: { label: 'Parts égales', hint: 'Chambres proches' },
    chambre: { label: 'Selon la chambre', hint: 'Tailles différentes' },
    revenus: { label: 'Selon les revenus', hint: 'Écarts de revenus' },
  },
  methodHelp: (method, commonShare) => ({
    egal: 'Chacun paie la même part du loyer. Simple et juste quand les chambres se valent.',
    chambre: `${commonShare} du loyer couvre les pièces communes et se partage à parts égales ; le reste suit la surface de chaque chambre.`,
    revenus: 'Chacun paie le loyer en proportion de ses revenus nets. Utile quand les écarts de revenus sont importants.',
  })[method],
  perMonth: '/mois',
  resultTitle: 'Part de chacun, par mois',
  emptyResult: 'Indiquez le loyer et les factures : la part de chacun s’affiche ici au fil de la saisie.',
  shareDetail: (rent, bills, ratio) => `loyer ${rent} + factures ${bills} · ${ratio} du total`,
  fallback: {
    rooms: 'Indiquez la surface de chaque chambre : en attendant, le loyer est partagé à parts égales.',
    incomes: 'Indiquez le revenu de chaque colocataire : en attendant, le loyer est partagé à parts égales.',
  },
  tiles: { rent: 'Loyer', bills: 'Factures', total: 'Total coloc' },
  potTip: 'Le plus simple : chacun verse sa part sur un compte ou un pot commun au début du mois, et le loyer et les factures partent de là.',
  signup: {
    title: 'Gérez la coloc dans un budget partagé',
    text: 'Créez un budget « Coloc », invitez vos colocataires par e-mail : chacun voit en temps réel ce qu’il verse au pot commun. Reportez ces montants comme versement de chacun. Gratuit.',
  },
  reset: 'Effacer',
  share: {
    button: 'Partager avec la coloc',
    copied: 'Lien copié',
    url: 'https://www.budgetfamille.com/budget-colocation',
    title: 'Budget colocation',
    text: 'Un calculateur gratuit pour partager le loyer et les factures de la coloc.',
  },
  sticky: { total: (amount) => `Total de la coloc : ${amount}`, details: 'Détail' },
};
