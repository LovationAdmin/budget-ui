// src/lib/pages/BudgetTemplate.tsx
// ============================================================================
// « Tableau de budget familial gratuit » — a free Excel template (monthly
// budget, couple's shared pot, year), the same sheets as a PDF to print, and
// the case for letting the app do it. Targets the "tableau budget familial
// excel / pdf gratuit" family of searches; in English (/en/free-budget-template),
// "free budget template excel / printable" with files of its own
// (scripts/templates/make-template-en.*); in Spanish
// (/es/plantilla-presupuesto-familiar), "plantilla presupuesto familiar excel
// gratis", with files of its own too (scripts/templates/make-template-es.*).
// ============================================================================

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarRange, CheckCircle2, Download, FileSpreadsheet, Printer, Scale, Wallet } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { TEMPLATE_FAQ } from '@/seo/faq';
import { TEMPLATE_FAQ_EN } from '@/seo/faq-template-en';
import { TEMPLATE_FAQ_ES, TEMPLATE_PDF_ES, TEMPLATE_XLSX_ES } from '@/seo/es/template';
import { defineMessages, useT } from '@/i18n/runtime';
import { track } from '@/lib/analytics';
import { Picture } from '@/components/Picture';

const TAB_ICONS = [Wallet, Scale, CalendarRange];

const link = (to: string, label: string) => <Link to={to} className="font-medium text-primary hover:underline">{label}</Link>;

const M = defineMessages<{
  xlsx: string; pdf: string; xlsxEvent: string; badge: string; h1: string; lead: string; leadFile: string;
  xlsxLabel: string; pdfLabel: string; sizes: string; orApp: string; insideTitle: string;
  tab: (title: string) => string; tabs: Array<{ title: string; text: string }>;
  previewTitle: string; previewImage: string; previewAlt: string; previewCaption: string;
  previewPages: Array<[string, string]>; previewCta: string;
  stepsTitle: string; steps: Array<[string, string]>; further: ReactNode;
  appTitle: string; appPoints: string[]; appCta: string; appImageAlt: string; appImage: string; faqTitle: string;
  faq: Array<{ q: string; a: string }>;
}>({
  fr: {
    xlsx: '/telechargements/tableau-budget-familial-budgetfamille.xlsx',
    pdf: '/telechargements/tableau-budget-familial-a-imprimer.pdf',
    xlsxEvent: 'tableau-budget-familial.xlsx',
    badge: 'Excel · Google Sheets · PDF à imprimer',
    h1: 'Tableau de budget familial gratuit',
    lead: 'Un modèle simple pour suivre le budget mensuel du foyer : revenus, dépenses, épargne, et la répartition du compte commun dans un couple.',
    leadFile: 'En Excel, les calculs sont déjà faits ; en PDF, il s’imprime et se remplit au stylo.',
    xlsxLabel: 'Tableau Excel (.xlsx)',
    pdfLabel: 'PDF à imprimer',
    sizes: 'Gratuit, sans inscription. Excel 17 Ko · PDF A4, 3 pages, 120 Ko.',
    orApp: 'Ou laisser l’app calculer',
    insideTitle: 'Ce que contient le tableau',
    tab: (title) => `Onglet « ${title} »`,
    tabs: [
      { title: 'Budget du mois', text: 'Revenus, 13 postes de charges (logement, énergie, courses, enfants…), épargne, et le reste du mois calculé tout seul.' },
      { title: 'Pot commun', text: 'Pour les couples : ce que chacun verse selon la méthode 50/50, au prorata des salaires ou même argent de poche.' },
      { title: 'Année', text: 'Les 12 mois côte à côte, avec les dépenses qui ne tombent qu’une fois (taxe foncière, prime…) et le reste cumulé.' },
    ],
    previewTitle: 'La grille de budget à imprimer',
    previewImage: '/images/modele/grille-budget-familial-a-imprimer.webp',
    previewAlt: 'Page 1 de la grille de budget familial à imprimer : revenus nets, charges fixes, épargne et dépenses courantes, avec les colonnes prévu, réel et écart',
    previewCaption: 'Page 1 du PDF, à remplir au stylo.',
    previewPages: [
      ['Page 1 · Budget du mois', ' : revenus, charges fixes, épargne et dépenses courantes, avec le prévu, le réel et l’écart.'],
      ['Page 2 · Dépenses annuelles et pot commun', ' : ce qui ne tombe pas tous les mois, ramené au mois, et ce que chacun verse au compte commun.'],
      ['Page 3 · Suivi de l’année', ' : les totaux de chaque mois, pour voir la tendance d’un coup d’œil.'],
    ],
    previewCta: 'Télécharger la grille (PDF)',
    stepsTitle: 'Comment faire son budget familial en 4 étapes',
    steps: [
      ['1. Notez vos revenus nets', ' : salaires, allocations, primes. Pour un couple, un salaire par ligne.'],
      ['2. Listez vos dépenses mensuelles', ' : charges fixes (loyer, énergie, assurances, abonnements) puis dépenses courantes (courses, transport, loisirs).'],
      ['3. Décidez de votre épargne', ' avant de dépenser : fonds d’urgence, vacances, projet. Un repère courant est 10 à 20 % des revenus.'],
      ['4. Regardez le reste du mois', ' : positif, vous pouvez épargner davantage ; négatif, une dépense ou la répartition est à revoir.'],
    ],
    further: (
      <>
        Pour aller plus loin : {link('/blog/etablir-budget-familial-5-etapes', 'établir un budget familial en 5 étapes')},{' '}
        {link('/blog/budget-famille-4-personnes-exemple', 'un exemple de budget pour une famille de 4')},{' '}
        {link('/blog/combien-epargner-par-mois-objectif-date', 'combien épargner par mois pour un objectif')},{' '}
        {link('/calcul-reste-a-vivre', 'calculer son reste à vivre')} et{' '}
        {link('/blog/compte-commun-couple-argent-de-poche', 'comment répartir le compte commun en couple')}.
      </>
    ),
    appTitle: 'Le même budget, sans recopier chaque mois',
    appPoints: [
      'Chaque mois se remplit à partir de vos règles (loyer mensuel, taxe annuelle, cantine certains mois)',
      'Partagé avec votre conjoint, en temps réel, sur téléphone',
      'Pot commun, argent de poche et charges perso privées',
      'Gratuit, sans connexion bancaire obligatoire',
    ],
    appCta: 'Essayer Budget Famille gratuitement',
    appImageAlt: 'Le budget du mois dans l’application Budget Famille',
    appImage: '/images/app/month-light.jpg',
    faqTitle: 'Questions fréquentes',
    faq: TEMPLATE_FAQ,
  },
  en: {
    xlsx: '/telechargements/budget-template.xlsx',
    pdf: '/telechargements/budget-template-printable.pdf',
    xlsxEvent: 'budget-template.xlsx',
    badge: 'Excel · Google Sheets · Printable PDF',
    h1: 'Free family budget template',
    lead: 'A simple template to track your household’s monthly budget: income, spending, savings, and how a couple splits the joint account.',
    leadFile: 'In Excel the math is already done; the PDF prints out and fills in with a pen. Any currency.',
    xlsxLabel: 'Excel template (.xlsx)',
    pdfLabel: 'Printable PDF',
    sizes: 'Free, no sign-up. Excel 14 KB · A4 PDF, 3 pages, 55 KB.',
    orApp: 'Or let the app do the math',
    insideTitle: 'What’s inside',
    tab: (title) => `“${title}” tab`,
    tabs: [
      { title: 'Monthly budget', text: 'Income, 13 kinds of bills (housing, energy, groceries, children…), savings, and what’s left for the month, worked out for you.' },
      { title: 'Joint pot', text: 'For couples: what each person pays in with a 50/50 split, in proportion to pay, or the same spending money for both.' },
      { title: 'Year', text: 'The 12 months side by side, with the costs that come once a year (property tax, a bonus…) and the running total.' },
    ],
    previewTitle: 'The printable budget sheet',
    previewImage: '/images/modele/printable-budget-template.webp',
    previewAlt: 'Page 1 of the printable family budget template: take-home income, fixed bills, savings and day-to-day spending, with plan, actual and gap columns',
    previewCaption: 'Page 1 of the PDF, to fill in with a pen.',
    previewPages: [
      ['Page 1 · Monthly budget', ': income, fixed bills, savings and day-to-day spending, with the plan, the actual and the gap.'],
      ['Page 2 · Yearly expenses and joint pot', ': what doesn’t come every month, brought back to a month, and what each person pays into the joint account.'],
      ['Page 3 · Year tracker', ': each month’s totals, to see the trend at a glance.'],
    ],
    previewCta: 'Download the sheet (PDF)',
    stepsTitle: 'How to make a family budget in 4 steps',
    steps: [
      ['1. Write down your take-home pay', ': salaries, benefits, bonuses. For a couple, one pay per line.'],
      ['2. List your monthly spending', ': fixed bills (rent, energy, insurance, subscriptions), then day-to-day spending (groceries, transport, fun).'],
      ['3. Decide on your savings', ' before you spend: emergency fund, holidays, a goal. A common benchmark is 10 to 20% of income.'],
      ['4. Look at what’s left for the month', ': positive, you can save more; negative, a bill or the split needs another look.'],
    ],
    further: (
      <>
        Going further: {link('/en/50-30-20-budget-calculator', 'the 50/30/20 budget calculator')},{' '}
        {link('/en/leftover-income-calculator', 'work out your leftover income')},{' '}
        {link('/en/rent-split-calculator', 'split the rent with roommates')} and{' '}
        {link('/en/wedding-budget-calculator', 'budget for a wedding')}.
      </>
    ),
    appTitle: 'The same budget, without copying it every month',
    appPoints: [
      'Every month fills in from your rules (monthly rent, a yearly tax, school meals some months)',
      'Shared with your partner, in real time, on your phone',
      'Joint pot, spending money and private personal expenses',
      'Free, no bank connection required',
    ],
    appCta: 'Try Budget Famille for free',
    appImageAlt: 'The monthly budget in the Budget Famille app',
    appImage: '/images/app/en/month-light.jpg',
    faqTitle: 'Frequently asked questions',
    faq: TEMPLATE_FAQ_EN,
  },
  es: {
    xlsx: TEMPLATE_XLSX_ES,
    pdf: TEMPLATE_PDF_ES,
    xlsxEvent: 'plantilla-presupuesto-familiar.xlsx',
    badge: 'Excel · Google Sheets · PDF para imprimir',
    h1: 'Plantilla de presupuesto familiar gratuita',
    lead: 'Una plantilla sencilla para llevar el presupuesto mensual del hogar: ingresos, gastos, ahorro, y cómo reparte una pareja la cuenta común.',
    leadFile: 'En Excel las cuentas ya están hechas; el PDF se imprime y se rellena a mano. En cualquier moneda.',
    xlsxLabel: 'Plantilla Excel (.xlsx)',
    pdfLabel: 'PDF para imprimir',
    sizes: 'Gratis y sin registro. Excel 14 KB · PDF A4, 3 páginas, 40 KB.',
    orApp: 'O deja que la aplicación haga las cuentas',
    insideTitle: 'Qué incluye la plantilla',
    tab: (title) => `Pestaña «${title}»`,
    tabs: [
      { title: 'Presupuesto del mes', text: 'Ingresos, 13 tipos de gastos (vivienda, energía, compra, hijos…), ahorro, y el resto del mes ya calculado.' },
      { title: 'Fondo común', text: 'Para parejas: lo que aporta cada persona a partes iguales, en proporción a los sueldos o con el mismo dinero de bolsillo.' },
      { title: 'Año', text: 'Los 12 meses uno al lado del otro, con los gastos que llegan una vez al año (impuestos, seguros…) y el acumulado.' },
    ],
    previewTitle: 'La hoja de presupuesto para imprimir',
    previewImage: '/images/modele/plantilla-presupuesto-familiar.webp',
    previewAlt: 'Página 1 de la plantilla de presupuesto familiar para imprimir: ingresos netos, gastos fijos, ahorro y gastos del día a día, con las columnas previsto, real y diferencia',
    previewCaption: 'Página 1 del PDF, para rellenar a mano.',
    previewPages: [
      ['Página 1 · Presupuesto del mes', ': ingresos, gastos fijos, ahorro y gastos del día a día, con lo previsto, lo real y la diferencia.'],
      ['Página 2 · Gastos anuales y fondo común', ': lo que no llega todos los meses, pasado a un mes, y lo que aporta cada persona a la cuenta común.'],
      ['Página 3 · Seguimiento del año', ': los totales de cada mes, para ver la tendencia de un vistazo.'],
    ],
    previewCta: 'Descargar la hoja (PDF)',
    stepsTitle: 'Cómo hacer un presupuesto familiar en 4 pasos',
    steps: [
      ['1. Apunta los ingresos netos', ': sueldos, ayudas, pagas extra. En pareja, un sueldo por línea.'],
      ['2. Anota los gastos del mes', ': primero los fijos (alquiler, energía, seguros, suscripciones) y después los del día a día (compra, transporte, ocio).'],
      ['3. Decide el ahorro', ' antes de gastar: fondo de emergencia, vacaciones, un objetivo. Una referencia habitual es entre el 10 y el 20\u00a0% de los ingresos.'],
      ['4. Mira el resto del mes', ': si es positivo, puedes ahorrar más; si es negativo, hay que revisar un gasto o el reparto.'],
    ],
    further: (
      <>
        Para ir más lejos: {link('/es/calculadora-presupuesto-50-30-20', 'la calculadora de presupuesto 50/30/20')},{' '}
        {link('/es/calculadora-dinero-disponible', 'calcula tu dinero disponible')},{' '}
        {link('/es/calculadora-dividir-alquiler', 'divide el alquiler entre compañeros de piso')} y{' '}
        {link('/es/calculadora-presupuesto-boda', 'prepara el presupuesto de tu boda')}.
      </>
    ),
    appTitle: 'El mismo presupuesto, sin copiarlo cada mes',
    appPoints: [
      'Cada mes se rellena a partir de tus reglas (alquiler mensual, un impuesto anual, comedor algunos meses)',
      'Compartido con tu pareja, en tiempo real, en el móvil',
      'Fondo común, dinero de bolsillo y gastos personales privados',
      'Gratis, sin conectar tu banco. Disponible en inglés y en francés',
    ],
    appCta: 'Probar Budget Famille gratis',
    appImageAlt: 'El presupuesto del mes en la aplicación Budget Famille (en inglés)',
    appImage: '/images/app/en/month-light.jpg',
    faqTitle: 'Preguntas frecuentes',
    faq: TEMPLATE_FAQ_ES,
  },
});

const trackDownload = (fileName: string) => track('file_download', { file_name: fileName });

export default function BudgetTemplate() {
  const t = useT(M);
  const file = (url: string) => url.slice(url.lastIndexOf('/') + 1);
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="px-4 pt-14 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-1.5 text-sm font-semibold text-success">
              <FileSpreadsheet className="h-4 w-4" aria-hidden="true" /> {t.badge}
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl [text-wrap:balance]">
              {t.h1}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
              {t.lead} {t.leadFile}
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-14 px-8 text-lg">
                <a href={t.xlsx} download onClick={() => trackDownload(t.xlsxEvent)}>
                  <Download className="mr-2 h-5 w-5" aria-hidden="true" /> {t.xlsxLabel}
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 border-2 px-8 text-lg">
                <a href={t.pdf} download onClick={() => trackDownload(file(t.pdf))}>
                  <Printer className="mr-2 h-5 w-5" aria-hidden="true" /> {t.pdfLabel}
                </a>
              </Button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {t.sizes}{' '}
              <Link to="/signup" className="font-medium text-primary hover:underline">{t.orApp}</Link>
            </p>
          </div>
        </section>

        <section className="bg-card px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="inside-title">
          <div className="mx-auto max-w-5xl">
            <h2 id="inside-title" className="text-center font-display text-3xl font-bold text-foreground">{t.insideTitle}</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {t.tabs.map((tab, i) => {
                const Icon = TAB_ICONS[i];
                return (
                  <article key={tab.title} className="rounded-2xl border border-border/70 bg-background p-6">
                    <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                    <h3 className="mt-3 text-lg font-bold text-foreground">{t.tab(tab.title)}</h3>
                    <p className="mt-2 text-muted-foreground">{tab.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* What the printable sheet looks like, before downloading it. */}
        <section className="px-4 pt-16 sm:px-6 lg:px-8" aria-labelledby="preview-title">
          <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-[minmax(0,20rem)_1fr]">
            <figure className="mx-auto w-full max-w-[20rem]">
              <a href={t.pdf} download onClick={() => trackDownload(file(t.pdf))} className="block rounded-xl border border-border bg-white shadow-elevated transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <img src={t.previewImage} alt={t.previewAlt} width={720} height={1018} loading="lazy" decoding="async" className="h-auto w-full rounded-xl" />
              </a>
              <figcaption className="mt-2 text-center text-sm text-muted-foreground">{t.previewCaption}</figcaption>
            </figure>
            <div>
              <h2 id="preview-title" className="font-display text-3xl font-bold text-foreground">{t.previewTitle}</h2>
              <ul className="mt-6 space-y-3 text-lg text-muted-foreground">
                {t.previewPages.map(([title, text]) => (
                  <li key={title}><strong className="text-foreground">{title}</strong>{text}</li>
                ))}
              </ul>
              <Button asChild size="lg" variant="outline" className="mt-8 h-12 border-2 px-6">
                <a href={t.pdf} download onClick={() => trackDownload(file(t.pdf))}>
                  <Printer className="mr-2 h-5 w-5" aria-hidden="true" /> {t.previewCta}
                </a>
              </Button>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-3xl font-bold text-foreground">{t.stepsTitle}</h2>
            <ol className="mt-6 space-y-4 text-lg text-muted-foreground">
              {t.steps.map(([title, text]) => (
                <li key={title}><strong className="text-foreground">{title}</strong>{text}</li>
              ))}
            </ol>
            <p className="mt-6 text-muted-foreground">{t.further}</p>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl items-center gap-10 rounded-3xl bg-gradient-to-br from-slate-900 to-sky-900 p-8 text-white sm:p-12 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h2 className="font-display text-3xl font-bold">{t.appTitle}</h2>
              <ul className="mt-6 space-y-3 text-slate-200">
                {t.appPoints.map((p) => (
                  <li key={p} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" /> {p}</li>
                ))}
              </ul>
              <Button asChild size="lg" variant="secondary" className="mt-8 h-12 bg-white text-slate-900 hover:bg-slate-100">
                <Link to="/signup">{t.appCta} <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
              </Button>
            </div>
            <Picture src={t.appImage} alt={t.appImageAlt} width={390} height={640} loading="lazy" className="mx-auto h-auto w-full max-w-[240px] rounded-[26px] border border-white/10" />
          </div>
        </section>

        <section className="bg-card px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="template-faq">
          <div className="mx-auto max-w-3xl">
            <h2 id="template-faq" className="font-display text-3xl font-bold text-foreground">{t.faqTitle}</h2>
            <dl className="mt-8 space-y-6">
              {t.faq.map((f) => (
                <div key={f.q}>
                  <dt className="font-semibold text-foreground">{f.q}</dt>
                  <dd className="mt-2 text-muted-foreground">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
