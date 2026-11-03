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
//   - VITE_SENTRY_TRACES_RATE  : part des visites mesurées (vitesse réelle :
//                                chargement, LCP/INP/CLS, requêtes API liées
//                                aux traces du backend). 0.1 par défaut, 0 = off.
//
// Sécurité : le DSN frontend est PUBLIC (visible dans le bundle JS). C'est OK,
// c'est conçu pour ça. Pour empêcher le spam d'events depuis des origines
// inconnues, configurer "Allowed Domains" dans le projet Sentry :
// Settings > Client Keys (DSN) > Configure > Allowed Domains
// → ajouter budgetfamille.com et www.budgetfamille.com
// ============================================================================

import * as Sentry from '@sentry/react';

let initialized = false;
let scheduled = false;

/**
 * Init Sentry. Idempotent : safe à appeler plusieurs fois (ne ré-init pas).
 *
 * À appeler dans `main.tsx` AVANT le `ReactDOM.createRoot(...).render(...)`.
 * The SDK itself (src/lib/sentryInit.ts) is fetched once the page has loaded
 * and the browser is idle: it never delays the first screen. An error thrown
 * before then is not reported.
 */
export function initSentry(): void {
  if (scheduled) return;

  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    // Pas de DSN → Sentry désactivé (pas d'init, pas d'erreurs console)
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info('[Sentry] disabled (VITE_SENTRY_DSN not set)');
    }
    return;
  }
  scheduled = true;

  const environment =
    import.meta.env.VITE_SENTRY_ENVIRONMENT ||
    (import.meta.env.PROD ? 'production' : 'development');

  const release =
    import.meta.env.VITE_SENTRY_RELEASE ||
    `budget-ui@${import.meta.env.VITE_APP_VERSION || 'unknown'}`;

  const rate = Number(import.meta.env.VITE_SENTRY_TRACES_RATE ?? '0.1');
  const tracesSampleRate = Number.isFinite(rate) ? Math.min(Math.max(rate, 0), 1) : 0;
  let apiOrigin = 'http://localhost:8080';
  try {
    apiOrigin = new URL(import.meta.env.VITE_API_URL || apiOrigin).origin;
  } catch {
    /* keep the default */
  }

  const start = () => {
    import('./sentryInit')
      .then(({ startSentry }) => {
        startSentry({ dsn, environment, release, tracesSampleRate, apiOrigin });
        initialized = true;
      })
      .catch(() => undefined);
  };
  const whenIdle = () => {
    if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 3000 });
    else setTimeout(start, 1);
  };
  if (document.readyState === 'complete') whenIdle();
  else window.addEventListener('load', whenIdle, { once: true });
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
  // Not gated on `initialized`: the session is restored before the SDK loads
  // (initSentry), and the scope keeps the user for when it starts.
  if (!scheduled) return;
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
