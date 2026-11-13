// src/i18n/es/colocation.tsx
// Words of the rent and bills split in Spanish (/es/calculadora-dividir-alquiler).
// Localized rather than translated: « alquiler » everywhere, with « renta » and
// « arriendo » named where a reader of Mexico, Chile or Colombia looks for
// them, « compañeros de piso », « fondo común », bedroom sizes in m², and no
// country's tenancy law presented as the rule.

import type { ColocCopy } from '@/components/tools/ColocationCalculator';
import type { ColocInput } from '@/lib/tools/colocation';
import { colocExampleEn } from '@/i18n/en/colocation';

const NAMES = ['Lucía', 'Mateo', 'Sofía'];

/**
 * Fictitious example: the English one (same rent, bills, incomes and bedroom
 * sizes, 10, 13 and 17 m²) with Spanish first names.
 */
export function colocExampleEs(): ColocInput {
  const example = colocExampleEn('m²');
  return { ...example, roommates: example.roommates.map((m, i) => ({ ...m, name: NAMES[i] ?? `Compañero ${i + 1}` })) };
}

export const COLOCATION_ES: ColocCopy = {
  calculatorLabel: 'Calculadora',
  householdTitle: 'Tu piso compartido',
  seeExample: 'Ver el ejemplo',
  roommates: 'Compañeros de piso',
  roommatesLess: 'Quitar un compañero',
  roommatesMore: 'Añadir un compañero',
  mateName: (i) => `Compañero ${i + 1}`,
  nameLabel: 'Nombre o apodo',
  roomLabel: 'Habitación',
  incomeLabel: 'Ingresos netos',
  billsTitle: 'Alquiler y gastos del mes',
  rent: { label: 'Alquiler', hint: 'El alquiler total de la vivienda (renta o arriendo), gastos de comunidad incluidos' },
  bills: {
    energie: { label: 'Luz y gas', hint: 'El total de la vivienda, al mes' },
    internet: { label: 'Internet' },
    assurance: { label: 'Seguro del hogar', hint: 'Si hay una póliza compartida' },
    courses: { label: 'Compra común', hint: 'Productos de limpieza, papel higiénico, aceite, sal…' },
    autres: { label: 'Otros gastos comunes', hint: 'Plataformas, agua si no está incluida…' },
  },
  billsNote: '¿Una factura cada dos meses o una vez al año? Pásala a un mes (÷ 2, ÷ 12). Los gastos comunes se reparten a partes iguales.',
  methodTitle: 'Cómo dividir el alquiler',
  methodLegend: 'Método',
  methods: {
    egal: { label: 'A partes iguales', hint: 'Habitaciones parecidas' },
    chambre: { label: 'Por habitación', hint: 'Tamaños distintos' },
    revenus: { label: 'Según los ingresos', hint: 'Ingresos desiguales' },
  },
  methodHelp: (method, commonShare) => ({
    egal: 'Cada persona paga la misma parte del alquiler. Sencillo y justo cuando las habitaciones se parecen.',
    chambre: `El ${commonShare} del alquiler corresponde a las zonas comunes y se reparte a partes iguales; el resto sigue el tamaño de cada habitación.`,
    revenus: 'Cada persona paga el alquiler en proporción a sus ingresos netos. Útil cuando los ingresos son muy distintos.',
  })[method],
  perMonth: '/mes',
  resultTitle: 'Lo que paga cada persona, al mes',
  emptyResult: 'Indica el alquiler y los gastos: la parte de cada persona aparece aquí mientras escribes.',
  shareDetail: (rent, bills, ratio) => `alquiler ${rent} + gastos ${bills} · ${ratio} del total`,
  fallback: {
    rooms: 'Indica el tamaño de cada habitación: mientras tanto, el alquiler se reparte a partes iguales.',
    incomes: 'Indica los ingresos netos de cada compañero: mientras tanto, el alquiler se reparte a partes iguales.',
  },
  tiles: { rent: 'Alquiler', bills: 'Gastos', total: 'Total de la vivienda' },
  potTip: 'Lo más sencillo: cada persona ingresa su parte en una cuenta o un fondo común a principios de mes, y de ahí se pagan el alquiler y los gastos.',
  signup: {
    title: 'Lleva el piso compartido en un presupuesto compartido',
    text: 'Crea un presupuesto para la vivienda e invita a tus compañeros por correo electrónico: cada persona ve en tiempo real lo que aporta al fondo común. Gratis. La aplicación está disponible en inglés y en francés.',
    cta: 'Crear mi presupuesto gratis',
  },
  reset: 'Borrar',
  share: {
    button: 'Compartir con tus compañeros',
    copied: 'Enlace copiado',
    url: 'https://www.budgetfamille.com/es/calculadora-dividir-alquiler',
    title: 'Calculadora para dividir el alquiler',
    text: 'Una calculadora gratuita para dividir el alquiler y los gastos entre compañeros de piso.',
  },
  sticky: { total: (amount) => `Total de la vivienda: ${amount}`, details: 'Detalle' },
};
