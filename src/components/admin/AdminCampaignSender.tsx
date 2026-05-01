// src/components/admin/AdminCampaignSender.tsx
// ============================================================================
// 🎯 AdminCampaignSender — UI for POST /admin/campaigns/send
// ============================================================================
// Defensive 3-step UX for an irreversible bulk action:
//
//   1. Form        — campaign ID + skip-sent toggle. Single CTA: "Aperçu".
//   2. Preview     — dry-run results displayed (totals per segment).
//                    User can either reset or click "Envoyer pour de vrai".
//   3. Confirmation — inline alert "X emails will be sent, irreversible".
//                    User must explicitly confirm to actually send.
//
// After real send: success state with counts + audit SQL hint.
//
// All state is local — once the user navigates away or refreshes, the
// dry-run/confirmation state is lost (intentional). Audit lives in the DB.
// ============================================================================

import { useMemo, useState } from 'react';
import {
  Mail,
  Send,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Users,
  UserX,
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
  useAdminCampaigns,
  type CampaignResponse,
  type SegmentResult,
} from '@/hooks/useAdminCampaigns';
import { cn } from '@/lib/utils';

// ============================================================================
// HELPERS
// ============================================================================

function defaultCampaignId(): string {
  const d = new Date();
  return `reengagement_${d.getFullYear()}_${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function totalAcrossSegments(r: CampaignResponse | null): number {
  if (!r) return 0;
  return (r.verified?.total ?? 0) + (r.unverified?.total ?? 0);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AdminCampaignSender() {
  const { toast } = useToast();
  const { loading, error, send, reset } = useAdminCampaigns();

  // ── Form state ─────────────────────────────────────────────────────────
  const [campaignId, setCampaignId] = useState(defaultCampaignId());
  const [skipSent, setSkipSent] = useState(true);

  // ── Workflow state ─────────────────────────────────────────────────────
  const [previewResult, setPreviewResult] = useState<CampaignResponse | null>(null);
  const [sendResult, setSendResult] = useState<CampaignResponse | null>(null);
  const [confirmingReal, setConfirmingReal] = useState(false);

  const totalToSend = useMemo(() => totalAcrossSegments(previewResult), [previewResult]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleDryRun = async () => {
    if (!campaignId.trim()) {
      toast({
        title: 'Identifiant requis',
        description: 'Renseigne un identifiant de campagne.',
        variant: 'destructive',
      });
      return;
    }

    setPreviewResult(null);
    setSendResult(null);
    setConfirmingReal(false);

    const result = await send({
      campaignId: campaignId.trim(),
      auto: true,
      dryRun: true,
      skipSent,
    });

    if (result) {
      setPreviewResult(result);
      const total = totalAcrossSegments(result);
      toast({
        title: 'Aperçu généré',
        description: `${total} destinataires prêts à recevoir l'email.`,
      });
    }
  };

  const handleRealSend = async () => {
    setConfirmingReal(false);

    const result = await send({
      campaignId: campaignId.trim(),
      auto: true,
      dryRun: false,
      skipSent,
    });

    if (result) {
      setSendResult(result);
      const sent =
        (result.verified?.sent ?? 0) + (result.unverified?.sent ?? 0);
      const failed =
        (result.verified?.failed ?? 0) + (result.unverified?.failed ?? 0);

      if (failed > 0) {
        toast({
          title: `${sent} envoyés, ${failed} échecs`,
          description: 'Voir les détails ci-dessous.',
          variant: 'warning',
        });
      } else {
        toast({
          title: `${sent} emails envoyés ✉️`,
          description: 'La campagne s\'est terminée sans erreur.',
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
    reset();
  };

  // ── Layout flags ───────────────────────────────────────────────────────
  const showForm = !sendResult;
  const showPreviewBlock = previewResult && !sendResult && !confirmingReal;
  const showConfirmBlock = previewResult && !sendResult && confirmingReal;
  const showSendResultBlock = !!sendResult;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Card className="border-warning/40">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning">
            <Mail className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="font-display text-lg">
              Campagne de réengagement
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Envoi segmenté aux utilisateurs vérifiés (Variante 1) et non-vérifiés (Variante 3)
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* ── FORM ─────────────────────────────────────────────────────── */}
        {showForm && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-id">Identifiant de campagne</Label>
              <Input
                id="campaign-id"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                placeholder="reengagement_2026_05"
                disabled={loading || !!previewResult}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Identifiant unique. Sert à l'idempotence — relancer le même ID
                ne réenverra pas aux destinataires déjà servis.
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
              <div className="flex-1 mr-3">
                <Label htmlFor="skip-sent" className="cursor-pointer">
                  Skip les déjà envoyés
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Recommandé. Évite les doublons en cas de relance accidentelle.
                </p>
              </div>
              <Switch
                id="skip-sent"
                checked={skipSent}
                onCheckedChange={setSkipSent}
                disabled={loading || !!previewResult}
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

        {/* ── PREVIEW (dry-run results) ────────────────────────────────── */}
        {showPreviewBlock && (
          <div className="space-y-3 rounded-lg border border-success/30 bg-success/5 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-success">
              <Eye className="h-4 w-4" />
              Aperçu généré — aucun email envoyé
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {previewResult!.verified && (
                <SegmentBlock
                  segment={previewResult!.verified}
                  icon={Users}
                  label="Vérifiés"
                />
              )}
              {previewResult!.unverified && (
                <SegmentBlock
                  segment={previewResult!.unverified}
                  icon={UserX}
                  label="Non-vérifiés"
                />
              )}
            </div>
          </div>
        )}

        {/* ── CONFIRMATION ──────────────────────────────────────────────── */}
        {showConfirmBlock && (
          <Alert variant="destructive" className="border-destructive/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="space-y-3">
              <p className="font-medium">
                Vous êtes sur le point d'envoyer{' '}
                <span className="font-bold tabular-nums">{totalToSend} emails réels</span>.
              </p>
              <p className="text-sm opacity-90">
                Cette action est irréversible. Les destinataires recevront les
                emails dans leur boîte dans les secondes qui suivent.
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
                  Oui, envoyer les {totalToSend} emails
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
              Campagne envoyée
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sendResult!.verified && (
                <SegmentBlock
                  segment={sendResult!.verified}
                  icon={Users}
                  label="Vérifiés"
                />
              )}
              {sendResult!.unverified && (
                <SegmentBlock
                  segment={sendResult!.unverified}
                  icon={UserX}
                  label="Non-vérifiés"
                />
              )}
            </div>
            <div className="rounded-md bg-background/60 p-3 text-xs text-muted-foreground">
              Audit SQL :{' '}
              <code className="font-mono text-[11px] break-all">
                SELECT campaign_id, status, COUNT(*) FROM email_campaign_sends
                WHERE campaign_id LIKE '{campaignId}%' GROUP BY 1,2;
              </code>
            </div>
          </div>
        )}

        {/* ── ACTION BUTTONS ───────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 pt-1">
          {!previewResult && !sendResult && (
            <Button
              onClick={handleDryRun}
              disabled={loading || !campaignId.trim()}
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
              Nouvelle campagne
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// SEGMENT BLOCK
// ============================================================================

function SegmentBlock({
  segment,
  icon: Icon,
  label,
}: {
  segment: SegmentResult;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="rounded-lg border bg-background/60 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{label}</span>
        {segment.dry_run && (
          <Badge
            variant="outline"
            className="text-[10px] h-5 font-mono uppercase tracking-wider"
          >
            Dry-run
          </Badge>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-2">
        <Stat label="Total" value={segment.total} />
        <Stat
          label={segment.dry_run ? 'Renderés' : 'Envoyés'}
          value={segment.sent}
          tone="success"
        />
        {segment.skipped > 0 && (
          <Stat label="Ignorés" value={segment.skipped} tone="muted" />
        )}
        {segment.failed > 0 && (
          <Stat label="Échecs" value={segment.failed} tone="destructive" />
        )}
      </div>
      {segment.failures && segment.failures.length > 0 && (
        <details className="mt-2 text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            Voir les détails des échecs ({segment.failures.length})
          </summary>
          <ul className="mt-1 space-y-1">
            {segment.failures.slice(0, 5).map((f, i) => (
              <li key={i} className="font-mono text-[11px] text-destructive truncate">
                {f.user_id.substring(0, 8)}…: {f.reason}
              </li>
            ))}
            {segment.failures.length > 5 && (
              <li className="text-[11px] text-muted-foreground">
                …et {segment.failures.length - 5} autres
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
