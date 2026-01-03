// src/pages/SmartTools.tsx
// 🤖 Smart Tools IA - NOTRE DIFFÉRENCIATEUR #1
// Page interactive pour démontrer les Market Suggestions IA

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
  
  // ✅ NOUVEAU STATE : Description pour le contexte IA
  const [description, setDescription] = useState('');
  
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
          features: ["Leader français", "Nombreuses agences", "Service premium"] 
        }
      ]
    },
    internet: {
      title: "Internet & Box",
      icon: Wifi,
      color: "bg-blue-500",
      average: 45,
      suggestions: [
        { 
          provider: "Free", 
          price: 29.99, 
          savings: 15, 
          features: ["Fibre FTTH", "Débit 8 Gb/s", "Sans engagement"] 
        },
        { 
          provider: "Sosh", 
          price: 30.99, 
          savings: 14, 
          features: ["Réseau Orange", "Prix garanti", "Sans engagement"] 
        },
        { 
          provider: "Bouygues", 
          price: 32.99, 
          savings: 12, 
          features: ["WiFi 6", "4K UHD", "Assistance 24/7"] 
        }
      ]
    },
    mobile: {
      title: "Forfait Mobile",
      icon: Smartphone,
      color: "bg-purple-500",
      average: 25,
      suggestions: [
        { 
          provider: "Free Mobile", 
          price: 10.99, 
          savings: 14, 
          features: ["100 Go", "5G incluse", "Appels illimités"] 
        },
        { 
          provider: "RED by SFR", 
          price: 12, 
          savings: 13, 
          features: ["120 Go", "Sans engagement", "Réseau SFR"] 
        },
        { 
          provider: "B&You", 
          price: 13.99, 
          savings: 11, 
          features: ["130 Go", "Réseau Bouygues", "5G"] 
        }
      ]
    },
    insurance: {
      title: "Assurance Habitation",
      icon: Home,
      color: "bg-green-500",
      average: 35,
      suggestions: [
        { 
          provider: "Luko", 
          price: 22, 
          savings: 13, 
          features: ["100% digital", "Remboursement rapide", "Sans franchise"] 
        },
        { 
          provider: "Ornikar", 
          price: 24, 
          savings: 11, 
          features: ["Prix transparent", "Service en ligne", "Souscription 5 min"] 
        },
        { 
          provider: "Allianz", 
          price: 28, 
          savings: 7, 
          features: ["Leader mondial", "Garanties complètes", "Assistance 24/7"] 
        }
      ]
    }
  };

  const category = marketData[selectedCategory as keyof typeof marketData];
  // const Icon = category.icon; // Pas utilisé directement dans le render principal mais gardé au cas où

  const analyzeWithAI = () => {
    setShowResults(true);
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      {/* ✅ CHANGÉ : Utilisation du composant Navbar avec items de navigation */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-8 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-6">
            <Brain className="h-4 w-4" />
            Powered by Claude AI
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 mb-6">
            L'IA qui trouve des <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">économies</span> pour vous
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Notre intelligence artificielle analyse le marché en temps réel et vous suggère 
            automatiquement les meilleures offres adaptées à votre foyer.
          </p>
          
          {/* Stats Bar */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
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
            <CardHeader className="bg-gradient-to-r from-primary to-purple-600 text-white p-8">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Sparkles className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-3xl mb-2">Analyse IA Market Suggestions</CardTitle>
                  <CardDescription className="text-white/90 text-base">
                    Découvrez combien vous pourriez économiser en changeant de fournisseurs
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              {/* Category Selection */}
              <div className="mb-8">
                <Label className="text-base font-semibold mb-4 block">
                  Choisissez une catégorie à analyser
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isSelected 
                            ? 'border-primary bg-primary/5 shadow-md' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`h-12 w-12 ${data.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                          <CategoryIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-sm font-semibold text-gray-900">{data.title}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Input Section */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="amount" className="text-base font-semibold">
                    Combien payez-vous actuellement ? (€/mois)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder={`Ex: ${category.average}`}
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="mt-2 h-14 text-xl"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    💡 Moyenne française : {category.average}€/mois
                  </p>
                </div>
                <div>
                  <Label htmlFor="household" className="text-base font-semibold">
                    Taille du foyer (personnes)
                  </Label>
                  <Input
                    id="household"
                    type="number"
                    placeholder="4"
                    value={householdSize}
                    onChange={(e) => setHouseholdSize(e.target.value)}
                    className="mt-2 h-14 text-xl"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    📊 Pour personnaliser les recommandations
                  </p>
                </div>
              </div>

              {/* ✅ NOUVEL ÉLÉMENT : CHAMP DESCRIPTION */}
              <div className="mb-8">
                <Label htmlFor="description" className="text-base font-semibold">
                    Détails spécifiques (Optionnel)
                </Label>
                <Input
                    id="description"
                    type="text"
                    placeholder="Ex: 35m2 Paris, 9kVA, Tous risques, 15000km/an..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-2 h-14 text-lg"
                />
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                   <Info className="h-4 w-4" /> Aide l'IA à comparer "ce qui est comparable" (surface, options, consommation...)
                </p>
              </div>

              <Button 
                onClick={analyzeWithAI}
                disabled={!currentAmount}
                className="w-full h-14 text-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary-700 hover:to-purple-700 shadow-lg"
                size="lg"
              >
                <Brain className="h-5 w-5 mr-2" />
                Analyser avec l'IA
                <Sparkles className="h-5 w-5 ml-2" />
              </Button>

              {/* Results */}
              {showResults && (
                <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 bg-green-500 rounded-xl flex items-center justify-center">
                        <TrendingDown className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Résultat de l'analyse IA</h3>
                        <p className="text-sm text-gray-600">Basé sur {category.suggestions.length} fournisseurs comparés</p>
                        {/* ✅ Affichage du feedback visuel des critères */}
                        {description && (
                            <p className="text-xs text-green-700 font-medium mt-1">
                                Critères pris en compte : "{description}"
                            </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                      <div className="text-sm text-gray-600 mb-1">Votre dépense actuelle</div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{currentAmount}€/mois</div>
                      <div className="text-sm text-gray-500">soit {(parseFloat(currentAmount) * 12).toLocaleString('fr-FR')}€/an</div>
                    </div>

                    <div className="bg-green-500 text-white rounded-xl p-4 shadow-md">
                      <div className="text-sm mb-1 opacity-90">💰 Économies potentielles maximales</div>
                      <div className="text-4xl font-bold mb-1">
                        {category.suggestions[0].savings}€/mois
                      </div>
                      <div className="text-base opacity-90">
                        soit {(category.suggestions[0].savings * 12).toLocaleString('fr-FR')}€/an
                      </div>
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Top 3 des meilleures offres
                    </h4>
                    <div className="space-y-4">
                      {category.suggestions.map((suggestion, idx) => (
                        <div 
                          key={idx}
                          className={`bg-white rounded-xl p-6 shadow-md border-2 ${
                            idx === 0 ? 'border-green-300 ring-2 ring-green-100' : 'border-gray-100'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h5 className="text-xl font-bold text-gray-900">{suggestion.provider}</h5>
                                {idx === 0 && (
                                  <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold">
                                    Meilleure offre
                                  </span>
                                )}
                              </div>
                              <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-bold text-primary">{suggestion.price}€</span>
                                <span className="text-gray-500">/mois</span>
                                <span className="bg-green-100 text-green-700 text-sm px-2 py-1 rounded font-semibold">
                                  -{suggestion.savings}€
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600 mb-1">Économies annuelles</div>
                              <div className="text-2xl font-bold text-green-600">
                                {(suggestion.savings * 12).toLocaleString('fr-FR')}€
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            {suggestion.features.map((feature, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                {feature}
                              </div>
                            ))}
                          </div>

                          <Button 
                            variant={idx === 0 ? "default" : "outline"}
                            className="w-full"
                            onClick={() => window.open(`https://www.google.com/search?q=${suggestion.provider}+${category.title}`, '_blank')}
                          >
                            En savoir plus
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-8 text-white text-center">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-90" />
                    <h3 className="text-2xl font-bold mb-3">Automatisez cette analyse !</h3>
                    <p className="text-base opacity-90 mb-6 max-w-2xl mx-auto">
                      Avec Budget Famille, notre IA analyse automatiquement TOUTES vos charges 
                      et vous suggère les meilleures offres du marché. Plus besoin de chercher !
                    </p>
                    <Button 
                      size="lg"
                      onClick={() => navigate('/signup')}
                      className="bg-white text-primary hover:bg-gray-100 font-semibold shadow-lg"
                    >
                      Créer mon compte gratuit
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600">
              Notre IA analyse le marché en 3 étapes simples
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <div className="text-6xl font-bold text-primary/20 mb-4">1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Analyse de vos charges</h3>
              <p className="text-gray-600">
                L'IA analyse vos dépenses actuelles : énergie, internet, mobile, assurances, etc.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="h-16 w-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-6xl font-bold text-purple-600/20 mb-4">2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Comparaison marché</h3>
              <p className="text-gray-600">
                Comparaison en temps réel avec les meilleures offres disponibles sur le marché
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="h-16 w-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-6xl font-bold text-green-600/20 mb-4">3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Suggestions personnalisées</h3>
              <p className="text-gray-600">
                Recommandations adaptées à la taille de votre foyer et vos besoins spécifiques
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-4xl mx-auto">
            <Brain className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
              Prêt à économiser automatiquement ?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Créez votre compte Budget Famille et laissez notre IA trouver des économies 
              sur TOUTES vos charges, pas juste une seule.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => navigate('/signup')}
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-semibold text-lg px-8"
              >
                Essayer gratuitement
                <Sparkles className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate('/features')}
                className="border-2 border-primary text-primary hover:bg-primary/10 text-lg px-8"
              >
                Voir toutes les fonctionnalités
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              ✨ Gratuit • Sans engagement • Analyse IA illimitée
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}