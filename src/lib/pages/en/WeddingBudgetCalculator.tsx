// src/lib/pages/en/WeddingBudgetCalculator.tsx
// ============================================================================
// « Wedding budget calculator » — the English version of /budget-mariage
// (hreflang pair, src/i18n/locales.ts). Same calculator, same fictitious
// example (labelled wherever it shows) and same saving plan; the words, the
// cost-cutting advice and the FAQ are written for English readers, and
// amounts are in the visitor's currency. No averages or market prices.
// Targets « wedding budget calculator », « wedding cost per guest » and
// « how much to save for a wedding ».
// ============================================================================

import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, ShieldCheck, Sparkles } from 'lucide-react';
import { CurrencyPicker, useCurrency } from '@/components/en/CurrencyPicker';
import { EnglishFooter, EnglishHeader, EnglishToolLinks } from '@/components/en/EnglishLayout';
import { Button } from '@/components/ui/button';
import { MariageCalculator, useMariageCalculator } from '@/components/tools/MariageCalculator';
import { FaqList, ToolArticle } from '@/components/tools/ToolKit';
import { MARIAGE_EN } from '@/i18n/en/mariage';
import { EXAMPLE, FEWER_GUESTS, POSTE_FIELDS, exampleResult } from '@/lib/tools/mariage';
import { WEDDING_FAQ_EN } from '@/seo/faq-wedding-en';

const PATH = '/en/wedding-budget-calculator';
const ex = exampleResult();

export default function WeddingBudgetCalculatorEn() {
  const { code, setCode, format } = useCurrency();
  const { money, moneyExact, pct } = format;
  const calc = useMariageCalculator({ t: MARIAGE_EN, format, storageKey: 'bf:wedding-budget:v1' });
  const { fillExample, scrollToResults, projectYear } = calc;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      <EnglishHeader />
      <main className="flex-1">
        <section className="px-4 pt-12 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-1.5 text-sm font-semibold text-success">
              <Calculator className="h-4 w-4" aria-hidden="true" /> Free calculator · no sign-up
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl [text-wrap:balance]">
              Wedding budget calculator
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Guests, catering, venue, outfits: add up your quotes, see the cost per guest and what to set aside each month
              until the big day. The result updates as you type.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              <ShieldCheck className="mr-1 inline h-4 w-4 align-[-3px] text-success" aria-hidden="true" />Your numbers stay on this device: nothing is sent.
            </p>
            <div className="mt-6 flex flex-col items-center gap-1.5">
              <Button type="button" variant="outline" className="min-h-[44px] bg-card" onClick={fillExample}>
                <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" /> Fill in an example
              </Button>
              <p className="text-xs text-muted-foreground">{MARIAGE_EN.exampleNote}.</p>
            </div>
          </div>
        </section>

        <MariageCalculator calc={calc} t={MARIAGE_EN} format={format} beforeWedding={<CurrencyPicker value={code} onChange={setCode} />} />

        <ToolArticle>
          <section>
            <h2>How to calculate your wedding budget</h2>
            <p className="mt-4 text-lg">
              A wedding budget is built from <strong>your quotes</strong>, not from an average: two weddings with the same number
              of guests can cost very different amounts depending on the venue, the caterer, the region and the season.
            </p>
            <ol className="mt-4 list-decimal space-y-2 pl-5">
              <li>
                <strong>List the items</strong>: venue, catering, drinks, attire and beauty, photo and video, music, flowers and
                decor, wedding rings, invitations, and the honeymoon if you’re planning one.
              </li>
              <li>
                <strong>Get quotes</strong> from several vendors for the biggest items, and note what’s included: service,
                tableware, drinks, overtime, taxes and service charges.
              </li>
              <li>
                <strong>Separate what’s paid per guest</strong> (the meal, the drinks) from what’s fixed (the venue, the
                photographer, the DJ, the outfits). Only the first move with the guest list.
              </li>
              <li>
                <strong>Add a contingency line</strong>: alterations, transport, last-minute purchases… there are always some.
              </li>
            </ol>
            <p className="mt-6 rounded-xl bg-muted/60 p-4 font-semibold text-foreground">
              Budget = (catering + drinks per guest) × number of guests + fixed costs + contingency
            </p>
          </section>

          <section>
            <h2>Wedding budget for 100 guests: an example</h2>
            <p className="mt-4">
              In our example, a couple invites {ex.guests} guests. The amounts are <strong>fictitious</strong>: round numbers
              chosen to show the calculation, not average prices. There’s no official reference price; the total depends mostly
              on the number of guests and the caterer. Replace each line with your quotes.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-foreground">
                    <th className="py-2 font-semibold">Item (fictitious example)</th>
                    <th className="py-2 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {POSTE_FIELDS.filter((f) => EXAMPLE.amounts[f.key]).map((f) => {
                    const v = EXAMPLE.amounts[f.key] ?? 0;
                    return (
                      <tr key={f.key}>
                        <td className="py-2">
                          {MARIAGE_EN.posts[f.key].label}
                          {f.perGuest && <span className="text-muted-foreground"> ({moneyExact(v)} × {ex.guests} guests)</span>}
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
              That’s <strong>{money(ex.costPerGuest)} per guest</strong>. Catering and drinks, paid per guest, come to{' '}
              {money(ex.perGuestTotal)} ({pct(ex.perGuestShare ?? 0)} of the total); the remaining {money(ex.fixedTotal)} don’t
              change with the number of guests. With {ex.fewerGuests.fewer} fewer guests, the example saves at least{' '}
              {money(ex.fewerGuests.saving)}: the guest list is the most direct lever. There’s no honeymoon in this example: if
              it’s part of your plans, add it.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4 min-h-[44px]"
              onClick={() => { if (fillExample()) scrollToResults(); }}
            >
              Load this example into the calculator <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </section>

          <section>
            <h2>How much to save each month for your wedding</h2>
            <p className="mt-4 rounded-xl bg-muted/60 p-4 font-semibold text-foreground">
              Monthly amount = (total budget − already saved) ÷ months before the wedding
            </p>
            <p className="mt-4">
              Count the current month and stop at the month before the wedding: the money is then ready before the big day.
              Round up: better to finish a little ahead.
            </p>
            <p className="mt-4">
              In our example, the couple has already saved {money(ex.saved)} and is getting married in {ex.months} months:
              ({money(ex.total)} − {money(ex.saved)}) ÷ {ex.months} = <strong>{money(ex.monthly)} a month</strong>.
            </p>
            <p className="mt-4">
              Also look at the payment schedule in your quotes: many vendors ask for a deposit when you book, then the balance
              before the date. Those payments come out earlier than the big day, and your savings need to keep up. To check that
              the monthly amount fits your budget, try our{' '}
              <Link to="/en/50-30-20-budget-calculator" className="font-medium text-primary hover:underline">50/30/20 budget calculator</Link>.
            </p>
          </section>

          <section>
            <h2>How to cut wedding costs</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>
                <strong>Review the guest list</strong>: the most direct lever, since the meal and drinks are multiplied by each
                guest. The calculator shows what {FEWER_GUESTS} fewer guests change.
              </li>
              <li>
                <strong>Pick an off-season date, a Friday or a Sunday</strong>: many venues and vendors charge differently
                depending on the day and the season. Ask for both quotes to compare.
              </li>
              <li>
                <strong>Compare venues</strong>: a community hall, a venue that lets you choose your own caterer, an estate that
                includes furniture. Check what’s included, and the corkage fee if you bring your own drinks.
              </li>
              <li>
                <strong>Adapt the meal format</strong>: cocktail reception, buffet, number of courses, with or without a brunch
                the next day.
              </li>
              <li>
                <strong>Do it yourself where it makes sense</strong>: decor, invitations, desserts, the playlist, while keeping
                time for yourselves the day before.
              </li>
              <li>
                <strong>Rent or buy second-hand</strong> outfits, decor or tableware, and reuse the ceremony flowers at the
                reception.
              </li>
            </ul>
          </section>

          <section>
            <h2>Who pays for the wedding?</h2>
            <p className="mt-4">
              There’s no rule. Depending on families and means, the wedding is paid for by the couple alone, shared with
              parents, or topped up with a contribution for a specific item, like the dress or the bar.
            </p>
            <p className="mt-4">
              Simplest is to talk about it early, before signing the first quotes: who contributes, how much and by when. Write
              it down: everyone knows what’s planned, and nobody is caught off guard.
            </p>
            <p className="mt-4">
              A shared budget helps. In Budget Famille, create a separate “Wedding {projectYear}” budget with its own members:
              invite your partner, and your parents if you like, by email; everyone sees the same figures in real time. A
              savings pot with a target and a date works out the amount to set aside each month. It’s free, with no need to
              connect your bank; the app is in French for now.
            </p>
          </section>

          <FaqList id="faq-wedding" items={WEDDING_FAQ_EN} title="Frequently asked questions" />

          <EnglishToolLinks current={PATH} />

          <section className="text-sm">
            <h2 className="!text-xl">Good to know</h2>
            <p className="mt-3">
              This calculator gives an estimate based on your own amounts. It doesn’t know prices in your area or your vendors’
              prices: only your quotes count. The example amounts are fictitious, and this page isn’t personalized financial
              advice.
            </p>
          </section>
        </ToolArticle>
      </main>
      <EnglishFooter />
    </div>
  );
}
