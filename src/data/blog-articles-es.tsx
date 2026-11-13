// src/data/blog-articles-es.tsx
// Spanish articles of the blog (/es/blog/…): budgets by country, on the model
// of the French articles about Quebec, Belgium or Morocco. Each one gives a
// worked example labelled as an illustration, the official figures of the
// year with their source named in the text, and the country's own budgeting
// habits (quincena and aguinaldo in Mexico, 14 pagas in Spain).

import type { ReactNode } from 'react';
import type { BlogArticleContent } from './blog-articles';

function Cta({ title }: { title: string }): ReactNode {
  return (
    <div className="bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl p-8 text-center my-8">
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-lg mb-6 opacity-90">Gratis, sin conectar tu banco, compartido en tiempo real. La aplicación está disponible en inglés y en francés.</p>
      <a href="/signup" className="inline-block bg-white text-primary font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors">
        Crear mi presupuesto gratis →
      </a>
    </div>
  );
}

const AUTHOR = { author: 'Equipo de Budget Famille', authorBio: 'Especialistas en presupuesto familiar y creadores de Budget Famille' };

export const blogArticlesEs: BlogArticleContent[] = [
  {
    id: 'es-1',
    title: 'Presupuesto familiar en México: el ejemplo de una familia de 4 en la CDMX',
    slug: 'presupuesto-familiar-mexico-cdmx',
    excerpt: 'El presupuesto de una familia de 4 en la Ciudad de México, en pesos: renta, despensa, luz, escuela, salario mínimo 2026, quincena, aguinaldo y tandas.',
    category: 'Internacional',
    ...AUTHOR,
    publishedAt: '2026-11-13',
    readTime: '6 min',
    tags: ['México', 'CDMX', 'Presupuesto', 'Familia', 'Ejemplo'],
    featured: true,
    related: ['presupuesto-familiar-espana-madrid'],
    content: (
      <div className="prose prose-lg max-w-none">
        <p className="lead">
          En México, el presupuesto de una familia se juega en dos renglones, la <strong>renta</strong> y la <strong>despensa</strong>, y en un ritmo propio:
          se cobra por <strong>quincena</strong> y se paga por mes. En nuestro ejemplo de la Ciudad de México, una familia de 4 gasta unos $33,400 al mes,
          sin contar el ahorro. Aquí va el detalle, los datos oficiales de 2026 y el método para hacer el tuyo.
        </p>

        <h2>📋 Ejemplo de presupuesto mensual de una familia de 4 en la CDMX</h2>
        <p>
          <strong>El hogar del ejemplo</strong>: una pareja que renta un departamento de 2 recámaras en la Ciudad de México, con dos hijos de 4 y 9 años.
          Ingresos netos: $22,000 y $14,000 al mes. Estas cifras son una ilustración, no un promedio nacional: cambia cada renglón por el tuyo.
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr><th>Concepto</th><th>Al mes</th><th>Parte de los ingresos</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Ingresos netos del hogar</strong></td><td><strong>$36,000</strong></td><td>100 %</td></tr>
              <tr><td>Renta de un departamento de 2 recámaras</td><td>$12,000</td><td>33 %</td></tr>
              <tr><td>Luz, gas y agua</td><td>$1,300</td><td>4 %</td></tr>
              <tr><td>Despensa (súper y mercado)</td><td>$8,500</td><td>24 %</td></tr>
              <tr><td>Transporte (metro, camión, gasolina)</td><td>$3,000</td><td>8 %</td></tr>
              <tr><td>Celulares e internet</td><td>$1,100</td><td>3 %</td></tr>
              <tr><td>Hijos (guardería, colegiatura, útiles)</td><td>$3,000</td><td>8 %</td></tr>
              <tr><td>Salud</td><td>$1,000</td><td>3 %</td></tr>
              <tr><td>Ropa</td><td>$800</td><td>2 %</td></tr>
              <tr><td>Salidas y entretenimiento</td><td>$1,200</td><td>3 %</td></tr>
              <tr><td>Provisión de gastos anuales</td><td>$1,500</td><td>4 %</td></tr>
              <tr><td>Ahorro</td><td>$1,800</td><td>5 %</td></tr>
              <tr><td><strong>Resto (margen para imprevistos)</strong></td><td><strong>$800</strong></td><td>2 %</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Total de gastos: $33,400; ahorro: $1,800. El <strong>margen de $800</strong> es pequeño: lo que protege este presupuesto es la provisión
          para los gastos del año y, en diciembre, el aguinaldo.
        </p>

        <h2>💵 Los datos oficiales de 2026</h2>
        <ul>
          <li>
            <strong>Salario mínimo</strong>: desde el 1 de enero de 2026 es de <strong>$315.04 diarios</strong> en la zona general, unos $9,582 al mes,
            y de $440.87 diarios en la Zona Libre de la Frontera Norte (Conasami).
          </li>
          <li>
            <strong>Inflación</strong>: según el INEGI, los precios subieron <strong>3.75 % anual en octubre de 2026</strong>, el nivel más alto desde mayo.
            Un presupuesto del año pasado ya quedó corto: revisa primero la despensa y la luz.
          </li>
          <li>
            <strong>Aguinaldo</strong>: por ley, al menos <strong>15 días de salario</strong>, pagados antes del 20 de diciembre. Si trabajaste menos de un año, te toca la parte proporcional.
          </li>
        </ul>

        <h2>🗓️ Cobras por quincena, pagas por mes</h2>
        <p>La renta, la colegiatura y el internet caen una vez al mes; el sueldo llega en dos partes. Para que no falte en la segunda quincena:</p>
        <ul>
          <li>reparte los gastos fijos entre las dos quincenas: por ejemplo, la <strong>renta con la primera</strong> y los servicios, la escuela y el ahorro con la segunda;</li>
          <li>fija un monto de despensa <strong>por semana</strong> y cuenta el mes real: <em>monto por semana × 52 ÷ 12</em>. $1,960 a la semana son unos $8,500 al mes, no $7,840;</li>
          <li>aparta el ahorro el día que cobras, no al final de la quincena.</li>
        </ul>

        <h2>🏠 La renta y los servicios</h2>
        <ul>
          <li><strong>Renta</strong>: al firmar suelen pedirte un mes de depósito y un mes por adelantado, a veces con aval o póliza jurídica. Junta ese dinero antes de mudarte, y revisa en el contrato cuánto puede subir la renta al renovar.</li>
          <li><strong>Luz (CFE)</strong>: el recibo llega cada dos meses. Divídelo entre 2 para tu presupuesto mensual, y aparta esa mitad el mes en que no pagas. Si pasas el límite de consumo de tu tarifa, pierdes el subsidio y el recibo se dispara.</li>
          <li><strong>Gas y agua</strong>: mismo método. Con gas estacionario, cada recarga es un gasto grande: repártelo entre los meses que dura.</li>
        </ul>

        <h2>🎒 Los hijos: el regreso a clases y las colegiaturas</h2>
        <p>
          Útiles, uniformes, zapatos, inscripción y cuotas se juntan en agosto. En escuela particular, la colegiatura es un gasto fijo de diez o doce meses:
          pregunta si hay descuento por pago anual o por hermanos. En escuela pública, calcula de todos modos los útiles, los uniformes y las cuotas.
        </p>

        <h2>📅 Los gastos que no llegan cada mes</h2>
        <p>
          En el ejemplo se apartan $1,500 al mes para: <strong>Navidad y Reyes</strong> ($6,000), el <strong>regreso a clases</strong> ($5,000),
          las <strong>vacaciones</strong> ($4,000) y el <strong>predial y el refrendo o la tenencia</strong> del coche ($3,000), es decir, $18,000 al año ÷ 12.
          El predial suele tener descuento si se paga en enero: una razón más para tener el dinero listo.
        </p>
        <p>
          El <strong>aguinaldo</strong> no entra en el presupuesto del mes. Decide antes de diciembre para qué será: los regalos, la cuesta de enero,
          una deuda cara o el fondo de emergencia. Y en el Buen Fin, los meses sin intereses solo convienen si la mensualidad ya cabe en tu presupuesto.
        </p>

        <h2>🤝 Tandas y ahorro</h2>
        <p>
          La <strong>tanda</strong> es una forma de ahorro que funciona, si el grupo es de confianza y sabes de antemano para qué usarás tu número:
          el regreso a clases, el depósito de una renta, un proyecto. Acompáñala con un pequeño fondo disponible en todo momento, para una urgencia médica o una reparación.
        </p>

        <h2>✏️ Haz el tuyo en 15 minutos</h2>
        <ol>
          <li>Copia la tabla con <strong>tus</strong> montos, a partir de tus gastos de los últimos tres meses.</li>
          <li>Añade la <strong>provisión</strong> para tus gastos del año y reparte los gastos fijos entre las dos quincenas.</li>
          <li>Fija el <strong>ahorro</strong>, aunque sea poco, y mira lo que queda.</li>
        </ol>
        <p>
          Para ir más rápido, descarga nuestra <a href="/es/plantilla-presupuesto-familiar">plantilla de presupuesto familiar gratuita</a> (Excel y PDF para imprimir),
          calcula <a href="/es/calculadora-dinero-disponible">cuánto te queda después de los gastos fijos</a> o reparte tu sueldo con
          la <a href="/es/calculadora-presupuesto-50-30-20">calculadora de la regla 50/30/20</a>. Todas funcionan en pesos mexicanos y sin registro.
        </p>

        <Cta title="El presupuesto de tu familia, cada mes" />

        <h2>❓ Preguntas frecuentes</h2>
        <h3>¿Cuánto gasta al mes una familia de 4 en México?</h3>
        <p>Depende sobre todo de la renta y de la despensa. En nuestro ejemplo de la CDMX, los gastos suman $33,400 al mes, más $1,800 de ahorro, con $36,000 de ingresos netos. Es una ilustración, no un promedio.</p>
        <h3>¿Cuál es el salario mínimo en México en 2026?</h3>
        <p>$315.04 diarios en la zona general, unos $9,582 al mes, y $440.87 diarios en la Zona Libre de la Frontera Norte, desde el 1 de enero de 2026.</p>
        <h3>¿Qué hacer con el aguinaldo?</h3>
        <p>No lo cuentes en el presupuesto del mes. Decide antes de diciembre su destino: regalos, cuesta de enero, una deuda cara o el fondo de emergencia.</p>
      </div>
    ),
  },
  {
    id: 'es-2',
    title: 'Presupuesto familiar en España: el ejemplo de una familia de 4 en Madrid',
    slug: 'presupuesto-familiar-espana-madrid',
    excerpt: 'El presupuesto de una familia de 4 en Madrid: alquiler, compra, luz, comedor escolar, SMI 2026, IPC, pagas extra y gastos anuales, con un ejemplo en euros.',
    category: 'Internacional',
    ...AUTHOR,
    publishedAt: '2026-11-13',
    readTime: '6 min',
    tags: ['España', 'Madrid', 'Presupuesto', 'Familia', 'Ejemplo'],
    featured: true,
    related: ['presupuesto-familiar-mexico-cdmx'],
    content: (
      <div className="prose prose-lg max-w-none">
        <p className="lead">
          En España, el presupuesto de una familia que alquila depende de una línea por encima de todas: la <strong>vivienda</strong>. Después vienen
          la <strong>compra</strong> y los gastos de los hijos. En nuestro ejemplo de Madrid, una familia de 4 gasta unos 3.560 € al mes, sin contar el ahorro.
          Aquí va el detalle, los datos oficiales de 2026 y el método para hacer el tuyo.
        </p>

        <h2>📋 Ejemplo de presupuesto mensual de una familia de 4 en Madrid</h2>
        <p>
          <strong>El hogar del ejemplo</strong>: una pareja que alquila un piso de 3 habitaciones en Madrid, con dos hijos de 4 y 9 años, un coche y un abono de transporte.
          Sueldos netos: 2.300 € y 1.700 € al mes, en 12 pagas. Estas cifras son una ilustración, no una media española: cambia cada línea por la tuya.
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr><th>Concepto</th><th>Al mes</th><th>Parte de los ingresos</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Ingresos netos del hogar</strong></td><td><strong>4.000 €</strong></td><td>100 %</td></tr>
              <tr><td>Alquiler de un piso de 3 habitaciones</td><td>1.400 €</td><td>35 %</td></tr>
              <tr><td>Luz y gas</td><td>130 €</td><td>3 %</td></tr>
              <tr><td>Agua</td><td>30 €</td><td>1 %</td></tr>
              <tr><td>Compra (alimentación, higiene, limpieza)</td><td>750 €</td><td>19 %</td></tr>
              <tr><td>Transporte (abono y un coche)</td><td>300 €</td><td>8 %</td></tr>
              <tr><td>Seguros (hogar, coche)</td><td>90 €</td><td>2 %</td></tr>
              <tr><td>Móviles e internet</td><td>70 €</td><td>2 %</td></tr>
              <tr><td>Hijos (comedor, extraescolares)</td><td>260 €</td><td>6 %</td></tr>
              <tr><td>Salud (dentista, farmacia)</td><td>50 €</td><td>1 %</td></tr>
              <tr><td>Ropa</td><td>100 €</td><td>2 %</td></tr>
              <tr><td>Ocio y salidas</td><td>180 €</td><td>4 %</td></tr>
              <tr><td>Provisión de gastos anuales</td><td>200 €</td><td>5 %</td></tr>
              <tr><td>Ahorro</td><td>300 €</td><td>8 %</td></tr>
              <tr><td><strong>Resto (margen para imprevistos)</strong></td><td><strong>140 €</strong></td><td>4 %</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Total de gastos: 3.560 €; ahorro: 300 €. El <strong>margen de 140 €</strong> es estrecho: con un alquiler que se lleva el 35 % de los ingresos,
          la provisión para los gastos anuales es lo que evita tirar de la tarjeta.
        </p>

        <h2>💶 Los datos oficiales de 2026</h2>
        <ul>
          <li>
            <strong>Salario mínimo (SMI)</strong>: <strong>1.221 € al mes en 14 pagas</strong>, es decir, 17.094 € al año o 1.424,50 € en 12 pagas,
            con efectos desde el 1 de enero de 2026 (Real Decreto 126/2026).
          </li>
          <li>
            <strong>Inflación</strong>: según el indicador adelantado del INE, el IPC subió un <strong>4,9 % anual en octubre de 2026</strong>,
            con una inflación subyacente del 3,1 %. Un presupuesto del año pasado ya se ha quedado corto.
          </li>
        </ul>

        <h2>🗓️ 12 o 14 pagas: no es lo mismo para el presupuesto</h2>
        <ul>
          <li><strong>Con 14 pagas</strong>, haz el presupuesto del mes con la nómina ordinaria y reserva las <strong>pagas extra</strong> (normalmente en junio y diciembre) para los gastos anuales: vacaciones, Navidad, seguros, IBI.</li>
          <li><strong>Con 12 pagas prorrateadas</strong>, cobras más cada mes pero no hay extra: la provisión mensual es imprescindible, porque nadie la hará por ti.</li>
          <li><strong>La declaración de la renta</strong> (de abril a junio): si te sale a devolver, es un ingreso que no llega cada mes; si te sale a pagar, puedes fraccionarlo en dos plazos. En los dos casos, apúntalo en el calendario.</li>
        </ul>

        <h2>🏠 El alquiler y los suministros</h2>
        <ul>
          <li><strong>Antes de firmar</strong>: la fianza, a menudo una garantía adicional y el primer mes. Reúne ese dinero antes de buscar piso.</li>
          <li><strong>La actualización anual</strong>: el contrato dice con qué índice sube la renta cada año. Apunta el mes y rehaz el presupuesto con el nuevo importe.</li>
          <li><strong>Luz y gas</strong>: compara tarifas una vez al año, y ajusta la potencia contratada a lo que usas de verdad. Según tus ingresos y tu situación familiar, puedes tener derecho al <strong>bono social</strong> eléctrico: se pide a tu comercializadora de referencia.</li>
        </ul>

        <h2>🛒 La compra</h2>
        <ul>
          <li>Fija un importe <strong>por semana</strong> y cuenta el mes real: <em>importe por semana × 52 ÷ 12</em>. 173 € a la semana son unos 750 € al mes, no 692 €.</li>
          <li>Compara el <strong>precio por kilo o por litro</strong>, no el del envase, y planifica los menús antes de ir a comprar.</li>
          <li>Las marcas blancas y los productos de temporada son el ahorro más fácil de mantener.</li>
        </ul>

        <h2>🎒 Los hijos: comedor, extraescolares y vuelta al cole</h2>
        <p>
          El <strong>comedor escolar</strong> y las <strong>extraescolares</strong> son un gasto fijo de septiembre a junio: cuéntalos como tal. Pregunta en tu comunidad
          autónoma y en tu ayuntamiento por las becas de comedor y de libros, que tienen plazos cortos. La vuelta al cole (libros, material, ropa) llega en septiembre,
          justo después de las vacaciones: es un gasto de la provisión.
        </p>

        <h2>📅 Los gastos que no llegan cada mes</h2>
        <p>
          En el ejemplo se apartan 200 € al mes para: las <strong>vacaciones</strong> (1.100 €), <strong>Navidad y Reyes</strong> (600 €), la <strong>vuelta al cole</strong> (400 €)
          y el <strong>seguro y la ITV del coche</strong> (300 €), es decir, 2.400 € al año ÷ 12. Si eres propietario, añade el <strong>IBI</strong> y la derrama de la comunidad, si la hay.
        </p>

        <h2>✏️ Haz el tuyo en 15 minutos</h2>
        <ol>
          <li>Copia la tabla con <strong>tus</strong> importes, a partir de los movimientos del banco de los últimos tres meses.</li>
          <li>Añade la <strong>provisión</strong> para tus gastos anuales, y decide a qué irán las pagas extra.</li>
          <li>Fija el <strong>ahorro</strong> y mira lo que queda.</li>
        </ol>
        <p>
          Para ir más rápido, descarga nuestra <a href="/es/plantilla-presupuesto-familiar">plantilla de presupuesto familiar gratuita</a> (Excel y PDF para imprimir),
          calcula <a href="/es/calculadora-dinero-disponible">cuánto te queda después de los gastos fijos</a> o reparte tu sueldo con
          la <a href="/es/calculadora-presupuesto-50-30-20">calculadora de la regla 50/30/20</a>. ¿Compartes piso? La <a href="/es/calculadora-dividir-alquiler">calculadora para dividir el alquiler</a> da la parte de cada persona.
        </p>

        <Cta title="El presupuesto de tu familia, cada mes" />

        <h2>❓ Preguntas frecuentes</h2>
        <h3>¿Cuánto gasta al mes una familia de 4 en España?</h3>
        <p>Depende sobre todo de la vivienda. En nuestro ejemplo de alquiler en Madrid, los gastos suman 3.560 € al mes, más 300 € de ahorro, con 4.000 € de sueldos netos. Es una ilustración, no una media.</p>
        <h3>¿Cuál es el salario mínimo en España en 2026?</h3>
        <p>1.221 € al mes en 14 pagas, 17.094 € al año, o 1.424,50 € al mes en 12 pagas, con efectos desde el 1 de enero de 2026.</p>
        <h3>¿Qué hacer con las pagas extra?</h3>
        <p>No las cuentes en el presupuesto del mes. Resérvalas para los gastos anuales (vacaciones, Navidad, seguros, IBI) y para el ahorro.</p>
      </div>
    ),
  },
];
