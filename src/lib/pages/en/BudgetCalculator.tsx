// src/lib/pages/en/BudgetCalculator.tsx
// ============================================================================
// « 50/30/20 budget calculator » — the English version of /budget-personnel
// (hreflang pair, src/i18n/locales.ts). Same calculator and rule; the words,
// the example, the help links and the article are written for English
// readers, and amounts are in the visitor's currency (from the browser's
// region, changeable, shared by the English pages). Targets « 50/30/20 budget
// calculator », « 50/30/20 rule » and « how much should I save a month ».
// ============================================================================

import { Calculator, ShieldCheck } from 'lucide-react';
import { useMemo } from 'react';
import { CurrencyPicker, useCurrency } from '@/components/tools/CurrencyPicker';
import { scaleAmounts } from '@/lib/tools/scaleAmounts';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { EnglishToolLinks } from '@/components/en/EnglishLayout';
import { BudgetPersoCalculator } from '@/components/tools/BudgetPersoCalculator';
import { FaqList, ToolArticle } from '@/components/tools/ToolKit';
import { BUDGET_PERSO_EN, EXAMPLE_EN, EXAMPLE_EN_HIGH_RENT } from '@/i18n/en/budgetPerso';
import { FULL_SAVINGS_MAX_NEEDS_SHARE, NEED_FIELDS, computeBudgetPerso } from '@/lib/tools/budgetPerso';
import { BUDGET_503020_FAQ_EN } from '@/seo/faq-503020-en';


export default function BudgetCalculatorEn() {
  const { code, setCode, format } = useCurrency();
  const { money, moneyExact, pct } = format;
  // The fictitious example in the visitor's currency (scaled for rupees, naira…).
  const ex = useMemo(() => scaleAmounts(EXAMPLE_EN, format.example), [format]);
  const exHigh = useMemo(() => scaleAmounts(EXAMPLE_EN_HIGH_RENT, format.example), [format]);
  const copy = useMemo(() => ({ ...BUDGET_PERSO_EN, example: ex }), [ex]);
  const example = computeBudgetPerso(ex.incomes, ex.needs);
  const exampleHigh = computeBudgetPerso(exHigh.incomes, exHigh.needs);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="px-4 pt-12 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-1.5 text-sm font-semibold text-success">
              <Calculator className="h-4 w-4" aria-hidden="true" /> Free calculator · 50/30/20 rule
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl [text-wrap:balance]">
              50/30/20 budget calculator
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Enter your take-home pay and essential expenses: see what the 50/30/20 rule means for you, what’s left once
              your needs are paid and how much you can save each month. No judgment, and the result updates as you type.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              <ShieldCheck className="mr-1 inline h-4 w-4 align-[-3px] text-success" aria-hidden="true" />No sign-up. Your numbers stay on this device: nothing is sent.
            </p>
          </div>
        </section>

        <BudgetPersoCalculator t={copy} format={format} storageKey="bf:503020-calculator:v1" beforeIncomes={<CurrencyPicker value={code} onChange={setCode} />} />

        <ToolArticle>
          <section>
            <h2>How to make a personal budget in 5 steps</h2>
            <p className="mt-4 text-lg">
              A budget isn’t about going without: it’s knowing where your money goes, so you decide what matters. One hour
              is enough, with your bank statements from the last two or three months.
            </p>
            <ol className="mt-6 list-decimal space-y-4 pl-5">
              <li>
                <strong>Start from your take-home pay.</strong> What actually lands in your account after tax and deductions,
                plus benefits and other regular income. If your income varies (bonuses, gig or freelance work), use a “low”
                month rather than an optimistic average.
              </li>
              <li>
                <strong>List your fixed bills.</strong> Housing, utilities, internet and phone, transportation, insurance, loan
                payments: everything that comes back every month and that you can’t really adjust.
              </li>
              <li>
                <strong>Divide yearly costs by 12.</strong> Property tax, insurance paid once a year, annual subscriptions,
                holiday gifts: set aside a twelfth each month, so they stop coming back as “bad surprises”.
              </li>
              <li>
                <strong>Estimate your variable spending.</strong> Groceries, eating out, clothes, hobbies: these move the most.
                An honest estimate beats an ideal number; adjust it after a month of tracking.
              </li>
              <li>
                <strong>Pay yourself first.</strong> Schedule a transfer to savings right after payday instead of saving “what’s
                left” at the end of the month: there rarely is anything left. Even a small amount builds the habit.
              </li>
            </ol>
          </section>

          <section id="rule" className="scroll-mt-24">
            <h2>The 50/30/20 rule explained</h2>
            <p className="mt-4 text-lg">
              <strong>The 50/30/20 rule splits your after-tax income into three parts</strong>: half for what you must pay,
              close to a third for what makes life enjoyable, and the rest for your future.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border/70 p-4">
                <p className="font-display text-2xl font-bold text-foreground">50%</p>
                <h3 className="font-semibold text-foreground">Needs</h3>
                <p className="mt-1 text-sm">Housing, utilities, groceries, transportation, insurance, minimum loan payments: what you pay no matter what.</p>
              </div>
              <div className="rounded-xl border border-border/70 p-4">
                <p className="font-display text-2xl font-bold text-foreground">30%</p>
                <h3 className="font-semibold text-foreground">Wants</h3>
                <p className="mt-1 text-sm">Eating out, going out, hobbies, shopping, travel, streaming and other nice-to-have subscriptions.</p>
              </div>
              <div className="rounded-xl border border-border/70 p-4">
                <p className="font-display text-2xl font-bold text-foreground">20%</p>
                <h3 className="font-semibold text-foreground">Savings</h3>
                <p className="mt-1 text-sm">Emergency fund, goals, retirement, or paying debt down faster than the minimum.</p>
              </div>
            </div>
            <p className="mt-6">
              The rule was popularized by U.S. Senator Elizabeth Warren and her daughter Amelia Warren Tyagi in their book{' '}
              <em>All Your Worth</em> (2005). Its appeal: it fits in three numbers and leaves real room for wants, which
              makes it easier to stick to than a budget where every expense is counted.
            </p>
            <p className="mt-4">
              It’s a <strong>benchmark, not an obligation</strong>. If your rent is high, your needs can go over 50% without you
              having done anything wrong. The calculator then adapts how what’s left is split, with a simple rule:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li><strong>Needs up to 50%</strong>: 30% for wants, 20% for savings, and anything left over is free margin.</li>
              <li><strong>Needs between 50% and {pct(FULL_SAVINGS_MAX_NEEDS_SHARE)}</strong>: wants shrink first and savings stay at 20% of income, as long as wants keep at least as much as savings.</li>
              <li><strong>Needs above {pct(FULL_SAVINGS_MAX_NEEDS_SHARE)}</strong>: what’s left is split into two equal halves, one for wants, the other for the savings you can manage. Keeping 20% would otherwise squeeze wants, and a budget that’s too tight rarely lasts.</li>
              <li><strong>Needs above your income</strong>: no split, but ways to rebalance.</li>
            </ul>
          </section>

          <section>
            <h2>A 50/30/20 budget example</h2>
            <p className="mt-4">
              In our example, Sam lives alone and takes home {money(example.revenus)} a month. Here are Sam’s essential
              expenses (fictitious amounts):
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-foreground">
                    <th className="py-2 font-semibold">Need (example)</th>
                    <th className="py-2 text-right font-semibold">Per month</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {NEED_FIELDS.filter((f) => ex.needs[f.key]).map((f) => (
                    <tr key={f.key}><td className="py-2">{BUDGET_PERSO_EN.needs[f.key].label}</td><td className="py-2 text-right tabular-nums">{money(ex.needs[f.key] ?? 0)}</td></tr>
                  ))}
                  <tr className="font-semibold text-foreground"><td className="py-2">Total needs</td><td className="py-2 text-right tabular-nums">{money(example.besoins)}</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              The 50/30/20 rule gives Sam {money(example.regle.besoins)} for needs, {money(example.regle.envies)} for wants
              and {money(example.regle.epargne)} for savings. Sam’s actual needs come to {money(example.besoins)}, or{' '}
              {pct(example.besoinsShare ?? 0)} of income: a little above the benchmark. That leaves {money(example.reste)}:
              keeping {money(example.epargne)} for savings, wants come to {money(example.envies)}, or{' '}
              {moneyExact(example.enviesParJour)} a day.
            </p>
            <p className="mt-4">
              If Sam’s rent were {money(exHigh.needs.logement ?? 0)} instead of {money(ex.needs.logement ?? 0)},
              needs would rise to {money(exampleHigh.besoins)} ({pct(exampleHigh.besoinsShare ?? 0)}). What’s left,{' '}
              {money(exampleHigh.reste)}, would be split into {money(exampleHigh.envies)} for wants and{' '}
              {money(exampleHigh.epargne)} for savings.
            </p>
          </section>

          <section>
            <h2>How much should you save each month?</h2>
            <p className="mt-4">
              The rule suggests <strong>20% of your take-home pay</strong>, which is {money(example.regle.epargne)} on{' '}
              {money(example.revenus)}. It’s a useful benchmark, not a test: the right amount is the one you can keep up
              every month.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li><strong>Start small.</strong> An automatic transfer of {money(format.example(25))} or {money(format.example(50))} on payday already builds the habit. Raise it with each pay rise or when a loan ends.</li>
              <li><strong>Emergency fund first.</strong> A cushion for the unexpected: a breakdown, a repair, medical bills, a drop in income. A common benchmark is three to six months of essential expenses; set your own target and get there step by step.</li>
              <li><strong>Then your goals.</strong> A trip, a car, a down payment: divide the amount by the number of months until the date. For {money(format.example(1200))} in 12 months, that’s {money(format.example(1200) / 12)} a month.</li>
            </ul>
            <p className="mt-4">
              In Budget Famille, a savings pot can have a target and an end date: the amount to set aside each month is
              calculated for you.
            </p>
          </section>

          <FaqList id="faq-503020" items={BUDGET_503020_FAQ_EN} title="Frequently asked questions" />

          <EnglishToolLinks current="/en/50-30-20-budget-calculator" />

          <section className="text-sm">
            <h2 className="!text-xl">Good to know</h2>
            <p className="mt-3">
              This calculator gives an estimate based on the amounts you enter. The 50/30/20 rule is a benchmark: it doesn’t
              replace personalized financial advice, and we don’t recommend any savings product.
            </p>
          </section>
        </ToolArticle>
      </main>
      <Footer />
    </div>
  );
}
