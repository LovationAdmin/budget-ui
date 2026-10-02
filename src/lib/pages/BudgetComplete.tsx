// src/lib/pages/BudgetComplete.tsx
// ============================================================================
// BudgetComplete (layout) — owns the budget and renders the active tab.
// ============================================================================
// State model (v3): the whole budget, all years at once, lives in ONE
// normalised `BudgetModel`. Every change goes through `commit()`, which:
//   - updates a ref synchronously (the autosave always serialises the latest
//     state — no stale closures),
//   - schedules the debounced autosave (or saves right away),
//   - optionally shows a confirmation with « Annuler ».
// Past months are closed automatically on load and keep a frozen snapshot.
// ============================================================================

import { useState, useEffect, useRef, useMemo, useCallback, Suspense } from 'react';
import { useParams, useNavigate, useLocation, Outlet } from 'react-router-dom';
import api, { budgetAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useSaveStatus } from '../../hooks/useSaveStatus';

import { BudgetNavbar, NavItem } from '@/components/budget/BudgetNavbar';
import { BudgetTabBar } from '@/components/budget/BudgetTabBar';
import { SaveStatusIndicator } from '@/components/budget/SaveStatusIndicator';
import { OnboardingCoach, useOnboardingProgress } from '@/components/onboarding/OnboardingCoach';
import InviteModal from '../../components/InviteModal';
import { EnableBankingManager } from '../../components/budget/EnableBankingManager';
import { TransactionMapper, MappedTransaction, BridgeTransaction } from '../../components/budget/TransactionMapper';
import { DemoBanner } from '@/components/budget/DemoBanner';
import { BudgetSheets } from '@/components/budget/sheets/BudgetSheets';
import type { SheetState } from '@/components/budget/sheets/types';

import { BudgetProvider, type BudgetContextValue, type BudgetData, type CommitOptions } from '@/contexts/BudgetContext';
import type { BudgetModel, Charge, PrivateChargeDetails, YM } from '@/lib/budget/types';
import { GENERAL_SAVINGS_ID, PRIVATE_CHARGE_LABEL } from '@/lib/budget/types';
import { BudgetEngine } from '@/lib/budget/engine';
import { autoCloseMonths, decodeBudget, encodeBudget } from '@/lib/budget/codec';
import { currentYM } from '@/lib/budget/months';
import { currencySymbol as symbolFor, money } from '@/lib/budget/format';

import { CalendarDays, Receipt, PiggyBank, Users, BarChart3, Sparkles, FlaskConical } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DEMO_TRANSACTIONS, DEMO_BANK_BALANCE, DEMO_MODE_LIMITS } from '@/constants/demoData';

// ============================================================================
// NAVIGATION
// ============================================================================
export const BUDGET_NAV_ITEMS: NavItem[] = [
  { id: 'month', label: 'Mois', icon: CalendarDays },
  { id: 'charges', label: 'Charges', icon: Receipt },
  { id: 'projects', label: 'Épargne', icon: PiggyBank },
  { id: 'members', label: 'Foyer', icon: Users },
  { id: 'year', label: 'Année', icon: BarChart3 },
  { id: 'ai', label: 'Budget IA', icon: Sparkles },
  { id: 'reality', label: 'Reality Check', icon: FlaskConical },
];
const MAIN_TABS = BUDGET_NAV_ITEMS.slice(0, 5);

const EMPTY_MODEL: BudgetModel = {
  budgetTitle: '',
  people: [],
  charges: [],
  projects: [],
  months: {},
  chargeMappings: [],
  extras: {},
  yearExtras: {},
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
  const { connectToBudget, disconnectFromBudget, onBudgetUpdated } = useNotifications();
  const saveStateMachine = useSaveStatus();

  const [today] = useState<YM>(() => currentYM());
  const [budget, setBudget] = useState<BudgetData | null>(null);
  // The current user's private charge details, kept server-side only.
  const [privateCharges, setPrivateCharges] = useState<Record<string, PrivateChargeDetails>>({});
  const [privateLoaded, setPrivateLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [model, setModel] = useState<BudgetModel>(EMPTY_MODEL);
  const modelRef = useRef<BudgetModel>(EMPTY_MODEL);
  const loadedRef = useRef(false);
  const dirtyRef = useRef(false);
  const pendingInitialSaveRef = useRef(false);

  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Reality check / banking
  const [showBankManager, setShowBankManager] = useState(false);
  const [chargeToMap, setChargeToMap] = useState<Charge | null>(null);
  const [showMapper, setShowMapper] = useState(false);
  const [realBankBalance, setRealBankBalance] = useState(0);
  const [hasActiveConnection, setHasActiveConnection] = useState(false);

  // Demo (bank-only) mode
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoBankBalance, setDemoBankBalance] = useState(0);
  const [demoTransactions, setDemoTransactions] = useState<BridgeTransaction[]>([]);
  const [hasRunSuggestions, setHasRunSuggestions] = useState(false);

  const budgetCurrency = budget?.currency || 'EUR';
  const budgetLocation = budget?.location || 'FR';
  const symbol = symbolFor(budgetCurrency);
  const fmt = useCallback((n: number) => money(n, symbol), [symbol]);

  const engine = useMemo(() => new BudgetEngine(model, today), [model, today]);

  // ============================================================================
  // LOAD
  // ============================================================================
  const loadBudget = useCallback(
    async (silent = false) => {
      if (!id) return;
      if (!silent) setLoading(true);
      try {
        const [budgetRes, dataRes, privateRes] = await Promise.all([
          budgetAPI.getById(id),
          budgetAPI.getData(id),
          budgetAPI.privateItems.list(id).catch(() => null),
        ]);
        setBudget(budgetRes.data);
        if (privateRes) {
          const found: Record<string, PrivateChargeDetails> = {};
          for (const [key, value] of Object.entries(privateRes.data?.items ?? {})) {
            const v = value as Partial<PrivateChargeDetails> | null;
            if (key.startsWith('charge:') && v && typeof v.label === 'string') found[key.slice(7)] = v as PrivateChargeDetails;
          }
          setPrivateCharges(found);
          setPrivateLoaded(true);
        }
        const raw: unknown = dataRes.data?.data ?? dataRes.data ?? {};
        const decoded = decodeBudget(raw, today);
        if (!decoded.budgetTitle) decoded.budgetTitle = budgetRes.data?.name || '';
        const { model: closed, changed } = autoCloseMonths(decoded, today, new Date().toISOString());
        modelRef.current = closed;
        setModel(closed);
        dirtyRef.current = false;
        // Months closed on load (or a format migration) are persisted once
        // the autosave is wired (see effect below).
        const rawObj = raw as Record<string, unknown>;
        if (changed || rawObj?.schemaVersion !== 3) pendingInitialSaveRef.current = Object.keys(rawObj || {}).length > 0;
        loadedRef.current = true;
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        console.error('[BudgetComplete] load error', err);
        if (status === 404) navigate('/404');
        toast({ title: 'Erreur', description: 'Impossible de charger le budget', variant: 'destructive' });
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [id, navigate, toast, today],
  );

  useEffect(() => {
    loadBudget();
  }, [loadBudget]);

  // ============================================================================
  // SAVE
  // ============================================================================
  const isDemoRef = useRef(false);
  isDemoRef.current = isDemoMode;

  const performSave = useCallback(async () => {
    if (!id || !loadedRef.current) return;
    if (isDemoRef.current) return;
    saveStateMachine.markSaving();
    try {
      const data = encodeBudget(modelRef.current, today, new Date().toISOString());
      await budgetAPI.updateData(id, { data } as never);
      dirtyRef.current = false;
      saveStateMachine.markSaved();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erreur de sauvegarde';
      saveStateMachine.markError(message);
    }
  }, [id, today, saveStateMachine]);

  const { markAsModified, saveNow } = useAutoSave({
    onSave: performSave,
    delay: 1500,
    enabled: !loading && !isDemoMode,
  });

  const scheduleSave = useCallback(
    (immediate?: boolean) => {
      if (isDemoRef.current) return;
      dirtyRef.current = true;
      saveStateMachine.markPending();
      if (immediate) saveNow().catch(() => undefined);
      else markAsModified();
    },
    [markAsModified, saveNow, saveStateMachine],
  );

  useEffect(() => {
    if (loading || !pendingInitialSaveRef.current || isDemoMode) return;
    pendingInitialSaveRef.current = false;
    scheduleSave();
  }, [loading, isDemoMode, scheduleSave]);

  const commit = useCallback(
    (updater: (m: BudgetModel) => BudgetModel, options: CommitOptions = {}) => {
      const prev = modelRef.current;
      const next = updater(prev);
      if (next === prev) return;
      modelRef.current = next;
      setModel(next);
      scheduleSave(options.saveNow);
      if (options.message) {
        const undoable = options.undoable !== false;
        toast({
          description: options.message,
          action: undoable ? (
            <ToastAction
              altText="Annuler cette modification"
              onClick={() => {
                if (modelRef.current !== next) {
                  toast({ description: 'Impossible d’annuler : le budget a changé depuis.' });
                  return;
                }
                modelRef.current = prev;
                setModel(prev);
                scheduleSave();
              }}
            >
              Annuler
            </ToastAction>
          ) : undefined,
        });
      }
    },
    [scheduleSave, toast],
  );

  // ============================================================================
  // PRIVATE CHARGES: real names live server-side, readable by their creator only
  // ============================================================================
  const savePrivateCharge = useCallback(
    async (chargeId: string, details: PrivateChargeDetails) => {
      if (!id) return;
      const clean: PrivateChargeDetails = { label: details.label.trim() };
      if (details.category) clean.category = details.category;
      if (details.description) clean.description = details.description;
      await budgetAPI.privateItems.put(id, `charge:${chargeId}`, clean);
      setPrivateCharges((prev) => ({ ...prev, [chargeId]: clean }));
    },
    [id],
  );
  const deletePrivateCharge = useCallback(
    async (chargeId: string) => {
      if (!id) return;
      setPrivateCharges((prev) => {
        const next = { ...prev };
        delete next[chargeId];
        return next;
      });
      await budgetAPI.privateItems.remove(id, `charge:${chargeId}`).catch(() => undefined);
    },
    [id],
  );

  // Private charges saved before the server-side store still carry their real
  // name in the shared data: move it server-side, then scrub the shared copy.
  // Only their creator can do it, the first time they open the budget.
  const migratingRef = useRef(false);
  const privateChargesRef = useRef(privateCharges);
  privateChargesRef.current = privateCharges;
  useEffect(() => {
    if (!privateLoaded || !user?.id || isDemoMode || migratingRef.current) return;
    const leaking = model.charges.filter((c) => c.private && c.createdBy === user.id && (c.label !== PRIVATE_CHARGE_LABEL || c.category || c.description));
    if (!leaking.length) return;
    migratingRef.current = true;
    (async () => {
      const moved: string[] = [];
      for (const c of leaking) {
        try {
          const keep = privateChargesRef.current[c.id];
          await savePrivateCharge(c.id, {
            label: c.label !== PRIVATE_CHARGE_LABEL ? c.label : keep?.label ?? c.label,
            category: c.category ?? keep?.category,
            description: c.description ?? keep?.description,
          });
          moved.push(c.id);
        } catch {
          /* retried on the next load */
        }
      }
      migratingRef.current = false;
      if (!moved.length) return;
      // Scrub only the copies that still match what was moved server-side.
      commit(
        (m) => ({
          ...m,
          charges: m.charges.map((c) => {
            if (!moved.includes(c.id) || !c.private) return c;
            const next = { ...c, label: PRIVATE_CHARGE_LABEL };
            delete next.category;
            delete next.description;
            return next;
          }),
        }),
        { saveNow: true },
      );
    })();
  }, [privateLoaded, user?.id, isDemoMode, model.charges, savePrivateCharge, commit]);

  // ============================================================================
  // REAL-TIME: another member saved → refresh when it is safe
  // ============================================================================
  useEffect(() => {
    if (!id) return;
    return onBudgetUpdated(({ budgetId, user: who }) => {
      if (budgetId !== id || isDemoRef.current) return;
      if (dirtyRef.current) return; // never overwrite local edits; the bell still notifies
      loadBudget(true).then(() => toast({ description: `Budget mis à jour par ${who}.` }));
    });
  }, [id, onBudgetUpdated, loadBudget, toast]);

  // ============================================================================
  // BANKING
  // ============================================================================
  const refreshBankData = useCallback(async () => {
    if (!id || isDemoMode) return;
    try {
      const response = await api.get(`/banking/budgets/${id}/reality-check`);
      setRealBankBalance(response.data.total_real_cash || 0);
      setHasActiveConnection(response.data.total_real_cash > 0);
    } catch {
      setHasActiveConnection(false);
    }
  }, [id, isDemoMode]);

  const getDemoStorageKey = useCallback(() => `demo-mode-${id}`, [id]);
  const getDemoTimestampKey = useCallback(() => `demo-timestamp-${id}`, [id]);

  useEffect(() => {
    if (!id) return;
    try {
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
    } catch {
      /* storage unavailable */
    }
  }, [id, getDemoStorageKey, getDemoTimestampKey]);

  const enableDemoMode = useCallback(() => {
    if (!id) return;
    setDemoTransactions(DEMO_TRANSACTIONS);
    setDemoBankBalance(DEMO_BANK_BALANCE);
    setIsDemoMode(true);
    setHasActiveConnection(true);
    try {
      localStorage.setItem(getDemoStorageKey(), 'true');
      localStorage.setItem(getDemoTimestampKey(), Date.now().toString());
    } catch {
      /* ignore */
    }
    toast({ title: 'Mode Démo Banque activé', description: 'Données bancaires fictives chargées (vos données budgétaires restent inchangées).' });
  }, [id, getDemoStorageKey, getDemoTimestampKey, toast]);

  const disableDemoMode = useCallback(() => {
    setIsDemoMode(false);
    setHasActiveConnection(false);
    setDemoTransactions([]);
    setDemoBankBalance(0);
    try {
      localStorage.removeItem(getDemoStorageKey());
      localStorage.removeItem(getDemoTimestampKey());
    } catch {
      /* ignore */
    }
    loadBudget();
  }, [getDemoStorageKey, getDemoTimestampKey, loadBudget]);

  const refreshMembersOnly = useCallback(async () => {
    if (!id) return;
    try {
      const res = await budgetAPI.getById(id);
      setBudget(res.data);
    } catch (err) {
      console.error('[BudgetComplete] refresh members error', err);
    }
  }, [id]);

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

  const chargeMappings = model.chargeMappings as MappedTransaction[];
  const mappedTotalsByChargeId = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const c of model.charges) {
      totals[c.id] = chargeMappings.filter((m) => m.chargeId === c.id).reduce((s, m) => s + Math.abs(m.amount), 0);
    }
    return totals;
  }, [model.charges, chargeMappings]);

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
      if (id) navigate(`/budget/${id}/complete/${section}`);
    },
    [navigate, id],
  );

  const currentSection = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1];
    return BUDGET_NAV_ITEMS.find((it) => it.id === last)?.id || 'month';
  }, [location.pathname]);

  const goToMonth = useCallback(
    (ym: YM) => {
      if (id) navigate(`/budget/${id}/complete/month?m=${ym}`);
    },
    [navigate, id],
  );

  // ============================================================================
  // ONBOARDING
  // ============================================================================
  const onboardingSteps = useOnboardingProgress(
    {
      peopleCount: model.people.length,
      chargesCount: model.charges.length,
      projectsCount: model.projects.filter((p) => p.id !== GENERAL_SAVINGS_ID).length,
      contributionsSet: model.people.some((p) => (p.contributions?.length ?? 0) > 0),
      hasRunSuggestions,
    },
    {
      goToMembers: () => navigate(`/budget/${id}/complete/members`),
      goToCharges: () => navigate(`/budget/${id}/complete/charges`),
      goToProjects: () => navigate(`/budget/${id}/complete/projects`),
      goToContributions: () => navigate(`/budget/${id}/complete/members#repartition`),
      goToSuggestions: () => navigate(`/budget/${id}/complete/charges#suggestions`),
    },
  );

  const [coachDismissed, setCoachDismissed] = useState(() => {
    try {
      return localStorage.getItem(`coach-dismissed-${id}`) === '1';
    } catch {
      return false;
    }
  });

  // ============================================================================
  // CONTEXT
  // ============================================================================
  const totalGlobalRealized = useMemo(() => engine.projectsBalance(today), [engine, today]);
  const householdSize = Math.max(1, engine.month(today).people.length || model.people.length);
  const closeSheet = useCallback(() => setSheet(null), []);
  const handleShowInviteModal = useCallback(() => setShowInviteModal(true), []);
  const markSuggestionsRun = useCallback(() => setHasRunSuggestions(true), []);

  const contextValue: BudgetContextValue = useMemo(
    () => ({
      budgetId: id || '',
      budget,
      model,
      engine,
      today,
      budgetLocation,
      budgetCurrency,
      currencySymbol: symbol,
      fmt,
      commit,
      privateCharges,
      savePrivateCharge,
      deletePrivateCharge,
      openSheet: setSheet,
      closeSheet,
      goToMonth,
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
      handleOpenBankManager,
      chargeMappings,
      mappedTotalsByChargeId,
      handleOpenMapper,
      householdSize,
      refreshMembersOnly,
      handleShowInviteModal,
      markSuggestionsRun,
    }),
    [
      id, budget, model, engine, today, budgetLocation, budgetCurrency, symbol, fmt, commit, closeSheet, goToMonth,
      privateCharges, savePrivateCharge, deletePrivateCharge,
      saveStateMachine.status, saveStateMachine.errorMessage, saveStateMachine.lastSavedAt, performSave,
      totalGlobalRealized, realBankBalance, demoBankBalance, hasActiveConnection, isDemoMode,
      enableDemoMode, disableDemoMode, refreshBankData, handleOpenBankManager, chargeMappings,
      mappedTotalsByChargeId, handleOpenMapper, householdSize, refreshMembersOnly, handleShowInviteModal, markSuggestionsRun,
    ],
  );

  // ============================================================================
  // RENDER
  // ============================================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" role="status" aria-label="Chargement du budget">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <BudgetProvider value={contextValue}>
      <div className="min-h-screen bg-background">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-floating focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Aller au contenu
        </a>
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

        <main id="contenu" tabIndex={-1} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 pb-32 lg:pb-16 focus:outline-none">
          <Suspense fallback={<TabFallback />}>
            <Outlet />
          </Suspense>
        </main>

        <BudgetTabBar items={MAIN_TABS} currentSection={currentSection} onSectionChange={handleSectionChange} />

        {/* Bottom centre: toasts live bottom-right, the setup coach bottom-left. */}
        <SaveStatusIndicator
          className="left-0 right-0 mx-auto w-fit bottom-[calc(5rem+env(safe-area-inset-bottom))] lg:bottom-4"
          status={saveStateMachine.status}
          errorMessage={saveStateMachine.errorMessage}
          lastSavedAt={saveStateMachine.lastSavedAt}
          onRetry={() => performSave().catch(() => undefined)}
        />

        {!coachDismissed && (
          <OnboardingCoach
            steps={onboardingSteps}
            className="bottom-[calc(9rem+env(safe-area-inset-bottom))] lg:bottom-4"
            onDismiss={() => {
              setCoachDismissed(true);
              try {
                localStorage.setItem(`coach-dismissed-${id}`, '1');
              } catch {
                /* ignore */
              }
            }}
          />
        )}

        <BudgetSheets sheet={sheet} onClose={() => setSheet(null)} />

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
              <DialogDescription>Connectez vos comptes via Enable Banking (2500+ banques européennes).</DialogDescription>
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
              const others = chargeMappings.filter((m) => m.chargeId !== chargeToMap.id);
              commit((m) => ({ ...m, chargeMappings: [...others, ...newMappings] }));
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

// Placeholder while a lazily-loaded tab downloads; keeps the layout steady.
function TabFallback() {
  return (
    <div role="status" aria-live="polite" className="flex min-h-[40vh] items-center justify-center">
      <span aria-hidden="true" className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary motion-reduce:animate-none" />
      <span className="sr-only">Chargement de l’onglet…</span>
    </div>
  );
}
