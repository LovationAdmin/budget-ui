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

const BUDGET_NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: "members", label: "Membres", icon: Users },
  { id: "charges", label: "Charges", icon: Receipt },
  { id: "projects", label: "Projets", icon: Target },
  { id: "calendar", label: "Tableau Mensuel", icon: CalendarDays },
];

// ... (Interfaces BudgetMember, BudgetData remain same)

export default function BudgetComplete() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast(); 

  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Core Data State (same as before)
  const [budgetTitle, setBudgetTitle] = useState('');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [people, setPeople] = useState<Person[]>([]);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [yearlyData, setYearlyData] = useState<YearlyData>({});
  const [oneTimeIncomes, setOneTimeIncomes] = useState<OneTimeIncomes>({});
  const [monthComments, setMonthComments] = useState<MonthComments>({});
  const [projectComments, setProjectComments] = useState<ProjectComments>({});
  const [lockedMonths, setLockedMonths] = useState<LockedMonths>({});

  const loadedRef = useRef(false);

  useEffect(() => {
    if (id) loadBudget();
  }, [id]);

  // Auto-Save Logic (Every 30s)
  useEffect(() => {
    if (!loadedRef.current) return;
    const saveInterval = setInterval(() => handleSave(true), 30000);
    return () => clearInterval(saveInterval);
  }, [budgetTitle, currentYear, people, charges, projects, yearlyData, oneTimeIncomes, monthComments, projectComments, lockedMonths]);

  // NOTE: Polling logic removed here because it's now handled globally in NotificationContext

  const loadBudget = async () => {
    if (!id) return;
    
    try {
      const [budgetRes, dataRes] = await Promise.all([
        budgetAPI.getById(id),
        budgetAPI.getData(id)
      ]);

      setBudget(budgetRes.data);
      const rawData: RawBudgetData = dataRes.data.data;
      
      let data: ConvertedBudgetData;
      if (rawData.yearlyData && typeof rawData.yearlyData === 'object') {
        const firstKey = Object.keys(rawData.yearlyData)[0];
        if (firstKey && (rawData.yearlyData as Record<string, { months?: unknown }>)[firstKey]?.months) {
          data = convertOldFormatToNew(rawData);
        } else {
          data = convertOldFormatToNew(rawData);
        }
      } else {
        data = convertOldFormatToNew(rawData);
      }

      setBudgetTitle(data.budgetTitle || '');
      setCurrentYear(data.currentYear || new Date().getFullYear());
      setPeople(data.people || []);
      setCharges(data.charges || []);
      setProjects(data.projects || []);
      setYearlyData(data.yearlyData || {});
      setOneTimeIncomes(data.oneTimeIncomes || {});
      setMonthComments(data.monthComments || {});
      setProjectComments(data.projectComments || {});
      setLockedMonths(data.lockedMonths || {});
      
      loadedRef.current = true;

    } catch (error) {
      console.error('Error loading budget:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (silent = false) => {
    if (!id) return;
    if (!silent) setSaving(true);

    const now = new Date().toISOString();
    
    // Include updatedBy so NotificationContext can detect who made the change
    const budgetData = {
      budgetTitle,
      currentYear,
      people,
      charges,
      projects,
      yearlyData,
      oneTimeIncomes,
      monthComments,
      projectComments,
      lockedMonths,
      lastUpdated: now,
      updatedBy: user?.name, // Important for notifications
      version: '2.1'
    };

    try {
      await budgetAPI.updateData(id, { data: budgetData });
      if (!silent) {
        toast({ title: "Succès", description: "Budget sauvegardé !", variant: "success" });
      }
    } catch (error) {
      console.error('Error saving:', error);
      if (!silent) {
        toast({ title: "Erreur", description: "Échec de la sauvegarde.", variant: "destructive" });
      }
    } finally {
      if (!silent) setSaving(false);
    }
  };

  // ... (handleExport, handleImport unchanged)

  // Navigation / Scroll Logic
  const handleSectionChange = (section: string) => {
    if (section === 'settings' || section === 'notifications') {
        // Now handled by Navbar internal logic for popover, but kept for future settings page
        return;
    }
    const element = document.getElementById(section);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (section === 'overview') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BudgetNavbar items={[]} />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
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
        <button 
          onClick={() => navigate('/')} 
          className="text-primary-600 hover:text-primary-700 mb-4 flex items-center gap-2 font-medium"
        >
          ← Retour aux budgets
        </button>

        {/* ... Rest of the UI (Header, Members, Sections) ... */}
        {/* Same as previous version, just mapped correctly */}
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
                    onMemberChange={loadBudget}
                />
            </div>
        )}

        <ActionsBar 
          onSave={() => handleSave(false)} 
          onExport={handleExport} // Pass handleExport
          onImport={handleImport} // Pass handleImport
          saving={saving} 
        />

        <div id="people">
            <PeopleSection people={people} onPeopleChange={setPeople} />
        </div>
        
        <div id="charges" className="mt-6">
            <ChargesSection charges={charges} onChargesChange={setCharges} />
        </div>
        
        <div id="projects" className="mt-6">
            <ProjectsSection projects={projects} onProjectsChange={setProjects} />
        </div>

        <div className="mt-6">
            <StatsSection 
            people={people} 
            charges={charges} 
            projects={projects} 
            yearlyData={yearlyData} 
            oneTimeIncomes={oneTimeIncomes} 
            />
        </div>

        <div id="calendar" className="mt-6">
            <MonthlyTable 
            currentYear={currentYear} 
            people={people} 
            charges={charges} 
            projects={projects} 
            yearlyData={yearlyData} 
            oneTimeIncomes={oneTimeIncomes} 
            monthComments={monthComments} 
            projectComments={projectComments} 
            lockedMonths={lockedMonths} 
            onYearlyDataChange={setYearlyData} 
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
            loadBudget();
            toast({ title: "Invitation envoyée", description: "Le membre a été invité.", variant: "success" });
          }} 
        />
      )}
    </div>
  );
}