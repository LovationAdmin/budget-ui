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
import type { Charge, Frequency, YM } from '@/lib/budget/types';
import {
  chargeBaseAmount,
  chargeFrequency,
  chargeStatus,
  customMonthsText,
  describeChargeSchedule,
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
  MONTHS_LOWER,
  MONTHS_SHORT,
  MONTH_NAMES,
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
  ErrorText,
  FieldLabel,
  MoneyInput,
  Pill,
  Segmented,
} from '../shared/primitives';
import type { SheetProps } from './BudgetSheets';

function useCharge(id: string): Charge | undefined {
  const { model } = useBudget();
  return model.charges.find((c) => c.id === id);
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
  const { fmt, openSheet, commit, today } = useBudget();
  const c = useCharge(sheet.id);
  if (!c) return null;
  const r = resolveCharge(c, sheet.ym);
  const month = formatMonthLong(sheet.ym);
  const once = chargeFrequency(c) === 'once';
  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={c.label} description={describeChargeSchedule(c, today)}>
      <div className="flex items-baseline justify-between gap-3 rounded-xl bg-orange-50/70 px-4 py-3">
        <span className="text-sm text-foreground/80">En {month}</span>
        <span className="font-display text-2xl font-extrabold tabular-nums">{r ? fmt(r.skipped ? r.planned : r.amount) : '—'}</span>
      </div>
      {r?.adjusted && <p className="-mt-2 text-sm text-amber-800">Prévu : {fmt(r.planned)} · ajustée ce mois-ci</p>}
      {r?.skipped && <p className="-mt-2 text-sm text-muted-foreground">Retirée de ce mois (exception).</p>}
      <div className="flex flex-col gap-2">
        <ActionItem icon={<Pencil />} title="Modifier le montant" sub="Pour ce mois seulement, ou à partir de ce mois" onClick={() => openSheet({ kind: 'chargeAmount', id: c.id, ym: sheet.ym })} />
        {r && !r.skipped && (
          <ActionItem
            icon={<PauseCircle />}
            title={`Retirer ${deMonth(month)}`}
            sub="Une exception : les autres mois ne changent pas"
            onClick={() => {
              commit((m) => setChargeMonthAmount(m, c.id, sheet.ym, 0), { message: `« ${c.label} » retirée ${deMonth(month)} seulement.` });
              onClose();
            }}
          />
        )}
        {r?.skipped && (
          <ActionItem
            icon={<RotateCcw />}
            title={`Rétablir en ${month}`}
            sub="Annule l’exception de ce mois"
            onClick={() => {
              commit((m) => setChargeMonthAmount(m, c.id, sheet.ym, null), { message: `« ${c.label} » est de retour en ${month}.` });
              onClose();
            }}
          />
        )}
        {!once && (
          <ActionItem icon={<StopCircle />} title="Arrêter cette charge" sub="Elle passe dans « Terminées » et reste dans l’historique" onClick={() => openSheet({ kind: 'chargeStop', id: c.id, ym: sheet.ym })} />
        )}
        <ActionItem icon={<Info />} title="Voir la fiche" sub="Montants successifs, exceptions, réglages" onClick={() => openSheet({ kind: 'chargeDetail', id: c.id })} />
      </div>
    </ResponsiveSheet>
  );
}

// ---------------------------------------------------------------------------
// Amount change with an explicit scope
// ---------------------------------------------------------------------------
export function ChargeAmountSheet({ sheet, onClose }: SheetProps<'chargeAmount'>) {
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
    if (!valid) return setError('Indiquez un montant valide (0 ou plus).');
    if (scope === 'month') {
      commit((m) => setChargeMonthAmount(m, c.id, fromYm, v), { message: `« ${c.label} » : ${fmt(v)} en ${monthLabel} seulement.` });
    } else if (scope === 'forward') {
      commit((m) => setChargeAmountFrom(m, c.id, fromYm, v, today), {
        message: `« ${c.label} » : ${fmt(v)}${yearly ? ' par an' : ''} à partir ${deMonth(monthLabel)}. Les mois d’avant gardent leur montant.`,
      });
    } else {
      commit((m) => setChargeAmountEverywhere(m, c.id, v), { message: `« ${c.label} » corrigé sur tous les mois ouverts. Les mois clôturés ne bougent pas.` });
    }
    onClose();
  };

  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={`Modifier « ${c.label} »`} description={describeChargeSchedule(c, today)}>
      {sheet.fromCatalog && (
        <div>
          <FieldLabel htmlFor="ca-from">À partir de</FieldLabel>
          <MonthPicker id="ca-from" value={fromYm} onChange={setFromYm} min={maxYM(today, start ?? today)} ariaLabel="À partir de" />
        </div>
      )}
      <div>
        <FieldLabel htmlFor="ca-amount">{yearly ? 'Montant annuel' : 'Nouveau montant'}</FieldLabel>
        <MoneyInput id="ca-amount" big value={value} onChange={(e) => { setValue(e.target.value); setError(''); }} />
        <p className="mt-1.5 text-sm text-muted-foreground">
          Actuellement : {fmt(initial)}
          {yearly ? ' par an' : ''}
          {yearly && c.smooth ? ` (${fmt(initial / 12)} mis de côté chaque mois)` : ''}
        </p>
        <div className="mt-2"><ErrorText>{error}</ErrorText></div>
      </div>
      <div className="flex flex-col gap-2">
        {!sheet.fromCatalog && <span className="text-sm font-semibold">Appliquer ce montant à…</span>}
        {canMonthOnly && (
          <ChoiceCard title={`${MONTH_NAMES[monthIndex0(fromYm)]} seulement`} help={`Une exception : les autres mois restent à ${fmt(r!.planned)}.`} onClick={() => apply('month')} />
        )}
        <ChoiceCard
          title={`À partir ${deMonth(formatMonthShort(fromYm))}`}
          help={prevAmount !== null ? `Les mois d’avant gardent ${fmt(prevAmount)}${yearly ? ' par an' : ''}.` : 'S’applique dès le premier mois.'}
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
// Stop
// ---------------------------------------------------------------------------
export function ChargeStopSheet({ sheet, onClose }: SheetProps<'chargeStop'>) {
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
        ? `« ${c.label} » n’avait pas encore commencé : elle est retirée.`
        : `« ${c.label} » s’arrête après ${formatMonthLong(last)}. Elle reste dans l’historique.`,
    });
    onClose();
  };
  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={`Arrêter « ${c.label} »`} description="Rien n’est effacé : elle reste dans les mois où elle a compté, et dans « Terminées ».">
      <div role="radiogroup" aria-label="Quand l’arrêter ?" className="flex flex-col gap-2">
        <ChoiceCard role="radio" selected={!custom && last === sheet.ym} onClick={() => { setCustom(false); setLast(sheet.ym); }} title={`Dernier mois : ${month}`} help={`Elle compte encore en ${monthNameLower(sheet.ym)}, plus ensuite.`} />
        {(!start || compareYM(previous, start) >= 0) && (
          <ChoiceCard role="radio" selected={!custom && last === previous} onClick={() => { setCustom(false); setLast(previous); }} title={`Dès ${month}`} help="Plus rien à partir de ce mois-ci." />
        )}
        <ChoiceCard role="radio" selected={custom} onClick={() => setCustom(true)} title="Un autre mois" help="Choisir le dernier mois où elle compte." />
        {custom && <MonthPicker value={last} onChange={setLast} min={start ?? addMonths(today, -24)} ariaLabel="Dernier mois" prefix="Dernier mois :" />}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" className="min-h-[44px]" onClick={onClose}>Annuler</Button>
        <Button className="min-h-[44px]" onClick={confirm}>Arrêter la charge</Button>
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

export function ChargeDetailSheet({ sheet, onClose }: SheetProps<'chargeDetail'>) {
  const { fmt, openSheet, commit, today, model, engine, handleOpenMapper, mappedTotalsByChargeId } = useBudget();
  const c = useCharge(sheet.id);
  if (!c) return null;
  const status = chargeStatus(c, today);
  const freq = chargeFrequency(c);
  const w = windowOf(c);
  const meta = categoryMeta(c.category);
  const perUnit = freq === 'yearly' ? ' / an' : '';
  const steps = sortSteps(c.amountHistory?.length ? c.amountHistory : [{ from: w.start ?? today, amount: c.amount }]);
  const reference = status === 'ended' ? w.end ?? today : status === 'upcoming' ? w.start ?? today : today;
  const currentStep = steps.reduce((acc, s) => (compareYM(s.from, reference) <= 0 ? s : acc), steps[0]);
  const rows = steps.map((s, i) => {
    const next = steps[i + 1];
    const to = next ? addMonths(next.from, -1) : w.end;
    const from = i === 0 && w.start ? w.start : i === 0 ? undefined : s.from;
    let period: string;
    if (freq === 'once') period = w.start ? formatMonthLong(w.start) : 'Une fois';
    else if (from && to) period = `${formatMonthShort(from)} → ${formatMonthShort(to)}`;
    else if (from) period = `Depuis ${formatMonthShort(from)}`;
    else if (to) period = `Jusqu’à ${formatMonthShort(to)}`;
    else period = 'Tous les mois';
    return { key: `${s.from}-${i}`, period, amount: s.amount === 0 ? 'En pause' : fmt(s.amount) + perUnit, current: s === currentStep };
  }).reverse();
  const exceptions = Object.entries(c.overrides ?? {})
    .sort(([a], [b]) => compareYM(a, b))
    .map(([ym, value]) => {
      const planned = resolveCharge({ ...c, overrides: undefined }, ym)?.planned ?? 0;
      return { ym, text: value === 0 ? 'retirée ce mois-là' : `${fmt(value)} au lieu de ${fmt(planned)}`, closed: engine.isClosed(ym) };
    });
  const closedMonths = closedMonthsWith(model, c.id);
  const mapped = mappedTotalsByChargeId[c.id] || 0;
  const statusPill = status === 'active' ? <Pill tone="green">En cours</Pill> : status === 'upcoming' ? <Pill tone="blue">À venir</Pill> : <Pill tone="grey">Terminée</Pill>;

  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={c.label}>
      <div className="-mt-2 flex flex-wrap items-center gap-2.5">
        <CategoryIcon category={c.category} className="h-9 w-9" />
        <span className="text-sm text-muted-foreground">{meta.label}</span>
        {statusPill}
      </div>
      <p className="text-[15px] font-semibold">{describeChargeSchedule(c, today)}</p>
      {c.description && <p className="-mt-3 text-sm text-muted-foreground">{c.description}</p>}

      <div>
        <h3 className="mb-2 text-sm font-semibold">Montants successifs</h3>
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
          <h3 className="mb-2 text-sm font-semibold">Exceptions (un seul mois)</h3>
          <div className="flex flex-col gap-1.5">
            {exceptions.map((x) => (
              <div key={x.ym} className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2 text-sm">
                <span className="flex-1">
                  <strong>{formatMonthTitle(x.ym)}</strong> · {x.text}
                </span>
                {x.closed ? (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Lock className="h-3 w-3" /> clôturé</span>
                ) : (
                  <button
                    type="button"
                    className="py-1 text-sm font-semibold text-primary underline underline-offset-4"
                    onClick={() => commit((m) => setChargeMonthAmount(m, c.id, x.ym, null), { message: `Exception ${deMonth(formatMonthLong(x.ym))} supprimée.` })}
                  >
                    Supprimer
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
            ? `Présente dans ${closedMonths.length} mois clôturé${closedMonths.length > 1 ? 's' : ''} (${formatMonthShort(closedMonths[0])}${closedMonths.length > 1 ? ` → ${formatMonthShort(closedMonths[closedMonths.length - 1])}` : ''}). Ces mois gardent leurs montants quoi qu’il arrive.`
            : 'Pas encore présente dans un mois clôturé.'}
        </span>
      </p>

      <div className="flex flex-col gap-2">
        {status !== 'ended' && (
          <ActionItem icon={<Pencil />} title="Changer le montant à partir d’un mois" sub="Les mois d’avant gardent leur montant" onClick={() => openSheet({ kind: 'chargeAmount', id: c.id, ym: maxYM(today, w.start ?? today), fromCatalog: true })} />
        )}
        <ActionItem icon={<Settings2 />} title="Modifier les réglages" sub="Nom, fréquence, dates, catégorie" onClick={() => openSheet({ kind: 'chargeEditor', id: c.id, ym: today })} />
        {status !== 'ended' && freq !== 'once' && (
          <ActionItem icon={<StopCircle />} title="Arrêter la charge" onClick={() => openSheet({ kind: 'chargeStop', id: c.id, ym: maxYM(today, w.start ?? today) })} />
        )}
        {status === 'ended' && freq !== 'once' && (
          <ActionItem
            icon={<RotateCcw />}
            title={`Relancer à partir ${deMonth(formatMonthLong(today))}`}
            sub="Les mois où elle était arrêtée restent vides"
            onClick={() => {
              commit((m) => restartCharge(m, c.id, today, today), { message: `« ${c.label} » relancée à partir ${deMonth(formatMonthLong(today))}.` });
              onClose();
            }}
          />
        )}
        <ActionItem
          icon={<LinkIcon />}
          title="Lier aux transactions bancaires"
          sub={mapped > 0 ? `Réel constaté : ${fmt(mapped)}` : 'Comparer avec ce qui est vraiment prélevé'}
          onClick={() => {
            onClose();
            handleOpenMapper(c);
          }}
        />
        <ActionItem
          icon={c.ignoreSuggestions ? <LightbulbOff /> : <Lightbulb />}
          title={c.ignoreSuggestions ? 'Réactiver les suggestions d’économies' : 'Désactiver les suggestions d’économies'}
          onClick={() => commit((m) => updateCharge(m, c.id, { ignoreSuggestions: c.ignoreSuggestions ? false : true }))}
        />
        <ActionItem danger icon={<Trash2 />} title="Supprimer définitivement" sub="Les mois clôturés la gardent" onClick={() => openSheet({ kind: 'chargeDelete', id: c.id })} />
      </div>
    </ResponsiveSheet>
  );
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------
export function ChargeDeleteSheet({ sheet, onClose }: SheetProps<'chargeDelete'>) {
  const { commit, model, today } = useBudget();
  const c = useCharge(sheet.id);
  if (!c) return null;
  const closedMonths = closedMonthsWith(model, c.id);
  const status = chargeStatus(c, today);
  const confirm = () => {
    commit((m) => deleteCharge(m, c.id), { message: `« ${c.label} » supprimée. L’historique des mois clôturés est intact.` });
    onClose();
  };
  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={`Supprimer « ${c.label} » ?`}>
      <p className="flex gap-2.5 rounded-xl bg-emerald-50 px-3.5 py-3 text-sm text-emerald-950">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          {closedMonths.length
            ? `Les ${closedMonths.length} mois clôturés où elle apparaît (${formatMonthShort(closedMonths[0])}${closedMonths.length > 1 ? ` → ${formatMonthShort(closedMonths[closedMonths.length - 1])}` : ''}) la gardent : leur photo est figée.`
            : 'Elle n’apparaît dans aucun mois clôturé.'}
        </span>
      </p>
      {status !== 'ended' ? (
        <p className="flex gap-2.5 rounded-xl bg-orange-50 px-3.5 py-3 text-sm text-orange-950">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Elle disparaît des mois ouverts et à venir. Pour simplement l’arrêter, utilisez plutôt « Arrêter la charge ».</span>
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">Elle est terminée : rien ne change dans votre budget à venir.</p>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="outline" className="min-h-[44px]" onClick={onClose}>Annuler</Button>
        <Button variant="destructive" className="min-h-[44px]" onClick={confirm}>Supprimer</Button>
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
  return (
    <div>
      <span className="mb-2 block text-sm font-semibold">Jusqu’à quand ?</span>
      <div role="group" aria-label="Fin" className="flex flex-wrap gap-2">
        <ChipToggle pressed={endMode === 'none'} onClick={() => setEndMode('none')}>Sans fin</ChipToggle>
        {allowCount && <ChipToggle pressed={endMode === 'count'} onClick={() => setEndMode('count')}>Pendant…</ChipToggle>}
        <ChipToggle pressed={endMode === 'until'} onClick={() => { if (compareYM(end, start) < 0) setEnd(addMonths(start, 2)); setEndMode('until'); }}>Jusqu’à…</ChipToggle>
      </div>
      {endMode === 'count' && (
        <div className="mt-3 flex items-center gap-2.5">
          <label htmlFor="end-count" className="text-sm">Pendant</label>
          <Input id="end-count" inputMode="numeric" value={count} onChange={(e) => setCount(e.target.value.replace(/[^\d]/g, '').slice(0, 3))} className="h-12 w-24 rounded-xl text-center text-base tabular-nums" />
          <span className="text-sm">mois</span>
        </div>
      )}
      {endMode === 'until' && (
        <div className="mt-3">
          <MonthPicker value={end} onChange={setEnd} min={start} prefix="Dernier mois :" ariaLabel="Dernier mois" />
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
  const { fmt, commit, today, currencySymbol } = useBudget();
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

  const value = parseAmount(amount);
  const endYm = freq === 'once' ? undefined : computeEnd(start, endMode, count, end);

  const draft: Charge = useMemo(
    () => ({
      id: 'draft',
      label: label || 'Nouvelle charge',
      amount: Number.isFinite(value) ? value : 0,
      startDate: startDateOf(start),
      ...(endYm ? { endDate: endDateOf(endYm) } : {}),
      ...(freq !== 'monthly' ? { frequency: freq } : {}),
      ...(freq === 'custom' ? { months } : {}),
      ...(freq === 'yearly' && smooth ? { smooth: true } : {}),
    }),
    [label, value, start, endYm, freq, months, smooth],
  );

  const amountText = Number.isFinite(value) && value > 0 ? fmt(value) : `… ${currencySymbol}`;
  let summary: string;
  if (freq === 'once') summary = `${amountText} une seule fois, en ${formatMonthLong(start)}.`;
  else if (freq === 'yearly') {
    summary = `${amountText} chaque année en ${MONTHS_LOWER[monthIndex0(start)]}, à partir de ${yearOf(start)}${endYm ? ` et jusqu’en ${yearOf(endYm)}` : ''}.`;
    if (smooth && Number.isFinite(value) && value > 0) summary += ` Lissée : ${fmt(value / 12)} mis de côté chaque mois.`;
  } else {
    const base = freq === 'custom' ? customMonthsText(months).toLowerCase() : 'tous les mois';
    summary = `${amountText} ${base}, à partir ${deMonth(formatMonthLong(start))}`;
    summary += endYm ? ` jusqu’en ${formatMonthLong(endYm)} (${monthsBetween(start, endYm)} mois).` : ', sans date de fin.';
  }
  const ctx = sheet.ym;
  const inCtx = !editing && compareYM(ctx, start) >= 0 ? resolveCharge(draft, ctx) : null;
  let firstOcc: YM | null = null;
  for (let i = 0; i < 36 && !firstOcc; i++) if (resolveCharge(draft, addMonths(start, i))) firstOcc = addMonths(start, i);
  const impact = editing
    ? 'Les mois clôturés ne changent pas ; les mois ouverts suivent les nouveaux réglages.'
    : inCtx && Number.isFinite(value) && value > 0
      ? `Effet sur ${formatMonthLong(ctx)} : ${moneySigned(inCtx.amount, currencySymbol)} de charges.`
      : firstOcc
        ? `Rien en ${formatMonthLong(ctx)} : première fois en ${formatMonthLong(firstOcc)}.`
        : 'Aucun mois concerné avec ces réglages.';

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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return setError('Donnez un nom (ex. : Loyer, Cantine, Taxe foncière…).');
    if (!editing && (!Number.isFinite(value) || value <= 0)) return setError('Indiquez un montant supérieur à 0.');
    if (freq === 'custom' && months.length === 0) return setError('Choisissez au moins un mois.');
    if (endYm && compareYM(endYm, start) < 0) return setError('La fin doit venir après le début.');
    const settings: Partial<Charge> = {
      label: label.trim(),
      category: category || undefined,
      description: description.trim() || undefined,
      startDate: startDateOf(start),
      endDate: endYm ? endDateOf(endYm) : undefined,
      frequency: freq !== 'monthly' ? freq : undefined,
      months: freq === 'custom' ? months.slice().sort((a, b) => a - b) : undefined,
      smooth: freq === 'yearly' && smooth ? true : undefined,
    };
    if (editing) {
      commit((m) => updateCharge(m, existing!.id, settings), { message: `« ${label.trim()} » mise à jour.` });
    } else {
      const charge: Charge = { id: newId('c'), amount: value, ignoreSuggestions: false, ...settings, label: label.trim() } as Charge;
      for (const k of Object.keys(charge) as Array<keyof Charge>) if (charge[k] === undefined) delete charge[k];
      commit((m) => upsertCharge(m, charge), { message: `« ${label.trim()} » ajoutée à vos charges.` });
    }
    onClose();
  };

  const freqOptions: Array<{ value: Frequency; label: string }> = [
    { value: 'monthly', label: 'Chaque mois' },
    { value: 'custom', label: 'Certains mois' },
    { value: 'yearly', label: 'Chaque année' },
    { value: 'once', label: 'Une fois' },
  ];

  return (
    <ResponsiveSheet open onOpenChange={(o) => !o && onClose()} title={editing ? `Réglages de « ${existing!.label} »` : 'Nouvelle charge'}>
      <form onSubmit={submit} className="flex flex-col gap-5">
        <div>
          <FieldLabel htmlFor="ch-label">Nom</FieldLabel>
          <Input id="ch-label" value={label} onChange={(e) => { setLabel(e.target.value); setError(''); }} onBlur={detectCategory} placeholder="Ex. : Loyer, Cantine, Taxe foncière…" className="h-12 rounded-xl text-base" />
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold">Quand revient-elle ?</span>
          <Segmented label="Fréquence" value={freq} options={freqOptions} onChange={setFreq} />
        </div>

        {editing ? (
          <p className="rounded-xl bg-muted/60 px-3.5 py-3 text-sm">
            Montant actuel : <strong>{fmt(chargeBaseAmount(existing!, today))}</strong>
            {freq === 'yearly' ? ' par an' : ''}. Pour le changer sans toucher au passé, utilisez « Changer le montant à partir d’un mois » dans la fiche.
          </p>
        ) : (
          <div>
            <FieldLabel htmlFor="ch-amount">{freq === 'yearly' ? 'Montant annuel' : freq === 'once' ? 'Montant' : 'Montant mensuel'}</FieldLabel>
            <MoneyInput id="ch-amount" value={amount} onChange={(e) => { setAmount(e.target.value); setError(''); }} placeholder="0" suffix={currencySymbol} />
          </div>
        )}

        {freq === 'custom' && (
          <div>
            <span className="mb-2 block text-sm font-semibold">
              Quels mois ? <span className="font-normal text-muted-foreground">(touchez pour retirer)</span>
            </span>
            <div role="group" aria-label="Mois concernés" className="grid grid-cols-6 gap-1.5">
              {MONTHS_SHORT.map((m, i) => {
                const on = months.includes(i + 1);
                return (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={on}
                    aria-label={MONTHS_LOWER[i]}
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
          <FieldLabel htmlFor="ch-start">{freq === 'once' ? 'Mois' : freq === 'yearly' ? 'Première échéance' : 'À partir de'}</FieldLabel>
          <MonthPicker id="ch-start" value={start} onChange={(ym) => { setStart(ym); if (compareYM(end, ym) < 0) setEnd(addMonths(ym, 2)); }} ariaLabel="Début" />
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
                {Number.isFinite(value) && value > 0 ? `Mettre ${fmt(value / 12)} de côté chaque mois` : 'Mettre 1/12 de côté chaque mois'}
              </span>
              <span className="text-sm text-muted-foreground">Recommandé : l’échéance ne crée pas de trou le mois où elle tombe.</span>
            </span>
          </button>
        )}

        {freq !== 'once' && (
          <EndFields start={start} endMode={endMode} setEndMode={setEndMode} count={count} setCount={setCount} end={end} setEnd={setEnd} />
        )}

        <div>
          <span className="mb-2 block text-sm font-semibold">
            Catégorie {detecting && <span className="font-normal text-muted-foreground">(détection…)</span>}
          </span>
          <div role="group" aria-label="Catégorie" className="flex flex-wrap gap-1.5">
            {PICKER_CATEGORIES.map((cat) => (
              <ChipToggle key={cat.code} pressed={category === cat.code} onClick={() => { setCategory(cat.code); setCatTouched(true); }} className="min-h-[36px] px-3 text-[13px]">
                {cat.label}
              </ChipToggle>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="ch-desc" hint="(optionnel)">Détails</FieldLabel>
          <Input id="ch-desc" value={description} maxLength={50} onChange={(e) => setDescription(e.target.value)} placeholder="Ex. : 45 m², tous risques… aide l’IA à comparer" className="h-12 rounded-xl text-base" />
        </div>

        <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-900">En clair</span>
          {!editing && <p className="mt-1 text-[15px] font-semibold text-foreground">{summary}</p>}
          {editing && <p className="mt-1 text-[15px] font-semibold text-foreground">{describeChargeSchedule(draft, today)}</p>}
          <p className="mt-1 text-sm text-sky-950">{impact}</p>
        </div>

        <ErrorText>{error}</ErrorText>
        <Button type="submit" className="min-h-[48px]">{editing ? 'Enregistrer' : 'Ajouter la charge'}</Button>
      </form>
    </ResponsiveSheet>
  );
}
