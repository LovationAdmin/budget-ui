// src/seo/faq-leftover-income-en.ts
// FAQ of the English leftover income calculator (/en/leftover-income-calculator):
// shown on the page and published as FAQPage structured data. Plain text only;
// amounts carry no currency, the visitor picks one on the page.

import type { FaqItem } from './faq';

export const LEFTOVER_INCOME_FAQ_EN: FaqItem[] = [
  {
    q: 'How do I calculate my leftover income?',
    a: 'Add up your household’s take-home income for the month (pay after tax and deductions, benefits, other income), then subtract your fixed bills: rent or mortgage, other loan payments, energy, insurance, phone and internet, transport, childcare and any taxes not taken from your pay. What’s left is your leftover income: the money for groceries, clothes, fun and savings.',
  },
  {
    q: 'Is leftover income the same as disposable income?',
    a: 'Not quite. Disposable income usually means income after tax. Leftover income goes one step further and also takes out your fixed bills, so it shows what you can actually spend or save each month. It’s close to what is sometimes called discretionary or residual income.',
  },
  {
    q: 'Are groceries a fixed bill?',
    a: 'No. Groceries, clothes and fun are exactly what your leftover income has to pay for. Count as fixed bills the costs that come back every month and that you can’t easily change from one month to the next.',
  },
  {
    q: 'How much leftover income per person is enough?',
    a: 'There’s no universal number: it depends on where you live and on your household. Divide your leftover income by the number of people to compare with your actual grocery and day-to-day spending. To compare households of different sizes, statisticians use the OECD-modified scale: 1 for the first adult, 0.5 for each other person aged 14 or over and 0.3 for each child under 14.',
  },
  {
    q: 'What share of income should go to housing?',
    a: 'A common benchmark is no more than about 30% of income. In the United States, households that spend more than 30% of their income on housing are considered cost-burdened in official statistics (U.S. Census Bureau). Lenders have their own rules for loans.',
  },
  {
    q: 'Are my numbers saved?',
    a: 'No. The calculation runs in your browser: nothing is sent to or stored on our servers. Your amounts stay only on this device for your next visit, and the “Clear” button deletes them.',
  },
];
