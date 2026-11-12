// src/seo/es/leftover-income.ts
// The Spanish leftover income calculator (/es/calculadora-dinero-disponible):
// its head and prerendered summary, and its structured-data names (its FAQ is
// in faq-leftover-income.ts). Plain text; the prerendered example is in euros,
// as the page shows it by default (RAV_EXAMPLE_EN computed with
// computeResteAVivre, written with formatEs('EUR')).

import type { PageSEO } from '../site';

export const LEFTOVER_INCOME_PAGE_ES: PageSEO = {
  path: '/es/calculadora-dinero-disponible',
  title: 'Calculadora de dinero disponible: ¿cuánto te queda al mes?',
  description: 'Calculadora gratuita: indica tus ingresos netos y tus gastos fijos (alquiler o hipoteca, luz, seguros, préstamos) y mira cuánto dinero te queda al mes, por persona y por día. En euros, pesos, soles o dólares.',
  h1: 'Calculadora de dinero disponible',
  intro: '¿Cuánto te queda del sueldo después de los gastos fijos? Indica los ingresos netos y los gastos fijos de tu hogar y mira tu dinero disponible al mes, por persona y por día. Gratis y sin registro: tus datos se quedan en tu dispositivo.',
  sections: [
    { h2: '¿Cómo se calcula el dinero disponible?', text: 'Dinero disponible = ingresos netos del mes − gastos fijos del mes. Ingresos: sueldos netos, ayudas y prestaciones, pensiones, pensión de alimentos recibida, alquileres cobrados. Gastos fijos: alquiler o hipoteca, otros préstamos, luz, agua y gas, seguros, internet, móvil y suscripciones, transporte, guardería y gastos escolares, impuestos que no se descuentan de la nómina, pensión de alimentos que pagas. La compra, la ropa y el ocio no son gastos fijos: son lo que paga tu dinero disponible. Tampoco es la renta disponible de las estadísticas, que solo descuenta impuestos y cotizaciones.' },
    { h2: 'Un ejemplo', text: 'En nuestro ejemplo ficticio, la familia García, una pareja con dos hijos de 6 y 10 años, ingresa 6.000 € netos al mes. Alquiler 1.800 €, préstamo del coche 400 €, luz, agua y gas 250 €, seguros 300 €, internet y móvil 150 €, transporte 200 €, guardería y gastos escolares 600 €: 3.700 € de gastos fijos. Le quedan 2.300 € al mes, es decir, 575 € por persona y unos 77 € al día.' },
    { h2: '¿Por persona o por adulto equivalente?', text: 'Para comparar hogares de distinto tamaño, las estadísticas dividen entre el número de adultos equivalentes, con la escala de la OCDE modificada: 1 para el primer adulto, 0,5 para cada persona adicional de 14 años o más y 0,3 para cada menor de 14. Una pareja con dos niños equivale a 2,1 adultos: en el ejemplo, 1.095 € por adulto equivalente.' },
    { h2: '¿Cuánto dinero disponible es suficiente?', text: 'No hay un mínimo válido en todas partes: depende del coste de vida de tu ciudad y de tu hogar. Una referencia habitual es que el alquiler o la hipoteca no pasen de alrededor del 30 % de los ingresos; la regla 50/30/20 propone mantener las necesidades en torno a la mitad de los ingresos netos.' },
    { h2: 'Cómo aumentar tu dinero disponible', text: 'Compara una a una las tarifas de luz, internet, móvil y seguros; comprueba a qué ayudas tienes derecho; reparte en doce meses los gastos anuales; en pareja, con ingresos muy distintos, reparte los gastos comunes en proporción a los ingresos; y si las cuentas no salen, acude a un servicio de asesoramiento sobre deudas gratuito y sin ánimo de lucro.' },
  ],
  priority: 0.8,
  changefreq: 'monthly',
};

/** Structured data: the WebApplication's name and the breadcrumb label. */
export const LEFTOVER_INCOME_TOOL_ES = { name: 'Calculadora de dinero disponible', crumb: 'Dinero disponible' };
