// src/i18n/en/colocation.tsx
// Words of the rent and bills split in English (/en/rent-split-calculator).
// Localized rather than translated: renters insurance, roommate agreement
// rather than French tenancy law, bedroom sizes in the visitor's usual unit.

import type { ColocCopy } from '@/components/tools/ColocationCalculator';
import type { ColocInput } from '@/lib/tools/colocation';

/**
 * Fictitious example: three roommates, bedrooms of 10, 13 and 17 m² (100, 130
 * and 170 sq ft: the same proportions, so the same split in either unit).
 */
export function colocExampleEn(areaUnit: 'sq ft' | 'm²'): ColocInput {
  const k = areaUnit === 'sq ft' ? 10 : 1;
  return {
    rent: 2700,
    bills: [150, 60, 30, 90],
    method: 'chambre',
    roommates: [
      { name: 'Roommate 1', room: 10 * k, income: 3200 },
      { name: 'Roommate 2', room: 13 * k, income: 4000 },
      { name: 'Roommate 3', room: 17 * k, income: 5200 },
    ],
  };
}

export const COLOCATION_EN: ColocCopy = {
  calculatorLabel: 'Calculator',
  householdTitle: 'Your shared home',
  seeExample: 'See the example',
  roommates: 'Roommates',
  roommatesLess: 'Remove a roommate',
  roommatesMore: 'Add a roommate',
  mateName: (i) => `Roommate ${i + 1}`,
  nameLabel: 'First name or nickname',
  roomLabel: 'Bedroom',
  incomeLabel: 'Take-home pay',
  billsTitle: 'Monthly rent and bills',
  rent: { label: 'Rent', hint: 'The total rent for the place, service charges included' },
  bills: {
    energie: { label: 'Energy (electricity, gas)', hint: 'The household total, per month' },
    internet: { label: 'Internet' },
    assurance: { label: 'Renters or contents insurance', hint: 'If you share one policy' },
    courses: { label: 'Shared groceries and supplies', hint: 'Cleaning products, toilet paper, oil, salt…' },
    autres: { label: 'Other shared costs', hint: 'Streaming, water if not included…' },
  },
  billsNote: 'A bill paid every two months or once a year? Bring it back to a month (÷ 2, ÷ 12). Bills are split equally.',
  methodTitle: 'How to split the rent',
  methodLegend: 'Method',
  methods: {
    egal: { label: 'Equal shares', hint: 'Similar bedrooms' },
    chambre: { label: 'By bedroom', hint: 'Different sizes' },
    revenus: { label: 'By income', hint: 'Income gaps' },
  },
  methodHelp: (method, commonShare) => ({
    egal: 'Everyone pays the same share of the rent. Simple and fair when the bedrooms are alike.',
    chambre: `${commonShare} of the rent covers the shared spaces and is split equally; the rest follows the size of each bedroom.`,
    revenus: 'Everyone pays the rent in proportion to their take-home pay. Useful when incomes are far apart.',
  })[method],
  perMonth: '/month',
  resultTitle: 'Each person’s share, per month',
  emptyResult: 'Enter the rent and bills: each person’s share shows up here as you type.',
  shareDetail: (rent, bills, ratio) => `rent ${rent} + bills ${bills} · ${ratio} of the total`,
  fallback: {
    rooms: 'Enter the size of each bedroom: until then, the rent is split equally.',
    incomes: 'Enter each roommate’s take-home pay: until then, the rent is split equally.',
  },
  tiles: { rent: 'Rent', bills: 'Bills', total: 'Household total' },
  potTip: 'Simplest: everyone pays their share into a shared account or pot at the start of the month, and the rent and bills are paid from there.',
  signup: {
    title: 'Run your shared home in a shared budget',
    text: 'Create a budget for your place and invite your roommates by email: everyone sees in real time what they put into the shared pot. Free. The app is in French for now.',
    cta: 'Create my free budget',
  },
  reset: 'Clear',
  share: {
    button: 'Share with your roommates',
    copied: 'Link copied',
    url: 'https://www.budgetfamille.com/en/rent-split-calculator',
    title: 'Rent split calculator',
    text: 'A free calculator to split the rent and bills between roommates.',
  },
  sticky: { total: (amount) => `Household total: ${amount}`, details: 'Details' },
};
