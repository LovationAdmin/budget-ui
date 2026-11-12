// src/seo/es/rent-split.ts
// The Spanish rent split calculator (/es/calculadora-dividir-alquiler): its
// PageSEO entry and its structured-data name (its FAQ is in faq-rent-split.ts).
// The prerendered example is in euros, as the page shows it by default: the
// English example, split by computeColocation and written with
// formatEs('EUR').moneyExact. No country's tenancy law is given as the rule.

import type { PageSEO } from '../site';

export const RENT_SPLIT_PAGE_ES: PageSEO = {
  path: '/es/calculadora-dividir-alquiler',
  title: 'Calculadora para dividir el alquiler entre compañeros de piso',
  description: 'Calculadora gratuita para dividir el alquiler: a partes iguales, por tamaño de habitación o según los ingresos, con la luz, internet y los gastos comunes. Lo que paga cada compañero de piso, sin registro.',
  h1: 'Calculadora para dividir el alquiler: ¿cuánto paga cada compañero de piso?',
  intro: '¿Cómo dividir el alquiler de forma justa? Elige a partes iguales, por tamaño de habitación o según los ingresos, y mira lo que paga cada compañero de piso al mes, con la luz, internet y los gastos comunes. Gratis y sin registro: tus datos se quedan en tu dispositivo.',
  sections: [
    { h2: 'Cómo dividir el alquiler: tres métodos', text: 'Tres métodos habituales: a partes iguales; por tamaño de habitación (la mitad del alquiler corresponde a las zonas comunes y se reparte a partes iguales, el resto sigue los metros de cada habitación); y en proporción a los ingresos netos de cada persona. Los gastos comunes se reparten a partes iguales.' },
    { h2: 'Ejemplo: un piso compartido entre tres', text: 'En nuestro ejemplo, el alquiler es de 2.700 € al mes, las habitaciones miden 10, 13 y 17 m² y los gastos comunes suman 330 €: a partes iguales, cada persona paga 1.010 €; por tamaño de habitación, 897,50 €, 998,75 € y 1.133,75 €; según los ingresos, 806,77 €, 980,97 € y 1.242,26 €.' },
    { h2: 'Cómo repartir la luz, internet y la compra: un fondo común', text: 'A principios de mes cada persona ingresa su parte en un fondo común, y de ahí se pagan el alquiler, las facturas y la compra común; los gastos personales van aparte. Las facturas que no son mensuales se pasan a un mes, y las cuentas se revisan una vez al mes.' },
    { h2: 'Antes de mudarse: dejarlo por escrito', text: 'Un contrato conjunto o uno por habitación, el subarriendo y el permiso del propietario, el método de reparto y la fecha de pago, la fianza o el depósito, las salidas y la búsqueda de un nuevo compañero, las facturas y las tareas.' },
  ],
  priority: 0.8,
  changefreq: 'monthly',
};

/** Name of the WebApplication in structured data, and the breadcrumb label. */
export const RENT_SPLIT_TOOL_ES = { name: 'Calculadora para dividir el alquiler', crumb: 'Dividir el alquiler' };
