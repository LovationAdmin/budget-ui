// src/lib/pages/es/RentSplitCalculator.tsx
// ============================================================================
// « Calculadora para dividir el alquiler » — the Spanish version of
// /budget-colocation and /en/rent-split-calculator (hreflang,
// src/i18n/locales.ts). Same calculator and split; the words, the example
// (Spanish first names, bedrooms in m²), the advice and the FAQ are written
// for readers of Spain and Latin America, without any country's tenancy law
// presented as the rule. Amounts are in the visitor's currency (euros by
// default). Targets « dividir alquiler entre compañeros de piso »,
// « calculadora dividir renta », « cómo dividir el alquiler » and « repartir
// gastos piso compartido ».
// ============================================================================

import { Calculator, ShieldCheck } from 'lucide-react';
import { CurrencyPicker, useCurrency } from '@/components/tools/CurrencyPicker';
import { scaleAmounts } from '@/lib/tools/scaleAmounts';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SpanishToolLinks } from '@/components/es/SpanishLayout';
import { ColocationCalculator } from '@/components/tools/ColocationCalculator';
import { FaqList, ToolArticle } from '@/components/tools/ToolKit';
import { COLOCATION_ES, colocExampleEs } from '@/i18n/es/colocation';
import { COMMON_SHARE, computeColocation } from '@/lib/tools/colocation';
import { RENT_SPLIT_FAQ_ES } from '@/seo/es/faq-rent-split';

const PATH = '/es/calculadora-dividir-alquiler';
const UNIT = 'm²';

export default function RentSplitCalculatorEs() {
  const { code, setCode, format } = useCurrency('es');
  const { moneyExact: money, pct } = format;
  // The fictitious example in the visitor's currency (bedroom sizes stay as they are).
  const example = scaleAmounts(colocExampleEs(), format.example, ['room']);
  const examples = (['egal', 'chambre', 'revenus'] as const).map((m) => computeColocation({ ...example, method: m }));
  const sizes = example.roommates.map((m) => m.room);
  const names = example.roommates.map((m) => m.name);

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
              Calculadora para dividir el alquiler: ¿cuánto paga cada compañero de piso?
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              ¿Cómo dividir el alquiler de forma justa? Elige a partes iguales, por tamaño de habitación o según los
              ingresos, y mira lo que paga cada persona al mes, con la luz, internet y los gastos comunes. El resultado
              se actualiza mientras escribes.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              <ShieldCheck className="mr-1 inline h-4 w-4 align-[-3px] text-success" aria-hidden="true" />
              Tus datos se quedan en tu dispositivo: no se envían.
            </p>
          </div>
        </section>

        <ColocationCalculator
          t={COLOCATION_ES}
          format={format}
          storageKey="bf:es:rent-split:v1"
          example={example}
          areaUnit={UNIT}
          beforeHousehold={<CurrencyPicker value={code} onChange={setCode} locale="es" />}
        />

        <ToolArticle>
          <section>
            <h2>Cómo dividir el alquiler: tres métodos</h2>
            <p className="mt-4 text-lg">
              No hay una regla fija para dividir el alquiler (la renta o el arriendo, según el país): se decide entre
              todos, mejor <strong>antes de mudarse</strong>, y se deja por escrito, en un acuerdo, en el grupo de
              mensajes o en un presupuesto compartido. Estos son los tres métodos más habituales.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li><strong>A partes iguales</strong>: el alquiler entre el número de personas. Es lo más sencillo, y lo más justo cuando las habitaciones se parecen.</li>
              <li><strong>Por tamaño de habitación</strong>: el salón, la cocina y el baño los usa todo el mundo, así que una parte del alquiler se reparte a partes iguales y el resto sigue los metros de cada habitación. Esta calculadora reparte a partes iguales el {pct(COMMON_SHARE)} del alquiler.</li>
              <li><strong>Según los ingresos</strong>: cada persona paga en proporción a sus ingresos netos. Entre amigos es menos frecuente, pero resulta útil cuando los ingresos son muy distintos.</li>
            </ul>
            <p className="mt-4">
              Los gastos comunes (luz, agua, gas, internet, seguro, compra común) casi siempre se reparten a partes
              iguales. ¿Una habitación con baño propio, balcón o plaza de aparcamiento? Se puede acordar que esa persona
              pague algo más cada mes.
            </p>
          </section>

          <section>
            <h2>Ejemplo: un piso compartido entre tres</h2>
            <p className="mt-4">
              En nuestro ejemplo, {names[0]}, {names[1]} y {names[2]} comparten un piso de tres habitaciones de {sizes[0]}, {sizes[1]} y {sizes[2]} {UNIT},
              con un alquiler de {money(example.rent)} al mes. Los gastos comunes (luz y gas, internet, seguro y compra
              común) suman {money(examples[0].bills)} al mes, {money(examples[0].shares[0].bills)} por persona.
            </p>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <caption className="sr-only">Lo que paga cada persona al mes en el ejemplo, según el método de reparto</caption>
                <thead>
                  <tr className="border-b border-border text-foreground">
                    <th scope="col" className="py-2 pr-3 font-semibold">Persona</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">A partes iguales</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Por habitación</th>
                    <th scope="col" className="py-2 text-right font-semibold">Según los ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {example.roommates.map((m, i) => (
                    <tr key={m.name} className="border-b border-border/60">
                      <th scope="row" className="py-2 pr-3 font-medium text-foreground">{m.name} <span className="font-normal text-muted-foreground">({m.room} {UNIT}, {format.money(m.income)} netos)</span></th>
                      {examples.map((e, k) => <td key={k} className="py-2 pr-3 text-right tabular-nums">{money(e.shares[i].total)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm">
              Importes al mes, con el alquiler y los gastos comunes. Por tamaño de habitación, la diferencia entre la
              habitación más grande y la más pequeña es de {money(examples[1].shares[2].total - examples[1].shares[0].total)} al mes.
            </p>
          </section>

          <section>
            <h2>Cómo repartir la luz, internet y la compra: un fondo común</h2>
            <p className="mt-4">
              Para no apuntar cada compra ni hacer cuentas cada semana, lo más sencillo es un <strong>fondo común</strong>:
              cada persona ingresa su parte a principios de mes, y de ahí se pagan el alquiler, las facturas y la compra
              común. Los gastos personales (tu comida, tus salidas) van aparte.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>Decide con tus compañeros qué entra en lo común: productos de limpieza, papel higiénico, aceite, sal… y qué no.</li>
              <li>Pasa a un mes las facturas que no son mensuales: la luz que llega cada dos meses se divide entre 2, el seguro anual entre 12.</li>
              <li>¿Alguien consume claramente más, por ejemplo porque teletrabaja con la calefacción o el aire acondicionado todo el día? Se puede acordar que pague algo más de las facturas.</li>
              <li>Revisa las cuentas una vez al mes, y ajusta el reparto cuando alguien entra o se va.</li>
            </ul>
          </section>

          <section>
            <h2>Antes de mudarse: dejarlo por escrito</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li><strong>Un contrato conjunto o uno por habitación</strong>: cuando todos firman el mismo contrato, lo habitual es que cada persona responda del alquiler completo, y si alguien no paga, el propietario puede reclamar a los demás. Con un contrato por habitación, cada persona suele responder solo de su parte. Lee bien tu contrato y las normas de tu país.</li>
              <li><strong>El subarriendo</strong>: si alquilas una habitación a quien firma el contrato, ten en cuenta que en muchos lugares hace falta el permiso del propietario. Pregunta antes de entrar si está al tanto y cuándo termina el contrato principal.</li>
              <li><strong>El reparto</strong>: qué método, cuánto paga cada persona y qué día del mes.</li>
              <li><strong>La fianza o el depósito</strong>: quién puso cuánto, y cómo se liquida y se devuelve cuando alguien se va.</li>
              <li><strong>Las salidas</strong>: con cuánta antelación se avisa y quién busca a la persona que entra.</li>
              <li><strong>Las facturas y las tareas</strong>: a nombre de quién están los contratos, cómo se hace la compra común y cómo se reparte la limpieza.</li>
            </ul>
          </section>

          <FaqList id="faq-rent-split" items={RENT_SPLIT_FAQ_ES} title="Preguntas frecuentes" />

          <SpanishToolLinks current={PATH} />

          <section className="text-sm">
            <h2 className="!text-xl">A tener en cuenta</h2>
            <p className="mt-3">
              Esta calculadora da un reparto orientativo a partir de los importes que escribes. No sustituye a tu contrato
              de alquiler ni al consejo de un profesional.
            </p>
          </section>
        </ToolArticle>
      </main>
      <Footer />
    </div>
  );
}
