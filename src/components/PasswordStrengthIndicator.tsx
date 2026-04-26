// src/components/PasswordStrengthIndicator.tsx
// ============================================================================
// PASSWORD STRENGTH INDICATOR
// ============================================================================
// Composant léger qui affiche :
//   - une barre de force segmentée (4 segments colorés selon le score)
//   - le libellé du score
//   - une checklist des critères respectés
//
// Utilise validatePassword() de src/utils/passwordStrength.ts qui est le
// miroir exact du validateur backend Go. Tout mot de passe accepté ici est
// accepté par l'API (et inversement).
// ============================================================================

import { Check, X } from 'lucide-react';
import { validatePassword } from '@/utils/passwordStrength';

interface PasswordStrengthIndicatorProps {
  password: string;
  email?: string;
  name?: string;
  /** Si true, on cache le composant tant que le champ est vide. Default: true. */
  hideWhenEmpty?: boolean;
  className?: string;
}

const SEGMENT_COLORS: Record<number, string> = {
  0: 'bg-gray-200',
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-green-500',
};

const LABEL_COLORS: Record<number, string> = {
  0: 'text-gray-500',
  1: 'text-red-600',
  2: 'text-orange-600',
  3: 'text-yellow-700',
  4: 'text-green-600',
};

export function PasswordStrengthIndicator({
  password,
  email,
  name,
  hideWhenEmpty = true,
  className = '',
}: PasswordStrengthIndicatorProps) {
  if (hideWhenEmpty && !password) return null;

  const result = validatePassword(password, email, name);
  const { score, strengthLabel, checks } = result;

  return (
    <div className={`space-y-2 ${className}`} aria-live="polite">
      {/* Barre segmentée 4 niveaux */}
      <div
        className="flex gap-1"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-label={`Force du mot de passe : ${strengthLabel}`}
      >
        {[1, 2, 3, 4].map((segment) => (
          <div
            key={segment}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${
              score >= segment ? SEGMENT_COLORS[score] : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Libellé de force */}
      <p className={`text-xs font-medium ${LABEL_COLORS[score]}`}>
        Force : {strengthLabel}
      </p>

      {/* Checklist des critères */}
      <ul className="space-y-1 text-xs" aria-label="Critères du mot de passe">
        {checks.map((check, idx) => (
          <li key={idx} className="flex items-center gap-2">
            {check.passed ? (
              <Check className="h-3.5 w-3.5 text-green-600 shrink-0" aria-hidden="true" />
            ) : (
              <X className="h-3.5 w-3.5 text-gray-400 shrink-0" aria-hidden="true" />
            )}
            <span className={check.passed ? 'text-gray-700' : 'text-gray-500'}>
              {check.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
