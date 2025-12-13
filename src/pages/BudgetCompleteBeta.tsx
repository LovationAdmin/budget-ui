import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { budgetAPI } from '../services/api';
import { 
  convertOldFormatToNew, 
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
import { useTutorial } from '../contexts/TutorialContext'; // <--- AJOUT DE L'IMPORT MANQUANT

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
  // CORRECTION ICI : Récupération des variables du contexte
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

  // --- 0. SMART CALCULATOR: REALITY OVERRIDE ---
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

  // --- 1. EFFECTS & LOGIC ---

  // Auto Tutorial
  useEffect(() => {
    if (!loading && !hasSeenTutorial && loadedRef.current) {
       const timer = setTimeout(() => startTutorial(), 1500); 
       return () => clearTimeout(timer);
    }
  }, [loading, hasSeenTutorial, startTutorial]);

  // Fetch Bank Data
  const refreshBankData = useCallback(async () => {
      try {
          const res = await api.get('/banking/connections');
          setRealBankBalance(res.data.total_real_cash || 0);
          const conns = res.data.connections || [];
          setHasActiveConnection(conns.length > 0);
      } catch (error) { console.error("Failed to refresh bank data", error); }
  }, []);

  useEffect(() => { refreshBankData(); }, [refreshBankData]);

  // Load Budget
  useEffect(() => { if (id) loadBudget(); }, [id]);

  // Smart Auto-Save (30s)
  useEffect(() => {
    if (!loadedRef.current) return;
    const saveInterval = setInterval(() => {
        if (document.visibilityState === 'visible') handleSave(true);
    }, 30000);
    return () => clearInterval(saveInterval);
  }, [budgetTitle, currentYear, people, charges, projects, yearlyData, yearlyExpenses, oneTimeIncomes, monthComments, projectComments, lockedMonths, chargeMappings]);

  // Smart Data Polling (30s)
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

  // Smart Member Polling (60s)
  useEffect(() => {
    if (!id) return;
    const memberInterval = setInterval(() => { 
        if (document.visibilityState === 'visible') refreshMembersOnly(); 
    }, 60000); 
    return () => clearInterval(memberInterval);
  }, [id]);

  // Achievement Checker
  useEffect(() => {
    if (!loadedRef.current) return;
    projects.forEach(project => {
        if (!project.targetAmount || project.targetAmount <= 0) return;
        if (notifiedProjectsRef.current.has(project.id)) return;
        let totalAllocated = 0;
        MONTHS.forEach(month => { totalAllocated += yearlyData[month]?.[project.id] || 0; });
        if (totalAllocated >= project.targetAmount) {
            notifiedProjectsRef.current.add(project.id);
            toast({ title: "🎉 Objectif Atteint !", description: `Projet "${project.label}" financé.`, className: "bg-success/10 border-success/50 text-success-foreground", duration: 5000 });
        }
    });
  }, [projects, yearlyData]);

  // Affiliation Intelligente
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
      if (rawData.lastUpdated) setLastServerUpdate(rawData.lastUpdated);
      else setLastServerUpdate(new Date().toISOString());

      const data = convertOldFormatToNew(rawData);
      setBudgetTitle(data.budgetTitle || '');
      setCurrentYear(data.currentYear || new Date().getFullYear());
      setPeople(data.people || []);
      setCharges(data.charges || []);
      setProjects(data.projects || []);
      setYearlyData(data.yearlyData || {});
      setYearlyExpenses(data.yearlyExpenses || {}); 
      setOneTimeIncomes(data.oneTimeIncomes || {});
      setMonthComments(data.monthComments || {});
      setProjectComments(data.projectComments || {});
      setLockedMonths(data.lockedMonths || {});
      
      setChargeMappings(rawData.chargeMappings || []);
      loadedRef.current = true;
    } catch (error) { 
        console.error(error);
        toast({ title: "Erreur", description: "Impossible de charger les données.", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleSave = async (silent = false) => {
     if(!id) return;
     if(!silent) setSaving(true);
     const budgetData = { 
         budgetTitle, currentYear, people, charges, projects, yearlyData, yearlyExpenses, oneTimeIncomes, monthComments, projectComments, lockedMonths, 
         chargeMappings, // Save mappings
         lastUpdated: new Date().toISOString(), updatedBy: user?.name, version: '2.3-beta' 
     };
     try { 
         await budgetAPI.updateData(id, { data: budgetData }); 
         setLastServerUpdate(budgetData.lastUpdated);
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

  // Reality Check realized calculation
  let totalGlobalRealized = 0;
  const today = new Date();
  const currentMonthIndex = today.getMonth();
  const currentRealYear = today.getFullYear();
  if (currentYear <= currentRealYear) {
      projects.forEach(proj => {
          MONTHS.forEach((month, idx) => {
              if (currentYear < currentRealYear || idx <= currentMonthIndex) {
                  totalGlobalRealized += (yearlyData[month]?.[proj.id] || 0);
              }
          });
      });
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="bg-indigo-600 text-white text-center text-xs py-1 font-medium">✨ Mode Bêta activé : Test de la fonctionnalité "Reality Check"</div>
      
      <BudgetNavbar budgetTitle={budget?.name + " (Bêta)"} userName={user?.name} userAvatar={user?.avatar} items={BUDGET_NAV_ITEMS} onSectionChange={() => {}} currentSection="overview" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <BudgetHeader budgetTitle={budgetTitle} onTitleChange={setBudgetTitle} currentYear={currentYear} onYearChange={setCurrentYear} />
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {budget?.is_owner && (<button onClick={() => setShowInviteModal(true)} className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition">👥 Inviter</button>)}
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
            <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2"><FlaskConical className="h-5 w-5 text-indigo-600" /> Reality Check <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Bêta</span></h2>
            <RealityCheck totalRealized={totalGlobalRealized} bankBalance={realBankBalance} isBankConnected={hasActiveConnection} onConnectBank={() => setShowBankManager(true)} />
        </div>

        <div id="projects" className="mt-6"><ProjectsSection projects={projects} onProjectsChange={setProjects} yearlyData={yearlyData} currentYear={currentYear} /></div>
        <div className="mt-6"><StatsSection people={people} charges={charges} projects={projects} yearlyData={yearlyData} oneTimeIncomes={oneTimeIncomes} currentYear={currentYear} /></div>

        <div id="calendar" className="mt-6">
            <MonthlyTable 
                currentYear={currentYear} people={people} charges={charges} projects={projects} yearlyData={yearlyData} yearlyExpenses={yearlyExpenses} oneTimeIncomes={oneTimeIncomes} monthComments={monthComments} projectComments={projectComments} lockedMonths={lockedMonths} 
                onYearlyDataChange={setYearlyData} onYearlyExpensesChange={setYearlyExpenses} onOneTimeIncomesChange={setOneTimeIncomes} onMonthCommentsChange={setMonthComments} onProjectCommentsChange={setProjectComments} onLockedMonthsChange={setLockedMonths}
                customChargeTotalCalculator={getMonthlyChargeTotal} // PASS SMART CALCULATOR
            />
        </div>
      </div>

      {showInviteModal && id && <InviteModal budgetId={id} onClose={() => setShowInviteModal(false)} onInvited={() => { refreshMembersOnly(); toast({ title: "Invitation envoyée", variant: "success" }); }} />}
      
      <Dialog open={showBankManager} onOpenChange={setShowBankManager}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Gestion des Comptes Bancaires</DialogTitle><DialogDescription>Connectez vos banques et sélectionnez les comptes qui constituent votre épargne.</DialogDescription></DialogHeader>
            <BankConnectionManager onUpdate={refreshBankData} />
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