// src/components/budget/BudgetTabBar.tsx
// Bottom tab bar for phones and tablets (the 5 main sections, one thumb away).
// Desktop keeps the navigation in the top bar.

import type { NavItem } from './BudgetNavbar';
import { cn } from '@/lib/utils';

interface BudgetTabBarProps {
  items: NavItem[];
  currentSection: string;
  onSectionChange: (id: string) => void;
}

export function BudgetTabBar({ items, currentSection, onSectionChange }: BudgetTabBarProps) {
  return (
    <nav
      aria-label="Sections du budget"
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto grid max-w-lg" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.id === currentSection;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSectionChange(item.id)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex min-h-[64px] flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <span
                aria-hidden="true"
                className={cn('absolute top-0 h-[3px] w-8 rounded-b-full transition-colors', active ? 'bg-primary' : 'bg-transparent')}
              />
              <Icon className="h-[22px] w-[22px]" aria-hidden="true" />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
