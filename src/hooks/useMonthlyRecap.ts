// src/hooks/useMonthlyRecap.ts
// ============================================================================
// 🎯 useMonthlyRecap — POST /admin/campaigns/monthly-recap
// ============================================================================
// Sibling of useAdminCampaigns. Reuses the same admin secret stored in
// sessionStorage by AdminStats, so once the operator has authenticated on the
// stats page this hook works without re-prompting.
//
// Response shape mirrors handlers/admin_monthly_recap.go's monthlyRecapResponse.
// ============================================================================

import { useCallback, useState } from 'react';
import axios from 'axios';
import { ADMIN_SECRET_STORAGE_KEY } from '@/lib/constants/admin';

// ============================================================================
// TYPES
// ============================================================================

export interface MonthlyRecapFailure {
  user_id: string;
  reason: string;
}

export interface MonthlyRecapResponse {
  campaign_id: string;
  dry_run: boolean;
  total: number;
  sent: number;
  skipped: number;
  failed: number;
  duration_ms: number;
  failures?: MonthlyRecapFailure[];
}

export interface SendMonthlyRecapParams {
  campaignId?: string; // optional — backend auto-generates monthly_recap_YYYY_MM
  dryRun?: boolean;
  skipSent?: boolean;
  limit?: number;
  anchor?: string; // YYYY-MM-DD — overrides the reference "today"
}

interface UseMonthlyRecapReturn {
  loading: boolean;
  error: string | null;
  send: (params?: SendMonthlyRecapParams) => Promise<MonthlyRecapResponse | null>;
  reset: () => void;
}

// ============================================================================
// CONFIG
// ============================================================================

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ??
  'https://budget-api-778i.onrender.com/api/v1';

// Same generous ceiling as reengagement campaigns — recaps decrypt budget data
// per user, so latency scales with the verified-user count.
const RECAP_TIMEOUT_MS = 120_000;

// ============================================================================
// HOOK
// ============================================================================

export function useMonthlyRecap(): UseMonthlyRecapReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (params: SendMonthlyRecapParams = {}): Promise<MonthlyRecapResponse | null> => {
      const secret = sessionStorage.getItem(ADMIN_SECRET_STORAGE_KEY);
      if (!secret) {
        setError('Secret administrateur introuvable. Recharge la page.');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.post<MonthlyRecapResponse>(
          `${API_BASE_URL}/admin/campaigns/monthly-recap`,
          {
            campaign_id: params.campaignId,
            dry_run: params.dryRun ?? false,
            skip_sent: params.skipSent ?? true,
            limit: params.limit,
            anchor: params.anchor,
          },
          {
            headers: { 'X-Admin-Secret': secret },
            timeout: RECAP_TIMEOUT_MS,
          }
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
          } else if (status === 400) {
            setError(err.response?.data?.error ?? 'Requête invalide.');
          } else if (err.code === 'ECONNABORTED') {
            setError('Le récap prend trop de temps. Vérifie les logs Render.');
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
    []
  );

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return { loading, error, send, reset };
}
