// src/lib/pages/budget-tabs/ProjectsTab.tsx
// ============================================================================
// « Épargne » — every savings pot with what is in it today, what goes in each
// month, and the general savings (which automatically receives what is left
// of each month). Money spent from a pot is recorded here or from the month.
// ============================================================================

import { useState, type ReactNode } from 'react';
import { ChevronDown, MoreHorizontal, Pencil, PiggyBank, Plus, RotateCcw, Settings2, ShoppingBag, Sprout, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useBudget } from '@/contexts/BudgetContext';
import type { Project } from '@/lib/budget/types';
import { GENERAL_SAVINGS_ID } from '@/lib/budget/types';
import {
  amountHistoryHint,
  describeProjectSchedule,
  isRecurringProject,
  projectPlanned,
  projectStatus,
  windowOf,
  type ItemStatus,
} from '@/lib/budget/engine';
import { restartProject } from '@/lib/budget/mutations';
import { formatMonthLong, monthNameLower, maxYM, deMonth } from '@/lib/budget/months';
import { percent, roundCents } from '@/lib/budget/format';
import { Pill } from '@/components/budget/shared/primitives';
import { useFirstOpenMonth } from '@/components/budget/shared/hooks';
import { defineMessages, useT } from '@/i18n/runtime';

const STATUS_TONE: Record<ItemStatus, 'green' | 'blue' | 'grey'> = {
  active: 'green',
  upcoming: 'blue',
  ended: 'grey',
};

const M = defineMessages({
  fr: {
    status: { active: 'En cours', upcoming: 'À venir', ended: 'Terminée' } as Record<ItemStatus, string>,
    perMonth: (amount: string, schedule: string) => `${amount} par mois · ${schedule}`,
    freeAmount: (amount: string, month: string) => `Montant libre · ${amount} en ${month}`,
    moreActions: (label: string) => `Plus d’actions pour « ${label} »`,
    settings: 'Réglages',
    delete: 'Supprimer',
    inPotEnd: (month: string) => `En caisse fin ${month}`,
    targetReached: (target: string) => `Objectif de ${target} atteint`,
    progress: (pct: string, target: string, left: string) => `${pct} de l’objectif (${target}) · encore ${left}`,
    restarted: (label: string, month: string) => `« ${label} » relancée à partir ${deMonth(month)}.`,
    restart: 'Relancer',
    editAmount: 'Modifier le montant',
    payExpense: 'Payer une dépense',
    title: 'Épargne',
    intro: (total: ReactNode, month: string): ReactNode => (
      <>Ce que vous mettez de côté chaque mois, et ce qu’il y a dans chaque cagnotte : {total} au total fin {month}.</>
    ),
    newSaving: 'Nouvelle épargne',
    thisMonth: (month: string, saved: ReactNode, left: ReactNode): ReactNode => (
      <>En {month} : {saved} mis de côté dans les cagnottes, et{' '}{left} de reste pour l’épargne générale.</>
    ),
    general: 'Épargne générale',
    generalHelp: 'Reçoit automatiquement le reste de chaque mois (entrées − charges − épargnes).',
    empty: 'Créez une cagnotte pour les vacances, la voiture ou les imprévus : un montant mis de côté chaque mois, avec un objectif si vous voulez.',
    create: 'Créer une épargne',
    endedAria: 'Épargnes terminées',
    ended: (n: number) => `Terminées (${n})`,
  },
  en: {
    status: { active: 'Active', upcoming: 'Upcoming', ended: 'Ended' },
    perMonth: (amount: string, schedule: string) => `${amount} a month · ${schedule}`,
    freeAmount: (amount: string, month: string) => `Any amount · ${amount} in ${month}`,
    moreActions: (label: string) => `More actions for “${label}”`,
    settings: 'Settings',
    delete: 'Delete',
    inPotEnd: (month: string) => `In the pot at the end of ${month}`,
    targetReached: (target: string) => `${target} target reached`,
    progress: (pct: string, target: string, left: string) => `${pct} of the target (${target}) · ${left} to go`,
    restarted: (label: string, month: string) => `“${label}” restarted from ${month}.`,
    restart: 'Restart',
    editAmount: 'Edit amount',
    payExpense: 'Pay an expense',
    title: 'Savings',
    intro: (total: ReactNode, month: string): ReactNode => (
      <>What you set aside each month, and what’s in each savings pot: {total} in all at the end of {month}.</>
    ),
    newSaving: 'New savings pot',
    thisMonth: (month: string, saved: ReactNode, left: ReactNode): ReactNode => (
      <>In {month}: {saved} set aside in savings pots, and {left} left over for general savings.</>
    ),
    general: 'General savings',
    generalHelp: 'Automatically gets what’s left of each month (income − bills − savings).',
    empty: 'Create a savings pot for holidays, the car or the unexpected: an amount set aside every month, with a target if you like.',
    create: 'Create a savings pot',
    endedAria: 'Ended savings',
    ended: (n: number) => `Ended (${n})`,
  },
});

function SavingCard({ p }: { p: Project }) {
  const { fmt, engine, today, openSheet, commit } = useBudget();
  const t = useT(M);
  const firstOpen = useFirstOpenMonth();
  const status = projectStatus(p, today);
  const recurring = isRecurringProject(p);
  const w = windowOf(p);
  const balance = engine.savingBalance(p.id, today);
  const target = Number(p.targetAmount) || 0;
  const progress = target > 0 ? Math.max(0, Math.min(100, (balance / target) * 100)) : 0;
  const ref = status === 'upcoming' ? w.start ?? today : status === 'ended' ? w.end ?? today : today;
  const amount = recurring ? projectPlanned(p, ref) : engine.month(today).savings.find((s) => s.id === p.id)?.allocation ?? 0;
  const schedule = recurring ? t.perMonth(fmt(amount), describeProjectSchedule(p, today)) : t.freeAmount(fmt(amount), monthNameLower(today));
  const hint = recurring ? amountHistoryHint(p.amountHistory, today, fmt) : '';
  const pill = { label: t.status[status], tone: STATUS_TONE[status] };
  const editYm = recurring ? maxYM(firstOpen, w.start ?? firstOpen) : firstOpen;

  return (
    <article className={cn('flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-soft', status === 'ended' && 'bg-muted/30')}>
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
          <PiggyBank className="h-5 w-5" />
        </span>
        <h2 className="min-w-0 flex-1 truncate font-display text-lg font-extrabold">{p.label}</h2>
        <Pill tone={pill.tone}>{pill.label}</Pill>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="-mr-2 h-11 w-11 shrink-0" aria-label={t.moreActions(p.label)}>
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="min-h-[44px] gap-2" onSelect={() => openSheet({ kind: 'savingEditor', id: p.id, ym: firstOpen })}>
              <Settings2 className="h-4 w-4" aria-hidden="true" /> {t.settings}
            </DropdownMenuItem>
            <DropdownMenuItem className="min-h-[44px] gap-2 text-destructive focus:text-destructive" onSelect={() => openSheet({ kind: 'savingDelete', id: p.id })}>
              <Trash2 className="h-4 w-4" aria-hidden="true" /> {t.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{schedule}</p>
        {hint && <p className="text-xs text-sky-800">{hint}</p>}
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.inPotEnd(monthNameLower(today))}</span>
        <span className={cn('font-display text-3xl font-extrabold tracking-tight tabular-nums', balance < 0 && 'text-red-700')}>{fmt(balance)}</span>
      </div>
      {target > 0 && (
        <div className="flex flex-col gap-1.5">
          <span aria-hidden="true" className="block h-2 overflow-hidden rounded-full bg-muted">
            <span className="block h-full rounded-full bg-indigo-500" style={{ width: `${progress}%` }} />
          </span>
          <span className="text-xs text-muted-foreground">
            {balance >= target ? t.targetReached(fmt(target)) : t.progress(percent(progress), fmt(target), fmt(roundCents(target - balance)))}
          </span>
        </div>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-2">
        {status === 'ended' && recurring ? (
          <Button
            variant="outline"
            className="min-h-[44px]"
            onClick={() =>
              commit((m) => restartProject(m, p.id, firstOpen), { message: t.restarted(p.label, formatMonthLong(firstOpen)) })
            }
          >
            <RotateCcw className="h-4 w-4" /> {t.restart}
          </Button>
        ) : (
          <Button variant="outline" className="min-h-[44px]" onClick={() => openSheet({ kind: 'savingAmount', id: p.id, ym: editYm, fromCatalog: true })}>
            <Pencil className="h-4 w-4" /> {t.editAmount}
          </Button>
        )}
        <Button variant="ghost" className="min-h-[44px]" onClick={() => openSheet({ kind: 'spend', ym: firstOpen, potId: p.id })}>
          <ShoppingBag className="h-4 w-4" /> {t.payExpense}
        </Button>
      </div>
    </article>
  );
}

export default function ProjectsTab() {
  const { model, engine, today, fmt, openSheet } = useBudget();
  const t = useT(M);
  const firstOpen = useFirstOpenMonth();
  const [showEnded, setShowEnded] = useState(false);
  const projects = model.projects.filter((p) => p.id !== GENERAL_SAVINGS_ID);
  const order: Record<ItemStatus, number> = { active: 0, upcoming: 1, ended: 2 };
  const sorted = projects.slice().sort((a, b) => order[projectStatus(a, today)] - order[projectStatus(b, today)]);
  const current = sorted.filter((p) => projectStatus(p, today) !== 'ended');
  const ended = sorted.filter((p) => projectStatus(p, today) === 'ended');
  const general = engine.generalBalance(today);
  const total = roundCents(projects.reduce((s, p) => s + engine.savingBalance(p.id, today), 0) + general);
  const month = engine.month(today);

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-200">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">{t.title}</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            {t.intro(<strong className="tabular-nums text-foreground">{fmt(total)}</strong>, monthNameLower(today))}
          </p>
        </div>
        <Button className="min-h-[44px] self-start sm:self-auto" onClick={() => openSheet({ kind: 'savingEditor', ym: firstOpen })}>
          <Plus className="h-4 w-4" /> {t.newSaving}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        {t.thisMonth(
          monthNameLower(today),
          <strong className="tabular-nums text-foreground">{fmt(month.totals.savings)}</strong>,
          <strong className={cn('tabular-nums', month.totals.reste < 0 ? 'text-red-700' : 'text-foreground')}>{fmt(month.totals.reste)}</strong>,
        )}
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {current.map((p) => (
          <SavingCard key={p.id} p={p} />
        ))}
        <article className="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Sprout className="h-5 w-5" />
            </span>
            <h2 className="flex-1 font-display text-lg font-extrabold">{t.general}</h2>
          </div>
          <p className="text-sm text-foreground/75">{t.generalHelp}</p>
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground/70">{t.inPotEnd(monthNameLower(today))}</span>
            <span className={cn('font-display text-3xl font-extrabold tracking-tight tabular-nums', general < 0 && 'text-red-700')}>{fmt(general)}</span>
          </div>
          <div className="mt-auto">
            <Button variant="ghost" className="min-h-[44px]" onClick={() => openSheet({ kind: 'spend', ym: firstOpen, potId: GENERAL_SAVINGS_ID })}>
              <ShoppingBag className="h-4 w-4" /> {t.payExpense}
            </Button>
          </div>
        </article>
      </div>

      {projects.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-border px-5 py-8 text-center">
          <p className="max-w-md text-sm text-muted-foreground">
            {t.empty}
          </p>
          <Button className="min-h-[44px]" onClick={() => openSheet({ kind: 'savingEditor', ym: firstOpen })}>
            <Plus className="h-4 w-4" /> {t.create}
          </Button>
        </div>
      )}

      {ended.length > 0 && (
        <section aria-label={t.endedAria} className="flex flex-col gap-3">
          <button
            type="button"
            aria-expanded={showEnded}
            onClick={() => setShowEnded((s) => !s)}
            className="flex min-h-[44px] items-center gap-2 self-start rounded-lg px-1 text-sm font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', showEnded && 'rotate-180')} aria-hidden="true" />
            {t.ended(ended.length)}
          </button>
          {showEnded && (
            <div className="grid gap-4 md:grid-cols-2">
              {ended.map((p) => (
                <SavingCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
