import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Eye, Zap, TrendingUp, Shield, ChevronDown, ChevronUp } from "lucide-react";

interface DemoModePromptProps {
  onEnableDemoMode: () => void;
}

export function DemoModePrompt({ onEnableDemoMode }: DemoModePromptProps) {
  const [showPreview, setShowPreview] = useState(false);
  
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
              Fonctionnalité en cours de développement avec Enable Banking API.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
            <TrendingUp className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm text-gray-900">Suivi en temps réel</p>
              <p className="text-xs text-gray-600">Synchronisation automatique mensuelle</p>
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

        {/* Preview Toggle */}
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium mb-4 transition-colors group"
        >
          {showPreview ? (
            <ChevronUp className="h-4 w-4 group-hover:translate-y-[-2px] transition-transform" />
          ) : (
            <ChevronDown className="h-4 w-4 group-hover:translate-y-[2px] transition-transform" />
          )}
          {showPreview ? 'Masquer' : 'Voir'} un aperçu des données de démo
        </button>
        
        {/* Preview Content */}
        {showPreview && (
          <div className="bg-white/80 rounded-lg p-5 mb-6 border border-indigo-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Eye className="h-4 w-4 text-indigo-600" />
              Exemple de transactions sur 2 mois (Nov-Déc 2024)
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Revenus */}
              <div>
                <p className="text-xs font-semibold text-green-700 mb-2 uppercase tracking-wide">Revenus</p>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  <li className="flex justify-between">
                    <span>• Salaire mensuel</span>
                    <span className="font-medium text-green-600">+2 302,20€</span>
                  </li>
                </ul>
              </div>
              
              {/* Dépenses */}
              <div>
                <p className="text-xs font-semibold text-red-700 mb-2 uppercase tracking-wide">Dépenses principales</p>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  <li className="flex justify-between">
                    <span>• Prêt immobilier</span>
                    <span className="font-medium text-red-600">-465,33€</span>
                  </li>
                  <li className="flex justify-between">
                    <span>• Navigo annuel</span>
                    <span className="font-medium text-red-600">-75,20€</span>
                  </li>
                  <li className="flex justify-between">
                    <span>• EDF</span>
                    <span className="font-medium text-red-600">-69,79€</span>
                  </li>
                  <li className="flex justify-between">
                    <span>• Courses & restaurants</span>
                    <span className="font-medium text-red-600">~150€</span>
                  </li>
                  <li className="flex justify-between">
                    <span>• Netflix + Abonnements</span>
                    <span className="font-medium text-red-600">~40€</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-900">Solde bancaire final</span>
                <span className="text-lg font-bold text-indigo-600">5 130€</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ces données fictives vous permettent de tester toutes les fonctionnalités Reality Check
              </p>
            </div>
          </div>
        )}

        {/* CTA Button */}
        <Button 
          onClick={onEnableDemoMode}
          size="lg"
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
        >
          <Eye className="h-5 w-5 mr-2" />
          Essayer avec des données de démo
        </Button>

        {/* Fine Print */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Le mode démo utilise des données fictives pour vous permettre de tester la fonctionnalité.
          Les connexions bancaires réelles seront disponibles prochainement.
        </p>
      </div>
    </Card>
  );
}