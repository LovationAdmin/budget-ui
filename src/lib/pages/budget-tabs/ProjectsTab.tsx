// src/lib/pages/budget-tabs/ProjectsTab.tsx
// ============================================================================
// « Épargne » — every savings pot with what is in it today, what goes in each
// month, and the general savings (which automatically receives what is left
// of each month). Money spent from a pot is recorded here or from the month.
// ============================================================================

import { useState } from 'react';
import { ChevronDown, Pencil, PiggyBank, Plus, RotateCcw, Settings2, ShoppingBag, Sprout, Trash2 } from 'lucide-react';
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
import { formatMonthLong, monthNameLower, maxYM } from '@/lib/budget/months';
import { percent, roundCents } from '@/lib/budget/format';
import { Pill } from '@/components/budget/shared/primitives';
import { useFirstOpenMonth } from '@/components/budget/shared/hooks';

const STATUS_PILL: Record<ItemStatus, { label: string; tone: 'green' | 'blue' | 'grey' }> = {
  active: { label: 'En cours', tone: 'green' },
  upcoming: { label: 'À venir', tone: 'blue' },
  ended: { label: 'Terminée', tone: 'grey' },
};

function SavingCard({ p }: { p: Project }) {
  const { fmt, engine, today, openSheet, commit } = useBudget();
  const firstOpen = useFirstOpenMonth();
  const status = projectStatus(p, today);
  const recurring = isRecurringProject(p);
  const w = windowOf(p);
  const balance = engine.savingBalance(p.id, today);
  const target = Number(p.targetAmount) || 0;
  const progress = target > 0 ? Math.max(0, Math.min(100, (balance / target) * 100)) : 0;
  const ref = status === 'upcoming' ? w.start ?? today : status === 'ended' ? w.end ?? today : today;
  const amount = recurring ? projectPlanned(p, ref) : engine.month(today).savings.find((s) => s.id === p.id)?.allocation ?? 0;
  const schedule = recurring ? `${fmt(amount)} par mois · ${describeProjectSchedule(p, today)}` : `Montant libre · ${fmt(amount)} en ${monthNameLower(today)}`;
  const hint = recurring ? amountHistoryHint(p.amountHistory, today, fmt) : '';
  const pill = STATUS_PILL[status];
  const editYm = recurring ? maxYM(firstOpen, w.start ?? firstOpen) : firstOpen;

  return (
    <article className={cn('flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-soft', status === 'ended' && 'bg-muted/30')}>
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
          <PiggyBank className="h-5 w-5" />
        </span>
        <h2 className="min-w-0 flex-1 truncate font-display text-lg font-extrabold">{p.label}</h2>
        <Pill tone={pill.tone}>{pill.label}</Pill>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{schedule}</p>
        {hint && <p className="text-xs text-sky-800">{hint}</p>}
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">En caisse fin {monthNameLower(today)}</span>
        <span className={cn('font-display text-3xl font-extrabold tracking-tight tabular-nums', balance < 0 && 'text-red-700')}>{fmt(balance)}</span>
      </div>
      {target > 0 && (
        <div className="flex flex-col gap-1.5">
          <span aria-hidden="true" className="block h-2 overflow-hidden rounded-full bg-muted">
            <span className="block h-full rounded-full bg-indigo-500" style={{ width: `${progress}%` }} />
          </span>
          <span className="text-xs text-muted-foreground">
            {balance >= target ? `Objectif de ${fmt(target)} atteint` : `${percent(progress)} de l’objectif (${fmt(target)}) · encore ${fmt(roundCents(target - balance))}`}
          </span>
        </div>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-2">
        {status === 'ended' && recurring ? (
          <Button
            variant="outline"
            className="min-h-[44px]"
            onClick={() =>
              commit((m) => restartProject(m, p.id, firstOpen), { message: `« ${p.label} » relancée à partir de ${formatMonthLong(firstOpen)}.` })
            }
          >
            <RotateCcw className="h-4 w-4" /> Relancer
          </Button>
        ) : (
          <Button variant="outline" className="min-h-[44px]" onClick={() => openSheet({ kind: 'savingAmount', id: p.id, ym: editYm, fromCatalog: true })}>
            <Pencil className="h-4 w-4" /> Modifier le montant
          </Button>
        )}
        <Button variant="ghost" className="min-h-[44px]" onClick={() => openSheet({ kind: 'spend', ym: firstOpen, potId: p.id })}>
          <ShoppingBag className="h-4 w-4" /> Payer une dépense
        </Button>
        <span className="ml-auto flex gap-1">
          <Button variant="ghost" size="icon" className="h-11 w-11" aria-label={`Réglages de « ${p.label} »`} onClick={() => openSheet({ kind: 'savingEditor', id: p.id, ym: firstOpen })}>
            <Settings2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-11 w-11 text-muted-foreground hover:text-destructive" aria-label={`Supprimer « ${p.label} »`} onClick={() => openSheet({ kind: 'savingDelete', id: p.id })}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </span>
      </div>
    </article>
  );
}

export default function ProjectsTab() {
  const { model, engine, today, fmt, openSheet } = useBudget();
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
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">Épargne</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Ce que vous mettez de côté chaque mois, et ce qu’il y a dans chaque cagnotte : <strong className="tabular-nums text-foreground">{fmt(total)}</strong> au total fin {monthNameLower(today)}.
          </p>
        </div>
        <Button className="min-h-[44px] self-start sm:self-auto" onClick={() => openSheet({ kind: 'savingEditor', ym: firstOpen })}>
          <Plus className="h-4 w-4" /> Nouvelle épargne
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        En {monthNameLower(today)} : <strong className="tabular-nums text-foreground">{fmt(month.totals.savings)}</strong> mis de côté dans les cagnottes, et{' '}
        <strong className={cn('tabular-nums', month.totals.reste < 0 ? 'text-red-700' : 'text-foreground')}>{fmt(month.totals.reste)}</strong> de reste pour l’épargne générale.
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
            <h2 className="flex-1 font-display text-lg font-extrabold">Épargne générale</h2>
          </div>
          <p className="text-sm text-foreground/75">Reçoit automatiquement le reste de chaque mois (entrées − charges − épargnes).</p>
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground/70">En caisse fin {monthNameLower(today)}</span>
            <span className={cn('font-display text-3xl font-extrabold tracking-tight tabular-nums', general < 0 && 'text-red-700')}>{fmt(general)}</span>
          </div>
          <div className="mt-auto">
            <Button variant="ghost" className="min-h-[44px]" onClick={() => openSheet({ kind: 'spend', ym: firstOpen, potId: GENERAL_SAVINGS_ID })}>
              <ShoppingBag className="h-4 w-4" /> Payer une dépense
            </Button>
          </div>
        </article>
      </div>

      {projects.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-border px-5 py-8 text-center">
          <p className="max-w-md text-sm text-muted-foreground">
            Créez une cagnotte pour les vacances, la voiture ou les imprévus : un montant mis de côté chaque mois, avec un objectif si vous voulez.
          </p>
          <Button className="min-h-[44px]" onClick={() => openSheet({ kind: 'savingEditor', ym: firstOpen })}>
            <Plus className="h-4 w-4" /> Créer une épargne
          </Button>
        </div>
      )}

      {ended.length > 0 && (
        <section aria-label="Épargnes terminées" className="flex flex-col gap-3">
          <button
            type="button"
            aria-expanded={showEnded}
            onClick={() => setShowEnded((s) => !s)}
            className="flex min-h-[44px] items-center gap-2 self-start rounded-lg px-1 text-sm font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', showEnded && 'rotate-180')} aria-hidden="true" />
            Terminées ({ended.length})
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
