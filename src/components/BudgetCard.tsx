import { useState } from 'react';
import { Link } from 'react-router-dom';
// @ts-ignore
import { budgetAPI } from '../services/api';
import React from 'react';

interface Member {
  id: string;
  user: { name: string; email: string };
  role: 'owner' | 'member';
}

interface Budget {
  id: string;
  name: string;
  created_at: string;
  is_owner: boolean;
  members: Member[];
}

interface BudgetCardProps {
  budget: Budget;
  onDeleted?: () => void;
}

export default function BudgetCard({ budget, onDeleted }: BudgetCardProps): JSX.Element {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le budget "${budget.name}" ?\n\nCette action est irréversible et supprimera toutes les données associées.`)) {
      return;
    }

    setDeleting(true);
    try {
      await budgetAPI.delete(budget.id);
      alert('Budget supprimé avec succès');
      if (onDeleted) {
        onDeleted();
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Erreur lors de la suppression du budget');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{budget.name}</h3>
          <p className="text-sm text-gray-600">
            Créé le {new Date(budget.created_at).toLocaleDateString('fr-FR')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {budget.is_owner ? (
            <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              👑 Propriétaire
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              👥 Membre
            </span>
          )}
        </div>
      </div>

      {budget.members && budget.members.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {budget.members.length} membre(s)
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Link
          to={`/budget/${budget.id}/complete`}
          className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition text-center"
        >
          Ouvrir
        </Link>
        
        <Link
          to={`/budget/${budget.id}`}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition flex items-center justify-center"
          title="Vue simple"
        >
          👁️
        </Link>

        {budget.is_owner && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            title="Supprimer le budget"
          >
            {deleting ? '⏳' : '🗑️'}
          </button>
        )}
      </div>
    </div>
  );
}