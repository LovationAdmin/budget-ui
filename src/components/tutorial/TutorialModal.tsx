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
  FlaskConical
} from "lucide-react";

// ============================================================================
// TUTORIAL STEPS CONFIGURATION
// ============================================================================

const STEPS = [
  {
    icon: ShieldCheck,
    title: "Bienvenue sur Budget Famille",
    description: "Une approche sécurisée et collaborative pour maîtriser vos finances.",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          Bienvenue dans votre nouvel espace de gestion financière. Ici, la confidentialité est notre priorité absolue :
        </p>
        <ul className="list-disc pl-4 space-y-2">
            <li><strong>Chiffrement de bout en bout :</strong> Vos données sont cryptées avant même d'être enregistrées.</li>
            <li><strong>Architecture Zero-Knowledge :</strong> Nous n'avons techniquement pas accès à vos données brutes.</li>
            <li><strong>Collaboratif :</strong> Conçu pour être utilisé à deux (ou plus) en temps réel.</li>
        </ul>
      </div>
    ),
    color: "text-primary",
    bg: "bg-primary/10"
  },
  {
    icon: Calendar,
    title: "Le Tableau Mensuel",
    description: "Le cœur de votre planification financière sur 12 mois.",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>Gérez votre année fiscale mois par mois avec précision :</p>
        <ul className="list-disc pl-4 space-y-2">
          <li>
            <strong>Revenus & Charges :</strong> Saisissez vos salaires et prélèvements fixes pour calculer votre "Reste à Vivre" théorique.
          </li>
          <li>
            <strong>Répartition Intelligente :</strong> Allouez le disponible dans vos différents projets.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1"><MessageCircle className="h-3 w-3 inline text-primary" /></span>
            <span>
              <strong>Système de Commentaires :</strong> Utilisez les bulles pour justifier une dépense, noter un rappel (ex: "Régul EDF") ou discuter d'un choix budgétaire avec votre conjoint.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1"><Lock className="h-3 w-3 inline text-orange-500" /></span>
            <span>
              <strong>Verrouillage :</strong> Une fois un mois écoulé et vérifié, verrouillez-le pour figer les comptes et éviter les modifications accidentelles.
            </span>
          </li>
        </ul>
      </div>
    ),
    color: "text-blue-600",
    bg: "bg-blue-100"
  },
  {
    icon: Target,
    title: "Projets & Objectifs",
    description: "Distinguez clairement le Rêve de la Réalité.",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>Ne mélangez plus l'argent que vous <em>avez</em> et celui que vous <em>aurez</em>. Nous utilisons un double affichage :</p>
        
        <div className="space-y-3 border-l-2 border-muted pl-4 my-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 rounded-full bg-success shadow-[0_0_6px_rgba(34,197,94,0.4)]"></div>
                <span className="text-xs font-bold text-success uppercase">EN CAISSE (Passé & Présent)</span>
            </div>
            <p className="text-xs">
                C'est l'argent <strong>réellement accumulé</strong> sur les mois passés. C'est votre épargne disponible aujourd'hui.
            </p>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 rounded-full bg-primary/30"></div>
                <span className="text-xs font-bold text-primary uppercase">PLANIFIÉ (Futur)</span>
            </div>
            <p className="text-xs">
                C'est une <strong>projection</strong>. Si vous suivez votre budget jusqu'à la fin de l'année, vous atteindrez ce montant. Idéal pour savoir si vous pourrez payer vos vacances en Août !
            </p>
          </div>
        </div>
        <p><strong>💡 Astuce :</strong> Définissez un "Objectif" (Montant cible) pour chaque projet afin de voir votre barre de progression avancer.</p>
      </div>
    ),
    color: "text-secondary",
    bg: "bg-secondary/10"
  },
  {
    icon: FlaskConical, // Changed icon to represent Beta/Lab
    title: "Reality Check (Beta / Sandbox)",
    description: "Le test de réalité : Budget Théorique vs Compte Bancaire.",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-2">
            <p className="text-xs text-indigo-800 font-medium flex items-center gap-2">
                <Sparkles className="h-3 w-3" /> Fonctionnalité Expérimentale
            </p>
        </div>
        <p>
          Fini les fichiers Excel déconnectés de la réalité. Cette fonctionnalité (actuellement en test) permet de :
        </p>
        <ul className="list-disc pl-4 space-y-2">
          <li>
            <strong>Connecter votre banque</strong> via le protocole sécurisé européen <strong>PSD2</strong> (Enable Banking).
          </li>
          <li>
            <strong>Mapper vos transactions :</strong> Liez une dépense réelle (ex: "Prélèvement Free") à une ligne de votre budget (ex: "Internet").
          </li>
          <li>
            <strong>Détecter les écarts :</strong> Le système vous alerte si vous avez dépensé plus que prévu dans une catégorie.
          </li>
        </ul>
        <p className="text-xs italic mt-2">
           * En mode Sandbox, utilisez les données de démonstration pour voir la puissance de l'outil sans connecter vos vrais comptes.
        </p>
      </div>
    ),
    color: "text-indigo-600",
    bg: "bg-indigo-100"
  },
  {
    icon: Sparkles,
    title: "Suggestions d'Économies IA",
    description: "Optimisez vos charges fixes automatiquement.",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          Pourquoi payer plus cher ? Notre IA analyse la section <strong>"Charges"</strong> de votre budget pour trouver des opportunités d'économies.
        </p>
        <ul className="list-disc pl-4 space-y-2">
          <li><strong>Analyse automatique</strong> des postes clés : Énergie, Mobile, Internet, Assurance...</li>
          <li><strong>Comparatif Marché :</strong> Nous scannons les offres actuelles pour trouver le Top 3 des meilleures alternatives.</li>
          <li><strong>Calcul de rentabilité :</strong> "En changeant d'opérateur, vous économiseriez 120€/an".</li>
        </ul>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
          <p className="text-xs text-green-800">
            🎯 L'objectif : Réduire vos charges fixes sans réduire votre confort de vie.
          </p>
        </div>
      </div>
    ),
    color: "text-green-600",
    bg: "bg-green-100"
  },
  {
    icon: Users,
    title: "Collaboration & Partage",
    description: "Le budget est une affaire d'équipe.",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>Budget Famille est conçu pour la transparence au sein du foyer :</p>
        <ul className="list-disc pl-4 space-y-2">
          <li><strong>Multi-utilisateurs :</strong> Invitez votre conjoint(e) via email. Chacun a son propre accès sécurisé.</li>
          <li><strong>Temps Réel :</strong> Voyez qui modifie quoi, quand. Plus de conflits de versions de fichiers.</li>
          <li><strong>Rôles :</strong> Définissez qui est Propriétaire (Admin) ou Membre (Éditeur).</li>
        </ul>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-3">
          <p className="text-xs text-purple-800">
            👥 <strong>Conseil :</strong> Prenez un moment chaque mois pour faire le point ensemble sur le tableau de bord.
          </p>
        </div>
      </div>
    ),
    color: "text-purple-600",
    bg: "bg-purple-100"
  },
  {
    icon: CheckCircle2,
    title: "Prêt à reprendre le contrôle ?",
    description: "Tout est en place pour votre réussite financière.",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          Vous avez maintenant toutes les clés en main. Voici votre feuille de route pour les 5 prochaines minutes :
        </p>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mt-2">
          <p className="text-sm font-semibold text-gray-900 mb-3">🚀 Vos premières actions :</p>
          <ol className="list-decimal pl-5 space-y-2 text-xs">
            <li>Remplissez la section <strong>Revenus</strong> (Salaires).</li>
            <li>Ajoutez vos <strong>Charges Fixes</strong> (Loyer, Crédits, Abonnements).</li>
            <li>Créez vos <strong>Projets d'Épargne</strong> (Vacances, Travaux, Fonds de secours).</li>
            <li>Allez dans le <strong>Tableau Mensuel</strong> pour vérifier votre "Reste à vivre".</li>
            <li>(Optionnel) Testez le <strong>Reality Check</strong> en mode Démo.</li>
          </ol>
        </div>
        <p className="mt-4 text-xs text-center text-muted-foreground">
            Besoin d'aide plus tard ? Cliquez sur l'icône <HelpCircle className="h-3 w-3 inline" /> dans le menu.
        </p>
      </div>
    ),
    color: "text-green-600",
    bg: "bg-green-100"
  }
];

// ============================================================================
// COMPOSANT TUTORIAL MODAL
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

  const StepIcon = STEPS[currentStep].icon;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      {/* Increased width to max-w-3xl for better readability */}
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
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
                    : 'bg-muted w-2 hover:bg-muted-foreground/30'
                }`}
                aria-label={`Aller à l'étape ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
            {!isFirstStep && (
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