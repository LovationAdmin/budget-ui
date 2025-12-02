import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { budgetAPI } from '../services/api';
import { convertOldFormatToNew, convertNewFormatToOld } from '../utils/importConverter';
import Navbar from '../components/Navbar';
import InviteModal from '../components/InviteModal';

// Components
import BudgetHeader from '../components/budget/BudgetHeader';
import PeopleSection from '../components/budget/PeopleSection';
import ChargesSection from '../components/budget/ChargesSection';
import ProjectsSection from '../components/budget/ProjectsSection';
import MonthlyTable from '../components/budget/MonthlyTable';
import StatsSection from '../components/budget/StatsSection';
import ActionsBar from '../components/budget/ActionsBar';

export default function BudgetComplete() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Budget data state
  const [budgetTitle, setBudgetTitle] = useState('');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [people, setPeople] = useState([]);
  const [charges, setCharges] = useState([]);
  const [projects, setProjects] = useState([]);
  const [yearlyData, setYearlyData] = useState({});
  const [oneTimeIncomes, setOneTimeIncomes] = useState({});
  const [monthComments, setMonthComments] = useState({});
  const [lockedMonths, setLockedMonths] = useState({});

  useEffect(() => {
    loadBudget();
  }, [id]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleSave(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [budgetTitle, currentYear, people, charges, projects, yearlyData, oneTimeIncomes, monthComments, lockedMonths]);

  const loadBudget = async () => {
    try {
      const [budgetRes, dataRes] = await Promise.all([
        budgetAPI.getById(id),
        budgetAPI.getData(id)
      ]);

      setBudget(budgetRes.data);

      // Load budget data
      let data = dataRes.data.data;
      
      // Convert old format if needed
      if (data.yearlyData && typeof data.yearlyData === 'object') {
        const firstKey = Object.keys(data.yearlyData)[0];
        if (firstKey && data.yearlyData[firstKey]?.months) {
          console.log('Old format detected, converting...');
          data = convertOldFormatToNew(data);
        }
      }

      setBudgetTitle(data.budgetTitle || '');
      setCurrentYear(data.currentYear || new Date().getFullYear());
      setPeople(data.people || []);
      setCharges(data.charges || []);
      setProjects(data.projects || []);
      setYearlyData(data.yearlyData || {});
      setOneTimeIncomes(data.oneTimeIncomes || {});
      setMonthComments(data.monthComments || {});
      setLockedMonths(data.lockedMonths || {});
    } catch (error) {
      console.error('Error loading budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (silent = false) => {
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
      lockedMonths,
      lastUpdated: new Date().toISOString(),
      version: '2.0'
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

  const handleExport = (formatType = 'new') => {
    let dataToExport;
    
    if (formatType === 'old') {
      // Export en ancien format (compatible HTML)
      dataToExport = convertNewFormatToOld({
        budgetTitle,
        currentYear,
        people,
        charges,
        projects,
        yearlyData,
        oneTimeIncomes,
        monthComments,
        lockedMonths
      });
    } else {
      // Export en nouveau format
      dataToExport = {
        budgetTitle,
        currentYear,
        people,
        charges,
        projects,
        yearlyData,
        oneTimeIncomes,
        monthComments,
        lockedMonths,
        exportDate: new Date().toISOString(),
        version: '2.0'
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

  const handleImport = (rawData) => {
    if (confirm('Voulez-vous vraiment importer ces données ? Cela remplacera le budget actuel.')) {
      // Convert old format if needed
      const data = convertOldFormatToNew(rawData);
      
      setBudgetTitle(data.budgetTitle || '');
      setCurrentYear(data.currentYear || new Date().getFullYear());
      setPeople(data.people || []);
      setCharges(data.charges || []);
      setProjects(data.projects || []);
      setYearlyData(data.yearlyData || {});
      setOneTimeIncomes(data.oneTimeIncomes || {});
      setMonthComments(data.monthComments || {});
      setLockedMonths(data.lockedMonths || {});
      
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
              <span className="text-sm text-gray-600">
                {budget?.members?.length || 0} membre(s)
              </span>
            </div>
          </div>
        </div>

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
          lockedMonths={lockedMonths}
          onYearlyDataChange={setYearlyData}
          onOneTimeIncomesChange={setOneTimeIncomes}
          onMonthCommentsChange={setMonthComments}
          onLockedMonthsChange={setLockedMonths}
        />
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal
          budgetId={id}
          onClose={() => setShowInviteModal(false)}
          onInvited={() => loadBudget()}
        />
      )}
    </div>
  );
}