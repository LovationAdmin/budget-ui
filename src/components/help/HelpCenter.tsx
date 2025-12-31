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
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
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
          <FeatureBox icon={Lock} title="Chiffrement de bout en bout" color="green">
            <p>Toutes vos données sont cryptées avec l'algorithme AES-256 avant d'être stockées. Même en cas d'intrusion sur nos serveurs, vos données resteraient illisibles.</p>
          </FeatureBox>

          <FeatureBox icon={EyeOff} title="Architecture Zero-Knowledge" color="blue">
            <p>Nous utilisons une architecture où nous n'avons techniquement pas accès à vos données brutes. Seul vous (et les membres que vous invitez) pouvez les déchiffrer.</p>
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
    category: 'Revenus',
    icon: Users,
    title: 'Gérer les Membres du Foyer',
    description: 'Ajouter des salaires, gérer les revenus variables et les périodes d\'emploi.',
    tags: ['salaire', 'revenus', 'membres', 'foyer', 'personnes', 'emploi'],
    content: (
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          La section "Membres" vous permet de définir qui apporte des revenus au foyer et combien.
        </p>

        <div>
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Ajouter un Membre
          </h4>
          <StepGuide steps={[
            { title: "Cliquez sur 'Ajouter un membre'", description: "Le bouton se trouve en bas de la section verte 'Membres du Foyer'." },
            { title: "Entrez le nom", description: "Ex: 'Jean', 'Marie', ou même 'Freelance' si vous avez plusieurs sources." },
            { title: "Définissez le salaire mensuel NET", description: "C'est le montant qui arrive réellement sur votre compte chaque mois." },
            { title: "(Optionnel) Ajoutez des dates", description: "Si la personne a commencé ou terminé un emploi en cours d'année." }
          ]} />
        </div>

        <Separator />

        <div className="grid gap-4">
          <FeatureBox icon={Calendar} title="Revenus Temporaires" color="orange">
            <p>
              <strong>Date de début/fin :</strong> Utilisez ces champs si quelqu'un commence un emploi en Mars ou le quitte en Septembre. 
              Le système calculera automatiquement les revenus uniquement sur les mois concernés.
            </p>
          </FeatureBox>

          <FeatureBox icon={Banknote} title="Revenus Exceptionnels" color="green">
            <p>
              Pour les primes, 13ème mois, ou remboursements ponctuels, utilisez plutôt la ligne <strong>"Revenus Exceptionnels"</strong> dans le Tableau Mensuel. 
              Cela évite de gonfler artificiellement vos revenus mensuels récurrents.
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
    title: 'Gérer les Charges Fixes',
    description: 'Ajouter, modifier et catégoriser vos dépenses récurrentes.',
    tags: ['charges', 'dépenses', 'fixes', 'loyer', 'factures', 'abonnements', 'prélèvements'],
    content: (
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          Les charges sont vos dépenses fixes mensuelles : loyer, crédits, abonnements, assurances, etc.
        </p>

        <div>
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Ajouter une Charge
          </h4>
          <StepGuide steps={[
            { title: "Cliquez sur 'Ajouter une charge'", description: "Le bouton se trouve en bas de la section orange 'Charges Mensuelles'." },
            { title: "Entrez le libellé", description: "Ex: 'Loyer', 'EDF', 'Netflix', 'Crédit Auto'. Soyez précis !" },
            { title: "Indiquez le montant mensuel", description: "Le montant prélevé chaque mois sur votre compte." },
            { title: "L'IA détecte la catégorie", description: "En quittant le champ libellé, notre IA identifie automatiquement la catégorie (Énergie, Mobile, etc.)." }
          ]} />
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold text-sm mb-3">Les Boutons d'Action</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-1.5 bg-white rounded border"><Edit className="h-4 w-4 text-gray-600" /></div>
              <div>
                <p className="font-medium text-sm">Modifier (✏️)</p>
                <p className="text-xs text-gray-600">Cliquez pour éditer le libellé, montant ou les dates de la charge.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-1.5 bg-white rounded border"><Trash2 className="h-4 w-4 text-red-600" /></div>
              <div>
                <p className="font-medium text-sm">Supprimer (🗑️)</p>
                <p className="text-xs text-gray-600">Supprime définitivement la charge. Une confirmation est demandée.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-1.5 bg-white rounded border"><Calendar className="h-4 w-4 text-orange-600" /></div>
              <div>
                <p className="font-medium text-sm">Période (📅)</p>
                <p className="text-xs text-gray-600">Définissez une date de début et/ou fin pour les charges temporaires (ex: crédit qui se termine en Juin).</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-1.5 bg-white rounded border"><Lightbulb className="h-4 w-4 text-yellow-500" /></div>
              <div>
                <p className="font-medium text-sm">Suggestions ON/OFF (💡)</p>
                <p className="text-xs text-gray-600">
                  Active ou désactive les suggestions d'économies IA pour cette charge spécifique. 
                  Utile si vous ne souhaitez pas de conseils pour certaines dépenses.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-1.5 bg-white rounded border"><Link className="h-4 w-4 text-indigo-600" /></div>
              <div>
                <p className="font-medium text-sm">Lier aux Transactions (🔗)</p>
                <p className="text-xs text-gray-600">
                  <strong>(Beta 2 uniquement)</strong> Associez cette charge à des transactions bancaires réelles pour comparer prévu vs réel.
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
              cliquez sur l'icône 💡 dans la liste des charges pour la désactiver.
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
    title: 'Projets d\'Épargne & Objectifs',
    description: 'Créer des enveloppes budgétaires pour vos projets futurs.',
    tags: ['projets', 'épargne', 'objectifs', 'vacances', 'travaux', 'économies', 'enveloppes'],
    content: (
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          Les projets sont des "enveloppes virtuelles" où vous accumulez de l'argent chaque mois pour des objectifs précis.
        </p>

        <div>
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Créer un Projet
          </h4>
          <StepGuide steps={[
            { title: "Cliquez sur 'Ajouter un projet'", description: "Le bouton se trouve dans la section violette 'Projets d'Épargne'." },
            { title: "Nommez votre projet", description: "Ex: 'Vacances Été 2025', 'Travaux Salle de Bain', 'Fonds d'Urgence'." },
            { title: "(Optionnel) Définissez un objectif", description: "Montant cible (ex: 3000€). Une barre de progression apparaîtra." }
          ]} />
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold text-sm mb-3">Comprendre les Indicateurs</h4>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-white">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                <span className="font-semibold text-sm text-green-700">EN CAISSE (Réalisé)</span>
              </div>
              <p className="text-xs text-gray-600">
                C'est l'argent <strong>réellement accumulé</strong> sur les mois passés. 
                Si nous sommes en Juin et que vous avez mis 200€/mois depuis Janvier, 
                vous avez <strong>1200€ en caisse</strong>. C'est de l'argent disponible aujourd'hui.
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-white">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-3 w-3 rounded-full bg-primary/40"></div>
                <span className="font-semibold text-sm text-primary">PLANIFIÉ (Projection)</span>
              </div>
              <p className="text-xs text-gray-600">
                C'est une <strong>projection</strong> de ce que vous aurez en fin d'année si vous suivez votre plan. 
                Ex: 200€/mois x 12 = <strong>2400€ planifiés</strong>. 
                Utile pour savoir si vous pourrez financer vos vacances en Août !
              </p>
            </div>
          </div>
        </div>

        <FeatureBox icon={BarChart3} title="Barre de Progression" color="purple">
          <p>
            Si vous définissez un objectif (ex: 3000€), une barre de progression s'affiche.
            Quand elle atteint 100%, vous recevez une notification 🎉 "Objectif Atteint !".
          </p>
        </FeatureBox>

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
    title: 'Le Tableau Mensuel',
    description: 'Le cœur de votre planification financière sur 12 mois.',
    tags: ['tableau', 'mensuel', 'planification', 'budget', 'mois', 'allocation', 'reste à vivre'],
    content: (
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          Le Tableau Mensuel est le cœur de Budget Famille. Il affiche vos 12 mois en colonnes avec tous vos flux financiers.
        </p>

        <div>
          <h4 className="font-semibold text-sm mb-3">Structure du Tableau</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded border-l-4 border-green-500">
              <span className="font-medium">📈 Revenus</span>
              <span className="text-xs text-gray-600">- Salaires de chaque membre + Revenus exceptionnels</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-orange-50 rounded border-l-4 border-orange-500">
              <span className="font-medium">📉 Charges</span>
              <span className="text-xs text-gray-600">- Total de vos charges fixes du mois</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border-l-4 border-blue-500">
              <span className="font-medium">💰 Reste à Vivre</span>
              <span className="text-xs text-gray-600">- Revenus - Charges = Ce qu'il vous reste</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-purple-50 rounded border-l-4 border-purple-500">
              <span className="font-medium">🎯 Projets</span>
              <span className="text-xs text-gray-600">- Lignes pour allouer de l'argent à vos projets</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border-l-4 border-gray-500">
              <span className="font-medium">✨ Solde du mois</span>
              <span className="text-xs text-gray-600">- Ce qui reste après avoir alimenté vos projets</span>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold text-sm mb-3">Fonctionnalités Avancées</h4>
          <div className="grid gap-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <MessageCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Commentaires 💬</p>
                <p className="text-xs text-gray-600">
                  Cliquez sur l'icône bulle pour ajouter une note. 
                  Ex: "Prime reçue", "Régularisation EDF", "Anniversaire enfant".
                  Idéal pour communiquer avec votre conjoint(e).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Lock className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Verrouillage 🔒</p>
                <p className="text-xs text-gray-600">
                  Une fois un mois écoulé et vérifié, verrouillez-le pour éviter les modifications accidentelles.
                  Le cadenas apparaît en haut de la colonne du mois.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <ArrowLeftRight className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Navigation Années</p>
                <p className="text-xs text-gray-600">
                  Utilisez les flèches ◀ 2024 ▶ en haut pour naviguer entre les années.
                  Vos données sont conservées pour chaque année séparément.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-800">
              <strong>Astuce :</strong> Cliquez directement dans une cellule pour modifier le montant.
              Les totaux se mettent à jour automatiquement en temps réel.
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
    title: 'Reality Check (Connexion Bancaire)',
    description: 'Connectez votre banque pour comparer budget vs réalité.',
    tags: ['banque', 'connexion', 'transactions', 'reality check', 'psd2', 'enable banking', 'beta'],
    content: (
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
    description: 'Partager votre budget avec votre famille.',
    tags: ['invitation', 'membre', 'partage', 'famille', 'conjoint', 'collaboration'],
    content: (
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          Budget Famille est conçu pour être utilisé à plusieurs. Invitez votre conjoint(e) ou d'autres membres de la famille.
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
              Utilisez les commentaires du Tableau Mensuel pour communiquer : 
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

        <div>
          <h4 className="font-semibold text-sm mb-3">Raccourcis Clavier</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">Sauvegarder le budget</span>
              <div className="flex gap-1"><KBD>Ctrl</KBD> + <KBD>S</KBD></div>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">Naviguer entre les cellules</span>
              <div className="flex gap-1"><KBD>Tab</KBD> ou <KBD>↵ Enter</KBD></div>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">Annuler une saisie</span>
              <div className="flex gap-1"><KBD>Échap</KBD></div>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold text-sm mb-3">Astuces Pro</h4>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Sauvegarde automatique :</strong> Vos données sont sauvegardées automatiquement toutes les 30 secondes.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Clic direct :</strong> Cliquez directement sur n'importe quel chiffre pour le modifier.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Notification objectif :</strong> Vous recevez une alerte quand un projet atteint son objectif.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Multi-années :</strong> Naviguez entre les années pour voir l'historique ou planifier l'avenir.</span>
            </div>
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
              Oui. Nous utilisons un chiffrement AES-256 de bout en bout. Même nos ingénieurs ne peuvent pas lire vos données.
              Consultez notre article "Confidentialité" pour plus de détails.
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
              Il n'y a pas de bouton "Annuler" intégré. Cependant, la sauvegarde automatique se fait toutes les 30 secondes.
              Si vous faites une erreur, rechargez la page rapidement (F5) avant la prochaine sauvegarde.
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