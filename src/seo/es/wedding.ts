// src/seo/es/wedding.ts
// The Spanish wedding budget calculator (/es/calculadora-presupuesto-boda):
// its PageSEO entry and its structured-data names (its FAQ is in
// faq-wedding.ts). No averages or market prices. The prerendered sections show
// the fictitious example in euros, as the page shows it by default (computed
// with src/lib/tools/mariage.ts, written with formatEs('EUR')).

import type { PageSEO } from '../site';

export const WEDDING_PAGE_ES: PageSEO = {
  path: '/es/calculadora-presupuesto-boda',
  title: 'Calculadora de presupuesto de boda: coste total y por invitado',
  description: 'Calculadora gratuita de presupuesto de boda: indica tus presupuestos de banquete, lugar, vestido y fotografía y calcula el coste total, el precio por invitado, lo que ahorras con 20 invitados menos y cuánto apartar cada mes.',
  h1: 'Calculadora de presupuesto de boda',
  intro: 'Banquete, lugar de celebración, vestido, fotografía: suma tus presupuestos y calcula cuánto cuesta tu boda, el precio por invitado y cuánto ahorrar cada mes hasta la fecha. Gratis y sin registro: tus datos se quedan en tu dispositivo.',
  sections: [
    { h2: 'Cómo calcular el presupuesto de una boda', text: 'Presupuesto de boda = precio por invitado del banquete y las bebidas × número de invitados + gastos fijos + imprevistos. No existe un precio medio oficial: parte de los presupuestos que te den.' },
    { h2: 'Ejemplo de presupuesto de boda para 100 invitados', text: 'Ejemplo ficticio: banquete a 80 € y bebidas a 20 € por invitado, lugar 4.000 €, vestido, traje y belleza 2.000 €… Total: 22.000 €, es decir, 220 € por invitado; con 20 invitados menos, al menos 2.000 € de ahorro.' },
    { h2: 'Cuánto ahorrar al mes para la boda', text: 'Ahorro mensual = (presupuesto total − lo ya ahorrado) ÷ meses que faltan. Ejemplo ficticio: con 4.000 € ya ahorrados, quedan 18.000 € por reunir en 18 meses, es decir, 1.000 € al mes. No cuentes por adelantado con los regalos de los invitados.' },
    { h2: 'Cómo ahorrar en la boda', text: 'Acortar la lista de invitados (el banquete se paga por persona), elegir una fecha fuera de temporada, comparar lugares y menús, cambiar el formato del banquete, hacer uno mismo lo que se pueda y alquilar o comprar de segunda mano.' },
    { h2: '¿Quién paga la boda?', text: 'No hay una regla: la pareja, las familias o entre todos. Conviene hablarlo pronto; un presupuesto compartido y un objetivo de ahorro con importe y fecha ayudan.' },
  ],
  priority: 0.8,
  changefreq: 'monthly',
};

/** Name of the WebApplication in structured data, and the breadcrumb label. */
export const WEDDING_TOOL_ES = { name: 'Calculadora de presupuesto de boda', crumb: 'Presupuesto de boda' };
