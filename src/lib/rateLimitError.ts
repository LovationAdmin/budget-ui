// src/lib/rateLimitError.ts
// ============================================================================
// RATE LIMIT ERROR HELPER
// ============================================================================
// Transforme une réponse 429 du backend en message d'erreur français lisible.
// À utiliser dans les pages Login/Signup/ForgotPassword pour afficher un
// toast plus parlant que "Too many requests".
// ============================================================================

import { AxiosError } from 'axios';
import { defineMessages, pick } from '@/i18n/current';

const M = defineMessages({
  fr: {
    later: 'Trop de tentatives. Veuillez réessayer plus tard.',
    minutes: (minutes: number) => `Trop de tentatives. Réessayez dans ${minutes} minute${minutes > 1 ? 's' : ''}.`,
    seconds: (seconds: number) => `Trop de tentatives. Réessayez dans ${seconds} seconde${seconds > 1 ? 's' : ''}.`,
  },
  en: {
    later: 'Too many attempts. Please try again later.',
    minutes: (minutes: number) => `Too many attempts. Try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`,
    seconds: (seconds: number) => `Too many attempts. Try again in ${seconds} second${seconds > 1 ? 's' : ''}.`,
  },
});

interface RateLimitPayload {
  error?: string;
  retry_after?: number;
  limit?: number;
  window_seconds?: number;
}

/**
 * Si l'erreur est un 429, retourne un message FR. Sinon retourne null.
 *
 * Exemples de messages :
 *   - "Trop de tentatives. Réessayez dans 14 minutes."
 *   - "Trop de tentatives. Réessayez dans 45 secondes."
 */
export function extractRateLimitError(err: unknown): string | null {
  if (!(err instanceof AxiosError) || err.response?.status !== 429) {
    return null;
  }

  const data = err.response.data as RateLimitPayload | undefined;
  let retryAfterSec = data?.retry_after;

  // Fallback : header Retry-After
  if (!retryAfterSec) {
    const header = err.response.headers?.['retry-after'];
    if (header) {
      const parsed = parseInt(String(header), 10);
      if (!Number.isNaN(parsed)) retryAfterSec = parsed;
    }
  }

  const t = pick(M);
  if (!retryAfterSec || retryAfterSec < 1) {
    return t.later;
  }

  // Formatage : minutes si > 60s, sinon secondes
  if (retryAfterSec >= 60) {
    const minutes = Math.ceil(retryAfterSec / 60);
    return t.minutes(minutes);
  }
  return t.seconds(retryAfterSec);
}
