import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingDown, 
  ExternalLink, 
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
  Info
} from "lucide-react";
import { budgetAPI, ChargeSuggestion, Competitor } from '@/services/api';
import { Charge } from '@/utils/importConverter';

// ============================================================================
// TYPES
// ============================================================================

interface EnhancedSuggestionsProps {
  budgetId: string;
  charges: Charge[];
  memberCount: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isRelevantCategory(category: string): boolean {
  const relevantCategories = [
    'ENERGY', 'INTERNET', 'MOBILE', 'INSURANCE',
    'INSURANCE_AUTO', 'INSURANCE_HOME', 'INSURANCE_HEALTH',
    'LOAN', 'BANK'
  ];
  return relevantCategories.includes(category.toUpperCase());
}

function extractMerchantName(label: string): string {
  return label.trim().split(' ')[0] || '';
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'ENERGY': '⚡ Énergie',
    'INTERNET': '🌐 Internet',
    'MOBILE': '📱 Mobile',
    'INSURANCE': '🛡️ Assurance',
    'INSURANCE_AUTO': '🚗 Assurance Auto',
    'INSURANCE_HOME': '🏠 Assurance Habitation',
    'INSURANCE_HEALTH': '🏥 Assurance Santé',
    'LOAN': '💳 Prêt / Crédit',
    'BANK': '🏦 Banque'
  };
  return labels[category.toUpperCase()] || category;
}

function isIndividualCategory(category: string): boolean {
  const individualCategories = ['MOBILE', 'INSURANCE_AUTO', 'INSURANCE_HEALTH', 'TRANSPORT'];
  return individualCategories.includes(category.toUpperCase());
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

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSuggestions();
    }, 1000);
    return () => clearTimeout(timer);
  }, [budgetId, charges, memberCount]);

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
          merchant_name: extractMerchantName(c.label)
        }));

      if (relevantCharges.length === 0) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      console.log('[EnhancedSuggestions] Analyzing', relevantCharges.length, 'charges');

      const response = await budgetAPI.bulkAnalyzeSuggestions(budgetId, {
        charges: relevantCharges
      });

      setSuggestions(response.data.suggestions || []);
      setCacheStats({
        hits: response.data.cache_hits || 0,
        aiCalls: response.data.ai_calls_made || 0
      });
      setTotalSavings(response.data.total_potential_savings || 0);
      setHouseholdSize(response.data.household_size || 1);

      console.log('[EnhancedSuggestions] Loaded', response.data.suggestions?.length || 0, 
        'suggestions for household of', response.data.household_size, 'persons');

    } catch (err: any) {
      console.error('Failed to load suggestions:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement des suggestions');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
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

  if (error) return null;

  // No suggestions - show positive message
  if (suggestions.length === 0 && charges.length > 0) {
    const relevantChargesExist = charges.some(c => c.category && isRelevantCategory(c.category) && !c.ignoreSuggestions);
    
    if (relevantChargesExist) {
      return (
        <Card className="border-green-200 bg-green-50/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-green-700">
              <CheckCircle2 className="h-6 w-6" />
              <div>
                <p className="font-medium">🎉 Vous avez déjà d'excellentes offres !</p>
                <p className="text-sm text-green-600">
                  Aucune économie significative trouvée. Vos charges sont bien optimisées.
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
      {/* Header Card */}
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
                  <CardTitle className="text-green-900">
                    💡 Opportunités d'Économies
                  </CardTitle>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    {suggestions.length}
                  </Badge>
                </div>
                <CardDescription className="text-green-700 mt-1">
                  {isExpanded 
                    ? (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Basé sur votre foyer de {householdSize} personne{householdSize > 1 ? 's' : ''}
                      </span>
                    )
                    : `Économie totale possible : ${totalSavings.toFixed(0)}€/an`}
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  loadSuggestions();
                }}
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

      {/* Expanded Content */}
      {isExpanded && (
        <>
          {/* Cache Stats */}
          {(cacheStats.hits > 0 || cacheStats.aiCalls > 0) && (
            <div className="flex gap-2 text-xs px-1">
              <Badge variant="secondary" className="text-xs">
                ⚡ {cacheStats.hits} en cache
              </Badge>
              {cacheStats.aiCalls > 0 && (
                <Badge variant="outline" className="text-xs">
                  🤖 {cacheStats.aiCalls} nouvelle{cacheStats.aiCalls > 1 ? 's' : ''} analyse{cacheStats.aiCalls > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          )}

          {/* Suggestion Cards */}
          {suggestions.map((item) => (
            <SuggestionCard
              key={item.charge_id}
              chargeSuggestion={item}
              householdSize={householdSize}
            />
          ))}
        </>
      )}
    </div>
  );
}

// ============================================================================
// SUGGESTION CARD
// ============================================================================

interface SuggestionCardProps {
  chargeSuggestion: ChargeSuggestion;
  householdSize: number;
}

function SuggestionCard({ chargeSuggestion, householdSize }: SuggestionCardProps) {
  const [showAll, setShowAll] = useState(false);
  const { charge_label, suggestion } = chargeSuggestion;
  
  const topCompetitors = suggestion.competitors.slice(0, 3);
  const remainingCompetitors = suggestion.competitors.slice(3);
  const hasMore = remainingCompetitors.length > 0;

  if (topCompetitors.length === 0) return null;

  const bestSavings = topCompetitors[0]?.potential_savings || 0;
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
              {suggestion.merchant_name && <span>• Actuel: {suggestion.merchant_name}</span>}
              {isIndividual && householdSize > 1 && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  <Users className="h-3 w-3 mr-1" />
                  Prix/personne
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
        {/* Info for individual charges */}
        {isIndividual && householdSize > 1 && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-700">
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>
              Prix analysé par personne (total divisé par {householdSize}). 
              L'économie affichée est pour l'ensemble du foyer.
            </span>
          </div>
        )}

        {/* TOP 3 Competitors */}
        {topCompetitors.map((competitor, index) => (
          <CompetitorCard key={index} competitor={competitor} rank={index + 1} />
        ))}

        {/* Show More Button */}
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="w-full"
          >
            {showAll ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Voir moins
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Voir {remainingCompetitors.length} autre{remainingCompetitors.length > 1 ? 's' : ''} option{remainingCompetitors.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
        )}

        {/* Additional Competitors */}
        {showAll && remainingCompetitors.map((competitor, index) => (
          <CompetitorCard key={index + 3} competitor={competitor} rank={index + 4} />
        ))}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// COMPETITOR CARD
// ============================================================================

interface CompetitorCardProps {
  competitor: Competitor;
  rank: number;
}

function CompetitorCard({ competitor, rank }: CompetitorCardProps) {
  const getRankBadge = () => {
    if (rank === 1) return <Badge className="bg-green-600 text-white border-0">🏆 Meilleure offre</Badge>;
    if (rank === 2) return <Badge variant="outline" className="border-orange-400 text-orange-700 bg-orange-50">🥈 #2</Badge>;
    if (rank === 3) return <Badge variant="outline" className="border-gray-400 text-gray-700 bg-gray-50">🥉 #3</Badge>;
    return <Badge variant="outline" className="border-gray-300 text-gray-600">#{rank}</Badge>;
  };

  const getCardStyle = () => {
    if (rank === 1) return "border-2 border-green-300 bg-green-50/50";
    if (rank === 2) return "border-2 border-orange-200 bg-orange-50/30";
    if (rank === 3) return "border border-gray-300 bg-gray-50/50";
    return "border border-gray-200 bg-gray-50";
  };

  return (
    <div className={`p-4 rounded-lg transition-all ${getCardStyle()}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        {getRankBadge()}
        <span className="text-lg font-bold text-green-700">
          -{competitor.potential_savings.toFixed(0)}€/an
        </span>
      </div>

      {/* Name */}
      <h4 className="font-semibold text-gray-900 mb-2 text-base">{competitor.name}</h4>

      {/* Offer */}
      <p className="text-sm text-gray-600 mb-3">{competitor.best_offer}</p>

      {/* Price */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-muted-foreground">Prix typique:</span>
        <span className="font-semibold text-primary">{competitor.typical_price.toFixed(2)}€/mois</span>
      </div>

      {/* Pros & Cons */}
      {(competitor.pros?.length > 0 || competitor.cons?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {competitor.pros?.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-green-700 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Avantages
              </p>
              <ul className="space-y-1">
                {competitor.pros.map((pro, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {competitor.cons?.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-red-700 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Inconvénients
              </p>
              <ul className="space-y-1">
                {competitor.cons.map((con, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <span className="text-red-600 mt-0.5">•</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
        {competitor.affiliate_link && (
          <Button 
            size="sm" 
            className="flex-1 text-xs h-8"
            onClick={() => window.open(competitor.affiliate_link, '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-2" />
            Voir l'offre
          </Button>
        )}
        
        {competitor.phone_number && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs h-8"
            onClick={() => window.open(`tel:${competitor.phone_number}`)}
          >
            <Phone className="h-3 w-3 mr-2" />
            {competitor.phone_number}
          </Button>
        )}
        
        {competitor.contact_email && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs h-8"
            onClick={() => window.open(`mailto:${competitor.contact_email}`)}
          >
            <Mail className="h-3 w-3 mr-2" />
            Email
          </Button>
        )}

        {competitor.contact_available && !competitor.phone_number && !competitor.contact_email && !competitor.affiliate_link && (
          <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
            <Phone className="h-3 w-3 mr-2" />
            Contact disponible
          </Button>
        )}
      </div>
    </div>
  );
}