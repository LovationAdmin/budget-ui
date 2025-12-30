// src/pages/BudgetComplete.tsx
// VERSION COMPLÈTE AVEC AUTO-SAVE INTÉGRÉ

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
  // PROJECT CARRY OVERS CALCULATION
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
  // HOUSEHOLD SIZE CALCULATION
  // ============================================================================
  const householdSize = useMemo(() => {
    return people.length > 0 ? people.length : 1;
  }, [people]);

  // ============================================================================
  // AUTO-SAVE HOOK
  // ============================================================================
  const performSave = useCallback(async () => {
    if (!id) return;
    
    console.log('💾 [AutoSave] Sauvegarde du budget:', id);

    // 1. Capture current state
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

    // 2. Convert to storage format
    const formattedCurrent = convertNewFormatToOld(currentViewData as any);

    // 3. Merge with global data
    const finalPayload = JSON.parse(JSON.stringify(globalDataRef.current || {}));
    finalPayload.budgetTitle = budgetTitle;
    finalPayload.people = people;
    finalPayload.charges = charges;
    finalPayload.projects = projects;
    finalPayload.lastUpdated = new Date().toISOString();
    finalPayload.updatedBy = user?.name;
    finalPayload.version = '2.3';

    if (!finalPayload.yearlyData) finalPayload.yearlyData = {};
    if (!finalPayload.oneTimeIncomes) finalPayload.oneTimeIncomes = {};

    // 4. Save current year explicitly
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
      console.log('✅ [AutoSave] Budget sauvegardé avec succès');
    } catch (error) {
      console.error('❌ [AutoSave] Erreur de sauvegarde:', error);
      throw error;
    }
  }, [id, budgetTitle, currentYear, people, charges, projects, yearlyData, yearlyExpenses, oneTimeIncomes, monthComments, projectComments, lockedMonths, user?.name]);

  const {
    hasUnsavedChanges,
    isSaving,
    markAsModified,
    saveNow,
  } = useAutoSave({
    onSave: performSave,
    delay: 2000,
    enabled: loadedRef.current,
  });

  // ============================================================================
  // WEBSOCKET CONNECTION
  // ============================================================================
  useEffect(() => {
    if (budget) {
      connectToBudget(budget.id, budget.name);
    }
    return () => disconnectFromBudget();
  }, [budget, connectToBudget, disconnectFromBudget]);

  // ============================================================================
  // TUTORIAL EFFECT
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
  // LOAD BUDGET
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

  useEffect(() => { 
    if (id) loadBudget(); 
  }, [id]);

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
  // PROJECT TARGET NOTIFICATIONS
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
  // YEAR CHANGE HANDLER
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
  // SAVE HANDLER
  // ============================================================================
  const handleSave = async () => {
    console.log('💾 [BudgetComplete] Sauvegarde manuelle déclenchée');
    setSaving(true);
    try {
      await saveNow();
      toast({ 
        title: "Succès", 
        description: "Budget sauvegardé !", 
        variant: "default" 
      });
    } catch (error) {
      toast({ 
        title: "Erreur", 
        description: "Échec de la sauvegarde.", 
        variant: "destructive" 
      });
    } finally {
      setSaving(false);
    }
  };

  // ============================================================================
  // DATA CHANGE HANDLERS WITH AUTO-SAVE TRIGGER
  // ============================================================================
  const handleDataChange = useCallback((newData: any) => {
    console.log('📝 [BudgetComplete] Données modifiées, marquage pour auto-save');
    markAsModified();
  }, [markAsModified]);

  const handleBudgetTitleChange = (title: string) => {
    setBudgetTitle(title);
    handleDataChange(null);
  };

  const handlePeopleChange = (newPeople: Person[]) => {
    setPeople(newPeople);
    handleDataChange(null);
  };

  const handleChargesChange = (newCharges: Charge[]) => {
    setCharges(newCharges);
    handleDataChange(null);
  };

  const handleProjectsChange = (newProjects: Project[]) => {
    setProjects(newProjects);
    handleDataChange(null);
  };

  const handleYearlyDataChange = (newData: YearlyData) => {
    setYearlyData(newData);
    handleDataChange(null);
  };

  const handleYearlyExpensesChange = (newData: YearlyData) => {
    setYearlyExpenses(newData);
    handleDataChange(null);
  };

  const handleOneTimeIncomesChange = (newData: OneTimeIncomes) => {
    setOneTimeIncomes(newData);
    handleDataChange(null);
  };

  const handleMonthCommentsChange = (newData: MonthComments) => {
    setMonthComments(newData);
    handleDataChange(null);
  };

  const handleProjectCommentsChange = (newData: ProjectComments) => {
    setProjectComments(newData);
    handleDataChange(null);
  };

  const handleLockedMonthsChange = (newData: LockedMonths) => {
    setLockedMonths(newData);
    handleDataChange(null);
  };

  // ============================================================================
  // NAVIGATION HANDLERS
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
    navigate('/');
  }, [navigate]);

  const handleInvitationSent = useCallback(async () => {
    await refreshMembersOnly();
  }, [refreshMembersOnly]);

  // ============================================================================
  // RENDER
  // ============================================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Budget introuvable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <BudgetNavbar 
        items={BUDGET_NAV_ITEMS}
        onSectionChange={handleSectionChange}
        currentSection="overview"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BudgetHeader
          budgetTitle={budgetTitle}
          onBudgetTitleChange={handleBudgetTitleChange}
          onNavigateBack={handleNavigateBack}
          onShowInviteModal={handleShowInviteModal}
          isOwner={budget.is_owner}
          hasUnsavedChanges={hasUnsavedChanges}
          isSaving={isSaving || saving}
        />

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

        <div id="overview" className="mb-8">
          <StatsSection
            people={people}
            charges={charges}
            projects={projects}
            yearlyData={yearlyData}
            yearlyExpenses={yearlyExpenses}
            oneTimeIncomes={oneTimeIncomes}
            projectCarryOvers={projectCarryOvers}
            currentYear={currentYear}
          />
        </div>

        <div id="members" className="mb-8">
          <MemberManagementSection
            budget={budget}
            onRefresh={refreshMembersOnly}
          />
        </div>

        <div id="charges" className="mb-8">
          <EnhancedSuggestions
            budgetId={budget.id}
            charges={charges}
            householdSize={householdSize}
          />
          
          <ChargesSection
            people={people}
            charges={charges}
            onChargesChange={handleChargesChange}
          />
        </div>

        <div id="projects" className="mb-8">
          <ProjectsSection
            projects={projects}
            onProjectsChange={handleProjectsChange}
            yearlyData={yearlyData}
            projectCarryOvers={projectCarryOvers}
          />
        </div>

        <div id="calendar" className="mb-8">
          <MonthlyTable
            people={people}
            charges={charges}
            projects={projects}
            yearlyData={yearlyData}
            yearlyExpenses={yearlyExpenses}
            oneTimeIncomes={oneTimeIncomes}
            monthComments={monthComments}
            projectComments={projectComments}
            lockedMonths={lockedMonths}
            projectCarryOvers={projectCarryOvers}
            onYearlyDataChange={handleYearlyDataChange}
            onYearlyExpensesChange={handleYearlyExpensesChange}
            onOneTimeIncomesChange={handleOneTimeIncomesChange}
            onMonthCommentsChange={handleMonthCommentsChange}
            onProjectCommentsChange={handleProjectCommentsChange}
            onLockedMonthsChange={handleLockedMonthsChange}
          />
        </div>

        <ActionsBar
          currentYear={currentYear}
          onYearChange={handleYearChange}
          onSave={handleSave}
          saving={isSaving || saving}
          hasUnsavedChanges={hasUnsavedChanges}
        />
      </div>

      {showInviteModal && (
        <InviteModal
          budgetId={budget.id}
          onClose={handleCloseInviteModal}
          onInvitationSent={handleInvitationSent}
        />
      )}
    </div>
  );
}