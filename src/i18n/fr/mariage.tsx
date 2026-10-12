// src/i18n/fr/mariage.tsx
// Words of the wedding budget calculator in French (/budget-mariage). Same
// keys as every other language (MariageCopy): a missing one fails the build.

import type { MariageCopy } from '@/components/tools/MariageCalculator';
import { POSTE_FIELDS, monthLabel } from '@/lib/tools/mariage';

/** « De mars 2027 », « D’octobre 2026 ». */
const fromMonth = (label: string) => (/^[aeiouyàâéèêh]/i.test(label) ? `D’${label}` : `De ${label}`);

export const MARIAGE_FR: MariageCopy = {
  posts: Object.fromEntries(POSTE_FIELDS.map((p) => [p.key, { label: p.label, hint: p.hint }])) as MariageCopy['posts'],
  guests: (n) => `${n} invité${n > 1 ? 's' : ''}`,
  monthLabel,
  calculatorLabel: 'Calculateur',
  weddingTitle: 'Votre mariage',
  guestsLabel: 'Nombre d’invités',
  guestsHint: 'Adultes et enfants présents au repas',
  guestsLess: 'Retirer : Nombre d’invités',
  guestsMore: 'Ajouter : Nombre d’invités',
  minus10: 'Retirer 10 invités',
  plus10: 'Ajouter 10 invités',
  dateLabel: 'Date du mariage',
  dateHint: 'Mois et année, pour calculer l’épargne de chaque mois',
  datePlaceholder: 'aaaa-mm',
  savedLabel: 'Déjà mis de côté',
  savedHint: 'Ce que vous avez déjà réuni pour le mariage, y compris les acomptes déjà versés',
  postsTitle: 'Postes de dépenses',
  postsIntro: 'Saisissez vos devis : le montant total de chaque poste, sauf le traiteur et les boissons, en prix par invité. Il n’existe pas de prix moyen officiel : le total dépend surtout du nombre d’invités et du traiteur.',
  exampleNote: 'Exemple fictif, à remplacer par vos devis',
  exampleExplain: 'Ces montants ronds servent à montrer le calcul : ce ne sont ni des moyennes ni des prix du marché.',
  exampleBadge: 'exemple fictif',
  confirmReplace: 'Remplacer vos montants par l’exemple fictif ?',
  morePosts: 'Autres postes : alliances, faire-part, voyage de noces',
  perGuestUnit: '/invité',
  perGuestHint: (rate, guests, total) => `${rate} × ${guests} = ${total}`,
  resultTitle: 'Budget total du mariage',
  emptyResult: 'Indiquez le nombre d’invités et vos devis : le total s’affiche ici au fil de la saisie.',
  forGuests: (guests, honeymoon) => `pour ${guests}${honeymoon ? ', voyage de noces compris' : ''}`,
  tiles: {
    perGuest: 'Par invité',
    perGuestNote: (honeymoon) => (honeymoon ? 'hors voyage de noces' : 'tout compris'),
    guestLinked: 'Lié aux invités',
    guestLinkedNote: (share) => `traiteur + boissons${share !== null ? ` · ${share}` : ''}`,
  },
  fixedPart: (amount, share) => (
    <>Part fixe : <strong className="text-foreground">{amount}</strong>{share !== null ? ` (${share})` : ''}, qui ne bouge pas avec le nombre d’invités.</>
  ),
  savingTitle: 'À mettre de côté chaque mois',
  perMonth: '/mois',
  plan: ({ months, from, to, remaining, total, saved }) => `${months === 1
    ? `Un seul versement, en ${from}`
    : `${fromMonth(from)} à ${to}, soit ${months} versements`}, pour réunir ${remaining}${saved ? ` (${total} − ${saved} déjà de côté)` : ''}.`,
  covered: 'Ce que vous avez déjà mis de côté couvre ce budget : rien à ajouter chaque mois.',
  thisMonth: (remaining) => (remaining
    ? `Le mariage a lieu ce mois-ci : il ne reste plus de mois pour épargner, et ${remaining} à réunir.`
    : 'Le mariage a lieu ce mois-ci, et ce que vous avez mis de côté couvre ce budget.'),
  past: 'Cette date est passée : indiquez le mois du mariage à venir.',
  noDateAction: 'Indiquez la date du mariage',
  noDateRest: 'pour savoir combien mettre de côté chaque mois.',
  fillExampleShort: 'Remplir avec un exemple fictif',
  breakdownTitle: 'Répartition par poste',
  perGuestRate: (rate) => ` · ${rate} par invité`,
  fewerTitle: (n) => `Et avec ${n} invité${n > 1 ? 's' : ''} de moins ?`,
  fewerText: ({ saving, total, before, guests }) => (
    <>
      Le traiteur et les boissons baissent de <strong>{saving}</strong> : {total} au lieu
      de {before} pour {guests}. C’est un minimum : une salle plus petite, moins de tables et
      de faire-part peuvent faire baisser d’autres postes.
    </>
  ),
  fewerNoRate: 'Indiquez le prix par invité du traiteur et des boissons pour voir ce que change une liste d’invités plus courte.',
  signup: {
    title: 'Préparez votre mariage dans une cagnotte',
    text: (year) => `Dans Budget Famille, créez un budget à part « Mariage ${year} » ou une cagnotte avec un objectif et une date : le montant à mettre de côté chaque mois est calculé, et vous pouvez inviter votre conjoint. Gratuit, sans avoir à connecter votre banque.`,
  },
  reset: 'Effacer',
  share: {
    button: 'Partager le calculateur',
    copied: 'Lien copié',
    url: 'https://www.budgetfamille.com/budget-mariage',
    title: 'Calcul du budget de mariage',
    text: 'Un calculateur gratuit pour estimer le budget de son mariage et ce qu’il faut mettre de côté chaque mois.',
  },
  sticky: { label: (example) => `Budget total${example ? ' (exemple fictif)' : ''}`, details: 'Voir le détail' },
};
