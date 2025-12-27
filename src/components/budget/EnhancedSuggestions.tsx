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
  AlertCircle
} from "lucide-react";
import { budgetAPI, ChargeSuggestion, Competitor } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

// ============================================================================
// TYPES
// ============================================================================

interface EnhancedSuggestionsProps {
  budgetId: string;
  charges: Array<{
    id: string;
    label: string;
    amount: number;
    category?: string;
  }>;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isRelevantCategory(category: string): boolean {
  const relevantCategories = [
    'ENERGY',
    'INTERNET', 
    'MOBILE',
    'INSURANCE_AUTO',
    'INSURANCE_HOME',
    'INSURANCE_HEALTH',
    'LOAN'
  ];
  return relevantCategories.includes(category);
}

function extractMerchantName(label: string): string {
  // Essayer d'extraire le nom du fournisseur du label
  const cleanLabel = label.trim();
  // Prendre le premier mot en majuscule comme nom potentiel
  const words = cleanLabel.split(' ');
  return words[0] || '';
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'ENERGY': 'Énergie',
    'INTERNET': 'Internet',
    'MOBILE': 'Mobile',
    'INSURANCE_AUTO': 'Assurance Auto',
    'INSURANCE_HOME': 'Assurance Habitation',
    'INSURANCE_HEALTH': 'Assurance Santé',
    'LOAN': 'Prêt / Crédit'
  };
  return labels[category] || category;
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function EnhancedSuggestions({ budgetId, charges }: EnhancedSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<ChargeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheStats, setCacheStats] = useState({ hits: 0, aiCalls: 0 });
  const [totalSavings, setTotalSavings] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, [budgetId, charges]);

  const loadSuggestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const relevantCharges = charges
        .filter(c => c.category && isRelevantCategory(c.category))
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

      console.log('[EnhancedSuggestions] Loaded', response.data.suggestions?.length || 0, 'suggestions');

    } catch (err: any) {
      console.error('Failed to load suggestions:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement des suggestions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="mt-6 border-blue-200 bg-blue-50/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-muted-foreground">
              Analyse de vos charges en cours...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-6 border-red-200 bg-red-50/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Header avec toggle */}
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
                    💡 Opportunités d'Économies Détectées
                  </CardTitle>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    {suggestions.length}
                  </Badge>
                </div>
                <CardDescription className="text-green-700 mt-1">
                  {isExpanded 
                    ? 'Découvrez les meilleures alternatives pour vos charges' 
                    : `Économie totale possible : ${totalSavings.toFixed(2)}€`}
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Liste des suggestions (visible si expanded) */}
      {isExpanded && (
        <>
          {/* Stats cache */}
          {(cacheStats.hits > 0 || cacheStats.aiCalls > 0) && (
            <div className="flex gap-2 text-xs">
              <Badge variant="secondary" className="text-xs">
                {cacheStats.hits} suggestion{cacheStats.hits > 1 ? 's' : ''} en cache
              </Badge>
              {cacheStats.aiCalls > 0 && (
                <Badge variant="outline" className="text-xs">
                  {cacheStats.aiCalls} nouvelle{cacheStats.aiCalls > 1 ? 's' : ''} analyse{cacheStats.aiCalls > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          )}

          {suggestions.map((item) => (
            <SuggestionCard
              key={item.charge_id}
              chargeSuggestion={item}
              onRefresh={loadSuggestions}
            />
          ))}
        </>
      )}
    </div>
  );
}

// ============================================================================
// CARTE INDIVIDUELLE DE SUGGESTION - TOP 3
// ============================================================================

interface SuggestionCardProps {
  chargeSuggestion: ChargeSuggestion;
  onRefresh: () => void;
}

function SuggestionCard({ chargeSuggestion }: SuggestionCardProps) {
  const [showAll, setShowAll] = useState(false);
  const { toast } = useToast();
  const { charge_label, suggestion } = chargeSuggestion;
  
  // ✅ TOP 3 au lieu d'un seul
  const topCompetitors = suggestion.competitors.slice(0, 3);
  const remainingCompetitors = suggestion.competitors.slice(3);
  const hasMore = remainingCompetitors.length > 0;

  if (topCompetitors.length === 0) return null;

  return (
    <Card className="border-orange-200 hover:border-orange-300 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg">{charge_label}</CardTitle>
            </div>
            <CardDescription>
              Catégorie: {getCategoryLabel(suggestion.category)}
              {suggestion.merchant_name && ` • Actuel: ${suggestion.merchant_name}`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ✅ Afficher le TOP 3 */}
        {topCompetitors.map((competitor, index) => (
          <CompetitorCard 
            key={index} 
            competitor={competitor} 
            rank={index + 1}
            toast={toast}
          />
        ))}

        {/* Bouton "Voir plus" si > 3 concurrents */}
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
                Voir {remainingCompetitors.length} autre(s) option(s)
              </>
            )}
          </Button>
        )}

        {/* Afficher les autres options si showAll */}
        {showAll && remainingCompetitors.map((competitor, index) => (
          <CompetitorCard 
            key={index + 3} 
            competitor={competitor} 
            rank={index + 4}
            toast={toast}
          />
        ))}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// CARTE CONCURRENT INDIVIDUELLE
// ============================================================================

interface CompetitorCardProps {
  competitor: Competitor;
  rank: number;
  toast: any;
}

function CompetitorCard({ competitor, rank, toast }: CompetitorCardProps) {
  const getRankBadge = () => {
    if (rank === 1) {
      return (
        <Badge className="bg-green-600 text-white border-0">
          🏆 Meilleure offre
        </Badge>
      );
    }
    if (rank === 2) {
      return (
        <Badge variant="outline" className="border-orange-400 text-orange-700 bg-orange-50">
          #2
        </Badge>
      );
    }
    if (rank === 3) {
      return (
        <Badge variant="outline" className="border-gray-400 text-gray-700 bg-gray-50">
          #3
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-gray-300 text-gray-600">
        #{rank}
      </Badge>
    );
  };

  const getCardStyle = () => {
    if (rank === 1) {
      return "border-2 border-green-300 bg-green-50/50";
    }
    if (rank === 2) {
      return "border-2 border-orange-200 bg-orange-50/30";
    }
    return "border border-gray-200 bg-gray-50";
  };

  return (
    <div className={`p-4 rounded-lg transition-all ${getCardStyle()}`}>
      {/* Header avec badge et économies */}
      <div className="flex items-center justify-between mb-3">
        {getRankBadge()}
        <span className="text-lg font-bold text-green-700">
          -{competitor.potential_savings.toFixed(2)}€
        </span>
      </div>

      {/* Nom du concurrent */}
      <h4 className="font-semibold text-gray-900 mb-2 text-base">
        {competitor.name}
      </h4>

      {/* Offre */}
      <p className="text-sm text-gray-600 mb-3">
        {competitor.best_offer}
      </p>

      {/* Prix */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-muted-foreground">Prix typique:</span>
        <span className="font-semibold text-primary">
          {competitor.typical_price.toFixed(2)}€
        </span>
      </div>

      {/* Pros/Cons en grille responsive */}
      {(competitor.pros.length > 0 || competitor.cons.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Avantages */}
          {competitor.pros.length > 0 && (
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

          {/* Inconvénients */}
          {competitor.cons.length > 0 && (
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

      {/* Actions */}
      <div className="flex gap-2">
        {competitor.affiliate_link && (
          <Button 
            size="sm" 
            className="flex-1"
            onClick={() => window.open(competitor.affiliate_link, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Voir l'offre
          </Button>
        )}
        {competitor.contact_available && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => toast({
              title: "Contact disponible",
              description: `Vous pouvez contacter ${competitor.name} directement pour cette offre spéciale.`,
              variant: "default"
            })}
          >
            <Phone className="h-4 w-4 mr-2" />
            Contacter
          </Button>
        )}
      </div>
    </div>
  );
}