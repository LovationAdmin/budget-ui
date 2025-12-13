import { useState, useEffect, useRef, useCallback } from 'react';
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
import { BankConnectionManager } from '../components/budget/BankConnectionManager';
import { TransactionMapper, MappedTransaction } from '../components/budget/TransactionMapper';

import { LayoutDashboard, Users, Receipt, Target, CalendarDays, FlaskConical } from "lucide-react";
import { ToastAction } from '@/components/ui/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTutorial } from '../contexts/TutorialContext';

const BUDGET_NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: "members", label: "Membres", icon: Users },
  { id: "charges", label: "Charges", icon: Receipt },
  { id: "reality", label: "Reality Check (Bêta)", icon: FlaskConical },
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

export default function BudgetCompleteBeta() {
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

  // --- BANKING STATE ---
  const [showBankManager, setShowBankManager] = useState(false);
  const [realBankBalance, setRealBankBalance] = useState(0);
  const [hasActiveConnection, setHasActiveConnection] = useState(false);
  
  // --- MAPPING STATE ---
  const [showMapper, setShowMapper] = useState(false);
  const [chargeToMap, setChargeToMap] = useState<Charge | null>(null);
  const [chargeMappings, setChargeMappings] = useState<MappedTransaction[]>([]);

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

  // --- 0. SMART LOGIC ---

  const getMonthlyChargeTotal = (monthIndex: number) => {
      let total = 0;
      charges.forEach(charge => {
          const mappedForThisMonth = chargeMappings.filter(m => {
              if (m.chargeId !== charge.id) return false;
              const date = new Date(m.date);
              return date.getMonth() === monthIndex && date.getFullYear() === currentYear;
          });

          if (mappedForThisMonth.length > 0) {
              const sumReal = mappedForThisMonth.reduce((acc, curr) => acc + curr.amount, 0);
              total += Math.abs(sumReal);
          } else {
              const monthStart = new Date(currentYear, monthIndex, 1);
              const monthEnd = new Date(currentYear, monthIndex + 1, 0);
              let isActive = true;
              if (charge.startDate) {
                  const start = new Date(charge.startDate);
                  if (start > monthEnd) isActive = false;
              }
              if (charge.endDate) {
                  const end = new Date(charge.endDate);
                  if (end < monthStart) isActive = false;
              }
              if (isActive) total += charge.amount;
          }
      });
      return total;
  };

  const mappedTotalsByChargeId = charges.reduce((acc, charge) => {
      const total = chargeMappings
        .filter(m => m.chargeId === charge.id)
        .reduce((sum, m) => sum + Math.abs(m.amount), 0);
      if (total > 0) acc[charge.id] = total; 
      return acc;
  }, {} as Record<string, number>);

  const calculateCarryOvers = () => {
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
  };

  const projectCarryOvers = calculateCarryOvers();

  // --- 1. EFFECTS ---

  useEffect(() => {
    if (!loading && !hasSeenTutorial && loadedRef.current) {
       const timer = setTimeout(() => startTutorial(), 1500); 
       return () => clearTimeout(timer);
    }
  }, [loading, hasSeenTutorial, startTutorial]);

  const refreshBankData = useCallback(async () => {
      try {
          const res = await api.get(`/budgets/${id}/banking/connections`);
          setRealBankBalance(res.data.total_real_cash || 0);
          const conns = res.data.connections || [];
          setHasActiveConnection(conns.length > 0);
      } catch (error) { console.error("Failed to refresh bank data", error); }
  }, []);

  useEffect(() => { refreshBankData(); }, [refreshBankData]);

  useEffect(() => { if (id) loadBudget(); }, [id]);

  useEffect(() => {
    if (!loadedRef.current) return;
    const saveInterval = setInterval(() => {
        if (document.visibilityState === 'visible') handleSave(true);
    }, 30000);
    return () => clearInterval(saveInterval);
  }, [budgetTitle, currentYear, people, charges, projects, yearlyData, yearlyExpenses, oneTimeIncomes, monthComments, projectComments, lockedMonths, chargeMappings]);

  useEffect(() => {
    if (!id || !loadedRef.current) return;
    const pollInterval = setInterval(async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const res = await budgetAPI.getData(id);
        const remoteData: RawBudgetData = res.data.data;
        if (remoteData.lastUpdated && lastServerUpdate && remoteData.lastUpdated > lastServerUpdate && remoteData.updatedBy !== user?.name) {
          toast({
            title: "Mise à jour disponible",
            description: `Modifié par ${remoteData.updatedBy || 'un membre'}.`,
            variant: "default",
            action: <ToastAction altText="Rafraîchir" onClick={() => loadBudget()}>Rafraîchir</ToastAction>,
          });
        }
      } catch (err) { console.error("Polling error", err); }
    }, 30000);
    return () => clearInterval(pollInterval);
  }, [id, lastServerUpdate, user?.name]);

  useEffect(() => {
    if (!id) return;
    const memberInterval = setInterval(() => { 
        if (document.visibilityState === 'visible') refreshMembersOnly(); 
    }, 60000); 
    return () => clearInterval(memberInterval);
  }, [id]);

  useEffect(() => {
    if (!loadedRef.current) return;
    projects.forEach(project => {
        if (!project.targetAmount || project.targetAmount <= 0) return;
        if (notifiedProjectsRef.current.has(project.id)) return;
        let totalAllocated = (projectCarryOvers[project.id] || 0); // Include carry over
        MONTHS.forEach(month => { totalAllocated += yearlyData[month]?.[project.id] || 0; });
        if (totalAllocated >= project.targetAmount) {
            notifiedProjectsRef.current.add(project.id);
            toast({ title: "🎉 Objectif Atteint !", description: `Projet "${project.label}" financé.`, className: "bg-success/10 border-success/50 text-success-foreground", duration: 5000 });
        }
    });
  }, [projects, yearlyData, projectCarryOvers]);

  useEffect(() => {
      if (charges.length > 0) {
          const newSuggestions: Suggestion[] = [];
          charges.forEach(c => {
              if (c.amount > 30 && (c.label.toLowerCase().includes('mobile') || c.label.toLowerCase().includes('sfr') || c.label.toLowerCase().includes('orange'))) {
                  newSuggestions.push({
                      id: 'sug_mobile_' + c.id, chargeId: c.id, type: 'MOBILE', title: 'Forfait Mobile', message: `Vous payez ${c.amount}€/mois. Économisez en changeant d'opérateur.`, potentialSavings: (c.amount - 10) * 12, actionLink: 'https://www.ariase.com/mobile', canBeContacted: false
                  });
              }
              if (c.amount > 100 && (c.label.toLowerCase().includes('edf') || c.label.toLowerCase().includes('engie'))) {
                  newSuggestions.push({
                      id: 'sug_energy_' + c.id, chargeId: c.id, type: 'ENERGY', title: 'Facture Énergie', message: `Comparez les fournisseurs pour réduire cette facture de ${c.amount}€.`, potentialSavings: (c.amount * 0.15) * 12, actionLink: 'https://www.papernest.com/energie/', canBeContacted: true
                  });
              }
          });
          setSuggestions(newSuggestions);
      }
  }, [charges]);

  // --- ACTIONS ---

  const loadBudget = async () => {
    if (!id) return;
    try {
      const [budgetRes, dataRes] = await Promise.all([budgetAPI.getById(id), budgetAPI.getData(id)]);
      setBudget(budgetRes.data);
      const rawData: ExtendedBudgetData = dataRes.data.data;
      
      globalDataRef.current = rawData;

      if (rawData.lastUpdated) setLastServerUpdate(rawData.lastUpdated);
      else setLastServerUpdate(new Date().toISOString());

      const data = convertOldFormatToNew(rawData);
      
      hydrateStateFromGlobal(currentYear, rawData);

      setBudgetTitle(data.budgetTitle || '');
      setPeople(data.people || []);
      setCharges(data.charges || []);
      setProjects(data.projects || []);
      setChargeMappings(rawData.chargeMappings || []);
      
      loadedRef.current = true;
    } catch (error) { 
        console.error(error);
        toast({ title: "Erreur", description: "Impossible de charger les données.", variant: "destructive" });
    } finally { 
        setLoading(false); 
    }
  };

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
              budgetTitle, currentYear, people, charges, projects, yearlyData, yearlyExpenses, oneTimeIncomes, monthComments, projectComments, lockedMonths
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

  const handleSave = async (silent = false) => {
     if(!id) return;
     if(!silent) setSaving(true);
     
     const currentViewData = { 
         budgetTitle, currentYear, people, charges, projects, yearlyData, yearlyExpenses, 
         oneTimeIncomes, monthComments, projectComments, lockedMonths 
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
     finalPayload.version = '2.3-beta';

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
         if(!silent) toast({title: "Succès", description: "Budget sauvegardé !", variant: "success"}); 
     } 
     catch(e) { if(!silent) toast({title: "Erreur", description: "Échec sauvegarde", variant: "destructive"}); } 
     finally { if(!silent) setSaving(false); }
  };
  
  const refreshMembersOnly = async () => { 
    if (!id) return;
    try {
        const response = await budgetAPI.getById(id);
        setBudget(prev => {
            if (JSON.stringify(prev?.members) !== JSON.stringify(response.data.members)) return response.data;
            return prev;
        });
    } catch (error) { console.error(error); }
  };

  const handleOpenMapper = (charge: Charge) => {
      setChargeToMap(charge);
      setShowMapper(true);
  };

  const handleSaveMappings = (newLinks: MappedTransaction[]) => {
      const others = chargeMappings.filter(m => m.chargeId !== chargeToMap?.id);
      const updated = [...others, ...newLinks];
      setChargeMappings(updated);
      toast({ title: "Mappings mis à jour", description: `${newLinks.length} transactions liées.` });
  };

  // --- 0. SMART CALCULATOR: REALITY OVERRIDE ---
  const today = new Date();
  const currentMonthIndex = today.getMonth();
  const currentRealYear = today.getFullYear();
  let totalGlobalRealized = 0;
  if (currentYear <= currentRealYear) {
      projects.forEach(proj => {
          MONTHS.forEach((month, idx) => {
              if (currentYear < currentRealYear || idx <= currentMonthIndex) {
                  totalGlobalRealized += (yearlyData[month]?.[proj.id] || 0);
              }
          });
      });
  }

  // --- SECTION CHANGE HANDLER (FIX: Added this function) ---
  const handleSectionChange = (section: string) => {
    if (section === 'settings' || section === 'notifications') return;
    const element = document.getElementById(section);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (section === 'overview') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      
      <div className="bg-indigo-600 text-white text-center text-xs py-1 font-medium">
        ✨ Mode Bêta activé : Test de la fonctionnalité "Reality Check" (Vrai Connexion Bancaire)
      </div>

      <BudgetNavbar 
        budgetTitle={budget?.name + " (Bêta)"} 
        userName={user?.name}
        userAvatar={user?.avatar}
        items={BUDGET_NAV_ITEMS}
        onSectionChange={handleSectionChange} // <--- Passed Correctly
        currentSection="overview"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate('/')} className="text-indigo-600 hover:text-indigo-700 mb-4 flex items-center gap-2 font-medium">
          ← Retour
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <BudgetHeader budgetTitle={budgetTitle} onTitleChange={setBudgetTitle} currentYear={currentYear} onYearChange={handleYearChange} />
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {budget?.is_owner && (
                <button onClick={() => setShowInviteModal(true)} className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition">
                  👥 Inviter
                </button>
              )}
            </div>
          </div>
        </div>
        
        {budget && user && ( <div id="members"><MemberManagementSection budget={budget} currentUserId={user.id} onMemberChange={refreshMembersOnly} /></div> )}
        
        <ActionsBar onSave={() => handleSave(false)} saving={saving} />

        <div id="people"><PeopleSection people={people} onPeopleChange={setPeople} /></div>
        
        <div id="charges" className="mt-6">
            <ChargesSection 
                charges={charges} 
                onChargesChange={setCharges} 
                suggestions={suggestions} 
                onLinkTransaction={handleOpenMapper} 
                mappedTotals={mappedTotalsByChargeId} 
            />
        </div>
        
        <div id="reality" className="mt-8">
            <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-indigo-600" /> 
                Reality Check
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Bêta</span>
            </h2>
            <RealityCheck 
                totalRealized={totalGlobalRealized}
                bankBalance={realBankBalance}
                isBankConnected={hasActiveConnection}
                onConnectBank={() => setShowBankManager(true)}
            />
        </div>

        <div id="projects" className="mt-6">
            <ProjectsSection 
                projects={projects} 
                onProjectsChange={setProjects}
                yearlyData={yearlyData}
                currentYear={currentYear}
                projectCarryOvers={projectCarryOvers}
            />
        </div>

        <div className="mt-6">
            <StatsSection people={people} charges={charges} projects={projects} yearlyData={yearlyData} oneTimeIncomes={oneTimeIncomes} currentYear={currentYear} />
        </div>

        <div id="calendar" className="mt-6">
            <MonthlyTable 
                currentYear={currentYear} people={people} charges={charges} projects={projects} yearlyData={yearlyData} yearlyExpenses={yearlyExpenses} oneTimeIncomes={oneTimeIncomes} monthComments={monthComments} projectComments={projectComments} lockedMonths={lockedMonths} 
                onYearlyDataChange={setYearlyData} onYearlyExpensesChange={setYearlyExpenses} onOneTimeIncomesChange={setOneTimeIncomes} onMonthCommentsChange={setMonthComments} onProjectCommentsChange={setProjectComments} onLockedMonthsChange={setLockedMonths}
                
                customChargeTotalCalculator={getMonthlyChargeTotal}
                onYearChange={handleYearChange}
                projectCarryOvers={projectCarryOvers}
            />
        </div>
      </div>

      {showInviteModal && id && (
        <InviteModal budgetId={id} onClose={() => setShowInviteModal(false)} onInvited={() => { refreshMembersOnly();
        toast({ title: "Invitation envoyée", variant: "success" }); }} />
      )}

      <Dialog open={showBankManager} onOpenChange={setShowBankManager}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Gestion des Comptes Bancaires</DialogTitle>
                <DialogDescription>
                    Connectez vos banques et sélectionnez les comptes qui constituent votre épargne (Livret A, LDD, etc.).
                </DialogDescription>
            </DialogHeader>
            <BankConnectionManager budgetId={id!} onUpdate={refreshBankData} />
        </DialogContent>
      </Dialog>

      {chargeToMap && (
          <TransactionMapper 
              isOpen={showMapper}
              onClose={() => setShowMapper(false)}
              charge={chargeToMap}
              currentMappings={chargeMappings}
              onSave={handleSaveMappings}
          />
      )}
    </div>
  );
}