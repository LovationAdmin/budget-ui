// src/lib/pages/BudgetPersonnel.tsx
// ============================================================================
// « Votre budget perso en 2 minutes » — a free calculator (no account, nothing
// sent): net income and essential expenses in, the 50/30/20 benchmark out,
// with the real share of the needs, what remains after them, an honest split
// of that remainder between wants and savings (rule in budgetPerso.ts) and the
// wants per day. Targets « budget personnel », « règle 50/30/20 » and « combien
// épargner par mois »; every figure on the page is either the visitor's own or
// the fictitious example computed by the module. The calculator itself
// (BudgetPersoCalculator) is shared with /en/50-30-20-budget-calculator.
// ============================================================================

import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { BudgetPersoCalculator } from '@/components/tools/BudgetPersoCalculator';
import { FaqList, ToolArticle } from '@/components/tools/ToolKit';
import { BUDGET_PERSO_FR, FORMAT_FR } from '@/i18n/fr/budgetPerso';
import { money } from '@/lib/budget/format';
import { PERSO_FAQ } from '@/seo/faq-budget-personnel';
import {
  EXAMPLE, EXAMPLE_HIGH_RENT, FULL_SAVINGS_MAX_NEEDS_SHARE, NEED_FIELDS, computeBudgetPerso,
} from '@/lib/tools/budgetPerso';

const { money: euros, pct } = FORMAT_FR;

const example = computeBudgetPerso(EXAMPLE.incomes, EXAMPLE.needs);
const exampleHigh = computeBudgetPerso(EXAMPLE_HIGH_RENT.incomes, EXAMPLE_HIGH_RENT.needs);

export default function BudgetPersonnel() {
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
            <LanguageSwitch className="mt-3" />
          </div>
        </section>

        <BudgetPersoCalculator t={BUDGET_PERSO_FR} format={FORMAT_FR} storageKey="bf:budget-personnel:v1" />

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
