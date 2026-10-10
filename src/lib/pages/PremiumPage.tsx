// src/lib/pages/PremiumPage.tsx
// ============================================================================
// Budget Famille Premium — coming soon. No price is announced and nothing can
// be bought yet: the page explains what Premium will do (bank sync, planned vs
// real, automatic matching) and lets visitors try it on fictitious data.
// The demo never contacts a bank. Payment (Stripe) is to be wired at launch.
// ============================================================================

import { Link } from 'react-router-dom';
import { ArrowRight, Crown, Link2, ShieldCheck, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { SocialLinks } from '@/components/SocialLinks';
import { PremiumDemo } from '@/components/premium/PremiumDemo';
import type { FaqItem } from '@/seo/faq';

const FAQ: FaqItem[] = [
  { q: 'Quand Premium sera-t-il disponible ?', a: 'Bientôt. Le lancement sera annoncé sur le site et sur nos réseaux sociaux. En attendant, tout Budget Famille fonctionne sans connexion bancaire.' },
  { q: 'Combien coûtera Premium ?', a: 'Le prix sera annoncé au lancement. Les budgets, les membres, les charges, l’épargne, les projets et le Budget IA sont gratuits dès aujourd’hui et ne demandent aucune connexion bancaire.' },
  { q: 'Mes identifiants bancaires passeront-ils par Budget Famille ?', a: 'Non. La connexion passera par un prestataire agréé, dans le cadre de la directive européenne DSP2 : vous vous identifiez sur le site de votre banque, et Budget Famille ne reçoit qu’un accès en lecture à vos opérations.' },
  { q: 'Faudra-t-il tout recatégoriser chaque mois ?', a: 'Non. Vous rattachez une opération à une charge une seule fois ; ensuite, les opérations semblables suivent toutes seules. C’est ce que montre la démonstration ci-dessus.' },
  { q: 'Est-ce que Premium fonctionnera à plusieurs ?', a: 'Oui : chaque membre d’un budget voit le même « prévu / réel », que vous gériez votre budget seul, en couple, en famille ou en colocation.' },
];

const STEPS = [
  { icon: ShieldCheck, title: 'Vous connectez votre banque', text: 'Via un prestataire agréé (DSP2) : vous vous identifiez chez votre banque, Budget Famille ne voit jamais vos identifiants.' },
  { icon: Link2, title: 'Les opérations se rangent', text: 'Chaque opération du mois se rattache à une charge de votre budget. Vous le faites une fois, ensuite c’est automatique.' },
  { icon: TrendingUp, title: 'Vous voyez les écarts', text: 'Le mois affiche le prévu et le réel, charge par charge : vous savez tout de suite où le budget dérape.' },
];

export default function PremiumPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="px-4 pt-12 pb-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
              <Crown className="h-4 w-4" aria-hidden="true" /> Bientôt disponible
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl [text-wrap:balance]">
              Budget Famille Premium
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Vos comptes bancaires synchronisés pour comparer, chaque mois, ce que vous aviez prévu et ce que vous avez vraiment dépensé.
              Seul ou à plusieurs.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Fonction à venir, prix annoncé au lancement. Tout le reste de Budget Famille est gratuit dès aujourd’hui, sans connexion bancaire.
            </p>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6 lg:px-8" aria-label="Démonstration de Premium">
          <div className="mx-auto max-w-6xl"><PremiumDemo /></div>
        </section>

        <section className="bg-card px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="how-title">
          <div className="mx-auto max-w-6xl">
            <h2 id="how-title" className="text-center font-display text-3xl font-bold text-foreground">Comment ça marchera</h2>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
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

        <section className="px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="premium-faq">
          <div className="mx-auto max-w-3xl">
            <h2 id="premium-faq" className="text-center font-display text-3xl font-bold text-foreground">Questions fréquentes</h2>
            <div className="mt-8 divide-y divide-border rounded-2xl border border-border/70 bg-card">
              {FAQ.map((f) => (
                <details key={f.q} className="group p-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 font-semibold text-foreground">
                    {f.q}
                    <span aria-hidden="true" className="text-xl text-primary transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary px-4 py-16 text-primary-foreground">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold">En attendant, votre budget est déjà gratuit</h2>
            <p className="mt-3 text-lg opacity-90">Charges, pot commun, épargne et projets : seul ou à plusieurs, sans connexion bancaire.</p>
            <Button asChild size="lg" variant="secondary" className="mt-8 h-14 bg-white px-10 text-lg text-primary hover:bg-gray-100">
              <Link to="/signup">Créer mon budget gratuit <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" /></Link>
            </Button>
            <p className="mt-8 text-sm opacity-90">Suivez-nous pour être prévenu du lancement :</p>
            <SocialLinks className="mt-3 justify-center [&_a]:border-white/40 [&_a]:bg-transparent [&_a]:text-white [&_a:hover]:border-white [&_a:hover]:text-white" />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
