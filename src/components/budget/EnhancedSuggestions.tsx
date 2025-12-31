import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingDown, 
  Phone, 
  Sparkles, 
  CheckCircle2, 
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Mail,
  RefreshCw,
  Users,
  Info,
  Globe
} from "lucide-react";
import { budgetAPI, ChargeSuggestion, Competitor } from '@/services/api';
import { Charge } from '@/utils/importConverter';
import { useNotifications } from '@/contexts/NotificationContext';

// ============================================================================
// TYPES
// ============================================================================

interface EnhancedSuggestionsProps {
  budgetId: string;
  charges: Charge[];
  memberCount: number;
}

// ============================================================================
// HELPERS
// ============================================================================

const RELEVANT_CATEGORIES = [
  'ENERGY', 'INTERNET', 'MOBILE', 'INSURANCE',
  'INSURANCE_AUTO', 'INSURANCE_HOME', 'INSURANCE_HEALTH',
  'LOAN', 'BANK'
];

const INDIVIDUAL_CATEGORIES = ['MOBILE', 'INSURANCE_AUTO', 'INSURANCE_HEALTH', 'TRANSPORT'];

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
    'INSURANCE_HEALTH': '🏥 Mutuelle Santé',
    'LOAN': '💳 Prêt / Crédit',
    'BANK': '🏦 Banque'
  };
  return labels[cat.toUpperCase()] || cat;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EnhancedSuggestions({ budgetId, charges, memberCount }: EnhancedSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<ChargeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheStats, setCacheStats] = useState({ hits: 0, aiCalls: 0 });
  const [totalSavings, setTotalSavings] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [householdSize, setHouseholdSize] = useState(1);

  const { onSuggestionsReady, isConnected } = useNotifications();

  // Subscribe to WebSocket suggestions
  useEffect(() => {
    const unsubscribe = onSuggestionsReady((data: any) => {
      console.log('📊 [EnhancedSuggestions] Received suggestions from WebSocket:', data);
      processResults(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [onSuggestionsReady]);

  // 🔥 FIX: Auto-load ONLY when WebSocket is connected
  useEffect(() => {
    if (!isConnected) {
      console.log('⏳ [EnhancedSuggestions] Waiting for WebSocket connection...');
      return;
    }

    const timer = setTimeout(() => {
      if (charges.length > 0) {
        console.log('🚀 [EnhancedSuggestions] WebSocket connected, starting analysis...');
        loadSuggestions();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [budgetId, charges.length, memberCount, isConnected]);

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
    setHouseholdSize(data.household_size || memberCount);

    console.log('[EnhancedSuggestions] Loaded', filteredSuggestions.length, 
      'suggestions with actual savings for household of', data.household_size || memberCount, 'persons');
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
          merchant_name: ''
        }));

      if (relevantCharges.length === 0) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      console.log(`📊 [EnhancedSuggestions] Analyzing ${relevantCharges.length} charges...`);

      await budgetAPI.bulkAnalyzeSuggestions(budgetId, {
        charges: relevantCharges,
        household_size: memberCount
      });

      console.log('✅ [EnhancedSuggestions] Analysis request sent, waiting for WebSocket response...');

      setTimeout(() => {
        if (loading) {
          console.warn('⚠️ [EnhancedSuggestions] No WebSocket response after 30s, stopping loader');
          setLoading(false);
          setError('L\'analyse prend plus de temps que prévu. Veuillez rafraîchir la page.');
        }
      }, 30000);

    } catch (err: any) {
      console.error('❌ [EnhancedSuggestions] Error:', err);
      setError(err.response?.data?.error || 'Erreur lors de l\'analyse des suggestions');
      setLoading(false);
    }
  };

  if (loading && suggestions.length === 0) {
    return (
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-muted-foreground">
              Recherche d'économies pour {memberCount} personne{memberCount > 1 ? 's' : ''}...
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
            <XCircle className="h-6 w-6" />
            <div>
              <p className="font-medium">Erreur</p>
              <p className="text-sm">{error}</p>
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
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-green-700">
              <CheckCircle2 className="h-6 w-6" />
              <div>
                <p className="font-medium">🎉 Vous avez déjà d'excellentes offres !</p>
                <p className="text-sm text-green-600">
                  Vos charges sont bien optimisées pour votre foyer de {householdSize} personne{householdSize > 1 ? 's' : ''}.
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
        className="border-green-200 bg-green-50/50 cursor-pointer hover:bg-green-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <Sparkles className="h-6 w-6 text-green-600" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-green-900">💡 Opportunités d'Économies</CardTitle>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    {suggestions.length}
                  </Badge>
                </div>
                <CardDescription className="text-green-700 mt-1">
                  {isExpanded ? (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Basé sur votre foyer de {householdSize} personne{householdSize > 1 ? 's' : ''}
                    </span>
                  ) : (
                    `Économie totale possible : ${totalSavings.toFixed(0)}€/an`
                  )}
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => { e.stopPropagation(); loadSuggestions(); }}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm">
                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {isExpanded && (
        <>
          {(cacheStats.hits > 0 || cacheStats.aiCalls > 0) && (
            <div className="flex gap-2 text-xs px-1">
              <Badge variant="secondary" className="text-xs">⚡ {cacheStats.hits} en cache</Badge>
              {cacheStats.aiCalls > 0 && (
                <Badge variant="outline" className="text-xs">🤖 {cacheStats.aiCalls} nouvelle{cacheStats.aiCalls > 1 ? 's' : ''} analyse{cacheStats.aiCalls > 1 ? 's' : ''}</Badge>
              )}
            </div>
          )}

          {suggestions.map((item) => (
            <SuggestionCard key={item.charge_id} chargeSuggestion={item} householdSize={householdSize} />
          ))}
        </>
      )}
    </div>
  );
}

// ============================================================================
// SUGGESTION CARD
// ============================================================================

function SuggestionCard({ chargeSuggestion, householdSize }: { chargeSuggestion: ChargeSuggestion; householdSize: number }) {
  const { charge_label, suggestion } = chargeSuggestion;
  const competitors = suggestion.competitors.slice(0, 3);
  
  if (competitors.length === 0) return null;

  const bestSavings = competitors[0]?.potential_savings || 0;
  const isIndividual = isIndividualCategory(suggestion.category);

  return (
    <Card className="border-orange-200 hover:border-orange-300 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg">{charge_label}</CardTitle>
            </div>
            <CardDescription className="flex items-center gap-2 flex-wrap">
              <span>{getCategoryLabel(suggestion.category)}</span>
              {isIndividual && householdSize > 1 && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  <Users className="h-3 w-3 mr-1" />Prix/personne
                </Badge>
              )}
            </CardDescription>
          </div>
          <Badge className="bg-green-100 text-green-800 border-green-300">
            Jusqu'à -{bestSavings.toFixed(0)}€/an
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isIndividual && householdSize > 1 && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-700">
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>Prix analysé par personne. L'économie affichée est pour l'ensemble du foyer ({householdSize} personnes).</span>
          </div>
        )}

        {competitors.map((competitor, index) => (
          <CompetitorCard key={index} competitor={competitor} rank={index + 1} />
        ))}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// COMPETITOR CARD - MOBILE OPTIMIZED
// ============================================================================

function CompetitorCard({ competitor, rank }: { competitor: Competitor; rank: number }) {
  const getRankBadge = () => {
    if (rank === 1) return <Badge className="bg-green-600 text-white border-0">🏆 Meilleure offre</Badge>;
    if (rank === 2) return <Badge variant="outline" className="border-orange-400 text-orange-700 bg-orange-50">🥈 Alternative #2</Badge>;
    return <Badge variant="outline" className="border-gray-400 text-gray-700 bg-gray-50">🥉 Alternative #3</Badge>;
  };

  const getCardStyle = () => {
    if (rank === 1) return "border-2 border-green-300 bg-green-50/50";
    if (rank === 2) return "border-2 border-orange-200 bg-orange-50/30";
    return "border border-gray-300 bg-gray-50/50";
  };

  const websiteUrl = competitor.affiliate_link || competitor.website_url;

  return (
    <div className={`p-4 rounded-lg transition-all ${getCardStyle()}`}>
      <div className="flex items-center justify-between mb-3">
        {getRankBadge()}
        <span className="text-lg font-bold text-green-700">-{competitor.potential_savings.toFixed(0)}€/an</span>
      </div>

      <h4 className="font-semibold text-gray-900 mb-2">{competitor.name}</h4>
      <p className="text-sm text-gray-600 mb-3">{competitor.best_offer}</p>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-muted-foreground">Prix:</span>
        <span className="font-semibold text-primary">{competitor.typical_price.toFixed(2)}€/mois</span>
      </div>

      {(competitor.pros?.length > 0 || competitor.cons?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {competitor.pros?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-green-700 flex items-center gap-1 mb-1">
                <CheckCircle2 className="h-3 w-3" />Avantages
              </p>
              <ul className="space-y-0.5">
                {competitor.pros.map((pro, i) => (
                  <li key={i} className="text-xs text-gray-600">• {pro}</li>
                ))}
              </ul>
            </div>
          )}
          {competitor.cons?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-700 flex items-center gap-1 mb-1">
                <XCircle className="h-3 w-3" />Inconvénients
              </p>
              <ul className="space-y-0.5">
                {competitor.cons.map((con, i) => (
                  <li key={i} className="text-xs text-gray-600">• {con}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ✅ MOBILE FIX: Boutons responsive et touch-friendly */}
      <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-200">
        {websiteUrl && (
          <Button 
            size="sm" 
            className="w-full sm:flex-1 h-10 sm:h-8 text-sm sm:text-xs"
            onClick={() => window.open(websiteUrl, '_blank')}
          >
            <Globe className="h-4 w-4 sm:h-3 sm:w-3 mr-2" />
            Voir le site
          </Button>
        )}
        
        {(competitor.phone_number || competitor.contact_email) && (
          <div className="flex gap-2">
            {competitor.phone_number && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 sm:flex-initial h-10 sm:h-8 text-sm sm:text-xs"
                onClick={() => window.open(`tel:${competitor.phone_number}`)}
              >
                <Phone className="h-4 w-4 sm:h-3 sm:w-3 mr-1" />
                <span className="hidden sm:inline">{competitor.phone_number}</span>
                <span className="sm:hidden">Appeler</span>
              </Button>
            )}
            
            {competitor.contact_email && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 sm:flex-initial h-10 sm:h-8 text-sm sm:text-xs"
                onClick={() => window.open(`mailto:${competitor.contact_email}`)}
              >
                <Mail className="h-4 w-4 sm:h-3 sm:w-3 mr-1" />
                Email
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}