// src/pages/Beta2Page.tsx - SAVE DISABLED VERSION
// ✅ CORRIGÉ : Sauvegarde désactivée pour éviter l'écrasement des données réelles

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { budgetAPI } from '../services/api';
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
  type LockedMonths
} from '../utils/importConverter';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast'; 
import { useNotifications } from '@/contexts/NotificationContext';
import { BudgetNavbar, NavItem } from '@/components/budget/BudgetNavbar';
import InviteModal from '../components/InviteModal';
import BudgetHeader from '../components/budget/BudgetHeader';
import PeopleSection from '../components/budget/PeopleSection';
import ChargesSection from '../components/budget/ChargesSection';
import ProjectsSection from '../components/budget/ProjectsSection';
import MonthlyTable from '../components/budget/MonthlyTable';
import StatsSection from '../components/budget/StatsSection';
import ActionsBar from '../components/budget/ActionsBar';
import MemberManagementSection from '../components/budget/MemberManagementSection';
import { RealityCheck } from '../components/budget/RealityCheck'; 
import { EnableBankingManager } from '../components/budget/EnableBankingManager';
import { TransactionMapper, MappedTransaction, BridgeTransaction } from '../components/budget/TransactionMapper';
import { LayoutDashboard, Users, Receipt, Target, CalendarDays, FlaskConical, MapPin, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTutorial } from '../contexts/TutorialContext';
import { DEMO_TRANSACTIONS, DEMO_BANK_BALANCE, DEMO_MODE_LIMITS } from '@/constants/demoData';
import { DemoModePrompt } from '@/components/budget/DemoModePrompt';
import { DemoBanner } from '@/components/budget/DemoBanner';
import EnhancedSuggestions from '@/components/budget/EnhancedSuggestions';

const BUDGET_NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: "members", label: "Membres", icon: Users },
  { id: "charges", label: "Charges", icon: Receipt },
  { id: "reality", label: "Reality Check (Beta 2)", icon: FlaskConical },
  { id: "projects", label: "Projets", icon: Target },
  { id: "calendar", label: "Tableau Mensuel", icon: CalendarDays },
];

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const LOCATION_CONFIGS = [
  { code: 'FR', name: 'France', currency: 'EUR', symbol: '€' },
  { code: 'DE', name: 'Allemagne', currency: 'EUR', symbol: '€' },
  { code: 'ES', name: 'Espagne', currency: 'EUR', symbol: '€' },
  { code: 'IT', name: 'Italie', currency: 'EUR', symbol: '€' },
  { code: 'PT', name: 'Portugal', currency: 'EUR', symbol: '€' },
  { code: 'BE', name: 'Belgique', currency: 'EUR', symbol: '€' },
  { code: 'NL', name: 'Pays-Bas', currency: 'EUR', symbol: '€' },
  { code: 'AT', name: 'Autriche', currency: 'EUR', symbol: '€' },
  { code: 'CH', name: 'Suisse', currency: 'CHF', symbol: 'CHF' },
  { code: 'GB', name: 'Royaume-Uni', currency: 'GBP', symbol: '£' },
  { code: 'US', name: 'États-Unis', currency: 'USD', symbol: '$' },
  { code: 'CA', name: 'Canada', currency: 'CAD', symbol: '$' },
  { code: 'SN', name: 'Sénégal', currency: 'XOF', symbol: 'CFA' },
  { code: 'CI', name: "Côte d'Ivoire", currency: 'XOF', symbol: 'CFA' },
{ code: 'MA', name: 'Maroc', currency: 'MAD', symbol: 'DH' },
];

interface ExtendedBudgetData extends RawBudgetData {
  chargeMappings?: MappedTransaction[];
}

interface BudgetMember {
  id: string;
  user: { id: string; name: string; email: string; avatar?: string; };
  role: 'owner' | 'member';
}

interface BudgetData {
  id: string;
  name: string;
  is_owner: boolean;
  members: BudgetMember[];
  location?: string;
  currency?: string;
}

export default function Beta2Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { hasSeenTutorial, startTutorial } = useTutorial(); 
  const { connectToBudget, disconnectFromBudget } = useNotifications();

  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // Kept for UI compatibility, but effectively unused
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [lastServerUpdate, setLastServerUpdate] = useState<string>("");

  const [showBankManager, setShowBankManager] = useState(false);
  const [realBankBalance, setRealBankBalance] = useState(0);
  const [hasActiveConnection, setHasActiveConnection] = useState(false);
  
  const [showMapper, setShowMapper] = useState(false);
  const [chargeToMap, setChargeToMap] = useState<Charge | null>(null);
  const [chargeMappings, setChargeMappings] = useState<MappedTransaction[]>([]);

  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoTransactions, setDemoTransactions] = useState<BridgeTransaction[]>([]);
  const [demoBankBalance, setDemoBankBalance] = useState(0);

  const [budgetLocation, setBudgetLocation] = useState<string>('FR');
  const [budgetCurrency, setBudgetCurrency] = useState<string>('EUR');

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

  const loadedRef = useRef(false);
  const notifiedProjectsRef = useRef<Set<string>>(new Set());

  // ... (Calculations: projectCarryOvers, mappedTotalsByChargeId, householdSize, totalGlobalRealized - UNCHANGED)
  const projectCarryOvers = useMemo(() => {
    const carryOvers: Record<string, number> = {};
    projects.forEach(proj => {
      let total = 0;
      MONTHS.forEach(month => {
        const allocation = yearlyData[month]?.[proj.id] || 0;
        const expense = yearlyExpenses[month]?.[proj.id] || 0;
        total += (allocation - expense);
      });
      carryOvers[proj.id] = total;
    });
    return carryOvers;
  }, [projects, yearlyData, yearlyExpenses]);

  const mappedTotalsByChargeId = useMemo(() => {
    const totals: Record<string, number> = {};
    charges.forEach(ch => {
      const mapped = chargeMappings.filter(m => m.chargeId === ch.id);
      totals[ch.id] = mapped.reduce((sum, m) => sum + Math.abs(m.amount), 0);
    });
    return totals;
  }, [charges, chargeMappings]);

  const householdSize = useMemo(() => {
    return people.length > 0 ? people.length : 1;
  }, [people]);

  const totalGlobalRealized = useMemo(() => {
    const today = new Date();
    const currentMonthIndex = today.getMonth();
    const currentRealYear = today.getFullYear();
    let total = 0;
    
    if (currentYear <= currentRealYear) {
      projects.forEach(proj => {
        total += (projectCarryOvers[proj.id] || 0);
        MONTHS.forEach((month, idx) => {
          if (currentYear < currentRealYear || idx <= currentMonthIndex) {
            const allocation = yearlyData[month]?.[proj.id] || 0;
            const expense = yearlyExpenses[month]?.[proj.id] || 0;
            total += (allocation - expense);
          }
        });
      });
    }
    
    return total;
  }, [currentYear, projects, projectCarryOvers, yearlyData, yearlyExpenses]);

  // ... (WebSocket, Demo Mode, Load Budget Effect - UNCHANGED)
  useEffect(() => {
    if (budget) {
      connectToBudget(budget.id, budget.name);
    }
    return () => disconnectFromBudget();
  }, [budget, connectToBudget, disconnectFromBudget]);

  const getDemoStorageKey = useCallback(() => `demo-mode-${id}`, [id]);
  const getDemoTimestampKey = useCallback(() => `demo-timestamp-${id}`, [id]);

  useEffect(() => {
    if (!id) return;
    const demoEnabled = localStorage.getItem(getDemoStorageKey()) === 'true';
    const demoTimestamp = localStorage.getItem(getDemoTimestampKey());
    if (demoEnabled && demoTimestamp) {
      const daysSinceActivation = (Date.now() - parseInt(demoTimestamp)) / (1000 * 60 * 60 * 24);
      if (daysSinceActivation < DEMO_MODE_LIMITS.EXPIRE_AFTER_DAYS) {
        setDemoTransactions(DEMO_TRANSACTIONS);
        setDemoBankBalance(DEMO_BANK_BALANCE);
        setIsDemoMode(true);
        setHasActiveConnection(true);
      } else {
        disableDemoMode();
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
      title: "🎬 Mode Démo Activé", 
      description: "Données fictives chargées.", 
      duration: 5000 
    });
  }, [id, getDemoStorageKey, getDemoTimestampKey, toast]);

  const disableDemoMode = useCallback(() => {
    if (!id) return;
    setIsDemoMode(false);
    setDemoTransactions([]);
    setDemoBankBalance(0);
    setHasActiveConnection(false);
    localStorage.removeItem(getDemoStorageKey());
    localStorage.removeItem(getDemoTimestampKey());
    toast({ 
      title: "Mode Démo Désactivé", 
      description: "Données effacées.", 
      variant: "default" 
    });
  }, [id, getDemoStorageKey, getDemoTimestampKey, toast]);

  useEffect(() => { 
    loadBudgetData(); 
  }, [id]);

  // ... (Load Data, Refresh Bank, Hydrate State, Handle Year Change - UNCHANGED)
  const loadBudgetData = useCallback(async () => {
    if (!id || loadedRef.current) return;
    setLoading(true);
    try {
      const [budgetResponse, dataResponse] = await Promise.all([
        budgetAPI.getById(id), 
        budgetAPI.getData(id)
      ]);
      setBudget(budgetResponse.data);
      
      setBudgetLocation(budgetResponse.data.location || 'FR');
      setBudgetCurrency(budgetResponse.data.currency || 'EUR');
      
      const raw = dataResponse.data as ExtendedBudgetData;
      setChargeMappings(raw.chargeMappings || []);
      const data = convertOldFormatToNew(raw);
      globalDataRef.current = raw;
      
      setBudgetTitle(data.budgetTitle);
      setCurrentYear(data.currentYear);
      setPeople(data.people);
      setCharges(data.charges);
      setProjects(data.projects);
      setYearlyData(data.yearlyData);
      setYearlyExpenses(data.yearlyExpenses);
      setOneTimeIncomes(data.oneTimeIncomes);
      setMonthComments(data.monthComments);
      setProjectComments(data.projectComments);
      setLockedMonths(data.lockedMonths || {});
      setLastServerUpdate(data.lastUpdated || "");
      
      loadedRef.current = true;
      if (!hasSeenTutorial) {
        setTimeout(() => startTutorial(), 500);
      }
      refreshBankData();
    } catch (error: any) {
      console.error('Error loading budget:', error);
      if (error.response?.status === 404) {
        navigate('/404');
      }
      toast({ 
        title: "Erreur", 
        description: "Impossible de charger le budget", 
        variant: "destructive" 
      });
    } finally { 
      setLoading(false); 
    }
  }, [id, hasSeenTutorial, startTutorial, navigate, toast]);

  const refreshBankData = useCallback(async () => {
    if (!id || isDemoMode) return;
    try {
      const response = await api.get(`/banking/budgets/${id}/reality-check`);
      const { total_real_cash } = response.data;
      setRealBankBalance(total_real_cash || 0);
      setHasActiveConnection(total_real_cash > 0);
    } catch (error) {
      console.error('[Reality Check] Error fetching bank data:', error);
      setHasActiveConnection(false);
    }
  }, [id, isDemoMode]);

  const hydrateStateFromGlobal = useCallback((year: number, rawData: any) => {
    if (rawData.yearlyData && rawData.yearlyData[year]) {
      const yearData = rawData.yearlyData[year];
      const newYearlyData: YearlyData = {};
      const newYearlyExpenses: YearlyData = {};
      const newOneTime: OneTimeIncomes = {};
      const newMonthComments: MonthComments = {};
      const newProjectComments: ProjectComments = {};
      MONTHS.forEach((month, idx) => {
        if (yearData.months && yearData.months[idx]) newYearlyData[month] = yearData.months[idx];
        if (yearData.expenses && yearData.expenses[idx]) newYearlyExpenses[month] = yearData.expenses[idx];
        if (yearData.monthComments && yearData.monthComments[idx]) newMonthComments[month] = yearData.monthComments[idx];
        if (yearData.expenseComments && yearData.expenseComments[idx]) newProjectComments[month] = yearData.expenseComments[idx];
        if (rawData.oneTimeIncomes && rawData.oneTimeIncomes[year] && rawData.oneTimeIncomes[year][idx]) {
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
  }, []);

  const handleYearChange = useCallback((newYear: number) => {
    if (globalDataRef.current) {
      const tempCurrentState = { 
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
        lockedMonths 
      };
      const formattedCurrent = convertNewFormatToOld(tempCurrentState as any);
      if (!globalDataRef.current.yearlyData) globalDataRef.current.yearlyData = {};
      if (!globalDataRef.current.oneTimeIncomes) globalDataRef.current.oneTimeIncomes = {};
      const sourceYearlyData = formattedCurrent.yearlyData || {};
      const sourceOneTime = formattedCurrent.oneTimeIncomes || {};
      globalDataRef.current.yearlyData[currentYear] = sourceYearlyData[currentYear];
      globalDataRef.current.oneTimeIncomes[currentYear] = sourceOneTime[currentYear];
    }
    setCurrentYear(newYear);
    hydrateStateFromGlobal(newYear, globalDataRef.current);
  }, [budgetTitle, currentYear, people, charges, projects, yearlyData, yearlyExpenses, oneTimeIncomes, monthComments, projectComments, lockedMonths, hydrateStateFromGlobal]);

  // ============================================================================
  // ⛔️ DISABLED SAVE HANDLER
  // ============================================================================

  const handleSave = useCallback(async (silent = false) => {
    if (!silent) {
      toast({ 
        title: "Mode Lecture Seule", 
        description: "La sauvegarde est désactivée en mode Beta/Test pour protéger vos données réelles.", 
        variant: "default",
        duration: 3000
      });
    }
    // API CALL REMOVED
  }, [toast]);

  // ... (Refresh Members Only, Mapper Handlers, Bank Manager Handlers - UNCHANGED)
  const refreshMembersOnly = useCallback(async () => { 
    if (!id) return;
    try {
      const response = await budgetAPI.getById(id);
      setBudget(prev => {
        if (JSON.stringify(prev?.members) !== JSON.stringify(response.data.members)) {
          return response.data;
        }
        return prev;
      });
    } catch (error) { 
      console.error(error); 
    }
  }, [id]);

  const handleOpenMapper = useCallback((charge: Charge) => {
    setChargeToMap(charge);
    setShowMapper(true);
  }, []);

  const handleSaveMappings = useCallback((newLinks: MappedTransaction[]) => {
    const others = chargeMappings.filter(m => m.chargeId !== chargeToMap?.id);
    const updated = [...others, ...newLinks];
    setChargeMappings(updated);
    toast({ 
      title: "Mappings mis à jour (Local)", 
      description: `${newLinks.length} transaction(s) liée(s).` 
    });
  }, [chargeMappings, chargeToMap?.id, toast]);

  const handleOpenBankManager = useCallback(() => {
    if (isDemoMode) {
      toast({ 
        title: "Mode Démonstration", 
        description: "Vous utilisez des données fictives.", 
        duration: 5000 
      });
      return;
    }
    setShowBankManager(true);
  }, [isDemoMode, toast]);

  const handleSectionChange = useCallback((section: string) => {
    if (section === 'settings' || section === 'notifications') return;
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (section === 'overview') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleShowInviteModal = useCallback(() => {
    setShowInviteModal(true);
  }, []);

  const handleCloseInviteModal = useCallback(() => {
    setShowInviteModal(false);
  }, []);

  const handleCloseBankManager = useCallback(() => {
    setShowBankManager(false);
  }, []);

  const handleCloseMapper = useCallback(() => {
    setShowMapper(false);
  }, []);

  const handleNavigateBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // ============================================================================
  // RENDER
  // ============================================================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center text-xs py-1.5 font-medium shadow-lg">
        ✨ Beta 2 : Mode Test - Modifications non sauvegardées
      </div>

      <BudgetNavbar 
        budgetTitle={budget?.name + " (Beta 2)"} 
        userName={user?.name}
        userAvatar={user?.avatar}
        items={BUDGET_NAV_ITEMS}
        onSectionChange={handleSectionChange}
        currentSection="overview"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={handleNavigateBack} 
            className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2 font-medium transition-colors"
          >
            ← Retour au Dashboard
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2">
              <FlaskConical className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-900">Mode Beta 2 actif</span>
            </div>
            {/* ✅ Affichage localisation et devise */}
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-medium">
                  {LOCATION_CONFIGS.find(c => c.code === budgetLocation)?.name || budgetLocation}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                <DollarSign className="h-4 w-4 text-success" />
                <span className="font-medium">{budgetCurrency}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <BudgetHeader 
            budgetTitle={budgetTitle} 
            onTitleChange={setBudgetTitle} 
            currentYear={currentYear} 
            onYearChange={handleYearChange} 
          />
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {budget?.is_owner && (
                <button 
                  onClick={handleShowInviteModal} 
                  className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm hover:shadow"
                >
                  👤 Inviter des membres
                </button>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {hasActiveConnection ? (
                <span className="flex items-center gap-2 text-green-600 font-medium">
                  <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                  Banque connectée
                </span>
              ) : (
                <span className="text-gray-500">Aucune banque connectée</span>
              )}
            </div>
          </div>
        </div>
        
        {budget && user && (
          <div id="members">
            <MemberManagementSection 
              budget={budget} 
              currentUserId={user.id} 
              onMemberChange={refreshMembersOnly} 
            />
          </div>
        )}

        {/* Note: saving={false} forces the button to look active/clickable, but the handler shows a toast */}
        <ActionsBar onSave={() => handleSave(false)} saving={false} />

        {/* ✅ Propagation currency */}
        <div id="people">
          <PeopleSection people={people} onPeopleChange={setPeople} currency={budgetCurrency} />
        </div>

        {/* ✅ Propagation location + currency */}
        <div id="charges" className="mt-6">
          <ChargesSection 
            charges={charges} 
            onChargesChange={setCharges} 
            onLinkTransaction={handleOpenMapper} 
            mappedTotals={mappedTotalsByChargeId}
            budgetLocation={budgetLocation}
            budgetCurrency={budgetCurrency}
          />
        </div>
        
        {/* ✅ CORRIGÉ : householdSize + location + currency */}
        <div id="suggestions" className="mt-6">
          <EnhancedSuggestions 
            budgetId={id!} 
            charges={charges} 
            householdSize={householdSize}
            location={budgetLocation}
            currency={budgetCurrency}
          />
        </div>
          
        <div id="reality" className="mt-8">
          {isDemoMode && <DemoBanner onDisable={disableDemoMode} />}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-xl p-4 text-white mt-4">
            <div className="flex items-center gap-3">
              <FlaskConical className="h-6 w-6" /> 
              <div>
                <h2 className="text-xl font-display font-semibold">Reality Check</h2>
                <p className="text-sm text-indigo-100 mt-0.5">Comparaison budget théorique vs comptes bancaires réels</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-b-xl shadow-lg p-6 border-t-4 border-indigo-500">
            {!hasActiveConnection && !isDemoMode && (
              <DemoModePrompt onEnableDemoMode={enableDemoMode} />
            )}
            {(hasActiveConnection || isDemoMode) && (
              <RealityCheck 
                totalRealized={totalGlobalRealized}
                bankBalance={isDemoMode ? demoBankBalance : realBankBalance}
                isBankConnected={hasActiveConnection}
                onConnectBank={handleOpenBankManager}
                isDemoMode={isDemoMode}
              />
            )}
          </div>
        </div>

        {/* ✅ Propagation currency */}
        <div id="projects" className="mt-8">
          <ProjectsSection 
            projects={projects} 
            onProjectsChange={setProjects} 
            yearlyData={yearlyData} 
            currentYear={currentYear} 
            projectCarryOvers={projectCarryOvers}
            currency={budgetCurrency}
          />
        </div>

        {/* ✅ Propagation currency */}
        <div id="calendar" className="mt-8">
          <MonthlyTable 
            currentYear={currentYear} 
            onYearChange={handleYearChange} 
            people={people} 
            charges={charges} 
            projects={projects} 
            yearlyData={yearlyData} 
            yearlyExpenses={yearlyExpenses} 
            oneTimeIncomes={oneTimeIncomes} 
            monthComments={monthComments} 
            projectComments={projectComments} 
            lockedMonths={lockedMonths} 
            onYearlyDataChange={setYearlyData} 
            onYearlyExpensesChange={setYearlyExpenses} 
            onOneTimeIncomesChange={setOneTimeIncomes} 
            onMonthCommentsChange={setMonthComments} 
            onProjectCommentsChange={setProjectComments} 
            onLockedMonthsChange={setLockedMonths} 
            projectCarryOvers={projectCarryOvers}
            currency={budgetCurrency}
          />
        </div>

        {/* ✅ Propagation currency */}
        <div id="overview" className="mt-8">
          <StatsSection 
            currentYear={currentYear} 
            people={people} 
            charges={charges} 
            projects={projects} 
            yearlyData={yearlyData} 
            oneTimeIncomes={oneTimeIncomes}
            currency={budgetCurrency}
          />
        </div>
      </div>

      {showInviteModal && (
        <InviteModal 
          budgetId={id!} 
          onClose={handleCloseInviteModal} 
        />
      )}

      <Dialog open={showBankManager} onOpenChange={handleCloseBankManager}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestion des Connexions Bancaires</DialogTitle>
            <DialogDescription>Connectez vos comptes via Enable Banking.</DialogDescription>
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
          onSave={handleSaveMappings} 
          budgetId={id!} 
          demoTransactions={isDemoMode ? demoTransactions : undefined} 
        />
      )}
    </div>
  );
}