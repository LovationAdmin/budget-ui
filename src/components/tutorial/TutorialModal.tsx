import { useState } from 'react';
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

// ============================================================================
// TUTORIAL STEPS CONFIGURATION - COMPREHENSIVE VERSION
// ============================================================================

const STEPS = [
  // ==================== STEP 1: WELCOME ====================
  {
    icon: ShieldCheck,
    title: "Bienvenue sur Budget Famille 👋",
    description: "L'outil de gestion budgétaire sécurisé pour toute la famille.",
    content: (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>
          Bienvenue dans votre nouvel espace de gestion financière ! 
          Ce tutoriel va vous guider à travers toutes les fonctionnalités en <strong>8 étapes simples</strong>.
        </p>
        
        <div className="grid gap-3 my-4">
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <Lock className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-800">Chiffrement de bout en bout</p>
              <p className="text-xs text-green-700">Vos données sont cryptées avant d'arriver sur nos serveurs. Personne d'autre que vous ne peut les lire.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Users className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-blue-800">Multi-utilisateurs</p>
              <p className="text-xs text-blue-700">Invitez votre conjoint(e) et gérez votre budget ensemble, en temps réel.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <Sparkles className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-purple-800">Intelligence Artificielle</p>
              <p className="text-xs text-purple-700">Notre IA analyse vos charges et trouve des économies potentielles.</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground italic">
          ⏱️ Durée estimée : 3-5 minutes
        </p>
      </div>
    ),
    color: "text-primary",
    bg: "bg-primary/10"
  },

  // ==================== STEP 2: MEMBRES / REVENUS ====================
  {
    icon: Users,
    title: "Étape 1 : Vos Revenus 💰",
    description: "Définissez qui apporte de l'argent au foyer.",
    content: (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>
          La section <strong className="text-green-700">"Membres du Foyer"</strong> (carte verte) vous permet de déclarer les revenus de chaque personne.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="font-semibold text-green-800 mb-2 flex items-center gap-2">
            <Plus className="h-4 w-4" /> Comment ajouter un membre ?
          </p>
          <ol className="space-y-2 text-xs text-green-700">
            <li className="flex items-start gap-2">
              <span className="bg-green-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] flex-shrink-0">1</span>
              <span>Cliquez sur <strong>"Ajouter un membre"</strong> en bas de la section verte.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-green-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] flex-shrink-0">2</span>
              <span>Entrez le <strong>nom</strong> (ex: "Marie", "Jean") et le <strong>salaire NET mensuel</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-green-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] flex-shrink-0">3</span>
              <span>Optionnel : ajoutez des <strong>dates de début/fin</strong> si l'emploi est temporaire.</span>
            </li>
          </ol>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="font-semibold text-sm flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600" /> Boutons disponibles
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <Edit className="h-3 w-3 text-gray-600" />
              <span>Modifier</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <Trash2 className="h-3 w-3 text-red-600" />
              <span>Supprimer</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <Calendar className="h-3 w-3 text-orange-600" />
              <span>Période d'emploi</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            <strong>💡 Conseil :</strong> Entrez toujours le salaire <strong>NET</strong> (après impôts), pas le brut !
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
    title: "Étape 2 : Vos Charges Fixes 📋",
    description: "Listez vos dépenses récurrentes mensuelles.",
    content: (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>
          La section <strong className="text-orange-700">"Charges Mensuelles"</strong> (carte orange) regroupe toutes vos dépenses fixes : loyer, crédits, abonnements, assurances...
        </p>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
            <Plus className="h-4 w-4" /> Comment ajouter une charge ?
          </p>
          <ol className="space-y-2 text-xs text-orange-700">
            <li className="flex items-start gap-2">
              <span className="bg-orange-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] flex-shrink-0">1</span>
              <span>Cliquez sur <strong>"Ajouter une charge"</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-orange-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] flex-shrink-0">2</span>
              <span>Entrez le <strong>libellé</strong> précis (ex: "EDF", "Loyer", "Netflix").</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-orange-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] flex-shrink-0">3</span>
              <span>L'IA <strong>détecte automatiquement</strong> la catégorie (Énergie, Mobile, etc.).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-orange-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] flex-shrink-0">4</span>
              <span>Indiquez le <strong>montant mensuel</strong> prélevé.</span>
            </li>
          </ol>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="font-semibold text-sm">🔘 Boutons d'action sur chaque charge :</p>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2 p-2 bg-gray-50 rounded">
              <Edit className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Modifier (✏️)</span>
                <span className="text-gray-500 block">Changez le libellé, montant ou dates.</span>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 bg-gray-50 rounded">
              <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Suggestions ON/OFF (💡)</span>
                <span className="text-gray-500 block">Active/désactive les suggestions IA pour cette charge.</span>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 bg-gray-50 rounded">
              <Link className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Lier transactions (🔗)</span>
                <span className="text-gray-500 block">(Beta) Associez à vos vraies transactions bancaires.</span>
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
    title: "Étape 3 : Suggestions d'Économies 🤖",
    description: "Laissez l'IA trouver des économies pour vous.",
    content: (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>
          Notre intelligence artificielle analyse vos charges et compare avec le marché pour trouver des <strong>alternatives moins chères</strong>.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="font-semibold text-green-800 mb-2">🎯 Comment ça marche ?</p>
          <ol className="space-y-2 text-xs text-green-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Vous ajoutez une charge (ex: "Free Mobile - 20€").</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>L'IA détecte la catégorie "Mobile".</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Elle scanne les offres actuelles du marché français.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Elle affiche le <strong>TOP 3 des meilleures alternatives</strong>.</span>
            </li>
          </ol>
        </div>

        <div className="p-3 border-2 border-green-300 bg-green-50/50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <Badge className="bg-green-600 text-white text-[10px]">🏆 Meilleure offre</Badge>
            <span className="font-bold text-green-700 text-sm">-60€/an</span>
          </div>
          <p className="text-xs font-medium">Exemple : Prixtel</p>
          <p className="text-[10px] text-gray-600">Forfait 50Go à 9.99€/mois</p>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-blue-50 rounded border border-blue-200">
            <ExternalLink className="h-3 w-3 text-blue-600 mb-1" />
            <p className="font-medium text-blue-800">Voir l'offre</p>
            <p className="text-blue-600">Accès au site officiel</p>
          </div>
          <div className="p-2 bg-purple-50 rounded border border-purple-200">
            <Phone className="h-3 w-3 text-purple-600 mb-1" />
            <p className="font-medium text-purple-800">Contacter</p>
            <p className="text-purple-600">Appel ou email direct</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            <strong>💡 Astuce :</strong> Pour désactiver les suggestions sur une charge (ex: votre loyer), 
            cliquez sur l'icône 💡 dans la liste des charges.
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
    title: "Étape 4 : Projets d'Épargne 🎯",
    description: "Créez des enveloppes pour vos objectifs financiers.",
    content: (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>
          Les <strong className="text-purple-700">Projets</strong> sont des "enveloppes virtuelles" où vous accumulez de l'argent chaque mois pour des objectifs précis.
        </p>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
            <Plus className="h-4 w-4" /> Exemples de projets
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs text-purple-700">
            <div className="flex items-center gap-1">🏖️ Vacances été</div>
            <div className="flex items-center gap-1">🔧 Travaux maison</div>
            <div className="flex items-center gap-1">🚗 Nouvelle voiture</div>
            <div className="flex items-center gap-1">🚨 Fonds d'urgence</div>
            <div className="flex items-center gap-1">🎄 Cadeaux Noël</div>
            <div className="flex items-center gap-1">📚 Études enfants</div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <p className="font-semibold text-sm">Comprendre les indicateurs :</p>
          
          <div className="p-3 border rounded-lg bg-white">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
              <span className="font-semibold text-xs text-green-700">EN CAISSE (Réalisé)</span>
            </div>
            <p className="text-xs text-gray-600">
              Argent <strong>déjà accumulé</strong> sur les mois passés. C'est de l'argent disponible aujourd'hui !
            </p>
          </div>

          <div className="p-3 border rounded-lg bg-white">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 w-3 rounded-full bg-primary/40"></div>
              <span className="font-semibold text-xs text-primary">PLANIFIÉ (Projection)</span>
            </div>
            <p className="text-xs text-gray-600">
              Ce que vous aurez <strong>en fin d'année</strong> si vous suivez votre plan. Une projection, pas une certitude !
            </p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs text-green-800">
            <strong>🎉 Bonus :</strong> Définissez un "Objectif" (montant cible) et recevez une notification quand il est atteint !
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
    title: "Étape 5 : Le Tableau Mensuel 📅",
    description: "Le cœur de votre planification sur 12 mois.",
    content: (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>
          Le <strong>Tableau Mensuel</strong> affiche vos 12 mois en colonnes avec tous vos flux financiers.
        </p>

        <div className="space-y-2">
          <p className="font-semibold text-sm">Structure du tableau :</p>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded border-l-4 border-green-500">
              <span className="font-medium">📈 Revenus</span>
              <span className="text-gray-500">- Salaires + Exceptionnels</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-orange-50 rounded border-l-4 border-orange-500">
              <span className="font-medium">📉 Charges</span>
              <span className="text-gray-500">- Total des charges fixes</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border-l-4 border-blue-500">
              <span className="font-medium">💰 Reste à Vivre</span>
              <span className="text-gray-500">- Revenus - Charges</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-purple-50 rounded border-l-4 border-purple-500">
              <span className="font-medium">🎯 Projets</span>
              <span className="text-gray-500">- Vos allocations mensuelles</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border-l-4 border-gray-500">
              <span className="font-medium">✨ Solde</span>
              <span className="text-gray-500">- Ce qui reste après projets</span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-gray-50 rounded border">
            <MessageCircle className="h-4 w-4 text-primary mb-1" />
            <p className="font-medium">Commentaires 💬</p>
            <p className="text-gray-500">Ajoutez des notes sur chaque mois</p>
          </div>
          <div className="p-2 bg-gray-50 rounded border">
            <Lock className="h-4 w-4 text-orange-500 mb-1" />
            <p className="font-medium">Verrouillage 🔒</p>
            <p className="text-gray-500">Figez les mois validés</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <strong>💡 Astuce :</strong> Cliquez directement sur n'importe quel chiffre pour le modifier. 
            Utilisez les flèches ◀ ▶ pour changer d'année.
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
    title: "Étape 6 : Reality Check 🏦",
    description: "Comparez votre budget avec vos comptes réels.",
    content: (
      <div className="space-y-4 text-sm text-muted-foreground">
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2 mb-2">
          <p className="text-xs text-indigo-800 font-medium flex items-center gap-2">
            <FlaskConical className="h-3 w-3" /> Fonctionnalité Beta 2
          </p>
        </div>

        <p>
          Le <strong>Reality Check</strong> permet de connecter votre banque pour comparer budget prévu vs dépenses réelles.
        </p>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <p className="font-semibold text-indigo-800 mb-2">🔗 Comment ça marche ?</p>
          <ol className="space-y-2 text-xs text-indigo-700">
            <li className="flex items-start gap-2">
              <span className="bg-indigo-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] flex-shrink-0">1</span>
              <span>Cliquez sur <strong>"Connecter ma banque"</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-indigo-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] flex-shrink-0">2</span>
              <span>Choisissez parmi <strong>2500+ banques</strong> européennes.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-indigo-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] flex-shrink-0">3</span>
              <span>Autorisez l'accès <strong>lecture seule</strong> (protocole PSD2).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-indigo-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] flex-shrink-0">4</span>
              <span><strong>Mappez</strong> vos transactions aux charges de votre budget.</span>
            </li>
          </ol>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-green-50 rounded border border-green-200">
            <Eye className="h-4 w-4 text-green-600 mb-1" />
            <p className="font-medium text-green-800">Mode Démo</p>
            <p className="text-green-600">Testez avec des données fictives</p>
          </div>
          <div className="p-2 bg-blue-50 rounded border border-blue-200">
            <ShieldCheck className="h-4 w-4 text-blue-600 mb-1" />
            <p className="font-medium text-blue-800">100% Sécurisé</p>
            <p className="text-blue-600">Lecture seule, révocable</p>
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
    title: "Étape 7 : Collaboration 👥",
    description: "Gérez votre budget en famille.",
    content: (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>
          Budget Famille est conçu pour être utilisé à plusieurs. Invitez votre conjoint(e) ou d'autres membres de la famille !
        </p>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
            <Plus className="h-4 w-4" /> Inviter un membre
          </p>
          <ol className="space-y-2 text-xs text-purple-700">
            <li className="flex items-start gap-2">
              <span className="bg-purple-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] flex-shrink-0">1</span>
              <span>Cliquez sur <strong>"Inviter des membres"</strong> dans l'en-tête.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-purple-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] flex-shrink-0">2</span>
              <span>Entrez <strong>l'email</strong> de la personne.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-purple-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] flex-shrink-0">3</span>
              <span>Elle reçoit un <strong>lien d'invitation</strong> par email.</span>
            </li>
          </ol>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="font-semibold text-sm">🎭 Rôles disponibles :</p>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2 p-2 bg-amber-50 rounded border border-amber-200">
              <span className="text-amber-600">👑</span>
              <div>
                <span className="font-medium text-amber-800">Propriétaire</span>
                <span className="text-amber-600 block">Tous les droits : modifier, inviter, supprimer le budget.</span>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 bg-gray-50 rounded border border-gray-200">
              <span className="text-gray-600">👤</span>
              <div>
                <span className="font-medium text-gray-800">Membre</span>
                <span className="text-gray-600 block">Peut voir et modifier les données, mais pas inviter.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <strong>🔄 Temps réel :</strong> Toutes les modifications sont synchronisées instantanément. 
            Si votre conjoint(e) ajoute une charge, vous la verrez apparaître immédiatement !
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
    title: "Prêt à Commencer ! 🚀",
    description: "Vous avez toutes les clés en main.",
    content: (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>
          Félicitations ! Vous connaissez maintenant toutes les fonctionnalités de Budget Famille. 
          Voici votre <strong>feuille de route</strong> pour démarrer :
        </p>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            🎯 Vos 5 premières actions
          </p>
          <ol className="space-y-2 text-xs">
            <li className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-[10px]">1</div>
              <span>Ajoutez les <strong>membres</strong> et leurs salaires</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-[10px]">2</div>
              <span>Listez vos <strong>charges fixes</strong> (loyer, crédits, abos...)</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px]">3</div>
              <span>Créez vos <strong>projets d'épargne</strong></span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">4</div>
              <span>Allez dans le <strong>Tableau Mensuel</strong> pour allouer</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">5</div>
              <span>(Optionnel) Testez le <strong>Reality Check</strong> en mode démo</span>
            </li>
          </ol>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg border text-center">
            <HelpCircle className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-xs font-medium">Besoin d'aide ?</p>
            <p className="text-[10px] text-gray-500">Cliquez sur <strong>?</strong> dans le menu</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border text-center">
            <RefreshCw className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-xs font-medium">Revoir ce tutoriel</p>
            <p className="text-[10px] text-gray-500">Menu → Paramètres → Tutoriel</p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p className="text-sm text-green-800 font-medium">
            🎉 Bonne gestion budgétaire !
          </p>
          <p className="text-xs text-green-600 mt-1">
            Les utilisateurs économisent en moyenne <strong>800€/an</strong> grâce aux suggestions IA.
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
                className={`h-2 rounded-full transition-all ${
                  index === currentStep 
                    ? 'bg-primary w-6' 
                    : index < currentStep
                    ? 'bg-primary/50 w-2'
                    : 'bg-muted w-2 hover:bg-muted-foreground/30'
                }`}
                aria-label={`Aller à l'étape ${index + 1}`}
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
                Passer
              </Button>
            ) : (
              <Button 
                onClick={handlePrevious} 
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                Précédent
              </Button>
            )}
            <Button 
              onClick={handleNext} 
              className="flex-1 sm:flex-none gap-2 bg-gradient-to-r from-primary to-[hsl(35_90%_65%)] hover:opacity-90"
            >
              {isLastStep ? (
                <>C'est parti ! <Check className="h-4 w-4" /></>
              ) : (
                <>Suivant <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </div>
        </DialogFooter>

        {/* Step counter */}
        <div className="text-center text-xs text-muted-foreground pb-2 pt-2">
          Étape {currentStep + 1} sur {STEPS.length}
        </div>
      </DialogContent>
    </Dialog>
  );
}