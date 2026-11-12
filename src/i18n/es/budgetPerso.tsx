// src/i18n/es/budgetPerso.tsx
// Words of the 50/30/20 calculator in Spanish (/es/calculadora-presupuesto-50-30-20).
// Localized rather than translated, in a Spanish read the same way in Spain
// and in Latin America: « ingresos netos » for take-home pay, « necesidades,
// deseos y ahorro » for the three shares, taxes paid by yourself (not withheld
// everywhere), help links verified for Spain and a neutral sentence for the
// other countries. The example is the English one (same figures in every
// language), scaled to the visitor's currency by the page (src/i18n/format.ts).

import type { BudgetPersoCopy } from '@/components/tools/BudgetPersoCalculator';
import { EXAMPLE_EN } from '@/i18n/en/budgetPerso';

const link = 'font-medium text-primary hover:underline';

export const BUDGET_PERSO_ES: BudgetPersoCopy = {
  incomes: {
    salaire: { label: 'Sueldo neto', hint: 'Lo que llega a tu cuenta cada mes, después de impuestos y cotizaciones' },
    autres: { label: 'Otros ingresos', hint: 'Ayudas, pensión de alimentos, trabajos extra, alquileres cobrados…' },
  },
  needs: {
    logement: { label: 'Vivienda', hint: 'Alquiler o cuota de la hipoteca, gastos de comunidad incluidos' },
    energie: { label: 'Luz, agua y gas', hint: 'Electricidad, gas, calefacción, agua' },
    telecom: { label: 'Internet y móvil' },
    transport: { label: 'Transporte', hint: 'Abono de transporte, gasolina de los trayectos habituales' },
    assurances: { label: 'Seguros', hint: 'Hogar, coche, salud' },
    credits: { label: 'Préstamos (sin la hipoteca)', hint: 'Coche, préstamo personal, pago mínimo de las tarjetas' },
    courses: { label: 'Compra de alimentación', hint: 'Comida y productos básicos del hogar' },
    sante: { label: 'Gastos de salud a tu cargo' },
    enfants: { label: 'Guardería e hijos', hint: 'Guardería, comedor escolar, material y cuotas del colegio' },
    impots: { label: 'Impuestos que pagas aparte', hint: 'Los que no se descuentan de la nómina: importe anual ÷ 12' },
    autres: { label: 'Otros gastos esenciales' },
  },
  example: EXAMPLE_EN,
  calculatorLabel: 'Calculadora',
  incomeTitle: 'Ingresos netos al mes',
  seeExample: 'Ver el ejemplo',
  needsTitle: 'Gastos esenciales al mes',
  needsIntro: '«Necesidades»: lo que tienes que pagar pase lo que pase para tener techo, comer, ir a trabajar y estar asegurado.',
  moreNeeds: 'Más: salud, hijos, impuestos…',
  annualNote: '¿Un gasto anual (un impuesto, un seguro que se paga una vez al año, una suscripción anual)? Divídelo entre 12. Salir a comer, el ocio y las compras no son necesidades: son deseos, y la regla les reserva su parte.',
  savingsTitle: 'Lo que ya ahorras',
  optional: 'Opcional',
  savingsLabel: 'Importe que ya apartas cada mes',
  savingsHint: 'Transferencias a una cuenta de ahorro, objetivos de ahorro… Déjalo vacío si estás empezando: también vale.',
  resultTitle: 'Después de tus gastos esenciales',
  perMonth: '/mes',
  emptyResult: 'Indica tus ingresos netos y tus gastos esenciales: tu presupuesto 50/30/20 aparece aquí mientras escribes.',
  deficit: (gap) => `Tus gastos esenciales superan tus ingresos en ${gap} al mes.`,
  summary: (income, needs) => `de ${income} de ingresos, después de ${needs} de necesidades`,
  needsShare: (share, within) => (
    <>Tus necesidades: <strong>{share}</strong> de tus ingresos, {within ? 'dentro de la referencia del 50 %' : 'por encima de la referencia del 50 %'}.</>
  ),
  labels: { needs: 'Necesidades', wants: 'Deseos', savings: 'Ahorro', margin: 'Margen libre' },
  comparison: {
    rule: 'Referencia 50/30/20',
    yours: 'Tu presupuesto',
    caption: 'Tu presupuesto mensual comparado con la regla 50/30/20',
    item: 'Categoría',
    benchmark: 'Referencia',
  },
  deficitHelp: {
    title: 'No es un callejón sin salida: cómo reequilibrar',
    intro: 'Primero revisa los importes (¿un gasto anual sin dividir entre 12?) y después:',
    items: [
      <>Empieza por los gastos fijos más grandes: alquiler, préstamos, seguros, tarifa del móvil. Compara ofertas o pregunta si puedes renegociarlos.</>,
      <>Comprueba a qué ayudas puedes tener derecho en la web oficial de tu gobierno o de tu ayuntamiento.</>,
      <>Si las deudas aprietan, acude a un servicio de asesoramiento gratuito y sin ánimo de lucro de tu país. En España, el <a href="https://clientebancario.bde.es/" target="_blank" rel="noopener" className={link}>Portal del Cliente Bancario</a> del Banco de España explica tus derechos frente al banco.</>,
      <>Para repasar lo básico: <a href="https://www.finanzasparatodos.es/" target="_blank" rel="noopener" className={link}>Finanzas para Todos</a>, el portal de educación financiera del Banco de España y la CNMV, es gratuito.</>,
    ],
  },
  tiles: { wantsPerDay: 'Deseos por día', ofIncome: (share) => `${share} de los ingresos`, perDayNote: 'en 30 días' },
  within: (margin) => (
    <>
      Tus necesidades no pasan del 50 %: la regla se aplica tal cual, 30 % para deseos y 20 % para ahorro.
      {margin && <> Los {margin} de más son <strong>margen libre</strong>: más ahorro, un objetivo o algún deseo más, tú decides.</>}
    </>
  ),
  trimmed: (maxNeedsShare) => (
    <>
      Tus necesidades superan el 50 %: pasa enseguida cuando el alquiler es alto, y no es un error. Primero se reducen
      los deseos y el ahorro se mantiene en el 20 %, siempre que los deseos no queden por debajo del ahorro (hasta
      un {maxNeedsShare} de necesidades).
    </>
  ),
  shared: (needsShare, savings) => (
    <>
      Con un {needsShare} destinado a necesidades, mantener el 20 % de ahorro dejaría menos para deseos que para
      ahorrar. Por eso lo que queda se reparte en dos mitades iguales: tu <strong>ahorro posible</strong> es
      de {savings} al mes. Si sigue siendo demasiado, una cantidad pequeña y regular ya cuenta.
    </>
  ),
  howSplit: 'Cómo se calcula este reparto',
  ruleAnchor: 'regla',
  current: (saved, share) => <>Ya apartas <strong>{saved}</strong> al mes (el {share} de tus ingresos).</>,
  currentOver: 'Es más de lo que queda después de tus necesidades: revisa los importes.',
  currentGap: (gap) => `Para llegar a la sugerencia: ${gap} más al mes, a tu ritmo.`,
  currentReached: 'Ya alcanzas la sugerencia: muy bien.',
  signup: {
    title: 'Sigue este presupuesto cada mes, a solas o en compañía',
    text: 'Budget Famille rellena cada mes a partir de tus gastos fijos (mensuales, de algunos meses o anuales), con objetivos de ahorro que tienen un importe y una fecha. Más adelante puedes invitar a tu pareja o a tus compañeros de piso. Gratis y sin conectar tu banco. La aplicación está disponible en inglés y en francés.',
    cta: 'Crear mi presupuesto gratis',
  },
  reset: 'Borrar',
  share: {
    button: 'Compartir la calculadora',
    copied: 'Enlace copiado',
    url: 'https://www.budgetfamille.com/es/calculadora-presupuesto-50-30-20',
    title: 'Calculadora de presupuesto 50/30/20',
    text: 'Una calculadora gratuita para hacer tu presupuesto con la regla 50/30/20.',
  },
  sticky: { label: 'Después de tus necesidades', details: 'Ver el detalle' },
};
