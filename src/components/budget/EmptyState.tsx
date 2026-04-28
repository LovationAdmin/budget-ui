// src/components/budget/EmptyState.tsx
// ============================================================================
// 🎯 EmptyState — Standardized + backward-compatible
// ============================================================================
// Fixes P2 #17. Supports BOTH the new `action` ReactNode prop AND the legacy
// `actionLabel` + `onAction` pattern used in Dashboard.tsx etc.
// ============================================================================

import { type LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;

  // ✅ NEW API — pass any element
  action?: ReactNode;

  // ♻️ LEGACY API — still works (Dashboard.tsx uses this)
  actionLabel?: string;
  onAction?: () => void;

  variant?: 'default' | 'subtle';
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  variant = 'default',
  className,
}: EmptyStateProps) {
  // Resolve which action to render — prefer the new `action` prop if given
  const renderedAction =
    action ??
    (actionLabel && onAction ? (
      <Button onClick={onAction} className="gap-2">
        {actionLabel}
      </Button>
    ) : null);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-6',
        variant === 'default'
          ? 'py-12 rounded-2xl border-2 border-dashed border-border/60 bg-muted/30'
          : 'py-8',
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
        <Icon className="h-7 w-7" aria-hidden />
      </div>
      <h3 className="font-display font-semibold text-lg text-foreground mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          {description}
        </p>
      )}
      {renderedAction && <div className="mt-2">{renderedAction}</div>}
    </div>
  );
}
