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
const COUNTRY: Record<string, string> = { FR: 'France', BE: 'Belgique', CH: 'Suisse', CA: 'Canada', SN: 'Sénégal', CI: 'Côte d’Ivoire', MA: 'Maroc', LU: 'Luxembourg', '?': 'Non renseigné' };

function Tile({ label, value, hint }: { label: string; value: string; hint: string }) {
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
          <li key={s.label} className="grid grid-cols-[8.5rem_1fr_auto] items-center gap-3 text-sm sm:grid-cols-[10rem_1fr_9rem]">
            <span className="font-medium text-foreground">{s.label}</span>
            <span className="h-5 rounded-r bg-muted/60" title={`${s.label} : ${s.n}`}>
              <span className="block h-full rounded-r-[4px]" style={{ width: `${Math.max(s.n ? 2 : 0, (s.n / max) * 100)}%`, background: 'var(--series-1)' }} />
            </span>
            <span className="text-right tabular-nums text-foreground">
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
        {weeks.map((w, i) => <span key={w.week}>{i % 2 === 0 ? label(w.week) : ''}</span>)}
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

export function AdminGrowth({ growth }: { growth: GrowthData }) {
  const f = growth.funnel;
  const weekTotal = growth.weekly.reduce((a, w) => a + w.signups, 0);
  return (
    <section aria-labelledby="growth-title" className="viz-root mb-6 space-y-4 sm:mb-8">
      <h2 id="growth-title" className="text-lg font-display font-bold text-foreground sm:text-xl">Croissance</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="Inscriptions (12 sem.)" value={String(weekTotal)} hint={`${f.signed_up} comptes au total`} />
        <Tile label="Vérifient leur e-mail" value={`${pct(f.verified, f.signed_up)} %`} hint={`${growth.unverified_over_7_days} bloqués depuis plus de 7 jours`} />
        <Tile label="Actifs sur 7 jours" value={String(growth.active_users_7_days)} hint="ont ouvert ou modifié un budget" />
        <Tile label="Actifs sur 30 jours" value={String(growth.active_users_30_days)} hint={`${pct(growth.active_users_30_days, f.verified)} % des comptes vérifiés`} />
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
            <table className="w-full text-sm tabular-nums">
              <tbody>
                {growth.locations.map((l) => (
                  <tr key={l.code} className="border-t border-border/60 first:border-0">
                    <td className="py-1.5 text-foreground">{COUNTRY[l.code] ?? l.code}</td>
                    <td className="py-1.5 text-right font-semibold text-foreground">{l.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Campagnes e-mail</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm tabular-nums">
              <thead><tr className="text-left text-xs text-muted-foreground"><th className="pb-1 font-medium">Campagne</th><th className="pb-1 text-right font-medium">Envoyés</th><th className="pb-1 text-right font-medium">Échecs</th><th className="pb-1 text-right font-medium">Date</th></tr></thead>
              <tbody>
                {growth.campaigns.map((c) => (
                  <tr key={c.id} className="border-t border-border/60">
                    <td className="py-1.5 pr-2 text-foreground [overflow-wrap:anywhere]">{c.id}</td>
                    <td className="py-1.5 text-right font-semibold text-foreground">{c.sent}</td>
                    <td className={c.failed ? 'py-1.5 text-right font-semibold text-destructive' : 'py-1.5 text-right text-muted-foreground'}>{c.failed}</td>
                    <td className="py-1.5 pl-2 text-right text-muted-foreground">{c.last_at.slice(5).split('-').reverse().join('/')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
