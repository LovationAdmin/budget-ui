// src/lib/pages/BudgetMariage.tsx
// ============================================================================
// « Budget mariage » — a free calculator (no account, nothing sent): number of
// guests, the couple's own quotes (caterer and drinks per guest, every other
// poste as a total), the wedding month and what is already saved in; the
// total, the cost per guest, the per-guest vs fixed split, a breakdown by
// poste, what 20 fewer guests save and the amount to put aside each month out.
// Targets « budget mariage », « calcul budget mariage » and their variants.
// There is no official average: every figure on the page is the visitor's own
// or the fictitious example, labelled as such wherever it shows. The
// calculator itself (MariageCalculator) is shared with
// /en/wedding-budget-calculator.
// ============================================================================

import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, ShieldCheck, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { Button } from '@/components/ui/button';
import { MariageCalculator, useMariageCalculator } from '@/components/tools/MariageCalculator';
import { FaqList, ToolArticle } from '@/components/tools/ToolKit';
import { useMemo } from 'react';
import { CurrencyPicker, useCurrency } from '@/components/tools/CurrencyPicker';
import { scaleAmounts } from '@/lib/tools/scaleAmounts';
import { MARIAGE_FR } from '@/i18n/fr/mariage';
import { MARIAGE_FAQ } from '@/seo/faq-mariage';
import { EXAMPLE as REFERENCE_EXAMPLE, FEWER_GUESTS, POSTE_FIELDS, exampleResult } from '@/lib/tools/mariage';


export default function BudgetMariage() {
  const { code, setCode, format } = useCurrency('fr');
  const { money: euros, moneyExact: money, pct } = format;
  // L’exemple fictif dans la devise du visiteur (invités et mois ne changent pas).
  const EXAMPLE = useMemo(() => scaleAmounts(REFERENCE_EXAMPLE, format.example, ['guests', 'monthsAhead']), [format]);
  const ex = exampleResult(EXAMPLE);
  const calc = useMariageCalculator({ t: MARIAGE_FR, format, storageKey: 'bf:budget-mariage:v1', example: EXAMPLE });
  const { fillExample, scrollToResults, projectYear } = calc;

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
              Budget mariage{'\u00a0'}: calculez le coût de votre mariage
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Invités, traiteur, lieu, tenues : additionnez vos devis, voyez le coût par invité et ce qu’il faut mettre de côté
              chaque mois d’ici le jour J. Le résultat se met à jour pendant la saisie.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              <ShieldCheck className="mr-1 inline h-4 w-4 align-[-3px] text-success" aria-hidden="true" />Vos chiffres restent sur cet appareil : rien n’est envoyé.
            </p>
            <LanguageSwitch className="mt-3" />
            <div className="mt-6 flex flex-col items-center gap-1.5">
              <Button type="button" variant="outline" className="min-h-[44px] bg-card" onClick={fillExample}>
                <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" /> Remplir avec un exemple
              </Button>
              <p className="text-xs text-muted-foreground">{MARIAGE_FR.exampleNote}.</p>
            </div>
          </div>
        </section>

        <MariageCalculator calc={calc} t={MARIAGE_FR} format={format} beforeWedding={<CurrencyPicker locale="fr" value={code} onChange={setCode} />} />

        <ToolArticle>
          <section>
            <h2>Comment calculer le budget de son mariage{'\u00a0'}?</h2>
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
            <h2>Budget mariage pour 100 invités{'\u00a0'}: un exemple</h2>
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
              onClick={() => { if (fillExample()) scrollToResults(); }}
            >
              Charger cet exemple dans le calculateur <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </section>

          <section>
            <h2>Combien épargner par mois pour son mariage{'\u00a0'}?</h2>
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
            <h2>Comment réduire le budget d’un mariage{'\u00a0'}?</h2>
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
            <h2>Qui paie le mariage{'\u00a0'}?</h2>
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
              «{'\u00a0'}Mariage {projectYear}{'\u00a0'}» avec ses propres membres : invitez votre conjoint, et vos parents si vous le souhaitez, par
              e-mail ; chacun voit les mêmes chiffres en temps réel. Une cagnotte avec un objectif et une date calcule le montant à
              mettre de côté chaque mois, et une dépense peut être payée directement depuis la cagnotte. C’est gratuit, sans
              avoir à connecter votre banque.
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
