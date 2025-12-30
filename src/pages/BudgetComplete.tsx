// src/pages/BudgetComplete.tsx
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { budgetAPI } from '../services/api';
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
import { LayoutDashboard, Users, Receipt, Target, CalendarDays } from "lucide-react";
import { useTutorial } from '../contexts/TutorialContext';
import EnhancedSuggestions from '@/components/budget/EnhancedSuggestions';

const BUDGET_NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: "members", label: "Membres", icon: Users },
  { id: "charges", label: "Charges", icon: Receipt },
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

export default function BudgetComplete() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast(); 
  const { hasSeenTutorial, startTutorial } = useTutorial();
  const { connectToBudget, disconnectFromBudget } = useNotifications();

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

  const loadedRef = useRef(false);
  const notifiedProjectsRef = useRef<Set<string>>(new Set());

  // ============================================================================
  // 🚀 OPTIMISATION : useMemo pour projectCarryOvers
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
  }, [currentYear, projects]);

  // ============================================================================
  // 🚀 OPTIMISATION : useMemo pour householdSize
  // ============================================================================
  const householdSize = useMemo(() => {
    return people.length > 0 ? people.length : 1;
  }, [people]);

  // ============================================================================
  // 🚀 OPTIMISATION : WebSocket Connection
  // ============================================================================
  useEffect(() => {
    if (budget) {
      connectToBudget(budget.id, budget.name);
    }
    return () => disconnectFromBudget();
  }, [budget, connectToBudget, disconnectFromBudget]);

  // ============================================================================
  // Tutorial Effect
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
  // Load Budget Effect
  // ============================================================================
  useEffect(() => { 
    if (id) loadBudget(); 
  }, [id]);

  // ============================================================================
  // Auto-save Effect
  // ============================================================================
  useEffect(() => {
    if (!loadedRef.current) return;
    const saveInterval = setInterval(() => {
      if (document.visibilityState === 'visible') handleSave(true);
    }, 30000);
    return () => clearInterval(saveInterval);
  }, [budgetTitle, currentYear, people, charges, projects, yearlyData, yearlyExpenses, oneTimeIncomes, monthComments, projectComments, lockedMonths]);

  // ============================================================================
  // Members Refresh Effect
  // ============================================================================
  useEffect(() => {
    if (!id) return;
    const memberInterval = setInterval(() => {
      if (document.visibilityState === 'visible') refreshMembersOnly();
    }, 60000); 
    return () => clearInterval(memberInterval);
  }, [id]);

  // ============================================================================
  // Project Target Notifications Effect
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
  // 🚀 OPTIMISATION : useCallback pour loadBudget
  // ============================================================================
  const loadBudget = useCallback(async () => {
    if (!id) return;
    try {
      const [budgetRes, dataRes] = await Promise.all([
        budgetAPI.getById(id), 
        budgetAPI.getData(id)
      ]);
      setBudget(budgetRes.data);
      const rawData: RawBudgetData = dataRes.data.data;
      globalDataRef.current = rawData;
      if (rawData.lastUpdated) setLastServerUpdate(rawData.lastUpdated);
      else setLastServerUpdate(new Date().toISOString());
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
    } catch (error) {
      console.error('Error loading budget:', error);
      toast({ 
        title: "Erreur", 
        description: "Impossible de charger les données.", 
        variant: "destructive" 
      });
    } finally { 
      setLoading(false); 
    }
  }, [id, toast]);

  // ============================================================================
  // 🚀 OPTIMISATION : useCallback pour hydrateStateFromGlobal
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

  // ============================================================================
  // 🚀 OPTIMISATION : useCallback pour handleYearChange
  // ============================================================================
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
  // 🚀 OPTIMISATION : useCallback pour refreshMembersOnly
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

  // ============================================================================
  // 🚀 OPTIMISATION : useCallback pour handleSave
  // ============================================================================

  const handleSave = useCallback(async (silent = false) => {
    if (!id) return;
    if (!silent) setSaving(true);

    // 1. Capture the CURRENT state of the UI (what the user sees right now)
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

    // 2. Convert this "view state" into the "storage format" (YearlyData map)
    const formattedCurrent = convertNewFormatToOld(currentViewData as any);

    // 3. Merge this into the Global Data Ref (to preserve other years)
    // We clone the ref to avoid mutating it directly before we are sure
    const finalPayload = JSON.parse(JSON.stringify(globalDataRef.current || {}));

    // Ensure basic fields are present
    finalPayload.budgetTitle = budgetTitle;
    finalPayload.people = people;
    finalPayload.charges = charges;
    finalPayload.projects = projects;
    finalPayload.lastUpdated = new Date().toISOString();
    finalPayload.updatedBy = user?.name;
    finalPayload.version = '2.3'; // Increment version to force update if needed

    // Initialize containers if missing
    if (!finalPayload.yearlyData) finalPayload.yearlyData = {};
    if (!finalPayload.oneTimeIncomes) finalPayload.oneTimeIncomes = {};

    // 4. CRITICAL: Explicitly save the CURRENT YEAR data into the global payload
    // We take the data we just formatted and put it into the [currentYear] slot
    const sourceYearlyData = formattedCurrent.yearlyData || {};
    const sourceOneTime = formattedCurrent.oneTimeIncomes || {};

    if (sourceYearlyData[currentYear]) {
        finalPayload.yearlyData[currentYear] = sourceYearlyData[currentYear];
    }
    if (sourceOneTime[currentYear]) {
        finalPayload.oneTimeIncomes[currentYear] = sourceOneTime[currentYear];
    }

    try {
      // 5. Send to Backend
      await budgetAPI.updateData(id, { data: finalPayload });
      
      // 6. Update local refs to match what we just saved (sync source of truth)
      setLastServerUpdate(finalPayload.lastUpdated);
      globalDataRef.current = finalPayload;

      if (!silent) {
        toast({ 
          title: "Succès", 
          description: "Budget sauvegardé !", 
          variant: "default" 
        });
      }
    } catch (error) {
      console.error('Error saving:', error);
      if (!silent) {
        toast({ 
          title: "Erreur", 
          description: "Échec de la sauvegarde.", 
          variant: "destructive" 
        });
      }
    } finally { 
      if (!silent) setSaving(false); 
    }
  }, [id, budgetTitle, currentYear, people, charges, projects, yearlyData, yearlyExpenses, oneTimeIncomes, monthComments, projectComments, lockedMonths, user?.name, toast]);

  // ============================================================================
  // 🚀 OPTIMISATION : useCallback pour handleSectionChange
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

  // ============================================================================
  // 🚀 OPTIMISATION : useCallback pour autres handlers
  // ============================================================================
  const handleShowInviteModal = useCallback(() => {
    setShowInviteModal(true);
  }, []);

  const handleCloseInviteModal = useCallback(() => {
    setShowInviteModal(false);
  }, []);

  const handleNavigateBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleInvited = useCallback(() => {
    refreshMembersOnly();
    toast({ 
      title: "Invitation envoyée", 
      variant: "default" 
    });
  }, [refreshMembersOnly, toast]);

  // ============================================================================
  // Loading State
  // ============================================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex items-center justify-center">
        <BudgetNavbar items={[]} />
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
        <button 
          onClick={handleNavigateBack} 
          className="text-primary-600 hover:text-primary-700 mb-4 flex items-center gap-2 font-medium"
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
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {budget?.is_owner && (
                <button 
                  onClick={handleShowInviteModal} 
                  className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition"
                >
                  👤 Inviter
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

        <ActionsBar onSave={() => handleSave(false)} saving={saving} />

        <div id="people">
          <PeopleSection people={people} onPeopleChange={setPeople} />
        </div>
        
        <div id="charges" className="mt-6">
          <ChargesSection charges={charges} onChargesChange={setCharges} />
        </div>
        
        <div id="suggestions" className="mt-6">
          <EnhancedSuggestions 
            budgetId={id!} 
            charges={charges} 
            memberCount={householdSize} 
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
            onYearChange={handleYearChange} 
            projectCarryOvers={projectCarryOvers} 
          />
        </div>

        {/* Removed id="overview" from here so the "Vue d'ensemble" navbar button scrolls to top */}
        <div className="mt-6">
          <StatsSection 
            people={people} 
            charges={charges} 
            projects={projects} 
            yearlyData={yearlyData} 
            oneTimeIncomes={oneTimeIncomes} 
            currentYear={currentYear} 
          />
        </div>
      </div>

      {showInviteModal && id && (
        <InviteModal 
          budgetId={id} 
          onClose={handleCloseInviteModal} 
          onInvited={handleInvited} 
        />
      )}
    </div>
  );
}