import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, Crown } from "lucide-react";

interface DemoBannerProps {
  onDisable: () => void;
  onGoToPremium: () => void;
}

export function DemoBanner({ onDisable, onGoToPremium }: DemoBannerProps) {
  return (
    <Alert className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 shadow-md relative">
      <div className="flex items-start gap-3 pr-8">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <AlertDescription className="text-amber-900">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <strong className="font-bold">Mode Démonstration Actif</strong>
                <p className="text-sm mt-1">
                  Vous utilisez des données bancaires fictives pour tester Reality Check.
                </p>
              </div>
              <Button
                onClick={onGoToPremium}
                size="sm"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm whitespace-nowrap"
              >
                <Crown className="h-4 w-4 mr-2" />
                Passer Premium
              </Button>
            </div>
          </AlertDescription>
        </div>
        
        {/* Close Button */}
        <button
          onClick={onDisable}
          className="absolute top-3 right-3 p-1 hover:bg-amber-100 rounded-full transition-colors"
          aria-label="Fermer le mode démo"
        >
          <X className="h-4 w-4 text-amber-700" />
        </button>
      </div>
    </Alert>
  );
}