// src/i18n/fr/resteAVivre.tsx
// Les mots du simulateur de reste à vivre en français (/calcul-reste-a-vivre),
// avec les repères officiels français : norme HCSF et plancher du surendettement.

import { Link } from 'react-router-dom';
import type { RavCopy, RavExample } from '@/components/tools/ResteAVivreCalculator';
import { CHARGE_FIELDS, HCSF_MAX_RATIO, INCOME_FIELDS } from '@/lib/tools/resteAVivre';

const fields = <K extends string>(list: Array<{ key: K; label: string; hint?: string }>) =>
  Object.fromEntries(list.map((c) => [c.key, { label: c.label, hint: c.hint }])) as Record<K, { label: string; hint?: string }>;

/** Exemple fictif : un couple avec deux enfants de 6 et 10 ans. */
export const RAV_EXAMPLE_FR: RavExample = {
  household: { adults: 2, kidsUnder14: 2, teens14plus: 0 },
  incomes: { salaires: 3800 },
  charges: { loyer: 1100, credits: 230, energie: 160, assurances: 150, telecom: 70, transport: 120, enfants: 180 },
};

export const RESTE_A_VIVRE_FR: RavCopy = {
  calculatorLabel: 'Simulateur',
  seeExample: 'Voir l’exemple',
  householdTitle: 'Votre foyer',
  adults: 'Adultes',
  kidsUnder14: 'Enfants de moins de 14 ans',
  teens: { label: 'Enfants de 14 ans et plus', hint: 'Ou autre personne à charge' },
  stepper: { remove: (label) => `Retirer : ${label}`, add: (label) => `Ajouter : ${label}` },
  incomesTitle: 'Revenus nets du mois',
  incomes: fields(INCOME_FIELDS),
  chargesTitle: 'Charges fixes du mois',
  charges: fields(CHARGE_FIELDS),
  moreCharges: 'Autres charges : transport, garde, impôts, pension…',
  chargesNote: 'Une dépense annuelle (taxe foncière, assurance payée en une fois) ? Divisez-la par 12. Les courses, l’habillement et les loisirs ne sont pas des charges fixes : c’est ce que le reste à vivre finance.',
  perMonth: '/mois',
  resultTitle: 'Votre reste à vivre',
  emptyResult: 'Indiquez vos revenus et vos charges : le résultat s’affiche ici au fil de la saisie.',
  deficit: (amount) => `Vos charges fixes dépassent vos revenus de ${amount} par mois.`,
  after: (charges, income) => `après ${charges} de charges fixes, sur ${income} de revenus`,
  deficitHelp: (
    <>
      <p className="font-semibold text-foreground">Des pistes pour rééquilibrer</p>
      <ul className="mt-2 space-y-1.5">
        <li><Link to="/outils-ia" className="font-medium text-primary hover:underline">Estimer ce que vos factures peuvent baisser</Link></li>
        <li><a href="https://www.mesdroitssociaux.gouv.fr/" target="_blank" rel="noopener" className="font-medium text-primary hover:underline">Vérifier vos droits aux aides</a> (simulateur officiel)</li>
        <li><a href="https://solidarites.gouv.fr/point-conseil-budget-pcb" target="_blank" rel="noopener" className="font-medium text-primary hover:underline">Parler à un Point conseil budget</a> : gratuit et confidentiel</li>
      </ul>
    </>
  ),
  tiles: {
    perPerson: 'Par personne',
    persons: (n) => `${n} pers.`,
    perDay: 'Par jour',
    perDayNote: 'sur 30 jours',
    perUnit: 'Par UC Insee',
    units: (n) => `${String(n).replace('.', ',')} unités`,
  },
  chargesShare: {
    label: 'Charges fixes',
    ofIncome: (pct) => `${pct} des revenus`,
    aria: (pct) => `Charges fixes : ${pct} des revenus`,
  },
  debt: {
    title: (pct) => `Taux d’endettement estimé : ${pct}`,
    note: (ratio) => (ratio > HCSF_MAX_RATIO
      ? { tone: 'warn', text: 'Au-dessus du repère de 35 % retenu pour un nouveau crédit immobilier (norme HCSF).' }
      : { tone: 'ok', text: 'En dessous du repère de 35 % retenu pour un nouveau crédit immobilier (norme HCSF).' }),
  },
  floor: (persons, amount) => (
    <>
      Repère légal : en cas de surendettement, un foyer de {persons} personne{persons > 1 ? 's' : ''} garde au moins{' '}
      <strong className="text-foreground">{amount}</strong> par mois pour ses dépenses courantes, logement compris.{' '}
      <a href="#minimum" className="font-medium text-primary hover:underline">Détails</a>
    </>
  ),
  signup: {
    title: 'Suivez ce reste à vivre chaque mois, à deux',
    text: 'Budget Famille remplit chaque mois à partir de vos charges, en temps réel avec votre conjoint. Gratuit.',
  },
  reset: 'Effacer',
  share: {
    button: 'Partager le simulateur',
    copied: 'Lien copié',
    url: 'https://www.budgetfamille.com/calcul-reste-a-vivre',
    title: 'Calcul du reste à vivre',
    text: 'Un simulateur gratuit pour calculer son reste à vivre, par personne et par jour.',
  },
  sticky: { label: 'Reste à vivre', details: 'Voir le détail' },
};

/**
 * Hors de la zone euro : pas de repère légal français (plancher du
 * surendettement, norme HCSF, aides françaises), des pistes valables partout.
 */
export const RESTE_A_VIVRE_FR_INTL: RavCopy = {
  ...RESTE_A_VIVRE_FR,
  deficitHelp: (
    <>
      <p className="font-semibold text-foreground">Des pistes pour rééquilibrer</p>
      <ul className="mt-2 space-y-1.5">
        <li><Link to="/outils-ia" className="font-medium text-primary hover:underline">Estimer ce que vos factures peuvent baisser</Link></li>
        <li>Vérifier les aides auxquelles vous avez droit, sur le site officiel de votre pays</li>
        <li>Demander conseil à un service gratuit d’accompagnement budgétaire près de chez vous</li>
      </ul>
    </>
  ),
  debt: {
    title: RESTE_A_VIVRE_FR.debt.title,
    note: () => ({ tone: 'info', text: 'Chaque banque applique ses propres règles : prenez ce taux comme un repère. Plus il est bas, plus vous avez de marge.' }),
  },
  floor: undefined,
};
