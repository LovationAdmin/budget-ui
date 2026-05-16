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
  Users,
  Wallet,
  KeyRound,
  Database,
  RefreshCw,
  LogOut,
  AlertCircle,
  ArrowLeft,
  Pause,
  Play,
  TrendingUp,
  CheckCircle2,
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

// ============================================================================
// HELPERS
// ============================================================================

function formatRelativeTime(date: Date | null): string {
  if (!date) return '—';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return 'à l’instant';
  if (seconds < 60) return `il y a ${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes}min`;
  return `il y a ${Math.floor(minutes / 60)}h`;
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
                  Restricted
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Connecté en tant que{' '}
                <span className="font-mono text-foreground">{user?.email}</span>
              </p>
            </div>

            {hasSecret && data && (
              <div className="flex flex-col sm:items-end gap-1">
                <Badge
                  variant="outline"
                  className={cn(
                    'font-mono uppercase text-[10px] tracking-wider',
                    data.environment === 'production'
                      ? 'border-success/40 bg-success/5 text-success'
                      : 'border-warning/40 bg-warning/5 text-warning'
                  )}
                >
                  ENV: {data.environment}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Mis à jour {formatRelativeTime(lastFetchedAt)}
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
                Rafraîchir
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={toggleAutoRefresh}
                className="gap-2"
                title={
                  autoRefreshEnabled
                    ? 'Auto-refresh actif (30s)'
                    : 'Auto-refresh en pause'
                }
              >
                {autoRefreshEnabled ? (
                  <>
                    <Pause className="h-3.5 w-3.5" />
                    Pause auto-refresh
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    Reprendre auto-refresh
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
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* INITIAL LOADING */}
            {loading && !data && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="h-40 animate-pulse bg-muted/50" />
                ))}
              </div>
            )}

            {/* DATA */}
            {data && <StatsGrid data={data} />}

            {/* CAMPAIGNS — only render once stats are loaded so the layout is stable */}
            {data && (
              <div className="mt-6 sm:mt-8 space-y-4">
                <h2 className="text-lg sm:text-xl font-display font-bold text-foreground">
                  Outils d'administration
                </h2>
                <AdminCampaignSender />
                <AdminUnverifiedReminderSender />
                <AdminMonthlyRecapSender />
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
// KPI GRID
// ============================================================================

function StatsGrid({ data }: { data: AdminStatsData }) {
  return (
    <div className="space-y-6">
      {/* USERS */}
      <SectionCard
        title="Utilisateurs"
        icon={Users}
        accent="primary"
        primary={{
          label: 'Total inscrits',
          value: data.users.total,
        }}
        metrics={[
          {
            label: 'Email vérifié',
            value: data.users.verified,
            of: data.users.total,
            tone: 'success',
          },
          {
            label: '2FA activé',
            value: data.users.with_totp,
            of: data.users.total,
            tone: 'neutral',
          },
          {
            label: 'Nouveaux 24h',
            value: data.users.new_last_24h,
            tone: 'neutral',
            badge: data.users.new_last_24h > 0 ? 'live' : undefined,
          },
          {
            label: 'Actifs 7 jours',
            value: data.users.active_last_7_days,
            of: data.users.total,
            tone: 'success',
          },
        ]}
      />

      {/* BUDGETS */}
      <SectionCard
        title="Budgets"
        icon={Wallet}
        accent="secondary"
        primary={{
          label: 'Total créés',
          value: data.budgets.total,
        }}
        metrics={[
          {
            label: 'Modifiés 24h',
            value: data.budgets.updated_last_24h,
            tone: 'success',
            badge: data.budgets.updated_last_24h > 0 ? 'live' : undefined,
          },
          {
            label: 'Modifiés 7 jours',
            value: data.budgets.updated_last_7_days,
            of: data.budgets.total,
            tone: 'neutral',
          },
        ]}
      />

      {/* SESSIONS */}
      <SectionCard
        title="Sessions actives"
        icon={ShieldCheck}
        accent="success"
        primary={{
          label: 'Refresh tokens valides',
          value: data.sessions.active_refresh_tokens,
        }}
        metrics={[
          {
            label: 'Utilisateurs uniques',
            value: data.sessions.unique_users_with_session,
            tone: 'neutral',
          },
          {
            label: 'Émis dans les 24h',
            value: data.sessions.issued_last_24h,
            tone: 'neutral',
          },
        ]}
      />

      {/* SUGGESTIONS CACHE */}
      <SectionCard
        title="Cache IA"
        icon={Database}
        accent="warning"
        primary={{
          label: 'Entrées totales',
          value: data.suggestions_cache.total,
        }}
        metrics={[
          {
            label: 'Encore valides',
            value: data.suggestions_cache.not_expired,
            of: data.suggestions_cache.total,
            tone: 'success',
          },
          {
            label: 'Expirées',
            value:
              data.suggestions_cache.total - data.suggestions_cache.not_expired,
            of: data.suggestions_cache.total,
            tone: 'neutral',
          },
        ]}
      />

      {/* FOOTER META */}
      <div className="text-xs text-muted-foreground text-center pt-2 font-mono">
        Snapshot généré le {formatDateTime(data.generated_at)}
      </div>
    </div>
  );
}

// ============================================================================
// SECTION CARD
// ============================================================================

interface Metric {
  label: string;
  value: number;
  of?: number;
  tone?: 'success' | 'neutral' | 'warning';
  badge?: 'live';
}

interface SectionCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: 'primary' | 'secondary' | 'success' | 'warning';
  primary: { label: string; value: number };
  metrics: Metric[];
}

const ACCENT_CLASSES: Record<SectionCardProps['accent'], string> = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
};

function SectionCard({
  title,
  icon: Icon,
  accent,
  primary,
  metrics,
}: SectionCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl',
              ACCENT_CLASSES[accent]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <CardTitle className="font-display text-lg">{title}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Primary headline metric */}
        <div className="flex items-baseline gap-3 pb-3 border-b border-border/50">
          <span className="text-4xl sm:text-5xl font-display font-bold tabular-nums">
            {primary.value.toLocaleString('fr-FR')}
          </span>
          <span className="text-sm text-muted-foreground uppercase tracking-wide">
            {primary.label}
          </span>
        </div>

        {/* Sub metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {metrics.map((m) => (
            <SubMetric key={m.label} metric={m} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SubMetric({ metric }: { metric: Metric }) {
  const percentage =
    metric.of && metric.of > 0
      ? Math.round((metric.value / metric.of) * 100)
      : null;

  return (
    <div className="rounded-xl bg-muted/40 p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
        {metric.label}
        {metric.badge === 'live' && (
          <span className="flex items-center gap-1 text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span>live</span>
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1.5 mt-1">
        <span
          className={cn(
            'text-xl font-display font-bold tabular-nums',
            metric.tone === 'success' && metric.value > 0 && 'text-success',
            metric.tone === 'warning' && 'text-warning'
          )}
        >
          {metric.value.toLocaleString('fr-FR')}
        </span>
        {percentage !== null && (
          <span className="text-xs text-muted-foreground tabular-nums">
            ({percentage}%)
          </span>
        )}
      </div>
    </div>
  );
}
