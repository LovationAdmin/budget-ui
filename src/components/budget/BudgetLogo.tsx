// src/components/budget/BudgetLogo.tsx
// ============================================================================
// 🎯 BudgetLogo — official Budget Famille mark « Sous le même toit »
// ============================================================================
// A roof over the household budget, shared in three parts. Same drawing as
// public/brand/budget-famille-icone.svg (source of the favicons, PWA icons and
// social profile pictures). Pure SVG, no request, scales perfectly.
// ============================================================================

import { useId } from 'react';
import { cn } from '@/lib/utils';

interface BudgetLogoProps {
  size?: number;
  className?: string;
  /** When true, draws on the blue rounded tile (default: true) */
  withBackground?: boolean;
}

export function BudgetLogo({
  size = 36,
  className,
  withBackground = true,
}: BudgetLogoProps) {
  // useId() returns ":r0:"-style ids; colons are unsafe inside url(#…).
  const id = `bf${useId().replace(/:/g, '')}`;
  const ink = withBackground ? '#fff' : 'hsl(var(--primary))';

  return (
    <svg
      width={size}
      height={size}
      viewBox={withBackground ? '0 0 1024 1024' : '180 174 664 682'}
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', withBackground && 'shadow-soft rounded-[22.5%]', className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1B8BC2" />
          <stop offset="1" stopColor="#1A5FA6" />
        </linearGradient>
        {/* Gaps between the three shares are cut out, so the tile shows through. */}
        <mask id={`${id}m`} maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024">
          <rect width="1024" height="1024" fill="#fff" />
          <g stroke="#000" strokeWidth="24" strokeLinecap="round">
            <line x1="512" y1="650" x2="512" y2="438" />
            <line x1="512" y1="650" x2="422.4" y2="842.1" />
            <line x1="512" y1="650" x2="319.9" y2="560.4" />
          </g>
        </mask>
      </defs>
      {withBackground && <rect width="1024" height="1024" rx="230" fill={`url(#${id}g)`} />}
      <path
        d="M228 452 L512 222 L796 452"
        fill="none"
        stroke={ink}
        strokeWidth="88"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g mask={`url(#${id}m)`}>
        <path d="M512 650 L512 450 A200 200 0 1 1 427.5 831.3 Z" fill={ink} />
        <path d="M512 650 L427.5 831.3 A200 200 0 0 1 330.7 565.5 Z" fill="#F97316" />
        <path d="M512 650 L330.7 565.5 A200 200 0 0 1 512 450 Z" fill="#8FD0EE" />
      </g>
    </svg>
  );
}
