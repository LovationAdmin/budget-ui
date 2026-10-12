// src/seo/faq-wedding-en.ts
// FAQ of the English wedding budget calculator (/en/wedding-budget-calculator)
// — shown on the page and published as FAQPage structured data. No averages
// or market prices, and no currency: the visitor picks one on the page.

import type { FaqItem } from './faq';

export const WEDDING_FAQ_EN: FaqItem[] = [
  {
    q: 'How do I calculate my wedding budget?',
    a: 'List the items (venue, catering, drinks, attire, photo and video, music, flowers and decor, rings, invitations, honeymoon), get quotes, then separate what is paid per guest (the meal and drinks) from what is fixed. Budget = (catering and drinks price per guest) × number of guests + fixed costs + a contingency line. The calculator on this page does the math for you.',
  },
  {
    q: 'How much does a wedding for 100 guests cost?',
    a: 'There is no reference amount: the total depends mostly on the number of guests and the caterer’s price per guest, then on the venue, the region and the season. With 100 guests, every extra 1 per guest on the meal or drinks adds 100 to the total. Start from your own quotes: multiply the price per guest by 100, add the fixed costs and a margin for the unexpected.',
  },
  {
    q: 'How much should we save each month for our wedding?',
    a: 'Monthly amount = (total budget − already saved) ÷ number of months before the wedding, counting the current month and stopping at the month before the wedding, so the money is ready before the big day. Round up. For example, 18,000 to gather in 18 months is 1,000 a month.',
  },
  {
    q: 'How do couples pay for a wedding?',
    a: 'Most often by combining savings put aside every month in a dedicated savings pot, and sometimes a contribution from family. Check the deposit and balance due dates in your quotes to know when the money must be available. Gifts received on the day arrive after the bills: better not to count on them to pay vendors. Before any loan, check that the repayments fit your budget after the wedding.',
  },
  {
    q: 'What wedding costs are often forgotten?',
    a: 'Drinks and the bar when the caterer doesn’t include them, tableware or furniture rental, extra service hours, taxes and service charges, tips where customary, stationery, outfit alterations, hair and makeup trials, transport and accommodation, and last-minute purchases. Hence a contingency line.',
  },
  {
    q: 'Are my numbers saved?',
    a: 'No. The calculation runs in your browser: nothing is sent to or stored on our servers. Your amounts stay only on this device for your next visit, and the Clear button deletes them.',
  },
];
