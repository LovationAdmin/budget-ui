// src/components/budget/sheets/MemberSheets.tsx
// A household member: net salary AND what they put into the household pot
// (all of it, a fixed amount or a percentage), for one month only or from a
// month on; arrival / departure; deletion.

import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useBudget } from '@/contexts/BudgetContext';
import type { ContributionMode, Person, YM } from '@/lib/budget/types';
import {
  amountHistoryHint,
  contributionFor,
  contributionHistoryHint,
  resolvePerson,
  stepAt,
  windowOf,
} from '@/lib/budget/engine';
import { newId, removePerson, setPersonMoney, updatePerson, upsertPerson } from '@/lib/budget/mutations';
import {
  addMonths,
  compareYM,
  endDateOf,
  formatMonthLong,
  formatMonthShort,
  formatMonthTitle,
  maxYM,
  monthIndex0,
  MONTH_NAMES,
  startDateOf,
  deMonth,
} from '@/lib/budget/months';
import { parseAmount, roundCents } from '@/lib/budget/format';
import { ResponsiveSheet } from '../shared/ResponsiveSheet';
import { MonthPicker } from '../shared/MonthPicker';
import { ChipToggle, ChoiceCard, ErrorText, FieldLabel, MoneyInput, Segmented } from '../shared/primitives';
import type { SheetProps } from './BudgetSheets';

const MODE_OPTIONS: Array<{ value: ContributionMode; label: string }> = [
  { value: 'all', label: 'Tout le salaire' },
  { value: 'fixed', label: 'Montant fixe' },
  { value: 'percent', label: 'Pourcentage' },
];

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
}) {
  const { fmt, currencySymbol } = useBudget();
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
        <FieldLabel htmlFor={`${idPrefix}-salary`} hint="(net, par mois)">Salaire</FieldLabel>
        <MoneyInput id={`${idPrefix}-salary`} value={salary} onChange={(e) => { setSalary(e.target.value); onEdit(); }} placeholder="0" suffix={currencySymbol} />
        {salaryHint && <p className="mt-1.5 text-xs text-muted-foreground">{salaryHint}</p>}
      </div>
      <div>
        <span className="mb-2 block text-sm font-semibold">Ce qu’il/elle verse au pot commun</span>
        <Segmented label="Contribution au pot commun" value={mode} options={MODE_OPTIONS} onChange={pickMode} />
        {mode !== 'all' && (
          <div className="mt-3">
            <FieldLabel htmlFor={`${idPrefix}-value`}>{mode === 'percent' ? 'Pourcentage du salaire' : 'Montant versé chaque mois'}</FieldLabel>
            <MoneyInput id={`${idPrefix}-value`} value={value} onChange={(e) => { setValue(e.target.value); onEdit(); }} placeholder="0" suffix={mode === 'percent' ? '%' : currencySymbol} />
          </div>
        )}
        {contributionHint && <p className="mt-1.5 text-xs text-muted-foreground">{contributionHint}</p>}
      </div>
      <div className="rounded-xl border border-teal-100 bg-teal-50 px-4 py-3">
        <p className="text-[15px] font-semibold text-teal-950">
          Verse {fmt(contribution)} au pot commun · garde {fmt(keep)} pour soi
        </p>
        {sOk && contribution > s && <p className="mt-1 text-sm text-orange-900">La contribution dépasse le salaire.</p>}
      </div>
    </>
  );
}

function validate(salary: string, mode: ContributionMode, value: string): { error: string; s: number; v: number } {
  const s = parseAmount(salary === '' ? '0' : salary);
  const v = parseAmount(value);
  if (!Number.isFinite(s) || s < 0) return { error: 'Indiquez un salaire valide (0 si aucun revenu).', s, v };
  if (mode === 'percent' && (!Number.isFinite(v) || v < 0 || v > 100)) return { error: 'Le pourcentage doit être entre 0 et 100.', s, v };
  if (mode === 'fixed' && (!Number.isFinite(v) || v < 0)) return { error: 'Indiquez le montant versé chaque mois.', s, v };
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
  const { commit, today, fmt } = useBudget();
  const [name, setName] = useState('');
  const [salary, setSalary] = useState('');
  const [mode, setMode] = useState<ContributionMode>('all');
  const [value, setValue] = useState('');
  const [arrives, setArrives] = useState(false);
  const [start, setStart] = useState<YM>(compareYM(ym, today) < 0 ? today : ym);
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Indiquez un prénom.');
    const check = validate(salary, mode, value);
    if (check.error) return setError(check.error);
    const person: Person = { id: newId('m'), name: name.trim(), salary: roundCents(check.s) };
    if (arrives) person.startDate = startDateOf(start);
    if (mode !== 'all') person.contributions = [{ from: arrives ? start : today, mode, value: roundCents(check.v) }];
    const contribution = contributionOf(mode, check.s, check.v);
    commit((m) => upsertPerson(m, person), {
      message: `${person.name} fait partie du foyer${arrives ? ` à partir ${deMonth(formatMonthLong(start))}` : ''} : ${fmt(contribution)} par mois au pot commun.`,
    });
    onClose();
  };

  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title="Nouveau membre du foyer" description="Son salaire et ce qu’il/elle met dans le pot commun.">
      <form onSubmit={submit} className="flex flex-col gap-5">
        <div>
          <FieldLabel htmlFor="nm-name">Prénom</FieldLabel>
          <Input id="nm-name" value={name} onChange={(e) => { setName(e.target.value); setError(''); }} placeholder="Ex. : Camille" className="h-12 rounded-xl text-base" autoComplete="off" />
        </div>
        <MoneyFields idPrefix="nm" salary={salary} setSalary={setSalary} mode={mode} setMode={setMode} value={value} setValue={setValue} onEdit={() => setError('')} />
        <div>
          <span className="mb-2 block text-sm font-semibold">Dans le foyer</span>
          <div role="group" aria-label="Arrivée dans le foyer" className="flex flex-wrap gap-2">
            <ChipToggle pressed={!arrives} onClick={() => setArrives(false)}>Dès maintenant</ChipToggle>
            <ChipToggle pressed={arrives} onClick={() => setArrives(true)}>À partir d’un mois…</ChipToggle>
          </div>
          {arrives && (
            <div className="mt-3">
              <MonthPicker value={start} onChange={setStart} prefix="Arrive en" ariaLabel="Arrivée" />
            </div>
          )}
        </div>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" className="min-h-[48px]">Ajouter au foyer</Button>
      </form>
    </ResponsiveSheet>
  );
}

function EditMember({ person, ym, onClose }: { person: Person; ym: YM; onClose: () => void }) {
  const { commit, today, fmt, engine, openSheet } = useBudget();
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
          ? `${person.name} : changement appliqué à ${monthLabel} seulement.`
          : `${person.name} : changement appliqué à partir ${deMonth(monthLabel)}. Les mois d’avant ne bougent pas.`,
    });
    onClose();
  };

  return (
    <ResponsiveSheet
      open
      onOpenChange={(o) => !o && onClose()}
      title={person.name}
      description={resolved ? `En ${monthLabel}` : `Ne fait pas partie du foyer en ${monthLabel}`}
    >
      {closed && (
        <p className="rounded-xl bg-stone-100 px-3.5 py-3 text-sm text-stone-800">
          {formatMonthTitle(ym)} est clôturé : les changements s’appliqueront aux mois suivants.
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
        />
        <ErrorText>{error}</ErrorText>
        {changed ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Appliquer à…</span>
            {!closed && resolved && (
              <ChoiceCard
                title={`${MONTH_NAMES[monthIndex0(ym)]} seulement`}
                help="Une exception (prime, mois sans salaire…) : les autres mois ne changent pas."
                onClick={() => apply('month')}
              />
            )}
            <ChoiceCard title={`À partir ${deMonth(formatMonthShort(ym))}`} help="Les mois d’avant ne bougent pas." onClick={() => apply('forward')} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Modifiez le salaire ou la contribution, puis choisissez à quels mois l’appliquer.</p>
        )}
      </div>

      <div className="border-t border-border/70 pt-3">
        <button
          type="button"
          aria-expanded={showSettings}
          onClick={() => setShowSettings((s) => !s)}
          className="flex min-h-[44px] w-full items-center justify-between rounded-lg text-left text-[15px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Prénom, arrivée, départ
          <ChevronDown className={cn('h-4 w-4 transition-transform', showSettings && 'rotate-180')} aria-hidden="true" />
        </button>
        {showSettings && <MemberSettings person={person} onDone={onClose} />}
      </div>
      <Button variant="ghost" className="min-h-[44px] justify-start text-destructive hover:text-destructive" onClick={() => openSheet({ kind: 'memberDelete', id: person.id })}>
        <Trash2 className="h-4 w-4" /> Supprimer {person.name}
      </Button>
    </ResponsiveSheet>
  );
}

function MemberSettings({ person, onDone }: { person: Person; onDone: () => void }) {
  const { commit, today } = useBudget();
  const w = windowOf(person);
  const [name, setName] = useState(person.name);
  const [hasStart, setHasStart] = useState(!!w.start);
  const [start, setStart] = useState<YM>(w.start ?? today);
  const [hasEnd, setHasEnd] = useState(!!w.end);
  const [end, setEnd] = useState<YM>(w.end ?? maxYM(today, w.start ?? today));
  const [error, setError] = useState('');

  const save = () => {
    if (!name.trim()) return setError('Le prénom ne peut pas être vide.');
    if (hasStart && hasEnd && compareYM(end, start) < 0) return setError('Le départ doit venir après l’arrivée.');
    commit(
      (m) =>
        updatePerson(m, person.id, {
          name: name.trim(),
          startDate: hasStart ? startDateOf(start) : undefined,
          endDate: hasEnd ? endDateOf(end) : undefined,
        }),
      {
        message: hasEnd
          ? `${name.trim()} : dernier mois dans le foyer ${formatMonthLong(end)}. Les mois clôturés ne changent pas.`
          : `${name.trim()} : réglages enregistrés.`,
      },
    );
    onDone();
  };

  return (
    <div className="mt-2 flex flex-col gap-4">
      <div>
        <FieldLabel htmlFor="ms-name">Prénom</FieldLabel>
        <Input id="ms-name" value={name} onChange={(e) => { setName(e.target.value); setError(''); }} className="h-12 rounded-xl text-base" autoComplete="off" />
      </div>
      <div>
        <span className="mb-2 block text-sm font-semibold">Arrivée</span>
        <div role="group" aria-label="Arrivée" className="flex flex-wrap gap-2">
          <ChipToggle pressed={!hasStart} onClick={() => setHasStart(false)}>Toujours là</ChipToggle>
          <ChipToggle pressed={hasStart} onClick={() => setHasStart(true)}>À partir de…</ChipToggle>
        </div>
        {hasStart && (
          <div className="mt-3">
            <MonthPicker value={start} onChange={setStart} prefix="Arrive en" ariaLabel="Arrivée" />
          </div>
        )}
      </div>
      <div>
        <span className="mb-2 block text-sm font-semibold">Départ</span>
        <div role="group" aria-label="Départ" className="flex flex-wrap gap-2">
          <ChipToggle pressed={!hasEnd} onClick={() => setHasEnd(false)}>Reste dans le foyer</ChipToggle>
          <ChipToggle pressed={hasEnd} onClick={() => setHasEnd(true)}>Quitte le foyer…</ChipToggle>
        </div>
        {hasEnd && (
          <div className="mt-3">
            <MonthPicker value={end} onChange={setEnd} min={hasStart ? start : undefined} prefix="Dernier mois :" ariaLabel="Dernier mois dans le foyer" />
            <p className="mt-1.5 text-xs text-muted-foreground">Sa contribution compte jusqu’à ce mois inclus, puis plus du tout.</p>
          </div>
        )}
      </div>
      <ErrorText>{error}</ErrorText>
      <Button type="button" variant="outline" className="min-h-[44px]" onClick={save}>Enregistrer ces réglages</Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------
export function MemberDeleteSheet({ sheet, onClose }: SheetProps<'memberDelete'>) {
  const { commit, model, today } = useBudget();
  const person = model.people.find((p) => p.id === sheet.id);
  if (!person) return null;
  const closedMonths = Object.entries(model.months)
    .filter(([, rec]) => rec.snapshot?.people.some((p) => p.id === person.id))
    .map(([ym]) => ym)
    .sort(compareYM);
  const confirm = () => {
    commit((m) => removePerson(m, person.id), { message: `${person.name} retiré(e) du foyer. Les mois clôturés gardent sa contribution.` });
    onClose();
  };
  const leaveInstead = () => {
    const last = addMonths(today, -1);
    commit((m) => updatePerson(m, person.id, { endDate: endDateOf(maxYM(last, windowOf(person).start ?? last)) }), {
      message: `${person.name} ne compte plus à partir ${deMonth(formatMonthLong(today))}. L’historique est conservé.`,
    });
    onClose();
  };
  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={`Supprimer ${person.name} ?`}>
      <p className="flex gap-2.5 rounded-xl bg-emerald-50 px-3.5 py-3 text-sm text-emerald-950">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          {closedMonths.length
            ? `Les ${closedMonths.length} mois clôturés (${formatMonthShort(closedMonths[0])}${closedMonths.length > 1 ? ` → ${formatMonthShort(closedMonths[closedMonths.length - 1])}` : ''}) gardent sa contribution : leur photo est figée.`
            : 'Il/elle n’apparaît dans aucun mois clôturé.'}
        </span>
      </p>
      <p className="flex gap-2.5 rounded-xl bg-orange-50 px-3.5 py-3 text-sm text-orange-950">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>Sa contribution disparaît des mois ouverts et à venir. Pour un départ du foyer, mieux vaut indiquer un dernier mois.</span>
      </p>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" className="min-h-[44px]" onClick={onClose}>Annuler</Button>
        <Button variant="outline" className="min-h-[44px]" onClick={leaveInstead}>Ne plus compter dès {formatMonthLong(today)}</Button>
        <Button variant="destructive" className="min-h-[44px]" onClick={confirm}>Supprimer</Button>
      </div>
    </ResponsiveSheet>
  );
}
