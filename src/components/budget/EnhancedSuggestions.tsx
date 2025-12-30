// src/components/budget/EnhancedSuggestions.tsx
import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Lightbulb, 
  Users, 
  Phone, 
  Mail, 
  ExternalLink,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  X
} from 'lucide-react';
import { Charge, Person, BulkAnalyzeResponse, ChargeSuggestion } from '../../services/api';
import api from '../../services/api';
import { useNotifications } from '../../contexts/NotificationContext';

interface EnhancedSuggestionsProps {
  budgetId: string;
  charges: Charge[];
  people: Person[];
}

interface CacheStats {
  hits: number;
  aiCalls: number;
}

export default function EnhancedSuggestions({ budgetId, charges, people }: EnhancedSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<ChargeSuggestion[]>([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [householdSize, setHouseholdSize] = useState(1);
  const [cacheStats, setCacheStats] = useState<CacheStats>({ hits: 0, aiCalls: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCharges, setExpandedCharges] = useState<Set<string>>(new Set());

  const memberCount = people.length || 1;
  const { onSuggestionsReady } = useNotifications();

  // FIXED: Subscribe to WebSocket suggestions instead of creating a new connection
  useEffect(() => {
    const unsubscribe = onSuggestionsReady((data: BulkAnalyzeResponse) => {
      console.log('📊 [EnhancedSuggestions] Received suggestions from WebSocket:', data);
      processResults(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [onSuggestionsReady]);

  const processResults = (data: BulkAnalyzeResponse) => {
    const rawSuggestions = data.suggestions || [];
    
    // Filter out suggestions with no savings
    const filteredSuggestions = rawSuggestions.filter((s: ChargeSuggestion) => {
      return s.suggestion.competitors.some((c) => c.potential_savings > 0);
    });

    // Filter competitors within each suggestion
    filteredSuggestions.forEach((s) => {
      s.suggestion.competitors = s.suggestion.competitors.filter((c) => c.potential_savings > 0);
    });

    setSuggestions(filteredSuggestions);
    setCacheStats({
      hits: data.cache_hits || 0,
      aiCalls: data.ai_calls_made || 0
    });
    
    const actualTotalSavings = filteredSuggestions.reduce((sum: number, s: ChargeSuggestion) => {
      const bestSaving = s.suggestion.competitors[0]?.potential_savings || 0;
      return sum + bestSaving;
    }, 0);
    
    setTotalSavings(actualTotalSavings);
    setHouseholdSize(data.household_size || memberCount);
  };

  const isRelevantCategory = (category: string): boolean => {
    const relevant = ['INSURANCE', 'UTILITIES', 'SUBSCRIPTION', 'MOBILE', 'INTERNET', 'ELECTRICITY', 'GAS', 'WATER', 'LOAN'];
    return relevant.includes(category.toUpperCase());
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
          category: c.category,
          label: c.label,
          amount: c.amount,
          merchant_name: c.merchantName || ''
        }));

      if (relevantCharges.length === 0) {
        setError('Aucune charge éligible aux suggestions trouvée');
        setLoading(false);
        return;
      }

      console.log(`📊 [EnhancedSuggestions] Analyzing ${relevantCharges.length} charges...`);

      // Send request - results will arrive via WebSocket
      await api.post(`/budgets/${budgetId}/suggestions/bulk-analyze`, {
        charges: relevantCharges,
        household_size: memberCount
      });

      // Don't set loading to false here - wait for WebSocket response
      console.log('✅ [EnhancedSuggestions] Analysis request sent, waiting for WebSocket response...');

    } catch (err: any) {
      console.error('❌ [EnhancedSuggestions] Error:', err);
      setError(err.response?.data?.error || 'Erreur lors de l\'analyse des suggestions');
      setLoading(false);
    }
  };

  const toggleCharge = (chargeId: string) => {
    setExpandedCharges(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chargeId)) {
        newSet.delete(chargeId);
      } else {
        newSet.add(chargeId);
      }
      return newSet;
    });
  };

  const getProviderLink = (competitor: any): string => {
    return competitor.affiliate_link || competitor.website_url || '#';
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Suggestions Intelligentes</h3>
              <p className="text-sm text-gray-600">
                Propulsé par l'IA Claude pour optimiser votre budget
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">{memberCount} {memberCount > 1 ? 'personnes' : 'personne'}</span>
          </div>
        </div>

        {/* Analyze Button */}
        <button
          onClick={loadSuggestions}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Analyse en cours...
            </>
          ) : (
            <>
              <Lightbulb className="h-5 w-5" />
              Analyser mes charges
            </>
          )}
        </button>

        {/* Cache Stats */}
        {(cacheStats.hits > 0 || cacheStats.aiCalls > 0) && (
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{cacheStats.hits} résultats en cache</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{cacheStats.aiCalls} analyses IA</span>
            </div>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">Erreur</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Total Savings Card */}
      {totalSavings > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium mb-1">Économies Potentielles Totales</p>
              <p className="text-4xl font-bold text-green-900">{totalSavings.toFixed(2)}€</p>
              <p className="text-sm text-green-600 mt-1">par mois · {(totalSavings * 12).toFixed(2)}€ par an</p>
            </div>
            <div className="p-4 bg-green-100 rounded-full">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      )}

      {/* Suggestions List */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Recommandations Personnalisées ({suggestions.length})
          </h4>

          {suggestions.map((chargeSuggestion) => {
            const isExpanded = expandedCharges.has(chargeSuggestion.charge_id);
            const topCompetitor = chargeSuggestion.suggestion.competitors[0];

            return (
              <div key={chargeSuggestion.charge_id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Charge Header */}
                <button
                  onClick={() => toggleCharge(chargeSuggestion.charge_id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-left flex-1">
                      <h5 className="font-semibold text-gray-900">{chargeSuggestion.charge_label}</h5>
                      <p className="text-sm text-gray-600 capitalize">{chargeSuggestion.suggestion.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Économie potentielle</p>
                      <p className="text-2xl font-bold text-green-600">
                        {topCompetitor.potential_savings.toFixed(2)}€
                      </p>
                      <p className="text-xs text-gray-500">par mois</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-400 ml-4" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 ml-4" />
                  )}
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-4">
                    {chargeSuggestion.suggestion.competitors.map((competitor, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
                        {/* Competitor Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h6 className="font-semibold text-gray-900 text-lg">{competitor.name}</h6>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-2xl font-bold text-blue-600">
                                {competitor.typical_price.toFixed(2)}€/mois
                              </span>
                              {competitor.potential_savings > 0 && (
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                  -{competitor.potential_savings.toFixed(2)}€
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Best Offer */}
                        <div className="bg-blue-50 rounded-lg p-3 mb-3">
                          <p className="text-sm font-medium text-blue-900 mb-1">💡 Meilleure Offre</p>
                          <p className="text-blue-800">{competitor.best_offer}</p>
                        </div>

                        {/* Pros & Cons */}
                        <div className="grid md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <p className="text-sm font-medium text-green-700 mb-2">✅ Avantages</p>
                            <ul className="space-y-1">
                              {competitor.pros.map((pro, i) => (
                                <li key={i} className="text-sm text-gray-700">• {pro}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-orange-700 mb-2">⚠️ Inconvénients</p>
                            <ul className="space-y-1">
                              {competitor.cons.map((con, i) => (
                                <li key={i} className="text-sm text-gray-700">• {con}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Contact Actions */}
                        <div className="flex flex-wrap gap-2">
                          {competitor.website_url && (
                            <a
                              href={getProviderLink(competitor)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Voir l'offre
                            </a>
                          )}
                          {competitor.phone_number && (
                            <a
                              href={`tel:${competitor.phone_number}`}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
                            >
                              <Phone className="h-4 w-4" />
                              {competitor.phone_number}
                            </a>
                          )}
                          {competitor.contact_email && (
                            <a
                              href={`mailto:${competitor.contact_email}`}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
                            >
                              <Mail className="h-4 w-4" />
                              Contact
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && suggestions.length === 0 && !error && (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <Lightbulb className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-gray-900 mb-2">Aucune suggestion disponible</h4>
          <p className="text-gray-600 mb-6">
            Cliquez sur "Analyser mes charges" pour obtenir des recommandations personnalisées
          </p>
        </div>
      )}
    </div>
  );
}