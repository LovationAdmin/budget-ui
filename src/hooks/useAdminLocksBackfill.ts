// src/hooks/useAdminLocksBackfill.ts
// ============================================================================
// useAdminLocksBackfill — POST /admin/maintenance/backfill-locks
// ============================================================================
// Companion hook to useAdminCampaigns. Reuses the admin secret stored in
// sessionStorage by the admin secret prompt.
// ============================================================================

import { useState, useCallback } from 'react';
import axios from 'axios';
import { ADMIN_SECRET_STORAGE_KEY } from '@/lib/constants/admin';

export interface BackfillFailure {
  budget_id: string;
  reason: string;
}

export interface BackfillResponse {
  dry_run: boolean;
  total_scanned: number;
  modified: number;
  unchanged: number;
  skipped: number;
  failed: number;
  duration_ms: number;
  failures?: BackfillFailure[];
}

export interface BackfillParams {
  dryRun: boolean;
  limit?: number;
}

interface UseAdminLocksBackfillReturn {
  loading: boolean;
  error: string | null;
  run: (params: BackfillParams) => Promise<BackfillResponse | null>;
  reset: () => void;
}

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ??
  'https://budget-api-778i.onrender.com/api/v1';

// Backfill walks every budget with 100ms throttle, so a few hundred budgets
// can take a minute or two. Be generous with the timeout.
const BACKFILL_TIMEOUT_MS = 180_000;

export function useAdminLocksBackfill(): UseAdminLocksBackfillReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (params: BackfillParams): Promise<BackfillResponse | null> => {
      const secret = sessionStorage.getItem(ADMIN_SECRET_STORAGE_KEY);
      if (!secret) {
        setError('Secret administrateur introuvable. Recharge la page.');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.post<BackfillResponse>(
          `${API_BASE_URL}/admin/maintenance/backfill-locks`,
          { dry_run: params.dryRun, limit: params.limit },
          {
            headers: { 'X-Admin-Secret': secret },
            timeout: BACKFILL_TIMEOUT_MS,
          },
        );
        return response.data;
      } catch (err: any) {
        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          if (status === 401) {
            sessionStorage.removeItem(ADMIN_SECRET_STORAGE_KEY);
            setError('Secret administrateur invalide. Reconnecte-toi.');
            setTimeout(() => window.location.reload(), 1500);
          } else if (status === 503) {
            setError("L'endpoint admin est désactivé sur le serveur.");
          } else if (err.code === 'ECONNABORTED') {
            setError('Le backfill prend trop de temps. Vérifie les logs.');
          } else {
            setError(err.response?.data?.error ?? `Erreur ${status ?? 'réseau'}`);
          }
        } else {
          setError('Erreur inattendue.');
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return { loading, error, run, reset };
}
