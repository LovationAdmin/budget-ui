// src/components/budget/MobileMonthlyView.tsx
// ============================================================================
// 🎯 MobileMonthlyView — Card-based monthly view for mobile devices
// ============================================================================
// Fixes P0 #2 (the critical one). The desktop <table> is unusable on
// 375px-wide phones (Safari iOS / Chrome Android). This component:
//
//  - One card per month, vertically stacked
//  - Tap to expand month → see incomes, charges, project allocations
//  - Inline editing of allocations + expenses (the only reason users come
//    back to this page on mobile)
//  - Shows comments and lock state
//  - Sticky "Available to save" badge at the top of each card
//
// Keep the desktop <MonthlyTable /> visible on `md:block`. Render this on
// `md:hidden`.
// ============================================================================

import { useState, useCallback, useMemo, memo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
  MessageSquare,
  Pencil,
  PiggyBank,
  TrendingUp,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type {
  Person,
  Charge,
  Project,
  YearlyData,
  OneTimeIncomes,
  MonthComments,
  ProjectComments,
  LockedMonths,
} from '@/utils/importConverter';

// ============================================================================
// CONSTANTS
// ============================================================================

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const SHORT_MONTHS = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc',
];

const GENERAL_SAVINGS_ID = 'epargne';

// ============================================================================
// HELPERS
// ============================================================================

function getCurrencySymbol(code?: string): string {
  switch (code) {
    case 'USD': return '$';
    case 'CAD': return '$';
    case 'GBP': return '£';
    case 'CHF': return 'CHF';
    case 'EUR': return '€';
    case 'XOF': return 'CFA';
    case 'MAD': return 'DH';
    default: return '€';
  }
}

const isPersonActive = (person: Person, year: number, monthIndex: number): boolean => {
  const monthStart = new Date(year, monthIndex, 1);
  const monthEnd = new Date(year, monthIndex + 1, 0);
  if (person.startDate) {
    const start = new Date(person.startDate);
    if (start > monthEnd) return false;
  }
  if (person.endDate) {
    const end = new Date(person.endDate);
    if (end < monthStart) return false;
  }
  return true;
};

const isChargeActive = (charge: Charge, year: number, monthIndex: number): boolean => {
  const monthStart = new Date(year, monthIndex, 1);
  const monthEnd = new Date(year, monthIndex + 1, 0);
  if (charge.startDate) {
    const start = new Date(charge.startDate);
    if (start > monthEnd) return false;
  }
  if (charge.endDate) {
    const end = new Date(charge.endDate);
    if (end < monthStart) return false;
  }
  return true;
};

// ============================================================================
// PROPS
// ============================================================================

interface MobileMonthlyViewProps {
  currentYear: number;
  people: Person[];
  charges: Charge[];
  projects: Project[];
  yearlyData: YearlyData;
  yearlyExpenses: YearlyData;
  oneTimeIncomes: OneTimeIncomes;
  monthComments: MonthComments;
  projectComments: ProjectComments;
  lockedMonths: LockedMonths;
  projectCarryOvers: Record<string, number>;
  currency?: string;
  onYearlyDataChange: (data: YearlyData) => void;
  onYearlyExpensesChange: (data: YearlyData) => void;
  onOneTimeIncomesChange: (data: OneTimeIncomes) => void;
  onMonthCommentsChange: (data: MonthComments) => void;
  onProjectCommentsChange: (data: ProjectComments) => void;
  onLockedMonthsChange: (data: LockedMonths) => void;
}

// ============================================================================
// MONTH CARD — memoized per month
// ============================================================================

interface MonthCardProps {
  month: string;
  monthIndex: number;
  monthShort: string;
  isCurrent: boolean;
  expanded: boolean;
  onToggle: () => void;
  // Data
  baseIncome: number;
  oneTime: number;
  chargesTotal: number;
  available: number;
  generalAllocation: number;
  generalCumulative: number;
  isLocked: boolean;
  hasComment: boolean;
  comment: string;
  projects: Project[];
  yearlyData: YearlyData;
  yearlyExpenses: YearlyData;
  projectComments: ProjectComments;
  currencySymbol: string;
  // Handlers
  onUpdateAllocation: (projectId: string, amount: number) => void;
  onUpdateExpense: (projectId: string, amount: number) => void;
  onUpdateOneTime: (amount: number) => void;
  onToggleLock: () => void;
  onOpenComment: () => void;
}

const MonthCard = memo(function MonthCard(props: MonthCardProps) {
  const {
    month,
    monthShort,
    isCurrent,
    expanded,
    onToggle,
    baseIncome,
    oneTime,
    chargesTotal,
    available,
    generalAllocation,
    generalCumulative,
    isLocked,
    hasComment,
    comment,
    projects,
    yearlyData,
    yearlyExpenses,
    currencySymbol,
    onUpdateAllocation,
    onUpdateExpense,
    onUpdateOneTime,
    onToggleLock,
    onOpenComment,
  } = props;

  const standardProjects = projects.filter((p) => p.id !== GENERAL_SAVINGS_ID);
  const isDeficit = available < 0;

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-200',
        isCurrent && 'ring-2 ring-primary/40 shadow-elevated',
        isLocked && 'opacity-90'
      )}
    >
      {/* HEADER (always visible, tappable) */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 p-4 text-left min-h-[64px] hover:bg-accent/30 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold',
              isCurrent
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {monthShort}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm">{month}</span>
              {isLocked && <Lock className="h-3 w-3 text-warning" />}
              {hasComment && (
                <MessageSquare className="h-3 w-3 text-primary" />
              )}
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span
                className={cn(
                  'text-base font-bold tabular-nums',
                  isDeficit ? 'text-destructive' : 'text-success'
                )}
              >
                {available.toLocaleString('fr-FR', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}{' '}
                {currencySymbol}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                disponible
              </span>
            </div>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-muted-foreground transition-transform duration-200 shrink-0',
            expanded && 'rotate-180'
          )}
          aria-hidden
        />
      </button>

      {/* EXPANDED BODY */}
      {expanded && (
        <div className="border-t border-border/50 bg-muted/20 p-4 space-y-4 animate-in slide-in-from-top-1 duration-200">
          {/* INCOME ROW */}
          <section>
            <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-success uppercase tracking-wide">
              <TrendingUp className="h-3 w-3" />
              Revenus
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-background border border-border/50 p-2.5">
                <div className="text-[10px] text-muted-foreground uppercase">Salaires</div>
                <div className="font-mono font-semibold text-sm">
                  {baseIncome.toLocaleString('fr-FR')} {currencySymbol}
                </div>
              </div>
              <div className="rounded-lg bg-background border border-border/50 p-2.5">
                <div className="text-[10px] text-muted-foreground uppercase mb-1">Ponctuels</div>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={oneTime || ''}
                  onChange={(e) =>
                    onUpdateOneTime(parseFloat(e.target.value) || 0)
                  }
                  disabled={isLocked}
                  placeholder="0"
                  className="h-8 px-2 text-sm font-mono border-0 bg-transparent focus:bg-background"
                />
              </div>
            </div>
          </section>

          {/* CHARGES ROW */}
          <section>
            <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-destructive uppercase tracking-wide">
              <Receipt className="h-3 w-3" />
              Charges
            </div>
            <div className="rounded-lg bg-background border border-border/50 p-2.5">
              <div className="font-mono font-semibold text-sm text-destructive">
                − {chargesTotal.toLocaleString('fr-FR')} {currencySymbol}
              </div>
            </div>
          </section>

          {/* PROJECT ALLOCATIONS */}
          {standardProjects.length > 0 && (
            <section>
              <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-secondary uppercase tracking-wide">
                <PiggyBank className="h-3 w-3" />
                Projets
              </div>
              <div className="space-y-1.5">
                {standardProjects.map((project) => {
                  const allocation = yearlyData[month]?.[project.id] || 0;
                  const expense = yearlyExpenses[month]?.[project.id] || 0;
                  return (
                    <div
                      key={project.id}
                      className="rounded-lg bg-background border border-border/50 p-2.5"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-sm font-medium truncate">
                          {project.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-muted-foreground uppercase block mb-0.5">
                            Alloué
                          </label>
                          <Input
                            type="number"
                            inputMode="decimal"
                            value={allocation || ''}
                            onChange={(e) =>
                              onUpdateAllocation(
                                project.id,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            disabled={isLocked}
                            placeholder="0"
                            className="h-9 text-sm font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground uppercase block mb-0.5">
                            Dépensé
                          </label>
                          <Input
                            type="number"
                            inputMode="decimal"
                            value={expense || ''}
                            onChange={(e) =>
                              onUpdateExpense(
                                project.id,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            disabled={isLocked}
                            placeholder="0"
                            className="h-9 text-sm font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* GENERAL SAVINGS */}
          <section>
            <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-primary uppercase tracking-wide">
              <Sparkles className="h-3 w-3" />
              Épargne générale
            </div>
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">
                    Auto
                  </div>
                  <div className="font-mono font-semibold text-sm">
                    {generalAllocation.toLocaleString('fr-FR', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}{' '}
                    {currencySymbol}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">
                    Cumul
                  </div>
                  <div className="font-mono font-semibold text-sm text-primary">
                    {generalCumulative.toLocaleString('fr-FR', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}{' '}
                    {currencySymbol}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* COMMENT (if any) */}
          {hasComment && (
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
              <div className="text-[10px] text-primary uppercase tracking-wide font-semibold mb-1">
                Note
              </div>
              <p className="text-sm text-foreground italic">"{comment}"</p>
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenComment}
              className="flex-1 min-h-[44px]"
            >
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              {hasComment ? 'Note' : 'Ajouter note'}
            </Button>
            <Button
              variant={isLocked ? 'default' : 'outline'}
              size="sm"
              onClick={onToggleLock}
              className="flex-1 min-h-[44px]"
            >
              {isLocked ? (
                <>
                  <Lock className="h-3.5 w-3.5 mr-1.5" /> Verrouillé
                </>
              ) : (
                <>
                  <Unlock className="h-3.5 w-3.5 mr-1.5" /> Verrouiller
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MobileMonthlyView({
  currentYear,
  people,
  charges,
  projects,
  yearlyData,
  yearlyExpenses,
  oneTimeIncomes,
  monthComments,
  projectComments,
  lockedMonths,
  projectCarryOvers,
  currency = 'EUR',
  onYearlyDataChange,
  onYearlyExpensesChange,
  onOneTimeIncomesChange,
  onMonthCommentsChange,
  onLockedMonthsChange,
}: MobileMonthlyViewProps) {
  const currencySymbol = getCurrencySymbol(currency);
  const todayMonthIndex = new Date().getMonth();
  const todayYear = new Date().getFullYear();

  // Default: only current month expanded; others collapsed
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(() => {
    const set = new Set<string>();
    if (currentYear === todayYear) {
      set.add(MONTHS[todayMonthIndex]);
    } else {
      set.add(MONTHS[0]);
    }
    return set;
  });

  // Comment dialog state (kept local to mobile view)
  const [editingCommentMonth, setEditingCommentMonth] = useState<string | null>(null);
  const [tempComment, setTempComment] = useState('');

  const toggleMonth = useCallback((month: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(month)) next.delete(month);
      else next.add(month);
      return next;
    });
  }, []);

  const expandAll = () => setExpandedMonths(new Set(MONTHS));
  const collapseAll = () => setExpandedMonths(new Set());

  // Per-month calculations
  const monthData = useMemo(() => {
    return MONTHS.map((month, monthIndex) => {
      const baseIncome = people.reduce(
        (sum, p) => (isPersonActive(p, currentYear, monthIndex) ? sum + p.salary : sum),
        0
      );
      const chargesTotal = charges.reduce(
        (sum, c) => (isChargeActive(c, currentYear, monthIndex) ? sum + c.amount : sum),
        0
      );
      const oneTime = oneTimeIncomes[month] || 0;
      const available = baseIncome + oneTime - chargesTotal;

      const totalAllocatedToProjects = projects
        .filter((p) => p.id !== GENERAL_SAVINGS_ID)
        .reduce((sum, project) => sum + (yearlyData[month]?.[project.id] || 0), 0);

      const generalAllocation = available - totalAllocatedToProjects;

      // Cumulative general savings up to this month
      let generalCumulative = projectCarryOvers[GENERAL_SAVINGS_ID] || 0;
      for (let i = 0; i <= monthIndex; i++) {
        const m = MONTHS[i];
        const inc = people.reduce(
          (sum, p) => (isPersonActive(p, currentYear, i) ? sum + p.salary : sum),
          0
        );
        const ch = charges.reduce(
          (sum, c) => (isChargeActive(c, currentYear, i) ? sum + c.amount : sum),
          0
        );
        const ot = oneTimeIncomes[m] || 0;
        const av = inc + ot - ch;
        const allocated = projects
          .filter((p) => p.id !== GENERAL_SAVINGS_ID)
          .reduce((sum, project) => sum + (yearlyData[m]?.[project.id] || 0), 0);
        const exp = yearlyExpenses[m]?.[GENERAL_SAVINGS_ID] || 0;
        generalCumulative += av - allocated - exp;
      }

      return {
        month,
        monthIndex,
        monthShort: SHORT_MONTHS[monthIndex],
        isCurrent: currentYear === todayYear && monthIndex === todayMonthIndex,
        baseIncome,
        oneTime,
        chargesTotal,
        available,
        generalAllocation,
        generalCumulative,
      };
    });
  }, [
    people,
    charges,
    projects,
    yearlyData,
    yearlyExpenses,
    oneTimeIncomes,
    projectCarryOvers,
    currentYear,
    todayMonthIndex,
    todayYear,
  ]);

  // Handlers
  const updateAllocation = useCallback(
    (month: string, projectId: string, amount: number) => {
      onYearlyDataChange({
        ...yearlyData,
        [month]: { ...(yearlyData[month] || {}), [projectId]: amount },
      });
    },
    [yearlyData, onYearlyDataChange]
  );

  const updateExpense = useCallback(
    (month: string, projectId: string, amount: number) => {
      onYearlyExpensesChange({
        ...yearlyExpenses,
        [month]: { ...(yearlyExpenses[month] || {}), [projectId]: amount },
      });
    },
    [yearlyExpenses, onYearlyExpensesChange]
  );

  const updateOneTime = useCallback(
    (month: string, amount: number) => {
      onOneTimeIncomesChange({ ...oneTimeIncomes, [month]: amount });
    },
    [oneTimeIncomes, onOneTimeIncomesChange]
  );

  const toggleLock = useCallback(
    (month: string) => {
      onLockedMonthsChange({ ...lockedMonths, [month]: !lockedMonths[month] });
    },
    [lockedMonths, onLockedMonthsChange]
  );

  const openCommentEditor = useCallback(
    (month: string) => {
      setEditingCommentMonth(month);
      setTempComment(monthComments[month] || '');
    },
    [monthComments]
  );

  const saveCommentInline = () => {
    if (!editingCommentMonth) return;
    onMonthCommentsChange({
      ...monthComments,
      [editingCommentMonth]: tempComment,
    });
    setEditingCommentMonth(null);
    setTempComment('');
  };

  return (
    <div className="space-y-3">
      {/* Quick actions */}
      <div className="flex items-center justify-between gap-2 px-1">
        <Badge variant="secondary" className="font-mono">
          {currentYear}
        </Badge>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={expandAll}
            className="h-8 text-xs"
          >
            Tout ouvrir
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={collapseAll}
            className="h-8 text-xs"
          >
            Tout fermer
          </Button>
        </div>
      </div>

      {/* Month cards */}
      <div className="space-y-2">
        {monthData.map((m) => (
          <MonthCard
            key={m.month}
            month={m.month}
            monthIndex={m.monthIndex}
            monthShort={m.monthShort}
            isCurrent={m.isCurrent}
            expanded={expandedMonths.has(m.month)}
            onToggle={() => toggleMonth(m.month)}
            baseIncome={m.baseIncome}
            oneTime={m.oneTime}
            chargesTotal={m.chargesTotal}
            available={m.available}
            generalAllocation={m.generalAllocation}
            generalCumulative={m.generalCumulative}
            isLocked={!!lockedMonths[m.month]}
            hasComment={!!monthComments[m.month]}
            comment={monthComments[m.month] || ''}
            projects={projects}
            yearlyData={yearlyData}
            yearlyExpenses={yearlyExpenses}
            projectComments={projectComments}
            currencySymbol={currencySymbol}
            onUpdateAllocation={(projectId, amount) =>
              updateAllocation(m.month, projectId, amount)
            }
            onUpdateExpense={(projectId, amount) =>
              updateExpense(m.month, projectId, amount)
            }
            onUpdateOneTime={(amount) => updateOneTime(m.month, amount)}
            onToggleLock={() => toggleLock(m.month)}
            onOpenComment={() => openCommentEditor(m.month)}
          />
        ))}
      </div>

      {/* Inline comment editor (sheet-style on mobile) */}
      {editingCommentMonth && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in"
          onClick={() => setEditingCommentMonth(null)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-floating animate-in slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-muted-foreground/30" />
            <h3 className="font-display text-lg font-semibold mb-3">
              Note pour {editingCommentMonth}
            </h3>
            <textarea
              value={tempComment}
              onChange={(e) => setTempComment(e.target.value)}
              rows={4}
              autoFocus
              placeholder="Ex: Anniversaire de Léa ce mois-ci…"
              className="w-full rounded-xl border border-border bg-background p-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
              style={{ fontSize: '16px' }}
            />
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                onClick={() => setEditingCommentMonth(null)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button onClick={saveCommentInline} className="flex-1">
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
