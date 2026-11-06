// src/lib/sentryInit.ts
// ============================================================================
// Starts the Sentry SDK. Loaded on its own, once the page has loaded (see
// initSentry in sentry.ts), so its start-up code and the performance
// monitoring never weigh on the first screen. The page load is still
// measured from its very beginning (navigation timing, LCP, CLS).
// ============================================================================

import { browserTracingIntegration, init } from '@sentry/react';

export interface SentryStartOptions {
  dsn: string;
  environment: string;
  release: string;
  tracesSampleRate: number;
  apiOrigin: string;
}

export function startSentry({ dsn, environment, release, tracesSampleRate, apiOrigin }: SentryStartOptions): void {
  init({
    dsn,
    environment,
    release,

    // Sample 100% des erreurs en prod (5k/mois suffit largement vu notre volume)
    sampleRate: 1.0,

    // Real-user speed on a share of visits (see VITE_SENTRY_TRACES_RATE).
    // API calls carry the trace headers, so a slow screen links to the
    // backend request that made it slow (the API allows them in CORS).
    integrations: tracesSampleRate > 0 ? [browserTracingIntegration()] : [],
    tracesSampleRate,
    tracePropagationTargets: [apiOrigin],

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
}
