// src/lib/pages/es/BudgetCalculator.tsx
// ============================================================================
// « Calculadora de presupuesto 50/30/20 » — the Spanish version of
// /budget-personnel and /en/50-30-20-budget-calculator (hreflang,
// src/i18n/locales.ts). Same calculator and rule; the words, the help links
// and the article are written for readers of Spain and Latin America, and
// amounts are in the visitor's currency (euros by default, from the time zone
// or the browser's region, changeable, shared by the Spanish pages). The
// example is the English one, scaled to the currency. Targets « regla
// 50/30/20 », « calculadora 50/30/20 », « cómo repartir mi sueldo », « cuánto
// ahorrar al mes » and « cómo hacer un presupuesto personal ».
// ============================================================================

import { Calculator, ShieldCheck } from 'lucide-react';
import { useMemo } from 'react';
import { CurrencyPicker, useCurrency } from '@/components/tools/CurrencyPicker';
import { scaleAmounts } from '@/lib/tools/scaleAmounts';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SpanishToolLinks } from '@/components/es/SpanishLayout';
import { BudgetPersoCalculator } from '@/components/tools/BudgetPersoCalculator';
import { FaqList, ToolArticle } from '@/components/tools/ToolKit';
import { EXAMPLE_EN, EXAMPLE_EN_HIGH_RENT } from '@/i18n/en/budgetPerso';
import { BUDGET_PERSO_ES } from '@/i18n/es/budgetPerso';
import { FULL_SAVINGS_MAX_NEEDS_SHARE, NEED_FIELDS, computeBudgetPerso } from '@/lib/tools/budgetPerso';
import { BUDGET_503020_FAQ_ES } from '@/seo/es/faq-budget-503020';

const PATH = '/es/calculadora-presupuesto-50-30-20';

export default function BudgetCalculatorEs() {
  const { code, setCode, format } = useCurrency('es');
  const { money, moneyExact, pct } = format;
  // The fictitious example in the visitor's currency (euros, pesos, soles…).
  const ex = useMemo(() => scaleAmounts(EXAMPLE_EN, format.example), [format]);
  const exHigh = useMemo(() => scaleAmounts(EXAMPLE_EN_HIGH_RENT, format.example), [format]);
  const copy = useMemo(() => ({ ...BUDGET_PERSO_ES, example: ex }), [ex]);
  const example = computeBudgetPerso(ex.incomes, ex.needs);
  const exampleHigh = computeBudgetPerso(exHigh.incomes, exHigh.needs);
  const goal = format.example(1200);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="px-4 pt-12 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-1.5 text-sm font-semibold text-success">
              <Calculator className="h-4 w-4" aria-hidden="true" /> Calculadora gratuita · Regla 50/30/20
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl [text-wrap:balance]">
              Calculadora de presupuesto 50/30/20
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Haz tu presupuesto personal con la regla 50/30/20: indica tus ingresos netos y tus gastos esenciales y mira
              cómo repartir tu sueldo, cuánto queda después de las necesidades y cuánto puedes ahorrar cada mes. El
              resultado se actualiza mientras escribes, sin juzgar en qué gastas.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              <ShieldCheck className="mr-1 inline h-4 w-4 align-[-3px] text-success" aria-hidden="true" />
              Gratis y sin registro. Tus datos se quedan en tu dispositivo: no se envían.
            </p>
          </div>
        </section>

        <BudgetPersoCalculator t={copy} format={format} storageKey="bf:es:503020-calculator:v1" beforeIncomes={<CurrencyPicker value={code} onChange={setCode} locale="es" />} />

        <ToolArticle>
          <section>
            <h2>Cómo hacer un presupuesto personal en 5 pasos</h2>
            <p className="mt-4 text-lg">
              Un presupuesto no sirve para privarse: sirve para saber adónde va el dinero y decidir qué es lo importante.
              Con los movimientos del banco de los dos o tres últimos meses, basta una hora.
            </p>
            <ol className="mt-6 list-decimal space-y-4 pl-5">
              <li>
                <strong>Parte de tus ingresos netos.</strong> Lo que llega a tu cuenta cada mes, después de impuestos y
                cotizaciones, más las ayudas y otros ingresos regulares. Si tus ingresos varían (comisiones, trabajo
                por cuenta propia, encargos), parte de un mes flojo y no de una media optimista.
              </li>
              <li>
                <strong>Apunta los gastos fijos.</strong> Vivienda, luz, agua y gas, internet y móvil, transporte,
                seguros, préstamos: lo que vuelve cada mes y cuesta cambiar.
              </li>
              <li>
                <strong>Divide entre 12 los gastos anuales.</strong> Impuestos, seguros que se pagan una vez al año,
                suscripciones anuales, regalos de fin de año: aparta una doceava parte cada mes y dejarán de ser
                «imprevistos».
              </li>
              <li>
                <strong>Calcula los gastos variables.</strong> La compra, salir a comer, la ropa, el ocio: es lo que más
                cambia. Vale más una cifra honesta que una ideal; ajústala después de anotar tus gastos durante un mes.
              </li>
              <li>
                <strong>Ahorra primero, gasta después.</strong> Programa la transferencia a tu ahorro el día que cobras,
                en lugar de ahorrar «lo que sobre» a fin de mes: a fin de mes no suele sobrar nada. Aunque sea poco, crea
                el hábito.
              </li>
            </ol>
          </section>

          <section id="regla" className="scroll-mt-24">
            <h2>¿Qué es la regla 50/30/20?</h2>
            <p className="mt-4 text-lg">
              <strong>La regla 50/30/20 reparte tus ingresos netos en tres partes</strong>: la mitad para lo que hay que
              pagar sí o sí, casi un tercio para lo que hace la vida más agradable y el resto para tu futuro.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border/70 p-4">
                <p className="font-display text-2xl font-bold text-foreground">50 %</p>
                <h3 className="font-semibold text-foreground">Necesidades</h3>
                <p className="mt-1 text-sm">Vivienda, luz, agua y gas, compra de alimentación, transporte, seguros, pago mínimo de los préstamos.</p>
              </div>
              <div className="rounded-xl border border-border/70 p-4">
                <p className="font-display text-2xl font-bold text-foreground">30 %</p>
                <h3 className="font-semibold text-foreground">Deseos</h3>
                <p className="mt-1 text-sm">Salir a comer, ocio, aficiones, compras, viajes, plataformas: lo que no es imprescindible.</p>
              </div>
              <div className="rounded-xl border border-border/70 p-4">
                <p className="font-display text-2xl font-bold text-foreground">20 %</p>
                <h3 className="font-semibold text-foreground">Ahorro</h3>
                <p className="mt-1 text-sm">Fondo de emergencia, objetivos, jubilación, o adelantar deudas por encima del pago mínimo.</p>
              </div>
            </div>
            <p className="mt-6">
              La regla se hizo popular con el libro «All Your Worth» (2005), de la senadora estadounidense Elizabeth
              Warren y su hija Amelia Warren Tyagi. Su ventaja: se explica con tres cifras y deja un sitio de verdad a los
              deseos, así que es más fácil de mantener que un presupuesto que cuenta cada céntimo.
            </p>
            <p className="mt-4">
              Es una <strong>referencia, no una obligación</strong>. Si tu alquiler es alto, superar el 50 % de
              necesidades no significa que hagas nada mal. En ese caso la calculadora ajusta el reparto del resto con una
              regla sencilla:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li><strong>Necesidades hasta el 50 %</strong>: 30 % para deseos, 20 % para ahorro, y lo que sobra es margen libre.</li>
              <li><strong>Necesidades entre el 50 % y el {pct(FULL_SAVINGS_MAX_NEEDS_SHARE)}</strong>: primero se reducen los deseos y el ahorro se mantiene en el 20 % de los ingresos, siempre que los deseos no queden por debajo del ahorro.</li>
              <li><strong>Necesidades por encima del {pct(FULL_SAVINGS_MAX_NEEDS_SHARE)}</strong>: lo que queda se reparte en dos mitades, una para deseos y otra para el ahorro posible. Mantener el 20 % apretaría demasiado los deseos, y un presupuesto demasiado justo no dura.</li>
              <li><strong>Necesidades por encima de los ingresos</strong>: no hay reparto, sino pistas para reequilibrar.</li>
            </ul>
          </section>

          <section>
            <h2>Ejemplo de presupuesto 50/30/20: cómo repartir el sueldo</h2>
            <p className="mt-4">
              En nuestro ejemplo, Álex vive a solas y cobra {money(example.revenus)} netos al mes. Estos son sus gastos
              esenciales (importes ficticios):
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-foreground">
                    <th className="py-2 font-semibold">Necesidades (ejemplo)</th>
                    <th className="py-2 text-right font-semibold">Al mes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {NEED_FIELDS.filter((f) => ex.needs[f.key]).map((f) => (
                    <tr key={f.key}><td className="py-2">{BUDGET_PERSO_ES.needs[f.key].label}</td><td className="py-2 text-right tabular-nums">{money(ex.needs[f.key] ?? 0)}</td></tr>
                  ))}
                  <tr className="font-semibold text-foreground"><td className="py-2">Total de necesidades</td><td className="py-2 text-right tabular-nums">{money(example.besoins)}</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              La regla 50/30/20 daría {money(example.regle.besoins)} para necesidades, {money(example.regle.envies)} para
              deseos y {money(example.regle.epargne)} de ahorro. Las necesidades de Álex suman {money(example.besoins)},
              el {pct(example.besoinsShare ?? 0)} de sus ingresos: un poco por encima de la referencia. Le
              quedan {money(example.reste)}: aparta {money(example.epargne)} de ahorro y dispone de {money(example.envies)} para
              deseos, es decir, {moneyExact(example.enviesParJour)} al día.
            </p>
            <p className="mt-4">
              Con un alquiler de {money(exHigh.needs.logement ?? 0)} en lugar de {money(ex.needs.logement ?? 0)}, sus
              necesidades subirían a {money(exampleHigh.besoins)} ({pct(exampleHigh.besoinsShare ?? 0)}).
              Los {money(exampleHigh.reste)} restantes se repartirían en dos mitades: {money(exampleHigh.envies)} para
              deseos y {money(exampleHigh.epargne)} de ahorro.
            </p>
          </section>

          <section>
            <h2>¿Cuánto ahorrar al mes?</h2>
            <p className="mt-4">
              La regla 50/30/20 propone ahorrar el <strong>20 % de los ingresos netos</strong>: {money(example.regle.epargne)} con {money(example.revenus)} al
              mes. Es una referencia útil, no un examen: la cantidad correcta es la que puedes mantener todos los meses.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li><strong>Empieza con poco.</strong> Una transferencia automática de {money(format.example(25))} o {money(format.example(50))} el día que cobras ya crea el hábito. Súbela con cada aumento de sueldo o cuando termines de pagar un préstamo.</li>
              <li><strong>Primero, un fondo de emergencia.</strong> Un colchón para los imprevistos: una avería, una reparación en casa, un gasto médico, un mes con menos ingresos. La referencia habitual es de tres a seis meses de gastos esenciales; ponte una meta y avanza paso a paso.</li>
              <li><strong>Después, los objetivos con fecha.</strong> Un viaje, un coche, la entrada de una vivienda: divide el importe entre los meses que faltan. Para reunir {money(goal)} en 12 meses, hay que apartar {money(goal / 12)} al mes.</li>
            </ul>
            <p className="mt-4">
              En Budget Famille, cada objetivo de ahorro tiene un importe y una fecha, y lo que hay que apartar cada mes se
              calcula solo.
            </p>
          </section>

          <FaqList id="faq-503020" items={BUDGET_503020_FAQ_ES} title="Preguntas frecuentes" />

          <SpanishToolLinks current={PATH} />

          <section className="text-sm">
            <h2 className="!text-xl">A tener en cuenta</h2>
            <p className="mt-3">
              Esta calculadora da una estimación a partir de los importes que escribes. La regla 50/30/20 es una
              referencia: no sustituye a un asesoramiento financiero personalizado, y no recomendamos ningún producto de
              ahorro o de inversión.
            </p>
          </section>
        </ToolArticle>
      </main>
      <Footer />
    </div>
  );
}
