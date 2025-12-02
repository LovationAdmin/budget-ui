import { Link } from 'react-router-dom';

export default function BudgetCard({ budget }) {
  return (
    <div className="card hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{budget.name}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {budget.is_owner ? '👑 Propriétaire' : '👤 Membre'}
          </p>
        </div>
        <span className="text-3xl">📊</span>
      </div>

      <div className="text-sm text-gray-600 mb-4">
        Dernière mise à jour: {new Date(budget.updated_at).toLocaleDateString('fr-FR')}
      </div>

      <div className="flex gap-2">
        {/* Complete interface */}
        <Link
          to={`/budget/${budget.id}/complete`}
          className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-center px-4 py-2 rounded-lg font-medium transition"
        >
          Ouvrir
        </Link>

        {/* Simple view */}
        <Link
          to={`/budget/${budget.id}`}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition"
          title="Vue simple"
        >
          👁️
        </Link>
      </div>
    </div>
  );
}