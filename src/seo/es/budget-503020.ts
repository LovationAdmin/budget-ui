// src/seo/es/budget-503020.ts
// The Spanish 50/30/20 calculator (/es/calculadora-presupuesto-50-30-20): its
// PageSEO entry and its structured-data names (its FAQ is in
// faq-budget-503020.ts). Plain text only; the rule matches
// src/lib/tools/budgetPerso.ts. The prerendered sections show the page's
// example in euros, the default currency of the Spanish pages, computed with
// computeBudgetPerso on EXAMPLE_EN and written with formatEs('EUR').

import type { PageSEO } from '../site';

export const BUDGET_503020_PAGE_ES: PageSEO = {
  path: '/es/calculadora-presupuesto-50-30-20',
  title: 'Calculadora regla 50/30/20: cómo repartir tu sueldo',
  description: 'Calculadora gratuita de la regla 50/30/20: indica tus ingresos netos y tus gastos esenciales y mira cómo repartir tu sueldo entre necesidades, deseos y ahorro, y cuánto ahorrar al mes. Sin registro.',
  h1: 'Calculadora de presupuesto 50/30/20',
  intro: 'Haz tu presupuesto personal con la regla 50/30/20: indica tus ingresos netos y tus gastos esenciales y mira cómo repartir tu sueldo, cuánto queda después de las necesidades y cuánto puedes ahorrar cada mes.',
  sections: [
    { h2: 'Cómo hacer un presupuesto personal en 5 pasos', text: 'Parte de tus ingresos netos, apunta los gastos fijos, divide entre 12 los gastos anuales, calcula los gastos variables y ahorra primero: una transferencia a tu ahorro el día que cobras.' },
    { h2: '¿Qué es la regla 50/30/20?', text: '50 % para necesidades, 30 % para deseos y 20 % para ahorro: la regla se hizo popular con el libro «All Your Worth» (2005), de Elizabeth Warren y Amelia Warren Tyagi. Es una referencia, no una obligación, y se adapta al coste de la vivienda.' },
    { h2: 'Ejemplo de presupuesto 50/30/20: cómo repartir el sueldo', text: 'En nuestro ejemplo, con 4.000 € netos al mes y 2.200 € de gastos esenciales (55 %): 1.000 € para deseos y 800 € de ahorro al mes.' },
    { h2: '¿Cuánto ahorrar al mes?', text: 'La referencia es el 20 % de tus ingresos netos; empieza con poco, primero un fondo de emergencia para varios meses y después los objetivos con fecha.' },
  ],
  priority: 0.8,
  changefreq: 'monthly',
};

/** Structured data: name of the WebApplication and breadcrumb label. */
export const BUDGET_503020_TOOL_ES = { name: 'Calculadora de presupuesto 50/30/20', crumb: 'Calculadora 50/30/20' };
