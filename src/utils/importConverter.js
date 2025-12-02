const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

/**
 * Convertit l'ancien format JSON (HTML) vers le nouveau format (React)
 */
export function convertOldFormatToNew(oldData) {
  console.log('Converting old format to new...', oldData);
  
  // Si c'est déjà le nouveau format, retourner tel quel
  if (!oldData.yearlyData || typeof oldData.yearlyData !== 'object') {
    console.log('No yearlyData, returning as is');
    return oldData;
  }

  // Détecter si c'est l'ancien format (avec yearlyData[year].months)
  const firstYear = Object.keys(oldData.yearlyData)[0];
  if (!firstYear || !oldData.yearlyData[firstYear].months) {
    console.log('Already new format');
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
    projectComments: {}, // NOUVEAU: commentaires par projet
    lockedMonths: {},
    lastUpdated: new Date().toISOString()
  };

  // Convertir yearlyData pour l'année spécifiée
  const year = firstYear;
  const oldYearData = oldData.yearlyData[year];
  
  console.log('Converting year:', year);
  console.log('Months data:', oldYearData.months);
  console.log('Expense comments:', oldYearData.expenseComments);

  // Convertir months (projets par mois)
  MONTHS.forEach((month, idx) => {
    // MONTANTS PROJETS
    if (oldYearData.months && oldYearData.months[idx]) {
      const monthData = oldYearData.months[idx];
      console.log(`Month ${month} data:`, monthData);
      newData.yearlyData[month] = { ...monthData };
    }

    // COMMENTAIRES DE MOIS
    if (oldYearData.monthComments && oldYearData.monthComments[idx]) {
      newData.monthComments[month] = oldYearData.monthComments[idx];
    }

    // COMMENTAIRES PAR PROJET (NOUVEAU)
    if (oldYearData.expenseComments && oldYearData.expenseComments[idx]) {
      const expenseComment = oldYearData.expenseComments[idx];
      console.log(`Month ${month} expense comments:`, expenseComment);
      newData.projectComments[month] = { ...expenseComment };
    }

    // REVENUS PONCTUELS
    if (oldData.oneTimeIncomes && oldData.oneTimeIncomes[year]) {
      const income = oldData.oneTimeIncomes[year][idx];
      if (income && income.amount) {
        newData.oneTimeIncomes[month] = income.amount;
      }
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
        expenses: [],
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
    // Months & expenses (même données)
    const monthData = newData.yearlyData[month] || {};
    oldData.yearlyData[year].months.push(monthData);
    oldData.yearlyData[year].expenses.push(monthData);
    
    // Month comments
    oldData.yearlyData[year].monthComments.push(newData.monthComments?.[month] || '');
    
    // Expense comments (commentaires par projet)
    oldData.yearlyData[year].expenseComments.push(newData.projectComments?.[month] || {});
    
    // OneTime incomes
    oldData.oneTimeIncomes[year].push({
      amount: newData.oneTimeIncomes?.[month] || 0,
      description: ''
    });
  });

  return oldData;
}