import { Link } from 'react-router-dom';

export default function BudgetCard({ budget }) {
  return (
    <Link to={`/budget/${budget.id}`}>
      <div className="card hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{budget.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {budget.is_owner ? 'Propriétaire' : 'Membre'}
            </p>
          </div>
          <span className="text-2xl">📊</span>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Dernière mise à jour: {new Date(budget.updated_at).toLocaleDateString('fr-FR')}
        </div>
      </div>
    </Link>
  );
}