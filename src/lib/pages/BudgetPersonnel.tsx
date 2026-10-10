// src/lib/pages/BudgetPersonnel.tsx
// ============================================================================
// « Votre budget perso en 2 minutes » — a free calculator (no account, nothing
// sent): net income and essential expenses in, the 50/30/20 benchmark out,
// with the real share of the needs, what remains after them, an honest split
// of that remainder between wants and savings (rule in budgetPerso.ts) and the
// wants per day. Targets « budget personnel », « règle 50/30/20 » and « combien
// épargner par mois »; every figure on the page is either the visitor's own or
// the fictitious example computed by the module.
// ============================================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, Calculator, CheckCircle2, ChevronDown, Info, RotateCcw, Share2, ShieldCheck,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { FaqList, MoneyInput, Panel, SignupCard, Tile, ToolArticle } from '@/components/tools/ToolKit';
import { money, parseAmount } from '@/lib/budget/format';
import { PERSO_FAQ } from '@/seo/faq-budget-personnel';
import {
  EXAMPLE, EXAMPLE_HIGH_RENT, FULL_SAVINGS_MAX_NEEDS_SHARE, INCOME_FIELDS, NEED_FIELDS, RULE, computeBudgetPerso,
  type BudgetPerso,
} from '@/lib/tools/budgetPerso';

const STORAGE_KEY = 'bf:budget-personnel:v1';
const SAVINGS_KEY = 'epargne';

interface Saved {
  values: Record<string, string>;
}

function load(): Saved | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
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

const example = computeBudgetPerso(EXAMPLE.incomes, EXAMPLE.needs);
const exampleHigh = computeBudgetPerso(EXAMPLE_HIGH_RENT.incomes, EXAMPLE_HIGH_RENT.needs);

const COLORS = { besoins: 'bg-primary', envies: 'bg-sky-400', epargne: 'bg-success', marge: 'bg-success/30', deficit: 'bg-destructive' };

/** Stacked bar, decorative: the table under it carries the same figures as text. */
function StackedBar({ label, parts }: { label: string; parts: Array<{ key: string; share: number; className: string }> }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 flex h-3 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        {parts.filter((p) => p.share > 0).map((p) => (
          <div key={p.key} className={`h-full ${p.className}`} style={{ width: `${Math.min(100, p.share * 100)}%` }} />
        ))}
      </div>
    </div>
  );
}

function Comparison({ r }: { r: BudgetPerso }) {
  const share = (n: number) => (r.revenus > 0 ? n / r.revenus : 0);
  const deficit = r.status === 'deficit';
  const rows = [
    { key: 'besoins', label: 'Besoins', ref: r.regle.besoins, refPct: RULE.besoins, you: r.besoins },
    { key: 'envies', label: 'Envies', ref: r.regle.envies, refPct: RULE.envies, you: r.envies },
    { key: 'epargne', label: 'Épargne', ref: r.regle.epargne, refPct: RULE.epargne, you: r.epargne },
  ];
  return (
    <div className="mt-5 space-y-3">
      <StackedBar
        label="Repère 50/30/20"
        parts={[
          { key: 'besoins', share: RULE.besoins, className: COLORS.besoins },
          { key: 'envies', share: RULE.envies, className: COLORS.envies },
          { key: 'epargne', share: RULE.epargne, className: COLORS.epargne },
        ]}
      />
      <StackedBar
        label="Votre budget"
        parts={deficit ? [{ key: 'besoins', share: 1, className: COLORS.deficit }] : [
          { key: 'besoins', share: share(r.besoins), className: COLORS.besoins },
          { key: 'envies', share: share(r.envies), className: COLORS.envies },
          { key: 'epargne', share: share(r.epargne), className: COLORS.epargne },
          { key: 'marge', share: share(r.marge), className: COLORS.marge },
        ]}
      />
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Votre budget du mois comparé à la règle 50/30/20</caption>
        <thead>
          <tr className="border-b border-border text-xs text-muted-foreground">
            <th scope="col" className="py-1.5 font-medium">Poste</th>
            <th scope="col" className="py-1.5 text-right font-medium">Repère</th>
            <th scope="col" className="py-1.5 text-right font-medium">Votre budget</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {rows.map((row) => (
            <tr key={row.key}>
              <th scope="row" className="py-2 font-medium text-foreground">
                <span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${row.key === 'besoins' && deficit ? COLORS.deficit : COLORS[row.key as keyof typeof COLORS]}`} aria-hidden="true" />
                {row.label}
              </th>
              <td className="py-2 text-right tabular-nums">
                {euros(row.ref)}<span className="block text-xs text-muted-foreground">{pct(row.refPct)}</span>
              </td>
              <td className="py-2 text-right tabular-nums font-semibold text-foreground">
                {euros(row.you)}<span className="block text-xs font-normal text-muted-foreground">{pct(share(row.you))}</span>
              </td>
            </tr>
          ))}
          {r.marge > 0 && (
            <tr>
              <th scope="row" className="py-2 font-medium text-foreground">
                <span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${COLORS.marge}`} aria-hidden="true" />
                Marge libre
              </th>
              <td className="py-2 text-right text-muted-foreground">—</td>
              <td className="py-2 text-right tabular-nums font-semibold text-foreground">
                {euros(r.marge)}<span className="block text-xs font-normal text-muted-foreground">{pct(share(r.marge))}</span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function BudgetPersonnel() {
  const saved = useMemo(load, []);
  const [values, setValues] = useState<Record<string, string>>(saved?.values ?? {});
  const [moreOpen, setMoreOpen] = useState(() => NEED_FIELDS.some((f) => !f.main && amount(saved?.values?.[`need.${f.key}`]) > 0));
  const [resultsVisible, setResultsVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ values }));
    } catch {
      // Private mode or blocked storage: the calculator still works.
    }
  }, [values]);

  useEffect(() => {
    const el = headlineRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setResultsVisible(entry.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const r = useMemo(() => computeBudgetPerso(
    Object.fromEntries(INCOME_FIELDS.map((f) => [f.key, amount(values[`inc.${f.key}`])])),
    Object.fromEntries(NEED_FIELDS.map((f) => [f.key, amount(values[`need.${f.key}`])])),
    amount(values[SAVINGS_KEY]),
  ), [values]);

  const set = (key: string) => (v: string) => setValues((prev) => ({ ...prev, [key]: v }));
  const hasIncome = r.revenus > 0;
  const deficit = r.status === 'deficit';
  const needsShare = r.besoinsShare ?? 0;

  const reset = () => {
    setValues({});
    setMoreOpen(false);
  };

  const fillExample = () => {
    setValues({
      ...Object.fromEntries(Object.entries(EXAMPLE.incomes).map(([k, v]) => [`inc.${k}`, String(v)])),
      ...Object.fromEntries(Object.entries(EXAMPLE.needs).map(([k, v]) => [`need.${k}`, String(v)])),
    });
  };

  const share = async () => {
    const url = 'https://www.budgetfamille.com/budget-personnel';
    const text = 'Un calculateur gratuit pour faire son budget perso avec la règle 50/30/20.';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Budget perso : la règle 50/30/20', text, url });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="px-4 pt-12 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-1.5 text-sm font-semibold text-success">
              <Calculator className="h-4 w-4" aria-hidden="true" /> Calculateur gratuit · règle 50/30/20
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl [text-wrap:balance]">
              Votre budget perso en 2 minutes
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Indiquez votre salaire net et vos dépenses essentielles : voyez ce que donne la règle 50/30/20 pour vous, ce qui
              reste une fois les besoins payés et combien vous pouvez épargner chaque mois. Sans jugement, et le résultat se met à
              jour pendant la saisie.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              <ShieldCheck className="mr-1 inline h-4 w-4 align-[-3px] text-success" aria-hidden="true" />Sans inscription. Vos chiffres restent sur cet appareil : rien n’est envoyé.
            </p>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6 lg:px-8" aria-label="Calculateur">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_400px] lg:items-start">
            <div className="space-y-6">
              <Panel
                title="Revenus nets du mois"
                step={1}
                aside={<button type="button" onClick={fillExample} className="min-h-[44px] shrink-0 rounded-xl px-2 text-sm font-semibold text-primary hover:underline">Voir l’exemple</button>}
              >
                {INCOME_FIELDS.map((f) => (
                  <MoneyInput key={f.key} id={`inc-${f.key}`} label={f.label} hint={f.hint} value={values[`inc.${f.key}`] ?? ''} onChange={set(`inc.${f.key}`)} />
                ))}
              </Panel>

              <Panel title="Dépenses essentielles du mois" step={2}>
                <p className="pb-2 text-sm text-muted-foreground">
                  Les « besoins » : ce que vous devez payer quoi qu’il arrive pour vous loger, vous nourrir, travailler et rester assuré.
                </p>
                {NEED_FIELDS.filter((f) => f.main || moreOpen).map((f) => (
                  <MoneyInput key={f.key} id={`need-${f.key}`} label={f.label} hint={f.hint} value={values[`need.${f.key}`] ?? ''} onChange={set(`need.${f.key}`)} />
                ))}
                {!moreOpen && (
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => setMoreOpen(true)}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-xl px-2 font-semibold text-primary hover:underline"
                    >
                      <ChevronDown className="h-4 w-4" aria-hidden="true" /> Autres : santé, garde et enfants, impôts…
                    </button>
                  </div>
                )}
                <p className="pt-3 text-sm text-muted-foreground">
                  Une dépense annuelle (taxe foncière, assurance payée en une fois, abonnement à l’année) ? Divisez-la par 12. Les
                  sorties, les loisirs et le shopping ne sont pas des besoins : ce sont les envies, la règle leur garde une part.
                </p>
              </Panel>

              <Panel title="Votre épargne actuelle" step={3} aside={<span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">Facultatif</span>}>
                <MoneyInput
                  id="epargne-actuelle"
                  label="Épargne déjà mise de côté chaque mois"
                  hint="Virements vers votre épargne, cagnottes… Laissez vide si vous débutez : c’est très bien aussi."
                  value={values[SAVINGS_KEY] ?? ''}
                  onChange={set(SAVINGS_KEY)}
                />
              </Panel>
            </div>

            <div ref={resultsRef} id="resultat" className="scroll-mt-24">
              <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6" aria-live="polite">
                <div ref={headlineRef}>
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Après vos dépenses essentielles</p>
                  {hasIncome ? (
                    <p className={`mt-2 font-display text-5xl font-bold tabular-nums ${deficit ? 'text-destructive' : 'text-foreground'}`}>
                      {euros(r.reste)}<span className="ml-1 text-lg font-semibold text-muted-foreground">/mois</span>
                    </p>
                  ) : (
                    <p className="mt-3 text-muted-foreground">
                      Indiquez votre salaire net et vos dépenses essentielles : votre budget 50/30/20 s’affiche ici au fil de la saisie.
                    </p>
                  )}
                </div>
                {hasIncome && (
                  <>
                    {deficit ? (
                      <p className="mt-2 flex items-start gap-2 text-sm font-medium text-destructive">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        Vos dépenses essentielles dépassent vos revenus de {euros(-r.reste)} par mois.
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground">sur {euros(r.revenus)} de revenus, après {euros(r.besoins)} de besoins</p>
                    )}

                    {!deficit && (
                      <p className="mt-4 flex items-start gap-2 text-sm text-foreground">
                        {r.status === 'within'
                          ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                          : <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />}
                        <span>
                          Vos besoins : <strong>{pct(needsShare)}</strong> de vos revenus, {r.status === 'within' ? 'dans le repère des 50 %' : 'au-dessus du repère des 50 %'}.
                        </span>
                      </p>
                    )}

                    <Comparison r={r} />

                    {deficit ? (
                      <div className="mt-5 rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
                        <p className="font-semibold text-foreground">Ce n’est pas une fatalité : des pistes pour rééquilibrer</p>
                        <p className="mt-1">Vérifiez d’abord vos montants (une dépense annuelle comptée sans la diviser par 12 ?), puis :</p>
                        <ul className="mt-2 space-y-1.5">
                          <li><Link to="/outils-ia" className="font-medium text-primary hover:underline">Estimer ce que vos factures peuvent baisser</Link></li>
                          <li><a href="https://www.mesdroitssociaux.gouv.fr/" target="_blank" rel="noopener" className="font-medium text-primary hover:underline">Vérifier vos droits aux aides</a> (simulateur officiel)</li>
                          <li><a href="https://solidarites.gouv.fr/point-conseil-budget-pcb" target="_blank" rel="noopener" className="font-medium text-primary hover:underline">Parler à un Point conseil budget</a> : gratuit et confidentiel</li>
                        </ul>
                      </div>
                    ) : (
                      <>
                        <div className="mt-5 grid grid-cols-3 gap-2">
                          <Tile label="Envies" value={euros(r.envies)} note={`${pct(r.envies / r.revenus)} des revenus`} />
                          <Tile label="Épargne" value={euros(r.epargne)} note={`${pct(r.epargneShare ?? 0)} des revenus`} />
                          <Tile label="Envies par jour" value={money(r.enviesParJour)} note="sur 30 jours" />
                        </div>
                        <div className="mt-4 rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
                          {r.status === 'within' && (
                            <p>
                              Vos besoins restent sous 50 % : la règle s’applique telle quelle, 30 % pour les envies et 20 % pour
                              l’épargne.{r.marge > 0 && <> Les {euros(r.marge)} qui restent en plus sont une <strong>marge libre</strong> : plus d’épargne, un projet ou un peu plus d’envies, c’est vous qui choisissez.</>}
                            </p>
                          )}
                          {r.status === 'trimmed' && (
                            <p>
                              Vos besoins dépassent 50 % : cela arrive vite quand le loyer est élevé, ce n’est pas une faute. On réduit
                              d’abord les envies et on garde 20 % pour l’épargne, tant que les envies gardent au moins autant que
                              l’épargne (jusqu’à {pct(FULL_SAVINGS_MAX_NEEDS_SHARE)} de besoins).
                            </p>
                          )}
                          {r.status === 'shared' && (
                            <p>
                              Avec {pct(needsShare)} de besoins, garder 20 % d’épargne laisserait moins aux envies qu’à l’épargne. On partage
                              donc ce qui reste en deux moitiés égales : votre <strong>épargne possible</strong> est de {euros(r.epargne)} par
                              mois. Si c’est encore trop, un plus petit montant régulier compte déjà.
                            </p>
                          )}
                          <a href="#regle" className="mt-2 inline-block font-medium text-primary hover:underline">Comment ce partage est calculé</a>
                        </div>
                        {r.epargneActuelle > 0 && (
                          <p className="mt-4 text-sm text-muted-foreground">
                            Vous mettez déjà <strong>{euros(r.epargneActuelle)}</strong> de côté par mois ({pct(r.epargneActuelleShare ?? 0)} de vos revenus).{' '}
                            {r.epargneActuelle > r.reste
                              ? 'C’est plus que ce qui reste après vos besoins : vérifiez vos montants.'
                              : r.ecartEpargne > 0
                                ? `Pour atteindre la proposition : ${euros(r.ecartEpargne)} de plus par mois, à votre rythme.`
                                : 'C’est au moins la proposition : bien joué.'}
                          </p>
                        )}
                      </>
                    )}
                  </>
                )}

                <SignupCard
                  title="Suivez ce budget chaque mois, seul ou à plusieurs"
                  text="Budget Famille remplit chaque mois à partir de vos charges (tous les mois, certains mois ou une fois par an), avec des cagnottes d’épargne qui ont un objectif et une date. Vous pourrez inviter plus tard votre conjoint ou vos colocataires. Gratuit, sans connexion bancaire."
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
        {hasIncome && !resultsVisible && (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 py-3 backdrop-blur">
            <div className="mx-auto flex max-w-md items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Après vos besoins</p>
                <p className={`text-xl font-bold tabular-nums ${deficit ? 'text-destructive' : 'text-foreground'}`}>{euros(r.reste)}<span className="text-sm font-medium text-muted-foreground"> /mois</span></p>
              </div>
              <Button type="button" onClick={scrollToResults} className="min-h-[44px]">Voir le détail</Button>
            </div>
          </div>
        )}

        <ToolArticle>
          <section>
            <h2>Comment faire son budget personnel en 5 étapes</h2>
            <p className="mt-4 text-lg">
              Faire son budget perso, ce n’est pas se priver : c’est savoir où va l’argent pour décider soi-même de ce qui compte.
              Une heure suffit, avec vos relevés de compte des deux ou trois derniers mois.
            </p>
            <ol className="mt-6 list-decimal space-y-4 pl-5">
              <li>
                <strong>Partez de vos revenus nets.</strong> Le salaire réellement versé sur votre compte, après l’impôt prélevé à la
                source, plus les aides et les autres revenus réguliers. Si vos revenus varient (primes, intérim, activité
                indépendante), prenez un mois « bas » plutôt qu’une moyenne optimiste.
              </li>
              <li>
                <strong>Listez vos charges fixes.</strong> Logement, énergie, internet et mobile, transport, assurances, crédits : tout ce
                qui revient chaque mois sans que vous puissiez vraiment l’ajuster.
              </li>
              <li>
                <strong>Divisez les dépenses annuelles par 12.</strong> Taxe foncière, assurance payée en une fois, abonnement à l’année,
                cadeaux de fin d’année : comptez-en un douzième chaque mois, sinon elles reviennent comme des « mauvaises surprises ».
                Notre guide pour{' '}
                <Link to="/blog/5-etapes-gerer-budget-familial-2025" className="font-medium text-primary hover:underline">établir son budget en 5 étapes</Link>{' '}
                détaille la méthode.
              </li>
              <li>
                <strong>Estimez vos dépenses variables.</strong> Courses, sorties, vêtements, loisirs : ce sont elles qui bougent le plus.
                Une estimation honnête vaut mieux qu’un chiffre idéal ; vous l’ajusterez après un mois de suivi.
              </li>
              <li>
                <strong>Épargnez d’abord.</strong> Programmez un virement vers votre épargne juste après la paie, au lieu d’épargner « ce
                qui reste » en fin de mois : il reste rarement quelque chose. Même un petit montant installe l’habitude.
              </li>
            </ol>
            <p className="mt-6">
              Pour suivre ce budget chaque mois sans tout recopier, vous pouvez{' '}
              <Link to="/signup" className="font-medium text-primary hover:underline">créer votre budget gratuit</Link> sur Budget Famille ou
              partir de notre{' '}
              <Link to="/tableau-budget-familial-gratuit" className="font-medium text-primary hover:underline">tableau de budget gratuit (Excel et PDF)</Link>.
            </p>
          </section>

          <section id="regle" className="scroll-mt-24">
            <h2>La règle 50/30/20 expliquée</h2>
            <p className="mt-4 text-lg">
              <strong>La règle 50/30/20 partage vos revenus nets en trois parts</strong> : la moitié pour ce qui est indispensable, près
              d’un tiers pour ce qui rend la vie agréable, et le reste pour l’avenir.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border/70 p-4">
                <p className="font-display text-2xl font-bold text-foreground">50 %</p>
                <h3 className="font-semibold text-foreground">Besoins</h3>
                <p className="mt-1 text-sm">Logement, énergie, courses, transport, assurances, crédits : ce qu’on paie quoi qu’il arrive.</p>
              </div>
              <div className="rounded-xl border border-border/70 p-4">
                <p className="font-display text-2xl font-bold text-foreground">30 %</p>
                <h3 className="font-semibold text-foreground">Envies</h3>
                <p className="mt-1 text-sm">Restaurants, sorties, loisirs, shopping, vacances, abonnements plaisir.</p>
              </div>
              <div className="rounded-xl border border-border/70 p-4">
                <p className="font-display text-2xl font-bold text-foreground">20 %</p>
                <h3 className="font-semibold text-foreground">Épargne</h3>
                <p className="mt-1 text-sm">Épargne de précaution, projets, ou rembourser plus vite une dette.</p>
              </div>
            </div>
            <p className="mt-6">
              Cette règle a été popularisée par Elizabeth Warren, sénatrice américaine, et sa fille Amelia Warren Tyagi dans leur
              livre <em>All Your Worth</em> (2005). Son intérêt : elle tient en trois chiffres et laisse une vraie place aux envies,
              ce qui la rend plus facile à tenir qu’un budget où chaque euro est compté.
            </p>
            <p className="mt-4">
              C’est un <strong>repère, pas une obligation</strong>. Si votre loyer est élevé, vos besoins peuvent dépasser 50 % sans que
              vous ayez mal géré quoi que ce soit. Le calculateur adapte alors le partage de ce qui reste, selon une règle simple :
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li><strong>Besoins jusqu’à 50 %</strong> : 30 % pour les envies, 20 % pour l’épargne, et ce qui reste en plus est une marge libre.</li>
              <li><strong>Besoins entre 50 et {pct(FULL_SAVINGS_MAX_NEEDS_SHARE)}</strong> : on réduit d’abord les envies et l’épargne reste à 20 % des revenus, tant que les envies gardent au moins autant que l’épargne.</li>
              <li><strong>Besoins au-delà de {pct(FULL_SAVINGS_MAX_NEEDS_SHARE)}</strong> : ce qui reste est partagé en deux moitiés égales, l’une pour les envies, l’autre pour l’épargne possible. Garder 20 % priverait sinon les envies, et un budget trop serré se tient rarement.</li>
              <li><strong>Besoins supérieurs aux revenus</strong> : pas de partage, mais des pistes pour rééquilibrer.</li>
            </ul>
          </section>

          <section>
            <h2>Un exemple de budget perso</h2>
            <p className="mt-4">
              Dans notre exemple, Camille vit seule et gagne {euros(example.revenus)} nets par mois. Voici ses dépenses essentielles
              (montants fictifs) :
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-foreground">
                    <th className="py-2 font-semibold">Besoin (exemple)</th>
                    <th className="py-2 text-right font-semibold">Par mois</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {NEED_FIELDS.filter((f) => EXAMPLE.needs[f.key]).map((f) => (
                    <tr key={f.key}><td className="py-2">{f.label}</td><td className="py-2 text-right tabular-nums">{euros(EXAMPLE.needs[f.key] ?? 0)}</td></tr>
                  ))}
                  <tr className="font-semibold text-foreground"><td className="py-2">Total des besoins</td><td className="py-2 text-right tabular-nums">{euros(example.besoins)}</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              La règle 50/30/20 lui donne {euros(example.regle.besoins)} pour les besoins, {euros(example.regle.envies)} pour les envies
              et {euros(example.regle.epargne)} pour l’épargne. Ses besoins réels sont de {euros(example.besoins)}, soit{' '}
              {pct(example.besoinsShare ?? 0)} de ses revenus : un peu au-dessus du repère. Il lui reste {euros(example.reste)} : en
              gardant {euros(example.epargne)} d’épargne, ses envies passent à {euros(example.envies)}, soit{' '}
              {money(example.enviesParJour)} par jour.
            </p>
            <p className="mt-4">
              Si son loyer était de {euros(EXAMPLE_HIGH_RENT.needs.logement ?? 0)} au lieu de {euros(EXAMPLE.needs.logement ?? 0)}, ses
              besoins monteraient à {euros(exampleHigh.besoins)} ({pct(exampleHigh.besoinsShare ?? 0)}). Il resterait{' '}
              {euros(exampleHigh.reste)}, partagés en {euros(exampleHigh.envies)} d’envies et {euros(exampleHigh.epargne)} d’épargne.
            </p>
          </section>

          <section>
            <h2>Combien épargner chaque mois ?</h2>
            <p className="mt-4">
              La règle propose <strong>20 % des revenus nets</strong>, soit {euros(example.regle.epargne)} pour {euros(example.revenus)} nets.
              C’est un repère utile, pas un examen : le bon montant est celui que vous pouvez tenir tous les mois.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li><strong>Commencez petit.</strong> 20 ou 30 € par mois en virement automatique le jour de la paie, c’est déjà une habitude. Augmentez-le à chaque hausse de revenus ou quand un crédit se termine.</li>
              <li><strong>D’abord une épargne de précaution.</strong> Un matelas pour les imprévus : panne, réparation, frais de santé, baisse de revenus. On parle souvent de plusieurs mois de dépenses ; fixez votre propre objectif et avancez par étapes.</li>
              <li>
                <strong>Ensuite, les projets.</strong> Voyage, permis, apport : divisez le montant par le nombre de mois qui vous
                séparent de la date. Pour 1 200 € dans 12 mois, il faut 100 € par mois. Voir notre article{' '}
                <Link to="/blog/combien-epargner-par-mois-objectif-date" className="font-medium text-primary hover:underline">combien épargner par mois pour un objectif à une date</Link>.
              </li>
            </ul>
            <p className="mt-4">
              Dans Budget Famille, une cagnotte peut avoir un objectif et une date de fin : le montant à mettre de côté chaque mois est
              calculé pour vous.
            </p>
          </section>

          <section>
            <h2>Budget étudiant, premier appartement, coloc</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>
                <strong>Étudiant</strong> : bourse, job, aide de la famille… ne comptez que ce qui est sûr chaque mois, et gardez une petite
                réserve pour la rentrée. Notre{' '}
                <Link to="/blog/budget-etudiant-guide-complet-2025" className="font-medium text-primary hover:underline">guide du budget étudiant</Link>{' '}
                va plus loin.
              </li>
              <li>
                <strong>Premier appartement</strong> : prévoyez les frais d’installation (dépôt de garantie, déménagement, premiers meubles)
                en plus du loyer, et l’assurance habitation, obligatoire pour un locataire.
              </li>
              <li>
                <strong>Colocation</strong> : comptez votre part du loyer et des charges communes dans vos besoins. Notre{' '}
                <Link to="/budget-colocation" className="font-medium text-primary hover:underline">calculateur de budget en colocation</Link>{' '}
                fait le partage. Dans Budget Famille, vous pouvez créer un budget séparé pour la coloc et y inviter vos colocataires par
                e-mail.
              </li>
            </ul>
          </section>

          <FaqList id="perso-faq" items={PERSO_FAQ} />

          <section>
            <h2 className="!text-2xl">Autres outils gratuits</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { to: '/calcul-reste-a-vivre', label: 'Calcul du reste à vivre', text: 'Ce qui reste au foyer après les charges fixes, par personne et par jour.' },
                { to: '/budget-mariage', label: 'Budget de mariage', text: 'Estimer et répartir le coût d’un mariage.' },
                { to: '/budget-colocation', label: 'Budget en colocation', text: 'Partager le loyer et les charges entre colocataires.' },
                { to: '/tableau-budget-familial-gratuit', label: 'Tableau de budget gratuit', text: 'Un modèle Excel ou PDF à remplir.' },
              ].map((t) => (
                <li key={t.to}>
                  <Link to={t.to} className="flex min-h-[44px] items-start justify-between gap-3 rounded-xl border border-border/70 p-4 transition hover:bg-muted">
                    <span>
                      <span className="block font-semibold text-foreground">{t.label}</span>
                      <span className="block text-sm">{t.text}</span>
                    </span>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="text-sm">
            <h2 className="!text-xl">À savoir</h2>
            <p className="mt-3">
              Ce calculateur donne une indication à partir des montants que vous saisissez. La règle 50/30/20 est un repère : elle ne
              remplace pas un conseil financier personnalisé, et nous ne recommandons aucun produit d’épargne.
            </p>
          </section>
        </ToolArticle>
      </main>
      <Footer />
    </div>
  );
}
