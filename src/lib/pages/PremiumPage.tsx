// src/lib/pages/PremiumPage.tsx
// ============================================================================
// Budget Famille Premium — coming soon. No price is announced and nothing can
// be bought yet: the page explains what Premium will do (bank sync, planned vs
// real, automatic matching) and lets visitors try it on fictitious data.
// The demo never contacts a bank. Payment (Stripe) is to be wired at launch.
// ============================================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Building2, CheckCircle2, Crown, Link2, Loader2, Play, RotateCcw, ShieldCheck, Sparkles, TrendingUp,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { SocialLinks } from '@/components/SocialLinks';
import { money } from '@/lib/budget/format';
import type { FaqItem } from '@/seo/faq';

// ---------------------------------------------------------------------------
// Demo data: fictitious budgets and bank lines, one set per situation.
// ---------------------------------------------------------------------------

type ScenarioId = 'seul' | 'couple' | 'coloc';
interface Line { id: string; label: string; planned: number }
interface Tx { id: string; wording: string; amount: number; line: string | null }
interface Scenario { label: string; lines: Line[]; txs: Tx[] }

const SCENARIOS: Record<ScenarioId, Scenario> = {
  seul: {
    label: 'Seul',
    lines: [
      { id: 'loyer', label: 'Loyer', planned: 650 },
      { id: 'energie', label: 'Énergie', planned: 55 },
      { id: 'box', label: 'Internet et mobile', planned: 35 },
      { id: 'transport', label: 'Transport', planned: 75 },
      { id: 'courses', label: 'Courses', planned: 280 },
      { id: 'loisirs', label: 'Loisirs', planned: 80 },
    ],
    txs: [
      { id: 's1', wording: 'VIR LOYER AGENCE', amount: 650, line: 'loyer' },
      { id: 's2', wording: 'PRLV FOURNISSEUR ENERGIE', amount: 58.4, line: 'energie' },
      { id: 's3', wording: 'PRLV OPERATEUR BOX MOBILE', amount: 34.98, line: 'box' },
      { id: 's4', wording: 'PASS TRANSPORT MENSUEL', amount: 75, line: 'transport' },
      { id: 's5', wording: 'CB SUPERMARCHE', amount: 62.15, line: 'courses' },
      { id: 's6', wording: 'CB SUPERMARCHE', amount: 71.3, line: 'courses' },
      { id: 's7', wording: 'CB MARCHE', amount: 23.6, line: 'courses' },
      { id: 's8', wording: 'CB SUPERMARCHE', amount: 66.75, line: 'courses' },
      { id: 's9', wording: 'CB SUPERMARCHE', amount: 80.4, line: 'courses' },
      { id: 's10', wording: 'CB CINEMA', amount: 12.5, line: null },
      { id: 's11', wording: 'CB LIBRAIRIE', amount: 18.9, line: null },
    ],
  },
  couple: {
    label: 'En couple',
    lines: [
      { id: 'credit', label: 'Crédit immobilier', planned: 980 },
      { id: 'energie', label: 'Énergie', planned: 120 },
      { id: 'box', label: 'Internet et mobiles', planned: 60 },
      { id: 'assurances', label: 'Assurances', planned: 85 },
      { id: 'courses', label: 'Courses', planned: 520 },
      { id: 'carburant', label: 'Carburant', planned: 140 },
    ],
    txs: [
      { id: 'c1', wording: 'PRLV ECHEANCE PRET', amount: 980, line: 'credit' },
      { id: 'c2', wording: 'PRLV FOURNISSEUR ENERGIE', amount: 126.3, line: 'energie' },
      { id: 'c3', wording: 'PRLV OPERATEUR BOX', amount: 29.99, line: 'box' },
      { id: 'c4', wording: 'PRLV OPERATEUR MOBILES', amount: 29.98, line: 'box' },
      { id: 'c5', wording: 'PRLV ASSURANCE HABITATION AUTO', amount: 85, line: 'assurances' },
      { id: 'c6', wording: 'CB HYPERMARCHE', amount: 148.2, line: 'courses' },
      { id: 'c7', wording: 'CB HYPERMARCHE', amount: 163.45, line: 'courses' },
      { id: 'c8', wording: 'CB BOULANGERIE', amount: 31.2, line: 'courses' },
      { id: 'c9', wording: 'CB HYPERMARCHE', amount: 171.9, line: 'courses' },
      { id: 'c10', wording: 'CB STATION SERVICE', amount: 72.4, line: 'carburant' },
      { id: 'c11', wording: 'CB STATION SERVICE', amount: 65.1, line: 'carburant' },
      { id: 'c12', wording: 'CB RESTAURANT', amount: 54, line: null },
    ],
  },
  coloc: {
    label: 'En coloc',
    lines: [
      { id: 'loyer', label: 'Loyer', planned: 1350 },
      { id: 'energie', label: 'Énergie', planned: 90 },
      { id: 'box', label: 'Internet', planned: 30 },
      { id: 'assurance', label: 'Assurance habitation', planned: 18 },
      { id: 'courses', label: 'Courses communes', planned: 240 },
    ],
    txs: [
      { id: 'k1', wording: 'VIR LOYER PROPRIETAIRE', amount: 1350, line: 'loyer' },
      { id: 'k2', wording: 'PRLV FOURNISSEUR ENERGIE', amount: 97.2, line: 'energie' },
      { id: 'k3', wording: 'PRLV OPERATEUR BOX', amount: 29.99, line: 'box' },
      { id: 'k4', wording: 'PRLV ASSURANCE HABITATION', amount: 18, line: 'assurance' },
      { id: 'k5', wording: 'CB SUPERMARCHE', amount: 86.4, line: 'courses' },
      { id: 'k6', wording: 'CB SUPERMARCHE', amount: 92.15, line: 'courses' },
      { id: 'k7', wording: 'CB DROGUERIE', amount: 24.8, line: null },
    ],
  },
};

const FAQ: FaqItem[] = [
  { q: 'Quand Premium sera-t-il disponible ?', a: 'Bientôt. Le lancement sera annoncé sur le site et sur nos réseaux sociaux. En attendant, tout Budget Famille fonctionne sans connexion bancaire.' },
  { q: 'Combien coûtera Premium ?', a: 'Le prix sera annoncé au lancement. Les budgets, les membres, les charges, l’épargne, les projets et le Budget IA sont gratuits dès aujourd’hui et ne demandent aucune connexion bancaire.' },
  { q: 'Mes identifiants bancaires passeront-ils par Budget Famille ?', a: 'Non. La connexion passera par un prestataire agréé, dans le cadre de la directive européenne DSP2 : vous vous identifiez sur le site de votre banque, et Budget Famille ne reçoit qu’un accès en lecture à vos opérations.' },
  { q: 'Faudra-t-il tout recatégoriser chaque mois ?', a: 'Non. Vous rattachez une opération à une charge une seule fois ; ensuite, les opérations semblables suivent toutes seules. C’est ce que montre la démonstration ci-dessus.' },
  { q: 'Est-ce que Premium fonctionnera à plusieurs ?', a: 'Oui : chaque membre d’un budget voit le même « prévu / réel », que vous gériez votre budget seul, en couple, en famille ou en colocation.' },
];

type Phase = 'idle' | 'connecting' | 'fetching' | 'matching' | 'done';

const euros = (n: number) => money(n);
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function Demo() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>('seul');
  const scenario = SCENARIOS[scenarioId];
  const [phase, setPhase] = useState<Phase>('idle');
  const [shown, setShown] = useState(0);
  const [attached, setAttached] = useState<Record<string, string>>({});
  const [learned, setLearned] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  const clearTimers = () => { timers.current.forEach((t) => window.clearTimeout(t)); timers.current = []; };
  useEffect(() => clearTimers, []);

  const reset = (id: ScenarioId = scenarioId) => {
    clearTimers();
    setScenarioId(id);
    setPhase('idle');
    setShown(0);
    setAttached({});
    setLearned(null);
  };

  const run = () => {
    reset();
    const n = SCENARIOS[scenarioId].txs.length;
    if (reducedMotion()) {
      setShown(n);
      setPhase('done');
      return;
    }
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    setPhase('connecting');
    at(900, () => setPhase('fetching'));
    at(1800, () => setPhase('matching'));
    for (let i = 1; i <= n; i++) at(1800 + i * 160, () => setShown(i));
    at(1800 + n * 160 + 300, () => setPhase('done'));
  };

  const lineOf = (tx: Tx) => tx.line ?? attached[tx.id] ?? null;
  const visible = scenario.txs.slice(0, shown);
  const rows = useMemo(() => scenario.lines.map((l) => {
    const real = scenario.txs.filter((t) => (t.line ?? attached[t.id]) === l.id).reduce((s, t) => s + t.amount, 0);
    return { ...l, real, gap: real - l.planned };
  }), [scenario, attached]);
  const planned = rows.reduce((s, r) => s + r.planned, 0);
  const real = scenario.txs.reduce((s, t) => s + t.amount, 0);
  const pending = scenario.txs.filter((t) => !lineOf(t));

  const attach = (tx: Tx, lineId: string) => {
    if (!lineId) return;
    setAttached((a) => ({ ...a, [tx.id]: lineId }));
    const label = scenario.lines.find((l) => l.id === lineId)?.label ?? '';
    setLearned(`Retenu : les prochaines opérations « ${tx.wording} » iront toutes seules dans « ${label} ».`);
  };

  const status = {
    idle: 'Choisissez une situation, puis lancez la synchronisation.',
    connecting: 'Connexion à la banque de démonstration…',
    fetching: `${scenario.txs.length} opérations récupérées pour octobre`,
    matching: `Rattachement aux charges du budget… ${shown}/${scenario.txs.length}`,
    done: pending.length ? `${pending.length} opération${pending.length > 1 ? 's' : ''} à rattacher, le reste est fait.` : 'Tout est rattaché : votre mois est à jour.',
  }[phase];

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Démonstration</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">Essayez le « prévu / réel »</h2>
          <p className="mt-1 text-sm text-muted-foreground">Données fictives : aucune banque n’est contactée.</p>
        </div>
        <div role="radiogroup" aria-label="Situation" className="grid grid-cols-3 gap-2 sm:w-[340px]">
          {(Object.keys(SCENARIOS) as ScenarioId[]).map((id) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={scenarioId === id}
              onClick={() => reset(id)}
              className={`min-h-[44px] rounded-xl border px-3 text-sm font-semibold transition ${scenarioId === id ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-background text-muted-foreground hover:bg-muted'}`}
            >
              {SCENARIOS[id].label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* Bank side */}
        <div className="rounded-2xl bg-muted/50 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 font-semibold text-foreground"><Building2 className="h-4 w-4 text-primary" aria-hidden="true" /> Compte de démonstration</p>
            {phase === 'idle' || phase === 'done' ? (
              <Button type="button" onClick={phase === 'done' ? () => reset() : run} className="min-h-[44px]" variant={phase === 'done' ? 'outline' : 'default'}>
                {phase === 'done' ? <><RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" /> Recommencer</> : <><Play className="mr-2 h-4 w-4" aria-hidden="true" /> Synchroniser</>}
              </Button>
            ) : (
              <span className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> En cours</span>
            )}
          </div>
          <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">{status}</p>
          <ul className="mt-3 space-y-1.5">
            {visible.map((t) => {
              const lineId = lineOf(t);
              const line = scenario.lines.find((l) => l.id === lineId);
              return (
                <li key={t.id} className="flex items-center justify-between gap-3 rounded-xl bg-background px-3 py-2 text-sm animate-in fade-in slide-in-from-left-2 duration-300">
                  <span className="min-w-0">
                    <span className="block truncate font-mono text-xs text-foreground">{t.wording}</span>
                    {line ? (
                      <span className="flex items-center gap-1 text-xs text-success"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> {line.label}</span>
                    ) : phase === 'done' ? (
                      <label className="mt-1 flex items-center gap-1.5 text-xs text-warning">
                        <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="sr-only">Rattacher {t.wording} à</span>
                        <select
                          defaultValue=""
                          onChange={(e) => attach(t, e.target.value)}
                          className="h-9 rounded-lg border border-input bg-background px-2 text-xs text-foreground"
                        >
                          <option value="" disabled>Rattacher à…</option>
                          {scenario.lines.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                        </select>
                      </label>
                    ) : (
                      <span className="text-xs text-muted-foreground">À rattacher</span>
                    )}
                  </span>
                  <span className="shrink-0 tabular-nums font-semibold text-foreground">−{euros(t.amount)}</span>
                </li>
              );
            })}
          </ul>
          {learned && <p className="mt-3 flex items-start gap-2 rounded-xl bg-primary/10 p-3 text-sm text-foreground" aria-live="polite"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> {learned}</p>}
        </div>

        {/* Budget side */}
        <div>
          <p className="font-semibold text-foreground">Octobre : prévu et réel</p>
          <ul className="mt-3 space-y-3">
            {rows.map((r) => {
              const pct = r.planned > 0 ? Math.min(140, (r.real / r.planned) * 100) : 0;
              const over = r.gap > r.planned * 0.05;
              return (
                <li key={r.id}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium text-foreground">{r.label}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {euros(r.real)} / {euros(r.planned)}
                      {phase === 'done' && Math.abs(r.gap) >= 0.5 && (
                        <span className={`ml-2 font-semibold ${over ? 'text-warning' : 'text-success'}`}>{r.gap > 0 ? '+' : '−'}{euros(Math.abs(r.gap))}</span>
                      )}
                    </span>
                  </div>
                  <div className="relative mt-1.5 h-2.5 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${r.label} : ${euros(r.real)} dépensés sur ${euros(r.planned)} prévus`}>
                    <div className={`h-full rounded-full transition-[width] duration-500 ${over ? 'bg-warning' : 'bg-primary'}`} style={{ width: `${(pct / 140) * 100}%` }} />
                    <div className="absolute inset-y-0 w-0.5 bg-foreground/40" style={{ left: `${(100 / 140) * 100}%` }} aria-hidden="true" />
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Prévu</p><p className="font-bold tabular-nums text-foreground">{euros(planned)}</p></div>
            <div className="rounded-xl bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Réel</p><p className="font-bold tabular-nums text-foreground">{phase === 'done' ? euros(real) : '…'}</p></div>
            <div className="rounded-xl bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Écart</p><p className={`font-bold tabular-nums ${real > planned ? 'text-warning' : 'text-success'}`}>{phase === 'done' ? `${real > planned ? '+' : '−'}${euros(Math.abs(real - planned))}` : '…'}</p></div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Le trait vertical marque le montant prévu. Les opérations non rattachées comptent dans le réel, pas encore dans une charge.</p>
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  { icon: ShieldCheck, title: 'Vous connectez votre banque', text: 'Via un prestataire agréé (DSP2) : vous vous identifiez chez votre banque, Budget Famille ne voit jamais vos identifiants.' },
  { icon: Link2, title: 'Les opérations se rangent', text: 'Chaque opération du mois se rattache à une charge de votre budget. Vous le faites une fois, ensuite c’est automatique.' },
  { icon: TrendingUp, title: 'Vous voyez les écarts', text: 'Le mois affiche le prévu et le réel, charge par charge : vous savez tout de suite où le budget dérape.' },
];

export default function PremiumPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="px-4 pt-12 pb-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
              <Crown className="h-4 w-4" aria-hidden="true" /> Bientôt disponible
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl [text-wrap:balance]">
              Budget Famille Premium
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Vos comptes bancaires synchronisés pour comparer, chaque mois, ce que vous aviez prévu et ce que vous avez vraiment dépensé.
              Seul ou à plusieurs.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Fonction à venir, prix annoncé au lancement. Tout le reste de Budget Famille est gratuit dès aujourd’hui, sans connexion bancaire.
            </p>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6 lg:px-8" aria-label="Démonstration de Premium">
          <div className="mx-auto max-w-6xl"><Demo /></div>
        </section>

        <section className="bg-card px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="how-title">
          <div className="mx-auto max-w-6xl">
            <h2 id="how-title" className="text-center font-display text-3xl font-bold text-foreground">Comment ça marchera</h2>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className="rounded-2xl border border-border/70 bg-background p-6">
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">{i + 1}</span>
                    <s.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-muted-foreground">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="premium-faq">
          <div className="mx-auto max-w-3xl">
            <h2 id="premium-faq" className="text-center font-display text-3xl font-bold text-foreground">Questions fréquentes</h2>
            <div className="mt-8 divide-y divide-border rounded-2xl border border-border/70 bg-card">
              {FAQ.map((f) => (
                <details key={f.q} className="group p-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 font-semibold text-foreground">
                    {f.q}
                    <span aria-hidden="true" className="text-xl text-primary transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary px-4 py-16 text-primary-foreground">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold">En attendant, votre budget est déjà gratuit</h2>
            <p className="mt-3 text-lg opacity-90">Charges, pot commun, épargne et projets : seul ou à plusieurs, sans connexion bancaire.</p>
            <Button asChild size="lg" variant="secondary" className="mt-8 h-14 bg-white px-10 text-lg text-primary hover:bg-gray-100">
              <Link to="/signup">Créer mon budget gratuit <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" /></Link>
            </Button>
            <p className="mt-8 text-sm opacity-90">Suivez-nous pour être prévenu du lancement :</p>
            <SocialLinks className="mt-3 justify-center [&_a]:border-white/40 [&_a]:bg-transparent [&_a]:text-white [&_a:hover]:border-white [&_a:hover]:text-white" />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
