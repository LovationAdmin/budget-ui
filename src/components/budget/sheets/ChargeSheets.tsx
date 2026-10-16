// src/components/budget/sheets/ChargeSheets.tsx
// Everything about one charge: month actions, amount changes with an explicit
// scope (« ce mois-ci seulement » / « à partir de ce mois »), stopping it, its
// detail sheet (amount history, exceptions, history kept in closed months),
// deletion, and the create / edit form with frequencies.

import { useEffect, useMemo, useState } from 'react';
import {
  Info,
  Lightbulb,
  LightbulbOff,
  Link as LinkIcon,
  Lock,
  PauseCircle,
  Pencil,
  RotateCcw,
  Settings2,
  StopCircle,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { budgetAPI } from '@/services/api';
import { useBudget } from '@/contexts/BudgetContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Charge, Frequency, YM } from '@/lib/budget/types';
import { PRIVATE_CHARGE_LABEL } from '@/lib/budget/types';
import {
  chargeBaseAmount,
  chargeFrequency,
  chargeStatus,
  customMonthsText,
  describeChargeSchedule,
  personStatus,
  resolveCharge,
  sortSteps,
  windowOf,
} from '@/lib/budget/engine';
import {
  deleteCharge,
  newId,
  restartCharge,
  setChargeAmountEverywhere,
  setChargeAmountFrom,
  setChargeMonthAmount,
  stopCharge,
  updateCharge,
  upsertCharge,
} from '@/lib/budget/mutations';
import {
  addMonths,
  compareYM,
  endDateOf,
  formatMonthLong,
  formatMonthShort,
  formatMonthTitle,
  maxYM,
  monthIndex0,
  monthNameLower,
  monthsBetween,
  monthNamesLower,
  monthNamesShort,
  monthNames,
  startDateOf,
  yearOf,
  deMonth,
} from '@/lib/budget/months';
import { moneySigned, parseAmount } from '@/lib/budget/format';
import { categoryMeta, PICKER_CATEGORIES } from '@/lib/budget/categories';
import { ResponsiveSheet } from '../shared/ResponsiveSheet';
import { MonthPicker } from '../shared/MonthPicker';
import {
  CategoryIcon,
  ChipToggle,
  ChoiceCard,
  ErrorText, failOn,
  FieldLabel,
  MoneyInput,
  Pill,
  Segmented,
} from '../shared/primitives';
import type { SheetProps } from './BudgetSheets';
import { PREMIUM_ENABLED } from '@/lib/premium';
import { defineMessages, useT } from '@/i18n/runtime';

const monthsEn = (n: number) => (n === 1 ? '1 month' : `${n} months`);

const M = defineMessages({
  fr: {
    actions: {
      inMonth: (month: string) => `En ${month}`,
      adjusted: (planned: string) => `Prévu : ${planned} · ajustée ce mois-ci`,
      skipped: 'Retirée de ce mois (exception).',
      editAmount: 'Modifier le montant',
      editAmountSub: 'Pour ce mois seulement, ou à partir de ce mois',
      skip: (month: string) => `Retirer ${deMonth(month)}`,
      skipSub: 'Une exception : les autres mois ne changent pas',
      skippedDone: (label: string, month: string) => `« ${label} » retirée ${deMonth(month)} seulement.`,
      restore: (month: string) => `Rétablir en ${month}`,
      restoreSub: 'Annule l’exception de ce mois',
      back: (label: string, month: string) => `« ${label} » est de retour en ${month}.`,
      stop: 'Arrêter cette charge',
      stopSub: 'Elle passe dans « Terminées » et reste dans l’historique',
      detail: 'Voir la fiche',
      detailSub: 'Montants successifs, exceptions, réglages',
    },
    amount: {
      invalid: 'Indiquez un montant valide (0 ou plus).',
      monthOnlyDone: (label: string, amount: string, month: string) => `« ${label} » : ${amount} en ${month} seulement.`,
      forwardDone: (label: string, amount: string, yearly: boolean, month: string) =>
        `« ${label} » : ${amount}${yearly ? ' par an' : ''} à partir ${deMonth(month)}. Les mois d’avant gardent leur montant.`,
      allDone: (label: string) => `« ${label} » corrigé sur tous les mois ouverts. Les mois clôturés ne bougent pas.`,
      title: (label: string) => `Modifier « ${label} »`,
      from: 'À partir de',
      yearlyAmount: 'Montant annuel',
      newAmount: 'Nouveau montant',
      currently: (amount: string, yearly: boolean, monthly: string | null) =>
        `Actuellement : ${amount}${yearly ? ' par an' : ''}${monthly ? ` (${monthly} mis de côté chaque mois)` : ''}`,
      applyTo: 'Appliquer ce montant à…',
      only: (month: string) => `${month} seulement`,
      onlyHelp: (planned: string) => `Une exception : les autres mois restent à ${planned}.`,
      fromOn: (month: string) => `À partir ${deMonth(month)}`,
      earlierKeep: (amount: string, yearly: boolean) => `Les mois d’avant gardent ${amount}${yearly ? ' par an' : ''}.`,
      fromFirst: 'S’applique dès le premier mois.',
      fixAll: 'Corriger une erreur de saisie sur tous les mois ouverts',
    },
    stop: {
      removed: (label: string) => `« ${label} » n’avait pas encore commencé : elle est retirée.`,
      stopped: (label: string, month: string) => `« ${label} » s’arrête après ${month}. Elle reste dans l’historique.`,
      title: (label: string) => `Arrêter « ${label} »`,
      description: 'Rien n’est effacé : elle reste dans les mois où elle a compté, et dans « Terminées ».',
      when: 'Quand l’arrêter ?',
      lastIs: (month: string) => `Dernier mois : ${month}`,
      lastHelp: (month: string) => `Elle compte encore en ${month}, plus ensuite.`,
      asOf: (month: string) => `Dès ${month}`,
      asOfHelp: 'Plus rien à partir de ce mois-ci.',
      other: 'Un autre mois',
      otherHelp: 'Choisir le dernier mois où elle compte.',
      cancel: 'Annuler',
      confirm: 'Arrêter la charge',
    },
    detail: {
      perYear: ' / an',
      once: 'Une fois',
      since: (month: string) => `Depuis ${month}`,
      until: (month: string) => `Jusqu’à ${month}`,
      everyMonth: 'Tous les mois',
      paused: 'En pause',
      removedThatMonth: 'retirée ce mois-là',
      insteadOf: (amount: string, planned: string) => `${amount} au lieu de ${planned}`,
      active: 'En cours',
      upcoming: 'À venir',
      ended: 'Terminée',
      owner: (name: string | undefined, isPrivate: boolean) =>
        `Charge perso de ${name ?? 'un ancien membre'} : déduite de son argent de poche${isPrivate ? ', nom visible par vous uniquement' : ''}.`,
      history: 'Montants successifs',
      exceptions: 'Exceptions (un seul mois)',
      closed: 'clôturé',
      exceptionDeleted: (month: string) => `Exception ${deMonth(month)} supprimée.`,
      delete: 'Supprimer',
      inClosed: (n: number, range: string) =>
        `Présente dans ${n} mois clôturé${n > 1 ? 's' : ''} (${range}). Ces mois gardent leurs montants quoi qu’il arrive.`,
      notInClosed: 'Pas encore présente dans un mois clôturé.',
      changeFrom: 'Changer le montant à partir d’un mois',
      changeFromSub: 'Les mois d’avant gardent leur montant',
      settings: 'Modifier les réglages',
      settingsSub: 'Nom, fréquence, dates, catégorie',
      stop: 'Arrêter la charge',
      restart: (month: string) => `Relancer à partir ${deMonth(month)}`,
      restartSub: 'Les mois où elle était arrêtée restent vides',
      restarted: (label: string, month: string) => `« ${label} » relancée à partir ${deMonth(month)}.`,
      link: 'Lier aux transactions bancaires',
      actual: (amount: string) => `Réel constaté : ${amount}`,
      linkSub: 'Comparer avec ce qui est vraiment prélevé',
      suggestionsOn: 'Réactiver les suggestions d’économies',
      suggestionsOff: 'Désactiver les suggestions d’économies',
      deleteForGood: 'Supprimer définitivement',
      deleteSub: 'Les mois clôturés la gardent',
    },
    remove: {
      deleted: (label: string) => `« ${label} » supprimée. L’historique des mois clôturés est intact.`,
      title: (label: string) => `Supprimer « ${label} » ?`,
      closedKeep: (n: number, range: string) => `Les ${n} mois clôturés où elle apparaît (${range}) la gardent : leur photo est figée.`,
      notInClosed: 'Elle n’apparaît dans aucun mois clôturé.',
      warning: 'Elle disparaît des mois ouverts et à venir. Pour simplement l’arrêter, utilisez plutôt « Arrêter la charge ».',
      ended: 'Elle est terminée : rien ne change dans votre budget à venir.',
      cancel: 'Annuler',
      delete: 'Supprimer',
    },
    end: {
      question: 'Jusqu’à quand ?',
      aria: 'Fin',
      none: 'Sans fin',
      count: 'Pendant…',
      until: 'Jusqu’à…',
      for: 'Pendant',
      months: 'mois',
      lastPrefix: 'Dernier mois :',
      last: 'Dernier mois',
    },
    editor: {
      newCharge: 'Nouvelle charge',
      newPersonal: 'Nouvelle charge perso',
      blankAmount: (symbol: string) => `… ${symbol}`,
      summaryOnce: (amount: string, month: string) => `${amount} une seule fois, en ${month}.`,
      summaryYearly: (amount: string, month: string, year: number, endYear?: number) =>
        `${amount} chaque année en ${month}, à partir de ${year}${endYear ? ` et jusqu’en ${endYear}` : ''}.`,
      summarySmooth: (monthly: string) => ` Lissée : ${monthly} mis de côté chaque mois.`,
      everyMonth: 'tous les mois',
      monthsBase: (text: string) => text.toLowerCase(),
      summaryRepeat: (amount: string, base: string, start: string, end?: { month: string; n: number }) =>
        `${amount} ${base}, à partir ${deMonth(start)}` + (end ? ` jusqu’en ${end.month} (${end.n} mois).` : ', sans date de fin.'),
      impactEditing: 'Les mois clôturés ne changent pas ; les mois ouverts suivent les nouveaux réglages.',
      impactPersonal: (month: string, amount: string, owner: string) =>
        `Effet sur ${month} : ${amount} de moins dans l’argent de poche de ${owner}. Le pot commun ne change pas.`,
      impactHousehold: (month: string, amount: string) => `Effet sur ${month} : ${amount} de charges.`,
      impactLater: (month: string, first: string) => `Rien en ${month} : première fois en ${first}.`,
      impactNone: 'Aucun mois concerné avec ces réglages.',
      nameRequired: 'Donnez un nom (ex. : Loyer, Cantine, Taxe foncière…).',
      amountRequired: 'Indiquez un montant supérieur à 0.',
      monthsRequired: 'Choisissez au moins un mois.',
      endBeforeStart: 'La fin doit venir après le début.',
      privateFailed: 'Impossible d’enregistrer le nom privé pour le moment. Réessayez, ou rendez la charge visible.',
      updated: (label: string) => `« ${label} » mise à jour.`,
      addedPersonal: (label: string, owner: string) => `« ${label} » ajoutée aux charges perso de ${owner}.`,
      added: (label: string) => `« ${label} » ajoutée à vos charges.`,
      freq: { monthly: 'Chaque mois', custom: 'Certains mois', yearly: 'Chaque année', once: 'Une fois' },
      settingsTitle: (label: string) => `Réglages de « ${label} »`,
      name: 'Nom',
      placeholderPersonal: 'Ex. : Impôt, Envoi d’argent, Crédit perso…',
      placeholder: 'Ex. : Loyer, Cantine, Taxe foncière…',
      whoPays: 'Qui la paie ?',
      whoPaysAria: 'Qui paie cette charge',
      household: 'Le pot commun',
      member: 'Un membre (perso)',
      memberAria: 'Membre concerné',
      visibility: 'Visibilité',
      shared: 'Visible par le foyer',
      private: 'Privée',
      deducted: (owner: string) =>
        `Elle se déduit de l’argent de poche ${owner ? `de ${owner}` : 'du membre'} et ne touche pas au pot commun ni à la répartition.`,
      privateNote:
        'Privée : son nom, sa catégorie et sa note sont chiffrés à part et visibles par vous uniquement, même les autres membres ne peuvent pas les lire. Le montant reste visible de tous dans le Foyer.',
      sharedNote: 'Tout le foyer voit son nom et son montant.',
      when: 'Quand revient-elle ?',
      frequency: 'Fréquence',
      currentAmount: (amount: string, yearly: boolean) => (
        <>
          Montant actuel : <strong>{amount}</strong>
          {yearly ? ' par an' : ''}. Pour le changer sans toucher au passé, utilisez « Changer le montant à partir d’un mois » dans la fiche.
        </>
      ),
      yearlyAmount: 'Montant annuel',
      amount: 'Montant',
      monthlyAmount: 'Montant mensuel',
      whichMonths: 'Quels mois ?',
      tapToRemove: '(touchez pour retirer)',
      monthsAria: 'Mois concernés',
      month: 'Mois',
      firstDue: 'Première échéance',
      from: 'À partir de',
      start: 'Début',
      setAside: (monthly: string) => `Mettre ${monthly} de côté chaque mois`,
      setAsideTwelfth: 'Mettre 1/12 de côté chaque mois',
      recommended: 'Recommandé : l’échéance ne crée pas de trou le mois où elle tombe.',
      category: 'Catégorie',
      detecting: '(détection…)',
      details: 'Détails',
      optional: '(optionnel)',
      detailsPlaceholder: 'Ex. : 45 m², tous risques… aide l’IA à comparer',
      inShort: 'En clair',
      saving: 'Enregistrement…',
      save: 'Enregistrer',
      add: 'Ajouter la charge',
    },
  },
  en: {
    actions: {
      inMonth: (month: string) => `In ${month}`,
      adjusted: (planned: string) => `Planned: ${planned} · adjusted this month`,
      skipped: 'Removed from this month (exception).',
      editAmount: 'Edit amount',
      editAmountSub: 'For this month only, or from this month on',
      skip: (month: string) => `Remove from ${month}`,
      skipSub: 'An exception: the other months don’t change',
      skippedDone: (label: string, month: string) => `“${label}” removed from ${month} only.`,
      restore: (month: string) => `Restore in ${month}`,
      restoreSub: 'Undoes this month’s exception',
      back: (label: string, month: string) => `“${label}” is back in ${month}.`,
      stop: 'Stop this bill',
      stopSub: 'It moves to “Ended” and stays in the history',
      detail: 'See details',
      detailSub: 'Amount history, exceptions, settings',
    },
    amount: {
      invalid: 'Enter a valid amount (0 or more).',
      monthOnlyDone: (label: string, amount: string, month: string) => `“${label}”: ${amount} in ${month} only.`,
      forwardDone: (label: string, amount: string, yearly: boolean, month: string) =>
        `“${label}”: ${amount}${yearly ? ' a year' : ''} from ${month}. Earlier months keep their amount.`,
      allDone: (label: string) => `“${label}” corrected in every open month. Closed months don’t change.`,
      title: (label: string) => `Edit “${label}”`,
      from: 'Starting',
      yearlyAmount: 'Yearly amount',
      newAmount: 'New amount',
      currently: (amount: string, yearly: boolean, monthly: string | null) =>
        `Currently: ${amount}${yearly ? ' a year' : ''}${monthly ? ` (${monthly} set aside every month)` : ''}`,
      applyTo: 'Apply this amount to…',
      only: (month: string) => `${month} only`,
      onlyHelp: (planned: string) => `An exception: the other months stay at ${planned}.`,
      fromOn: (month: string) => `From ${month} on`,
      earlierKeep: (amount: string, yearly: boolean) => `Earlier months keep ${amount}${yearly ? ' a year' : ''}.`,
      fromFirst: 'Applies from the first month.',
      fixAll: 'Fix a typing mistake in every open month',
    },
    stop: {
      removed: (label: string) => `“${label}” hadn’t started yet: it’s been removed.`,
      stopped: (label: string, month: string) => `“${label}” stops after ${month}. It stays in the history.`,
      title: (label: string) => `Stop “${label}”`,
      description: 'Nothing is erased: it stays in the months where it counted, and under “Ended”.',
      when: 'When should it stop?',
      lastIs: (month: string) => `Final month: ${month}`,
      lastHelp: (month: string) => `It still counts in ${month}, not after.`,
      asOf: (month: string) => `As of ${month}`,
      asOfHelp: 'Nothing from this month on.',
      other: 'Another month',
      otherHelp: 'Choose the last month it counts in.',
      cancel: 'Cancel',
      confirm: 'Stop the bill',
    },
    detail: {
      perYear: ' / year',
      once: 'Once',
      since: (month: string) => `Since ${month}`,
      until: (month: string) => `Until ${month}`,
      everyMonth: 'Every month',
      paused: 'Paused',
      removedThatMonth: 'removed that month',
      insteadOf: (amount: string, planned: string) => `${amount} instead of ${planned}`,
      active: 'Active',
      upcoming: 'Upcoming',
      ended: 'Ended',
      owner: (name: string | undefined, isPrivate: boolean) =>
        `${name ? `${name}’s` : 'A former member’s'} personal expense: it comes out of their spending money${isPrivate ? '; only you can see its name' : ''}.`,
      history: 'Amount history',
      exceptions: 'Exceptions (one month only)',
      closed: 'closed',
      exceptionDeleted: (month: string) => `${month} exception deleted.`,
      delete: 'Delete',
      inClosed: (n: number, range: string) =>
        `In ${n === 1 ? '1 closed month' : `${n} closed months`} (${range}). Those months keep their amounts whatever happens.`,
      notInClosed: 'Not in any closed month yet.',
      changeFrom: 'Change the amount from a given month',
      changeFromSub: 'Earlier months keep their amount',
      settings: 'Edit settings',
      settingsSub: 'Name, frequency, dates, category',
      stop: 'Stop the bill',
      restart: (month: string) => `Restart from ${month}`,
      restartSub: 'The months when it was stopped stay empty',
      restarted: (label: string, month: string) => `“${label}” restarted from ${month}.`,
      link: 'Link to bank transactions',
      actual: (amount: string) => `Actual: ${amount}`,
      linkSub: 'Compare with what actually leaves your account',
      suggestionsOn: 'Turn money-saving suggestions back on',
      suggestionsOff: 'Turn off money-saving suggestions',
      deleteForGood: 'Delete for good',
      deleteSub: 'Closed months keep it',
    },
    remove: {
      deleted: (label: string) => `“${label}” deleted. The history of closed months is intact.`,
      title: (label: string) => `Delete “${label}”?`,
      closedKeep: (n: number, range: string) =>
        `${n === 1 ? 'The closed month' : `The ${n} closed months`} where it appears (${range}) keep it: their snapshot is locked.`,
      notInClosed: 'It doesn’t appear in any closed month.',
      warning: 'It disappears from open and upcoming months. To simply stop it, use “Stop the bill” instead.',
      ended: 'It has ended: nothing changes in your upcoming budget.',
      cancel: 'Cancel',
      delete: 'Delete',
    },
    end: {
      question: 'Until when?',
      aria: 'End',
      none: 'No end',
      count: 'For…',
      until: 'Until…',
      for: 'For',
      months: 'months',
      lastPrefix: 'Final month:',
      last: 'Final month',
    },
    editor: {
      newCharge: 'New bill',
      newPersonal: 'New personal expense',
      blankAmount: (symbol: string) => ([...symbol].length === 1 ? `${symbol}…` : `… ${symbol}`),
      summaryOnce: (amount: string, month: string) => `${amount} just once, in ${month}.`,
      summaryYearly: (amount: string, month: string, year: number, endYear?: number) =>
        `${amount} every year in ${month}, from ${year}${endYear ? ` until ${endYear}` : ''}.`,
      summarySmooth: (monthly: string) => ` Spread over 12 months: ${monthly} set aside every month.`,
      everyMonth: 'every month',
      monthsBase: (text: string) => text.charAt(0).toLowerCase() + text.slice(1),
      summaryRepeat: (amount: string, base: string, start: string, end?: { month: string; n: number }) =>
        `${amount} ${base}, from ${start}` + (end ? ` until ${end.month} (${monthsEn(end.n)}).` : ', with no end date.'),
      impactEditing: 'Closed months don’t change; open months follow the new settings.',
      impactPersonal: (month: string, amount: string, owner: string) =>
        `Effect on ${month}: ${amount} less in ${owner}’s spending money. The joint pot doesn’t change.`,
      impactHousehold: (month: string, amount: string) => `Effect on ${month}: ${amount} in bills.`,
      impactLater: (month: string, first: string) => `Nothing in ${month}: first time in ${first}.`,
      impactNone: 'These settings don’t apply to any month.',
      nameRequired: 'Give it a name (e.g. Rent, School meals, Property tax…).',
      amountRequired: 'Enter an amount above 0.',
      monthsRequired: 'Choose at least one month.',
      endBeforeStart: 'The end must come after the start.',
      privateFailed: 'Couldn’t save the private name right now. Try again, or make the expense visible.',
      updated: (label: string) => `“${label}” updated.`,
      addedPersonal: (label: string, owner: string) => `“${label}” added to ${owner}’s personal expenses.`,
      added: (label: string) => `“${label}” added to your bills.`,
      freq: { monthly: 'Every month', custom: 'Some months', yearly: 'Every year', once: 'Just once' },
      settingsTitle: (label: string) => `“${label}” settings`,
      name: 'Name',
      placeholderPersonal: 'E.g. Taxes, Money sent to family, Personal loan…',
      placeholder: 'E.g. Rent, School meals, Property tax…',
      whoPays: 'Who pays it?',
      whoPaysAria: 'Who pays this bill',
      household: 'The joint pot',
      member: 'A member (personal)',
      memberAria: 'Which member',
      visibility: 'Visibility',
      shared: 'Visible to the household',
      private: 'Private',
      deducted: (owner: string) =>
        `It comes out of ${owner ? `${owner}’s` : 'the member’s'} spending money and doesn’t touch the joint pot or the split.`,
      privateNote:
        'Private: its name, category and note are encrypted separately and visible only to you; even other members can’t read them. The amount stays visible to everyone in the Household tab.',
      sharedNote: 'The whole household sees its name and amount.',
      when: 'When is it due?',
      frequency: 'Frequency',
      currentAmount: (amount: string, yearly: boolean) => (
        <>
          Current amount: <strong>{amount}</strong>
          {yearly ? ' a year' : ''}. To change it without touching the past, use “Change the amount from a given month” in its details.
        </>
      ),
      yearlyAmount: 'Yearly amount',
      amount: 'Amount',
      monthlyAmount: 'Monthly amount',
      whichMonths: 'Which months?',
      tapToRemove: '(tap to remove)',
      monthsAria: 'Months included',
      month: 'Month',
      firstDue: 'First payment',
      from: 'Starting',
      start: 'Start',
      setAside: (monthly: string) => `Set ${monthly} aside every month`,
      setAsideTwelfth: 'Set 1/12 aside every month',
      recommended: 'Recommended: the payment won’t leave a hole in the month it falls due.',
      category: 'Category',
      detecting: '(detecting…)',
      details: 'Details',
      optional: '(optional)',
      detailsPlaceholder: 'E.g. 2-bedroom, full coverage… helps the AI compare',
      inShort: 'In short',
      saving: 'Saving…',
      save: 'Save',
      add: 'Add bill',
    },
  },
});

/**
 * A charge as its viewer may see it: for the creator of a private personal
 * charge, its real name / category / note come from the server-side store.
 */
function useCharge(id: string): Charge | undefined {
  const { model, privateCharges } = useBudget();
  const c = model.charges.find((x) => x.id === id);
  const details = c?.private ? privateCharges[c.id] : undefined;
  return c && details ? { ...c, label: details.label, category: details.category ?? c.category, description: details.description ?? c.description } : c;
}

function ActionItem({ icon, title, sub, onClick, danger }: { icon: React.ReactNode; title: string; sub?: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[60px] w-full items-center gap-3.5 rounded-xl border border-border/70 bg-card px-3.5 py-2.5 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className={cn('shrink-0 [&_svg]:h-5 [&_svg]:w-5', danger ? 'text-destructive' : 'text-primary')}>{icon}</span>
      <span className="flex flex-col">
        <span className={cn('text-[15px] font-semibold', danger && 'text-destructive')}>{title}</span>
        {sub && <span className="text-sm text-muted-foreground">{sub}</span>}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Actions on a charge, from a month
// ---------------------------------------------------------------------------
export function ChargeActionsSheet({ sheet, onClose }: SheetProps<'charge'>) {
  const t = useT(M).actions;
  const { fmt, openSheet, commit, today } = useBudget();
  const c = useCharge(sheet.id);
  if (!c) return null;
  const r = resolveCharge(c, sheet.ym);
  const month = formatMonthLong(sheet.ym);
  const once = chargeFrequency(c) === 'once';
  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={c.label} description={describeChargeSchedule(c, today)}>
      <div className="flex items-baseline justify-between gap-3 rounded-xl bg-orange-50/70 px-4 py-3">
        <span className="text-sm text-foreground/80">{t.inMonth(month)}</span>
        <span className="font-display text-2xl font-extrabold tabular-nums">{r ? fmt(r.skipped ? r.planned : r.amount) : '—'}</span>
      </div>
      {r?.adjusted && <p className="-mt-2 text-sm text-amber-800">{t.adjusted(fmt(r.planned))}</p>}
      {r?.skipped && <p className="-mt-2 text-sm text-muted-foreground">{t.skipped}</p>}
      <div className="flex flex-col gap-2">
        <ActionItem icon={<Pencil />} title={t.editAmount} sub={t.editAmountSub} onClick={() => openSheet({ kind: 'chargeAmount', id: c.id, ym: sheet.ym })} />
        {r && !r.skipped && (
          <ActionItem
            icon={<PauseCircle />}
            title={t.skip(month)}
            sub={t.skipSub}
            onClick={() => {
              commit((m) => setChargeMonthAmount(m, c.id, sheet.ym, 0), { message: t.skippedDone(c.label, month) });
              onClose();
            }}
          />
        )}
        {r?.skipped && (
          <ActionItem
            icon={<RotateCcw />}
            title={t.restore(month)}
            sub={t.restoreSub}
            onClick={() => {
              commit((m) => setChargeMonthAmount(m, c.id, sheet.ym, null), { message: t.back(c.label, month) });
              onClose();
            }}
          />
        )}
        {!once && (
          <ActionItem icon={<StopCircle />} title={t.stop} sub={t.stopSub} onClick={() => openSheet({ kind: 'chargeStop', id: c.id, ym: sheet.ym })} />
        )}
        <ActionItem icon={<Info />} title={t.detail} sub={t.detailSub} onClick={() => openSheet({ kind: 'chargeDetail', id: c.id })} />
      </div>
    </ResponsiveSheet>
  );
}

// ---------------------------------------------------------------------------
// Amount change with an explicit scope
// ---------------------------------------------------------------------------
export function ChargeAmountSheet({ sheet, onClose }: SheetProps<'chargeAmount'>) {
  const t = useT(M).amount;
  const { fmt, commit, today } = useBudget();
  const c = useCharge(sheet.id);
  const [fromYm, setFromYm] = useState<YM>(sheet.ym);
  const freq = c ? chargeFrequency(c) : 'monthly';
  const yearly = freq === 'yearly';
  const r = c ? resolveCharge(c, fromYm) : null;
  const initial = c ? (yearly ? chargeBaseAmount(c, fromYm) : r ? r.amount : chargeBaseAmount(c, fromYm)) : 0;
  const [value, setValue] = useState(String(initial));
  const [error, setError] = useState('');
  useEffect(() => setValue(String(initial)), [fromYm]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!c) return null;

  const start = windowOf(c).start;
  const monthLabel = formatMonthLong(fromYm);
  const v = parseAmount(value);
  const valid = Number.isFinite(v) && v >= 0;
  const canMonthOnly = !sheet.fromCatalog && !!r && !(yearly && c.smooth);
  const prevAmount = start && compareYM(start, fromYm) >= 0 ? null : chargeBaseAmount(c, addMonths(fromYm, -1));

  const apply = (scope: 'month' | 'forward' | 'all') => {
    if (!valid) return failOn('ca-amount', setError, t.invalid);
    if (scope === 'month') {
      commit((m) => setChargeMonthAmount(m, c.id, fromYm, v), { message: t.monthOnlyDone(c.label, fmt(v), monthLabel) });
    } else if (scope === 'forward') {
      commit((m) => setChargeAmountFrom(m, c.id, fromYm, v, today), {
        message: t.forwardDone(c.label, fmt(v), yearly, monthLabel),
      });
    } else {
      commit((m) => setChargeAmountEverywhere(m, c.id, v), { message: t.allDone(c.label) });
    }
    onClose();
  };

  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={t.title(c.label)} description={describeChargeSchedule(c, today)}>
      {sheet.fromCatalog && (
        <div>
          <FieldLabel htmlFor="ca-from">{t.from}</FieldLabel>
          <MonthPicker id="ca-from" value={fromYm} onChange={setFromYm} min={maxYM(today, start ?? today)} ariaLabel={t.from} />
        </div>
      )}
      <div>
        <FieldLabel htmlFor="ca-amount">{yearly ? t.yearlyAmount : t.newAmount}</FieldLabel>
        <MoneyInput id="ca-amount" big value={value} onChange={(e) => { setValue(e.target.value); setError(''); }} />
        <p className="mt-1.5 text-sm text-muted-foreground">
          {t.currently(fmt(initial), yearly, yearly && c.smooth ? fmt(initial / 12) : null)}
        </p>
        <div className="mt-2"><ErrorText>{error}</ErrorText></div>
      </div>
      <div className="flex flex-col gap-2">
        {!sheet.fromCatalog && <span className="text-sm font-semibold">{t.applyTo}</span>}
        {canMonthOnly && (
          <ChoiceCard title={t.only(monthNames()[monthIndex0(fromYm)])} help={t.onlyHelp(fmt(r!.planned))} onClick={() => apply('month')} />
        )}
        <ChoiceCard
          title={t.fromOn(formatMonthShort(fromYm))}
          help={prevAmount !== null ? t.earlierKeep(fmt(prevAmount), yearly) : t.fromFirst}
          onClick={() => apply('forward')}
          selected={sheet.fromCatalog}
        />
        <button type="button" onClick={() => apply('all')} className="self-start py-2 text-sm font-semibold text-primary underline underline-offset-4 hover:text-primary/80">
          {t.fixAll}
        </button>
      </div>
    </ResponsiveSheet>
  );
}

// ---------------------------------------------------------------------------
// Stop
// ---------------------------------------------------------------------------
export function ChargeStopSheet({ sheet, onClose }: SheetProps<'chargeStop'>) {
  const t = useT(M);
  const { commit, model, today } = useBudget();
  const c = useCharge(sheet.id);
  const [last, setLast] = useState<YM>(sheet.ym);
  const [custom, setCustom] = useState(false);
  if (!c) return null;
  const month = formatMonthLong(sheet.ym);
  const previous = addMonths(sheet.ym, -1);
  const start = windowOf(c).start;
  const confirm = () => {
    const { removed } = stopCharge(model, c.id, last);
    commit((m) => stopCharge(m, c.id, last).model, {
      message: removed
        ? t.stop.removed(c.label)
        : t.stop.stopped(c.label, formatMonthLong(last)),
    });
    onClose();
  };
  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={t.stop.title(c.label)} description={t.stop.description}>
      <div role="radiogroup" aria-label={t.stop.when} className="flex flex-col gap-2">
        <ChoiceCard role="radio" selected={!custom && last === sheet.ym} onClick={() => { setCustom(false); setLast(sheet.ym); }} title={t.stop.lastIs(month)} help={t.stop.lastHelp(monthNameLower(sheet.ym))} />
        {(!start || compareYM(previous, start) >= 0) && (
          <ChoiceCard role="radio" selected={!custom && last === previous} onClick={() => { setCustom(false); setLast(previous); }} title={t.stop.asOf(month)} help={t.stop.asOfHelp} />
        )}
        <ChoiceCard role="radio" selected={custom} onClick={() => setCustom(true)} title={t.stop.other} help={t.stop.otherHelp} />
        {custom && <MonthPicker value={last} onChange={setLast} min={start ?? addMonths(today, -24)} ariaLabel={t.end.last} prefix={t.end.lastPrefix} />}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" className="min-h-[44px]" onClick={onClose}>{t.stop.cancel}</Button>
        <Button className="min-h-[44px]" onClick={confirm}>{t.stop.confirm}</Button>
      </div>
    </ResponsiveSheet>
  );
}

// ---------------------------------------------------------------------------
// Detail
// ---------------------------------------------------------------------------
function closedMonthsWith(model: ReturnType<typeof useBudget>['model'], id: string): YM[] {
  return Object.entries(model.months)
    .filter(([, rec]) => rec.snapshot?.charges.some((c) => c.id === id && (c.amount > 0 || c.skipped)))
    .map(([ym]) => ym)
    .sort((a, b) => compareYM(a, b));
}

/** "sept. 2026 → déc. 2026", or the one month. */
function closedRange(months: YM[]): string {
  return `${formatMonthShort(months[0])}${months.length > 1 ? ` → ${formatMonthShort(months[months.length - 1])}` : ''}`;
}

export function ChargeDetailSheet({ sheet, onClose }: SheetProps<'chargeDetail'>) {
  const t = useT(M).detail;
  const { fmt, openSheet, commit, today, model, engine, handleOpenMapper, mappedTotalsByChargeId } = useBudget();
  const c = useCharge(sheet.id);
  if (!c) return null;
  const status = chargeStatus(c, today);
  const freq = chargeFrequency(c);
  const w = windowOf(c);
  const meta = categoryMeta(c.category);
  const perUnit = freq === 'yearly' ? t.perYear : '';
  const steps = sortSteps(c.amountHistory?.length ? c.amountHistory : [{ from: w.start ?? today, amount: c.amount }]);
  const reference = status === 'ended' ? w.end ?? today : status === 'upcoming' ? w.start ?? today : today;
  const currentStep = steps.reduce((acc, s) => (compareYM(s.from, reference) <= 0 ? s : acc), steps[0]);
  const rows = steps.map((s, i) => {
    const next = steps[i + 1];
    const to = next ? addMonths(next.from, -1) : w.end;
    const from = i === 0 && w.start ? w.start : i === 0 ? undefined : s.from;
    let period: string;
    if (freq === 'once') period = w.start ? formatMonthLong(w.start) : t.once;
    else if (from && to) period = `${formatMonthShort(from)} → ${formatMonthShort(to)}`;
    else if (from) period = t.since(formatMonthShort(from));
    else if (to) period = t.until(formatMonthShort(to));
    else period = t.everyMonth;
    return { key: `${s.from}-${i}`, period, amount: s.amount === 0 ? t.paused : fmt(s.amount) + perUnit, current: s === currentStep };
  }).reverse();
  const exceptions = Object.entries(c.overrides ?? {})
    .sort(([a], [b]) => compareYM(a, b))
    .map(([ym, value]) => {
      const planned = resolveCharge({ ...c, overrides: undefined }, ym)?.planned ?? 0;
      return { ym, text: value === 0 ? t.removedThatMonth : t.insteadOf(fmt(value), fmt(planned)), closed: engine.isClosed(ym) };
    });
  const closedMonths = closedMonthsWith(model, c.id);
  const mapped = mappedTotalsByChargeId[c.id] || 0;
  const statusPill = status === 'active' ? <Pill tone="green">{t.active}</Pill> : status === 'upcoming' ? <Pill tone="blue">{t.upcoming}</Pill> : <Pill tone="grey">{t.ended}</Pill>;

  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={c.label}>
      <div className="-mt-2 flex flex-wrap items-center gap-2.5">
        <CategoryIcon category={c.category} className="h-9 w-9" />
        <span className="text-sm text-muted-foreground">{meta.label}</span>
        {statusPill}
      </div>
      <p className="text-[15px] font-semibold">{describeChargeSchedule(c, today)}</p>
      {c.ownerId && (
        <p className="-mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
          {c.private && <Lock className="h-3.5 w-3.5" aria-hidden="true" />}
          {t.owner(model.people.find((p) => p.id === c.ownerId)?.name, !!c.private)}
        </p>
      )}
      {c.description && <p className="-mt-3 text-sm text-muted-foreground">{c.description}</p>}

      <div>
        <h3 className="mb-2 text-sm font-semibold">{t.history}</h3>
        <ol className="flex flex-col">
          {rows.map((row) => (
            <li key={row.key} className="relative ml-1.5 flex min-h-[40px] items-center gap-3 border-l-2 border-border pl-4">
              <span aria-hidden="true" className={cn('absolute -left-[7px] h-3 w-3 rounded-full border-2 border-background', row.current ? 'bg-primary' : 'bg-muted-foreground/40')} />
              <span className="flex-1 text-sm">{row.period}</span>
              <strong className="text-sm tabular-nums">{row.amount}</strong>
            </li>
          ))}
        </ol>
      </div>

      {exceptions.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">{t.exceptions}</h3>
          <div className="flex flex-col gap-1.5">
            {exceptions.map((x) => (
              <div key={x.ym} className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2 text-sm">
                <span className="flex-1">
                  <strong>{formatMonthTitle(x.ym)}</strong> · {x.text}
                </span>
                {x.closed ? (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Lock className="h-3 w-3" /> {t.closed}</span>
                ) : (
                  <button
                    type="button"
                    className="py-1 text-sm font-semibold text-primary underline underline-offset-4"
                    onClick={() => commit((m) => setChargeMonthAmount(m, c.id, x.ym, null), { message: t.exceptionDeleted(formatMonthLong(x.ym)) })}
                  >
                    {t.delete}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="flex gap-2.5 rounded-xl bg-stone-50 px-3.5 py-3 text-sm text-stone-800">
        <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          {closedMonths.length
            ? t.inClosed(closedMonths.length, closedRange(closedMonths))
            : t.notInClosed}
        </span>
      </p>

      <div className="flex flex-col gap-2">
        {status !== 'ended' && (
          <ActionItem icon={<Pencil />} title={t.changeFrom} sub={t.changeFromSub} onClick={() => openSheet({ kind: 'chargeAmount', id: c.id, ym: maxYM(today, w.start ?? today), fromCatalog: true })} />
        )}
        <ActionItem icon={<Settings2 />} title={t.settings} sub={t.settingsSub} onClick={() => openSheet({ kind: 'chargeEditor', id: c.id, ym: today })} />
        {status !== 'ended' && freq !== 'once' && (
          <ActionItem icon={<StopCircle />} title={t.stop} onClick={() => openSheet({ kind: 'chargeStop', id: c.id, ym: maxYM(today, w.start ?? today) })} />
        )}
        {status === 'ended' && freq !== 'once' && (
          <ActionItem
            icon={<RotateCcw />}
            title={t.restart(formatMonthLong(today))}
            sub={t.restartSub}
            onClick={() => {
              commit((m) => restartCharge(m, c.id, today, today), { message: t.restarted(c.label, formatMonthLong(today)) });
              onClose();
            }}
          />
        )}
        {PREMIUM_ENABLED && (
          <ActionItem
            icon={<LinkIcon />}
            title={t.link}
            sub={mapped > 0 ? t.actual(fmt(mapped)) : t.linkSub}
            onClick={() => {
              onClose();
              handleOpenMapper(c);
            }}
          />
        )}
        <ActionItem
          icon={c.ignoreSuggestions ? <LightbulbOff /> : <Lightbulb />}
          title={c.ignoreSuggestions ? t.suggestionsOn : t.suggestionsOff}
          onClick={() => commit((m) => updateCharge(m, c.id, { ignoreSuggestions: c.ignoreSuggestions ? false : true }))}
        />
        <ActionItem danger icon={<Trash2 />} title={t.deleteForGood} sub={t.deleteSub} onClick={() => openSheet({ kind: 'chargeDelete', id: c.id })} />
      </div>
    </ResponsiveSheet>
  );
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------
export function ChargeDeleteSheet({ sheet, onClose }: SheetProps<'chargeDelete'>) {
  const t = useT(M).remove;
  const { commit, model, today } = useBudget();
  const c = useCharge(sheet.id);
  if (!c) return null;
  const closedMonths = closedMonthsWith(model, c.id);
  const status = chargeStatus(c, today);
  const confirm = () => {
    commit((m) => deleteCharge(m, c.id), { message: t.deleted(c.label) });
    onClose();
  };
  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={t.title(c.label)}>
      <p className="flex gap-2.5 rounded-xl bg-emerald-50 px-3.5 py-3 text-sm text-emerald-950">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          {closedMonths.length
            ? t.closedKeep(closedMonths.length, closedRange(closedMonths))
            : t.notInClosed}
        </span>
      </p>
      {status !== 'ended' ? (
        <p className="flex gap-2.5 rounded-xl bg-orange-50 px-3.5 py-3 text-sm text-orange-950">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{t.warning}</span>
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">{t.ended}</p>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="outline" className="min-h-[44px]" onClick={onClose}>{t.cancel}</Button>
        <Button variant="destructive" className="min-h-[44px]" onClick={confirm}>{t.delete}</Button>
      </div>
    </ResponsiveSheet>
  );
}

// ---------------------------------------------------------------------------
// Create / edit
// ---------------------------------------------------------------------------
type EndMode = 'none' | 'count' | 'until';

export function EndFields({
  start,
  endMode,
  setEndMode,
  count,
  setCount,
  end,
  setEnd,
  allowCount = true,
}: {
  start: YM;
  endMode: EndMode;
  setEndMode: (m: EndMode) => void;
  count: string;
  setCount: (v: string) => void;
  end: YM;
  setEnd: (ym: YM) => void;
  allowCount?: boolean;
}) {
  const t = useT(M).end;
  return (
    <div>
      <span className="mb-2 block text-sm font-semibold">{t.question}</span>
      <div role="group" aria-label={t.aria} className="flex flex-wrap gap-2">
        <ChipToggle pressed={endMode === 'none'} onClick={() => setEndMode('none')}>{t.none}</ChipToggle>
        {allowCount && <ChipToggle pressed={endMode === 'count'} onClick={() => setEndMode('count')}>{t.count}</ChipToggle>}
        <ChipToggle pressed={endMode === 'until'} onClick={() => { if (compareYM(end, start) < 0) setEnd(addMonths(start, 2)); setEndMode('until'); }}>{t.until}</ChipToggle>
      </div>
      {endMode === 'count' && (
        <div className="mt-3 flex items-center gap-2.5">
          <label htmlFor="end-count" className="text-sm">{t.for}</label>
          <Input id="end-count" autoComplete="off" inputMode="numeric" value={count} onChange={(e) => setCount(e.target.value.replace(/[^\d]/g, '').slice(0, 3))} className="h-12 w-24 rounded-xl text-center text-base tabular-nums" />
          <span className="text-sm">{t.months}</span>
        </div>
      )}
      {endMode === 'until' && (
        <div className="mt-3">
          <MonthPicker value={end} onChange={setEnd} min={start} prefix={t.lastPrefix} ariaLabel={t.last} />
        </div>
      )}
    </div>
  );
}

export function computeEnd(start: YM, endMode: EndMode, count: string, end: YM): YM | undefined {
  if (endMode === 'count') return addMonths(start, Math.max(1, Math.min(240, parseInt(count, 10) || 1)) - 1);
  if (endMode === 'until') return end;
  return undefined;
}

export function ChargeEditorSheet({ sheet, onClose }: SheetProps<'chargeEditor'>) {
  const t = useT(M).editor;
  const { fmt, commit, today, currencySymbol, model, savePrivateCharge, deletePrivateCharge } = useBudget();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const existing = useCharge(sheet.id ?? '');
  const editing = !!existing;
  const w = existing ? windowOf(existing) : {};
  const defaultStart = compareYM(sheet.ym, today) < 0 ? today : sheet.ym;

  const [label, setLabel] = useState(existing?.label ?? '');
  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const [category, setCategory] = useState(existing?.category ?? '');
  const [catTouched, setCatTouched] = useState(!!existing?.category);
  const [description, setDescription] = useState(existing?.description ?? '');
  const [freq, setFreq] = useState<Frequency>(existing ? chargeFrequency(existing) : 'monthly');
  const [months, setMonths] = useState<number[]>(existing?.months ?? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  const [start, setStart] = useState<YM>(w.start ?? defaultStart);
  const [endMode, setEndMode] = useState<EndMode>(w.end ? 'until' : 'none');
  const [count, setCount] = useState('12');
  const [end, setEnd] = useState<YM>(w.end ?? addMonths(w.start ?? defaultStart, 11));
  const [smooth, setSmooth] = useState(existing ? !!existing.smooth : true);
  const [error, setError] = useState('');
  const [detecting, setDetecting] = useState(false);
  // Who pays: the household pot, or one member out of their pocket money.
  const members = model.people.filter((p) => personStatus(p, today) !== 'ended');
  const guessMe = members.find((p) => user?.name && p.name.trim().toLowerCase() === user.name.trim().split(/\s+/)[0].toLowerCase());
  const [payer, setPayer] = useState<'household' | 'personal'>(existing?.ownerId || sheet.ownerId ? 'personal' : 'household');
  const [ownerId, setOwnerId] = useState<string>(existing?.ownerId ?? sheet.ownerId ?? guessMe?.id ?? members[0]?.id ?? '');
  const [isPrivate, setIsPrivate] = useState<boolean>(!!existing?.private);
  const personal = payer === 'personal' && !!ownerId;
  const ownerName = model.people.find((p) => p.id === ownerId)?.name ?? '';

  const value = parseAmount(amount);
  const endYm = freq === 'once' ? undefined : computeEnd(start, endMode, count, end);

  const draft: Charge = useMemo(
    () => ({
      id: 'draft',
      label: label || t.newCharge,
      amount: Number.isFinite(value) ? value : 0,
      startDate: startDateOf(start),
      ...(endYm ? { endDate: endDateOf(endYm) } : {}),
      ...(freq !== 'monthly' ? { frequency: freq } : {}),
      ...(freq === 'custom' ? { months } : {}),
      ...(freq === 'yearly' && smooth ? { smooth: true } : {}),
    }),
    [label, value, start, endYm, freq, months, smooth, t.newCharge],
  );

  const amountText = Number.isFinite(value) && value > 0 ? fmt(value) : t.blankAmount(currencySymbol);
  let summary: string;
  if (freq === 'once') summary = t.summaryOnce(amountText, formatMonthLong(start));
  else if (freq === 'yearly') {
    summary = t.summaryYearly(amountText, monthNamesLower()[monthIndex0(start)], yearOf(start), endYm ? yearOf(endYm) : undefined);
    if (smooth && Number.isFinite(value) && value > 0) summary += t.summarySmooth(fmt(value / 12));
  } else {
    const base = freq === 'custom' ? t.monthsBase(customMonthsText(months)) : t.everyMonth;
    summary = t.summaryRepeat(amountText, base, formatMonthLong(start), endYm ? { month: formatMonthLong(endYm), n: monthsBetween(start, endYm) } : undefined);
  }
  const ctx = sheet.ym;
  const inCtx = !editing && compareYM(ctx, start) >= 0 ? resolveCharge(draft, ctx) : null;
  let firstOcc: YM | null = null;
  for (let i = 0; i < 36 && !firstOcc; i++) if (resolveCharge(draft, addMonths(start, i))) firstOcc = addMonths(start, i);
  const impact = editing
    ? t.impactEditing
    : inCtx && Number.isFinite(value) && value > 0
      ? personal
        ? t.impactPersonal(formatMonthLong(ctx), fmt(inCtx.amount), ownerName)
        : t.impactHousehold(formatMonthLong(ctx), moneySigned(inCtx.amount, currencySymbol))
      : firstOcc
        ? t.impactLater(formatMonthLong(ctx), formatMonthLong(firstOcc))
        : t.impactNone;

  const detectCategory = async () => {
    if (catTouched || label.trim().length < 3) return;
    setDetecting(true);
    try {
      const res = await budgetAPI.categorize(label.trim());
      const cat = res.data?.category;
      if (cat && cat !== 'OTHER') setCategory(cat);
    } catch {
      /* categorisation is a convenience */
    } finally {
      setDetecting(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return failOn('ch-label', setError, t.nameRequired);
    if (!editing && (!Number.isFinite(value) || value <= 0)) return failOn('ch-amount', setError, t.amountRequired);
    if (freq === 'custom' && months.length === 0) return setError(t.monthsRequired);
    if (endYm && compareYM(endYm, start) < 0) return setError(t.endBeforeStart);
    const settings: Partial<Charge> = {
      label: label.trim(),
      category: category || undefined,
      description: description.trim() || undefined,
      startDate: startDateOf(start),
      endDate: endYm ? endDateOf(endYm) : undefined,
      frequency: freq !== 'monthly' ? freq : undefined,
      months: freq === 'custom' ? months.slice().sort((a, b) => a - b) : undefined,
      smooth: freq === 'yearly' && smooth ? true : undefined,
      ownerId: personal ? ownerId : undefined,
      private: personal && isPrivate ? true : undefined,
      createdBy: personal ? existing?.createdBy ?? user?.id : undefined,
    };
    const chargeId = existing?.id ?? newId('c');
    if (personal && isPrivate) {
      // Confidential: the real name, category and note are stored server-side
      // for their creator only; the shared data only says « Charge privée ».
      setSaving(true);
      try {
        await savePrivateCharge(chargeId, { label: label.trim(), category: category || undefined, description: description.trim() || undefined });
      } catch {
        setSaving(false);
        return setError(t.privateFailed);
      }
      setSaving(false);
      settings.label = PRIVATE_CHARGE_LABEL;
      settings.category = undefined;
      settings.description = undefined;
    } else if (existing?.private) {
      // No longer private: the name goes back into the shared data.
      void deletePrivateCharge(existing.id);
    }
    if (editing) {
      commit((m) => updateCharge(m, existing!.id, settings), { message: t.updated(label.trim()) });
    } else {
      const charge: Charge = { id: chargeId, amount: value, ignoreSuggestions: false, ...settings, label: settings.label ?? label.trim() } as Charge;
      for (const k of Object.keys(charge) as Array<keyof Charge>) if (charge[k] === undefined) delete charge[k];
      commit((m) => upsertCharge(m, charge), {
        message: personal ? t.addedPersonal(label.trim(), ownerName) : t.added(label.trim()),
      });
    }
    onClose();
  };

  const freqOptions: Array<{ value: Frequency; label: string }> = [
    { value: 'monthly', label: t.freq.monthly },
    { value: 'custom', label: t.freq.custom },
    { value: 'yearly', label: t.freq.yearly },
    { value: 'once', label: t.freq.once },
  ];

  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={editing ? t.settingsTitle(existing!.label) : personal ? t.newPersonal : t.newCharge}>
      <form onSubmit={submit} className="flex flex-col gap-5">
        <div>
          <FieldLabel htmlFor="ch-label">{t.name}</FieldLabel>
          <Input id="ch-label" autoComplete="off" value={label} onChange={(e) => { setLabel(e.target.value); setError(''); }} onBlur={detectCategory} placeholder={personal ? t.placeholderPersonal : t.placeholder} className="h-12 rounded-xl text-base" />
        </div>

        {members.length > 0 && (
          <div className="flex flex-col gap-3">
            <div>
              <span className="mb-2 block text-sm font-semibold">{t.whoPays}</span>
              <Segmented
                label={t.whoPaysAria}
                value={payer}
                onChange={setPayer}
                options={[
                  { value: 'household', label: t.household },
                  { value: 'personal', label: t.member },
                ]}
              />
            </div>
            {payer === 'personal' && (
              <>
                <div role="group" aria-label={t.memberAria} className="flex flex-wrap gap-2">
                  {members.map((p) => (
                    <ChipToggle key={p.id} pressed={ownerId === p.id} onClick={() => setOwnerId(p.id)}>
                      {p.name}
                    </ChipToggle>
                  ))}
                </div>
                <Segmented
                  label={t.visibility}
                  value={isPrivate ? 'private' : 'shared'}
                  onChange={(v) => setIsPrivate(v === 'private')}
                  options={[
                    { value: 'shared', label: t.shared },
                    { value: 'private', label: t.private },
                  ]}
                />
                <p className="text-xs text-muted-foreground">
                  {t.deducted(ownerName)}{' '}
                  {isPrivate
                    ? t.privateNote
                    : t.sharedNote}
                </p>
              </>
            )}
          </div>
        )}

        <div>
          <span className="mb-2 block text-sm font-semibold">{t.when}</span>
          <Segmented label={t.frequency} value={freq} options={freqOptions} onChange={setFreq} />
        </div>

        {editing ? (
          <p className="rounded-xl bg-muted/60 px-3.5 py-3 text-sm">
            {t.currentAmount(fmt(chargeBaseAmount(existing!, today)), freq === 'yearly')}
          </p>
        ) : (
          <div>
            <FieldLabel htmlFor="ch-amount">{freq === 'yearly' ? t.yearlyAmount : freq === 'once' ? t.amount : t.monthlyAmount}</FieldLabel>
            <MoneyInput id="ch-amount" value={amount} onChange={(e) => { setAmount(e.target.value); setError(''); }} placeholder="0" suffix={currencySymbol} />
          </div>
        )}

        {freq === 'custom' && (
          <div>
            <span className="mb-2 block text-sm font-semibold">
              {t.whichMonths} <span className="font-normal text-muted-foreground">{t.tapToRemove}</span>
            </span>
            <div role="group" aria-label={t.monthsAria} className="grid grid-cols-6 gap-1.5">
              {monthNamesShort().map((m, i) => {
                const on = months.includes(i + 1);
                return (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={on}
                    aria-label={monthNamesLower()[i]}
                    onClick={() => setMonths((prev) => (on ? prev.filter((x) => x !== i + 1) : [...prev, i + 1]))}
                    className={cn(
                      'min-h-[40px] rounded-lg border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      on ? 'border-sky-300 bg-sky-50 text-sky-900' : 'border-border bg-card text-muted-foreground line-through',
                    )}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <FieldLabel htmlFor="ch-start">{freq === 'once' ? t.month : freq === 'yearly' ? t.firstDue : t.from}</FieldLabel>
          <MonthPicker id="ch-start" value={start} onChange={(ym) => { setStart(ym); if (compareYM(end, ym) < 0) setEnd(addMonths(ym, 2)); }} ariaLabel={t.start} />
        </div>

        {freq === 'yearly' && (
          <button
            type="button"
            role="switch"
            aria-checked={smooth}
            onClick={() => setSmooth((s) => !s)}
            className="flex w-full items-center gap-3.5 rounded-xl border-[1.5px] border-border bg-card px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span aria-hidden="true" className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', smooth ? 'bg-primary' : 'bg-muted-foreground/30')}>
              <span className={cn('absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', smooth && 'translate-x-5')} />
            </span>
            <span className="flex flex-col">
              <span className="text-[15px] font-semibold">
                {Number.isFinite(value) && value > 0 ? t.setAside(fmt(value / 12)) : t.setAsideTwelfth}
              </span>
              <span className="text-sm text-muted-foreground">{t.recommended}</span>
            </span>
          </button>
        )}

        {freq !== 'once' && (
          <EndFields start={start} endMode={endMode} setEndMode={setEndMode} count={count} setCount={setCount} end={end} setEnd={setEnd} />
        )}

        <div>
          <span className="mb-2 block text-sm font-semibold">
            {t.category} {detecting && <span className="font-normal text-muted-foreground">{t.detecting}</span>}
          </span>
          <div role="group" aria-label={t.category} className="flex flex-wrap gap-1.5">
            {PICKER_CATEGORIES.map((cat) => (
              <ChipToggle key={cat.code} pressed={category === cat.code} onClick={() => { setCategory(cat.code); setCatTouched(true); }} className="min-h-[36px] px-3 text-[13px]">
                {cat.label}
              </ChipToggle>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="ch-desc" hint={t.optional}>{t.details}</FieldLabel>
          <Input id="ch-desc" autoComplete="off" value={description} maxLength={50} onChange={(e) => setDescription(e.target.value)} placeholder={t.detailsPlaceholder} className="h-12 rounded-xl text-base" />
        </div>

        <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-900">{t.inShort}</span>
          {!editing && <p className="mt-1 text-[15px] font-semibold text-foreground">{summary}</p>}
          {editing && <p className="mt-1 text-[15px] font-semibold text-foreground">{describeChargeSchedule(draft, today)}</p>}
          <p className="mt-1 text-sm text-sky-950">{impact}</p>
        </div>

        <ErrorText>{error}</ErrorText>
        <Button type="submit" className="min-h-[48px]" disabled={saving}>{saving ? t.saving : editing ? t.save : t.add}</Button>
      </form>
    </ResponsiveSheet>
  );
}
