// src/seo/es/faq-leftover-income.ts
// FAQ of the Spanish page /es/calculadora-dinero-disponible: shown on the page
// and published as FAQPage structured data, so both always say the same thing.
// Kept apart from the page's metadata (leftover-income.ts), which the main
// bundle carries for every route. Amounts carry no currency.

import type { FaqItem } from '../faq';

export const LEFTOVER_INCOME_FAQ_ES: FaqItem[] = [
  {
    q: '¿Cómo calculo cuánto dinero me queda al mes?',
    a: 'Suma los ingresos netos del hogar (sueldos después de impuestos y cotizaciones, ayudas y prestaciones, otros ingresos) y resta los gastos fijos del mes: alquiler o hipoteca, cuotas de otros préstamos, luz, agua y gas, seguros, internet y móvil, transporte, guardería y los impuestos que no se descuentan de la nómina. Lo que queda es tu dinero disponible: lo que tienes para la compra, la ropa, el ocio y el ahorro. Por ejemplo, con 6.000 netos al mes y 3.700 de gastos fijos, quedan 2.300.',
  },
  {
    q: '¿Es lo mismo que la renta disponible?',
    a: 'No. En las estadísticas, la renta disponible es lo que queda de los ingresos después de impuestos y cotizaciones. El dinero disponible de esta calculadora va un paso más allá: descuenta también el alquiler o la hipoteca, la luz y los demás gastos fijos, así que refleja lo que de verdad puedes decidir cada mes, para gastar o para ahorrar.',
  },
  {
    q: '¿La compra del supermercado es un gasto fijo?',
    a: 'No. La compra, la ropa y el ocio son justo lo que se paga con el dinero disponible. Los gastos fijos son los que vuelven cada mes y cuesta cambiar a corto plazo, como el alquiler, las cuotas de los préstamos y los seguros.',
  },
  {
    q: '¿Cuánto dinero disponible por persona es suficiente?',
    a: 'No hay una cifra única: depende del coste de vida de tu ciudad y de tu hogar. Divide tu dinero disponible entre el número de personas y compáralo con lo que se gasta de verdad en casa en comida y en el día a día. Para comparar hogares de distinto tamaño, las estadísticas usan la escala de la OCDE modificada: 1 para el primer adulto, 0,5 para cada persona adicional de 14 años o más y 0,3 para cada menor de 14.',
  },
  {
    q: '¿Qué parte de los ingresos puede ir a la vivienda?',
    a: 'Una referencia habitual es no pasar de alrededor del 30 % de los ingresos. El umbral viene de las estadísticas oficiales de Estados Unidos: un hogar que dedica más del 30 % de sus ingresos a la vivienda se considera sobrecargado por ese gasto (Oficina del Censo). Para una hipoteca, cada banco aplica sus propios criterios.',
  },
  {
    q: '¿Cómo repartir los ingresos del mes?',
    a: 'Una referencia muy usada es la regla 50/30/20: alrededor del 50 % de los ingresos netos para necesidades (vivienda, facturas, compra, pago mínimo de los préstamos), 30 % para deseos y 20 % para ahorro. Calcula primero tu dinero disponible con esta calculadora y después mira el reparto con la calculadora de presupuesto 50/30/20.',
  },
  {
    q: '¿Se guardan mis datos?',
    a: 'No en nuestros servidores. El cálculo se hace en tu navegador y los importes no se envían. Se guardan solo en tu dispositivo, para que los encuentres la próxima vez, y el botón «Borrar» los elimina.',
  },
];
