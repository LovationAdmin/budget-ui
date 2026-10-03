// src/lib/pages/BudgetTemplate.tsx
// ============================================================================
// « Tableau de budget familial gratuit » — a free Excel template (monthly
// budget, couple's shared pot, year), the same sheets as a PDF to print, and
// the case for letting the app do it. Targets the "tableau budget familial
// excel / pdf gratuit" family of searches.
// ============================================================================

import { Link } from 'react-router-dom';
import { ArrowRight, CalendarRange, CheckCircle2, Download, FileSpreadsheet, Printer, Scale, Wallet } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { TEMPLATE_FAQ as FAQ } from '@/seo/faq';

export const TEMPLATE_URL = '/telechargements/tableau-budget-familial-budgetfamille.xlsx';
export const TEMPLATE_PDF_URL = '/telechargements/tableau-budget-familial-a-imprimer.pdf';

const TABS = [
  { icon: Wallet, title: 'Budget du mois', text: 'Revenus, 13 postes de charges (logement, énergie, courses, enfants…), épargne, et le reste du mois calculé tout seul.' },
  { icon: Scale, title: 'Pot commun', text: 'Pour les couples : ce que chacun verse selon la méthode 50/50, au prorata des salaires ou même argent de poche.' },
  { icon: CalendarRange, title: 'Année', text: 'Les 12 mois côte à côte, avec les dépenses qui ne tombent qu’une fois (taxe foncière, prime…) et le reste cumulé.' },
];



function trackDownload(fileName: string) {
  try {
    (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.('event', 'file_download', { file_name: fileName });
  } catch {
    // Analytics is optional.
  }
}

export default function BudgetTemplate() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="px-4 pt-14 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-1.5 text-sm font-semibold text-success">
              <FileSpreadsheet className="h-4 w-4" aria-hidden="true" /> Excel · Google Sheets · PDF à imprimer
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl [text-wrap:balance]">
              Tableau de budget familial gratuit
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
              Un modèle simple pour suivre le budget mensuel du foyer : revenus, dépenses, épargne, et la répartition du compte commun dans un couple.
              En Excel, les calculs sont déjà faits ; en PDF, il s’imprime et se remplit au stylo.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-14 px-8 text-lg">
                <a href={TEMPLATE_URL} download onClick={() => trackDownload('tableau-budget-familial.xlsx')}>
                  <Download className="mr-2 h-5 w-5" aria-hidden="true" /> Tableau Excel (.xlsx)
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 border-2 px-8 text-lg">
                <a href={TEMPLATE_PDF_URL} download onClick={() => trackDownload('tableau-budget-familial-a-imprimer.pdf')}>
                  <Printer className="mr-2 h-5 w-5" aria-hidden="true" /> PDF à imprimer
                </a>
              </Button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Gratuit, sans inscription. Excel 17 Ko · PDF A4, 3 pages, 120 Ko.{' '}
              <Link to="/signup" className="font-medium text-primary hover:underline">Ou laisser l’app calculer</Link>
            </p>
          </div>
        </section>

        <section className="bg-card px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="inside-title">
          <div className="mx-auto max-w-5xl">
            <h2 id="inside-title" className="text-center font-display text-3xl font-bold text-foreground">Ce que contient le tableau</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {TABS.map((t) => (
                <article key={t.title} className="rounded-2xl border border-border/70 bg-background p-6">
                  <t.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  <h3 className="mt-3 text-lg font-bold text-foreground">Onglet « {t.title} »</h3>
                  <p className="mt-2 text-muted-foreground">{t.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-3xl font-bold text-foreground">Comment faire son budget familial en 4 étapes</h2>
            <ol className="mt-6 space-y-4 text-lg text-muted-foreground">
              <li><strong className="text-foreground">1. Notez vos revenus nets</strong> : salaires, allocations, primes. Pour un couple, un salaire par ligne.</li>
              <li><strong className="text-foreground">2. Listez vos dépenses mensuelles</strong> : charges fixes (loyer, énergie, assurances, abonnements) puis dépenses courantes (courses, transport, loisirs).</li>
              <li><strong className="text-foreground">3. Décidez de votre épargne</strong> avant de dépenser : fonds d’urgence, vacances, projet. Un repère courant est 10 à 20 % des revenus.</li>
              <li><strong className="text-foreground">4. Regardez le reste du mois</strong> : positif, vous pouvez épargner davantage ; négatif, une dépense ou la répartition est à revoir.</li>
            </ol>
            <p className="mt-6 text-muted-foreground">
              Pour aller plus loin : <Link to="/blog/5-etapes-gerer-budget-familial-2025" className="font-medium text-primary hover:underline">établir un budget familial en 5 étapes</Link>,{' '}
              <Link to="/blog/budget-famille-4-personnes-exemple" className="font-medium text-primary hover:underline">un exemple de budget pour une famille de 4</Link>,{' '}
              <Link to="/blog/combien-epargner-par-mois-objectif-date" className="font-medium text-primary hover:underline">combien épargner par mois pour un objectif</Link> et{' '}
              <Link to="/blog/compte-commun-couple-argent-de-poche" className="font-medium text-primary hover:underline">comment répartir le compte commun en couple</Link>.
            </p>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl items-center gap-10 rounded-3xl bg-gradient-to-br from-slate-900 to-sky-900 p-8 text-white sm:p-12 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h2 className="font-display text-3xl font-bold">Le même budget, sans recopier chaque mois</h2>
              <ul className="mt-6 space-y-3 text-slate-200">
                {[
                  'Chaque mois se remplit à partir de vos règles (loyer mensuel, taxe annuelle, cantine certains mois)',
                  'Partagé avec votre conjoint, en temps réel, sur téléphone',
                  'Pot commun, argent de poche et charges perso privées',
                  'Gratuit, sans connexion bancaire obligatoire',
                ].map((p) => (
                  <li key={p} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" /> {p}</li>
                ))}
              </ul>
              <Button asChild size="lg" variant="secondary" className="mt-8 h-12 bg-white text-slate-900 hover:bg-slate-100">
                <Link to="/signup">Essayer Budget Famille gratuitement <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
              </Button>
            </div>
            <img src="/images/app/month-light.jpg" alt="Le budget du mois dans l’application Budget Famille" width={390} height={640} loading="lazy" className="mx-auto h-auto w-full max-w-[240px] rounded-[26px] border border-white/10" />
          </div>
        </section>

        <section className="bg-card px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="template-faq">
          <div className="mx-auto max-w-3xl">
            <h2 id="template-faq" className="font-display text-3xl font-bold text-foreground">Questions fréquentes</h2>
            <dl className="mt-8 space-y-6">
              {FAQ.map((f) => (
                <div key={f.q}>
                  <dt className="font-semibold text-foreground">{f.q}</dt>
                  <dd className="mt-2 text-muted-foreground">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

