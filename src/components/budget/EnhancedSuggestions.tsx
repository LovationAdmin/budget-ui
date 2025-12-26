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
import { budgetAPI, ChargeSuggestion, Competitor, MarketSuggestion } from '@/services/api';

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
// COMPOSANT PRINCIPAL
// ============================================================================

export default function EnhancedSuggestions({ budgetId, charges }: EnhancedSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<ChargeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheStats, setCacheStats] = useState({ hits: 0, aiCalls: 0 });
  const [totalSavings, setTotalSavings] = useState(0);

  // Charger les suggestions au montage
  useEffect(() => {
    loadSuggestions();
  }, [budgetId, charges]);

  const loadSuggestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Préparer les charges pertinentes (avec catégorie)
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

      // Appel API bulk analyze
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
    return null; // Pas de suggestions à afficher
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Header avec statistiques */}
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-green-600" />
              <div>
                <CardTitle className="text-green-900">
                  Opportunités d'Économies Détectées
                </CardTitle>
                <CardDescription className="text-green-700">
                  {suggestions.length} charge{suggestions.length > 1 ? 's' : ''} analysée
                  {suggestions.length > 1 ? 's' : ''} • 
                  Économies potentielles: <strong>{totalSavings.toFixed(0)}€/an</strong>
                </CardDescription>
              </div>
            </div>
            {cacheStats.hits > 0 && (
              <Badge variant="outline" className="text-xs">
                {cacheStats.hits} réponse{cacheStats.hits > 1 ? 's' : ''} en cache
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Liste des suggestions */}
      {suggestions.map((item) => (
        <SuggestionCard
          key={item.charge_id}
          chargeSuggestion={item}
          onRefresh={loadSuggestions}
        />
      ))}
    </div>
  );
}

// ============================================================================
// CARTE INDIVIDUELLE DE SUGGESTION
// ============================================================================

interface SuggestionCardProps {
  chargeSuggestion: ChargeSuggestion;
  onRefresh: () => void;
}

function SuggestionCard({ chargeSuggestion }: SuggestionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { charge_label, suggestion } = chargeSuggestion;
  const bestCompetitor = suggestion.competitors[0]; // Le meilleur est toujours en premier

  if (!bestCompetitor) return null;

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
          {suggestion.competitors.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="ml-2"
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Meilleure offre - Toujours visible */}
        <CompetitorCard 
          competitor={bestCompetitor} 
          isBest={true}
          category={suggestion.category}
        />

        {/* Autres concurrents - Affichés si expanded */}
        {expanded && suggestion.competitors.length > 1 && (
          <div className="mt-4 space-y-3 pt-4 border-t">
            <p className="text-sm font-medium text-muted-foreground">
              Autres alternatives:
            </p>
            {suggestion.competitors.slice(1).map((comp, idx) => (
              <CompetitorCard
                key={idx}
                competitor={comp}
                isBest={false}
                category={suggestion.category}
              />
            ))}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
          Dernière mise à jour: {new Date(suggestion.last_updated).toLocaleDateString('fr-FR')} •
          Expire le: {new Date(suggestion.expires_at).toLocaleDateString('fr-FR')}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// CARTE CONCURRENT INDIVIDUEL
// ============================================================================

interface CompetitorCardProps {
  competitor: Competitor;
  isBest: boolean;
  category: string;
}

function CompetitorCard({ competitor, isBest }: CompetitorCardProps) {
  return (
    <div className={`p-4 rounded-lg border-2 ${
      isBest 
        ? 'bg-green-50 border-green-300' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-lg">{competitor.name}</h4>
            {isBest && (
              <Badge className="bg-green-600">
                Meilleur choix
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {competitor.best_offer}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">
              {competitor.typical_price.toFixed(2)}€
            </span>
            <span className="text-sm text-muted-foreground">/mois</span>
          </div>
        </div>

        {competitor.potential_savings > 0 && (
          <div className="text-right ml-4">
            <div className="text-sm text-muted-foreground">Économie annuelle</div>
            <div className="text-xl font-bold text-green-600">
              +{competitor.potential_savings.toFixed(0)}€
            </div>
          </div>
        )}
      </div>

      {/* Avantages / Inconvénients */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {competitor.pros.length > 0 && (
          <div>
            <p className="text-xs font-medium text-green-700 mb-1">✓ Avantages</p>
            <ul className="text-xs space-y-1">
              {competitor.pros.map((pro, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {competitor.cons.length > 0 && (
          <div>
            <p className="text-xs font-medium text-orange-700 mb-1">✗ Inconvénients</p>
            <ul className="text-xs space-y-1">
              {competitor.cons.map((con, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <XCircle className="h-3 w-3 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

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
            className="flex-1"
            onClick={() => handleContactRequest(competitor.name)}
          >
            <Phone className="h-4 w-4 mr-2" />
            Être rappelé
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function isRelevantCategory(category: string): boolean {
  const relevant = ['ENERGY', 'INTERNET', 'MOBILE', 'INSURANCE', 'LOAN', 'BANK'];
  return relevant.includes(category.toUpperCase());
}

function extractMerchantName(label: string): string {
  // Extraction simple du nom du commerçant depuis le label
  const normalized = label.toLowerCase();
  
  // Patterns courants
  const patterns = [
    /edf/i, /engie/i, /total/i,
    /orange/i, /sfr/i, /free/i, /bouygues/i,
    /axa/i, /allianz/i, /macif/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) return match[0];
  }

  return '';
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    ENERGY: 'Énergie',
    INTERNET: 'Internet / Box',
    MOBILE: 'Mobile',
    INSURANCE: 'Assurance',
    LOAN: 'Crédit',
    BANK: 'Banque',
  };
  return labels[category] || category;
}

function handleContactRequest(providerName: string) {
  // TODO: Implémenter la logique de demande de rappel
  alert(`Demande de rappel pour ${providerName} - Fonctionnalité à venir`);
}