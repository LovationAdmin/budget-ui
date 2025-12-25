import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Eye, Crown, Zap, TrendingUp, Shield } from "lucide-react";

interface DemoModePromptProps {
  onEnableDemoMode: () => void;
  onGoToPremium: () => void;
}

export function DemoModePrompt({ onEnableDemoMode, onGoToPremium }: DemoModePromptProps) {
  return (
    <Card className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border-2 border-dashed border-indigo-300 shadow-lg">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Découvrez Reality Check
            </h3>
            <p className="text-gray-600">
              Comparez votre budget théorique avec vos dépenses réelles. 
              Fonctionnalité Premium disponible pour <span className="font-bold text-indigo-600">2€/mois</span>.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
            <TrendingUp className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm text-gray-900">Suivi en temps réel</p>
              <p className="text-xs text-gray-600">Synchronisation automatique chaque mois</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
            <Zap className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm text-gray-900">Mapping intelligent</p>
              <p className="text-xs text-gray-600">Liez vos charges à vos transactions</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm text-gray-900">2500+ banques</p>
              <p className="text-xs text-gray-600">Compatible avec toute l'Europe</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={onEnableDemoMode}
            variant="outline"
            size="lg"
            className="flex-1 border-2 border-indigo-300 hover:bg-indigo-50 hover:border-indigo-400 transition-all shadow-sm hover:shadow"
          >
            <Eye className="h-5 w-5 mr-2" />
            Essayer avec des données de démo
          </Button>
          
          <Button 
            onClick={onGoToPremium}
            size="lg"
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Crown className="h-5 w-5 mr-2" />
            Passer Premium - 2€/mois
          </Button>
        </div>

        {/* Fine Print */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Le mode démo utilise des données fictives. Passez Premium pour connecter votre vraie banque.
        </p>
      </div>
    </Card>
  );
}