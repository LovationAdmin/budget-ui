import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Eye, Zap, TrendingUp, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { defineMessages, useT } from "@/i18n/runtime";

const M = defineMessages({
  fr: {
    title: "Découvrez Reality Check",
    lead: "Comparez votre budget théorique avec vos dépenses réelles. Fonctionnalité en cours de développement avec Enable Banking API.",
    realTime: ["Suivi en temps réel", "Synchronisation automatique mensuelle"],
    mapping: ["Mapping intelligent", "Liez vos charges à vos transactions"],
    banks: ["2500+ banques", "Compatible avec toute l'Europe"],
    preview: (shown: boolean) => `${shown ? 'Masquer' : 'Voir'} un aperçu des données de démo`,
    sample: "Exemple de transactions sur 2 mois (Nov-Déc 2024)",
    income: "Revenus",
    incomeLines: [["• Salaire mensuel", "+2 302,20€"]],
    expenses: "Dépenses principales",
    expenseLines: [
      ["• Prêt immobilier", "-465,33€"],
      ["• Navigo annuel", "-75,20€"],
      ["• EDF", "-69,79€"],
      ["• Courses & restaurants", "~150€"],
      ["• Netflix + Abonnements", "~40€"],
    ],
    balance: "Solde bancaire final",
    balanceAmount: "5 130€",
    fictitious: "Ces données fictives vous permettent de tester toutes les fonctionnalités Reality Check",
    cta: "Essayer avec des données de démo",
    finePrint: "Le mode démo utilise des données fictives pour vous permettre de tester la fonctionnalité. Les connexions bancaires réelles seront disponibles prochainement.",
  },
  en: {
    title: "Discover Reality Check",
    lead: "Compare your planned budget with your actual spending. This feature is being built with the Enable Banking API.",
    realTime: ["Real-time tracking", "Automatic monthly sync"],
    mapping: ["Smart mapping", "Link your bills to your transactions"],
    banks: ["2,500+ banks", "Works across Europe"],
    preview: (shown: boolean) => (shown ? "Hide the demo data preview" : "Preview the demo data"),
    sample: "Sample transactions over 2 months (Nov–Dec 2024)",
    income: "Income",
    incomeLines: [["• Monthly pay", "+€2,302.20"]],
    expenses: "Main expenses",
    expenseLines: [
      ["• Mortgage", "-€465.33"],
      ["• Annual Navigo travel pass", "-€75.20"],
      ["• EDF (electricity)", "-€69.79"],
      ["• Groceries & restaurants", "~€150"],
      ["• Netflix + subscriptions", "~€40"],
    ],
    balance: "Closing bank balance",
    balanceAmount: "€5,130",
    fictitious: "This fictitious data lets you try every Reality Check feature",
    cta: "Try it with demo data",
    finePrint: "Demo mode uses fictitious data so you can try the feature. Real bank connections will be available soon.",
  },
});

interface DemoModePromptProps {
  onEnableDemoMode: () => void;
}

export function DemoModePrompt({ onEnableDemoMode }: DemoModePromptProps) {
  const [showPreview, setShowPreview] = useState(false);
  const t = useT(M);
  
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
              {t.title}
            </h3>
            <p className="text-gray-600">
              {t.lead}
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
            <TrendingUp className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm text-gray-900">{t.realTime[0]}</p>
              <p className="text-xs text-gray-600">{t.realTime[1]}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
            <Zap className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm text-gray-900">{t.mapping[0]}</p>
              <p className="text-xs text-gray-600">{t.mapping[1]}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm text-gray-900">{t.banks[0]}</p>
              <p className="text-xs text-gray-600">{t.banks[1]}</p>
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
          {t.preview(showPreview)}
        </button>
        
        {/* Preview Content */}
        {showPreview && (
          <div className="bg-white/80 rounded-lg p-5 mb-6 border border-indigo-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Eye className="h-4 w-4 text-indigo-600" />
              {t.sample}
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Revenus */}
              <div>
                <p className="text-xs font-semibold text-green-700 mb-2 uppercase tracking-wide">{t.income}</p>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  {t.incomeLines.map(([label, amount]) => (
                    <li key={label} className="flex justify-between">
                      <span>{label}</span>
                      <span className="font-medium text-green-600">{amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Dépenses */}
              <div>
                <p className="text-xs font-semibold text-red-700 mb-2 uppercase tracking-wide">{t.expenses}</p>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  {t.expenseLines.map(([label, amount]) => (
                    <li key={label} className="flex justify-between">
                      <span>{label}</span>
                      <span className="font-medium text-red-600">{amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-900">{t.balance}</span>
                <span className="text-lg font-bold text-indigo-600">{t.balanceAmount}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t.fictitious}
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
          {t.cta}
        </Button>

        {/* Fine Print */}
        <p className="text-xs text-gray-500 text-center mt-4">
          {t.finePrint}
        </p>
      </div>
    </Card>
  );
}