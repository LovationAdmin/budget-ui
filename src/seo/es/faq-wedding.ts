// src/seo/es/faq-wedding.ts
// FAQ of the Spanish page /es/calculadora-presupuesto-boda: shown on the page
// and published as FAQPage structured data, so both always say the same thing.
// Kept apart from the page's metadata (wedding.ts), which the main bundle
// carries for every route. Amounts carry no currency.

import type { FaqItem } from '../faq';

export const WEDDING_FAQ_ES: FaqItem[] = [
  {
    q: '¿Cómo se calcula el presupuesto de una boda?',
    a: 'Haz la lista de partidas (banquete, bebidas, lugar de celebración, vestido, traje y belleza, fotografía y vídeo, música, flores y decoración, alianzas, invitaciones, luna de miel), pide presupuestos y separa lo que se paga por invitado (banquete y bebidas) de los gastos fijos. Presupuesto de boda = precio por invitado × número de invitados + gastos fijos + imprevistos. La calculadora de esta página hace la cuenta.',
  },
  {
    q: '¿Cuánto cuesta una boda?',
    a: 'No hay una respuesta única ni un precio medio oficial: el total depende sobre todo del número de invitados y del precio del banquete, y después del lugar, la ciudad y la temporada. Con 100 invitados, cada 10 más por invitado en banquete y bebidas son 1.000 más en el total. Parte de tus propios presupuestos: precio por invitado por número de invitados, más los gastos fijos y un margen para imprevistos.',
  },
  {
    q: '¿Cómo calcular el precio por invitado?',
    a: 'Divide el presupuesto total entre el número de invitados. Para el banquete, los restaurantes y fincas suelen dar un precio por cubierto: comprueba si incluye las bebidas, la barra libre, el servicio y los impuestos, si hay un mínimo de invitados y cuánto cuestan los menús infantiles.',
  },
  {
    q: '¿Cuánto hay que ahorrar al mes para una boda?',
    a: 'Ahorro mensual = (presupuesto total − lo ya ahorrado) ÷ meses que faltan. Se cuenta desde este mes hasta el mes anterior a la boda, para que el dinero esté listo antes del día. El importe se redondea hacia arriba. Por ejemplo, para reunir 18.000 en 18 meses hay que apartar 1.000 al mes.',
  },
  {
    q: '¿Se puede contar con los regalos de los invitados?',
    a: 'Es mejor no contarlos por adelantado. Los regalos en dinero pueden cubrir una parte de los gastos, pero llegan el día de la boda o después, su importe es difícil de prever y muchos pagos (señales, anticipos) vencen antes. Mira las fechas de pago de cada presupuesto para saber cuándo debe estar el dinero, y usa los regalos para reponer tu ahorro. Si piensas en un préstamo, comprueba antes que la cuota cabe en el presupuesto de la pareja después de la boda.',
  },
  {
    q: '¿Quién paga la boda?',
    a: 'No hay una regla: la pareja, las familias o entre todos, y a veces alguien se hace cargo de una partida concreta, como el banquete o el vestido. Lo mejor es hablarlo antes de firmar el primer presupuesto: quién aporta, cuánto y cuándo.',
  },
  {
    q: '¿Qué gastos de boda se suelen olvidar?',
    a: 'Las bebidas que no entran en el menú, las horas extra del lugar o de la música, el transporte y el alojamiento de familiares, los arreglos del vestido y las pruebas de peluquería y maquillaje, las fotos adicionales, los detalles para los invitados, los trámites y las compras de última hora. Por eso conviene reservar una partida de imprevistos.',
  },
  {
    q: '¿Se guardan mis datos?',
    a: 'No en nuestros servidores. El cálculo se hace en tu navegador y los importes no se envían. Se guardan solo en tu dispositivo, para que los encuentres la próxima vez, y el botón «Borrar» los elimina.',
  },
];
