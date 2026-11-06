// src/components/budget/BudgetSkeletons.tsx
// ============================================================================
// Placeholders shaped like the budget screens, shown while their data or code
// loads: the page keeps its layout, so nothing jumps when the content lands.
// ============================================================================

import { Skeleton } from '@/components/ui/skeleton';

function CardRows({ rows }: { rows: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Same grid as MonthTab: month header, then the cards and the summary aside. */
export function MonthSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="order-2 flex min-w-0 flex-col gap-5 lg:order-1">
          <CardRows rows={2} />
          <CardRows rows={4} />
          <CardRows rows={2} />
        </div>
        <div className="order-1 flex min-w-0 flex-col gap-5 lg:order-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-9 w-40" />
            <Skeleton className="mt-5 h-2.5 w-full rounded-full" />
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          </div>
        </div>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

/** Generic tab placeholder (a header and two cards). */
export function TabSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-5">
      <Skeleton className="h-8 w-56" />
      <CardRows rows={3} />
      <CardRows rows={3} />
      <span className="sr-only">{label}</span>
    </div>
  );
}
