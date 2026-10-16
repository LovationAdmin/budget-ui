// src/lib/pages/BudgetColocation.tsx
// ============================================================================
// « Budget colocation » — a free calculator (no account, nothing sent): rent
// and shared bills in, each roommate's monthly share out, with three ways to
// split the rent (equal, by bedroom, by income). Targets « budget colocation »,
// « répartir le loyer en colocation » and their variants. Legal points are
// sourced on the page (Service-Public.fr, CAF); the example is labelled. The
// calculator itself (ColocationCalculator) is shared with
// /en/rent-split-calculator.
// ============================================================================

import { Link } from 'react-router-dom';
import { Calculator, ShieldCheck, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { ColocationCalculator } from '@/components/tools/ColocationCalculator';
import { FaqList, ToolArticle } from '@/components/tools/ToolKit';
import { CurrencyPicker, useCurrency } from '@/components/tools/CurrencyPicker';
import { scaleAmounts } from '@/lib/tools/scaleAmounts';
import { COLOCATION_FR } from '@/i18n/fr/colocation';
import { COLOC_EXAMPLE as REFERENCE_EXAMPLE, COMMON_SHARE, computeColocation } from '@/lib/tools/colocation';
import { COLOC_FAQ as FAQ } from '@/seo/faq-colocation';


export default function BudgetColocation() {
  const { code, setCode, format } = useCurrency('fr');
  const { moneyExact: euros, pct } = format;
  // L’exemple fictif dans la devise du visiteur (les surfaces des chambres ne changent pas).
  const COLOC_EXAMPLE = scaleAmounts(REFERENCE_EXAMPLE, format.example, ['room']);
  const examples = (['egal', 'chambre', 'revenus'] as const).map((m) => computeColocation({ ...COLOC_EXAMPLE, method: m }));
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
            <LanguageSwitch className="mt-3" />
          </div>
        </section>

        <ColocationCalculator t={COLOCATION_FR} format={format} storageKey="bf:budget-colocation:v1" example={COLOC_EXAMPLE} areaUnit="m²" beforeHousehold={<CurrencyPicker locale="fr" value={code} onChange={setCode} />} />

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
