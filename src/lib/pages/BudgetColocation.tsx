// src/lib/pages/BudgetColocation.tsx
// ============================================================================
// « Budget colocation » — a free calculator (no account, nothing sent): rent
// and shared bills in, each roommate's monthly share out, with three ways to
// split the rent (equal, by bedroom, by income). Targets « budget colocation »,
// « répartir le loyer en colocation » and their variants. Legal points are
// sourced on the page (Service-Public.fr, CAF); the example is labelled.
// ============================================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Info, RotateCcw, Share2, ShieldCheck, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { FaqList, MoneyInput, Panel, Segmented, SignupCard, Stepper, Tile, ToolArticle } from '@/components/tools/ToolKit';
import { money, parseAmount } from '@/lib/budget/format';
import { COLOC_EXAMPLE, COMMON_SHARE, computeColocation, type SplitMethod } from '@/lib/tools/colocation';
import { COLOC_FAQ as FAQ } from '@/seo/faq-colocation';

const STORAGE_KEY = 'bf:budget-colocation:v1';
const MAX = 6;

interface Mate { name: string; room: string; income: string }
interface Saved { mates: Mate[]; method: SplitMethod; values: Record<string, string> }

const BILLS = [
  { key: 'energie', label: 'Énergie (électricité, gaz)', hint: 'Le total de la coloc, par mois' },
  { key: 'internet', label: 'Internet' },
  { key: 'assurance', label: 'Assurance habitation', hint: 'Si elle est commune à la coloc' },
  { key: 'courses', label: 'Courses et produits communs', hint: 'Ménage, papier, huile, sel…' },
  { key: 'autres', label: 'Autres dépenses communes', hint: 'Abonnement, eau si non comprise…' },
];

const METHODS: Array<{ value: SplitMethod; label: string; hint: string }> = [
  { value: 'egal', label: 'Parts égales', hint: 'Chambres proches' },
  { value: 'chambre', label: 'Selon la chambre', hint: 'Tailles différentes' },
  { value: 'revenus', label: 'Selon les revenus', hint: 'Écarts de revenus' },
];

const mate = (i: number): Mate => ({ name: `Coloc ${i + 1}`, room: '', income: '' });
const DEFAULT: Saved = { mates: [mate(0), mate(1)], method: 'egal', values: {} };

function load(): Saved | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

const amount = (raw: string | undefined) => {
  const n = parseAmount(raw ?? '');
  return Number.isFinite(n) && n > 0 ? n : 0;
};
const euros = (n: number) => money(n);
const pct = (r: number) => `${Math.round(r * 100)} %`;

export default function BudgetColocation() {
  const saved = useMemo(load, []);
  const [mates, setMates] = useState<Mate[]>(saved?.mates?.length ? saved.mates : DEFAULT.mates);
  const [method, setMethod] = useState<SplitMethod>(saved?.method ?? DEFAULT.method);
  const [values, setValues] = useState<Record<string, string>>(saved?.values ?? {});
  const [resultsVisible, setResultsVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ mates, method, values }));
    } catch {
      // Private mode or blocked storage: the calculator still works.
    }
  }, [mates, method, values]);

  useEffect(() => {
    const el = headlineRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setResultsVisible(entry.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const r = useMemo(() => computeColocation({
    rent: amount(values.loyer),
    bills: BILLS.map((b) => amount(values[b.key])),
    method,
    roommates: mates.map((m, i) => ({ name: m.name.trim() || `Coloc ${i + 1}`, room: amount(m.room), income: amount(m.income) })),
  }), [mates, method, values]);
  const examples = useMemo(() => (['egal', 'chambre', 'revenus'] as const).map((m) => computeColocation({ ...COLOC_EXAMPLE, method: m })), []);

  const set = (key: string) => (v: string) => setValues((prev) => ({ ...prev, [key]: v }));
  const setMate = (i: number, patch: Partial<Mate>) => setMates((ms) => ms.map((m, j) => (j === i ? { ...m, ...patch } : m)));
  const setCount = (n: number) => setMates((ms) => (n > ms.length ? [...ms, ...Array.from({ length: n - ms.length }, (_, k) => mate(ms.length + k))] : ms.slice(0, n)));
  const hasData = r.total > 0;
  const maxShare = Math.max(0, ...r.shares.map((s) => s.total));

  const fillExample = () => {
    setMethod(COLOC_EXAMPLE.method);
    setMates(COLOC_EXAMPLE.roommates.map((m) => ({ name: m.name, room: String(m.room), income: String(m.income) })));
    setValues({ loyer: String(COLOC_EXAMPLE.rent), energie: '90', internet: '30', assurance: '18', courses: '60' });
  };
  const reset = () => {
    setMates(DEFAULT.mates);
    setMethod(DEFAULT.method);
    setValues({});
  };
  const share = async () => {
    const url = 'https://www.budgetfamille.com/budget-colocation';
    const text = 'Un calculateur gratuit pour partager le loyer et les factures de la coloc.';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Budget colocation', text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Share sheet dismissed.
    }
  };

  const methodHelp = {
    egal: 'Chacun paie la même part du loyer. Simple et juste quand les chambres se valent.',
    chambre: `${pct(COMMON_SHARE)} du loyer couvre les pièces communes et se partage à parts égales ; le reste suit la surface de chaque chambre.`,
    revenus: 'Chacun paie le loyer en proportion de ses revenus nets. Utile quand les écarts de revenus sont importants.',
  }[method];

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
              Budget colocation&nbsp;: qui paie quoi&nbsp;?
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Loyer, factures, courses communes : calculez la part de chaque colocataire, à parts égales, selon la chambre ou selon les revenus.
              Le résultat se met à jour pendant la saisie.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              <ShieldCheck className="mr-1 inline h-4 w-4 align-[-3px] text-success" aria-hidden="true" />Vos chiffres restent sur cet appareil : rien n’est envoyé.
            </p>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6 lg:px-8" aria-label="Calculateur">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_400px] lg:items-start">
            <div className="space-y-6">
              <Panel
                title="La colocation"
                step={1}
                aside={<button type="button" onClick={fillExample} className="min-h-[44px] rounded-xl px-2 text-sm font-semibold text-primary hover:underline">Voir l’exemple</button>}
              >
                <Stepper label="Colocataires" value={mates.length} min={2} max={MAX} onChange={setCount} />
                {mates.map((m, i) => (
                  <div key={i} className={`grid items-end gap-3 py-3 ${method === 'chambre' ? 'grid-cols-[1fr_7rem]' : method === 'revenus' ? 'grid-cols-[1fr_9.5rem] sm:grid-cols-[1fr_12rem]' : ''}`}>
                    <div className="pb-2">
                      <label htmlFor={`mate-${i}`} className="block text-sm font-medium text-foreground">Prénom ou surnom</label>
                      <input
                        id={`mate-${i}`}
                        type="text"
                        autoComplete="off"
                        maxLength={24}
                        value={m.name}
                        onChange={(e) => setMate(i, { name: e.target.value })}
                        className="mt-1.5 h-12 w-full rounded-xl border border-input bg-background px-4 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                      />
                    </div>
                    {method === 'chambre' && (
                      <div>
                        <MoneyInput id={`room-${i}`} label={<span className="text-sm">Chambre</span>} suffix="m²" value={m.room} onChange={(v) => setMate(i, { room: v })} />
                      </div>
                    )}
                    {method === 'revenus' && (
                      <div>
                        <MoneyInput id={`income-${i}`} label={<span className="text-sm">Revenu net</span>} value={m.income} onChange={(v) => setMate(i, { income: v })} />
                      </div>
                    )}
                  </div>
                ))}
              </Panel>

              <Panel title="Loyer et factures du mois" step={2}>
                <MoneyInput id="loyer" label="Loyer, charges comprises" hint="Le loyer total de la coloc" value={values.loyer ?? ''} onChange={set('loyer')} />
                {BILLS.map((b) => (
                  <MoneyInput key={b.key} id={`bill-${b.key}`} label={b.label} hint={b.hint} value={values[b.key] ?? ''} onChange={set(b.key)} />
                ))}
                <p className="pt-3 text-sm text-muted-foreground">Une facture payée tous les deux mois ou à l’année ? Ramenez-la au mois (÷ 2, ÷ 12). Les factures sont partagées à parts égales.</p>
              </Panel>

              <Panel title="Répartition du loyer" step={3}>
                <Segmented label="Méthode" value={method} options={METHODS} onChange={setMethod} />
                <p className="flex items-start gap-2 pt-3 text-sm text-muted-foreground"><Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> {methodHelp}</p>
              </Panel>
            </div>

            <div ref={resultsRef} id="resultat" className="scroll-mt-24">
              <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6" aria-live="polite">
                <div ref={headlineRef}>
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Part de chacun, par mois</p>
                  {!hasData && <p className="mt-3 text-muted-foreground">Indiquez le loyer et les factures : la part de chacun s’affiche ici au fil de la saisie.</p>}
                </div>
                {hasData && (
                  <>
                    <ul className="mt-4 space-y-4">
                      {r.shares.map((s, i) => (
                        <li key={i}>
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="truncate font-semibold text-foreground">{s.name}</span>
                            <span className="font-display text-2xl font-bold tabular-nums text-foreground">{euros(s.total)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">loyer {euros(s.rent)} + factures {euros(s.bills)} · {pct(s.ratio)} du total</p>
                          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${maxShare > 0 ? (s.total / maxShare) * 100 : 0}%` }} />
                          </div>
                        </li>
                      ))}
                    </ul>
                    {r.fallback && <p className="mt-4 rounded-xl bg-warning/10 p-3 text-sm text-foreground">{r.fallback}</p>}
                    <div className="mt-5 grid grid-cols-3 gap-2">
                      <Tile label="Loyer" value={euros(r.rent)} />
                      <Tile label="Factures" value={euros(r.bills)} />
                      <Tile label="Total coloc" value={euros(r.total)} />
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">
                      Le plus simple : chacun verse sa part sur un compte ou un pot commun au début du mois, et le loyer et les factures partent de là.
                    </p>
                  </>
                )}

                <SignupCard
                  title="Gérez la coloc dans un budget partagé"
                  text="Créez un budget « Coloc », invitez vos colocataires par e-mail : chacun voit en temps réel ce qu’il verse au pot commun. Reportez ces montants comme versement de chacun. Gratuit."
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" variant="ghost" className="min-h-[44px]" onClick={reset}>
                    <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" /> Effacer
                  </Button>
                  <Button type="button" variant="ghost" className="min-h-[44px]" onClick={share}>
                    <Share2 className="mr-2 h-4 w-4" aria-hidden="true" /> {copied ? 'Lien copié' : 'Partager avec la coloc'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {hasData && !resultsVisible && (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 py-3 backdrop-blur">
            <div className="mx-auto flex max-w-md items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Total de la coloc : {euros(r.total)}</p>
                <p className="truncate text-sm font-semibold tabular-nums text-foreground">
                  {r.shares.map((s) => `${s.name} ${euros(s.total)}`).join(' · ')}
                </p>
              </div>
              <Button type="button" onClick={() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="min-h-[44px] shrink-0">Détail</Button>
            </div>
          </div>
        )}

        <ToolArticle>
          <section>
            <h2>Comment répartir le loyer en colocation ?</h2>
            <p className="mt-4 text-lg">
              Il n’y a pas de règle imposée : c’est aux colocataires de se mettre d’accord, de préférence <strong>avant d’emménager</strong>, et de l’écrire
              (dans un pacte de colocation, un simple message partagé ou un budget commun). Trois méthodes reviennent le plus souvent.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li><strong>À parts égales</strong> : le loyer divisé par le nombre de colocataires. C’est la plus simple, et la plus juste quand les chambres se valent.</li>
              <li><strong>Selon la chambre</strong> : les pièces communes (cuisine, salon, salle de bain) profitent à tous, donc une partie du loyer se partage à parts égales ; le reste suit la surface de chaque chambre. Notre calculateur partage {pct(COMMON_SHARE)} du loyer à parts égales.</li>
              <li><strong>Selon les revenus</strong> : chacun paie en proportion de ses revenus nets. C’est plus rare entre amis, mais utile quand les écarts sont importants.</li>
            </ul>
            <p className="mt-4">Les factures communes (énergie, internet, assurance, produits du quotidien) se partagent presque toujours à parts égales.</p>
          </section>

          <section>
            <h2>Exemple : 3 colocataires</h2>
            <p className="mt-4">
              Dans notre exemple, trois colocataires louent un appartement {euros(COLOC_EXAMPLE.rent)} par mois, charges comprises, avec des chambres de
              {' '}{COLOC_EXAMPLE.roommates.map((m) => `${m.room} m²`).join(', ').replace(/, ([^,]*)$/, ' et $1')}. Les factures communes (énergie, internet, assurance, produits communs)
              font {euros(examples[0].bills)} par mois, soit {euros(examples[0].shares[0].bills)} chacun.
            </p>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <caption className="sr-only">Part mensuelle de chaque colocataire selon la méthode, dans notre exemple</caption>
                <thead>
                  <tr className="border-b border-border text-foreground">
                    <th scope="col" className="py-2 pr-3 font-semibold">Colocataire</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Parts égales</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Selon la chambre</th>
                    <th scope="col" className="py-2 text-right font-semibold">Selon les revenus</th>
                  </tr>
                </thead>
                <tbody>
                  {COLOC_EXAMPLE.roommates.map((m, i) => (
                    <tr key={m.name} className="border-b border-border/60">
                      <th scope="row" className="py-2 pr-3 font-medium text-foreground">{m.name} <span className="font-normal text-muted-foreground">({m.room} m², {euros(m.income)} nets)</span></th>
                      {examples.map((e, k) => <td key={k} className="py-2 pr-3 text-right tabular-nums">{euros(e.shares[i].total)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm">Montants mensuels, loyer et factures compris. Avec la méthode « selon la chambre », l’écart entre la plus petite et la plus grande chambre est de {euros(examples[1].shares[2].total - examples[1].shares[0].total)} par mois.</p>
          </section>

          <section>
            <h2>Factures, courses et pot commun</h2>
            <p className="mt-4">
              Le plus simple pour éviter les comptes d’apothicaire : un <strong>pot commun</strong>. Chacun y verse sa part au début du mois, et le loyer,
              les factures et les courses communes partent de là. Les dépenses de chacun (sa nourriture perso, ses sorties) restent à part.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>Listez ensemble ce qui est commun : produits ménagers, papier, huile, sel… et ce qui ne l’est pas.</li>
              <li>Ramenez les factures irrégulières au mois : une facture d’énergie tous les deux mois se divise par 2, une assurance annuelle par 12.</li>
              <li>Faites le point une fois par mois, et réajustez quand quelqu’un arrive ou part.</li>
            </ul>
          </section>

          <section>
            <h2>Ce que dit la loi</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li><strong>Bail commun ou baux individuels</strong> : avec un bail commun, tous les colocataires signent le même contrat ; avec des baux individuels, chacun loue sa chambre et ne doit que son propre loyer.</li>
              <li><strong>Clause de solidarité</strong> : dans un bail commun, elle permet au propriétaire de réclamer tout le loyer à n’importe quel colocataire. Un colocataire qui part reste solidaire jusqu’à l’arrivée d’un remplaçant, et au plus tard 6 mois après la fin de son préavis.</li>
              <li><strong>Dépôt de garantie</strong> : au plus 1 mois de loyer hors charges pour un logement vide, 2 mois pour un logement meublé.</li>
              <li><strong>Aide au logement</strong> : chaque colocataire peut faire sa propre demande à la CAF, selon sa situation et sa part de loyer.</li>
            </ul>
          </section>

          <FaqList id="coloc-faq" items={FAQ} />

          <section>
            <h2>Autres outils gratuits</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              <li><Link to="/budget-personnel" className="block rounded-xl border border-border/70 bg-background p-4 font-semibold text-foreground hover:border-primary"><Users className="mb-2 h-5 w-5 text-primary" aria-hidden="true" />Budget personnel</Link></li>
              <li><Link to="/calcul-reste-a-vivre" className="block rounded-xl border border-border/70 bg-background p-4 font-semibold text-foreground hover:border-primary"><Calculator className="mb-2 h-5 w-5 text-primary" aria-hidden="true" />Calcul du reste à vivre</Link></li>
              <li><Link to="/budget-mariage" className="block rounded-xl border border-border/70 bg-background p-4 font-semibold text-foreground hover:border-primary"><Calculator className="mb-2 h-5 w-5 text-primary" aria-hidden="true" />Budget mariage</Link></li>
            </ul>
          </section>

          <section className="text-sm">
            <h2 className="!text-xl">Sources</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li><a href="https://www.service-public.gouv.fr/particuliers/vosdroits/F34661" target="_blank" rel="noopener" className="text-primary hover:underline">Service-Public.fr — Colocation : quelles sont les règles ?</a></li>
              <li><a href="https://www.service-public.gouv.fr/particuliers/vosdroits/F2044" target="_blank" rel="noopener" className="text-primary hover:underline">Service-Public.fr — Un colocataire doit-il payer les dettes après avoir donné son préavis ?</a></li>
              <li><a href="https://www.service-public.gouv.fr/particuliers/vosdroits/F31269" target="_blank" rel="noopener" className="text-primary hover:underline">Service-Public.fr — Dépôt de garantie dans un bail d’habitation</a></li>
              <li><a href="https://www.caf.fr/allocataires/aides-et-demarches/droits-et-prestations/logement/les-aides-personnelles-au-logement" target="_blank" rel="noopener" className="text-primary hover:underline">CAF — Les aides personnelles au logement</a></li>
            </ul>
            <p className="mt-3">Ce calculateur donne une répartition indicative ; il ne remplace pas votre bail ni un conseil juridique.</p>
          </section>
        </ToolArticle>
      </main>
      <Footer />
    </div>
  );
}
