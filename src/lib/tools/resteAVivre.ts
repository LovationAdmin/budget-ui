// src/lib/tools/resteAVivre.ts
// ============================================================================
// « Calcul du reste à vivre » (/calcul-reste-a-vivre): what a household keeps
// each month once its fixed charges are paid, per person, per day and per
// consumption unit, with the two official benchmarks people look for:
// - the HCSF cap on the borrowing ratio (35 %, insurance included, for a new
//   mortgage — décision D-HCSF-2021-7);
// - the legal floor in a over-indebtedness procedure: the household keeps at
//   least the RSA flat-rate amount for its size (Code de la consommation,
//   art. L731-2), for its current expenses, housing included.
// Pure functions: the page and the tests share them.
// ============================================================================

export interface Household {
  adults: number;
  /** Children under 14 (0.3 consumption unit each, INSEE). */
  kidsUnder14: number;
  /** Other people aged 14 or more besides the adults (0.5 unit each). */
  teens14plus: number;
}

export interface MoneyField<K extends string> {
  key: K;
  label: string;
  hint?: string;
}

export type IncomeKey = 'salaires' | 'aides' | 'autres';
export type ChargeKey =
  | 'loyer' | 'creditImmo' | 'credits' | 'energie' | 'assurances' | 'telecom'
  | 'transport' | 'enfants' | 'impots' | 'pension' | 'autres';

export const INCOME_FIELDS: MoneyField<IncomeKey>[] = [
  { key: 'salaires', label: 'Salaires et revenus d’activité', hint: 'Le net versé sur le compte, après l’impôt prélevé à la source' },
  { key: 'aides', label: 'Allocations et aides', hint: 'CAF, aide au logement, prime d’activité…' },
  { key: 'autres', label: 'Autres revenus', hint: 'Retraite, pension reçue, loyers perçus…' },
];

/** `main` fields are always shown; the others sit behind « Autres charges ». */
export const CHARGE_FIELDS: Array<MoneyField<ChargeKey> & { main?: boolean; credit?: boolean }> = [
  { key: 'loyer', label: 'Loyer', hint: 'Charges locatives comprises', main: true },
  { key: 'creditImmo', label: 'Crédit immobilier', hint: 'Mensualité, assurance emprunteur comprise', main: true, credit: true },
  { key: 'credits', label: 'Autres crédits', hint: 'Auto, consommation, renouvelable', main: true, credit: true },
  { key: 'energie', label: 'Énergie et eau', hint: 'Électricité, gaz, chauffage, eau', main: true },
  { key: 'assurances', label: 'Assurances et mutuelle', hint: 'Habitation, auto, santé', main: true },
  { key: 'telecom', label: 'Internet, mobile et abonnements', main: true },
  { key: 'transport', label: 'Transport', hint: 'Abonnement, carburant des trajets réguliers' },
  { key: 'enfants', label: 'Garde, cantine et scolarité' },
  { key: 'impots', label: 'Impôts et taxes', hint: 'Ceux qui ne sont pas prélevés sur le salaire (taxe foncière ÷ 12…)' },
  { key: 'pension', label: 'Pension alimentaire versée' },
  { key: 'autres', label: 'Autres charges fixes' },
];

/** HCSF cap on the borrowing ratio for a new mortgage. */
export const HCSF_MAX_RATIO = 0.35;

/** RSA flat-rate amounts on 1 April 2026 (service-public.gouv.fr, Banque de France). */
export const RSA_DATE = '1er avril 2026';
const RSA_BY_SIZE = [651.69, 977.54, 1173.05, 1368.55];
const RSA_EXTRA_PERSON = 260.68;

export const persons = (h: Household): number => Math.max(1, h.adults) + h.kidsUnder14 + h.teens14plus;

/** INSEE (modified OECD scale): 1 for the first adult, 0.5 per other person aged 14+, 0.3 per child under 14. */
export function consumptionUnits(h: Household): number {
  const adults = Math.max(1, h.adults);
  return Math.round((1 + 0.5 * (adults - 1 + h.teens14plus) + 0.3 * h.kidsUnder14) * 100) / 100;
}

/** RSA flat-rate amount for a household of `n` people: the over-indebtedness floor. */
export function rsaFloor(n: number): number {
  const size = Math.max(1, Math.floor(n));
  if (size <= RSA_BY_SIZE.length) return RSA_BY_SIZE[size - 1];
  return Math.round((RSA_BY_SIZE[RSA_BY_SIZE.length - 1] + (size - RSA_BY_SIZE.length) * RSA_EXTRA_PERSON) * 100) / 100;
}

const cents = (n: number) => Math.round(n * 100) / 100;
const positive = (n: number | undefined) => (Number.isFinite(n) && (n as number) > 0 ? (n as number) : 0);

export interface ResteAVivre {
  revenus: number;
  charges: number;
  credits: number;
  reste: number;
  persons: number;
  units: number;
  parPersonne: number;
  /** Over 30 days. */
  parJour: number;
  parUnite: number;
  /** Fixed charges / income, 0–1+ (null without income). */
  chargesShare: number | null;
  /** Loan repayments / income (null without income or loans). */
  debtRatio: number | null;
  floor: number;
}

export function computeResteAVivre(
  household: Household,
  incomes: Partial<Record<IncomeKey, number>>,
  charges: Partial<Record<ChargeKey, number>>,
): ResteAVivre {
  const revenus = cents(INCOME_FIELDS.reduce((s, f) => s + positive(incomes[f.key]), 0));
  const total = cents(CHARGE_FIELDS.reduce((s, f) => s + positive(charges[f.key]), 0));
  const credits = cents(CHARGE_FIELDS.filter((f) => f.credit).reduce((s, f) => s + positive(charges[f.key]), 0));
  const reste = cents(revenus - total);
  const n = persons(household);
  const units = consumptionUnits(household);
  return {
    revenus,
    charges: total,
    credits,
    reste,
    persons: n,
    units,
    parPersonne: cents(reste / n),
    parJour: cents(reste / 30),
    parUnite: cents(reste / units),
    chargesShare: revenus > 0 ? total / revenus : null,
    debtRatio: revenus > 0 && credits > 0 ? credits / revenus : null,
    floor: rsaFloor(n),
  };
}
