// src/seo/faq-rent-split-en.ts
// FAQ of the English rent split calculator (/en/rent-split-calculator) — shown
// on the page and published as FAQPage structured data. Plain text, no
// currency (the visitor picks one), no country's tenancy law as a rule.

import type { FaqItem } from './faq';

export const RENT_SPLIT_FAQ_EN: FaqItem[] = [
  {
    q: 'How should roommates split rent?',
    a: 'Three methods are common: equal shares; by bedroom size (part of the rent split equally for the shared spaces, the rest by the size of each bedroom); or by income. What matters most is choosing together, before moving in, and writing it down.',
  },
  {
    q: 'How do you split rent by room size?',
    a: 'Split part of the rent equally, since everyone uses the kitchen, living room and bathroom, then the rest in proportion to each bedroom’s size. With a rent of 2,700 and half of it shared equally between three roommates, each pays 450 for the shared spaces, and the other 1,350 follows bedroom sizes. Square feet or square meters, only the proportions count.',
  },
  {
    q: 'Should rent be split by income?',
    a: 'It can be fair when incomes are far apart: each roommate pays the same share of their take-home pay. It is less common among friends than among couples. Whatever you choose, agree on it before moving in and write it down.',
  },
  {
    q: 'How do roommates split utilities and groceries?',
    a: 'Energy, internet, shared insurance and household supplies are usually split equally. The simplest is a shared pot: everyone pays their share in at the start of the month, and shared bills are paid from it, while personal spending stays separate.',
  },
  {
    q: 'What happens if a roommate doesn’t pay their share?',
    a: 'It depends on your lease and on local law. On a joint lease, all tenants are often jointly responsible for the whole rent, so the landlord may ask the others for the missing part. With individual leases, each person usually owes only their own rent. Check your lease, and agree in writing on what happens when someone leaves.',
  },
  {
    q: 'Are my numbers saved?',
    a: 'No. The calculation runs in your browser: nothing is sent to or stored on our servers. Your amounts stay only on this device for your next visit, and the Clear button deletes them.',
  },
];
