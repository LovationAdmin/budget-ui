// src/components/budget/shared/primitives.tsx
// Small building blocks shared by the month / charges / savings / household
// screens: section cards, pills, segmented controls, choice cards, money input.

import { forwardRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { categoryMeta } from '@/lib/budget/categories';

// ---------------------------------------------------------------------------
// Category icon
// ---------------------------------------------------------------------------
export function CategoryIcon({ category, className, tone = 'charge' }: { category?: string; className?: string; tone?: 'charge' | 'muted' }) {
  const meta = categoryMeta(category);
  const Icon = meta.icon;
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
        tone === 'charge' ? 'bg-orange-50 text-orange-700' : 'bg-muted text-muted-foreground',
        className,
      )}
    >
      <Icon className="h-5 w-5" />
    </span>
  );
}

export function IconTile({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span aria-hidden="true" className={cn('inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl [&_svg]:h-5 [&_svg]:w-5', className)}>
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Section card
// ---------------------------------------------------------------------------
export function SectionCard({
  title,
  subtitle,
  amount,
  amountClassName,
  children,
  className,
  id,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  amount?: ReactNode;
  amountClassName?: string;
  children: ReactNode;
  className?: string;
  id?: string;
  action?: ReactNode;
}) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section aria-labelledby={headingId} className={cn('rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-soft', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={headingId} className="font-display text-base sm:text-lg font-bold text-foreground">
            {title}
          </h2>
          {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {action}
          {amount !== undefined && (
            <span className={cn('font-display text-lg sm:text-xl font-extrabold tabular-nums whitespace-nowrap', amountClassName)}>{amount}</span>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-1">{children}</div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Pills & badges
// ---------------------------------------------------------------------------
export type PillTone = 'green' | 'blue' | 'grey' | 'amber' | 'orange' | 'red' | 'indigo';

const PILL_TONES: Record<PillTone, string> = {
  green: 'bg-emerald-50 text-emerald-800',
  blue: 'bg-sky-50 text-sky-800',
  grey: 'bg-stone-100 text-stone-700',
  amber: 'bg-amber-50 text-amber-800',
  orange: 'bg-orange-50 text-orange-800',
  red: 'bg-red-50 text-red-800',
  indigo: 'bg-indigo-50 text-indigo-800',
};

export function Pill({ tone = 'grey', children, className }: { tone?: PillTone; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-full px-2.5 text-xs font-semibold', PILL_TONES[tone], className)}>
      {children}
    </span>
  );
}

export function Badge({ tone = 'grey', children }: { tone?: PillTone; children: ReactNode }) {
  return (
    <span className={cn('inline-flex h-5 items-center whitespace-nowrap rounded-md px-1.5 text-[11px] font-bold', PILL_TONES[tone])}>{children}</span>
  );
}

// ---------------------------------------------------------------------------
// Segmented control
// ---------------------------------------------------------------------------
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  className,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
  label: string;
  className?: string;
}) {
  // Four options or more go 2 × 2: four labels never fit one row in a phone sheet.
  const columns = options.length === 3 ? 'grid-cols-3' : 'grid-cols-2';
  return (
    <div role="group" aria-label={label} className={cn('grid gap-1 rounded-xl bg-muted p-1', columns, className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'min-h-[40px] min-w-0 rounded-lg px-2 py-1.5 text-center text-sm font-semibold leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function ChipToggle({ pressed, onClick, children, className }: { pressed: boolean; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        'inline-flex min-h-[40px] items-center gap-2 rounded-full border px-3.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        pressed ? 'border-foreground bg-foreground text-background' : 'border-border bg-card text-foreground hover:bg-muted',
        className,
      )}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Choice card (scope choices, radio-like options)
// ---------------------------------------------------------------------------
export function ChoiceCard({
  title,
  help,
  onClick,
  selected,
  role,
  icon,
  className,
}: {
  title: ReactNode;
  help?: ReactNode;
  onClick: () => void;
  selected?: boolean;
  role?: 'radio';
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={role === 'radio' ? !!selected : undefined}
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-3 rounded-xl border-[1.5px] px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        selected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/60 hover:bg-primary/5',
        className,
      )}
    >
      {icon && <span className="mt-0.5 text-primary [&_svg]:h-5 [&_svg]:w-5">{icon}</span>}
      <span className="flex flex-col gap-0.5">
        <span className="text-[15px] font-semibold text-foreground">{title}</span>
        {help && <span className="text-sm text-muted-foreground">{help}</span>}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Money input
// ---------------------------------------------------------------------------
export const MoneyInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { suffix?: string; big?: boolean }
>(function MoneyInput({ suffix = '€', big, className, ...props }, ref) {
  return (
    <div className="relative">
      <input
        ref={ref}
        inputMode="decimal"
        autoComplete="off"
        className={cn(
          'flex h-12 w-full rounded-xl border border-input bg-background px-4 pr-12 text-base tabular-nums ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60',
          big && 'h-14 text-xl font-bold',
          className,
        )}
        {...props}
      />
      <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
        {suffix}
      </span>
    </div>
  );
});

export function FieldLabel({ htmlFor, children, hint }: { htmlFor?: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-foreground">
      {children}
      {hint && <span className="ml-1 font-normal text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function ErrorText({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="text-sm font-semibold text-destructive">
      {children}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Row button (list rows that open a panel)
// ---------------------------------------------------------------------------
export function RowButton({ onClick, children, className, ariaLabel, disabled }: { onClick: () => void; children: ReactNode; className?: string; ariaLabel?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className={cn(
        'flex min-h-[60px] w-full items-center gap-3 rounded-xl border border-transparent px-2.5 py-2 text-left transition-colors hover:border-border/70 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function AddRowButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-1 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-border px-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground/30 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:h-4 [&_svg]:w-4"
    >
      {children}
    </button>
  );
}
