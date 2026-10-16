// src/lib/pages/budget-tabs/MembersTab.tsx
// ============================================================================
// « Foyer » — who is in the household, their salary and what they put into
// the household pot (salary ≠ contribution), plus the assistant that computes
// a fair contribution for each (prorata, equal shares, same amount left) and
// applies it from a chosen month without touching the past. Access to the
// budget (invitations, roles) stays at the bottom.
// ============================================================================

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, History, Pencil, Plus, Sparkles, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useBudget } from '@/contexts/BudgetContext';
import MemberManagementSection from '@/components/budget/MemberManagementSection';
import type { Person, YM } from '@/lib/budget/types';
import { PRIVATE_CHARGE_LABEL, privateChargeName } from '@/lib/budget/types';
import {
  amountHistoryHint,
  chargesEndingBetween,
  contributionHistoryHint,
  contributionRuleText,
  personStatus,
  resolvePerson,
  splitContributions,
  windowOf,
  type SplitMethod,
} from '@/lib/budget/engine';
import { applyContributionRules, type ContributionRule } from '@/lib/budget/mutations';
import { addMonths, compareYM, formatMonthLong, formatMonthShort, formatMonthTitle, joinFr, maxYM, deMonth, monthNameLower } from '@/lib/budget/months';
import { moneySigned, percent, roundCents } from '@/lib/budget/format';
import { ChipToggle, Pill, Segmented } from '@/components/budget/shared/primitives';
import { MonthPicker } from '@/components/budget/shared/MonthPicker';
import { useFirstOpenMonth, useHashScroll } from '@/components/budget/shared/hooks';
import { defineMessages, useT } from '@/i18n/runtime';

const AVATAR_TONES = ['bg-teal-50 text-teal-800', 'bg-violet-50 text-violet-800', 'bg-amber-50 text-amber-800', 'bg-sky-50 text-sky-800', 'bg-rose-50 text-rose-800'];

const METHODS: SplitMethod[] = ['prorata', 'equal', 'reste', 'all'];

type ViewState = 'closed' | 'forecast' | 'current';

const M = defineMessages({
  fr: {
    methods: {
      prorata: { label: 'Au prorata', help: 'Chacun verse la même part de son salaire : qui gagne plus verse plus, et garde plus d’argent de poche.' },
      equal: { label: 'À parts égales', help: 'Chacun verse le même montant, quel que soit son salaire : l’argent de poche suit l’écart de salaires.' },
      reste: { label: 'Même argent de poche', help: 'Une fois les charges et l’épargne payées ensemble, chacun garde exactement le même argent de poche.' },
      all: { label: 'Tout le salaire', help: 'Chacun verse tout son salaire : pas d’argent de poche, l’excédent part en épargne générale.' },
    } as Record<SplitMethod, { label: string; help: string }>,
    // Member card
    notInHousehold: (name: ReactNode, month: string): ReactNode => <>{name} ne fait pas partie du foyer en {month}.</>,
    history: 'Historique',
    joinsIn: (month: string) => `Arrive en ${month}`,
    lastMonth: (month: string) => `Dernier mois : ${month}`,
    until: (month: string) => `Jusqu’en ${month}`,
    edit: 'Modifier',
    netPay: 'Salaire net',
    paysIn: 'Verse au pot',
    spendingMoney: 'Argent de poche',
    personalShort: (amount: string, missing: string) => `${amount} de charges perso : il manque ${missing}`,
    personalIncluded: (amount: string) => `dont ${amount} de charges perso`,
    share: (pct: string, rule: string) => `Verse ${pct} de son salaire · règle : ${rule}`,
    adjustedThisMonth: 'ajustée ce mois-ci',
    payHint: (hint: string) => `Salaire : ${hint}`,
    contributionHint: (hint: string) => `Contribution : ${hint}`,
    noChange: 'Aucun changement de salaire ni de contribution.',
    personalCharge: 'Charge perso',
    // Joint pot panel
    potTitle: (month: string) => `Le pot commun en ${month}`,
    seeMonth: 'Voir le mois',
    income: 'Entrées',
    oneOffIncluded: (amount: string) => `dont ${amount} ponctuels`,
    contributions: (n: number) => `${n} contribution${n > 1 ? 's' : ''}`,
    charges: 'Charges',
    chargeCount: (n: number) => `${n} charges`,
    savings: 'Épargne',
    setAside: 'mise de côté',
    leftInPot: 'Reste du pot',
    shortfall: 'Manque',
    toGeneral: '→ épargne générale',
    fromGeneral: 'pris sur l’épargne générale',
    noNeed: 'Aucune charge ni épargne ce mois-ci.',
    covered: (pct: string) => `Les entrées couvrent ${pct} des besoins du mois (charges + épargne).`,
    notCovered: (pct: string, missing: string) => `Les entrées couvrent ${pct} des besoins : il manque ${missing}.`,
    frozen: ' Mois clôturé : montants figés.',
    // Split assistant
    prorataExplain: (parts: string[]) => parts.join(', ') + ' : chacun verse cette part du besoin.',
    earns: (name: string, pct: string) => `${name} gagne ${pct} des revenus du foyer`,
    equalExplain: (n: number) => `Le besoin est coupé en ${n} parts égales.`,
    resteExplain: (amount: string) => `Une fois les charges et l’épargne payées, chacun garde environ ${amount} d’argent de poche.`,
    allExplain: 'Chacun verse tout son salaire.',
    settingSaved: 'Réglage de répartition enregistré pour le foyer.',
    applied: (month: string) => `Nouvelles contributions appliquées à partir ${deMonth(month)}. Les mois précédents ne changent pas.`,
    splitTitle: 'Répartir le pot commun',
    splitIntro: 'Calcule une contribution juste pour chacun. Rien ne change tant que vous n’appliquez pas.',
    needMember: 'Ajoutez au moins un membre du foyer pour utiliser l’assistant.',
    step1: '1. Méthode',
    step1Help:
      'Rien à saisir : le calcul part du salaire net de chacun et du besoin du mois (charges + épargne, ci-dessous). Ce qu’il reste à chacun après sa contribution, c’est son argent de poche.',
    methodLabel: 'Méthode de répartition',
    step2: '2. Besoin à couvrir chaque mois',
    needBreakdown: (charges: string, savings: string, margin: number) => `charges ${charges} + épargne ${savings}${margin ? ` + marge ${margin} %` : ''}`,
    basisLabel: 'Base de calcul du besoin',
    basisMonth: (month: string, amount: string) => `Mois ${deMonth(month)} · ${amount}`,
    basisAverage: (amount: string) => `Lissé sur 12 mois · ${amount}`,
    basisPeak: (amount: string) => `Le plus chargé · ${amount}`,
    evenNote: (month: string) => `Le même besoin chaque mois sur les 12 mois à partir ${deMonth(month)}.`,
    monthNote: (month: string) => `Les charges et l’épargne prévues en ${month}, le mois où la répartition commence. À revoir quand elles changent.`,
    averageNote: (month: string) => `Moyenne des 12 mois à partir ${deMonth(month)} : les mois plus chargés puisent dans l’épargne générale.`,
    peakNote: (month: string) => `${month} est le mois le plus chargé : chaque mois est couvert, le surplus des autres va à l’épargne générale.`,
    endingNote: (labels: string[], lasts: string[]) =>
      ` ${joinFr(labels.map((l) => `« ${l} »`))} ${labels.length > 1 ? 's’arrêtent' : 's’arrête'} en cours de route (${joinFr(lasts.map((m) => `fin ${m}`))}) : ${labels.length > 1 ? 'elles ne pèsent' : 'elle ne pèse'} que sur les premiers mois.`,
    marginLabel: 'Marge de sécurité',
    noMargin: 'Sans marge',
    marginChip: (v: number) => `+${v} %`,
    step3: '3. Résultat',
    wouldPay: 'verserait',
    resultLine: (salary: string, keep: string, personal?: string, share?: string) =>
      `Salaire ${salary} · argent de poche ${keep}${personal ? ` (dont ${personal} de charges perso)` : ''} · ${share ? `${share} du salaire` : '—'}`,
    sameAsToday: 'comme aujourd’hui',
    vsToday: (delta: string) => `${delta} vs aujourd’hui`,
    surplus: (amount: string) => `Excédent de ${amount} par mois → épargne générale.`,
    applyFrom: 'Appliquer à partir de',
    currentSetting: (method: string, margin: number) => `Réglage en place : ${method}${margin ? ` · marge ${margin} %` : ' · sans marge'}.`,
    backToSetting: 'Revenir à ce réglage',
    saveSetting: 'Enregistrer ce réglage',
    alreadyInPlace: 'Déjà en place',
    applyFromMonth: (month: string) => `Appliquer à partir ${deMonth(month)}`,
    // Tab
    viewState: { closed: 'Clôturé', forecast: 'Prévisionnel', current: 'En cours' } as Record<ViewState, string>,
    title: 'Foyer',
    intro: (month: string, contributions: ReactNode, salaries: string): ReactNode => (
      <>
        Chacun garde son salaire. Le pot commun ne reçoit que la contribution de chacun : en {month},{' '}{contributions} sur {salaries} de salaires.
      </>
    ),
    addMember: 'Ajouter un membre',
    previousMonth: 'Mois précédent',
    nextMonth: 'Mois suivant',
    backToCurrent: 'Revenir au mois en cours',
    empty: 'Ajoutez les membres du foyer : leur salaire, et ce que chacun verse au pot commun.',
    former: 'Ne font plus partie du foyer',
    access: 'Accès au budget',
  },
  en: {
    methods: {
      prorata: { label: 'In proportion to pay', help: 'Everyone pays in the same share of their pay: whoever earns more pays in more, and keeps more spending money.' },
      equal: { label: 'Equal shares', help: 'Everyone pays in the same amount, whatever their pay: spending money follows the pay gap.' },
      reste: { label: 'Same spending money', help: 'Once the bills and savings are paid together, everyone keeps exactly the same spending money.' },
      all: { label: 'All their pay', help: 'Everyone pays in all their pay: no spending money, and the surplus goes to general savings.' },
    },
    // Member card
    notInHousehold: (name: ReactNode, month: string): ReactNode => <>{name} isn’t part of the household in {month}.</>,
    history: 'History',
    joinsIn: (month: string) => `Joins in ${month}`,
    lastMonth: (month: string) => `Last month: ${month}`,
    until: (month: string) => `Until ${month}`,
    edit: 'Edit',
    netPay: 'Take-home pay',
    paysIn: 'Pays into the pot',
    spendingMoney: 'Spending money',
    personalShort: (amount: string, missing: string) => `${amount} of personal expenses: ${missing} short`,
    personalIncluded: (amount: string) => `including ${amount} of personal expenses`,
    share: (pct: string, rule: string) => `Pays in ${pct} of their pay · rule: ${rule}`,
    adjustedThisMonth: 'adjusted this month',
    payHint: (hint: string) => `Pay: ${hint}`,
    contributionHint: (hint: string) => `Contribution: ${hint}`,
    noChange: 'No change in pay or contribution.',
    personalCharge: 'Personal expense',
    // Joint pot panel
    potTitle: (month: string) => `The joint pot in ${month}`,
    seeMonth: 'See the month',
    income: 'Income',
    oneOffIncluded: (amount: string) => `including ${amount} one-off`,
    contributions: (n: number) => (n === 1 ? '1 contribution' : `${n} contributions`),
    charges: 'Bills',
    chargeCount: (n: number) => (n === 1 ? '1 bill' : `${n} bills`),
    savings: 'Savings',
    setAside: 'set aside',
    leftInPot: 'Left in the pot',
    shortfall: 'Shortfall',
    toGeneral: '→ general savings',
    fromGeneral: 'taken from general savings',
    noNeed: 'No bills or savings this month.',
    covered: (pct: string) => `Income covers ${pct} of the month’s needs (bills + savings).`,
    notCovered: (pct: string, missing: string) => `Income covers ${pct} of the needs: ${missing} short.`,
    frozen: ' Closed month: amounts frozen.',
    // Split assistant
    prorataExplain: (parts: string[]) => parts.join(', ') + ': everyone pays in that share of the need.',
    earns: (name: string, pct: string) => `${name} earns ${pct} of the household’s income`,
    equalExplain: (n: number) => (n === 1 ? 'With a single member, they cover the whole need.' : `The need is split into ${n} equal shares.`),
    resteExplain: (amount: string) => `Once the bills and savings are paid, everyone keeps about ${amount} of spending money.`,
    allExplain: 'Everyone pays in all their pay.',
    settingSaved: 'Split setting saved for the household.',
    applied: (month: string) => `New contributions applied from ${month}. Earlier months don’t change.`,
    splitTitle: 'Split the joint pot',
    splitIntro: 'Works out a fair contribution for everyone. Nothing changes until you apply it.',
    needMember: 'Add at least one household member to use the assistant.',
    step1: '1. Method',
    step1Help:
      'Nothing to enter: the calculation starts from everyone’s take-home pay and the month’s need (bills + savings, below). What each person has left after their contribution is their spending money.',
    methodLabel: 'Split method',
    step2: '2. Need to cover each month',
    needBreakdown: (charges: string, savings: string, margin: number) => `bills ${charges} + savings ${savings}${margin ? ` + ${margin}% margin` : ''}`,
    basisLabel: 'What the need is based on',
    basisMonth: (month: string, amount: string) => `${month} · ${amount}`,
    basisAverage: (amount: string) => `Spread over 12 months · ${amount}`,
    basisPeak: (amount: string) => `Busiest month · ${amount}`,
    evenNote: (month: string) => `The same need every month over the 12 months from ${month}.`,
    monthNote: (month: string) => `The bills and savings planned for ${month}, the month the split starts. Worth revisiting when they change.`,
    averageNote: (month: string) => `Average of the 12 months from ${month}: busier months draw on general savings.`,
    peakNote: (month: string) => `${month} is the busiest month: every month is covered, and the other months’ surplus goes to general savings.`,
    endingNote: (labels: string[], lasts: string[]) =>
      ` ${joinFr(labels.map((l) => `“${l}”`))} ${labels.length > 1 ? 'stop' : 'stops'} along the way (${joinFr(lasts.map((m) => `end of ${m}`))}): ${labels.length > 1 ? 'they only weigh' : 'it only weighs'} on the first months.`,
    marginLabel: 'Safety margin',
    noMargin: 'No margin',
    marginChip: (v: number) => `+${v}%`,
    step3: '3. Result',
    wouldPay: 'would pay in',
    resultLine: (salary: string, keep: string, personal?: string, share?: string) =>
      `Pay ${salary} · spending money ${keep}${personal ? ` (including ${personal} of personal expenses)` : ''} · ${share ? `${share} of pay` : '—'}`,
    sameAsToday: 'same as today',
    vsToday: (delta: string) => `${delta} vs today`,
    surplus: (amount: string) => `Surplus of ${amount} a month → general savings.`,
    applyFrom: 'Apply from',
    currentSetting: (method: string, margin: number) => `Current setting: ${method}${margin ? ` · ${margin}% margin` : ' · no margin'}.`,
    backToSetting: 'Go back to this setting',
    saveSetting: 'Save this setting',
    alreadyInPlace: 'Already in place',
    applyFromMonth: (month: string) => `Apply from ${month}`,
    // Tab
    viewState: { closed: 'Closed', forecast: 'Forecast', current: 'Current' },
    title: 'Household',
    intro: (month: string, contributions: ReactNode, salaries: string): ReactNode => (
      <>
        Everyone keeps their own pay. The joint pot only receives each person’s contribution: in {month},{' '}{contributions} out of {salaries} of pay.
      </>
    ),
    addMember: 'Add a member',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    backToCurrent: 'Back to the current month',
    empty: 'Add the household members: their take-home pay, and what each one pays into the joint pot.',
    former: 'No longer in the household',
    access: 'Budget access',
  },
});

function MemberCard({ person, index, refYm }: { person: Person; index: number; refYm: YM }) {
  const { fmt, openSheet, today, engine } = useBudget();
  const t = useT(M);
  const firstOpen = useFirstOpenMonth();
  const status = personStatus(person, today);
  const w = windowOf(person);
  const ref = status === 'upcoming' ? w.start ?? refYm : status === 'ended' ? w.end ?? refYm : refYm;
  // The viewed month as the month screen shows it: frozen values for a closed month.
  const r = engine.month(ref).people.find((p) => p.id === person.id) ?? resolvePerson(person, ref);
  if (!r) {
    return (
      <article className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 p-5">
        <span aria-hidden="true" className={cn('inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-display text-lg font-extrabold opacity-60', AVATAR_TONES[index % AVATAR_TONES.length])}>
          {person.name.charAt(0).toUpperCase() || '?'}
        </span>
        <p className="flex-1 text-sm text-muted-foreground">
          {t.notInHousehold(<strong className="text-foreground">{person.name}</strong>, formatMonthLong(ref))}
        </p>
        <Button variant="ghost" className="min-h-[44px]" onClick={() => openSheet({ kind: 'memberDetail', id: person.id })}>
          <History className="h-4 w-4" /> {t.history}
        </Button>
      </article>
    );
  }
  const share = r.salary > 0 ? (r.contribution / r.salary) * 100 : 0;
  const salaryHint = amountHistoryHint(person.salaryHistory, ref, fmt);
  const contributionHint = contributionHistoryHint(person, ref, fmt);
  return (
    <article className={cn('flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-soft', status === 'ended' && 'bg-muted/30')}>
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className={cn('inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-display text-lg font-extrabold', AVATAR_TONES[index % AVATAR_TONES.length])}>
          {person.name.charAt(0).toUpperCase() || '?'}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-lg font-extrabold">{person.name}</h2>
          {status === 'upcoming' && w.start && <Pill tone="blue">{t.joinsIn(formatMonthLong(w.start))}</Pill>}
          {status === 'ended' && w.end && <Pill tone="grey">{t.lastMonth(formatMonthLong(w.end))}</Pill>}
          {status === 'active' && w.end && <Pill tone="amber">{t.until(formatMonthLong(w.end))}</Pill>}
        </div>
        <Button variant="outline" className="min-h-[44px]" onClick={() => openSheet({ kind: 'member', id: person.id, ym: maxYM(status === 'active' ? refYm : ref, firstOpen) })}>
          <Pencil className="h-4 w-4" /> {t.edit}
        </Button>
      </div>
      <dl className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs font-bold text-muted-foreground">{t.netPay}</dt>
          <dd className="font-display text-lg font-extrabold tabular-nums">{fmt(r.salary)}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs font-bold text-emerald-700">{t.paysIn}</dt>
          <dd className="font-display text-lg font-extrabold tabular-nums text-emerald-700">{fmt(r.contribution)}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs font-bold text-muted-foreground">{t.spendingMoney}</dt>
          <dd className="font-display text-lg font-extrabold tabular-nums">{fmt(r.keep)}</dd>
          {r.personalCharges > 0 && (
            <dd className={cn('text-xs', r.available < 0 ? 'font-semibold text-red-700' : 'text-muted-foreground')}>
              {r.available < 0
                ? t.personalShort(fmt(r.personalCharges), fmt(-r.available))
                : t.personalIncluded(fmt(r.personalCharges))}
            </dd>
          )}
        </div>
      </dl>
      <div className="flex flex-col gap-1.5">
        <span aria-hidden="true" className="block h-2 overflow-hidden rounded-full bg-muted">
          <span className="block h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, share)}%` }} />
        </span>
        <span className="text-xs text-muted-foreground">
          {t.share(percent(share), r.contributionAdjusted ? t.adjustedThisMonth : contributionRuleText(r.mode, r.value))}
        </span>
      </div>
      <div className="flex flex-col gap-2 border-t border-border/60 pt-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
          {salaryHint && <span>{t.payHint(salaryHint)}</span>}
          {contributionHint && <span>{t.contributionHint(contributionHint)}</span>}
          {!salaryHint && !contributionHint && <span>{t.noChange}</span>}
        </div>
        <div className="flex shrink-0 flex-wrap gap-1 self-start sm:self-auto">
        <button
          type="button"
          onClick={() => openSheet({ kind: 'chargeEditor', ym: maxYM(ref, firstOpen), ownerId: person.id })}
          className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-lg px-1 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> {t.personalCharge}
        </button>
        <button
          type="button"
          onClick={() => openSheet({ kind: 'memberDetail', id: person.id })}
          className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 self-start rounded-lg px-1 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:self-auto"
        >
          <History className="h-4 w-4" aria-hidden="true" /> {t.history}
        </button>
        </div>
      </div>
    </article>
  );
}

/** The household pot for one month: what comes in vs what the month needs. */
function PotPanel({ ym }: { ym: YM }) {
  const { engine, fmt, budgetId } = useBudget();
  const words = useT(M);
  const m = engine.month(ym);
  const t = m.totals;
  const need = roundCents(t.charges + t.savings);
  const coverage = need > 0 ? (t.entrees / need) * 100 : 100;
  const scale = Math.max(t.entrees, need, 1);
  return (
    <section aria-labelledby="pot-title" className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="pot-title" className="font-display text-lg font-extrabold">{words.potTitle(monthNameLower(ym))}</h2>
        <Link to={`/budget/${budgetId}/complete/month?m=${ym}`} className="inline-flex min-h-[40px] items-center gap-1 text-sm font-semibold text-primary hover:underline">
          {words.seeMonth} <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: words.income, value: t.entrees, dot: 'bg-emerald-500', hint: t.oneOff ? words.oneOffIncluded(fmt(t.oneOff)) : words.contributions(m.people.length) },
          { label: words.charges, value: t.charges, dot: 'bg-orange-500', hint: words.chargeCount(m.charges.filter((c) => c.amount !== 0).length) },
          { label: words.savings, value: t.savings, dot: 'bg-indigo-500', hint: words.setAside },
          { label: t.reste >= 0 ? words.leftInPot : words.shortfall, value: t.reste, dot: t.reste >= 0 ? 'bg-emerald-300' : 'bg-red-500', hint: t.reste >= 0 ? words.toGeneral : words.fromGeneral, short: t.reste < 0 },
        ].map((k) => (
          <div key={k.label} className="flex flex-col gap-0.5">
            <dt className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
              <span aria-hidden="true" className={cn('h-2 w-2 rounded-full', k.dot)} /> {k.label}
            </dt>
            <dd className={cn('font-display text-xl font-extrabold tabular-nums', k.short && 'text-red-700')}>{fmt(Math.abs(k.value))}</dd>
            <dd className="text-xs text-muted-foreground">{k.hint}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col gap-1.5" aria-hidden="true">
        <span className="flex h-2.5 overflow-hidden rounded-full bg-muted">
          <span className="h-full bg-emerald-500" style={{ width: `${(t.entrees / scale) * 100}%` }} />
        </span>
        <span className="flex h-2.5 gap-[2px] overflow-hidden rounded-full bg-muted">
          <span className="h-full bg-orange-500" style={{ width: `${(t.charges / scale) * 100}%` }} />
          <span className="h-full bg-indigo-500" style={{ width: `${(t.savings / scale) * 100}%` }} />
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        {need === 0
          ? words.noNeed
          : t.reste >= 0
            ? words.covered(percent(coverage))
            : words.notCovered(percent(coverage), fmt(-t.reste))}
        {m.frozen && words.frozen}
      </p>
    </section>
  );
}

type SplitBasis = 'month' | 'average' | 'peak';
interface SplitSettings {
  method: SplitMethod;
  margin: number;
  basis: SplitBasis;
}

const SPLIT_DEFAULTS: SplitSettings = { method: 'prorata', margin: 5, basis: 'month' };
/** Top-level key of the shared budget data holding the settings last applied. */
const SPLIT_KEY = 'splitSettings';
const draftKey = (budgetId: string) => `split-draft:${budgetId}`;

/** Keeps only valid settings from stored, untrusted data. */
function readSplit(raw: unknown): Partial<SplitSettings> {
  if (!raw || typeof raw !== 'object') return {};
  const v = raw as Record<string, unknown>;
  const out: Partial<SplitSettings> = {};
  if (METHODS.includes(v.method as SplitMethod)) out.method = v.method as SplitMethod;
  if (v.margin === 0 || v.margin === 5 || v.margin === 10) out.margin = v.margin;
  if (v.basis === 'month' || v.basis === 'average' || v.basis === 'peak') out.basis = v.basis;
  return out;
}

function readDraft(budgetId: string | undefined): Partial<SplitSettings> {
  if (!budgetId) return {};
  try {
    return readSplit(JSON.parse(localStorage.getItem(draftKey(budgetId)) ?? 'null'));
  } catch {
    return {};
  }
}

function SplitAssistant() {
  const { model, engine, today, fmt, commit, currencySymbol, budget } = useBudget();
  const t = useT(M);
  const firstOpen = useFirstOpenMonth();
  // The household's applied settings are shared in the budget data; choices not
  // applied yet are kept on this device so leaving the tab does not lose them.
  const applied: SplitSettings = { ...SPLIT_DEFAULTS, ...readSplit(model.extras[SPLIT_KEY]) };
  const [initial] = useState<SplitSettings>(() => ({ ...applied, ...readDraft(budget?.id) }));
  const [method, setMethod] = useState<SplitMethod>(initial.method);
  const [margin, setMargin] = useState(initial.margin);
  const [basis, setBasis] = useState<SplitBasis>(initial.basis);
  const isDraft = method !== applied.method || margin !== applied.margin || basis !== applied.basis;
  useEffect(() => {
    if (!budget?.id) return;
    try {
      if (isDraft) localStorage.setItem(draftKey(budget.id), JSON.stringify({ method, margin, basis }));
      else localStorage.removeItem(draftKey(budget.id));
    } catch {
      // Storage unavailable (private mode): the choice simply is not remembered.
    }
  }, [budget?.id, method, margin, basis, isDraft]);
  // Starts with the current (first open) month: what the household needs now.
  const [from, setFrom] = useState<YM>(firstOpen);

  const members = useMemo(
    () =>
      model.people
        .map((p) => ({ person: p, r: resolvePerson(p, from) }))
        .filter((x): x is { person: Person; r: NonNullable<ReturnType<typeof resolvePerson>> } => !!x.r),
    [model.people, from],
  );

  // Two ways to size the pot over the 12 months from `from`: the average
  // (heavier months draw on the general savings) or the heaviest month
  // (every month is covered; lighter months feed the general savings).
  const months12 = Array.from({ length: 12 }, (_, i) => engine.month(addMonths(from, i)));
  const avgC = Math.round(months12.reduce((a, m) => a + m.totals.charges, 0) / 12);
  const avgS = Math.round(months12.reduce((a, m) => a + m.totals.savings, 0) / 12);
  const peakMonth = months12.reduce((best, m) =>
    m.totals.charges + m.totals.savings > best.totals.charges + best.totals.savings ? m : best,
  );
  // The choice only matters when some months weigh more than others.
  const fromMonth = months12[0];
  const monthTotal = Math.round(fromMonth.totals.charges + fromMonth.totals.savings);
  const peakTotal = Math.round(peakMonth.totals.charges + peakMonth.totals.savings);
  const uneven = peakTotal > avgC + avgS || monthTotal !== avgC + avgS;
  const effBasis = uneven ? basis : 'average';
  const basisMonth = effBasis === 'peak' ? peakMonth : effBasis === 'month' ? fromMonth : null;
  const needC = basisMonth ? Math.round(basisMonth.totals.charges) : avgC;
  const needS = basisMonth ? Math.round(basisMonth.totals.savings) : avgS;
  const withMargin = (v: number) => Math.round(v * (1 + margin / 100));
  const need = withMargin(needC + needS);
  const ending = chargesEndingBetween(model, from, addMonths(from, 11));
  // Personal charges are not rebalanced: they are only shown inside each pocket money.
  const personalAt = (personId: string) => engine.month(from).people.find((p) => p.id === personId)?.personalCharges ?? 0;
  const salaries = members.map((m) => m.r.salary);
  const proposal = splitContributions(method, salaries, need);
  const totalSalaries = salaries.reduce((a, b) => a + b, 0);
  const totalProposal = proposal.reduce((a, b) => a + b, 0);
  const surplus = roundCents(totalProposal - need);
  const unchanged = members.every((m, i) => roundCents(m.r.contribution) === roundCents(proposal[i]));

  let explain = '';
  if (method === 'prorata') {
    explain = t.prorataExplain(members.map((m) => t.earns(m.person.name, percent(totalSalaries ? (m.r.salary / totalSalaries) * 100 : 0))));
  } else if (method === 'equal') explain = t.equalExplain(members.length);
  else if (method === 'reste') explain = t.resteExplain(fmt(members.length ? (totalSalaries - totalProposal) / members.length : 0));
  else explain = t.allExplain;

  const apply = () => {
    const rules: Record<string, ContributionRule> = {};
    members.forEach((m, i) => {
      rules[m.person.id] = method === 'all' ? { mode: 'all' } : { mode: 'fixed', value: proposal[i] };
    });
    const settings: SplitSettings = { method, margin, basis };
    commit((m) => ({ ...applyContributionRules(m, from, rules, today), extras: { ...m.extras, [SPLIT_KEY]: settings } }), {
      message: unchanged
        ? t.settingSaved
        : t.applied(formatMonthLong(from)),
    });
  };

  return (
    <section id="repartition" aria-labelledby="repartition-title" className="scroll-mt-24 rounded-2xl border border-border/70 bg-card p-5 shadow-soft sm:p-6">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-800">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <h2 id="repartition-title" className="font-display text-lg font-extrabold">{t.splitTitle}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{t.splitIntro}</p>
        </div>
      </div>

      {members.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{t.needMember}</p>
      ) : (
        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <div>
              <span className="mb-1 block text-sm font-semibold">{t.step1}</span>
              <p className="mb-2 text-xs text-muted-foreground">
                {t.step1Help}
              </p>
              <Segmented label={t.methodLabel} value={method} options={METHODS.map((value) => ({ value, label: t.methods[value].label }))} onChange={setMethod} />
              <p className="mt-2 text-sm text-muted-foreground">{t.methods[method].help}</p>
            </div>
            <div>
              <span className="mb-1 block text-sm font-semibold">{t.step2}</span>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-display text-3xl font-extrabold tabular-nums">{fmt(need)}</span>
                <span className="text-sm text-muted-foreground">
                  {t.needBreakdown(fmt(needC), fmt(needS), margin)}
                </span>
              </div>
              {uneven && (
              <Segmented
                className="mt-3"
                label={t.basisLabel}
                stackOnMobile
                value={basis}
                onChange={setBasis}
                options={[
                  { value: 'month', label: t.basisMonth(monthNameLower(from), fmt(withMargin(monthTotal))) },
                  { value: 'average', label: t.basisAverage(fmt(withMargin(avgC + avgS))) },
                  { value: 'peak', label: t.basisPeak(fmt(withMargin(peakTotal))) },
                ]}
              />
              )}
              <p className="mb-3 mt-2 text-xs text-muted-foreground">
                {!uneven
                  ? t.evenNote(formatMonthShort(from))
                  : effBasis === 'month'
                  ? t.monthNote(formatMonthLong(from))
                  : effBasis === 'average'
                  ? t.averageNote(formatMonthShort(from))
                  : t.peakNote(formatMonthTitle(peakMonth.ym))}
                {ending.length > 0 &&
                  t.endingNote(
                    ending.map(({ charge }) => (charge.label === PRIVATE_CHARGE_LABEL ? privateChargeName() : charge.label)),
                    ending.map(({ last }) => formatMonthShort(last)),
                  )}
              </p>
              <div role="group" aria-label={t.marginLabel} className="flex flex-wrap gap-2">
                {[0, 5, 10].map((v) => (
                  <ChipToggle key={v} pressed={margin === v} onClick={() => setMargin(v)}>
                    {v === 0 ? t.noMargin : t.marginChip(v)}
                  </ChipToggle>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold">{t.step3}</span>
            {members.map((m, i) => {
              const delta = roundCents(proposal[i] - m.r.contribution);
              return (
                <div key={m.person.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
                  <span className="font-bold">
                    {m.person.name} <span className="text-sm font-normal text-muted-foreground">{t.wouldPay}</span>
                  </span>
                  <span className="text-right font-display text-lg font-extrabold tabular-nums">{fmt(proposal[i])}</span>
                  <span className="text-xs text-muted-foreground">
                    {t.resultLine(
                      fmt(m.r.salary),
                      fmt(m.r.salary - proposal[i]),
                      personalAt(m.person.id) > 0 ? fmt(personalAt(m.person.id)) : undefined,
                      m.r.salary > 0 ? percent((proposal[i] / m.r.salary) * 100) : undefined,
                    )}
                  </span>
                  <span className="text-right text-xs font-bold tabular-nums text-muted-foreground">
                    {delta === 0 ? t.sameAsToday : t.vsToday(moneySigned(delta, currencySymbol))}
                  </span>
                </div>
              );
            })}
            <p className="text-sm">{explain}</p>
            {surplus > 0 && <p className="text-xs text-muted-foreground">{t.surplus(fmt(surplus))}</p>}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold">{t.applyFrom}</span>
              <MonthPicker value={from} onChange={setFrom} min={firstOpen} ariaLabel={t.applyFrom} />
            </div>
            {isDraft && model.extras[SPLIT_KEY] !== undefined && (
              <p className="text-xs text-muted-foreground">
                {t.currentSetting(t.methods[applied.method].label, applied.margin)}{' '}
                <button
                  type="button"
                  className="font-semibold text-primary underline-offset-2 hover:underline"
                  onClick={() => { setMethod(applied.method); setMargin(applied.margin); setBasis(applied.basis); }}
                >
                  {t.backToSetting}
                </button>
              </p>
            )}
            <Button className="min-h-[48px]" onClick={apply} disabled={unchanged && !isDraft}>
              {unchanged ? (isDraft ? t.saveSetting : t.alreadyInPlace) : t.applyFromMonth(formatMonthLong(from))}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

export default function MembersTab() {
  const { user } = useAuth();
  const { model, engine, fmt, openSheet, budget, refreshMembersOnly, handleShowInviteModal, today } = useBudget();
  const t = useT(M);
  const firstOpen = useFirstOpenMonth();
  useHashScroll('repartition');
  // The month shown by the cards and the pot panel (browse past months to see history).
  const [viewYm, setViewYm] = useState<YM>(firstOpen);
  const month = engine.month(viewYm);
  const viewStatus: ViewState = month.closed ? 'closed' : compareYM(viewYm, today) > 0 ? 'forecast' : 'current';
  const indexed = model.people.map((p, i) => ({ p, i }));
  const current = indexed.filter(({ p }) => personStatus(p, today) !== 'ended');
  const former = indexed.filter(({ p }) => personStatus(p, today) === 'ended');

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">{t.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {t.intro(formatMonthLong(viewYm), <strong className="tabular-nums text-foreground">{fmt(month.totals.contributions)}</strong>, fmt(month.totals.salaries))}
          </p>
        </div>
        <Button className="min-h-[44px] self-start sm:self-auto" onClick={() => openSheet({ kind: 'member', ym: firstOpen })}>
          <UserPlus className="h-4 w-4" /> {t.addMember}
        </Button>
      </div>

      {model.people.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="icon" className="h-11 w-11 shrink-0" aria-label={t.previousMonth} onClick={() => setViewYm(addMonths(viewYm, -1))}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="min-w-[150px] text-center font-display text-lg font-extrabold tabular-nums" aria-live="polite">{formatMonthTitle(viewYm)}</span>
          <Button variant="outline" size="icon" className="h-11 w-11 shrink-0" aria-label={t.nextMonth} onClick={() => setViewYm(addMonths(viewYm, 1))}>
            <ChevronRight className="h-5 w-5" />
          </Button>
          <Pill tone={month.closed ? 'grey' : viewStatus === 'current' ? 'green' : 'blue'}>{t.viewState[viewStatus]}</Pill>
          {viewYm !== firstOpen && (
            <Button variant="ghost" className="min-h-[44px]" onClick={() => setViewYm(firstOpen)}>
              {t.backToCurrent}
            </Button>
          )}
        </div>
      )}

      {current.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {current.map(({ p, i }) => (
            <MemberCard key={p.id} person={p} index={i} refYm={viewYm} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-border px-5 py-8 text-center">
          <p className="max-w-md text-sm text-muted-foreground">{t.empty}</p>
          <Button className="min-h-[44px]" onClick={() => openSheet({ kind: 'member', ym: firstOpen })}>
            <Plus className="h-4 w-4" /> {t.addMember}
          </Button>
        </div>
      )}

      {former.length > 0 && (
        <section aria-labelledby="former-title" className="flex flex-col gap-3">
          <h2 id="former-title" className="px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.former}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {former.map(({ p, i }) => (
              <MemberCard key={p.id} person={p} index={i} refYm={firstOpen} />
            ))}
          </div>
        </section>
      )}

      {model.people.length > 0 && <PotPanel ym={viewYm} />}

      <SplitAssistant />

      {budget && user && (
        <section aria-label={t.access} className="flex flex-col gap-3">
          <MemberManagementSection budget={budget} currentUserId={user.id} onMemberChange={refreshMembersOnly} onInvite={handleShowInviteModal} />
        </section>
      )}
    </div>
  );
}
