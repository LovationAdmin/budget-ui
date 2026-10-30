// src/hooks/useAdminStats.ts
// ============================================================================
// 🎯 useAdminStats — Fetch + auto-refresh for /admin/stats
// ============================================================================
// Manages:
//   - The admin secret (in sessionStorage, so it survives page refresh in
//     the current tab but is cleared when the tab closes)
//   - The fetch lifecycle (loading, error, data)
//   - Auto-refresh every 30s (pausable)
//   - "logout" (clear secret + force re-login)
//
// On 401 from the server, we automatically wipe the stored secret and surface
// the error so the UI shows the password prompt again.
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { ADMIN_SECRET_STORAGE_KEY } from '@/lib/constants/admin';

// ============================================================================
// TYPES — match the StatsResponse from handlers/admin_stats.go
// ============================================================================

export interface AdminStatsData {
  generated_at: string;
  environment: string;
  users: {
    total: number;
    verified: number;
    with_totp: number;
    new_last_24h: number;
    active_last_7_days: number;
  };
  budgets: {
    total: number;
    updated_last_24h: number;
    updated_last_7_days: number;
  };
  sessions: {
    active_refresh_tokens: number;
    unique_users_with_session: number;
    issued_last_24h: number;
  };
  suggestions_cache: {
    total: number;
    not_expired: number;
  };
  /** Absent on older API versions. */
  growth?: GrowthData;
}

export interface GrowthData {
  funnel: { signed_up: number; verified: number; with_budget: number; active_30_days: number; collaborating: number };
  weekly: Array<{ week: string; signups: number; verified: number }>;
  active_users_7_days: number;
  active_users_30_days: number;
  unverified_over_7_days: number;
  locations: Array<{ code: string; count: number }>;
  campaigns: Array<{ id: string; sent: number; failed: number; last_at: string }>;
}

interface UseAdminStatsReturn {
  data: AdminStatsData | null;
  loading: boolean;
  error: string | null;
  hasSecret: boolean;
  lastFetchedAt: Date | null;
  autoRefreshEnabled: boolean;

  setSecret: (secret: string) => void;
  clearSecret: () => void;
  refresh: () => Promise<void>;
  toggleAutoRefresh: () => void;
}

// ============================================================================
// CONFIG
// ============================================================================

const REFRESH_INTERVAL_MS = 30_000; // 30 seconds

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ??
  'https://budget-api-778i.onrender.com/api/v1';

// ============================================================================
// HOOK
// ============================================================================

export function useAdminStats(): UseAdminStatsReturn {
  // Init from sessionStorage so the secret survives a page refresh
  const [secret, setSecretState] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(ADMIN_SECRET_STORAGE_KEY);
  });

  const [data, setData] = useState<AdminStatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Avoid stale closure inside the interval callback
  const secretRef = useRef(secret);
  secretRef.current = secret;
  // Read by the retry triggers (online, tab visible) without re-subscribing
  const hasDataRef = useRef(false);
  const errorRef = useRef<string | null>(null);
  errorRef.current = error;
  const autoRefreshRef = useRef(autoRefreshEnabled);
  autoRefreshRef.current = autoRefreshEnabled;
  // One request at a time: « online » and « visible » often fire together
  const inFlightRef = useRef(false);

  // ============================================================================
  // CORE FETCH
  // ============================================================================
  // silentOnError only hides the error while the last stats are still on
  // screen (« Mis à jour il y a … » shows their age). With nothing to show,
  // the error stays visible until a request succeeds: a failed background
  // retry must not leave a blank page.
  const fetchStats = useCallback(async (silentOnError = false) => {
    const currentSecret = secretRef.current;
    if (!currentSecret || inFlightRef.current) return;
    inFlightRef.current = true;
    const silent = silentOnError && hasDataRef.current;

    setLoading(true);

    try {
      const response = await axios.get<AdminStatsData>(
        `${API_BASE_URL}/admin/stats`,
        {
          headers: { 'X-Admin-Secret': currentSecret },
          // The API answers in milliseconds; the margin is for weak mobile networks
          timeout: 15000,
        }
      );
      hasDataRef.current = true;
      setData(response.data);
      setLastFetchedAt(new Date());
      setError(null);
    } catch (err: any) {
      if (axios.isAxiosError(err) && !err.response) {
        // No answer at all (offline, timeout, request blocked)
        if (!silent) {
          setError('Le serveur ne répond pas. Vérifiez votre connexion : la page réessaie toute seule.');
        }
      } else if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) {
          // Wrong secret — clear it so the prompt re-appears
          sessionStorage.removeItem(ADMIN_SECRET_STORAGE_KEY);
          setSecretState(null);
          if (!silent) setError('Secret administrateur invalide.');
        } else if (status === 503) {
          if (!silent) {
            setError(
              "L'endpoint admin est désactivé sur le serveur (ADMIN_SECRET non configuré)."
            );
          }
        } else {
          if (!silent) {
            setError(
              err.response?.data?.error ?? `Erreur ${status ?? 'réseau'}`
            );
          }
        }
      } else {
        if (!silent) setError('Erreur inattendue.');
      }
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // SECRET MANAGEMENT
  // ============================================================================
  const setSecret = useCallback(
    (newSecret: string) => {
      const trimmed = newSecret.trim();
      if (!trimmed) return;
      sessionStorage.setItem(ADMIN_SECRET_STORAGE_KEY, trimmed);
      setSecretState(trimmed);
    },
    []
  );

  const clearSecret = useCallback(() => {
    sessionStorage.removeItem(ADMIN_SECRET_STORAGE_KEY);
    setSecretState(null);
    hasDataRef.current = false;
    setData(null);
    setError(null);
    setLastFetchedAt(null);
  }, []);

  // ============================================================================
  // INITIAL FETCH WHEN SECRET IS PROVIDED
  // ============================================================================
  useEffect(() => {
    if (secret) fetchStats();
  }, [secret, fetchStats]);

  // ============================================================================
  // AUTO-REFRESH
  // ============================================================================
  useEffect(() => {
    if (!secret || !autoRefreshEnabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      // Pause auto-refresh when tab is hidden — save bandwidth + tokens
      if (document.visibilityState === 'visible') {
        fetchStats(true); // silent on error to avoid flicker
      }
    }, REFRESH_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [secret, autoRefreshEnabled, fetchStats]);

  // ============================================================================
  // RETRY AS SOON AS IT CAN WORK
  // ============================================================================
  // Back online, or back to the tab (a phone suspends background tabs): fetch
  // now rather than at the next 30 s tick, if auto-refresh is on or the last
  // attempt failed.
  useEffect(() => {
    if (!secret) return;
    const retry = () => {
      if (document.visibilityState !== 'visible') return;
      if (autoRefreshRef.current || errorRef.current || !hasDataRef.current) fetchStats(true);
    };
    window.addEventListener('online', retry);
    document.addEventListener('visibilitychange', retry);
    return () => {
      window.removeEventListener('online', retry);
      document.removeEventListener('visibilitychange', retry);
    };
  }, [secret, fetchStats]);

  // ============================================================================
  // PUBLIC API
  // ============================================================================
  const refresh = useCallback(async () => {
    await fetchStats(false);
  }, [fetchStats]);

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefreshEnabled((v) => !v);
  }, []);

  return {
    data,
    loading,
    error,
    hasSecret: !!secret,
    lastFetchedAt,
    autoRefreshEnabled,
    setSecret,
    clearSecret,
    refresh,
    toggleAutoRefresh,
  };
}
