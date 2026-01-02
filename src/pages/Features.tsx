// src/pages/Features.tsx
// ✅ VERSION AMÉLIORÉE - SANS RÉGRESSIONS - READY TO COPY-PASTE
// Conserve 100% du code existant + ajouts marketing stratégiques

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
  CheckCircle2,
  Brain,
  Wifi,
  Database,
  Rocket,
  X,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/Footer';

export default function Features() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ============================================================================
  // 🆕 NOUVEAU : SECTION DIFFÉRENCIATEURS UNIQUES
  // Cette section est ajoutée AVANT les features existantes
  // ============================================================================
  const uniqueFeatures = [
    {
      icon: Shield,
      title: "Privacy Absolue",
      subtitle: "Chiffrement End-to-End Zero-Knowledge",
      description: "Vos données sont chiffrées AES-256 avant même de quitter votre appareil. Même nous ne pouvons pas les lire.",
      highlights: [
        "Architecture Zero-Knowledge",
        "Aucun accès serveur aux données brutes",
        "Vous seul détenez la clé de chiffrement"
      ],
      color: "bg-emerald-500"
    },
    {
      icon: Users,
      title: "Collaboration Temps Réel",
      subtitle: "WebSocket Instantané",
      description: "Toute la famille connectée simultanément. Une modification, et tous sont notifiés en <100ms.",
      highlights: [
        "Synchronisation instantanée (<100ms)",
        "Notifications push temps réel",
        "Gestion des conflits automatique"
      ],
      color: "bg-blue-500"
    },
    {
      icon: Brain,
      title: "IA Market Suggestions",
      subtitle: "Powered by Claude Sonnet 4",
      description: "Notre IA analyse vos charges et trouve automatiquement des alternatives moins chères sur le marché.",
      highlights: [
        "Économies jusqu'à 500€/an",
        "Comparaison énergie, internet, assurances",
        "Suggestions personnalisées par foyer"
      ],
      color: "bg-purple-500"
    }
  ];

  // 🆕 NOUVEAU : Tableau comparatif
  const comparisonTable = [
    { 
      feature: "Collaboration Familiale", 
      budgetFamille: true, 
      others: false,
      highlight: true 
    },
    { 
      feature: "Chiffrement Zero-Knowledge", 
      budgetFamille: true, 
      others: false,
      highlight: true 
    },
    { 
      feature: "IA Suggestions Marché", 
      budgetFamille: true, 
      others: false,
      highlight: true 
    },
    { 
      feature: "Synchronisation Temps Réel", 
      budgetFamille: true, 
      others: false,
      highlight: true 
    },
    { 
      feature: "Connexion Bancaire PSD2", 
      budgetFamille: true, 
      others: true,
      highlight: false 
    },
    { 
      feature: "Projets & Objectifs", 
      budgetFamille: true, 
      others: true,
      highlight: false 
    },
    { 
      feature: "Application Mobile PWA", 
      budgetFamille: true, 
      others: true,
      highlight: false 
    }
  ];

  // 🆕 NOUVEAU : Stats techniques
  const technicalAdvantages = [
    {
      icon: Wifi,
      title: "WebSocket Temps Réel",
      value: "<100ms",
      description: "Synchronisation instantanée"
    },
    {
      icon: Database,
      title: "Performance BD",
      value: "98%",
      description: "Amélioration temps réponse"
    },
    {
      icon: Globe,
      title: "Support Multi-Pays",
      value: "10",
      description: "Pays européens supportés"
    },
    {
      icon: Zap,
      title: "Auto-Save",
      value: "2s",
      description: "Sauvegarde automatique"
    }
  ];

  // ============================================================================
  // ✅ CODE EXISTANT - Conservé à 100% (AUCUNE MODIFICATION)
  // ============================================================================
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

  // ============================================================================
  // 🎨 RENDU JSX
  // ============================================================================
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

        {/* ====================================================================== */}
        {/* 🆕 NOUVEAU : HERO SECTION AMÉLIORÉ */}
        {/* ====================================================================== */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-6">
            <Rocket className="h-4 w-4" />
            La nouvelle génération de budget familial
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 mb-6">
            Gérez votre budget familial<br />
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              comme jamais auparavant
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            La seule application qui combine collaboration temps réel, intelligence artificielle 
            et chiffrement zero-knowledge pour une gestion de budget moderne et sécurisée.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-semibold"
            >
              Essayer Gratuitement
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/premium')}
              className="border-2 border-primary text-primary hover:bg-primary/10"
            >
              Découvrir Premium
            </Button>
          </div>
        </div>

        {/* ====================================================================== */}
        {/* 🆕 NOUVEAU : DIFFÉRENCIATEURS UNIQUES */}
        {/* ====================================================================== */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
              Ce qui nous rend <span className="text-primary">uniques</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des fonctionnalités que vous ne trouverez nulle part ailleurs
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {uniqueFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all hover:-translate-y-2 border-2 border-transparent hover:border-primary/20"
                >
                  <div className={`h-16 w-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-primary font-semibold mb-4">
                    {feature.subtitle}
                  </p>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  <ul className="space-y-3 mb-6">
                    {feature.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* ====================================================================== */}
        {/* 🆕 NOUVEAU : TABLEAU COMPARATIF */}
        {/* ====================================================================== */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
              Budget Famille vs Autres Applications
            </h2>
            <p className="text-xl text-gray-600">
              Comparaison objective des fonctionnalités
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-primary to-purple-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">Fonctionnalité</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">Budget Famille</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">Autres Apps</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {comparisonTable.map((row, index) => (
                    <tr 
                      key={index} 
                      className={`${row.highlight ? 'bg-green-50' : 'hover:bg-gray-50'} transition-colors`}
                    >
                      <td className="px-6 py-4">
                        <span className={`font-medium ${row.highlight ? 'text-primary' : 'text-gray-900'}`}>
                          {row.feature}
                          {row.highlight && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Exclusif</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {row.budgetFamille ? (
                          <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-6 w-6 text-red-400 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {row.others ? (
                          <CheckCircle2 className="h-6 w-6 text-gray-400 mx-auto" />
                        ) : (
                          <X className="h-6 w-6 text-red-400 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ====================================================================== */}
        {/* ✅ CODE EXISTANT : CORE FEATURES (CONSERVÉ À 100%) */}
        {/* ====================================================================== */}
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

        {/* ====================================================================== */}
        {/* ✅ CODE EXISTANT : ADVANCED FEATURES (CONSERVÉ À 100%) */}
        {/* ====================================================================== */}
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

        {/* ====================================================================== */}
        {/* ✅ CODE EXISTANT : SECURITY (CONSERVÉ À 100%) */}
        {/* ====================================================================== */}
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

        {/* ====================================================================== */}
        {/* 🆕 NOUVEAU : STATS TECHNIQUES */}
        {/* ====================================================================== */}
        <section className="mb-24">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 text-white">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-display font-bold mb-4">
                Performance & Fiabilité
              </h2>
              <p className="text-xl text-gray-300">
                Une architecture technique de pointe pour une expérience fluide
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {technicalAdvantages.map((advantage, index) => {
                const Icon = advantage.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-4xl font-bold text-primary mb-2">
                      {advantage.value}
                    </div>
                    <div className="text-lg font-semibold mb-1">
                      {advantage.title}
                    </div>
                    <div className="text-sm text-gray-400">
                      {advantage.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ====================================================================== */}
        {/* ✅ CODE EXISTANT : PLATFORM FEATURES (CONSERVÉ À 100%) */}
        {/* ====================================================================== */}
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

        {/* ====================================================================== */}
        {/* ✅ CODE EXISTANT : CTA FINAL (CONSERVÉ À 100%) */}
        {/* ====================================================================== */}
        <section className="bg-gradient-to-r from-primary to-purple-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-display font-bold mb-4">
            Prêt à Reprendre le Contrôle de Vos Finances ?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Rejoignez des milliers de familles qui gèrent leur budget avec Budget Famille
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/signup')}
              className="bg-white text-primary hover:bg-gray-100 font-semibold shadow-lg"
            >
              Créer mon compte gratuit
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/premium')}
              className="border-2 border-white text-white hover:bg-white/10"
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