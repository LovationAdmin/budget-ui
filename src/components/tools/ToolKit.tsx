// src/components/tools/ToolKit.tsx
// ============================================================================
// Building blocks shared by the free calculators (/calcul-reste-a-vivre,
// /budget-personnel, /budget-colocation, /budget-mariage): numbered panels,
// steppers, amount inputs, result tiles, the sign-up card and the FAQ list.
// Same look everywhere, 44 px touch targets, labels tied to their inputs.
// ============================================================================

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FaqItem } from '@/seo/faq';

export function Stepper({ label, hint, value, min, max = 12, onChange }: {
  label: string; hint?: string; value: number; min: number; max?: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <p className="font-medium text-foreground">{label}</p>
        {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Retirer : ${label}`}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background text-foreground transition hover:bg-muted disabled:opacity-40"
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
        <output className="w-8 text-center text-lg font-semibold tabular-nums text-foreground" aria-live="polite">{value}</output>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Ajouter : ${label}`}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background text-foreground transition hover:bg-muted disabled:opacity-40"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/** Amount field: free typing (spaces, comma or dot), parsed by the caller with parseAmount. */
export function MoneyInput({ id, label, hint, value, onChange, suffix = '€/mois', placeholder = '0' }: {
  id: string; label: ReactNode; hint?: string; value: string; onChange: (v: string) => void; suffix?: string; placeholder?: string;
}) {
  return (
    <div className="py-2">
      <label htmlFor={id} className="block font-medium text-foreground">{label}</label>
      {hint && <p id={`${id}-hint`} className="text-sm text-muted-foreground">{hint}</p>}
      <div className="relative mt-1.5">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder={placeholder}
          value={value}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(e) => onChange(e.target.value.replace(/[^\d\s,.]/g, ''))}
          className="h-12 w-full rounded-xl border border-input bg-background pl-4 pr-20 text-right text-lg tabular-nums text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
        />
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-muted-foreground">{suffix}</span>
      </div>
    </div>
  );
}

export function Panel({ title, step, children, aside }: { title: string; step: number; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6" aria-labelledby={`step-${step}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 id={`step-${step}`} className="flex items-center gap-3 font-display text-xl font-bold text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground" aria-hidden="true">{step}</span>
          {title}
        </h2>
        {aside}
      </div>
      <div className="mt-3 divide-y divide-border/60">{children}</div>
    </section>
  );
}

export function Tile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-xl bg-muted/60 p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums text-foreground">{value}</p>
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

/** Choice between a few options, as a row of 44 px radio buttons. */
export function Segmented<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: Array<{ value: T; label: string; hint?: string }>; onChange: (v: T) => void;
}) {
  return (
    <fieldset className="py-2">
      <legend className="font-medium text-foreground">{label}</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {options.map((o) => (
          <label
            key={o.value}
            className={`flex min-h-[44px] cursor-pointer flex-col justify-center rounded-xl border px-3 py-2 text-sm transition ${value === o.value ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-background text-muted-foreground hover:bg-muted'}`}
          >
            <input type="radio" className="sr-only" name={label} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
            <span className="font-semibold text-foreground">{o.label}</span>
            {o.hint && <span className="text-xs">{o.hint}</span>}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Dark call-to-action card shown under a calculator result. */
export function SignupCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-6 rounded-xl bg-gradient-to-br from-slate-900 to-sky-900 p-4 text-white">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-slate-200">{text}</p>
      <Button asChild size="lg" variant="secondary" className="mt-3 h-12 w-full bg-white text-slate-900 hover:bg-slate-100">
        <Link to="/signup">Créer mon budget gratuit <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
      </Button>
    </div>
  );
}

export function FaqList({ id, items }: { id: string; items: FaqItem[] }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id}>Questions fréquentes</h2>
      <dl className="mt-6 space-y-6">
        {items.map((f) => (
          <div key={f.q}>
            <dt className="font-semibold text-foreground">{f.q}</dt>
            <dd className="mt-2">{f.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Long-form content under a calculator (h2 styles shared by every tool page). */
export function ToolArticle({ children }: { children: ReactNode }) {
  return (
    <article className="bg-card px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-12 text-muted-foreground [&_h2]:font-display [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-foreground [&_strong]:text-foreground">
        {children}
      </div>
    </article>
  );
}
