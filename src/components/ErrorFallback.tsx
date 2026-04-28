// src/components/ErrorFallback.tsx
// ============================================================================
// ERROR FALLBACK
// ============================================================================
// UI affichée quand React crash et que le SentryErrorBoundary catche.
// Doit être minimaliste : pas de dépendance qui pourrait elle-même crasher
// (donc pas de hooks complexes, pas de contexte, pas d'API).
// ============================================================================

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-4">😬</div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Oups, une erreur est survenue
        </h1>

        <p className="text-gray-600 mb-6">
          L'application a rencontré un problème inattendu. Nous avons été notifiés
          et travaillons à le résoudre.
        </p>

        {import.meta.env.DEV && (
          <details className="mb-6 text-left bg-red-50 border border-red-200 rounded-lg p-3">
            <summary className="cursor-pointer text-sm font-medium text-red-700">
              Détails techniques (dev only)
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
            Réessayer
          </button>

          <button
            onClick={() => {
              window.location.href = '/';
            }}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>

        {eventId && (
          <p className="mt-6 text-xs text-gray-400">
            Réf: <code className="bg-gray-100 px-2 py-1 rounded">{eventId.slice(0, 12)}</code>
          </p>
        )}
      </div>
    </div>
  );
}
