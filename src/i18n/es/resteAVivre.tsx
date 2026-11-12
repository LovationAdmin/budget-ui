// src/i18n/es/resteAVivre.tsx
// Words of the leftover income calculator in Spanish
// (/es/calculadora-dinero-disponible). Localized rather than translated:
// « dinero disponible » for what is left after fixed bills, income items kept
// generic (no country's benefits presented as the rule), and the per-unit
// figure on the OECD-modified equivalence scale. The example is the English
// one, scaled to the visitor's currency on the page, so every language
// publishes the same household.

import type { RavCopy, RavExample } from '@/components/tools/ResteAVivreCalculator';
import { RAV_EXAMPLE_EN } from '@/i18n/en/resteAVivre';

/** Fictitious example (the García family: a couple with two children aged 6 and 10), in dollars as in English. */
export const RAV_EXAMPLE_ES: RavExample = RAV_EXAMPLE_EN;

export const RESTE_A_VIVRE_ES: RavCopy = {
  calculatorLabel: 'Calculadora',
  seeExample: 'Ver el ejemplo',
  householdTitle: 'Tu hogar',
  adults: 'Adultos',
  kidsUnder14: 'Hijos menores de 14 años',
  teens: { label: 'Hijos de 14 años o más', hint: 'U otra persona a tu cargo' },
  stepper: { remove: (label) => `Menos: ${label}`, add: (label) => `Más: ${label}` },
  incomesTitle: 'Ingresos netos al mes',
  incomes: {
    salaires: { label: 'Sueldos e ingresos del trabajo', hint: 'Lo que llega a tu cuenta, después de impuestos y cotizaciones' },
    aides: { label: 'Ayudas y prestaciones', hint: 'Ayudas por hijos, a la vivienda, subsidios…' },
    autres: { label: 'Otros ingresos', hint: 'Pensión, pensión de alimentos recibida, alquileres cobrados…' },
  },
  chargesTitle: 'Gastos fijos al mes',
  charges: {
    loyer: { label: 'Alquiler', hint: 'Gastos de comunidad incluidos' },
    creditImmo: { label: 'Hipoteca', hint: 'Cuota mensual, con el seguro asociado' },
    credits: { label: 'Otros préstamos', hint: 'Coche, préstamo personal, pago mínimo de las tarjetas' },
    energie: { label: 'Luz, agua y gas', hint: 'Electricidad, gas, calefacción, agua' },
    assurances: { label: 'Seguros', hint: 'Hogar, coche, salud' },
    telecom: { label: 'Internet, móvil y suscripciones' },
    transport: { label: 'Transporte', hint: 'Abono de transporte, gasolina de los trayectos habituales' },
    enfants: { label: 'Guardería y gastos escolares' },
    impots: { label: 'Impuestos', hint: 'Los que no se descuentan de la nómina (los anuales, ÷ 12)' },
    pension: { label: 'Pensión de alimentos que pagas', hint: 'O una ayuda fija a un familiar' },
    autres: { label: 'Otros gastos fijos' },
  },
  moreCharges: 'Más gastos: transporte, guardería, impuestos, pensiones…',
  chargesNote: '¿Un gasto anual (un impuesto, un seguro que se paga una vez al año)? Divídelo entre 12. La compra, la ropa y el ocio no son gastos fijos: son justo lo que paga tu dinero disponible.',
  perMonth: '/mes',
  resultTitle: 'Tu dinero disponible',
  emptyResult: 'Indica tus ingresos y tus gastos fijos: el resultado aparece aquí mientras escribes.',
  deficit: (amount) => `Tus gastos fijos superan tus ingresos en ${amount} al mes.`,
  after: (charges, income) => `después de ${charges} de gastos fijos, de ${income} de ingresos`,
  deficitHelp: (
    <>
      <p className="font-semibold text-foreground">Cómo reequilibrar</p>
      <ul className="mt-2 space-y-1.5">
        <li>Revisa una a una las facturas más grandes y compara ofertas: luz, internet, móvil, seguros</li>
        <li>Comprueba a qué ayudas o deducciones puedes tener derecho, en la web oficial de tu gobierno</li>
        <li>Acude a un servicio de asesoramiento sobre deudas gratuito y sin ánimo de lucro de tu país: es confidencial</li>
      </ul>
    </>
  ),
  tiles: {
    perPerson: 'Por persona',
    persons: (n) => `${n} persona${n > 1 ? 's' : ''}`,
    perDay: 'Por día',
    perDayNote: 'en 30 días',
    perUnit: 'Por adulto equiv.',
    units: (n) => `${n} unidades (OCDE)`,
  },
  chargesShare: {
    label: 'Gastos fijos',
    ofIncome: (pct) => `${pct} de los ingresos`,
    aria: (pct) => `Gastos fijos: ${pct} de los ingresos`,
  },
  debt: {
    title: (pct) => `Cuotas de préstamos: ${pct} de los ingresos netos`,
    note: () => ({ tone: 'info', text: 'Los bancos aplican sus propios criterios, a menudo sobre los ingresos brutos: tómalo como una orientación. Cuanto más bajo, más margen tienes.' }),
  },
  signup: {
    title: 'Sigue cada mes lo que queda, en compañía',
    text: 'Budget Famille rellena cada mes a partir de tus gastos fijos, en tiempo real con tu pareja. Gratis. La aplicación está disponible en inglés y en francés.',
    cta: 'Crear mi presupuesto gratis',
  },
  reset: 'Borrar',
  share: {
    button: 'Compartir la calculadora',
    copied: 'Enlace copiado',
    url: 'https://www.budgetfamille.com/es/calculadora-dinero-disponible',
    title: 'Calculadora de dinero disponible',
    text: 'Una calculadora gratuita para ver lo que queda después de los gastos fijos, por persona y por día.',
  },
  sticky: { label: 'Dinero disponible', details: 'Ver el detalle' },
};
