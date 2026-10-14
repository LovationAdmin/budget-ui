// src/lib/pages/en/RentSplitCalculator.tsx
// ============================================================================
// « Rent split calculator » — the English version of /budget-colocation
// (hreflang pair, src/i18n/locales.ts). Same calculator and split; the words,
// the example (bedroom sizes in the visitor's usual unit), the shared-home
// advice and the FAQ are written for English readers, without any country's
// tenancy law presented as the rule. Amounts are in the visitor's currency.
// Targets « rent split calculator », « split rent by room size » and
// « how to split rent with roommates ».
// ============================================================================

import { Calculator, ShieldCheck } from 'lucide-react';
import { CurrencyPicker, useCurrency } from '@/components/en/CurrencyPicker';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { EnglishToolLinks } from '@/components/en/EnglishLayout';
import { ColocationCalculator } from '@/components/tools/ColocationCalculator';
import { FaqList, ToolArticle } from '@/components/tools/ToolKit';
import { COLOCATION_EN, colocExampleEn } from '@/i18n/en/colocation';
import { COMMON_SHARE, computeColocation } from '@/lib/tools/colocation';
import { RENT_SPLIT_FAQ_EN } from '@/seo/faq-rent-split-en';

const PATH = '/en/rent-split-calculator';

export default function RentSplitCalculatorEn() {
  const { code, setCode, currency, format } = useCurrency();
  const { moneyExact: money, pct } = format;
  const unit = currency.area;
  const example = colocExampleEn(unit);
  const examples = (['egal', 'chambre', 'revenus'] as const).map((m) => computeColocation({ ...example, method: m }));
  const sizes = example.roommates.map((m) => m.room);

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
              Rent split calculator: who pays what?
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Rent, bills, shared groceries: work out each roommate’s share, equally, by bedroom size or by income. The result
              updates as you type.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              <ShieldCheck className="mr-1 inline h-4 w-4 align-[-3px] text-success" aria-hidden="true" />Your numbers stay on this device: nothing is sent.
            </p>
          </div>
        </section>

        <ColocationCalculator
          t={COLOCATION_EN}
          format={format}
          storageKey="bf:rent-split:v1"
          example={example}
          areaUnit={unit}
          beforeHousehold={<CurrencyPicker value={code} onChange={setCode} />}
        />

        <ToolArticle>
          <section>
            <h2>How to split rent between roommates</h2>
            <p className="mt-4 text-lg">
              There’s no set rule: roommates agree on it together, ideally <strong>before moving in</strong>, and write it down
              (in a roommate agreement, a shared message or a shared budget). Three methods come up most often.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li><strong>Equal shares</strong>: the rent divided by the number of roommates. The simplest, and the fairest when the bedrooms are alike.</li>
              <li><strong>By bedroom</strong>: the shared spaces (kitchen, living room, bathroom) benefit everyone, so part of the rent is split equally; the rest follows the size of each bedroom. Our calculator splits {pct(COMMON_SHARE)} of the rent equally. Square feet or square meters, only the proportions count.</li>
              <li><strong>By income</strong>: everyone pays in proportion to their take-home pay. Less common among friends, but useful when incomes are far apart.</li>
            </ul>
            <p className="mt-4">
              Shared bills (energy, internet, insurance, household supplies) are almost always split equally. A private bathroom,
              a balcony or a parking space? Agree on a small extra for that room.
            </p>
          </section>

          <section>
            <h2>Example: 3 roommates</h2>
            <p className="mt-4">
              In our example, three roommates rent a place for {money(example.rent)} a month, with bedrooms of {sizes[0]},{' '}
              {sizes[1]} and {sizes[2]} {unit}. Shared bills (energy, internet, insurance, supplies) come to{' '}
              {money(examples[0].bills)} a month, or {money(examples[0].shares[0].bills)} each.
            </p>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <caption className="sr-only">Monthly share of each roommate by method, in our example</caption>
                <thead>
                  <tr className="border-b border-border text-foreground">
                    <th scope="col" className="py-2 pr-3 font-semibold">Roommate</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Equal shares</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">By bedroom</th>
                    <th scope="col" className="py-2 text-right font-semibold">By income</th>
                  </tr>
                </thead>
                <tbody>
                  {example.roommates.map((m, i) => (
                    <tr key={m.name} className="border-b border-border/60">
                      <th scope="row" className="py-2 pr-3 font-medium text-foreground">{m.name} <span className="font-normal text-muted-foreground">({m.room} {unit}, {format.money(m.income)} take-home)</span></th>
                      {examples.map((e, k) => <td key={k} className="py-2 pr-3 text-right tabular-nums">{money(e.shares[i].total)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm">
              Monthly amounts, rent and bills included. With the “by bedroom” method, the gap between the smallest and the
              largest bedroom is {money(examples[1].shares[2].total - examples[1].shares[0].total)} a month.
            </p>
          </section>

          <section>
            <h2>Bills, groceries and a shared pot</h2>
            <p className="mt-4">
              The simplest way to avoid keeping score: a <strong>shared pot</strong>. Everyone pays their share in at the start of
              the month, and the rent, bills and shared groceries are paid from it. Everyone’s own spending (their own food, nights
              out) stays separate.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>List together what’s shared: cleaning products, toilet paper, oil, salt… and what isn’t.</li>
              <li>Bring irregular bills back to a month: an energy bill every two months is divided by 2, a yearly insurance by 12.</li>
              <li>Check in once a month, and adjust when someone moves in or out.</li>
            </ul>
          </section>

          <section>
            <h2>Before you move in: put it in writing</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li><strong>Joint lease or individual leases</strong>: on a joint lease, everyone signs the same contract and is often responsible for the whole rent, so if one roommate doesn’t pay, the landlord may ask the others. With individual leases, each person usually owes only their own rent. Check your lease and the rules where you live.</li>
              <li><strong>The split</strong>: the method, each person’s amount, and when payments are due.</li>
              <li><strong>The security deposit</strong>: who paid what, and how it is returned when someone moves out.</li>
              <li><strong>Moving out</strong>: the notice to give, and how a new roommate is found.</li>
              <li><strong>Bills and chores</strong>: whose name each account is in, and how shared supplies are bought.</li>
            </ul>
          </section>

          <FaqList id="faq-rent-split" items={RENT_SPLIT_FAQ_EN} title="Frequently asked questions" />

          <EnglishToolLinks current={PATH} />

          <section className="text-sm">
            <h2 className="!text-xl">Good to know</h2>
            <p className="mt-3">
              This calculator gives an indicative split based on the amounts you enter. It doesn’t replace your lease or legal
              advice.
            </p>
          </section>
        </ToolArticle>
      </main>
      <Footer />
    </div>
  );
}
