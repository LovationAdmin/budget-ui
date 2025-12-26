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
import { BudgetNavbar, NavItem } from '@/components/budget/BudgetNavbar';
import InviteModal from '../components/InviteModal';

import BudgetHeader from '../components/budget/BudgetHeader';
import PeopleSection from '../components/budget/PeopleSection';
import ChargesSection, { Suggestion } from '../components/budget/ChargesSection';
import ProjectsSection from '../components/budget/ProjectsSection';
import MonthlyTable from '../components/budget/MonthlyTable';
import StatsSection from '../components/budget/StatsSection';
import ActionsBar from '../components/budget/ActionsBar';
import MemberManagementSection from '../components/budget/MemberManagementSection';
import { RealityCheck } from '../components/budget/RealityCheck'; 
import { EnableBankingManager } from '../components/budget/EnableBankingManager';
import { TransactionMapper, MappedTransaction, BridgeTransaction } from '../components/budget/TransactionMapper';

import { LayoutDashboard, Users, Receipt, Target, CalendarDays, FlaskConical } from "lucide-react";
import { ToastAction } from '@/components/ui/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTutorial } from '../contexts/TutorialContext';

import { DEMO_TRANSACTIONS, DEMO_BANK_BALANCE, DEMO_MODE_LIMITS } from '@/constants/demoData';
import { DemoModePrompt } from '@/components/budget/DemoModePrompt';
import { DemoBanner } from '@/components/budget/DemoBanner';

const BUDGET_NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: "members", label: "Membres", icon: Users },
  { id: "charges", label: "Charges", icon: Receipt },
  { id: "reality", label: "Reality Check (Beta 2)", icon: FlaskConical },
  { id: "projects", label: "Projets", icon: Target },
  { id: "calendar", label: "Tableau Mensuel", icon: CalendarDays },
];

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

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
}

export default function Beta2Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { hasSeenTutorial, startTutorial } = useTutorial(); 

  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [lastServerUpdate, setLastServerUpdate] = useState<string>("");

  // --- ENABLE BANKING STATE ---
  const [showBankManager, setShowBankManager] = useState(false);
  const [realBankBalance, setRealBankBalance] = useState(0);
  const [hasActiveConnection, setHasActiveConnection] = useState(false);
  
  // --- MAPPING STATE ---
  const [showMapper, setShowMapper] = useState(false);
  const [chargeToMap, setChargeToMap] = useState<Charge | null>(null);
  const [chargeMappings, setChargeMappings] = useState<MappedTransaction[]>([]);

  // --- DEMO MODE STATE ---
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoTransactions, setDemoTransactions] = useState<BridgeTransaction[]>([]);
  const [demoBankBalance, setDemoBankBalance] = useState(0);

  // --- DATA STORAGE ---
  const globalDataRef = useRef<any>(null);

  // --- Core Budget Data State ---
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

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const loadedRef = useRef(false);
  const notifiedProjectsRef = useRef<Set<string>>(new Set());

  // --- COMPUTED VALUES ---
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

  // ============================================================================
  // DEMO MODE - PERSISTANCE & RESTORATION
  // ============================================================================
  
  const getDemoStorageKey = () => `demo-mode-${id}`;
  const getDemoTimestampKey = () => `demo-timestamp-${id}`;

  // Restaurer le mode démo au chargement
  useEffect(() => {
    if (!id) return;
    
    const demoEnabled = localStorage.getItem(getDemoStorageKey()) === 'true';
    const demoTimestamp = localStorage.getItem(getDemoTimestampKey());
    
    if (demoEnabled && demoTimestamp) {
      const daysSinceActivation = (Date.now() - parseInt(demoTimestamp)) / (1000 * 60 * 60 * 24);
      
      if (daysSinceActivation < DEMO_MODE_LIMITS.EXPIRE_AFTER_DAYS) {
        console.log('[Demo Mode] Restoring demo mode from localStorage');
        setDemoTransactions(DEMO_TRANSACTIONS);
        setDemoBankBalance(DEMO_BANK_BALANCE);
        setIsDemoMode(true);
        setHasActiveConnection(true);
      } else {
        console.log('[Demo Mode] Demo mode expired after 7 days, cleaning up');
        disableDemoMode();
      }
    }
  }, [id]);

  // ============================================================================
  // DEMO MODE - ACTIONS
  // ============================================================================

  const enableDemoMode = () => {
    if (!id) return;
    
    setDemoTransactions(DEMO_TRANSACTIONS);
    setDemoBankBalance(DEMO_BANK_BALANCE);
    setIsDemoMode(true);
    setHasActiveConnection(true);
    
    // Persister dans localStorage
    localStorage.setItem(getDemoStorageKey(), 'true');
    localStorage.setItem(getDemoTimestampKey(), Date.now().toString());
    
    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'demo_mode_enabled', {
        budget_id: id,
        user_id: user?.id
      });
    }
    
    toast({
      title: "🎭 Mode Démo Activé",
      description: "Vous utilisez des données bancaires fictives pour tester Reality Check.",
      duration: 5000
    });
  };

  const disableDemoMode = () => {
    if (!id) return;
    
    setIsDemoMode(false);
    setDemoTransactions([]);
    setDemoBankBalance(0);
    setHasActiveConnection(false);
    
    // Nettoyer localStorage
    localStorage.removeItem(getDemoStorageKey());
    localStorage.removeItem(getDemoTimestampKey());
    
    toast({
      title: "Mode Démo Désactivé",
      description: "Les données de démonstration ont été effacées.",
      variant: "default"
    });
  };

  // ============================================================================
  // INITIAL DATA LOADING
  // ============================================================================

  useEffect(() => {
    loadBudgetData();
  }, [id]);

  const loadBudgetData = async () => {
    if (!id || loadedRef.current) return;
    setLoading(true);

    try {
      const [budgetResponse, dataResponse] = await Promise.all([
        budgetAPI.getById(id),
        budgetAPI.getData(id)
      ]);

      setBudget(budgetResponse.data);
      const raw = dataResponse.data as ExtendedBudgetData;
      
      setChargeMappings(raw.chargeMappings || []);
      
      const isNewFormat = raw.yearlyData && 
                         Object.keys(raw.yearlyData).some(key => /^\d{4}$/.test(key));

      let convertedData;
      if (isNewFormat) {
          convertedData = convertOldFormatToNew(raw);
      } else {
          convertedData = convertOldFormatToNew(raw);
      }

      globalDataRef.current = raw;
      
      setBudgetTitle(convertedData.budgetTitle);
      setCurrentYear(convertedData.currentYear);
      setPeople(convertedData.people);
      setCharges(convertedData.charges);
      setProjects(convertedData.projects);
      setYearlyData(convertedData.yearlyData);
      setYearlyExpenses(convertedData.yearlyExpenses);
      setOneTimeIncomes(convertedData.oneTimeIncomes);
      setMonthComments(convertedData.monthComments);
      setProjectComments(convertedData.projectComments);
      setLockedMonths(convertedData.lockedMonths || {});
      setLastServerUpdate(convertedData.lastUpdated || "");
      
      loadedRef.current = true;
      
      if (!hasSeenTutorial) {
          setTimeout(() => startTutorial(), 500);
      }
      
      // Charger les données bancaires
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
  };

  // ============================================================================
  // BANK DATA MANAGEMENT
  // ============================================================================

  const refreshBankData = async () => {
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
  };

  // ============================================================================
  // YEAR MANAGEMENT
  // ============================================================================

  const hydrateStateFromGlobal = (year: number, rawData: any) => {
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
  };

  const handleYearChange = (newYear: number) => {
      if (globalDataRef.current) {
          const tempCurrentState = {
              budgetTitle, currentYear, people, charges, projects, 
              yearlyData, yearlyExpenses, oneTimeIncomes, 
              monthComments, projectComments, lockedMonths
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
  };

  // ============================================================================
  // SAVE MANAGEMENT
  // ============================================================================

  const handleSave = async (silent = false) => {
     if(!id) return;
     if(!silent) setSaving(true);
     
     const currentViewData = { 
         budgetTitle, currentYear, people, charges, projects, 
         yearlyData, yearlyExpenses, oneTimeIncomes, 
         monthComments, projectComments, lockedMonths 
     };
     const formattedCurrent = convertNewFormatToOld(currentViewData as any);

     const finalPayload = { ...globalDataRef.current };
     
     finalPayload.budgetTitle = budgetTitle;
     finalPayload.people = people;
     finalPayload.charges = charges;
     finalPayload.projects = projects;
     finalPayload.chargeMappings = chargeMappings;
     finalPayload.lastUpdated = new Date().toISOString();
     finalPayload.updatedBy = user?.name;
     finalPayload.version = '2.4-beta2';

     if (!finalPayload.yearlyData) finalPayload.yearlyData = {};
     if (!finalPayload.oneTimeIncomes) finalPayload.oneTimeIncomes = {};

     const sourceYearlyData = formattedCurrent.yearlyData || {};
     const sourceOneTime = formattedCurrent.oneTimeIncomes || {};

     finalPayload.yearlyData[currentYear] = sourceYearlyData[currentYear];
     finalPayload.oneTimeIncomes[currentYear] = sourceOneTime[currentYear];

     try { 
         await budgetAPI.updateData(id, { data: finalPayload }); 
         setLastServerUpdate(finalPayload.lastUpdated);
         globalDataRef.current = finalPayload;
         if(!silent) toast({
             title: "Succès", 
             description: "Budget sauvegardé !", 
             variant: "success"
         }); 
     } 
     catch(e) { 
         if(!silent) toast({
             title: "Erreur", 
             description: "Échec sauvegarde", 
             variant: "destructive"
         }); 
     } 
     finally { 
         if(!silent) setSaving(false); 
     }
  };
  
  const refreshMembersOnly = async () => { 
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
  };

  // ============================================================================
  // TRANSACTION MAPPING
  // ============================================================================

  const handleOpenMapper = (charge: Charge) => {
      setChargeToMap(charge);
      setShowMapper(true);
  };

  const handleSaveMappings = (newLinks: MappedTransaction[]) => {
      const others = chargeMappings.filter(m => m.chargeId !== chargeToMap?.id);
      const updated = [...others, ...newLinks];
      setChargeMappings(updated);
      
      toast({ 
          title: "Mappings mis à jour", 
          description: `${newLinks.length} transaction(s) liée(s).` 
      });
  };

  const handleOpenBankManager = () => {
      if (isDemoMode) {
          toast({
              title: "Mode Démonstration",
              description: "Vous utilisez des données fictives. Les vraies connexions bancaires seront disponibles prochainement.",
              duration: 5000
          });
          return;
      }
      setShowBankManager(true);
  };

  // ============================================================================
  // REALITY CHECK CALCULATION
  // ============================================================================

  const today = new Date();
  const currentMonthIndex = today.getMonth();
  const currentRealYear = today.getFullYear();
  let totalGlobalRealized = 0;
  
  if (currentYear <= currentRealYear) {
      projects.forEach(proj => {
          totalGlobalRealized += (projectCarryOvers[proj.id] || 0);
          
          MONTHS.forEach((month, idx) => {
              if (currentYear < currentRealYear || idx <= currentMonthIndex) {
                   const allocation = yearlyData[month]?.[proj.id] || 0;
                   const expense = yearlyExpenses[month]?.[proj.id] || 0;
                   totalGlobalRealized += (allocation - expense);
              }
          });
      });
  }

  // ============================================================================
  // SECTION NAVIGATION
  // ============================================================================

  const handleSectionChange = (section: string) => {
    if (section === 'settings' || section === 'notifications') return;
    const element = document.getElementById(section);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (section === 'overview') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
        ✨ Beta 2 : Enable Banking (2500+ banques européennes) - Test de l'API PSD2
      </div>

      <BudgetNavbar 
        budgetTitle={budget?.name + " (Beta 2 - Enable Banking)"} 
        userName={user?.name}
        userAvatar={user?.avatar}
        items={BUDGET_NAV_ITEMS}
        onSectionChange={handleSectionChange}
        currentSection="overview"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigate('/')} 
            className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2 font-medium transition-colors"
          >
            ← Retour au Dashboard
          </button>
          
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2">
            <FlaskConical className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-900">
              Mode Beta 2 actif
            </span>
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
                  onClick={() => setShowInviteModal(true)} 
                  className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm hover:shadow"
                >
                  👥 Inviter des membres
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
        
        <ActionsBar onSave={() => handleSave(false)} saving={saving} />

        <div id="people">
          <PeopleSection people={people} onPeopleChange={setPeople} />
        </div>
        
        <div id="charges" className="mt-6">
            <ChargesSection 
                charges={charges} 
                onChargesChange={setCharges} 
                suggestions={suggestions} 
                onLinkTransaction={handleOpenMapper} 
                mappedTotals={mappedTotalsByChargeId} 
            />
        </div>
        
        {/* ============================================================================ */}
        {/* REALITY CHECK SECTION */}
        {/* ============================================================================ */}
        <div id="reality" className="mt-8">
            {isDemoMode && (
                <DemoBanner 
                    onDisable={disableDemoMode}
                />
            )}
            
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-xl p-4 text-white mt-4">
              <div className="flex items-center gap-3">
                <FlaskConical className="h-6 w-6" /> 
                <div>
                  <h2 className="text-xl font-display font-semibold">
                    Reality Check
                  </h2>
                  <p className="text-sm text-indigo-100 mt-0.5">
                    Comparaison entre votre budget théorique et vos comptes bancaires réels
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-b-xl shadow-lg p-6 border-t-4 border-indigo-500">
                {!hasActiveConnection && !isDemoMode && (
                    <DemoModePrompt 
                        onEnableDemoMode={enableDemoMode}
                    />
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

        <div id="projects" className="mt-8">
            <ProjectsSection 
                projects={projects} 
                onProjectsChange={setProjects}
                projectCarryOvers={projectCarryOvers}
                currentYear={currentYear}
            />
        </div>

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
            />
        </div>

        <div id="overview" className="mt-8">
            <StatsSection 
                currentYear={currentYear}
                people={people}
                charges={charges}
                projects={projects}
                yearlyData={yearlyData}
                oneTimeIncomes={oneTimeIncomes}
            />
        </div>
      </div>

      {showInviteModal && (
        <InviteModal 
          budgetId={id!} 
          onClose={() => setShowInviteModal(false)} 
        />
      )}

      <Dialog open={showBankManager} onOpenChange={setShowBankManager}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Gestion des Connexions Bancaires</DialogTitle>
                <DialogDescription>
                    Connectez vos comptes bancaires via Enable Banking (2500+ banques européennes).
                    Sélectionnez ensuite les comptes d'épargne pour le calcul du Reality Check.
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
              onClose={() => setShowMapper(false)}
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