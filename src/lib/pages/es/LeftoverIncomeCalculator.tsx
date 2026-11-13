// src/lib/pages/es/LeftoverIncomeCalculator.tsx
// ============================================================================
// « Calculadora de dinero disponible » — the Spanish version of
// /calcul-reste-a-vivre and /en/leftover-income-calculator (hreflang,
// src/i18n/locales.ts). Same calculator and same example as in English, with
// the words, the income items and the advice written for readers of Spain and
// Latin America, no country's benefits presented as the rule. Amounts are in
// the visitor's currency (euros by default). Targets « cuánto dinero me queda
// al mes », « calculadora gastos fijos », « dinero disponible después de
// gastos » and « cómo repartir los ingresos del mes ».
// ============================================================================

import { Link } from 'react-router-dom';
import { Calculator, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CurrencyPicker, useCurrency } from '@/components/tools/CurrencyPicker';
import { SpanishToolLinks } from '@/components/es/SpanishLayout';
import { ResteAVivreCalculator } from '@/components/tools/ResteAVivreCalculator';
import { FaqList, ToolArticle } from '@/components/tools/ToolKit';
import { RAV_EXAMPLE_ES, RESTE_A_VIVRE_ES } from '@/i18n/es/resteAVivre';
import { scaleAmounts } from '@/lib/tools/scaleAmounts';
import { CHARGE_FIELDS, computeResteAVivre } from '@/lib/tools/resteAVivre';
import { LEFTOVER_INCOME_FAQ_ES } from '@/seo/es/faq-leftover-income';

const PATH = '/es/calculadora-dinero-disponible';
const link = 'font-medium text-primary hover:underline';

export default function LeftoverIncomeCalculatorEs() {
  const { code, setCode, format } = useCurrency('es');
  const { money, moneyExact, pct } = format;
  // The fictitious example in the visitor's currency (the household stays as it is).
  const EXAMPLE = scaleAmounts(RAV_EXAMPLE_ES, format.example, ['household']);
  const example = computeResteAVivre(EXAMPLE.household, EXAMPLE.incomes, EXAMPLE.charges);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="px-4 pt-12 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-1.5 text-sm font-semibold text-success">
              <Calculator className="h-4 w-4" aria-hidden="true" /> Calculadora gratuita · Sin registro
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl [text-wrap:balance]">
              Calculadora de dinero disponible
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              ¿Cuánto te queda del sueldo después de los gastos fijos? Indica los ingresos netos y los gastos fijos de tu
              hogar y mira tu dinero disponible al mes, por persona y por día. El resultado se actualiza mientras
              escribes.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              <ShieldCheck className="mr-1 inline h-4 w-4 align-[-3px] text-success" aria-hidden="true" />
              Tus datos se quedan en tu dispositivo: no se envían.
            </p>
          </div>
        </section>

        <ResteAVivreCalculator
          t={RESTE_A_VIVRE_ES}
          format={format}
          storageKey="bf:es:leftover-income:v1"
          example={EXAMPLE}
          beforeHousehold={<CurrencyPicker value={code} onChange={setCode} locale="es" />}
        />

        <ToolArticle>
          <section>
            <h2>¿Cómo se calcula el dinero disponible?</h2>
            <p className="mt-4 text-lg">
              <strong>Dinero disponible = ingresos netos del mes − gastos fijos del mes.</strong> Es lo que queda cuando
              ya está pagado todo lo que vuelve cada mes: con eso se pagan la compra, la ropa, los gastos de salud a tu
              cargo, el ocio y el ahorro. Calcularlo es el primer paso para ordenar las cuentas de casa.
            </p>
            <p className="mt-4">
              No es la «renta disponible» de las estadísticas, que solo descuenta impuestos y cotizaciones: aquí se
              restan también el alquiler o la hipoteca, la luz y los demás gastos fijos, así que se acerca más a lo que
              de verdad puedes decidir cada mes.
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="font-semibold text-foreground">Ingresos que se cuentan</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Sueldos netos (después de impuestos y cotizaciones)</li>
                  <li>Ayudas y prestaciones que se cobran cada mes</li>
                  <li>Pensiones, pensión de alimentos recibida, alquileres cobrados</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Gastos fijos que se restan</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Alquiler o cuota de la hipoteca</li>
                  <li>Otros préstamos (coche, personal, pago mínimo de las tarjetas)</li>
                  <li>Luz, agua y gas, seguros</li>
                  <li>Internet, móvil, suscripciones, transporte</li>
                  <li>Guardería, gastos escolares e impuestos que no se descuentan de la nómina</li>
                  <li>Pensión de alimentos que pagas, o una ayuda fija a un familiar</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2>Un ejemplo</h2>
            <p className="mt-4">
              En nuestro ejemplo ficticio, la familia García, una pareja con dos hijos de 6 y 10 años,
              ingresa {money(example.revenus)} netos al mes.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-foreground">
                    <th className="py-2 font-semibold">Concepto (ejemplo)</th>
                    <th className="py-2 text-right font-semibold">Al mes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr><td className="py-2">Sueldos netos</td><td className="py-2 text-right tabular-nums">{money(example.revenus)}</td></tr>
                  {CHARGE_FIELDS.filter((f) => EXAMPLE.charges[f.key]).map((f) => (
                    <tr key={f.key}><td className="py-2">{RESTE_A_VIVRE_ES.charges[f.key].label}</td><td className="py-2 text-right tabular-nums">−{money(EXAMPLE.charges[f.key] ?? 0)}</td></tr>
                  ))}
                  <tr className="font-semibold text-foreground"><td className="py-2">Dinero disponible</td><td className="py-2 text-right tabular-nums">{money(example.reste)}</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              Es decir, {money(example.parPersonne)} por persona y {moneyExact(example.parJour)} al día para toda la
              familia. Los gastos fijos se llevan el {pct(example.chargesShare ?? 0)} de los ingresos, y el préstamo del
              coche, el {pct(example.debtRatio ?? 0)}. Para decidir cómo repartir lo que queda, prueba
              la <Link to="/es/calculadora-presupuesto-50-30-20" className={link}>calculadora de presupuesto 50/30/20</Link>.
            </p>
          </section>

          <section>
            <h2>¿Por persona o por adulto equivalente?</h2>
            <p className="mt-4">
              Dividir entre el número de personas es lo más sencillo, pero un niño suele gastar menos que un adulto, y
              dos adultos que viven juntos no gastan el doble que uno (un solo alquiler, una sola conexión a internet).
              Para comparar hogares de distinto tamaño, las estadísticas dividen entre el número
              de <strong>adultos equivalentes</strong>, con la escala de la OCDE modificada: 1 para el primer adulto, 0,5
              para cada persona adicional de 14 años o más y 0,3 para cada menor de 14. Una pareja con dos niños equivale
              a 2,1 adultos.
            </p>
            <p className="mt-4">
              Con ese criterio, a la familia García le quedan {money(example.parUnite)} por adulto equivalente.
            </p>
          </section>

          <section>
            <h2>¿Cuánto dinero disponible es suficiente?</h2>
            <p className="mt-4">
              No hay un mínimo válido en todas partes: depende del coste de vida de tu ciudad y de cuántas personas viven
              en casa. Dos referencias útiles:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li><strong>La vivienda</strong>: una referencia habitual es que el alquiler o la hipoteca no pasen de alrededor del 30 % de los ingresos. El umbral viene de las estadísticas de Estados Unidos: la Oficina del Censo considera «sobrecargado» al hogar que dedica más del 30 % de sus ingresos a la vivienda.</li>
              <li><strong>El conjunto de las necesidades</strong>: la regla 50/30/20 propone mantener las necesidades (vivienda, facturas, compra, pago mínimo de los préstamos) en torno a la mitad de los ingresos netos, con un 30 % para deseos y un 20 % para ahorro.</li>
            </ul>
            <p className="mt-4">
              Los bancos miran tu nivel de endeudamiento con sus propios criterios, a menudo sobre los ingresos brutos:
              el porcentaje de préstamos de la calculadora se calcula sobre los ingresos netos y solo sirve de
              orientación.
            </p>
          </section>

          <section>
            <h2>Cómo aumentar tu dinero disponible</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li><strong>Compara tus facturas una a una</strong>: luz, internet, móvil y seguros. Suele haber una tarifa mejor.</li>
              <li><strong>Comprueba a qué ayudas tienes derecho</strong>: por hijos, por vivienda, deducciones fiscales. La referencia es la web oficial de tu gobierno.</li>
              <li><strong>Reparte en doce meses los gastos anuales</strong>: seguros, impuestos, la vuelta al cole. Aparta una doceava parte cada mes: nuestra <Link to="/es/plantilla-presupuesto-familiar" className={link}>plantilla de presupuesto gratuita</Link> lo calcula por ti.</li>
              <li><strong>En pareja, un reparto justo</strong>: cuando los ingresos son muy distintos, repartir los gastos comunes en proporción a lo que gana cada persona suele ser más equilibrado.</li>
              <li><strong>Pide ayuda a tiempo</strong>: si las cuentas ya no salen, acude a un servicio de asesoramiento sobre deudas gratuito y sin ánimo de lucro de tu país.</li>
            </ul>
          </section>

          <FaqList id="faq-leftover-income" items={LEFTOVER_INCOME_FAQ_ES} title="Preguntas frecuentes" />

          <SpanishToolLinks current={PATH} />

          <section className="text-sm">
            <h2 className="!text-xl">A tener en cuenta</h2>
            <p className="mt-3">
              Esta calculadora da cifras orientativas a partir de los importes que escribes. No sustituye al análisis de
              un banco ni al consejo de un asesor de deudas.
            </p>
            <p className="mt-3">Fuentes (en inglés):</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><a href="https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Glossary:Equivalised_disposable_income" target="_blank" rel="noopener" className="text-primary hover:underline">Eurostat: renta disponible equivalente (escala de la OCDE modificada)</a></li>
              <li><a href="https://www.census.gov/library/stories/2022/12/housing-costs-burden.html" target="_blank" rel="noopener" className="text-primary hover:underline">Oficina del Censo de Estados Unidos: carga del coste de la vivienda (más del 30 % de los ingresos)</a></li>
            </ul>
          </section>
        </ToolArticle>
      </main>
      <Footer />
    </div>
  );
}
