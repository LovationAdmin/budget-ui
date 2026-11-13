// src/seo/es/template.ts
// The Spanish free budget template page (/es/plantilla-presupuesto-familiar):
// its PageSEO entry and its FAQ, shown on the page and published as FAQPage
// structured data. The files come from scripts/templates/make-template-es.*.
// Targets « plantilla presupuesto familiar excel gratis », « plantilla
// presupuesto mensual », « presupuesto familiar para imprimir pdf ».

import type { FaqItem } from '../faq';
import type { PageSEO } from '../site';

export const TEMPLATE_XLSX_ES = '/telechargements/plantilla-presupuesto-familiar.xlsx';
export const TEMPLATE_PDF_ES = '/telechargements/plantilla-presupuesto-familiar-imprimible.pdf';

export const TEMPLATE_PAGE_ES: PageSEO = {
  path: '/es/plantilla-presupuesto-familiar',
  title: 'Plantilla de presupuesto familiar gratis: Excel y PDF para imprimir',
  description: 'Plantilla de presupuesto familiar gratuita: Excel con cálculos automáticos (también en Google Sheets) o PDF para imprimir. Presupuesto mensual, ahorro y cuenta común. En cualquier moneda.',
  h1: 'Plantilla de presupuesto familiar gratuita',
  intro: 'Una plantilla sencilla para llevar el presupuesto mensual del hogar: ingresos, gastos, ahorro, y cómo reparte una pareja la cuenta común. En Excel las cuentas ya están hechas; el PDF se imprime y se rellena a mano.',
  links: [
    { href: TEMPLATE_XLSX_ES, label: 'Plantilla Excel (.xlsx)' },
    { href: TEMPLATE_PDF_ES, label: 'PDF para imprimir (A4, 3 páginas)' },
    { href: '/es/calculadora-presupuesto-50-30-20', label: 'Calculadora de presupuesto 50/30/20' },
    { href: '/es/calculadora-dinero-disponible', label: 'Calculadora de dinero disponible' },
    { href: '/signup', label: 'Crear una cuenta gratis en Budget Famille (en inglés)' },
  ],
  sections: [
    { h2: 'Qué incluye la plantilla', text: 'Tres pestañas: «Presupuesto del mes» (ingresos, 13 tipos de gastos, ahorro y el resto del mes ya calculado), «Fondo común» (lo que aporta cada persona de la pareja a partes iguales, en proporción a los sueldos o con el mismo dinero de bolsillo) y «Año» (los 12 meses, con los gastos que llegan una vez al año).' },
    { h2: 'Cómo hacer un presupuesto familiar en 4 pasos', text: 'Apunta los ingresos netos; anota los gastos del mes, primero los fijos y después los del día a día; decide el ahorro antes de gastar, con una referencia habitual del 10 al 20 % de los ingresos; y mira el resto del mes.' },
  ],
  priority: 0.8,
  changefreq: 'monthly',
};

export const TEMPLATE_FAQ_ES: FaqItem[] = [
  { q: '¿La plantilla es realmente gratuita?', a: 'Sí, sin registro y sin dar tu correo electrónico. Descárgala, cámbiala y compártela.' },
  { q: '¿Hay una versión en PDF para imprimir?', a: 'Sí: la misma plantilla en un PDF de 3 páginas A4 (presupuesto del mes con lo previsto y lo real, gastos anuales y fondo común, seguimiento del año), para rellenar a mano. Gratis y sin registro.' },
  { q: '¿Funciona en Google Sheets, LibreOffice o Numbers?', a: 'Sí. Es un archivo .xlsx normal: se abre en Excel, Google Sheets (Archivo › Importar), LibreOffice Calc y Numbers, con sus fórmulas.' },
  { q: '¿En qué moneda está?', a: 'En la que quieras: los importes no llevan símbolo de moneda, así que la plantilla sirve en euros, pesos, soles, dólares o cualquier otra. Escribe tus importes tal cual.' },
  { q: '¿Cómo repartir los gastos en pareja?', a: 'La pestaña «Fondo común» compara los tres métodos más habituales y muestra el dinero de bolsillo que le queda a cada persona. Repartir en proporción a los sueldos es lo más frecuente cuando los ingresos son distintos.' },
  { q: '¿Por qué pasar de la plantilla a la aplicación?', a: 'Con la plantilla hay que copiarlo todo cada mes y enviarse el archivo. Budget Famille parte de las mismas reglas, rellena cada mes sola, se comparte en tiempo real y funciona en el móvil, gratis. La aplicación está disponible en inglés y en francés.' },
];
