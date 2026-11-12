// src/lib/pages/es/WeddingBudgetCalculator.tsx
// ============================================================================
// « Calculadora de presupuesto de boda » — the Spanish version of
// /budget-mariage and /en/wedding-budget-calculator (hreflang,
// src/i18n/locales.ts). Same calculator, same fictitious example (labelled
// wherever it shows) and same saving plan, in the visitor's currency (euros by
// default). Written for readers of Spain and Latin America: the banquet priced
// per guest (« cubierto »), gifts not counted in advance. No averages or
// market prices. Targets « calculadora presupuesto boda », « cuánto cuesta una
// boda », « presupuesto boda 100 invitados » and « cuánto ahorrar para una
// boda ».
// ============================================================================

import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, ShieldCheck, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { CurrencyPicker, useCurrency } from '@/components/tools/CurrencyPicker';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SpanishToolLinks } from '@/components/es/SpanishLayout';
import { Button } from '@/components/ui/button';
import { MariageCalculator, useMariageCalculator } from '@/components/tools/MariageCalculator';
import { FaqList, ToolArticle } from '@/components/tools/ToolKit';
import { MARIAGE_ES } from '@/i18n/es/mariage';
import { EXAMPLE as REFERENCE_EXAMPLE, FEWER_GUESTS, POSTE_FIELDS, exampleResult } from '@/lib/tools/mariage';
import { scaleAmounts } from '@/lib/tools/scaleAmounts';
import { WEDDING_FAQ_ES } from '@/seo/es/faq-wedding';

const PATH = '/es/calculadora-presupuesto-boda';

export default function WeddingBudgetCalculatorEs() {
  const { code, setCode, format } = useCurrency('es');
  const { money, moneyExact, pct } = format;
  // The fictitious example in the visitor's currency (guests and months stay as they are).
  const EXAMPLE = useMemo(() => scaleAmounts(REFERENCE_EXAMPLE, format.example, ['guests', 'monthsAhead']), [format]);
  const ex = exampleResult(EXAMPLE);
  const calc = useMariageCalculator({ t: MARIAGE_ES, format, storageKey: 'bf:es:wedding-calculator:v1', example: EXAMPLE });
  const { fillExample, scrollToResults, projectYear } = calc;

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
              Calculadora de presupuesto de boda
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Banquete, lugar de celebración, vestido, fotografía: suma tus presupuestos y calcula cuánto cuesta tu boda,
              el precio por invitado y cuánto ahorrar cada mes hasta la fecha. El resultado se actualiza mientras
              escribes.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              <ShieldCheck className="mr-1 inline h-4 w-4 align-[-3px] text-success" aria-hidden="true" />
              Tus datos se quedan en tu dispositivo: no se envían.
            </p>
            <div className="mt-6 flex flex-col items-center gap-1.5">
              <Button type="button" variant="outline" className="min-h-[44px] bg-card" onClick={fillExample}>
                <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" /> Rellenar con un ejemplo
              </Button>
              <p className="text-xs text-muted-foreground">{MARIAGE_ES.exampleNote}.</p>
            </div>
          </div>
        </section>

        <MariageCalculator
          calc={calc}
          t={MARIAGE_ES}
          format={format}
          beforeWedding={<CurrencyPicker value={code} onChange={setCode} locale="es" />}
        />

        <ToolArticle>
          <section>
            <h2>Cómo calcular el presupuesto de una boda</h2>
            <p className="mt-4 text-lg">
              El presupuesto de una boda se construye con <strong>los presupuestos que te dan</strong>, no con una media:
              con el mismo número de invitados, el total cambia mucho según el lugar, el menú, la ciudad y la temporada.
            </p>
            <ol className="mt-4 list-decimal space-y-2 pl-5">
              <li>
                <strong>Haz la lista de partidas</strong>: banquete, bebidas, lugar de celebración, vestido, traje y
                belleza, fotografía y vídeo, música, flores y decoración, alianzas, invitaciones; y la luna de miel, si
                la tienes prevista.
              </li>
              <li>
                <strong>Pide varios presupuestos</strong>: al menos dos o tres para las partidas grandes, y mira qué
                incluye cada uno: servicio, bebidas, decoración, horas extra, impuestos. Pregunta también si hay un
                mínimo de invitados.
              </li>
              <li>
                <strong>Separa lo que se paga por invitado de lo fijo</strong>: el banquete y las bebidas cambian con la
                lista de invitados; el lugar, la fotografía, la música y el vestido, no.
              </li>
              <li>
                <strong>Reserva una partida de imprevistos</strong>: arreglos del vestido, transporte, compras de última
                hora… siempre aparece algo.
              </li>
            </ol>
            <p className="mt-6 rounded-xl bg-muted/60 p-4 font-semibold text-foreground">
              Presupuesto de boda = precio por invitado (banquete y bebidas) × número de invitados + gastos fijos + imprevistos
            </p>
          </section>

          <section>
            <h2>Ejemplo de presupuesto de boda para {ex.guests} invitados</h2>
            <p className="mt-4">
              En nuestro ejemplo, una pareja invita a {ex.guests} personas. Los importes son <strong>ficticios</strong>:
              cifras redondas para mostrar el cálculo, no precios medios. No existe un precio oficial de referencia: el
              total depende sobre todo del número de invitados y del banquete. Sustituye cada línea por tus propios
              presupuestos.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-foreground">
                    <th className="py-2 font-semibold">Partida (ejemplo ficticio)</th>
                    <th className="py-2 text-right font-semibold">Importe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {POSTE_FIELDS.filter((f) => EXAMPLE.amounts[f.key]).map((f) => {
                    const v = EXAMPLE.amounts[f.key] ?? 0;
                    return (
                      <tr key={f.key}>
                        <td className="py-2">
                          {MARIAGE_ES.posts[f.key].label}
                          {f.perGuest && <span className="text-muted-foreground"> ({moneyExact(v)} × {ex.guests} invitados)</span>}
                        </td>
                        <td className="py-2 text-right tabular-nums">{money(f.perGuest ? v * ex.guests : v)}</td>
                      </tr>
                    );
                  })}
                  <tr className="font-semibold text-foreground">
                    <td className="py-2">Total</td>
                    <td className="py-2 text-right tabular-nums">{money(ex.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              Sale a <strong>{money(ex.costPerGuest)} por invitado</strong>. El banquete y las bebidas, que se pagan por
              persona, suman {money(ex.perGuestTotal)}, el {pct(ex.perGuestShare ?? 0)} del total; los
              otros {money(ex.fixedTotal)} no cambian con el número de invitados. Con {ex.fewerGuests.fewer} invitados
              menos, este ejemplo baja al menos {money(ex.fewerGuests.saving)}: la lista de invitados es la palanca más
              directa. El ejemplo no incluye luna de miel: añádela si la tienes prevista.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4 min-h-[44px]"
              onClick={() => { if (fillExample()) scrollToResults(); }}
            >
              Poner este ejemplo en la calculadora <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </section>

          <section>
            <h2>Cuánto ahorrar al mes para la boda</h2>
            <p className="mt-4 rounded-xl bg-muted/60 p-4 font-semibold text-foreground">
              Ahorro mensual = (presupuesto total − lo ya ahorrado) ÷ meses que faltan
            </p>
            <p className="mt-4">
              Se cuenta desde este mes hasta el mes anterior a la boda: así el dinero está listo antes del día. El
              importe se redondea hacia arriba, para llegar con un poco de adelanto.
            </p>
            <p className="mt-4">
              En nuestro ejemplo, la pareja ya ha ahorrado {money(ex.saved)} y se casa dentro
              de {ex.months} meses: ({money(ex.total)} − {money(ex.saved)}) ÷ {ex.months} = <strong>{money(ex.monthly)} al mes</strong>.
            </p>
            <p className="mt-4">
              Calcula el objetivo con todos los gastos, sin restar los regalos que esperas de los invitados: llegan el
              día de la boda o después, y su importe es difícil de prever. Cuando lleguen, servirán para reponer el
              ahorro o cubrir otros gastos.
            </p>
            <p className="mt-4">
              Mira también las fechas de pago de cada presupuesto: muchos proveedores piden una señal al reservar y el
              resto antes de la boda. Ese dinero sale antes del gran día, y el ahorro tiene que ir al mismo ritmo. Para
              comprobar que esa cantidad mensual cabe en tu presupuesto, prueba
              la <Link to="/es/calculadora-presupuesto-50-30-20" className="font-medium text-primary hover:underline">calculadora de presupuesto 50/30/20</Link>.
            </p>
          </section>

          <section>
            <h2>Cómo ahorrar en la boda</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>
                <strong>Acorta la lista de invitados</strong>: es lo más directo, porque el banquete y las bebidas se
                pagan por persona. La calculadora muestra lo que cambia con {FEWER_GUESTS} invitados menos.
              </li>
              <li>
                <strong>Elige una fecha con menos demanda</strong>: muchos lugares y proveedores cobran más los sábados
                y en temporada alta; un viernes, un domingo o un mes tranquilo suelen salir mejor. Pide precio para las
                dos fechas y compara.
              </li>
              <li>
                <strong>Compara lugares y menús</strong>: un restaurante, una finca o un salón no incluyen lo mismo.
                Mira qué entra en el precio y si puedes llevar tus propias bebidas o tus proveedores.
              </li>
              <li>
                <strong>Cambia el formato del banquete</strong>: un cóctel, un bufé o una comida en lugar de una cena
                pueden bajar el precio por invitado.
              </li>
              <li>
                <strong>Haz tú lo que puedas</strong>: invitaciones, decoración, detalles para los invitados, la lista
                de música. Pero guarda tiempo para ti la víspera.
              </li>
              <li>
                <strong>Alquila o compra de segunda mano</strong>: vestido, traje, decoración; y las flores de la
                ceremonia pueden servir también en el banquete.
              </li>
            </ul>
          </section>

          <section>
            <h2>¿Quién paga la boda?</h2>
            <p className="mt-4">
              No hay una regla. Según cada familia y sus posibilidades, la paga la pareja, se reparte con las familias o
              alguien se hace cargo de una partida concreta, como el banquete o el vestido.
            </p>
            <p className="mt-4">
              Lo más sencillo es hablarlo pronto, mejor antes de firmar el primer presupuesto: quién aporta, cuánto y
              cuándo. Si queda por escrito, todo el mundo sabe a qué atenerse y no hay sorpresas de última hora.
            </p>
            <p className="mt-4">
              Llevar el presupuesto en compañía lo hace más fácil. En Budget Famille, crea un presupuesto aparte «Boda {projectYear}» con
              sus propios miembros: invita a tu pareja por correo electrónico, y a las familias si quieres, y todos
              ven las mismas cifras en tiempo real. Con un objetivo de ahorro con importe y fecha, lo que hay que apartar
              cada mes se calcula solo. La aplicación es gratuita y no hace falta conectar tu banco; está disponible en
              inglés y en francés.
            </p>
          </section>

          <FaqList id="faq-wedding" items={WEDDING_FAQ_ES} title="Preguntas frecuentes" />

          <SpanishToolLinks current={PATH} />

          <section className="text-sm">
            <h2 className="!text-xl">A tener en cuenta</h2>
            <p className="mt-3">
              Esta calculadora hace una estimación a partir de los importes que escribes. No conoce los precios de tu
              zona ni los de tus proveedores: solo cuentan tus presupuestos. Los importes del ejemplo son ficticios, y
              esta página no es un asesoramiento financiero personalizado.
            </p>
          </section>
        </ToolArticle>
      </main>
      <Footer />
    </div>
  );
}
