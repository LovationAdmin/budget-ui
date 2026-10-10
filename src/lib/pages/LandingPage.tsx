// src/lib/pages/LandingPage.tsx
// ============================================================================
// Home page. Says what the app does with real screenshots (fictional demo
// household), how to start, and answers the usual questions. No invented
// figures or testimonials. The FAQ is shared with the structured data
// published by the prerender (src/seo/faq.ts).
// ============================================================================

import { Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, Heart, Home, KeyRound, Layers, Lock, Moon, Plane, PiggyBank, Scale, Sparkles, Target, User, Users, Wallet,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import SmartToolsWidget from '@/components/SmartToolsWidget';
import { HOME_FAQ } from '@/seo/faq';

const STEPS = [
  { icon: Users, title: 'Créez votre budget', text: 'Seul, à deux, en famille ou en coloc : les revenus de chacun, et ce qu’il verse au pot commun.' },
  { icon: Wallet, title: 'Notez vos charges une fois', text: 'Loyer, énergie, abonnements, taxe foncière : chaque mois se remplit tout seul.' },
  { icon: Scale, title: 'Répartissez, planifiez', text: 'Une contribution juste pour chacun, l’argent de poche qui reste, et vos projets avec un objectif et une date.' },
];

// Who it is for: « Famille » au sens large. Every line is something the app does.
const USES: Array<{ icon: typeof Users; title: string; text: string; link?: { to: string; label: string } }> = [
  { icon: User, title: 'Seul', text: 'Votre budget perso : salaire, charges, épargne, et ce qui reste vraiment chaque mois. Idéal pour un premier appart ou un budget étudiant.', link: { to: '/budget-personnel', label: 'Calculer mon budget perso' } },
  { icon: Heart, title: 'En couple', text: 'Chacun verse sa juste part au pot commun et garde son argent de poche. Les dépenses perso peuvent rester privées.', link: { to: '/blog/compte-commun-couple-argent-de-poche', label: 'Le guide du compte commun' } },
  { icon: Home, title: 'En famille', text: 'Cantine certains mois, taxe foncière une fois par an, rentrée : chaque mois se prépare tout seul.', link: { to: '/calcul-reste-a-vivre', label: 'Calculer notre reste à vivre' } },
  { icon: KeyRound, title: 'En colocation ou entre amis', text: 'Loyer, énergie, internet : invitez vos colocs par e-mail, chacun voit ce qu’il doit verser, en temps réel.', link: { to: '/budget-colocation', label: 'Calculer la part de chacun' } },
  { icon: Plane, title: 'Pour un projet', text: 'Voyage, mariage, travaux, voiture, apport : un objectif, une date, et le montant à mettre de côté chaque mois.', link: { to: '/budget-mariage', label: 'Calculer un budget mariage' } },
  { icon: Layers, title: 'Autant de budgets que nécessaire', text: 'Le foyer, la coloc, « Mariage 2027 » : chaque budget a ses membres, sa devise et ses chiffres. Gratuitement.', link: { to: '/signup', label: 'Créer mon premier budget' } },
];

const FEATURES: Array<{ icon: typeof Users; kicker: string; title: string; text: string; points: string[]; img: string; alt: string }> = [
  {
    icon: Scale,
    kicker: 'À plusieurs',
    title: 'Pot commun et argent de poche, enfin clairs',
    text: 'Pour chacun : son salaire, ce qu’il verse au pot commun et ce qui lui reste vraiment. L’assistant calcule une répartition juste sur le mois réel.',
    points: ['50/50, au prorata des salaires ou même argent de poche', 'Calculé sur le mois en cours, pas sur une moyenne', 'Historique de chaque membre, mois par mois'],
    img: '/images/app/foyer.jpg',
    alt: 'Onglet Foyer : salaire, versement au pot commun et argent de poche de Camille et Mehdi',
  },
  {
    icon: Lock,
    kicker: 'Confidentialité',
    title: 'Les dépenses perso, sans tout dévoiler',
    text: 'Un impôt, un envoi d’argent à la famille, un crédit perso : il se déduit de votre argent de poche, jamais du pot commun.',
    points: ['Charge perso publique ou privée', 'En privé, son nom est chiffré et visible par vous seul', 'Le montant reste juste pour tout le foyer'],
    img: '/images/app/charge-sheet.jpg',
    alt: 'Nouvelle charge perso « Impôt sur le revenu », payée par Mehdi, en mode privé',
  },
  {
    icon: Target,
    kicker: 'Projets et épargne',
    title: 'Un objectif, une date : le montant se calcule',
    text: 'Vacances, mariage, travaux, apport, voiture : indiquez combien il vous faut et pour quand. Budget Famille calcule la somme à mettre de côté chaque mois et vérifie qu’elle tient.',
    points: ['Cagnottes avec objectif et progression', 'Dépenses payées avec l’épargne suivies', 'Bilan de l’année, net de ce qui a été dépensé'],
    img: '/images/app/saving.jpg',
    alt: 'Cagnotte « Vacances été 2027 » : 500 € en caisse, 17 % de l’objectif',
  },
];

const LATEST = [
  { title: 'Compte commun en couple : pot commun, argent de poche et charges perso', slug: 'compte-commun-couple-argent-de-poche', readTime: '8 min' },
  { title: 'Combien épargner par mois pour atteindre un objectif à une date ?', slug: 'combien-epargner-par-mois-objectif-date', readTime: '6 min' },
  { title: 'Budget couple : 7 règles d’or pour gérer l’argent à deux', slug: 'budget-couple-regles-gerer-argent', readTime: '8 min' },
];

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="px-4 pt-14 pb-16 sm:px-6 lg:px-8 lg:pt-20">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="text-center lg:text-left">
              <Link to="/blog/compte-commun-couple-argent-de-poche" className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/70 px-4 py-1.5 text-sm font-medium text-primary hover:bg-card">
                <Sparkles className="h-4 w-4" aria-hidden="true" /> Nouveau : Budget IA, charges perso privées, mode sombre
              </Link>
              <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl [text-wrap:balance]">
                L’application de budget gratuite{' '}
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">pour la famille, le couple, la coloc et vos projets</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground lg:mx-0">
                Seul ou à plusieurs, budgétez le mois et planifiez ce qui compte : charges, pot commun, épargne,
                voyage, mariage, travaux. Sans connexion bancaire obligatoire, sans publicité, en temps réel.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <Button asChild size="lg" className="h-14 px-8 text-lg shadow-lg">
                  <Link to="/signup">Créer mon budget gratuit <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 border-2 px-8 text-lg">
                  <a href="#comment-ca-marche">Comment ça marche</a>
                </Button>
              </div>
              <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground lg:justify-start">
                {['Gratuit, sans carte bancaire', 'Données hébergées en Europe', 'Jamais revendues'].map((t) => (
                  <li key={t} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" /> {t}</li>
                ))}
              </ul>
            </div>
            <div className="relative mx-auto flex justify-center">
              <img
                src="/images/app/month-light.jpg"
                alt="Vue du mois dans Budget Famille : pot commun d’octobre, entrées, charges, épargne et reste du mois"
                width={390}
                height={640}
                fetchPriority="high"
                className="h-auto w-full max-w-[320px] rounded-[32px] border border-border/70 shadow-elevated"
              />
              <img
                src="/images/app/month-dark.jpg"
                alt=""
                aria-hidden="true"
                width={390}
                height={640}
                loading="lazy"
                className="absolute -right-6 top-16 hidden h-auto w-[220px] rounded-[28px] border border-white/10 shadow-elevated xl:block"
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="comment-ca-marche" className="scroll-mt-20 bg-card px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center font-display text-3xl font-bold text-foreground">Votre budget prêt en 3 étapes</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">Quelques minutes au départ, puis chaque mois se remplit tout seul.</p>
            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className="rounded-2xl border border-border/70 bg-background p-6">
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">{i + 1}</span>
                    <s.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-muted-foreground">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Who it is for */}
        <section id="pour-qui" className="scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="uses-title">
          <div className="mx-auto max-w-6xl">
            <h2 id="uses-title" className="text-center font-display text-3xl font-bold text-foreground">Pas seulement pour les familles</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">« Famille » au sens large : Budget Famille sert à budgétiser et planifier tout ce qui compte, seul ou à plusieurs.</p>
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {USES.map((u) => (
                <li key={u.title} className="flex gap-4 rounded-2xl border border-border/70 bg-card p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <u.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-bold text-foreground">{u.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{u.text}</span>
                    {u.link && (
                      <Link to={u.link.to} className="mt-2 inline-flex min-h-[44px] items-center gap-1 text-sm font-semibold text-primary hover:underline">
                        {u.link.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Features */}
        <section className="px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="features-title">
          <div className="mx-auto max-w-6xl">
            <h2 id="features-title" className="text-center font-display text-3xl font-bold text-foreground">Tout ce qu’un tableau Excel ne fait pas</h2>
            <div className="mt-14 flex flex-col gap-20">
              {FEATURES.map((f, i) => (
                <article key={f.title} className="grid items-center gap-10 md:grid-cols-2">
                  <div className={i % 2 ? 'md:order-2' : ''}>
                    <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary"><f.icon className="h-4 w-4" aria-hidden="true" /> {f.kicker}</p>
                    <h3 className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl">{f.title}</h3>
                    <p className="mt-4 text-lg text-muted-foreground">{f.text}</p>
                    <ul className="mt-5 space-y-2">
                      {f.points.map((p) => (
                        <li key={p} className="flex items-start gap-2 text-foreground"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" /> {p}</li>
                      ))}
                    </ul>
                  </div>
                  <div className={`flex justify-center ${i % 2 ? 'md:order-1' : ''}`}>
                    <Screenshot src={f.img} alt={f.alt} />
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-20 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-sky-900 p-8 text-white">
                <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-sky-200"><Sparkles className="h-4 w-4" aria-hidden="true" /> Budget IA</p>
                <h3 className="mt-3 font-display text-2xl font-bold">Votre budget, proposé par l’IA</h3>
                <p className="mt-3 text-slate-200">Décrivez votre situation (couple, famille, amis, colocataires) et vos projets : l’IA propose une répartition juste, des pistes d’économies et un plan pour tenir vos objectifs. Rien ne change tant que vous ne validez pas.</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-card p-8">
                <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary"><Moon className="h-4 w-4" aria-hidden="true" /> Partout, à plusieurs</p>
                <h3 className="mt-3 font-display text-2xl font-bold text-foreground">Sur téléphone, en clair ou en sombre</h3>
                <p className="mt-3 text-muted-foreground">Invitez votre conjoint, votre famille ou vos colocs : chacun voit les mêmes chiffres, en temps réel. Chaque changement s’enregistre en une seconde et s’annule aussi vite.</p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Button asChild size="lg" className="h-14 px-8 text-lg">
                <Link to="/signup">Commencer gratuitement <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" /></Link>
              </Button>
              <p className="mt-3 text-sm text-muted-foreground">
                Vous préférez un tableur ? <Link to="/tableau-budget-familial-gratuit" className="font-medium text-primary hover:underline">Téléchargez notre tableau de budget familial gratuit</Link>.
                {' '}Ou <Link to="/calcul-reste-a-vivre" className="font-medium text-primary hover:underline">calculez votre reste à vivre</Link> en 1 minute.
              </p>
            </div>
          </div>
        </section>

        {/* AI tool without account */}
        <section id="demo-tool" className="bg-card/60 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <h2 className="font-display text-3xl font-bold text-foreground">Combien pourriez-vous économiser ?</h2>
              <p className="mt-3 text-lg text-muted-foreground">Estimez vos économies sur l’énergie, internet ou l’assurance en 30 secondes, sans créer de compte.</p>
            </div>
            <SmartToolsWidget />
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="faq-title">
          <div className="mx-auto max-w-3xl">
            <h2 id="faq-title" className="text-center font-display text-3xl font-bold text-foreground">Questions fréquentes</h2>
            <div className="mt-10 divide-y divide-border rounded-2xl border border-border/70 bg-card">
              {HOME_FAQ.map((f) => (
                <details key={f.q} className="group p-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-foreground">
                    {f.q}
                    <span aria-hidden="true" className="text-xl text-primary transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Blog */}
        <section className="bg-card px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground">Conseils budget</h2>
                <p className="mt-2 text-muted-foreground">Budget perso, couple, famille, épargne et projets : nos guides pratiques.</p>
              </div>
              <Link to="/blog" className="hidden font-medium text-primary hover:underline sm:block">Tous les articles →</Link>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {LATEST.map((post) => (
                <Link key={post.slug} to={`/blog/${post.slug}`} className="group rounded-xl border border-border/70 bg-background p-6 transition-shadow hover:shadow-md">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">Guide · {post.readTime}</p>
                  <h3 className="mt-2 text-lg font-bold text-foreground group-hover:text-primary">{post.title}</h3>
                </Link>
              ))}
            </div>
            <Link to="/blog" className="mt-6 block text-center font-medium text-primary hover:underline sm:hidden">Tous les articles →</Link>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-primary px-4 py-20 text-primary-foreground">
          <div className="mx-auto max-w-3xl text-center">
            <PiggyBank className="mx-auto h-10 w-10 opacity-90" aria-hidden="true" />
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Votre budget, enfin simple</h2>
            <p className="mt-4 text-lg opacity-90">Gratuit, sans carte bancaire. Commencez seul, invitez qui vous voulez ensuite.</p>
            <Button asChild size="lg" variant="secondary" className="mt-8 h-14 bg-white px-10 text-lg text-primary hover:bg-gray-100">
              <Link to="/signup">Créer mon budget gratuit</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
