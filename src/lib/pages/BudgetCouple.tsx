// src/lib/pages/BudgetCouple.tsx
// ============================================================================
// « Budget couple » — a free calculator (no account, nothing sent): both net
// incomes and the shared charges in, what each partner pays into the joint
// account and the spending money they keep out, with the three methods of
// the app (50/50, au prorata, même argent de poche) side by side. Targets
// « budget couple », « répartition des dépenses dans un couple », « calcul
// prorata salaire couple » and their variants; each h2 is a question people
// search, answered in its first sentences. The example is fictitious and
// labelled; legal points are sourced on the page (Légifrance).
// ============================================================================

import { Link } from 'react-router-dom';
import { BookOpen, Calculator, Heart, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CoupleCalculator } from '@/components/tools/CoupleCalculator';
import { FaqList, ToolArticle } from '@/components/tools/ToolKit';
import { CurrencyPicker, useCurrency } from '@/components/tools/CurrencyPicker';
import { scaleAmounts } from '@/lib/tools/scaleAmounts';
import { COUPLE_FR } from '@/i18n/fr/couple';
import { COUPLE_EXAMPLE as REFERENCE_EXAMPLE, COUPLE_METHODS, compareMethods } from '@/lib/tools/couple';
import { COUPLE_FAQ as FAQ } from '@/seo/faq-couple';

const METHOD_NAMES = { egal: '50/50', prorata: 'Au prorata des revenus', reste: 'Même argent de poche' } as const;

export default function BudgetCouple() {
  const { code, setCode, format } = useCurrency('fr');
  const { money: euros, pct } = format;
  // L’exemple fictif dans la devise du visiteur.
  const COUPLE_EXAMPLE = scaleAmounts(REFERENCE_EXAMPLE, format.example);
  const ex = compareMethods(COUPLE_EXAMPLE);
  const [a, b] = COUPLE_EXAMPLE.partners;
  const shared = ex.egal.shared;
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
              Budget couple&nbsp;: combien chacun verse au compte commun&nbsp;?
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Vos deux revenus, vos charges communes : voyez ce que chacun verse et l’argent de poche qui lui reste, à 50/50, au prorata des salaires
              ou pour garder le même reste. Les trois méthodes côte à côte, mises à jour pendant la saisie.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              <ShieldCheck className="mr-1 inline h-4 w-4 align-[-3px] text-success" aria-hidden="true" />Vos chiffres restent sur cet appareil : rien n’est envoyé.
            </p>
          </div>
        </section>

        <CoupleCalculator t={COUPLE_FR} format={format} storageKey="bf:budget-couple:v1" example={COUPLE_EXAMPLE} beforeIncomes={<CurrencyPicker locale="fr" value={code} onChange={setCode} />} />

        <ToolArticle>
          <section>
            <h2>Comment faire un budget de couple ?</h2>
            <p className="mt-4 text-lg">
              Un budget de couple sépare ce qui est <strong>commun</strong> de ce qui est à chacun. Additionnez les charges communes du mois,
              décidez ensemble comment les partager, puis chacun verse sa part sur un compte commun et garde le reste pour lui. Cinq étapes suffisent :
            </p>
            <ol className="mt-4 list-decimal space-y-2 pl-5">
              <li><strong>Vos revenus nets</strong> : le salaire de chacun après l’impôt prélevé à la source, plus les allocations et autres revenus réguliers.</li>
              <li><strong>Les charges communes</strong> : logement, énergie, courses, assurances, abonnements, enfants. Les dépenses annuelles (taxe foncière, assurance auto) se divisent par 12.</li>
              <li><strong>L’épargne commune</strong> : vacances, apport, épargne de précaution. Mettez-la de côté en début de mois, comme une charge.</li>
              <li><strong>La méthode de partage</strong> : 50/50, au prorata des revenus ou même argent de poche. Le calculateur ci-dessus les compare pour vous.</li>
              <li><strong>Un virement automatique</strong> de chacun vers le compte commun le jour de la paie, et un point ensemble une fois par mois.</li>
            </ol>
            <p className="mt-4">Ce que chacun dépense pour lui seul (son téléphone, ses sorties, un crédit perso, un envoi d’argent à sa famille) reste en dehors du budget commun : il sort de son argent de poche.</p>
          </section>

          <section>
            <h2>Comment répartir les dépenses dans un couple ?</h2>
            <p className="mt-4">Trois méthodes reviennent le plus souvent ; aucune n’est imposée, l’important est de la choisir ensemble.</p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li><strong>50/50</strong> : chacun verse la moitié des charges communes. Le plus simple, et juste quand les revenus sont proches.</li>
              <li><strong>Au prorata des revenus</strong> : chacun verse la même part de son salaire. Part de chacun = charges communes × son salaire ÷ la somme des deux salaires.</li>
              <li><strong>Même argent de poche</strong> : celui qui gagne plus verse plus, jusqu’à ce qu’il vous reste la même somme à chacun.</li>
            </ul>
            <p className="mt-6">
              <strong>Exemple fictif</strong> : {a.name} gagne {euros(a.income)} nets par mois, {b.name} {euros(b.income)}. Leurs charges communes font {euros(shared)} par mois,
              dont {euros(COUPLE_EXAMPLE.charges[0])} de loyer et {euros(COUPLE_EXAMPLE.charges[6])} d’épargne commune.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[460px] text-left text-sm">
                <caption className="sr-only">Ce que chacun verse au compte commun et garde chaque mois selon la méthode, dans notre exemple</caption>
                <thead>
                  <tr className="border-b border-border text-foreground">
                    <th scope="col" className="py-2 pr-3 font-semibold">Méthode</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">{a.name} verse</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">{b.name} verse</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">{a.name} garde</th>
                    <th scope="col" className="py-2 text-right font-semibold">{b.name} garde</th>
                  </tr>
                </thead>
                <tbody>
                  {COUPLE_METHODS.map((m) => (
                    <tr key={m} className="border-b border-border/60">
                      <th scope="row" className="py-2 pr-3 font-medium text-foreground">{METHOD_NAMES[m]}</th>
                      <td className="py-2 pr-3 text-right tabular-nums">{euros(ex[m].shares[0].contribution)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{euros(ex[m].shares[1].contribution)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{euros(ex[m].shares[0].keeps)}</td>
                      <td className="py-2 text-right tabular-nums">{euros(ex[m].shares[1].keeps)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm">
              Montants mensuels. À 50/50, {b.name} garde {euros(ex.egal.shares[1].keeps)} contre {euros(ex.egal.shares[0].keeps)} pour {a.name} ; au prorata, chacun consacre
              {' '}{pct(ex.prorata.shares[0].effort ?? 0)} de son revenu au foyer.
            </p>
          </section>

          <section>
            <h2>50/50 ou au prorata : quelle méthode choisir ?</h2>
            <p className="mt-4">
              <strong>Le 50/50 convient quand vos revenus sont proches.</strong> Dès qu’ils s’éloignent, il pèse bien plus lourd sur celui qui gagne le moins, qui peut
              se retrouver sans marge alors que l’autre en a beaucoup. <strong>Le prorata</strong> demande à chacun le même effort : c’est la méthode la plus courante
              quand les salaires sont différents, et celle que la loi retient par défaut pour les couples mariés et pacsés (voir plus bas).
              <strong> Le même argent de poche</strong> va plus loin : c’est presque tout mettre en commun, en gardant chacun une somme à soi.
            </p>
            <p className="mt-4">Quelle que soit la méthode, revoyez-la quand un salaire change : une naissance, un temps partiel, un nouvel emploi.</p>
          </section>

          <section>
            <h2>Combien verser sur le compte commun ?</h2>
            <p className="mt-4">
              Le total des charges communes du mois, plus l’épargne commune et les dépenses annuelles ramenées au mois (÷ 12). Ajoutez une petite marge, 5 à 10 %,
              pour qu’une facture plus lourde ne mette pas le compte à découvert. Puis partagez ce montant entre vous selon la méthode choisie.
            </p>
            <p className="mt-4">
              Pour aller plus loin : <Link to="/blog/compte-commun-couple-argent-de-poche" className="font-semibold text-primary hover:underline">compte commun en couple : combien verser, combien garder</Link>.
            </p>
          </section>

          <section>
            <h2>Marié, pacsé ou en concubinage : ce que dit la loi</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li><strong>Mariés</strong> : sauf si le contrat de mariage en dispose autrement, les époux contribuent aux charges du mariage à proportion de leurs facultés respectives (Code civil, article 214).</li>
              <li><strong>Pacsés</strong> : les partenaires se doivent une aide matérielle, proportionnelle à leurs facultés respectives, sauf accord contraire (article 515-4).</li>
              <li><strong>Dépenses de la vie courante</strong> : pour les époux comme pour les partenaires de Pacs, une dette contractée par l’un pour les besoins du ménage engage en principe l’autre solidairement, sauf dépense manifestement excessive (articles 220 et 515-4).</li>
              <li><strong>En concubinage</strong> : aucune règle de partage n’est prévue ; c’est à vous de vous mettre d’accord, et de garder une trace de qui paie quoi si vos apports sont inégaux.</li>
            </ul>
          </section>

          <FaqList id="couple-faq" items={FAQ} />

          <section>
            <h2>À lire aussi</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              <li><Link to="/blog/budget-couple-regles-gerer-argent" className="block rounded-xl border border-border/70 bg-background p-4 font-semibold text-foreground hover:border-primary"><Heart className="mb-2 h-5 w-5 text-primary" aria-hidden="true" />7 règles pour gérer l’argent à deux</Link></li>
              <li><Link to="/calcul-reste-a-vivre" className="block rounded-xl border border-border/70 bg-background p-4 font-semibold text-foreground hover:border-primary"><Calculator className="mb-2 h-5 w-5 text-primary" aria-hidden="true" />Calcul du reste à vivre</Link></li>
              <li><Link to="/tableau-budget-familial-gratuit" className="block rounded-xl border border-border/70 bg-background p-4 font-semibold text-foreground hover:border-primary"><BookOpen className="mb-2 h-5 w-5 text-primary" aria-hidden="true" />Tableau de budget gratuit (Excel, PDF)</Link></li>
            </ul>
          </section>

          <section className="text-sm">
            <h2 className="!text-xl">Sources</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li><a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006422754" target="_blank" rel="noopener" className="text-primary hover:underline">Légifrance — Code civil, article 214 (contribution aux charges du mariage)</a></li>
              <li><a href="https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006070721/LEGISCTA000006136137/" target="_blank" rel="noopener" className="text-primary hover:underline">Légifrance — Code civil, articles 212 à 226 (devoirs et droits respectifs des époux)</a></li>
              <li><a href="https://www.legifrance.gouv.fr/codes/id/LEGIARTI000006428462/2026-08-06" target="_blank" rel="noopener" className="text-primary hover:underline">Légifrance — Code civil, articles 515-1 à 515-7-1 (pacte civil de solidarité)</a></li>
            </ul>
            <p className="mt-3">Ce calculateur donne une répartition indicative ; il ne remplace pas un conseil juridique ou notarial.</p>
          </section>
        </ToolArticle>
      </main>
      <Footer />
    </div>
  );
}
