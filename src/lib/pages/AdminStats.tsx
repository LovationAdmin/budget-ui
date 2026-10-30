// src/lib/pages/AdminStats.tsx
// ============================================================================
// 🎯 AdminStats — Admin dashboard for /admin/stats endpoint
// ============================================================================
// Two-step flow:
//   1. If no admin secret yet → show a centered prompt asking for it
//   2. Once authenticated → show KPI dashboard with auto-refresh every 30s
//
// Security: the secret is never logged, never shown in URLs, stored only in
// sessionStorage (not localStorage) so it clears on tab close.
// ============================================================================

import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  RefreshCw,
  LogOut,
  AlertCircle,
  ArrowLeft,
  Pause,
  Play,
  Lock,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminStats, type AdminStatsData } from '@/hooks/useAdminStats';
import { cn } from '@/lib/utils';
import { AdminCampaignSender } from '@/components/admin/AdminCampaignSender';
import { AdminMonthlyRecapSender } from '@/components/admin/AdminMonthlyRecapSender';
import { AdminUnverifiedReminderSender } from '@/components/admin/AdminUnverifiedReminderSender';
import { AdminLocksBackfill } from '@/components/admin/AdminLocksBackfill';
import { AdminGrowth, Tile, plural } from '@/components/admin/AdminGrowth';

// ============================================================================
// HELPERS
// ============================================================================

function formatRelativeTime(date: Date | null): string {
  if (!date) return '—';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return 'à l’instant';
  if (seconds < 60) return `il y a ${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  return `il y a ${Math.floor(minutes / 60)} h`;
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return iso;
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminStats() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    data,
    loading,
    error,
    hasSecret,
    lastFetchedAt,
    autoRefreshEnabled,
    setSecret,
    clearSecret,
    refresh,
    toggleAutoRefresh,
  } = useAdminStats();

  // Force re-render every second so "il y a Xs" stays accurate
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24">
        {/* ============================================================== */}
        {/* HEADER */}
        {/* ============================================================== */}
        <header className="mb-6 sm:mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="mb-3 -ml-2 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour au dashboard
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                  Admin Stats
                </h1>
                <Badge
                  variant="outline"
                  className="border-destructive/40 bg-destructive/5 text-destructive font-mono text-[10px] uppercase tracking-wider"
                >
                  <Lock className="h-2.5 w-2.5 mr-1" />
                  Accès restreint
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Connecté en tant que{' '}
                <span className="font-mono text-foreground">{user?.email}</span>
              </p>
            </div>

            {/* items-start: on a phone the badge keeps its own width */}
            {hasSecret && data && (
              <div className="flex flex-col items-start sm:items-end gap-1">
                <Badge
                  variant="outline"
                  className={cn(
                    'font-mono uppercase text-[10px] tracking-wider',
                    data.environment === 'production'
                      ? 'border-success/40 bg-success/5 text-success'
                      : 'border-warning/40 bg-warning/5 text-warning'
                  )}
                >
                  {data.environment}
                </Badge>
                <span
                  className="text-xs text-muted-foreground"
                  title={`Données du ${formatDateTime(data.generated_at)}`}
                >
                  Mis à jour {formatRelativeTime(lastFetchedAt)}
                  {autoRefreshEnabled ? ' · auto toutes les 30 s' : ' · auto en pause'}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* ============================================================== */}
        {/* SECRET PROMPT (no secret yet) */}
        {/* ============================================================== */}
        {!hasSecret && <SecretPrompt onSubmit={setSecret} error={error} />}

        {/* ============================================================== */}
        {/* DASHBOARD */}
        {/* ============================================================== */}
        {hasSecret && (
          <>
            {/* TOOLBAR */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
                Actualiser
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={toggleAutoRefresh}
                className="gap-2"
                aria-label={
                  autoRefreshEnabled
                    ? 'Mettre en pause l’actualisation automatique'
                    : 'Reprendre l’actualisation automatique'
                }
              >
                {autoRefreshEnabled ? (
                  <>
                    <Pause className="h-3.5 w-3.5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    Reprendre
                  </>
                )}
              </Button>

              <div className="flex-1" />

              <Button
                variant="ghost"
                size="sm"
                onClick={clearSecret}
                className="text-muted-foreground hover:text-destructive gap-2"
              >
                <LogOut className="h-3.5 w-3.5" />
                Déconnexion admin
              </Button>
            </div>

            {/* ERROR */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span>{error}</span>
                  <Button variant="outline" size="sm" onClick={refresh} disabled={loading} className="shrink-0 gap-2">
                    <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
                    {loading ? 'Nouvel essai…' : 'Réessayer'}
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* INITIAL LOADING (an error already says what is going on) */}
            {loading && !data && !error && (
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted/50" />
                ))}
              </div>
            )}

            {/* DATA */}
            {data?.growth && <AdminGrowth growth={data.growth} newLast24h={data.users.new_last_24h} />}
            {data && <UsageTiles data={data} />}

            {/* CAMPAIGNS — only render once stats are loaded so the layout is stable */}
            {data && (
              <div className="mt-6 sm:mt-8 space-y-4">
                <h2 className="text-lg sm:text-xl font-display font-bold text-foreground">
                  Outils d'administration
                </h2>
                <AdminCampaignSender />
                <AdminUnverifiedReminderSender />
                <AdminMonthlyRecapSender />
                <AdminLocksBackfill />
              </div>
            )}

          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

// ============================================================================
// SECRET PROMPT
// ============================================================================

function SecretPrompt({
  onSubmit,
  error,
}: {
  onSubmit: (secret: string) => void;
  error: string | null;
}) {
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setSubmitting(true);
    onSubmit(value.trim());
    // useAdminStats will trigger fetch; the parent will re-render with hasSecret=true
    // We keep "submitting" for a brief moment so the UI doesn't flicker
    setTimeout(() => setSubmitting(false), 600);
  };

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
              <KeyRound className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <CardTitle className="font-display">Authentification admin</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Entre le secret administrateur configuré sur le serveur
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-secret">Secret administrateur</Label>
              <PasswordInput
                id="admin-secret"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Variable d'env ADMIN_SECRET"
                required
                autoComplete="off"
                autoFocus
                className="font-mono h-11"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-11"
              disabled={!value.trim() || submitting}
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              {submitting ? 'Vérification…' : 'Accéder aux stats'}
            </Button>

            <p className="text-xs text-center text-muted-foreground pt-2">
              Le secret est stocké en mémoire de cet onglet uniquement.
              <br />
              Il sera effacé à la fermeture de l’onglet.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// USAGE & TECHNIQUE — what « Croissance » doesn't already say
// ============================================================================

function UsageTiles({ data }: { data: AdminStatsData }) {
  const { budgets, sessions, users, suggestions_cache: cache } = data;
  const expired = cache.total - cache.not_expired;
  return (
    <section aria-labelledby="usage-title" className="space-y-4">
      <h2 id="usage-title" className="text-lg font-display font-bold text-foreground sm:text-xl">
        Usage et technique
      </h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile
          label="Budgets créés"
          value={budgets.total.toLocaleString('fr-FR')}
          hint={`${budgets.updated_last_7_days} modifiés en 7 j, ${budgets.updated_last_24h} en 24 h`}
        />
        <Tile
          label="Sessions ouvertes"
          value={sessions.active_refresh_tokens.toLocaleString('fr-FR')}
          hint={`${plural(sessions.unique_users_with_session, 'personne')}, ${sessions.issued_last_24h} émises en 24 h`}
        />
        <Tile
          label="2FA activée"
          value={`${users.total ? Math.round((users.with_totp / users.total) * 100) : 0} %`}
          hint={`${plural(users.with_totp, 'compte')} sur ${users.total}`}
        />
        <Tile
          label="Cache IA"
          value={cache.total.toLocaleString('fr-FR')}
          hint={expired > 0 ? `${cache.not_expired} valides, ${expired} expirées` : 'toutes valides'}
        />
      </div>
    </section>
  );
}
