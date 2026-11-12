// src/i18n/es/mariage.tsx
// Words of the wedding budget calculator in Spanish
// (/es/calculadora-presupuesto-boda). Same fictitious example as the French
// and English pages (src/lib/tools/mariage.ts), labelled as such, in the
// visitor's currency. Written for readers of Spain and Latin America: the
// banquet is quoted per guest (« por cubierto », « por invitado »), and no
// average or market price is given.

import type { MariageCopy } from '@/components/tools/MariageCalculator';

const months = new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' });

export const MARIAGE_ES: MariageCopy = {
  posts: {
    lieu: { label: 'Lugar de celebración', hint: 'Alquiler de la finca o del salón, mobiliario incluido si se cobra aparte' },
    traiteur: { label: 'Banquete', hint: 'Menú y servicio, precio por invitado (cubierto)' },
    boissons: { label: 'Bebidas y barra libre', hint: 'Cóctel, vino, refrescos, barra libre: precio por invitado' },
    tenues: { label: 'Vestido, traje y belleza', hint: 'Vestido, traje, complementos, peluquería, maquillaje' },
    photo: { label: 'Fotografía y vídeo' },
    musique: { label: 'Música / DJ', hint: 'DJ, grupo, equipo de sonido' },
    deco: { label: 'Flores y decoración', hint: 'Ramo, centros de mesa, alquiler de decoración' },
    alliances: { label: 'Alianzas' },
    papeterie: { label: 'Invitaciones y papelería', hint: 'Invitaciones, minutas, plano de mesas, detalles para los invitados' },
    voyage: { label: 'Luna de miel', hint: 'Opcional' },
    autres: { label: 'Imprevistos y varios', hint: 'Un margen para lo que se olvida: arreglos del vestido, transporte, compras de última hora' },
  },
  guests: (n) => `${n} invitado${n > 1 ? 's' : ''}`,
  monthLabel: (ym) => months.format(new Date(ym.year, ym.month - 1, 1)),
  calculatorLabel: 'Calculadora',
  weddingTitle: 'Tu boda',
  guestsLabel: 'Número de invitados',
  guestsHint: 'Adultos y niños en el banquete',
  guestsLess: 'Quitar un invitado',
  guestsMore: 'Añadir un invitado',
  minus10: 'Quitar 10 invitados',
  plus10: 'Añadir 10 invitados',
  dateLabel: 'Fecha de la boda',
  dateHint: 'Mes y año, para calcular cuánto ahorrar cada mes',
  datePlaceholder: 'aaaa-mm',
  savedLabel: 'Ya ahorrado',
  savedHint: 'Lo que ya has apartado para la boda, incluidas las señales ya pagadas',
  postsTitle: 'Gastos de la boda',
  postsIntro: 'Indica tus presupuestos: el total de cada partida, salvo el banquete y las bebidas, que van como precio por invitado. No existe un precio medio oficial: el total depende sobre todo del número de invitados y del banquete.',
  exampleNote: 'Ejemplo ficticio, sustitúyelo por tus presupuestos',
  exampleExplain: 'Estos importes redondos solo sirven para mostrar el cálculo: no son ni medias ni precios de mercado.',
  exampleBadge: 'ejemplo ficticio',
  confirmReplace: '¿Sustituir tus importes por el ejemplo ficticio?',
  morePosts: 'Más: alianzas, invitaciones, luna de miel',
  perGuestUnit: '/invitado',
  perGuestHint: (rate, guests, total) => `${rate} × ${guests} = ${total}`,
  resultTitle: 'Presupuesto total de la boda',
  emptyResult: 'Indica el número de invitados y tus presupuestos: el total aparece aquí mientras escribes.',
  forGuests: (guests, honeymoon) => `para ${guests}${honeymoon ? ', luna de miel incluida' : ''}`,
  tiles: {
    perGuest: 'Por invitado',
    perGuestNote: (honeymoon) => (honeymoon ? 'sin la luna de miel' : 'todo incluido'),
    guestLinked: 'Según los invitados',
    guestLinkedNote: (share) => `banquete + bebidas${share !== null ? ` · ${share}` : ''}`,
  },
  fixedPart: (amount, share) => (
    <>Parte fija: <strong className="text-foreground">{amount}</strong>{share !== null ? ` (${share})` : ''}, que no cambia con el número de invitados.</>
  ),
  savingTitle: 'Para apartar cada mes',
  perMonth: '/mes',
  plan: ({ months: n, from, to, remaining, total, saved }) => `${n === 1
    ? `Un solo ingreso, en ${from}`
    : `De ${from} a ${to}, ${n} ingresos`}, para reunir ${remaining}${saved ? ` (${total} − ${saved} ya ahorrados)` : ''}.`,
  covered: 'Lo que ya has ahorrado cubre este presupuesto: no hace falta apartar nada cada mes.',
  thisMonth: (remaining) => (remaining
    ? `La boda es este mes: ya no quedan meses para ahorrar, y faltan ${remaining}.`
    : 'La boda es este mes, y lo que has ahorrado cubre este presupuesto.'),
  past: 'Esta fecha ya pasó: indica el mes de la boda que viene.',
  noDateAction: 'Indica la fecha de la boda',
  noDateRest: 'para ver cuánto apartar cada mes.',
  fillExampleShort: 'Rellenar con un ejemplo ficticio',
  breakdownTitle: 'Desglose por partida',
  perGuestRate: (rate) => ` · ${rate} por invitado`,
  fewerTitle: (n) => `¿Y con ${n} invitado${n > 1 ? 's' : ''} menos?`,
  fewerText: ({ saving, total, before, guests }) => (
    <>
      El banquete y las bebidas bajan <strong>{saving}</strong>: {total} en lugar de {before} para {guests}. Es un
      mínimo: un lugar más pequeño, menos mesas y menos invitaciones pueden reducir también otras partidas.
    </>
  ),
  fewerNoRate: 'Indica el precio por invitado del banquete y de las bebidas para ver qué cambia con una lista más corta.',
  signup: {
    title: 'Prepara tu boda con un objetivo de ahorro',
    text: (year) => `En Budget Famille, crea un presupuesto aparte «Boda ${year}» o un objetivo de ahorro con un importe y una fecha: lo que hay que apartar cada mes se calcula solo, y puedes invitar a tu pareja. Gratis y sin conectar tu banco. La aplicación está disponible en inglés y en francés.`,
    cta: 'Crear mi presupuesto gratis',
  },
  reset: 'Borrar',
  share: {
    button: 'Compartir la calculadora',
    copied: 'Enlace copiado',
    url: 'https://www.budgetfamille.com/es/calculadora-presupuesto-boda',
    title: 'Calculadora de presupuesto de boda',
    text: 'Una calculadora gratuita para estimar el coste de tu boda y cuánto apartar cada mes.',
  },
  sticky: { label: (example) => `Presupuesto total${example ? ' (ejemplo ficticio)' : ''}`, details: 'Ver el detalle' },
};
