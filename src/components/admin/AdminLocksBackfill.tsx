// src/components/admin/AdminLocksBackfill.tsx
// ============================================================================
// AdminLocksBackfill — UI for POST /admin/maintenance/backfill-locks
// ============================================================================
// One-shot maintenance task: walk every budget in the DB and apply the
// auto-lock logic (same as the frontend's autoLockPastMonths) so dormant
// budgets converge to the corrected state introduced by the 2026-05-15
// persistence fix.
//
// 3-step UX: dry-run preview → confirm → run.
// ============================================================================

import { useState } from 'react';
import {
  Lock,
  Eye,
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  useAdminLocksBackfill,
  type BackfillResponse,
} from '@/hooks/useAdminLocksBackfill';
import { cn } from '@/lib/utils';

export function AdminLocksBackfill() {
  const { toast } = useToast();
  const { loading, error, run, reset } = useAdminLocksBackfill();

  const [previewResult, setPreviewResult] = useState<BackfillResponse | null>(null);
  const [runResult, setRunResult] = useState<BackfillResponse | null>(null);
  const [confirmingReal, setConfirmingReal] = useState(false);

  const handleDryRun = async () => {
    setPreviewResult(null);
    setRunResult(null);
    setConfirmingReal(false);

    const result = await run({ dryRun: true });
    if (result) {
      setPreviewResult(result);
      toast({
        title: 'Aperçu généré',
        description: `${result.modified} budgets seraient mis à jour sur ${result.total_scanned}.`,
      });
    }
  };

  const handleRealRun = async () => {
    setConfirmingReal(false);
    const result = await run({ dryRun: false });
    if (result) {
      setRunResult(result);
      if (result.failed > 0) {
        toast({
          title: `${result.modified} mis à jour, ${result.failed} échecs`,
          description: 'Voir les détails ci-dessous.',
          variant: 'warning',
        });
      } else {
        toast({
          title: `${result.modified} budgets mis à jour ✅`,
          description: 'Le backfill des verrouillages s\'est terminé sans erreur.',
          variant: 'success',
        });
      }
    }
  };

  const handleReset = () => {
    setPreviewResult(null);
    setRunResult(null);
    setConfirmingReal(false);
    reset();
  };

  const showForm = !previewResult && !runResult;
  const showPreviewBlock = previewResult && !runResult && !confirmingReal;
  const showConfirmBlock = previewResult && !runResult && confirmingReal;
  const showRunResultBlock = !!runResult;

  return (
    <Card className="border-warning/40">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning">
            <Lock className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="font-display text-lg">
              Backfill auto-lock des mois passés
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Applique le verrouillage automatique des mois passés à tous les budgets
              existants (rattrapage du bug de persistance corrigé le 2026-05-15).
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {showForm && (
          <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            <p>
              Cette opération est <strong className="text-foreground">idempotente</strong> :
              les budgets dont les mois passés sont déjà verrouillés ne sont pas touchés.
              Les choix explicites d'utilisateurs (mois manuellement déverrouillé) sont préservés.
            </p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {showPreviewBlock && previewResult && (
          <div className="space-y-3 rounded-lg border border-success/30 bg-success/5 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-success">
              <Eye className="h-4 w-4" />
              Aperçu généré — aucune écriture en base
            </div>
            <ResultBlock result={previewResult} />
          </div>
        )}

        {showConfirmBlock && previewResult && (
          <Alert variant="destructive" className="border-destructive/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="space-y-3">
              <p className="font-medium">
                Tu vas modifier{' '}
                <span className="font-bold tabular-nums">{previewResult.modified} budgets</span> en base.
              </p>
              <p className="text-sm opacity-90">
                Cette action est irréversible. Les utilisateurs concernés verront leurs
                mois passés verrouillés au prochain chargement.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => setConfirmingReal(false)} disabled={loading}>
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRealRun}
                  disabled={loading}
                  className="gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Oui, exécuter sur {previewResult.modified} budgets
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {showRunResultBlock && runResult && (
          <div className="space-y-3 rounded-lg border border-success/30 bg-success/5 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-success">
              <CheckCircle2 className="h-4 w-4" />
              Backfill terminé
            </div>
            <ResultBlock result={runResult} />
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {showForm && (
            <Button onClick={handleDryRun} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              Générer l'aperçu (dry-run)
            </Button>
          )}

          {showPreviewBlock && (
            <>
              <Button variant="outline" onClick={handleReset} disabled={loading} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Réinitialiser
              </Button>
              <Button
                onClick={() => setConfirmingReal(true)}
                disabled={loading || (previewResult?.modified ?? 0) === 0}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Exécuter pour de vrai
              </Button>
            </>
          )}

          {showRunResultBlock && (
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Nouveau backfill
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ResultBlock({ result }: { result: BackfillResponse }) {
  return (
    <div className="rounded-lg border bg-background/60 p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium">Résultats</span>
        {result.dry_run && (
          <Badge variant="outline" className="text-[10px] h-5 font-mono uppercase tracking-wider">
            Dry-run
          </Badge>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-2">
        <Stat label="Scannés" value={result.total_scanned} />
        <Stat label="Modifiés" value={result.modified} tone="success" />
        <Stat label="Inchangés" value={result.unchanged} tone="muted" />
        {result.skipped > 0 && <Stat label="Skippés" value={result.skipped} tone="muted" />}
        {result.failed > 0 && <Stat label="Échecs" value={result.failed} tone="destructive" />}
      </div>
      <div className="mt-2 text-[11px] text-muted-foreground">
        Durée : {(result.duration_ms / 1000).toFixed(1)}s
      </div>
      {result.failures && result.failures.length > 0 && (
        <details className="mt-2 text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            Voir les détails des échecs ({result.failures.length})
          </summary>
          <ul className="mt-1 space-y-1">
            {result.failures.slice(0, 5).map((f, i) => (
              <li key={i} className="font-mono text-[11px] text-destructive truncate">
                {f.budget_id.substring(0, 8)}…: {f.reason}
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
    tone === 'muted' && 'text-muted-foreground',
  );

  return (
    <div>
      <div className={cn('text-base font-bold tabular-nums', toneClass)}>
        {value.toLocaleString('fr-FR')}
      </div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
    </div>
  );
}
