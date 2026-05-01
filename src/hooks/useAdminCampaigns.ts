// src/hooks/useAdminCampaigns.ts
// ============================================================================
// 🎯 useAdminCampaigns — POST /admin/campaigns/send
// ============================================================================
// Companion hook to useAdminStats. Reuses the SAME admin secret stored in
// sessionStorage by the existing prompt — so once the user has authenticated
// in the AdminStats page, this hook works without re-prompting.
//
// On 401, behaves like useAdminStats: clears the stored secret. We also reload
// the page so the AdminStats two-step flow re-renders the secret prompt.
// ============================================================================

import { useState, useCallback } from 'react';
import axios from 'axios';
import { ADMIN_SECRET_STORAGE_KEY } from '@/lib/constants/admin';

// ============================================================================
// TYPES — match the response shape from handlers/admin_campaigns.go
// ============================================================================

export interface SegmentResult {
  campaign_id: string;
  variant: string;
  segment: string;
  dry_run: boolean;
  total: number;
  sent: number;
  skipped: number;
  failed: number;
  duration_ms: number;
  failures?: { user_id: string; reason: string }[];
}

export interface CampaignResponse {
  campaign_id: string;
  auto: boolean;
  verified?: SegmentResult;
  unverified?: SegmentResult;
  single?: SegmentResult;
}

export interface SendCampaignParams {
  campaignId: string;
  auto?: boolean; // default true
  variant?: string; // required if auto === false
  segment?: 'verified' | 'unverified'; // required if auto === false
  dryRun?: boolean; // default false (UI defaults to true on first click)
  skipSent?: boolean; // default true
  limit?: number;
}

interface UseAdminCampaignsReturn {
  loading: boolean;
  error: string | null;
  send: (params: SendCampaignParams) => Promise<CampaignResponse | null>;
  reset: () => void;
}

// ============================================================================
// CONFIG
// ============================================================================

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ??
  'https://budget-api-778i.onrender.com/api/v1';

// Campaign sends take time (37 emails × 150ms throttle ≈ 6s; allow margin
// for network + Resend latency).
const CAMPAIGN_TIMEOUT_MS = 60_000;

// ============================================================================
// HOOK
// ============================================================================

export function useAdminCampaigns(): UseAdminCampaignsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (params: SendCampaignParams): Promise<CampaignResponse | null> => {
      const secret = sessionStorage.getItem(ADMIN_SECRET_STORAGE_KEY);
      if (!secret) {
        setError('Secret administrateur introuvable. Recharge la page.');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.post<CampaignResponse>(
          `${API_BASE_URL}/admin/campaigns/send`,
          {
            campaign_id: params.campaignId,
            auto: params.auto ?? true,
            variant: params.variant,
            segment: params.segment,
            dry_run: params.dryRun ?? false,
            skip_sent: params.skipSent ?? true,
            limit: params.limit,
          },
          {
            headers: { 'X-Admin-Secret': secret },
            timeout: CAMPAIGN_TIMEOUT_MS,
          }
        );
        return response.data;
      } catch (err: any) {
        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          if (status === 401) {
            sessionStorage.removeItem(ADMIN_SECRET_STORAGE_KEY);
            setError('Secret administrateur invalide. Reconnecte-toi.');
            // Reload so AdminStats re-renders the secret prompt
            setTimeout(() => window.location.reload(), 1500);
          } else if (status === 503) {
            setError("L'endpoint admin est désactivé sur le serveur.");
          } else if (status === 400) {
            setError(err.response?.data?.error ?? 'Requête invalide.');
          } else if (err.code === 'ECONNABORTED') {
            setError("La campagne prend trop de temps. Vérifie les logs Render.");
          } else {
            setError(
              err.response?.data?.error ?? `Erreur ${status ?? 'réseau'}`
            );
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
