// src/seo/es/faq-home.ts
// FAQ of the Spanish page /es: shown on the page and published as FAQPage
// structured data, so both always say the same thing. Kept apart from the
// page's metadata (home.ts), which the main bundle carries for every route.

import type { FaqItem } from '../faq';

export const HOME_FAQ_ES: FaqItem[] = [
  {
    q: '¿Las calculadoras son realmente gratuitas?',
    a: 'Sí. Las cuatro calculadoras se usan gratis, sin registro y sin publicidad. Los importes que escribes se guardan solo en el navegador de tu dispositivo: no se envían a nuestros servidores.',
  },
  {
    q: '¿En qué monedas funcionan?',
    a: 'En euros, pesos mexicanos, pesos colombianos, pesos argentinos, pesos chilenos, soles y dólares. La calculadora elige la moneda según tu zona horaria y escribe los importes como en tu país; puedes cambiarla cuando quieras y tu elección se guarda en tu dispositivo.',
  },
  {
    q: '¿Cómo se hace un presupuesto familiar?',
    a: 'Suma primero los ingresos netos del mes. Apunta después los gastos fijos (alquiler o hipoteca, luz, agua y gas, internet y móvil, transporte, seguros, préstamos), divide entre 12 los gastos que pagas una vez al año y calcula lo que gastas en la compra y en ocio. Aparta el ahorro el día que cobras, en lugar de ahorrar «lo que sobre» a fin de mes. La calculadora de presupuesto 50/30/20 te guía paso a paso.',
  },
  {
    q: '¿Sirve la regla 50/30/20 si el alquiler es muy alto?',
    a: 'Sirve como referencia, no como obligación. En las ciudades caras es habitual que las necesidades pasen de la mitad de los ingresos. La calculadora reduce primero los deseos para mantener el 20 % de ahorro; cuando las necesidades superan el 60 % de los ingresos, reparte lo que queda a medias entre deseos y ahorro.',
  },
  {
    q: '¿Qué es Budget Famille? ¿Está en español?',
    a: 'Budget Famille es una aplicación de presupuesto gratuita, para usar a solas o compartir con tu pareja, tu familia o tus compañeros de piso: gastos fijos, fondo común, dinero de bolsillo de cada persona y objetivos de ahorro con fecha. La aplicación está disponible en inglés y en francés; las calculadoras gratuitas de este sitio están en español.',
  },
];
