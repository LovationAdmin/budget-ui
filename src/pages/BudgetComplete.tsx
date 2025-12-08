import { useState, useEffect } from 'react';
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
} from '../utils/importConverter.tsx';
import Navbar from '../components/Navbar.tsx';
import InviteModal from '../components/InviteModal';
import { useAuth } from '../contexts/AuthContext';

import BudgetHeader from '../components/budget/Budgetheader';
import PeopleSection from '../components/budget/PeopleSection';
import ChargesSection from '../components/budget/ChargesSection';
import ProjectsSection from '../components/budget/ProjectsSection';
import MonthlyTable from '../components/budget/MonthlyTable';
import StatsSection from '../components/budget/StatsSection';
import ActionsBar from '../components/budget/ActionsBar';
import MemberManagementSection from '../components/budget/MemberManagementSection'; 

// Types
interface BudgetMember {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
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

  const [budget, setBudget] = useState<BudgetData | null>(null); 
  const [loading, setLoading] = useState(true); 
  const [saving, setSaving] = useState(false); 
  const [showInviteModal, setShowInviteModal] = useState(false); 

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

  useEffect(() => { 
    if (id) {
      loadBudget(); 
    }
  }, [id]); 

  useEffect(() => { 
    const interval = setInterval(() => { 
      handleSave(true); 
    }, 30000); 

    return () => clearInterval(interval); 
  }, [budgetTitle, currentYear, people, charges, projects, yearlyData, oneTimeIncomes, monthComments, projectComments, lockedMonths]); 

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
          console.log('Old format detected, converting...'); 
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

      console.log('Loaded data:', { 
        yearlyData: data.yearlyData, 
        projectComments: data.projectComments 
      }); 
    } catch (error) { 
      console.error('Error loading budget:', error); 
    } finally { 
      setLoading(false); 
    } 
  }; 

  const handleSave = async (silent = false) => { 
    if (!id) return;
    
    if (!silent) setSaving(true); 

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
      lastUpdated: new Date().toISOString(), 
      version: '2.1' 
    }; 

    try { 
      await budgetAPI.updateData(id, { data: budgetData }); 
      if (!silent) { 
        alert('Budget sauvegardé avec succès !'); 
      } 
    } catch (error) { 
      console.error('Error saving budget:', error); 
      if (!silent) { 
        alert('Erreur lors de la sauvegarde'); 
      } 
    } finally { 
      if (!silent) setSaving(false); 
    } 
  }; 

  const handleExport = (formatType: 'new' | 'old' = 'new') => { 
    let dataToExport; 
    
    if (formatType === 'old') { 
      dataToExport = convertNewFormatToOld({ 
        budgetTitle, 
        currentYear, 
        people, 
        charges, 
        projects, 
        yearlyData, 
        oneTimeIncomes, 
        monthComments, 
        projectComments, 
        lockedMonths 
      }); 
    } else { 
      dataToExport = { 
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
        exportDate: new Date().toISOString(), 
        version: '2.1' 
      }; 
    } 

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' }); 
    const url = URL.createObjectURL(blob); 
    const a = document.createElement('a'); 
    a.href = url; 
    a.download = `budget_${budgetTitle || 'export'}_${new Date().toISOString().split('T')[0]}.json`; 
    document.body.appendChild(a); 
    a.click(); 
    document.body.removeChild(a); 
    URL.revokeObjectURL(url); 
  }; 

  const handleImport = (rawData: RawBudgetData) => { 
    if (confirm('Voulez-vous vraiment importer ces données ? Cela remplacera le budget actuel.')) { 
      const data = convertOldFormatToNew(rawData); 
      
      console.log('Imported data:', data); 
      
      setBudgetTitle(data.budgetTitle || ''); 
      setCurrentYear(data.currentYear || new Date().getFullYear()); 
      setPeople(data.people || []); 
      setCharges(data.charges || []); 
      setProjects(data.projects || []); 
      setYearlyData(data.yearlyData); 
      setOneTimeIncomes(data.oneTimeIncomes); 
      setMonthComments(data.monthComments); 
      setProjectComments(data.projectComments); 
      setLockedMonths(data.lockedMonths); 
      
      alert('Données importées avec succès !'); 
    } 
  }; 

  if (loading) { 
    return ( 
      <div className="min-h-screen bg-gray-50"> 
        <Navbar /> 
        <div className="flex items-center justify-center h-96"> 
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div> 
        </div> 
      </div> 
    ); 
  } 

  return ( 
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50"> 
      <Navbar /> 

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> 
        {/* Back button */}
        <button 
          onClick={() => navigate('/')} 
          className="text-primary-600 hover:text-primary-700 mb-4 flex items-center gap-2 font-medium" 
        > 
          ← Retour aux budgets 
        </button> 

        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6"> 
          <BudgetHeader
            budgetTitle={budgetTitle} 
            onTitleChange={setBudgetTitle} 
            currentYear={currentYear} 
            onYearChange={setCurrentYear} 
          /> 

          {/* Actions bar */}
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
        
        {/* Section de gestion des membres */}
        {budget && user && (
            <MemberManagementSection 
                budget={budget}
                currentUserId={user.id} 
                onMemberChange={loadBudget}
            />
        )}


        {/* Actions */}
        <ActionsBar
          onSave={() => handleSave(false)} 
          onExport={handleExport} 
          onImport={handleImport} 
          saving={saving} 
        /> 

        {/* People Section */}
        <PeopleSection people={people} onPeopleChange={setPeople} /> 

        {/* Charges Section */}
        <ChargesSection charges={charges} onChargesChange={setCharges} /> 

        {/* Projects Section */}
        <ProjectsSection projects={projects} onProjectsChange={setProjects} /> 

        {/* Stats */}
        <StatsSection 
          people={people} 
          charges={charges} 
          projects={projects} 
          yearlyData={yearlyData} 
          oneTimeIncomes={oneTimeIncomes} 
        /> 

        {/* Monthly Table */}
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

      {/* Invite Modal */}
      {showInviteModal && id && ( 
        <InviteModal 
          budgetId={id} 
          onClose={() => setShowInviteModal(false)} 
          onInvited={() => loadBudget()} 
        /> 
      )} 
    </div> 
  ); 
}
