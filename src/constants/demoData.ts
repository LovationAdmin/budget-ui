import { BridgeTransaction } from '@/components/budget/TransactionMapper';

// ============================================================================
// DEMO MODE CONFIGURATION
// ============================================================================

export const DEMO_MODE_LIMITS = {
  EXPIRE_AFTER_DAYS: 7          // Le mode démo expire après 7 jours
};

// ============================================================================
// TRANSACTIONS DE DÉMONSTRATION
// ============================================================================

export const DEMO_TRANSACTIONS: BridgeTransaction[] = [
  // NOVEMBRE 2024
  {
    id: "demo-a1b2c",
    account_id: "demo-account",
    amount: 2302.20,
    clean_description: "Acme Salaire",
    date: "2024-11-01"
  },
  {
    id: "demo-d3e4f",
    account_id: "demo-account",
    amount: -465.33,
    clean_description: "Echeance Pret C",
    date: "2024-11-05"
  },
  {
    id: "demo-g5h6i",
    account_id: "demo-account",
    amount: -75.20,
    clean_description: "Prlv Navigo Annuel Gie Comutit",
    date: "2024-11-06"
  },
  {
    id: "demo-j7k8l",
    account_id: "demo-account",
    amount: -15.35,
    clean_description: "Cb Monoprix",
    date: "2024-11-08"
  },
  {
    id: "demo-m9n0o",
    account_id: "demo-account",
    amount: -3.02,
    clean_description: "Cb Franprix",
    date: "2024-11-10"
  },
  {
    id: "demo-p1q2r",
    account_id: "demo-account",
    amount: -90.00,
    clean_description: "Retrait Dab",
    date: "2024-11-12"
  },
  {
    id: "demo-s3t4u",
    account_id: "demo-account",
    amount: -13.00,
    clean_description: "Cb Cafe Madeleine",
    date: "2024-11-15"
  },
  {
    id: "demo-v5w6x",
    account_id: "demo-account",
    amount: -17.99,
    clean_description: "Cb Netflix Com",
    date: "2024-11-18"
  },
  {
    id: "demo-y7z8a",
    account_id: "demo-account",
    amount: -25.12,
    clean_description: "Cb Uber *eats",
    date: "2024-11-20"
  },
  {
    id: "demo-b9c0d",
    account_id: "demo-account",
    amount: -69.79,
    clean_description: "Prlv Edf Clients Particuliers",
    date: "2024-11-25"
  },
  
  // DÉCEMBRE 2024
  {
    id: "demo-e1f2g",
    account_id: "demo-account",
    amount: 2302.20,
    clean_description: "Acme Salaire",
    date: "2024-12-01"
  },
  {
    id: "demo-h3i4j",
    account_id: "demo-account",
    amount: -465.33,
    clean_description: "Echeance Pret C",
    date: "2024-12-05"
  },
  {
    id: "demo-k5l6m",
    account_id: "demo-account",
    amount: -15.35,
    clean_description: "Cb Monoprix",
    date: "2024-12-07"
  },
  {
    id: "demo-n7o8p",
    account_id: "demo-account",
    amount: -3.02,
    clean_description: "Cb Franprix",
    date: "2024-12-10"
  },
  {
    id: "demo-q9r0s",
    account_id: "demo-account",
    amount: -90.00,
    clean_description: "Retrait Dab",
    date: "2024-12-12"
  },
  {
    id: "demo-t1u2v",
    account_id: "demo-account",
    amount: -13.00,
    clean_description: "Cb Cafe Madeleine",
    date: "2024-12-15"
  },
  {
    id: "demo-w3x4y",
    account_id: "demo-account",
    amount: -25.12,
    clean_description: "Cb Uber *eats",
    date: "2024-12-18"
  },
  {
    id: "demo-z5a6b",
    account_id: "demo-account",
    amount: -17.99,
    clean_description: "Cb Netflix Com",
    date: "2024-12-20"
  },
  {
    id: "demo-c7d8e",
    account_id: "demo-account",
    amount: -69.79,
    clean_description: "Prlv Edf Clients Particuliers",
    date: "2024-12-25"
  },
  {
    id: "demo-f9g0h",
    account_id: "demo-account",
    amount: -120.00,
    clean_description: "Vir Loyer Mme Dupont",
    date: "2024-12-26"
  }
];

// ============================================================================
// SOLDE BANCAIRE DE DÉMONSTRATION
// ============================================================================

export const DEMO_BANK_BALANCE = 5130;

// ============================================================================
// DONNÉES COMBINÉES POUR EXPORT
// ============================================================================

export const DEMO_BANKING_DATA = {
  transactions: DEMO_TRANSACTIONS,
  balance: DEMO_BANK_BALANCE,
  limits: DEMO_MODE_LIMITS
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Vérifie si le mode démo a expiré
 */
export function isDemoExpired(timestampMs: number): boolean {
  const daysSinceActivation = (Date.now() - timestampMs) / (1000 * 60 * 60 * 24);
  return daysSinceActivation >= DEMO_MODE_LIMITS.EXPIRE_AFTER_DAYS;
}

/**
 * Obtient les jours restants du mode démo
 */
export function getDaysRemaining(timestampMs: number): number {
  const daysSinceActivation = (Date.now() - timestampMs) / (1000 * 60 * 60 * 24);
  const remaining = DEMO_MODE_LIMITS.EXPIRE_AFTER_DAYS - daysSinceActivation;
  return Math.max(0, Math.ceil(remaining));
}

/**
 * Calcule les statistiques des transactions de démo
 */
export function getDemoStats() {
  const totalRevenue = DEMO_TRANSACTIONS
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = DEMO_TRANSACTIONS
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const transactionCount = DEMO_TRANSACTIONS.length;
  const expenseCount = DEMO_TRANSACTIONS.filter(t => t.amount < 0).length;
  
  return {
    totalRevenue,
    totalExpenses,
    netBalance: totalRevenue - totalExpenses,
    transactionCount,
    expenseCount,
    finalBalance: DEMO_BANK_BALANCE
  };
}