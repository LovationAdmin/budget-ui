// src/pages/Features.tsx
// ✅ VERSION MOBILE-OPTIMIZED - CORRIGE LES PROBLÈMES GOOGLE MOBILE COMPLIANCE
// Changements principaux:
// 1. Tableau comparatif responsive (cards sur mobile au lieu de table)
// 2. Grilles adaptatives (1 col mobile → 2 col tablet → 4 col desktop)
// 3. Padding/spacing réduits sur petits écrans
// 4. Touch targets >= 44px
// 5. Texte lisible (pas de troncature)

import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
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
  // DATA - Unique Features
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
        "Analyse de marché en temps réel",
        "Suggestions personnalisées",
        "Économies moyennes: 15-30%"
      ],
      color: "bg-purple-500"
    }
  ];

  // ============================================================================
  // DATA - Comparison Table
  // ============================================================================
  const comparisonTable = [
    { feature: "Gestion multi-budgets", budgetFamille: true, others: true, highlight: false },
    { feature: "Collaboration temps réel", budgetFamille: true, others: false, highlight: true },
    { feature: "Chiffrement Zero-Knowledge", budgetFamille: true, others: false, highlight: true },
    { feature: "Connexion bancaire (2500+ banques)", budgetFamille: true, others: true, highlight: false },
    { feature: "IA Market Suggestions", budgetFamille: true, others: false, highlight: true },
    { feature: "Reality Check (Budget vs Réel)", budgetFamille: true, others: false, highlight: true },
    { feature: "Progressive Web App", budgetFamille: true, others: false, highlight: false },
    { feature: "100% Gratuit (fonctions de base)", budgetFamille: true, others: false, highlight: false },
  ];

  // ============================================================================
  // DATA - Core Features
  // ============================================================================
  const coreFeatures = [
    {
      icon: Users,
      title: "Collaboration Familiale",
      description: "Invitez votre famille et gérez ensemble vos budgets en temps réel.",
      features: [
        "Invitations par email",
        "Rôles et permissions",
        "Historique des modifications",
        "Notifications en direct"
      ],
      color: "bg-blue-500"
    },
    {
      icon: TrendingUp,
      title: "Suivi Complet",
      description: "Visualisez vos finances avec des graphiques clairs et intuitifs.",
      features: [
        "Tableaux mensuels",
        "Graphiques de tendance",
        "Comparaison année/année",
        "Export des données"
      ],
      color: "bg-green-500"
    },
    {
      icon: Target,
      title: "Projets d'Épargne",
      description: "Définissez des objectifs et suivez votre progression.",
      features: [
        "Objectifs personnalisés",
        "Suivi automatique",
        "Alertes de progression",
        "Priorisation intelligente"
      ],
      color: "bg-purple-500"
    },
    {
      icon: CreditCard,
      title: "Gestion des Charges",
      description: "Catégorisez et analysez toutes vos dépenses récurrentes.",
      features: [
        "Catégories personnalisées",
        "Charges mensuelles/annuelles",
        "Rappels d'échéances",
        "Analyse par catégorie"
      ],
      color: "bg-orange-500"
    }
  ];

  // ============================================================================
  // DATA - Advanced Features
  // ============================================================================
  const advancedFeatures = [
    {
      icon: CreditCard,
      title: "Connexion Bancaire",
      description: "Synchronisez automatiquement vos transactions",
      badge: "Beta"
    },
    {
      icon: TrendingUp,
      title: "Reality Check",
      description: "Comparez budget vs dépenses réelles",
      badge: "Beta"
    },
    {
      icon: Brain,
      title: "IA Suggestions",
      description: "Recevez des conseils personnalisés",
      badge: "Premium"
    },
    {
      icon: BarChart3,
      title: "Analytics Pro",
      description: "Tableaux de bord avancés",
      badge: "Bientôt"
    }
  ];

  // ============================================================================
  // DATA - Security Features
  // ============================================================================
  const securityFeatures = [
    { icon: Lock, title: "Chiffrement AES-256", description: "Vos données sont chiffrées de bout en bout" },
    { icon: Shield, title: "Zero-Knowledge", description: "Nous ne pouvons pas lire vos données" },
    { icon: Eye, title: "Aucun tracking", description: "Pas de revente de données" },
    { icon: Database, title: "RGPD Compliant", description: "Conforme aux réglementations EU" }
  ];

  // ============================================================================
  // DATA - Technical Advantages
  // ============================================================================
  const technicalAdvantages = [
    { icon: Zap, value: "<100ms", title: "Latence", description: "Sync temps réel" },
    { icon: Database, value: "99.9%", title: "Uptime", description: "Disponibilité garantie" },
    { icon: Shield, value: "256-bit", title: "Chiffrement", description: "Grade militaire" },
    { icon: Globe, value: "10+", title: "Pays", description: "Support multi-devise" }
  ];

  // ============================================================================
  // DATA - Platform Features
  // ============================================================================
  const platformFeatures = [
    { icon: Smartphone, title: "Mobile First", description: "Interface optimisée pour smartphone" },
    { icon: Globe, title: "Web App", description: "Accessible depuis tout navigateur" },
    { icon: Download, title: "PWA Installable", description: "Installez comme une app native" },
    { icon: Share2, title: "Multi-device", description: "Synchronisé sur tous vos appareils" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      <Navbar />

      {/* ====================================================================== */}
      {/* HERO SECTION - Mobile Optimized */}
      {/* ====================================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 sm:mb-8 font-medium min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

        {/* Hero */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-4 sm:mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="font-semibold text-xs sm:text-sm">Nouvelle Version 2.0</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-gray-900 mb-3 sm:mb-4 px-2">
            Fonctionnalités de Budget Famille
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Découvrez tous les outils pour gérer efficacement le budget de votre famille
          </p>
        </div>

        {/* ====================================================================== */}
        {/* UNIQUE DIFFERENTIATORS - Mobile: 1 col, Tablet: 1 col, Desktop: 3 col */}
        {/* ====================================================================== */}
        <section className="mb-16 sm:mb-24">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              <Star className="h-3 w-3 sm:h-4 sm:w-4" />
              Ce qui nous différencie
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-gray-900 mb-3 sm:mb-4">
              Pourquoi Choisir Budget Famille ?
            </h2>
            <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Des fonctionnalités exclusives que vous ne trouverez nulle part ailleurs
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
            {uniqueFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl p-6 sm:p-8 hover:shadow-2xl transition-all"
                >
                  <div className={`h-12 w-12 sm:h-16 sm:w-16 ${feature.color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6`}>
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-primary font-semibold mb-3 sm:mb-4">
                    {feature.subtitle}
                  </p>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                    {feature.description}
                  </p>
                  <ul className="space-y-2 sm:space-y-3">
                    {feature.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-center gap-2 sm:gap-3 text-sm text-gray-700">
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* ====================================================================== */}
        {/* COMPARISON TABLE - Mobile: Cards, Desktop: Table */}
        {/* ====================================================================== */}
        <section className="mb-16 sm:mb-24">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-gray-900 mb-3 sm:mb-4 px-2">
              Budget Famille vs Autres Applications
            </h2>
            <p className="text-sm sm:text-base md:text-xl text-gray-600 px-4">
              Comparaison objective des fonctionnalités
            </p>
          </div>

          {/* Desktop Table - Hidden on mobile */}
          <div className="hidden md:block bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-primary to-purple-600">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-white font-semibold text-sm sm:text-base">Fonctionnalité</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-white font-semibold text-sm sm:text-base">Budget Famille</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-white font-semibold text-sm sm:text-base">Autres Apps</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {comparisonTable.map((row, index) => (
                    <tr 
                      key={index} 
                      className={`${row.highlight ? 'bg-green-50' : 'hover:bg-gray-50'} transition-colors`}
                    >
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <span className={`font-medium text-sm sm:text-base ${row.highlight ? 'text-primary' : 'text-gray-900'}`}>
                          {row.feature}
                          {row.highlight && (
                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 sm:py-1 rounded-full">
                              Exclusif
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                        {row.budgetFamille ? (
                          <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 mx-auto" />
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                        {row.others ? (
                          <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards - Shown only on mobile */}
          <div className="md:hidden space-y-3">
            {comparisonTable.map((row, index) => (
              <div 
                key={index}
                className={`p-4 rounded-xl ${row.highlight ? 'bg-green-50 border-2 border-green-200' : 'bg-white'} shadow-sm`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <span className={`font-medium text-sm ${row.highlight ? 'text-primary' : 'text-gray-900'}`}>
                      {row.feature}
                    </span>
                    {row.highlight && (
                      <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Exclusif
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Nous</div>
                      {row.budgetFamille ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-400 mx-auto" />
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Autres</div>
                      {row.others ? (
                        <CheckCircle2 className="h-5 w-5 text-gray-400 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-400 mx-auto" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ====================================================================== */}
        {/* CORE FEATURES - Mobile: 1 col, Desktop: 2 col */}
        {/* ====================================================================== */}
        <section className="mb-16 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-6 sm:mb-8 text-center">
            Fonctionnalités Principales
          </h2>
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            {coreFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-shadow"
                >
                  <div className={`h-12 w-12 sm:h-14 sm:w-14 ${feature.color} rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6`}>
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                    {feature.description}
                  </p>
                  <ul className="space-y-2 sm:space-y-3">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-gray-700">
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
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
        {/* ADVANCED FEATURES - Mobile: 2 col, Desktop: 4 col */}
        {/* ====================================================================== */}
        <section className="mb-16 sm:mb-20">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
              Fonctionnalités Avancées
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-3 sm:mb-4">
              Allez Plus Loin avec la Beta 2
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
              Profitez des dernières innovations pour un contrôle total de vos finances
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {advancedFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    {feature.badge && (
                      <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium">
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ====================================================================== */}
        {/* SECURITY SECTION */}
        {/* ====================================================================== */}
        <section className="mb-16 sm:mb-20">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-white">
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center bg-white/20 rounded-full mb-4 sm:mb-6">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold mb-3 sm:mb-4">
                Sécurité & Confidentialité
              </h2>
              <p className="text-sm sm:text-base text-green-100 max-w-2xl mx-auto px-2">
                Votre vie privée est notre priorité. Toutes vos données sont protégées par des technologies 
                de chiffrement de niveau bancaire.
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {securityFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6">
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8 mb-3 sm:mb-4" />
                    <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-green-100">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ====================================================================== */}
        {/* TECHNICAL STATS */}
        {/* ====================================================================== */}
        <section className="mb-16 sm:mb-24">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-white">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-3 sm:mb-4">
                Performance & Fiabilité
              </h2>
              <p className="text-sm sm:text-base md:text-xl text-gray-300">
                Une architecture technique de pointe pour une expérience fluide
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
              {technicalAdvantages.map((advantage, index) => {
                const Icon = advantage.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    </div>
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 sm:mb-2">
                      {advantage.value}
                    </div>
                    <div className="text-sm sm:text-base md:text-lg font-semibold mb-0.5 sm:mb-1">
                      {advantage.title}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">
                      {advantage.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ====================================================================== */}
        {/* PLATFORM FEATURES */}
        {/* ====================================================================== */}
        <section className="mb-16 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-6 sm:mb-8 text-center">
            Accessible Partout, Tout le Temps
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {platformFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-xl shadow-md p-4 sm:p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 sm:mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ====================================================================== */}
        {/* CTA FINAL */}
        {/* ====================================================================== */}
        <section className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-display font-bold mb-3 sm:mb-4">
            Prêt à Reprendre le Contrôle de Vos Finances ?
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto opacity-90 px-2">
            Rejoignez des milliers de familles qui gèrent leur budget avec Budget Famille
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/signup')}
              className="bg-white text-primary hover:bg-gray-100 font-semibold shadow-lg min-h-[48px] text-sm sm:text-base"
            >
              Créer mon compte gratuit
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/premium')}
              className="border-2 border-white text-white hover:bg-white/10 min-h-[48px] text-sm sm:text-base"
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