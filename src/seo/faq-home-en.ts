// src/seo/faq-home-en.ts
// English home page FAQ (/en) — shown on the page and published as FAQPage
// structured data by the prerender, so both always say the same thing.

import type { FaqItem } from './faq';

export const HOME_FAQ_EN: FaqItem[] = [
  {
    q: 'Is Budget Famille really free?',
    a: 'Yes. Budgets, members, bills, savings and goals, the AI budget and sharing with others are free, with no credit card. Automatic bank sync is coming soon with the Premium plan: until then, everything works without connecting a bank.',
  },
  {
    q: 'Is Budget Famille only for families?',
    a: 'No. “Famille” (family) in the broad sense: use it on your own for a personal budget, as a couple with a joint pot, as a family, with roommates or friends, and to plan a goal (a trip, a wedding, renovations, a car, a down payment) with a target and a date. Create as many budgets as you need, each with its own members.',
  },
  {
    q: 'Do I need to connect my bank account?',
    a: 'No. Budget Famille works without connecting to your bank: you enter your income and bills once, and every month fills in by itself from those rules.',
  },
  {
    q: 'How do couples manage a budget with a joint account?',
    a: 'Each person enters their income, the “split the joint pot” assistant works out what each one pays in (50/50, in proportion to income, or the same spending money for both), and the app shows the spending money each person has left.',
  },
  {
    q: 'Can my partner see my personal expenses?',
    a: 'You choose. A personal expense can be public or private: when private, its name is encrypted on our servers and visible to you only; only its amount counts in the household budget.',
  },
  {
    q: 'Is there free budgeting software for families?',
    a: 'Yes. Budget Famille is free budgeting software, for a family as well as a personal or shared-home budget. It runs in the browser, on a computer or a phone, with nothing to install, and you can also add it to your home screen like an app.',
  },
  {
    q: 'Is it better than a spreadsheet?',
    a: 'A spreadsheet means copying everything over every month. Budget Famille starts from rules (rent every month, property tax once a year, school meals some months), is shared in real time with others and works on your phone.',
  },
  {
    q: 'Is my data safe?',
    a: 'Your data is hosted in Europe, encrypted, and never sold or used for advertising. You can export it or delete your account at any time.',
  },
  {
    q: 'Is the app available in English?',
    a: 'Yes. The site and the app are available in English and in French: switch language at any time from the globe button in the menu bar.',
  },
];
