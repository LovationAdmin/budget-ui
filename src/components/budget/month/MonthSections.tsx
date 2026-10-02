// src/components/budget/month/MonthSections.tsx
// The three blocks of a month: what comes into the household pot, the charges
// of the month (with month-only exceptions) and the savings.

import { ChevronRight, Coins, PiggyBank, Plus, RotateCcw, Sprout, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useBudget } from '@/contexts/BudgetContext';
import type { ResolvedCharge, ResolvedMonth } from '@/lib/budget/engine';
import { contributionRuleText, customMonthsText, windowOf } from '@/lib/budget/engine';
import { removeOneOff, setChargeMonthAmount } from '@/lib/budget/mutations';
import { formatMonthLong, monthNameLower, MONTHS_SHORT, monthIndex0, deMonth } from '@/lib/budget/months';
import type { YM } from '@/lib/budget/types';
import { AddRowButton, Badge, CategoryIcon, IconTile, RowButton, SectionCard, type PillTone } from '../shared/primitives';

function useClosedGuard(ym: YM, closed: boolean) {
  const { toast } = useToast();
  const { openSheet } = useBudget();
  return (fn: () => void) => () => {
    if (!closed) return fn();
    toast({
      description: 'Ce mois est clôturé : ses montants sont figés.',
      action: (
        <ToastAction altText="Rouvrir le mois" onClick={() => openSheet({ kind: 'reopen', ym })}>
          Rouvrir
        </ToastAction>
      ),
    });
  };
}

// ---------------------------------------------------------------------------
// Entrées
// ---------------------------------------------------------------------------
export function IncomeCard({ month }: { month: ResolvedMonth }) {
  const { fmt, openSheet, commit } = useBudget();
  const guard = useClosedGuard(month.ym, month.closed);
  const t = month.totals;
  return (
    <SectionCard
      id="entrees"
      title="Entrées du pot commun"
      subtitle={
        month.people.length
          ? `Ce que chacun verse. Salaires : ${fmt(t.salaries)} · argent de poche : ${fmt(t.salaries - t.contributions)}`
          : 'Ajoutez les membres du foyer pour commencer.'
      }
      amount={fmt(t.entrees)}
      amountClassName="text-emerald-700"
    >
      {month.people.map((p) => {
        const share = p.salary > 0 ? Math.min(100, Math.round((p.contribution / p.salary) * 100)) : 0;
        return (
          <RowButton key={p.id} onClick={guard(() => openSheet({ kind: 'member', id: p.id, ym: month.ym }))}>
            <span aria-hidden="true" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 font-display text-base font-extrabold text-teal-800">
              {p.name.charAt(0).toUpperCase() || '?'}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[15px] font-semibold">
                  {p.name} <span className="text-sm font-normal text-muted-foreground">verse</span>
                </span>
                <span className="text-[15px] font-bold tabular-nums">{fmt(p.contribution)}</span>
              </span>
              <span aria-hidden="true" className="block h-1.5 overflow-hidden rounded-full bg-muted">
                <span className="block h-full rounded-full bg-emerald-500" style={{ width: `${share}%` }} />
              </span>
              <span className="text-xs text-muted-foreground">
                Salaire {fmt(p.salary)} · argent de poche {fmt(p.keep)} ·{' '}
                {p.contributionAdjusted || p.salaryAdjusted ? 'ajusté ce mois-ci' : contributionRuleText(p.mode, p.value)}
                {p.deleted ? ' · ne fait plus partie du foyer' : ''}
              </span>
            </span>
          </RowButton>
        );
      })}
      {month.oneOffs.map((o) => (
        <div key={o.id} className="flex min-h-[60px] items-center gap-3 rounded-xl px-2.5 py-2">
          <IconTile className="bg-emerald-50 text-emerald-700">
            <Coins />
          </IconTile>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[15px] font-semibold">{o.label}</span>
            <span className="text-xs text-muted-foreground">Revenu ponctuel, ce mois-ci seulement</span>
          </span>
          <span className="text-[15px] font-bold tabular-nums text-emerald-700">+{fmt(o.amount)}</span>
          {!month.closed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground"
              aria-label={`Retirer « ${o.label} »`}
              onClick={() => commit((m) => removeOneOff(m, month.ym, o.id), { message: `« ${o.label} » retiré ${deMonth(formatMonthLong(month.ym))}.` })}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      {!month.closed && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <AddRowButton onClick={() => openSheet({ kind: 'oneOff', ym: month.ym })}>
            <Plus /> Revenu ponctuel (prime, remboursement…)
          </AddRowButton>
          {month.people.length === 0 && (
            <AddRowButton onClick={() => openSheet({ kind: 'member', ym: month.ym })}>
              <Plus /> Ajouter un membre
            </AddRowButton>
          )}
        </div>
      )}
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// Charges
// ---------------------------------------------------------------------------
function chargeBadges(c: ResolvedCharge, prev: ResolvedCharge | undefined, ym: YM, startYM: YM | undefined, endYM: YM | undefined, fmt: (n: number) => string) {
  const out: Array<{ text: string; tone: PillTone }> = [];
  if (c.deleted) out.push({ text: 'Supprimée depuis', tone: 'grey' });
  if (startYM === ym && c.frequency !== 'yearly') out.push({ text: c.frequency === 'once' ? 'Ce mois-ci' : 'Nouvelle', tone: 'blue' });
  else if ((!prev || prev.skipped) && c.frequency === 'custom') out.push({ text: 'Reprend', tone: 'blue' });
  if (c.dueMonth) out.push({ text: 'Échéance', tone: 'indigo' });
  if (prev && !prev.skipped && !c.adjusted && Math.abs(prev.amount - c.amount) >= 0.005) {
    const d = c.amount - prev.amount;
    out.push({ text: `${d > 0 ? '+' : '−'}${fmt(Math.abs(d))}`, tone: d > 0 ? 'orange' : 'green' });
  }
  if (c.adjusted) out.push({ text: 'Ajustée', tone: 'amber' });
  if (endYM === ym && c.frequency !== 'once') out.push({ text: 'Dernier mois', tone: 'grey' });
  return out;
}

function chargeSubtitle(c: ResolvedCharge, months: number[] | undefined, fmt: (n: number) => string): string {
  let sub: string;
  if (c.frequency === 'once') sub = 'Ponctuelle';
  else if (c.frequency === 'yearly') sub = c.smooth ? `Provision · ${fmt(c.base)} par an` : 'Annuelle';
  else if (c.frequency === 'custom') sub = customMonthsText(months);
  else sub = 'Tous les mois';
  if (c.adjusted) sub = `Prévu ${fmt(c.planned)} · ${sub}`;
  return sub;
}

export function ChargesCard({ month, prevMonth }: { month: ResolvedMonth; prevMonth: ResolvedMonth }) {
  const { fmt, openSheet, commit, model } = useBudget();
  const guard = useClosedGuard(month.ym, month.closed);
  const defs = new Map(model.charges.map((c) => [c.id, c]));
  const prevById = new Map(prevMonth.charges.map((c) => [c.id, c]));
  const active = month.charges.filter((c) => !c.skipped).sort((a, b) => b.amount - a.amount);
  const skipped = month.charges.filter((c) => c.skipped);
  const count = active.length;
  const label = monthNameLower(month.ym);

  return (
    <SectionCard
      id="charges"
      title="Charges du mois"
      subtitle={count ? `${count} charge${count > 1 ? 's' : ''} · remplies automatiquement depuis vos règles` : 'Aucune charge ce mois-ci.'}
      amount={fmt(month.totals.charges)}
      amountClassName="text-orange-700"
    >
      {active.map((c) => {
        const def = defs.get(c.id);
        const w = def ? windowOf(def) : {};
        const start = w.start;
        const end = w.end;
        const badges = chargeBadges(c, prevById.get(c.id), month.ym, start, end, fmt);
        return (
          <RowButton key={c.id} onClick={guard(() => (def ? openSheet({ kind: 'charge', id: c.id, ym: month.ym }) : undefined))}>
            <CategoryIcon category={c.category} />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="flex flex-wrap items-center gap-1.5">
                <span className="text-[15px] font-semibold">{c.label}</span>
                {badges.map((b) => (
                  <Badge key={b.text} tone={b.tone}>
                    {b.text}
                  </Badge>
                ))}
              </span>
              <span className="truncate text-xs text-muted-foreground">{chargeSubtitle(c, def?.months, fmt)}</span>
            </span>
            <span className="whitespace-nowrap text-[15px] font-bold tabular-nums">{fmt(c.amount)}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/70" aria-hidden="true" />
          </RowButton>
        );
      })}
      {skipped.length > 0 && (
        <div className="mt-1 flex flex-col gap-1 border-t border-dashed border-border pt-3">
          <span className="px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Retirées {deMonth(label)}</span>
          {skipped.map((c) => (
            <div key={c.id} className="flex min-h-[56px] items-center gap-3 rounded-xl px-2.5">
              <CategoryIcon category={c.category} tone="muted" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[15px] font-semibold text-muted-foreground line-through">{c.label}</span>
                <span className="text-xs text-muted-foreground">Exception : ce mois-ci seulement</span>
              </span>
              <span className="text-sm tabular-nums text-muted-foreground line-through">{fmt(c.planned)}</span>
              {!month.closed && (
                <Button
                  variant="ghost"
                  className="min-h-[40px] px-2.5 text-primary"
                  onClick={() => commit((m) => setChargeMonthAmount(m, c.id, month.ym, null), { message: `« ${c.label} » est de retour en ${formatMonthLong(month.ym)}.` })}
                >
                  <RotateCcw className="h-4 w-4" /> Rétablir
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
      {!month.closed && (
        <AddRowButton onClick={() => openSheet({ kind: 'chargeEditor', ym: month.ym })}>
          <Plus /> Ajouter une charge
        </AddRowButton>
      )}
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// Épargne
// ---------------------------------------------------------------------------
export function SavingsCard({ month }: { month: ResolvedMonth }) {
  const { fmt, openSheet, engine } = useBudget();
  const guard = useClosedGuard(month.ym, month.closed);
  const short = MONTHS_SHORT[monthIndex0(month.ym)];
  const reste = month.totals.reste;
  return (
    <SectionCard
      id="epargne"
      title="Épargne"
      subtitle="Mis de côté ce mois-ci, cagnotte par cagnotte"
      amount={fmt(month.totals.savings)}
      amountClassName="text-indigo-700"
    >
      {month.savings.map((s) => (
        <RowButton key={s.id} onClick={guard(() => (s.deleted ? undefined : openSheet({ kind: 'saving', id: s.id, ym: month.ym })))}>
          <IconTile className="bg-indigo-50 text-indigo-700">
            <PiggyBank />
          </IconTile>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="flex flex-wrap items-center gap-1.5">
              <span className="text-[15px] font-semibold">{s.label}</span>
              {s.adjusted && <Badge tone="amber">Ajustée</Badge>}
              {!s.recurring && <Badge tone="grey">Libre</Badge>}
            </span>
            <span className="text-xs text-muted-foreground">
              En caisse fin {short} : {fmt(engine.savingBalance(s.id, month.ym))}
            </span>
            {s.spent > 0 && (
              <span className="text-xs text-orange-800">
                Dépensé : {fmt(s.spent)}
                {s.spentComment ? ` · ${s.spentComment}` : ''}
              </span>
            )}
          </span>
          <span className={cn('whitespace-nowrap text-[15px] font-bold tabular-nums', s.skipped ? 'text-sm font-medium text-muted-foreground' : 'text-indigo-800')}>
            {s.skipped ? 'rien ce mois-ci' : fmt(s.allocation)}
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/70" aria-hidden="true" />
        </RowButton>
      ))}
      <div className="flex min-h-[60px] items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 px-2.5 py-2">
        <IconTile className="bg-emerald-100/70 text-emerald-800">
          <Sprout />
        </IconTile>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[15px] font-semibold">Épargne générale</span>
          <span className="text-xs text-foreground/75">Reçoit le reste du mois · en caisse {fmt(engine.generalBalance(month.ym))}</span>
          {month.generalSpent > 0 && (
            <span className="text-xs text-orange-800">
              Dépensé : {fmt(month.generalSpent)}
              {month.generalComment ? ` · ${month.generalComment}` : ''}
            </span>
          )}
        </span>
        <span className={cn('whitespace-nowrap text-[15px] font-extrabold tabular-nums', reste < 0 ? 'text-red-700' : 'text-emerald-800')}>
          {reste > 0 ? '+' : ''}
          {fmt(reste)}
        </span>
      </div>
      {!month.closed && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <AddRowButton onClick={() => openSheet({ kind: 'spend', ym: month.ym })}>
            <Plus /> Dépense payée par une épargne
          </AddRowButton>
          <AddRowButton onClick={() => openSheet({ kind: 'savingEditor', ym: month.ym })}>
            <Plus /> Nouvelle épargne
          </AddRowButton>
        </div>
      )}
    </SectionCard>
  );
}
