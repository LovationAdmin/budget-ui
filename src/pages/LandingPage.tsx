import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { 
  Rocket, Shield, Users, ArrowRight, CheckCircle2, 
  TrendingUp, Calendar, Target, Brain, CreditCard
} from 'lucide-react';
import SmartToolsWidget from '@/components/SmartToolsWidget';
import { SocialProof } from '@/components/SocialProof'; // Added SocialProof integration

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "Collaboration Familiale",
      description: "Gérez votre budget à plusieurs en temps réel. Fini les fichiers Excel partagés.",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Shield,
      title: "100% Sécurisé & Privé",
      description: "Chiffrement AES-256 de bout en bout. Vos données bancaires ne sont jamais stockées.",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: TrendingUp,
      title: "Connexion Bancaire (Beta)",
      description: "Synchronisez vos comptes automatiquement avec plus de 2500 banques européennes.",
      color: "bg-purple-100 text-purple-600"
    }
  ];

  const latestArticles = [
    {
      title: "5 Étapes pour Gérer son Budget en 2025",
      excerpt: "Découvrez notre méthode éprouvée pour reprendre le contrôle.",
      slug: "5-etapes-gerer-budget-familial-2025",
      readTime: "7 min"
    },
    {
      title: "Économiser sur vos Abonnements",
      excerpt: "Comment l'IA peut vous faire gagner 500€/an.",
      slug: "economiser-500-euros-abonnements",
      readTime: "6 min"
    },
    {
      title: "Budget Couple : 7 Règles d'Or",
      excerpt: "Gérer l'argent à deux sans conflits.",
      slug: "budget-couple-regles-gerer-argent",
      readTime: "8 min"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        
        {/* ==================== 1. HERO SECTION ==================== */}
        <section className="px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in">
              <Rocket className="h-4 w-4" />
              A venir : Support Enable Banking (PSD2)
            </div>
            
            <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 mb-6 tracking-tight">
              Reprenez le contrôle de<br />
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                votre budget familial
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              L'application collaborative qui réunit votre famille autour de projets communs. 
              Sécurisée, intelligente et gratuite.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/signup')}
                className="bg-primary hover:bg-primary/90 text-white px-8 h-14 text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Commencer gratuitement <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => document.getElementById('demo-tool')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-2 px-8 h-14 text-lg"
              >
                Tester l'outil IA
              </Button>
            </div>
            
            <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" /> Pas de carte requise
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" /> Données chiffrées
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" /> 100% Gratuit
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 2. SMART TOOL EMBED ==================== */}
        <section id="demo-tool" className="py-20 px-4 bg-white/50 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 mb-4">
                <Brain className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-bold font-display text-gray-900 mb-4">
                Testez notre Intelligence Artificielle
              </h2>
              <p className="text-lg text-gray-600">
                Estimez vos économies potentielles en 30 secondes, sans créer de compte.
              </p>
            </div>
            
            <div className="transform hover:scale-[1.01] transition-transform duration-500">
                <SmartToolsWidget />
            </div>
          </div>
        </section>

        {/* ==================== 3. FEATURES ==================== */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold font-display text-gray-900 mb-4">
                Tout ce dont vous avez besoin
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Une suite complète d'outils pour gérer le quotidien et préparer l'avenir.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-all">
                    <div className={`h-12 w-12 ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
            
            <div className="text-center mt-12">
              <Button variant="link" onClick={() => navigate('/features')} className="text-primary text-lg">
                Voir toutes les fonctionnalités →
              </Button>
            </div>
          </div>
        </section>

        {/* ==================== 4. SOCIAL PROOF ==================== */}
        <SocialProof />

        {/* ==================== 5. BLOG TEASER ==================== */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-bold font-display text-gray-900">Derniers Articles</h2>
                <p className="text-gray-600 mt-2">Conseils d'experts pour vos finances</p>
              </div>
              <Button variant="outline" onClick={() => navigate('/blog')} className="hidden sm:flex">
                Voir le blog
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {latestArticles.map((post, idx) => (
                <div 
                  key={idx} 
                  className="bg-white p-6 rounded-xl border hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => navigate(`/blog/${post.slug}`)}
                >
                  <div className="text-xs text-primary font-semibold mb-2 uppercase tracking-wide">Article</div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{post.excerpt}</p>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {post.readTime} de lecture
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center sm:hidden">
              <Button variant="outline" onClick={() => navigate('/blog')}>Voir le blog</Button>
            </div>
          </div>
        </section>

        {/* ==================== 6. CTA FINAL ==================== */}
        <section className="py-24 bg-primary text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-display font-bold mb-6">
              Prêt à changer votre avenir financier ?
            </h2>
            <p className="text-xl text-primary-100 mb-10">
              Rejoignez les familles qui ont déjà repris le contrôle. 
              C'est gratuit, sécurisé et sans engagement.
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              className="bg-white text-primary hover:bg-gray-100 h-14 px-10 text-lg shadow-xl"
              onClick={() => navigate('/signup')}
            >
              Créer mon compte maintenant
            </Button>
            <p className="mt-6 text-sm text-primary-200 opacity-80 flex items-center justify-center gap-2">
              <CreditCard className="h-4 w-4" /> Pas de carte de crédit requise pour l'inscription
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}