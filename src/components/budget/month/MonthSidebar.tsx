// src/components/budget/month/MonthSidebar.tsx
// Month summary (the household pot at a glance), what changed since last
// month, and the month note / close action.

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, CircleSlash, Lock, Plus, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useBudget } from '@/contexts/BudgetContext';
import type { MonthChange, ResolvedMonth } from '@/lib/budget/engine';
import { closeMonth, setMonthComment } from '@/lib/budget/mutations';
import { addMonths, compareYM, formatMonthTitle, MONTH_NAMES, monthIndex0, monthNameLower } from '@/lib/budget/months';
import { moneyOut, percent } from '@/lib/budget/format';

export function SummaryCard({ month }: { month: ResolvedMonth }) {
  const { fmt, budgetId, currencySymbol } = useBudget();
  const t = month.totals;
  const base = Math.max(1, t.entrees);
  const w = (v: number) => `${Math.max(0, Math.min(100, (v / base) * 100))}%`;
  const needs = t.charges + t.savings;
  const coverage = needs > 0 ? (t.entrees / needs) * 100 : 100;
  const deficit = t.reste < 0;
  return (
    <section aria-labelledby="resume-title" className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
      <h2 id="resume-title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Pot commun · {MONTH_NAMES[monthIndex0(month.ym)]}
      </h2>
      <p className={cn('mt-2 font-display text-4xl font-extrabold tracking-tight tabular-nums', deficit ? 'text-red-700' : 'text-emerald-700')}>{fmt(t.reste)}</p>
      <p className="mt-1 text-sm text-foreground/75">
        {deficit ? 'manquent pour couvrir les charges et l’épargne prévues' : 'restent dans le pot : ils vont à l’épargne générale'}
      </p>
      <div aria-hidden="true" className="mt-4 flex h-3 overflow-hidden rounded-full bg-muted">
        <span className="block bg-orange-500" style={{ width: w(t.charges) }} />
        <span className="block bg-indigo-500" style={{ width: w(t.savings) }} />
        <span className="block bg-emerald-500" style={{ width: w(Math.max(0, t.reste)) }} />
      </div>
      <dl className="mt-4 flex flex-col gap-2 text-sm tabular-nums">
        <div className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-2"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-emerald-700" />Entrées</dt>
          <dd className="font-bold text-emerald-700">{fmt(t.entrees)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-2"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-orange-500" />Charges</dt>
          <dd className="font-semibold">{moneyOut(t.charges, currencySymbol)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-2"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-indigo-500" />Épargne</dt>
          <dd className="font-semibold">{moneyOut(t.savings, currencySymbol)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-2">
          <dt className="flex items-center gap-2 font-bold"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />Reste du mois</dt>
          <dd className={cn('font-extrabold', deficit ? 'text-red-700' : 'text-emerald-700')}>{fmt(t.reste)}</dd>
        </div>
      </dl>
      <div className={cn('mt-4 rounded-xl px-3 py-2.5 text-sm', deficit ? 'bg-red-50 text-red-900' : 'bg-emerald-50 text-emerald-900')}>
        {deficit
          ? `Il manque ${fmt(-t.reste)} : les entrées ne couvrent que ${percent(coverage)} des besoins du mois.`
          : `Les entrées couvrent ${percent(coverage)} des besoins du mois (charges + épargne).`}
        {deficit && (
          <Link className="mt-1 block font-semibold underline underline-offset-2" to={`/budget/${budgetId}/complete/members#repartition`}>
            Revoir les contributions
          </Link>
        )}
      </div>
    </section>
  );
}

function ChangeIcon({ kind }: { kind: MonthChange['kind'] }) {
  const cls = 'h-3.5 w-3.5';
  if (kind === 'up') return <ArrowUp className={cls} />;
  if (kind === 'down') return <ArrowDown className={cls} />;
  if (kind === 'end' || kind === 'skip' || kind === 'pause') return <CircleSlash className={cls} />;
  return <Plus className={cls} />;
}

export function ChangesCard({ ym }: { ym: string }) {
  const { engine, fmt } = useBudget();
  const changes = engine.changes(ym);
  const prevLabel = monthNameLower(addMonths(ym, -1));
  return (
    <section aria-labelledby="changes-title" className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
      <h2 id="changes-title" className="font-display text-base font-bold">Ce qui change en {monthNameLower(ym)}</h2>
      <p className="text-xs text-muted-foreground">Par rapport à {prevLabel}</p>
      {changes.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Aucun changement : même budget qu’en {prevLabel}.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2.5">
          {changes.map((c) => {
            const signed = c.scope === 'income' ? c.delta : c.delta;
            const tone = c.tone === 'good' ? 'text-emerald-700' : c.tone === 'bad' ? 'text-orange-800' : 'text-indigo-700';
            const text = c.scope === 'income' && c.text === 'contribution' ? `contribution ${signed > 0 ? 'en hausse' : 'en baisse'}` : c.text;
            return (
              <li key={`${c.scope}-${c.id}-${c.kind}`} className="flex items-center gap-2.5">
                <span aria-hidden="true" className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/70">
                  <ChangeIcon kind={c.kind} />
                </span>
                <span className="min-w-0 flex-1 text-sm">
                  <strong className="font-semibold">{c.label}</strong>
                  <span className="text-muted-foreground"> · {text}</span>
                </span>
                <span className={cn('whitespace-nowrap text-sm font-bold tabular-nums', tone)}>
                  {signed > 0 ? '+' : ''}
                  {fmt(signed)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function NoteCard({ month, idSuffix }: { month: ResolvedMonth; idSuffix: string }) {
  const { commit, openSheet, today } = useBudget();
  const [draft, setDraft] = useState(month.comment);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ym = month.ym;

  useEffect(() => setDraft(month.comment), [month.comment, ym]);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const flush = (value: string) => {
    if (timer.current) clearTimeout(timer.current);
    if (value !== month.comment) commit((m) => setMonthComment(m, ym, value));
  };

  const isFuture = compareYM(ym, today) > 0;
  const nextMonth = monthNameLower(addMonths(ym, 1));
  const id = `month-note-${idSuffix}`;

  return (
    <section aria-label="Note et clôture du mois" className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
      <label htmlFor={id} className="font-display text-base font-bold">Note du mois</label>
      <textarea
        id={id}
        value={draft}
        readOnly={month.closed}
        onChange={(e) => {
          const v = e.target.value;
          setDraft(v);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => flush(v), 800);
        }}
        onBlur={() => flush(draft)}
        rows={3}
        placeholder="Ex. : anniversaire de Léa, vacances…"
        className="mt-2 w-full resize-y rounded-xl border border-input bg-background px-3.5 py-3 text-base leading-snug placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring read-only:bg-muted/50 read-only:text-muted-foreground"
      />
      <div className="mt-3 border-t border-border/60 pt-3">
        {month.closed ? (
          <Button variant="outline" className="min-h-[44px] w-full" onClick={() => openSheet({ kind: 'reopen', ym })}>
            <Unlock className="h-4 w-4" /> Rouvrir {monthNameLower(ym)}
          </Button>
        ) : isFuture ? (
          <p className="text-sm text-muted-foreground">Vous pourrez le clôturer une fois le mois commencé.</p>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              {ym === today
                ? `Se clôture tout seul le 1ᵉʳ ${nextMonth}. Vous pouvez aussi le clôturer dès maintenant.`
                : 'Ce mois passé a été rouvert. Clôturez-le quand vos corrections sont faites.'}
            </p>
            <Button
              variant="outline"
              className="min-h-[44px] w-full"
              onClick={() =>
                commit((m) => closeMonth(m, ym, new Date().toISOString()), {
                  message: `${formatMonthTitle(ym)} est clôturé : ses montants sont figés.`,
                })
              }
            >
              <Lock className="h-4 w-4" /> Clôturer {monthNameLower(ym)}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
