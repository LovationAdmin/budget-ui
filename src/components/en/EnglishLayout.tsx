// src/components/en/EnglishLayout.tsx
// ============================================================================
// Links between the English calculators (EN_TOOLS), at the end of each one.
// The header and footer are the site's own Navbar and Footer, in English.
// ============================================================================

import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { EN_TOOLS } from '@/i18n/en/tools';

/** « Other free calculators »: the English pages other than the current one. */
export function EnglishToolLinks({ current }: { current: string }) {
  return (
    <section>
      <h2 className="!text-2xl">Other free calculators</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {EN_TOOLS.filter((tool) => tool.path !== current).map((tool) => (
          <li key={tool.path}>
            <Link to={tool.path} className="flex min-h-[44px] items-start justify-between gap-3 rounded-xl border border-border/70 p-4 transition hover:bg-muted">
              <span>
                <span className="block font-semibold text-foreground">{tool.label}</span>
                <span className="block text-sm">{tool.text}</span>
              </span>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
