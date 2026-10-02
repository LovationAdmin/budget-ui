// src/components/budget/shared/ResponsiveSheet.tsx
// Side panel on desktop, bottom sheet on phones. Built on Radix Dialog, so it
// traps focus, closes on Escape / outside click and is announced as a dialog.

import type { ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}

export function ResponsiveSheet({ open, onOpenChange, title, description, children }: ResponsiveSheetProps) {
  const isMobile = useIsMobile();
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            'fixed z-50 flex flex-col gap-5 overflow-y-auto overscroll-contain bg-background shadow-floating outline-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:duration-300',
            isMobile
              ? 'inset-x-0 bottom-0 max-h-[92dvh] rounded-t-3xl px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom'
              : 'inset-y-0 right-0 h-full w-full max-w-[460px] rounded-l-3xl border-l p-7 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
          )}
        >
          {isMobile && <div aria-hidden="true" className="mx-auto h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/25" />}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 pt-1">
              <DialogPrimitive.Title className="font-display text-xl font-extrabold leading-tight text-foreground">{title}</DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="mt-1 text-sm text-muted-foreground">{description}</DialogPrimitive.Description>
              ) : (
                <DialogPrimitive.Description className="sr-only">Panneau d’édition</DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
