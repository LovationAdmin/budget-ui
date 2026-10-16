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
import { addMonths, compareYM, formatMonthTitle, monthNames, monthIndex0, monthNameLower } from '@/lib/budget/months';
import { moneyOut, percent } from '@/lib/budget/format';
import { defineMessages, useT } from '@/i18n/runtime';

const M = defineMessages({
  fr: {
    potTitle: (month: string) => `Pot commun · ${month}`,
    missing: 'manquent pour couvrir les charges et l’épargne prévues',
    left: 'restent dans le pot : ils vont à l’épargne générale',
    income: 'Entrées',
    charges: 'Charges',
    savings: 'Épargne',
    reste: 'Reste du mois',
    deficit: (missing: string, coverage: string) => `Il manque ${missing} : les entrées ne couvrent que ${coverage} des besoins du mois.`,
    covered: (coverage: string) => `Les entrées couvrent ${coverage} des besoins du mois (charges + épargne).`,
    reviewContributions: 'Revoir les contributions',
    changesTitle: (month: string) => `Ce qui change en ${month}`,
    comparedTo: (month: string) => `Par rapport à ${month}`,
    noChange: (month: string) => `Aucun changement : même budget qu’en ${month}.`,
    contribution: (up: boolean) => `contribution ${up ? 'en hausse' : 'en baisse'}`,
    noteSection: 'Note et clôture du mois',
    note: 'Note du mois',
    notePlaceholder: 'Ex. : anniversaire de Léa, vacances…',
    reopen: (month: string) => `Rouvrir ${month}`,
    closeLater: 'Vous pourrez le clôturer une fois le mois commencé.',
    autoClose: (next: string) => `Se clôture tout seul le 1ᵉʳ ${next}. Vous pouvez aussi le clôturer dès maintenant.`,
    reopened: 'Ce mois passé a été rouvert. Clôturez-le quand vos corrections sont faites.',
    closed: (month: string) => `${month} est clôturé : ses montants sont figés.`,
    close: (month: string) => `Clôturer ${month}`,
  },
  en: {
    potTitle: (month: string) => `Joint pot · ${month}`,
    missing: 'missing to cover the planned bills and savings',
    left: 'left in the pot: it goes to general savings',
    income: 'Money in',
    charges: 'Bills',
    savings: 'Savings',
    reste: 'Left for the month',
    deficit: (missing: string, coverage: string) => `You’re ${missing} short: the money coming in covers only ${coverage} of the month’s needs.`,
    covered: (coverage: string) => `The money coming in covers ${coverage} of the month’s needs (bills + savings).`,
    reviewContributions: 'Review contributions',
    changesTitle: (month: string) => `What changes in ${month}`,
    comparedTo: (month: string) => `Compared with ${month}`,
    noChange: (month: string) => `No changes: same budget as in ${month}.`,
    contribution: (up: boolean) => `contribution ${up ? 'up' : 'down'}`,
    noteSection: 'Month note and closing',
    note: 'Month note',
    notePlaceholder: 'E.g. Emma’s birthday, summer trip…',
    reopen: (month: string) => `Reopen ${month}`,
    closeLater: 'You can close it once the month has started.',
    autoClose: (next: string) => `Closes automatically when ${next} starts. You can also close it now.`,
    reopened: 'This past month was reopened. Close it again once your changes are done.',
    closed: (month: string) => `${month} is closed: its amounts are locked.`,
    close: (month: string) => `Close ${month}`,
  },
});

export function SummaryCard({ month }: { month: ResolvedMonth }) {
  const t = useT(M);
  const { fmt, budgetId, currencySymbol } = useBudget();
  const totals = month.totals;
  const base = Math.max(1, totals.entrees);
  const w = (v: number) => `${Math.max(0, Math.min(100, (v / base) * 100))}%`;
  const needs = totals.charges + totals.savings;
  const coverage = needs > 0 ? (totals.entrees / needs) * 100 : 100;
  const deficit = totals.reste < 0;
  return (
    <section aria-labelledby="resume-title" className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
      <h2 id="resume-title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {t.potTitle(monthNames()[monthIndex0(month.ym)])}
      </h2>
      <p className={cn('mt-2 font-display text-4xl font-extrabold tracking-tight tabular-nums', deficit ? 'text-red-700' : 'text-emerald-700')}>{fmt(totals.reste)}</p>
      <p className="mt-1 text-sm text-foreground/75">
        {deficit ? t.missing : t.left}
      </p>
      {/* Stacked bar: segments separated by a 2px surface gap, never by a stroke. */}
      <div aria-hidden="true" className="mt-4 flex h-3 gap-[2px] overflow-hidden rounded-full">
        {[
          { v: totals.charges, cls: 'bg-orange-500' },
          { v: totals.savings, cls: 'bg-indigo-500' },
          { v: Math.max(0, totals.reste), cls: 'bg-emerald-500' },
        ]
          .filter((s) => s.v > 0)
          .map((s) => (
            <span key={s.cls} className={cn('block min-w-[3px]', s.cls)} style={{ width: w(s.v) }} />
          ))}
        {totals.charges + totals.savings + Math.max(0, totals.reste) <= 0 && <span className="block flex-1 bg-muted" />}
      </div>
      <dl className="mt-4 flex flex-col gap-2 text-sm tabular-nums">
        <div className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-2"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-emerald-700" />{t.income}</dt>
          <dd className="font-bold text-emerald-700">{fmt(totals.entrees)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-2"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-orange-500" />{t.charges}</dt>
          <dd className="font-semibold">{moneyOut(totals.charges, currencySymbol)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-2"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-indigo-500" />{t.savings}</dt>
          <dd className="font-semibold">{moneyOut(totals.savings, currencySymbol)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-2">
          <dt className="flex items-center gap-2 font-bold"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />{t.reste}</dt>
          <dd className={cn('font-extrabold', deficit ? 'text-red-700' : 'text-emerald-700')}>{fmt(totals.reste)}</dd>
        </div>
      </dl>
      <div className={cn('mt-4 rounded-xl px-3 py-2.5 text-sm', deficit ? 'bg-red-50 text-red-900' : 'bg-emerald-50 text-emerald-900')}>
        {deficit
          ? t.deficit(fmt(-totals.reste), percent(coverage))
          : t.covered(percent(coverage))}
        {deficit && (
          <Link className="mt-1 block font-semibold underline underline-offset-2" to={`/budget/${budgetId}/complete/members#repartition`}>
            {t.reviewContributions}
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
  const t = useT(M);
  const { engine, fmt } = useBudget();
  const changes = engine.changes(ym);
  const prevLabel = monthNameLower(addMonths(ym, -1));
  return (
    <section aria-labelledby="changes-title" className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
      <h2 id="changes-title" className="font-display text-base font-bold">{t.changesTitle(monthNameLower(ym))}</h2>
      <p className="text-xs text-muted-foreground">{t.comparedTo(prevLabel)}</p>
      {changes.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{t.noChange(prevLabel)}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2.5">
          {changes.map((c) => {
            const signed = c.scope === 'income' ? c.delta : c.delta;
            const tone = c.tone === 'good' ? 'text-emerald-700' : c.tone === 'bad' ? 'text-orange-800' : 'text-indigo-700';
            const text = c.scope === 'income' && c.text === 'contribution' ? t.contribution(signed > 0) : c.text;
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
  const t = useT(M);
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
    <section aria-label={t.noteSection} className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
      <label htmlFor={id} className="font-display text-base font-bold">{t.note}</label>
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
        placeholder={t.notePlaceholder}
        className="mt-2 w-full resize-y rounded-xl border border-input bg-background px-3.5 py-3 text-base leading-snug placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring read-only:bg-muted/50 read-only:text-muted-foreground"
      />
      <div className="mt-3 border-t border-border/60 pt-3">
        {month.closed ? (
          <Button variant="outline" className="min-h-[44px] w-full" onClick={() => openSheet({ kind: 'reopen', ym })}>
            <Unlock className="h-4 w-4" /> {t.reopen(monthNameLower(ym))}
          </Button>
        ) : isFuture ? (
          <p className="text-sm text-muted-foreground">{t.closeLater}</p>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              {ym === today
                ? t.autoClose(nextMonth)
                : t.reopened}
            </p>
            <Button
              variant="outline"
              className="min-h-[44px] w-full"
              onClick={() =>
                commit((m) => closeMonth(m, ym, new Date().toISOString()), {
                  message: t.closed(formatMonthTitle(ym)),
                })
              }
            >
              <Lock className="h-4 w-4" /> {t.close(monthNameLower(ym))}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
