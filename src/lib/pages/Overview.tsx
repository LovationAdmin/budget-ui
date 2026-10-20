// src/lib/pages/Overview.tsx
// ============================================================================
// « Ma vue perso » — the signed-in member's own money, all budgets together.
// ============================================================================
// For the month shown (?m=YYYY-MM, like the month tab), each budget the member
// belongs to says what pay it declares for them, what they put into its pot,
// the pocket money left and their personal charges; the top card adds it all
// up, pay counted once (src/lib/budget/overview.ts). Read-only: every change
// is made in the budget itself, one tap away.
//
// Which person the member is in each budget: their account's link to that
// person, kept by the API, one account per person, so no member ever sees the
// overview of a person who is someone else's. The obvious person (their name,
// or the only person of a budget they don't share) is linked on first visit;
// otherwise the page asks once, persons already linked to another account
// greyed out. A mistaken link can be undone by its member or the budget owner.
//
// Offered from two budgets on, or once a budget is shared: alone in a single
// budget, that budget already is the whole picture (→ dashboard).
// ============================================================================

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, RotateCcw, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { budgetAPI } from '@/services/api';
import { publishBudgetList, type BudgetSummary } from '@/hooks/useBudgetList';
import { CategoryIcon, Pill, Segmented } from '@/components/budget/shared/primitives';
import { cn } from '@/lib/utils';
import { BudgetEngine } from '@/lib/budget/engine';
import { autoCloseMonths, decodeBudget } from '@/lib/budget/codec';
import { addMonths, compareYM, currentYM, formatMonthLong, formatMonthTitle, isYM, monthNameLower } from '@/lib/budget/months';
import { currencySymbol, money, moneyOut, percent } from '@/lib/budget/format';
import { PRIVATE_CHARGE_LABEL, privateChargeName, type Person, type PrivateChargeDetails, type YM } from '@/lib/budget/types';
import {
  guessMe,
  linkOf,
  myMonth,
  overviewTotals,
  overviewUseful,
  parsePrivateCharges,
  resolveMe,
  takenPersons,
  visibleCharge,
  type IncomeMode,
  type MeLink,
  type MyBudgetMonth,
} from '@/lib/budget/overview';
import { defineMessages, useT } from '@/i18n/runtime';

type ViewState = 'closed' | 'forecast' | 'current';

const M = defineMessages({
  fr: {
    title: 'Ma vue perso',
    intro: 'Votre argent, tous budgets confondus : votre revenu, ce que vous versez à chaque budget, vos charges perso et ce qu’il vous reste.',
    previousMonth: 'Mois précédent',
    nextMonth: 'Mois suivant',
    backToCurrent: 'Revenir au mois en cours',
    viewState: { closed: 'Clôturé', forecast: 'Prévisionnel', current: 'En cours' } as Record<ViewState, string>,
    loading: 'Chargement de vos budgets',
    listFailed: 'Impossible de charger vos budgets.',
    retry: 'Réessayer',
    // Summary
    summaryTitle: (month: string) => `Votre mois · ${month}`,
    summaryTitleIn: (currency: string, month: string) => `Votre mois en ${currency} · ${month}`,
    left: 'vous restent une fois vos versements et vos charges perso payés',
    missing: 'manquent : vos versements et vos charges perso dépassent votre revenu',
    income: 'Revenu',
    paidInto: (budget: string) => `Versé à ${budget}`,
    personal: 'Charges perso',
    leftForYou: 'Reste pour vous',
    countedOnce: 'Votre revenu est le même dans vos budgets : il n’est compté qu’une fois.',
    differ: (list: string) => `Votre revenu n’est pas le même selon le budget (${list}). Comment le compter ?`,
    incomeModes: { highest: 'Un seul revenu (le plus élevé)', sum: 'Plusieurs revenus (les additionner)' } as Record<IncomeMode, string>,
    incomeModeLabel: 'Façon de compter votre revenu',
    notCounted: (n: number) => (n > 1 ? `${n} budgets ne sont pas encore comptés : dites-nous qui vous êtes dans chacun, ci-dessous.` : 'Un budget n’est pas encore compté : dites-nous qui vous y êtes, ci-dessous.'),
    nothingThisMonth: (month: string) => `Vous ne faites partie d’aucun foyer en ${month}.`,
    // Budget cards
    byBudget: 'Par budget',
    you: (name: ReactNode): ReactNode => <>Vous : <strong className="text-foreground">{name}</strong></>,
    change: 'Changer',
    who: (budget: string) => `Qui êtes-vous dans « ${budget} » ?`,
    whoHelp: 'Une fiche ne se relie qu’à un seul compte. Les membres du budget voient laquelle est la vôtre.',
    takenBy: (account: string) => (account ? `reliée à ${account}` : 'reliée à un autre compte'),
    allTaken: 'Toutes les fiches de ce foyer sont déjà reliées à un compte. Si l’une d’elles est la vôtre, le propriétaire du budget peut la délier depuis le Foyer.',
    taken: 'Cette personne vient d’être reliée au compte d’un autre membre.',
    notMe: 'Je n’y figure pas',
    cancel: 'Annuler',
    notIn: 'Vous ne figurez pas dans ce budget : il n’est pas compté.',
    noPeople: 'Ce budget n’a encore personne dans son foyer.',
    absent: (month: string) => `Vous ne faites pas partie de ce foyer en ${month}.`,
    declaredPay: 'Revenu',
    paysIn: 'Versé au pot',
    pocketMoney: 'Argent de poche',
    shareOfPay: (pct: string) => `${pct} de votre revenu`,
    personalIncluded: (amount: string) => `dont ${amount} de charges perso`,
    personalShort: (amount: string, missing: string) => `${amount} de charges perso : il manque ${missing}`,
    seeMonth: 'Voir le mois',
    household: 'Foyer',
    loadFailed: (budget: string) => `Impossible de charger « ${budget} ».`,
    saveFailed: 'Votre choix n’a pas pu être enregistré. Réessayez.',
    // Personal charges
    personalTitle: 'Vos charges perso',
    personalIntro: 'Ce que vous payez seul, sur votre argent de poche.',
    personalEmpty: (month: string) => `Aucune charge perso en ${month}. Impôt, crédit perso, envoi d’argent… ajoutez-les dans l’onglet Charges d’un budget.`,
    inBudget: (budget: string) => `dans ${budget}`,
  },
  en: {
    title: 'My overview',
    intro: 'Your money across all your budgets: your income, what you pay into each budget, your personal expenses and what you have left.',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    backToCurrent: 'Back to the current month',
    viewState: { closed: 'Closed', forecast: 'Forecast', current: 'Current' } as Record<ViewState, string>,
    loading: 'Loading your budgets',
    listFailed: 'Couldn’t load your budgets.',
    retry: 'Try again',
    summaryTitle: (month: string) => `Your month · ${month}`,
    summaryTitleIn: (currency: string, month: string) => `Your month in ${currency} · ${month}`,
    left: 'left once your contributions and personal expenses are paid',
    missing: 'short: your contributions and personal expenses are more than your income',
    income: 'Income',
    paidInto: (budget: string) => `Paid into ${budget}`,
    personal: 'Personal expenses',
    leftForYou: 'Left for you',
    countedOnce: 'Your income is the same in your budgets: it’s only counted once.',
    differ: (list: string) => `Your income isn’t the same in every budget (${list}). How should it be counted?`,
    incomeModes: { highest: 'One income (the highest)', sum: 'Several incomes (add them up)' } as Record<IncomeMode, string>,
    incomeModeLabel: 'How to count your income',
    notCounted: (n: number) => (n > 1 ? `${n} budgets aren’t counted yet: tell us who you are in each one, below.` : 'One budget isn’t counted yet: tell us who you are in it, below.'),
    nothingThisMonth: (month: string) => `You’re not part of any household in ${month}.`,
    byBudget: 'By budget',
    you: (name: ReactNode): ReactNode => <>You: <strong className="text-foreground">{name}</strong></>,
    change: 'Change',
    who: (budget: string) => `Who are you in “${budget}”?`,
    whoHelp: 'Each person can be linked to one account only. The budget’s members can see which one is yours.',
    takenBy: (account: string) => (account ? `linked to ${account}` : 'linked to another account'),
    allTaken: 'Everyone in this household is already linked to an account. If one of them is you, the budget’s owner can unlink it from the Household tab.',
    taken: 'This person was just linked to another member’s account.',
    notMe: 'I’m not in it',
    cancel: 'Cancel',
    notIn: 'You’re not in this budget: it isn’t counted.',
    noPeople: 'This budget has nobody in its household yet.',
    absent: (month: string) => `You’re not part of this household in ${month}.`,
    declaredPay: 'Income',
    paysIn: 'Paid into the pot',
    pocketMoney: 'Spending money',
    shareOfPay: (pct: string) => `${pct} of your income`,
    personalIncluded: (amount: string) => `incl. ${amount} of personal expenses`,
    personalShort: (amount: string, missing: string) => `${amount} of personal expenses: ${missing} short`,
    seeMonth: 'See the month',
    household: 'Household',
    loadFailed: (budget: string) => `Couldn’t load “${budget}”.`,
    saveFailed: 'Your choice couldn’t be saved. Please try again.',
    personalTitle: 'Your personal expenses',
    personalIntro: 'What you pay on your own, out of your spending money.',
    personalEmpty: (month: string) => `No personal expenses in ${month}. Taxes, a personal loan, money sent to family… add them in a budget’s Bills tab.`,
    inBudget: (budget: string) => `in ${budget}`,
  },
});

/** One colour per budget: its bar segment in the summary and its dot on its card. */
const BUDGET_TONES = ['bg-sky-500', 'bg-violet-500', 'bg-teal-500', 'bg-rose-500', 'bg-amber-500', 'bg-slate-500'];

const INCOME_MODE_KEY = 'bf:overview-income';

function readIncomeMode(): IncomeMode {
  try {
    return localStorage.getItem(INCOME_MODE_KEY) === 'sum' ? 'sum' : 'highest';
  } catch {
    return 'highest';
  }
}

// ============================================================================
// DATA
// ============================================================================

interface LoadedBudget {
  summary: BudgetSummary;
  tone: string;
  ok: boolean;
  engine?: BudgetEngine;
  people: Person[];
  /** Who the viewer is here (`undefined`: not said yet). */
  link?: MeLink;
  /** Persons linked to other members' accounts → account name. */
  taken: Map<string, string>;
  privateCharges: Record<string, PrivateChargeDetails>;
}

async function loadBudget(
  summary: BudgetSummary,
  tone: string,
  user: { id: string; name?: string } | null,
  today: YM,
): Promise<LoadedBudget> {
  const members = summary.members ?? [];
  const taken = takenPersons(members, user?.id);
  try {
    const [dataRes, privateRes] = await Promise.all([
      budgetAPI.getData(summary.id),
      budgetAPI.privateItems.list(summary.id).catch(() => null),
    ]);
    const raw: unknown = dataRes.data?.data ?? dataRes.data ?? {};
    // Past months as the budget screens show them (frozen), without saving anything.
    const model = autoCloseMonths(decodeBudget(raw, today), today, new Date().toISOString()).model;
    let link = resolveMe(linkOf(members, user?.id), model.people);
    // Not said yet: link the obvious person right away (the API refuses one
    // that is already someone else's; the page then asks).
    const guess = link === undefined && user ? guessMe(model.people, user.name, members.length, taken) : undefined;
    if (guess && user) link = await budgetAPI.setMemberPerson(summary.id, user.id, guess).then(() => guess, () => undefined);
    return {
      summary,
      tone,
      ok: true,
      engine: new BudgetEngine(model, today),
      people: model.people,
      link,
      taken,
      privateCharges: parsePrivateCharges(privateRes?.data?.items ?? {}),
    };
  } catch {
    return { summary, tone, ok: false, people: [], taken, privateCharges: {} };
  }
}

// ============================================================================
// PAGE
// ============================================================================

export default function Overview() {
  const t = useT(M);
  const { user } = useAuth();
  const { toast } = useToast();
  const [today] = useState<YM>(() => currentYM());
  const [params, setParams] = useSearchParams();
  const requested = params.get('m');
  const ym: YM = isYM(requested) ? requested : today;
  const setYm = useCallback(
    (next: YM) =>
      setParams((p) => {
        const copy = new URLSearchParams(p);
        if (next === today) copy.delete('m');
        else copy.set('m', next);
        return copy;
      }),
    [setParams, today],
  );

  const [list, setList] = useState<BudgetSummary[] | null>(null);
  const [listFailed, setListFailed] = useState(false);
  const [budgets, setBudgets] = useState<LoadedBudget[] | null>(null);
  const [choosing, setChoosing] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [incomeMode, setIncomeModeState] = useState<IncomeMode>(readIncomeMode);
  const setIncomeMode = (mode: IncomeMode) => {
    setIncomeModeState(mode);
    try {
      localStorage.setItem(INCOME_MODE_KEY, mode);
    } catch {
      /* the choice just won't be remembered */
    }
  };

  const userId = user?.id;
  const userName = user?.name;
  const me = useMemo(() => (userId ? { id: userId, name: userName } : null), [userId, userName]);
  const load = useCallback(async () => {
    setListFailed(false);
    try {
      const res = await budgetAPI.list();
      const all: BudgetSummary[] = Array.isArray(res.data) ? res.data : [];
      if (userId) publishBudgetList(userId, all);
      setList(all);
      if (!overviewUseful(all)) return;
      setBudgets(await Promise.all(all.map((b, i) => loadBudget(b, BUDGET_TONES[i % BUDGET_TONES.length], me, today))));
    } catch {
      setListFailed(true);
    }
  }, [userId, me, today]);

  useEffect(() => {
    load();
  }, [load]);

  const retryOne = async (b: LoadedBudget) => {
    const fresh = await loadBudget(b.summary, b.tone, me, today);
    setBudgets((prev) => prev?.map((x) => (x.summary.id === b.summary.id ? fresh : x)) ?? prev);
  };

  // Shown only once the API has linked the account: never someone else's person.
  const choose = async (b: LoadedBudget, link: MeLink) => {
    if (!userId) return;
    const id = b.summary.id;
    setSaving(id);
    try {
      await budgetAPI.setMemberPerson(id, userId, link ?? '');
      setBudgets((prev) => prev?.map((x) => (x.summary.id === id ? { ...x, link } : x)) ?? prev);
      setChoosing(null);
    } catch (err: unknown) {
      const taken = (err as { response?: { status?: number } })?.response?.status === 409;
      toast({ description: taken ? t.taken : t.saveFailed, variant: 'destructive' });
      // Someone else has it now: reload to grey it out.
      if (taken) load();
    } finally {
      setSaving(null);
    }
  };

  // ---- The month, budget by budget, then per currency ----
  const rows = useMemo(
    () =>
      (budgets ?? []).map((b) => {
        const month: MyBudgetMonth | null = b.ok && b.engine && typeof b.link === 'string' ? myMonth(b.engine, b.link, ym) : null;
        return { b, me: b.link, month, currency: b.summary.currency || 'EUR' };
      }),
    [budgets, ym],
  );
  type Row = (typeof rows)[number];
  const groups = useMemo(() => {
    const byCurrency = new Map<string, Row[]>();
    for (const r of rows) {
      if (!r.month) continue;
      byCurrency.set(r.currency, [...(byCurrency.get(r.currency) ?? []), r]);
    }
    return Array.from(byCurrency, ([currency, items]) => ({ currency, items, totals: overviewTotals(items.map((r) => r.month!), incomeMode) }));
  }, [rows, incomeMode]);

  const uncounted = rows.filter((r) => r.b.ok && r.me === undefined && r.b.people.length > 0).length;
  const loaded = rows.filter((r) => r.b.engine);
  const viewState: ViewState =
    loaded.length > 0 && loaded.every((r) => r.b.engine!.isClosed(ym)) ? 'closed' : compareYM(ym, today) > 0 ? 'forecast' : 'current';

  // Cards: what needs an answer first, then the counted budgets, then the others.
  const order = (r: Row) => (!r.b.ok ? 1 : r.me === undefined && r.b.people.length > 0 ? 0 : r.me === null || r.b.people.length === 0 ? 3 : 2);
  const cards = rows.slice().sort((a, b) => order(a) - order(b));

  const personalRows = rows.flatMap((r) =>
    (r.month?.personal ?? []).map((c) => ({ c, r, shown: visibleCharge(c, userId, r.b.privateCharges) })),
  );
  const currencies = new Set(personalRows.map((p) => p.r.currency));
  const personalTotal = personalRows.reduce((s, p) => s + p.c.amount, 0);

  if (list && !overviewUseful(list)) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main id="contenu" className="flex-1 mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 pb-16 sm:px-6 lg:px-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">{t.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t.intro}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="icon" className="h-11 w-11 shrink-0" aria-label={t.previousMonth} onClick={() => setYm(addMonths(ym, -1))}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="min-w-[150px] text-center font-display text-lg font-extrabold tabular-nums" aria-live="polite">{formatMonthTitle(ym)}</span>
          <Button variant="outline" size="icon" className="h-11 w-11 shrink-0" aria-label={t.nextMonth} onClick={() => setYm(addMonths(ym, 1))}>
            <ChevronRight className="h-5 w-5" />
          </Button>
          <Pill tone={viewState === 'closed' ? 'grey' : viewState === 'current' ? 'green' : 'blue'}>{t.viewState[viewState]}</Pill>
          {ym !== today && (
            <Button variant="ghost" className="min-h-[44px]" onClick={() => setYm(today)}>
              {t.backToCurrent}
            </Button>
          )}
        </div>

        {listFailed ? (
          <div role="alert" className="flex flex-col items-start gap-3 rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
            <p className="text-sm">{t.listFailed}</p>
            <Button variant="outline" className="min-h-[44px]" onClick={load}>
              <RotateCcw className="h-4 w-4" /> {t.retry}
            </Button>
          </div>
        ) : !budgets ? (
          <OverviewSkeleton label={t.loading} />
        ) : (
          <>
            {groups.length === 0 ? (
              <div className="rounded-2xl border-[1.5px] border-dashed border-border px-5 py-6 text-center text-sm text-muted-foreground">
                {uncounted > 0 ? t.notCounted(uncounted) : t.nothingThisMonth(formatMonthLong(ym))}
              </div>
            ) : (
              <div className={cn('grid gap-4', groups.length > 1 && 'lg:grid-cols-2')}>
                {groups.map((g) => (
                  <SummaryCard
                    key={g.currency}
                    ym={ym}
                    currency={g.currency}
                    multiCurrency={groups.length > 1}
                    items={g.items}
                    totals={g.totals}
                    incomeMode={incomeMode}
                    onIncomeMode={setIncomeMode}
                    uncounted={uncounted}
                  />
                ))}
              </div>
            )}

            <section aria-labelledby="budgets-title" className="flex flex-col gap-3">
              <h2 id="budgets-title" className="px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.byBudget}</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {cards.map((r) => (
                  <BudgetCard
                    key={r.b.summary.id}
                    budget={r.b}
                    me={r.me}
                    month={r.month}
                    ym={ym}
                    today={today}
                    choosing={choosing === r.b.summary.id}
                    saving={saving === r.b.summary.id}
                    onChoose={(link) => choose(r.b, link)}
                    onStartChoosing={() => setChoosing(r.b.summary.id)}
                    onCancelChoosing={() => setChoosing(null)}
                    onRetry={() => retryOne(r.b)}
                  />
                ))}
              </div>
            </section>

            <section aria-labelledby="perso-title" className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 id="perso-title" className="font-display text-base sm:text-lg font-bold">{t.personalTitle}</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">{t.personalIntro}</p>
                </div>
                {personalRows.length > 0 && currencies.size === 1 && (
                  <span className="font-display text-lg sm:text-xl font-extrabold tabular-nums whitespace-nowrap">
                    {moneyOut(personalTotal, currencySymbol(personalRows[0].r.currency))}
                  </span>
                )}
              </div>
              {personalRows.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">{t.personalEmpty(monthNameLower(ym))}</p>
              ) : (
                <ul className="mt-3 flex flex-col gap-1">
                  {personalRows
                    .slice()
                    .sort((a, b) => b.c.amount - a.c.amount)
                    .map(({ c, r, shown }) => (
                      <li key={`${r.b.summary.id}:${c.id}`}>
                        <Link
                          to={`/budget/${r.b.summary.id}/complete/charges#perso`}
                          className="flex min-h-[60px] w-full items-center gap-3 rounded-xl border border-transparent px-2.5 py-2 transition-colors hover:border-border/70 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <CategoryIcon category={shown.category} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-semibold">{shown.label === PRIVATE_CHARGE_LABEL ? privateChargeName() : shown.label}</span>
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <span aria-hidden="true" className={cn('h-2 w-2 shrink-0 rounded-sm', r.b.tone)} />
                              <span className="truncate">{t.inBudget(r.b.summary.name)}</span>
                            </span>
                          </span>
                          <span className="font-semibold tabular-nums whitespace-nowrap">{moneyOut(c.amount, currencySymbol(r.currency))}</span>
                        </Link>
                      </li>
                    ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

// ============================================================================
// SUMMARY — where the month's pay goes
// ============================================================================

function SummaryCard({
  ym,
  currency,
  multiCurrency,
  items,
  totals,
  incomeMode,
  onIncomeMode,
  uncounted,
}: {
  ym: YM;
  currency: string;
  multiCurrency: boolean;
  items: Array<{ b: LoadedBudget; month: MyBudgetMonth | null }>;
  totals: ReturnType<typeof overviewTotals>;
  incomeMode: IncomeMode;
  onIncomeMode: (mode: IncomeMode) => void;
  uncounted: number;
}) {
  const t = useT(M);
  const symbol = currencySymbol(currency);
  const fmt = (n: number) => money(n, symbol);
  const present = items.filter((r) => r.month?.present);
  const deficit = totals.left < 0;
  const segments = [
    ...present.map((r) => ({ key: r.b.summary.id, v: r.month!.contribution, cls: r.b.tone })),
    { key: 'personal', v: totals.personal, cls: 'bg-orange-500' },
    { key: 'left', v: Math.max(0, totals.left), cls: 'bg-emerald-500' },
  ].filter((s) => s.v > 0);
  const base = Math.max(1, totals.income, totals.contributions + totals.personal);
  const differing = present.filter((r) => r.month!.salary > 0);
  const month = monthNameLower(ym);
  return (
    <section aria-labelledby={`summary-${currency}`} className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
      <h2 id={`summary-${currency}`} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {multiCurrency ? t.summaryTitleIn(currency, month) : t.summaryTitle(month)}
      </h2>
      <p className={cn('mt-2 font-display text-4xl font-extrabold tracking-tight tabular-nums', deficit ? 'text-red-700' : 'text-emerald-700')}>
        {fmt(deficit ? -totals.left : totals.left)}
      </p>
      <p className="mt-1 text-sm text-foreground/75">{deficit ? t.missing : t.left}</p>
      {/* Stacked bar: segments separated by a 2px surface gap, never by a stroke. */}
      <div aria-hidden="true" className="mt-4 flex h-3 gap-[2px] overflow-hidden rounded-full bg-muted">
        {segments.map((s) => (
          <span key={s.key} className={cn('block min-w-[3px]', s.cls)} style={{ width: `${Math.min(100, (s.v / base) * 100)}%` }} />
        ))}
      </div>
      <dl className="mt-4 flex flex-col gap-2 text-sm tabular-nums">
        <div className="flex items-center justify-between gap-3">
          <dt className="font-semibold">{t.income}</dt>
          <dd className="font-bold">{fmt(totals.income)}</dd>
        </div>
        {present.map((r) => (
          <div key={r.b.summary.id} className="flex items-center justify-between gap-3">
            <dt className="flex min-w-0 items-center gap-2">
              <span aria-hidden="true" className={cn('h-2.5 w-2.5 shrink-0 rounded-sm', r.b.tone)} />
              <span className="truncate">{t.paidInto(r.b.summary.name)}</span>
            </dt>
            <dd className="font-semibold">{moneyOut(r.month!.contribution, symbol)}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-2"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-orange-500" />{t.personal}</dt>
          <dd className="font-semibold">{moneyOut(totals.personal, symbol)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-2">
          <dt className="flex items-center gap-2 font-bold"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />{t.leftForYou}</dt>
          <dd className={cn('font-extrabold', deficit ? 'text-red-700' : 'text-emerald-700')}>{fmt(totals.left)}</dd>
        </div>
      </dl>
      {totals.incomesDiffer ? (
        <div className="mt-4 flex flex-col gap-2 rounded-xl bg-muted/50 px-3 py-2.5 text-sm">
          <p>{t.differ(differing.map((r) => `${fmt(r.month!.salary)} ${t.inBudget(r.b.summary.name)}`).join(', '))}</p>
          <Segmented
            value={incomeMode}
            onChange={onIncomeMode}
            label={t.incomeModeLabel}
            stackOnMobile
            options={(['highest', 'sum'] as const).map((value) => ({ value, label: t.incomeModes[value] }))}
          />
        </div>
      ) : (
        differing.length > 1 && <p className="mt-3 text-xs text-muted-foreground">{t.countedOnce}</p>
      )}
      {uncounted > 0 && <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-900">{t.notCounted(uncounted)}</p>}
    </section>
  );
}

// ============================================================================
// ONE BUDGET
// ============================================================================

function BudgetCard({
  budget,
  me,
  month,
  ym,
  today,
  choosing,
  saving,
  onChoose,
  onStartChoosing,
  onCancelChoosing,
  onRetry,
}: {
  budget: LoadedBudget;
  me: MeLink | undefined;
  month: MyBudgetMonth | null;
  ym: YM;
  today: YM;
  choosing: boolean;
  saving: boolean;
  onChoose: (link: MeLink) => void;
  onStartChoosing: () => void;
  onCancelChoosing: () => void;
  onRetry: () => void;
}) {
  const t = useT(M);
  const { summary, tone } = budget;
  const symbol = currencySymbol(summary.currency || 'EUR');
  const fmt = (n: number) => money(n, symbol);
  const base = `/budget/${summary.id}/complete`;
  const monthLink = ym === today ? `${base}/month` : `${base}/month?m=${ym}`;
  const meName = typeof me === 'string' ? budget.people.find((p) => p.id === me)?.name : undefined;
  const state: ViewState | null = month ? (month.closed ? 'closed' : compareYM(ym, today) > 0 ? 'forecast' : 'current') : null;

  const header = (
    <div className="flex items-start gap-3">
      <span aria-hidden="true" className={cn('mt-1.5 h-3 w-3 shrink-0 rounded-sm', tone)} />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-lg font-extrabold">{summary.name}</h3>
        {meName && !choosing && (
          <p className="text-sm text-muted-foreground">
            {t.you(meName)}
            {' · '}
            <button type="button" onClick={onStartChoosing} className="inline-flex min-h-[32px] items-center font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
              {t.change}
            </button>
          </p>
        )}
      </div>
      {state && <Pill tone={state === 'closed' ? 'grey' : state === 'current' ? 'green' : 'blue'}>{t.viewState[state]}</Pill>}
    </div>
  );

  if (!budget.ok) {
    return (
      <article className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
        {header}
        <p role="alert" className="text-sm text-muted-foreground">{t.loadFailed(summary.name)}</p>
        <Button variant="outline" className="min-h-[44px] self-start" onClick={onRetry}>
          <RotateCcw className="h-4 w-4" /> {t.retry}
        </Button>
      </article>
    );
  }

  if (budget.people.length === 0) {
    return (
      <article className="flex flex-col gap-3 rounded-2xl border border-dashed border-border bg-muted/20 p-5">
        {header}
        <p className="text-sm text-muted-foreground">{t.noPeople}</p>
        <Button asChild variant="outline" className="min-h-[44px] self-start">
          <Link to={`${base}/members`}><Users className="h-4 w-4" /> {t.household}</Link>
        </Button>
      </article>
    );
  }

  if (choosing || me === undefined) {
    const allTaken = budget.people.every((p) => budget.taken.has(p.id));
    return (
      <article aria-busy={saving} className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-primary/40 bg-card p-5 shadow-soft">
        {header}
        <fieldset disabled={saving} className="flex flex-col gap-2">
          <legend className="font-semibold">{t.who(summary.name)}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {budget.people.map((p) => {
              // Someone else's person: shown, never selectable.
              const owner = budget.taken.get(p.id);
              const isTaken = owner !== undefined;
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={me === p.id}
                  disabled={isTaken}
                  onClick={() => (me === p.id ? onCancelChoosing() : onChoose(p.id))}
                  className={cn(
                    'inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed',
                    me === p.id ? 'border-foreground bg-foreground text-background' : 'border-border bg-card hover:bg-muted',
                    isTaken && 'border-dashed bg-muted/40 text-muted-foreground hover:bg-muted/40',
                  )}
                >
                  {p.name}
                  {isTaken && <span className="text-xs font-normal">· {t.takenBy(owner)}</span>}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">{allTaken ? t.allTaken : t.whoHelp}</p>
        </fieldset>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" className="min-h-[44px]" disabled={saving} onClick={() => (me === null ? onCancelChoosing() : onChoose(null))}>
            {t.notMe}
          </Button>
          {choosing && me !== undefined && (
            <Button variant="ghost" className="min-h-[44px]" disabled={saving} onClick={onCancelChoosing}>
              {t.cancel}
            </Button>
          )}
        </div>
      </article>
    );
  }

  if (me === null) {
    return (
      <article className="flex flex-col gap-2 rounded-2xl border border-dashed border-border bg-muted/20 p-5">
        {header}
        <p className="text-sm text-muted-foreground">
          {t.notIn}{' '}
          <button type="button" onClick={onStartChoosing} className="inline-flex min-h-[32px] items-center font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
            {t.change}
          </button>
        </p>
      </article>
    );
  }

  const links = (
    <div className="flex flex-wrap gap-2 border-t border-border/60 pt-3">
      <Button asChild variant="outline" className="min-h-[44px]">
        <Link to={monthLink}>{t.seeMonth} <ArrowRight className="h-4 w-4" /></Link>
      </Button>
      <Button asChild variant="ghost" className="min-h-[44px]">
        <Link to={`${base}/members`}><Users className="h-4 w-4" /> {t.household}</Link>
      </Button>
    </div>
  );

  if (!month?.present) {
    return (
      <article className="flex flex-col gap-3 rounded-2xl border border-dashed border-border bg-muted/20 p-5">
        {header}
        <p className="text-sm text-muted-foreground">{t.absent(formatMonthLong(ym))}</p>
        {links}
      </article>
    );
  }

  const share = month.salary > 0 ? (month.contribution / month.salary) * 100 : 0;
  const available = month.keep - month.personalTotal;
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
      {header}
      <dl className="grid grid-cols-3 gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <dt className="text-xs font-bold text-muted-foreground">{t.declaredPay}</dt>
          <dd className="font-display text-lg font-extrabold tabular-nums">{fmt(month.salary)}</dd>
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <dt className="text-xs font-bold text-emerald-700">{t.paysIn}</dt>
          <dd className="font-display text-lg font-extrabold tabular-nums text-emerald-700">{fmt(month.contribution)}</dd>
          {month.salary > 0 && <dd className="text-xs text-muted-foreground">{t.shareOfPay(percent(share))}</dd>}
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <dt className="text-xs font-bold text-muted-foreground">{t.pocketMoney}</dt>
          <dd className="font-display text-lg font-extrabold tabular-nums">{fmt(month.keep)}</dd>
          {month.personalTotal > 0 && (
            <dd className={cn('text-xs', available < 0 ? 'font-semibold text-red-700' : 'text-muted-foreground')}>
              {available < 0 ? t.personalShort(fmt(month.personalTotal), fmt(-available)) : t.personalIncluded(fmt(month.personalTotal))}
            </dd>
          )}
        </div>
      </dl>
      {month.salary > 0 && (
        <span aria-hidden="true" className="block h-2 overflow-hidden rounded-full bg-muted">
          <span className="block h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, share)}%` }} />
        </span>
      )}
      {links}
    </article>
  );
}

function OverviewSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="flex flex-col gap-4">
      <Skeleton className="h-64 w-full rounded-2xl" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    </div>
  );
}
