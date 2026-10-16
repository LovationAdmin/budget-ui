// src/data/blog-pairs.ts
// Articles that exist in both languages: French slug → English slug. Kept
// apart from the articles themselves (their text is heavy and loads with the
// blog only) so that src/i18n/locales.ts can pair the URLs everywhere. The
// test suite checks it against `translationOf` in blog-articles-en.tsx.

export const BLOG_PAIRS: ReadonlyArray<{ fr: string; en: string }> = [
  { fr: '5-etapes-gerer-budget-familial-2025', en: 'how-to-make-a-family-budget' },
  { fr: 'compte-commun-couple-argent-de-poche', en: 'joint-account-couples-spending-money' },
  { fr: 'combien-epargner-par-mois-objectif-date', en: 'how-much-to-save-each-month-for-a-goal' },
  { fr: 'budget-famille-4-personnes-exemple', en: 'family-of-four-budget-example' },
  { fr: 'budget-couple-regles-gerer-argent', en: 'budgeting-as-a-couple-rules' },
];
