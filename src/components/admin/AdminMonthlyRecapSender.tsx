// src/components/admin/AdminMonthlyRecapSender.tsx
// ============================================================================
// 🎯 AdminMonthlyRecapSender — UI for POST /admin/campaigns/monthly-recap
// ============================================================================
// Same defensive 3-step UX as AdminCampaignSender: dry-run → confirm → send.
// One verified user gets one recap email per call; the backend picks each
// user's most-recently updated budget and aggregates previous / current /
// next month + project evolution.
//
// Anchor is optional — defaults to "today" on the server. Useful to backfill
// or test a specific reporting month without waiting for the cron on the 1st.
// ============================================================================

import { useMemo, useState } from 'react';
import {
  CalendarRange,
  Eye,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  useMonthlyRecap,
  type MonthlyRecapResponse,
} from '@/hooks/useMonthlyRecap';
import { cn } from '@/lib/utils';

// ============================================================================
// HELPERS
// ============================================================================

function defaultCampaignId(): string {
  // The backend defaults to "monthly_recap_<previous-month>"; we mirror that
  // here so the field shows the same identifier the server would generate.
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return `monthly_recap_${prev.getFullYear()}_${String(prev.getMonth() + 1).padStart(2, '0')}`;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AdminMonthlyRecapSender() {
  const { toast } = useToast();
  const { loading, error, send, reset } = useMonthlyRecap();

  // ── Form ──────────────────────────────────────────────────────────────
  const [campaignId, setCampaignId] = useState(defaultCampaignId());
  const [skipSent, setSkipSent] = useState(true);
  const [anchor, setAnchor] = useState('');
  const [limitInput, setLimitInput] = useState('');

  // ── Workflow ─────────────────────────────────────────────────────────
  const [previewResult, setPreviewResult] = useState<MonthlyRecapResponse | null>(null);
  const [sendResult, setSendResult] = useState<MonthlyRecapResponse | null>(null);
  const [confirmingReal, setConfirmingReal] = useState(false);

  const limit = useMemo(() => {
    const n = parseInt(limitInput, 10);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [limitInput]);

  const totalToSend = previewResult?.total ?? 0;

  // ── Handlers ─────────────────────────────────────────────────────────
  const buildParams = (dryRun: boolean) => ({
    campaignId: campaignId.trim() || undefined,
    dryRun,
    skipSent,
    anchor: anchor.trim() || undefined,
    limit,
  });

  const handleDryRun = async () => {
    setPreviewResult(null);
    setSendResult(null);
    setConfirmingReal(false);

    const result = await send(buildParams(true));
    if (result) {
      setPreviewResult(result);
      toast({
        title: 'Aperçu généré',
        description: `${result.total} récap${result.total > 1 ? 's' : ''} prêt${result.total > 1 ? 's' : ''} à partir. ${result.skipped} déjà envoyé${result.skipped > 1 ? 's' : ''}.`,
      });
    }
  };

  const handleRealSend = async () => {
    setConfirmingReal(false);

    const result = await send(buildParams(false));
    if (result) {
      setSendResult(result);
      if (result.failed > 0) {
        toast({
          title: `${result.sent} envoyés, ${result.failed} échecs`,
          description: 'Voir les détails ci-dessous.',
          variant: 'warning',
        });
      } else {
        toast({
          title: `${result.sent} récap${result.sent > 1 ? 's' : ''} envoyé${result.sent > 1 ? 's' : ''} ✉️`,
          description: 'Tous les utilisateurs vérifiés ont reçu leur résumé.',
          variant: 'success',
        });
      }
    }
  };

  const handleReset = () => {
    setPreviewResult(null);
    setSendResult(null);
    setConfirmingReal(false);
    setCampaignId(defaultCampaignId());
    setAnchor('');
    setLimitInput('');
    reset();
  };

  const showForm = !sendResult;
  const showPreviewBlock = previewResult && !sendResult && !confirmingReal;
  const showConfirmBlock = previewResult && !sendResult && confirmingReal;
  const showSendResultBlock = !!sendResult;
  const formDisabled = loading || !!previewResult;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Card className="border-primary/40">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarRange className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="font-display text-lg">
              Récap mensuel
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Envoi du résumé budgétaire à tous les utilisateurs vérifiés (auto le 1er de chaque mois, 09:00 Paris)
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* ── FORM ─────────────────────────────────────────────────────── */}
        {showForm && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recap-campaign-id">Identifiant de campagne</Label>
              <Input
                id="recap-campaign-id"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                placeholder="monthly_recap_2026_04"
                disabled={formDisabled}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Si vide, le serveur génère <code className="font-mono text-[11px]">monthly_recap_YYYY_MM</code>{' '}
                à partir du mois précédent.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="recap-anchor">
                  Date d'ancrage <span className="text-muted-foreground font-normal">(optionnel)</span>
                </Label>
                <Input
                  id="recap-anchor"
                  type="date"
                  value={anchor}
                  onChange={(e) => setAnchor(e.target.value)}
                  disabled={formDisabled}
                />
                <p className="text-xs text-muted-foreground">
                  Décale le "aujourd'hui" — utile pour rejouer un mois passé.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recap-limit">
                  Limite <span className="text-muted-foreground font-normal">(optionnel)</span>
                </Label>
                <Input
                  id="recap-limit"
                  type="number"
                  min={1}
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                  placeholder="ex: 1 pour tester"
                  disabled={formDisabled}
                />
                <p className="text-xs text-muted-foreground">
                  Cap le nombre d'utilisateurs traités (par ordre d'inscription).
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
              <div className="flex-1 mr-3">
                <Label htmlFor="recap-skip-sent" className="cursor-pointer">
                  Skip les déjà envoyés
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Recommandé. Évite les doublons si le cron du 1er du mois a déjà tourné.
                </p>
              </div>
              <Switch
                id="recap-skip-sent"
                checked={skipSent}
                onCheckedChange={setSkipSent}
                disabled={formDisabled}
              />
            </div>
          </div>
        )}

        {/* ── ERROR ─────────────────────────────────────────────────────── */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* ── PREVIEW ───────────────────────────────────────────────────── */}
        {showPreviewBlock && (
          <div className="space-y-3 rounded-lg border border-success/30 bg-success/5 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-success">
              <Eye className="h-4 w-4" />
              Aperçu généré — aucun email envoyé
            </div>
            <ResultGrid result={previewResult!} dryRun />
          </div>
        )}

        {/* ── CONFIRMATION ──────────────────────────────────────────────── */}
        {showConfirmBlock && (
          <Alert variant="destructive" className="border-destructive/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="space-y-3">
              <p className="font-medium">
                Vous êtes sur le point d'envoyer{' '}
                <span className="font-bold tabular-nums">{totalToSend - (previewResult?.skipped ?? 0)} récap{(totalToSend - (previewResult?.skipped ?? 0)) > 1 ? 's' : ''} réel{(totalToSend - (previewResult?.skipped ?? 0)) > 1 ? 's' : ''}</span>.
              </p>
              <p className="text-sm opacity-90">
                Chaque destinataire reçoit le résumé budgétaire de son budget le plus récent (mois précédent / en cours / suivant + évolution des projets).
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmingReal(false)}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRealSend}
                  disabled={loading}
                  className="gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Oui, envoyer
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* ── SEND RESULT ───────────────────────────────────────────────── */}
        {showSendResultBlock && (
          <div className="space-y-3 rounded-lg border border-success/30 bg-success/5 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-success">
              <CheckCircle2 className="h-4 w-4" />
              Récap envoyé
            </div>
            <ResultGrid result={sendResult!} dryRun={false} />
            <div className="rounded-md bg-background/60 p-3 text-xs text-muted-foreground">
              Audit SQL :{' '}
              <code className="font-mono text-[11px] break-all">
                SELECT campaign_id, status, COUNT(*) FROM email_campaign_sends
                WHERE campaign_id = '{sendResult!.campaign_id}' GROUP BY 1,2;
              </code>
            </div>
          </div>
        )}

        {/* ── ACTION BUTTONS ───────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 pt-1">
          {!previewResult && !sendResult && (
            <Button
              onClick={handleDryRun}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              Générer l'aperçu (dry-run)
            </Button>
          )}

          {showPreviewBlock && (
            <>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Réinitialiser
              </Button>
              <Button
                onClick={() => setConfirmingReal(true)}
                disabled={loading || totalToSend === 0}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Envoyer pour de vrai
                <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {showSendResultBlock && (
            <Button
              variant="outline"
              onClick={handleReset}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Nouveau récap
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// RESULT GRID
// ============================================================================

function ResultGrid({
  result,
  dryRun,
}: {
  result: MonthlyRecapResponse;
  dryRun: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>
          Campagne :{' '}
          <code className="font-mono text-[11px]">{result.campaign_id}</code>
        </span>
        {dryRun && (
          <Badge
            variant="outline"
            className="text-[10px] h-5 font-mono uppercase tracking-wider"
          >
            Dry-run
          </Badge>
        )}
        <span className="ml-auto tabular-nums">
          {(result.duration_ms / 1000).toFixed(2)}s
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-2">
        <Stat label="Total" value={result.total} />
        <Stat label={dryRun ? 'Renderés' : 'Envoyés'} value={result.sent} tone="success" />
        <Stat label="Ignorés" value={result.skipped} tone="muted" />
        <Stat label="Échecs" value={result.failed} tone={result.failed > 0 ? 'destructive' : 'muted'} />
      </div>
      {result.failures && result.failures.length > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            Voir les détails des échecs ({result.failures.length})
          </summary>
          <ul className="mt-1 space-y-1">
            {result.failures.slice(0, 5).map((f, i) => (
              <li
                key={i}
                className="font-mono text-[11px] text-destructive truncate"
              >
                {f.user_id.substring(0, 8)}…: {f.reason}
              </li>
            ))}
            {result.failures.length > 5 && (
              <li className="text-[11px] text-muted-foreground">
                …et {result.failures.length - 5} autres
              </li>
            )}
          </ul>
        </details>
      )}
    </div>
  );
}

// ============================================================================
// STAT
// ============================================================================

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: 'success' | 'muted' | 'destructive';
}) {
  const toneClass = cn(
    tone === 'success' && 'text-success',
    tone === 'destructive' && 'text-destructive',
    !tone && 'text-foreground',
    tone === 'muted' && 'text-muted-foreground'
  );

  return (
    <div>
      <div className={cn('text-base font-bold tabular-nums', toneClass)}>
        {value.toLocaleString('fr-FR')}
      </div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}
