// src/components/budget/SaveStatusIndicator.tsx
// ============================================================================
// 🎯 SaveStatusIndicator — Discreet save state UI
// ============================================================================
// Fixes P0 #3. Bottom-right floating indicator. Inspired by Notion/Figma.
// - idle:    nothing rendered
// - pending: "Modifications en attente…" (subtle gray)
// - saving:  spinner + "Enregistrement…"
// - saved:   green check + "Enregistré" (auto-dismisses)
// - error:   red alert + Retry button
// ============================================================================

import { Loader2, Check, AlertCircle, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SaveStatus } from '@/hooks/useSaveStatus';

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  errorMessage?: string | null;
  lastSavedAt?: Date | null;
  onRetry?: () => void;
  className?: string;
}

function formatRelativeTime(date: Date | null): string {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return 'à l’instant';
  if (seconds < 60) return `il y a ${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  return `il y a ${hours}h`;
}

export function SaveStatusIndicator({
  status,
  errorMessage,
  lastSavedAt,
  onRetry,
  className,
}: SaveStatusIndicatorProps) {
  if (status === 'idle') return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full px-4 py-2 text-sm shadow-elevated backdrop-blur-md transition-all duration-300',
        'border border-border/60',
        status === 'pending' && 'bg-background/90 text-muted-foreground',
        status === 'saving' && 'bg-background/90 text-foreground',
        status === 'saved' &&
          'bg-success/10 text-success border-success/30 animate-in fade-in slide-in-from-bottom-2',
        status === 'error' &&
          'bg-destructive/10 text-destructive border-destructive/40',
        className
      )}
    >
      {status === 'pending' && (
        <>
          <CloudOff className="h-3.5 w-3.5" aria-hidden />
          <span>Modifications en attente</span>
        </>
      )}

      {status === 'saving' && (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          <span>Enregistrement…</span>
        </>
      )}

      {status === 'saved' && (
        <>
          <Check className="h-3.5 w-3.5" aria-hidden />
          <span>
            Enregistré{lastSavedAt ? ` ${formatRelativeTime(lastSavedAt)}` : ''}
          </span>
        </>
      )}

      {status === 'error' && (
        <>
          <AlertCircle className="h-3.5 w-3.5" aria-hidden />
          <span>{errorMessage ?? 'Échec de la sauvegarde'}</span>
          {onRetry && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onRetry}
              className="h-auto px-2 py-0.5 text-xs text-destructive hover:bg-destructive/20"
            >
              Réessayer
            </Button>
          )}
        </>
      )}
    </div>
  );
}
