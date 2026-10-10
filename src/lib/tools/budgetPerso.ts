// src/lib/tools/budgetPerso.ts
// ============================================================================
// « Budget personnel » (/budget-personnel): net income and essential expenses
// in, the 50/30/20 benchmark out (50 % needs, 30 % wants, 20 % savings, as
// popularised by Elizabeth Warren and Amelia Warren Tyagi, « All Your Worth »,
// 2005), with an honest split of what remains when real needs exceed 50 %:
// - needs ≤ 50 %: the rule as is (30 % wants, 20 % savings) plus a free
//   margin (what remains beyond those 50 %);
// - needs > 50 %: wants shrink first and savings stay at 20 % of income as
//   long as that is no more than half of what remains (needs ≤ 60 %);
//   beyond, what remains is split half wants, half savings;
// - needs > income: no split, the page shows help instead.
// Pure functions: the page and the tests share them.
// ============================================================================

export interface MoneyField<K extends string> {
  key: K;
  label: string;
  hint?: string;
}

export type IncomeKey = 'salaire' | 'autres';
export type NeedKey =
  | 'logement' | 'energie' | 'telecom' | 'transport' | 'assurances' | 'credits' | 'courses'
  | 'sante' | 'enfants' | 'impots' | 'autres';

export const INCOME_FIELDS: MoneyField<IncomeKey>[] = [
  { key: 'salaire', label: 'Salaire net', hint: 'Le net versé sur votre compte, après l’impôt prélevé à la source' },
  { key: 'autres', label: 'Autres revenus', hint: 'Aides (CAF, prime d’activité…), pension, job, loyers perçus…' },
];

/** `main` fields are always shown; the others sit behind « Autres ». */
export const NEED_FIELDS: Array<MoneyField<NeedKey> & { main?: boolean }> = [
  { key: 'logement', label: 'Logement', hint: 'Loyer ou mensualité de crédit, charges comprises', main: true },
  { key: 'energie', label: 'Énergie et eau', hint: 'Électricité, gaz, chauffage, eau', main: true },
  { key: 'telecom', label: 'Internet et mobile', main: true },
  { key: 'transport', label: 'Transport', hint: 'Abonnement, carburant des trajets réguliers', main: true },
  { key: 'assurances', label: 'Assurances et mutuelle', hint: 'Habitation, auto, santé', main: true },
  { key: 'credits', label: 'Crédits (hors immobilier)', hint: 'Auto, consommation, renouvelable', main: true },
  { key: 'courses', label: 'Courses alimentaires', hint: 'Alimentation et produits du quotidien', main: true },
  { key: 'sante', label: 'Santé non remboursée' },
  { key: 'enfants', label: 'Garde et enfants', hint: 'Garde, cantine, scolarité' },
  { key: 'impots', label: 'Impôts non prélevés', hint: 'Taxe foncière ÷ 12, solde d’impôt…' },
  { key: 'autres', label: 'Autres dépenses essentielles' },
];

/** The 50/30/20 benchmark, as shares of net income. */
export const RULE = { besoins: 0.5, envies: 0.3, epargne: 0.2 } as const;

/** When needs exceed 50 %, savings never take more than this share of what remains. */
export const SAVINGS_MAX_SHARE_OF_REMAINDER = 0.5;

/** Needs share up to which savings stay at 20 % of income: 1 − 0.2 / 0.5 = 60 %. */
export const FULL_SAVINGS_MAX_NEEDS_SHARE = 1 - RULE.epargne / SAVINGS_MAX_SHARE_OF_REMAINDER;

export const DAYS_PER_MONTH = 30;

const cents = (n: number) => Math.round(n * 100) / 100;
const positive = (n: number | undefined) => (Number.isFinite(n) && (n as number) > 0 ? (n as number) : 0);

export interface Split503020 {
  besoins: number;
  envies: number;
  epargne: number;
}

/** The 50/30/20 split of a net income. */
export function split503020(revenus: number): Split503020 {
  const r = positive(revenus);
  return { besoins: cents(r * RULE.besoins), envies: cents(r * RULE.envies), epargne: cents(r * RULE.epargne) };
}

/**
 * - `empty`: no income entered;
 * - `within`: needs ≤ 50 % of income, the rule applies as is;
 * - `trimmed`: needs between 50 and 60 %, wants shrink, savings stay at 20 %;
 * - `shared`: needs above 60 %, what remains is split half and half;
 * - `deficit`: needs exceed income.
 */
export type SplitStatus = 'empty' | 'within' | 'trimmed' | 'shared' | 'deficit';

export interface RemainderSplit {
  status: SplitStatus;
  /** Income − needs (negative in deficit). */
  reste: number;
  envies: number;
  epargne: number;
  /** What remains beyond the 30 % + 20 % when needs stay under 50 % (0 otherwise). */
  marge: number;
}

/** Suggested split of what remains after the needs (see the rule in the header). */
export function splitRemainder(revenus: number, besoins: number): RemainderSplit {
  const rev = positive(revenus);
  const need = positive(besoins);
  const reste = cents(rev - need);
  if (rev <= 0) return { status: 'empty', reste, envies: 0, epargne: 0, marge: 0 };
  if (reste < 0) return { status: 'deficit', reste, envies: 0, epargne: 0, marge: 0 };
  const rule = split503020(rev);
  if (need <= rule.besoins) {
    return { status: 'within', reste, envies: rule.envies, epargne: rule.epargne, marge: cents(reste - rule.envies - rule.epargne) };
  }
  const half = cents(reste * SAVINGS_MAX_SHARE_OF_REMAINDER);
  if (rule.epargne <= half) {
    return { status: 'trimmed', reste, envies: cents(reste - rule.epargne), epargne: rule.epargne, marge: 0 };
  }
  return { status: 'shared', reste, envies: cents(reste - half), epargne: half, marge: 0 };
}

export interface BudgetPerso extends RemainderSplit {
  revenus: number;
  besoins: number;
  /** Needs / income, 0–1+ (null without income). */
  besoinsShare: number | null;
  /** The 50/30/20 split of the income. */
  regle: Split503020;
  /** Suggested wants over 30 days. */
  enviesParJour: number;
  /** Suggested savings / income (null without income). */
  epargneShare: number | null;
  /** Savings the visitor already puts aside each month. */
  epargneActuelle: number;
  epargneActuelleShare: number | null;
  /** Suggested savings − current savings: > 0 still to find, ≤ 0 already reached. */
  ecartEpargne: number;
}

export function computeBudgetPerso(
  incomes: Partial<Record<IncomeKey, number>>,
  needs: Partial<Record<NeedKey, number>>,
  epargneActuelle = 0,
): BudgetPerso {
  const revenus = cents(INCOME_FIELDS.reduce((s, f) => s + positive(incomes[f.key]), 0));
  const besoins = cents(NEED_FIELDS.reduce((s, f) => s + positive(needs[f.key]), 0));
  const split = splitRemainder(revenus, besoins);
  const saved = cents(positive(epargneActuelle));
  return {
    ...split,
    revenus,
    besoins,
    besoinsShare: revenus > 0 ? besoins / revenus : null,
    regle: split503020(revenus),
    enviesParJour: cents(split.envies / DAYS_PER_MONTH),
    epargneShare: revenus > 0 ? split.epargne / revenus : null,
    epargneActuelle: saved,
    epargneActuelleShare: revenus > 0 ? saved / revenus : null,
    ecartEpargne: cents(split.epargne - saved),
  };
}

/** Fictitious example published on the page (« dans notre exemple »): a single person, 2 000 € net. */
export const EXAMPLE: { incomes: Partial<Record<IncomeKey, number>>; needs: Partial<Record<NeedKey, number>> } = {
  incomes: { salaire: 2000 },
  needs: { logement: 680, energie: 60, telecom: 35, transport: 50, assurances: 45, courses: 250 },
};

/** Same person with a higher rent, to show the half-and-half split. */
export const EXAMPLE_HIGH_RENT = { ...EXAMPLE, needs: { ...EXAMPLE.needs, logement: 820 } };
