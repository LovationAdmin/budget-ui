// src/lib/pages/ResteAVivre.tsx
// ============================================================================
// « Calcul du reste à vivre » — a free calculator (no account, nothing sent):
// household, net income and fixed charges in, the monthly reste à vivre out,
// per person, per day and per INSEE consumption unit, with the HCSF 35 %
// borrowing benchmark and the legal floor of an over-indebtedness procedure.
// Targets « calcul reste à vivre » and its variants; every figure on the page
// is either the visitor's own or sourced below. The calculator itself is
// shared with the English page (src/components/tools/ResteAVivreCalculator.tsx).
// ============================================================================

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ResteAVivreCalculator } from '@/components/tools/ResteAVivreCalculator';
import { FORMAT_FR } from '@/i18n/format';
import { RAV_EXAMPLE_FR as EXAMPLE, RESTE_A_VIVRE_FR } from '@/i18n/fr/resteAVivre';
import { money } from '@/lib/budget/format';
import { RAV_FAQ as FAQ } from '@/seo/faq';
import { CHARGE_FIELDS, RSA_DATE, computeResteAVivre, rsaFloor } from '@/lib/tools/resteAVivre';

const { money: euros, pct } = FORMAT_FR;

export default function ResteAVivre() {
  const example = useMemo(() => computeResteAVivre(EXAMPLE.household, EXAMPLE.incomes, EXAMPLE.charges), []);

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

        <ResteAVivreCalculator t={RESTE_A_VIVRE_FR} format={FORMAT_FR} storageKey="bf:reste-a-vivre:v1" example={EXAMPLE} />

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
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-foreground">
                      <th className="py-2 font-semibold">Poste (exemple)</th>
                      <th className="py-2 text-right font-semibold">Par mois</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    <tr><td className="py-2">Salaires nets</td><td className="py-2 text-right tabular-nums">{euros(example.revenus)}</td></tr>
                    {CHARGE_FIELDS.filter((f) => EXAMPLE.charges[f.key]).map((f) => (
                      <tr key={f.key}><td className="py-2">{f.label}</td><td className="py-2 text-right tabular-nums">− {euros(EXAMPLE.charges[f.key] ?? 0)}</td></tr>
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
