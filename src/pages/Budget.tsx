import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { budgetAPI } from '../services/api';
import Navbar from '../components/Navbar';
import InviteModal from '../components/InviteModal';

interface Member {
  id: string;
  user: { name: string; email: string };
  role: 'owner' | 'member';
}

interface BudgetDetails {
    budget: { name: string; };
    members: Member[];
    is_owner: boolean;
}

interface BudgetData {
  data: unknown;
}

export default function Budget(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [budget, setBudget] = useState<BudgetDetails | null>(null);
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    loadBudget();
  }, [id]);

  const loadBudget = async () => {
    if (!id) return;
    try {
      const [budgetRes, dataRes] = await Promise.all([
        budgetAPI.getById(id),
        budgetAPI.getData(id)
      ]);
      
      setBudget(budgetRes.data);
      setBudgetData(dataRes.data);
    } catch (error) {
      console.error('Error loading budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await budgetAPI.updateData(id, { data: budgetData });
      alert('Budget sauvegardé !');
    } catch (error) {
      console.error('Error saving budget:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <button
              onClick={() => navigate('/')}
              className="text-primary-600 hover:text-primary-700 mb-2 flex items-center"
            >
              ← Retour aux budgets
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{budget?.budget?.name}</h1>
            <p className="text-gray-600 mt-1">
              {budget?.members?.length || 0} membre(s)
            </p>
          </div>
          
          <div className="flex space-x-3">
            {budget?.is_owner && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="btn-secondary"
              >
                👥 Inviter
              </button>
            )}
            <button
              onClick={handleSave}
              className="btn-primary"
              disabled={saving}
            >
              {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
            </button>
          </div>
        </div>

        {/* Members */}
        {budget?.members && budget.members.length > 0 && (
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Membres</h2>
            <div className="space-y-2">
              {budget.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-gray-900">{member.user.name}</p>
                    <p className="text-sm text-gray-500">{member.user.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    member.role === 'owner' 
                      ? 'bg-primary-100 text-primary-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {member.role === 'owner' ? 'Propriétaire' : 'Membre'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Budget Data - Placeholder for Phase B */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Données du Budget</h2>
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Interface complète bientôt disponible
            </h3>
            <p className="text-gray-600 mb-4">
              Phase B : Migration de votre interface HTML en cours...
            </p>
            <pre className="text-left bg-white p-4 rounded-lg text-sm overflow-auto max-h-96">
              {JSON.stringify(budgetData?.data, null, 2)}
            </pre>
          </div>
        </div>
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
