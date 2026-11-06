// src/dev/break-ui/monthFixtures.ts
// ============================================================================
// Data for the dev-only Month tab harness (/dev/break-ui, see MonthBreakUi):
// the kind demo household, and the realistic worst cases it was not designed
// against. Shaped exactly like a stored budget (BudgetModel); never shipped.
// ============================================================================

import type { BudgetModel } from '@/lib/budget/types';

export const FIXTURE_TODAY = '2026-11';

export type FixtureName = 'demo' | 'worst' | 'empty' | 'one';

export interface MonthFixture {
  model: BudgetModel;
  currency: string;
  location: string;
}

const base = { chargeMappings: [], extras: {}, yearExtras: {} };

/** Camille and Mehdi, the household of the screenshots: names that fit, round amounts. */
const demo: MonthFixture = {
  currency: 'EUR',
  location: 'FR',
  model: {
    ...base,
    budgetTitle: 'Foyer Camille et Mehdi',
    people: [
      { id: 'p1', name: 'Camille', salary: 2800, contributions: [{ from: '2026-01', mode: 'fixed', value: 1700 }] },
      { id: 'p2', name: 'Mehdi', salary: 2100, contributions: [{ from: '2026-01', mode: 'fixed', value: 1150 }] },
    ],
    charges: [
      { id: 'c1', label: 'Loyer', amount: 1200, category: 'HOUSING' },
      { id: 'c2', label: 'Courses', amount: 600, category: 'FOOD' },
      { id: 'c3', label: 'Électricité', amount: 95, category: 'ENERGY' },
      { id: 'c4', label: 'Navigo', amount: 86.4, category: 'TRANSPORT' },
      { id: 'c5', label: 'Internet', amount: 30, category: 'INTERNET' },
    ],
    projects: [
      { id: 's1', label: 'Vacances été 2027', targetAmount: 3000, monthlyAmount: 250, startDate: '2026-09-01', endDate: '2027-06-30' },
    ],
    months: {},
  },
};

/**
 * A six-person shared household in Switzerland, as real data looks: long and
 * one-letter names, an emoji first name, diacritics, a member with no income,
 * bank-import labels without spaces, a five-figure one-off, a charge carrying
 * every badge at once, an 80-character savings label (the form's limit), a
 * month in deficit, a long note.
 */
const worst: MonthFixture = {
  currency: 'CHF',
  location: 'CH',
  model: {
    ...base,
    budgetTitle: 'Coloc Wiśniewska-Kowalczyk, Fitzgerald-Montgomery, Nguyễn et compagnie',
    people: [
      { id: 'w1', name: 'Aleksandra Wiśniewska-Kowalczyk', salary: 12450.75 },
      { id: 'w2', name: 'Jo', salary: 0 },
      { id: 'w3', name: 'Bartholomew Fitzgerald-Montgomery III', salary: 1850, contributions: [{ from: '2026-01', mode: 'percent', value: 33.333 }] },
      { id: 'w4', name: '🌻 Maëlle', salary: 2300, contributions: [{ from: '2026-01', mode: 'fixed', value: 2300 }], salaryOverrides: { '2026-11': 2412.5 } },
      { id: 'w5', name: 'Nguyễn Thị Phương Thảo', salary: 3100 },
      { id: 'w6', name: 'Ö', salary: 980.4, contributions: [{ from: '2026-01', mode: 'fixed', value: 450 }] },
    ],
    charges: [
      { id: 'k1', label: 'Prêt immobilier Crédit Agricole (résidence principale, 25 ans)', amount: 1987.43, category: 'LOAN' },
      { id: 'k2', label: 'PRLVSEPAFREEMOBILEFORFAIT5GILLIMITE', amount: 19.99, category: 'MOBILE' },
      { id: 'k3', label: 'Cantine scolaire et garderie périscolaire (Léa et Noah)', amount: 238.6, frequency: 'custom', months: [1, 2, 3, 4, 5, 6, 9, 10, 11, 12], startDate: '2026-09-01', category: 'CHILDREN', overrides: { '2026-11': 251.2 } },
      { id: 'k4', label: 'Taxe foncière', amount: 1450, frequency: 'yearly', startDate: '2025-11-01', category: 'TAXES' },
      { id: 'k5', label: 'Assurance auto (Peugeot 3008 + Clio de Jo, tous risques)', amount: 142.3, category: 'INSURANCE_AUTO', amountHistory: [{ from: '2026-01', amount: 129.8 }, { from: '2026-11', amount: 142.3 }] },
      { id: 'k6', label: 'Travaux toiture et isolation des combles (devis artisan, acompte 30 %)', amount: 18750, frequency: 'once', startDate: '2026-11-01', category: 'HOUSING' },
      { id: 'k7', label: 'Abonnement salle de sport', amount: 39.9, startDate: '2026-11-01', endDate: '2026-11-30', category: 'LEISURE_SPORT', overrides: { '2026-11': 19.95 } },
      { id: 'k8', label: 'Mutuelle santé famille (Harmonie Mutuelle, formule Confort+ avec option orthodontie)', amount: 187.65, category: 'INSURANCE_HEALTH', overrides: { '2026-11': 0 } },
      { id: 'k9', label: 'Courses', amount: 1240, category: 'FOOD' },
      { id: 'k10', label: 'Électricité', amount: 164.2, category: 'ENERGY' },
      { id: 'k11', label: 'Eau', amount: 48.75, category: 'HOUSING' },
      { id: 'k12', label: 'Crèche', amount: 1180, category: 'CHILDREN' },
      { id: 'k13', label: 'Essence', amount: 260, category: 'TRANSPORT' },
      { id: 'k14', label: 'Netflix', amount: 19.99, category: 'LEISURE_STREAMING' },
      { id: 'k15', label: 'Frais bancaires', amount: 7.5, category: 'BANK' },
      { id: 'pc1', label: 'Impôt sur le revenu (prélèvement à la source, rattrapage 2025)', amount: 312.4, ownerId: 'w1', category: 'TAXES' },
    ],
    projects: [
      { id: 's1', label: 'Apport pour la maison de Bordeaux en 2028, avec le prêt à taux zéro et la prime', targetAmount: 60000, monthlyAmount: 1500, startDate: '2025-01-01' },
      { id: 's2', label: 'Noël', targetAmount: 800, startDate: '2026-10-01' },
    ],
    months: {
      '2026-11': {
        allocations: { s2: 120 },
        expenses: { s2: 640 },
        expenseComments: { s2: 'Cadeaux des enfants, repas du réveillon chez les grands-parents à Lyon et billets de train' },
        oneOffs: [{ id: 'o1', label: 'Remboursement mutuelle (orthodontie de Léa, 2e semestre)', amount: 1234.56 }],
        comment:
          'Novembre chargé : acompte de la toiture versé le 12, la taxe foncière tombe le 15. On rattrape en décembre avec la prime de fin d’année d’Aleksandra.',
      },
    },
  },
};

/** Nothing yet: the first visit after creating a budget. */
const empty: MonthFixture = {
  currency: 'EUR',
  location: 'FR',
  model: { ...base, budgetTitle: 'Mon budget', people: [], charges: [], projects: [], months: {} },
};

/** Exactly one of everything: every count at 1 (plurals). */
const one: MonthFixture = {
  currency: 'EUR',
  location: 'FR',
  model: {
    ...base,
    budgetTitle: 'Budget de Lou',
    people: [{ id: 'l1', name: 'Lou', salary: 1650 }],
    charges: [{ id: 'l2', label: 'Loyer', amount: 650, category: 'HOUSING' }],
    projects: [{ id: 'l3', label: 'Épargne de précaution', monthlyAmount: 100, startDate: '2026-01-01' }],
    months: {},
  },
};

export const MONTH_FIXTURES: Record<FixtureName, MonthFixture> = { demo, worst, empty, one };
