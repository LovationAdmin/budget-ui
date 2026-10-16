// src/components/budget/sheets/SavingSheets.tsx
// Savings pots: month actions, amount changes with an explicit scope, money
// spent from a pot (including the general savings), create / edit and delete.

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, PauseCircle, Pencil, RotateCcw, Settings2, ShoppingBag, Sparkles, StopCircle, Trash2, Repeat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useBudget } from '@/contexts/BudgetContext';
import type { Project, YM } from '@/lib/budget/types';
import { GENERAL_SAVINGS_ID } from '@/lib/budget/types';
import {
  describeProjectSchedule,
  isRecurringProject,
  projectPlanned,
  projectStatus,
  resolveSaving,
  windowOf,
} from '@/lib/budget/engine';
import {
  convertSavingToMonthly,
  deleteProject,
  newId,
  setPotExpense,
  setSavingAmountEverywhere,
  setSavingAmountFrom,
  setSavingMonthAmount,
  stopProject,
  updateProject,
  upsertProject,
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
  monthsBetween,
  monthNames,
  startDateOf,
  deMonth,
} from '@/lib/budget/months';
import { parseAmount, roundCents } from '@/lib/budget/format';
import { ResponsiveSheet } from '../shared/ResponsiveSheet';
import { MonthPicker } from '../shared/MonthPicker';
import { ChoiceCard, ErrorText, failOn, FieldLabel, MoneyInput, Segmented } from '../shared/primitives';
import { computeEnd, EndFields } from './ChargeSheets';
import { useFirstOpenMonth } from '../shared/hooks';
import type { SheetProps } from './BudgetSheets';
import { defineMessages, useT } from '@/i18n/runtime';

const monthsEn = (n: number) => (n === 1 ? '1 month' : `${n} months`);

const M = defineMessages({
  fr: {
    quoted: (label: string) => `« ${label} »`,
    month: 'Mois',
    starting: 'À partir de',
    setAsideIn: (month: string) => `Mis de côté en ${month}`,
    amountPerMonth: 'Montant mis de côté chaque mois',
    editAmount: 'Modifier le montant',
    validAmount: 'Indiquez un montant valide (0 ou plus).',
    amountAbove0: 'Indiquez un montant supérieur à 0.',
    optional: '(optionnel)',
    actions: {
      nothing: 'rien',
      inPotEnd: (month: string) => `En caisse fin ${month} : `,
      ofTarget: (target: string) => ` sur un objectif de ${target}`,
      spentThisMonth: (amount: string) => ` · dépensé ce mois-ci : ${amount}`,
      adjusted: (planned: string) => `Prévu : ${planned} · ajusté ce mois-ci`,
      forMonthOrFrom: 'Pour ce mois seulement, ou à partir de ce mois',
      amountSetAsideIn: (month: string) => `Le montant mis de côté en ${month}`,
      skipTitle: (month: string) => `Ne rien mettre de côté en ${month}`,
      skipSub: 'Une exception : les autres mois ne changent pas',
      skipped: (label: string, month: string) => `Rien ne va dans « ${label} » en ${month}. Le reste du mois grossit d’autant.`,
      restoreTitle: (month: string) => `Rétablir en ${month}`,
      restoreSub: (amount: string) => `Remet ${amount} de côté ce mois-ci`,
      restored: (label: string, month: string) => `« ${label} » rétablie en ${month}.`,
      spendTitle: 'Payer une dépense avec cette épargne',
      spendSub: 'Ex. : les vacances payées avec la cagnotte',
      stopTitle: (month: string) => `Arrêter après ${month}`,
      stopSub: 'Son solde reste disponible pour vos dépenses',
      stopped: (label: string, month: string) => `« ${label} » s’arrête après ${month}. Son solde reste disponible.`,
      settings: 'Réglages',
      settingsSub: 'Nom, objectif, dates',
      delete: 'Supprimer',
      deleteSub: 'Les mois clôturés la gardent',
    },
    amount: {
      closedChooseOpen: (month: string) => `${month} est clôturé : choisissez un mois ouvert.`,
      savedIn: (amount: string, label: string, month: string) => `${amount} mis de côté dans « ${label} » en ${month}.`,
      nothingIn: (label: string, month: string) => `Rien dans « ${label} » en ${month}.`,
      converted: (label: string, amount: string, month: string) => `« ${label} » : ${amount} chaque mois à partir ${deMonth(month)}.`,
      freeDescription: 'Épargne libre : vous choisissez le montant mois par mois.',
      saveFor: (month: string) => `Enregistrer pour ${month}`,
      convertTitle: (month: string) => `Mettre ce montant chaque mois à partir ${deMonth(month)}`,
      convertHelp: 'Elle devient une épargne mensuelle. Les montants déjà prévus avant restent.',
      monthOnlyDone: (label: string, amount: string, month: string) => `« ${label} » : ${amount} en ${month} seulement.`,
      forwardDone: (label: string, amount: string, month: string) =>
        `« ${label} » : ${amount} par mois à partir ${deMonth(month)}. Les mois d’avant gardent leur montant.`,
      allDone: (label: string) => `« ${label} » corrigée sur tous les mois ouverts. Les mois clôturés ne bougent pas.`,
      editTitle: (label: string) => `Modifier « ${label} »`,
      currently: (amount: string) => `Actuellement : ${amount}`,
      applyTo: 'Appliquer ce montant à…',
      only: (month: string) => `${month} seulement`,
      onlyHelp: (amount: string) => `Une exception : les autres mois restent à ${amount}.`,
      fromOn: (month: string) => `À partir ${deMonth(month)}`,
      earlierKeep: (amount: string) => `Les mois d’avant gardent ${amount}.`,
      fromFirst: 'S’applique dès le premier mois.',
      fixAll: 'Corriger une erreur de saisie sur tous les mois ouverts',
    },
    spend: {
      generalSavings: 'Épargne générale',
      closedChooseOrReopen: (month: string) => `${month} est clôturé : choisissez un mois ouvert ou rouvrez-le.`,
      paid: (amount: string, label: string, month: string) => `${amount} payés avec « ${label} » en ${month}.`,
      title: 'Dépense payée par une épargne',
      description: 'L’argent sort de la cagnotte choisie, pas du budget du mois.',
      which: 'Quelle épargne ?',
      whichAria: 'Épargne utilisée',
      inPot: (amount: string) => `En caisse : ${amount}`,
      monthAria: 'Mois de la dépense',
      isClosed: (month: string) => `${month} est clôturé.`,
      reopen: 'Le rouvrir',
      amount: 'Montant',
      leftIn: (label: string, amount: string) => `Reste dans « ${label} » : ${amount}`,
      inTheRed: ' — la cagnotte passera dans le rouge.',
      whatFor: 'Pour quoi ?',
      placeholder: 'Ex. : location de vacances, réparation…',
      already: (amount: string, month: string, comment: string) =>
        `Déjà ${amount} payés avec cette épargne en ${month}${comment ? ` (${comment})` : ''}. Le nouveau montant s’y ajoute.`,
      remove: 'Retirer',
      removed: (month: string, label: string) => `Dépense ${deMonth(month)} retirée de « ${label} ».`,
      save: 'Enregistrer la dépense',
    },
    editor: {
      freeSummary: 'Vous choisissez le montant chaque mois, directement dans la vue Mois.',
      blankAmount: (symbol: string) => `… ${symbol}`,
      summary: (amount: string, start: string, end?: { month: string; n: number; total?: string }) =>
        `${amount} mis de côté chaque mois, à partir ${deMonth(start)}` +
        (end ? ` jusqu’en ${end.month} (${end.n} mois${end.total ? `, soit ${end.total}` : ''}).` : ', sans date de fin.'),
      shortfall: (amount: string) => `L’échéance arrive avant l’objectif : il manquera ${amount}.`,
      reached: (target: string, month: string) => `Objectif de ${target} atteint en ${month} si rien n’est dépensé.`,
      impactEditing: 'Les mois clôturés ne changent pas ; les mois ouverts suivent les nouveaux réglages.',
      impactFree: 'Rien n’est mis de côté tant que vous n’indiquez pas de montant.',
      impactNow: (month: string, amount: string) => `En ${month} : ${amount} mis de côté, le reste du pot baisse d’autant.`,
      impactLater: (month: string, start: string) => `Rien en ${month} : premier versement en ${start}.`,
      nameRequired: 'Donnez un nom (ex. : Vacances, Voiture, Coup dur…).',
      targetInvalid: 'L’objectif doit être un montant supérieur à 0.',
      amountOrUntil: 'Indiquez le montant mis de côté chaque mois, ou une date « Jusqu’à… » pour le calculer depuis l’objectif.',
      amountRequired: 'Indiquez le montant mis de côté chaque mois.',
      endBeforeStart: 'La fin doit venir après le début.',
      updated: (name: string) => `« ${name} » mise à jour.`,
      added: (name: string) => `« ${name} » ajoutée à vos épargnes.`,
      aiGoal: (target: string, name: string, end?: { month: string; n: number }) =>
        `Objectif prioritaire : réunir ${target} pour « ${name} »${end ? ` d’ici ${end.month} (${end.n} mois)` : ''}. Aidez-nous à répartir l’effort entre les membres et à trouver où dégager l’argent si le budget ne suffit pas.`,
      aiNew: (name: string) => `Nouvelle épargne « ${name} » : aidez-nous à trouver un rythme réaliste.`,
      settingsTitle: (label: string) => `Réglages de « ${label} »`,
      newTitle: 'Nouvelle épargne',
      name: 'Nom',
      namePlaceholder: 'Ex. : Vacances, Voiture, Coup dur…',
      target: 'Objectif',
      targetPlaceholder: 'Ex. : 3 000',
      currentAmount: (amount: ReactNode): ReactNode => (
        <>Montant actuel : {amount} par mois. Pour le changer sans toucher au passé, utilisez « Modifier le montant ».</>
      ),
      freeNote: 'Épargne libre : le montant se choisit mois par mois. Vous pouvez la passer en montant mensuel depuis « Modifier le montant ».',
      howFund: 'Comment l’alimenter ?',
      kindLabel: 'Type d’épargne',
      kindMonthly: 'Chaque mois',
      kindFree: 'Montant libre',
      startAria: 'Début',
      planHint: (target: string, n: number, monthly: ReactNode): ReactNode => <>Pour réunir {target} en {n} mois : {monthly} par mois.</>,
      useAmount: 'Utiliser ce montant',
      chooseEnd: 'Choisissez « Pendant… » ou « Jusqu’à… » ci-dessus : le montant mensuel se calculera depuis l’objectif.',
      inShort: 'En clair',
      feasibleOk: (least: string, month: string) =>
        `Le pot commun peut suivre : sur la période, il reste au moins ${least} chaque mois (le plus serré : ${month}).`,
      feasibleNo: (month: string, left: string, amount: string, gap: string) =>
        `Le pot commun ne suit pas : en ${month}, il ne reste que ${left} pour ${amount} à mettre de côté. Il manque jusqu’à ${gap} par mois : l’épargne générale comblerait la différence tant qu’elle le peut.`,
      createSplit: 'Créer et ajuster les contributions',
      createAi: 'Créer et demander un plan au Budget IA',
      save: 'Enregistrer',
      create: 'Créer l’épargne',
    },
    remove: {
      deleted: (label: string) => `« ${label} » supprimée. Les mois clôturés la gardent.`,
      title: (label: string) => `Supprimer « ${label} » ?`,
      closedKeep: (n: number, range: string) => `Les ${n} mois clôturés où elle apparaît (${range}) la gardent : leur photo est figée.`,
      notInClosed: 'Elle n’apparaît dans aucun mois clôturé.',
      balance: (amount: string) => `Son solde (${amount}) ne sera plus suivi. `,
      recurringNote:
        'Les mois ouverts ne mettent plus rien de côté pour elle : ce montant revient dans l’épargne générale. Pour simplement arrêter les versements, utilisez plutôt « Arrêter ».',
      freeNote: 'Les montants prévus dans les mois ouverts reviennent dans l’épargne générale.',
      cancel: 'Annuler',
      delete: 'Supprimer',
    },
  },
  en: {
    quoted: (label: string) => `“${label}”`,
    month: 'Month',
    starting: 'Starting',
    setAsideIn: (month: string) => `Set aside in ${month}`,
    amountPerMonth: 'Amount set aside each month',
    editAmount: 'Edit amount',
    validAmount: 'Enter a valid amount (0 or more).',
    amountAbove0: 'Enter an amount above 0.',
    optional: '(optional)',
    actions: {
      nothing: 'nothing',
      inPotEnd: (month: string) => `In the pot at the end of ${month}: `,
      ofTarget: (target: string) => ` of a ${target} target`,
      spentThisMonth: (amount: string) => ` · spent this month: ${amount}`,
      adjusted: (planned: string) => `Planned: ${planned} · adjusted this month`,
      forMonthOrFrom: 'For this month only, or from this month on',
      amountSetAsideIn: (month: string) => `The amount set aside in ${month}`,
      skipTitle: (month: string) => `Set nothing aside in ${month}`,
      skipSub: 'An exception: the other months don’t change',
      skipped: (label: string, month: string) => `Nothing goes into “${label}” in ${month}. What’s left for the month goes up by the same amount.`,
      restoreTitle: (month: string) => `Resume in ${month}`,
      restoreSub: (amount: string) => `Sets ${amount} aside again this month`,
      restored: (label: string, month: string) => `“${label}” resumed in ${month}.`,
      spendTitle: 'Pay an expense from this pot',
      spendSub: 'E.g. holidays paid from the pot',
      stopTitle: (month: string) => `Stop after ${month}`,
      stopSub: 'Its balance stays available for your expenses',
      stopped: (label: string, month: string) => `“${label}” stops after ${month}. Its balance stays available.`,
      settings: 'Settings',
      settingsSub: 'Name, target, dates',
      delete: 'Delete',
      deleteSub: 'Closed months keep it',
    },
    amount: {
      closedChooseOpen: (month: string) => `${month} is closed: choose an open month.`,
      savedIn: (amount: string, label: string, month: string) => `${amount} set aside for “${label}” in ${month}.`,
      nothingIn: (label: string, month: string) => `Nothing set aside for “${label}” in ${month}.`,
      converted: (label: string, amount: string, month: string) => `“${label}”: ${amount} every month from ${month}.`,
      freeDescription: 'Flexible savings: you choose the amount month by month.',
      saveFor: (month: string) => `Save for ${month}`,
      convertTitle: (month: string) => `Set this amount aside every month from ${month}`,
      convertHelp: 'It becomes monthly savings. Amounts already planned for earlier months stay.',
      monthOnlyDone: (label: string, amount: string, month: string) => `“${label}”: ${amount} in ${month} only.`,
      forwardDone: (label: string, amount: string, month: string) =>
        `“${label}”: ${amount} a month from ${month}. Earlier months keep their amount.`,
      allDone: (label: string) => `“${label}” corrected in every open month. Closed months don’t change.`,
      editTitle: (label: string) => `Edit “${label}”`,
      currently: (amount: string) => `Currently: ${amount}`,
      applyTo: 'Apply this amount to…',
      only: (month: string) => `${month} only`,
      onlyHelp: (amount: string) => `An exception: the other months stay at ${amount}.`,
      fromOn: (month: string) => `From ${month} on`,
      earlierKeep: (amount: string) => `Earlier months keep ${amount}.`,
      fromFirst: 'Applies from the first month.',
      fixAll: 'Fix a typing mistake in every open month',
    },
    spend: {
      generalSavings: 'General savings',
      closedChooseOrReopen: (month: string) => `${month} is closed: choose an open month or reopen it.`,
      paid: (amount: string, label: string, month: string) => `${amount} paid from “${label}” in ${month}.`,
      title: 'Expense paid from savings',
      description: 'The money comes out of the chosen pot, not out of the month’s budget.',
      which: 'Which savings?',
      whichAria: 'Savings used',
      inPot: (amount: string) => `In the pot: ${amount}`,
      monthAria: 'Month of the expense',
      isClosed: (month: string) => `${month} is closed.`,
      reopen: 'Reopen it',
      amount: 'Amount',
      leftIn: (label: string, amount: string) => `Left in “${label}”: ${amount}`,
      inTheRed: ' — the pot will go into the red.',
      whatFor: 'What for?',
      placeholder: 'E.g. holiday rental, repairs…',
      already: (amount: string, month: string, comment: string) =>
        `Already ${amount} paid from these savings in ${month}${comment ? ` (${comment})` : ''}. The new amount is added to it.`,
      remove: 'Remove',
      removed: (month: string, label: string) => `${month} expense removed from “${label}”.`,
      save: 'Save expense',
    },
    editor: {
      freeSummary: 'You choose the amount each month, right in the Month view.',
      blankAmount: (symbol: string) => ([...symbol].length === 1 ? `${symbol}…` : `… ${symbol}`),
      summary: (amount: string, start: string, end?: { month: string; n: number; total?: string }) =>
        `${amount} set aside every month, from ${start}` +
        (end ? ` until ${end.month} (${monthsEn(end.n)}${end.total ? `, ${end.total} in all` : ''}).` : ', with no end date.'),
      shortfall: (amount: string) => `The target date comes first: you’ll be ${amount} short of the target.`,
      reached: (target: string, month: string) => `${target} target reached in ${month} if nothing is spent.`,
      impactEditing: 'Closed months don’t change; open months follow the new settings.',
      impactFree: 'Nothing is set aside until you enter an amount.',
      impactNow: (month: string, amount: string) => `In ${month}: ${amount} set aside, and what’s left in the pot goes down by the same amount.`,
      impactLater: (month: string, start: string) => `Nothing in ${month}: saving starts in ${start}.`,
      nameRequired: 'Give it a name (e.g. Holidays, Car, Emergency fund…).',
      targetInvalid: 'The target must be an amount above 0.',
      amountOrUntil: 'Enter the amount set aside each month, or an “Until…” date to work it out from the target.',
      amountRequired: 'Enter the amount set aside each month.',
      endBeforeStart: 'The end must come after the start.',
      updated: (name: string) => `“${name}” updated.`,
      added: (name: string) => `“${name}” added to your savings.`,
      aiGoal: (target: string, name: string, end?: { month: string; n: number }) =>
        `Top goal: save ${target} for “${name}”${end ? ` by ${end.month} (${monthsEn(end.n)})` : ''}. Help us share the effort between members and find where the money can come from if the budget isn’t enough.`,
      aiNew: (name: string) => `New savings pot “${name}”: help us find a realistic pace.`,
      settingsTitle: (label: string) => `“${label}” settings`,
      newTitle: 'New savings pot',
      name: 'Name',
      namePlaceholder: 'E.g. Holidays, Car, Emergency fund…',
      target: 'Target',
      targetPlaceholder: 'E.g. 3,000',
      currentAmount: (amount: ReactNode): ReactNode => (
        <>Current amount: {amount} a month. To change it without touching the past, use “Edit amount”.</>
      ),
      freeNote: 'Flexible savings: the amount is chosen month by month. You can switch it to a monthly amount from “Edit amount”.',
      howFund: 'How will you fill it?',
      kindLabel: 'Type of savings',
      kindMonthly: 'Every month',
      kindFree: 'Any amount',
      startAria: 'Start',
      planHint: (target: string, n: number, monthly: ReactNode): ReactNode => <>To save {target} in {monthsEn(n)}: {monthly} a month.</>,
      useAmount: 'Use this amount',
      chooseEnd: 'Choose “For…” or “Until…” above: the monthly amount will be worked out from the target.',
      inShort: 'In short',
      feasibleOk: (least: string, month: string) =>
        `The joint pot can keep up: over the period, at least ${least} is left every month (the tightest: ${month}).`,
      feasibleNo: (month: string, left: string, amount: string, gap: string) =>
        `The joint pot can’t keep up: in ${month}, only ${left} is left for ${amount} to set aside. Up to ${gap} a month is missing: general savings would make up the difference for as long as it can.`,
      createSplit: 'Create and adjust contributions',
      createAi: 'Create and ask the AI budget for a plan',
      save: 'Save',
      create: 'Create savings pot',
    },
    remove: {
      deleted: (label: string) => `“${label}” deleted. Closed months keep it.`,
      title: (label: string) => `Delete “${label}”?`,
      closedKeep: (n: number, range: string) =>
        n === 1
          ? `The closed month where it appears (${range}) keeps it: its snapshot is frozen.`
          : `The ${n} closed months where it appears (${range}) keep it: their snapshot is frozen.`,
      notInClosed: 'It doesn’t appear in any closed month.',
      balance: (amount: string) => `Its balance (${amount}) will no longer be tracked. `,
      recurringNote:
        'Open months no longer set anything aside for it: that amount goes back to general savings. To simply stop setting money aside, use “Stop” instead.',
      freeNote: 'Amounts planned in open months go back to general savings.',
      cancel: 'Cancel',
      delete: 'Delete',
    },
  },
});

function useProject(id: string): Project | undefined {
  const { model } = useBudget();
  return model.projects.find((p) => p.id === id && p.id !== GENERAL_SAVINGS_ID);
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
// Actions on a saving, from a month
// ---------------------------------------------------------------------------
export function SavingActionsSheet({ sheet, onClose }: SheetProps<'saving'>) {
  const { fmt, openSheet, commit, engine, today } = useBudget();
  const t = useT(M);
  const a = t.actions;
  const p = useProject(sheet.id);
  if (!p) return null;
  const recurring = isRecurringProject(p);
  const s = engine.month(sheet.ym).savings.find((x) => x.id === p.id);
  const month = formatMonthLong(sheet.ym);
  const balance = engine.savingBalance(p.id, sheet.ym);
  const status = projectStatus(p, today);
  const target = Number(p.targetAmount) || 0;

  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={p.label} description={describeProjectSchedule(p, today)}>
      <div className="flex items-baseline justify-between gap-3 rounded-xl bg-indigo-50/70 px-4 py-3">
        <span className="text-sm text-foreground/80">{t.setAsideIn(month)}</span>
        <span className="font-display text-2xl font-extrabold tabular-nums">{s ? (s.skipped ? a.nothing : fmt(s.allocation)) : '—'}</span>
      </div>
      <p className="-mt-2 text-sm text-muted-foreground">
        {a.inPotEnd(formatMonthShort(sheet.ym))}<strong className="text-foreground">{fmt(balance)}</strong>
        {target > 0 ? a.ofTarget(fmt(target)) : ''}
        {s && s.spent > 0 ? a.spentThisMonth(fmt(s.spent)) : ''}
      </p>
      {s?.adjusted && <p className="-mt-3 text-sm text-amber-800">{a.adjusted(fmt(s.planned))}</p>}

      <div className="flex flex-col gap-2">
        <ActionItem
          icon={<Pencil />}
          title={t.editAmount}
          sub={recurring ? a.forMonthOrFrom : a.amountSetAsideIn(month)}
          onClick={() => openSheet({ kind: 'savingAmount', id: p.id, ym: sheet.ym })}
        />
        {recurring && s && !s.skipped && s.allocation > 0 && (
          <ActionItem
            icon={<PauseCircle />}
            title={a.skipTitle(month)}
            sub={a.skipSub}
            onClick={() => {
              commit((m) => setSavingMonthAmount(m, p.id, sheet.ym, 0), {
                message: a.skipped(p.label, month),
              });
              onClose();
            }}
          />
        )}
        {recurring && s?.skipped && (
          <ActionItem
            icon={<RotateCcw />}
            title={a.restoreTitle(month)}
            sub={a.restoreSub(fmt(s.planned))}
            onClick={() => {
              commit((m) => setSavingMonthAmount(m, p.id, sheet.ym, null), { message: a.restored(p.label, month) });
              onClose();
            }}
          />
        )}
        <ActionItem
          icon={<ShoppingBag />}
          title={a.spendTitle}
          sub={a.spendSub}
          onClick={() => openSheet({ kind: 'spend', ym: sheet.ym, potId: p.id })}
        />
        {recurring && status !== 'ended' && (
          <ActionItem
            icon={<StopCircle />}
            title={a.stopTitle(month)}
            sub={a.stopSub}
            onClick={() => {
              commit((m) => stopProject(m, p.id, sheet.ym), {
                message: a.stopped(p.label, month),
              });
              onClose();
            }}
          />
        )}
        <ActionItem icon={<Settings2 />} title={a.settings} sub={a.settingsSub} onClick={() => openSheet({ kind: 'savingEditor', id: p.id, ym: sheet.ym })} />
        <ActionItem danger icon={<Trash2 />} title={a.delete} sub={a.deleteSub} onClick={() => openSheet({ kind: 'savingDelete', id: p.id })} />
      </div>
    </ResponsiveSheet>
  );
}

// ---------------------------------------------------------------------------
// Amount change
// ---------------------------------------------------------------------------
export function SavingAmountSheet({ sheet, onClose }: SheetProps<'savingAmount'>) {
  const { fmt, commit, today, model, engine, currencySymbol } = useBudget();
  const t = useT(M);
  const a = t.amount;
  const p = useProject(sheet.id);
  const firstOpen = useFirstOpenMonth(today);
  const recurring = p ? isRecurringProject(p) : false;
  const start = p ? windowOf(p).start : undefined;
  const minFrom = maxYM(firstOpen, recurring && start ? start : firstOpen);
  const [fromYm, setFromYm] = useState<YM>(sheet.fromCatalog ? maxYM(sheet.ym, minFrom) : sheet.ym);
  const resolved = p ? resolveSaving(p, fromYm, model.months[fromYm]) : null;
  const initial = !p ? 0 : recurring ? (sheet.fromCatalog || !resolved ? projectPlanned(p, fromYm) : resolved.allocation) : resolved?.allocation ?? 0;
  const [value, setValue] = useState(String(initial || ''));
  const [error, setError] = useState('');
  useEffect(() => setValue(String(initial || '')), [fromYm]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!p) return null;

  const monthLabel = formatMonthLong(fromYm);
  const v = parseAmount(value === '' ? '0' : value);
  const valid = Number.isFinite(v) && v >= 0;
  const closed = engine.isClosed(fromYm);

  if (!recurring) {
    const submit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!valid) return failOn('sa-amount', setError, t.validAmount);
      if (closed) return setError(a.closedChooseOpen(formatMonthTitle(fromYm)));
      commit((m) => setSavingMonthAmount(m, p.id, fromYm, v), {
        message: v > 0 ? a.savedIn(fmt(v), p.label, monthLabel) : a.nothingIn(p.label, monthLabel),
      });
      onClose();
    };
    const convert = () => {
      if (!valid || v <= 0) return failOn('sa-amount', setError, t.amountAbove0);
      commit((m) => convertSavingToMonthly(m, p.id, fromYm, v, today, (ym) => engine.isClosed(ym)), {
        message: a.converted(p.label, fmt(v), monthLabel),
      });
      onClose();
    };
    return (
      <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={t.quoted(p.label)} description={a.freeDescription}>
        <form onSubmit={submit} className="flex flex-col gap-4">
          {sheet.fromCatalog && (
            <div>
              <FieldLabel htmlFor="sa-month">{t.month}</FieldLabel>
              <MonthPicker id="sa-month" value={fromYm} onChange={setFromYm} min={firstOpen} ariaLabel={t.month} />
            </div>
          )}
          <div>
            <FieldLabel htmlFor="sa-amount">{t.setAsideIn(monthLabel)}</FieldLabel>
            <MoneyInput id="sa-amount" big value={value} onChange={(e) => { setValue(e.target.value); setError(''); }} placeholder="0" suffix={currencySymbol} />
          </div>
          <ErrorText>{error}</ErrorText>
          <Button type="submit" className="min-h-[48px]">{a.saveFor(monthLabel)}</Button>
          <ChoiceCard
            icon={<Repeat />}
            title={a.convertTitle(formatMonthShort(fromYm))}
            help={a.convertHelp}
            onClick={convert}
          />
        </form>
      </ResponsiveSheet>
    );
  }

  const r = resolveSaving(p, fromYm, model.months[fromYm]);
  const canMonthOnly = !sheet.fromCatalog && !!r && r.active && !closed;
  const prevAmount = start && compareYM(start, fromYm) >= 0 ? null : projectPlanned(p, addMonths(fromYm, -1));
  const apply = (scope: 'month' | 'forward' | 'all') => {
    if (!valid) return failOn('sa-amount', setError, t.validAmount);
    if (scope === 'month') {
      commit((m) => setSavingMonthAmount(m, p.id, fromYm, v), { message: a.monthOnlyDone(p.label, fmt(v), monthLabel) });
    } else if (scope === 'forward') {
      commit((m) => setSavingAmountFrom(m, p.id, fromYm, v, today), {
        message: a.forwardDone(p.label, fmt(v), monthLabel),
      });
    } else {
      commit((m) => setSavingAmountEverywhere(m, p.id, v), { message: a.allDone(p.label) });
    }
    onClose();
  };

  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={a.editTitle(p.label)} description={describeProjectSchedule(p, today)}>
      {sheet.fromCatalog && (
        <div>
          <FieldLabel htmlFor="sa-from">{t.starting}</FieldLabel>
          <MonthPicker id="sa-from" value={fromYm} onChange={setFromYm} min={minFrom} ariaLabel={t.starting} />
        </div>
      )}
      <div>
        <FieldLabel htmlFor="sa-amount">{t.amountPerMonth}</FieldLabel>
        <MoneyInput id="sa-amount" big value={value} onChange={(e) => { setValue(e.target.value); setError(''); }} placeholder="0" suffix={currencySymbol} />
        <p className="mt-1.5 text-sm text-muted-foreground">{a.currently(fmt(initial))}</p>
        <div className="mt-2"><ErrorText>{error}</ErrorText></div>
      </div>
      <div className="flex flex-col gap-2">
        {!sheet.fromCatalog && <span className="text-sm font-semibold">{a.applyTo}</span>}
        {canMonthOnly && (
          <ChoiceCard title={a.only(monthNames()[monthIndex0(fromYm)])} help={a.onlyHelp(fmt(r!.planned))} onClick={() => apply('month')} />
        )}
        <ChoiceCard
          title={a.fromOn(formatMonthShort(fromYm))}
          help={prevAmount !== null ? a.earlierKeep(fmt(prevAmount)) : a.fromFirst}
          onClick={() => apply('forward')}
          selected={sheet.fromCatalog}
        />
        <button type="button" onClick={() => apply('all')} className="self-start py-2 text-sm font-semibold text-primary underline underline-offset-4 hover:text-primary/80">
          {a.fixAll}
        </button>
      </div>
    </ResponsiveSheet>
  );
}

// ---------------------------------------------------------------------------
// Money spent from a pot
// ---------------------------------------------------------------------------
export function SpendSheet({ sheet, onClose }: SheetProps<'spend'>) {
  const { fmt, commit, engine, model, currencySymbol, openSheet } = useBudget();
  const t = useT(M);
  const a = t.spend;
  const [ym, setYm] = useState<YM>(sheet.ym);
  const [potId, setPotId] = useState<string>(sheet.potId ?? GENERAL_SAVINGS_ID);
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');

  const pots = useMemo(() => {
    const list = model.projects
      .filter((p) => p.id !== GENERAL_SAVINGS_ID)
      .map((p) => ({ id: p.id, label: p.label, balance: engine.savingBalance(p.id, ym), status: projectStatus(p, ym) }))
      .filter((p) => p.id === potId || p.status !== 'ended' || p.balance > 0);
    return [...list, { id: GENERAL_SAVINGS_ID, label: a.generalSavings, balance: engine.generalBalance(ym), status: 'active' as const }];
  }, [model.projects, engine, ym, potId, a]);

  const pot = pots.find((p) => p.id === potId) ?? pots[pots.length - 1];
  const rec = model.months[ym];
  const existing = roundCents(rec?.expenses?.[pot.id] ?? 0);
  const existingComment = rec?.expenseComments?.[pot.id] ?? '';
  const closed = engine.isClosed(ym);
  const v = parseAmount(amount);
  const after = Number.isFinite(v) ? pot.balance - v : pot.balance;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!Number.isFinite(v) || v <= 0) return failOn('sp-amount', setError, t.amountAbove0);
    if (closed) return setError(a.closedChooseOrReopen(formatMonthTitle(ym)));
    const total = roundCents(existing + v);
    const comment = [existingComment, label.trim()].filter(Boolean).join(' · ');
    commit((m) => setPotExpense(m, pot.id, ym, total, comment), {
      message: a.paid(fmt(v), pot.label, formatMonthLong(ym)),
    });
    onClose();
  };

  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={a.title} description={a.description}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <span className="mb-2 block text-sm font-semibold">{a.which}</span>
          <div role="radiogroup" aria-label={a.whichAria} className="flex flex-col gap-2">
            {pots.map((p) => (
              <ChoiceCard
                key={p.id}
                role="radio"
                selected={p.id === pot.id}
                onClick={() => { setPotId(p.id); setError(''); }}
                title={p.label}
                help={a.inPot(fmt(p.balance))}
              />
            ))}
          </div>
        </div>
        <div>
          <FieldLabel htmlFor="sp-month">{t.month}</FieldLabel>
          <MonthPicker id="sp-month" value={ym} onChange={(x) => { setYm(x); setError(''); }} ariaLabel={a.monthAria} />
          {closed && (
            <p className="mt-2 text-sm text-orange-900">
              {a.isClosed(formatMonthTitle(ym))}{' '}
              <button type="button" className="font-semibold underline underline-offset-2" onClick={() => openSheet({ kind: 'reopen', ym })}>
                {a.reopen}
              </button>
            </p>
          )}
        </div>
        <div>
          <FieldLabel htmlFor="sp-amount">{a.amount}</FieldLabel>
          <MoneyInput id="sp-amount" value={amount} onChange={(e) => { setAmount(e.target.value); setError(''); }} placeholder="0" suffix={currencySymbol} />
          {Number.isFinite(v) && v > 0 && (
            <p className={cn('mt-1.5 text-sm', after < 0 ? 'text-orange-900' : 'text-muted-foreground')}>
              {a.leftIn(pot.label, fmt(after))}
              {after < 0 ? a.inTheRed : ''}
            </p>
          )}
        </div>
        <div>
          <FieldLabel htmlFor="sp-label" hint={t.optional}>{a.whatFor}</FieldLabel>
          <Input id="sp-label" autoComplete="off" value={label} maxLength={80} onChange={(e) => setLabel(e.target.value)} placeholder={a.placeholder} className="h-12 rounded-xl text-base" />
        </div>
        {existing > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3.5 py-3 text-sm">
            <span className="flex-1">
              {a.already(fmt(existing), formatMonthLong(ym), existingComment)}
            </span>
            {!closed && (
              <button
                type="button"
                className="py-1 text-sm font-semibold text-primary underline underline-offset-4"
                onClick={() => commit((m) => setPotExpense(m, pot.id, ym, 0, ''), { message: a.removed(formatMonthLong(ym), pot.label) })}
              >
                {a.remove}
              </button>
            )}
          </div>
        )}
        <ErrorText>{error}</ErrorText>
        <Button type="submit" className="min-h-[48px]">{a.save}</Button>
      </form>
    </ResponsiveSheet>
  );
}

// ---------------------------------------------------------------------------
// Create / edit
// ---------------------------------------------------------------------------
type EndMode = 'none' | 'count' | 'until';
type SavingKind = 'monthly' | 'free';

export function SavingEditorSheet({ sheet, onClose }: SheetProps<'savingEditor'>) {
  const { fmt, commit, today, currencySymbol, engine, budgetId } = useBudget();
  const t = useT(M);
  const a = t.editor;
  const navigate = useNavigate();
  const existing = useProject(sheet.id ?? '');
  const editing = !!existing;
  const w = existing ? windowOf(existing) : {};
  const defaultStart = compareYM(sheet.ym, today) < 0 ? today : sheet.ym;
  const existingKind: SavingKind = existing && !isRecurringProject(existing) ? 'free' : 'monthly';

  const [label, setLabel] = useState(existing?.label ?? '');
  const [kind, setKind] = useState<SavingKind>(existingKind);
  const [amount, setAmount] = useState('');
  // Until the amount is typed, it follows the goal: target ÷ months to the end.
  const [amountTouched, setAmountTouched] = useState(false);
  const [target, setTarget] = useState(existing?.targetAmount ? String(existing.targetAmount) : '');
  const [start, setStart] = useState<YM>(w.start ?? defaultStart);
  const [endMode, setEndMode] = useState<EndMode>(w.end ? 'until' : 'none');
  const [count, setCount] = useState('12');
  const [end, setEnd] = useState<YM>(w.end ?? addMonths(w.start ?? defaultStart, 11));
  const [error, setError] = useState('');

  const targetValue = parseAmount(target);
  const hasTarget = Number.isFinite(targetValue) && targetValue > 0;
  const endYm = kind === 'monthly' ? computeEnd(start, endMode, count, end) : undefined;
  const planMonths = hasTarget && endYm && compareYM(endYm, start) >= 0 ? monthsBetween(start, endYm) : 0;
  const planMonthly = planMonths > 0 ? Math.ceil(targetValue / planMonths) : 0;
  const shownAmount = !editing && !amountTouched && planMonthly > 0 ? String(planMonthly) : amount;
  const value = parseAmount(shownAmount);
  const monthlyAmount = editing && existingKind === 'monthly' ? projectPlanned(existing!, maxYM(today, start)) : value;
  const amountOk = Number.isFinite(monthlyAmount) && monthlyAmount > 0;

  let summary: string;
  if (kind === 'free') {
    summary = a.freeSummary;
  } else {
    const amountText = amountOk ? fmt(monthlyAmount) : a.blankAmount(currencySymbol);
    if (endYm) {
      const n = monthsBetween(start, endYm);
      summary = a.summary(amountText, formatMonthLong(start), { month: formatMonthLong(endYm), n, total: amountOk ? fmt(monthlyAmount * n) : undefined });
    } else summary = a.summary(amountText, formatMonthLong(start));
  }
  let goal = '';
  if (kind === 'monthly' && hasTarget && amountOk) {
    const n = Math.ceil(targetValue / monthlyAmount);
    const reach = addMonths(start, n - 1);
    goal = endYm && compareYM(reach, endYm) > 0
      ? a.shortfall(fmt(targetValue - monthlyAmount * monthsBetween(start, endYm)))
      : a.reached(fmt(targetValue), formatMonthLong(reach));
  }
  const impact = editing
    ? a.impactEditing
    : kind === 'free'
      ? a.impactFree
      : !amountOk
        ? ''
        : compareYM(sheet.ym, start) >= 0 && (!endYm || compareYM(sheet.ym, endYm) <= 0)
          ? a.impactNow(formatMonthLong(sheet.ym), fmt(monthlyAmount))
          : a.impactLater(formatMonthLong(sheet.ym), formatMonthLong(start));

  // Can the pot keep this pace? Compare with what each month of the period
  // leaves today (before this saving): the tightest month decides.
  const feasibility = useMemo(() => {
    if (editing || kind !== 'monthly' || !amountOk) return null;
    const last = endYm ?? addMonths(start, 11);
    let worst: { ym: YM; reste: number } | null = null;
    for (let ym = start, i = 0; compareYM(ym, last) <= 0 && i < 60; ym = addMonths(ym, 1), i++) {
      const reste = engine.month(ym).totals.reste;
      if (!worst || reste < worst.reste) worst = { ym, reste };
    }
    if (!worst) return null;
    return { worst, shortfall: roundCents(monthlyAmount - worst.reste) };
  }, [editing, kind, amountOk, endYm, start, engine, monthlyAmount]);

  const submit = (e: React.FormEvent, then?: 'ai' | 'split') => {
    e.preventDefault();
    if (!label.trim()) return failOn('sv-label', setError, a.nameRequired);
    if (target.trim() && !hasTarget) return failOn('sv-target', setError, a.targetInvalid);
    if (kind === 'monthly' && !editing && !amountOk) return failOn('sv-amount', setError, hasTarget ? a.amountOrUntil : a.amountRequired);
    if (endYm && compareYM(endYm, start) < 0) return setError(a.endBeforeStart);
    const name = label.trim();
    if (editing) {
      const patch: Partial<Project> = { label: name, targetAmount: hasTarget ? roundCents(targetValue) : undefined };
      if (existingKind === 'monthly') {
        patch.startDate = startDateOf(start);
        patch.endDate = endYm ? endDateOf(endYm) : undefined;
      }
      commit((m) => updateProject(m, existing!.id, patch), { message: a.updated(name) });
    } else {
      const project: Project = { id: newId('p'), label: name };
      if (hasTarget) project.targetAmount = roundCents(targetValue);
      if (kind === 'monthly') {
        project.monthlyAmount = roundCents(value);
        project.startDate = startDateOf(start);
        if (endYm) project.endDate = endDateOf(endYm);
      }
      commit((m) => upsertProject(m, project), { message: a.added(name), saveNow: !!then });
    }
    onClose();
    // The split assistant then includes the new saving in the month's need.
    if (then === 'split') navigate(`/budget/${budgetId}/complete/members#repartition`);
    if (then === 'ai') {
      const goalText = hasTarget
        ? a.aiGoal(fmt(targetValue), name, endYm ? { month: formatMonthLong(endYm), n: monthsBetween(start, endYm) } : undefined)
        : a.aiNew(name);
      navigate(`/budget/${budgetId}/complete/ai?objectif=${encodeURIComponent(goalText)}`);
    }
  };

  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={editing ? a.settingsTitle(existing!.label) : a.newTitle}>
      <form onSubmit={submit} className="flex flex-col gap-5">
        <div>
          <FieldLabel htmlFor="sv-label">{a.name}</FieldLabel>
          <Input id="sv-label" autoComplete="off" value={label} onChange={(e) => { setLabel(e.target.value); setError(''); }} placeholder={a.namePlaceholder} className="h-12 rounded-xl text-base" />
        </div>

        <div>
          <FieldLabel htmlFor="sv-target" hint={t.optional}>{a.target}</FieldLabel>
          <MoneyInput id="sv-target" value={target} onChange={(e) => { setTarget(e.target.value); setError(''); }} placeholder={a.targetPlaceholder} suffix={currencySymbol} />
        </div>

        {editing ? (
          existingKind === 'monthly' ? (
            <p className="rounded-xl bg-muted/60 px-3.5 py-3 text-sm">
              {a.currentAmount(<strong>{fmt(projectPlanned(existing!, maxYM(today, start)))}</strong>)}
            </p>
          ) : (
            <p className="rounded-xl bg-muted/60 px-3.5 py-3 text-sm">{a.freeNote}</p>
          )
        ) : (
          <>
            <div>
              <span className="mb-2 block text-sm font-semibold">{a.howFund}</span>
              <Segmented
                label={a.kindLabel}
                value={kind}
                options={[
                  { value: 'monthly', label: a.kindMonthly },
                  { value: 'free', label: a.kindFree },
                ]}
                onChange={setKind}
              />
            </div>
          </>
        )}

        {kind === 'monthly' && (
          <>
            <div>
              <FieldLabel htmlFor="sv-start">{t.starting}</FieldLabel>
              <MonthPicker id="sv-start" value={start} onChange={(ym) => { setStart(ym); if (compareYM(end, ym) < 0) setEnd(addMonths(ym, 2)); }} ariaLabel={a.startAria} />
            </div>
            <EndFields start={start} endMode={endMode} setEndMode={setEndMode} count={count} setCount={setCount} end={end} setEnd={setEnd} />
            {!editing && (
              <div>
                <FieldLabel htmlFor="sv-amount">{t.amountPerMonth}</FieldLabel>
                <MoneyInput
                  id="sv-amount"
                  value={shownAmount}
                  onChange={(e) => { setAmount(e.target.value); setAmountTouched(true); setError(''); }}
                  placeholder="0"
                  suffix={currencySymbol}
                />
                {planMonthly > 0 && (
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                    <span>{a.planHint(fmt(targetValue), planMonths, <strong className="tabular-nums text-foreground">{fmt(planMonthly)}</strong>)}</span>
                    {amountTouched && value !== planMonthly && (
                      <button type="button" className="min-h-[32px] font-semibold text-primary underline underline-offset-4" onClick={() => { setAmount(String(planMonthly)); setAmountTouched(false); }}>
                        {a.useAmount}
                      </button>
                    )}
                  </p>
                )}
                {hasTarget && !endYm && (
                  <p className="mt-1.5 text-xs text-muted-foreground">{a.chooseEnd}</p>
                )}
              </div>
            )}
          </>
        )}

        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">{a.inShort}</span>
          <p className="mt-1 text-[15px] font-semibold text-foreground">{summary}</p>
          {goal && <p className="mt-1 text-sm text-indigo-950">{goal}</p>}
          {impact && <p className="mt-1 text-sm text-indigo-950">{impact}</p>}
        </div>

        {feasibility && (
          <div className={cn('flex flex-col gap-2 rounded-xl border px-4 py-3', feasibility.shortfall <= 0 ? 'border-emerald-100 bg-emerald-50' : 'border-orange-100 bg-orange-50')}>
            <p className={cn('flex gap-2 text-sm', feasibility.shortfall <= 0 ? 'text-emerald-950' : 'text-orange-950')}>
              {feasibility.shortfall <= 0 ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
              <span>
                {feasibility.shortfall <= 0
                  ? a.feasibleOk(fmt(feasibility.worst.reste), formatMonthLong(feasibility.worst.ym))
                  : a.feasibleNo(formatMonthLong(feasibility.worst.ym), fmt(Math.max(0, feasibility.worst.reste)), fmt(monthlyAmount), fmt(feasibility.shortfall))}
              </span>
            </p>
            {feasibility.shortfall > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" className="min-h-[44px] bg-card" onClick={(e) => submit(e as unknown as React.FormEvent, 'split')}>
                  {a.createSplit}
                </Button>
                <Button type="button" variant="outline" className="min-h-[44px] bg-card" onClick={(e) => submit(e as unknown as React.FormEvent, 'ai')}>
                  <Sparkles className="h-4 w-4" aria-hidden="true" /> {a.createAi}
                </Button>
              </div>
            )}
          </div>
        )}

        <ErrorText>{error}</ErrorText>
        <Button type="submit" className="min-h-[48px]">{editing ? a.save : a.create}</Button>
      </form>
    </ResponsiveSheet>
  );
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------
export function SavingDeleteSheet({ sheet, onClose }: SheetProps<'savingDelete'>) {
  const { commit, engine, today, fmt, model } = useBudget();
  const a = useT(M).remove;
  const p = useProject(sheet.id);
  if (!p) return null;
  const balance = engine.savingBalance(p.id, today);
  const closedMonths = Object.entries(model.months)
    .filter(([, rec]) => rec.snapshot?.projects.some((x) => x.id === p.id && x.allocation !== 0))
    .map(([ym]) => ym)
    .sort(compareYM);
  const recurring = isRecurringProject(p);
  const confirm = () => {
    commit((m) => deleteProject(m, p.id), { message: a.deleted(p.label) });
    onClose();
  };
  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={a.title(p.label)}>
      <p className="flex gap-2.5 rounded-xl bg-emerald-50 px-3.5 py-3 text-sm text-emerald-950">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          {closedMonths.length
            ? a.closedKeep(closedMonths.length, `${formatMonthShort(closedMonths[0])}${closedMonths.length > 1 ? ` → ${formatMonthShort(closedMonths[closedMonths.length - 1])}` : ''}`)
            : a.notInClosed}
        </span>
      </p>
      <p className="flex gap-2.5 rounded-xl bg-orange-50 px-3.5 py-3 text-sm text-orange-950">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          {balance !== 0 ? a.balance(fmt(balance)) : ''}
          {recurring ? a.recurringNote : a.freeNote}
        </span>
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" className="min-h-[44px]" onClick={onClose}>{a.cancel}</Button>
        <Button variant="destructive" className="min-h-[44px]" onClick={confirm}>{a.delete}</Button>
      </div>
    </ResponsiveSheet>
  );
}
