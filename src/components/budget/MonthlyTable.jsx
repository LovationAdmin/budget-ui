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
  onYearlyDataChange,
  onOneTimeIncomesChange
}) {
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 overflow-x-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-2xl">📊</span>
        Suivi Mensuel {currentYear}
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left font-semibold sticky left-0 bg-gray-100">Mois</th>
              {/* Salaires */}
              {people.map((person) => (
                <th key={`salary-${person.id}`} className="p-3 text-right font-semibold whitespace-nowrap">
                  {person.name}
                </th>
              ))}
              <th className="p-3 text-right font-semibold whitespace-nowrap bg-green-50">
                Revenus ponctuels
              </th>
              <th className="p-3 text-right font-semibold whitespace-nowrap bg-blue-50">
                Total Revenus
              </th>
              {/* Charges */}
              {charges.map((charge) => (
                <th key={`charge-${charge.id}`} className="p-3 text-right font-semibold whitespace-nowrap text-red-600">
                  {charge.label}
                </th>
              ))}
              <th className="p-3 text-right font-semibold whitespace-nowrap bg-red-50">
                Total Charges
              </th>
              {/* Projects */}
              {projects.map((project) => (
                <th key={`project-${project.id}`} className="p-3 text-right font-semibold whitespace-nowrap text-purple-600">
                  {project.label}
                </th>
              ))}
              <th className="p-3 text-right font-semibold whitespace-nowrap bg-primary-50">
                Solde
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
              const totalProjects = projects.reduce((sum, p) => sum + (monthData[p.id] || 0), 0);
              const balance = calculateMonthTotal(month);

              return (
                <tr key={month} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3 font-medium sticky left-0 bg-inherit">{month}</td>
                  {/* Salaries - read only */}
                  {people.map((person) => (
                    <td key={`salary-${month}-${person.id}`} className="p-3 text-right text-gray-600">
                      {person.salary.toLocaleString('fr-FR')} €
                    </td>
                  ))}
                  {/* One-time income */}
                  <td className="p-3">
                    <input
                      type="number"
                      value={getOneTimeIncome(month) || ''}
                      onChange={(e) => setOneTimeIncome(month, e.target.value)}
                      className="w-full px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="0"
                    />
                  </td>
                  {/* Total income */}
                  <td className="p-3 text-right font-semibold text-green-600 bg-green-50">
                    {totalIncome.toLocaleString('fr-FR')} €
                  </td>
                  {/* Charges - read only */}
                  {charges.map((charge) => (
                    <td key={`charge-${month}-${charge.id}`} className="p-3 text-right text-red-600">
                      -{charge.amount.toLocaleString('fr-FR')} €
                    </td>
                  ))}
                  {/* Total charges */}
                  <td className="p-3 text-right font-semibold text-red-600 bg-red-50">
                    -{totalCharges.toLocaleString('fr-FR')} €
                  </td>
                  {/* Projects - editable */}
                  {projects.map((project) => (
                    <td key={`project-${month}-${project.id}`} className="p-3">
                      <input
                        type="number"
                        value={monthData[project.id] || ''}
                        onChange={(e) => {
                          setMonthData(month, {
                            ...monthData,
                            [project.id]: parseFloat(e.target.value) || 0
                          });
                        }}
                        className="w-full px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="0"
                      />
                    </td>
                  ))}
                  {/* Balance */}
                  <td className={`p-3 text-right font-bold ${balance >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                    {balance.toLocaleString('fr-FR')} €
                  </td>
                </tr>
              );
            })}
            {/* Yearly total */}
            <tr className="bg-gray-200 font-bold">
              <td className="p-3 sticky left-0 bg-gray-200">TOTAL ANNUEL</td>
              {people.map((person) => (
                <td key={`total-salary-${person.id}`} className="p-3 text-right">
                  {(person.salary * 12).toLocaleString('fr-FR')} €
                </td>
              ))}
              <td className="p-3 text-right">
                {Object.values(oneTimeIncomes).reduce((sum, val) => sum + val, 0).toLocaleString('fr-FR')} €
              </td>
              <td className="p-3 text-right bg-green-100">
                {(people.reduce((sum, p) => sum + p.salary * 12, 0) + 
                  Object.values(oneTimeIncomes).reduce((sum, val) => sum + val, 0)).toLocaleString('fr-FR')} €
              </td>
              {charges.map((charge) => (
                <td key={`total-charge-${charge.id}`} className="p-3 text-right text-red-600">
                  -{(charge.amount * 12).toLocaleString('fr-FR')} €
                </td>
              ))}
              <td className="p-3 text-right bg-red-100">
                -{(charges.reduce((sum, c) => sum + c.amount, 0) * 12).toLocaleString('fr-FR')} €
              </td>
              {projects.map((project) => (
                <td key={`total-project-${project.id}`} className="p-3 text-right text-purple-600">
                  -{MONTHS.reduce((sum, m) => sum + ((yearlyData[m] || {})[project.id] || 0), 0).toLocaleString('fr-FR')} €
                </td>
              ))}
              <td className={`p-3 text-right text-xl ${calculateYearlyTotal() >= 0 ? 'bg-green-200' : 'bg-red-200'}`}>
                {calculateYearlyTotal().toLocaleString('fr-FR')} €
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}