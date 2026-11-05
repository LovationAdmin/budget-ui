// src/lib/pages/LandingPage.tsx
// ============================================================================
// Home page, in French (/) and in English (/en): the language comes from the
// URL. Says what the app does with real screenshots (fictional demo
// household), how to start, and answers the usual questions. No invented
// figures or testimonials. The FAQ is shared with the structured data
// published by the prerender (src/seo/faq.ts, src/seo/faq-home-en.ts).
// ============================================================================

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, Heart, Home, KeyRound, Plane, PiggyBank, User,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import SmartToolsWidget from '@/components/SmartToolsWidget';
import { localizedPath } from '@/i18n/locales';
import { defineMessages, useLocale, useT } from '@/i18n/runtime';
import { HOME_FAQ } from '@/seo/faq';
import { HOME_FAQ_EN } from '@/seo/faq-home-en';

type Icon = typeof User;

const USE_ICONS: Icon[] = [User, Heart, Home, KeyRound, Plane];
const FEATURE_IMAGES = ['foyer.jpg', 'charge-sheet.jpg', 'saving.jpg'];

/** Screenshots of the app in the page's language: French demo household in euros, English one in dollars. */
const shotOf = (file: string, locale: string) => `/images/app/${locale === 'en' ? 'en/' : ''}${file}`;

interface Feature { title: string; text: string; points: string[]; alt: string }

const M = defineMessages({
  fr: {
    h1: 'L’application de budget gratuite',
    h1Accent: 'pour la famille, le couple, la coloc et vos projets',
    intro: 'Seul ou à plusieurs, budgétez le mois et planifiez ce qui compte : charges, pot commun, épargne, voyage, mariage, travaux. Sans connexion bancaire obligatoire, sans publicité, en temps réel.',
    cta: 'Créer mon budget gratuit',
    how: 'Comment ça marche',
    trust: ['Gratuit, sans carte bancaire', 'Données chiffrées, hébergées en Europe', 'Jamais revendues'],
    heroAlt: 'Vue du mois dans Budget Famille : pot commun d’octobre, entrées, charges, épargne et reste du mois',
    stepsTitle: 'Votre budget prêt en 3 étapes',
    stepsIntro: 'Quelques minutes au départ, puis chaque mois se remplit tout seul.',
    steps: [
      { title: 'Créez votre budget', text: 'Seul, à deux, en famille ou en coloc : les revenus de chacun, et ce qu’il verse au pot commun.' },
      { title: 'Notez vos charges une fois', text: 'Loyer, énergie, abonnements, taxe foncière : chaque mois se remplit tout seul.' },
      { title: 'Répartissez, planifiez', text: 'Une contribution juste pour chacun, l’argent de poche qui reste, et vos projets avec un objectif et une date.' },
    ],
    usesTitle: 'Pas seulement pour les familles',
    usesIntro: '« Famille » au sens large : Budget Famille sert à budgétiser et planifier tout ce qui compte, seul ou à plusieurs.',
    uses: [
      { title: 'Seul', text: 'Votre budget perso : salaire, charges, épargne, et ce qui reste vraiment chaque mois. Idéal pour un premier appart ou un budget étudiant.', to: '/budget-personnel', label: 'Calculer mon budget perso' },
      { title: 'En couple', text: 'Chacun verse sa juste part au pot commun et garde son argent de poche. Les dépenses perso peuvent rester privées.', to: '/budget-couple', label: 'Calculer la part de chacun' },
      { title: 'En famille', text: 'Cantine certains mois, taxe foncière une fois par an, rentrée : chaque mois se prépare tout seul.', to: '/calcul-reste-a-vivre', label: 'Calculer notre reste à vivre' },
      { title: 'En colocation ou entre amis', text: 'Loyer, énergie, internet : invitez vos colocs par e-mail, chacun voit ce qu’il doit verser, en temps réel.', to: '/budget-colocation', label: 'Calculer la part de chacun' },
      { title: 'Pour un projet', text: 'Voyage, mariage, travaux, voiture, apport : un objectif, une date, et le montant à mettre de côté chaque mois.', to: '/budget-mariage', label: 'Calculer un budget mariage' },
    ],
    featuresTitle: 'Tout ce qu’un tableau Excel ne fait pas',
    features: [
      {
        title: 'Pot commun et argent de poche, enfin clairs',
        text: 'Pour chacun : son salaire, ce qu’il verse au pot commun et ce qui lui reste vraiment. L’assistant calcule une répartition juste sur le mois réel.',
        points: ['50/50, au prorata des salaires ou même argent de poche', 'Calculé sur le mois en cours, pas sur une moyenne', 'Historique de chaque membre, mois par mois'],
        alt: 'Onglet Foyer : salaire, versement au pot commun et argent de poche de Camille et Mehdi',
      },
      {
        title: 'Les dépenses perso, sans tout dévoiler',
        text: 'Un impôt, un envoi d’argent à la famille, un crédit perso : il se déduit de votre argent de poche, jamais du pot commun.',
        points: ['Charge perso publique ou privée', 'En privé, son nom est chiffré et visible par vous seul', 'Le montant reste juste pour tout le foyer'],
        alt: 'Nouvelle charge perso « Impôt sur le revenu », payée par Mehdi, en mode privé',
      },
      {
        title: 'Un objectif, une date : le montant se calcule',
        text: 'Vacances, mariage, travaux, apport, voiture : indiquez combien il vous faut et pour quand. Budget Famille calcule la somme à mettre de côté chaque mois et vérifie qu’elle tient.',
        points: ['Cagnottes avec objectif et progression', 'Dépenses payées avec l’épargne suivies', 'Bilan de l’année, net de ce qui a été dépensé'],
        alt: 'Cagnotte « Vacances été 2027 » : 500 € en caisse, 17 % de l’objectif',
      },
    ] as Feature[],
    aiTitle: 'Votre budget, proposé par l’IA',
    aiText: 'Décrivez votre situation (couple, famille, amis, colocataires) et vos projets : l’IA propose une répartition juste, des pistes d’économies et un plan pour tenir vos objectifs. Rien ne change tant que vous ne validez pas.',
    everywhereTitle: 'Sur téléphone, en clair ou en sombre',
    everywhereText: 'Invitez votre conjoint, votre famille ou vos colocs : chacun voit les mêmes chiffres, en temps réel. Chaque changement s’enregistre en une seconde et s’annule aussi vite.',
    spreadsheet: (template: ReactNode, rav: ReactNode) => <>Vous préférez un tableur ? {template}.{' '}Ou {rav} en 1 minute.</>,
    templateLink: 'Téléchargez notre tableau de budget familial gratuit',
    ravLink: 'calculez votre reste à vivre',
    savingsTitle: 'Combien pourriez-vous économiser ?',
    savingsIntro: 'Notre outil IA compare votre facture d’énergie, d’internet, de mobile ou d’assurance aux offres du marché. 30 secondes, sans créer de compte.',
    faqTitle: 'Questions fréquentes',
    moreQuestions: (n: number) => `Voir les ${n} autres questions`,
    blogTitle: 'Conseils budget',
    blogIntro: 'Budget perso, couple, famille, épargne et projets : nos guides pratiques.',
    allArticles: 'Tous les articles →',
    guide: 'Guide',
    latest: [
      { title: 'Compte commun en couple : combien verser, combien garder', to: '/blog/compte-commun-couple-argent-de-poche', readTime: '8 min' },
      { title: 'Combien épargner par mois pour un objectif à une date ?', to: '/blog/combien-epargner-par-mois-objectif-date', readTime: '6 min' },
      { title: 'Budget de couple : 7 règles pour gérer l’argent à deux', to: '/blog/budget-couple-regles-gerer-argent', readTime: '8 min' },
    ],
    finalTitle: 'Votre budget, enfin simple',
    finalText: 'Gratuit, sans carte bancaire. Commencez seul, invitez qui vous voulez ensuite.',
  },
  en: {
    h1: 'The free budgeting app',
    h1Accent: 'for families, couples, roommates and your goals',
    intro: 'On your own or together, budget the month and plan what matters: bills, a joint pot, savings, trips, a wedding, renovations. No bank connection required, no ads, in real time.',
    cta: 'Create my free budget',
    how: 'How it works',
    trust: ['Free, no credit card', 'Encrypted data, hosted in Europe', 'Never sold'],
    heroAlt: 'Month view in Budget Famille: the October joint pot, income, bills, savings and what’s left for the month',
    stepsTitle: 'Your budget ready in 3 steps',
    stepsIntro: 'A few minutes to start, then every month fills in by itself.',
    steps: [
      { title: 'Create your budget', text: 'On your own, as a couple, as a family or with roommates: everyone’s income, and what each person pays into the joint pot.' },
      { title: 'Enter your bills once', text: 'Rent, energy, subscriptions, property tax: every month fills in by itself.' },
      { title: 'Split and plan', text: 'A fair contribution for everyone, the spending money that’s left, and your goals with a target and a date.' },
    ],
    usesTitle: 'Not just for families',
    usesIntro: '“Famille” means family, in the broad sense: Budget Famille is for budgeting and planning everything that matters, on your own or together.',
    uses: [
      { title: 'On your own', text: 'Your personal budget: pay, bills, savings, and what’s really left each month. Ideal for a first place or a student budget.', to: '/budget-personnel', label: 'Work out my budget' },
      { title: 'As a couple', text: 'Each person pays their fair share into the joint pot and keeps their own spending money. Personal expenses can stay private.', to: '/features', label: 'See how the joint pot works' },
      { title: 'As a family', text: 'School meals some months, property tax once a year, back-to-school: every month gets ready by itself.', to: '/calcul-reste-a-vivre', label: 'Work out what’s left after bills' },
      { title: 'With roommates or friends', text: 'Rent, energy, internet: invite your roommates by email, and everyone sees what they owe, in real time.', to: '/budget-colocation', label: 'Work out everyone’s share' },
      { title: 'For a goal', text: 'A trip, a wedding, renovations, a car, a down payment: a target, a date, and the amount to set aside each month.', to: '/budget-mariage', label: 'Work out a wedding budget' },
    ],
    featuresTitle: 'Everything a spreadsheet can’t do',
    features: [
      {
        title: 'Joint pot and spending money, finally clear',
        text: 'For each person: their pay, what they put into the joint pot and what they really have left. The assistant works out a fair split on the actual month.',
        points: ['50/50, in proportion to income, or the same spending money for both', 'Worked out on the current month, not an average', 'Each member’s history, month by month'],
        alt: 'Household tab: take-home pay, joint pot contribution and spending money of Alex and Sam',
      },
      {
        title: 'Personal expenses, without revealing everything',
        text: 'A tax bill, money sent to family, a personal loan: it comes out of your spending money, never out of the joint pot.',
        points: ['Personal expense public or private', 'When private, its name is encrypted and visible to you only', 'The amount stays fair for the whole household'],
        alt: 'New personal expense “Student loan”, paid by Sam, set to private',
      },
      {
        title: 'A target, a date: the amount works itself out',
        text: 'A holiday, a wedding, renovations, a down payment, a car: say how much you need and by when. Budget Famille works out what to set aside each month and checks that it fits.',
        points: ['Savings pots with a target and progress', 'Spending paid from savings, tracked', 'The year in review, net of what was spent'],
        alt: 'Savings pot “Summer vacation 2027”: $600 saved, 20% of the target',
      },
    ] as Feature[],
    aiTitle: 'Your budget, suggested by AI',
    aiText: 'Describe your situation (couple, family, friends, roommates) and your goals: the AI suggests a fair split, ways to save and a plan to reach your targets. Nothing changes until you approve it.',
    everywhereTitle: 'On your phone, in light or dark mode',
    everywhereText: 'Invite your partner, your family or your roommates: everyone sees the same figures, in real time. Every change saves in a second and can be undone just as fast.',
    spreadsheet: (template: ReactNode, rav: ReactNode) => <>Prefer a spreadsheet? {template}.{' '}Or {rav} in 1 minute.</>,
    templateLink: 'Download our free budget template',
    ravLink: 'work out what’s left after your bills',
    savingsTitle: 'How much could you save?',
    savingsIntro: 'Our AI tool compares your energy, internet, mobile or insurance bill with market offers. 30 seconds, no account needed.',
    faqTitle: 'Frequently asked questions',
    moreQuestions: (n: number) => `See ${n} more questions`,
    blogTitle: 'Budgeting tips',
    blogIntro: 'Personal, couple and family budgets, savings and goals: our practical guides.',
    allArticles: 'All articles →',
    guide: 'Guide',
    latest: [
      { title: 'Couples’ Joint Account: How Much Each Pays In and Keeps', to: '/en/blog/joint-account-couples-spending-money', readTime: '7 min' },
      { title: 'How Much to Save Each Month to Reach a Goal by a Date', to: '/en/blog/how-much-to-save-each-month-for-a-goal', readTime: '5 min' },
      { title: 'Monthly Budget for a Family of Four: A Worked Example', to: '/en/blog/family-of-four-budget-example', readTime: '8 min' },
    ],
    finalTitle: 'Your budget, finally simple',
    finalText: 'Free, no credit card. Start on your own, invite whoever you like later.',
  },
});

const FAQ_VISIBLE = 6;

/** French punctuation: a narrow no-break space before ? ! : ; so the mark never starts a line on its own. */
const keepPunctuation = (text: string) => text.replace(/ ([?!:;])/g, '\u202F$1');

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group p-5 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-foreground">
        {keepPunctuation(q)}
        <span aria-hidden="true" className="text-xl text-primary transition-transform group-open:rotate-45">+</span>
      </summary>
      <p className="mt-3 leading-relaxed text-muted-foreground">{keepPunctuation(a)}</p>
    </details>
  );
}

function Screenshot({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      width={390}
      height={640}
      loading="lazy"
      decoding="async"
      className={`h-auto w-full max-w-[300px] rounded-[28px] border border-border/70 shadow-elevated ${className ?? ''}`}
    />
  );
}

export default function LandingPage() {
  const t = useT(M);
  const locale = useLocale();
  const to = (path: string) => localizedPath(path, locale);
  const faq = locale === 'en' ? HOME_FAQ_EN : HOME_FAQ;
  const blog = localizedPath('/blog', locale);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="px-4 pt-8 pb-16 sm:px-6 sm:pt-14 lg:px-8 lg:pt-20">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="text-center lg:text-left">
              <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl [text-wrap:balance]">
                {t.h1}{' '}
                <span className="text-primary">{t.h1Accent}</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground lg:mx-0">{t.intro}</p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <Button asChild size="lg" className="h-14 px-8 text-lg shadow-lg">
                  <Link to="/signup">{t.cta} <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 border-2 px-8 text-lg">
                  <a href="#comment-ca-marche">{t.how}</a>
                </Button>
              </div>
              <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground lg:justify-start">
                {t.trust.map((item) => (
                  <li key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" /> {item}</li>
                ))}
              </ul>
            </div>
            <div className="relative mx-auto flex justify-center">
              <img
                src={shotOf('month-light.jpg', locale)}
                alt={t.heroAlt}
                width={390}
                height={640}
                fetchPriority="high"
                className="relative z-10 h-auto w-full max-w-[320px] rounded-[32px] border border-border/70 shadow-elevated"
              />
              <img
                src={shotOf('month-dark.jpg', locale)}
                alt=""
                aria-hidden="true"
                width={390}
                height={640}
                loading="lazy"
                className="absolute -right-12 top-28 hidden h-auto w-[220px] rounded-[28px] border border-white/10 shadow-elevated xl:block"
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="comment-ca-marche" className="scroll-mt-20 bg-card px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center font-display text-3xl font-bold text-foreground">{t.stepsTitle}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">{t.stepsIntro}</p>
            <ol className="mt-12 grid gap-8 md:grid-cols-3 md:gap-10">
              {t.steps.map((s, i) => {
                return (
                  <li key={s.title} className="flex gap-4 md:block">
                    <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-display font-bold text-primary-foreground">{i + 1}</span>
                    <span className="block md:mt-4">
                      <h3 className="text-lg font-bold text-foreground">{s.title}</h3>
                      <p className="mt-2 text-muted-foreground">{s.text}</p>
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* Who it is for */}
        <section id="pour-qui" className="scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="uses-title">
          <div className="mx-auto max-w-6xl">
            <h2 id="uses-title" className="text-center font-display text-3xl font-bold text-foreground">{t.usesTitle}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">{t.usesIntro}</p>
            <ul className="mt-12 flex flex-wrap justify-center gap-4">
              {t.uses.map((u, i) => {
                const UseIcon = USE_ICONS[i];
                return (
                  <li key={u.title} className="flex w-full gap-3 rounded-2xl border border-border/70 bg-card p-5 sm:w-[calc(50%-0.5rem)] lg:w-[calc((100%-2rem)/3)]">
                    <UseIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <span>
                      <span className="block font-bold text-foreground">{u.title}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{u.text}</span>
                      <Link to={to(u.to)} className="mt-2 inline-flex min-h-[44px] items-center gap-1 text-sm font-semibold text-primary hover:underline">
                        {u.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Features */}
        <section className="px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="features-title">
          <div className="mx-auto max-w-6xl">
            <h2 id="features-title" className="text-center font-display text-3xl font-bold text-foreground">{t.featuresTitle}</h2>
            <div className="mt-14 flex flex-col gap-20">
              {t.features.map((f, i) => {
                const img = FEATURE_IMAGES[i];
                return (
                  <article key={f.title} className="grid items-center gap-10 md:grid-cols-2">
                    <div className={i % 2 ? 'md:order-2' : ''}>
                      <h3 className="font-display text-2xl font-bold text-foreground sm:text-3xl">{f.title}</h3>
                      <p className="mt-4 text-lg text-muted-foreground">{f.text}</p>
                      <ul className="mt-5 space-y-2">
                        {f.points.map((p) => (
                          <li key={p} className="flex items-start gap-2 text-foreground"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" /> {p}</li>
                        ))}
                      </ul>
                    </div>
                    <div className={`flex justify-center ${i % 2 ? 'md:order-1' : ''}`}>
                      <Screenshot src={shotOf(img, locale)} alt={f.alt} />
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-20 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-900 p-8 text-white">
                <h3 className="font-display text-2xl font-bold">{t.aiTitle}</h3>
                <p className="mt-3 text-slate-200">{t.aiText}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-card p-8">
                <h3 className="font-display text-2xl font-bold text-foreground">{t.everywhereTitle}</h3>
                <p className="mt-3 text-muted-foreground">{t.everywhereText}</p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Button asChild size="lg" className="h-14 px-8 text-lg">
                <Link to="/signup">{t.cta} <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" /></Link>
              </Button>
              <p className="mt-3 text-sm text-muted-foreground">
                {t.spreadsheet(
                  <Link to={to('/tableau-budget-familial-gratuit')} className="font-medium text-primary hover:underline">{t.templateLink}</Link>,
                  <Link to={to('/calcul-reste-a-vivre')} className="font-medium text-primary hover:underline">{t.ravLink}</Link>,
                )}
              </p>
            </div>
          </div>
        </section>

        {/* AI tool without account */}
        <section id="demo-tool" className="bg-card/60 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <h2 className="font-display text-3xl font-bold text-foreground">{t.savingsTitle}</h2>
              <p className="mt-3 text-lg text-muted-foreground">{t.savingsIntro}</p>
            </div>
            <SmartToolsWidget />
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="faq-title">
          <div className="mx-auto max-w-3xl">
            <h2 id="faq-title" className="text-center font-display text-3xl font-bold text-foreground">{t.faqTitle}</h2>
            <div className="mt-10 divide-y divide-border rounded-2xl border border-border/70 bg-card">
              {faq.slice(0, FAQ_VISIBLE).map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
              {faq.length > FAQ_VISIBLE && (
                <details className="group/more [&>summary::-webkit-details-marker]:hidden">
                  <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-center gap-2 p-5 font-semibold text-primary group-open/more:hidden">
                    {t.moreQuestions(faq.length - FAQ_VISIBLE)}
                  </summary>
                  <div className="divide-y divide-border">
                    {faq.slice(FAQ_VISIBLE).map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
                  </div>
                </details>
              )}
            </div>
          </div>
        </section>

        {/* Blog */}
        {t.latest.length > 0 && (
          <section className="bg-card px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl font-bold text-foreground">{t.blogTitle}</h2>
                  <p className="mt-2 text-muted-foreground">{t.blogIntro}</p>
                </div>
                <Link to={blog} className="hidden font-medium text-primary hover:underline sm:block">{t.allArticles}</Link>
              </div>
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {t.latest.map((post) => (
                  <Link key={post.to} to={post.to} className="group rounded-xl border border-border/70 bg-background p-6 transition-shadow hover:shadow-md">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary">{post.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{t.guide} · {post.readTime}</p>
                  </Link>
                ))}
              </div>
              <Link to={blog} className="mt-6 block text-center font-medium text-primary hover:underline sm:hidden">{t.allArticles}</Link>
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="bg-primary px-4 py-20 text-primary-foreground">
          <div className="mx-auto max-w-3xl text-center">
            <PiggyBank className="mx-auto h-10 w-10 opacity-90" aria-hidden="true" />
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{t.finalTitle}</h2>
            <p className="mt-4 text-lg">{t.finalText}</p>
            <Button asChild size="lg" variant="secondary" className="mt-8 h-14 bg-white px-10 text-lg text-primary hover:bg-gray-100">
              <Link to="/signup">{t.cta}</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
