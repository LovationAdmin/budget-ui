import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, ArrowLeft, Zap, TrendingUp, Shield, Calendar, Sparkles } from "lucide-react";

export default function PremiumPage() {
  const navigate = useNavigate();

  const handleSubscribe = () => {
    // TODO: Intégrer Stripe
    alert("Intégration Stripe à venir !");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-6">
            <Crown className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Passez à Budget Famille <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Premium</span>
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Connectez votre banque et suivez vos dépenses réelles
          </p>
          <p className="text-3xl font-bold text-indigo-600">
            Seulement 2€ / mois
          </p>
        </div>

        {/* Pricing Card */}
        <Card className="border-2 border-indigo-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              Abonnement Premium
            </CardTitle>
            <CardDescription className="text-indigo-100">
              Toutes les fonctionnalités avancées pour gérer votre budget familial
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Reality Check */}
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Reality Check</h3>
                  <p className="text-sm text-gray-600">
                    Comparez votre budget théorique avec vos dépenses bancaires réelles. 
                    Identifiez les écarts et ajustez vos prévisions.
                  </p>
                </div>
              </div>

              {/* Connexion bancaire */}
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">2500+ Banques Européennes</h3>
                  <p className="text-sm text-gray-600">
                    Connectez vos comptes bancaires en toute sécurité via Enable Banking. 
                    Compatible avec toutes les banques européennes.
                  </p>
                </div>
              </div>

              {/* Synchronisation automatique */}
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Synchronisation Automatique</h3>
                  <p className="text-sm text-gray-600">
                    Vos transactions bancaires sont synchronisées automatiquement chaque 1er du mois. 
                    Plus besoin de saisir manuellement !
                  </p>
                </div>
              </div>

              {/* Mapping intelligent */}
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Zap className="h-5 w-5 text-yellow-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Mapping Intelligent</h3>
                  <p className="text-sm text-gray-600">
                    Liez vos charges budgétées à vos transactions réelles. 
                    Une fois configuré, le système apprend et mappe automatiquement.
                  </p>
                </div>
              </div>

              {/* Fonctionnalités de base */}
              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold text-gray-700 mb-3">+ Toutes les fonctionnalités gratuites :</h4>
                <ul className="space-y-2">
                  {[
                    "Budgets illimités",
                    "Gestion des charges et projets",
                    "Tableaux mensuels",
                    "Statistiques et graphiques",
                    "Collaboration en équipe",
                    "Export des données"
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-4 bg-gray-50">
            <Button
              onClick={handleSubscribe}
              size="lg"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all text-lg py-6"
            >
              <Crown className="h-5 w-5 mr-2" />
              S'abonner pour 2€/mois
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              Sans engagement • Résiliable à tout moment • Paiement sécurisé par Stripe
            </p>
          </CardFooter>
        </Card>

        {/* FAQ Section */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions Fréquentes</h2>
          <div className="space-y-4 text-left">
            <details className="bg-white p-4 rounded-lg shadow-sm">
              <summary className="font-semibold cursor-pointer">Est-ce vraiment sans engagement ?</summary>
              <p className="mt-2 text-sm text-gray-600">
                Oui ! Vous pouvez annuler votre abonnement à tout moment. Il n'y a aucun frais d'annulation.
              </p>
            </details>
            
            <details className="bg-white p-4 rounded-lg shadow-sm">
              <summary className="font-semibold cursor-pointer">Mes données bancaires sont-elles sécurisées ?</summary>
              <p className="mt-2 text-sm text-gray-600">
                Absolument. Nous utilisons Enable Banking, certifié PSD2. Nous n'avons jamais accès à vos identifiants bancaires.
                Toutes les données sont chiffrées de bout en bout.
              </p>
            </details>
            
            <details className="bg-white p-4 rounded-lg shadow-sm">
              <summary className="font-semibold cursor-pointer">La synchronisation fonctionne avec toutes les banques ?</summary>
              <p className="mt-2 text-sm text-gray-600">
                Oui ! Enable Banking supporte plus de 2500 banques européennes. Si votre banque est basée en Europe,
                elle est très probablement compatible.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}