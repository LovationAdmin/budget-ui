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
import { ArrowRight, Check, ShieldCheck, Calendar, Target, Users } from "lucide-react";

// Tutorial Steps Configuration
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
            <strong>Mois verrouillés :</strong> Les mois passés se verrouillent pour figer l'historique.
          </li>
          <li>
            <strong>Revenus & Charges :</strong> Saisissez vos entrées et sorties fixes.
          </li>
          <li>
            <strong>Disponible :</strong> Ce qu'il reste est automatiquement réparti entre vos projets et l'épargne générale.
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
    icon: Users,
    title: "Prêt à commencer ?",
    description: "Invitez votre famille et commencez à planifier.",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          Utilisez le bouton <strong>Inviter</strong> pour ajouter des membres à votre budget.
        </p>
        <p>
          Vous pouvez retrouver ce tutoriel à tout moment en cliquant sur l'icône <strong>?</strong> dans la barre de menu.
        </p>
      </div>
    ),
    color: "text-green-600",
    bg: "bg-green-100"
  }
];

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

  const handleClose = () => {
    closeTutorial();
    setTimeout(() => setCurrentStep(0), 300); // Reset after animation
  };

  const StepIcon = STEPS[currentStep].icon;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
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

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex justify-center gap-1 mb-4 sm:mb-0 sm:mr-auto items-center">
            {STEPS.map((_, index) => (
              <div 
                key={index}
                className={`h-2 w-2 rounded-full transition-all ${index === currentStep ? 'bg-primary w-4' : 'bg-muted'}`}
              />
            ))}
          </div>
          <Button onClick={handleNext} className="w-full sm:w-auto gap-2">
            {currentStep === STEPS.length - 1 ? (
              <>C'est parti ! <Check className="h-4 w-4" /></>
            ) : (
              <>Suivant <ArrowRight className="h-4 w-4" /></>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}