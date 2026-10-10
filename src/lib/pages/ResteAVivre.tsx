// src/lib/pages/ResteAVivre.tsx
// ============================================================================
// « Calcul du reste à vivre » — a free calculator (no account, nothing sent):
// household, net income and fixed charges in, the monthly reste à vivre out,
// per person, per day and per INSEE consumption unit, with the HCSF 35 %
// borrowing benchmark and the legal floor of an over-indebtedness procedure.
// Targets « calcul reste à vivre » and its variants; every figure on the page
// is either the visitor's own or sourced below.
// ============================================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, Calculator, CheckCircle2, ChevronDown, RotateCcw, Share2, ShieldCheck,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { MoneyInput, Panel, Stepper, Tile } from '@/components/tools/ToolKit';
import { money, parseAmount } from '@/lib/budget/format';
import { RAV_FAQ as FAQ } from '@/seo/faq';
import {
  CHARGE_FIELDS, HCSF_MAX_RATIO, INCOME_FIELDS, RSA_DATE, computeResteAVivre, rsaFloor, type Household,
} from '@/lib/tools/resteAVivre';

const STORAGE_KEY = 'bf:reste-a-vivre:v1';
const DEFAULT_HOUSEHOLD: Household = { adults: 2, kidsUnder14: 0, teens14plus: 0 };

interface Saved {
  household: Household;
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

const EXAMPLE = {
  household: { adults: 2, kidsUnder14: 2, teens14plus: 0 },
  incomes: { salaires: 3800 },
  charges: { loyer: 1100, credits: 230, energie: 160, assurances: 150, telecom: 70, transport: 120, enfants: 180 },
};

export default function ResteAVivre() {
  const saved = useMemo(load, []);
  const [household, setHousehold] = useState<Household>(saved?.household ?? DEFAULT_HOUSEHOLD);
  const [values, setValues] = useState<Record<string, string>>(saved?.values ?? {});
  const [moreOpen, setMoreOpen] = useState(() => CHARGE_FIELDS.some((f) => !f.main && amount(saved?.values?.[`chg.${f.key}`]) > 0));
  const [resultsVisible, setResultsVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ household, values }));
    } catch {
      // Private mode or blocked storage: the calculator still works.
    }
  }, [household, values]);

  useEffect(() => {
    const el = headlineRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setResultsVisible(entry.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const r = useMemo(() => computeResteAVivre(
    household,
    Object.fromEntries(INCOME_FIELDS.map((f) => [f.key, amount(values[`inc.${f.key}`])])),
    Object.fromEntries(CHARGE_FIELDS.map((f) => [f.key, amount(values[`chg.${f.key}`])])),
  ), [household, values]);
  const example = useMemo(() => computeResteAVivre(EXAMPLE.household, EXAMPLE.incomes, EXAMPLE.charges), []);

  const set = (key: string) => (v: string) => setValues((prev) => ({ ...prev, [key]: v }));
  const hasIncome = r.revenus > 0;
  const deficit = r.reste < 0;

  const reset = () => {
    setValues({});
    setHousehold(DEFAULT_HOUSEHOLD);
    setMoreOpen(false);
  };

  const share = async () => {
    const url = 'https://www.budgetfamille.com/calcul-reste-a-vivre';
    const text = 'Un simulateur gratuit pour calculer son reste à vivre, par personne et par jour.';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Calcul du reste à vivre', text, url });
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
              <Calculator className="h-4 w-4" aria-hidden="true" /> Simulateur gratuit · sans inscription
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl [text-wrap:balance]">
              Calcul du reste à vivre
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Vos revenus moins vos charges fixes : voyez ce qu’il reste à votre foyer chaque mois, par personne et par jour.
              Le résultat se met à jour pendant la saisie.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              <ShieldCheck className="mr-1 inline h-4 w-4 align-[-3px] text-success" aria-hidden="true" />Vos chiffres restent sur cet appareil : rien n’est envoyé.
            </p>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6 lg:px-8" aria-label="Simulateur">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_400px] lg:items-start">
            <div className="space-y-6">
              <Panel title="Votre foyer" step={1}>
                <Stepper label="Adultes" value={household.adults} min={1} onChange={(v) => setHousehold((h) => ({ ...h, adults: v }))} />
                <Stepper label="Enfants de moins de 14 ans" value={household.kidsUnder14} min={0} onChange={(v) => setHousehold((h) => ({ ...h, kidsUnder14: v }))} />
                <Stepper label="Enfants de 14 ans et plus" hint="Ou autre personne à charge" value={household.teens14plus} min={0} onChange={(v) => setHousehold((h) => ({ ...h, teens14plus: v }))} />
              </Panel>

              <Panel title="Revenus nets du mois" step={2}>
                {INCOME_FIELDS.map((f) => (
                  <MoneyInput key={f.key} id={`inc-${f.key}`} label={f.label} hint={f.hint} value={values[`inc.${f.key}`] ?? ''} onChange={set(`inc.${f.key}`)} />
                ))}
              </Panel>

              <Panel title="Charges fixes du mois" step={3}>
                {CHARGE_FIELDS.filter((f) => f.main || moreOpen).map((f) => (
                  <MoneyInput key={f.key} id={`chg-${f.key}`} label={f.label} hint={f.hint} value={values[`chg.${f.key}`] ?? ''} onChange={set(`chg.${f.key}`)} />
                ))}
                {!moreOpen && (
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => setMoreOpen(true)}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-xl px-2 font-semibold text-primary hover:underline"
                    >
                      <ChevronDown className="h-4 w-4" aria-hidden="true" /> Autres charges : transport, garde, impôts, pension…
                    </button>
                  </div>
                )}
                <p className="pt-3 text-sm text-muted-foreground">
                  Une dépense annuelle (taxe foncière, assurance payée en une fois) ? Divisez-la par 12. Les courses, l’habillement et les loisirs ne sont pas des charges fixes : c’est ce que le reste à vivre finance.
                </p>
              </Panel>
            </div>

            <div ref={resultsRef} id="resultat" className="scroll-mt-24">
              <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6" aria-live="polite">
                <div ref={headlineRef}>
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Votre reste à vivre</p>
                  {hasIncome ? (
                    <p className={`mt-2 font-display text-5xl font-bold tabular-nums ${deficit ? 'text-destructive' : 'text-foreground'}`}>
                      {euros(r.reste)}<span className="ml-1 text-lg font-semibold text-muted-foreground">/mois</span>
                    </p>
                  ) : (
                    <p className="mt-3 text-muted-foreground">
                      Indiquez vos revenus et vos charges : le résultat s’affiche ici au fil de la saisie.
                    </p>
                  )}
                </div>
                {hasIncome && (
                  <>
                    {deficit ? (
                      <p className="mt-2 flex items-start gap-2 text-sm font-medium text-destructive">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        Vos charges fixes dépassent vos revenus de {euros(-r.reste)} par mois.
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground">après {euros(r.charges)} de charges fixes, sur {euros(r.revenus)} de revenus</p>
                    )}

                    {deficit ? (
                      <div className="mt-5 rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
                        <p className="font-semibold text-foreground">Des pistes pour rééquilibrer</p>
                        <ul className="mt-2 space-y-1.5">
                          <li><Link to="/outils-ia" className="font-medium text-primary hover:underline">Estimer ce que vos factures peuvent baisser</Link></li>
                          <li><a href="https://www.mesdroitssociaux.gouv.fr/" target="_blank" rel="noopener" className="font-medium text-primary hover:underline">Vérifier vos droits aux aides</a> (simulateur officiel)</li>
                          <li><a href="https://solidarites.gouv.fr/point-conseil-budget-pcb" target="_blank" rel="noopener" className="font-medium text-primary hover:underline">Parler à un Point conseil budget</a> : gratuit et confidentiel</li>
                        </ul>
                      </div>
                    ) : (
                      <div className="mt-5 grid grid-cols-3 gap-2">
                        <Tile label="Par personne" value={euros(r.parPersonne)} note={`${r.persons} pers.`} />
                        <Tile label="Par jour" value={euros(r.parJour)} note="sur 30 jours" />
                        <Tile label="Par UC Insee" value={euros(r.parUnite)} note={`${String(r.units).replace('.', ',')} unités`} />
                      </div>
                    )}

                    {r.chargesShare !== null && (
                      <div className="mt-5">
                        <div className="flex items-baseline justify-between text-sm">
                          <span className="font-medium text-foreground">Charges fixes</span>
                          <span className="tabular-nums text-muted-foreground">{pct(r.chargesShare)} des revenus</span>
                        </div>
                        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted" role="img" aria-label={`Charges fixes : ${pct(r.chargesShare)} des revenus`}>
                          <div className={`h-full rounded-full ${deficit ? 'bg-destructive' : 'bg-primary'}`} style={{ width: `${Math.min(100, r.chargesShare * 100)}%` }} />
                        </div>
                      </div>
                    )}

                    {r.debtRatio !== null && (
                      <div className="mt-4 rounded-xl border border-border/70 p-3 text-sm">
                        <p className="font-medium text-foreground">Taux d’endettement estimé : {pct(r.debtRatio)}</p>
                        <p className="mt-1 flex items-start gap-1.5 text-muted-foreground">
                          {r.debtRatio > HCSF_MAX_RATIO
                            ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                            : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />}
                          <span>{r.debtRatio > HCSF_MAX_RATIO ? 'Au-dessus' : 'En dessous'} du repère de 35 % retenu pour un nouveau crédit immobilier (norme HCSF).</span>
                        </p>
                      </div>
                    )}

                    <p className="mt-4 text-sm text-muted-foreground">
                      Repère légal : en cas de surendettement, un foyer de {r.persons} personne{r.persons > 1 ? 's' : ''} garde au moins{' '}
                      <strong className="text-foreground">{money(r.floor)}</strong> par mois pour ses dépenses courantes, logement compris.{' '}
                      <a href="#minimum" className="font-medium text-primary hover:underline">Détails</a>
                    </p>
                  </>
                )}

                <div className="mt-6 rounded-xl bg-gradient-to-br from-slate-900 to-sky-900 p-4 text-white">
                  <p className="font-semibold">Suivez ce reste à vivre chaque mois, à deux</p>
                  <p className="mt-1 text-sm text-slate-200">Budget Famille remplit chaque mois à partir de vos charges, en temps réel avec votre conjoint. Gratuit.</p>
                  <Button asChild size="lg" variant="secondary" className="mt-3 h-12 w-full bg-white text-slate-900 hover:bg-slate-100">
                    <Link to="/signup">Créer mon budget gratuit <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
                  </Button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" variant="ghost" className="min-h-[44px]" onClick={reset}>
                    <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" /> Effacer
                  </Button>
                  <Button type="button" variant="ghost" className="min-h-[44px]" onClick={share}>
                    <Share2 className="mr-2 h-4 w-4" aria-hidden="true" /> {copied ? 'Lien copié' : 'Partager le simulateur'}
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
                <p className="text-xs text-muted-foreground">Reste à vivre</p>
                <p className={`text-xl font-bold tabular-nums ${deficit ? 'text-destructive' : 'text-foreground'}`}>{euros(r.reste)}<span className="text-sm font-medium text-muted-foreground"> /mois</span></p>
              </div>
              <Button type="button" onClick={scrollToResults} className="min-h-[44px]">Voir le détail</Button>
            </div>
          </div>
        )}

        <article className="bg-card px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-12 text-muted-foreground [&_h2]:font-display [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-foreground [&_strong]:text-foreground">
            <section>
              <h2>Comment calculer son reste à vivre ?</h2>
              <p className="mt-4 text-lg">
                <strong>Reste à vivre = revenus nets du mois − charges fixes du mois.</strong> C’est l’argent qui reste pour les courses,
                l’habillement, la santé non remboursée, les loisirs et l’épargne, une fois payé tout ce qui revient chaque mois.
              </p>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-foreground">Revenus à compter</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>Salaires nets versés (après l’impôt prélevé à la source)</li>
                    <li>Allocations et aides : CAF, aide au logement, prime d’activité</li>
                    <li>Retraite, pension alimentaire reçue, loyers perçus</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Charges fixes à retirer</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>Loyer ou mensualité de crédit immobilier</li>
                    <li>Autres crédits (auto, consommation)</li>
                    <li>Énergie, eau, assurances, mutuelle</li>
                    <li>Internet, mobile, abonnements, transport</li>
                    <li>Garde, cantine, impôts non prélevés à la source</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2>Exemple de calcul</h2>
              <p className="mt-4">
                Dans notre exemple, un couple avec deux enfants de 6 et 10 ans perçoit {euros(example.revenus)} nets par mois.
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-foreground">
                      <th className="py-2 font-semibold">Poste (exemple)</th>
                      <th className="py-2 text-right font-semibold">Par mois</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    <tr><td className="py-2">Salaires nets</td><td className="py-2 text-right tabular-nums">{euros(example.revenus)}</td></tr>
                    {CHARGE_FIELDS.filter((f) => (EXAMPLE.charges as Record<string, number>)[f.key]).map((f) => (
                      <tr key={f.key}><td className="py-2">{f.label}</td><td className="py-2 text-right tabular-nums">− {euros((EXAMPLE.charges as Record<string, number>)[f.key])}</td></tr>
                    ))}
                    <tr className="font-semibold text-foreground"><td className="py-2">Reste à vivre</td><td className="py-2 text-right tabular-nums">{euros(example.reste)}</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4">
                Soit {euros(example.parPersonne)} par personne et {euros(example.parJour)} par jour pour le foyer. Ses charges fixes
                représentent {pct(example.chargesShare ?? 0)} de ses revenus et son crédit auto {pct(example.debtRatio ?? 0)}.
                Pour le détail d’un budget complet de ce type de foyer, voir notre{' '}
                <Link to="/blog/budget-famille-4-personnes-exemple" className="font-medium text-primary hover:underline">exemple de budget pour une famille de 4</Link>.
              </p>
            </section>

            <section>
              <h2>Reste à vivre par personne ou par unité de consommation ?</h2>
              <p className="mt-4">
                Diviser par le nombre de personnes est simple, mais un enfant ne coûte pas autant qu’un adulte et deux adultes ne
                dépensent pas deux fois plus qu’un seul (un seul loyer, une seule box). Pour comparer des foyers de tailles différentes,
                l’Insee divise par les <strong>unités de consommation</strong> : 1 pour le premier adulte, 0,5 pour chaque autre personne
                de 14 ans ou plus, 0,3 par enfant de moins de 14 ans. Un couple avec deux jeunes enfants compte ainsi 2,1 unités.
              </p>
            </section>

            <section id="minimum" className="scroll-mt-24">
              <h2>Quel est le reste à vivre minimum ?</h2>
              <p className="mt-4">
                Il n’y a pas de minimum unique. Le seul plancher fixé par la loi concerne le <strong>surendettement</strong> : la part des
                ressources laissée au foyer pour ses dépenses courantes (logement, énergie, nourriture, scolarité, garde, déplacements
                professionnels, santé) ne peut pas être inférieure au montant forfaitaire du RSA pour ce foyer (article L731-2 du Code de
                la consommation). Au {RSA_DATE} :
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-foreground">
                      <th className="py-2 font-semibold">Personnes dans le foyer</th>
                      <th className="py-2 text-right font-semibold">Plancher par mois</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {[1, 2, 3, 4].map((n) => (
                      <tr key={n}><td className="py-2">{n}</td><td className="py-2 text-right tabular-nums">{money(rsaFloor(n))}</td></tr>
                    ))}
                    <tr><td className="py-2">Par personne en plus</td><td className="py-2 text-right tabular-nums">+ {money(rsaFloor(5) - rsaFloor(4))}</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4">
                Pour un crédit, les banques regardent d’abord le <strong>taux d’endettement</strong> : depuis 2022, il ne doit en principe pas
                dépasser 35 % des revenus, assurance comprise, pour un nouveau crédit immobilier (norme du Haut Conseil de stabilité
                financière, avec une marge de dérogation). Au-delà, chaque banque juge le reste à vivre selon ses propres critères.
              </p>
            </section>

            <section>
              <h2>Comment augmenter son reste à vivre ?</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5">
                <li><strong>Comparer ses factures</strong> d’énergie, de box, de mobile et d’assurance : nos <Link to="/outils-ia" className="font-medium text-primary hover:underline">outils gratuits</Link> estiment en 30 secondes ce qui peut baisser.</li>
                <li><strong>Vérifier ses droits</strong> aux aides avec le simulateur officiel <a href="https://www.mesdroitssociaux.gouv.fr/" target="_blank" rel="noopener" className="font-medium text-primary hover:underline">mesdroitssociaux.gouv.fr</a>.</li>
                <li><strong>Lisser les dépenses annuelles</strong> (taxe foncière, assurances, rentrée) en mettant de côté un douzième chaque mois : notre <Link to="/tableau-budget-familial-gratuit" className="font-medium text-primary hover:underline">tableau de budget gratuit</Link> le fait pour vous.</li>
                <li><strong>Répartir les charges du couple</strong> au prorata des revenus quand ils sont différents : voir <Link to="/blog/compte-commun-couple-argent-de-poche" className="font-medium text-primary hover:underline">compte commun et argent de poche</Link>.</li>
                <li><strong>Se faire accompagner gratuitement</strong> si le budget ne tient plus : les <a href="https://solidarites.gouv.fr/point-conseil-budget-pcb" target="_blank" rel="noopener" className="font-medium text-primary hover:underline">Points conseil budget</a>, labellisés par l’État, sont ouverts à tous et confidentiels.</li>
              </ul>
            </section>

            <section aria-labelledby="rav-faq">
              <h2 id="rav-faq">Questions fréquentes</h2>
              <dl className="mt-6 space-y-6">
                {FAQ.map((f) => (
                  <div key={f.q}>
                    <dt className="font-semibold text-foreground">{f.q}</dt>
                    <dd className="mt-2">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="text-sm">
              <h2 className="!text-xl">Sources</h2>
              <ul className="mt-3 list-disc space-y-1 pl-5">
                <li><a href="https://www.insee.fr/fr/metadonnees/definition/c1802" target="_blank" rel="noopener" className="text-primary hover:underline">Insee — Unité de consommation</a></li>
                <li><a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032224470" target="_blank" rel="noopener" className="text-primary hover:underline">Code de la consommation, article L731-2</a></li>
                <li><a href="https://www.service-public.gouv.fr/particuliers/vosdroits/F19778" target="_blank" rel="noopener" className="text-primary hover:underline">Service-Public.fr — Montant du RSA</a></li>
                <li><a href="https://www.economie.gouv.fr/hcsf/mesures/mesure-relative-loctroi-de-credits-immobiliers" target="_blank" rel="noopener" className="text-primary hover:underline">HCSF — Mesure relative à l’octroi de crédits immobiliers</a></li>
              </ul>
              <p className="mt-3">Ce simulateur donne une estimation à titre indicatif ; il ne remplace pas l’étude d’un dossier par une banque ou une commission de surendettement.</p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
