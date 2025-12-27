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
  CheckCircle2
} from "lucide-react";

// ============================================================================
// TUTORIAL STEPS CONFIGURATION - 7 ÉTAPES
// ============================================================================

const STEPS = [
  {
    icon: ShieldCheck,
    title: "Bienvenue sur Budget Famille",
    description: "Une approche sécurisée et collaborative pour gérer vos finances.",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          Ici, vos données sont <strong>chiffrées de bout en bout</strong>. Même nous ne pouvons pas les lire.
        </p>
        <p>
          Cette application est conçue pour gérer un budget à plusieurs (conjoints, famille) en temps réel.
        </p>
      </div>
    ),
    color: "text-primary",
    bg: "bg-primary/10"
  },
  {
    icon: Calendar,
    title: "Le Tableau Mensuel",
    description: "Planifiez votre année, mois par mois.",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <ul className="list-disc pl-4 space-y-2">
          <li>
            <strong>Revenus & Charges :</strong> Saisissez vos entrées et sorties fixes.
          </li>
          <li>
            <strong>Disponible :</strong> Ce qu'il reste est automatiquement réparti entre vos projets.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1"><MessageCircle className="h-3 w-3 inline" /></span>
            <span>
              <strong>Notes & Commentaires :</strong> Cliquez sur les petites bulles pour annoter un mois globalement ou préciser une dépense spécifique dans une case projet.
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
    description: "Distinguez le Rêve de la Réalité.",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>Nous utilisons deux barres de progression :</p>
        <div className="space-y-2 border-l-2 border-muted pl-3">
          <div>
            <span className="text-xs font-bold text-primary uppercase">Barre Claire (Planifié)</span>
            <p className="text-xs">L'argent que vous <em>prévoyez</em> d'avoir si vous suivez votre plan toute l'année.</p>
          </div>
          <div>
            <span className="text-xs font-bold text-success uppercase">Barre Verte (En Caisse)</span>
            <p className="text-xs">L'argent <em>réellement</em> accumulé dans les mois passés.</p>
          </div>
        </div>
      </div>
    ),
    color: "text-secondary",
    bg: "bg-secondary/10"
  },
  {
    icon: Link,
    title: "Reality Check - Connexion Bancaire",
    description: "Comparez votre budget théorique avec vos dépenses réelles.",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          Connectez vos comptes bancaires pour voir <strong>l'écart entre votre plan et la réalité</strong>.
        </p>
        <ul className="list-disc pl-4 space-y-2">
          <li>Connexion <strong>sécurisée PSD2</strong> via Enable Banking (2500+ banques)</li>
          <li>Vos identifiants ne transitent <strong>jamais</strong> par nos serveurs</li>
          <li>Mappez vos transactions bancaires à vos catégories de budget</li>
          <li>Détectez automatiquement où vous dépassez</li>
        </ul>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
          <p className="text-xs text-blue-800">
            💡 <strong>Astuce:</strong> En Premium (2€/mois), la synchronisation est automatique chaque mois !
          </p>
        </div>
      </div>
    ),
    color: "text-blue-600",
    bg: "bg-blue-100"
  },
  {
    icon: Sparkles,
    title: "Suggestions d'Économies IA",
    description: "Trouvez les meilleures offres grâce à l'intelligence artificielle.",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          Notre IA analyse vos charges (énergie, internet, mobile, assurance, prêts) et vous propose 
          <strong> le top 3 des meilleures alternatives</strong> du marché.
        </p>
        <ul className="list-disc pl-4 space-y-2">
          <li><strong>Analyse automatique</strong> de vos charges avec catégorisation</li>
          <li><strong>Comparaison en temps réel</strong> avec les concurrents</li>
          <li><strong>Top 3 des offres</strong> pour chaque catégorie</li>
          <li><strong>Économies potentielles</strong> calculées précisément</li>
          <li><strong>Avantages/Inconvénients</strong> de chaque offre</li>
          <li><strong>Liens directs</strong> vers les meilleures offres</li>
        </ul>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
          <p className="text-xs text-green-800">
            🎯 Économisez en moyenne <strong>200-500€/an</strong> en changeant quelques abonnements !
          </p>
        </div>
      </div>
    ),
    color: "text-green-600",
    bg: "bg-green-100"
  },
  {
    icon: Users,
    title: "Travail d'Équipe",
    description: "Invitez votre famille et gérez ensemble.",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <ul className="list-disc pl-4 space-y-2">
          <li><strong>Invitations par email</strong> - chaque membre a son propre compte</li>
          <li><strong>Modifications en temps réel</strong> - voyez les changements instantanément</li>
          <li><strong>Notifications</strong> quand un membre modifie le budget</li>
          <li><strong>Commentaires</strong> pour communiquer sur les décisions</li>
        </ul>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-3">
          <p className="text-xs text-purple-800">
            👥 <strong>Astuce:</strong> Définissez des <strong>rôles clairs</strong> - qui gère quoi (courses, factures, épargne...)
          </p>
        </div>
      </div>
    ),
    color: "text-purple-600",
    bg: "bg-purple-100"
  },
  {
    icon: CheckCircle2,
    title: "Prêt à commencer ?",
    description: "Tout est en place pour gérer vos finances efficacement.",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          Vous pouvez <strong>retrouver ce tutoriel</strong> à tout moment en cliquant sur 
          l'icône <HelpCircle className="h-4 w-4 inline mx-1" /> dans la barre de menu.
        </p>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mt-4">
          <p className="text-sm font-semibold text-gray-900 mb-3">📋 Prochaines étapes:</p>
          <ol className="list-decimal pl-5 space-y-2 text-xs">
            <li>Créez votre premier budget</li>
            <li>Ajoutez vos revenus et charges mensuelles</li>
            <li>Définissez vos projets d'épargne</li>
            <li>Explorez les suggestions d'économies IA</li>
            <li>Connectez votre banque (Reality Check)</li>
            <li>Invitez votre famille !</li>
          </ol>
        </div>
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

        <div className="py-4">
          {STEPS[currentStep].content}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3">
          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mb-4 sm:mb-0 sm:mr-auto items-center">
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
          <div className="flex gap-2 w-full sm:w-auto">
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
              className="flex-1 sm:flex-none gap-2"
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
        <div className="text-center text-xs text-muted-foreground pb-2">
          Étape {currentStep + 1} sur {STEPS.length}
        </div>
      </DialogContent>
    </Dialog>
  );
}