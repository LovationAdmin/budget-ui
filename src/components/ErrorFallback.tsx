// src/components/ErrorFallback.tsx
// ============================================================================
// ERROR FALLBACK
// ============================================================================
// UI affichée quand React crash et que le SentryErrorBoundary catche.
// Doit être minimaliste : pas de dépendance qui pourrait elle-même crasher
// (donc pas de hooks complexes, pas de contexte, pas d'API).
// ============================================================================

import { defineMessages, pick, screenLocale } from '@/i18n/current';
import { LOCALES } from '@/i18n/locales';

const M = defineMessages({
  fr: {
    title: 'Oups, une erreur est survenue',
    text: "L'application a rencontré un problème inattendu. Nous avons été notifiés et travaillons à le résoudre.",
    details: 'Détails techniques (dev only)',
    retry: 'Réessayer',
    home: "Retour à l'accueil",
    ref: 'Réf:',
  },
  en: {
    title: 'Oops, something went wrong',
    text: 'The app ran into an unexpected problem. We’ve been notified and are working on a fix.',
    details: 'Technical details (dev only)',
    retry: 'Try again',
    home: 'Back to home',
    ref: 'Ref:',
  },
});

interface ErrorFallbackProps {
  /** L'erreur catched par le boundary (fournie par Sentry) */
  error: unknown;
  /** Reset du boundary (essaie de re-render) */
  resetError: () => void;
  /** Event ID Sentry pour reporting manuel */
  eventId?: string;
}

export function ErrorFallback({ error, resetError, eventId }: ErrorFallbackProps) {
  const message = error instanceof Error ? error.message : String(error);
  const t = pick(M);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-4">😬</div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t.title}
        </h1>

        <p className="text-gray-600 mb-6">
          {t.text}
        </p>

        {import.meta.env.DEV && (
          <details className="mb-6 text-left bg-red-50 border border-red-200 rounded-lg p-3">
            <summary className="cursor-pointer text-sm font-medium text-red-700">
              {t.details}
            </summary>
            <pre className="mt-2 text-xs text-red-900 overflow-auto whitespace-pre-wrap">
              {message}
            </pre>
          </details>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              resetError();
            }}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            {t.retry}
          </button>

          <button
            onClick={() => {
              window.location.href = LOCALES[screenLocale()].home;
            }}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            {t.home}
          </button>
        </div>

        {eventId && (
          <p className="mt-6 text-xs text-gray-400">
            {t.ref} <code className="bg-gray-100 px-2 py-1 rounded">{eventId.slice(0, 12)}</code>
          </p>
        )}
      </div>
    </div>
  );
}
