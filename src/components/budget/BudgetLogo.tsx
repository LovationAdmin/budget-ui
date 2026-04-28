// src/components/budget/BudgetLogo.tsx
// ============================================================================
// 🎯 BudgetLogo — Distinctive brand mark replacing the generic "B"
// ============================================================================
// Fixes P2 #14. Stylized mark: a piggy-bank silhouette built from coral
// strokes that reads as both "B" (Budget) and a coin-slot. Pure SVG, no
// runtime cost, scales perfectly, accessible.
// ============================================================================

import { cn } from '@/lib/utils';

interface BudgetLogoProps {
  size?: number;
  className?: string;
  /** When true, draws on a gradient pill background (default: true) */
  withBackground?: boolean;
}

export function BudgetLogo({
  size = 36,
  className,
  withBackground = true,
}: BudgetLogoProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center',
        withBackground &&
          'rounded-xl bg-gradient-to-br from-primary to-[hsl(35_90%_65%)] shadow-soft',
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Stylized "B" with a coin slot inside the upper bowl */}
        <path
          d="M5 4h7c2.5 0 4.5 1.7 4.5 4 0 1.5-.7 2.7-1.8 3.4 1.5.6 2.4 2 2.4 3.6 0 2.5-2.1 4.5-5 4.5H5V4Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary-foreground"
        />
        {/* Coin slot */}
        <line
          x1="9"
          y1="8"
          x2="13"
          y2="8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-primary-foreground"
        />
        {/* Subtle coin */}
        <circle
          cx="11"
          cy="14.5"
          r="1.2"
          fill="currentColor"
          className="text-primary-foreground/60"
        />
      </svg>
    </span>
  );
}
