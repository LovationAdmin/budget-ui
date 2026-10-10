import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  BookOpen, 
  ChevronRight, 
  HelpCircle, 
  ShieldCheck, 
  FlaskConical, 
  Sparkles, 
  UserPlus,
  Calendar,
  Target,
  Receipt,
  Users,
  PiggyBank,
  TrendingDown,
  Lock,
  MessageCircle,
  Download,
  Upload,
  Settings,
  Bell,
  CreditCard,
  Banknote,
  Calculator,
  BarChart3,
  Link,
  RefreshCw,
  Lightbulb,
  LightbulbOff,
  Edit,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Phone,
  Mail,
  ExternalLink,
  Globe,
  Building2,
  Wallet,
  ArrowLeftRight,
  CheckCircle2,
  AlertTriangle,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PREMIUM_ENABLED } from '@/lib/premium';

// ============================================================================
// TYPES
// ============================================================================

interface HelpArticle {
  id: string;
  category: string;
  icon: any;
  title: string;
  description: string;
  content: React.ReactNode;
  tags: string[];
}

// ============================================================================
// HELPER COMPONENT: Keyboard Shortcut Badge
// ============================================================================

function KBD({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md shadow-sm">
      {children}
    </kbd>
  );
}

// ============================================================================
// HELPER COMPONENT: Feature Box
// ============================================================================

function FeatureBox({ icon: Icon, title, children, color = "blue" }: { 
  icon: any; 
  title: string; 
  children: React.ReactNode;
  color?: "blue" | "green" | "orange" | "purple" | "red" | "gray";
}) {
  const colors = {
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    green: "bg-green-50 border-green-200 text-green-800",
    orange: "bg-orange-50 border-orange-200 text-orange-800",
    purple: "bg-purple-50 border-purple-200 text-purple-800",
    red: "bg-red-50 border-red-200 text-red-800",
    gray: "bg-gray-50 border-gray-200 text-gray-800",
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4" />
        <span className="font-semibold text-sm">{title}</span>
      </div>
      <div className="text-xs">{children}</div>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENT: Step by Step Guide
// ============================================================================

function StepGuide({ steps }: { steps: { title: string; description: string }[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((step, index) => (
        <li key={index} className="flex gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
            {index + 1}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-900">{step.title}</p>
            <p className="text-xs text-gray-600 mt-0.5">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

// ============================================================================
// HELP ARTICLES DATABASE
// ============================================================================

const HELP_ARTICLES: HelpArticle[] = [
  // ==================== SÉCURITÉ ====================
  {
    id: 'privacy',
    category: 'Sécurité',
    icon: ShieldCheck,
    title: 'Confidentialité & Protection des Données',
    description: 'Comment nous protégeons vos informations bancaires et personnelles.',
    tags: ['sécurité', 'chiffrement', 'données', 'rgpd', 'confidentialité', 'protection'],
    content: (
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          La sécurité de vos données financières est notre priorité absolue. Voici comment nous les protégeons :
        </p>

        <div className="grid gap-4">
          <FeatureBox icon={Lock} title="Chiffrement AES-256-GCM at-rest" color="green">
            <p>Toutes vos données budgétaires sont chiffrées avec l'algorithme AES-256 en mode GCM avant d'être stockées en base de données. En cas d'intrusion sur la base seule, les données restent illisibles sans la clé de chiffrement (stockée séparément, en mémoire serveur).</p>
          </FeatureBox>

          <FeatureBox icon={EyeOff} title="Accès Restreint aux Données" color="blue">
            <p>Vos données budgétaires sont stockées chiffrées en base avec AES-256-GCM. Elles ne sont déchiffrées que pour vous être servies. Notre équipe technique n'y a accès que dans le cadre d'opérations de support, qui sont journalisées.</p>
          </FeatureBox>

          <FeatureBox icon={EyeOff} title="Charges perso privées : visibles par vous seul" color="orange">
            <p>
              Une charge perso marquée <strong>privée</strong> (impôt, envoi d’argent, crédit perso…) n’est jamais écrite dans les données
              partagées du budget : son nom, sa catégorie et sa note sont chiffrés à part et rattachés à votre seul compte.
              Les autres membres, même avec un accès complet au budget, ne voient que « Charge privée » et son montant
              (qui baisse votre argent de poche dans le Foyer).
            </p>
          </FeatureBox>

          <FeatureBox icon={Building2} title="Hébergement Européen (RGPD)" color="purple">
            <p>Toutes nos données sont hébergées en Europe (Frankfurt, Allemagne) conformément au RGPD. Aucun transfert de données hors UE.</p>
          </FeatureBox>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            Connexion Bancaire Sécurisée (PSD2)
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            Lorsque vous connectez votre banque via Enable Banking, nous utilisons le protocole européen PSD2 :
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Lecture seule :</strong> Nous ne pouvons QUE lire vos transactions. Aucun virement, aucune modification possible.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Authentification directe :</strong> Vous vous connectez directement sur le site de votre banque. Nous ne voyons jamais vos identifiants.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Consentement révocable :</strong> Vous pouvez supprimer la connexion à tout moment depuis votre espace bancaire ou notre app.</span>
            </li>
          </ul>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => window.open('/privacy', '_blank')}>
            <ExternalLink className="h-3 w-3 mr-2" />
            Politique de confidentialité
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.open('/terms', '_blank')}>
            <ExternalLink className="h-3 w-3 mr-2" />
            Conditions d'utilisation
          </Button>
        </div>
      </div>
    )
  },

  // ==================== MEMBRES & REVENUS ====================
  {
    id: 'people-section',
    category: 'Foyer',
    icon: Users,
    title: 'Le Foyer : salaires et pot commun',
    description: 'Distinguer le salaire de chacun et ce qu’il verse au pot commun, répartir équitablement.',
    tags: ['salaire', 'revenus', 'membres', 'foyer', 'personnes', 'contribution', 'pot commun', 'prorata', 'répartition'],
    content: (
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          Chacun garde son salaire. Le <strong>pot commun</strong> ne reçoit que la <strong>contribution</strong> de chacun :
          tout son salaire, un montant fixe ou un pourcentage. C’est ce pot qui paie les charges et l’épargne du foyer.
        </p>

        <div>
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Ajouter un membre
          </h4>
          <StepGuide steps={[
            { title: "Onglet « Foyer » → « Ajouter un membre »", description: "Ou depuis le bouton « Ajouter » de la vue Mois." },
            { title: "Prénom et salaire net", description: "Le montant qui arrive réellement sur son compte chaque mois." },
            { title: "Ce que chaque membre verse au pot commun", description: "Tout le salaire, un montant fixe (ex. 1 200 €) ou un pourcentage (ex. 40 %). L’écran affiche aussitôt son argent de poche : ce qui lui reste une fois les charges et l’épargne du foyer payées." },
            { title: "(Optionnel) Arrivée dans le foyer", description: "Pour un membre qui arrive plus tard (colocataire, reprise d’emploi…)." }
          ]} />
        </div>

        <Separator />

        <div className="grid gap-4">
          <FeatureBox icon={Calendar} title="« Ce mois-ci seulement » ou « À partir de ce mois »" color="orange">
            <p>
              Un salaire ou une contribution qui change ? Touchez le membre dans le mois concerné, modifiez, puis choisissez :
              <strong> ce mois seulement</strong> (mois sans salaire, prime…) ou <strong>à partir de ce mois</strong> (augmentation, nouveau contrat).
              Les mois d’avant ne bougent jamais.
            </p>
          </FeatureBox>

          <FeatureBox icon={Calendar} title="Le Foyer, mois par mois" color="purple">
            <p>
              Les flèches ‹ › font défiler les mois : chaque carte montre le salaire, le versement au pot et l’argent de poche
              <strong> du mois choisi</strong> (figés pour un mois clôturé), et le panneau « Le pot commun en … » compare les entrées
              aux charges et à l’épargne du mois. Le lien <strong>« Historique »</strong> d’un membre retrace ses salaires et contributions successifs,
              ses exceptions et un tableau mois par mois.
            </p>
          </FeatureBox>

          <FeatureBox icon={Calculator} title="Répartir le pot commun" color="blue">
            <p>
              Rien à saisir : l’assistant part du salaire net de chacun et du <strong>besoin du mois</strong> (charges + épargne, avec une marge si vous voulez).
              Méthodes : <strong>au prorata</strong> des salaires, <strong>à parts égales</strong>, <strong>même argent de poche</strong> pour chacun,
              ou <strong>tout le salaire</strong>. Le besoin se calcule sur le mois où la répartition commence (par défaut le mois en cours),
              lissé sur 12 mois, ou sur le mois le plus chargé.
            </p>
          </FeatureBox>

          <FeatureBox icon={Wallet} title="Charges perso (déduites de l’argent de poche)" color="orange">
            <p>
              Impôt, envoi d’argent à la famille, crédit perso : ajoutez-les avec <strong>« + Charge perso »</strong> sur la carte du membre
              (ou « Qui la paie ? → Un membre » dans une nouvelle charge). Elles ne touchent ni au pot commun ni à la répartition :
              le Foyer affiche simplement « argent de poche 1 100 €, dont 20 € de charges perso ». Visibles par le foyer, ou
              <strong> privées</strong> : nom chiffré et visible par vous seul, montant visible de tous.
            </p>
          </FeatureBox>

          <FeatureBox icon={Banknote} title="Revenus ponctuels" color="green">
            <p>
              Prime, 13ᵉ mois, remboursement : ajoutez-les comme <strong>revenu ponctuel</strong> dans le mois concerné (vue Mois).
              Ils s’ajoutent aux entrées de ce mois uniquement.
            </p>
          </FeatureBox>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-800">
              <strong>Conseil :</strong> Entrez toujours le salaire NET (après impôts et prélèvements), pas le brut. 
              C'est ce qui compte pour votre budget réel.
            </div>
          </div>
        </div>
      </div>
    )
  },

  // ==================== CHARGES ====================
  {
    id: 'charges-section',
    category: 'Charges',
    icon: Receipt,
    title: 'Les Charges : des règles, pas des cases',
    description: 'Charges mensuelles, certains mois, annuelles ou ponctuelles ; changer un montant sans toucher au passé.',
    tags: ['charges', 'dépenses', 'fixes', 'loyer', 'factures', 'abonnements', 'prélèvements', 'annuelle', 'terminée', 'arrêter', 'exception'],
    content: (
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          Une charge est une <strong>règle</strong> : « 1 180 € tous les mois », « 120 € sauf juillet et août », « 960 € chaque année en octobre ».
          Chaque mois se remplit tout seul à partir de ces règles.
        </p>

        <div>
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Ajouter une charge
          </h4>
          <StepGuide steps={[
            { title: "« Nouvelle charge » (onglet Charges) ou « Ajouter » (vue Mois)", description: "Le formulaire s’ouvre dans un panneau, sans quitter l’écran." },
            { title: "Qui la paie ?", description: "Le pot commun (charge du foyer) ou un membre sur son argent de poche (charge perso, éventuellement privée)." },
            { title: "Nom et fréquence", description: "Chaque mois, certains mois (ex. cantine), chaque année (ex. taxe foncière, avec l’option de la lisser sur 12 mois) ou une seule fois." },
            { title: "Montant et mois de début", description: "Optionnel : une fin (« pendant 12 mois » ou « jusqu’à juin 2027 »). L’encadré « En clair » résume la règle et son effet sur le mois." },
            { title: "L’IA détecte la catégorie", description: "En quittant le champ du nom (Énergie, Mobile, Assurance…)." }
          ]} />
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold text-sm mb-3">Modifier sans réécrire l’historique</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-1.5 bg-white rounded border"><Edit className="h-4 w-4 text-gray-600" /></div>
              <div>
                <p className="font-medium text-sm">Changer le montant</p>
                <p className="text-xs text-gray-600">
                  Depuis un mois : <strong>ce mois seulement</strong> (une exception) ou <strong>à partir de ce mois</strong> (les mois d’avant gardent l’ancien montant).
                  Une erreur de saisie se corrige sur tous les mois ouverts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-1.5 bg-white rounded border"><Calendar className="h-4 w-4 text-orange-600" /></div>
              <div>
                <p className="font-medium text-sm">Arrêter une charge</p>
                <p className="text-xs text-gray-600">
                  Elle passe dans « Terminées » : elle disparaît des mois suivants mais reste dans les mois où elle a compté.
                  Un crédit de janvier à mars n’encombre plus la liste en août.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-1.5 bg-white rounded border"><Trash2 className="h-4 w-4 text-red-600" /></div>
              <div>
                <p className="font-medium text-sm">Supprimer</p>
                <p className="text-xs text-gray-600">Les mois clôturés gardent leur photo : supprimer une charge ne change jamais l’historique.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-1.5 bg-white rounded border"><Lightbulb className="h-4 w-4 text-yellow-500" /></div>
              <div>
                <p className="font-medium text-sm">Suggestions d’économies</p>
                <p className="text-xs text-gray-600">Activables ou désactivables charge par charge, depuis sa fiche.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-1.5 bg-white rounded border"><Link className="h-4 w-4 text-indigo-600" /></div>
              <div>
                <p className="font-medium text-sm">Lier aux transactions</p>
                <p className="text-xs text-gray-600">
                  Depuis la fiche d’une charge : associez-la à des transactions bancaires réelles pour comparer prévu et réel.
                </p>
              </div>
            </div>
          </div>
        </div>

        <FeatureBox icon={Info} title="Catégories Automatiques" color="blue">
          <p>
            L'IA reconnaît automatiquement les catégories : <strong>Énergie</strong> (EDF, Engie), <strong>Mobile</strong> (Free, Orange), 
            <strong>Internet</strong> (Box), <strong>Assurance</strong>, <strong>Prêt</strong>, etc. 
            Ces catégories activent les suggestions d'économies.
          </p>
        </FeatureBox>
      </div>
    )
  },

  // ==================== SUGGESTIONS IA ====================
  {
    id: 'suggestions',
    category: 'Économies',
    icon: Sparkles,
    title: 'Suggestions d\'Économies Intelligentes',
    description: 'Comprendre comment l\'IA analyse vos charges pour trouver des économies.',
    tags: ['ia', 'économies', 'charges', 'concurrents', 'suggestions', 'intelligence artificielle', 'comparateur'],
    content: (
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          Notre intelligence artificielle analyse vos charges récurrentes pour trouver des offres moins chères sur le marché français et européen.
        </p>

        <div>
          <h4 className="font-semibold text-sm mb-3">Comment ça fonctionne ?</h4>
          <StepGuide steps={[
            { title: "Ajoutez vos charges", description: "Entrez vos dépenses fixes (électricité, mobile, internet, assurance...)." },
            { title: "L'IA détecte la catégorie", description: "Le système identifie automatiquement le type de dépense." },
            { title: "Analyse du marché", description: "Notre IA compare votre montant avec les offres actuelles des concurrents." },
            { title: "Affichage du TOP 3", description: "Les 3 meilleures alternatives s'affichent avec l'économie potentielle." }
          ]} />
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold text-sm mb-3">Comprendre les Cartes de Suggestion</h4>
          <div className="space-y-3">
            <div className="p-4 border-2 border-green-300 bg-green-50/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-green-600 text-white">🏆 Meilleure offre</Badge>
                <span className="font-bold text-green-700">-120€/an</span>
              </div>
              <p className="text-sm font-medium">Exemple : Fournisseur A</p>
              <p className="text-xs text-gray-600 mt-1">Offre fibre 1Gb à 29.99€/mois pendant 12 mois</p>
            </div>
            <p className="text-xs text-gray-600">
              La carte verte avec la médaille 🏆 est toujours la meilleure économie identifiée. 
              Les cartes #2 et #3 sont des alternatives si la première ne vous convient pas.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          <FeatureBox icon={Phone} title="Boutons de Contact" color="blue">
            <p>
              Chaque suggestion peut inclure un <strong>numéro de téléphone</strong> et/ou un <strong>email</strong> pour contacter directement le fournisseur.
              Cliquez sur "Voir l'offre" pour accéder au site officiel.
            </p>
          </FeatureBox>

          <FeatureBox icon={RefreshCw} title="Mise en Cache (30 jours)" color="gray">
            <p>
              Les suggestions sont mises en cache pendant 30 jours pour éviter des appels API coûteux.
              Cliquez sur le bouton 🔄 pour forcer une nouvelle analyse.
            </p>
          </FeatureBox>

          <FeatureBox icon={LightbulbOff} title="Désactiver pour une charge" color="orange">
            <p>
              Si vous ne voulez pas de suggestions pour une charge spécifique (ex: votre loyer),
              ouvrez sa fiche dans l’onglet Charges et choisissez « Désactiver les suggestions d’économies ».
            </p>
          </FeatureBox>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-xs text-green-800">
            <strong>🎯 Objectif :</strong> Réduire vos charges fixes de 10-30% sans changer vos habitudes de vie. 
            Les utilisateurs économisent en moyenne <strong>800€/an</strong> grâce aux suggestions.
          </p>
        </div>
      </div>
    )
  },

  // ==================== PROJETS ====================
  {
    id: 'projects-section',
    category: 'Épargne',
    icon: Target,
    title: 'L’Épargne : cagnottes et épargne générale',
    description: 'Mettre de côté chaque mois, suivre chaque cagnotte, payer une dépense avec.',
    tags: ['projets', 'épargne', 'objectifs', 'vacances', 'travaux', 'économies', 'enveloppes', 'cagnotte', 'épargne générale'],
    content: (
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          Une épargne est une <strong>cagnotte</strong> : un montant mis de côté chaque mois (ou choisi mois par mois), avec un objectif si vous voulez.
          Ce qui reste du pot commun à la fin de chaque mois va automatiquement dans l’<strong>épargne générale</strong>.
        </p>

        <div>
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Créer une épargne
          </h4>
          <StepGuide steps={[
            { title: "Onglet « Épargne » → « Nouvelle épargne »", description: "Ou depuis le bouton « Ajouter » de la vue Mois." },
            { title: "Nom et objectif", description: "Ex. « Apport » : 15 000 €. Ou sans objectif, juste un montant mensuel." },
            { title: "Dates", description: "« À partir de » et, si vous avez une échéance, « Pendant… » ou « Jusqu’à… »." },
            { title: "Montant mensuel calculé", description: "Avec un objectif et une échéance, l’app calcule ce qu’il faut mettre de côté chaque mois (15 000 € en 10 mois → 1 500 €). Vous pouvez le modifier." },
            { title: "Faisabilité", description: "L’app vérifie si le pot commun peut suivre chaque mois. Sinon : « Créer et ajuster les contributions » (Foyer) ou « Créer et demander un plan au Budget IA »." }
          ]} />
        </div>

        <Separator />

        <div className="grid gap-4">
          <FeatureBox icon={PiggyBank} title="En caisse" color="purple">
            <p>
              Chaque carte affiche ce qu’il y a dans la cagnotte à la fin du mois en cours : tout ce qui a été mis de côté, moins ce qui a été dépensé avec.
            </p>
          </FeatureBox>

          <FeatureBox icon={Wallet} title="Payer une dépense avec une épargne" color="blue">
            <p>
              Les vacances payées avec la cagnotte « Vacances » ? Enregistrez-les comme <strong>dépense payée par une épargne</strong> :
              l’argent sort de la cagnotte, pas du budget du mois.
            </p>
          </FeatureBox>

          <FeatureBox icon={BarChart3} title="Objectif" color="green">
            <p>
              Avec un objectif (ex. 3 000 €), une barre de progression montre où vous en êtes et combien il reste à mettre de côté.
            </p>
          </FeatureBox>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-800">
            <strong>💡 Conseil Pro :</strong> Créez toujours un projet "Fonds d'Urgence" équivalent à 3-6 mois de charges fixes. 
            C'est votre filet de sécurité en cas d'imprévu.
          </p>
        </div>
      </div>
    )
  },

  // ==================== TABLEAU MENSUEL ====================
  {
    id: 'monthly-table',
    category: 'Planification',
    icon: Calendar,
    title: 'La vue Mois (et l’Année)',
    description: 'Un mois à la fois : entrées du pot commun, charges, épargne, reste et ce qui change.',
    tags: ['tableau', 'mensuel', 'planification', 'budget', 'mois', 'année', 'allocation', 'reste', 'clôture', 'verrouillage'],
    content: (
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          La vue <strong>Mois</strong> est le cœur de Budget Famille : un mois à la fois, rempli automatiquement à partir de vos règles.
          Naviguez avec les flèches ou la frise des 12 mois.
        </p>

        <div>
          <h4 className="font-semibold text-sm mb-3">Ce que montre un mois</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded border-l-4 border-green-500">
              <span className="font-medium">Entrées du pot commun</span>
              <span className="text-xs text-gray-600">- Ce que chacun verse + les revenus ponctuels du mois</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-orange-50 rounded border-l-4 border-orange-500">
              <span className="font-medium">Charges du mois</span>
              <span className="text-xs text-gray-600">- Seulement celles qui s’appliquent ce mois-ci</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-purple-50 rounded border-l-4 border-purple-500">
              <span className="font-medium">Épargne</span>
              <span className="text-xs text-gray-600">- Ce qui est mis de côté, cagnotte par cagnotte</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border-l-4 border-blue-500">
              <span className="font-medium">Reste du mois</span>
              <span className="text-xs text-gray-600">- Entrées − charges − épargne : il part dans l’épargne générale</span>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold text-sm mb-3">Au quotidien</h4>
          <div className="grid gap-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <ArrowLeftRight className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Ce qui change</p>
                <p className="text-xs text-gray-600">
                  Chaque mois liste ce qui a changé depuis le mois précédent : nouvelle charge, hausse, fin d’un crédit, contribution modifiée…
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <MessageCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Note du mois</p>
                <p className="text-xs text-gray-600">
                  Ex : « Prime reçue », « Régularisation EDF », « Anniversaire de Léa ». Visible par tout le foyer.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Lock className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Mois clôturés</p>
                <p className="text-xs text-gray-600">
                  Un mois passé se clôture tout seul : ses montants sont figés, même si une charge change ou disparaît ensuite.
                  Besoin de corriger ? « Rouvrir » montre d’abord ce qui changera.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <BarChart3 className="h-5 w-5 text-indigo-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">L’année en un coup d’œil</p>
                <p className="text-xs text-gray-600">
                  L’onglet « Année » montre les 12 mois côte à côte (entrées, charges, épargne, reste). Touchez un mois pour l’ouvrir.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-800">
              <strong>Astuce :</strong> touchez une ligne pour la modifier. Chaque modification propose « ce mois seulement » ou
              « à partir de ce mois », et peut être annulée juste après.
            </div>
          </div>
        </div>
      </div>
    )
  },

  // ==================== REALITY CHECK ====================
  {
    id: 'reality-check',
    category: 'Beta',
    icon: FlaskConical,
    title: PREMIUM_ENABLED ? 'Reality Check (Connexion Bancaire)' : 'Reality Check (bientôt avec Premium)',
    description: PREMIUM_ENABLED ? 'Connectez votre banque pour comparer budget vs réalité.' : 'Bientôt : votre budget comparé à vos comptes réels.',
    tags: ['banque', 'connexion', 'transactions', 'reality check', 'psd2', 'enable banking', 'beta', 'premium', 'bientôt'],
    content: !PREMIUM_ENABLED ? (
      <div className="space-y-4 text-sm text-gray-600">
        <p>
          Bientôt, avec <strong>Budget Famille Premium</strong>, vos comptes bancaires se synchroniseront pour comparer chaque mois
          ce que votre budget prévoit et ce que vous avez vraiment dépensé, charge par charge. La connexion passera par un
          prestataire agréé (DSP2) : vous vous identifierez sur le site de votre banque, Budget Famille ne verra jamais vos identifiants.
        </p>
        <p>
          En attendant, ouvrez l’onglet <strong>Reality Check</strong> de votre budget pour essayer la démonstration, avec des
          données fictives. Tout le reste de l’application fonctionne sans connexion bancaire. Le prix sera annoncé au lancement.
        </p>
      </div>
    ) : (
      <div className="space-y-6">
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-2">
          <p className="text-xs text-indigo-800 font-medium flex items-center gap-2">
            <FlaskConical className="h-3 w-3" /> Fonctionnalité Expérimentale (Beta 2)
          </p>
        </div>

        <p className="text-sm text-gray-600">
          Le Reality Check permet de comparer vos prévisions budgétaires avec vos dépenses bancaires réelles.
        </p>

        <div>
          <h4 className="font-semibold text-sm mb-3">Comment ça marche ?</h4>
          <StepGuide steps={[
            { title: "Connectez votre banque", description: "Cliquez sur 'Connecter ma banque' et choisissez parmi 2500+ banques européennes." },
            { title: "Autorisez l'accès (lecture seule)", description: "Vous êtes redirigé vers le site de votre banque pour donner un accès sécurisé." },
            { title: "Vos transactions arrivent", description: "Les 90 derniers jours de transactions sont récupérés automatiquement." },
            { title: "Mappez vos charges", description: "Associez chaque transaction récurrente à une charge de votre budget." },
            { title: "Comparez !", description: "Voyez si votre budget prévu correspond à la réalité." }
          ]} />
        </div>

        <Separator />

        <div className="grid gap-4">
          <FeatureBox icon={Building2} title="2500+ Banques Supportées" color="blue">
            <p>
              Grâce à Enable Banking, nous supportons la quasi-totalité des banques européennes : 
              BNP, Société Générale, Crédit Agricole, Boursorama, N26, Revolut, et bien d'autres.
            </p>
          </FeatureBox>

          <FeatureBox icon={Link} title="Mapper une Transaction" color="purple">
            <p>
              Dans la section Charges, cliquez sur l'icône 🔗 pour associer une charge (ex: "EDF") 
              à des transactions bancaires réelles (ex: "PRELEVEMENT EDF"). 
              Le système calcule alors le montant réel dépensé.
            </p>
          </FeatureBox>

          <FeatureBox icon={Eye} title="Mode Démonstration" color="green">
            <p>
              Pas envie de connecter votre vraie banque ? Activez le "Mode Démo" pour voir la fonctionnalité 
              avec des données fictives. Idéal pour tester avant de se lancer.
            </p>
          </FeatureBox>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-xs text-green-800">
            <strong>🔒 Rappel Sécurité :</strong> La connexion est en lecture seule (pas de virements possibles), 
            utilise le protocole européen PSD2, et peut être révoquée à tout moment.
          </p>
        </div>
      </div>
    )
  },

  // ==================== COLLABORATION ====================
  {
    id: 'collaboration',
    category: 'Équipe',
    icon: UserPlus,
    title: 'Inviter des Membres',
    description: 'Partager votre budget avec votre conjoint, votre famille ou vos colocataires.',
    tags: ['invitation', 'membre', 'partage', 'famille', 'conjoint', 'colocation', 'coloc', 'amis', 'collaboration'],
    content: (
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          Budget Famille s'utilise seul ou à plusieurs. Invitez qui vous voulez par e-mail : conjoint(e), famille, colocataires ou amis.
        </p>

        <div>
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" />
            Inviter quelqu'un
          </h4>
          <StepGuide steps={[
            { title: "Cliquez sur 'Inviter des membres'", description: "Le bouton se trouve dans la barre d'en-tête du budget." },
            { title: "Entrez l'adresse email", description: "L'email de la personne que vous souhaitez inviter." },
            { title: "L'invitation est envoyée", description: "La personne reçoit un email avec un lien pour rejoindre le budget." },
            { title: "Elle crée son compte (si besoin)", description: "Si elle n'a pas de compte, elle peut en créer un gratuitement." }
          ]} />
        </div>

        <Separator />

        <div className="grid gap-4">
          <FeatureBox icon={Users} title="Rôles" color="purple">
            <div className="space-y-2">
              <p><strong>Propriétaire :</strong> Peut tout modifier, inviter des membres, supprimer le budget.</p>
              <p><strong>Membre :</strong> Peut voir et modifier les données, mais ne peut pas inviter ni supprimer.</p>
            </div>
          </FeatureBox>

          <FeatureBox icon={RefreshCw} title="Synchronisation Temps Réel" color="blue">
            <p>
              Toutes les modifications sont synchronisées en temps réel. 
              Si votre conjoint(e) ajoute une charge, vous la verrez apparaître instantanément.
            </p>
          </FeatureBox>

          <FeatureBox icon={MessageCircle} title="Communication via Commentaires" color="green">
            <p>
              Utilisez la note de chaque mois (vue Mois) pour communiquer :
              "J'ai payé la régul EDF", "On peut se permettre un resto ce mois-ci ?", etc.
            </p>
          </FeatureBox>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-xs text-purple-800">
            <strong>👥 Conseil :</strong> Prenez un moment chaque mois pour faire le point ensemble sur le tableau de bord. 
            La transparence financière renforce la confiance dans le couple !
          </p>
        </div>
      </div>
    )
  },

  // ==================== IMPORT/EXPORT ====================
  {
    id: 'import-export',
    category: 'Données',
    icon: Download,
    title: 'Import & Export de Données',
    description: 'Sauvegarder et restaurer vos données budgétaires.',
    tags: ['import', 'export', 'sauvegarde', 'backup', 'json', 'données'],
    content: (
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          Vos données vous appartiennent. Vous pouvez les exporter à tout moment et les réimporter si besoin.
        </p>

        <div className="grid gap-4">
          <FeatureBox icon={Download} title="Exporter vos données" color="blue">
            <p>
              Cliquez sur le bouton d'export pour télécharger un fichier JSON contenant toutes vos données : 
              membres, charges, projets, allocations mensuelles, commentaires, etc.
            </p>
          </FeatureBox>

          <FeatureBox icon={Upload} title="Importer des données" color="green">
            <p>
              Vous pouvez importer un fichier JSON précédemment exporté pour restaurer vos données 
              ou les transférer vers un nouveau compte.
            </p>
          </FeatureBox>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-800">
              <strong>Attention :</strong> L'import remplace toutes les données existantes du budget. 
              Faites une sauvegarde avant d'importer si vous avez des données importantes.
            </div>
          </div>
        </div>
      </div>
    )
  },

  // ==================== RACCOURCIS ====================
  {
    id: 'shortcuts',
    category: 'Astuces',
    icon: Settings,
    title: 'Raccourcis & Astuces',
    description: 'Gagnez du temps avec ces fonctionnalités cachées.',
    tags: ['raccourcis', 'astuces', 'tips', 'productivité', 'clavier'],
    content: (
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          Découvrez les astuces pour utiliser Budget Famille plus efficacement.
        </p>

        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span><strong>Sauvegarde automatique :</strong> chaque modification est enregistrée en 1 à 2 secondes ; l’indicateur en bas de l’écran le confirme.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span><strong>Annuler :</strong> après une modification, le message de confirmation propose « Annuler » pendant quelques secondes.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span><strong>Mode sombre :</strong> menu du compte (en haut à droite) › Apparence : Automatique, Clair ou Sombre.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span><strong>Lien vers un mois :</strong> l’adresse de la vue Mois contient le mois (?m=2026-10) : partagez-la ou ajoutez-la en favori.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span><strong>Clavier :</strong> <KBD>Échap</KBD> ferme un panneau ; <KBD>Tab</KBD> parcourt les champs ; dans un formulaire incomplet, le curseur va directement au champ à corriger.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span><strong>Mois clôturés :</strong> un mois passé se fige tout seul ; pour le corriger, touchez-le puis « Rouvrir » : l’écran montre ce qui va changer.</span>
          </div>
        </div>
      </div>
    )
  },

  // ==================== FAQ ====================
  {
    id: 'faq',
    category: 'FAQ',
    icon: HelpCircle,
    title: 'Questions Fréquentes',
    description: 'Réponses aux questions les plus posées.',
    tags: ['faq', 'questions', 'aide', 'problème', 'bug'],
    content: (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">🤔 Mes données sont-elles vraiment sécurisées ?</h4>
            <p className="text-xs text-gray-600">
              Oui. Vos données sont chiffrées en AES-256-GCM avant d’être stockées, hébergées en Europe, et ne sont déchiffrées que pour
              les membres du budget. Les charges perso privées vont plus loin : leur nom est chiffré à part et lisible par vous seul,
              même les autres membres du budget n’y ont pas accès. Détails dans « Confidentialité & Protection des Données ».
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">🏦 Puis-je connecter plusieurs banques ?</h4>
            <p className="text-xs text-gray-600">
              Oui, vous pouvez connecter autant de banques que vous le souhaitez à un même budget.
              Chaque connexion est indépendante et peut être supprimée à tout moment.
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">💸 L'application est-elle payante ?</h4>
            <p className="text-xs text-gray-600">
              L'accès de base est gratuit. Certaines fonctionnalités avancées (comme la connexion bancaire illimitée) 
              peuvent nécessiter un abonnement Premium à l'avenir.
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">📱 Y a-t-il une application mobile ?</h4>
            <p className="text-xs text-gray-600">
              Budget Famille est une Progressive Web App (PWA). Vous pouvez l'installer sur votre téléphone 
              depuis le navigateur : Menu → "Ajouter à l'écran d'accueil".
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">🐛 J'ai trouvé un bug, comment le signaler ?</h4>
            <p className="text-xs text-gray-600">
              Utilisez le bouton 👎 sous n'importe quelle page pour nous envoyer un feedback détaillé.
              Vous pouvez aussi nous contacter directement via lovation.pro@gmail.com.
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">🔄 Comment annuler une modification ?</h4>
            <p className="text-xs text-gray-600">
              Après chaque modification, le message de confirmation propose « Annuler » pendant quelques secondes.
              Au-delà, refaites simplement le changement inverse : les mois clôturés, eux, ne bougent jamais sans votre accord.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">🙈 Les autres membres voient-ils mes charges perso ?</h4>
            <p className="text-xs text-gray-600">
              Une charge perso « visible par le foyer » est vue de tous. Une charge perso <strong>privée</strong> n’apparaît chez les autres
              que comme « Charge privée » avec son montant (il réduit votre argent de poche dans le Foyer) : son nom, sa catégorie et sa note
              ne sont lisibles que par vous.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">📊 Pourquoi le total des charges du mois diffère de la moyenne ?</h4>
            <p className="text-xs text-gray-600">
              L’onglet Charges affiche le total du mois en cours et, à côté, la moyenne sur 12 mois. Une charge qui s’arrête bientôt
              (un crédit qui se termine, un paiement en 3 fois) pèse sur le mois mais peu sur la moyenne : l’écran les nomme.
              Dans le Foyer, vous choisissez la base du besoin à couvrir : le mois de départ, la moyenne lissée ou le mois le plus chargé.
            </p>
          </div>
        </div>
      </div>
    )
  }
];

// ============================================================================
// MAIN COMPONENT: HELP CENTER
// ============================================================================

export function HelpCenter({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  const filteredArticles = useMemo(() => {
    const terms = searchQuery.toLowerCase().split(' ').filter(t => t.length > 2);
    if (terms.length === 0) return HELP_ARTICLES;

    return HELP_ARTICLES.filter(article => {
      const searchableText = `${article.title} ${article.description} ${article.tags.join(' ')} ${article.category}`.toLowerCase();
      return terms.every(term => searchableText.includes(term));
    });
  }, [searchQuery]);

  // Group articles by category
  const groupedArticles = useMemo(() => {
    const groups: Record<string, HelpArticle[]> = {};
    filteredArticles.forEach(article => {
      if (!groups[article.category]) {
        groups[article.category] = [];
      }
      groups[article.category].push(article);
    });
    return groups;
  }, [filteredArticles]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden flex flex-col md:flex-row bg-gray-50 sm:rounded-xl">
        
        {/* Sidebar / Liste */}
        <div className={cn(
          "w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-full",
          selectedArticle ? "hidden md:flex" : "flex"
        )}>
          <div className="p-4 border-b border-gray-100 bg-white">
            <DialogHeader className="mb-4">
              <DialogTitle className="flex items-center gap-2 text-xl font-display">
                <BookOpen className="h-6 w-6 text-primary" /> Centre d'Aide
              </DialogTitle>
            </DialogHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher (ex: banque, projet...)" 
                className="pl-9 bg-gray-50 border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-4">
              {Object.entries(groupedArticles).map(([category, articles]) => (
                <div key={category}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-2">
                    {category}
                  </p>
                  <div className="space-y-1">
                    {articles.map(article => (
                      <button
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className={cn(
                          "w-full text-left p-3 rounded-lg text-sm transition-all flex items-start gap-3 group",
                          selectedArticle?.id === article.id 
                            ? "bg-primary/10 text-primary ring-1 ring-primary/20" 
                            : "hover:bg-gray-100 text-gray-700"
                        )}
                      >
                        <div className={cn(
                          "mt-0.5 p-1.5 rounded-md transition-colors flex-shrink-0",
                          selectedArticle?.id === article.id ? "bg-white/50" : "bg-gray-100 group-hover:bg-white"
                        )}>
                          {React.createElement(article.icon, { className: "h-4 w-4" })}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{article.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{article.description}</p>
                        </div>
                        <ChevronRight className={cn(
                          "h-4 w-4 mt-1 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0",
                          selectedArticle?.id === article.id && "opacity-100 text-primary"
                        )} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              
              {filteredArticles.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Aucun résultat pour "{searchQuery}"</p>
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => setSearchQuery('')}
                    className="mt-2"
                  >
                    Effacer la recherche
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Contact Footer */}
          <div className="p-4 border-t bg-gray-50">
            <p className="text-xs text-muted-foreground mb-2">Besoin d'aide supplémentaire ?</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => window.open('mailto:lovation.pro@gmail.com')}
            >
              <Mail className="h-3 w-3 mr-2" />
              Contacter le support
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className={cn(
          "flex-1 bg-gray-50 flex flex-col h-full",
          !selectedArticle ? "hidden md:flex" : "flex"
        )}>
          {selectedArticle ? (
            <>
              <div className="md:hidden p-4 bg-white border-b flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedArticle(null)}>
                  ← Retour
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-6 md:p-8 max-w-3xl mx-auto">
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="bg-white">{selectedArticle.category}</Badge>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 font-display">
                      {selectedArticle.title}
                    </h1>
                    <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                      {selectedArticle.description}
                    </p>
                  </div>
                  
                  <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
                    {selectedArticle.content}
                  </div>

                  {/* Tags */}
                  <div className="mt-6 flex flex-wrap gap-2">
                    {selectedArticle.tags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="text-xs cursor-pointer hover:bg-primary/10"
                        onClick={() => setSearchQuery(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
              <div className="h-20 w-20 bg-gray-200/50 rounded-full flex items-center justify-center mb-6">
                <HelpCircle className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900">Centre d'aide Budget Famille</p>
              <p className="text-sm text-gray-500 mt-2 text-center max-w-md">
                Sélectionnez un article à gauche pour obtenir de l'aide sur une fonctionnalité spécifique.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span>{HELP_ARTICLES.length} articles</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Search className="h-4 w-4" />
                  <span>Recherche instantanée</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}