// src/components/budget/sheets/SavingSheets.tsx
// Savings pots: month actions, amount changes with an explicit scope, money
// spent from a pot (including the general savings), create / edit and delete.

import { useEffect, useMemo, useState } from 'react';
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
  MONTH_NAMES,
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
        <span className="text-sm text-foreground/80">Mis de côté en {month}</span>
        <span className="font-display text-2xl font-extrabold tabular-nums">{s ? (s.skipped ? 'rien' : fmt(s.allocation)) : '—'}</span>
      </div>
      <p className="-mt-2 text-sm text-muted-foreground">
        En caisse fin {formatMonthShort(sheet.ym)} : <strong className="text-foreground">{fmt(balance)}</strong>
        {target > 0 ? ` sur un objectif de ${fmt(target)}` : ''}
        {s && s.spent > 0 ? ` · dépensé ce mois-ci : ${fmt(s.spent)}` : ''}
      </p>
      {s?.adjusted && <p className="-mt-3 text-sm text-amber-800">Prévu : {fmt(s.planned)} · ajusté ce mois-ci</p>}

      <div className="flex flex-col gap-2">
        <ActionItem
          icon={<Pencil />}
          title="Modifier le montant"
          sub={recurring ? 'Pour ce mois seulement, ou à partir de ce mois' : `Le montant mis de côté en ${month}`}
          onClick={() => openSheet({ kind: 'savingAmount', id: p.id, ym: sheet.ym })}
        />
        {recurring && s && !s.skipped && s.allocation > 0 && (
          <ActionItem
            icon={<PauseCircle />}
            title={`Ne rien mettre de côté en ${month}`}
            sub="Une exception : les autres mois ne changent pas"
            onClick={() => {
              commit((m) => setSavingMonthAmount(m, p.id, sheet.ym, 0), {
                message: `Rien ne va dans « ${p.label} » en ${month}. Le reste du mois grossit d’autant.`,
              });
              onClose();
            }}
          />
        )}
        {recurring && s?.skipped && (
          <ActionItem
            icon={<RotateCcw />}
            title={`Rétablir en ${month}`}
            sub={`Remet ${fmt(s.planned)} de côté ce mois-ci`}
            onClick={() => {
              commit((m) => setSavingMonthAmount(m, p.id, sheet.ym, null), { message: `« ${p.label} » rétablie en ${month}.` });
              onClose();
            }}
          />
        )}
        <ActionItem
          icon={<ShoppingBag />}
          title="Payer une dépense avec cette épargne"
          sub="Ex. : les vacances payées avec la cagnotte"
          onClick={() => openSheet({ kind: 'spend', ym: sheet.ym, potId: p.id })}
        />
        {recurring && status !== 'ended' && (
          <ActionItem
            icon={<StopCircle />}
            title={`Arrêter après ${month}`}
            sub="Son solde reste disponible pour vos dépenses"
            onClick={() => {
              commit((m) => stopProject(m, p.id, sheet.ym), {
                message: `« ${p.label} » s’arrête après ${month}. Son solde reste disponible.`,
              });
              onClose();
            }}
          />
        )}
        <ActionItem icon={<Settings2 />} title="Réglages" sub="Nom, objectif, dates" onClick={() => openSheet({ kind: 'savingEditor', id: p.id, ym: sheet.ym })} />
        <ActionItem danger icon={<Trash2 />} title="Supprimer" sub="Les mois clôturés la gardent" onClick={() => openSheet({ kind: 'savingDelete', id: p.id })} />
      </div>
    </ResponsiveSheet>
  );
}

// ---------------------------------------------------------------------------
// Amount change
// ---------------------------------------------------------------------------
export function SavingAmountSheet({ sheet, onClose }: SheetProps<'savingAmount'>) {
  const { fmt, commit, today, model, engine, currencySymbol } = useBudget();
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
      if (!valid) return failOn('sa-amount', setError, 'Indiquez un montant valide (0 ou plus).');
      if (closed) return setError(`${formatMonthTitle(fromYm)} est clôturé : choisissez un mois ouvert.`);
      commit((m) => setSavingMonthAmount(m, p.id, fromYm, v), {
        message: v > 0 ? `${fmt(v)} mis de côté dans « ${p.label} » en ${monthLabel}.` : `Rien dans « ${p.label} » en ${monthLabel}.`,
      });
      onClose();
    };
    const convert = () => {
      if (!valid || v <= 0) return failOn('sa-amount', setError, 'Indiquez un montant supérieur à 0.');
      commit((m) => convertSavingToMonthly(m, p.id, fromYm, v, today, (ym) => engine.isClosed(ym)), {
        message: `« ${p.label} » : ${fmt(v)} chaque mois à partir ${deMonth(monthLabel)}.`,
      });
      onClose();
    };
    return (
      <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={`« ${p.label} »`} description="Épargne libre : vous choisissez le montant mois par mois.">
        <form onSubmit={submit} className="flex flex-col gap-4">
          {sheet.fromCatalog && (
            <div>
              <FieldLabel htmlFor="sa-month">Mois</FieldLabel>
              <MonthPicker id="sa-month" value={fromYm} onChange={setFromYm} min={firstOpen} ariaLabel="Mois" />
            </div>
          )}
          <div>
            <FieldLabel htmlFor="sa-amount">Mis de côté en {monthLabel}</FieldLabel>
            <MoneyInput id="sa-amount" big value={value} onChange={(e) => { setValue(e.target.value); setError(''); }} placeholder="0" suffix={currencySymbol} />
          </div>
          <ErrorText>{error}</ErrorText>
          <Button type="submit" className="min-h-[48px]">Enregistrer pour {monthLabel}</Button>
          <ChoiceCard
            icon={<Repeat />}
            title={`Mettre ce montant chaque mois à partir ${deMonth(formatMonthShort(fromYm))}`}
            help="Elle devient une épargne mensuelle. Les montants déjà prévus avant restent."
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
    if (!valid) return failOn('sa-amount', setError, 'Indiquez un montant valide (0 ou plus).');
    if (scope === 'month') {
      commit((m) => setSavingMonthAmount(m, p.id, fromYm, v), { message: `« ${p.label} » : ${fmt(v)} en ${monthLabel} seulement.` });
    } else if (scope === 'forward') {
      commit((m) => setSavingAmountFrom(m, p.id, fromYm, v, today), {
        message: `« ${p.label} » : ${fmt(v)} par mois à partir ${deMonth(monthLabel)}. Les mois d’avant gardent leur montant.`,
      });
    } else {
      commit((m) => setSavingAmountEverywhere(m, p.id, v), { message: `« ${p.label} » corrigée sur tous les mois ouverts. Les mois clôturés ne bougent pas.` });
    }
    onClose();
  };

  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={`Modifier « ${p.label} »`} description={describeProjectSchedule(p, today)}>
      {sheet.fromCatalog && (
        <div>
          <FieldLabel htmlFor="sa-from">À partir de</FieldLabel>
          <MonthPicker id="sa-from" value={fromYm} onChange={setFromYm} min={minFrom} ariaLabel="À partir de" />
        </div>
      )}
      <div>
        <FieldLabel htmlFor="sa-amount">Montant mis de côté chaque mois</FieldLabel>
        <MoneyInput id="sa-amount" big value={value} onChange={(e) => { setValue(e.target.value); setError(''); }} placeholder="0" suffix={currencySymbol} />
        <p className="mt-1.5 text-sm text-muted-foreground">Actuellement : {fmt(initial)}</p>
        <div className="mt-2"><ErrorText>{error}</ErrorText></div>
      </div>
      <div className="flex flex-col gap-2">
        {!sheet.fromCatalog && <span className="text-sm font-semibold">Appliquer ce montant à…</span>}
        {canMonthOnly && (
          <ChoiceCard title={`${MONTH_NAMES[monthIndex0(fromYm)]} seulement`} help={`Une exception : les autres mois restent à ${fmt(r!.planned)}.`} onClick={() => apply('month')} />
        )}
        <ChoiceCard
          title={`À partir ${deMonth(formatMonthShort(fromYm))}`}
          help={prevAmount !== null ? `Les mois d’avant gardent ${fmt(prevAmount)}.` : 'S’applique dès le premier mois.'}
          onClick={() => apply('forward')}
          selected={sheet.fromCatalog}
        />
        <button type="button" onClick={() => apply('all')} className="self-start py-2 text-sm font-semibold text-primary underline underline-offset-4 hover:text-primary/80">
          Corriger une erreur de saisie sur tous les mois ouverts
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
    return [...list, { id: GENERAL_SAVINGS_ID, label: 'Épargne générale', balance: engine.generalBalance(ym), status: 'active' as const }];
  }, [model.projects, engine, ym, potId]);

  const pot = pots.find((p) => p.id === potId) ?? pots[pots.length - 1];
  const rec = model.months[ym];
  const existing = roundCents(rec?.expenses?.[pot.id] ?? 0);
  const existingComment = rec?.expenseComments?.[pot.id] ?? '';
  const closed = engine.isClosed(ym);
  const v = parseAmount(amount);
  const after = Number.isFinite(v) ? pot.balance - v : pot.balance;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!Number.isFinite(v) || v <= 0) return failOn('sp-amount', setError, 'Indiquez un montant supérieur à 0.');
    if (closed) return setError(`${formatMonthTitle(ym)} est clôturé : choisissez un mois ouvert ou rouvrez-le.`);
    const total = roundCents(existing + v);
    const comment = [existingComment, label.trim()].filter(Boolean).join(' · ');
    commit((m) => setPotExpense(m, pot.id, ym, total, comment), {
      message: `${fmt(v)} payés avec « ${pot.label} » en ${formatMonthLong(ym)}.`,
    });
    onClose();
  };

  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title="Dépense payée par une épargne" description="L’argent sort de la cagnotte choisie, pas du budget du mois.">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <span className="mb-2 block text-sm font-semibold">Quelle épargne ?</span>
          <div role="radiogroup" aria-label="Épargne utilisée" className="flex flex-col gap-2">
            {pots.map((p) => (
              <ChoiceCard
                key={p.id}
                role="radio"
                selected={p.id === pot.id}
                onClick={() => { setPotId(p.id); setError(''); }}
                title={p.label}
                help={`En caisse : ${fmt(p.balance)}`}
              />
            ))}
          </div>
        </div>
        <div>
          <FieldLabel htmlFor="sp-month">Mois</FieldLabel>
          <MonthPicker id="sp-month" value={ym} onChange={(x) => { setYm(x); setError(''); }} ariaLabel="Mois de la dépense" />
          {closed && (
            <p className="mt-2 text-sm text-orange-900">
              {formatMonthTitle(ym)} est clôturé.{' '}
              <button type="button" className="font-semibold underline underline-offset-2" onClick={() => openSheet({ kind: 'reopen', ym })}>
                Le rouvrir
              </button>
            </p>
          )}
        </div>
        <div>
          <FieldLabel htmlFor="sp-amount">Montant</FieldLabel>
          <MoneyInput id="sp-amount" value={amount} onChange={(e) => { setAmount(e.target.value); setError(''); }} placeholder="0" suffix={currencySymbol} />
          {Number.isFinite(v) && v > 0 && (
            <p className={cn('mt-1.5 text-sm', after < 0 ? 'text-orange-900' : 'text-muted-foreground')}>
              Reste dans « {pot.label} » : {fmt(after)}
              {after < 0 ? ' — la cagnotte passera dans le rouge.' : ''}
            </p>
          )}
        </div>
        <div>
          <FieldLabel htmlFor="sp-label" hint="(optionnel)">Pour quoi ?</FieldLabel>
          <Input id="sp-label" autoComplete="off" value={label} maxLength={80} onChange={(e) => setLabel(e.target.value)} placeholder="Ex. : location de vacances, réparation…" className="h-12 rounded-xl text-base" />
        </div>
        {existing > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3.5 py-3 text-sm">
            <span className="flex-1">
              Déjà {fmt(existing)} payés avec cette épargne en {formatMonthLong(ym)}
              {existingComment ? ` (${existingComment})` : ''}. Le nouveau montant s’y ajoute.
            </span>
            {!closed && (
              <button
                type="button"
                className="py-1 text-sm font-semibold text-primary underline underline-offset-4"
                onClick={() => commit((m) => setPotExpense(m, pot.id, ym, 0, ''), { message: `Dépense ${deMonth(formatMonthLong(ym))} retirée de « ${pot.label} ».` })}
              >
                Retirer
              </button>
            )}
          </div>
        )}
        <ErrorText>{error}</ErrorText>
        <Button type="submit" className="min-h-[48px]">Enregistrer la dépense</Button>
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
    summary = 'Vous choisissez le montant chaque mois, directement dans la vue Mois.';
  } else {
    const amountText = amountOk ? fmt(monthlyAmount) : `… ${currencySymbol}`;
    summary = `${amountText} mis de côté chaque mois, à partir ${deMonth(formatMonthLong(start))}`;
    if (endYm) {
      const n = monthsBetween(start, endYm);
      summary += ` jusqu’en ${formatMonthLong(endYm)} (${n} mois${amountOk ? `, soit ${fmt(monthlyAmount * n)}` : ''}).`;
    } else summary += ', sans date de fin.';
  }
  let goal = '';
  if (kind === 'monthly' && hasTarget && amountOk) {
    const n = Math.ceil(targetValue / monthlyAmount);
    const reach = addMonths(start, n - 1);
    goal = endYm && compareYM(reach, endYm) > 0
      ? `L’échéance arrive avant l’objectif : il manquera ${fmt(targetValue - monthlyAmount * monthsBetween(start, endYm))}.`
      : `Objectif de ${fmt(targetValue)} atteint en ${formatMonthLong(reach)} si rien n’est dépensé.`;
  }
  const impact = editing
    ? 'Les mois clôturés ne changent pas ; les mois ouverts suivent les nouveaux réglages.'
    : kind === 'free'
      ? 'Rien n’est mis de côté tant que vous n’indiquez pas de montant.'
      : !amountOk
        ? ''
        : compareYM(sheet.ym, start) >= 0 && (!endYm || compareYM(sheet.ym, endYm) <= 0)
          ? `En ${formatMonthLong(sheet.ym)} : ${fmt(monthlyAmount)} mis de côté, le reste du pot baisse d’autant.`
          : `Rien en ${formatMonthLong(sheet.ym)} : premier versement en ${formatMonthLong(start)}.`;

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
    if (!label.trim()) return failOn('sv-label', setError, 'Donnez un nom (ex. : Vacances, Voiture, Coup dur…).');
    if (target.trim() && !hasTarget) return failOn('sv-target', setError, 'L’objectif doit être un montant supérieur à 0.');
    if (kind === 'monthly' && !editing && !amountOk) return failOn('sv-amount', setError, hasTarget ? 'Indiquez le montant mis de côté chaque mois, ou une date « Jusqu’à… » pour le calculer depuis l’objectif.' : 'Indiquez le montant mis de côté chaque mois.');
    if (endYm && compareYM(endYm, start) < 0) return setError('La fin doit venir après le début.');
    const name = label.trim();
    if (editing) {
      const patch: Partial<Project> = { label: name, targetAmount: hasTarget ? roundCents(targetValue) : undefined };
      if (existingKind === 'monthly') {
        patch.startDate = startDateOf(start);
        patch.endDate = endYm ? endDateOf(endYm) : undefined;
      }
      commit((m) => updateProject(m, existing!.id, patch), { message: `« ${name} » mise à jour.` });
    } else {
      const project: Project = { id: newId('p'), label: name };
      if (hasTarget) project.targetAmount = roundCents(targetValue);
      if (kind === 'monthly') {
        project.monthlyAmount = roundCents(value);
        project.startDate = startDateOf(start);
        if (endYm) project.endDate = endDateOf(endYm);
      }
      commit((m) => upsertProject(m, project), { message: `« ${name} » ajoutée à vos épargnes.`, saveNow: !!then });
    }
    onClose();
    // The split assistant then includes the new saving in the month's need.
    if (then === 'split') navigate(`/budget/${budgetId}/complete/members#repartition`);
    if (then === 'ai') {
      const goalText = hasTarget
        ? `Objectif prioritaire : réunir ${fmt(targetValue)} pour « ${name} »${endYm ? ` d’ici ${formatMonthLong(endYm)} (${monthsBetween(start, endYm)} mois)` : ''}. Aidez-nous à répartir l’effort entre les membres et à trouver où dégager l’argent si le budget ne suffit pas.`
        : `Nouvelle épargne « ${name} » : aidez-nous à trouver un rythme réaliste.`;
      navigate(`/budget/${budgetId}/complete/ai?objectif=${encodeURIComponent(goalText)}`);
    }
  };

  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={editing ? `Réglages de « ${existing!.label} »` : 'Nouvelle épargne'}>
      <form onSubmit={submit} className="flex flex-col gap-5">
        <div>
          <FieldLabel htmlFor="sv-label">Nom</FieldLabel>
          <Input id="sv-label" autoComplete="off" value={label} onChange={(e) => { setLabel(e.target.value); setError(''); }} placeholder="Ex. : Vacances, Voiture, Coup dur…" className="h-12 rounded-xl text-base" />
        </div>

        <div>
          <FieldLabel htmlFor="sv-target" hint="(optionnel)">Objectif</FieldLabel>
          <MoneyInput id="sv-target" value={target} onChange={(e) => { setTarget(e.target.value); setError(''); }} placeholder="Ex. : 3 000" suffix={currencySymbol} />
        </div>

        {editing ? (
          existingKind === 'monthly' ? (
            <p className="rounded-xl bg-muted/60 px-3.5 py-3 text-sm">
              Montant actuel : <strong>{fmt(projectPlanned(existing!, maxYM(today, start)))}</strong> par mois. Pour le changer sans toucher au passé, utilisez « Modifier le montant ».
            </p>
          ) : (
            <p className="rounded-xl bg-muted/60 px-3.5 py-3 text-sm">Épargne libre : le montant se choisit mois par mois. Vous pouvez la passer en montant mensuel depuis « Modifier le montant ».</p>
          )
        ) : (
          <>
            <div>
              <span className="mb-2 block text-sm font-semibold">Comment l’alimenter ?</span>
              <Segmented
                label="Type d’épargne"
                value={kind}
                options={[
                  { value: 'monthly', label: 'Chaque mois' },
                  { value: 'free', label: 'Montant libre' },
                ]}
                onChange={setKind}
              />
            </div>
          </>
        )}

        {kind === 'monthly' && (
          <>
            <div>
              <FieldLabel htmlFor="sv-start">À partir de</FieldLabel>
              <MonthPicker id="sv-start" value={start} onChange={(ym) => { setStart(ym); if (compareYM(end, ym) < 0) setEnd(addMonths(ym, 2)); }} ariaLabel="Début" />
            </div>
            <EndFields start={start} endMode={endMode} setEndMode={setEndMode} count={count} setCount={setCount} end={end} setEnd={setEnd} />
            {!editing && (
              <div>
                <FieldLabel htmlFor="sv-amount">Montant mis de côté chaque mois</FieldLabel>
                <MoneyInput
                  id="sv-amount"
                  value={shownAmount}
                  onChange={(e) => { setAmount(e.target.value); setAmountTouched(true); setError(''); }}
                  placeholder="0"
                  suffix={currencySymbol}
                />
                {planMonthly > 0 && (
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                    <span>
                      Pour réunir {fmt(targetValue)} en {planMonths} mois : <strong className="tabular-nums text-foreground">{fmt(planMonthly)}</strong> par mois.
                    </span>
                    {amountTouched && value !== planMonthly && (
                      <button type="button" className="min-h-[32px] font-semibold text-primary underline underline-offset-4" onClick={() => { setAmount(String(planMonthly)); setAmountTouched(false); }}>
                        Utiliser ce montant
                      </button>
                    )}
                  </p>
                )}
                {hasTarget && !endYm && (
                  <p className="mt-1.5 text-xs text-muted-foreground">Choisissez « Pendant… » ou « Jusqu’à… » ci-dessus : le montant mensuel se calculera depuis l’objectif.</p>
                )}
              </div>
            )}
          </>
        )}

        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">En clair</span>
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
                  ? `Le pot commun peut suivre : sur la période, il reste au moins ${fmt(feasibility.worst.reste)} chaque mois (le plus serré : ${formatMonthLong(feasibility.worst.ym)}).`
                  : `Le pot commun ne suit pas : en ${formatMonthLong(feasibility.worst.ym)}, il ne reste que ${fmt(Math.max(0, feasibility.worst.reste))} pour ${fmt(monthlyAmount)} à mettre de côté. Il manque jusqu’à ${fmt(feasibility.shortfall)} par mois : l’épargne générale comblerait la différence tant qu’elle le peut.`}
              </span>
            </p>
            {feasibility.shortfall > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" className="min-h-[44px] bg-card" onClick={(e) => submit(e as unknown as React.FormEvent, 'split')}>
                  Créer et ajuster les contributions
                </Button>
                <Button type="button" variant="outline" className="min-h-[44px] bg-card" onClick={(e) => submit(e as unknown as React.FormEvent, 'ai')}>
                  <Sparkles className="h-4 w-4" aria-hidden="true" /> Créer et demander un plan au Budget IA
                </Button>
              </div>
            )}
          </div>
        )}

        <ErrorText>{error}</ErrorText>
        <Button type="submit" className="min-h-[48px]">{editing ? 'Enregistrer' : 'Créer l’épargne'}</Button>
      </form>
    </ResponsiveSheet>
  );
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------
export function SavingDeleteSheet({ sheet, onClose }: SheetProps<'savingDelete'>) {
  const { commit, engine, today, fmt, model } = useBudget();
  const p = useProject(sheet.id);
  if (!p) return null;
  const balance = engine.savingBalance(p.id, today);
  const closedMonths = Object.entries(model.months)
    .filter(([, rec]) => rec.snapshot?.projects.some((x) => x.id === p.id && x.allocation !== 0))
    .map(([ym]) => ym)
    .sort(compareYM);
  const recurring = isRecurringProject(p);
  const confirm = () => {
    commit((m) => deleteProject(m, p.id), { message: `« ${p.label} » supprimée. Les mois clôturés la gardent.` });
    onClose();
  };
  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={`Supprimer « ${p.label} » ?`}>
      <p className="flex gap-2.5 rounded-xl bg-emerald-50 px-3.5 py-3 text-sm text-emerald-950">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          {closedMonths.length
            ? `Les ${closedMonths.length} mois clôturés où elle apparaît (${formatMonthShort(closedMonths[0])}${closedMonths.length > 1 ? ` → ${formatMonthShort(closedMonths[closedMonths.length - 1])}` : ''}) la gardent : leur photo est figée.`
            : 'Elle n’apparaît dans aucun mois clôturé.'}
        </span>
      </p>
      <p className="flex gap-2.5 rounded-xl bg-orange-50 px-3.5 py-3 text-sm text-orange-950">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          {balance !== 0 ? `Son solde (${fmt(balance)}) ne sera plus suivi. ` : ''}
          {recurring
            ? 'Les mois ouverts ne mettent plus rien de côté pour elle : ce montant revient dans l’épargne générale. Pour simplement arrêter les versements, utilisez plutôt « Arrêter ».'
            : 'Les montants prévus dans les mois ouverts reviennent dans l’épargne générale.'}
        </span>
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" className="min-h-[44px]" onClick={onClose}>Annuler</Button>
        <Button variant="destructive" className="min-h-[44px]" onClick={confirm}>Supprimer</Button>
      </div>
    </ResponsiveSheet>
  );
}
