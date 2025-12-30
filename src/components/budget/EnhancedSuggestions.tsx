import React, { useState, useEffect, useCallback } from 'react';
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
import { useNotifications } from '@/contexts/NotificationContext'; // Use existing context for socket logic

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
    'INSURANCE_HEALTH': '💊 Mutuelle Santé',
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
  const [isProcessingBackground, setIsProcessingBackground] = useState(false);

  // We can listen to WS messages globally via window event listener 
  // (Assuming NotificationContext dispatches events or we hook into it)
  // Or simpler: Reuse the existing WS connection from NotificationContext
  
  useEffect(() => {
    // Handler for WebSocket messages
    const handleWSMessage = (event: MessageEvent) => {
        try {
            const message = JSON.parse(event.data);
            if (message.type === 'suggestions_ready') {
                console.log("⚡ Analysis complete (via WS)");
                processResults(message.data);
                setIsProcessingBackground(false);
                setLoading(false);
            }
        } catch (e) {
            // Ignore parse errors from other messages
        }
    };

    // Attach to the NotificationContext's websocket if possible, 
    // but since we don't expose the raw WS, we can rely on a global event listener if the context is broadcasting
    // Alternatively, simpler hack:
    const wsBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1').replace(/^http/, 'ws');
    const tempWs = new WebSocket(`${wsBaseUrl}/ws/budgets/${budgetId}`);
    tempWs.onmessage = handleWSMessage;

    return () => {
        tempWs.close();
    };
  }, [budgetId]);

  const processResults = (data: any) => {
      const rawSuggestions = data.suggestions || [];
      const filteredSuggestions = rawSuggestions.filter((s: any) => {
        return s.suggestion.competitors.some((c: any) => c.potential_savings > 0);
      });

      filteredSuggestions.forEach((s: any) => {
        s.suggestion.competitors = s.suggestion.competitors.filter((c: any) => c.potential_savings > 0);
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
          merchant_name: c.label.trim().split(' ')[0] || ''
        }));

      if (relevantCharges.length === 0) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      const response = await budgetAPI.bulkAnalyzeSuggestions(budgetId, {
        charges: relevantCharges,
        household_size: memberCount
      });

      if (response.status === 202) {
          // Processing in background
          setIsProcessingBackground(true);
          // Loading state remains true until WS returns
      } else {
          // Direct response (cache hit case possibly)
          processResults(response.data);
          setLoading(false);
      }

    } catch (err: any) {
      console.error('Failed to load suggestions:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement');
      setLoading(false);
    }
  };
  
  // Initial load
  useEffect(() => {
     // Delay slightly to let page render
     const t = setTimeout(() => loadSuggestions(), 1000);
     return () => clearTimeout(t);
  }, []);

  // Loading View
  if (loading && suggestions.length === 0) {
    return (
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <div className="ml-3">
                <p className="text-sm font-medium text-blue-900">Analyse de vos charges en cours...</p>
                <p className="text-xs text-blue-700">
                    {isProcessingBackground 
                        ? "L'IA analyse le marché en arrière-plan. Cela peut prendre quelques secondes." 
                        : `Recherche d'économies pour ${memberCount} personne${memberCount > 1 ? 's' : ''}...`}
                </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) return null;

  // No suggestions found state
  if (suggestions.length === 0 && charges.length > 0) {
    const hasRelevant = charges.some(c => c.category && isRelevantCategory(c.category) && !c.ignoreSuggestions);
    if (hasRelevant && !loading) {
      return (
        <Card className="border-green-200 bg-green-50/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-green-700">
              <CheckCircle2 className="h-6 w-6" />
              <div>
                <p className="font-medium">🎉 Vous avez déjà d'excellentes offres !</p>
                <p className="text-sm text-green-600">
                  Vos charges sont bien optimisées pour votre foyer.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    return null;
  }

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

function SuggestionCard({ chargeSuggestion, householdSize }: { chargeSuggestion: ChargeSuggestion; householdSize: number }) {
  const { charge_label, suggestion } = chargeSuggestion;
  const competitors = suggestion.competitors.filter(c => c.potential_savings > 0).slice(0, 3);
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
        {competitors.map((competitor, index) => (
          <CompetitorCard key={index} competitor={competitor} rank={index + 1} />
        ))}
      </CardContent>
    </Card>
  );
}

function CompetitorCard({ competitor, rank }: { competitor: Competitor; rank: number }) {
  const getRankBadge = () => {
    if (rank === 1) return <Badge className="bg-green-600 text-white border-0">🏆 Meilleure offre</Badge>;
    if (rank === 2) return <Badge variant="outline" className="border-orange-400 text-orange-700 bg-orange-50">🥈 #2</Badge>;
    return <Badge variant="outline" className="border-gray-400 text-gray-700 bg-gray-50">🥉 #3</Badge>;
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
      <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
        {websiteUrl && (
          <Button size="sm" className="flex-1 text-xs h-8" onClick={() => window.open(websiteUrl, '_blank')}>
            <Globe className="h-3 w-3 mr-2" />
            Voir le site
          </Button>
        )}
      </div>
    </div>
  );
}