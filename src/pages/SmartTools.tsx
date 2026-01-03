// src/pages/SmartTools.tsx
// 🤖 Smart Tools IA - NOTRE DIFFÉRENCIATEUR #1
// ✅ VERSION CORRIGÉE : Responsive mobile + Description 50 caractères max

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Footer } from '@/components/Footer';
import { 
  ArrowLeft, 
  Brain,
  Zap,
  TrendingDown,
  Sparkles,
  Home,
  Smartphone,
  Wifi,
  Shield,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  Target,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function SmartTools() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [selectedCategory, setSelectedCategory] = useState('energy');
  const [currentAmount, setCurrentAmount] = useState('');
  const [householdSize, setHouseholdSize] = useState('4');
  
  // ✅ CORRIGÉ : Description limitée à 50 caractères pour économie de tokens
  const [description, setDescription] = useState('');
  const MAX_DESCRIPTION_LENGTH = 50;
  
  const [showResults, setShowResults] = useState(false);

  // Données de marché réelles (simplifiées pour la démo)
  const marketData = {
    energy: {
      title: "Électricité & Gaz",
      icon: Zap,
      color: "bg-yellow-500",
      average: 140,
      suggestions: [
        { 
          provider: "TotalEnergies", 
          price: 95, 
          savings: 45, 
          features: ["Prix fixe 1 an", "Service client 24/7", "Énergie verte option"] 
        },
        { 
          provider: "Engie", 
          price: 102, 
          savings: 38, 
          features: ["Énergie verte", "App mobile", "Prix garantis"] 
        },
        { 
          provider: "EDF", 
          price: 110, 
          savings: 30, 
          features: ["Historique fiable", "Tarif régulé", "Points fidélité"] 
        },
      ]
    },
    internet: {
      title: "Internet & Box",
      icon: Wifi,
      color: "bg-blue-500",
      average: 35,
      suggestions: [
        { 
          provider: "Free", 
          price: 19.99, 
          savings: 15, 
          features: ["Fibre 1 Gb/s", "Player TV inclus", "Appels illimités"] 
        },
        { 
          provider: "Bouygues", 
          price: 22.99, 
          savings: 12, 
          features: ["Fibre 2 Gb/s", "4G illimitée", "TV 180 chaînes"] 
        },
        { 
          provider: "SFR", 
          price: 25.99, 
          savings: 9, 
          features: ["Fibre 1 Gb/s", "Cloud 100Go", "WiFi 6"] 
        },
      ]
    },
    mobile: {
      title: "Forfait Mobile",
      icon: Smartphone,
      color: "bg-purple-500",
      average: 20,
      suggestions: [
        { 
          provider: "Free Mobile", 
          price: 10.99, 
          savings: 9, 
          features: ["100 Go 5G", "Appels illimités", "Europe incluse"] 
        },
        { 
          provider: "B&YOU", 
          price: 11.99, 
          savings: 8, 
          features: ["80 Go 4G", "Sans engagement", "Multi-SIM"] 
        },
        { 
          provider: "RED by SFR", 
          price: 12.99, 
          savings: 7, 
          features: ["60 Go 5G", "Sans engagement", "Hotspot"] 
        },
      ]
    },
    insurance: {
      title: "Assurance Habitation",
      icon: Home,
      color: "bg-green-500",
      average: 45,
      suggestions: [
        { 
          provider: "Luko", 
          price: 28, 
          savings: 17, 
          features: ["100% digital", "Remboursement rapide", "Objets de valeur"] 
        },
        { 
          provider: "MAIF", 
          price: 32, 
          savings: 13, 
          features: ["Mutuelle reconnue", "Protection juridique", "Assistance 24/7"] 
        },
        { 
          provider: "Allianz", 
          price: 35, 
          savings: 10, 
          features: ["Leader mondial", "Dommages électriques", "Jardin inclus"] 
        },
      ]
    }
  };

  const currentData = marketData[selectedCategory as keyof typeof marketData];

  const handleAnalyze = () => {
    setShowResults(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      <Navbar />
      
      {/* ✅ CORRIGÉ : Container responsive avec padding mobile optimisé */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <Brain className="h-5 w-5" />
            <span className="font-semibold text-sm sm:text-base">Powered by Claude AI</span>
          </div>
          
          {/* ✅ CORRIGÉ : Titres responsive */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4 sm:mb-6 px-2">
            Outils IA Market Suggestions
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8 sm:mb-12 px-4">
            Découvrez en temps réel les meilleures offres du marché grâce à notre IA.
            Comparez automatiquement les fournisseurs et économisez jusqu'à 520€ par an.
          </p>
          
          {/* ✅ CORRIGÉ : Stats responsive avec grid adaptatif */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-3xl font-bold text-primary mb-1">520€</div>
              <div className="text-sm text-gray-600">Économies moyennes/an</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-3xl font-bold text-primary mb-1">&lt;30s</div>
              <div className="text-sm text-gray-600">Analyse IA</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-3xl font-bold text-primary mb-1">100%</div>
              <div className="text-sm text-gray-600">Gratuit</div>
            </div>
          </div>
        </div>

        {/* Main Tool */}
        <div className="max-w-5xl mx-auto mb-16">
          <Card className="shadow-2xl overflow-hidden">
            {/* ✅ CORRIGÉ : Header responsive avec padding adaptatif */}
            <CardHeader className="bg-gradient-to-r from-primary to-purple-600 text-white p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="h-12 w-12 sm:h-16 sm:w-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl sm:text-3xl mb-2">Analyse IA Market Suggestions</CardTitle>
                  <CardDescription className="text-white/90 text-sm sm:text-base">
                    Découvrez combien vous pourriez économiser en changeant de fournisseurs
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            {/* ✅ CORRIGÉ : Content avec padding mobile optimisé */}
            <CardContent className="p-4 sm:p-6 lg:p-8">
              {/* Category Selection */}
              <div className="mb-8">
                <Label className="text-base font-semibold mb-4 block">
                  Choisissez une catégorie à analyser
                </Label>
                {/* ✅ CORRIGÉ : Grid responsive 2 colonnes mobile, 4 desktop */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  {Object.entries(marketData).map(([key, data]) => {
                    const CategoryIcon = data.icon;
                    const isSelected = selectedCategory === key;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedCategory(key);
                          setShowResults(false);
                        }}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                          isSelected 
                            ? 'border-primary bg-primary/5 shadow-md' 
                            : 'border-gray-200 hover:border-primary/50'
                        }`}
                      >
                        <div className={`h-10 w-10 sm:h-12 sm:w-12 ${data.color} rounded-lg flex items-center justify-center mb-2 sm:mb-3 mx-auto`}>
                          <CategoryIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-gray-900 text-center">
                          {data.title}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Input Form */}
              <div className="space-y-6">
                {/* ✅ CORRIGÉ : Grid responsive 1 colonne mobile, 2 desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label htmlFor="current-amount" className="text-sm font-medium mb-2 block">
                      Montant actuel (€/mois)
                    </Label>
                    {/* ✅ CORRIGÉ : Input avec height mobile-friendly (44px min) */}
                    <Input
                      id="current-amount"
                      type="number"
                      placeholder="Ex: 140"
                      value={currentAmount}
                      onChange={(e) => setCurrentAmount(e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="household-size" className="text-sm font-medium mb-2 block">
                      Taille du foyer
                    </Label>
                    <Input
                      id="household-size"
                      type="number"
                      placeholder="Ex: 4"
                      value={householdSize}
                      onChange={(e) => setHouseholdSize(e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                </div>

                {/* ✅ NOUVEAU : Champ Description avec limite 50 caractères */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Détails supplémentaires (optionnel)
                    </Label>
                    <span className={`text-xs ${description.length > MAX_DESCRIPTION_LENGTH ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                      {description.length}/{MAX_DESCRIPTION_LENGTH}
                    </span>
                  </div>
                  <Textarea
                    id="description"
                    placeholder="Ex: Appartement 80m², 2 chambres..."
                    value={description}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= MAX_DESCRIPTION_LENGTH) {
                        setDescription(value);
                      }
                    }}
                    maxLength={MAX_DESCRIPTION_LENGTH}
                    rows={2}
                    className="resize-none text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1 flex items-start gap-1">
                    <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>Limité à 50 caractères pour optimiser l'analyse IA</span>
                  </p>
                </div>

                {/* ✅ CORRIGÉ : Bouton full-width sur mobile */}
                <Button 
                  onClick={handleAnalyze}
                  disabled={!currentAmount || !householdSize}
                  className="w-full sm:w-auto h-12 text-base font-semibold"
                  size="lg"
                >
                  <Brain className="mr-2 h-5 w-5" />
                  Analyser avec l'IA
                </Button>
              </div>

              {/* Results */}
              {showResults && (
                <div className="mt-8 sm:mt-12 space-y-6 animate-slide-up">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Résultats de l'analyse IA
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        Basé sur {currentAmount}€/mois pour un foyer de {householdSize} personnes
                      </p>
                    </div>
                  </div>

                  {/* Average Comparison */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="text-sm text-blue-600 font-medium mb-1">Moyenne marché</div>
                        <div className="text-2xl sm:text-3xl font-bold text-blue-900">{currentData.average}€/mois</div>
                      </div>
                      <div className="flex items-center gap-2 text-sm sm:text-base text-blue-700">
                        <Info className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <span>Vous payez {parseFloat(currentAmount) > currentData.average ? 'plus' : 'moins'} que la moyenne</span>
                      </div>
                    </div>
                  </div>

                  {/* Suggestions - ✅ CORRIGÉ : Grid responsive */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {currentData.suggestions.map((suggestion, idx) => (
                      <div 
                        key={idx}
                        className={`bg-white rounded-xl p-4 sm:p-6 shadow-lg border-2 transition-all hover:shadow-xl ${
                          idx === 0 
                            ? 'border-green-300 ring-2 ring-green-100' 
                            : 'border-gray-100'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h5 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{suggestion.provider}</h5>
                              {idx === 0 && (
                                <span className="bg-green-100 text-green-700 text-xs px-2 sm:px-3 py-1 rounded-full font-semibold whitespace-nowrap">
                                  Meilleure offre
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
                              <span className="text-2xl sm:text-3xl font-bold text-primary">{suggestion.price}€</span>
                              <span className="text-gray-500 text-sm">/mois</span>
                              <span className="bg-green-100 text-green-700 text-xs sm:text-sm px-2 py-1 rounded font-semibold whitespace-nowrap">
                                -{suggestion.savings}€
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="text-xs sm:text-sm text-gray-600 mb-1">Économies annuelles</div>
                          <div className="text-xl sm:text-2xl font-bold text-green-600">
                            {(suggestion.savings * 12).toLocaleString('fr-FR')}€
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          {suggestion.features.map((feature, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="flex-1">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <Button 
                          variant={idx === 0 ? "default" : "outline"}
                          className="w-full h-10 sm:h-11 text-sm sm:text-base"
                        >
                          Voir l'offre
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Total Savings Summary - ✅ CORRIGÉ : Responsive */}
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 sm:p-8 text-white mt-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <div className="text-base sm:text-lg mb-2 opacity-90">
                          💰 Économies potentielles totales
                        </div>
                        <div className="text-3xl sm:text-4xl font-bold">
                          {(currentData.suggestions[0].savings * 12).toLocaleString('fr-FR')}€/an
                        </div>
                      </div>
                      <Button 
                        onClick={() => user ? navigate('/') : navigate('/signup')}
                        size="lg"
                        className="bg-white text-green-600 hover:bg-gray-50 font-semibold w-full sm:w-auto h-12"
                      >
                        <Target className="mr-2 h-5 w-5" />
                        {user ? 'Ajouter à mon budget' : 'Créer mon budget'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* How It Works Section - ✅ CORRIGÉ : Responsive */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-center text-gray-900 mb-8 sm:mb-12">
            Comment ça marche ?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="h-14 w-14 sm:h-16 sm:w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl sm:text-3xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Analysez vos charges</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Entrez vos dépenses actuelles et nos algorithmes IA analysent le marché en temps réel
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="h-14 w-14 sm:h-16 sm:w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl sm:text-3xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Comparez les offres</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Recevez instantanément les 3 meilleures offres adaptées à votre profil
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="h-14 w-14 sm:h-16 sm:w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl sm:text-3xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Économisez</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Changez facilement et économisez jusqu'à 520€ par an sur vos charges
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section - ✅ CORRIGÉ : Responsive */}
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-8 sm:p-12 text-center text-white">
          <Lightbulb className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-4">
            Prêt à optimiser votre budget ?
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto px-4">
            Créez votre budget gratuit et profitez de nos suggestions IA pour économiser sur toutes vos charges
          </p>
          <Button 
            onClick={() => user ? navigate('/') : navigate('/signup')}
            size="lg"
            className="bg-white text-primary hover:bg-gray-50 font-semibold h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg"
          >
            {user ? 'Accéder à mon dashboard' : 'Créer mon compte gratuit'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}