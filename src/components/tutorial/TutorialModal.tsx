import { useMemo, useState, type ReactNode } from 'react';
import { useTutorial } from '@/contexts/TutorialContext';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  Calendar, 
  Target, 
  Users, 
  MessageCircle,
  Link,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Lock,
  FlaskConical,
  Receipt,
  PiggyBank,
  TrendingDown,
  Edit,
  Trash2,
  Plus,
  Lightbulb,
  LightbulbOff,
  Phone,
  Mail,
  ExternalLink,
  Building2,
  BarChart3,
  Eye,
  RefreshCw,
  Download,
  Upload,
  Bell,
  Settings,
  Wallet,
  CreditCard,
  ArrowLeftRight,
  AlertTriangle,
  Info,
  Banknote,
  Calculator
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { PREMIUM_ENABLED } from '@/lib/premium';
import { defineMessages, useT } from '@/i18n/runtime';

// ============================================================================
// TUTORIAL TEXT (French and English)
// ============================================================================

/** A title and its line of explanation. */
type Pair = [string, string];

type TutorialText = {
  welcome: { title: string; description: string; intro: ReactNode; encryption: Pair; multiUser: Pair; ai: Pair; duration: string };
  household: { title: string; description: string; intro: ReactNode; howTo: string; steps: ReactNode[]; goodToKnow: string; tips: ReactNode[]; advice: ReactNode };
  charges: { title: string; description: string; intro: ReactNode; howTo: string; steps: ReactNode[]; actionsTitle: string; amount: Pair; suggestions: Pair; link: Pair };
  suggestions: {
    title: string; description: string; intro: ReactNode; howTitle: string; how: ReactNode[];
    best: string; saving: string; example: string; plan: string; seeOffer: Pair; contact: Pair; tip: ReactNode;
  };
  savings: { title: string; description: string; intro: ReactNode; examplesTitle: string; examples: string[]; indicatorsTitle: string; inPot: string; inPotText: ReactNode; bonus: ReactNode };
  month: { title: string; description: string; intro: ReactNode; inEachMonth: string; income: Pair; charges: Pair; savings: Pair; left: Pair; note: Pair; closing: Pair; tip: ReactNode };
  reality: {
    title: string; titleSoon: string; description: string; descriptionSoon: string; soon: ReactNode[]; noBank: string;
    beta: string; intro: ReactNode; howTitle: string; steps: ReactNode[]; demo: Pair; secure: Pair;
  };
  team: { title: string; description: string; intro: string; inviteTitle: string; steps: ReactNode[]; rolesTitle: string; owner: Pair; member: Pair; realtime: ReactNode };
  ready: { title: string; description: string; intro: ReactNode; firstActions: string; actions: ReactNode[]; help: string; helpHow: ReactNode; replay: Pair; cheer: string; stat: ReactNode };
  goTo: (step: number) => string;
  skip: string;
  previous: string;
  next: string;
  start: string;
  counter: (step: number, total: number) => string;
};

const M = defineMessages<TutorialText>({
  fr: {
    welcome: {
      title: "Bienvenue sur Budget Famille 👋",
      description: "Votre budget et vos projets, seul ou à plusieurs, en toute sécurité.",
      intro: <>Bienvenue dans votre nouvel espace de gestion financière ! Ce tutoriel va vous guider à travers toutes les fonctionnalités en <strong>8 étapes simples</strong>.</>,
      encryption: ["Chiffrement de bout en bout", "Vos données sont cryptées avant d'arriver sur nos serveurs. Personne d'autre que vous ne peut les lire."],
      multiUser: ["Multi-utilisateurs", "Invitez votre conjoint(e) et gérez votre budget ensemble, en temps réel."],
      ai: ["Intelligence Artificielle", "Notre IA analyse vos charges et trouve des économies potentielles."],
      duration: "⏱️ Durée estimée : 3-5 minutes",
    },
    household: {
      title: "Étape 1 : Le Foyer 💰",
      description: "Qui gagne quoi, et qui verse quoi au pot commun.",
      intro: <>L'onglet <strong className="text-green-700">« Foyer »</strong> distingue le <strong>salaire</strong> de chacun et sa <strong>contribution au pot commun</strong> : ce qui reste après les charges et l'épargne devient l'<strong>argent de poche</strong> de chacun.</>,
      howTo: "Comment ajouter un membre ?",
      steps: [
        <>Touchez <strong>« Ajouter un membre »</strong> (onglet Foyer).</>,
        <>Entrez le <strong>prénom</strong> et le <strong>salaire net mensuel</strong>.</>,
        <>Choisissez ce qu'il/elle <strong>verse au pot commun</strong> : tout le salaire, un montant fixe ou un pourcentage.</>,
      ],
      goodToKnow: "Bon à savoir",
      tips: [
        <>Un changement s'applique à <strong>un mois seulement</strong> ou <strong>à partir d'un mois</strong> : le passé ne bouge pas.</>,
        <>L'assistant <strong>« Répartir le pot commun »</strong> propose une contribution juste pour chacun.</>,
        <>Une <strong>charge perso</strong> (impôt, envoi d'argent…) se déduit de l'argent de poche de son titulaire. Privée, son nom n'est visible <strong>que par vous</strong>.</>,
      ],
      advice: <><strong>💡 Conseil :</strong> Entrez toujours le salaire <strong>NET</strong> (après impôts), pas le brut !</>,
    },
    charges: {
      title: "Étape 2 : Vos Charges 📋",
      description: "Des règles qui remplissent chaque mois toutes seules.",
      intro: <>L'onglet <strong className="text-orange-700">« Charges »</strong> regroupe vos dépenses : chaque mois, certains mois (cantine), chaque année (taxe foncière) ou une seule fois. Une charge terminée passe dans « Terminées » et reste dans l'historique.</>,
      howTo: "Comment ajouter une charge ?",
      steps: [
        <>Touchez <strong>« Nouvelle charge »</strong>.</>,
        <>Entrez le <strong>nom</strong> précis (ex: "EDF", "Loyer", "Netflix") : l'IA <strong>détecte la catégorie</strong>.</>,
        <><strong>« Qui la paie ? »</strong> : le foyer (pot commun) ou un membre (charge perso, publique ou privée).</>,
        <>Choisissez <strong>quand elle revient</strong> et son <strong>montant</strong>.</>,
        <>Indiquez le <strong>mois de début</strong> et, si besoin, une fin.</>,
      ],
      actionsTitle: "🔘 Boutons d'action sur chaque charge :",
      amount: ["Changer le montant (✏️)", "Pour un mois seulement, ou à partir d'un mois : les mois d'avant gardent l'ancien montant."],
      suggestions: ["Suggestions ON/OFF (💡)", "Active/désactive les suggestions IA pour cette charge."],
      link: ["Lier transactions (🔗)", "(Beta) Associez à vos vraies transactions bancaires."],
    },
    suggestions: {
      title: "Étape 3 : Suggestions d'Économies 🤖",
      description: "Laissez l'IA trouver des économies pour vous.",
      intro: <>Notre intelligence artificielle analyse vos charges et compare avec le marché pour trouver des <strong>alternatives moins chères</strong>.</>,
      howTitle: "🎯 Comment ça marche ?",
      how: [
        'Vous ajoutez une charge (ex: "Free Mobile - 20€").',
        'L\'IA détecte la catégorie "Mobile".',
        "Elle scanne les offres actuelles du marché français.",
        <>Elle affiche le <strong>TOP 3 des meilleures alternatives</strong>.</>,
      ],
      best: "🏆 Meilleure offre",
      saving: "-60€/an",
      example: "Exemple : Prixtel",
      plan: "Forfait 50Go à 9.99€/mois",
      seeOffer: ["Voir l'offre", "Accès au site officiel"],
      contact: ["Contacter", "Appel ou email direct"],
      tip: <><strong>💡 Astuce :</strong> Pour désactiver les suggestions sur une charge (ex: votre loyer), ouvrez sa fiche dans l'onglet Charges.</>,
    },
    savings: {
      title: "Étape 4 : L'Épargne 🎯",
      description: "Des cagnottes alimentées chaque mois.",
      intro: <>Dans l'onglet <strong className="text-purple-700">« Épargne »</strong>, chaque cagnotte reçoit un montant chaque mois. Ce qui reste du pot commun va dans l'<strong>épargne générale</strong>.</>,
      examplesTitle: "Exemples de cagnottes",
      examples: ["🏖️ Vacances été", "🔧 Travaux maison", "🚗 Nouvelle voiture", "🚨 Fonds d'urgence", "🎄 Cadeaux Noël", "📚 Études enfants"],
      indicatorsTitle: "Comprendre les indicateurs :",
      inPot: "EN CAISSE",
      inPotText: <>Ce qui a été mis de côté, moins ce qui a été <strong>dépensé avec</strong> (ex : les vacances payées avec la cagnotte).</>,
      bonus: <><strong>🎉 Bonus :</strong> Indiquez un <strong>objectif</strong> et une <strong>date</strong> : le montant mensuel est calculé, vous voyez s'il est tenable, et le <strong>Budget IA</strong> peut proposer un plan.</>,
    },
    month: {
      title: "Étape 5 : La vue Mois 📅",
      description: "Un mois à la fois, rempli tout seul.",
      intro: <>La vue <strong>Mois</strong> montre un mois à la fois, rempli automatiquement à partir de vos règles. L'onglet <strong>Année</strong> montre les 12 mois côte à côte.</>,
      inEachMonth: "Dans chaque mois :",
      income: ["📈 Entrées", "- Contributions au pot commun + revenus ponctuels"],
      charges: ["📉 Charges", "- Seulement celles du mois"],
      savings: ["🎯 Épargne", "- Ce qui est mis de côté"],
      left: ["✨ Reste", "- Va dans l'épargne générale"],
      note: ["Note du mois 💬", "Partagée avec tout le foyer"],
      closing: ["Clôture 🔒", "Les mois passés sont figés tout seuls"],
      tip: <><strong>💡 Astuce :</strong> touchez une ligne pour la modifier « ce mois seulement » ou « à partir de ce mois ». La section « Ce qui change » résume les différences avec le mois précédent.</>,
    },
    reality: {
      title: "Étape 6 : Reality Check 🏦",
      titleSoon: "Étape 6 : Reality Check, bientôt 🏦",
      description: "Comparez votre budget avec vos comptes réels.",
      descriptionSoon: "Bientôt avec Premium : votre budget comparé à vos comptes réels.",
      soon: [
        <>Bientôt, avec <strong>Budget Famille Premium</strong>, vos comptes bancaires se synchroniseront pour comparer chaque mois le budget prévu et les dépenses réelles, charge par charge.</>,
        <>En attendant, l’onglet <strong>Reality Check</strong> propose une démonstration avec des données fictives : vous y voyez comment les opérations se rangent dans vos charges et où le budget dérape.</>,
      ],
      noBank: "Tout le reste de Budget Famille fonctionne sans connexion bancaire.",
      beta: "Fonctionnalité Beta 2",
      intro: <>Le <strong>Reality Check</strong> permet de connecter votre banque pour comparer budget prévu vs dépenses réelles.</>,
      howTitle: "🔗 Comment ça marche ?",
      steps: [
        <>Cliquez sur <strong>"Connecter ma banque"</strong>.</>,
        <>Choisissez parmi <strong>2500+ banques</strong> européennes.</>,
        <>Autorisez l'accès <strong>lecture seule</strong> (protocole PSD2).</>,
        <><strong>Mappez</strong> vos transactions aux charges de votre budget.</>,
      ],
      demo: ["Mode Démo", "Testez avec des données fictives"],
      secure: ["100% Sécurisé", "Lecture seule, révocable"],
    },
    team: {
      title: "Étape 7 : Collaboration 👥",
      description: "Gérez votre budget à plusieurs.",
      intro: "Budget Famille s'utilise seul ou à plusieurs. Invitez votre conjoint(e), votre famille ou vos colocataires !",
      inviteTitle: "Inviter un membre",
      steps: [
        <>Cliquez sur <strong>"Inviter des membres"</strong> dans l'en-tête.</>,
        <>Entrez <strong>l'email</strong> de la personne.</>,
        <>Elle reçoit un <strong>lien d'invitation</strong> par email.</>,
      ],
      rolesTitle: "🎭 Rôles disponibles :",
      owner: ["Propriétaire", "Tous les droits : modifier, inviter, supprimer le budget."],
      member: ["Membre", "Peut voir et modifier les données, mais pas inviter."],
      realtime: <><strong>🔄 Temps réel :</strong> Toutes les modifications sont synchronisées instantanément. Si votre conjoint(e) ajoute une charge, vous la verrez apparaître immédiatement !</>,
    },
    ready: {
      title: "Prêt à Commencer ! 🚀",
      description: "Vous avez toutes les clés en main.",
      intro: <>Félicitations ! Vous connaissez maintenant toutes les fonctionnalités de Budget Famille. Voici votre <strong>feuille de route</strong> pour démarrer :</>,
      firstActions: "🎯 Vos 5 premières actions",
      actions: [
        <>Ajoutez les <strong>membres du foyer</strong>, leur salaire et leur contribution</>,
        <>Listez vos <strong>charges fixes</strong> (loyer, crédits, abos...)</>,
        <>Créez vos <strong>cagnottes d'épargne</strong></>,
        <>Ouvrez la vue <strong>Mois</strong> : tout est déjà rempli</>,
        <>(Optionnel) Testez le <strong>Reality Check</strong> en mode démo</>,
      ],
      help: "Besoin d'aide ?",
      helpHow: <>Cliquez sur <strong>?</strong> dans le menu</>,
      replay: ["Revoir ce tutoriel", "Menu → Paramètres → Tutoriel"],
      cheer: "🎉 Bonne gestion budgétaire !",
      stat: <>Les utilisateurs économisent en moyenne <strong>800€/an</strong> grâce aux suggestions IA.</>,
    },
    goTo: (step) => `Aller à l'étape ${step}`,
    skip: "Passer",
    previous: "Précédent",
    next: "Suivant",
    start: "C'est parti !",
    counter: (step, total) => `Étape ${step} sur ${total}`,
  },
  en: {
    welcome: {
      title: "Welcome to Budget Famille 👋",
      description: "Your budget and your goals, on your own or together, safe and secure.",
      intro: <>Welcome to your new money space! This tutorial walks you through every feature in <strong>8 simple steps</strong>.</>,
      encryption: ["End-to-end encryption", "Your data is encrypted before it reaches our servers. No one but you can read it."],
      multiUser: ["Multi-user", "Invite your partner and manage your budget together, in real time."],
      ai: ["Artificial intelligence", "Our AI analyzes your bills and finds potential savings."],
      duration: "⏱️ Estimated time: 3–5 minutes",
    },
    household: {
      title: "Step 1: The household 💰",
      description: "Who earns what, and who pays what into the joint pot.",
      intro: <>The <strong className="text-green-700">“Household”</strong> tab separates each person’s <strong>pay</strong> from their <strong>contribution to the joint pot</strong>: what’s left after bills and savings becomes each person’s <strong>spending money</strong>.</>,
      howTo: "How do I add a member?",
      steps: [
        <>Tap <strong>“Add a member”</strong> (Household tab).</>,
        <>Enter their <strong>first name</strong> and <strong>monthly take-home pay</strong>.</>,
        <>Choose what they <strong>pay into the joint pot</strong>: all their pay, a fixed amount or a percentage.</>,
      ],
      goodToKnow: "Good to know",
      tips: [
        <>A change applies to <strong>one month only</strong> or <strong>from a given month on</strong>: the past doesn’t move.</>,
        <>The <strong>“Split the joint pot”</strong> assistant suggests a fair contribution for everyone.</>,
        <>A <strong>personal expense</strong> (income tax, money transfers…) comes out of its owner’s spending money. If it’s private, its name is visible <strong>only to you</strong>.</>,
      ],
      advice: <><strong>💡 Tip:</strong> always enter your <strong>take-home</strong> pay (after tax), not your gross pay!</>,
    },
    charges: {
      title: "Step 2: Your bills 📋",
      description: "Rules that fill in every month by themselves.",
      intro: <>The <strong className="text-orange-700">“Bills”</strong> tab gathers your expenses: every month, some months (school lunches), every year (property tax) or just once. A bill that has ended moves to “Ended” and stays in the history.</>,
      howTo: "How do I add a bill?",
      steps: [
        <>Tap <strong>“New bill”</strong>.</>,
        <>Enter a precise <strong>name</strong> (e.g. “Electricity”, “Rent”, “Netflix”): the AI <strong>detects the category</strong>.</>,
        <><strong>“Who pays it?”</strong>: the household (joint pot) or a member (personal expense, public or private).</>,
        <>Choose <strong>when it recurs</strong> and its <strong>amount</strong>.</>,
        <>Set the <strong>starting month</strong> and, if needed, an end.</>,
      ],
      actionsTitle: "🔘 Action buttons on each bill:",
      amount: ["Change the amount (✏️)", "For one month only, or from a given month on: earlier months keep the old amount."],
      suggestions: ["Suggestions ON/OFF (💡)", "Turns AI suggestions on or off for this bill."],
      link: ["Link transactions (🔗)", "(Beta) Match it with your real bank transactions."],
    },
    suggestions: {
      title: "Step 3: Savings suggestions 🤖",
      description: "Let the AI find savings for you.",
      intro: <>Our artificial intelligence analyzes your bills and compares them with the market to find <strong>cheaper alternatives</strong>.</>,
      howTitle: "🎯 How does it work?",
      how: [
        "You add a bill (e.g. “Mobile plan – 20 a month”).",
        "The AI detects the “Mobile” category.",
        "It scans current offers on the market in your country.",
        <>It shows the <strong>TOP 3 best alternatives</strong>.</>,
      ],
      best: "🏆 Best offer",
      saving: "−60/year",
      example: "Example: Provider A",
      plan: "50 GB plan at 9.99/month",
      seeOffer: ["See the offer", "Go to the official site"],
      contact: ["Contact", "Call or email directly"],
      tip: <><strong>💡 Tip:</strong> to turn off suggestions for a bill (e.g. your rent), open its details in the Bills tab.</>,
    },
    savings: {
      title: "Step 4: Savings 🎯",
      description: "Savings pots topped up every month.",
      intro: <>In the <strong className="text-purple-700">“Savings”</strong> tab, each savings pot gets an amount every month. Whatever is left in the joint pot goes into <strong>general savings</strong>.</>,
      examplesTitle: "Savings pot ideas",
      examples: ["🏖️ Summer holiday", "🔧 Home repairs", "🚗 New car", "🚨 Emergency fund", "🎄 Christmas presents", "📚 Kids’ education"],
      indicatorsTitle: "Reading the indicators:",
      inPot: "IN THE POT",
      inPotText: <>What has been set aside, minus what has been <strong>spent from it</strong> (e.g. the holiday paid for with the savings pot).</>,
      bonus: <><strong>🎉 Bonus:</strong> set a <strong>target</strong> and a <strong>date</strong>: the monthly amount is worked out, you see whether it’s realistic, and the <strong>AI budget</strong> can suggest a plan.</>,
    },
    month: {
      title: "Step 5: The Month view 📅",
      description: "One month at a time, filled in for you.",
      intro: <>The <strong>Month</strong> view shows one month at a time, filled in automatically from your rules. The <strong>Year</strong> tab shows the 12 months side by side.</>,
      inEachMonth: "In each month:",
      income: ["📈 Income", "- Contributions to the joint pot + one-off income"],
      charges: ["📉 Bills", "- Only the ones due that month"],
      savings: ["🎯 Savings", "- What’s set aside"],
      left: ["✨ Left for the month", "- Goes into general savings"],
      note: ["Month note 💬", "Shared with the whole household"],
      closing: ["Closed months 🔒", "Past months freeze by themselves"],
      tip: <><strong>💡 Tip:</strong> tap a line to edit it “this month only” or “from this month on”. The “What changes” section sums up the differences from the previous month.</>,
    },
    reality: {
      title: "Step 6: Reality Check 🏦",
      titleSoon: "Step 6: Reality Check, coming soon 🏦",
      description: "Compare your budget with your real accounts.",
      descriptionSoon: "Coming soon with Premium: your budget compared with your real accounts.",
      soon: [
        <>Soon, with <strong>Budget Famille Premium</strong>, your bank accounts will sync so you can compare the planned budget with actual spending every month, bill by bill.</>,
        <>Meanwhile, the <strong>Reality Check</strong> tab offers a demo with fictitious data: you see how transactions are sorted into your bills and where the budget slips.</>,
      ],
      noBank: "Everything else in Budget Famille works without connecting a bank.",
      beta: "Beta 2 feature",
      intro: <><strong>Reality Check</strong> lets you connect your bank to compare your planned budget with actual spending.</>,
      howTitle: "🔗 How does it work?",
      steps: [
        <>Click <strong>“Connect my bank”</strong>.</>,
        <>Choose from <strong>2,500+ European banks</strong>.</>,
        <>Allow <strong>read-only</strong> access (PSD2 standard).</>,
        <><strong>Map</strong> your transactions to your budget’s bills.</>,
      ],
      demo: ["Demo mode", "Try it with fictitious data"],
      secure: ["100% secure", "Read-only, revocable"],
    },
    team: {
      title: "Step 7: Working together 👥",
      description: "Manage your budget with others.",
      intro: "Budget Famille works on your own or together. Invite your partner, your family or your roommates!",
      inviteTitle: "Invite a member",
      steps: [
        <>Click <strong>“Invite members”</strong> in the header.</>,
        <>Enter the person’s <strong>email address</strong>.</>,
        <>They get an <strong>invitation link</strong> by email.</>,
      ],
      rolesTitle: "🎭 Available roles:",
      owner: ["Owner", "Full rights: edit, invite, delete the budget."],
      member: ["Member", "Can see and edit the data, but can’t invite."],
      realtime: <><strong>🔄 Real time:</strong> every change syncs instantly. If your partner adds a bill, you’ll see it appear right away!</>,
    },
    ready: {
      title: "Ready to start! 🚀",
      description: "You have everything you need.",
      intro: <>Congratulations! You now know every feature of Budget Famille. Here’s your <strong>roadmap</strong> to get started:</>,
      firstActions: "🎯 Your first 5 steps",
      actions: [
        <>Add the <strong>household members</strong>, their pay and their contribution</>,
        <>List your <strong>fixed bills</strong> (rent, loans, subscriptions...)</>,
        <>Create your <strong>savings pots</strong></>,
        <>Open the <strong>Month</strong> view: everything is already filled in</>,
        <>(Optional) Try <strong>Reality Check</strong> in demo mode</>,
      ],
      help: "Need help?",
      helpHow: <>Click <strong>?</strong> in the top bar</>,
      replay: ["See this tutorial again", "Account menu → Watch the tutorial"],
      cheer: "🎉 Happy budgeting!",
      stat: <>Users save <strong>€800 a year</strong> on average thanks to AI suggestions.</>,
    },
    goTo: (step) => `Go to step ${step}`,
    skip: "Skip",
    previous: "Back",
    next: "Next",
    start: "Let’s go!",
    counter: (step, total) => `Step ${step} of ${total}`,
  },
});

// ============================================================================
// TUTORIAL STEPS CONFIGURATION - COMPREHENSIVE VERSION
// ============================================================================

const steps = (t: TutorialText) => [
  // ==================== STEP 1: WELCOME ====================
  {
    icon: ShieldCheck,
    title: t.welcome.title,
    description: t.welcome.description,
    content: (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>{t.welcome.intro}</p>

        <div className="grid gap-3 my-4">
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <Lock className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-800">{t.welcome.encryption[0]}</p>
              <p className="text-xs text-green-700">{t.welcome.encryption[1]}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Users className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-blue-800">{t.welcome.multiUser[0]}</p>
              <p className="text-xs text-blue-700">{t.welcome.multiUser[1]}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <Sparkles className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-purple-800">{t.welcome.ai[0]}</p>
              <p className="text-xs text-purple-700">{t.welcome.ai[1]}</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground italic">
          {t.welcome.duration}
        </p>
      </div>
    ),
    color: "text-primary",
    bg: "bg-primary/10"
  },

  // ==================== STEP 2: MEMBRES / REVENUS ====================
  {
    icon: Users,
    title: t.household.title,
    description: t.household.description,
    content: (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>{t.household.intro}</p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="font-semibold text-green-800 mb-2 flex items-center gap-2">
            <Plus className="h-4 w-4" /> {t.household.howTo}
          </p>
          <ol className="space-y-2 text-xs text-green-700">
            {t.household.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="bg-green-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] flex-shrink-0">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="font-semibold text-sm flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600" /> {t.household.goodToKnow}
          </p>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <Edit className="h-3 w-3 text-gray-600" />
              <span>{t.household.tips[0]}</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <Calendar className="h-3 w-3 text-orange-600" />
              <span>{t.household.tips[1]}</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <Info className="h-3 w-3 text-purple-600" />
              <span>{t.household.tips[2]}</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            {t.household.advice}
          </p>
        </div>
      </div>
    ),
    color: "text-green-600",
    bg: "bg-green-100"
  },

  // ==================== STEP 3: CHARGES ====================
  {
    icon: Receipt,
    title: t.charges.title,
    description: t.charges.description,
    content: (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>{t.charges.intro}</p>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
            <Plus className="h-4 w-4" /> {t.charges.howTo}
          </p>
          <ol className="space-y-2 text-xs text-orange-700">
            {t.charges.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="bg-orange-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] flex-shrink-0">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="font-semibold text-sm">{t.charges.actionsTitle}</p>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2 p-2 bg-gray-50 rounded">
              <Edit className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">{t.charges.amount[0]}</span>
                <span className="text-gray-500 block">{t.charges.amount[1]}</span>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 bg-gray-50 rounded">
              <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">{t.charges.suggestions[0]}</span>
                <span className="text-gray-500 block">{t.charges.suggestions[1]}</span>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 bg-gray-50 rounded">
              <Link className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">{t.charges.link[0]}</span>
                <span className="text-gray-500 block">{t.charges.link[1]}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    color: "text-orange-600",
    bg: "bg-orange-100"
  },

  // ==================== STEP 4: SUGGESTIONS IA ====================
  {
    icon: Sparkles,
    title: t.suggestions.title,
    description: t.suggestions.description,
    content: (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>{t.suggestions.intro}</p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="font-semibold text-green-800 mb-2">{t.suggestions.howTitle}</p>
          <ol className="space-y-2 text-xs text-green-700">
            {t.suggestions.how.map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="p-3 border-2 border-green-300 bg-green-50/50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <Badge className="bg-green-600 text-white text-[10px]">{t.suggestions.best}</Badge>
            <span className="font-bold text-green-700 text-sm">{t.suggestions.saving}</span>
          </div>
          <p className="text-xs font-medium">{t.suggestions.example}</p>
          <p className="text-[10px] text-gray-600">{t.suggestions.plan}</p>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-blue-50 rounded border border-blue-200">
            <ExternalLink className="h-3 w-3 text-blue-600 mb-1" />
            <p className="font-medium text-blue-800">{t.suggestions.seeOffer[0]}</p>
            <p className="text-blue-600">{t.suggestions.seeOffer[1]}</p>
          </div>
          <div className="p-2 bg-purple-50 rounded border border-purple-200">
            <Phone className="h-3 w-3 text-purple-600 mb-1" />
            <p className="font-medium text-purple-800">{t.suggestions.contact[0]}</p>
            <p className="text-purple-600">{t.suggestions.contact[1]}</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            {t.suggestions.tip}
          </p>
        </div>
      </div>
    ),
    color: "text-green-600",
    bg: "bg-green-100"
  },

  // ==================== STEP 5: PROJETS ====================
  {
    icon: Target,
    title: t.savings.title,
    description: t.savings.description,
    content: (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>{t.savings.intro}</p>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
            <Plus className="h-4 w-4" /> {t.savings.examplesTitle}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs text-purple-700">
            {t.savings.examples.map((example) => (
              <div key={example} className="flex items-center gap-1">{example}</div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <p className="font-semibold text-sm">{t.savings.indicatorsTitle}</p>

          <div className="p-3 border rounded-lg bg-white">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
              <span className="font-semibold text-xs text-green-700">{t.savings.inPot}</span>
            </div>
            <p className="text-xs text-gray-600">
              {t.savings.inPotText}
            </p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs text-green-800">
            {t.savings.bonus}
          </p>
        </div>
      </div>
    ),
    color: "text-purple-600",
    bg: "bg-purple-100"
  },

  // ==================== STEP 6: TABLEAU MENSUEL ====================
  {
    icon: Calendar,
    title: t.month.title,
    description: t.month.description,
    content: (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>{t.month.intro}</p>

        <div className="space-y-2">
          <p className="font-semibold text-sm">{t.month.inEachMonth}</p>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded border-l-4 border-green-500">
              <span className="font-medium">{t.month.income[0]}</span>
              <span className="text-gray-500">{t.month.income[1]}</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-orange-50 rounded border-l-4 border-orange-500">
              <span className="font-medium">{t.month.charges[0]}</span>
              <span className="text-gray-500">{t.month.charges[1]}</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-purple-50 rounded border-l-4 border-purple-500">
              <span className="font-medium">{t.month.savings[0]}</span>
              <span className="text-gray-500">{t.month.savings[1]}</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border-l-4 border-blue-500">
              <span className="font-medium">{t.month.left[0]}</span>
              <span className="text-gray-500">{t.month.left[1]}</span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-gray-50 rounded border">
            <MessageCircle className="h-4 w-4 text-primary mb-1" />
            <p className="font-medium">{t.month.note[0]}</p>
            <p className="text-gray-500">{t.month.note[1]}</p>
          </div>
          <div className="p-2 bg-gray-50 rounded border">
            <Lock className="h-4 w-4 text-orange-500 mb-1" />
            <p className="font-medium">{t.month.closing[0]}</p>
            <p className="text-gray-500">{t.month.closing[1]}</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            {t.month.tip}
          </p>
        </div>
      </div>
    ),
    color: "text-blue-600",
    bg: "bg-blue-100"
  },

  // ==================== STEP 7: REALITY CHECK ====================
  {
    icon: FlaskConical,
    title: PREMIUM_ENABLED ? t.reality.title : t.reality.titleSoon,
    description: PREMIUM_ENABLED ? t.reality.description : t.reality.descriptionSoon,
    content: !PREMIUM_ENABLED ? (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>{t.reality.soon[0]}</p>
        <p>{t.reality.soon[1]}</p>
        <p className="text-xs">{t.reality.noBank}</p>
      </div>
    ) : (
      <div className="space-y-4 text-sm text-muted-foreground">
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2 mb-2">
          <p className="text-xs text-indigo-800 font-medium flex items-center gap-2">
            <FlaskConical className="h-3 w-3" /> {t.reality.beta}
          </p>
        </div>

        <p>{t.reality.intro}</p>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <p className="font-semibold text-indigo-800 mb-2">{t.reality.howTitle}</p>
          <ol className="space-y-2 text-xs text-indigo-700">
            {t.reality.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="bg-indigo-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] flex-shrink-0">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-green-50 rounded border border-green-200">
            <Eye className="h-4 w-4 text-green-600 mb-1" />
            <p className="font-medium text-green-800">{t.reality.demo[0]}</p>
            <p className="text-green-600">{t.reality.demo[1]}</p>
          </div>
          <div className="p-2 bg-blue-50 rounded border border-blue-200">
            <ShieldCheck className="h-4 w-4 text-blue-600 mb-1" />
            <p className="font-medium text-blue-800">{t.reality.secure[0]}</p>
            <p className="text-blue-600">{t.reality.secure[1]}</p>
          </div>
        </div>
      </div>
    ),
    color: "text-indigo-600",
    bg: "bg-indigo-100"
  },

  // ==================== STEP 8: COLLABORATION ====================
  {
    icon: Users,
    title: t.team.title,
    description: t.team.description,
    content: (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>
          {t.team.intro}
        </p>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
            <Plus className="h-4 w-4" /> {t.team.inviteTitle}
          </p>
          <ol className="space-y-2 text-xs text-purple-700">
            {t.team.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="bg-purple-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] flex-shrink-0">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="font-semibold text-sm">{t.team.rolesTitle}</p>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2 p-2 bg-amber-50 rounded border border-amber-200">
              <span className="text-amber-600">👑</span>
              <div>
                <span className="font-medium text-amber-800">{t.team.owner[0]}</span>
                <span className="text-amber-600 block">{t.team.owner[1]}</span>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 bg-gray-50 rounded border border-gray-200">
              <span className="text-gray-600">👤</span>
              <div>
                <span className="font-medium text-gray-800">{t.team.member[0]}</span>
                <span className="text-gray-600 block">{t.team.member[1]}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            {t.team.realtime}
          </p>
        </div>
      </div>
    ),
    color: "text-purple-600",
    bg: "bg-purple-100"
  },

  // ==================== STEP 9: LET'S GO ====================
  {
    icon: CheckCircle2,
    title: t.ready.title,
    description: t.ready.description,
    content: (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>{t.ready.intro}</p>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            {t.ready.firstActions}
          </p>
          <ol className="space-y-2 text-xs">
            <li className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-[10px]">1</div>
              <span>{t.ready.actions[0]}</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-[10px]">2</div>
              <span>{t.ready.actions[1]}</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px]">3</div>
              <span>{t.ready.actions[2]}</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">4</div>
              <span>{t.ready.actions[3]}</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">5</div>
              <span>{t.ready.actions[4]}</span>
            </li>
          </ol>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg border text-center">
            <HelpCircle className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-xs font-medium">{t.ready.help}</p>
            <p className="text-[10px] text-gray-500">{t.ready.helpHow}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border text-center">
            <RefreshCw className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-xs font-medium">{t.ready.replay[0]}</p>
            <p className="text-[10px] text-gray-500">{t.ready.replay[1]}</p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p className="text-sm text-green-800 font-medium">
            {t.ready.cheer}
          </p>
          <p className="text-xs text-green-600 mt-1">
            {t.ready.stat}
          </p>
        </div>
      </div>
    ),
    color: "text-green-600",
    bg: "bg-green-100"
  }
];

// ============================================================================
// MAIN COMPONENT: TUTORIAL MODAL
// ============================================================================

export function TutorialModal() {
  const { isOpen, closeTutorial } = useTutorial();
  const [currentStep, setCurrentStep] = useState(0);
  const t = useT(M);
  const STEPS = useMemo(() => steps(t), [t]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    closeTutorial();
    setTimeout(() => setCurrentStep(0), 300); // Reset after animation
  };

  const handleSkip = () => {
    handleClose();
  };

  const StepIcon = STEPS[currentStep].icon;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${STEPS[currentStep].bg}`}>
            <StepIcon className={`h-8 w-8 ${STEPS[currentStep].color}`} />
          </div>
          <DialogTitle className="text-center text-xl">
            {STEPS[currentStep].title}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {STEPS[currentStep].description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 px-2 sm:px-4">
          {STEPS[currentStep].content}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3 items-center">
          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mb-4 sm:mb-0 sm:mr-auto items-center order-2 sm:order-1">
            {STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                // min-h-0/min-w-0: the dots stay dots on touch screens (the global
                // 44 px tap-target rule would make 9 wide buttons); Précédent /
                // Suivant are the touch navigation.
                className={`h-2 min-h-0 min-w-0 rounded-full transition-all ${
                  index === currentStep 
                    ? 'bg-primary w-6' 
                    : index < currentStep
                    ? 'bg-primary/50 w-2'
                    : 'bg-muted w-2 hover:bg-muted-foreground/30'
                }`}
                aria-label={t.goTo(index + 1)}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
            {isFirstStep ? (
              <Button 
                onClick={handleSkip} 
                variant="ghost"
                className="flex-1 sm:flex-none text-muted-foreground"
              >
                {t.skip}
              </Button>
            ) : (
              <Button 
                onClick={handlePrevious} 
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                {t.previous}
              </Button>
            )}
            <Button 
              onClick={handleNext} 
              className="flex-1 sm:flex-none gap-2 bg-gradient-to-r from-primary to-[hsl(35_90%_65%)] hover:opacity-90"
            >
              {isLastStep ? (
                <>{t.start} <Check className="h-4 w-4" /></>
              ) : (
                <>{t.next} <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </div>
        </DialogFooter>

        {/* Step counter */}
        <div className="text-center text-xs text-muted-foreground pb-2 pt-2">
          {t.counter(currentStep + 1, STEPS.length)}
        </div>
      </DialogContent>
    </Dialog>
  );
}