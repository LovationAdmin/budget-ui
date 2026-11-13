// src/seo/es/faq-budget-503020.ts
// FAQ of the Spanish page /es/calculadora-presupuesto-50-30-20: shown on the
// page and published as FAQPage structured data, so both always say the same
// thing. Kept apart from the page's metadata (budget-503020.ts), which the
// main bundle carries for every route. Amounts carry no currency: they read
// the same in euros, pesos, soles or dollars.

import type { FaqItem } from '../faq';

export const BUDGET_503020_FAQ_ES: FaqItem[] = [
  {
    q: '¿Qué es la regla 50/30/20?',
    a: 'Una referencia sencilla para repartir los ingresos netos: 50 % para necesidades (vivienda, facturas, compra de alimentación, pago mínimo de los préstamos), 30 % para deseos (salir a comer, ocio, compras, viajes) y 20 % para ahorrar y adelantar deudas. Se hizo popular con el libro «All Your Worth» (2005), de la senadora estadounidense Elizabeth Warren y su hija Amelia Warren Tyagi. Es un punto de partida, no una obligación.',
  },
  {
    q: '¿Cómo repartir mi sueldo con la regla 50/30/20?',
    a: 'Multiplica tus ingresos netos del mes por 0,5, por 0,3 y por 0,2: obtienes la referencia para necesidades, deseos y ahorro. Con 4.000 netos al mes, por ejemplo: 2.000 para necesidades, 1.200 para deseos y 800 de ahorro. Después compara esa referencia con lo que tus necesidades cuestan de verdad: ahí es donde el cálculo resulta útil.',
  },
  {
    q: '¿La regla 50/30/20 se calcula sobre el sueldo bruto o el neto?',
    a: 'Sobre el neto. Lo más sencillo es partir de lo que llega a tu cuenta cada mes, después de impuestos y cotizaciones, y sumar las ayudas u otros ingresos regulares. Si pagas tú algún impuesto que no se descuenta de la nómina, divide el importe anual entre 12 y apúntalo en «Impuestos que pagas aparte».',
  },
  {
    q: '¿Qué hago si mis necesidades superan el 50 %?',
    a: 'No es un fracaso: con un alquiler alto se supera enseguida. La calculadora reduce primero los deseos y mantiene el ahorro en el 20 % mientras las necesidades no pasen del 60 % de los ingresos; por encima, reparte lo que queda en dos mitades, una para deseos y otra para ahorro. Para ganar margen, compara tus facturas, comprueba a qué ayudas tienes derecho y, si hace falta, acude a un servicio de asesoramiento gratuito y sin ánimo de lucro.',
  },
  {
    q: '¿Cuánto debería ahorrar al mes?',
    a: 'La regla 50/30/20 propone el 20 % de los ingresos netos, pero no hay una cifra única: depende de tus gastos y de tus objetivos. Si hoy no llegas al 20 %, empieza con poco, con una transferencia automática el día que cobras, y súbela cuando aumenten tus ingresos. El primer paso habitual es un fondo de emergencia que cubra varios meses de gastos esenciales.',
  },
  {
    q: '¿Se guardan mis datos?',
    a: 'No en nuestros servidores. El cálculo se hace en tu navegador y los importes no se envían. Se guardan solo en tu dispositivo, para que los encuentres la próxima vez, y el botón «Borrar» los elimina.',
  },
];
