// src/lib/pages/BudgetComplete.tsx
// ============================================================================
// 🎯 BudgetComplete (refactored as Layout)
// ============================================================================
// Fixes P0 #1, P0 #3, P0 #4. This file is now a LAYOUT that:
//
//  1. Loads + maintains all budget state (people, charges, projects, etc.)
//  2. Wraps children in <BudgetProvider> so each tab can consume what it needs
//  3. Renders <BudgetNavbar> + <Outlet /> (active tab from React Router)
//  4. Hosts the SaveStatusIndicator (P0 #3)
//  5. Hosts the OnboardingCoach (P0 #4) — non-blocking checklist
//
// The original ~3000 lines of section-rendering moved to budget-tabs/*.
// ============================================================================

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Outlet } from 'react-router-dom';
import api, { budgetAPI } from '../../services/api';
import {
  convertOldFormatToNew,
  convertNewFormatToOld,
  type RawBudgetData,
  type Person,
  type Charge,
  type Project,
  type YearlyData,
  type OneTimeIncomes,
  type MonthComments,
  type ProjectComments,
  type LockedMonths,
} from '../../utils/importConverter';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useSaveStatus } from '../../hooks/useSaveStatus';

import { BudgetNavbar, NavItem } from '@/components/budget/BudgetNavbar';
import { SaveStatusIndicator } from '@/components/budget/SaveStatusIndicator';
import {
  OnboardingCoach,
  useOnboardingProgress,
} from '@/components/onboarding/OnboardingCoach';
import InviteModal from '../../components/InviteModal';
import { EnableBankingManager } from '../../components/budget/EnableBankingManager';
import {
  TransactionMapper,
  MappedTransaction,
  BridgeTransaction,
} from '../../components/budget/TransactionMapper';
import { DemoBanner } from '@/components/budget/DemoBanner';

import {
  BudgetProvider,
  type BudgetContextValue,
  type BudgetData,
} from '@/contexts/BudgetContext';

import {
  LayoutDashboard,
  Users,
  Receipt,
  Target,
  CalendarDays,
  FlaskConical,
  Sparkles as SparklesIcon,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useTutorial } from '../../contexts/TutorialContext';

import {
  DEMO_TRANSACTIONS,
  DEMO_BANK_BALANCE,
  DEMO_MODE_LIMITS,
} from '@/constants/demoData';

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const GENERAL_SAVINGS_ID = 'epargne';

// ============================================================================
// NAV ITEMS — visible in BudgetNavbar
// ============================================================================
// 🎯 Fix P1 #7: include all 6 (no more .slice(0,5)).
// Each item maps to a real route segment.
const BUDGET_NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: 'members', label: 'Membres', icon: Users },
  { id: 'charges', label: 'Charges', icon: Receipt },
  { id: 'projects', label: 'Projets', icon: Target },
  { id: 'calendar', label: 'Calendrier', icon: CalendarDays },
  { id: 'reality', label: 'Reality Check', icon: FlaskConical },
];

const NAV_TO_ROUTE: Record<string, string> = {
  overview: 'overview',
  members: 'members',
  charges: 'charges',
  projects: 'projects',
  calendar: 'calendar',
  reality: 'reality',
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function BudgetCompleteLayout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { hasSeenTutorial } = useTutorial();
  const { connectToBudget, disconnectFromBudget } = useNotifications();

  // ===== Save status (replaces orange unsaved-banner) =====
  const saveStatus = useSaveStatus();

  // ===== Core =====
  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const globalDataRef = useRef<any>(null);

  const [budgetTitle, setBudgetTitle] = useState('');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [people, setPeople] = useState<Person[]>([]);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [yearlyData, setYearlyData] = useState<YearlyData>({});
  const [yearlyExpenses, setYearlyExpenses] = useState<YearlyData>({});
  const [oneTimeIncomes, setOneTimeIncomes] = useState<OneTimeIncomes>({});
  const [monthComments, setMonthComments] = useState<MonthComments>({});
  const [projectComments, setProjectComments] = useState<ProjectComments>({});
  const [lockedMonths, setLockedMonths] = useState<LockedMonths>({});

  // ===== Reality Check / banking =====
  const [showBankManager, setShowBankManager] = useState(false);
  const [chargeMappings, setChargeMappings] = useState<MappedTransaction[]>([]);
  const [chargeToMap, setChargeToMap] = useState<Charge | null>(null);
  const [showMapper, setShowMapper] = useState(false);
  const [realBankBalance, setRealBankBalance] = useState(0);
  const [hasActiveConnection, setHasActiveConnection] = useState(false);

  // ===== Demo mode =====
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoBankBalance, setDemoBankBalance] = useState(0);
  const [demoTransactions, setDemoTransactions] = useState<BridgeTransaction[]>([]);

  // ===== AI tracking (for onboarding) =====
  const [hasRunSuggestions, setHasRunSuggestions] = useState(false);

  const budgetLocation = budget?.location || 'FR';
  const budgetCurrency = budget?.currency || 'EUR';

  // ============================================================================
  // LOAD BUDGET
  // ============================================================================
  useEffect(() => {
    if (!id) return;

    const loadBudget = async () => {
      try {
        const [budgetRes, dataRes] = await Promise.all([
          budgetAPI.get(id),
          budgetAPI.getData(id),
        ]);
        setBudget(budgetRes.data);
        setBudgetTitle(budgetRes.data.name);

        const rawData = dataRes.data || {};
        globalDataRef.current = rawData;
        hydrateStateFromGlobal(currentYear, rawData);
      } catch (err) {
        console.error('[BudgetComplete] load error', err);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger le budget',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadBudget();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const hydrateStateFromGlobal = useCallback(
    (year: number, rawData: any) => {
      if (rawData.people) setPeople(rawData.people);
      if (rawData.charges) setCharges(rawData.charges);
      if (rawData.projects) setProjects(rawData.projects);

      if (rawData.yearlyData?.[year]) {
        const yearData = rawData.yearlyData[year];
        const newYearlyData: YearlyData = {};
        const newYearlyExpenses: YearlyData = {};
        const newOneTime: OneTimeIncomes = {};
        const newMonthComments: MonthComments = {};
        const newProjectComments: ProjectComments = {};

        MONTHS.forEach((month, idx) => {
          if (yearData.months?.[idx]) newYearlyData[month] = yearData.months[idx];
          if (yearData.expenses?.[idx]) newYearlyExpenses[month] = yearData.expenses[idx];
          if (yearData.monthComments?.[idx])
            newMonthComments[month] = yearData.monthComments[idx];
          if (yearData.expenseComments?.[idx])
            newProjectComments[month] = yearData.expenseComments[idx];
          if (rawData.oneTimeIncomes?.[year]?.[idx]) {
            newOneTime[month] = Number(rawData.oneTimeIncomes[year][idx].amount || 0);
          }
        });

        setYearlyData(newYearlyData);
        setYearlyExpenses(newYearlyExpenses);
        setOneTimeIncomes(newOneTime);
        setMonthComments(newMonthComments);
        setProjectComments(newProjectComments);
      } else {
        setYearlyData({});
        setYearlyExpenses({});
        setOneTimeIncomes({});
        setMonthComments({});
        setProjectComments({});
      }

      if (rawData.lockedMonths?.[year]) {
        const lm: LockedMonths = {};
        MONTHS.forEach((month, idx) => {
          if (rawData.lockedMonths[year][idx]) lm[month] = true;
        });
        setLockedMonths(lm);
      }
    },
    []
  );

  // ============================================================================
  // PROJECT CARRY-OVERS (sums from past years)
  // ============================================================================
  const projectCarryOvers = useMemo(() => {
    const carryOvers: Record<string, number> = {};
    if (!globalDataRef.current?.yearlyData) return carryOvers;

    Object.keys(globalDataRef.current.yearlyData).forEach((yearStr) => {
      const year = parseInt(yearStr);
      if (year < currentYear) {
        const yearData = globalDataRef.current.yearlyData[yearStr];
        if (yearData.months && yearData.expenses) {
          yearData.months.forEach((monthAllocation: any, idx: number) => {
            const monthExpense = yearData.expenses[idx] || {};
            Object.keys(monthAllocation).forEach((projectId) => {
              const allocated = monthAllocation[projectId] || 0;
              const spent = monthExpense[projectId] || 0;
              carryOvers[projectId] = (carryOvers[projectId] || 0) + (allocated - spent);
            });
          });
        }
      }
    });

    return carryOvers;
  }, [currentYear]);

  // ============================================================================
  // DERIVED VALUES
  // ============================================================================
  const householdSize = useMemo(() => Math.max(1, people.length), [people]);

  const mappedTotalsByChargeId = useMemo(() => {
    const totals: Record<string, number> = {};
    charges.forEach((ch) => {
      const mapped = chargeMappings.filter((m) => m.chargeId === ch.id);
      totals[ch.id] = mapped.reduce((sum, m) => sum + Math.abs(m.amount), 0);
    });
    return totals;
  }, [charges, chargeMappings]);

  const totalGlobalRealized = useMemo(() => {
    const today = new Date();
    const currentMonthIndex = today.getMonth();
    const currentRealYear = today.getFullYear();
    let total = 0;

    if (currentYear <= currentRealYear) {
      projects.forEach((proj) => {
        total += projectCarryOvers[proj.id] || 0;
        MONTHS.forEach((month, idx) => {
          if (currentYear < currentRealYear || idx <= currentMonthIndex) {
            const allocation = yearlyData[month]?.[proj.id] || 0;
            const expense = yearlyExpenses[month]?.[proj.id] || 0;
            total += allocation - expense;
          }
        });
      });
    }

    return total;
  }, [currentYear, projects, projectCarryOvers, yearlyData, yearlyExpenses]);

  // Has any monthly data been filled?
  const hasFilledMonthlyData = useMemo(() => {
    return (
      Object.values(yearlyData).some((monthData) =>
        Object.values(monthData).some((v) => v && v > 0)
      ) || Object.values(oneTimeIncomes).some((v) => v && v > 0)
    );
  }, [yearlyData, oneTimeIncomes]);

  // ============================================================================
  // MARK MODIFIED — triggers save status pending state
  // ============================================================================
  const markAsModified = useCallback(() => {
    if (isDemoMode) return;
    saveStatus.markPending();
  }, [isDemoMode, saveStatus]);

  // Wrappers around setters that also mark pending
  const handlePeopleChange = useCallback((newPeople: Person[]) => {
    setPeople(newPeople);
    markAsModified();
  }, [markAsModified]);

  const handleChargesChange = useCallback((newCharges: Charge[]) => {
    setCharges(newCharges);
    markAsModified();
  }, [markAsModified]);

  const handleProjectsChange = useCallback((newProjects: Project[]) => {
    setProjects(newProjects);
    markAsModified();
  }, [markAsModified]);

  const handleYearlyDataChange = useCallback((d: YearlyData) => {
    setYearlyData(d);
    markAsModified();
  }, [markAsModified]);

  const handleYearlyExpensesChange = useCallback((d: YearlyData) => {
    setYearlyExpenses(d);
    markAsModified();
  }, [markAsModified]);

  const handleOneTimeIncomesChange = useCallback((d: OneTimeIncomes) => {
    setOneTimeIncomes(d);
    markAsModified();
  }, [markAsModified]);

  const handleMonthCommentsChange = useCallback((d: MonthComments) => {
    setMonthComments(d);
    markAsModified();
  }, [markAsModified]);

  const handleProjectCommentsChange = useCallback((d: ProjectComments) => {
    setProjectComments(d);
    markAsModified();
  }, [markAsModified]);

  const handleLockedMonthsChange = useCallback((d: LockedMonths) => {
    setLockedMonths(d);
    markAsModified();
  }, [markAsModified]);

  // ============================================================================
  // SAVE
  // ============================================================================
  const performSave = useCallback(
    async (silent = false) => {
      if (!id) return;
      if (isDemoMode) {
        console.warn('[Save Guard] Skipped: demo mode');
        return;
      }

      saveStatus.markSaving();

      try {
        const newData = convertNewFormatToOld(
          {
            people,
            charges,
            projects,
            yearlyData,
            yearlyExpenses,
            oneTimeIncomes,
            monthComments,
            projectComments,
            lockedMonths,
          } as any,
          currentYear,
          globalDataRef.current as RawBudgetData | undefined
        );
        globalDataRef.current = newData;
        await budgetAPI.updateData(id, newData);
        saveStatus.markSaved();
        if (!silent) {
          toast({
            title: 'Enregistré',
            description: 'Vos modifications sont sauvegardées.',
          });
        }
      } catch (err: any) {
        const message = err?.response?.data?.error || 'Erreur de sauvegarde';
        saveStatus.markError(message);
        if (!silent) {
          toast({
            title: 'Erreur',
            description: message,
            variant: 'destructive',
          });
        }
      }
    },
    [
      id,
      isDemoMode,
      saveStatus,
      people,
      charges,
      projects,
      yearlyData,
      yearlyExpenses,
      oneTimeIncomes,
      monthComments,
      projectComments,
      lockedMonths,
      currentYear,
      toast,
    ]
  );

  // Auto-save (debounced, defined in existing hook)
  useAutoSave(
    () => performSave(true),
    saveStatus.status === 'pending',
    isDemoMode
  );

  // ============================================================================
  // YEAR CHANGE
  // ============================================================================
  const handleYearChange = useCallback(
    (year: number) => {
      setCurrentYear(year);
      if (globalDataRef.current) {
        hydrateStateFromGlobal(year, globalDataRef.current);
      }
    },
    [hydrateStateFromGlobal]
  );

  // ============================================================================
  // BANKING
  // ============================================================================
  const refreshBankData = useCallback(async () => {
    if (!id || isDemoMode) return;
    try {
      const response = await api.get(`/banking/budgets/${id}/reality-check`);
      setRealBankBalance(response.data.total_real_cash || 0);
      setHasActiveConnection(response.data.total_real_cash > 0);
    } catch (err) {
      setHasActiveConnection(false);
    }
  }, [id, isDemoMode]);

  // ============================================================================
  // DEMO MODE
  // ============================================================================
  const getDemoStorageKey = useCallback(() => `demo-mode-${id}`, [id]);
  const getDemoTimestampKey = useCallback(() => `demo-timestamp-${id}`, [id]);

  useEffect(() => {
    if (!id) return;
    const enabled = localStorage.getItem(getDemoStorageKey()) === 'true';
    const ts = localStorage.getItem(getDemoTimestampKey());
    if (enabled && ts) {
      const days = (Date.now() - parseInt(ts)) / (1000 * 60 * 60 * 24);
      if (days < DEMO_MODE_LIMITS.EXPIRE_AFTER_DAYS) {
        setDemoTransactions(DEMO_TRANSACTIONS);
        setDemoBankBalance(DEMO_BANK_BALANCE);
        setIsDemoMode(true);
        setHasActiveConnection(true);
      }
    }
  }, [id, getDemoStorageKey, getDemoTimestampKey]);

  const enableDemoMode = useCallback(() => {
    if (!id) return;
    setDemoTransactions(DEMO_TRANSACTIONS);
    setDemoBankBalance(DEMO_BANK_BALANCE);
    setIsDemoMode(true);
    setHasActiveConnection(true);
    localStorage.setItem(getDemoStorageKey(), 'true');
    localStorage.setItem(getDemoTimestampKey(), Date.now().toString());
    toast({
      title: '🎬 Mode Démo Banque activé',
      description: 'Données bancaires fictives chargées (vos données budgétaires restent inchangées).',
    });
  }, [id, getDemoStorageKey, getDemoTimestampKey, toast]);

  const disableDemoMode = useCallback(() => {
    setIsDemoMode(false);
    setHasActiveConnection(false);
    setDemoTransactions([]);
    setDemoBankBalance(0);
    localStorage.removeItem(getDemoStorageKey());
    localStorage.removeItem(getDemoTimestampKey());
  }, [getDemoStorageKey, getDemoTimestampKey]);

  // ============================================================================
  // INVITES / MEMBERS
  // ============================================================================
  const refreshMembersOnly = useCallback(async () => {
    if (!id) return;
    try {
      const res = await budgetAPI.get(id);
      setBudget(res.data);
    } catch (err) {
      console.error('[BudgetComplete] refresh members error', err);
    }
  }, [id]);

  const handleShowInviteModal = useCallback(() => {
    setShowInviteModal(true);
  }, []);

  // ============================================================================
  // TRANSACTION MAPPER
  // ============================================================================
  const handleOpenMapper = useCallback((charge: Charge) => {
    setChargeToMap(charge);
    setShowMapper(true);
  }, []);

  const handleCloseMapper = useCallback(() => {
    setShowMapper(false);
    setChargeToMap(null);
  }, []);

  const handleOpenBankManager = useCallback(() => {
    setShowBankManager(true);
  }, []);

  const handleCloseBankManager = useCallback(() => {
    setShowBankManager(false);
    if (!isDemoMode) refreshBankData();
  }, [isDemoMode, refreshBankData]);

  // ============================================================================
  // WS NOTIFICATIONS — connect on mount, disconnect on unmount
  // ============================================================================
  useEffect(() => {
    if (budget) connectToBudget(budget.id, budget.name);
    return () => disconnectFromBudget();
  }, [budget, connectToBudget, disconnectFromBudget]);

  // ============================================================================
  // NAVIGATION (now route-based)
  // ============================================================================
  const handleSectionChange = useCallback(
    (section: string) => {
      const target = NAV_TO_ROUTE[section];
      if (target && id) {
        navigate(`/budget/${id}/complete/${target}`);
      }
    },
    [navigate, id]
  );

  // Derive currentSection from URL
  const currentSection = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1];
    return BUDGET_NAV_ITEMS.find((it) => it.id === last)?.id || 'overview';
  }, [location.pathname]);

  // ============================================================================
  // ONBOARDING
  // ============================================================================
  const onboardingSteps = useOnboardingProgress(
    {
      peopleCount: people.length,
      chargesCount: charges.length,
      projectsCount: projects.filter((p) => p.id !== GENERAL_SAVINGS_ID).length,
      hasFilledMonthlyData,
      hasRunSuggestions,
    },
    {
      scrollToPeople: () => navigate(`/budget/${id}/complete/members`),
      scrollToCharges: () => navigate(`/budget/${id}/complete/charges`),
      scrollToProjects: () => navigate(`/budget/${id}/complete/projects`),
      scrollToCalendar: () => navigate(`/budget/${id}/complete/calendar`),
      scrollToSuggestions: () => navigate(`/budget/${id}/complete/charges`),
    }
  );

  const [coachDismissed, setCoachDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(`coach-dismissed-${id}`) === '1';
  });

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================
  const contextValue: BudgetContextValue = useMemo(
    () => ({
      budget,
      budgetTitle,
      setBudgetTitle,
      budgetLocation,
      budgetCurrency,
      currentYear,
      handleYearChange,
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
      handlePeopleChange,
      handleChargesChange,
      handleProjectsChange,
      handleYearlyDataChange,
      handleYearlyExpensesChange,
      handleOneTimeIncomesChange,
      handleMonthCommentsChange,
      handleProjectCommentsChange,
      handleLockedMonthsChange,
      saveStatus: saveStatus.status,
      saveError: saveStatus.errorMessage,
      lastSavedAt: saveStatus.lastSavedAt,
      performSave,
      totalGlobalRealized,
      realBankBalance,
      demoBankBalance,
      hasActiveConnection,
      isDemoMode,
      enableDemoMode,
      disableDemoMode,
      refreshBankData,
      chargeMappings,
      mappedTotalsByChargeId,
      handleOpenMapper,
      handleOpenBankManager,
      householdSize,
      refreshMembersOnly,
      handleShowInviteModal,
    }),
    [
      budget,
      budgetTitle,
      budgetLocation,
      budgetCurrency,
      currentYear,
      handleYearChange,
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
      handlePeopleChange,
      handleChargesChange,
      handleProjectsChange,
      handleYearlyDataChange,
      handleYearlyExpensesChange,
      handleOneTimeIncomesChange,
      handleMonthCommentsChange,
      handleProjectCommentsChange,
      handleLockedMonthsChange,
      saveStatus.status,
      saveStatus.errorMessage,
      saveStatus.lastSavedAt,
      performSave,
      totalGlobalRealized,
      realBankBalance,
      demoBankBalance,
      hasActiveConnection,
      isDemoMode,
      enableDemoMode,
      disableDemoMode,
      refreshBankData,
      chargeMappings,
      mappedTotalsByChargeId,
      handleOpenMapper,
      handleOpenBankManager,
      householdSize,
      refreshMembersOnly,
      handleShowInviteModal,
    ]
  );

  // ============================================================================
  // RENDER
  // ============================================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <BudgetProvider value={contextValue}>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50">
        <BudgetNavbar
          budgetTitle={budget?.name}
          userName={user?.name}
          userAvatar={user?.avatar}
          items={BUDGET_NAV_ITEMS}
          onSectionChange={handleSectionChange}
          currentSection={currentSection}
        />

        {isDemoMode && (
          <div className="bg-indigo-50/80 border-b border-indigo-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
              <DemoBanner onDisable={disableDemoMode} />
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24">
          <Outlet />
        </main>

        {/* P0 #3: discreet save indicator */}
        <SaveStatusIndicator
          status={saveStatus.status}
          errorMessage={saveStatus.errorMessage}
          lastSavedAt={saveStatus.lastSavedAt}
          onRetry={() => performSave(false)}
        />

        {/* P0 #4: non-blocking onboarding coach */}
        {!coachDismissed && (
          <OnboardingCoach
            steps={onboardingSteps}
            onDismiss={() => {
              setCoachDismissed(true);
              localStorage.setItem(`coach-dismissed-${id}`, '1');
            }}
          />
        )}

        {/* MODALS */}
        {showInviteModal && id && (
          <InviteModal
            budgetId={id}
            onClose={() => setShowInviteModal(false)}
            onInvited={() => {
              refreshMembersOnly();
              setShowInviteModal(false);
              toast({ title: 'Invitation envoyée' });
            }}
          />
        )}

        <Dialog open={showBankManager} onOpenChange={handleCloseBankManager}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gestion des Connexions Bancaires</DialogTitle>
              <DialogDescription>
                Connectez vos comptes via Enable Banking (2500+ banques européennes).
              </DialogDescription>
            </DialogHeader>
            <EnableBankingManager
              budgetId={id!}
              onUpdate={refreshBankData}
            />
          </DialogContent>
        </Dialog>

        {chargeToMap && (
          <TransactionMapper
            isOpen={showMapper}
            onClose={handleCloseMapper}
            charge={chargeToMap}
            currentMappings={chargeMappings}
            onSave={(newMappings) => {
              const others = chargeMappings.filter((m) => m.chargeId !== chargeToMap.id);
              setChargeMappings([...others, ...newMappings]);
              if (!isDemoMode) markAsModified();
              handleCloseMapper();
            }}
            budgetId={id!}
            demoTransactions={isDemoMode ? demoTransactions : undefined}
          />
        )}
      </div>
    </BudgetProvider>
  );
}
