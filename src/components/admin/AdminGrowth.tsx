// src/components/admin/AdminGrowth.tsx
// ============================================================================
// « Croissance » — where people come from and where they drop off: KPI tiles,
// the signup funnel, 12 weeks of signups (verified / not yet), budgets per
// country and email campaign results. Plain HTML marks, theme-aware colors
// (.viz-root variables), a table behind every chart for screen readers.
// ============================================================================

import type { GrowthData } from '@/hooks/useAdminStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);
export const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? 's' : ''}`;

// Any ISO code → its French name (GB → Royaume-Uni); unknown codes as is.
const regionNames = (() => {
  try { return new Intl.DisplayNames(['fr'], { type: 'region' }); } catch { return null; }
})();
function countryName(code: string): string {
  if (code === '?') return 'Non renseigné';
  try { return regionNames?.of(code === 'UK' ? 'GB' : code) ?? code; } catch { return code; }
}

// Campaign ids are snake_case, often with a month: "monthly_recap_2026_09"
// reads "Récap mensuel · sept. 2026". The raw id stays in the tooltip.
const CAMPAIGN: Record<string, string> = {
  unverified_deletion_warning: 'Avertissement avant suppression',
  unverified_reminder: 'Rappel de vérification',
  reengagement: 'Relance',
  monthly_recap: 'Récap mensuel',
  whatsnew: 'Nouveautés',
};
function campaignName(id: string): string {
  const m = /^(.+?)_(\d{4})_(\d{2})$/.exec(id);
  const base = m ? m[1] : id;
  const raw = base.replace(/_/g, ' ');
  const name = CAMPAIGN[base] ?? raw.charAt(0).toUpperCase() + raw.slice(1);
  if (!m) return name;
  return `${name} · ${new Date(+m[2], +m[3] - 1).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}`;
}

export function Tile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-foreground">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Funnel({ f }: { f: GrowthData['funnel'] }) {
  const steps = [
    { label: 'Inscrits', n: f.signed_up },
    { label: 'E-mail vérifié', n: f.verified },
    { label: 'Ont un budget', n: f.with_budget },
    { label: 'Actifs (30 j)', n: f.active_30_days },
    { label: 'Budget à plusieurs', n: f.collaborating },
  ];
  const max = Math.max(1, f.signed_up);
  return (
    <ol className="space-y-3" aria-label="Entonnoir d’inscription">
      {steps.map((s, i) => {
        const prev = i ? steps[i - 1].n : s.n;
        return (
          // Phone: label and figures on one line, the bar below at full width, so
          // every bar has the same track. From sm: label | bar | figures.
          <li key={s.label} className="grid grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-1.5 text-sm sm:grid-cols-[10rem_1fr_9rem] sm:items-center">
            <span className="font-medium text-foreground">{s.label}</span>
            <span className="col-span-2 row-start-2 h-5 rounded-r bg-muted/60 sm:col-span-1 sm:col-start-2 sm:row-start-1" title={`${s.label} : ${s.n}`}>
              <span className="block h-full rounded-r-[4px]" style={{ width: `${Math.max(s.n ? 2 : 0, (s.n / max) * 100)}%`, background: 'var(--series-1)' }} />
            </span>
            <span className="text-right tabular-nums text-foreground sm:col-start-3 sm:row-start-1">
              <strong>{s.n}</strong>
              {i > 0 && <span className="ml-1.5 text-xs text-muted-foreground">{pct(s.n, prev)} % de l’étape</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function WeeklySignups({ weeks }: { weeks: GrowthData['weekly'] }) {
  const max = Math.max(1, ...weeks.map((w) => w.signups));
  const H = 120;
  const label = (iso: string) => {
    const [, m, d] = iso.split('-');
    return `${d}/${m}`;
  };
  return (
    <figure>
      <div className="mb-3 flex flex-wrap gap-4 text-xs text-muted-foreground" aria-hidden="true">
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: 'var(--series-1)' }} />E-mail vérifié</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: 'var(--series-2)' }} />Pas encore vérifié</span>
      </div>
      <div className="grid grid-cols-12 items-end gap-1 border-b border-border" style={{ height: H + 22 }} aria-hidden="true">
        {weeks.map((w) => {
          const notVerified = w.signups - w.verified;
          return (
            <div key={w.week} className="group relative flex h-full flex-col items-center justify-end">
              {w.signups > 0 && <span className="mb-1 text-[11px] font-semibold tabular-nums text-foreground">{w.signups}</span>}
              <span className="flex w-3/5 max-w-[22px] flex-col gap-[2px]">
                {notVerified > 0 && <span className="block rounded-t-[4px]" style={{ height: (notVerified / max) * H, background: 'var(--series-2)' }} />}
                {w.verified > 0 && <span className={notVerified > 0 ? 'block' : 'block rounded-t-[4px]'} style={{ height: (w.verified / max) * H, background: 'var(--series-1)' }} />}
              </span>
              <span className="pointer-events-none absolute bottom-full z-10 mb-1 hidden w-36 rounded-lg border border-border bg-popover p-2 text-xs shadow-elevated group-hover:block">
                <span className="block font-semibold text-foreground">Semaine du {label(w.week)}</span>
                <span className="block text-muted-foreground">{w.signups} inscrit(s), dont {w.verified} vérifié(s)</span>
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-1 grid grid-cols-12 gap-1 text-center text-[10px] text-muted-foreground" aria-hidden="true">
        {/* Every other week, counted back from the current one so it is labelled. */}
        {weeks.map((w, i) => <span key={w.week}>{(weeks.length - 1 - i) % 2 === 0 ? label(w.week) : ''}</span>)}
      </div>
      <table className="sr-only">
        <caption>Inscriptions par semaine</caption>
        <thead><tr><th>Semaine du</th><th>Inscrits</th><th>Vérifiés</th></tr></thead>
        <tbody>{weeks.map((w) => <tr key={w.week}><td>{w.week}</td><td>{w.signups}</td><td>{w.verified}</td></tr>)}</tbody>
      </table>
      <figcaption className="mt-2 text-xs text-muted-foreground">Les 12 dernières semaines, par semaine d’inscription.</figcaption>
    </figure>
  );
}

export function AdminGrowth({ growth, newLast24h = 0 }: { growth: GrowthData; newLast24h?: number }) {
  const f = growth.funnel;
  const weekTotal = growth.weekly.reduce((a, w) => a + w.signups, 0);
  return (
    <section aria-labelledby="growth-title" className="viz-root mb-6 space-y-4 sm:mb-8">
      <h2 id="growth-title" className="text-lg font-display font-bold text-foreground sm:text-xl">Croissance</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="Inscriptions (12 sem.)" value={String(weekTotal)} hint={`${f.signed_up} comptes au total${newLast24h > 0 ? `, dont ${newLast24h} en 24 h` : ''}`} />
        <Tile label="Vérifient leur e-mail" value={`${pct(f.verified, f.signed_up)} %`} hint={`${growth.unverified_over_7_days} bloqués depuis plus de 7 jours`} />
        {/* Same definition as the funnel: has a budget and opened the app. */}
        <Tile label="Actifs sur 7 jours" value={String(growth.active_users_7_days)} hint="ont un budget et ont ouvert l’app" />
        <Tile label="Actifs sur 30 jours" value={String(growth.active_users_30_days)} hint={`${pct(growth.active_users_30_days, f.with_budget)} % de ceux qui ont un budget`} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Entonnoir d’inscription</CardTitle></CardHeader>
          <CardContent><Funnel f={f} /></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Inscriptions par semaine</CardTitle></CardHeader>
          <CardContent><WeeklySignups weeks={growth.weekly} /></CardContent>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Budgets par pays</CardTitle></CardHeader>
          <CardContent>
            {growth.locations.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun budget pour l’instant.</p>
            ) : (
              <table className="w-full text-sm tabular-nums">
                <tbody>
                  {growth.locations.map((l) => (
                    <tr key={l.code} className="border-t border-border/60 first:border-0">
                      <td className="py-1.5 text-foreground">{countryName(l.code)}</td>
                      <td className="py-1.5 text-right font-semibold text-foreground">{l.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Campagnes e-mail</CardTitle></CardHeader>
          <CardContent>
            {/* A list, not a 4-column table: on a phone the name gets the full
                width and the figures sit under it, nothing breaks mid-word. */}
            {growth.campaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune campagne envoyée.</p>
            ) : (
              <ul className="text-sm">
                {growth.campaigns.map((c) => (
                  <li key={c.id} className="flex items-baseline justify-between gap-3 border-t border-border/60 py-2 first:border-0 first:pt-0">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground" title={c.id}>{campaignName(c.id)}</p>
                      <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                        {plural(c.sent, 'envoyé')}
                        {c.failed > 0 && <span className="font-semibold text-destructive"> · {plural(c.failed, 'échec')}</span>}
                      </p>
                    </div>
                    <time dateTime={c.last_at} className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {c.last_at.slice(5).split('-').reverse().join('/')}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
