// src/seo/faq-template-en.ts
// FAQ of the English free budget template page (/en/free-budget-template) —
// shown on the page and published as FAQPage structured data.

import type { FaqItem } from './faq';

export const TEMPLATE_FAQ_EN: FaqItem[] = [
  { q: 'Is the template really free?', a: 'Yes, with no sign-up and no email address. Download it, change it, share it.' },
  { q: 'Is there a printable PDF version?', a: 'Yes: the same template as a 3-page A4 PDF (monthly budget planned and actual, yearly expenses and joint pot, year tracker), to fill in with a pen. Free, no sign-up.' },
  { q: 'Does it work with Google Sheets, LibreOffice or Numbers?', a: 'Yes. It’s a standard .xlsx file: it opens in Excel, Google Sheets (File › Import), LibreOffice Calc and Numbers, formulas included.' },
  { q: 'Which currency does it use?', a: 'Any: amounts carry no currency symbol, so the template works in dollars, pounds, euros or any other currency. Type your amounts as they are.' },
  { q: 'How should a couple split expenses?', a: 'The “Joint pot” tab compares the three most common methods and shows the spending money each person keeps. Splitting in proportion to pay is the most common when incomes differ.' },
  { q: 'Why move from the template to the app?', a: 'The template means copying everything over every month and sending it back and forth. Budget Famille starts from the same rules, fills in every month by itself, is shared in real time and works on your phone, for free.' },
];
