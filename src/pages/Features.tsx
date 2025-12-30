// src/pages/Features.tsx
import { useNavigate } from 'react-router-dom';
import { BudgetNavbar } from '@/components/budget/BudgetNavbar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  Users, 
  TrendingUp, 
  Target, 
  Bell, 
  Lock, 
  Zap, 
  Globe,
  Smartphone,
  BarChart3,
  Calendar,
  CreditCard,
  Sparkles,
  Shield,
  Download,
  Share2,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/Footer';

export default function Features() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const coreFeatures = [
    {
      icon: Users,
      title: "Collaboration Familiale",
      description: "Invitez vos proches et gérez vos budgets ensemble en temps réel",
      features: [
        "Invitations par email",
        "Synchronisation instantanée",
        "Notifications en temps réel",
        "Gestion des rôles et permissions"
      ],
      color: "bg-blue-500"
    },
    {
      icon: TrendingUp,
      title: "Suivi Revenus & Dépenses",
      description: "Visualisez vos finances avec clarté et précision",
      features: [
        "Salaires et revenus multiples",
        "Catégorisation automatique",
        "Graphiques interactifs",
        "Historique complet"
      ],
      color: "bg-green-500"
    },
    {
      icon: Target,
      title: "Projets & Objectifs",
      description: "Planifiez vos projets et suivez votre progression",
      features: [
        "Objectifs d'épargne",
        "Suivi de progression",
        "Notifications d'atteinte",
        "Reports automatiques"
      ],
      color: "bg-purple-500"
    },
    {
      icon: Calendar,
      title: "Planification Mensuelle",
      description: "Organisez votre budget mois par mois sur toute l'année",
      features: [
        "Vue calendrier annuelle",
        "Allocations mensuelles",
        "Commentaires par mois",
        "Verrouillage des mois"
      ],
      color: "bg-orange-500"
    }
  ];

  const advancedFeatures = [
    {
      icon: CreditCard,
      title: "Connexion Bancaire",
      description: "Connectez vos comptes bancaires en toute sécurité",
      badge: "Beta 2",
      color: "bg-indigo-500"
    },
    {
      icon: Sparkles,
      title: "Suggestions IA",
      description: "Recevez des recommandations personnalisées pour économiser",
      badge: "Nouveau",
      color: "bg-pink-500"
    },
    {
      icon: BarChart3,
      title: "Reality Check",
      description: "Comparez votre budget théorique avec vos dépenses réelles",
      badge: "Beta 2",
      color: "bg-cyan-500"
    },
    {
      icon: Zap,
      title: "Mapping Transactions",
      description: "Liez vos transactions bancaires à vos charges automatiquement",
      badge: "Beta 2",
      color: "bg-yellow-500"
    }
  ];

  const securityFeatures = [
    {
      icon: Lock,
      title: "Chiffrement AES-256",
      description: "Vos données sont chiffrées de bout en bout"
    },
    {
      icon: Shield,
      title: "2FA (TOTP)",
      description: "Authentification à deux facteurs disponible"
    },
    {
      icon: Eye,
      title: "Respect de la vie privée",
      description: "Nous ne vendons jamais vos données"
    },
    {
      icon: Download,
      title: "Export RGPD",
      description: "Exportez toutes vos données en un clic"
    }
  ];

  const platformFeatures = [
    {
      icon: Smartphone,
      title: "Progressive Web App",
      description: "Installez l'app sur votre téléphone comme une app native"
    },
    {
      icon: Globe,
      title: "Multi-plateforme",
      description: "Fonctionne sur desktop, mobile et tablette"
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Restez informé des modifications en temps réel"
    },
    {
      icon: Share2,
      title: "Partage facile",
      description: "Partagez vos budgets avec qui vous voulez"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50">
      <BudgetNavbar 
        budgetTitle="Fonctionnalités"
        userName={user?.name}
        userAvatar={user?.avatar}
        items={[]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-8 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Toutes les fonctionnalités
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
            Gérez votre budget familial<br />
            <span className="text-primary">en toute simplicité</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Budget Famille vous offre tous les outils nécessaires pour une gestion financière efficace, 
            collaborative et sécurisée.
          </p>
        </div>

        {/* Core Features */}
        <section className="mb-20">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-8 text-center">
            Fonctionnalités Principales
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {coreFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow"
                >
                  <div className={`h-14 w-14 ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-gray-700">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Advanced Features */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Zap className="h-4 w-4" />
              Fonctionnalités Avancées
            </div>
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Allez Plus Loin avec la Beta 2
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Profitez des dernières innovations pour un contrôle total de vos finances
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advancedFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`h-12 w-12 ${feature.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    {feature.badge && (
                      <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Security */}
        <section className="mb-20">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-12 text-white">
            <div className="text-center mb-12">
              <div className="inline-flex h-16 w-16 items-center justify-center bg-white/20 rounded-full mb-6">
                <Shield className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-display font-bold mb-4">
                Sécurité & Confidentialité
              </h2>
              <p className="text-green-100 text-lg max-w-2xl mx-auto">
                Votre vie privée est notre priorité. Toutes vos données sont protégées par des technologies 
                de chiffrement de niveau bancaire.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {securityFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <Icon className="h-8 w-8 mb-4" />
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-green-100">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Platform Features */}
        <section className="mb-20">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-8 text-center">
            Accessible Partout, Tout le Temps
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary to-purple-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-display font-bold mb-4">
            Prêt à Reprendre le Contrôle de Vos Finances ?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers de familles qui gèrent leur budget avec Budget Famille
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/signup')}
              className="bg-white text-primary hover:bg-gray-100 font-semibold"
            >
              Créer mon compte gratuit
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/premium')}
              className="border-white text-white hover:bg-white/10"
            >
              Découvrir Premium
            </Button>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}