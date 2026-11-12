// src/components/es/SpanishLayout.tsx
// ============================================================================
// Links between the Spanish calculators (ES_TOOLS), at the end of each one.
// The header and footer are the site's own Navbar and Footer, in Spanish.
// ============================================================================

import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ES_TOOLS } from '@/i18n/es/tools';

/** « Otras calculadoras gratuitas »: the Spanish pages other than the current one. */
export function SpanishToolLinks({ current }: { current: string }) {
  return (
    <section>
      <h2 className="!text-2xl">Otras calculadoras gratuitas</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {ES_TOOLS.filter((tool) => tool.path !== current).map((tool) => (
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
      <p className="mt-4">
        ¿Prefieres una hoja de cálculo? Descarga la{' '}
        <Link to="/es/plantilla-presupuesto-familiar" className="font-medium text-primary hover:underline">plantilla de presupuesto familiar gratuita</Link>{' '}
        (Excel y PDF para imprimir).
      </p>
    </section>
  );
}
