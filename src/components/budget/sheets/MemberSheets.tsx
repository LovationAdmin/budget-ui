// src/components/budget/sheets/MemberSheets.tsx
// A household member: net salary AND what they put into the household pot
// (all of it, a fixed amount or a percentage), for one month only or from a
// month on; arrival / departure; deletion.

import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, Lock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useBudget } from '@/contexts/BudgetContext';
import type { ContributionMode, Person, YM } from '@/lib/budget/types';
import {
  amountHistoryHint,
  contributionFor,
  contributionHistoryHint,
  contributionStepText,
  resolvePerson,
  sortSteps,
  stepAt,
  windowOf,
} from '@/lib/budget/engine';
import { clearPersonMonthException, newId, removePerson, setPersonMoney, updatePerson, upsertPerson } from '@/lib/budget/mutations';
import { splitRuleAt, splitRuleText } from '@/lib/budget/split';
import {
  addMonths,
  compareYM,
  endDateOf,
  formatMonthLong,
  formatMonthShort,
  formatMonthTitle,
  maxYM,
  monthIndex0,
  monthNames,
  startDateOf,
  deMonth,
} from '@/lib/budget/months';
import { parseAmount, roundCents } from '@/lib/budget/format';
import { ResponsiveSheet } from '../shared/ResponsiveSheet';
import { MonthPicker } from '../shared/MonthPicker';
import { ChipToggle, ChoiceCard, ErrorText, failOn, FieldLabel, MoneyInput, Segmented } from '../shared/primitives';
import type { SheetProps } from './BudgetSheets';
import { pick } from '@/i18n/current';
import { defineMessages, useT } from '@/i18n/runtime';

const MODES: ContributionMode[] = ['all', 'fixed', 'percent'];

const M = defineMessages({
  fr: {
    modes: { all: 'Tout le salaire', fixed: 'Montant fixe', percent: 'Pourcentage' } as Record<ContributionMode, string>,
    salary: 'Salaire',
    salaryHint: '(net, par mois)',
    paysIn: 'Ce qu’il/elle verse au pot commun',
    contributionLabel: 'Contribution au pot commun',
    percentOfPay: 'Pourcentage du salaire',
    amountPaidIn: 'Montant versé chaque mois',
    split: (contribution: string, keep: string) => `Verse ${contribution} au pot commun · ${keep} d’argent de poche`,
    overPay: 'La contribution dépasse le salaire.',
    invalidSalary: 'Indiquez un salaire valide (0 si aucun revenu).',
    invalidPercent: 'Le pourcentage doit être entre 0 et 100.',
    invalidFixed: 'Indiquez le montant versé chaque mois.',
    firstName: 'Prénom',
    nameRequired: 'Indiquez un prénom.',
    joined: (name: string, amount: string, from?: string) =>
      `${name} fait partie du foyer${from ? ` à partir ${deMonth(from)}` : ''} : ${amount} par mois au pot commun.`,
    joinedMethod: (name: string, from?: string) =>
      `${name} fait partie du foyer${from ? ` à partir ${deMonth(from)}` : ''} : sa contribution suit la méthode du foyer.`,
    methodNote: (rule: string) => `Calculée chaque mois par la méthode du foyer : ${rule}. La changer « à partir de » ce mois arrête la méthode pour tout le foyer.`,
    newMethodNote: (rule: string) => `Sa contribution suivra la méthode du foyer (${rule}) : elle est calculée chaque mois.`,
    newTitle: 'Nouveau membre du foyer',
    newDescription: 'Son salaire et ce qu’il/elle met dans le pot commun.',
    namePlaceholder: 'Ex. : Camille',
    inHousehold: 'Dans le foyer',
    joiningAria: 'Arrivée dans le foyer',
    fromNow: 'Dès maintenant',
    fromAMonth: 'À partir d’un mois…',
    joinsIn: 'Arrive en',
    joining: 'Arrivée',
    addToHousehold: 'Ajouter au foyer',
    appliedMonth: (name: string, month: string) => `${name} : changement appliqué à ${month} seulement.`,
    appliedForward: (name: string, month: string) => `${name} : changement appliqué à partir ${deMonth(month)}. Les mois d’avant ne bougent pas.`,
    inMonth: (month: string) => `En ${month}`,
    notInHousehold: (month: string) => `Ne fait pas partie du foyer en ${month}`,
    closedNote: (month: string) => `${month} est clôturé : les changements s’appliqueront aux mois suivants.`,
    applyTo: 'Appliquer à…',
    only: (month: string) => `${month} seulement`,
    onlyHelp: 'Une exception (prime, mois sans salaire…) : les autres mois ne changent pas.',
    fromOn: (month: string) => `À partir ${deMonth(month)}`,
    earlierStay: 'Les mois d’avant ne bougent pas.',
    editHint: 'Modifiez le salaire ou la contribution, puis choisissez à quels mois l’appliquer.',
    settingsToggle: 'Prénom, arrivée, départ',
    deleteName: (name: string) => `Supprimer ${name}`,
    nameEmpty: 'Le prénom ne peut pas être vide.',
    leaveBeforeJoin: 'Le départ doit venir après l’arrivée.',
    lastMonthSaved: (name: string, month: string) => `${name} : dernier mois dans le foyer ${month}. Les mois clôturés ne changent pas.`,
    settingsSaved: (name: string) => `${name} : réglages enregistrés.`,
    alwaysHere: 'Toujours là',
    from: 'À partir de…',
    leaving: 'Départ',
    stays: 'Reste dans le foyer',
    leaves: 'Quitte le foyer…',
    lastMonthPrefix: 'Dernier mois :',
    lastMonthAria: 'Dernier mois dans le foyer',
    lastMonthHelp: 'Sa contribution compte jusqu’à ce mois inclus, puis plus du tout.',
    saveSettings: 'Enregistrer ces réglages',
    removed: (name: string) => `${name} retiré(e) du foyer. Les mois clôturés gardent sa contribution.`,
    leftFrom: (name: string, month: string) => `${name} ne compte plus à partir ${deMonth(month)}. L’historique est conservé.`,
    deleteTitle: (name: string) => `Supprimer ${name} ?`,
    closedKeep: (n: number, range: string) => `Les ${n} mois clôturés (${range}) gardent sa contribution : leur photo est figée.`,
    notInClosed: 'Il/elle n’apparaît dans aucun mois clôturé.',
    deleteWarning: 'Sa contribution disparaît des mois ouverts et à venir. Pour un départ du foyer, mieux vaut indiquer un dernier mois.',
    cancel: 'Annuler',
    stopCounting: (month: string) => `Ne plus compter dès ${month}`,
    delete: 'Supprimer',
    since: (month: string) => `Depuis ${month}`,
    until: (month: string) => `Jusqu’à ${month}`,
    always: 'Depuis toujours',
    historyTitle: (name: string) => `Historique de ${name}`,
    salaries: 'Salaires successifs',
    contributions: 'Contributions au pot',
    exceptions: 'Exceptions (un seul mois)',
    exceptionSalary: (amount: string) => `salaire ${amount}`,
    exceptionPaysIn: (amount: string) => `verse ${amount}`,
    closed: 'clôturé',
    exceptionDeleted: (month: string) => `Exception ${deMonth(month)} supprimée.`,
    monthByMonth: 'Mois par mois',
    month: 'Mois',
    payCol: 'Salaire',
    paysInCol: 'Verse',
    spendingMoney: 'Argent de poche',
    exception: 'exception',
    personal: (amount: string) => `dont ${amount} perso`,
    frozenNote: 'Les mois clôturés gardent les montants de leur clôture, même si les règles changent ensuite.',
    editMoney: 'Modifier le salaire ou la contribution',
  },
  en: {
    modes: { all: 'All their pay', fixed: 'Fixed amount', percent: 'Percentage' },
    salary: 'Take-home pay',
    salaryHint: '(per month)',
    paysIn: 'What they pay into the joint pot',
    contributionLabel: 'Contribution to the joint pot',
    percentOfPay: 'Percentage of pay',
    amountPaidIn: 'Amount paid in each month',
    split: (contribution: string, keep: string) => `Pays ${contribution} into the joint pot · ${keep} spending money`,
    overPay: 'The contribution is more than their pay.',
    invalidSalary: 'Enter a valid take-home pay (0 if no income).',
    invalidPercent: 'The percentage must be between 0 and 100.',
    invalidFixed: 'Enter the amount paid in each month.',
    firstName: 'First name',
    nameRequired: 'Enter a first name.',
    joined: (name: string, amount: string, from?: string) =>
      `${name} is part of the household${from ? ` from ${from}` : ''}: ${amount} a month into the joint pot.`,
    joinedMethod: (name: string, from?: string) =>
      `${name} is part of the household${from ? ` from ${from}` : ''}: their contribution follows the household’s method.`,
    methodNote: (rule: string) => `Worked out every month by the household’s method: ${rule}. Changing it “from” this month stops the method for the whole household.`,
    newMethodNote: (rule: string) => `Their contribution will follow the household’s method (${rule}): it is worked out every month.`,
    newTitle: 'New household member',
    newDescription: 'Their take-home pay and what they put into the joint pot.',
    namePlaceholder: 'E.g. Alex',
    inHousehold: 'In the household',
    joiningAria: 'Joining the household',
    fromNow: 'From now',
    fromAMonth: 'From a given month…',
    joinsIn: 'Joins in',
    joining: 'Joining',
    addToHousehold: 'Add to household',
    appliedMonth: (name: string, month: string) => `${name}: change applied to ${month} only.`,
    appliedForward: (name: string, month: string) => `${name}: change applied from ${month}. Earlier months don’t change.`,
    inMonth: (month: string) => `In ${month}`,
    notInHousehold: (month: string) => `Not part of the household in ${month}`,
    closedNote: (month: string) => `${month} is closed: changes will apply to the following months.`,
    applyTo: 'Apply to…',
    only: (month: string) => `${month} only`,
    onlyHelp: 'An exception (a bonus, a month without pay…): the other months don’t change.',
    fromOn: (month: string) => `From ${month} on`,
    earlierStay: 'Earlier months don’t change.',
    editHint: 'Change the pay or the contribution, then choose which months it applies to.',
    settingsToggle: 'First name, joining, leaving',
    deleteName: (name: string) => `Delete ${name}`,
    nameEmpty: 'The first name can’t be empty.',
    leaveBeforeJoin: 'Leaving must come after joining.',
    lastMonthSaved: (name: string, month: string) => `${name}: last month in the household is ${month}. Closed months don’t change.`,
    settingsSaved: (name: string) => `${name}: settings saved.`,
    alwaysHere: 'Always here',
    from: 'From…',
    leaving: 'Leaving',
    stays: 'Stays in the household',
    leaves: 'Leaves the household…',
    lastMonthPrefix: 'Last month:',
    lastMonthAria: 'Last month in the household',
    lastMonthHelp: 'Their contribution counts up to and including this month, then not at all.',
    saveSettings: 'Save these settings',
    removed: (name: string) => `${name} removed from the household. Closed months keep their contribution.`,
    leftFrom: (name: string, month: string) => `${name} no longer counts from ${month}. Their history is kept.`,
    deleteTitle: (name: string) => `Delete ${name}?`,
    closedKeep: (n: number, range: string) =>
      n === 1
        ? `The closed month (${range}) keeps their contribution: its snapshot is frozen.`
        : `The ${n} closed months (${range}) keep their contribution: their snapshot is frozen.`,
    notInClosed: 'They don’t appear in any closed month.',
    deleteWarning: 'Their contribution disappears from open and future months. If they’re leaving the household, it’s better to set a last month.',
    cancel: 'Cancel',
    stopCounting: (month: string) => `Stop counting them from ${month}`,
    delete: 'Delete',
    since: (month: string) => `Since ${month}`,
    until: (month: string) => `Until ${month}`,
    always: 'From the start',
    historyTitle: (name: string) => `${name}’s history`,
    salaries: 'Pay over time',
    contributions: 'Contributions to the pot',
    exceptions: 'Exceptions (a single month)',
    exceptionSalary: (amount: string) => `pay ${amount}`,
    exceptionPaysIn: (amount: string) => `pays in ${amount}`,
    closed: 'closed',
    exceptionDeleted: (month: string) => `${month} exception deleted.`,
    monthByMonth: 'Month by month',
    month: 'Month',
    payCol: 'Pay',
    paysInCol: 'Pays in',
    spendingMoney: 'Spending money',
    exception: 'exception',
    personal: (amount: string) => `including ${amount} personal`,
    frozenNote: 'Closed months keep the amounts they had when closed, even if the rules change later.',
    editMoney: 'Edit pay or contribution',
  },
});

function contributionOf(mode: ContributionMode, salary: number, value: number): number {
  if (mode === 'all') return roundCents(salary);
  return contributionFor({ from: '0000-01', mode, value }, salary);
}

/** Salary + contribution fields shared by the create and edit forms. */
function MoneyFields({
  idPrefix,
  salary,
  setSalary,
  mode,
  setMode,
  value,
  setValue,
  onEdit,
  salaryHint,
  contributionHint,
  methodNote,
  followsMethod,
}: {
  idPrefix: string;
  salary: string;
  setSalary: (v: string) => void;
  mode: ContributionMode;
  setMode: (m: ContributionMode) => void;
  value: string;
  setValue: (v: string) => void;
  onEdit: () => void;
  salaryHint?: string;
  contributionHint?: string;
  /** The contribution is worked out by the household's method (shown under it). */
  methodNote?: string;
  /** A new member joins the household's method: no contribution to choose. */
  followsMethod?: string;
}) {
  const { fmt, currencySymbol } = useBudget();
  const t = useT(M);
  const s = parseAmount(salary);
  const v = parseAmount(value);
  const sOk = Number.isFinite(s) && s >= 0;
  const vOk = mode === 'all' || (Number.isFinite(v) && v >= 0 && (mode !== 'percent' || v <= 100));
  const contribution = sOk && vOk ? contributionOf(mode, s, v) : 0;
  const keep = sOk ? roundCents(s - contribution) : 0;

  const pickMode = (m: ContributionMode) => {
    if (m === mode) return;
    if (m === 'fixed') setValue(String(sOk ? contribution || roundCents(s / 2) : ''));
    if (m === 'percent') setValue(String(sOk && s > 0 ? Math.round((contribution / s) * 100) : 50));
    setMode(m);
    onEdit();
  };

  return (
    <>
      <div>
        <FieldLabel htmlFor={`${idPrefix}-salary`} hint={t.salaryHint}>{t.salary}</FieldLabel>
        <MoneyInput id={`${idPrefix}-salary`} value={salary} onChange={(e) => { setSalary(e.target.value); onEdit(); }} placeholder="0" suffix={currencySymbol} />
        {salaryHint && <p className="mt-1.5 text-xs text-muted-foreground">{salaryHint}</p>}
      </div>
      {followsMethod ? (
        <p className="rounded-xl bg-sky-50 px-4 py-3 text-sm text-sky-950">{followsMethod}</p>
      ) : (
      <>
      <div>
        <span className="mb-2 block text-sm font-semibold">{t.paysIn}</span>
        <Segmented label={t.contributionLabel} value={mode} options={MODES.map((value) => ({ value, label: t.modes[value] }))} onChange={pickMode} />
        {mode !== 'all' && (
          <div className="mt-3">
            <FieldLabel htmlFor={`${idPrefix}-value`}>{mode === 'percent' ? t.percentOfPay : t.amountPaidIn}</FieldLabel>
            <MoneyInput id={`${idPrefix}-value`} value={value} onChange={(e) => { setValue(e.target.value); onEdit(); }} placeholder="0" suffix={mode === 'percent' ? '%' : currencySymbol} />
          </div>
        )}
        {contributionHint && <p className="mt-1.5 text-xs text-muted-foreground">{contributionHint}</p>}
        {methodNote && <p className="mt-2 rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-950">{methodNote}</p>}
      </div>
      <div className="rounded-xl border border-teal-100 bg-teal-50 px-4 py-3">
        <p className="text-[15px] font-semibold text-teal-950">
          {t.split(fmt(contribution), fmt(keep))}
        </p>
        {sOk && contribution > s && <p className="mt-1 text-sm text-orange-900">{t.overPay}</p>}
      </div>
      </>
      )}
    </>
  );
}

function validate(salary: string, mode: ContributionMode, value: string): { error: string; s: number; v: number } {
  const t = pick(M);
  const s = parseAmount(salary === '' ? '0' : salary);
  const v = parseAmount(value);
  if (!Number.isFinite(s) || s < 0) return { error: t.invalidSalary, s, v };
  if (mode === 'percent' && (!Number.isFinite(v) || v < 0 || v > 100)) return { error: t.invalidPercent, s, v };
  if (mode === 'fixed' && (!Number.isFinite(v) || v < 0)) return { error: t.invalidFixed, s, v };
  return { error: '', s, v };
}

// ---------------------------------------------------------------------------
// Create / edit
// ---------------------------------------------------------------------------
export function MemberSheet({ sheet, onClose }: SheetProps<'member'>) {
  const { model } = useBudget();
  const person = sheet.id ? model.people.find((p) => p.id === sheet.id) : undefined;
  if (sheet.id && !person) return null;
  return person ? <EditMember person={person} ym={sheet.ym} onClose={onClose} /> : <NewMember ym={sheet.ym} onClose={onClose} />;
}

function NewMember({ ym, onClose }: { ym: YM; onClose: () => void }) {
  const { commit, today, fmt, model } = useBudget();
  const t = useT(M);
  const [name, setName] = useState('');
  const [salary, setSalary] = useState('');
  const [mode, setMode] = useState<ContributionMode>('all');
  const [value, setValue] = useState('');
  const [arrives, setArrives] = useState(false);
  const [start, setStart] = useState<YM>(compareYM(ym, today) < 0 ? today : ym);
  const [error, setError] = useState('');
  // Under the household's split method, the newcomer's contribution is worked out by it.
  const method = splitRuleAt(model, arrives ? start : today)?.settings?.method;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return failOn('nm-name', setError, t.nameRequired);
    const check = validate(salary, method ? 'all' : mode, value);
    if (check.error) return setError(check.error);
    const person: Person = { id: newId('m'), name: name.trim(), salary: roundCents(check.s) };
    if (arrives) person.startDate = startDateOf(start);
    if (!method && mode !== 'all') person.contributions = [{ from: arrives ? start : today, mode, value: roundCents(check.v) }];
    const contribution = contributionOf(mode, check.s, check.v);
    const from = arrives ? formatMonthLong(start) : undefined;
    commit((m) => upsertPerson(m, person), {
      message: method ? t.joinedMethod(person.name, from) : t.joined(person.name, fmt(contribution), from),
    });
    onClose();
  };

  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={t.newTitle} description={t.newDescription}>
      <form onSubmit={submit} className="flex flex-col gap-5">
        <div>
          <FieldLabel htmlFor="nm-name">{t.firstName}</FieldLabel>
          <Input id="nm-name" value={name} onChange={(e) => { setName(e.target.value); setError(''); }} placeholder={t.namePlaceholder} className="h-12 rounded-xl text-base" autoComplete="off" />
        </div>
        <MoneyFields
          idPrefix="nm"
          salary={salary}
          setSalary={setSalary}
          mode={mode}
          setMode={setMode}
          value={value}
          setValue={setValue}
          onEdit={() => setError('')}
          followsMethod={method ? t.newMethodNote(splitRuleText(method)) : undefined}
        />
        <div>
          <span className="mb-2 block text-sm font-semibold">{t.inHousehold}</span>
          <div role="group" aria-label={t.joiningAria} className="flex flex-wrap gap-2">
            <ChipToggle pressed={!arrives} onClick={() => setArrives(false)}>{t.fromNow}</ChipToggle>
            <ChipToggle pressed={arrives} onClick={() => setArrives(true)}>{t.fromAMonth}</ChipToggle>
          </div>
          {arrives && (
            <div className="mt-3">
              <MonthPicker value={start} onChange={setStart} prefix={t.joinsIn} ariaLabel={t.joining} />
            </div>
          )}
        </div>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" className="min-h-[48px]">{t.addToHousehold}</Button>
      </form>
    </ResponsiveSheet>
  );
}

function EditMember({ person, ym, onClose }: { person: Person; ym: YM; onClose: () => void }) {
  const { commit, today, fmt, engine, openSheet, model } = useBudget();
  const t = useT(M);
  const resolved = resolvePerson(person, ym);
  const rule = stepAt(person.contributions, ym);
  const initialSalary = resolved?.salary ?? person.salary;
  const initialMode: ContributionMode = resolved?.contributionAdjusted ? 'fixed' : rule?.mode ?? 'all';
  const initialValue = resolved?.contributionAdjusted
    ? String(resolved.contribution)
    : rule && rule.mode !== 'all'
      ? String(rule.value ?? '')
      : '';

  const [salary, setSalary] = useState(String(initialSalary));
  const [mode, setMode] = useState<ContributionMode>(initialMode);
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const closed = engine.isClosed(ym);
  const monthLabel = formatMonthLong(ym);
  const method = closed ? undefined : splitRuleAt(model, ym)?.settings?.method;
  const check = validate(salary, mode, value);
  const changed = useMemo(() => {
    if (check.error) return true;
    const planned = resolved ? resolved.contribution : 0;
    return roundCents(check.s) !== roundCents(initialSalary) || contributionOf(mode, check.s, check.v) !== planned || mode !== initialMode;
  }, [check.error, check.s, check.v, mode, resolved, initialSalary, initialMode]);

  const apply = (scope: 'month' | 'forward') => {
    if (check.error) return setError(check.error);
    const ruleValue = mode === 'all' ? undefined : roundCents(check.v);
    commit((m) => setPersonMoney(m, person.id, ym, check.s, { mode, value: ruleValue }, scope, today), {
      message:
        scope === 'month'
          ? t.appliedMonth(person.name, monthLabel)
          : t.appliedForward(person.name, monthLabel),
    });
    onClose();
  };

  return (
    <ResponsiveSheet
      open
      onOpenChange={(o) => !o && onClose()}
      title={person.name}
      description={resolved ? t.inMonth(monthLabel) : t.notInHousehold(monthLabel)}
    >
      {closed && (
        <p className="rounded-xl bg-stone-100 px-3.5 py-3 text-sm text-stone-800">
          {t.closedNote(formatMonthTitle(ym))}
        </p>
      )}
      <div className="flex flex-col gap-5">
        <MoneyFields
          idPrefix="em"
          salary={salary}
          setSalary={setSalary}
          mode={mode}
          setMode={setMode}
          value={value}
          setValue={setValue}
          onEdit={() => setError('')}
          salaryHint={amountHistoryHint(person.salaryHistory, ym, fmt)}
          contributionHint={contributionHistoryHint(person, ym, fmt)}
          methodNote={method ? t.methodNote(splitRuleText(method)) : undefined}
        />
        <ErrorText>{error}</ErrorText>
        {changed ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">{t.applyTo}</span>
            {!closed && resolved && (
              <ChoiceCard
                title={t.only(monthNames()[monthIndex0(ym)])}
                help={t.onlyHelp}
                onClick={() => apply('month')}
              />
            )}
            <ChoiceCard title={t.fromOn(formatMonthShort(ym))} help={t.earlierStay} onClick={() => apply('forward')} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t.editHint}</p>
        )}
      </div>

      <div className="border-t border-border/70 pt-3">
        <button
          type="button"
          aria-expanded={showSettings}
          onClick={() => setShowSettings((s) => !s)}
          className="flex min-h-[44px] w-full items-center justify-between rounded-lg text-left text-[15px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t.settingsToggle}
          <ChevronDown className={cn('h-4 w-4 transition-transform', showSettings && 'rotate-180')} aria-hidden="true" />
        </button>
        {showSettings && <MemberSettings person={person} onDone={onClose} />}
      </div>
      <Button variant="ghost" className="min-h-[44px] justify-start text-destructive hover:text-destructive" onClick={() => openSheet({ kind: 'memberDelete', id: person.id })}>
        <Trash2 className="h-4 w-4" /> {t.deleteName(person.name)}
      </Button>
    </ResponsiveSheet>
  );
}

function MemberSettings({ person, onDone }: { person: Person; onDone: () => void }) {
  const { commit, today } = useBudget();
  const t = useT(M);
  const w = windowOf(person);
  const [name, setName] = useState(person.name);
  const [hasStart, setHasStart] = useState(!!w.start);
  const [start, setStart] = useState<YM>(w.start ?? today);
  const [hasEnd, setHasEnd] = useState(!!w.end);
  const [end, setEnd] = useState<YM>(w.end ?? maxYM(today, w.start ?? today));
  const [error, setError] = useState('');

  const save = () => {
    if (!name.trim()) return failOn('ms-name', setError, t.nameEmpty);
    if (hasStart && hasEnd && compareYM(end, start) < 0) return setError(t.leaveBeforeJoin);
    commit(
      (m) =>
        updatePerson(m, person.id, {
          name: name.trim(),
          startDate: hasStart ? startDateOf(start) : undefined,
          endDate: hasEnd ? endDateOf(end) : undefined,
        }),
      {
        message: hasEnd
          ? t.lastMonthSaved(name.trim(), formatMonthLong(end))
          : t.settingsSaved(name.trim()),
      },
    );
    onDone();
  };

  return (
    <div className="mt-2 flex flex-col gap-4">
      <div>
        <FieldLabel htmlFor="ms-name">{t.firstName}</FieldLabel>
        <Input id="ms-name" value={name} onChange={(e) => { setName(e.target.value); setError(''); }} className="h-12 rounded-xl text-base" autoComplete="off" />
      </div>
      <div>
        <span className="mb-2 block text-sm font-semibold">{t.joining}</span>
        <div role="group" aria-label={t.joining} className="flex flex-wrap gap-2">
          <ChipToggle pressed={!hasStart} onClick={() => setHasStart(false)}>{t.alwaysHere}</ChipToggle>
          <ChipToggle pressed={hasStart} onClick={() => setHasStart(true)}>{t.from}</ChipToggle>
        </div>
        {hasStart && (
          <div className="mt-3">
            <MonthPicker value={start} onChange={setStart} prefix={t.joinsIn} ariaLabel={t.joining} />
          </div>
        )}
      </div>
      <div>
        <span className="mb-2 block text-sm font-semibold">{t.leaving}</span>
        <div role="group" aria-label={t.leaving} className="flex flex-wrap gap-2">
          <ChipToggle pressed={!hasEnd} onClick={() => setHasEnd(false)}>{t.stays}</ChipToggle>
          <ChipToggle pressed={hasEnd} onClick={() => setHasEnd(true)}>{t.leaves}</ChipToggle>
        </div>
        {hasEnd && (
          <div className="mt-3">
            <MonthPicker value={end} onChange={setEnd} min={hasStart ? start : undefined} prefix={t.lastMonthPrefix} ariaLabel={t.lastMonthAria} />
            <p className="mt-1.5 text-xs text-muted-foreground">{t.lastMonthHelp}</p>
          </div>
        )}
      </div>
      <ErrorText>{error}</ErrorText>
      <Button type="button" variant="outline" className="min-h-[44px]" onClick={save}>{t.saveSettings}</Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------
export function MemberDeleteSheet({ sheet, onClose }: SheetProps<'memberDelete'>) {
  const { commit, model, today } = useBudget();
  const t = useT(M);
  const person = model.people.find((p) => p.id === sheet.id);
  if (!person) return null;
  const closedMonths = Object.entries(model.months)
    .filter(([, rec]) => rec.snapshot?.people.some((p) => p.id === person.id))
    .map(([ym]) => ym)
    .sort(compareYM);
  const confirm = () => {
    commit((m) => removePerson(m, person.id), { message: t.removed(person.name) });
    onClose();
  };
  const leaveInstead = () => {
    const last = addMonths(today, -1);
    commit((m) => updatePerson(m, person.id, { endDate: endDateOf(maxYM(last, windowOf(person).start ?? last)) }), {
      message: t.leftFrom(person.name, formatMonthLong(today)),
    });
    onClose();
  };
  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={t.deleteTitle(person.name)}>
      <p className="flex gap-2.5 rounded-xl bg-emerald-50 px-3.5 py-3 text-sm text-emerald-950">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          {closedMonths.length
            ? t.closedKeep(closedMonths.length, `${formatMonthShort(closedMonths[0])}${closedMonths.length > 1 ? ` → ${formatMonthShort(closedMonths[closedMonths.length - 1])}` : ''}`)
            : t.notInClosed}
        </span>
      </p>
      <p className="flex gap-2.5 rounded-xl bg-orange-50 px-3.5 py-3 text-sm text-orange-950">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{t.deleteWarning}</span>
      </p>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" className="min-h-[44px]" onClick={onClose}>{t.cancel}</Button>
        <Button variant="outline" className="min-h-[44px]" onClick={leaveInstead}>{t.stopCounting(formatMonthLong(today))}</Button>
        <Button variant="destructive" className="min-h-[44px]" onClick={confirm}>{t.delete}</Button>
      </div>
    </ResponsiveSheet>
  );
}

// ---------------------------------------------------------------------------
// History: successive salaries and contributions, month-only exceptions and
// what the member actually put in, month by month (frozen for closed months).
// ---------------------------------------------------------------------------
function StepTimeline({ title, rows }: { title: string; rows: Array<{ key: string; period: string; value: string; current: boolean }> }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      <ol className="flex flex-col">
        {rows.map((row) => (
          <li key={row.key} className="relative ml-1.5 flex min-h-[40px] items-center gap-3 border-l-2 border-border pl-4">
            <span aria-hidden="true" className={cn('absolute -left-[7px] h-3 w-3 rounded-full border-2 border-background', row.current ? 'bg-primary' : 'bg-muted-foreground/40')} />
            <span className="flex-1 text-sm">{row.period}</span>
            <strong className="text-sm tabular-nums">{row.value}</strong>
          </li>
        ))}
      </ol>
    </div>
  );
}

function periodsOf<T extends { from: YM }>(steps: T[], start: YM | undefined, end: YM | undefined, ref: YM) {
  const current = stepAt(steps, ref);
  const t = pick(M);
  return steps
    .map((s, i) => {
      const next = steps[i + 1];
      const to = next ? addMonths(next.from, -1) : end;
      const from = i === 0 ? start ?? s.from : s.from;
      const period = from && to ? `${formatMonthShort(from)} → ${formatMonthShort(to)}` : from ? t.since(formatMonthShort(from)) : to ? t.until(formatMonthShort(to)) : t.always;
      return { step: s, key: `${s.from}-${i}`, period, current: s === current };
    })
    .reverse();
}

export function MemberDetailSheet({ sheet, onClose }: SheetProps<'memberDetail'>) {
  const { model, engine, fmt, today, commit, openSheet } = useBudget();
  const t = useT(M);
  const person = model.people.find((p) => p.id === sheet.id);
  if (!person) return null;
  const w = windowOf(person);
  const ref = w.end && compareYM(w.end, today) < 0 ? w.end : w.start && compareYM(w.start, today) > 0 ? w.start : today;

  const salarySteps = sortSteps(person.salaryHistory?.length ? person.salaryHistory : [{ from: w.start ?? today, amount: person.salary }]);
  const salaryRows = periodsOf(salarySteps, w.start, w.end, ref).map((r) => ({ ...r, value: fmt(r.step.amount) }));
  const contributionSteps = sortSteps(person.contributions?.length ? person.contributions : [{ from: w.start ?? today, mode: 'all' as const }]);
  const contributionRows = periodsOf(contributionSteps, w.start, w.end, ref).map((r) => ({ ...r, value: contributionStepText(r.step, fmt) }));

  const exceptionMonths = Array.from(new Set([...Object.keys(person.salaryOverrides ?? {}), ...Object.keys(person.contributionOverrides ?? {})])).sort(compareYM);

  // Month by month: the 6 months before today and the 6 after (within the member's window).
  const months: YM[] = [];
  for (let i = -6; i <= 5; i++) {
    const ym = addMonths(today, i);
    if ((!w.start || compareYM(ym, w.start) >= 0) && (!w.end || compareYM(ym, w.end) <= 0)) months.push(ym);
  }
  const monthRows = months
    .map((ym) => ({ ym, r: engine.month(ym).people.find((p) => p.id === person.id), closed: engine.isClosed(ym) }))
    .filter((x) => !!x.r)
    .reverse();

  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={t.historyTitle(person.name)}>
      <StepTimeline title={t.salaries} rows={salaryRows} />
      <StepTimeline title={t.contributions} rows={contributionRows} />

      {exceptionMonths.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">{t.exceptions}</h3>
          <div className="flex flex-col gap-1.5">
            {exceptionMonths.map((ym) => {
              const s = person.salaryOverrides?.[ym];
              const c = person.contributionOverrides?.[ym];
              const text = [s !== undefined ? t.exceptionSalary(fmt(s)) : '', c !== undefined ? t.exceptionPaysIn(fmt(c)) : ''].filter(Boolean).join(' · ');
              const closed = engine.isClosed(ym);
              return (
                <div key={ym} className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2 text-sm">
                  <span className="flex-1">
                    <strong>{formatMonthTitle(ym)}</strong> · {text}
                  </span>
                  {closed ? (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Lock className="h-3 w-3" aria-hidden="true" /> {t.closed}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="py-1 text-sm font-semibold text-primary underline underline-offset-4"
                      onClick={() => commit((m) => clearPersonMonthException(m, person.id, ym), { message: t.exceptionDeleted(formatMonthLong(ym)) })}
                    >
                      {t.delete}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {monthRows.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">{t.monthByMonth}</h3>
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th scope="col" className="px-3 py-2 font-semibold">{t.month}</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">{t.payCol}</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">{t.paysInCol}</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">{t.spendingMoney}</th>
                </tr>
              </thead>
              <tbody>
                {monthRows.map(({ ym, r, closed }) => (
                  <tr key={ym} className={cn('border-t border-border/60', ym === today && 'bg-primary/5')}>
                    <th scope="row" className="px-3 py-2 text-left font-medium">
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        {formatMonthShort(ym)}
                        {closed && <Lock className="h-3 w-3 text-muted-foreground" aria-label={t.closed} />}
                      </span>
                      {(r!.salaryAdjusted || r!.contributionAdjusted) && <span className="block text-xs font-normal text-sky-700">{t.exception}</span>}
                    </th>
                    <td className="px-3 py-2 text-right tabular-nums">{fmt(r!.salary)}</td>
                    <td className="px-3 py-2 text-right font-semibold tabular-nums text-emerald-700">{fmt(r!.contribution)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {fmt(r!.keep)}
                      {r!.personalCharges > 0 && <span className="block text-xs text-muted-foreground">{t.personal(fmt(r!.personalCharges))}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{t.frozenNote}</p>
        </div>
      )}

      <Button variant="outline" className="min-h-[44px]" onClick={() => openSheet({ kind: 'member', id: person.id, ym: maxYM(today, w.start ?? today) })}>
        {t.editMoney}
      </Button>
    </ResponsiveSheet>
  );
}
