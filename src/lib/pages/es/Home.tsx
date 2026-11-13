// src/lib/pages/es/Home.tsx
// ============================================================================
// « Calculadoras de presupuesto familiar gratuitas » — the Spanish home (/es).
// The app is in French and English, so this page leads to what is written in
// Spanish: the four free calculators, a short method for a family budget and
// the FAQ. Paired with /, /en and /zh (hreflang, src/i18n/locales.ts).
// ============================================================================

import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, FileSpreadsheet, Heart, PieChart, ShieldCheck, Users, Wallet, type LucideIcon } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FaqList, ToolArticle } from '@/components/tools/ToolKit';
import { ES_TOOLS } from '@/i18n/es/tools';
import { HOME_FAQ_ES } from '@/seo/es/faq-home';

const ICONS: Record<string, LucideIcon> = {
  '/es/calculadora-presupuesto-50-30-20': PieChart,
  '/es/calculadora-dividir-alquiler': Users,
  '/es/calculadora-presupuesto-boda': Heart,
  '/es/calculadora-dinero-disponible': Wallet,
};

const STEPS = [
  { title: 'Suma los ingresos netos', text: 'Sueldos, ayudas y otros ingresos, tal como llegan a la cuenta. Si tus ingresos varían, parte de un mes flojo: es más prudente que una media optimista.' },
  { title: 'Apunta los gastos fijos', text: 'Alquiler o hipoteca, luz, agua y gas, internet y móvil, transporte, seguros, préstamos: lo que vuelve cada mes y cuesta reducir de un día para otro.' },
  { title: 'Divide entre 12 los gastos anuales', text: 'Seguros que se pagan una vez al año, impuestos, la vuelta al cole, los regalos de fin de año: aparta una doceava parte cada mes y dejarán de ser sorpresas.' },
  { title: 'Ahorra primero, gasta después', text: 'Programa la transferencia a tu ahorro el día que cobras, en lugar de ahorrar «lo que sobre» a fin de mes. Primero un fondo de emergencia de 3 a 6 meses de gastos esenciales, después tus objetivos.' },
];

export default function HomeEs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="px-4 pt-12 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-1.5 text-sm font-semibold text-success">
              <Calculator className="h-4 w-4" aria-hidden="true" /> Gratis · Sin registro
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl [text-wrap:balance]">
              Calculadoras de presupuesto familiar gratuitas
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Cómo repartir el sueldo, cómo dividir el alquiler, cuánto ahorrar para la boda, cuánto queda después de los
              gastos fijos: elige una calculadora, escribe tus importes y el resultado aparece al momento.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              <ShieldCheck className="mr-1 inline h-4 w-4 align-[-3px] text-success" aria-hidden="true" />
              Tus datos se quedan en tu dispositivo: no se envían.
            </p>
          </div>
        </section>

        <section aria-labelledby="tools" className="px-4 pb-16 sm:px-6 lg:px-8">
          <h2 id="tools" className="sr-only">Calculadoras gratuitas</h2>
          <ul className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
            {ES_TOOLS.map((tool) => {
              const Icon = ICONS[tool.path] ?? Calculator;
              return (
                <li key={tool.path}>
                  <Link
                    to={tool.path}
                    className="group flex h-full items-start gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-lg font-semibold text-foreground">{tool.label}</span>
                      <span className="mt-1 block text-sm text-muted-foreground">{tool.text}</span>
                    </span>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary transition group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            to="/es/plantilla-presupuesto-familiar"
            className="group mx-auto mt-4 flex max-w-4xl items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-5 transition hover:border-primary/60 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-lg font-semibold text-foreground">Plantilla de presupuesto familiar gratuita</span>
              <span className="mt-1 block text-sm text-muted-foreground">Excel con las cuentas ya hechas o PDF para imprimir: presupuesto del mes, fondo común de la pareja y seguimiento del año.</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-primary transition group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </section>

        <ToolArticle>
          <section>
            <h2>Cómo hacer un presupuesto familiar en 4 pasos</h2>
            <p className="mt-4 text-lg">
              Un presupuesto no sirve para privarse: sirve para saber adónde va el dinero y decidir qué es lo importante.
              Con los movimientos del banco de los dos o tres últimos meses, basta una hora.
            </p>
            <ol className="mt-6 list-decimal space-y-4 pl-5">
              {STEPS.map((step) => (
                <li key={step.title}><strong>{step.title}.</strong> {step.text}</li>
              ))}
            </ol>
            <p className="mt-4">
              ¿Quieres saber cómo repartir tus ingresos? La{' '}
              <Link to="/es/calculadora-presupuesto-50-30-20" className="font-medium text-primary hover:underline">calculadora de presupuesto 50/30/20</Link>{' '}
              te da una referencia a partir de tu sueldo y de tus gastos esenciales.
            </p>
          </section>

          <section>
            <h2>Un presupuesto a solas o en compañía</h2>
            <p className="mt-4">
              Budget Famille es una aplicación de presupuesto gratuita, para usar a solas o compartir con tu pareja, tu
              familia o tus compañeros de piso: gastos fijos y fondo común, dinero de bolsillo de cada persona y objetivos
              de ahorro con un importe y una fecha, con lo que hay que apartar cada mes ya calculado. Sin conectar tu
              banco y sin publicidad.
            </p>
            <p className="mt-4">La aplicación está disponible en inglés y en francés.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/signup" className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90">
                Crear una cuenta gratis <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/en/features" hrefLang="en" className="inline-flex min-h-[44px] items-center justify-center rounded-xl px-5 font-semibold text-primary transition hover:bg-primary/10">
                Ver todas las funciones (en inglés)
              </Link>
            </div>
          </section>

          <FaqList id="faq-home-es" items={HOME_FAQ_ES} title="Preguntas frecuentes" />
        </ToolArticle>
      </main>
      <Footer />
    </div>
  );
}
