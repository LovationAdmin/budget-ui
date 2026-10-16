// src/i18n/en/resteAVivre.tsx
// Words of the leftover income calculator in English
// (/en/leftover-income-calculator). Localized rather than translated: no
// country's benefits or debt rules presented as the rule, and the per-unit
// figure uses the OECD-modified equivalence scale, its international name.

import { Link } from 'react-router-dom';
import type { RavCopy, RavExample } from '@/components/tools/ResteAVivreCalculator';

/** Fictitious example: a couple with two children aged 6 and 10. */
export const RAV_EXAMPLE_EN: RavExample = {
  household: { adults: 2, kidsUnder14: 2, teens14plus: 0 },
  incomes: { salaires: 6000 },
  charges: { loyer: 1800, credits: 400, energie: 250, assurances: 300, telecom: 150, transport: 200, enfants: 600 },
};

export const RESTE_A_VIVRE_EN: RavCopy = {
  calculatorLabel: 'Calculator',
  seeExample: 'See the example',
  householdTitle: 'Your household',
  adults: 'Adults',
  kidsUnder14: 'Children under 14',
  teens: { label: 'Children 14 and over', hint: 'Or another dependant' },
  stepper: { remove: (label) => `Fewer: ${label}`, add: (label) => `More: ${label}` },
  incomesTitle: 'Monthly take-home income',
  incomes: {
    salaires: { label: 'Pay and earnings', hint: 'What lands in your account, after tax and deductions' },
    aides: { label: 'Benefits and support', hint: 'Child benefit, tax credits, housing support…' },
    autres: { label: 'Other income', hint: 'Pension, child support received, rental income…' },
  },
  chargesTitle: 'Monthly fixed bills',
  charges: {
    loyer: { label: 'Rent', hint: 'Service charges included' },
    creditImmo: { label: 'Mortgage', hint: 'Monthly payment, mortgage insurance included' },
    credits: { label: 'Other loans', hint: 'Car, personal loans, credit card minimums' },
    energie: { label: 'Energy and water', hint: 'Electricity, gas, heating, water' },
    assurances: { label: 'Insurance', hint: 'Home, car, health' },
    telecom: { label: 'Internet, phone and subscriptions' },
    transport: { label: 'Transport', hint: 'Transit pass, fuel for regular trips' },
    enfants: { label: 'Childcare and school costs' },
    impots: { label: 'Taxes', hint: 'Those not taken from your pay (property tax ÷ 12…)' },
    pension: { label: 'Child support or alimony paid' },
    autres: { label: 'Other fixed bills' },
  },
  moreCharges: 'More bills: transport, childcare, taxes, support…',
  chargesNote: 'A yearly bill (property tax, insurance paid once a year)? Divide it by 12. Groceries, clothes and fun aren’t fixed bills: they’re what your leftover income pays for.',
  perMonth: '/month',
  resultTitle: 'Your leftover income',
  emptyResult: 'Enter your income and bills: the result shows up here as you type.',
  deficit: (amount) => `Your fixed bills are ${amount} a month more than your income.`,
  after: (charges, income) => `after ${charges} of fixed bills, out of ${income} of income`,
  deficitHelp: (
    <>
      <p className="font-semibold text-foreground">Ways to rebalance</p>
      <ul className="mt-2 space-y-1.5">
        <li><Link to="/en/ai-tools" className="font-medium text-primary hover:underline">Estimate how much your bills could go down</Link></li>
        <li>Check which benefits or tax credits you may be entitled to, on your government’s official website</li>
        <li>Talk to a free, non-profit debt advice service in your country: it’s confidential</li>
      </ul>
    </>
  ),
  tiles: {
    perPerson: 'Per person',
    persons: (n) => `${n} ${n > 1 ? 'people' : 'person'}`,
    perDay: 'Per day',
    perDayNote: 'over 30 days',
    perUnit: 'Per adult eq.',
    units: (n) => `${n} units (OECD)`,
  },
  chargesShare: {
    label: 'Fixed bills',
    ofIncome: (pct) => `${pct} of income`,
    aria: (pct) => `Fixed bills: ${pct} of income`,
  },
  debt: {
    title: (pct) => `Loan payments: ${pct} of take-home income`,
    note: () => ({ tone: 'info', text: 'Lenders work from their own rules, often on gross income: treat this as a rough guide. The lower, the more room you have.' }),
  },
  signup: {
    title: 'Track what’s left every month, together',
    text: 'Budget Famille fills in every month from your bills, in real time with your partner. Free.',
    cta: 'Create my free budget',
  },
  reset: 'Clear',
  share: {
    button: 'Share the calculator',
    copied: 'Link copied',
    url: 'https://www.budgetfamille.com/en/leftover-income-calculator',
    title: 'Leftover income calculator',
    text: 'A free calculator to see what’s left after bills, per person and per day.',
  },
  sticky: { label: 'Leftover income', details: 'See the details' },
};
