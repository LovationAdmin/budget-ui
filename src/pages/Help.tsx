// src/pages/Help.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BudgetNavbar } from '@/components/budget/BudgetNavbar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  Search, 
  HelpCircle, 
  BookOpen, 
  MessageCircle,
  Mail,
  Users,
  Lock,
  CreditCard,
  Target,
  Bell,
  Smartphone,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Footer } from '@/components/Footer';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function Help() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const categories = [
    { id: 'getting-started', name: 'Premiers Pas', icon: BookOpen },
    { id: 'account', name: 'Compte', icon: Users },
    { id: 'security', name: 'Sécurité', icon: Lock },
    { id: 'banking', name: 'Connexion Bancaire', icon: CreditCard },
    { id: 'features', name: 'Fonctionnalités', icon: Target },
    { id: 'mobile', name: 'Application Mobile', icon: Smartphone },
  ];

  const faqs: FAQItem[] = [
    // Getting Started
    {
      category: 'getting-started',
      question: 'Comment créer mon premier budget ?',
      answer: 'Après vous être connecté, cliquez sur "Nouveau Budget" depuis votre dashboard. Donnez-lui un nom (ex: "Budget Famille 2025"), puis cliquez sur Créer. Vous serez redirigé vers votre nouveau budget où vous pourrez ajouter vos revenus, charges et projets.'
    },
    {
      category: 'getting-started',
      question: 'Comment inviter des membres de ma famille ?',
      answer: 'Dans votre budget, cliquez sur "Inviter" dans la barre supérieure. Entrez l\'adresse email du membre, choisissez son rôle (Propriétaire ou Membre), et cliquez sur Envoyer. Il recevra un email d\'invitation avec un lien pour rejoindre le budget.'
    },
    {
      category: 'getting-started',
      question: 'Puis-je gérer plusieurs budgets ?',
      answer: 'Oui ! Vous pouvez créer autant de budgets que vous le souhaitez. Par exemple, un budget pour le foyer principal, un autre pour les vacances, etc. Tous vos budgets sont accessibles depuis votre dashboard.'
    },
    
    // Account
    {
      category: 'account',
      question: 'Comment changer mon mot de passe ?',
      answer: 'Allez dans votre Profil (menu en haut à droite), puis dans la section "Changer le mot de passe". Entrez votre mot de passe actuel, puis votre nouveau mot de passe (minimum 8 caractères). Cliquez sur Enregistrer.'
    },
    {
      category: 'account',
      question: 'Comment activer l\'authentification à deux facteurs (2FA) ?',
      answer: 'Dans votre Profil, section "Sécurité", cliquez sur "Activer 2FA". Scannez le QR code avec une app comme Google Authenticator ou Authy, puis entrez le code à 6 chiffres pour confirmer. Vous devrez entrer un code à chaque connexion.'
    },
    {
      category: 'account',
      question: 'Comment exporter mes données (RGPD) ?',
      answer: 'Dans votre Profil, section "Actions", cliquez sur "Exporter mes données (GDPR)". Un fichier JSON contenant toutes vos données sera téléchargé. Ce fichier inclut vos budgets, charges, projets et paramètres.'
    },
    {
      category: 'account',
      question: 'Comment supprimer mon compte ?',
      answer: 'Dans votre Profil, tout en bas, cliquez sur "Supprimer mon compte". Entrez votre mot de passe pour confirmer. ⚠️ Cette action est irréversible : tous vos budgets et données seront définitivement supprimés.'
    },

    // Security
    {
      category: 'security',
      question: 'Mes données sont-elles sécurisées ?',
      answer: 'Oui ! Vos données budget sont chiffrées avec AES-256 (niveau bancaire). Vos mots de passe sont hashés avec bcrypt. Toutes les communications utilisent HTTPS. Nous ne vendons jamais vos données à des tiers.'
    },
    {
      category: 'security',
      question: 'Qui peut voir mes données de budget ?',
      answer: 'Uniquement vous et les membres que vous avez explicitement invités à un budget spécifique. Même notre équipe technique ne peut pas voir vos données chiffrées sans votre clé de déchiffrement.'
    },
    {
      category: 'security',
      question: 'Que se passe-t-il si je perds mon mot de passe ?',
      answer: 'Cliquez sur "Mot de passe oublié" sur la page de connexion. Vous recevrez un email avec un lien de réinitialisation valide 1 heure. Cliquez dessus et créez un nouveau mot de passe.'
    },

    // Banking
    {
      category: 'banking',
      question: 'Comment connecter ma banque (Beta 2) ?',
      answer: 'Dans la version Beta 2, ouvrez votre budget, allez dans "Reality Check", puis cliquez sur "Connecter ma Banque". Sélectionnez votre banque dans la liste (2500+ banques européennes via Enable Banking), connectez-vous avec vos identifiants bancaires. La connexion est sécurisée via API PSD2.'
    },
    {
      category: 'banking',
      question: 'Mes identifiants bancaires sont-ils stockés ?',
      answer: 'Non ! Nous utilisons l\'API PSD2 réglementée par l\'UE. Vos identifiants bancaires transitent directement entre vous et votre banque via Enable Banking. Nous ne stockons jamais vos identifiants.'
    },
    {
      category: 'banking',
      question: 'Qu\'est-ce que le Reality Check ?',
      answer: 'Le Reality Check compare votre budget théorique (ce que vous avez planifié) avec votre solde bancaire réel. Cela vous permet de voir instantanément si vous êtes dans les clous ou si vous avez dépensé plus que prévu.'
    },
    {
      category: 'banking',
      question: 'Le Mode Démo, c\'est quoi ?',
      answer: 'Le Mode Démo vous permet de tester la fonctionnalité Reality Check avec des données fictives si vous ne voulez pas connecter votre vraie banque. Activez-le dans Reality Check → "Essayer le Mode Démo". Les données sont effacées après 30 jours.'
    },

    // Features
    {
      category: 'features',
      question: 'Comment fonctionnent les Projets ?',
      answer: 'Les Projets sont des objectifs d\'épargne (ex: "Vacances 2025"). Créez un projet, définissez un montant cible, puis allouez de l\'argent chaque mois dans le tableau mensuel. Budget Famille calcule automatiquement votre progression et vous notifie quand l\'objectif est atteint.'
    },
    {
      category: 'features',
      question: 'C\'est quoi les Suggestions IA ?',
      answer: 'Basé sur vos charges et la taille de votre foyer, notre IA (Claude) analyse vos dépenses et vous suggère des alternatives moins chères. Par exemple, si vous payez 80€/mois pour Internet, l\'IA peut vous suggérer des offres à 30€/mois chez un concurrent.'
    },
    {
      category: 'features',
      question: 'Comment verrouiller un mois ?',
      answer: 'Dans le tableau mensuel, cliquez sur l\'icône cadenas en haut de la colonne du mois. Un mois verrouillé ne peut plus être modifié (utile pour archiver les mois passés). Vous pouvez le déverrouiller en re-cliquant.'
    },
    {
      category: 'features',
      question: 'Les notifications fonctionnent comment ?',
      answer: 'Vous recevez des notifications en temps réel quand un membre modifie le budget. Si vous êtes hors ligne, une notification vous attend à votre retour. Les notifications apparaissent aussi dans la cloche 🔔 en haut à droite.'
    },

    // Mobile
    {
      category: 'mobile',
      question: 'Comment installer l\'app sur mon téléphone ?',
      answer: 'Budget Famille est une Progressive Web App (PWA). Sur Chrome Android : Menu → "Installer l\'application". Sur Safari iOS : Partager → "Sur l\'écran d\'accueil". L\'app s\'installe comme une app native, sans passer par l\'App Store.'
    },
    {
      category: 'mobile',
      question: 'Est-ce que l\'app fonctionne hors ligne ?',
      answer: 'Partiellement. Vous pouvez consulter vos dernières données même hors ligne. Les modifications seront synchronisées automatiquement dès que vous retrouvez une connexion Internet.'
    },
    {
      category: 'mobile',
      question: 'Puis-je utiliser l\'app sur tablette ?',
      answer: 'Oui ! Budget Famille est responsive et s\'adapte automatiquement à tous les écrans : smartphone, tablette et desktop. L\'interface s\'optimise pour chaque taille d\'écran.'
    },
  ];

  const filteredFAQs = faqs.filter(faq => 
    searchQuery === '' || 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const displayedFAQs = selectedCategory 
    ? filteredFAQs.filter(faq => faq.category === selectedCategory)
    : filteredFAQs;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50">
      <BudgetNavbar 
        budgetTitle="Centre d'Aide"
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

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex h-16 w-16 items-center justify-center bg-primary/10 rounded-full mb-6">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
            Comment pouvons-nous vous aider ?
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Trouvez rapidement des réponses à vos questions
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher dans la FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-6 py-3 rounded-xl font-medium transition-all",
                selectedCategory === null
                  ? "bg-primary text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              )}
            >
              Toutes les catégories
            </button>
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all",
                    selectedCategory === category.id
                      ? "bg-primary text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ List */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="space-y-4">
            {displayedFAQs.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  Aucune question trouvée pour "{searchQuery}"
                </p>
              </div>
            ) : (
              displayedFAQs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </span>
                    {expandedIndex === index ? (
                      <ChevronUp className="h-5 w-5 text-primary flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {expandedIndex === index && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-primary to-purple-600 rounded-3xl p-12 text-white text-center">
          <MessageCircle className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl font-display font-bold mb-4">
            Vous ne trouvez pas votre réponse ?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Notre équipe support est là pour vous aider. Nous répondons généralement sous 24h.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@budgetfamille.com"
              className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-lg hover:bg-gray-100 font-medium transition"
            >
              <Mail className="h-5 w-5" />
              support@budgetfamille.com
            </a>
          </div>
        </div>

        {/* Resources */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <BookOpen className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Documentation
            </h3>
            <p className="text-gray-600 mb-4">
              Consultez notre documentation complète
            </p>
            <button
              onClick={() => navigate('/features')}
              className="flex items-center gap-2 text-primary hover:underline font-medium"
            >
              Voir les fonctionnalités
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <Users className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Communauté
            </h3>
            <p className="text-gray-600 mb-4">
              Rejoignez notre communauté d'utilisateurs
            </p>
            <a
              href="https://discord.gg/budgetfamille"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline font-medium"
            >
              Rejoindre Discord
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <Bell className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Actualités
            </h3>
            <p className="text-gray-600 mb-4">
              Suivez les dernières nouveautés
            </p>
            <a
              href="https://twitter.com/budgetfamille"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline font-medium"
            >
              Suivre sur Twitter
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}