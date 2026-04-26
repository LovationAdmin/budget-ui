// src/utils/passwordStrength.ts
// ============================================================================
// PASSWORD STRENGTH & VALIDATION
// ============================================================================
// Mirror exact du validateur Go côté backend (utils/password_validator.go)
// + calcul d'un score de force pour l'indicateur UI.
//
// L'objectif est qu'un mot de passe accepté côté frontend soit aussi accepté
// côté backend (et vice versa), pour éviter toute confusion utilisateur.
// ============================================================================

const COMMON_PASSWORDS = new Set<string>([
  // Top mondial
  'password', 'password1', 'password123', 'password!',
  '123456', '12345678', '123456789', '1234567890',
  'qwerty', 'qwerty123', 'qwertyuiop',
  'admin', 'admin123', 'letmein', 'welcome', 'welcome1',
  'monkey', 'iloveyou', 'abc123', 'abcdef', 'abcdefgh',
  'trustno1', 'dragon', 'master', 'shadow',
  // FR
  'azerty', 'azerty123', 'azertyuiop',
  'motdepasse', 'motdepasse1', 'motdepasse123',
  'bonjour', 'soleil', 'doudou',
  // Produit
  'budget', 'budgetfamille', 'famille', 'lovation',
]);

export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 72;
export const PASSWORD_REQUIRED_CLASSES = 3;

export interface PasswordCheck {
  /** Cette règle est-elle respectée ? */
  passed: boolean;
  /** Libellé affiché dans la checklist UI. */
  label: string;
}

export type PasswordScore = 0 | 1 | 2 | 3 | 4;

export interface PasswordValidationResult {
  /** True si tous les critères obligatoires sont satisfaits. */
  isValid: boolean;
  /** Liste des messages d'erreur prêts à afficher (français). */
  errors: string[];
  /** Détail des critères, pour la checklist UI. */
  checks: PasswordCheck[];
  /** Score de force 0..4 pour la barre visuelle. */
  score: PasswordScore;
  /** Libellé du score, prêt à afficher. */
  strengthLabel: string;
}

const STRENGTH_LABELS = ['Très faible', 'Faible', 'Correct', 'Bon', 'Excellent'] as const;

/**
 * Valide un mot de passe contre la politique du backend Budget Famille.
 *
 * Cette fonction est volontairement synchrone et sans dépendance externe
 * pour rester rapide à exécuter à chaque keystroke.
 */
export function validatePassword(
  password: string,
  email?: string,
  name?: string,
): PasswordValidationResult {
  const errors: string[] = [];
  const lower = password.toLowerCase();

  // 1. Détection des classes de caractères
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  // Tout ce qui n'est ni lettre ASCII ni chiffre est considéré spécial
  // (couvre espace, ponctuation, symboles, caractères accentués, emojis)
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const classCount = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;

  // 2. Longueur
  const lengthOk = password.length >= PASSWORD_MIN_LENGTH && password.length <= PASSWORD_MAX_LENGTH;
  if (password.length === 0) {
    // pas d'erreur explicite quand vide, l'UI gère le placeholder
  } else if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères`);
  } else if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push(`Doit contenir au plus ${PASSWORD_MAX_LENGTH} caractères`);
  }

  // 3. Diversité
  const diversityOk = classCount >= PASSWORD_REQUIRED_CLASSES;
  if (!diversityOk && password.length > 0) {
    errors.push('Doit contenir au moins 3 types parmi : majuscule, minuscule, chiffre, caractère spécial');
  }

  // 4. Mot de passe trop commun
  const notCommon = !COMMON_PASSWORDS.has(lower);
  if (!notCommon) {
    errors.push('Mot de passe trop commun et facilement devinable');
  }

  // 5. Ne contient pas la partie locale de l'email
  let notContainsEmail = true;
  if (email) {
    const localPart = (email.toLowerCase().split('@')[0] ?? '').trim();
    if (localPart.length >= 4 && lower.includes(localPart)) {
      notContainsEmail = false;
      errors.push('Ne doit pas contenir votre adresse email');
    }
  }

  // 6. Ne contient pas un token du nom
  let notContainsName = true;
  if (name) {
    const tokens = name.toLowerCase().split(/\s+/).filter((t) => t.length >= 4);
    for (const token of tokens) {
      if (lower.includes(token)) {
        notContainsName = false;
        errors.push('Ne doit pas contenir votre nom');
        break;
      }
    }
  }

  // 7. Construction de la checklist (pour l'UI)
  const checks: PasswordCheck[] = [
    { passed: lengthOk, label: `${PASSWORD_MIN_LENGTH} caractères minimum` },
    { passed: diversityOk, label: '3 types de caractères au moins (majuscule, minuscule, chiffre, spécial)' },
    { passed: notCommon, label: 'Pas un mot de passe trop commun' },
    { passed: notContainsEmail && notContainsName, label: 'Ne contient ni votre nom, ni votre email' },
  ];

  // 8. Score de force (0..4)
  const passedCount = checks.filter((c) => c.passed).length;
  let score: PasswordScore;
  if (password.length === 0) {
    score = 0;
  } else if (passedCount === 4 && password.length >= 16) {
    score = 4; // Excellent : tous critères + longueur > 16
  } else if (passedCount === 4) {
    score = 3; // Bon : tous critères, longueur 10-15
  } else if (passedCount === 3) {
    score = 2; // Correct
  } else if (passedCount >= 1) {
    score = 1; // Faible
  } else {
    score = 0;
  }

  return {
    isValid: errors.length === 0 && password.length > 0,
    errors,
    checks,
    score,
    strengthLabel: STRENGTH_LABELS[score],
  };
}
