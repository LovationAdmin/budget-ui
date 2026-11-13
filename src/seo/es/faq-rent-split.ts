// src/seo/es/faq-rent-split.ts
// FAQ of the Spanish page /es/calculadora-dividir-alquiler: shown on the page
// and published as FAQPage structured data, so both always say the same thing.
// Kept apart from the page's metadata (rent-split.ts), which the main bundle
// carries for every route. Amounts carry no currency.

import type { FaqItem } from '../faq';

export const RENT_SPLIT_FAQ_ES: FaqItem[] = [
  {
    q: '¿Cómo dividir el alquiler de forma justa entre compañeros de piso?',
    a: 'Hay tres métodos habituales: a partes iguales; por tamaño de habitación (una parte del alquiler corresponde al salón, la cocina y el baño, y se reparte a partes iguales; el resto sigue los metros de cada habitación); y en proporción a los ingresos. Lo importante es decidirlo entre todos antes de mudarse y dejarlo por escrito.',
  },
  {
    q: '¿Cómo se calcula el alquiler por tamaño de habitación?',
    a: 'Primero se reparte a partes iguales una parte del alquiler, porque el salón, la cocina y el baño los usa todo el mundo; el resto se reparte en proporción a los metros de cada habitación. Por ejemplo, tres personas con un alquiler de 2.700: la mitad se reparte a partes iguales, 450 cada una; los otros 1.350 siguen el tamaño: con habitaciones de 10, 13 y 17 m², cada persona suma 337,50, 438,75 y 573,75.',
  },
  {
    q: '¿Conviene dividir el alquiler según los ingresos?',
    a: 'Puede ser más justo cuando los ingresos son muy distintos: cada persona dedica al alquiler la misma proporción de sus ingresos netos. Es más frecuente en pareja que entre amigos. Sea cual sea el método, conviene acordarlo antes de mudarse y dejarlo por escrito.',
  },
  {
    q: '¿Cómo repartir la luz, el agua e internet?',
    a: 'La luz, el gas, el agua, internet, el seguro compartido y la compra común suelen repartirse a partes iguales. Si alguien consume claramente más, por ejemplo porque teletrabaja con la calefacción o el aire acondicionado todo el día, se puede acordar que pague algo más. Lo más sencillo es un fondo común: cada persona ingresa su parte a principios de mes y de ahí se pagan los gastos comunes; los gastos personales van aparte.',
  },
  {
    q: '¿Cómo se reparte la fianza o el depósito?',
    a: 'A partes iguales o en la misma proporción que el alquiler. Conviene anotar quién pagó cuánto y qué pasa si alguien se va antes de tiempo: una opción es que la persona que entra le pague su parte a la que sale; al dejar la vivienda, la fianza se devuelve según lo que puso cada uno, descontando lo que corresponda.',
  },
  {
    q: '¿Qué pasa si un compañero no paga su parte?',
    a: 'Depende del contrato y de las leyes de tu país. Cuando todos firman el mismo contrato, lo habitual es que cada persona responda del alquiler completo, y el propietario puede reclamar a los demás lo que falte. Con un contrato por habitación, cada persona suele responder solo de su parte. Lee bien tu contrato y acuerda por escrito qué pasa cuando alguien se va.',
  },
  {
    q: '¿Se guardan mis datos?',
    a: 'No en nuestros servidores. El cálculo se hace en tu navegador y los importes no se envían. Se guardan solo en tu dispositivo, para que los encuentres la próxima vez, y el botón «Borrar» los elimina.',
  },
];
