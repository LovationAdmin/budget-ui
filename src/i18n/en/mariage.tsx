// src/i18n/en/mariage.tsx
// Words of the wedding budget calculator in English
// (/en/wedding-budget-calculator). Same fictitious example as the French page
// (src/lib/tools/mariage.ts), labelled as such, in the visitor's currency.

import type { MariageCopy } from '@/components/tools/MariageCalculator';

const months = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });

export const MARIAGE_EN: MariageCopy = {
  posts: {
    lieu: { label: 'Venue', hint: 'Hire of the venue or estate, furniture included if billed separately' },
    traiteur: { label: 'Catering', hint: 'Meal and service, price per guest' },
    boissons: { label: 'Drinks and bar', hint: 'Cocktail hour, wine, soft drinks, price per guest' },
    tenues: { label: 'Attire and beauty', hint: 'Dress, suit, accessories, hair, makeup' },
    photo: { label: 'Photo and video' },
    musique: { label: 'Music / DJ', hint: 'DJ, band, sound system' },
    deco: { label: 'Flowers and decor', hint: 'Bouquet, centerpieces, decor rental' },
    alliances: { label: 'Wedding rings' },
    papeterie: { label: 'Invitations and stationery', hint: 'Save the dates, invitations, menus, seating chart' },
    voyage: { label: 'Honeymoon', hint: 'Optional' },
    autres: { label: 'Contingency and extras', hint: 'A margin for what gets forgotten: alterations, transport, last-minute purchases' },
  },
  guests: (n) => `${n} guest${n > 1 ? 's' : ''}`,
  monthLabel: (ym) => months.format(new Date(ym.year, ym.month - 1, 1)),
  calculatorLabel: 'Calculator',
  weddingTitle: 'Your wedding',
  guestsLabel: 'Number of guests',
  guestsHint: 'Adults and children at the meal',
  guestsLess: 'Remove a guest',
  guestsMore: 'Add a guest',
  minus10: 'Remove 10 guests',
  plus10: 'Add 10 guests',
  dateLabel: 'Wedding date',
  dateHint: 'Month and year, to work out what to save each month',
  datePlaceholder: 'yyyy-mm',
  savedLabel: 'Already saved',
  savedHint: 'What you have already put aside for the wedding, deposits already paid included',
  postsTitle: 'Wedding costs',
  postsIntro: 'Enter your quotes: the total for each item, except catering and drinks, as a price per guest. There’s no official average price: the total depends mostly on the number of guests and the caterer.',
  exampleNote: 'Fictitious example, replace it with your quotes',
  exampleExplain: 'These round amounts are only there to show the calculation: they are neither averages nor market prices.',
  exampleBadge: 'fictitious example',
  confirmReplace: 'Replace your amounts with the fictitious example?',
  morePosts: 'More: wedding rings, invitations, honeymoon',
  perGuestUnit: '/guest',
  perGuestHint: (rate, guests, total) => `${rate} × ${guests} = ${total}`,
  resultTitle: 'Total wedding budget',
  emptyResult: 'Enter the number of guests and your quotes: the total shows up here as you type.',
  forGuests: (guests, honeymoon) => `for ${guests}${honeymoon ? ', honeymoon included' : ''}`,
  tiles: {
    perGuest: 'Per guest',
    perGuestNote: (honeymoon) => (honeymoon ? 'excluding honeymoon' : 'all included'),
    guestLinked: 'Tied to guests',
    guestLinkedNote: (share) => `catering + drinks${share !== null ? ` · ${share}` : ''}`,
  },
  fixedPart: (amount, share) => (
    <>Fixed part: <strong className="text-foreground">{amount}</strong>{share !== null ? ` (${share})` : ''}, which doesn’t change with the number of guests.</>
  ),
  savingTitle: 'To set aside each month',
  perMonth: '/month',
  plan: ({ months: n, from, to, remaining, total, saved }) => `${n === 1
    ? `A single deposit, in ${from}`
    : `From ${from} to ${to}, ${n} deposits`}, to gather ${remaining}${saved ? ` (${total} − ${saved} already saved)` : ''}.`,
  covered: 'What you’ve already saved covers this budget: nothing to add each month.',
  thisMonth: (remaining) => (remaining
    ? `The wedding is this month: there are no months left to save, and ${remaining} still to find.`
    : 'The wedding is this month, and what you’ve saved covers this budget.'),
  past: 'This date has passed: enter the month of the upcoming wedding.',
  noDateAction: 'Enter the wedding date',
  noDateRest: 'to see how much to set aside each month.',
  fillExampleShort: 'Fill in a fictitious example',
  breakdownTitle: 'Breakdown by item',
  perGuestRate: (rate) => ` · ${rate} per guest`,
  fewerTitle: (n) => `And with ${n} fewer guest${n > 1 ? 's' : ''}?`,
  fewerText: ({ saving, total, before, guests }) => (
    <>
      Catering and drinks drop by <strong>{saving}</strong>: {total} instead of {before} for {guests}. That’s a minimum:
      a smaller venue, fewer tables and fewer invitations can bring other items down too.
    </>
  ),
  fewerNoRate: 'Enter the per-guest price of catering and drinks to see what a shorter guest list changes.',
  signup: {
    title: 'Plan your wedding in a savings pot',
    text: (year) => `In Budget Famille, create a separate “Wedding ${year}” budget or a savings pot with a target and a date: the amount to set aside each month is worked out for you, and you can invite your partner. Free, no need to connect your bank. The app is in French for now.`,
    cta: 'Create my free budget',
  },
  reset: 'Clear',
  share: {
    button: 'Share the calculator',
    copied: 'Link copied',
    url: 'https://www.budgetfamille.com/en/wedding-budget-calculator',
    title: 'Wedding budget calculator',
    text: 'A free calculator to estimate the cost of your wedding and what to set aside each month.',
  },
  sticky: { label: (example) => `Total budget${example ? ' (fictitious example)' : ''}`, details: 'See details' },
};
