// src/lib/pages/BudgetComplete.tsx
// ============================================================================
// 🎯 BudgetComplete (Layout) — patch v2
// ============================================================================
// Corrections vs v1:
//   - budgetAPI.getById(id)  (not .get)
//   - budgetAPI.updateData(id, { data: newData })  (wrap in {data})
//   - convertNewFormatToOld(stateBag) takes 1 argument (state bag)
//   - useAutoSave({ onSave, delay, enabled }) — options object signature
// ============================================================================

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Outlet } from 'react-router-dom';
import api, { budgetAPI } from '../../services/api';
import {
  convertOldFormatToNew,
  convertNewFormatToOld,
  autoLockPastMonths,
  lockedMonthsEqual,
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
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

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
// NAV ITEMS
// ============================================================================
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
  const { connectToBudget, disconnectFromBudget } = useNotifications();

  // ===== Save state machine for the SaveStatusIndicator =====
  const saveStateMachine = useSaveStatus();

  // ===== Core =====
  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const loadedRef = useRef(false);
  // Flagged whenever autoLockPastMonths mutates the in-memory lock map
  // during load or year-switch. The effect below uses this to schedule the
  // autosave once useAutoSave is wired up and lockedMonths has flushed.
  const pendingAutoLockSaveRef = useRef(false);

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
  const [budgetLocation, setBudgetLocation] = useState<string>('FR');
  const [budgetCurrency, setBudgetCurrency] = useState<string>('EUR');

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

  // ============================================================================
  // LOAD BUDGET
  // ============================================================================
  const loadBudget = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      // ✅ FIX: getById, not get
      const [budgetRes, dataRes] = await Promise.all([
        budgetAPI.getById(id),
        budgetAPI.getData(id),
      ]);

      setBudget(budgetRes.data);
      setBudgetLocation(budgetRes.data.location || 'FR');
      setBudgetCurrency(budgetRes.data.currency || 'EUR');

      // Server returns { data: { ... } }; the original code reads `dataRes.data.data`
      const rawData: any = dataRes.data?.data ?? dataRes.data ?? {};
      globalDataRef.current = rawData;

      const data = convertOldFormatToNew(rawData);

      setBudgetTitle(data.budgetTitle || budgetRes.data.name || '');
      setCurrentYear(data.currentYear || new Date().getFullYear());
      setPeople(data.people || []);
      setCharges(data.charges || []);
      setProjects(data.projects || []);
      setYearlyData(data.yearlyData || {});
      setYearlyExpenses(data.yearlyExpenses || {});
      setOneTimeIncomes(data.oneTimeIncomes || {});
      setMonthComments(data.monthComments || {});
      setProjectComments(data.projectComments || {});
      const loadedLockedMonths = data.lockedMonths || {};
      const autoLockedResult = autoLockPastMonths(
        loadedLockedMonths,
        data.currentYear || new Date().getFullYear()
      );
      setLockedMonths(autoLockedResult);
      if (!lockedMonthsEqual(loadedLockedMonths, autoLockedResult)) {
        // Defer persistence until after the autosave hook has been wired
        // up — the effect below catches this flag once lockedMonths flushes.
        pendingAutoLockSaveRef.current = true;
      }
      setChargeMappings(rawData.chargeMappings || []);

      loadedRef.current = true;
    } catch (err: any) {
      console.error('[BudgetComplete] load error', err);
      if (err?.response?.status === 404) {
        navigate('/404');
      }
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le budget',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    loadBudget();
  }, [loadBudget]);

  // ============================================================================
  // PROJECT CARRY-OVERS
  // ============================================================================
  const projectCarryOvers = useMemo(() => {
    const carryOvers: Record<string, number> = {};
    projects.forEach((proj) => {
      // Sum from previous years stored in globalDataRef
      const yearlyDataAll = globalDataRef.current?.yearlyData || {};
      Object.keys(yearlyDataAll).forEach((yearStr) => {
        const year = parseInt(yearStr, 10);
        if (year < currentYear) {
          const yearData = yearlyDataAll[yearStr];
          if (yearData?.months && yearData?.expenses) {
            yearData.months.forEach((monthAllocation: any, idx: number) => {
              const allocated = monthAllocation?.[proj.id] || 0;
              const spent = yearData.expenses[idx]?.[proj.id] || 0;
              carryOvers[proj.id] = (carryOvers[proj.id] || 0) + (allocated - spent);
            });
          }
        }
      });
    });
    return carryOvers;
  }, [projects, currentYear]);

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

  const hasFilledMonthlyData = useMemo(() => {
    return (
      Object.values(yearlyData).some((monthData) =>
        Object.values(monthData).some((v) => v && v > 0)
      ) || Object.values(oneTimeIncomes).some((v) => v && v > 0)
    );
  }, [yearlyData, oneTimeIncomes]);

  // ============================================================================
  // SAVE
  // ============================================================================
  const performSave = useCallback(async () => {
    if (!id) return;
    if (isDemoMode) {
      console.warn('[Save Guard] Skipped: demo mode');
      return;
    }

    saveStateMachine.markSaving();

    try {
      // ✅ FIX: convertNewFormatToOld takes a SINGLE arg (state bag)
      const newData = convertNewFormatToOld({
        budgetTitle,
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
        chargeMappings,
      } as any);

      globalDataRef.current = newData;

      // ✅ FIX: updateData expects { data: ... }
      await budgetAPI.updateData(id, { data: newData } as any);

      saveStateMachine.markSaved();
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Erreur de sauvegarde';
      saveStateMachine.markError(message);
    }
  }, [
    id,
    isDemoMode,
    saveStateMachine,
    budgetTitle,
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
    chargeMappings,
  ]);

  // ✅ FIX: useAutoSave uses options object, returns { hasUnsavedChanges, isSaving, markAsModified, saveNow }
  const { markAsModified } = useAutoSave({
    onSave: performSave,
    delay: 2000,
    enabled: loadedRef.current && !isDemoMode,
  });

  // Wrapper that triggers BOTH the existing autosave hook AND our state machine
  const triggerModified = useCallback(() => {
    if (isDemoMode) return;
    markAsModified();
    saveStateMachine.markPending();
  }, [isDemoMode, markAsModified, saveStateMachine]);

  // When autoLockPastMonths mutates lockedMonths on load or year-switch
  // (e.g. backfilling past-month locks that were never persisted because of
  // the pre-2026-05-15 save bug), schedule an autosave so the new state
  // reaches the DB without waiting for an unrelated user edit.
  useEffect(() => {
    if (!loadedRef.current || isDemoMode) return;
    if (!pendingAutoLockSaveRef.current) return;
    pendingAutoLockSaveRef.current = false;
    triggerModified();
  }, [lockedMonths, isDemoMode, triggerModified]);

  // Setter wrappers
  const handlePeopleChange = useCallback((newPeople: Person[]) => {
    setPeople(newPeople);
    triggerModified();
  }, [triggerModified]);

  const handleChargesChange = useCallback((newCharges: Charge[]) => {
    setCharges(newCharges);
    triggerModified();
  }, [triggerModified]);

  const handleProjectsChange = useCallback((newProjects: Project[]) => {
    setProjects(newProjects);
    triggerModified();
  }, [triggerModified]);

  const handleYearlyDataChange = useCallback((d: YearlyData) => {
    setYearlyData(d);
    triggerModified();
  }, [triggerModified]);

  const handleYearlyExpensesChange = useCallback((d: YearlyData) => {
    setYearlyExpenses(d);
    triggerModified();
  }, [triggerModified]);

  const handleOneTimeIncomesChange = useCallback((d: OneTimeIncomes) => {
    setOneTimeIncomes(d);
    triggerModified();
  }, [triggerModified]);

  const handleMonthCommentsChange = useCallback((d: MonthComments) => {
    setMonthComments(d);
    triggerModified();
  }, [triggerModified]);

  const handleProjectCommentsChange = useCallback((d: ProjectComments) => {
    setProjectComments(d);
    triggerModified();
  }, [triggerModified]);

  const handleLockedMonthsChange = useCallback((d: LockedMonths) => {
    setLockedMonths(d);
    triggerModified();
  }, [triggerModified]);

  const handleSetBudgetTitle = useCallback((title: string) => {
    setBudgetTitle(title);
    triggerModified();
  }, [triggerModified]);

  // ============================================================================
  // YEAR
  // ============================================================================
  const handleYearChange = useCallback((year: number) => {
    setCurrentYear(year);
    if (globalDataRef.current?.yearlyData?.[year]) {
      const yearData = globalDataRef.current.yearlyData[year];
      const newYearly: YearlyData = {};
      const newExpenses: YearlyData = {};
      const newOneTime: OneTimeIncomes = {};
      const newMc: MonthComments = {};
      const newPc: ProjectComments = {};

      MONTHS.forEach((month, idx) => {
        if (yearData.months?.[idx]) newYearly[month] = yearData.months[idx];
        if (yearData.expenses?.[idx]) newExpenses[month] = yearData.expenses[idx];
        if (yearData.monthComments?.[idx]) newMc[month] = yearData.monthComments[idx];
        if (yearData.expenseComments?.[idx]) newPc[month] = yearData.expenseComments[idx];
        if (globalDataRef.current.oneTimeIncomes?.[year]?.[idx]) {
          newOneTime[month] = Number(globalDataRef.current.oneTimeIncomes[year][idx].amount || 0);
        }
      });

      setYearlyData(newYearly);
      setYearlyExpenses(newExpenses);
      setOneTimeIncomes(newOneTime);
      setMonthComments(newMc);
      setProjectComments(newPc);
    } else {
      setYearlyData({});
      setYearlyExpenses({});
      setOneTimeIncomes({});
      setMonthComments({});
      setProjectComments({});
    }
    setLockedMonths((prev) => {
      const next = autoLockPastMonths(prev, year);
      if (!lockedMonthsEqual(prev, next)) {
        pendingAutoLockSaveRef.current = true;
      }
      return next;
    });
  }, []);

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
      const days = (Date.now() - parseInt(ts, 10)) / (1000 * 60 * 60 * 24);
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
      description:
        'Données bancaires fictives chargées (vos données budgétaires restent inchangées).',
    });
  }, [id, getDemoStorageKey, getDemoTimestampKey, toast]);

  const disableDemoMode = useCallback(() => {
    setIsDemoMode(false);
    setHasActiveConnection(false);
    setDemoTransactions([]);
    setDemoBankBalance(0);
    localStorage.removeItem(getDemoStorageKey());
    localStorage.removeItem(getDemoTimestampKey());
    loadBudget();
  }, [getDemoStorageKey, getDemoTimestampKey, loadBudget]);

  // ============================================================================
  // MEMBERS
  // ============================================================================
  const refreshMembersOnly = useCallback(async () => {
    if (!id) return;
    try {
      // ✅ FIX: getById, not get
      const res = await budgetAPI.getById(id);
      setBudget(res.data);
    } catch (err) {
      console.error('[BudgetComplete] refresh members error', err);
    }
  }, [id]);

  const handleShowInviteModal = useCallback(() => setShowInviteModal(true), []);

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

  const handleOpenBankManager = useCallback(() => setShowBankManager(true), []);

  const handleCloseBankManager = useCallback(() => {
    setShowBankManager(false);
    if (!isDemoMode) refreshBankData();
  }, [isDemoMode, refreshBankData]);

  // ============================================================================
  // WS
  // ============================================================================
  useEffect(() => {
    if (budget) connectToBudget(budget.id, budget.name);
    return () => disconnectFromBudget();
  }, [budget, connectToBudget, disconnectFromBudget]);

  // ============================================================================
  // NAVIGATION
  // ============================================================================
  const handleSectionChange = useCallback(
    (section: string) => {
      const target = NAV_TO_ROUTE[section];
      if (target && id) navigate(`/budget/${id}/complete/${target}`);
    },
    [navigate, id]
  );

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
      setBudgetTitle: handleSetBudgetTitle,
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
      saveStatus: saveStateMachine.status,
      saveError: saveStateMachine.errorMessage,
      lastSavedAt: saveStateMachine.lastSavedAt,
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
      handleSetBudgetTitle,
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
      saveStateMachine.status,
      saveStateMachine.errorMessage,
      saveStateMachine.lastSavedAt,
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

        <SaveStatusIndicator
          status={saveStateMachine.status}
          errorMessage={saveStateMachine.errorMessage}
          lastSavedAt={saveStateMachine.lastSavedAt}
          onRetry={() => performSave()}
        />

        {!coachDismissed && (
          <OnboardingCoach
            steps={onboardingSteps}
            onDismiss={() => {
              setCoachDismissed(true);
              localStorage.setItem(`coach-dismissed-${id}`, '1');
            }}
          />
        )}

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
            <EnableBankingManager budgetId={id!} onUpdate={refreshBankData} />
          </DialogContent>
        </Dialog>

        {chargeToMap && (
          <TransactionMapper
            isOpen={showMapper}
            onClose={handleCloseMapper}
            charge={chargeToMap}
            currentMappings={chargeMappings}
            onSave={(newMappings) => {
              const others = chargeMappings.filter(
                (m) => m.chargeId !== chargeToMap.id
              );
              setChargeMappings([...others, ...newMappings]);
              if (!isDemoMode) triggerModified();
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
