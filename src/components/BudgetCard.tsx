import { useState } from 'react';
import { Link } from 'react-router-dom';
import { budgetAPI } from '../services/api';
import { intlLocale } from '@/lib/budget/format';
import { defineMessages, useT } from '@/i18n/runtime';

const M = defineMessages({
  fr: {
    confirmDelete: (name: string) => `Êtes-vous sûr de vouloir supprimer le budget "${name}" ?\n\nCette action est irréversible et supprimera toutes les données associées.`,
    deleted: 'Budget supprimé avec succès',
    deleteFailed: 'Erreur lors de la suppression du budget',
    createdOn: (date: string) => `Créé le ${date}`,
    owner: '👑 Propriétaire',
    member: '👥 Membre',
    members: (n: number) => `${n} membre(s)`,
    open: 'Ouvrir',
    simpleView: 'Vue simple',
    delete: 'Supprimer le budget',
  },
  en: {
    confirmDelete: (name: string) => `Are you sure you want to delete the budget “${name}”?\n\nThis can’t be undone and will delete all its data.`,
    deleted: 'Budget deleted',
    deleteFailed: 'Couldn’t delete the budget',
    createdOn: (date: string) => `Created on ${date}`,
    owner: '👑 Owner',
    member: '👥 Member',
    members: (n: number) => (n === 1 ? '1 member' : `${n} members`),
    open: 'Open',
    simpleView: 'Simple view',
    delete: 'Delete the budget',
  },
});

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
  const t = useT(M);

  const handleDelete = async () => {
    if (!confirm(t.confirmDelete(budget.name))) {
      return;
    }

    setDeleting(true);
    try {
      await budgetAPI.delete(budget.id);
      alert(t.deleted);
      if (onDeleted) {
        onDeleted();
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert(t.deleteFailed);
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
            {t.createdOn(new Date(budget.created_at).toLocaleDateString(intlLocale()))}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {budget.is_owner ? (
            <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              {t.owner}
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              {t.member}
            </span>
          )}
        </div>
      </div>

      {budget.members && budget.members.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {t.members(budget.members.length)}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Link
          to={`/budget/${budget.id}/complete`}
          className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition text-center"
        >
          {t.open}
        </Link>
        
        <Link
          to={`/budget/${budget.id}`}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition flex items-center justify-center"
          title={t.simpleView}
        >
          👁️
        </Link>

        {budget.is_owner && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            title={t.delete}
          >
            {deleting ? '⏳' : '🗑️'}
          </button>
        )}
      </div>
    </div>
  );
}
