const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export default function StatsSection({
  people,
  charges,
  projects,
  yearlyData,
  oneTimeIncomes
}) {
  const calculateStats = () => {
    const monthlyRegularIncome = people.reduce((sum, p) => sum + (p.salary || 0), 0);
    const annualRegularIncome = monthlyRegularIncome * 12;
    const totalOneTimeIncome = Object.values(oneTimeIncomes).reduce((sum, val) => sum + val, 0);
    const totalIncome = annualRegularIncome + totalOneTimeIncome;

    const monthlyCharges = charges.reduce((sum, c) => sum + (c.amount || 0), 0);
    const annualCharges = monthlyCharges * 12;

    const totalProjectsSpending = MONTHS.reduce((sum, month) => {
      const monthData = yearlyData[month] || {};
      return sum + projects.reduce((pSum, p) => pSum + (monthData[p.id] || 0), 0);
    }, 0);

    const yearlyBalance = totalIncome - annualCharges - totalProjectsSpending;
    const monthlyAverage = yearlyBalance / 12;

    return {
      totalIncome,
      annualRegularIncome,
      totalOneTimeIncome,
      annualCharges,
      totalProjectsSpending,
      yearlyBalance,
      monthlyAverage
    };
  };

  const stats = calculateStats();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span className="text-2xl">📈</span>
        Statistiques Annuelles
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Revenus Totaux</div>
          <div className="text-2xl font-bold text-green-600">
            {stats.totalIncome.toLocaleString('fr-FR')} €
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Réguliers: {stats.annualRegularIncome.toLocaleString('fr-FR')} €<br/>
            Ponctuels: {stats.totalOneTimeIncome.toLocaleString('fr-FR')} €
          </div>
        </div>

        {/* Total Charges */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Charges Totales</div>
          <div className="text-2xl font-bold text-red-600">
            {stats.annualCharges.toLocaleString('fr-FR')} €
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {charges.length} charge(s) × 12 mois
          </div>
        </div>

        {/* Projects Spending */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Projets & Épargne</div>
          <div className="text-2xl font-bold text-purple-600">
            {stats.totalProjectsSpending.toLocaleString('fr-FR')} €
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {projects.length} projet(s)
          </div>
        </div>

        {/* Yearly Balance */}
        <div className={`${stats.yearlyBalance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} border rounded-lg p-4`}>
          <div className="text-sm text-gray-600 mb-1">Solde Final</div>
          <div className={`text-2xl font-bold ${stats.yearlyBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            {stats.yearlyBalance.toLocaleString('fr-FR')} €
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Moy. mensuelle: {stats.monthlyAverage.toLocaleString('fr-FR')} €
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Répartition des dépenses</span>
          <span>{((stats.annualCharges + stats.totalProjectsSpending) / stats.totalIncome * 100).toFixed(1)}%</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full flex">
            <div
              className="bg-red-500"
              style={{ width: `${(stats.annualCharges / stats.totalIncome) * 100}%` }}
              title={`Charges: ${stats.annualCharges.toLocaleString('fr-FR')} €`}
            />
            <div
              className="bg-purple-500"
              style={{ width: `${(stats.totalProjectsSpending / stats.totalIncome) * 100}%` }}
              title={`Projets: ${stats.totalProjectsSpending.toLocaleString('fr-FR')} €`}
            />
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>🔴 Charges ({((stats.annualCharges / stats.totalIncome) * 100).toFixed(1)}%)</span>
          <span>🟣 Projets ({((stats.totalProjectsSpending / stats.totalIncome) * 100).toFixed(1)}%)</span>
          <span>🔵 Épargne ({(stats.yearlyBalance / stats.totalIncome * 100).toFixed(1)}%)</span>
        </div>
      </div>
    </div>
  );
}