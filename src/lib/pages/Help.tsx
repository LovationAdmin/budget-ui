// src/pages/Help.tsx
// Help page with its FAQ, in French (/help) and English (/en/help).
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  ArrowRight,
  Search, 
  HelpCircle, 
  BookOpen, 
  MessageCircle,
  Mail,
  Users,
  Lock,
  CreditCard,
  Target,
  Newspaper,
  Smartphone,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Footer } from '@/components/Footer';
import { SocialLinks } from '@/components/SocialLinks';
import { cn } from '@/lib/utils';
import { localizedPath } from '@/i18n/locales';
import { defineMessages, useLocale, useT } from '@/i18n/runtime';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const CATEGORY_ICONS = [
  { id: 'getting-started', icon: BookOpen },
  { id: 'account', icon: Users },
  { id: 'security', icon: Lock },
  { id: 'banking', icon: CreditCard },
  { id: 'features', icon: Target },
  { id: 'mobile', icon: Smartphone },
] as const;

type CategoryId = (typeof CATEGORY_ICONS)[number]['id'];

const M = defineMessages({
  fr: {
    back: 'Retour',
    h1: 'Comment pouvons-nous vous aider ?',
    intro: 'Trouvez rapidement des réponses à vos questions',
    search: 'Rechercher dans la FAQ...',
    all: 'Toutes les catégories',
    noResult: (q: string) => `Aucune question trouvée pour "${q}"`,
    contactTitle: 'Vous ne trouvez pas votre réponse ?',
    contactText: 'Notre équipe support est là pour vous aider. Nous répondons généralement sous 24h.',
    docTitle: 'Documentation',
    docText: 'Consultez notre documentation complète',
    docLink: 'Voir les fonctionnalités',
    communityTitle: 'Communauté',
    communityText: 'Astuces budget et nouveautés, chaque semaine sur nos réseaux',
    blogText: 'Conseils et guides pour le budget de la famille',
    blogLink: 'Lire le blog',
    categories: {
      'getting-started': 'Premiers Pas', account: 'Compte', security: 'Sécurité', banking: 'Connexion Bancaire', features: 'Fonctionnalités', mobile: 'Application Mobile',
    } as Record<CategoryId, string>,
    faqs: [
      { category: 'getting-started', question: 'Comment créer mon premier budget ?', answer: 'Après vous être connecté, cliquez sur "Nouveau Budget" depuis votre dashboard. Donnez-lui un nom (ex : "Foyer", "Coloc" ou "Mariage 2027"), puis cliquez sur Créer. Vous pouvez créer autant de budgets que nécessaire. Vous serez redirigé vers votre nouveau budget où vous pourrez ajouter vos revenus, charges et projets.' },
      { category: 'getting-started', question: 'Comment inviter mon conjoint, ma famille ou mes colocataires ?', answer: 'Dans votre budget, cliquez sur "Inviter" dans la barre supérieure. Entrez l\'adresse email du membre, choisissez son rôle (Propriétaire ou Membre), et cliquez sur Envoyer. Il recevra un email d\'invitation avec un lien pour rejoindre le budget.' },
      { category: 'getting-started', question: 'Puis-je gérer plusieurs budgets ?', answer: 'Oui ! Vous pouvez créer autant de budgets que vous le souhaitez. Par exemple, un budget pour le foyer principal, un autre pour les vacances, etc. Tous vos budgets sont accessibles depuis votre dashboard.' },
      { category: 'account', question: 'Comment changer mon mot de passe ?', answer: 'Allez dans votre Profil (menu en haut à droite), puis dans la section "Changer le mot de passe". Entrez votre mot de passe actuel, puis votre nouveau mot de passe (minimum 8 caractères). Cliquez sur Enregistrer.' },
      { category: 'account', question: 'Comment activer l\'authentification à deux facteurs (2FA) ?', answer: 'Dans votre Profil, section "Sécurité", cliquez sur "Activer 2FA". Scannez le QR code avec une app comme Google Authenticator ou Authy, puis entrez le code à 6 chiffres pour confirmer. Vous devrez entrer un code à chaque connexion.' },
      { category: 'account', question: 'Comment exporter mes données (RGPD) ?', answer: 'Dans votre Profil, section "Actions", cliquez sur "Exporter mes données (GDPR)". Un fichier JSON contenant toutes vos données sera téléchargé. Ce fichier inclut vos budgets, charges, projets et paramètres.' },
      { category: 'account', question: 'Comment supprimer mon compte ?', answer: 'Dans votre Profil, tout en bas, cliquez sur "Supprimer mon compte". Entrez votre mot de passe pour confirmer. ⚠️ Cette action est irréversible : tous vos budgets et données seront définitivement supprimés.' },
      { category: 'security', question: 'Mes données sont-elles sécurisées ?', answer: 'Oui. Vos données de budget sont chiffrées en AES-256-GCM avant d\'être stockées et hébergées en Europe (RGPD). Vos mots de passe sont hashés avec bcrypt, toutes les communications passent en HTTPS, et la double authentification (2FA) est disponible. Nous ne vendons jamais vos données.' },
      { category: 'security', question: 'Qui peut voir mes données de budget ?', answer: 'Uniquement vous et les membres que vous avez invités sur ce budget. Et à l\'intérieur d\'un budget partagé, vos charges perso privées (impôt, envoi d\'argent, crédit perso…) restent à vous : leur nom est chiffré à part et lisible par vous seul ; les autres membres ne voient que « Charge privée » et son montant. Notre équipe technique n\'accède aux données qu\'en cas d\'opération de support, et ces accès sont journalisés.' },
      { category: 'security', question: 'Que se passe-t-il si je perds mon mot de passe ?', answer: 'Cliquez sur "Mot de passe oublié" sur la page de connexion. Vous recevrez un email avec un lien de réinitialisation valide 1 heure. Cliquez dessus et créez un nouveau mot de passe.' },
      { category: 'banking', question: 'La connexion bancaire est-elle disponible ?', answer: 'Elle arrive bientôt avec Budget Famille Premium (prix annoncé au lancement). Vos comptes se synchroniseront pour comparer le budget prévu et les dépenses réelles. Vous pouvez dès maintenant essayer la démonstration sur la page Premium. Tout le reste de l\'application est gratuit et fonctionne sans connexion bancaire.' },
      { category: 'banking', question: 'Mes identifiants bancaires seront-ils stockés ?', answer: 'Non. La connexion passera par un prestataire agréé, dans le cadre de la directive européenne DSP2 (PSD2) : vous vous identifiez sur le site de votre banque, et Budget Famille ne reçoit qu\'un accès en lecture à vos opérations. Nous ne verrons ni ne stockerons jamais vos identifiants.' },
      { category: 'banking', question: 'Qu\'est-ce que le Reality Check ?', answer: 'Le Reality Check, inclus dans Premium (bientôt), comparera votre budget prévu à vos dépenses bancaires réelles, charge par charge, pour voir tout de suite si vous êtes dans les clous ou si vous avez dépensé plus que prévu.' },
      { category: 'banking', question: 'Le Mode Démo, c\'est quoi ?', answer: 'Le Mode Démo vous permet de tester la fonctionnalité Reality Check avec des données fictives si vous ne voulez pas connecter votre vraie banque. Activez-le dans Reality Check → "Essayer le Mode Démo". Les données sont effacées après 30 jours.' },
      { category: 'features', question: 'Comment fonctionne l\'épargne ?', answer: 'Dans l\'onglet « Épargne », créez une cagnotte (ex : « Vacances ») avec un montant mis de côté chaque mois et, si vous voulez, un objectif. Chaque carte affiche ce qu\'il y a en caisse et la progression vers l\'objectif. Ce qui reste du pot commun chaque mois va automatiquement dans l\'épargne générale.' },
      { category: 'features', question: 'J\'ai un objectif et une date : combien mettre de côté chaque mois ?', answer: 'Créez une épargne avec l\'objectif (ex : 15 000 €) et une fin (« Pendant 10 mois » ou « Jusqu\'à juillet 2027 ») : le montant mensuel se calcule tout seul (1 500 €). L\'app vérifie ensuite si le pot commun peut suivre chaque mois ; sinon, elle propose d\'ajuster les contributions du foyer ou de demander un plan au Budget IA, qui respecte l\'échéance.' },
      { category: 'features', question: 'C\'est quoi l\'argent de poche ?', answer: 'C\'est ce qui reste à chaque membre une fois sa contribution au pot commun versée, c\'est-à-dire une fois les charges et l\'épargne du foyer payées. L\'onglet « Foyer » l\'affiche pour chacun, mois par mois, avec l\'historique.' },
      { category: 'features', question: 'Comment déclarer une charge personnelle (impôt, envoi d\'argent…) ?', answer: 'Dans « Foyer », touchez « + Charge perso » sur la carte du membre (ou, dans une nouvelle charge, « Qui la paie ? → Un membre »). Elle se déduit de son argent de poche, sans toucher au pot commun ni à la répartition. Choisissez « Visible par le foyer » ou « Privée » : une charge privée n\'est lisible que par vous, les autres ne voient que son montant.' },
      { category: 'features', question: 'Salaire et contribution au pot commun, quelle différence ?', answer: 'Chaque membre du foyer a un salaire net ET une contribution : ce qu\'il verse au pot commun (tout son salaire, un montant fixe ou un pourcentage). Seules les contributions paient les charges et l\'épargne du foyer. Dans l\'onglet « Foyer », l\'assistant « Répartir le pot commun » calcule une contribution juste (au prorata, à parts égales ou avec le même argent de poche pour chacun).' },
      { category: 'features', question: 'Une charge terminée reste-t-elle dans l\'historique ?', answer: 'Oui. Une charge arrêtée passe dans « Terminées » : elle disparaît des mois suivants mais reste dans les mois où elle a compté. Les mois passés sont clôturés automatiquement et gardent leurs montants, même si vous supprimez la charge ensuite.' },
      { category: 'features', question: 'C\'est quoi les Suggestions IA ?', answer: 'Basé sur vos charges et la taille de votre foyer, notre IA (Claude) analyse vos dépenses et vous suggère des alternatives moins chères. Par exemple, si vous payez 80€/mois pour Internet, l\'IA peut vous suggérer des offres à 30€/mois chez un concurrent.' },
      { category: 'features', question: 'Comment clôturer (verrouiller) un mois ?', answer: 'Les mois passés se clôturent tout seuls le 1er du mois suivant : leurs montants sont figés. Vous pouvez aussi clôturer le mois en cours depuis la vue Mois (« Clôturer »). Pour corriger un mois clôturé, touchez « Rouvrir » : l\'écran montre d\'abord ce qui va changer.' },
      { category: 'features', question: 'Y a-t-il un mode sombre ?', answer: 'Oui : menu du compte (en haut à droite) › Apparence › Automatique, Clair ou Sombre. « Automatique » suit le réglage de votre téléphone ou ordinateur.' },
      { category: 'features', question: 'Les notifications fonctionnent comment ?', answer: 'Vous recevez des notifications en temps réel quand un membre modifie le budget. Si vous êtes hors ligne, une notification vous attend à votre retour. Les notifications apparaissent aussi dans la cloche 🔔 en haut à droite.' },
      { category: 'mobile', question: 'Comment installer l\'app sur mon téléphone ?', answer: 'Budget Famille est une Progressive Web App (PWA). Sur Chrome Android : Menu → "Installer l\'application". Sur Safari iOS : Partager → "Sur l\'écran d\'accueil". L\'app s\'installe comme une app native, sans passer par l\'App Store.' },
      { category: 'mobile', question: 'Est-ce que l\'app fonctionne hors ligne ?', answer: 'Partiellement. Vous pouvez consulter vos dernières données même hors ligne. Les modifications seront synchronisées automatiquement dès que vous retrouvez une connexion Internet.' },
      { category: 'mobile', question: 'Puis-je utiliser l\'app sur tablette ?', answer: 'Oui ! Budget Famille est responsive et s\'adapte automatiquement à tous les écrans : smartphone, tablette et desktop. L\'interface s\'optimise pour chaque taille d\'écran.' },
    ] as FAQItem[],
  },
  en: {
    back: 'Back',
    h1: 'How can we help?',
    intro: 'Find answers to your questions quickly',
    search: 'Search the FAQ...',
    all: 'All categories',
    noResult: (q: string) => `No questions found for "${q}"`,
    contactTitle: 'Can’t find your answer?',
    contactText: 'Our support team is here to help. We usually reply within 24 hours.',
    docTitle: 'Documentation',
    docText: 'Browse our full documentation',
    docLink: 'See the features',
    communityTitle: 'Community',
    communityText: 'Budgeting tips and news, every week on our social media',
    blogText: 'Tips and guides for your budget',
    blogLink: 'Read the blog',
    categories: {
      'getting-started': 'Getting started', account: 'Account', security: 'Security', banking: 'Bank connection', features: 'Features', mobile: 'Mobile app',
    } as Record<CategoryId, string>,
    faqs: [
      { category: 'getting-started', question: 'How do I create my first budget?', answer: 'Once signed in, click “New budget” on your dashboard. Give it a name (e.g. “Household”, “Shared flat” or “Wedding 2027”), then click Create. You can create as many budgets as you need. You’ll be taken to your new budget, where you can add your income, bills and goals.' },
      { category: 'getting-started', question: 'How do I invite my partner, family or roommates?', answer: 'In your budget, click “Invite” in the top bar. Enter the member’s email address, choose their role (Owner or Member), and click Send. They’ll receive an invitation email with a link to join the budget.' },
      { category: 'getting-started', question: 'Can I manage several budgets?', answer: 'Yes! You can create as many budgets as you like. For example, one for the main household, another for holidays, etc. All your budgets are available from your dashboard.' },
      { category: 'account', question: 'How do I change my password?', answer: 'Go to your Profile (menu at the top right), then to the “Change password” section. Enter your current password, then your new password (at least 8 characters). Click Save.' },
      { category: 'account', question: 'How do I turn on two-factor authentication (2FA)?', answer: 'In your Profile, “Security” section, click “Enable 2FA”. Scan the QR code with an app like Google Authenticator or Authy, then enter the 6-digit code to confirm. You’ll enter a code at each sign-in.' },
      { category: 'account', question: 'How do I export my data (GDPR)?', answer: 'In your Profile, “Actions” section, click “Export my data (GDPR)”. A JSON file with all your data will be downloaded. It includes your budgets, bills, goals and settings.' },
      { category: 'account', question: 'How do I delete my account?', answer: 'In your Profile, at the very bottom, click “Delete my account”. Enter your password to confirm. ⚠️ This can’t be undone: all your budgets and data will be permanently deleted.' },
      { category: 'security', question: 'Is my data secure?', answer: 'Yes. Your budget data is encrypted with AES-256-GCM before being stored and hosted in Europe (GDPR). Passwords are hashed with bcrypt, all traffic goes over HTTPS, and two-factor authentication (2FA) is available. We never sell your data.' },
      { category: 'security', question: 'Who can see my budget data?', answer: 'Only you and the members you invited to that budget. And inside a shared budget, your private personal expenses (a tax bill, money sent home, a personal loan…) stay yours: their name is encrypted separately and readable by you only; other members only see “Private expense” and its amount. Our technical team only accesses data for support operations, and that access is logged.' },
      { category: 'security', question: 'What if I lose my password?', answer: 'Click “Forgot password” on the sign-in page. You’ll receive an email with a reset link valid for 1 hour. Click it and create a new password.' },
      { category: 'banking', question: 'Is the bank connection available?', answer: 'It’s coming soon with Budget Famille Premium (price announced at launch). Your accounts will sync to compare your planned budget with your real spending. You can already try the demo on the Premium page. Everything else in the app is free and works without a bank connection.' },
      { category: 'banking', question: 'Will my bank login details be stored?', answer: 'No. The connection will go through a licensed provider under the European PSD2 directive: you sign in on your bank’s own site, and Budget Famille only receives read access to your transactions. We will never see or store your login details.' },
      { category: 'banking', question: 'What is the reality check?', answer: 'The reality check, included in Premium (coming soon), will compare your planned budget with your real bank spending, bill by bill, so you see right away whether you’re on track or spent more than planned.' },
      { category: 'banking', question: 'What is demo mode?', answer: 'Demo mode lets you try the reality check with fictitious data if you don’t want to connect your real bank. Turn it on in Reality check → “Try demo mode”. The data is deleted after 30 days.' },
      { category: 'features', question: 'How do savings work?', answer: 'In the “Savings” tab, create a pot (e.g. “Holidays”) with an amount set aside each month and, if you like, a target. Each card shows what’s in the pot and progress toward the target. Whatever is left in the joint pot each month goes automatically into general savings.' },
      { category: 'features', question: 'I have a target and a date: how much should I set aside each month?', answer: 'Create a saving with the target (e.g. 15,000) and an end (“For 10 months” or “Until July 2027”): the monthly amount is worked out for you (1,500). The app then checks whether the joint pot can keep up each month; if not, it offers to adjust the household’s contributions or to ask the AI budget for a plan that meets the deadline.' },
      { category: 'features', question: 'What is spending money?', answer: 'It’s what each member has left once their contribution to the joint pot is paid, that is, once the household’s bills and savings are covered. The “Household” tab shows it for each person, month by month, with the history.' },
      { category: 'features', question: 'How do I add a personal expense (a tax bill, money sent home…)?', answer: 'In “Household”, tap “+ Personal expense” on the member’s card (or, in a new bill, “Who pays? → A member”). It comes out of their spending money, without touching the joint pot or the split. Choose “Visible to the household” or “Private”: a private expense is readable by you only, others only see its amount.' },
      { category: 'features', question: 'Pay and joint pot contribution: what’s the difference?', answer: 'Each household member has a take-home pay AND a contribution: what they put into the joint pot (all their pay, a fixed amount or a percentage). Only contributions pay the household’s bills and savings. In the “Household” tab, the “Split the joint pot” assistant works out a fair contribution (in proportion, equal shares or the same spending money for everyone).' },
      { category: 'features', question: 'Does an ended bill stay in the history?', answer: 'Yes. A stopped bill moves to “Ended”: it disappears from the following months but stays in the months where it counted. Past months are closed automatically and keep their amounts, even if you delete the bill later.' },
      { category: 'features', question: 'What are AI suggestions?', answer: 'Based on your bills and household size, our AI (Claude) analyzes your spending and suggests cheaper alternatives. For example, if you pay 80/month for internet, the AI may suggest offers at 30/month from a competitor.' },
      { category: 'features', question: 'How do I close (lock) a month?', answer: 'Past months close by themselves on the 1st of the next month: their amounts are frozen. You can also close the current month from the Month view (“Close”). To correct a closed month, tap “Reopen”: the screen first shows what will change.' },
      { category: 'features', question: 'Is there a dark mode?', answer: 'Yes: account menu (top right) › Appearance › Automatic, Light or Dark. “Automatic” follows your phone’s or computer’s setting.' },
      { category: 'features', question: 'How do notifications work?', answer: 'You get real-time notifications when a member changes the budget. If you’re offline, a notification waits for you. Notifications also appear under the 🔔 bell at the top right.' },
      { category: 'mobile', question: 'How do I install the app on my phone?', answer: 'Budget Famille is a Progressive Web App (PWA). In Chrome on Android: Menu → “Install app”. In Safari on iOS: Share → “Add to Home Screen”. It installs like a native app, without going through an app store.' },
      { category: 'mobile', question: 'Does the app work offline?', answer: 'Partly. You can view your latest data even offline. Changes sync automatically as soon as you’re back online.' },
      { category: 'mobile', question: 'Can I use the app on a tablet?', answer: 'Yes! Budget Famille is responsive and adapts to every screen: smartphone, tablet and desktop.' },
    ] as FAQItem[],
  },
});

export default function Help() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const t = useT(M);
  const locale = useLocale();
  const categories = CATEGORY_ICONS.map((c) => ({ ...c, name: t.categories[c.id] }));
  const faqs: FAQItem[] = t.faqs;

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
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
        {/* ✅ CHANGÉ : Utilisation du composant Navbar avec items de navigation */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-8 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </button>

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex h-16 w-16 items-center justify-center bg-primary/10 rounded-full mb-6">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
            {t.h1}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {t.intro}
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder={t.search}
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
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              )}
            >
              {t.all}
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
                      ? "bg-primary text-primary-foreground shadow-lg"
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
                  {t.noResult(searchQuery)}
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
            {t.contactTitle}
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            {t.contactText}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:lovation.pro@gmail.com"
              className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-lg hover:bg-gray-100 font-medium transition"
            >
              <Mail className="h-5 w-5" />
              lovation.pro@gmail.com
            </a>
          </div>
        </div>

        {/* Resources */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <BookOpen className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t.docTitle}
            </h3>
            <p className="text-gray-600 mb-4">
              {t.docText}
            </p>
            <button
              onClick={() => navigate(localizedPath('/features', locale))}
              className="flex items-center gap-2 text-primary hover:underline font-medium"
            >
              {t.docLink}
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <Users className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t.communityTitle}
            </h3>
            <p className="text-gray-600 mb-4">
              {t.communityText}
            </p>
            <SocialLinks withLabels />
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <Newspaper className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Blog
            </h3>
            <p className="text-gray-600 mb-4">
              {t.blogText}
            </p>
            <button
              onClick={() => navigate(localizedPath('/blog', locale))}
              className="flex items-center gap-2 text-primary hover:underline font-medium"
            >
              {t.blogLink}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}