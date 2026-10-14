// src/components/premium/PremiumDemo.tsx
// ============================================================================
// Interactive demo of Premium (bank sync and « prévu / réel ») on fictitious
// data: shown on /premium and, until launch, in the app's Reality Check tab.
// It never contacts a bank.
// ============================================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import { Building2, CheckCircle2, Link2, Loader2, Play, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { money } from '@/lib/budget/format';
import { currencyFromBrowser, currencyOf } from '@/i18n/format';
import { defineMessages, useLocale, useT } from '@/i18n/runtime';

// ---------------------------------------------------------------------------
// Demo data: fictitious budgets and bank lines, one set per situation.
// ---------------------------------------------------------------------------

type ScenarioId = 'seul' | 'couple' | 'coloc';
interface Line { id: string; label: string; planned: number }
interface Tx { id: string; wording: string; amount: number; line: string | null }
interface Scenario { label: string; lines: Line[]; txs: Tx[] }

/** Amounts and links, shared by every language; the words are in M below. */
const DATA: Record<ScenarioId, { lines: Array<{ id: string; planned: number }>; txs: Array<{ id: string; amount: number; line: string | null }> }> = {
  seul: {
    lines: [{ id: 'loyer', planned: 650 }, { id: 'energie', planned: 55 }, { id: 'box', planned: 35 }, { id: 'transport', planned: 75 }, { id: 'courses', planned: 280 }, { id: 'loisirs', planned: 80 }],
    txs: [
      { id: 's1', amount: 650, line: 'loyer' }, { id: 's2', amount: 58.4, line: 'energie' }, { id: 's3', amount: 34.98, line: 'box' },
      { id: 's4', amount: 75, line: 'transport' }, { id: 's5', amount: 62.15, line: 'courses' }, { id: 's6', amount: 71.3, line: 'courses' },
      { id: 's7', amount: 23.6, line: 'courses' }, { id: 's8', amount: 66.75, line: 'courses' }, { id: 's9', amount: 80.4, line: 'courses' },
      { id: 's10', amount: 12.5, line: null }, { id: 's11', amount: 18.9, line: null },
    ],
  },
  couple: {
    lines: [{ id: 'credit', planned: 980 }, { id: 'energie', planned: 120 }, { id: 'box', planned: 60 }, { id: 'assurances', planned: 85 }, { id: 'courses', planned: 520 }, { id: 'carburant', planned: 140 }],
    txs: [
      { id: 'c1', amount: 980, line: 'credit' }, { id: 'c2', amount: 126.3, line: 'energie' }, { id: 'c3', amount: 29.99, line: 'box' },
      { id: 'c4', amount: 29.98, line: 'box' }, { id: 'c5', amount: 85, line: 'assurances' }, { id: 'c6', amount: 148.2, line: 'courses' },
      { id: 'c7', amount: 163.45, line: 'courses' }, { id: 'c8', amount: 31.2, line: 'courses' }, { id: 'c9', amount: 171.9, line: 'courses' },
      { id: 'c10', amount: 72.4, line: 'carburant' }, { id: 'c11', amount: 65.1, line: 'carburant' }, { id: 'c12', amount: 54, line: null },
    ],
  },
  coloc: {
    lines: [{ id: 'loyer', planned: 1350 }, { id: 'energie', planned: 90 }, { id: 'box', planned: 30 }, { id: 'assurance', planned: 18 }, { id: 'courses', planned: 240 }],
    txs: [
      { id: 'k1', amount: 1350, line: 'loyer' }, { id: 'k2', amount: 97.2, line: 'energie' }, { id: 'k3', amount: 29.99, line: 'box' },
      { id: 'k4', amount: 18, line: 'assurance' }, { id: 'k5', amount: 86.4, line: 'courses' }, { id: 'k6', amount: 92.15, line: 'courses' },
      { id: 'k7', amount: 24.8, line: null },
    ],
  },
};

const M = defineMessages({
  fr: {
    scenarios: { seul: 'Seul', couple: 'En couple', coloc: 'En coloc' } as Record<ScenarioId, string>,
    lines: {
      seul: { loyer: 'Loyer', energie: 'Énergie', box: 'Internet et mobile', transport: 'Transport', courses: 'Courses', loisirs: 'Loisirs' },
      couple: { credit: 'Crédit immobilier', energie: 'Énergie', box: 'Internet et mobiles', assurances: 'Assurances', courses: 'Courses', carburant: 'Carburant' },
      coloc: { loyer: 'Loyer', energie: 'Énergie', box: 'Internet', assurance: 'Assurance habitation', courses: 'Courses communes' },
    } as Record<ScenarioId, Record<string, string>>,
    wordings: {
      s1: 'VIR LOYER AGENCE', s2: 'PRLV FOURNISSEUR ENERGIE', s3: 'PRLV OPERATEUR BOX MOBILE', s4: 'PASS TRANSPORT MENSUEL', s5: 'CB SUPERMARCHE', s6: 'CB SUPERMARCHE',
      s7: 'CB MARCHE', s8: 'CB SUPERMARCHE', s9: 'CB SUPERMARCHE', s10: 'CB CINEMA', s11: 'CB LIBRAIRIE',
      c1: 'PRLV ECHEANCE PRET', c2: 'PRLV FOURNISSEUR ENERGIE', c3: 'PRLV OPERATEUR BOX', c4: 'PRLV OPERATEUR MOBILES', c5: 'PRLV ASSURANCE HABITATION AUTO', c6: 'CB HYPERMARCHE',
      c7: 'CB HYPERMARCHE', c8: 'CB BOULANGERIE', c9: 'CB HYPERMARCHE', c10: 'CB STATION SERVICE', c11: 'CB STATION SERVICE', c12: 'CB RESTAURANT',
      k1: 'VIR LOYER PROPRIETAIRE', k2: 'PRLV FOURNISSEUR ENERGIE', k3: 'PRLV OPERATEUR BOX', k4: 'PRLV ASSURANCE HABITATION', k5: 'CB SUPERMARCHE', k6: 'CB SUPERMARCHE', k7: 'CB DROGUERIE',
    } as Record<string, string>,
    learned: (wording: string, label: string) => `Retenu : les prochaines opérations « ${wording} » iront toutes seules dans « ${label} ».`,
    status: {
      idle: 'Choisissez une situation, puis lancez la synchronisation.',
      connecting: 'Connexion à la banque de démonstration…',
      fetching: (n: number) => `${n} opérations récupérées pour octobre`,
      matching: (shown: number, n: number) => `Rattachement aux charges du budget… ${shown}/${n}`,
      pending: (n: number) => `${n} opération${n > 1 ? 's' : ''} à rattacher, le reste est fait.`,
      allDone: 'Tout est rattaché : votre mois est à jour.',
    },
    kicker: 'Démonstration',
    title: 'Essayez le « prévu / réel »',
    fictitious: 'Données fictives : aucune banque n’est contactée.',
    situation: 'Situation',
    account: 'Compte de démonstration',
    restart: 'Recommencer',
    sync: 'Synchroniser',
    running: 'En cours',
    attachTo: (wording: string) => `Rattacher ${wording} à`,
    attachPlaceholder: 'Rattacher à…',
    toAttach: 'À rattacher',
    monthTitle: 'Octobre : prévu et réel',
    barLabel: (label: string, real: string, planned: string) => `${label} : ${real} dépensés sur ${planned} prévus`,
    planned: 'Prévu',
    real: 'Réel',
    gap: 'Écart',
    legend: 'Le trait vertical marque le montant prévu. Les opérations non rattachées comptent dans le réel, pas encore dans une charge.',
  },
  en: {
    scenarios: { seul: 'On my own', couple: 'As a couple', coloc: 'Roommates' } as Record<ScenarioId, string>,
    lines: {
      seul: { loyer: 'Rent', energie: 'Energy', box: 'Internet and phone', transport: 'Transportation', courses: 'Groceries', loisirs: 'Leisure' },
      couple: { credit: 'Mortgage', energie: 'Energy', box: 'Internet and phones', assurances: 'Insurance', courses: 'Groceries', carburant: 'Fuel' },
      coloc: { loyer: 'Rent', energie: 'Energy', box: 'Internet', assurance: 'Renters insurance', courses: 'Shared groceries' },
    } as Record<ScenarioId, Record<string, string>>,
    wordings: {
      s1: 'RENT PAYMENT AGENCY', s2: 'DIRECT DEBIT ENERGY SUPPLIER', s3: 'DIRECT DEBIT INTERNET MOBILE', s4: 'MONTHLY TRANSIT PASS', s5: 'CARD SUPERMARKET', s6: 'CARD SUPERMARKET',
      s7: 'CARD FARMERS MARKET', s8: 'CARD SUPERMARKET', s9: 'CARD SUPERMARKET', s10: 'CARD CINEMA', s11: 'CARD BOOKSHOP',
      c1: 'DIRECT DEBIT MORTGAGE', c2: 'DIRECT DEBIT ENERGY SUPPLIER', c3: 'DIRECT DEBIT INTERNET', c4: 'DIRECT DEBIT MOBILE PLANS', c5: 'DIRECT DEBIT HOME CAR INSURANCE', c6: 'CARD HYPERMARKET',
      c7: 'CARD HYPERMARKET', c8: 'CARD BAKERY', c9: 'CARD HYPERMARKET', c10: 'CARD GAS STATION', c11: 'CARD GAS STATION', c12: 'CARD RESTAURANT',
      k1: 'RENT PAYMENT LANDLORD', k2: 'DIRECT DEBIT ENERGY SUPPLIER', k3: 'DIRECT DEBIT INTERNET', k4: 'DIRECT DEBIT RENTERS INSURANCE', k5: 'CARD SUPERMARKET', k6: 'CARD SUPERMARKET', k7: 'CARD DRUGSTORE',
    } as Record<string, string>,
    learned: (wording: string, label: string) => `Got it: the next “${wording}” transactions will go to “${label}” by themselves.`,
    status: {
      idle: 'Pick a situation, then start the sync.',
      connecting: 'Connecting to the demo bank…',
      fetching: (n: number) => `${n} transactions fetched for October`,
      matching: (shown: number, n: number) => `Linking to the budget’s bills… ${shown}/${n}`,
      pending: (n: number) => `${n} transaction${n > 1 ? 's' : ''} to link, the rest is done.`,
      allDone: 'Everything is linked: your month is up to date.',
    },
    kicker: 'Demo',
    title: 'Try “planned / actual”',
    fictitious: 'Fictitious data: no bank is contacted.',
    situation: 'Situation',
    account: 'Demo account',
    restart: 'Start over',
    sync: 'Sync',
    running: 'In progress',
    attachTo: (wording: string) => `Link ${wording} to`,
    attachPlaceholder: 'Link to…',
    toAttach: 'To link',
    monthTitle: 'October: planned and actual',
    barLabel: (label: string, real: string, planned: string) => `${label}: ${real} spent out of ${planned} planned`,
    planned: 'Planned',
    real: 'Actual',
    gap: 'Gap',
    legend: 'The vertical line marks the planned amount. Unlinked transactions count in the actual total, not yet in a bill.',
  },
});

type Phase = 'idle' | 'connecting' | 'fetching' | 'matching' | 'done';

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function PremiumDemo() {
  const t = useT(M);
  const locale = useLocale();
  // The demo's currency: euros in French, the visitor's own currency in English.
  const symbol = locale === 'en' ? currencyOf(currencyFromBrowser()).symbol : '€';
  const euros = (n: number) => money(n, symbol);
  const scenarios = useMemo(() => Object.fromEntries((Object.keys(DATA) as ScenarioId[]).map((id) => [id, {
    label: t.scenarios[id],
    lines: DATA[id].lines.map((l) => ({ ...l, label: t.lines[id][l.id] })),
    txs: DATA[id].txs.map((x) => ({ ...x, wording: t.wordings[x.id] })),
  }])) as Record<ScenarioId, Scenario>, [t]);
  const [scenarioId, setScenarioId] = useState<ScenarioId>('seul');
  const scenario = scenarios[scenarioId];
  const [phase, setPhase] = useState<Phase>('idle');
  const [shown, setShown] = useState(0);
  const [attached, setAttached] = useState<Record<string, string>>({});
  const [learned, setLearned] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  const clearTimers = () => { timers.current.forEach((id) => window.clearTimeout(id)); timers.current = []; };
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
    const n = scenarios[scenarioId].txs.length;
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
    const real = scenario.txs.filter((x) => (x.line ?? attached[x.id]) === l.id).reduce((sum, x) => sum + x.amount, 0);
    return { ...l, real, gap: real - l.planned };
  }), [scenario, attached]);
  const planned = rows.reduce((s, r) => s + r.planned, 0);
  const real = scenario.txs.reduce((sum, x) => sum + x.amount, 0);
  const pending = scenario.txs.filter((x) => !lineOf(x));

  const attach = (tx: Tx, lineId: string) => {
    if (!lineId) return;
    setAttached((a) => ({ ...a, [tx.id]: lineId }));
    const label = scenario.lines.find((l) => l.id === lineId)?.label ?? '';
    setLearned(t.learned(tx.wording, label));
  };

  const status = {
    idle: t.status.idle,
    connecting: t.status.connecting,
    fetching: t.status.fetching(scenario.txs.length),
    matching: t.status.matching(shown, scenario.txs.length),
    done: pending.length ? t.status.pending(pending.length) : t.status.allDone,
  }[phase];

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{t.kicker}</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">{t.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.fictitious}</p>
        </div>
        <div role="radiogroup" aria-label={t.situation} className="grid grid-cols-3 gap-2 sm:w-[340px]">
          {(Object.keys(scenarios) as ScenarioId[]).map((id) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={scenarioId === id}
              onClick={() => reset(id)}
              className={`min-h-[44px] rounded-xl border px-3 text-sm font-semibold transition ${scenarioId === id ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-background text-muted-foreground hover:bg-muted'}`}
            >
              {scenarios[id].label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* Bank side */}
        <div className="min-w-0 rounded-2xl bg-muted/50 p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 font-semibold text-foreground"><Building2 className="h-4 w-4 text-primary" aria-hidden="true" /> {t.account}</p>
            {phase === 'idle' || phase === 'done' ? (
              <Button type="button" onClick={phase === 'done' ? () => reset() : run} className="min-h-[44px]" variant={phase === 'done' ? 'outline' : 'default'}>
                {phase === 'done' ? <><RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" /> {t.restart}</> : <><Play className="mr-2 h-4 w-4" aria-hidden="true" /> {t.sync}</>}
              </Button>
            ) : (
              <span className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> {t.running}</span>
            )}
          </div>
          <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">{status}</p>
          <ul className="mt-3 space-y-1.5">
            {visible.map((tx) => {
              const lineId = lineOf(tx);
              const line = scenario.lines.find((l) => l.id === lineId);
              return (
                <li key={tx.id} className="flex items-center justify-between gap-3 rounded-xl bg-background px-3 py-2 text-sm animate-in fade-in slide-in-from-left-2 duration-300">
                  <span className="min-w-0">
                    <span className="block truncate font-mono text-xs text-foreground">{tx.wording}</span>
                    {line ? (
                      <span className="flex items-center gap-1 text-xs text-success"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> {line.label}</span>
                    ) : phase === 'done' ? (
                      <label className="mt-1 flex items-center gap-1.5 text-xs text-warning">
                        <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="sr-only">{t.attachTo(tx.wording)}</span>
                        <select
                          defaultValue=""
                          onChange={(e) => attach(tx, e.target.value)}
                          className="h-9 rounded-lg border border-input bg-background px-2 text-xs text-foreground"
                        >
                          <option value="" disabled>{t.attachPlaceholder}</option>
                          {scenario.lines.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                        </select>
                      </label>
                    ) : (
                      <span className="text-xs text-muted-foreground">{t.toAttach}</span>
                    )}
                  </span>
                  <span className="shrink-0 tabular-nums font-semibold text-foreground">−{euros(tx.amount)}</span>
                </li>
              );
            })}
          </ul>
          {learned && <p className="mt-3 flex items-start gap-2 rounded-xl bg-primary/10 p-3 text-sm text-foreground" aria-live="polite"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> {learned}</p>}
        </div>

        {/* Budget side */}
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{t.monthTitle}</p>
          <ul className="mt-3 space-y-3">
            {rows.map((r) => {
              const pct = r.planned > 0 ? Math.min(140, (r.real / r.planned) * 100) : 0;
              const over = r.gap > r.planned * 0.05;
              return (
                <li key={r.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
                    <span className="font-medium text-foreground">{r.label}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {euros(r.real)} / {euros(r.planned)}
                      {phase === 'done' && Math.abs(r.gap) >= 0.5 && (
                        <span className={`ml-2 font-semibold ${over ? 'text-warning' : 'text-success'}`}>{r.gap > 0 ? '+' : '−'}{euros(Math.abs(r.gap))}</span>
                      )}
                    </span>
                  </div>
                  <div className="relative mt-1.5 h-2.5 overflow-hidden rounded-full bg-muted" role="img" aria-label={t.barLabel(r.label, euros(r.real), euros(r.planned))}>
                    <div className={`h-full rounded-full transition-[width] duration-500 ${over ? 'bg-warning' : 'bg-primary'}`} style={{ width: `${(pct / 140) * 100}%` }} />
                    <div className="absolute inset-y-0 w-0.5 bg-foreground/40" style={{ left: `${(100 / 140) * 100}%` }} aria-hidden="true" />
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-muted/60 p-3"><p className="text-xs text-muted-foreground">{t.planned}</p><p className="font-bold tabular-nums text-foreground">{euros(planned)}</p></div>
            <div className="rounded-xl bg-muted/60 p-3"><p className="text-xs text-muted-foreground">{t.real}</p><p className="font-bold tabular-nums text-foreground">{phase === 'done' ? euros(real) : '…'}</p></div>
            <div className="rounded-xl bg-muted/60 p-3"><p className="text-xs text-muted-foreground">{t.gap}</p><p className={`font-bold tabular-nums ${real > planned ? 'text-warning' : 'text-success'}`}>{phase === 'done' ? `${real > planned ? '+' : '−'}${euros(Math.abs(real - planned))}` : '…'}</p></div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{t.legend}</p>
        </div>
      </div>
    </div>
  );
}
