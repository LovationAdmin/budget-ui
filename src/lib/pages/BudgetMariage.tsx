// src/lib/pages/BudgetMariage.tsx
// ============================================================================
// « Budget mariage » — a free calculator (no account, nothing sent): number of
// guests, the couple's own quotes (caterer and drinks per guest, every other
// poste as a total), the wedding month and what is already saved in; the
// total, the cost per guest, the per-guest vs fixed split, a breakdown by
// poste, what 20 fewer guests save and the amount to put aside each month out.
// Targets « budget mariage », « calcul budget mariage » and their variants.
// There is no official average: every figure on the page is the visitor's own
// or the fictitious example, labelled as such wherever it shows.
// ============================================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, Calculator, CheckCircle2, ChevronDown, Info, RotateCcw, Share2, ShieldCheck, Sparkles,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { FaqList, MoneyInput, Panel, SignupCard, Stepper, Tile, ToolArticle } from '@/components/tools/ToolKit';
import { money, parseAmount } from '@/lib/budget/format';
import { MARIAGE_FAQ } from '@/seo/faq-mariage';
import {
  DEFAULT_GUESTS, EXAMPLE, FEWER_GUESTS, MAX_GUESTS, MIN_GUESTS, POSTE_FIELDS, addMonths, clampGuests, computeMariage,
  exampleResult, formatMonthValue, monthLabel, parseMonth, savingPlan, toYearMonth, withFewerGuests,
  type Amounts, type PosteField,
} from '@/lib/tools/mariage';

const STORAGE_KEY = 'bf:budget-mariage:v1';

interface Saved {
  guests: number;
  /** Wedding month, "2027-06" (or what a browser without a month picker let the visitor type). */
  date: string;
  /** « Déjà mis de côté », as typed. */
  saved: string;
  /** Postes as typed, by PosteKey. */
  values: Record<string, string>;
  /** The fictitious example was filled in (its values are labelled while they remain). */
  example: boolean;
}

function load(): Saved | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Partial<Saved>;
    return {
      guests: clampGuests(Number(s.guests ?? DEFAULT_GUESTS)),
      date: typeof s.date === 'string' ? s.date : '',
      saved: typeof s.saved === 'string' ? s.saved : '',
      values: s.values && typeof s.values === 'object' ? s.values : {},
      example: s.example === true,
    };
  } catch {
    return null;
  }
}

const euros = (n: number) => money(n, '€', true);
const pct = (r: number) => `${Math.round(r * 100)} %`;
const amount = (raw: string | undefined) => {
  const n = parseAmount(raw ?? '');
  return Number.isFinite(n) && n > 0 ? n : 0;
};
const invites = (n: number) => `${n} invité${n > 1 ? 's' : ''}`;

/** The example as the form shows it. */
const EXAMPLE_VALUES: Record<string, string> = Object.fromEntries(
  Object.entries(EXAMPLE.amounts).map(([k, v]) => [k, String(v)]),
);
const EXAMPLE_NOTE = 'Exemple fictif, à remplacer par vos devis';

function ExampleBadge() {
  return (
    <span className="ml-2 inline-block rounded-full bg-warning/15 px-2 py-0.5 align-middle text-xs font-semibold text-foreground">
      exemple fictif
    </span>
  );
}

export default function BudgetMariage() {
  const saved = useMemo(load, []);
  const today = useMemo(() => new Date(), []);
  const thisMonth = toYearMonth(today);
  const [guests, setGuests] = useState<number>(saved?.guests ?? DEFAULT_GUESTS);
  const [date, setDate] = useState(saved?.date ?? '');
  const [already, setAlready] = useState(saved?.saved ?? '');
  const [values, setValues] = useState<Record<string, string>>(saved?.values ?? {});
  const [example, setExample] = useState(saved?.example ?? false);
  const [moreOpen, setMoreOpen] = useState(() => POSTE_FIELDS.some((f) => !f.main && amount(saved?.values?.[f.key]) > 0));
  const [resultsVisible, setResultsVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ guests, date, saved: already, values, example } satisfies Saved));
    } catch {
      // Private mode or blocked storage: the calculator still works.
    }
  }, [guests, date, already, values, example]);

  useEffect(() => {
    const el = headlineRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setResultsVisible(entry.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const r = useMemo(
    () => computeMariage(guests, Object.fromEntries(POSTE_FIELDS.map((f) => [f.key, amount(values[f.key])])) as Amounts),
    [guests, values],
  );
  const plan = useMemo(() => savingPlan(r.total, amount(already), date, today), [r.total, already, date, today]);
  const fewer = withFewerGuests(r);
  const ex = useMemo(exampleResult, []);

  const hasTotal = r.total > 0;
  const isExampleValue = (key: string) => example && EXAMPLE_VALUES[key] !== undefined && values[key] === EXAMPLE_VALUES[key];
  const alreadyIsExample = example && already === String(EXAMPLE.saved);
  const exampleLeft = POSTE_FIELDS.some((f) => isExampleValue(f.key)) || alreadyIsExample;
  const wholeExample = example && POSTE_FIELDS.every((f) => (values[f.key] ?? '') === (EXAMPLE_VALUES[f.key] ?? ''));
  const maxLine = r.lines[0]?.amount ?? 0;
  const projectYear = parseMonth(date)?.year ?? thisMonth.year + 1;

  const set = (key: string) => (v: string) => setValues((prev) => ({ ...prev, [key]: v }));

  const fillExample = () => {
    if (hasTotal && !wholeExample && !window.confirm('Remplacer vos montants par l’exemple fictif ?')) return;
    setGuests(EXAMPLE.guests);
    setValues({ ...EXAMPLE_VALUES });
    setAlready(String(EXAMPLE.saved));
    setDate(formatMonthValue(addMonths(thisMonth, EXAMPLE.monthsAhead)));
    setExample(true);
    setMoreOpen(true);
  };

  const reset = () => {
    setGuests(DEFAULT_GUESTS);
    setDate('');
    setAlready('');
    setValues({});
    setExample(false);
    setMoreOpen(false);
  };

  const share = async () => {
    const url = 'https://www.budgetfamille.com/budget-mariage';
    const text = 'Un calculateur gratuit pour estimer le budget de son mariage et ce qu’il faut mettre de côté chaque mois.';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Calcul du budget de mariage', text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Share sheet dismissed.
    }
  };

  const scrollToResults = () => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const posteHint = (f: PosteField): string | undefined => {
    const rate = amount(values[f.key]);
    if (f.perGuest && rate > 0) return `${money(rate)} × ${invites(r.guests)} = ${euros(rate * r.guests)}`;
    return f.hint;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="px-4 pt-12 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-1.5 text-sm font-semibold text-success">
              <Calculator className="h-4 w-4" aria-hidden="true" /> Calculateur gratuit · sans inscription
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl [text-wrap:balance]">
              Budget mariage : calculez le coût de votre mariage
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Invités, traiteur, lieu, tenues : additionnez vos devis, voyez le coût par invité et ce qu’il faut mettre de côté
              chaque mois d’ici le jour J. Le résultat se met à jour pendant la saisie.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              <ShieldCheck className="mr-1 inline h-4 w-4 align-[-3px] text-success" aria-hidden="true" />Vos chiffres restent sur cet appareil : rien n’est envoyé.
            </p>
            <div className="mt-6 flex flex-col items-center gap-1.5">
              <Button type="button" variant="outline" className="min-h-[44px] bg-card" onClick={fillExample}>
                <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" /> Remplir avec un exemple
              </Button>
              <p className="text-xs text-muted-foreground">{EXAMPLE_NOTE}.</p>
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6 lg:px-8" aria-label="Calculateur">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_400px] lg:items-start">
            <div className="space-y-6">
              <Panel title="Votre mariage" step={1}>
                <div>
                  <Stepper
                    label="Nombre d’invités"
                    hint="Adultes et enfants présents au repas"
                    value={guests}
                    min={MIN_GUESTS}
                    max={MAX_GUESTS}
                    onChange={(v) => setGuests(clampGuests(v))}
                  />
                  <div className="flex justify-end gap-2 pb-2">
                    <button
                      type="button"
                      onClick={() => setGuests((g) => clampGuests(g - 10))}
                      disabled={guests <= MIN_GUESTS}
                      aria-label="Retirer 10 invités"
                      className="min-h-[44px] min-w-[44px] rounded-xl border border-border bg-background px-3 text-sm font-semibold tabular-nums text-foreground transition hover:bg-muted disabled:opacity-40"
                    >
                      −10
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuests((g) => clampGuests(g + 10))}
                      disabled={guests >= MAX_GUESTS}
                      aria-label="Ajouter 10 invités"
                      className="min-h-[44px] min-w-[44px] rounded-xl border border-border bg-background px-3 text-sm font-semibold tabular-nums text-foreground transition hover:bg-muted disabled:opacity-40"
                    >
                      +10
                    </button>
                  </div>
                </div>
                <div className="py-2">
                  <label htmlFor="mariage-date" className="block font-medium text-foreground">Date du mariage</label>
                  <p id="mariage-date-hint" className="text-sm text-muted-foreground">Mois et année, pour calculer l’épargne de chaque mois</p>
                  <input
                    ref={dateRef}
                    id="mariage-date"
                    type="month"
                    min={formatMonthValue(thisMonth)}
                    placeholder="aaaa-mm"
                    value={date}
                    aria-describedby="mariage-date-hint"
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1.5 block h-12 w-full rounded-xl border border-input bg-background px-4 text-lg text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                  />
                </div>
                <MoneyInput
                  id="mariage-epargne"
                  label={<>Déjà mis de côté{alreadyIsExample && <ExampleBadge />}</>}
                  hint="Ce que vous avez déjà réuni pour le mariage, y compris les acomptes déjà versés"
                  value={already}
                  onChange={setAlready}
                  suffix="€"
                />
              </Panel>

              <Panel title="Postes de dépenses" step={2}>
                <p className="py-2 text-sm text-muted-foreground">
                  Saisissez vos devis : le montant total de chaque poste, sauf le traiteur et les boissons, en prix par invité.
                  Il n’existe pas de prix moyen officiel : le total dépend surtout du nombre d’invités et du traiteur.
                </p>
                {exampleLeft && (
                  <p className="flex items-start gap-2 py-3 text-sm text-foreground">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                    <span>
                      <strong>{EXAMPLE_NOTE}.</strong> Ces montants ronds servent à montrer le calcul : ce ne sont ni des moyennes ni des prix du marché.
                    </span>
                  </p>
                )}
                {POSTE_FIELDS.filter((f) => f.main || moreOpen).map((f) => (
                  <MoneyInput
                    key={f.key}
                    id={`poste-${f.key}`}
                    label={<>{f.label}{isExampleValue(f.key) && <ExampleBadge />}</>}
                    hint={posteHint(f)}
                    value={values[f.key] ?? ''}
                    onChange={set(f.key)}
                    suffix={f.perGuest ? '€/invité' : '€'}
                  />
                ))}
                {!moreOpen && (
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => setMoreOpen(true)}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-xl px-2 text-left font-semibold text-primary hover:underline"
                    >
                      <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" /> Autres postes : alliances, faire-part, voyage de noces
                    </button>
                  </div>
                )}
              </Panel>
            </div>

            <div ref={resultsRef} id="resultat" className="scroll-mt-24">
              <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
                <div aria-live="polite">
                  <div ref={headlineRef}>
                    <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Budget total du mariage</p>
                    {hasTotal ? (
                      <p className="mt-2 font-display text-5xl font-bold tabular-nums text-foreground">{euros(r.total)}</p>
                    ) : (
                      <p className="mt-3 text-muted-foreground">
                        Indiquez le nombre d’invités et vos devis : le total s’affiche ici au fil de la saisie.
                      </p>
                    )}
                  </div>

                  {hasTotal && (
                    <>
                      <p className="mt-1 text-sm text-muted-foreground">
                        pour {invites(r.guests)}{r.voyage > 0 ? ', voyage de noces compris' : ''}
                      </p>
                      {exampleLeft && (
                        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-foreground">
                          <Info className="h-3.5 w-3.5" aria-hidden="true" /> {EXAMPLE_NOTE}
                        </p>
                      )}

                      <div className="mt-5 grid grid-cols-2 gap-2">
                        <Tile label="Par invité" value={euros(r.costPerGuest)} note={r.voyage > 0 ? 'hors voyage de noces' : 'tout compris'} />
                        <Tile
                          label="Lié aux invités"
                          value={euros(r.perGuestTotal)}
                          note={`traiteur + boissons${r.perGuestShare !== null ? ` · ${pct(r.perGuestShare)}` : ''}`}
                        />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Part fixe : <strong className="text-foreground">{euros(r.fixedTotal)}</strong>
                        {r.perGuestShare !== null ? ` (${pct(1 - r.perGuestShare)})` : ''}, qui ne bouge pas avec le nombre d’invités.
                      </p>

                      <div className="mt-5 rounded-xl border border-border/70 p-4">
                        <p className="text-sm font-semibold text-foreground">À mettre de côté chaque mois</p>
                        {plan.status === 'ok' && plan.from && plan.to && (
                          <>
                            <p className="mt-1 font-display text-3xl font-bold tabular-nums text-foreground">
                              {euros(plan.monthly ?? 0)}<span className="ml-1 text-base font-semibold text-muted-foreground">/mois</span>
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {plan.months === 1
                                ? `Un seul versement, en ${monthLabel(plan.from)}`
                                : `De ${monthLabel(plan.from)} à ${monthLabel(plan.to)}, soit ${plan.months} versements`}
                              , pour réunir {euros(plan.remaining)}
                              {amount(already) > 0 ? ` (${euros(r.total)} − ${euros(amount(already))} déjà de côté)` : ''}.
                            </p>
                          </>
                        )}
                        {plan.status === 'covered' && (
                          <p className="mt-1 flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                            Ce que vous avez déjà mis de côté couvre ce budget : rien à ajouter chaque mois.
                          </p>
                        )}
                        {plan.status === 'this-month' && (
                          <p className="mt-1 flex items-start gap-2 text-sm text-muted-foreground">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                            {plan.remaining > 0
                              ? `Le mariage a lieu ce mois-ci : il ne reste plus de mois pour épargner, et ${euros(plan.remaining)} à réunir.`
                              : 'Le mariage a lieu ce mois-ci, et ce que vous avez mis de côté couvre ce budget.'}
                          </p>
                        )}
                        {plan.status === 'past' && (
                          <p className="mt-1 flex items-start gap-2 text-sm text-muted-foreground">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                            Cette date est passée : indiquez le mois du mariage à venir.
                          </p>
                        )}
                        {plan.status === 'no-date' && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            <button type="button" onClick={() => dateRef.current?.focus()} className="font-medium text-primary hover:underline">
                              Indiquez la date du mariage
                            </button>{' '}
                            pour savoir combien mettre de côté chaque mois.
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {!hasTotal && (
                  <Button type="button" variant="outline" className="mt-4 min-h-[44px] w-full" onClick={fillExample}>
                    <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" /> Remplir avec un exemple fictif
                  </Button>
                )}

                {r.lines.length > 0 && (
                  <div className="mt-5">
                    <h3 className="text-sm font-semibold text-foreground">Répartition par poste</h3>
                    <ul className="mt-3 space-y-3">
                      {r.lines.map((l) => (
                        <li key={l.key}>
                          <div className="flex items-baseline justify-between gap-3 text-sm">
                            <span className="text-foreground">
                              {l.label}
                              {l.perGuest && l.rate !== undefined && (
                                <span className="text-muted-foreground"> · {money(l.rate)} par invité</span>
                              )}
                            </span>
                            <span className="shrink-0 tabular-nums text-muted-foreground">
                              <strong className="font-semibold text-foreground">{euros(l.amount)}</strong> · {pct(l.share)}
                            </span>
                          </div>
                          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${maxLine > 0 ? (l.amount / maxLine) * 100 : 0}%` }} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {hasTotal && fewer.fewer > 0 && (
                  <div className="mt-5 rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground">Et avec {invites(fewer.fewer)} de moins ?</p>
                    {r.ratePerGuest > 0 ? (
                      <p className="mt-1">
                        Le traiteur et les boissons baissent de <strong>{euros(fewer.saving)}</strong> : {euros(fewer.total)} au lieu
                        de {euros(r.total)} pour {invites(fewer.guests)}. C’est un minimum : une salle plus petite, moins de tables et
                        de faire-part peuvent faire baisser d’autres postes.
                      </p>
                    ) : (
                      <p className="mt-1">
                        Indiquez le prix par invité du traiteur et des boissons pour voir ce que change une liste d’invités plus courte.
                      </p>
                    )}
                  </div>
                )}

                <SignupCard
                  title="Préparez votre mariage dans une cagnotte"
                  text={`Dans Budget Famille, créez un budget à part « Mariage ${projectYear} » ou une cagnotte avec un objectif et une date : le montant à mettre de côté chaque mois est calculé, et vous pouvez inviter votre conjoint. Gratuit, sans connexion bancaire.`}
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" variant="ghost" className="min-h-[44px]" onClick={reset}>
                    <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" /> Effacer
                  </Button>
                  <Button type="button" variant="ghost" className="min-h-[44px]" onClick={share}>
                    <Share2 className="mr-2 h-4 w-4" aria-hidden="true" /> {copied ? 'Lien copié' : 'Partager le calculateur'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The results card scrolls away while filling the form (html/body clip overflow-x, so sticky is inert): this bar keeps the figure in sight. */}
        {hasTotal && !resultsVisible && (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 py-3 backdrop-blur">
            <div className="mx-auto flex max-w-md items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Budget total{exampleLeft ? ' (exemple fictif)' : ''}</p>
                <p className="text-xl font-bold tabular-nums text-foreground">
                  {euros(r.total)}
                  {plan.status === 'ok' && (
                    <span className="text-sm font-medium text-muted-foreground"> · {euros(plan.monthly ?? 0)}/mois</span>
                  )}
                </p>
              </div>
              <Button type="button" onClick={scrollToResults} className="min-h-[44px]">Voir le détail</Button>
            </div>
          </div>
        )}

        <ToolArticle>
          <section>
            <h2>Comment calculer le budget de son mariage ?</h2>
            <p className="mt-4 text-lg">
              Un budget de mariage se construit à partir de <strong>vos devis</strong>, pas d’une moyenne : deux mariages avec le même
              nombre d’invités peuvent avoir des budgets très différents selon le lieu, le traiteur, la région et la saison.
            </p>
            <ol className="mt-4 list-decimal space-y-2 pl-5">
              <li>
                <strong>Listez les postes</strong> : lieu de réception, traiteur, boissons, tenues et beauté, photo et vidéo, musique,
                décoration et fleurs, alliances, faire-part, et le voyage de noces si vous en prévoyez un.
              </li>
              <li>
                <strong>Demandez des devis</strong> à plusieurs prestataires pour les postes les plus lourds, et notez ce qui est compris :
                service, vaisselle, boissons, heures supplémentaires.
              </li>
              <li>
                <strong>Séparez ce qui se paie par invité</strong> (le repas, les boissons) de ce qui est fixe (le lieu, le photographe,
                le DJ, les tenues). Seuls les premiers bougent avec la liste d’invités.
              </li>
              <li>
                <strong>Ajoutez une ligne « imprévus »</strong> : retouches, transports, achats de dernière minute… il y en a toujours.
              </li>
            </ol>
            <p className="mt-6 rounded-xl bg-muted/60 p-4 font-semibold text-foreground">
              Budget = (traiteur + boissons par invité) × nombre d’invités + postes fixes + imprévus
            </p>
          </section>

          <section>
            <h2>Budget mariage pour 100 invités : un exemple</h2>
            <p className="mt-4">
              Dans notre exemple, un couple reçoit {ex.guests} invités. Les montants sont <strong>fictifs</strong> : des chiffres ronds
              choisis pour montrer le calcul, pas des prix moyens. Il n’existe pas de prix de référence officiel ; le total dépend
              surtout du nombre d’invités et du traiteur. Remplacez chaque ligne par vos devis.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-foreground">
                    <th className="py-2 font-semibold">Poste (exemple fictif)</th>
                    <th className="py-2 text-right font-semibold">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {POSTE_FIELDS.filter((f) => EXAMPLE.amounts[f.key]).map((f) => {
                    const v = EXAMPLE.amounts[f.key] ?? 0;
                    return (
                      <tr key={f.key}>
                        <td className="py-2">
                          {f.label}
                          {f.perGuest && <span className="text-muted-foreground"> ({money(v)} × {ex.guests} invités)</span>}
                        </td>
                        <td className="py-2 text-right tabular-nums">{euros(f.perGuest ? v * ex.guests : v)}</td>
                      </tr>
                    );
                  })}
                  <tr className="font-semibold text-foreground">
                    <td className="py-2">Total</td>
                    <td className="py-2 text-right tabular-nums">{euros(ex.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              Soit <strong>{euros(ex.costPerGuest)} par invité</strong>. Le traiteur et les boissons, payés par invité, font{' '}
              {euros(ex.perGuestTotal)} ({pct(ex.perGuestShare ?? 0)} du total) ; les {euros(ex.fixedTotal)} restants ne changent pas
              avec le nombre d’invités. Avec {ex.fewerGuests.fewer} invités de moins, l’exemple économise au moins{' '}
              {euros(ex.fewerGuests.saving)} : la liste d’invités est le levier le plus direct. Pas de voyage de noces dans cet
              exemple : s’il fait partie de votre projet, ajoutez-le.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4 min-h-[44px]"
              onClick={() => { fillExample(); scrollToResults(); }}
            >
              Charger cet exemple dans le calculateur <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </section>

          <section>
            <h2>Combien épargner par mois pour son mariage ?</h2>
            <p className="mt-4 rounded-xl bg-muted/60 p-4 font-semibold text-foreground">
              Montant mensuel = (budget total − déjà mis de côté) ÷ nombre de mois avant le mariage
            </p>
            <p className="mt-4">
              Comptez le mois en cours et arrêtez-vous au mois qui précède le mariage : l’argent est ainsi prêt avant le jour J.
              Arrondissez à l’euro supérieur, mieux vaut finir avec un peu d’avance.
            </p>
            <p className="mt-4">
              Dans notre exemple, le couple a déjà mis {euros(ex.saved)} de côté et se marie dans {ex.months} mois :
              ({euros(ex.total)} − {euros(ex.saved)}) ÷ {ex.months} = <strong>{euros(ex.monthly)} par mois</strong>.
            </p>
            <p className="mt-4">
              Regardez aussi le calendrier de vos devis : beaucoup de prestataires demandent un acompte à la réservation, puis le
              solde avant la date. Ces sommes sortent plus tôt que le jour J, votre épargne doit les suivre. Pour vérifier que le
              montant mensuel tient dans votre budget, partez de votre{' '}
              <Link to="/calcul-reste-a-vivre" className="font-medium text-primary hover:underline">reste à vivre</Link>. Le calcul
              détaillé, avec le test du mois le plus serré, est expliqué dans{' '}
              <Link to="/blog/combien-epargner-par-mois-objectif-date" className="font-medium text-primary hover:underline">
                combien épargner par mois pour un objectif à une date
              </Link>.
            </p>
          </section>

          <section>
            <h2>Comment réduire le budget d’un mariage ?</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>
                <strong>Revoir la liste d’invités</strong> : c’est le levier le plus direct, puisque le repas et les boissons sont
                multipliés par chaque invité. Le calculateur montre ce que changent {FEWER_GUESTS} invités de moins.
              </li>
              <li>
                <strong>Choisir une date hors saison, un vendredi ou un dimanche</strong> : beaucoup de lieux et de prestataires
                n’appliquent pas les mêmes tarifs selon le jour et la période. Demandez les deux devis pour comparer.
              </li>
              <li>
                <strong>Comparer les lieux</strong> : salle municipale, lieu qui laisse libre le choix du traiteur, domaine qui inclut le
                mobilier. Vérifiez ce qui est compris, et le droit de bouchon si vous apportez vos boissons.
              </li>
              <li>
                <strong>Adapter la formule du repas</strong> : cocktail dînatoire, buffet, nombre de plats, avec ou sans brunch le
                lendemain.
              </li>
              <li>
                <strong>Faire soi-même ce qui s’y prête</strong> : décoration, faire-part, desserts, playlist, en gardant du temps pour
                vous la veille.
              </li>
              <li>
                <strong>Louer ou acheter d’occasion</strong> les tenues, la décoration ou la vaisselle, et réutiliser les fleurs de la
                cérémonie pour la réception.
              </li>
            </ul>
          </section>

          <section>
            <h2>Qui paie le mariage ?</h2>
            <p className="mt-4">
              Il n’y a pas de règle. Selon les familles et les moyens de chacun, le mariage est payé par le couple seul, partagé avec
              les parents, ou complété par une participation pour un poste précis, comme la robe ou le vin d’honneur.
            </p>
            <p className="mt-4">
              Le plus simple est d’en parler tôt, avant de signer les premiers devis : qui participe, à quelle hauteur et pour
              quand. Notez-le : chacun sait ce qui est prévu, et personne n’est mis devant le fait accompli.
            </p>
            <p className="mt-4">
              Un budget partagé aide. Dans{' '}
              <Link to="/signup" className="font-medium text-primary hover:underline">Budget Famille</Link>, créez un budget à part
              « Mariage {projectYear} » avec ses propres membres : invitez votre conjoint, et vos parents si vous le souhaitez, par
              e-mail ; chacun voit les mêmes chiffres en temps réel. Une cagnotte avec un objectif et une date calcule le montant à
              mettre de côté chaque mois, et une dépense peut être payée directement depuis la cagnotte. C’est gratuit, sans
              connexion bancaire.
            </p>
          </section>

          <FaqList id="mariage-faq" items={MARIAGE_FAQ} />

          <section className="text-sm">
            <h2 className="!text-xl">À savoir</h2>
            <p className="mt-3">
              Ce calculateur donne une indication à partir de vos propres montants. Il ne connaît ni les prix de votre région ni ceux
              de vos prestataires : seuls vos devis font foi. Les montants de l’exemple sont fictifs, et cette page ne constitue pas
              un conseil financier personnalisé.
            </p>
            <p className="mt-3">
              Autres outils gratuits :{' '}
              <Link to="/budget-personnel" className="font-medium text-primary hover:underline">budget personnel</Link>,{' '}
              <Link to="/budget-colocation" className="font-medium text-primary hover:underline">budget de colocation</Link>.
            </p>
          </section>
        </ToolArticle>
      </main>
      <Footer />
    </div>
  );
}
