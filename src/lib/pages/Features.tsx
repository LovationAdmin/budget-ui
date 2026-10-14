// src/pages/Features.tsx
// Features page, in French (/features) and English (/en/features).
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
import { localizedPath } from '@/i18n/locales';
import { defineMessages, useLocale, useT } from '@/i18n/runtime';

const UNIQUE_VISUALS = [
  { icon: Shield, color: 'bg-emerald-500' },
  { icon: Users, color: 'bg-blue-500' },
  { icon: Brain, color: 'bg-purple-500' },
];
const CORE_VISUALS = [
  { icon: Users, color: 'bg-blue-500' },
  { icon: TrendingUp, color: 'bg-green-500' },
  { icon: Target, color: 'bg-purple-500' },
  { icon: CreditCard, color: 'bg-orange-500' },
];
const ADVANCED_ICONS = [CreditCard, TrendingUp, Brain, BarChart3];
const SECURITY_ICONS = [Lock, Shield, Eye, Database];
const TECHNICAL_VISUALS = [
  { icon: Zap, value: '<100ms' },
  { icon: Database, value: '99.9%' },
  { icon: Shield, value: '256-bit' },
  { icon: Globe, value: '10+' },
];
const PLATFORM_ICONS = [Smartphone, Globe, Download, Share2];

const M = defineMessages({
  fr: {
    back: 'Retour',
    version: 'Nouvelle Version 2.0',
    h1: 'Fonctionnalités de Budget Famille',
    intro: 'Tous les outils pour budgétiser et planifier, seul ou à plusieurs : famille, couple, coloc et projets',
    differentKicker: 'Ce qui nous différencie',
    whyTitle: 'Pourquoi Choisir Budget Famille ?',
    whyIntro: 'Des fonctionnalités exclusives que vous ne trouverez nulle part ailleurs',
    unique: [
      {
        title: 'Privacy Forte',
        subtitle: 'Chiffrement AES-256-GCM at-rest',
        description: "Toutes vos données budgétaires sont stockées chiffrées en base. Et dans un budget partagé, vos charges perso privées restent à vous : leur nom n'est lisible que par vous.",
        highlights: ['Chiffrement AES-256-GCM at-rest', 'Charges perso privées : lisibles par vous seul', 'Hébergement UE (Frankfurt) — RGPD'],
      },
      {
        title: 'Collaboration Temps Réel',
        subtitle: 'WebSocket Instantané',
        description: 'Conjoint, famille ou colocataires connectés en même temps : une modification, et chacun la voit tout de suite.',
        highlights: ['Synchronisation instantanée', 'Notifications push temps réel', 'Gestion des conflits automatique'],
      },
      {
        title: 'IA Market Suggestions',
        subtitle: 'Propulsé par Claude (Anthropic)',
        description: 'Notre IA analyse vos charges et trouve automatiquement des alternatives moins chères sur le marché.',
        highlights: ['Analyse de marché en temps réel', 'Suggestions personnalisées', 'Alternatives comparées charge par charge'],
      },
    ],
    vsTitle: 'Budget Famille vs Autres Applications',
    vsIntro: 'Comparaison objective des fonctionnalités',
    colFeature: 'Fonctionnalité',
    colOthers: 'Autres Apps',
    exclusive: 'Exclusif',
    us: 'Nous',
    others: 'Autres',
    comparison: [
      { feature: 'Gestion multi-budgets', budgetFamille: true, others: true, highlight: false },
      { feature: 'Collaboration temps réel', budgetFamille: true, others: false, highlight: true },
      { feature: 'Charges perso privées dans un budget partagé', budgetFamille: true, others: false, highlight: true },
      { feature: 'Pot commun + argent de poche par membre', budgetFamille: true, others: false, highlight: true },
      { feature: 'Connexion bancaire (Premium, bientôt)', budgetFamille: true, others: true, highlight: false },
      { feature: 'IA Market Suggestions', budgetFamille: true, others: false, highlight: true },
      { feature: 'Reality Check : prévu vs réel (Premium, bientôt)', budgetFamille: true, others: false, highlight: true },
      { feature: 'Progressive Web App', budgetFamille: true, others: false, highlight: false },
      { feature: '100% Gratuit (fonctions de base)', budgetFamille: true, others: false, highlight: false },
    ],
    coreTitle: 'Fonctionnalités Principales',
    core: [
      {
        title: 'Seul ou à plusieurs',
        description: 'Gérez votre budget seul, ou invitez conjoint, famille ou colocataires et gérez-le ensemble en temps réel.',
        features: ['Invitations par e-mail, à qui vous voulez', 'Plusieurs budgets : foyer, coloc, projet…', 'Pot commun et argent de poche de chacun', 'Répartition juste (prorata, parts égales, même argent de poche)', 'Notifications en direct'],
      },
      {
        title: 'Suivi Complet',
        description: 'Visualisez vos finances avec des graphiques clairs et intuitifs.',
        features: ['Vue Mois : entrées, charges, épargne, reste', 'Vue Année et historique de chaque membre', 'Mois clôturés figés automatiquement', 'Mode sombre et export des données'],
      },
      {
        title: 'Projets et Épargne',
        description: 'Voyage, mariage, travaux, voiture : un objectif, une date, et votre progression.',
        features: ['Objectif + échéance → montant mensuel calculé', 'Vérification : le pot commun peut-il suivre ?', 'Plan proposé par le Budget IA', 'Cagnottes, épargne générale automatique'],
      },
      {
        title: 'Gestion des Charges',
        description: 'Catégorisez et analysez toutes vos dépenses récurrentes.',
        features: ["Charges du foyer ou charges perso (sur l'argent de poche)", 'Mensuelles, certains mois, annuelles lissées, ponctuelles', 'Montants datés : le passé ne bouge jamais', 'Total du mois et moyenne sur 12 mois'],
      },
    ],
    advancedKicker: 'Fonctionnalités Avancées',
    advancedTitle: 'Allez Plus Loin avec la Beta 2',
    advancedIntro: 'Profitez des dernières innovations pour un contrôle total de vos finances',
    advanced: [
      { title: 'Connexion Bancaire', description: 'Vos transactions synchronisées automatiquement (Premium)', badge: 'Bientôt' },
      { title: 'Reality Check', description: 'Comparez budget prévu et dépenses réelles (Premium)', badge: 'Bientôt' },
      { title: 'IA Suggestions', description: "Des pistes d'économies et un plan proposés par l'IA", badge: 'Gratuit' },
      { title: 'Analytics Pro', description: 'Tableaux de bord avancés', badge: 'Bientôt' },
    ],
    securityTitle: 'Sécurité & Confidentialité',
    securityIntro: 'Votre vie privée est notre priorité. Toutes vos données sont protégées par des technologies de chiffrement de niveau bancaire.',
    security: [
      { title: 'Chiffrement AES-256-GCM', description: 'Données budgétaires chiffrées en base' },
      { title: 'Accès restreint', description: 'Accès journalisé, jamais commercial' },
      { title: 'Aucun tracking', description: 'Pas de revente, pas de profiling' },
      { title: 'RGPD compliant', description: "Hébergement UE, droit à l'effacement" },
    ],
    performanceTitle: 'Performance & Fiabilité',
    performanceIntro: 'Une architecture technique de pointe pour une expérience fluide',
    technical: [
      { title: 'Latence', description: 'Sync temps réel' },
      { title: 'Uptime', description: 'Disponibilité garantie' },
      { title: 'Chiffrement', description: 'Grade militaire' },
      { title: 'Pays', description: 'Support multi-devise' },
    ],
    platformTitle: 'Accessible Partout, Tout le Temps',
    platform: [
      { title: 'Mobile First', description: 'Interface optimisée pour smartphone' },
      { title: 'Web App', description: 'Accessible depuis tout navigateur' },
      { title: 'PWA Installable', description: 'Installez comme une app native' },
      { title: 'Multi-device', description: 'Synchronisé sur tous vos appareils' },
    ],
    ctaTitle: 'Prêt à Reprendre le Contrôle de Vos Finances ?',
    ctaText: 'Gratuit, sans carte bancaire : commencez seul et invitez qui vous voulez ensuite',
    ctaSignup: 'Créer mon compte gratuit',
    ctaPremium: 'Découvrir Premium',
  },
  en: {
    back: 'Back',
    version: 'New version 2.0',
    h1: 'Budget Famille features',
    intro: 'Every tool to budget and plan, on your own or together: family, couple, roommates and goals',
    differentKicker: 'What sets us apart',
    whyTitle: 'Why choose Budget Famille?',
    whyIntro: 'Features you won’t find anywhere else',
    unique: [
      {
        title: 'Strong privacy',
        subtitle: 'AES-256-GCM encryption at rest',
        description: 'All your budget data is stored encrypted in the database. And in a shared budget, your private personal expenses stay yours: only you can read their names.',
        highlights: ['AES-256-GCM encryption at rest', 'Private personal expenses: readable by you only', 'Hosted in the EU (Frankfurt) — GDPR'],
      },
      {
        title: 'Real-time collaboration',
        subtitle: 'Instant WebSocket sync',
        description: 'Your partner, family or roommates connected at the same time: one change, and everyone sees it right away.',
        highlights: ['Instant sync', 'Real-time push notifications', 'Automatic conflict handling'],
      },
      {
        title: 'AI market suggestions',
        subtitle: 'Powered by Claude (Anthropic)',
        description: 'Our AI analyzes your bills and automatically finds cheaper alternatives on the market.',
        highlights: ['Real-time market analysis', 'Personalized suggestions', 'Alternatives compared bill by bill'],
      },
    ],
    vsTitle: 'Budget Famille vs other apps',
    vsIntro: 'An objective feature comparison',
    colFeature: 'Feature',
    colOthers: 'Other apps',
    exclusive: 'Exclusive',
    us: 'Us',
    others: 'Others',
    comparison: [
      { feature: 'Multiple budgets', budgetFamille: true, others: true, highlight: false },
      { feature: 'Real-time collaboration', budgetFamille: true, others: false, highlight: true },
      { feature: 'Private personal expenses in a shared budget', budgetFamille: true, others: false, highlight: true },
      { feature: 'Joint pot + spending money per member', budgetFamille: true, others: false, highlight: true },
      { feature: 'Bank connection (Premium, coming soon)', budgetFamille: true, others: true, highlight: false },
      { feature: 'AI market suggestions', budgetFamille: true, others: false, highlight: true },
      { feature: 'Reality check: planned vs actual (Premium, coming soon)', budgetFamille: true, others: false, highlight: true },
      { feature: 'Progressive Web App', budgetFamille: true, others: false, highlight: false },
      { feature: '100% free (core features)', budgetFamille: true, others: false, highlight: false },
    ],
    coreTitle: 'Core features',
    core: [
      {
        title: 'On your own or together',
        description: 'Manage your budget on your own, or invite your partner, family or roommates and manage it together in real time.',
        features: ['Email invitations, to whoever you like', 'Several budgets: household, shared flat, a goal…', 'A joint pot and everyone’s spending money', 'A fair split (in proportion, equal shares, the same spending money)', 'Live notifications'],
      },
      {
        title: 'Full tracking',
        description: 'See your finances with clear, intuitive charts.',
        features: ['Month view: income, bills, savings, what’s left', 'Year view and each member’s history', 'Closed months frozen automatically', 'Dark mode and data export'],
      },
      {
        title: 'Goals and savings',
        description: 'A trip, a wedding, renovations, a car: a target, a date, and your progress.',
        features: ['Target + due date → monthly amount worked out', 'Check: can the joint pot keep up?', 'A plan suggested by the AI budget', 'Savings pots, automatic general savings'],
      },
      {
        title: 'Bill management',
        description: 'Categorize and analyze all your recurring expenses.',
        features: ['Household bills or personal expenses (from spending money)', 'Monthly, some months, yearly spread out, one-off', 'Dated amounts: the past never changes', 'Month total and 12-month average'],
      },
    ],
    advancedKicker: 'Advanced features',
    advancedTitle: 'Go further with Beta 2',
    advancedIntro: 'The latest features for full control of your finances',
    advanced: [
      { title: 'Bank connection', description: 'Your transactions synced automatically (Premium)', badge: 'Coming soon' },
      { title: 'Reality check', description: 'Compare planned budget and actual spending (Premium)', badge: 'Coming soon' },
      { title: 'AI suggestions', description: 'Ways to save and a plan suggested by AI', badge: 'Free' },
      { title: 'Analytics Pro', description: 'Advanced dashboards', badge: 'Coming soon' },
    ],
    securityTitle: 'Security & privacy',
    securityIntro: 'Your privacy is our priority. All your data is protected with bank-grade encryption.',
    security: [
      { title: 'AES-256-GCM encryption', description: 'Budget data encrypted in the database' },
      { title: 'Restricted access', description: 'Logged access, never commercial' },
      { title: 'No tracking', description: 'No reselling, no profiling' },
      { title: 'GDPR compliant', description: 'Hosted in the EU, right to erasure' },
    ],
    performanceTitle: 'Performance & reliability',
    performanceIntro: 'State-of-the-art architecture for a smooth experience',
    technical: [
      { title: 'Latency', description: 'Real-time sync' },
      { title: 'Uptime', description: 'Guaranteed availability' },
      { title: 'Encryption', description: 'Military grade' },
      { title: 'Countries', description: 'Multi-currency support' },
    ],
    platformTitle: 'Available everywhere, all the time',
    platform: [
      { title: 'Mobile first', description: 'An interface built for smartphones' },
      { title: 'Web app', description: 'Works in any browser' },
      { title: 'Installable PWA', description: 'Install it like a native app' },
      { title: 'Multi-device', description: 'Synced across all your devices' },
    ],
    ctaTitle: 'Ready to take back control of your finances?',
    ctaText: 'Free, no credit card: start on your own and invite whoever you like later',
    ctaSignup: 'Create my free account',
    ctaPremium: 'Discover Premium',
  },
});

export default function Features() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const t = useT(M);
  const locale = useLocale();
  const uniqueFeatures = t.unique.map((f, i) => ({ ...f, ...UNIQUE_VISUALS[i] }));
  const comparisonTable = t.comparison;
  const coreFeatures = t.core.map((f, i) => ({ ...f, ...CORE_VISUALS[i] }));
  const advancedFeatures = t.advanced.map((f, i) => ({ ...f, icon: ADVANCED_ICONS[i] }));
  const securityFeatures = t.security.map((f, i) => ({ ...f, icon: SECURITY_ICONS[i] }));
  const technicalAdvantages = t.technical.map((f, i) => ({ ...f, ...TECHNICAL_VISUALS[i] }));
  const platformFeatures = t.platform.map((f, i) => ({ ...f, icon: PLATFORM_ICONS[i] }));

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
          {t.back}
        </button>

        {/* Hero */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-4 sm:mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="font-semibold text-xs sm:text-sm">{t.version}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-gray-900 mb-3 sm:mb-4 px-2">
            {t.h1}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            {t.intro}
          </p>
        </div>

        {/* ====================================================================== */}
        {/* UNIQUE DIFFERENTIATORS - Mobile: 1 col, Tablet: 1 col, Desktop: 3 col */}
        {/* ====================================================================== */}
        <section className="mb-16 sm:mb-24">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              <Star className="h-3 w-3 sm:h-4 sm:w-4" />
              {t.differentKicker}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-gray-900 mb-3 sm:mb-4">
              {t.whyTitle}
            </h2>
            <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              {t.whyIntro}
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
              {t.vsTitle}
            </h2>
            <p className="text-sm sm:text-base md:text-xl text-gray-600 px-4">
              {t.vsIntro}
            </p>
          </div>

          {/* Desktop Table - Hidden on mobile */}
          <div className="hidden md:block bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-primary to-purple-600">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-white font-semibold text-sm sm:text-base">{t.colFeature}</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-white font-semibold text-sm sm:text-base">Budget Famille</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-white font-semibold text-sm sm:text-base">{t.colOthers}</th>
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
                              {t.exclusive}
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
                        {t.exclusive}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">{t.us}</div>
                      {row.budgetFamille ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-400 mx-auto" />
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">{t.others}</div>
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
            {t.coreTitle}
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
              {t.advancedKicker}
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-3 sm:mb-4">
              {t.advancedTitle}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
              {t.advancedIntro}
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
                {t.securityTitle}
              </h2>
              <p className="text-sm sm:text-base text-green-100 max-w-2xl mx-auto px-2">
                {t.securityIntro}
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
                {t.performanceTitle}
              </h2>
              <p className="text-sm sm:text-base md:text-xl text-gray-300">
                {t.performanceIntro}
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
            {t.platformTitle}
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
            {t.ctaTitle}
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto opacity-90 px-2">
            {t.ctaText}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/signup')}
              className="bg-white text-primary hover:bg-gray-100 font-semibold shadow-lg min-h-[48px] text-sm sm:text-base"
            >
              {t.ctaSignup}
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate(localizedPath('/premium', locale))}
              className="border-2 border-white text-white hover:bg-white/10 min-h-[48px] text-sm sm:text-base"
            >
              {t.ctaPremium}
            </Button>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}