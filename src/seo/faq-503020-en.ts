// src/seo/faq-503020-en.ts
// FAQ of the English 50/30/20 calculator (/en/50-30-20-budget-calculator) —
// shown on the page and published as FAQPage structured data, so both always
// say the same thing. Plain text only; the rule matches src/lib/tools/budgetPerso.ts
// and the amounts carry no currency, the visitor picks one on the page.

import type { FaqItem } from './faq';

export const BUDGET_503020_FAQ_EN: FaqItem[] = [
  {
    q: 'What is the 50/30/20 rule?',
    a: 'A simple benchmark for splitting your after-tax income: 50% for needs (housing, bills, groceries, minimum loan payments), 30% for wants (eating out, hobbies, shopping, travel) and 20% for savings and paying down debt. It was popularized by U.S. Senator Elizabeth Warren and her daughter Amelia Warren Tyagi in their book “All Your Worth” (2005). It is a starting point, not an obligation.',
  },
  {
    q: 'How do I calculate a 50/30/20 budget?',
    a: 'Multiply your monthly take-home pay by 0.5 for needs, 0.3 for wants and 0.2 for savings. For example, on a take-home pay of 4,000 a month: 2,000 for needs, 1,200 for wants and 800 for savings. Then compare with what your essential expenses really cost: that is where the calculation becomes useful.',
  },
  {
    q: 'Is the 50/30/20 rule based on gross or net income?',
    a: 'On after-tax income, not your gross salary. The simplest is to use your take-home pay: what actually lands in your account each month, after tax and other deductions, plus any regular benefits or other income.',
  },
  {
    q: 'What if my needs are more than 50% of my income?',
    a: 'That is not a failure: with high rent, it happens quickly. The calculator first trims wants and keeps 20% for savings as long as your needs stay at or below 60% of your income; above that, it splits what is left into two equal halves for wants and savings. To loosen your budget, compare your bills, check the benefits you may be entitled to and, if needed, talk to a free, non-profit money adviser.',
  },
  {
    q: 'How much should I save each month?',
    a: 'The 50/30/20 rule suggests 20% of your take-home pay, but there is no single right amount: it depends on your bills and your goals. If 20% is not possible today, start small with an automatic transfer on payday and raise it as your income grows. A common first step is an emergency fund covering a few months of essential expenses.',
  },
  {
    q: 'Are my numbers saved?',
    a: 'No. The calculation runs in your browser: nothing is sent to or stored on our servers. Your amounts stay only on this device for your next visit, and the Clear button deletes them.',
  },
];
