// src/i18n/en/budgetPerso.tsx
// Words of the 50/30/20 calculator in English (/en/50-30-20-budget-calculator).
// Localized rather than translated: take-home pay instead of « salaire net »,
// help links for English-speaking countries, an example sized for them, and
// the visitor's currency (CURRENCIES, chosen from the browser's region).

import type { BudgetPersoCopy, BudgetPersoFormat } from '@/components/tools/BudgetPersoCalculator';
import { moneyIntl, parseAmountEn } from '@/lib/budget/format';
import type { IncomeKey, NeedKey } from '@/lib/tools/budgetPerso';

export type CurrencyCode = 'USD' | 'GBP' | 'EUR' | 'CAD' | 'AUD';

export const CURRENCIES: ReadonlyArray<{ code: CurrencyCode; label: string; locale: string; symbol: string }> = [
  { code: 'USD', label: 'US dollar ($)', locale: 'en-US', symbol: '$' },
  { code: 'GBP', label: 'Pound sterling (£)', locale: 'en-GB', symbol: '£' },
  { code: 'EUR', label: 'Euro (€)', locale: 'en-IE', symbol: '€' },
  { code: 'CAD', label: 'Canadian dollar ($)', locale: 'en-CA', symbol: '$' },
  { code: 'AUD', label: 'Australian dollar ($)', locale: 'en-AU', symbol: '$' },
];

const EURO_REGIONS = ['AT', 'BE', 'CY', 'DE', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PT', 'SI', 'SK'];

/** The currency of the browser's region ("en-GB" → GBP), US dollar otherwise. */
export function currencyFromBrowser(): CurrencyCode {
  if (typeof navigator === 'undefined') return 'USD';
  for (const tag of navigator.languages ?? [navigator.language]) {
    const region = tag?.split('-')[1]?.toUpperCase();
    if (!region) continue;
    if (region === 'GB' || region === 'UK') return 'GBP';
    if (region === 'CA') return 'CAD';
    if (region === 'AU') return 'AUD';
    if (EURO_REGIONS.includes(region)) return 'EUR';
    if (region === 'US') return 'USD';
  }
  return 'USD';
}

export function formatEn(code: CurrencyCode): BudgetPersoFormat {
  const c = CURRENCIES.find((x) => x.code === code) ?? CURRENCIES[0];
  return {
    money: (n) => moneyIntl(n, c.locale, c.code, true),
    moneyExact: (n) => moneyIntl(n, c.locale, c.code),
    pct: (r) => `${Math.round(r * 100)}%`,
    parse: parseAmountEn,
    suffix: `${c.symbol}/month`,
  };
}

/** Fictitious example: a single person taking home 4,000 a month, needs at 55 %. */
export const EXAMPLE_EN: { incomes: Partial<Record<IncomeKey, number>>; needs: Partial<Record<NeedKey, number>> } = {
  incomes: { salaire: 4000 },
  needs: { logement: 1300, energie: 140, telecom: 80, transport: 220, assurances: 110, courses: 350 },
};

/** Same person with a higher rent, to show the half-and-half split. */
export const EXAMPLE_EN_HIGH_RENT = { ...EXAMPLE_EN, needs: { ...EXAMPLE_EN.needs, logement: 1700 } };

const link = 'font-medium text-primary hover:underline';

export const BUDGET_PERSO_EN: BudgetPersoCopy = {
  incomes: {
    salaire: { label: 'Take-home pay', hint: 'What lands in your account, after tax and deductions' },
    autres: { label: 'Other income', hint: 'Benefits, child support, side job, rental income…' },
  },
  needs: {
    logement: { label: 'Housing', hint: 'Rent or mortgage payment, service charges included' },
    energie: { label: 'Utilities', hint: 'Electricity, gas, heating, water' },
    telecom: { label: 'Internet and phone' },
    transport: { label: 'Transportation', hint: 'Transit pass, fuel for regular trips' },
    assurances: { label: 'Insurance', hint: 'Home or renters, car, health' },
    credits: { label: 'Loan payments (excluding mortgage)', hint: 'Car loan, personal loan, credit card minimums' },
    courses: { label: 'Groceries', hint: 'Food and household essentials' },
    sante: { label: 'Out-of-pocket health costs' },
    enfants: { label: 'Childcare and kids', hint: 'Daycare, school meals, school fees' },
    impots: { label: 'Taxes not withheld', hint: 'Property tax ÷ 12, tax owed…' },
    autres: { label: 'Other essentials' },
  },
  example: EXAMPLE_EN,
  calculatorLabel: 'Calculator',
  incomeTitle: 'Net monthly income',
  seeExample: 'See the example',
  needsTitle: 'Essential monthly expenses',
  needsIntro: '“Needs”: what you have to pay no matter what to keep a roof over your head, eat, get to work and stay insured.',
  moreNeeds: 'More: health, childcare, taxes…',
  annualNote: 'A yearly expense (property tax, insurance paid once a year, annual subscription)? Divide it by 12. Eating out, hobbies and shopping are not needs: they are wants, and the rule keeps a share for them.',
  savingsTitle: 'What you already save',
  optional: 'Optional',
  savingsLabel: 'Amount you already set aside each month',
  savingsHint: 'Transfers to savings, savings pots… Leave it empty if you are just starting: that’s fine too.',
  resultTitle: 'After your essential expenses',
  perMonth: '/month',
  emptyResult: 'Enter your take-home pay and essential expenses: your 50/30/20 budget shows up here as you type.',
  deficit: (gap) => `Your essential expenses exceed your income by ${gap} a month.`,
  summary: (income, needs) => `out of ${income} of income, after ${needs} of needs`,
  needsShare: (share, within) => (
    <>Your needs: <strong>{share}</strong> of your income, {within ? 'within the 50% benchmark' : 'above the 50% benchmark'}.</>
  ),
  labels: { needs: 'Needs', wants: 'Wants', savings: 'Savings', margin: 'Free margin' },
  comparison: {
    rule: '50/30/20 benchmark',
    yours: 'Your budget',
    caption: 'Your monthly budget compared with the 50/30/20 rule',
    item: 'Category',
    benchmark: 'Benchmark',
  },
  deficitHelp: {
    title: 'Not a dead end: ways to rebalance',
    intro: 'First check your amounts (a yearly expense counted without dividing it by 12?), then:',
    items: [
      <>Check the benefits you may be entitled to (<a href="https://www.usa.gov/benefits" target="_blank" rel="noopener" className={link}>US</a>, <a href="https://www.gov.uk/check-benefits-financial-support" target="_blank" rel="noopener" className={link}>UK</a>)</>,
      <>Talk to a free, non-profit money adviser, such as the <a href="https://www.nfcc.org/" target="_blank" rel="noopener" className={link}>NFCC</a> (US) or <a href="https://www.moneyhelper.org.uk/" target="_blank" rel="noopener" className={link}>MoneyHelper</a> (UK)</>,
    ],
  },
  tiles: { wantsPerDay: 'Wants per day', ofIncome: (share) => `${share} of income`, perDayNote: 'over 30 days' },
  within: (margin) => (
    <>
      Your needs stay under 50%: the rule applies as is, 30% for wants and 20% for savings.
      {margin && <> The extra {margin} is <strong>free margin</strong>: more savings, a goal or a few more wants, it’s your call.</>}
    </>
  ),
  trimmed: (maxNeedsShare) => (
    <>
      Your needs are above 50%: that happens fast when rent is high, and it’s not a mistake. Wants shrink first and
      savings stay at 20%, as long as wants keep at least as much as savings (up to {maxNeedsShare} for needs).
    </>
  ),
  shared: (needsShare, savings) => (
    <>
      With {needsShare} going to needs, keeping 20% for savings would leave less for wants than for savings. So what’s
      left is split into two equal halves: your <strong>possible savings</strong> are {savings} a month. If that’s still
      too much, a smaller regular amount already counts.
    </>
  ),
  howSplit: 'How this split is calculated',
  ruleAnchor: 'rule',
  current: (saved, share) => <>You already set aside <strong>{saved}</strong> a month ({share} of your income).</>,
  currentOver: 'That’s more than what’s left after your needs: check your amounts.',
  currentGap: (gap) => `To reach the suggestion: ${gap} more a month, at your own pace.`,
  currentReached: 'That’s at least the suggestion: well done.',
  signup: {
    title: 'Track this budget every month, on your own or together',
    text: 'Budget Famille fills in each month from your bills (monthly, some months or once a year), with savings pots that have a target and a date. Invite your partner or roommates later. Free, no bank connection. The app is in French for now.',
    cta: 'Create my free budget',
  },
  reset: 'Clear',
  share: {
    button: 'Share the calculator',
    copied: 'Link copied',
    url: 'https://www.budgetfamille.com/en/50-30-20-budget-calculator',
    title: '50/30/20 budget calculator',
    text: 'A free calculator to make your budget with the 50/30/20 rule.',
  },
  sticky: { label: 'After your needs', details: 'See details' },
};
