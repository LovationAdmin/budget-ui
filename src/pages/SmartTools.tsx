// src/pages/SmartTools.tsx
// 🤖 Smart Tools IA - Version Dynamique connectée à l'API

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
  Info,
  Loader2,
  AlertTriangle
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
import { budgetAPI, MarketSuggestion } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export default function SmartTools() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedCategory, setSelectedCategory] = useState('ENERGY');
  const [currentAmount, setCurrentAmount] = useState('');
  const [householdSize, setHouseholdSize] = useState('4');
  const [description, setDescription] = useState('');
  const MAX_DESCRIPTION_LENGTH = 50;
  
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestionData, setSuggestionData] = useState<MarketSuggestion | null>(null);

  const marketCategories = [
    { id: 'ENERGY', title: "Électricité & Gaz", icon: Zap, color: "bg-yellow-500" },
    { id: 'INTERNET', title: "Internet & Box", icon: Wifi, color: "bg-blue-500" },
    { id: 'MOBILE', title: "Forfait Mobile", icon: Smartphone, color: "bg-purple-500" },
    { id: 'INSURANCE_HOME', title: "Assurance Habitation", icon: Home, color: "bg-green-500" },
  ];

  const handleAnalyze = async () => {
    if (!currentAmount) return;
    
    setIsLoading(true);
    setShowResults(true); // Show results section with loader
    setSuggestionData(null); // Reset previous data

    try {
      // Appel API pour analyser une charge spécifique (sans budgetID car outil public/demo)
      // Note: On utilise l'endpoint générique ou l'analyse single charge
      const res = await budgetAPI.analyzeSingleCharge({
        category: selectedCategory,
        current_amount: parseFloat(currentAmount),
        household_size: parseInt(householdSize) || 1,
        // Pas de merchant_name spécifique ici, l'IA devinera ou proposera du générique
        // description: description // Si l'API supporte la description dans le futur payload
      });

      setSuggestionData(res.data);
    } catch (error) {
      console.error("Analysis failed", error);
      toast({
        title: "Erreur d'analyse",
        description: "Impossible de récupérer les suggestions pour le moment.",
        variant: "destructive"
      });
      setShowResults(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 animate-fade-in">
            <Brain className="h-5 w-5" />
            <span className="font-semibold text-sm sm:text-base">Powered by Claude AI</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4 sm:mb-6 px-2 animate-slide-up">
            Outils IA Market Suggestions
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8 sm:mb-12 px-4 animate-slide-up stagger-1">
            Découvrez en temps réel les meilleures offres du marché grâce à notre IA.
            Comparez automatiquement les fournisseurs et économisez jusqu'à 520€ par an.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto animate-slide-up stagger-2">
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
        <div className="max-w-5xl mx-auto mb-16 animate-slide-up stagger-3">
          <Card className="shadow-2xl overflow-hidden border-0">
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
            
            <CardContent className="p-4 sm:p-6 lg:p-8">
              {/* Category Selection */}
              <div className="mb-8">
                <Label className="text-base font-semibold mb-4 block">
                  Choisissez une catégorie à analyser
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  {marketCategories.map((cat) => {
                    const CategoryIcon = cat.icon;
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setShowResults(false);
                          setSuggestionData(null);
                        }}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
                          isSelected 
                            ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' 
                            : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`h-10 w-10 sm:h-12 sm:w-12 ${cat.color} rounded-lg flex items-center justify-center mb-2 sm:mb-3 mx-auto shadow-sm`}>
                          <CategoryIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-gray-900 text-center">
                          {cat.title}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Input Form */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label htmlFor="current-amount" className="text-sm font-medium mb-2 block">
                      Montant actuel (€/mois)
                    </Label>
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

                <Button 
                  onClick={handleAnalyze}
                  disabled={!currentAmount || !householdSize || isLoading}
                  className="w-full sm:w-auto h-12 text-base font-semibold transition-all hover:scale-[1.02]"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-5 w-5" />
                      Analyser avec l'IA
                    </>
                  )}
                </Button>
              </div>

              {/* Results Section */}
              {showResults && (
                <div className="mt-8 sm:mt-12 space-y-6 animate-slide-up">
                  <div className="flex items-center gap-3 mb-6 border-t pt-8 border-gray-100">
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

                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                        <Brain className="h-12 w-12 text-primary relative z-10" />
                      </div>
                      <p className="text-gray-500 animate-pulse">L'IA analyse les offres du marché...</p>
                    </div>
                  ) : suggestionData ? (
                    <>
                      {/* Suggestions Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        {suggestionData.competitors.map((suggestion, idx) => (
                          <div 
                            key={idx}
                            className={`bg-white rounded-xl p-4 sm:p-6 shadow-lg border-2 transition-all hover:shadow-xl ${
                              idx === 0 
                                ? 'border-green-300 ring-4 ring-green-50' 
                                : 'border-gray-100'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <h5 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{suggestion.name}</h5>
                                  {idx === 0 && (
                                    <span className="bg-green-100 text-green-700 text-xs px-2 sm:px-3 py-1 rounded-full font-semibold whitespace-nowrap">
                                      Meilleure offre
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
                                  <span className="text-2xl sm:text-3xl font-bold text-primary">{suggestion.typical_price.toFixed(2)}€</span>
                                  <span className="text-gray-500 text-sm">/mois</span>
                                  <span className="bg-green-100 text-green-700 text-xs sm:text-sm px-2 py-1 rounded font-semibold whitespace-nowrap">
                                    -{suggestion.potential_savings.toFixed(0)}€
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <div className="text-xs sm:text-sm text-gray-600 mb-1">Économies annuelles</div>
                              <div className="text-xl sm:text-2xl font-bold text-green-600">
                                {(suggestion.potential_savings * 12).toLocaleString('fr-FR')}€
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-4 italic border-l-2 border-primary/20 pl-3">
                                "{suggestion.best_offer}"
                            </p>

                            <div className="space-y-2 mb-4">
                              {suggestion.pros.slice(0, 3).map((feature, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span className="flex-1">{feature}</span>
                                </div>
                              ))}
                            </div>

                            <Button 
                              variant={idx === 0 ? "default" : "outline"}
                              className="w-full h-10 sm:h-11 text-sm sm:text-base"
                              onClick={() => window.open(suggestion.website_url || suggestion.affiliate_link, '_blank')}
                            >
                              Voir l'offre
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Total Savings Summary */}
                      {suggestionData.competitors.length > 0 && (
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 sm:p-8 text-white mt-8 shadow-lg">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                              <div className="text-base sm:text-lg mb-2 opacity-90 font-medium">
                                💰 Économies potentielles totales
                              </div>
                              <div className="text-3xl sm:text-4xl font-bold">
                                {(suggestionData.competitors[0].potential_savings * 12).toLocaleString('fr-FR')}€/an
                              </div>
                            </div>
                            <Button 
                              onClick={() => user ? navigate('/') : navigate('/signup')}
                              size="lg"
                              className="bg-white text-green-600 hover:bg-gray-50 font-semibold w-full sm:w-auto h-12 shadow-md hover:shadow-lg transition-all"
                            >
                              <Target className="mr-2 h-5 w-5" />
                              {user ? 'Ajouter à mon budget' : 'Créer mon budget'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center text-red-700 flex flex-col items-center">
                        <AlertTriangle className="h-10 w-10 mb-2" />
                        <p>Aucune suggestion trouvée pour ces critères. Essayez de modifier les montants.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* How It Works Section */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-center text-gray-900 mb-8 sm:mb-12">
            Comment ça marche ?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md text-center group hover:-translate-y-1 transition-transform duration-300">
              <div className="h-14 w-14 sm:h-16 sm:w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <span className="text-2xl sm:text-3xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Analysez vos charges</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Entrez vos dépenses actuelles et nos algorithmes IA analysent le marché en temps réel
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md text-center group hover:-translate-y-1 transition-transform duration-300">
              <div className="h-14 w-14 sm:h-16 sm:w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <span className="text-2xl sm:text-3xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Comparez les offres</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Recevez instantanément les 3 meilleures offres adaptées à votre profil
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md text-center group hover:-translate-y-1 transition-transform duration-300">
              <div className="h-14 w-14 sm:h-16 sm:w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <span className="text-2xl sm:text-3xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Économisez</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Changez facilement et économisez jusqu'à 520€ par an sur vos charges
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-8 sm:p-12 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10">
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
                className="bg-white text-primary hover:bg-gray-50 font-semibold h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
                {user ? 'Accéder à mon dashboard' : 'Créer mon compte gratuit'}
                <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}