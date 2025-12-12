import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { budgetAPI } from '../services/api';
import { 
  convertOldFormatToNew, 
  convertNewFormatToOld, // Restored import
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

// Components
import BudgetHeader from '../components/budget/BudgetHeader';
import PeopleSection from '../components/budget/PeopleSection';
import ChargesSection from '../components/budget/ChargesSection';
import ProjectsSection from '../components/budget/ProjectsSection';
import MonthlyTable from '../components/budget/MonthlyTable';
import StatsSection from '../components/budget/StatsSection';
import ActionsBar from '../components/budget/ActionsBar';
import MemberManagementSection from '../components/budget/MemberManagementSection';
// NEW COMPONENT
import { RealityCheck } from '../components/budget/RealityCheck'; 

import { LayoutDashboard, Users, Receipt, Target, CalendarDays, FlaskConical } from "lucide-react";
import { ToastAction } from '@/components/ui/toast';

// Updated Nav for Beta
const BUDGET_NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: "members", label: "Membres", icon: Users },
  { id: "charges", label: "Charges", icon: Receipt },
  { id: "reality", label: "Reality Check (Bêta)", icon: FlaskConical }, // Highlighted new feature
  { id: "projects", label: "Projets", icon: Target },
  { id: "calendar", label: "Tableau Mensuel", icon: CalendarDays },
];

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

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

  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [lastServerUpdate, setLastServerUpdate] = useState<string>("");

  // --- Mock Bank State (For Beta Testing) ---
  const [isBankConnected, setIsBankConnected] = useState(false);
  const [mockBankBalance, setMockBankBalance] = useState(0);

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

  const loadedRef = useRef(false);

  // --- NEW LOGIC: Calculate Total Realized Cash ---
  const today = new Date();
  const currentMonthIndex = today.getMonth();
  const currentRealYear = today.getFullYear();

  let totalGlobalRealized = 0;
  // If viewing current year or past year
  if (currentYear <= currentRealYear) {
      projects.forEach(proj => {
          MONTHS.forEach((month, idx) => {
              // Only sum months that have passed
              if (currentYear < currentRealYear || idx <= currentMonthIndex) {
                  totalGlobalRealized += (yearlyData[month]?.[proj.id] || 0);
              }
          });
      });
  }

  // ... Load & Save Effects ...
  useEffect(() => {
    if (id) loadBudget();
  }, [id]);

  useEffect(() => {
    if (!loadedRef.current) return;
    const saveInterval = setInterval(() => handleSave(true), 30000);
    return () => clearInterval(saveInterval);
  }, [budgetTitle, currentYear, people, charges, projects, yearlyData, yearlyExpenses, oneTimeIncomes, monthComments, projectComments, lockedMonths]);

  // 2. Data Polling (Every 15s)
  useEffect(() => {
    if (!id || !loadedRef.current) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await budgetAPI.getData(id);
        const remoteData: RawBudgetData = res.data.data;
        
        if (
            remoteData.lastUpdated && 
            lastServerUpdate && 
            remoteData.lastUpdated > lastServerUpdate && 
            remoteData.updatedBy !== user?.name 
        ) {
          toast({
            title: "Mise à jour disponible",
            description: `Modifié par ${remoteData.updatedBy || 'un membre'}.`,
            variant: "default",
            action: (
              <ToastAction altText="Rafraîchir" onClick={() => loadBudget()}>
                Rafraîchir
              </ToastAction>
            ),
          });
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 15000);

    return () => clearInterval(pollInterval);
  }, [id, lastServerUpdate, user?.name]);

  // 3. Member List Polling
  useEffect(() => {
    if (!id) return;
    const memberInterval = setInterval(() => {
        refreshMembersOnly();
    }, 5000); 
    return () => clearInterval(memberInterval);
  }, [id]);

  const loadBudget = async () => {
    if (!id) return;
    try {
      const [budgetRes, dataRes] = await Promise.all([
        budgetAPI.getById(id),
        budgetAPI.getData(id)
      ]);
      setBudget(budgetRes.data);
      const rawData: RawBudgetData = dataRes.data.data;
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
      loadedRef.current = true;
    } catch (error) { 
        console.error(error); 
        toast({ title: "Erreur", description: "Impossible de charger les données.", variant: "destructive" });
    } finally { 
        setLoading(false); 
    }
  };

  const handleSave = async (silent = false) => {
     if(!id) return;
     if(!silent) setSaving(true);
     const budgetData = { budgetTitle, currentYear, people, charges, projects, yearlyData, yearlyExpenses, oneTimeIncomes, monthComments, projectComments, lockedMonths, lastUpdated: new Date().toISOString(), updatedBy: user?.name, version: '2.2-beta' };
     try { 
         await budgetAPI.updateData(id, { data: budgetData }); 
         setLastServerUpdate(budgetData.lastUpdated);
         if(!silent) toast({title: "Succès", description: "Budget sauvegardé !", variant: "success"}); 
     } 
     catch(e) { console.error(e); if(!silent) toast({title: "Erreur", description: "Échec sauvegarde", variant: "destructive"}); } 
     finally { if(!silent) setSaving(false); }
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
    } catch (error) { console.error(error); }
  };

  // --- RESTORED REAL LOGIC FROM MAIN FILE ---
  const handleExport = (formatType: 'new' | 'old' = 'new') => {
    let dataToExport;
    const commonData = {
      budgetTitle, currentYear, people, charges, projects, yearlyData, yearlyExpenses, oneTimeIncomes, monthComments, projectComments, lockedMonths
    };

    if (formatType === 'old') {
      dataToExport = convertNewFormatToOld(commonData);
    } else {
      dataToExport = { ...commonData, exportDate: new Date().toISOString(), version: '2.2-beta' };
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget_${budgetTitle || 'export'}_${new Date().toISOString().split('T')[0]}_beta.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Export terminé", description: "Fichier téléchargé.", variant: "default" });
  };

  const handleImport = (rawData: RawBudgetData) => {
    if (confirm('Importer ces données ? Cela remplacera le budget actuel.')) {
      const data = convertOldFormatToNew(rawData);
      setBudgetTitle(data.budgetTitle || '');
      setCurrentYear(data.currentYear || new Date().getFullYear());
      setPeople(data.people || []);
      setCharges(data.charges || []);
      setProjects(data.projects || []);
      setYearlyData(data.yearlyData);
      setYearlyExpenses(data.yearlyExpenses);
      setOneTimeIncomes(data.oneTimeIncomes);
      setMonthComments(data.monthComments);
      setProjectComments(data.projectComments);
      setLockedMonths(data.lockedMonths);
      toast({ title: "Import réussi", description: "Données mises à jour.", variant: "success" });
    }
  };

  const handleSectionChange = (section: string) => {
    const element = document.getElementById(section);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else if (section === 'overview') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- BETA HANDLER: Connect Bank (Mock) ---
  const handleConnectBank = () => {
      if(confirm("BÊTA: Simuler une connexion bancaire ?\n\nCela va générer un solde aléatoire proche de votre montant théorique pour tester l'interface.")) {
          setIsBankConnected(true);
          // Simulate either a match or a slight discrepancy (50/50 chance)
          const randomDiscrepancy = Math.random() > 0.5 ? 0 : -500; 
          setMockBankBalance(Math.max(0, totalGlobalRealized + randomDiscrepancy));
          toast({ title: "Banque Connectée (Simulation)", description: "Récupération des soldes...", variant: "default" });
      }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      
      {/* BETA BANNER */}
      <div className="bg-indigo-600 text-white text-center text-xs py-1 font-medium">
        ✨ Mode Bêta activé : Test de la fonctionnalité "Reality Check"
      </div>

      <BudgetNavbar 
        budgetTitle={budget?.name + " (Bêta)"} 
        userName={user?.name}
        userAvatar={user?.avatar}
        items={BUDGET_NAV_ITEMS}
        onSectionChange={handleSectionChange}
        currentSection="overview"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate('/')} className="text-indigo-600 hover:text-indigo-700 mb-4 flex items-center gap-2 font-medium">
          ← Retour
        </button>

        {/* ... Header & Actions ... */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <BudgetHeader budgetTitle={budgetTitle} onTitleChange={setBudgetTitle} currentYear={currentYear} onYearChange={setCurrentYear} />
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {budget?.is_owner && (
                <button 
                  onClick={() => setShowInviteModal(true)} 
                  className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition"
                >
                  👥 Inviter
                </button>
              )}
            </div>
          </div>
        </div>
        
        {budget && user && ( <div id="members"><MemberManagementSection budget={budget} currentUserId={user.id} onMemberChange={refreshMembersOnly} /></div> )}
        <ActionsBar onSave={() => handleSave(false)} onExport={handleExport} onImport={handleImport} saving={saving} />

        <div id="people"><PeopleSection people={people} onPeopleChange={setPeople} /></div>
        <div id="charges" className="mt-6"><ChargesSection charges={charges} onChargesChange={setCharges} /></div>
        
        {/* --- NEW SECTION: REALITY CHECK --- */}
        <div id="reality" className="mt-8">
            <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-indigo-600" /> 
                Reality Check
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Bêta</span>
            </h2>
            <RealityCheck 
                totalRealized={totalGlobalRealized}
                bankBalance={mockBankBalance}
                isBankConnected={isBankConnected}
                onConnectBank={handleConnectBank}
            />
        </div>

        <div id="projects" className="mt-6">
            <ProjectsSection 
                projects={projects} 
                onProjectsChange={setProjects}
                yearlyData={yearlyData}
                currentYear={currentYear}
            />
        </div>

        <div className="mt-6">
            <StatsSection people={people} charges={charges} projects={projects} yearlyData={yearlyData} oneTimeIncomes={oneTimeIncomes} currentYear={currentYear} />
        </div>

        <div id="calendar" className="mt-6">
            <MonthlyTable 
                currentYear={currentYear} people={people} charges={charges} projects={projects} yearlyData={yearlyData} yearlyExpenses={yearlyExpenses} oneTimeIncomes={oneTimeIncomes} monthComments={monthComments} projectComments={projectComments} lockedMonths={lockedMonths} 
                onYearlyDataChange={setYearlyData} onYearlyExpensesChange={setYearlyExpenses} onOneTimeIncomesChange={setOneTimeIncomes} onMonthCommentsChange={setMonthComments} onProjectCommentsChange={setProjectComments} onLockedMonthsChange={setLockedMonths} 
            />
        </div>
      </div>

      {showInviteModal && id && (
        <InviteModal 
          budgetId={id} 
          onClose={() => setShowInviteModal(false)} 
          onInvited={() => {
            refreshMembersOnly();
            toast({ title: "Invitation envoyée", description: "Le membre a été invité.", variant: "success" });
          }} 
        />
      )}
    </div>
  );
}