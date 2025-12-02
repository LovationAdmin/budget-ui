const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

/**
 * Convertit l'ancien format JSON (HTML) vers le nouveau format (React)
 */
export function convertOldFormatToNew(oldData) {
  console.log('Converting old format to new...');
  
  // Si c'est déjà le nouveau format, retourner tel quel
  if (!oldData.yearlyData || typeof oldData.yearlyData !== 'object') {
    return oldData;
  }

  // Détecter si c'est l'ancien format (avec yearlyData[year].months)
  const firstYear = Object.keys(oldData.yearlyData)[0];
  if (!firstYear || !oldData.yearlyData[firstYear].months) {
    // Déjà au nouveau format
    return oldData;
  }

  console.log('Old format detected, converting...');

  // Nouveau format
  const newData = {
    budgetTitle: oldData.budgetTitle || '',
    currentYear: oldData.currentYear || parseInt(firstYear) || new Date().getFullYear(),
    people: oldData.people || [],
    charges: oldData.charges || [],
    projects: oldData.projects || [],
    yearlyData: {},
    oneTimeIncomes: {},
    monthComments: {},
    lockedMonths: {},
    lastUpdated: new Date().toISOString()
  };

  // Convertir yearlyData pour chaque année
  Object.keys(oldData.yearlyData).forEach(year => {
    const oldYearData = oldData.yearlyData[year];
    
    // Convertir months (projets par mois)
    MONTHS.forEach((month, idx) => {
      if (oldYearData.months && oldYearData.months[idx]) {
        newData.yearlyData[month] = oldYearData.months[idx];
      }
    });

    // Convertir monthComments
    if (oldYearData.monthComments) {
      MONTHS.forEach((month, idx) => {
        if (oldYearData.monthComments[idx]) {
          newData.monthComments[month] = oldYearData.monthComments[idx];
        }
      });
    }

    // Convertir oneTimeIncomes
    if (oldData.oneTimeIncomes && oldData.oneTimeIncomes[year]) {
      MONTHS.forEach((month, idx) => {
        const income = oldData.oneTimeIncomes[year][idx];
        if (income && income.amount) {
          newData.oneTimeIncomes[month] = income.amount;
        }
      });
    }
  });

  console.log('Conversion complete!', newData);
  return newData;
}

/**
 * Convertit le nouveau format vers l'ancien (pour export compatible)
 */
export function convertNewFormatToOld(newData) {
  const year = newData.currentYear || new Date().getFullYear();
  
  const oldData = {
    budgetTitle: newData.budgetTitle,
    currentYear: year,
    people: newData.people,
    charges: newData.charges,
    projects: newData.projects,
    yearlyData: {
      [year]: {
        months: [],
        monthComments: [],
        expenses: [], // Copie de months pour compatibilité
        expenseComments: [],
        deletedMonths: []
      }
    },
    oneTimeIncomes: {
      [year]: []
    },
    date: new Date().toISOString()
  };

  // Convertir yearlyData
  MONTHS.forEach(month => {
    oldData.yearlyData[year].months.push(newData.yearlyData[month] || {});
    oldData.yearlyData[year].expenses.push(newData.yearlyData[month] || {});
    oldData.yearlyData[year].monthComments.push(newData.monthComments?.[month] || '');
    
    // expenseComments - structure complexe pour compatibilité
    const expenseComment = {};
    newData.projects.forEach(project => {
      expenseComment[project.id] = ''; // Pas de commentaires par projet pour le moment
    });
    oldData.yearlyData[year].expenseComments.push(expenseComment);
    
    // oneTimeIncomes
    oldData.oneTimeIncomes[year].push({
      amount: newData.oneTimeIncomes?.[month] || 0,
      description: ''
    });
  });

  return oldData;
}