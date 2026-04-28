// src/hooks/useDeleteConfirm.ts
// ============================================================================
// 🎯 useDeleteConfirm — Replace native confirm() with AlertDialog
// ============================================================================
// Fixes P1 #11: native confirm() is ugly on iOS Safari and inconsistent
// across platforms. This hook gives you a Promise-based API.
//
// Usage:
//   const { confirm, dialog } = useDeleteConfirm();
//
//   const handleDelete = async (item) => {
//     const ok = await confirm({
//       title: `Supprimer "${item.label}" ?`,
//       description: 'Cette action est irréversible.',
//     });
//     if (ok) actuallyDelete(item);
//   };
//
//   return <>{dialog}<Button onClick={() => handleDelete(...)} />Supprimer</Button></>;
// ============================================================================

import { useState, useCallback, useRef, ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

interface UseDeleteConfirmReturn {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  dialog: ReactNode;
}

export function useDeleteConfirm(): UseDeleteConfirmReturn {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleResolve = useCallback((value: boolean) => {
    setOpen(false);
    if (resolverRef.current) {
      resolverRef.current(value);
      resolverRef.current = null;
    }
  }, []);

  const dialog = (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleResolve(false);
      }}
    >
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{options?.title ?? 'Confirmer'}</AlertDialogTitle>
          {options?.description && (
            <AlertDialogDescription>{options.description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => handleResolve(false)}>
            {options?.cancelLabel ?? 'Annuler'}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => handleResolve(true)}
            className={
              options?.destructive !== false
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : undefined
            }
          >
            {options?.confirmLabel ?? 'Supprimer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { confirm, dialog };
}
