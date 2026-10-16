// src/lib/pages/en/LeftoverIncomeCalculator.tsx
// ============================================================================
// « Leftover income calculator » — the English version of /calcul-reste-a-vivre
// (hreflang pair, src/i18n/locales.ts). Same calculator; the words, the
// example and the benchmarks are written for English readers, without the
// French legal floor or lending rule presented as the rule. Amounts are in
// the visitor's currency. Targets « leftover income calculator », « money left
// after bills calculator » and « disposable income per person ».
// ============================================================================

import { Link } from 'react-router-dom';
import { Calculator, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CurrencyPicker, useCurrency } from '@/components/tools/CurrencyPicker';
import { EnglishToolLinks } from '@/components/en/EnglishLayout';
import { ResteAVivreCalculator } from '@/components/tools/ResteAVivreCalculator';
import { FaqList, ToolArticle } from '@/components/tools/ToolKit';
import { RAV_EXAMPLE_EN, RESTE_A_VIVRE_EN } from '@/i18n/en/resteAVivre';
import { scaleAmounts } from '@/lib/tools/scaleAmounts';
import { CHARGE_FIELDS, computeResteAVivre } from '@/lib/tools/resteAVivre';
import { LEFTOVER_INCOME_FAQ_EN } from '@/seo/faq-leftover-income-en';

const PATH = '/en/leftover-income-calculator';
const link = 'font-medium text-primary hover:underline';

export default function LeftoverIncomeCalculatorEn() {
  const { code, setCode, format } = useCurrency();
  const { money, moneyExact, pct } = format;
  // The fictitious example in the visitor's currency (the household stays as it is).
  const EXAMPLE = scaleAmounts(RAV_EXAMPLE_EN, format.example, ['household']);
  const example = computeResteAVivre(EXAMPLE.household, EXAMPLE.incomes, EXAMPLE.charges);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="px-4 pt-12 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-1.5 text-sm font-semibold text-success">
              <Calculator className="h-4 w-4" aria-hidden="true" /> Free calculator · no sign-up
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl [text-wrap:balance]">
              Leftover income calculator
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Your income minus your fixed bills: see what your household has left each month, per person and per day. The
              result updates as you type.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              <ShieldCheck className="mr-1 inline h-4 w-4 align-[-3px] text-success" aria-hidden="true" />Your numbers stay on this device: nothing is sent.
            </p>
          </div>
        </section>

        <ResteAVivreCalculator
          t={RESTE_A_VIVRE_EN}
          format={format}
          storageKey="bf:leftover-income:v1"
          example={EXAMPLE}
          beforeHousehold={<CurrencyPicker value={code} onChange={setCode} />}
        />

        <ToolArticle>
          <section>
            <h2>How to calculate your leftover income</h2>
            <p className="mt-4 text-lg">
              <strong>Leftover income = monthly take-home income − monthly fixed bills.</strong> It’s the money left for groceries,
              clothes, out-of-pocket health costs, fun and savings, once everything that comes back every month is paid.
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="font-semibold text-foreground">Income to count</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Take-home pay (after tax and deductions)</li>
                  <li>Benefits and tax credits paid monthly</li>
                  <li>Pension, child support received, rental income</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Fixed bills to subtract</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Rent or mortgage payment</li>
                  <li>Other loans (car, personal, credit card minimums)</li>
                  <li>Energy, water, insurance</li>
                  <li>Internet, phone, subscriptions, transport</li>
                  <li>Childcare, school costs, taxes not taken from pay</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2>An example</h2>
            <p className="mt-4">
              In our example, a couple with two children aged 6 and 10 brings home {money(example.revenus)} a month.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-foreground">
                    <th className="py-2 font-semibold">Item (example)</th>
                    <th className="py-2 text-right font-semibold">Per month</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr><td className="py-2">Take-home pay</td><td className="py-2 text-right tabular-nums">{money(example.revenus)}</td></tr>
                  {CHARGE_FIELDS.filter((f) => EXAMPLE.charges[f.key]).map((f) => (
                    <tr key={f.key}><td className="py-2">{RESTE_A_VIVRE_EN.charges[f.key].label}</td><td className="py-2 text-right tabular-nums">− {money(EXAMPLE.charges[f.key] ?? 0)}</td></tr>
                  ))}
                  <tr className="font-semibold text-foreground"><td className="py-2">Leftover income</td><td className="py-2 text-right tabular-nums">{money(example.reste)}</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              That’s {money(example.parPersonne)} per person and {moneyExact(example.parJour)} a day for the household. Its fixed bills
              take {pct(example.chargesShare ?? 0)} of its income and its car loan {pct(example.debtRatio ?? 0)}. To see where the rest
              could go, try the <Link to="/en/50-30-20-budget-calculator" className={link}>50/30/20 budget calculator</Link>.
            </p>
          </section>

          <section>
            <h2>Per person or per adult equivalent?</h2>
            <p className="mt-4">
              Dividing by the number of people is simple, but a child doesn’t cost as much as an adult, and two adults don’t spend
              twice as much as one (one rent, one internet plan). To compare households of different sizes, statisticians divide by
              <strong> adult equivalents</strong> on the OECD-modified scale: 1 for the first adult, 0.5 for each other person aged
              14 or over, 0.3 for each child under 14. A couple with two young children counts as 2.1.
            </p>
          </section>

          <section>
            <h2>How much should be left?</h2>
            <p className="mt-4">
              There’s no universal minimum: it depends on the cost of living where you are and on your household. Two benchmarks help:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li><strong>Housing</strong>: a common rule of thumb is to keep it under about 30% of income. In the United States,
                households above that are considered cost-burdened (U.S. Census Bureau).</li>
              <li><strong>Needs as a whole</strong>: the 50/30/20 rule keeps needs (housing, bills, groceries, minimum loan
                payments) to about half of take-home pay, so that 30% goes to wants and 20% to savings.</li>
            </ul>
            <p className="mt-4">
              Lenders look at your debt-to-income ratio with their own rules, often on gross income: the loan share shown by the
              calculator, on take-home income, is a rough guide only.
            </p>
          </section>

          <section>
            <h2>How to increase your leftover income</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li><strong>Compare your bills</strong> for energy, internet, phone and insurance: our <Link to="/en/ai-tools" className={link}>free AI tools</Link> estimate in 30 seconds what could go down.</li>
              <li><strong>Check what you’re entitled to</strong>: benefits and tax credits, on your government’s official website.</li>
              <li><strong>Spread yearly bills</strong> (property tax, insurance, back to school) by setting aside a twelfth every month: our <Link to="/en/free-budget-template" className={link}>free budget template</Link> does it for you.</li>
              <li><strong>Share costs fairly as a couple</strong>, in proportion to each person’s pay when incomes differ: the template’s “Joint pot” tab compares the methods.</li>
              <li><strong>Get free help</strong> if the budget no longer holds: non-profit debt advice services are free and confidential.</li>
            </ul>
          </section>

          <FaqList id="faq-leftover-income" items={LEFTOVER_INCOME_FAQ_EN} title="Frequently asked questions" />

          <EnglishToolLinks current={PATH} />

          <section className="text-sm">
            <h2 className="!text-xl">Sources</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li><a href="https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Glossary:Equivalised_disposable_income" target="_blank" rel="noopener" className="text-primary hover:underline">Eurostat: Equivalised disposable income (modified OECD scale)</a></li>
              <li><a href="https://www.census.gov/library/stories/2022/12/housing-costs-burden.html" target="_blank" rel="noopener" className="text-primary hover:underline">U.S. Census Bureau: Housing cost burden (more than 30% of income)</a></li>
            </ul>
            <p className="mt-3">
              This calculator gives an indicative figure based on the amounts you enter. It doesn’t replace advice from a lender or
              a debt adviser.
            </p>
          </section>
        </ToolArticle>
      </main>
      <Footer />
    </div>
  );
}
