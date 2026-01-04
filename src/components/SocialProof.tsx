import { Star, Quote, Users, PiggyBank, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATS = [
  { label: "Familles actives", value: "2,000+", icon: Users },
  { label: "Économies générées", value: "1.5M€", icon: PiggyBank },
  { label: "Taux de satisfaction", value: "4.9/5", icon: Star },
  { label: "Sécurité", value: "100%", icon: ShieldCheck },
];

const TESTIMONIALS = [
  {
    name: "Sophie & Thomas",
    role: "Parents de 2 enfants",
    content: "Enfin une application qui met tout le monde d'accord ! Grâce au système de projets, nous avons réussi à financer nos vacances au ski sans toucher au découvert.",
    rating: 5,
    initials: "ST",
    color: "bg-blue-100 text-blue-600"
  },
  {
    name: "Marc D.",
    role: "Utilisateur Premium",
    content: "La connexion bancaire automatique a changé ma vie. Je ne perds plus de temps à saisir mes tickets, et le 'Reality Check' m'a fait réaliser combien je dépensais en abonnements inutiles.",
    rating: 5,
    initials: "MD",
    color: "bg-purple-100 text-purple-600"
  },
  {
    name: "Julie L.",
    role: "En couple",
    content: "On se disputait souvent pour l'argent. Avec Budget Famille, tout est transparent. Chacun voit ce qu'il reste pour le mois. C'est simple, joli et sécurisé.",
    rating: 5,
    initials: "JL",
    color: "bg-green-100 text-green-600"
  }
];

export function SocialProof() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* STATS BANNER */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 border-b border-gray-100 pb-12">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="text-center">
                <div className="flex justify-center mb-2 text-primary/80">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-3xl font-bold text-gray-900 font-display mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* HEADER */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold font-display text-gray-900 mb-4">
            Ils gèrent leur budget avec le sourire
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Rejoignez une communauté qui a décidé de reprendre le contrôle de ses finances.
          </p>
        </div>

        {/* TESTIMONIALS GRID */}
        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <div 
              key={idx} 
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 relative"
            >
              <Quote className="absolute top-6 right-6 h-8 w-8 text-gray-100" />
              
              <div className="flex items-center gap-1 mb-4 text-yellow-400">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed relative z-10">
                "{t.content}"
              </p>

              <div className="flex items-center gap-3">
                <div className={cn("h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm", t.color)}>
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* TRUST BADGE */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium border border-green-100">
            <ShieldCheck className="h-4 w-4" />
            Données chiffrées & Anonymes
          </div>
        </div>

      </div>
    </section>
  );
}

export default SocialProof;