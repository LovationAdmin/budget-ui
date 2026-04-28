// src/lib/sentry.ts
// ============================================================================
// SENTRY INIT (Frontend)
// ============================================================================
// Init Sentry au tout début de l'app, avant le render.
//
// Variables d'environnement :
//   - VITE_SENTRY_DSN          : DSN du projet Sentry (vide = désactivé)
//   - VITE_SENTRY_ENVIRONMENT  : "production" | "development" | "preview"
//   - VITE_SENTRY_RELEASE      : tag de release (auto-set depuis VITE_APP_VERSION)
//
// Sécurité : le DSN frontend est PUBLIC (visible dans le bundle JS). C'est OK,
// c'est conçu pour ça. Pour empêcher le spam d'events depuis des origines
// inconnues, configurer "Allowed Domains" dans le projet Sentry :
// Settings > Client Keys (DSN) > Configure > Allowed Domains
// → ajouter budgetfamille.com et www.budgetfamille.com
// ============================================================================

import * as Sentry from '@sentry/react';

let initialized = false;

/**
 * Init Sentry. Idempotent : safe à appeler plusieurs fois (ne ré-init pas).
 *
 * À appeler dans `main.tsx` AVANT le `ReactDOM.createRoot(...).render(...)`.
 */
export function initSentry(): void {
  if (initialized) return;

  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    // Pas de DSN → Sentry désactivé (pas d'init, pas d'erreurs console)
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info('[Sentry] disabled (VITE_SENTRY_DSN not set)');
    }
    return;
  }

  const environment =
    import.meta.env.VITE_SENTRY_ENVIRONMENT ||
    (import.meta.env.PROD ? 'production' : 'development');

  const release =
    import.meta.env.VITE_SENTRY_RELEASE ||
    `budget-ui@${import.meta.env.VITE_APP_VERSION || 'unknown'}`;

  Sentry.init({
    dsn,
    environment,
    release,

    // Sample 100% des erreurs en prod (5k/mois suffit largement vu notre volume)
    sampleRate: 1.0,

    // 0% des traces de performance (à activer plus tard si besoin)
    tracesSampleRate: 0,

    // Replay : capture les 30s avant un crash, mais coûteux en bandwidth.
    // Désactivé par défaut, à activer manuellement si tu veux.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,

    // Filtre les erreurs non-actionnables avant envoi
    beforeSend(event, hint) {
      const error = hint.originalException as Error | undefined;

      // 1. Filtrer les ResizeObserver warnings (bruit Chrome connu)
      if (error?.message?.includes('ResizeObserver loop')) {
        return null;
      }

      // 2. Filtrer les erreurs réseau benignes (offline, navigation cancelled)
      if (
        error?.message?.includes('NetworkError') ||
        error?.message?.includes('AbortError') ||
        error?.message?.includes('Failed to fetch')
      ) {
        return null;
      }

      // 3. Filtrer les erreurs d'extensions browser
      if (error?.stack?.includes('chrome-extension://') ||
          error?.stack?.includes('moz-extension://')) {
        return null;
      }

      return event;
    },

    // Ignore certains messages d'erreur connus
    ignoreErrors: [
      // Erreurs de scripts tiers qui n'impactent pas l'app
      'Script error.',
      // Erreurs liées aux extensions
      /extension/i,
      // Promise rejections sans contenu utile
      'Non-Error promise rejection captured',
    ],
  });

  initialized = true;
}

/**
 * Capture manuellement une erreur (cas où on veut tracker un event business
 * qui n'est pas une vraie exception).
 */
export function captureError(error: unknown, context?: Record<string, unknown>): void {
  if (!initialized) return;
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture un message (warning, info). Ne crée pas d'issue dans Sentry par
 * défaut sauf si tu as configuré une alerte sur le level.
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
): void {
  if (!initialized) return;
  Sentry.captureMessage(message, level);
}

/**
 * Attache l'user au scope Sentry. Appeler après login (avec userId)
 * et au logout (avec null) pour cleanup.
 */
export function setSentryUser(userId: string | null): void {
  if (!initialized) return;
  if (userId === null) {
    Sentry.setUser(null);
  } else {
    Sentry.setUser({ id: userId });
  }
}

/**
 * ErrorBoundary Sentry — wrappe l'app pour catcher les erreurs React.
 * Re-export pour faciliter l'usage : `import { SentryErrorBoundary } from ...`
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary;
