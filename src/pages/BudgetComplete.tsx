import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
import { useAutoSave } from '../hooks/useAutoSave';
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
import EnhancedSuggestions from '@/components/budget/EnhancedSuggestions';
import { RealityCheck } from '../components/budget/RealityCheck'; 
import { EnableBankingManager } from '../components/budget/EnableBankingManager'; // ✅ Correct Import
import { TransactionMapper, MappedTransaction, BridgeTransaction } from '../components/budget/TransactionMapper';
import { DemoModePrompt } from '@/components/budget/DemoModePrompt';
import { DemoBanner } from '@/components/budget/DemoBanner';
import { DEMO_TRANSACTIONS, DEMO_BANK_BALANCE, DEMO_MODE_LIMITS } from '@/constants/demoData';

import { 
  LayoutDashboard, Users, Receipt, Target, CalendarDays, 
  MapPin, DollarSign, FlaskConical, Building2 
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTutorial } from '../contexts/TutorialContext';

// ============================================================================
// NAV ITEMS CONFIGURATION
// ============================================================================
const BUDGET_NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: "charges", label: "Charges", icon: Receipt },
  { id: "reality", label: "Reality Check", icon: FlaskConical },
  { id: "projects", label: "Projets", icon: Target },
  { id: "calendar", label: "Tableau Mensuel", icon: CalendarDays },
  { id: "members", label: "Membres", icon: Users },
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

export default function BudgetComplete() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast(); 
  const { hasSeenTutorial, startTutorial } = useTutorial();
  const { connectToBudget, disconnectFromBudget } = useNotifications();

  // ============================================================================
  // CORE STATES
  // ============================================================================
  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [lastServerUpdate, setLastServerUpdate] = useState<string>("");

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

  // ============================================================================
  // REALITY CHECK STATES
  // ============================================================================
  const [showBankManager, setShowBankManager] = useState(false);
  const [realBankBalance, setRealBankBalance] = useState(0);
  const [hasActiveConnection, setHasActiveConnection] = useState(false);
  
  const [showMapper, setShowMapper] = useState(false);
  const [chargeToMap, setChargeToMap] = useState<Charge | null>(null);
  const [chargeMappings, setChargeMappings] = useState<MappedTransaction[]>([]);

  // Demo Mode
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoTransactions, setDemoTransactions] = useState<BridgeTransaction[]>([]);
  const [demoBankBalance, setDemoBankBalance] = useState(0);

  const loadedRef = useRef(false);
  const notifiedProjectsRef = useRef<Set<string>>(new Set());

  // ============================================================================
  // PROJECT CARRY OVERS
  // ============================================================================
  const projectCarryOvers = useMemo(() => {
    const carryOvers: Record<string, number> = {};
    if (!globalDataRef.current || !globalDataRef.current.yearlyData) return carryOvers;
    const rawYearlyData = globalDataRef.current.yearlyData;
    Object.keys(rawYearlyData).forEach(yearStr => {
      const year = parseInt(yearStr);
      if (year < currentYear) {
        const yearData = rawYearlyData[yearStr];
        if (yearData.months && yearData.expenses) {
          yearData.months.forEach((monthAllocation: any, idx: number) => {
            const monthExpense = yearData.expenses[idx] || {};
            Object.keys(monthAllocation).forEach(projectId => {
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
  // MAPPED TOTALS BY CHARGE (for Reality Check)
  // ============================================================================
  const mappedTotalsByChargeId = useMemo(() => {
    const totals: Record<string, number> = {};
    charges.forEach(ch => {
      const mapped = chargeMappings.filter(m => m.chargeId === ch.id);
      totals[ch.id] = mapped.reduce((sum, m) => sum + Math.abs(m.amount), 0);
    });
    return totals;
  }, [charges, chargeMappings]);

  // ============================================================================
  // HOUSEHOLD SIZE
  // ============================================================================
  const householdSize = useMemo(() => {
    return people.length > 0 ? people.length : 1;
  }, [people]);

  // ============================================================================
  // TOTAL GLOBAL REALIZED (for Reality Check comparison)
  // ============================================================================
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

  // ============================================================================
  // SAVE HANDLER
  // ============================================================================
  const performSave = useCallback(async (silent = false) => {
    if (!id) return;
    
    // 🛡️ SECURITY GUARD: Never save if in Demo Mode
    if (isDemoMode) {
      console.warn("⚠️ [Save Guard] Save prevented: User is in Demo Mode.");
      if (!silent) {
        toast({ 
            title: "Mode Démo", 
            description: "La sauvegarde est désactivée pour protéger vos données.", 
            variant: "default" 
        });
      }
      return;
    }

    if (!silent) setSaving(true);
    
    const currentViewData = { 
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

    const formattedCurrent = convertNewFormatToOld(currentViewData as any);
    const finalPayload = JSON.parse(JSON.stringify(globalDataRef.current || {}));
    
    finalPayload.budgetTitle = budgetTitle;
    finalPayload.people = people;
    finalPayload.charges = charges;
    finalPayload.projects = projects;
    
    // SAVE MAPPINGS TO DB
    finalPayload.chargeMappings = chargeMappings;

    finalPayload.lastUpdated = new Date().toISOString();
    finalPayload.updatedBy = user?.name;
    finalPayload.version = '2.3';

    if (!finalPayload.yearlyData) finalPayload.yearlyData = {};
    if (!finalPayload.oneTimeIncomes) finalPayload.oneTimeIncomes = {};

    const sourceYearlyData = formattedCurrent.yearlyData || {};
    const sourceOneTime = formattedCurrent.oneTimeIncomes || {};

    if (sourceYearlyData[currentYear]) {
      finalPayload.yearlyData[currentYear] = sourceYearlyData[currentYear];
    }
    if (sourceOneTime[currentYear]) {
      finalPayload.oneTimeIncomes[currentYear] = sourceOneTime[currentYear];
    }

    try {
        await budgetAPI.updateData(id, { data: finalPayload });
        setLastServerUpdate(finalPayload.lastUpdated);
        globalDataRef.current = finalPayload;

        if (!silent) {
            toast({ title: "Succès", description: "Budget sauvegardé !", variant: "default" });
        }
    } catch (error) {
        if (!silent) {
            toast({ title: "Erreur", description: "Échec de la sauvegarde.", variant: "destructive" });
        }
    } finally {
        if (!silent) setSaving(false);
    }
  }, [id, isDemoMode, budgetTitle, currentYear, people, charges, projects, yearlyData, yearlyExpenses, oneTimeIncomes, monthComments, projectComments, lockedMonths, chargeMappings, user?.name, toast]);

  // ============================================================================
  // AUTO-SAVE HOOK
  // ============================================================================
  const {
    hasUnsavedChanges,
    isSaving,
    markAsModified,
    saveNow,
  } = useAutoSave({
    onSave: performSave,
    delay: 2000,
    // 🛡️ SECURITY GUARD: Auto-save is disabled in Demo Mode
    enabled: loadedRef.current && !isDemoMode,
  });

  // ============================================================================
  // WEBSOCKET
  // ============================================================================
  useEffect(() => {
    if (budget) {
      connectToBudget(budget.id, budget.name);
    }
    return () => disconnectFromBudget();
  }, [budget, connectToBudget, disconnectFromBudget]);

  // ============================================================================
  // LOAD BUDGET (Initial Load)
  // ============================================================================
  const loadBudget = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const budgetRes = await budgetAPI.getById(id);
      const dataRes = await budgetAPI.getData(id);
      
      setBudget(budgetRes.data);
      const rawData: any = dataRes.data.data;
      
      globalDataRef.current = rawData;
      if (rawData.lastUpdated) setLastServerUpdate(rawData.lastUpdated);
      
      setBudgetLocation(budgetRes.data.location || 'FR');
      setBudgetCurrency(budgetRes.data.currency || 'EUR');
      
      // Load mappings
      setChargeMappings(rawData.chargeMappings || []);

      const data = convertOldFormatToNew(rawData);
      
      setBudgetTitle(data.budgetTitle || '');
      const savedYear = data.currentYear || new Date().getFullYear();
      setCurrentYear(savedYear);
      setPeople(data.people || []);
      setCharges(data.charges || []);
      setProjects(data.projects || []);
      setYearlyData(data.yearlyData || {});
      setYearlyExpenses(data.yearlyExpenses || {});
      setOneTimeIncomes(data.oneTimeIncomes || {});
      setMonthComments(data.monthComments || {});
      setProjectComments(data.projectComments || {});
      setLockedMonths(data.lockedMonths || {});
      
      loadedRef.current = true;
      setTimeout(() => refreshBankData(), 500);

    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger les données.", variant: "destructive" });
    } finally { 
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => { 
    if (id) loadBudget(); 
  }, [id, loadBudget]);

  // ============================================================================
  // DEMO MODE MANAGEMENT
  // ============================================================================
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
      description: "Données fictives chargées. La sauvegarde est désactivée.",
      duration: 4000
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
    
    // 🛡️ CRITICAL: Reload from server to discard any local changes made during demo
    loadBudget();

    toast({ 
      title: "Mode Démo Désactivé", 
      description: "Retour aux données réelles.",
      duration: 3000
    });
  }, [id, getDemoStorageKey, getDemoTimestampKey, toast, loadBudget]);

  // ============================================================================
  // REFRESH BANK DATA (Reality Check)
  // ============================================================================
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

  // ============================================================================
  // TUTORIAL
  // ============================================================================
  useEffect(() => {
    if (!loading && !hasSeenTutorial && loadedRef.current) {
      const timer = setTimeout(() => {
        startTutorial();
      }, 1500); 
      return () => clearTimeout(timer);
    }
  }, [loading, hasSeenTutorial, startTutorial]);

  // ============================================================================
  // MEMBERS REFRESH
  // ============================================================================
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
      console.error("Failed to refresh members", error); 
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const memberInterval = setInterval(() => {
      if (document.visibilityState === 'visible') refreshMembersOnly();
    }, 60000); 
    return () => clearInterval(memberInterval);
  }, [id, refreshMembersOnly]);

  // ============================================================================
  // PROJECT NOTIFICATIONS
  // ============================================================================
  useEffect(() => {
    if (!loadedRef.current) return;
    projects.forEach(project => {
      if (!project.targetAmount || project.targetAmount <= 0) return;
      if (notifiedProjectsRef.current.has(project.id)) return;
      let totalAllocated = (projectCarryOvers[project.id] || 0);
      MONTHS.forEach(month => { 
        totalAllocated += yearlyData[month]?.[project.id] || 0; 
      });
      if (totalAllocated >= project.targetAmount) {
        notifiedProjectsRef.current.add(project.id);
        toast({
          title: "🎉 Objectif Atteint !",
          description: `Félicitations ! Le projet "${project.label}" est entièrement financé.`,
          className: "bg-success/10 border-success/50 text-success-foreground",
          duration: 5000,
        });
      }
    });
  }, [projects, yearlyData, projectCarryOvers, toast]);

  // ============================================================================
  // YEAR CHANGE
  // ============================================================================
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
      if (sourceYearlyData[currentYear]) {
        globalDataRef.current.yearlyData[currentYear] = sourceYearlyData[currentYear];
      }
      if (sourceOneTime[currentYear]) {
        globalDataRef.current.oneTimeIncomes[currentYear] = sourceOneTime[currentYear];
      }
    }
    setCurrentYear(newYear);
    hydrateStateFromGlobal(newYear, globalDataRef.current);
  }, [budgetTitle, currentYear, people, charges, projects, yearlyData, yearlyExpenses, oneTimeIncomes, monthComments, projectComments, lockedMonths, hydrateStateFromGlobal]);

  // ============================================================================
  // DATA CHANGE HANDLERS
  // ============================================================================
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

  const handleYearlyDataChange = useCallback((newData: YearlyData) => {
    setYearlyData(newData);
    markAsModified();
  }, [markAsModified]);

  const handleYearlyExpensesChange = useCallback((newData: YearlyData) => {
    setYearlyExpenses(newData);
    markAsModified();
  }, [markAsModified]);

  const handleOneTimeIncomesChange = useCallback((newData: OneTimeIncomes) => {
    setOneTimeIncomes(newData);
    markAsModified();
  }, [markAsModified]);

  const handleMonthCommentsChange = useCallback((newData: MonthComments) => {
    setMonthComments(newData);
    markAsModified();
  }, [markAsModified]);

  const handleProjectCommentsChange = useCallback((newData: ProjectComments) => {
    setProjectComments(newData);
    markAsModified();
  }, [markAsModified]);

  const handleLockedMonthsChange = useCallback((newData: LockedMonths) => {
    setLockedMonths(newData);
    markAsModified();
  }, [markAsModified]);

  // ============================================================================
  // TRANSACTION MAPPER HANDLERS
  // ============================================================================
  const handleOpenMapper = useCallback((charge: Charge) => {
    setChargeToMap(charge);
    setShowMapper(true);
  }, []);

  const handleCloseMapper = useCallback(() => {
    setShowMapper(false);
    setChargeToMap(null);
  }, []);

  const handleSaveMappings = useCallback((newMappings: MappedTransaction[]) => {
    if (!chargeToMap) return;
    
    // Special Warning in Demo Mode
    if(isDemoMode) {
         toast({ title: "Mode Démo", description: "Mapping simulé (non sauvegardé).", variant: "default" });
    }

    const otherMappings = chargeMappings.filter(m => m.chargeId !== chargeToMap.id);
    const updated = [...otherMappings, ...newMappings];
    setChargeMappings(updated);
    
    // Only mark as modified (triggering auto-save) if NOT in demo mode
    if(!isDemoMode) {
        markAsModified(); 
    }
    
    handleCloseMapper();
  }, [chargeToMap, chargeMappings, handleCloseMapper, toast, markAsModified, isDemoMode]);

  // ============================================================================
  // BANK MANAGER HANDLERS
  // ============================================================================
  const handleOpenBankManager = useCallback(() => {
    setShowBankManager(true);
  }, []);

  const handleCloseBankManager = useCallback(() => {
    setShowBankManager(false);
    // Refresh to check if we now have real data
    if(!isDemoMode) {
        refreshBankData();
    }
  }, [refreshBankData, isDemoMode]);

  // ============================================================================
  // NAVIGATION
  // ============================================================================
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

  const handleNavigateBack = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const handleInvited = useCallback(() => {
    refreshMembersOnly();
    toast({ 
      title: "Invitation envoyée", 
      variant: "default" 
    });
  }, [refreshMembersOnly, toast]);

  // ============================================================================
  // RENDER
  // ============================================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50">
      <BudgetNavbar 
        budgetTitle={budget?.name} 
        userName={user?.name}
        userAvatar={user?.avatar}
        items={BUDGET_NAV_ITEMS}
        onSectionChange={handleSectionChange}
        currentSection="overview"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Auto-save Indicators */}
        {hasUnsavedChanges && !isSaving && !saving && (
          <div className="mb-4 flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-orange-800 dark:text-orange-300">
              Modifications non sauvegardées - Sauvegarde automatique dans quelques secondes...
            </span>
          </div>
        )}

        {(isSaving || saving) && (
          <div className="mb-4 flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <svg className="animate-spin w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Sauvegarde en cours...
            </span>
          </div>
        )}

        <button 
          onClick={handleNavigateBack} 
          className="text-primary-600 hover:text-primary-700 mb-4 flex items-center gap-2 font-medium min-h-[44px]"
        >
          ← Retour aux budgets
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <BudgetHeader 
            budgetTitle={budgetTitle} 
            onTitleChange={setBudgetTitle} 
            currentYear={currentYear} 
            onYearChange={handleYearChange} 
          />
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              {budget?.is_owner && (
                <button 
                  onClick={handleShowInviteModal} 
                  className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition min-h-[44px]"
                >
                  👤 Inviter
                </button>
              )}
            </div>
            {/* Affichage localisation, devise et status connexion */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-medium">
                  {LOCATION_CONFIGS.find(c => c.code === budgetLocation)?.name || budgetLocation}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                <DollarSign className="h-4 w-4 text-success" />
                <span className="font-medium">
                  {budgetCurrency} ({LOCATION_CONFIGS.find(c => c.code === budgetLocation)?.symbol || '€'})
                </span>
              </div>
              {/* Bank connection status */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                <Building2 className="h-4 w-4 text-indigo-500" />
                {hasActiveConnection || isDemoMode ? (
                  <span className="flex items-center gap-2 text-green-600 font-medium">
                    <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                    {isDemoMode ? 'Mode Démo' : 'Banque connectée'}
                  </span>
                ) : (
                  <span className="text-gray-500">Non connecté</span>
                )}
              </div>
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

        <ActionsBar onSave={() => performSave(false)} saving={saving} />

        <div id="people">
          <PeopleSection 
            people={people} 
            onPeopleChange={handlePeopleChange} 
            currency={budgetCurrency} 
          />
        </div>
        
        <div id="charges" className="mt-6">
          <ChargesSection 
            charges={charges} 
            onChargesChange={handleChargesChange}
            onLinkTransaction={handleOpenMapper}
            mappedTotals={mappedTotalsByChargeId}
            budgetLocation={budgetLocation}
            budgetCurrency={budgetCurrency}
          />
        </div>
        
        <div id="suggestions" className="mt-6">
          <EnhancedSuggestions 
            budgetId={id!} 
            charges={charges} 
            householdSize={householdSize}
            location={budgetLocation}
            currency={budgetCurrency}
          />
        </div>

        {/* ============================================================================ */}
        {/* REALITY CHECK SECTION - PLACED ABOVE PROJECTS */}
        {/* ============================================================================ */}
        <div id="reality" className="mt-6">
          {isDemoMode && <DemoBanner onDisable={disableDemoMode} />}
          
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-xl p-4 text-white mt-4">
            <div className="flex items-center gap-3">
              <FlaskConical className="h-6 w-6" /> 
              <div>
                <h2 className="text-xl font-display font-semibold">Reality Check</h2>
                <p className="text-sm text-indigo-100 mt-0.5">
                  Comparaison budget théorique vs comptes bancaires réels
                </p>
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
        
        <div id="projects" className="mt-6">
          <ProjectsSection 
            projects={projects} 
            onProjectsChange={handleProjectsChange} 
            yearlyData={yearlyData} 
            currentYear={currentYear} 
            projectCarryOvers={projectCarryOvers}
            currency={budgetCurrency}
          />
        </div>

        <div id="calendar" className="mt-6">
          <MonthlyTable 
            currentYear={currentYear} 
            people={people} 
            charges={charges} 
            projects={projects} 
            yearlyData={yearlyData} 
            yearlyExpenses={yearlyExpenses} 
            oneTimeIncomes={oneTimeIncomes} 
            monthComments={monthComments} 
            projectComments={projectComments} 
            lockedMonths={lockedMonths} 
            onYearlyDataChange={handleYearlyDataChange} 
            onYearlyExpensesChange={handleYearlyExpensesChange} 
            onOneTimeIncomesChange={handleOneTimeIncomesChange} 
            onMonthCommentsChange={handleMonthCommentsChange} 
            onProjectCommentsChange={handleProjectCommentsChange} 
            onLockedMonthsChange={handleLockedMonthsChange} 
            onYearChange={handleYearChange} 
            projectCarryOvers={projectCarryOvers}
            currency={budgetCurrency}
          />
        </div>

        <div id="overview" className="mt-6">
          <StatsSection 
            people={people} 
            charges={charges} 
            projects={projects} 
            yearlyData={yearlyData} 
            oneTimeIncomes={oneTimeIncomes} 
            currentYear={currentYear}
            currency={budgetCurrency}
          />
        </div>
      </div>

      {/* MODALS */}
      {showInviteModal && id && (
        <InviteModal 
          budgetId={id} 
          onClose={handleCloseInviteModal} 
          onInvited={handleInvited} 
        />
      )}

      {/* Bank Manager Dialog */}
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

      {/* Transaction Mapper Dialog */}
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