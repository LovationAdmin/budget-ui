import { useState } from 'react';
import { 
  Brain, Zap, Sparkles, Home, Smartphone, Wifi, 
  CheckCircle2, Loader2, AlertTriangle, Globe, MapPin 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { budgetAPI, MarketSuggestion } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const LOCATION_CONFIGS = [
  { code: 'FR', name: 'France', currency: 'EUR', symbol: '€' },
  { code: 'DE', name: 'Allemagne', currency: 'EUR', symbol: '€' },
  { code: 'ES', name: 'Espagne', currency: 'EUR', symbol: '€' },
  { code: 'IT', name: 'Italie', currency: 'EUR', symbol: '€' },
  { code: 'BE', name: 'Belgique', currency: 'EUR', symbol: '€' },
  { code: 'CH', name: 'Suisse', currency: 'CHF', symbol: 'CHF' },
  { code: 'GB', name: 'Royaume-Uni', currency: 'GBP', symbol: '£' },
];

export default function SmartToolsWidget() {
  const { toast } = useToast();
  
  const [selectedCategory, setSelectedCategory] = useState('ENERGY');
  const [currentAmount, setCurrentAmount] = useState('');
  const [householdSize, setHouseholdSize] = useState('4');
  const [description, setDescription] = useState('');
  const [locationCode, setLocationCode] = useState('FR');
  
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestionData, setSuggestionData] = useState<MarketSuggestion | null>(null);

  const MAX_DESCRIPTION_LENGTH = 50;
  const activeConfig = LOCATION_CONFIGS.find(c => c.code === locationCode) || LOCATION_CONFIGS[0];

  const marketCategories = [
    { id: 'ENERGY', title: "Électricité & Gaz", icon: Zap, color: "bg-yellow-500" },
    { id: 'INTERNET', title: "Internet & Box", icon: Wifi, color: "bg-blue-500" },
    { id: 'MOBILE', title: "Forfait Mobile", icon: Smartphone, color: "bg-purple-500" },
    { id: 'INSURANCE_HOME', title: "Assurance Habitation", icon: Home, color: "bg-green-500" },
  ];

  const handleAnalyze = async () => {
    if (!currentAmount) return;
    
    setIsLoading(true);
    setError(null);
    setShowResults(true);
    setSuggestionData(null);

    try {
      const res = await budgetAPI.analyzeSingleCharge({
        category: selectedCategory,
        current_amount: parseFloat(currentAmount),
        household_size: parseInt(householdSize) || 1,
        description: description,
        country: activeConfig.code,
        currency: activeConfig.currency
      });

      setSuggestionData(res.data);
    } catch (error: any) {
      console.error("Analysis failed", error);
      setError(error.response?.data?.error || "Impossible de récupérer les suggestions.");
      toast({
        title: "Erreur d'analyse",
        description: "Le service IA est momentanément indisponible.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-2xl overflow-hidden border-0 w-full">
      <CardHeader className="bg-gradient-to-r from-primary to-purple-600 text-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl sm:text-2xl">Simulateur d'Économies</CardTitle>
              <CardDescription className="text-white/90">
                Analysez vos factures en temps réel
              </CardDescription>
            </div>
          </div>

          <div className="w-full sm:w-48">
            <Select value={locationCode} onValueChange={setLocationCode}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-10">
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {LOCATION_CONFIGS.map((config) => (
                  <SelectItem key={config.code} value={config.code}>
                    {config.name} ({config.currency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 lg:p-8 bg-white">
        <div className="mb-8">
          <Label className="text-base font-semibold mb-4 block">Quelle dépense analyser ?</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                  className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                    isSelected 
                      ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' 
                      : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                  }`}
                >
                  <div className={`h-10 w-10 ${cat.color} rounded-lg flex items-center justify-center mb-2 mx-auto text-white`}>
                    <CategoryIcon className="h-5 w-5" />
                  </div>
                  <div className="text-xs font-semibold text-gray-900">{cat.title}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label className="mb-2 block">Montant actuel ({activeConfig.currency}/mois)</Label>
              <Input
                type="number"
                placeholder="Ex: 140"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="h-12 text-lg"
              />
            </div>
            <div>
              <Label className="mb-2 block">Taille du foyer (pers.)</Label>
              <Input
                type="number"
                placeholder="Ex: 4"
                value={householdSize}
                onChange={(e) => setHouseholdSize(e.target.value)}
                className="h-12 text-lg"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label>Détails (Optionnel)</Label>
              <span className="text-xs text-muted-foreground">{description.length}/{MAX_DESCRIPTION_LENGTH}</span>
            </div>
            <Textarea
              placeholder="Ex: 80m², Chauffage élec, option TV..."
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) setDescription(e.target.value);
              }}
              className="resize-none"
              rows={2}
            />
          </div>

          <Button 
            onClick={handleAnalyze}
            disabled={!currentAmount || !householdSize || isLoading}
            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-all shadow-lg"
          >
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Brain className="mr-2 h-5 w-5" />}
            {isLoading ? 'Analyse du marché...' : 'Trouver des économies'}
          </Button>
        </div>

        {showResults && (
          <div className="mt-12 animate-slide-up border-t pt-8">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                  <Brain className="h-12 w-12 text-primary relative z-10" />
                </div>
                <p className="mt-4 text-gray-500 font-medium">L'IA interroge les bases de données {activeConfig.name}...</p>
              </div>
            ) : error ? (
              <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center text-red-700">
                  <AlertTriangle className="h-10 w-10 mb-2 mx-auto" />
                  <p>{error}</p>
              </div>
            ) : suggestionData && suggestionData.competitors.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                  <p className="text-sm font-medium text-muted-foreground mb-2 text-center uppercase tracking-wide">Résultats trouvés par l'IA</p>
                  {suggestionData.competitors.slice(0, 2).map((suggestion, idx) => (
                    <div key={idx} className={`bg-white rounded-xl p-4 shadow-sm border-2 ${idx === 0 ? 'border-green-400 bg-green-50/30' : 'border-gray-100'}`}>
                      <div className="flex justify-between items-start mb-2">
                          <div>
                              <h3 className="font-bold text-lg text-gray-900">{suggestion.name}</h3>
                              <p className="text-xs text-gray-500">{suggestion.best_offer}</p>
                          </div>
                          {idx === 0 && <Badge className="bg-green-600 border-0">Meilleur choix</Badge>}
                      </div>
                      
                      <div className="flex items-end gap-2 mb-3">
                        <span className="text-2xl font-bold text-primary">{suggestion.typical_price.toFixed(2)}{activeConfig.symbol}</span>
                        <span className="text-xs text-gray-500 mb-1">/mois</span>
                        <span className="ml-auto text-sm font-semibold text-green-700">
                            Economie: {(parseFloat(currentAmount) - suggestion.typical_price).toFixed(0)}{activeConfig.symbol}/mois
                        </span>
                      </div>

                      <div className="space-y-1 mb-4">
                        {suggestion.pros.slice(0, 2).map((pro, i) => (
                          <div key={i} className="flex gap-2 text-xs text-gray-700">
                            <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{pro}</span>
                          </div>
                        ))}
                      </div>

                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full h-8 text-xs"
                        onClick={() => window.open(suggestion.website_url || suggestion.affiliate_link, '_blank')}
                      >
                        Voir l'offre <Globe className="ml-2 h-3 w-3" />
                      </Button>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                  Aucune offre trouvée pour ces critères.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}