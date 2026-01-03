import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingDown, 
  Sparkles, 
  CheckCircle2, 
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Users,
  Info,
  ExternalLink,
  Phone,
  Mail,
  Globe
} from "lucide-react";
import { budgetAPI, ChargeSuggestion, Competitor } from '@/services/api';
import { Charge } from '@/utils/importConverter';
import { useNotifications } from '@/contexts/NotificationContext';
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

interface EnhancedSuggestionsProps {
  budgetId: string;
  charges: Charge[];
  householdSize: number;
  location?: string;
  currency?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

const RELEVANT_CATEGORIES = [
  'ENERGY', 'INTERNET', 'MOBILE', 'INSURANCE',
  'INSURANCE_AUTO', 'INSURANCE_HOME', 'INSURANCE_HEALTH',
  'LOAN', 'BANK',
  'TRANSPORT', 'LEISURE', 'LEISURE_SPORT', 'LEISURE_STREAMING', 'SUBSCRIPTION', 'HOUSING' 
];

const INDIVIDUAL_CATEGORIES = ['MOBILE', 'INSURANCE_AUTO', 'INSURANCE_HEALTH', 'TRANSPORT', 'LEISURE_SPORT'];

function isRelevantCategory(cat: string): boolean {
  return RELEVANT_CATEGORIES.includes(cat.toUpperCase());
}

function isIndividualCategory(cat: string): boolean {
  return INDIVIDUAL_CATEGORIES.includes(cat.toUpperCase());
}

function getCategoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    'ENERGY': '⚡ Énergie',
    'INTERNET': '🌐 Internet',
    'MOBILE': '📱 Mobile',
    'INSURANCE': '🛡️ Assurance',
    'INSURANCE_AUTO': '🚗 Assurance Auto',
    'INSURANCE_HOME': '🏠 Assurance Habitation',
    'INSURANCE_HEALTH': '⚕️ Mutuelle Santé',
    'LOAN': '💸 Prêt / Crédit',
    'BANK': '🏛️ Banque',
    'TRANSPORT': '🚌 Transport',
    'LEISURE': '⚽ Loisirs',
    'LEISURE_SPORT': '💪 Sport / Fitness',
    'LEISURE_STREAMING': '🎬 Streaming',
    'SUBSCRIPTION': '🔄 Abonnement',
    'HOUSING': '🏠 Logement'
  };
  return labels[cat.toUpperCase()] || cat;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EnhancedSuggestions({ 
  budgetId, 
  charges, 
  householdSize, 
  location = 'FR', 
  currency = 'EUR' 
}: EnhancedSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<ChargeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheStats, setCacheStats] = useState({ hits: 0, aiCalls: 0 });
  const [totalSavings, setTotalSavings] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [displayHouseholdSize, setDisplayHouseholdSize] = useState(householdSize);

  // Symbol de devise
  const currencySymbol = currency === 'CHF' ? 'CHF' : '€';

  // Ref to track the last data we actually analyzed to prevent loops
  const lastAnalyzedSignature = useRef<string>("");

  const { onSuggestionsReady, isConnected } = useNotifications();

  // Subscribe to WebSocket suggestions
  useEffect(() => {
    const unsubscribe = onSuggestionsReady((data: any) => {
      console.log('📊 [EnhancedSuggestions] Received suggestions from WebSocket');
      processResults(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [onSuggestionsReady]);

  // Create a signature string for dependencies.
  const chargesSignature = JSON.stringify(charges.map(c => ({
    id: c.id,
    amount: c.amount,
    category: c.category,
    ignore: c.ignoreSuggestions || false 
  })));

  // Loop Protection Logic
  useEffect(() => {
    if (!isConnected) return;

    if (chargesSignature === lastAnalyzedSignature.current) {
        return;
    }

    const timer = setTimeout(() => {
      const relevantCharges = charges.filter(c => c.category && isRelevantCategory(c.category) && !c.ignoreSuggestions);
      
      lastAnalyzedSignature.current = chargesSignature;

      if (relevantCharges.length > 0) {
        console.log('🚀 [EnhancedSuggestions] Data changed (debounced), starting analysis...');
        loadSuggestions();
      }
    }, 2000); 

    return () => clearTimeout(timer);
  }, [budgetId, chargesSignature, householdSize, isConnected]);

  const processResults = (data: any) => {
    const rawSuggestions = data.suggestions || [];
    
    const filteredSuggestions = rawSuggestions.filter((s: any) => {
      const hasPositiveSavings = s.suggestion.competitors.some((c: any) => c.potential_savings > 0);
      return hasPositiveSavings;
    });

    filteredSuggestions.forEach((s: any) => {
      s.suggestion.competitors = s.suggestion.competitors
        .filter((c: any) => c.potential_savings > 0)
        .sort((a: any, b: any) => b.potential_savings - a.potential_savings);
    });

    setSuggestions(filteredSuggestions);
    setCacheStats({
      hits: data.cache_hits || 0,
      aiCalls: data.ai_calls_made || 0
    });
    
    const actualTotalSavings = filteredSuggestions.reduce((sum: number, s: any) => {
      const bestSaving = s.suggestion.competitors[0]?.potential_savings || 0;
      return sum + bestSaving;
    }, 0);
    setTotalSavings(actualTotalSavings);
    setDisplayHouseholdSize(data.household_size || householdSize);
  };

  const loadSuggestions = async () => {
    if (charges.length === 0) return;

    setLoading(true);
    setError(null);
    
    try {
      const relevantCharges = charges
        .filter(c => c.category && isRelevantCategory(c.category) && !c.ignoreSuggestions)
        .map(c => ({
          id: c.id,
          category: c.category!,
          label: c.label,
          amount: c.amount,
          merchant_name: c.label,
          description: c.description
        }));

      if (relevantCharges.length === 0) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      console.log(`📊 [EnhancedSuggestions] Analyzing ${relevantCharges.length} charges...`);

      await budgetAPI.bulkAnalyzeSuggestions(budgetId, {
        charges: relevantCharges,
        household_size: householdSize
      });

      setTimeout(() => {
        if (loading) {
          console.warn('⚠️ [EnhancedSuggestions] No WebSocket response after 30s, stopping loader');
          setLoading(false);
        }
      }, 30000);

    } catch (err: any) {
      console.error('❌ [EnhancedSuggestions] Error:', err);
      if (err.code !== 'ERR_CANCELED') {
          setError(err.response?.data?.error || 'Erreur lors de l\'analyse');
      }
      setLoading(false);
    }
  };

  if (loading && suggestions.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50/30 animate-pulse">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
            <span className="ml-3 text-sm font-medium text-green-700">
              Recherche d'économies pour {householdSize} personne{householdSize > 1 ? 's' : ''}...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-red-700">
            <XCircle className="h-5 w-5" />
            <div>
              <p className="font-medium text-sm">Erreur d'analyse</p>
              <p className="text-xs">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0 && charges.length > 0) {
    const hasRelevant = charges.some(c => c.category && isRelevantCategory(c.category) && !c.ignoreSuggestions);
    if (hasRelevant) {
      return (
        <Card className="border-green-200 bg-green-50/30">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <div>
                <p className="font-medium text-sm">🎉 Excellent !</p>
                <p className="text-xs text-green-600">
                  Vos charges semblent déjà bien optimisées.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    return null;
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-4">
      <Card 
        className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-100/30 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardHeader className="pb-3 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600 shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-green-900 text-lg">Opportunités d'Économies</CardTitle>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 text-xs px-2 py-0.5">
                    {suggestions.length}
                  </Badge>
                </div>
                <CardDescription className="text-green-700 mt-0.5 text-xs sm:text-sm">
                  {isExpanded ? (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Foyer : {displayHouseholdSize} pers.
                    </span>
                  ) : (
                    <span className="font-medium">
                        Potentiel : {totalSavings.toFixed(0)}{currencySymbol}/an
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon-sm"
                onClick={(e) => { 
                    e.stopPropagation(); 
                    lastAnalyzedSignature.current = ""; 
                    loadSuggestions(); 
                }}
                disabled={loading}
                className="text-green-700 hover:bg-green-100 hover:text-green-900"
                title="Forcer la réanalyse"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <div className="text-green-800">
                 {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
           <CardContent className="pt-0 pb-4 animate-accordion-down">
                {(cacheStats.hits > 0 || cacheStats.aiCalls > 0) && (
                    <div className="flex gap-2 text-[10px] text-muted-foreground mb-3 px-1">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> {cacheStats.hits} en cache</span>
                        {cacheStats.aiCalls > 0 && (
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> {cacheStats.aiCalls} nouvelles analyses</span>
                        )}
                    </div>
                )}
                
                <div className="space-y-3">
                    {suggestions.map((item) => (
                    <SuggestionCard 
                        key={item.charge_id} 
                        chargeSuggestion={item} 
                        householdSize={displayHouseholdSize} 
                        currencySymbol={currencySymbol} 
                    />
                    ))}
                </div>
           </CardContent>
        )}
      </Card>
    </div>
  );
}

// ============================================================================
// SUGGESTION CARD - MODIFIED TO BE COLLAPSIBLE
// ============================================================================

function SuggestionCard({ 
  chargeSuggestion, 
  householdSize, 
  currencySymbol 
}: { 
  chargeSuggestion: ChargeSuggestion; 
  householdSize: number;
  currencySymbol: string;
}) {
  const { charge_label, suggestion } = chargeSuggestion;
  const competitors = suggestion.competitors.slice(0, 3);
  
  const [isOpen, setIsOpen] = useState(false);
  
  if (competitors.length === 0) return null;

  const bestSavings = competitors[0]?.potential_savings || 0;
  const isIndividual = isIndividualCategory(suggestion.category);

  return (
    <div className="border border-orange-200 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <div 
        className={cn(
            "p-3 cursor-pointer transition-colors flex items-center justify-between",
            isOpen ? "bg-orange-50/50" : "hover:bg-orange-50/30"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-orange-600 flex-shrink-0" />
              <h4 className="font-semibold text-sm text-gray-900 truncate">{charge_label}</h4>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 border border-gray-200">{getCategoryLabel(suggestion.category)}</span>
              {isIndividual && householdSize > 1 && (
                <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">
                  <Users className="h-3 w-3" /> Prix/pers.
                </span>
              )}
            </div>
        </div>
          
        <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-sm font-bold text-green-700 bg-green-100 border border-green-200 px-2 py-1 rounded-lg">
                -{bestSavings.toFixed(0)}{currencySymbol}/an
            </span>
            <div className="text-gray-400">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
        </div>
      </div>

      {isOpen && (
        <div className="p-3 pt-0 border-t border-orange-100 bg-orange-50/10">
            {isIndividual && householdSize > 1 && (
                <div className="flex items-start gap-2 p-2 mb-3 bg-blue-50/50 rounded-lg border border-blue-100 text-[10px] text-blue-700">
                    <Info className="h-3 w-3 flex-shrink-0 mt-0.5" />
                    <span>Prix analysé par personne. L'économie affichée est pour l'ensemble du foyer ({householdSize} personnes).</span>
                </div>
            )}

            <div className="space-y-3 mt-3">
                {competitors.map((competitor, index) => (
                    <CompetitorCard key={index} competitor={competitor} rank={index + 1} currencySymbol={currencySymbol} />
                ))}
            </div>
        </div>
      )}
    </div>
  );
}

function CompetitorCard({ competitor, rank, currencySymbol }: { competitor: Competitor; rank: number; currencySymbol: string }) {
  const isBest = rank === 1;
  const websiteUrl = competitor.affiliate_link || competitor.website_url;

  return (
    <div className={cn(
        "p-3 rounded-lg border transition-all relative overflow-hidden",
        isBest 
            ? "border-green-300 bg-white shadow-sm ring-1 ring-green-100" 
            : "border-gray-200 bg-white/50 opacity-90 hover:opacity-100"
    )}>
      {isBest && (
          <div className="absolute top-0 right-0 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
              MEILLEURE OFFRE
          </div>
      )}

      <div className="flex justify-between items-start mb-2 pr-16">
         <div>
            <h5 className="font-bold text-sm text-gray-900">{competitor.name}</h5>
            <p className="text-xs text-gray-500 line-clamp-1">{competitor.best_offer}</p>
         </div>
      </div>

      <div className="flex items-center gap-4 mb-3">
         <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Prix</span>
            <span className="font-semibold text-gray-900 text-sm">{competitor.typical_price.toFixed(2)}{currencySymbol}<span className="text-[10px] font-normal text-gray-500">/mois</span></span>
         </div>
         <div className="h-6 w-px bg-gray-200"></div>
         <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Économie</span>
            <span className="font-bold text-green-600 text-sm">-{competitor.potential_savings.toFixed(0)}{currencySymbol}<span className="text-[10px] font-normal text-green-600/70">/an</span></span>
         </div>
      </div>

      {(competitor.pros?.length > 0) && (
        <div className="mb-3 space-y-1">
            {competitor.pros.slice(0, 2).map((pro, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11px] text-gray-600">
                    <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{pro}</span>
                </div>
            ))}
        </div>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
        {websiteUrl && (
          <Button 
            size="sm" 
            variant={isBest ? "default" : "outline"}
            className={cn("flex-1 h-7 text-xs", isBest ? "bg-green-600 hover:bg-green-700" : "")}
            onClick={() => window.open(websiteUrl, '_blank')}
          >
            <Globe className="h-3 w-3 mr-1.5" />
            Voir l'offre
          </Button>
        )}
        
        {(competitor.phone_number || competitor.contact_email) && (
            <>
                {competitor.phone_number && (
                    <Button 
                        variant="ghost" 
                        size="icon-sm" 
                        className="h-7 w-7 text-gray-500 hover:text-green-700 hover:bg-green-50"
                        onClick={() => window.open(`tel:${competitor.phone_number}`)}
                        title="Appeler"
                    >
                        <Phone className="h-3.5 w-3.5" />
                    </Button>
                )}
                {competitor.contact_email && (
                    <Button 
                        variant="ghost" 
                        size="icon-sm" 
                        className="h-7 w-7 text-gray-500 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => window.open(`mailto:${competitor.contact_email}`)}
                        title="Envoyer un email"
                    >
                        <Mail className="h-3.5 w-3.5" />
                    </Button>
                )}
            </>
        )}
      </div>
    </div>
  );
}