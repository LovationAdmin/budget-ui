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
import { formatMonthLong, monthNameLower, monthNamesShort, monthIndex0, deMonth } from '@/lib/budget/months';
import type { YM } from '@/lib/budget/types';
import { AddRowButton, Badge, CategoryIcon, IconTile, RowButton, SectionCard, type PillTone } from '../shared/primitives';
import { defineMessages, pick, useT } from '@/i18n/runtime';

const M = defineMessages({
  fr: {
    closedMonth: 'Ce mois est clôturé : ses montants sont figés.',
    reopenMonth: 'Rouvrir le mois',
    reopen: 'Rouvrir',
    incomeTitle: 'Entrées du pot commun',
    incomeSub: (salaries: string, keep: string) => `Ce que chacun verse. Salaires : ${salaries} · argent de poche : ${keep}`,
    noMembers: 'Ajoutez les membres du foyer pour commencer.',
    pays: 'verse',
    pay: (salary: string, keep: string, personal: string | null) =>
      `Salaire ${salary} · argent de poche ${keep}${personal ? ` (dont ${personal} perso)` : ''} ·`,
    adjusted: 'ajusté ce mois-ci',
    leftHousehold: ' · ne fait plus partie du foyer',
    oneOffSub: 'Revenu ponctuel, ce mois-ci seulement',
    remove: (label: string) => `Retirer « ${label} »`,
    removed: (label: string, month: string) => `« ${label} » retiré ${deMonth(month)}.`,
    addOneOff: 'Revenu ponctuel (prime, remboursement…)',
    addMember: 'Ajouter un membre',
    badgeDeleted: 'Supprimée depuis',
    badgeThisMonth: 'Ce mois-ci',
    badgeNew: 'Nouvelle',
    badgeResumes: 'Reprend',
    badgeDue: 'Échéance',
    badgeAdjusted: 'Ajustée',
    badgeLast: 'Dernier mois',
    oneOff: 'Ponctuelle',
    smoothed: (base: string) => `Provision · ${base} par an`,
    yearly: 'Annuelle',
    everyMonth: 'Tous les mois',
    planned: (planned: string, sub: string) => `Prévu ${planned} · ${sub}`,
    chargesTitle: 'Charges du mois',
    chargesSub: (n: number) => `${n} charge${n > 1 ? 's' : ''} · remplies automatiquement depuis vos règles`,
    noCharges: 'Aucune charge ce mois-ci.',
    removedFrom: (month: string) => `Retirées ${deMonth(month)}`,
    exception: 'Exception : ce mois-ci seulement',
    back: (label: string, month: string) => `« ${label} » est de retour en ${month}.`,
    restore: 'Rétablir',
    addCharge: 'Ajouter une charge',
    savingsTitle: 'Épargne',
    savingsSub: 'Mis de côté ce mois-ci, cagnotte par cagnotte',
    free: 'Libre',
    inPot: (month: string, amount: string) => `En caisse fin ${month} : ${amount}`,
    spent: 'Dépensé : ',
    nothing: 'rien ce mois-ci',
    general: 'Épargne générale',
    generalSub: (amount: string) => `Reçoit le reste du mois · en caisse ${amount}`,
    addSpend: 'Dépense payée par une épargne',
    addSaving: 'Nouvelle épargne',
  },
  en: {
    closedMonth: 'This month is closed: its amounts are locked.',
    reopenMonth: 'Reopen the month',
    reopen: 'Reopen',
    incomeTitle: 'Money into the joint pot',
    incomeSub: (salaries: string, keep: string) => `What each person pays in. Take-home pay: ${salaries} · spending money: ${keep}`,
    noMembers: 'Add the household members to get started.',
    pays: 'pays in',
    pay: (salary: string, keep: string, personal: string | null) =>
      `Pay ${salary} · spending money ${keep}${personal ? ` (incl. ${personal} personal)` : ''} ·`,
    adjusted: 'adjusted this month',
    leftHousehold: ' · no longer in the household',
    oneOffSub: 'One-off income, this month only',
    remove: (label: string) => `Remove “${label}”`,
    removed: (label: string, month: string) => `“${label}” removed from ${month}.`,
    addOneOff: 'One-off income (bonus, refund…)',
    addMember: 'Add a member',
    badgeDeleted: 'Since deleted',
    badgeThisMonth: 'This month',
    badgeNew: 'New',
    badgeResumes: 'Resumes',
    badgeDue: 'Due',
    badgeAdjusted: 'Adjusted',
    badgeLast: 'Final month',
    oneOff: 'One-off',
    smoothed: (base: string) => `Spread over 12 months · ${base} a year`,
    yearly: 'Yearly',
    everyMonth: 'Every month',
    planned: (planned: string, sub: string) => `Planned ${planned} · ${sub}`,
    chargesTitle: 'Bills for the month',
    chargesSub: (n: number) => `${n === 1 ? '1 bill' : `${n} bills`} · filled in automatically from your rules`,
    noCharges: 'No bills this month.',
    removedFrom: (month: string) => `Removed from ${month}`,
    exception: 'Exception: this month only',
    back: (label: string, month: string) => `“${label}” is back in ${month}.`,
    restore: 'Restore',
    addCharge: 'Add a bill',
    savingsTitle: 'Savings',
    savingsSub: 'Set aside this month, pot by pot',
    free: 'Flexible',
    inPot: (month: string, amount: string) => `In the pot at the end of ${month}: ${amount}`,
    spent: 'Spent: ',
    nothing: 'nothing this month',
    general: 'General savings',
    generalSub: (amount: string) => `Gets what’s left for the month · in the pot: ${amount}`,
    addSpend: 'Expense paid from savings',
    addSaving: 'New savings pot',
  },
});

function useClosedGuard(ym: YM, closed: boolean) {
  const t = useT(M);
  const { toast } = useToast();
  const { openSheet } = useBudget();
  return (fn: () => void) => () => {
    if (!closed) return fn();
    toast({
      description: t.closedMonth,
      action: (
        <ToastAction altText={t.reopenMonth} onClick={() => openSheet({ kind: 'reopen', ym })}>
          {t.reopen}
        </ToastAction>
      ),
    });
  };
}

// ---------------------------------------------------------------------------
// Entrées
// ---------------------------------------------------------------------------
export function IncomeCard({ month }: { month: ResolvedMonth }) {
  const t = useT(M);
  const { fmt, openSheet, commit } = useBudget();
  const guard = useClosedGuard(month.ym, month.closed);
  const totals = month.totals;
  return (
    <SectionCard
      id="entrees"
      title={t.incomeTitle}
      subtitle={
        month.people.length
          ? t.incomeSub(fmt(totals.salaries), fmt(totals.salaries - totals.contributions))
          : t.noMembers
      }
      amount={fmt(totals.entrees)}
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
                  {p.name} <span className="text-sm font-normal text-muted-foreground">{t.pays}</span>
                </span>
                <span className="text-[15px] font-bold tabular-nums">{fmt(p.contribution)}</span>
              </span>
              <span aria-hidden="true" className="block h-1.5 overflow-hidden rounded-full bg-muted">
                <span className="block h-full rounded-full bg-emerald-500" style={{ width: `${share}%` }} />
              </span>
              <span className="text-xs text-muted-foreground">
                {t.pay(fmt(p.salary), fmt(p.keep), p.personalCharges > 0 ? fmt(p.personalCharges) : null)}{' '}
                {p.contributionAdjusted || p.salaryAdjusted ? t.adjusted : contributionRuleText(p.mode, p.value)}
                {p.deleted ? t.leftHousehold : ''}
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
            <span className="text-xs text-muted-foreground">{t.oneOffSub}</span>
          </span>
          <span className="text-[15px] font-bold tabular-nums text-emerald-700">+{fmt(o.amount)}</span>
          {!month.closed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground"
              aria-label={t.remove(o.label)}
              onClick={() => commit((m) => removeOneOff(m, month.ym, o.id), { message: t.removed(o.label, formatMonthLong(month.ym)) })}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      {!month.closed && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <AddRowButton onClick={() => openSheet({ kind: 'oneOff', ym: month.ym })}>
            <Plus /> {t.addOneOff}
          </AddRowButton>
          {month.people.length === 0 && (
            <AddRowButton onClick={() => openSheet({ kind: 'member', ym: month.ym })}>
              <Plus /> {t.addMember}
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
  const t = pick(M);
  const out: Array<{ text: string; tone: PillTone }> = [];
  if (c.deleted) out.push({ text: t.badgeDeleted, tone: 'grey' });
  if (startYM === ym && c.frequency !== 'yearly') out.push({ text: c.frequency === 'once' ? t.badgeThisMonth : t.badgeNew, tone: 'blue' });
  else if ((!prev || prev.skipped) && c.frequency === 'custom') out.push({ text: t.badgeResumes, tone: 'blue' });
  if (c.dueMonth) out.push({ text: t.badgeDue, tone: 'indigo' });
  if (prev && !prev.skipped && !c.adjusted && Math.abs(prev.amount - c.amount) >= 0.005) {
    const d = c.amount - prev.amount;
    out.push({ text: `${d > 0 ? '+' : '−'}${fmt(Math.abs(d))}`, tone: d > 0 ? 'orange' : 'green' });
  }
  if (c.adjusted) out.push({ text: t.badgeAdjusted, tone: 'amber' });
  if (endYM === ym && c.frequency !== 'once') out.push({ text: t.badgeLast, tone: 'grey' });
  return out;
}

function chargeSubtitle(c: ResolvedCharge, months: number[] | undefined, fmt: (n: number) => string): string {
  const t = pick(M);
  let sub: string;
  if (c.frequency === 'once') sub = t.oneOff;
  else if (c.frequency === 'yearly') sub = c.smooth ? t.smoothed(fmt(c.base)) : t.yearly;
  else if (c.frequency === 'custom') sub = customMonthsText(months);
  else sub = t.everyMonth;
  if (c.adjusted) sub = t.planned(fmt(c.planned), sub);
  return sub;
}

export function ChargesCard({ month, prevMonth }: { month: ResolvedMonth; prevMonth: ResolvedMonth }) {
  const t = useT(M);
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
      title={t.chargesTitle}
      subtitle={count ? t.chargesSub(count) : t.noCharges}
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
          <span className="px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{t.removedFrom(label)}</span>
          {skipped.map((c) => (
            <div key={c.id} className="flex min-h-[56px] items-center gap-3 rounded-xl px-2.5">
              <CategoryIcon category={c.category} tone="muted" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[15px] font-semibold text-muted-foreground line-through">{c.label}</span>
                <span className="text-xs text-muted-foreground">{t.exception}</span>
              </span>
              <span className="text-sm tabular-nums text-muted-foreground line-through">{fmt(c.planned)}</span>
              {!month.closed && (
                <Button
                  variant="ghost"
                  className="min-h-[40px] px-2.5 text-primary"
                  onClick={() => commit((m) => setChargeMonthAmount(m, c.id, month.ym, null), { message: t.back(c.label, formatMonthLong(month.ym)) })}
                >
                  <RotateCcw className="h-4 w-4" /> {t.restore}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
      {!month.closed && (
        <AddRowButton onClick={() => openSheet({ kind: 'chargeEditor', ym: month.ym })}>
          <Plus /> {t.addCharge}
        </AddRowButton>
      )}
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// Épargne
// ---------------------------------------------------------------------------
export function SavingsCard({ month }: { month: ResolvedMonth }) {
  const t = useT(M);
  const { fmt, openSheet, engine } = useBudget();
  const guard = useClosedGuard(month.ym, month.closed);
  const short = monthNamesShort()[monthIndex0(month.ym)];
  const reste = month.totals.reste;
  return (
    <SectionCard
      id="epargne"
      title={t.savingsTitle}
      subtitle={t.savingsSub}
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
              {s.adjusted && <Badge tone="amber">{t.badgeAdjusted}</Badge>}
              {!s.recurring && <Badge tone="grey">{t.free}</Badge>}
            </span>
            <span className="text-xs text-muted-foreground">
              {t.inPot(short, fmt(engine.savingBalance(s.id, month.ym)))}
            </span>
            {s.spent > 0 && (
              <span className="text-xs text-orange-800">
                {t.spent}{fmt(s.spent)}
                {s.spentComment ? ` · ${s.spentComment}` : ''}
              </span>
            )}
          </span>
          <span className={cn('whitespace-nowrap text-[15px] font-bold tabular-nums', s.skipped ? 'text-sm font-medium text-muted-foreground' : 'text-indigo-800')}>
            {s.skipped ? t.nothing : fmt(s.allocation)}
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/70" aria-hidden="true" />
        </RowButton>
      ))}
      <div className="flex min-h-[60px] items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 px-2.5 py-2">
        <IconTile className="bg-emerald-100/70 text-emerald-800">
          <Sprout />
        </IconTile>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[15px] font-semibold">{t.general}</span>
          <span className="text-xs text-foreground/75">{t.generalSub(fmt(engine.generalBalance(month.ym)))}</span>
          {month.generalSpent > 0 && (
            <span className="text-xs text-orange-800">
              {t.spent}{fmt(month.generalSpent)}
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
            <Plus /> {t.addSpend}
          </AddRowButton>
          <AddRowButton onClick={() => openSheet({ kind: 'savingEditor', ym: month.ym })}>
            <Plus /> {t.addSaving}
          </AddRowButton>
        </div>
      )}
    </SectionCard>
  );
}
