import { useState } from 'react';

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export default function MonthlyTable({
  currentYear,
  people,
  charges,
  projects,
  yearlyData,
  oneTimeIncomes,
  monthComments,
  lockedMonths,
  onYearlyDataChange,
  onOneTimeIncomesChange,
  onMonthCommentsChange,
  onLockedMonthsChange
}) {
  const [hiddenColumns, setHiddenColumns] = useState({
    salaries: false,
    charges: false,
    projects: false
  });

  const [showColumnSelector, setShowColumnSelector] = useState(false);

  const getMonthData = (month) => {
    return yearlyData[month] || {};
  };

  const setMonthData = (month, data) => {
    onYearlyDataChange({
      ...yearlyData,
      [month]: data
    });
  };

  const getOneTimeIncome = (month) => {
    return oneTimeIncomes[month] || 0;
  };

  const setOneTimeIncome = (month, value) => {
    onOneTimeIncomesChange({
      ...oneTimeIncomes,
      [month]: parseFloat(value) || 0
    });
  };

  const getMonthComment = (month) => {
    return monthComments?.[month] || '';
  };

  const setMonthComment = (month, value) => {
    onMonthCommentsChange({
      ...monthComments,
      [month]: value
    });
  };

  const isMonthLocked = (month) => {
    return lockedMonths?.[month] || false;
  };

  const toggleMonthLock = (month) => {
    onLockedMonthsChange({
      ...lockedMonths,
      [month]: !isMonthLocked(month)
    });
  };

  const calculateMonthTotal = (month) => {
    const monthData = getMonthData(month);
    const regularIncome = people.reduce((sum, p) => sum + (p.salary || 0), 0);
    const oneTimeIncome = getOneTimeIncome(month);
    const monthCharges = charges.reduce((sum, c) => sum + (c.amount || 0), 0);
    const projectsTotal = projects.reduce((sum, p) => {
      return sum + (monthData[p.id] || 0);
    }, 0);

    return regularIncome + oneTimeIncome - monthCharges - projectsTotal;
  };

  const calculateYearlyTotal = () => {
    return MONTHS.reduce((sum, month) => sum + calculateMonthTotal(month), 0);
  };

  const toggleColumnGroup = (group) => {
    setHiddenColumns({
      ...hiddenColumns,
      [group]: !hiddenColumns[group]
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Suivi Mensuel {currentYear}
        </h2>
        
        {/* Column Selector */}
        <div className="relative">
          <button
            onClick={() => setShowColumnSelector(!showColumnSelector)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
          >
            <span>👁️</span>
            Colonnes
          </button>
          
          {showColumnSelector && (
            <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 min-w-[200px]">
              <div className="text-sm font-semibold text-gray-700 mb-2">Afficher/Masquer</div>
              <label className="flex items-center gap-2 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!hiddenColumns.salaries}
                  onChange={() => toggleColumnGroup('salaries')}
                  className="rounded"
                />
                <span>Salaires</span>
              </label>
              <label className="flex items-center gap-2 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!hiddenColumns.charges}
                  onChange={() => toggleColumnGroup('charges')}
                  className="rounded"
                />
                <span>Charges</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!hiddenColumns.projects}
                  onChange={() => toggleColumnGroup('projects')}
                  className="rounded"
                />
                <span>Projets</span>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left font-semibold sticky left-0 bg-gray-100 z-10 border-r border-gray-300">
                Mois
              </th>
              
              {/* Salaries */}
              {!hiddenColumns.salaries && people.map((person) => (
                <th key={`salary-${person.id}`} className="p-3 text-right font-semibold whitespace-nowrap border-r border-gray-200">
                  {person.name}
                </th>
              ))}
              
              <th className="p-3 text-right font-semibold whitespace-nowrap bg-green-50 border-r border-gray-300">
                Revenus ponctuels
              </th>
              <th className="p-3 text-right font-semibold whitespace-nowrap bg-blue-50 border-r border-gray-300">
                Total Revenus
              </th>
              
              {/* Charges */}
              {!hiddenColumns.charges && charges.map((charge) => (
                <th key={`charge-${charge.id}`} className="p-3 text-right font-semibold whitespace-nowrap text-red-600 border-r border-gray-200">
                  {charge.label}
                </th>
              ))}
              
              <th className="p-3 text-right font-semibold whitespace-nowrap bg-red-50 border-r border-gray-300">
                Total Charges
              </th>
              
              {/* Projects */}
              {!hiddenColumns.projects && projects.map((project) => (
                <th key={`project-${project.id}`} className="p-3 text-right font-semibold whitespace-nowrap text-purple-600 border-r border-gray-200">
                  {project.label}
                </th>
              ))}
              
              <th className="p-3 text-right font-semibold whitespace-nowrap bg-primary-50 border-r border-gray-300">
                Solde
              </th>
              
              <th className="p-3 text-center font-semibold whitespace-nowrap bg-gray-50">
                🔒
              </th>
            </tr>
          </thead>
          <tbody>
            {MONTHS.map((month, idx) => {
              const monthData = getMonthData(month);
              const regularIncome = people.reduce((sum, p) => sum + (p.salary || 0), 0);
              const oneTimeIncome = getOneTimeIncome(month);
              const totalIncome = regularIncome + oneTimeIncome;
              const totalCharges = charges.reduce((sum, c) => sum + (c.amount || 0), 0);
              const balance = calculateMonthTotal(month);
              const isLocked = isMonthLocked(month);
              const comment = getMonthComment(month);

              return (
                <>
                  <tr key={month} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${isLocked ? 'opacity-60' : ''}`}>
                    <td className="p-3 font-medium sticky left-0 bg-inherit z-10 border-r border-gray-300">
                      <div className="flex items-center gap-2">
                        {isLocked && <span className="text-yellow-600">🔒</span>}
                        {month}
                      </div>
                    </td>
                    
                    {/* Salaries - read only */}
                    {!hiddenColumns.salaries && people.map((person) => (
                      <td key={`salary-${month}-${person.id}`} className="p-3 text-right text-gray-600 border-r border-gray-200">
                        {person.salary.toLocaleString('fr-FR')} €
                      </td>
                    ))}
                    
                    {/* One-time income */}
                    <td className="p-3 border-r border-gray-300">
                      <input
                        type="number"
                        value={getOneTimeIncome(month) || ''}
                        onChange={(e) => !isLocked && setOneTimeIncome(month, e.target.value)}
                        disabled={isLocked}
                        className="w-full px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-100"
                        placeholder="0"
                      />
                    </td>
                    
                    {/* Total income */}
                    <td className="p-3 text-right font-semibold text-green-600 bg-green-50 border-r border-gray-300">
                      {totalIncome.toLocaleString('fr-FR')} €
                    </td>
                    
                    {/* Charges - read only */}
                    {!hiddenColumns.charges && charges.map((charge) => (
                      <td key={`charge-${month}-${charge.id}`} className="p-3 text-right text-red-600 border-r border-gray-200">
                        -{charge.amount.toLocaleString('fr-FR')} €
                      </td>
                    ))}
                    
                    {/* Total charges */}
                    <td className="p-3 text-right font-semibold text-red-600 bg-red-50 border-r border-gray-300">
                      -{totalCharges.toLocaleString('fr-FR')} €
                    </td>
                    
                    {/* Projects - editable */}
                    {!hiddenColumns.projects && projects.map((project) => (
                      <td key={`project-${month}-${project.id}`} className="p-3 border-r border-gray-200">
                        <input
                          type="number"
                          value={monthData[project.id] || ''}
                          onChange={(e) => {
                            if (!isLocked) {
                              setMonthData(month, {
                                ...monthData,
                                [project.id]: parseFloat(e.target.value) || 0
                              });
                            }
                          }}
                          disabled={isLocked}
                          className="w-full px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-100"
                          placeholder="0"
                        />
                      </td>
                    ))}
                    
                    {/* Balance */}
                    <td className={`p-3 text-right font-bold border-r border-gray-300 ${balance >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                      {balance.toLocaleString('fr-FR')} €
                    </td>
                    
                    {/* Lock button */}
                    <td className="p-3 text-center bg-gray-50">
                      <button
                        onClick={() => toggleMonthLock(month)}
                        className={`px-3 py-1 rounded transition ${
                          isLocked 
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={isLocked ? 'Déverrouiller' : 'Verrouiller'}
                      >
                        {isLocked ? '🔒' : '🔓'}
                      </button>
                    </td>
                  </tr>
                  
                  {/* Comment row */}
                  <tr className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-2 text-xs text-gray-500 sticky left-0 bg-inherit z-10 border-r border-gray-300">
                      💬 Commentaire
                    </td>
                    <td colSpan="100" className="p-2">
                      <input
                        type="text"
                        value={comment}
                        onChange={(e) => !isLocked && setMonthComment(month, e.target.value)}
                        disabled={isLocked}
                        placeholder="Ajouter un commentaire pour ce mois..."
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-100"
                      />
                    </td>
                  </tr>
                </>
              );
            })}
            
            {/* Yearly total */}
            <tr className="bg-gray-200 font-bold border-t-2 border-gray-400">
              <td className="p-3 sticky left-0 bg-gray-200 z-10 border-r border-gray-300">TOTAL ANNUEL</td>
              
              {!hiddenColumns.salaries && people.map((person) => (
                <td key={`total-salary-${person.id}`} className="p-3 text-right border-r border-gray-200">
                  {(person.salary * 12).toLocaleString('fr-FR')} €
                </td>
              ))}
              
              <td className="p-3 text-right border-r border-gray-300">
                {Object.values(oneTimeIncomes).reduce((sum, val) => sum + val, 0).toLocaleString('fr-FR')} €
              </td>
              <td className="p-3 text-right bg-green-100 border-r border-gray-300">
                {(people.reduce((sum, p) => sum + p.salary * 12, 0) + 
                  Object.values(oneTimeIncomes).reduce((sum, val) => sum + val, 0)).toLocaleString('fr-FR')} €
              </td>
              
              {!hiddenColumns.charges && charges.map((charge) => (
                <td key={`total-charge-${charge.id}`} className="p-3 text-right text-red-600 border-r border-gray-200">
                  -{(charge.amount * 12).toLocaleString('fr-FR')} €
                </td>
              ))}
              
              <td className="p-3 text-right bg-red-100 border-r border-gray-300">
                -{(charges.reduce((sum, c) => sum + c.amount, 0) * 12).toLocaleString('fr-FR')} €
              </td>
              
              {!hiddenColumns.projects && projects.map((project) => (
                <td key={`total-project-${project.id}`} className="p-3 text-right text-purple-600 border-r border-gray-200">
                  -{MONTHS.reduce((sum, m) => sum + ((yearlyData[m] || {})[project.id] || 0), 0).toLocaleString('fr-FR')} €
                </td>
              ))}
              
              <td className={`p-3 text-right text-xl border-r border-gray-300 ${calculateYearlyTotal() >= 0 ? 'bg-green-200' : 'bg-red-200'}`}>
                {calculateYearlyTotal().toLocaleString('fr-FR')} €
              </td>
              
              <td className="p-3 bg-gray-200"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span>🔒</span>
          <span>Mois verrouillé (non modifiable)</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🔓</span>
          <span>Mois déverrouillé (modifiable)</span>
        </div>
        <div className="flex items-center gap-2">
          <span>💬</span>
          <span>Commentaires</span>
        </div>
      </div>
    </div>
  );
}