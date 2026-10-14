// src/lib/pages/BudgetTemplate.tsx
// ============================================================================
// « Tableau de budget familial gratuit » — a free Excel template (monthly
// budget, couple's shared pot, year), the same sheets as a PDF to print, and
// the case for letting the app do it. Targets the "tableau budget familial
// excel / pdf gratuit" family of searches; in English (/en/free-budget-template),
// "free budget template excel / printable" with files of its own
// (scripts/templates/make-template-en.*).
// ============================================================================

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarRange, CheckCircle2, Download, FileSpreadsheet, Printer, Scale, Wallet } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { TEMPLATE_FAQ } from '@/seo/faq';
import { TEMPLATE_FAQ_EN } from '@/seo/faq-template-en';
import { defineMessages, useT } from '@/i18n/runtime';
import { track } from '@/lib/analytics';

const TAB_ICONS = [Wallet, Scale, CalendarRange];

const link = (to: string, label: string) => <Link to={to} className="font-medium text-primary hover:underline">{label}</Link>;

const M = defineMessages<{
  xlsx: string; pdf: string; xlsxEvent: string; badge: string; h1: string; lead: string; leadFile: string;
  xlsxLabel: string; pdfLabel: string; sizes: string; orApp: string; insideTitle: string;
  tab: (title: string) => string; tabs: Array<{ title: string; text: string }>;
  stepsTitle: string; steps: Array<[string, string]>; further: ReactNode;
  appTitle: string; appPoints: string[]; appCta: string; appImageAlt: string; faqTitle: string;
  faq: Array<{ q: string; a: string }>;
}>({
  fr: {
    xlsx: '/telechargements/tableau-budget-familial-budgetfamille.xlsx',
    pdf: '/telechargements/tableau-budget-familial-a-imprimer.pdf',
    xlsxEvent: 'tableau-budget-familial.xlsx',
    badge: 'Excel · Google Sheets · PDF à imprimer',
    h1: 'Tableau de budget familial gratuit',
    lead: 'Un modèle simple pour suivre le budget mensuel du foyer : revenus, dépenses, épargne, et la répartition du compte commun dans un couple.',
    leadFile: 'En Excel, les calculs sont déjà faits ; en PDF, il s’imprime et se remplit au stylo.',
    xlsxLabel: 'Tableau Excel (.xlsx)',
    pdfLabel: 'PDF à imprimer',
    sizes: 'Gratuit, sans inscription. Excel 17 Ko · PDF A4, 3 pages, 120 Ko.',
    orApp: 'Ou laisser l’app calculer',
    insideTitle: 'Ce que contient le tableau',
    tab: (title) => `Onglet « ${title} »`,
    tabs: [
      { title: 'Budget du mois', text: 'Revenus, 13 postes de charges (logement, énergie, courses, enfants…), épargne, et le reste du mois calculé tout seul.' },
      { title: 'Pot commun', text: 'Pour les couples : ce que chacun verse selon la méthode 50/50, au prorata des salaires ou même argent de poche.' },
      { title: 'Année', text: 'Les 12 mois côte à côte, avec les dépenses qui ne tombent qu’une fois (taxe foncière, prime…) et le reste cumulé.' },
    ],
    stepsTitle: 'Comment faire son budget familial en 4 étapes',
    steps: [
      ['1. Notez vos revenus nets', ' : salaires, allocations, primes. Pour un couple, un salaire par ligne.'],
      ['2. Listez vos dépenses mensuelles', ' : charges fixes (loyer, énergie, assurances, abonnements) puis dépenses courantes (courses, transport, loisirs).'],
      ['3. Décidez de votre épargne', ' avant de dépenser : fonds d’urgence, vacances, projet. Un repère courant est 10 à 20 % des revenus.'],
      ['4. Regardez le reste du mois', ' : positif, vous pouvez épargner davantage ; négatif, une dépense ou la répartition est à revoir.'],
    ],
    further: (
      <>
        Pour aller plus loin : {link('/blog/5-etapes-gerer-budget-familial-2025', 'établir un budget familial en 5 étapes')},{' '}
        {link('/blog/budget-famille-4-personnes-exemple', 'un exemple de budget pour une famille de 4')},{' '}
        {link('/blog/combien-epargner-par-mois-objectif-date', 'combien épargner par mois pour un objectif')},{' '}
        {link('/calcul-reste-a-vivre', 'calculer son reste à vivre')} et{' '}
        {link('/blog/compte-commun-couple-argent-de-poche', 'comment répartir le compte commun en couple')}.
      </>
    ),
    appTitle: 'Le même budget, sans recopier chaque mois',
    appPoints: [
      'Chaque mois se remplit à partir de vos règles (loyer mensuel, taxe annuelle, cantine certains mois)',
      'Partagé avec votre conjoint, en temps réel, sur téléphone',
      'Pot commun, argent de poche et charges perso privées',
      'Gratuit, sans connexion bancaire obligatoire',
    ],
    appCta: 'Essayer Budget Famille gratuitement',
    appImageAlt: 'Le budget du mois dans l’application Budget Famille',
    faqTitle: 'Questions fréquentes',
    faq: TEMPLATE_FAQ,
  },
  en: {
    xlsx: '/telechargements/budget-template.xlsx',
    pdf: '/telechargements/budget-template-printable.pdf',
    xlsxEvent: 'budget-template.xlsx',
    badge: 'Excel · Google Sheets · Printable PDF',
    h1: 'Free family budget template',
    lead: 'A simple template to track your household’s monthly budget: income, spending, savings, and how a couple splits the joint account.',
    leadFile: 'In Excel the math is already done; the PDF prints out and fills in with a pen. Any currency.',
    xlsxLabel: 'Excel template (.xlsx)',
    pdfLabel: 'Printable PDF',
    sizes: 'Free, no sign-up. Excel 14 KB · A4 PDF, 3 pages, 55 KB.',
    orApp: 'Or let the app do the math',
    insideTitle: 'What’s inside',
    tab: (title) => `“${title}” tab`,
    tabs: [
      { title: 'Monthly budget', text: 'Income, 13 kinds of bills (housing, energy, groceries, children…), savings, and what’s left for the month, worked out for you.' },
      { title: 'Joint pot', text: 'For couples: what each person pays in with a 50/50 split, in proportion to pay, or the same spending money for both.' },
      { title: 'Year', text: 'The 12 months side by side, with the costs that come once a year (property tax, a bonus…) and the running total.' },
    ],
    stepsTitle: 'How to make a family budget in 4 steps',
    steps: [
      ['1. Write down your take-home pay', ': salaries, benefits, bonuses. For a couple, one pay per line.'],
      ['2. List your monthly spending', ': fixed bills (rent, energy, insurance, subscriptions), then day-to-day spending (groceries, transport, fun).'],
      ['3. Decide on your savings', ' before you spend: emergency fund, holidays, a goal. A common benchmark is 10 to 20% of income.'],
      ['4. Look at what’s left for the month', ': positive, you can save more; negative, a bill or the split needs another look.'],
    ],
    further: (
      <>
        Going further: {link('/en/50-30-20-budget-calculator', 'the 50/30/20 budget calculator')},{' '}
        {link('/en/leftover-income-calculator', 'work out your leftover income')},{' '}
        {link('/en/rent-split-calculator', 'split the rent with roommates')} and{' '}
        {link('/en/wedding-budget-calculator', 'budget for a wedding')}.
      </>
    ),
    appTitle: 'The same budget, without copying it every month',
    appPoints: [
      'Every month fills in from your rules (monthly rent, a yearly tax, school meals some months)',
      'Shared with your partner, in real time, on your phone',
      'Joint pot, spending money and private personal expenses',
      'Free, no bank connection required',
    ],
    appCta: 'Try Budget Famille for free',
    appImageAlt: 'The monthly budget in the Budget Famille app',
    faqTitle: 'Frequently asked questions',
    faq: TEMPLATE_FAQ_EN,
  },
});

const trackDownload = (fileName: string) => track('file_download', { file_name: fileName });

export default function BudgetTemplate() {
  const t = useT(M);
  const file = (url: string) => url.slice(url.lastIndexOf('/') + 1);
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="px-4 pt-14 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-1.5 text-sm font-semibold text-success">
              <FileSpreadsheet className="h-4 w-4" aria-hidden="true" /> {t.badge}
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl [text-wrap:balance]">
              {t.h1}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
              {t.lead} {t.leadFile}
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-14 px-8 text-lg">
                <a href={t.xlsx} download onClick={() => trackDownload(t.xlsxEvent)}>
                  <Download className="mr-2 h-5 w-5" aria-hidden="true" /> {t.xlsxLabel}
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 border-2 px-8 text-lg">
                <a href={t.pdf} download onClick={() => trackDownload(file(t.pdf))}>
                  <Printer className="mr-2 h-5 w-5" aria-hidden="true" /> {t.pdfLabel}
                </a>
              </Button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {t.sizes}{' '}
              <Link to="/signup" className="font-medium text-primary hover:underline">{t.orApp}</Link>
            </p>
          </div>
        </section>

        <section className="bg-card px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="inside-title">
          <div className="mx-auto max-w-5xl">
            <h2 id="inside-title" className="text-center font-display text-3xl font-bold text-foreground">{t.insideTitle}</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {t.tabs.map((tab, i) => {
                const Icon = TAB_ICONS[i];
                return (
                  <article key={tab.title} className="rounded-2xl border border-border/70 bg-background p-6">
                    <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                    <h3 className="mt-3 text-lg font-bold text-foreground">{t.tab(tab.title)}</h3>
                    <p className="mt-2 text-muted-foreground">{tab.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-3xl font-bold text-foreground">{t.stepsTitle}</h2>
            <ol className="mt-6 space-y-4 text-lg text-muted-foreground">
              {t.steps.map(([title, text]) => (
                <li key={title}><strong className="text-foreground">{title}</strong>{text}</li>
              ))}
            </ol>
            <p className="mt-6 text-muted-foreground">{t.further}</p>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl items-center gap-10 rounded-3xl bg-gradient-to-br from-slate-900 to-sky-900 p-8 text-white sm:p-12 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h2 className="font-display text-3xl font-bold">{t.appTitle}</h2>
              <ul className="mt-6 space-y-3 text-slate-200">
                {t.appPoints.map((p) => (
                  <li key={p} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" /> {p}</li>
                ))}
              </ul>
              <Button asChild size="lg" variant="secondary" className="mt-8 h-12 bg-white text-slate-900 hover:bg-slate-100">
                <Link to="/signup">{t.appCta} <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
              </Button>
            </div>
            <img src="/images/app/month-light.jpg" alt={t.appImageAlt} width={390} height={640} loading="lazy" className="mx-auto h-auto w-full max-w-[240px] rounded-[26px] border border-white/10" />
          </div>
        </section>

        <section className="bg-card px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="template-faq">
          <div className="mx-auto max-w-3xl">
            <h2 id="template-faq" className="font-display text-3xl font-bold text-foreground">{t.faqTitle}</h2>
            <dl className="mt-8 space-y-6">
              {t.faq.map((f) => (
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
