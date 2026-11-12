// src/seo/es/home.ts
// The Spanish home (/es): its search metadata and prerendered summary (its FAQ
// is in faq-home.ts). The app is in French and English; the free calculators
// are the pages written in Spanish.

import type { PageSEO } from '../site';
import { ES_TOOLS } from '@/i18n/es/tools';

export const HOME_PAGE_ES: PageSEO = {
  path: '/es',
  title: 'Calculadoras de presupuesto gratis: 50/30/20, alquiler y boda',
  description: 'Calculadoras de presupuesto gratuitas: reparte tu sueldo con la regla 50/30/20, divide el alquiler entre compañeros de piso, calcula el presupuesto de tu boda y tu dinero disponible. Sin registro.',
  h1: 'Calculadoras de presupuesto familiar gratuitas',
  intro: 'Cómo repartir el sueldo, cómo dividir el alquiler, cuánto ahorrar para la boda, cuánto queda después de los gastos fijos: cuatro calculadoras gratuitas en euros, pesos, soles o dólares. Sin registro: tus datos se quedan en tu dispositivo.',
  links: [{ href: '/es/plantilla-presupuesto-familiar', label: 'Plantilla de presupuesto familiar gratuita (Excel y PDF)' }, ...ES_TOOLS.map((tool) => ({ href: tool.path, label: tool.label })), { href: '/signup', label: 'Crear una cuenta gratis en Budget Famille (en inglés)' }],
  sections: [
    { h2: 'Cómo hacer un presupuesto familiar en 4 pasos', text: 'Suma los ingresos netos del mes; apunta los gastos fijos: alquiler o hipoteca, luz, agua y gas, transporte, seguros; divide entre 12 los gastos anuales; y ahorra primero, el día que cobras, empezando por un fondo de emergencia de 3 a 6 meses de gastos esenciales.' },
    { h2: 'Un presupuesto a solas o en compañía', text: 'Budget Famille es una aplicación de presupuesto gratuita, para usar a solas o compartir con tu pareja, tu familia o tus compañeros de piso: fondo común, dinero de bolsillo de cada persona y objetivos de ahorro con fecha. La aplicación está disponible en inglés y en francés.' },
  ],
  priority: 0.8,
  changefreq: 'monthly',
};
