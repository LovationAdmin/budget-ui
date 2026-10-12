// src/i18n/fr/budgetPerso.tsx
// Words of the 50/30/20 calculator in French (/budget-personnel). Same keys
// as every other language (BudgetPersoCopy): a missing one fails the build.

import { Link } from 'react-router-dom';
import type { BudgetPersoCopy } from '@/components/tools/BudgetPersoCalculator';
import { EXAMPLE, INCOME_FIELDS, NEED_FIELDS } from '@/lib/tools/budgetPerso';

const fields = <K extends string>(list: Array<{ key: K; label: string; hint?: string }>) =>
  Object.fromEntries(list.map((f) => [f.key, { label: f.label, hint: f.hint }])) as Record<K, { label: string; hint?: string }>;

export const BUDGET_PERSO_FR: BudgetPersoCopy = {
  incomes: fields(INCOME_FIELDS),
  needs: fields(NEED_FIELDS),
  example: EXAMPLE,
  calculatorLabel: 'Calculateur',
  incomeTitle: 'Revenus nets du mois',
  seeExample: 'Voir l’exemple',
  needsTitle: 'Dépenses essentielles du mois',
  needsIntro: 'Les « besoins » : ce que vous devez payer quoi qu’il arrive pour vous loger, vous nourrir, travailler et rester assuré.',
  moreNeeds: 'Autres : santé, garde et enfants, impôts…',
  annualNote: 'Une dépense annuelle (taxe foncière, assurance payée en une fois, abonnement à l’année) ? Divisez-la par 12. Les sorties, les loisirs et le shopping ne sont pas des besoins : ce sont les envies, la règle leur garde une part.',
  savingsTitle: 'Votre épargne actuelle',
  optional: 'Facultatif',
  savingsLabel: 'Épargne déjà mise de côté chaque mois',
  savingsHint: 'Virements vers votre épargne, cagnottes… Laissez vide si vous débutez : c’est très bien aussi.',
  resultTitle: 'Après vos dépenses essentielles',
  perMonth: '/mois',
  emptyResult: 'Indiquez votre salaire net et vos dépenses essentielles : votre budget 50/30/20 s’affiche ici au fil de la saisie.',
  deficit: (gap) => `Vos dépenses essentielles dépassent vos revenus de ${gap} par mois.`,
  summary: (income, needs) => `sur ${income} de revenus, après ${needs} de besoins`,
  needsShare: (share, within) => (
    <>Vos besoins : <strong>{share}</strong> de vos revenus, {within ? 'dans le repère des 50 %' : 'au-dessus du repère des 50 %'}.</>
  ),
  labels: { needs: 'Besoins', wants: 'Envies', savings: 'Épargne', margin: 'Marge libre' },
  comparison: {
    rule: 'Repère 50/30/20',
    yours: 'Votre budget',
    caption: 'Votre budget du mois comparé à la règle 50/30/20',
    item: 'Poste',
    benchmark: 'Repère',
  },
  deficitHelp: {
    title: 'Ce n’est pas une fatalité : des pistes pour rééquilibrer',
    intro: 'Vérifiez d’abord vos montants (une dépense annuelle comptée sans la diviser par 12 ?), puis :',
    items: [
      <Link to="/outils-ia" className="font-medium text-primary hover:underline">Estimer ce que vos factures peuvent baisser</Link>,
      <><a href="https://www.mesdroitssociaux.gouv.fr/" target="_blank" rel="noopener" className="font-medium text-primary hover:underline">Vérifier vos droits aux aides</a> (simulateur officiel)</>,
      <><a href="https://solidarites.gouv.fr/point-conseil-budget-pcb" target="_blank" rel="noopener" className="font-medium text-primary hover:underline">Parler à un Point conseil budget</a> : gratuit et confidentiel</>,
    ],
  },
  tiles: { wantsPerDay: 'Envies par jour', ofIncome: (share) => `${share} des revenus`, perDayNote: 'sur 30 jours' },
  within: (margin) => (
    <>
      Vos besoins restent sous 50 % : la règle s’applique telle quelle, 30 % pour les envies et 20 % pour
      l’épargne.{margin && <> Les {margin} qui restent en plus sont une <strong>marge libre</strong> : plus d’épargne, un projet ou un peu plus d’envies, c’est vous qui choisissez.</>}
    </>
  ),
  trimmed: (maxNeedsShare) => (
    <>
      Vos besoins dépassent 50 % : cela arrive vite quand le loyer est élevé, ce n’est pas une faute. On réduit
      d’abord les envies et on garde 20 % pour l’épargne, tant que les envies gardent au moins autant que
      l’épargne (jusqu’à {maxNeedsShare} de besoins).
    </>
  ),
  shared: (needsShare, savings) => (
    <>
      Avec {needsShare} de besoins, garder 20 % d’épargne laisserait moins aux envies qu’à l’épargne. On partage
      donc ce qui reste en deux moitiés égales : votre <strong>épargne possible</strong> est de {savings} par
      mois. Si c’est encore trop, un plus petit montant régulier compte déjà.
    </>
  ),
  howSplit: 'Comment ce partage est calculé',
  ruleAnchor: 'regle',
  current: (saved, share) => <>Vous mettez déjà <strong>{saved}</strong> de côté par mois ({share} de vos revenus).</>,
  currentOver: 'C’est plus que ce qui reste après vos besoins : vérifiez vos montants.',
  currentGap: (gap) => `Pour atteindre la proposition : ${gap} de plus par mois, à votre rythme.`,
  currentReached: 'C’est au moins la proposition : bien joué.',
  signup: {
    title: 'Suivez ce budget chaque mois, seul ou à plusieurs',
    text: 'Budget Famille remplit chaque mois à partir de vos charges (tous les mois, certains mois ou une fois par an), avec des cagnottes d’épargne qui ont un objectif et une date. Vous pourrez inviter plus tard votre conjoint ou vos colocataires. Gratuit, sans connexion bancaire.',
  },
  reset: 'Effacer',
  share: {
    button: 'Partager le calculateur',
    copied: 'Lien copié',
    url: 'https://www.budgetfamille.com/budget-personnel',
    title: 'Budget perso : la règle 50/30/20',
    text: 'Un calculateur gratuit pour faire son budget perso avec la règle 50/30/20.',
  },
  sticky: { label: 'Après vos besoins', details: 'Voir le détail' },
};
