import { Star, Quote, ShieldCheck, Zap, Globe, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

// Factual capabilities instead of user counts
const STATS = [
  { label: "Banques compatibles", value: "2,500+", icon: Globe },
  { label: "Pays supportés", value: "31", icon: Zap }, // SEPA zone
  { label: "Chiffrement", value: "AES-256", icon: ShieldCheck },
  { label: "Satisfaction Beta", value: "4.9/5", icon: Heart },
];

const TESTIMONIALS = [
  {
    name: "Sophie & Thomas",
    role: "Testeurs Beta",
    content: "Enfin une application qui met tout le monde d'accord ! Le système de projets nous aide vraiment à visualiser nos objectifs communs.",
    rating: 5,
    initials: "ST",
    color: "bg-blue-100 text-blue-600"
  },
  {
    name: "Marc D.",
    role: "Utilisateur Early Access",
    content: "La connexion bancaire automatique est un vrai gain de temps. Je ne perds plus de temps à saisir mes tickets manuellement.",
    rating: 5,
    initials: "MD",
    color: "bg-purple-100 text-purple-600"
  },
  {
    name: "Julie L.",
    role: "Nouvelle utilisatrice",
    content: "On se disputait souvent pour l'argent. Avec la vue transparente du budget, chacun sait exactement ce qu'il reste pour le mois.",
    rating: 5,
    initials: "JL",
    color: "bg-green-100 text-green-600"
  }
];

export function SocialProof() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* STATS BANNER - Focus on Tech Capabilities */}
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
            Conçu pour simplifier votre quotidien
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez pourquoi les premières familles à nous rejoindre adorent l'expérience.
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

              <p className="text-gray-600 mb-6 leading-relaxed relative z-10 italic">
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
            Technologie 100% Sécurisée & Privée
          </div>
        </div>

      </div>
    </section>
  );
}

export default SocialProof;