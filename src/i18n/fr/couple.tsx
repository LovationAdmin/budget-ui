// src/i18n/fr/couple.tsx
// Words of the couple budget split in French (/budget-couple). Same keys as
// every other language would have (CoupleCopy): a missing one fails the build.

import type { CoupleCopy } from '@/components/tools/CoupleCalculator';

export const COUPLE_FR: CoupleCopy = {
  calculatorLabel: 'Calculateur',
  incomesTitle: 'Vos revenus',
  seeExample: 'Voir l’exemple',
  partnerName: (i) => (i === 0 ? 'Moi' : 'Mon conjoint'),
  nameLabel: (i) => (i === 0 ? 'Votre prénom' : 'Prénom de votre conjoint'),
  incomeLabel: 'Revenu net',
  incomeHint: 'Le salaire net versé chaque mois, après l’impôt prélevé à la source, plus les autres revenus réguliers (allocations, pension…).',
  chargesTitle: 'Les charges communes du mois',
  charges: {
    logement: { label: 'Loyer ou crédit immobilier', hint: 'Charges locatives comprises' },
    energie: { label: 'Énergie et eau' },
    courses: { label: 'Courses', hint: 'Alimentation, hygiène, entretien' },
    assurances: { label: 'Assurances', hint: 'Habitation, auto, si elles sont communes' },
    abonnements: { label: 'Internet et abonnements communs', hint: 'Box, streaming, sport…' },
    enfants: { label: 'Enfants', hint: 'Garde, cantine, activités' },
    epargne: { label: 'Épargne commune', hint: 'Vacances, apport, épargne de précaution' },
    autres: { label: 'Autres dépenses communes', hint: 'Voiture du foyer, animaux, sorties à deux…' },
  },
  chargesNote: 'Une dépense qui tombe une fois par an (taxe foncière, assurance) ? Divisez-la par 12. Ce que chacun paie pour lui seul (son téléphone, ses sorties, un crédit perso) reste en dehors : il sort de son argent de poche.',
  methodTitle: 'La répartition',
  methodLegend: 'Méthode',
  methods: {
    egal: { label: '50/50', hint: 'Revenus proches', short: '50/50' },
    prorata: { label: 'Au prorata', hint: 'Le même effort', short: 'Au prorata' },
    reste: { label: 'Même argent de poche', hint: 'Le même reste', short: 'Même argent de poche' },
  },
  methodHelp: {
    egal: 'Chacun verse la moitié des charges communes. Simple et juste quand vos revenus sont proches ; quand ils sont éloignés, celui qui gagne le moins garde beaucoup moins.',
    prorata: 'Chacun verse la même part de son revenu : celui qui gagne 60 % des revenus du couple paie 60 % des charges. C’est la méthode la plus utilisée quand les revenus sont différents.',
    reste: 'Vous gardez tous les deux le même argent de poche : celui qui gagne plus verse plus, jusqu’à égaliser ce qui reste. C’est la mise en commun la plus complète.',
  },
  perMonth: '/mois',
  resultTitle: 'Versement de chacun au compte commun, par mois',
  emptyResult: 'Indiquez vos revenus et vos charges communes : ce que chacun verse et garde s’affiche ici au fil de la saisie.',
  shareDetail: (ratio, effort) => (effort ? `${ratio} des charges communes · ${effort} de son revenu` : `${ratio} des charges communes`),
  keeps: (amount) => `Garde ${amount} d’argent de poche`,
  fallback: 'Indiquez le revenu de chacun : en attendant, les charges sont partagées à 50/50.',
  shortfall: (amount) => `Vos charges communes dépassent vos deux revenus de ${amount} par mois : commencez par les postes les plus lourds (logement, courses, abonnements).`,
  compareTitle: 'Les 3 méthodes pour vous deux',
  compareCaption: 'Ce que chacun verse et garde chaque mois selon la méthode',
  comparePays: 'verse',
  compareKeeps: 'garde',
  compareChoose: (method) => `Choisir la méthode : ${method}`,
  tiles: { incomes: 'Revenus du couple', shared: 'Charges communes', left: 'Reste à vous deux' },
  potTip: 'Le plus simple : chacun programme un virement automatique de sa part vers le compte commun le jour de la paie, et les charges communes partent de là.',
  signup: {
    title: 'Chaque mois, sans tout recalculer',
    text: 'Dans Budget Famille, la répartition se recalcule toute seule quand un salaire ou une charge change. Vos dépenses perso peuvent rester privées. Gratuit, sans connexion bancaire.',
    cta: 'Créer notre budget de couple',
  },
  reset: 'Effacer',
  share: {
    button: 'Envoyer à mon conjoint',
    copied: 'Lien copié',
    url: 'https://www.budgetfamille.com/budget-couple',
    title: 'Budget couple',
    text: 'Un calculateur gratuit pour savoir combien chacun verse sur le compte commun.',
  },
  sticky: { title: 'Versement au compte commun', details: 'Détail' },
};
