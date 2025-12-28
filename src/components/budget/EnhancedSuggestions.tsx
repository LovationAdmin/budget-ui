import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingDown, 
  ExternalLink, 
  Phone, 
  Sparkles, 
  Loader2,
  ChevronDown,
  ChevronUp,
  Mail
} from "lucide-react";
import { budgetAPI, ChargeSuggestion, Competitor } from '@/services/api';
import { Charge } from '@/utils/importConverter';

interface EnhancedSuggestionsProps {
  budgetId: string;
  charges: Charge[];
  memberCount: number; // Prop passed from parent to trigger update and inform user
}

export default function EnhancedSuggestions({ budgetId, charges, memberCount }: EnhancedSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<ChargeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheStats, setCacheStats] = useState({ hits: 0, aiCalls: 0 });
  const [totalSavings, setTotalSavings] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
        loadSuggestions();
    }, 1000); // Debounce to avoid rapid API calls during edits
    return () => clearTimeout(timer);
  }, [budgetId, charges, memberCount]);

  const loadSuggestions = async () => {
    if (charges.length === 0) return;

    setLoading(true);
    setError(null);
    
    try {
      const isRelevantCategory = (cat: string) => ['ENERGY', 'INTERNET', 'MOBILE', 'INSURANCE_AUTO', 'INSURANCE_HOME', 'INSURANCE_HEALTH', 'LOAN'].includes(cat);
      const extractMerchantName = (label: string) => label.trim().split(' ')[0] || '';

      const relevantCharges = charges
        .filter(c => c.category && isRelevantCategory(c.category) && !c.ignoreSuggestions) // Filter ignored
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

      // Backend handles caching. Pass updated charges to bulk analyze endpoint.
      // Backend automatically checks DB cache before calling AI.
      const response = await budgetAPI.bulkAnalyzeSuggestions(budgetId, {
        charges: relevantCharges
      });

      setSuggestions(response.data.suggestions || []);
      setCacheStats({
        hits: response.data.cache_hits || 0,
        aiCalls: response.data.ai_calls_made || 0
      });
      setTotalSavings(response.data.total_potential_savings || 0);

    } catch (err: any) {
      console.error('Failed to load suggestions:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement des suggestions');
    } finally {
      setLoading(false);
    }
  };

  if (loading && suggestions.length === 0) {
    return (
      <Card className="mt-6 border-blue-200 bg-blue-50/30">
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
  if (suggestions.length === 0) return null;

  return (
    <div className="mt-6 space-y-4">
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
                    ? `Basé sur votre foyer de ${memberCount} personne${memberCount > 1 ? 's' : ''}`
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

      {isExpanded && (
        <>
          {suggestions.map((item) => (
            <SuggestionCard
              key={item.charge_id}
              chargeSuggestion={item}
            />
          ))}
        </>
      )}
    </div>
  );
}

function SuggestionCard({ chargeSuggestion }: { chargeSuggestion: ChargeSuggestion }) {
    const { charge_label, suggestion } = chargeSuggestion;
    const topCompetitors = suggestion.competitors.slice(0, 3);

    return (
        <Card className="border-orange-200 hover:border-orange-300 transition-colors">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div>
                         <div className="flex items-center gap-2 mb-1">
                            <TrendingDown className="h-5 w-5 text-orange-600" />
                            <CardTitle className="text-lg">{charge_label}</CardTitle>
                         </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {topCompetitors.map((competitor, index) => (
                    <CompetitorCard key={index} competitor={competitor} rank={index + 1} />
                ))}
            </CardContent>
        </Card>
    )
}

function CompetitorCard({ competitor, rank }: { competitor: Competitor, rank: number }) {
    const getCardStyle = () => {
        if (rank === 1) return "border-2 border-green-300 bg-green-50/50";
        if (rank === 2) return "border-2 border-orange-200 bg-orange-50/30";
        return "border border-gray-200 bg-gray-50";
    };

    return (
        <div className={`p-4 rounded-lg transition-all ${getCardStyle()}`}>
            <div className="flex items-center justify-between mb-3">
                 <span className="font-bold text-green-700">-{competitor.potential_savings.toFixed(2)}€</span>
                 {rank === 1 && <Badge className="bg-green-600 text-white border-0">🏆 Meilleure offre</Badge>}
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">{competitor.name}</h4>
            <p className="text-sm text-gray-600 mb-3">{competitor.best_offer}</p>
            
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
                {competitor.affiliate_link && (
                    <Button size="sm" className="flex-1 text-xs h-8" onClick={() => window.open(competitor.affiliate_link, '_blank')}>
                        <ExternalLink className="h-3 w-3 mr-2" /> Voir l'offre
                    </Button>
                )}
                
                {competitor.phone_number && (
                    <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => window.open(`tel:${competitor.phone_number}`)}>
                        <Phone className="h-3 w-3 mr-2" /> Appeler
                    </Button>
                )}
                
                {competitor.contact_email && (
                    <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => window.open(`mailto:${competitor.contact_email}`)}>
                        <Mail className="h-3 w-3 mr-2" /> Email
                    </Button>
                )}
            </div>
        </div>
    );
}