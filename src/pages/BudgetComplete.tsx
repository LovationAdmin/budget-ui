import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { budgetAPI } from '../services/api';
import { 
  convertOldFormatToNew, 
  convertNewFormatToOld,
  type RawBudgetData,
  type ConvertedBudgetData,
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
import ChargesSection from '../components/budget/ChargesSection';
import ProjectsSection from '../components/budget/ProjectsSection';
import MonthlyTable from '../components/budget/MonthlyTable';
import StatsSection from '../components/budget/StatsSection';
import ActionsBar from '../components/budget/ActionsBar';
import MemberManagementSection from '../components/budget/MemberManagementSection';
import { LayoutDashboard, Users, Receipt, Target, CalendarDays } from "lucide-react";
import { ToastAction } from '@/components/ui/toast';

const BUDGET_NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: "members", label: "Membres", icon: Users },
  { id: "charges", label: "Charges", icon: Receipt },
  { id: "projects", label: "Projets", icon: Target },
  { id: "calendar", label: "Tableau Mensuel", icon: CalendarDays },
];

interface BudgetMember {
  id: string;
  user: { id: string; name: string; email: string };
  role: 'owner' | 'member';
}

interface BudgetData {
  id: string;
  name: string;
  is_owner: boolean;
  members: BudgetMember[];
}

export default function BudgetComplete() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast(); 

  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [lastServerUpdate, setLastServerUpdate] = useState<string>("");

  // Core Data
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

  useEffect(() => {
    if (id) loadBudget();
  }, [id]);

  // 1. Data Auto-Save (30s)
  useEffect(() => {
    if (!loadedRef.current) return;
    const saveInterval = setInterval(() => handleSave(true), 30000);
    return () => clearInterval(saveInterval);
  }, [budgetTitle, currentYear, people, charges, projects, yearlyData, yearlyExpenses, oneTimeIncomes, monthComments, projectComments, lockedMonths]);

  // 2. Data Polling (15s) - Checks for changes by others
  useEffect(() => {
    if (!id || !loadedRef.current) return;
    const pollInterval = setInterval(async () => {
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
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 15000);
    return () => clearInterval(pollInterval);
  }, [id, lastServerUpdate, user?.name]);

  // 3. Member List Polling (5s) - Keeps the member list "Live"
  useEffect(() => {
    if (!id) return;
    const memberInterval = setInterval(() => {
        refreshMembersOnly();
    }, 5000); // Check every 5 seconds
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
      console.error('Error loading budget:', error);
      toast({ title: "Erreur", description: "Impossible de charger les données.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Lightweight refresh for Members only
  const refreshMembersOnly = async () => {
    if (!id) return;
    try {
        const response = await budgetAPI.getById(id);
        setBudget(prev => {
            // Only force update if the list length or content changed
            if (JSON.stringify(prev?.members) !== JSON.stringify(response.data.members)) {
                return response.data;
            }
            return prev;
        });
    } catch (error) {
        console.error("Failed to refresh members", error);
    }
  };

  const handleSave = async (silent = false) => {
    if (!id) return;
    if (!silent) setSaving(true);

    const now = new Date().toISOString();
    const budgetData = {
      budgetTitle, currentYear, people, charges, projects, yearlyData, yearlyExpenses, oneTimeIncomes, monthComments, projectComments, lockedMonths,
      lastUpdated: now, updatedBy: user?.name, version: '2.2'
    };

    try {
      await budgetAPI.updateData(id, { data: budgetData });
      setLastServerUpdate(now);
      if (!silent) toast({ title: "Succès", description: "Budget sauvegardé !", variant: "success" });
    } catch (error) {
      if (!silent) toast({ title: "Erreur", description: "Échec de la sauvegarde.", variant: "destructive" });
    } finally {
      if (!silent) setSaving(false);
    }
  };

  const handleExport = (formatType: 'new' | 'old' = 'new') => {
    const commonData = { budgetTitle, currentYear, people, charges, projects, yearlyData, yearlyExpenses, oneTimeIncomes, monthComments, projectComments, lockedMonths };
    const dataToExport = formatType === 'old' ? convertNewFormatToOld(commonData) : { ...commonData, exportDate: new Date().toISOString(), version: '2.2' };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget_${budgetTitle || 'export'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Export terminé", description: "Fichier téléchargé.", variant: "default" });
  };

  const handleImport = (rawData: RawBudgetData) => {
    if (confirm('Importer ces données ?')) {
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
    if (section === 'settings' || section === 'notifications') return;
    const element = document.getElementById(section);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else if (section === 'overview') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50">
      <BudgetNavbar 
        budgetTitle={budget?.name} 
        userName={user?.name}
        items={BUDGET_NAV_ITEMS}
        onSectionChange={handleSectionChange}
        currentSection="overview"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate('/')} className="text-primary-600 hover:text-primary-700 mb-4 flex items-center gap-2 font-medium">
          ← Retour aux budgets
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <BudgetHeader 
            budgetTitle={budgetTitle} 
            onTitleChange={setBudgetTitle} 
            currentYear={currentYear} 
            onYearChange={setCurrentYear} 
          />
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
        
        {budget && user && (
            <div id="members">
                <MemberManagementSection 
                    budget={budget}
                    currentUserId={user.id} 
                    onMemberChange={refreshMembersOnly} 
                />
            </div>
        )}

        <ActionsBar onSave={() => handleSave(false)} onExport={handleExport} onImport={handleImport} saving={saving} />

        <div id="people"><PeopleSection people={people} onPeopleChange={setPeople} /></div>
        <div id="charges" className="mt-6"><ChargesSection charges={charges} onChargesChange={setCharges} /></div>
        <div id="projects" className="mt-6"><ProjectsSection projects={projects} onProjectsChange={setProjects} /></div>

        <div className="mt-6">
            <StatsSection people={people} charges={charges} projects={projects} yearlyData={yearlyData} oneTimeIncomes={oneTimeIncomes} />
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
                onYearlyDataChange={setYearlyData} 
                onYearlyExpensesChange={setYearlyExpenses}
                onOneTimeIncomesChange={setOneTimeIncomes} 
                onMonthCommentsChange={setMonthComments} 
                onProjectCommentsChange={setProjectComments} 
                onLockedMonthsChange={setLockedMonths} 
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